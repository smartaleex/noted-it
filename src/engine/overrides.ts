import type { Item, Selection } from '../types'

/**
 * A few items in the manual have prose that cannot be derived mechanically from
 * the option labels — the sentence is restructured depending on which option is
 * chosen. Those are transcribed explicitly here, keyed by item id.
 *
 * Everything else flows through the generic engine in compose.ts.
 */
export type Override = (item: Item, sel: Selection) => string | null

/** MSE "Speech": three of the prefixes rewrite the whole clause. */
const speech: Override = (item, sel) => {
  if (sel.chosen.includes('clear-and-understandable')) {
    return 'Client spoke clearly and was understandable.'
  }

  const prefixId = sel.groups?.prefix
  const suffixId = sel.groups?.suffix
  if (!prefixId) return null

  const prefixLabel =
    item.groups
      ?.find((g) => g.id === 'prefix')
      ?.options.find((o) => o.id === prefixId)?.label ?? ''

  // These three read as their own clause rather than "Client spoke <x>".
  const clause =
    prefixId === 'tangential'
      ? 'Client was tangential veering from topics discussed'
      : prefixId === 'pressured'
        ? "Client's speech was pressured"
        : prefixId === 'limited'
          ? "Client's speech was limited"
          : `Client spoke ${prefixLabel}`

  if (!suffixId) return `${clause}.`

  const tail =
    suffixId === 'but-not-understandable'
      ? 'but was not understandable'
      : 'but was understandable'

  return `${clause}, ${tail}.`
}

export const OVERRIDES: Record<string, Override> = {
  speech,
}
