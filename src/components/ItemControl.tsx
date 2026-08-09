import type { Item, Selection } from '../types'
import { VALUE_KEY } from '../types'

interface Props {
  item: Item
  value: Selection | undefined
  onChange: (next: Selection) => void
  /** Identified-mode fields stay locked while the app is in safe mode. */
  locked?: boolean
}

const EMPTY: Selection = { chosen: [], text: {}, groups: {} }

export function ItemControl({ item, value, onChange, locked }: Props) {
  const sel = value ?? EMPTY

  function toggle(optId: string) {
    if (locked) return
    const isOn = sel.chosen.includes(optId)
    let chosen: string[]
    if (item.multi) {
      chosen = isOn ? sel.chosen.filter((c) => c !== optId) : [...sel.chosen, optId]
    } else {
      chosen = isOn ? [] : [optId]
    }
    onChange({ ...sel, chosen })
  }

  function setText(optId: string, v: string) {
    onChange({ ...sel, text: { ...sel.text, [optId]: v } })
  }

  function setGroup(groupId: string, optId: string) {
    onChange({ ...sel, groups: { ...(sel.groups ?? {}), [groupId]: optId } })
  }

  /** Typed-value items keep their value under a sentinel key. */
  function setValue(v: string) {
    onChange({
      ...sel,
      chosen: v.trim() ? [VALUE_KEY] : [],
      text: { ...sel.text, [VALUE_KEY]: v },
    })
  }

  const answered = sel.chosen.length > 0 || Object.values(sel.groups ?? {}).some(Boolean)

  return (
    <div className="card p-4">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <label className="label">
          {item.label}
          {item.multi && (
            <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-3">
              multi-select
            </span>
          )}
        </label>
        {answered && (
          <span
            aria-label="Answered"
            className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-safe"
          />
        )}
      </div>

      {item.input && (
        item.input === 'text' ? (
          <textarea
            rows={2}
            className="field resize-y"
            disabled={locked}
            placeholder="Enter your own text…"
            value={sel.text[VALUE_KEY] ?? ''}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <input
            type={item.input}
            className="field"
            disabled={locked}
            value={sel.text[VALUE_KEY] ?? ''}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      )}

      {item.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.options.map((o) => {
            const on = sel.chosen.includes(o.id)
            return (
              <button
                key={o.id}
                type="button"
                disabled={locked}
                aria-pressed={on}
                onClick={() => toggle(o.id)}
                className={`${on ? 'chip-on' : 'chip-off'} ${
                  locked ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Free-text follow-ups appear only once their option is selected. */}
      {item.options
        .filter((o) => o.kind === 'text' && sel.chosen.includes(o.id))
        .map((o) => (
          <input
            key={o.id}
            className="field mt-2.5"
            placeholder={o.prompt ?? 'Enter your own text…'}
            value={sel.text[o.id] ?? ''}
            onChange={(e) => setText(o.id, e.target.value)}
          />
        ))}

      {item.groups?.map((g) => (
        <div key={g.id} className="mt-3">
          <div className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-3">
            {g.label}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.options.map((o) => {
              const on = sel.groups?.[g.id] === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGroup(g.id, on ? '' : o.id)}
                  className={on ? 'chip-on' : 'chip-off'}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
