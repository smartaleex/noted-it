import type { RenderedSection } from '../engine/document'

/**
 * The manual caps the live preview at five rows: it must be impossible to
 * screenshot a whole draft and file it as a client record. Older rows drop off
 * the top as new selections are made.
 */
const MAX_ROWS = 5

interface Props {
  sections: RenderedSection[]
}

export function Preview({ sections }: Props) {
  const rows: { kind: 'heading' | 'body'; text: string }[] = []
  for (const s of sections) {
    rows.push({ kind: 'heading', text: `${s.heading.toUpperCase()}:` })
    rows.push({ kind: 'body', text: s.body })
  }
  const visible = rows.slice(-MAX_ROWS)
  const hidden = rows.length - visible.length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold">Live preview</h2>
        <span className="text-[12px] text-ink-3">
          {hidden > 0 ? `${hidden} earlier row${hidden === 1 ? '' : 's'} hidden` : 'Last 5 rows'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {visible.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-ink-3">
            Start selecting options for text to appear…
          </p>
        ) : (
          <div className={`space-y-2.5 ${hidden > 0 ? 'preview-fade' : ''}`}>
            {visible.map((r, i) =>
              r.kind === 'heading' ? (
                <p
                  key={i}
                  className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3"
                >
                  {r.text}
                </p>
              ) : (
                <p key={i} className="font-serif text-[15px] leading-[1.65] text-ink">
                  {r.text}
                </p>
              ),
            )}
          </div>
        )}
      </div>

      <div className="border-t border-line bg-paper px-5 py-3">
        <p className="text-[12px] leading-relaxed text-ink-3">
          Output is a <strong className="text-ink-2">scaffold</strong>, not a finished
          note. Proofread and edit before filing — the clinical record remains your
          responsibility.
        </p>
      </div>
    </div>
  )
}
