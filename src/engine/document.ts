import type {
  Answers, DocumentDef, PsychometricEntry, Settings,
} from '../types'
import { composeItem } from './compose'
import { INSTRUMENTS, composeInstrument } from '../content/psychometrics'

export interface RenderedSection {
  id: string
  heading: string
  body: string
}

/**
 * Section 2 is driven by the psychometrics panel rather than the checklist,
 * so it is composed separately and spliced back in at the right position.
 */
const PSYCHOMETRIC_SECTION = 'psychometric-assessment'

export function renderDocument(
  doc: DocumentDef,
  answers: Answers,
  psychometrics: PsychometricEntry[],
  settings: Settings,
): RenderedSection[] {
  const ctx = { settings }
  const out: RenderedSection[] = []

  for (const section of doc.sections) {
    if (section.id === PSYCHOMETRIC_SECTION) {
      const body = psychometrics
        .map((entry) => {
          const inst = INSTRUMENTS.find((i) => i.id === entry.instrumentId)
          if (!inst) return ''
          return composeInstrument(inst, entry.scores, entry.fields)
        })
        .filter(Boolean)
        .join(' ')
      if (body) out.push({ id: section.id, heading: section.title, body })
      continue
    }

    const sentences = section.items
      .map((item) => composeItem(item, answers[`${doc.id}:${section.id}:${item.id}`], ctx))
      .filter(Boolean)

    if (sentences.length > 0) {
      out.push({ id: section.id, heading: section.title, body: sentences.join(' ') })
    }
  }

  return out
}

export function renderPlainText(sections: RenderedSection[]): string {
  return sections
    .map((s) => `${s.heading.toUpperCase()}:\n${s.body}`)
    .join('\n\n')
}

/** Flattens the document to lines so the preview can show only the newest few. */
export function renderPreviewLines(sections: RenderedSection[]): string[] {
  const lines: string[] = []
  for (const s of sections) {
    lines.push(`${s.heading.toUpperCase()}:`)
    lines.push(s.body)
  }
  return lines
}
