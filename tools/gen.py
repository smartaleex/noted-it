#!/usr/bin/env python3
"""Turn parsed.json into the app's content pack (src/content/checklist.json)."""
import json, re, os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "checklist.json"
p = json.load(open("parsed.json"))

def slug(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "item"

FREE = re.compile(r"free text( box)?\s*\d*", re.I)

def norm_opt(o):
    """Split 'please describe plan(s): free text box' into a labelled free-text follow-up."""
    o = o.strip().rstrip(",")
    return o

def build_item(it, sec_slug):
    label = it["label"].strip()
    if not label:
        return None
    # The multi-select badge in the UI already conveys this.
    label = re.sub(r"\s*\((?:multiple )?(?:options|selections)[^)]*\)", "", label, flags=re.I)
    # "Session Length: Approximately X minutes" -> "Session Length"
    if re.search(r":\s*.*\bX\b", label):
        label = label.split(":", 1)[0].strip()
    label = re.sub(r"\s*\bX\b\s*", " ", label).strip().rstrip(":").strip()
    if not label:
        return None
    opts = []
    for o in it["options"]:
        o = norm_opt(o)
        if not o:
            continue
        # a trailing "…: free text box" marks a follow-up prompt on the option
        m = re.match(r"^(.*?):\s*free text( box)?\s*\d*$", o, re.I)
        if m and m.group(1).strip():
            opts.append({"id": slug(m.group(1)), "label": m.group(1).strip(),
                         "prompt": m.group(1).strip(), "kind": "text"})
            continue
        if re.fullmatch(r"free text( box)?\s*\d*", o, re.I):
            opts.append({"id": "custom", "label": "Custom…", "kind": "text"})
            continue
        opts.append({"id": slug(o), "label": o, "kind": "choice"})

    # Where an item has several unlabelled free-text boxes, the App View bullets
    # name them ("age", "gender", "time known"). Use those rather than
    # "Custom… (2)" when the counts line up.
    generic = [o for o in opts if o["id"] == "custom"]
    notes = [re.sub(r"^[•\-]\s*", "", n).split(":")[0].strip()
             for n in it.get("notes", [])]
    notes = [n for n in notes if n and not re.match(r"^\*", n)]
    if len(generic) > 1 and len(notes) == len(generic):
        for o, name in zip(generic, notes):
            o["id"] = slug(name)
            o["label"] = name[0].upper() + name[1:]
            o["prompt"] = name

    # Option ids must be unique within an item: the manual gives several items
    # more than one free-text box, and each would otherwise land on "custom".
    seen = {}
    for o in opts:
        base = o["id"]
        if base in seen:
            seen[base] += 1
            o["id"] = f"{base}-{seen[base]}"
            if o["label"] == "Custom…":
                o["label"] = f"Custom… ({seen[base] + 1})"
        else:
            seen[base] = 0

    # Some items are really a single typed value rather than a choice list.
    inp = None
    if len(opts) == 1 and opts[0]["label"].lower() in ("any number", "insert number"):
        inp, opts = "number", []
    elif not opts and re.search(r"\bdate\b", label, re.I):
        inp = "date"
    elif not opts and re.search(r"\bnumber\b", label, re.I):
        inp = "number"
    elif not opts and re.search(r"\b(dob|date of birth)\b", label, re.I):
        inp = "date"
    elif not opts and not it.get("groups"):
        # Anything left with no options is a free-text field in the manual.
        inp = "text"

    item = {
        "id": slug(label),
        "label": label,
        "multi": it["multi"],
        "options": opts,
        "variants": it["output"],
        "raw": it["outputRaw"],
    }
    if inp:
        item["input"] = inp
    if it.get("groups"):
        item["groups"] = [
            {"id": k, "label": v["label"] or k.title(),
             "options": [{"id": slug(o), "label": o, "kind": "choice"} for o in v["options"]]}
            for k, v in it["groups"].items()
        ]
    return item

pack = {"documents": []}
for d in p["documents"]:
    doc = {"id": d["id"], "title": d["title"], "sections": []}
    for s in d["sections"]:
        items = [x for x in (build_item(i, slug(s["title"])) for i in s["items"]) if x]
        sid = slug(s["title"])
        # The psychometrics section is driven by hand-authored instrument
        # definitions rather than checklist items, so it is kept even though
        # the parser yields no usable items for it.
        if not items and sid not in ("psychometric-assessment",
                                     "baseline-psychometric-outcomes",
                                     "follow-up-psychometric-outcomes"):
            continue
        doc["sections"].append({"id": sid, "title": s["title"], "items": items})
    pack["documents"].append(doc)

json.dump(pack, open(OUT, "w"), indent=1)
n = sum(len(s["items"]) for d in pack["documents"] for s in d["sections"])
print("documents:", len(pack["documents"]), "items:", n)
for d in pack["documents"]:
    print(" ", d["id"], "->", len(d["sections"]), "sections",
          sum(len(s["items"]) for s in d["sections"]), "items")
