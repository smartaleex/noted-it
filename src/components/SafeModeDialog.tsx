import { useState } from 'react'

interface Props {
  onEnable: () => void
  onCancel: () => void
}

/**
 * Identified mode is off on every login. Turning it on is an explicit,
 * per-session acknowledgement of the extra confidentiality risk.
 */
export function SafeModeDialog({ onEnable, onCancel }: Props) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safe-mode-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-line px-6 py-4">
          <h2 id="safe-mode-title" className="text-base font-semibold">
            Enable identifiable client data?
          </h2>
        </div>

        <div className="space-y-3 px-6 py-4 text-[13px] leading-relaxed text-ink-2">
          <p>
            Safe mode is on by default. It blocks client names, dates of birth,
            and referrer details from entering your notes.
          </p>
          <p>
            By enabling identified mode you allow Noted it to use identifying
            information. This increases the sensitivity of the output and you
            accept the associated risks. Please ensure you are practising safely
            to minimise the risk of client confidentiality breaches.
          </p>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-line bg-paper p-3">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="font-medium text-ink">
              I agree to incorporate identifiable client data into my notes.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-3">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Stay in safe mode
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!agreed}
            onClick={onEnable}
          >
            Enable identified mode
          </button>
        </div>
      </div>
    </div>
  )
}
