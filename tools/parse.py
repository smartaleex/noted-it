#!/usr/bin/env python3
"""Parse the 'Noted it' manual text dump into a structured JSON content pack."""
import json, re, sys

SRC = "manual.txt"
raw = open(SRC).read()

# Strip page markers, and the page-number footer that immediately precedes each
# one. Targeting the footer position specifically matters: a blanket "drop all
# digit-only lines" rule would also eat legitimate numeric options such as the
# 50 / 90 / 180 minute session lengths.
lines = []
for ln in raw.split("\n"):
    if re.match(r"^===== PAGE \d+ =====$", ln):
        while lines and not lines[-1].strip():
            lines.pop()
        if lines and re.fullmatch(r"\d{1,3}", lines[-1].strip()):
            lines.pop()
        continue
    lines.append(ln.rstrip())

text = "\n".join(lines)
lines = text.split("\n")

DOCS = [
    ("initial-clinical-note", "Initial Clinical Note", r"^INITIAL CLINICAL NOTE DETAILS\s*$"),
    ("clinical-note", "Clinical Note", r"^CLINICAL NOTE DETAILS\s*$"),
    ("progress-letter", "Clinical Progress Letter", r"^CLINICAL PROGRESS LETTER DETAILS\s*$"),
    ("cognitive-assessment", "Cognitive Assessment Letter", r"^COGNITIVE ASSESSMENT LETTER\s*$"),
]

# locate doc start lines
bounds = []
for slug, title, pat in DOCS:
    idx = next((i for i, ln in enumerate(lines) if re.match(pat, ln)), None)
    bounds.append((slug, title, idx))
bounds = [b for b in bounds if b[2] is not None]
bounds.sort(key=lambda b: b[2])

def clean(s):
    """Normalise the PDF's mangled ligatures and stray artefacts."""
    s = s.replace("ﬁ", "fi").replace("ﬂ", "fl")
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    # The PDF renders some 'ti' ligatures as 'D' (e.g. "PracDDoner", "atten Don")
    return s.strip()

NOISE = re.compile(r"^$")

def parse_items(chunk):
    """chunk: list of lines for one section. Returns list of item dicts."""
    items = []
    cur = None
    mode = None
    for ln in chunk:
        s = clean(ln)
        if NOISE.match(s):
            continue
        m = re.match(r"^Item (\d+)$", s)
        if m:
            if cur:
                items.append(cur)
            cur = {"n": int(m.group(1)), "label": "", "options": [], "output": [],
                   "multi": False, "notes": []}
            mode = None
            continue
        if cur is None:
            continue
        m2 = re.match(r"^App View\s*:?\s*(.*)$", s)
        if m2:
            mode = "label"
            if m2.group(1).strip():
                cur["label"] = m2.group(1).strip()
            continue
        m2 = re.match(r"^Options\s*:\s*(.*)$", s)
        if m2:
            mode = "options"
            rest = m2.group(1).strip()
            if rest and not re.match(r"^\*.*\*$", rest):
                cur["options"].append(rest)
            continue
        m2 = re.match(r"^Outputs?(?: for above)?\s*:?\s*(.*)$", s)
        if m2 and re.match(r"^Outputs?(?: for above)?\s*:?\s*$|^Outputs?(?: for above)?\s*:", s):
            mode = "output"
            if m2.group(1).strip():
                cur["output"].append(m2.group(1).strip())
            continue
        if not s:
            continue
        if mode == "label":
            if cur["label"]:
                cur["notes"].append(s)
            else:
                cur["label"] = s
        elif mode == "options":
            cur["options"].append(s)
        elif mode == "output":
            cur["output"].append(s)
    if cur:
        items.append(cur)

    # post-process
    for it in items:
        blob = it["label"] + " " + " ".join(it["notes"]) + " " + " ".join(it["options"])
        if re.search(r"multiple (options|selections) may be (selected|required)", blob, re.I):
            it["multi"] = True
        it["label"] = re.sub(r"\s*\*.*?\*\s*", " ", it["label"]).strip()
        it["label"] = re.sub(r"\s*:?\s*X\s*$", "", it["label"]).strip().rstrip(":").strip()
        opts = []
        for o in it["options"]:
            o = re.sub(r"^[•\-•]\s*", "", o).strip()
            if re.match(r"^\*.*\*$", o):
                continue
            if not o:
                continue
            opts.append(o)
        # Group options under "(prefix):" / "(suffix):" headers when present.
        groups, cur_group, flat = {}, None, []
        for o in opts:
            # Headers appear both as "Intent frequency (prefix):" and bare "Prefix:".
            g = (re.match(r"^(.*?)\s*\((prefix|suffix)\)\s*:\s*$", o, re.I)
                 or re.match(r"^()(prefix|suffix)\s*:\s*$", o, re.I))
            if g:
                cur_group = g.group(2).lower().replace("ﬁ", "fi")
                groups.setdefault(cur_group, {"label": g.group(1).strip(), "options": []})
                continue
            if cur_group:
                groups[cur_group]["options"].append(o)
            else:
                flat.append(o)
        if groups:
            it["groups"] = groups
            it["options"] = flat
        else:
            it["options"] = opts

        # Outputs wrap across PDF lines. Rejoin, then split on the -OR- / -AND/OR- markers.
        joined = " ".join(it["output"])
        joined = re.sub(r"\s+", " ", joined).strip()
        variants = [v.strip() for v in re.split(r"\s*-(?:OR|AND/OR|AND)-\s*", joined) if v.strip()]
        it["outputRaw"] = joined
        it["output"] = variants

        # Free-text detection
        it["freeText"] = bool(re.search(r"free text", " ".join(it["options"]) + " " + joined, re.I))
    return items

pack = {"documents": []}

for bi, (slug, title, start) in enumerate(bounds):
    end = bounds[bi + 1][2] if bi + 1 < len(bounds) else len(lines)
    body = lines[start:end]

    # split into sections: a "Section N" line followed by an ALL-CAPS title line
    sec_idx = [i for i, ln in enumerate(body) if re.match(r"^Section \d+\s*$", clean(ln))]
    doc = {"id": slug, "title": title, "sections": []}
    for si, s0 in enumerate(sec_idx):
        s1 = sec_idx[si + 1] if si + 1 < len(sec_idx) else len(body)
        seg = body[s0:s1]
        # section heading = first non-empty ALL CAPS line after "Section N"
        heading = ""
        for ln in seg[1:6]:
            c = clean(ln)
            if c and c.upper() == c and re.search(r"[A-Z]{3}", c) and not c.startswith("Item"):
                heading = c
                break
        # cut off trailing "Sample output..." block
        cut = next((i for i, ln in enumerate(seg)
                    if re.match(r"^(Sample output|Full .*Sample)", clean(ln), re.I)), len(seg))
        items = parse_items(seg[:cut])
        if items:
            doc["sections"].append({
                "n": si + 1,
                "title": heading.title() if heading else f"Section {si+1}",
                "items": items,
            })
    pack["documents"].append(doc)

json.dump(pack, open("parsed.json", "w"), indent=1)

for d in pack["documents"]:
    ni = sum(len(s["items"]) for s in d["sections"])
    print(f'{d["id"]:26} sections={len(d["sections"]):3}  items={ni:4}')
    for s in d["sections"]:
        print(f'    {s["n"]:2}. {s["title"][:44]:46} items={len(s["items"])}')
