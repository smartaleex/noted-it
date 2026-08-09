import type { Item, Selection, Settings } from '../types'
import { VALUE_KEY } from '../types'
import { OVERRIDES } from './overrides'

/**
 * Joins a list into readable prose: "a", "a and b", "a, b, and c".
 * The manual uses an Oxford comma throughout, so we do too.
 */
export function joinList(parts: string[]): string {
  const p = parts.filter(Boolean)
  if (p.length === 0) return ''
  if (p.length === 1) return p[0]
  if (p.length === 2) return `${p[0]} and ${p[1]}`
  return `${p.slice(0, -1).join(', ')}, and ${p[p.length - 1]}`
}

const FREE_TEXT = /free text( box)?\s*\d*/gi
const PLACEHOLDER = /\b(X|Y)\b/g

/**
 * The manual writes one output sentence per option. To support multi-select we
 * derive a template from a matching variant by swapping the option's own words
 * for a placeholder, so several selections can be folded into one sentence.
 *
 * "Client reported no self-harm ideation." + option "self-harm"
 *   -> "Client reported no {list} ideation."
 */
export function deriveTemplate(variant: string, optionLabel: string): string | null {
  if (!optionLabel) return null
  const escaped = optionLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'i')
  if (!re.test(variant)) return null
  return variant.replace(re, '{list}')
}

function applyText(sentence: string, values: string[]): string {
  let i = 0
  return sentence.replace(FREE_TEXT, () => values[i++] ?? '')
}

/** Picks the output variant that best corresponds to a chosen option. */
function variantFor(item: Item, optionIndex: number, optionLabel: string): string {
  const { variants } = item
  if (variants.length === 0) return ''
  // Prefer a variant that actually mentions the option's wording.
  const byWord = variants.find((v) =>
    optionLabel && v.toLowerCase().includes(optionLabel.toLowerCase()),
  )
  if (byWord) return byWord
  // Otherwise fall back to positional correspondence, which is how the
  // manual lays options and outputs out.
  if (variants.length > optionIndex) return variants[optionIndex]
  return variants[0]
}

export interface ComposeContext {
  settings: Settings
}

/** Renders a single item's selections into a sentence (or "" if unanswered). */
export function composeItem(item: Item, sel: Selection | undefined, ctx: ComposeContext): string {
  if (!sel) return ''

  const override = OVERRIDES[item.id]
  if (override) {
    const result = override(item, sel)
    if (result) return finalise(result, ctx)
    if (result === '') return ''
  }

  // Typed-value items (session number, dates, free prose) short-circuit.
  if (item.input) {
    const raw = sel.text[VALUE_KEY]?.trim()
    if (!raw) return ''
    const value = item.input === 'date' ? formatDate(raw, ctx.settings.dateFormat) : raw
    const variant = item.variants[0] ?? item.raw
    // The manual writes date outputs literally as "Date: DD/MM/YYYY".
    let out = variant.includes('DD/MM/YYYY')
      ? variant.replace('DD/MM/YYYY', value)
      : substitute(variant, value)
    if (out === variant && !/[:]/.test(variant)) out = value
    return finalise(out, ctx)
  }

  if (sel.chosen.length === 0) return ''

  const chosenOpts = sel.chosen
    .map((id) => {
      const idx = item.options.findIndex((o) => o.id === id)
      return idx >= 0 ? { opt: item.options[idx], idx } : null
    })
    .filter((x): x is { opt: (typeof item.options)[number]; idx: number } => x !== null)
    // Order output by the manual's declared option order, not click order, so
    // the same set of selections always reads the same way.
    .sort((a, b) => a.idx - b.idx)

  if (chosenOpts.length === 0) return ''

  // Free-text values, in the order the user's selections appear.
  const textValues = chosenOpts
    .map(({ opt }) => sel.text[opt.id]?.trim())
    .filter((v): v is string => Boolean(v))

  // --- prefix / suffix groups (e.g. speech, intent frequency) ---
  if (item.groups && item.groups.length > 0 && sel.groups) {
    let out = item.variants[0] ?? item.raw
    for (const g of item.groups) {
      const chosenId = sel.groups[g.id]
      const label = g.options.find((o) => o.id === chosenId)?.label ?? ''
      out = out.replace(new RegExp(`X\\s*\\(${g.id}\\)`, 'i'), label)
    }
    return finalise(applyText(out, textValues), ctx)
  }

  // --- multi-select: fold selections into one sentence where possible ---
  if (item.multi && chosenOpts.length > 1) {
    const first = chosenOpts[0]
    const variant = variantFor(item, first.idx, first.opt.label)
    const tmpl = deriveTemplate(variant, first.opt.label)
    const labels = chosenOpts.map(({ opt }) => sel.text[opt.id]?.trim() || opt.label)
    if (tmpl) {
      return finalise(tmpl.replace('{list}', joinList(labels)), ctx)
    }
    // No shared template: emit each sentence in turn.
    return finalise(
      chosenOpts
        .map(({ opt, idx }) => {
          const v = variantFor(item, idx, opt.label)
          return applyText(substitute(v, sel.text[opt.id]?.trim() || opt.label), textValues)
        })
        .join(' '),
      ctx,
    )
  }

  // --- single selection ---
  const { opt, idx } = chosenOpts[0]
  const value = sel.text[opt.id]?.trim() || opt.label
  let out = variantFor(item, idx, opt.label)
  out = substitute(out, value)
  out = applyText(out, textValues)
  return finalise(out, ctx)
}

/** Replaces the manual's X / Y placeholders with the chosen wording. */
function substitute(sentence: string, value: string): string {
  if (!PLACEHOLDER.test(sentence)) {
    PLACEHOLDER.lastIndex = 0
    return sentence
  }
  PLACEHOLDER.lastIndex = 0
  return sentence.replace(PLACEHOLDER, value)
}

function finalise(s: string, ctx: ComposeContext): string {
  let out = s.replace(/\s+/g, ' ').trim()
  if (!out) return ''

  // Identified mode may substitute the client's name for the word "client".
  const name = ctx.settings.clientName.trim()
  if (ctx.settings.identified && name) {
    out = out.replace(/\bClient\b/g, name).replace(/\bclient\b/g, name)
  }

  // US English spelling swaps, applied only when the user asks for it.
  if (ctx.settings.language === 'en-US') {
    out = out
      .replace(/\bbehaviour/g, 'behavior')
      .replace(/\bBehaviour/g, 'Behavior')
      .replace(/\bhospitalisation/g, 'hospitalization')
      .replace(/\borganisation/g, 'organization')
      .replace(/\butilised/g, 'utilized')
      .replace(/\brecognised/g, 'recognized')
      .replace(/\bnormalised/g, 'normalized')
  }

  // Header-style lines ("Attendees: Author and client") are field labels in the
  // manual's sample notes, not sentences, so they take no full stop.
  const isHeaderLine = /^[A-Z][A-Za-z\s/-]{1,30}:\s/.test(out)
  if (!isHeaderLine && !/[.!?]$/.test(out)) out += '.'
  return out.charAt(0).toUpperCase() + out.slice(1)
}

export function formatDate(iso: string, fmt: Settings['dateFormat']): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  if (fmt === 'MM/DD/YYYY') return `${pad(m)}/${pad(d)}/${y}`
  if (fmt === 'DD/MM/YYYY') return `${pad(d)}/${pad(m)}/${y}`
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const ord = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }
  return `${ord(d)} of ${months[m - 1]} ${y}`
}
