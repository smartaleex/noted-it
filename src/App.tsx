import { useMemo, useState } from 'react'
import type {
  Answers, ChecklistPack, PsychometricEntry, Settings,
} from './types'
import pack from './content/checklist.json'
import { ItemControl } from './components/ItemControl'
import { Psychometrics } from './components/Psychometrics'
import { Preview } from './components/Preview'
import { FinalNote } from './components/FinalNote'
import { SafeModeDialog } from './components/SafeModeDialog'
import { renderDocument, renderPlainText } from './engine/document'

const CONTENT = pack as unknown as ChecklistPack

/** Items that surface identifying details are disabled while in safe mode. */
const IDENTIFYING = /name|date of birth|dob|referrer|address|contact detail/i

const MONTHLY_QUOTA = 100

export default function App() {
  const [docId, setDocId] = useState(CONTENT.documents[0].id)
  const [answers, setAnswers] = useState<Answers>({})
  const [psychometrics, setPsychometrics] = useState<PsychometricEntry[]>([])
  const [settings, setSettings] = useState<Settings>({
    identified: false,
    language: 'en-AU',
    dateFormat: 'DD/MM/YYYY',
    clientName: '',
    authorName: '',
  })
  const [showSafeDialog, setShowSafeDialog] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [generated, setGenerated] = useState(0)
  const [activeSection, setActiveSection] = useState<string>(
    CONTENT.documents[0].sections[0].id,
  )
  const [showPreview, setShowPreview] = useState(false)

  const doc = CONTENT.documents.find((d) => d.id === docId)!
  const section = doc.sections.find((s) => s.id === activeSection) ?? doc.sections[0]

  const rendered = useMemo(
    () => renderDocument(doc, answers, psychometrics, settings),
    [doc, answers, psychometrics, settings],
  )

  const finalText = useMemo(() => renderPlainText(rendered), [rendered])
  const hasContent = rendered.length > 0

  function selectDocument(id: string) {
    setDocId(id)
    const d = CONTENT.documents.find((x) => x.id === id)!
    setActiveSection(d.sections[0].id)
  }

  /** Discards the working note entirely. Nothing is persisted anywhere. */
  function discard() {
    setAnswers({})
    setPsychometrics([])
    setShowFinal(false)
    setGenerated((n) => n + 1)
  }

  const answeredCount = Object.values(answers).filter(
    (s) => s.chosen.length > 0 || Object.values(s.groups ?? {}).some(Boolean),
  ).length

  return (
    <div className="flex h-full">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="border-b border-line px-4 py-4">
          <div className="text-[15px] font-bold tracking-tight">Noted it</div>
          <div className="text-[11px] text-ink-3">Clinical note scaffolding</div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Documents
          </div>
          {CONTENT.documents.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDocument(d.id)}
              className={`mb-0.5 block w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
                d.id === docId
                  ? 'bg-accent-soft font-semibold text-accent'
                  : 'text-ink-2 hover:bg-paper'
              }`}
            >
              {d.title}
            </button>
          ))}

          <div className="mb-1.5 mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
            Sections
          </div>
          {doc.sections.map((s) => {
            const done = s.items.some(
              (i) => (answers[`${doc.id}:${s.id}:${i.id}`]?.chosen.length ?? 0) > 0,
            )
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  s.id === section.id
                    ? 'bg-paper font-semibold text-ink'
                    : 'text-ink-2 hover:bg-paper'
                }`}
              >
                <span className="truncate">{s.title}</span>
                {done && <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-safe" />}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="mb-1 flex items-center justify-between text-[12px]">
            <span className="text-ink-3">Notes generated</span>
            <span className="font-semibold">
              {generated}/{MONTHLY_QUOTA}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.min(100, (generated / MONTHLY_QUOTA) * 100)}%` }}
            />
          </div>
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-white px-6 py-3">
          <div className="hidden min-w-0 md:block">
            <h1 className="truncate text-[15px] font-semibold">New {doc.title}</h1>
            <p className="text-[12px] text-ink-3">
              {answeredCount} item{answeredCount === 1 ? '' : 's'} answered
              {answeredCount > 0 && ' · unsaved'}
            </p>
          </div>

          {/* Navigation fallback while the sidebar is hidden. */}
          <select
            className="field w-auto min-w-0 flex-1 py-1.5 text-[13px] md:hidden"
            value={`${docId}|${section.id}`}
            onChange={(e) => {
              const [d, s] = e.target.value.split('|')
              if (d !== docId) selectDocument(d)
              setActiveSection(s)
            }}
          >
            {CONTENT.documents.map((d) => (
              <optgroup key={d.id} label={d.title}>
                {d.sections.map((s) => (
                  <option key={s.id} value={`${d.id}|${s.id}`}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() =>
                settings.identified
                  ? setSettings((s) => ({ ...s, identified: false, clientName: '' }))
                  : setShowSafeDialog(true)
              }
              className={`chip ${
                settings.identified
                  ? 'border-warn bg-warn-soft text-warn'
                  : 'border-safe bg-safe-soft text-safe'
              }`}
            >
              {settings.identified ? '● Identified mode' : '● Safe mode'}
            </button>

            <select
              className="field hidden w-auto py-1.5 text-[13px] lg:block"
              value={settings.language}
              onChange={(e) =>
                setSettings((s) => ({ ...s, language: e.target.value as Settings['language'] }))
              }
            >
              <option value="en-AU">English (AU/UK)</option>
              <option value="en-US">English (US)</option>
            </select>

            <button
              className="btn-ghost xl:hidden"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>

            <button
              className="btn-primary"
              disabled={!hasContent}
              onClick={() => {
                setShowPreview(false)
                setShowFinal(true)
              }}
            >
              <span className="hidden sm:inline">Generate final notes</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-ink-3">
                {section.title}
              </h2>

              {settings.identified && (
                <div className="mb-4 rounded-lg border border-warn/30 bg-warn-soft p-3">
                  <label className="mb-1 block text-[12px] font-medium text-warn">
                    Client name (substituted for the word "client")
                  </label>
                  <input
                    className="field"
                    placeholder="e.g. Lexi"
                    value={settings.clientName}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, clientName: e.target.value }))
                    }
                  />
                </div>
              )}

              <div className="space-y-3">
                {section.id === 'psychometric-assessment' ? (
                  <Psychometrics entries={psychometrics} onChange={setPsychometrics} />
                ) : (
                  section.items.map((item) => {
                    const key = `${doc.id}:${section.id}:${item.id}`
                    const locked = !settings.identified && IDENTIFYING.test(item.label)
                    return (
                      <div key={key}>
                        <ItemControl
                          item={item}
                          value={answers[key]}
                          locked={locked}
                          onChange={(next) =>
                            setAnswers((a) => ({ ...a, [key]: next }))
                          }
                        />
                        {locked && (
                          <p className="mt-1 px-1 text-[12px] text-ink-3">
                            Locked in safe mode — enable identified mode to complete this
                            field.
                          </p>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Docked beside the form on wide screens; a drawer when narrow. */}
          <aside className="hidden w-[26rem] shrink-0 border-l border-line bg-white xl:block">
            <Preview sections={rendered} />
          </aside>

          {showPreview && (
            <div className="fixed inset-0 z-40 flex xl:hidden">
              <div
                className="flex-1 bg-ink/40"
                onClick={() => setShowPreview(false)}
                aria-hidden
              />
              <div className="w-full max-w-md bg-white shadow-panel">
                <Preview sections={rendered} />
              </div>
            </div>
          )}
        </div>
      </main>

      {showSafeDialog && (
        <SafeModeDialog
          onCancel={() => setShowSafeDialog(false)}
          onEnable={() => {
            setSettings((s) => ({ ...s, identified: true }))
            setShowSafeDialog(false)
          }}
        />
      )}

      {showFinal && (
        <FinalNote
          text={finalText}
          onCancel={() => setShowFinal(false)}
          onConfirm={discard}
        />
      )}
    </div>
  )
}
