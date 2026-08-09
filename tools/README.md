# Content pipeline

One-off tooling that turned the *Noted it Manual* PDF into `src/content/checklist.json`.
Not needed to run the app; kept so the content can be regenerated if the manual changes.

```bash
# 1. extract text from the manual PDF (requires pypdf)
python3 extract.py "Noted it Manual2.pdf" > manual.txt

# 2. parse the Item / App View / Options / Output structure
python3 parse.py            # -> parsed.json

# 3. emit the app's content pack
python3 gen.py ../src/content/checklist.json
```

The manual itself is **not** committed — it contains clinical sample material.
