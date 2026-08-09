import { useState } from 'react'

interface Props {
  text: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * The last point at which the note exists. On confirm it is discarded from
 * memory entirely — nothing is written to disk or sent anywhere.
 */
export function FinalNote({ text, onConfirm, onCancel }: Props) {
  const [draft, setDraft] = useState(text)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-note-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-line px-6 py-4">
          <h2 id="final-note-title" className="text-base font-semibold">
            Final notes
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-3">
            Edit your final notes before copying them into your practice system.
          </p>
        </div>

        <textarea
          className="flex-1 resize-none border-0 px-6 py-4 font-serif text-[15px] leading-[1.7] focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck
        />

        <div className="border-t border-line bg-warn-soft px-6 py-3">
          <p className="text-[13px] text-warn">
            <strong>This is your only chance to copy these notes.</strong> On
            confirming, they are permanently discarded — Noted it retains no copy.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-3">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Back to editing
          </button>
          <button type="button" className="btn-ghost" onClick={copy}>
            {copied ? '✓ Copied' : 'Copy notes'}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Confirm &amp; discard
          </button>
        </div>
      </div>
    </div>
  )
}
