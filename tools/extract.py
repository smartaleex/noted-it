#!/usr/bin/env python3
"""Dump a PDF to text with page markers, for parse.py to consume."""
import re, sys
import pypdf

path = sys.argv[1]
reader = pypdf.PdfReader(path)
out = []
for i, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ""
    # Drop the repeated confidentiality banner on every page.
    text = re.sub(
        r"CONFIDENTIAL\s*\n?All data provided in this document is hypothetical.*?coincidental\.",
        "", text, flags=re.S,
    )
    out.append(f"\n\n===== PAGE {i} =====\n{text.strip()}")
print("".join(out))
