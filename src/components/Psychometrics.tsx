import type { PsychometricEntry } from '../types'
import { INSTRUMENTS, bandFor } from '../content/psychometrics'

interface Props {
  entries: PsychometricEntry[]
  onChange: (next: PsychometricEntry[]) => void
}

export function Psychometrics({ entries, onChange }: Props) {
  function add(instrumentId: string) {
    if (!instrumentId) return
    onChange([...entries, { instrumentId, scores: {}, fields: {} }])
  }

  function update(idx: number, patch: Partial<PsychometricEntry>) {
    onChange(entries.map((e, i) => (i === idx ? { ...e, ...patch } : e)))
  }

  function remove(idx: number) {
    onChange(entries.filter((_, i) => i !== idx))
  }

  const adult = INSTRUMENTS.filter((i) => i.population === 'adult')
  const child = INSTRUMENTS.filter((i) => i.population === 'child')

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <label className="label">Add an instrument</label>
        <select
          className="field mt-2"
          value=""
          onChange={(e) => add(e.target.value)}
        >
          <option value="">Select an assessment…</option>
          <optgroup label="Adult">
            {adult.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.citation}
              </option>
            ))}
          </optgroup>
          <optgroup label="Child / Adolescent">
            {child.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.citation}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {entries.map((entry, idx) => {
        const inst = INSTRUMENTS.find((i) => i.id === entry.instrumentId)
        if (!inst) return null
        return (
          <div key={`${entry.instrumentId}-${idx}`} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{inst.name}</div>
                <div className="text-[12px] text-ink-3">{inst.citation}</div>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-[13px] text-ink-3 hover:text-danger"
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {inst.scales.map((s) => {
                const raw = entry.scores[s.id] ?? ''
                const n = Number(raw)
                const valid = raw !== '' && !Number.isNaN(n) && n >= s.min && n <= s.max
                const band = valid ? bandFor(n, s.bands) : ''
                return (
                  <div key={s.id}>
                    <label className="mb-1 block text-[12px] font-medium text-ink-2">
                      {s.label}{' '}
                      <span className="text-ink-3">
                        ({s.min}–{s.max})
                      </span>
                    </label>
                    <input
                      type="number"
                      min={s.min}
                      max={s.max}
                      className="field"
                      value={raw}
                      onChange={(e) =>
                        update(idx, { scores: { ...entry.scores, [s.id]: e.target.value } })
                      }
                    />
                    {raw !== '' && !valid && (
                      <p className="mt-1 text-[12px] text-danger">
                        Enter a number between {s.min} and {s.max}.
                      </p>
                    )}
                    {band && (
                      <p className="mt-1 text-[12px] text-safe">
                        Interpretation: <strong>{band}</strong>
                      </p>
                    )}
                  </div>
                )
              })}

              {(inst.fields ?? []).map((f) => (
                <div key={f.id} className={f.kind === 'select' ? 'sm:col-span-2' : ''}>
                  <label className="mb-1 block text-[12px] font-medium text-ink-2">
                    {f.label}
                  </label>
                  {f.kind === 'select' ? (
                    <select
                      className="field"
                      value={entry.fields[f.id] ?? ''}
                      onChange={(e) =>
                        update(idx, { fields: { ...entry.fields, [f.id]: e.target.value } })
                      }
                    >
                      <option value="">—</option>
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field"
                      value={entry.fields[f.id] ?? ''}
                      onChange={(e) =>
                        update(idx, { fields: { ...entry.fields, [f.id]: e.target.value } })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {entries.length === 0 && (
        <p className="px-1 text-[13px] text-ink-3">
          No instruments added. Scores are interpreted automatically against the
          published bands for each measure.
        </p>
      )}
    </div>
  )
}
