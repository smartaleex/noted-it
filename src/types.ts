export type OptionKind = 'choice' | 'text'

export interface Option {
  id: string
  label: string
  kind: OptionKind
  /** Prompt shown when this option needs an accompanying free-text value. */
  prompt?: string
}

export interface OptionGroup {
  id: string
  label: string
  options: Option[]
}

/** Sentinel option id used for items that are a single typed value. */
export const VALUE_KEY = '_value'

export interface Item {
  id: string
  label: string
  multi: boolean
  /** Set when the item is a single typed value rather than a choice list. */
  input?: 'number' | 'date' | 'text'
  options: Option[]
  /** Output sentences from the manual, split on its -OR- / -AND/OR- markers. */
  variants: string[]
  /** The unsplit output text, kept so the engine can fall back to it. */
  raw: string
  groups?: OptionGroup[]
}

export interface Section {
  id: string
  title: string
  items: Item[]
}

export interface DocumentDef {
  id: string
  title: string
  sections: Section[]
}

export interface ChecklistPack {
  documents: DocumentDef[]
}

/* ---------- Psychometrics ---------- */

export interface ScoreBand {
  /** Inclusive lower and upper bounds. */
  min: number
  max: number
  label: string
}

export interface ScoreScale {
  id: string
  label: string
  min: number
  max: number
  bands: ScoreBand[]
  /** Sentence template; {score} and {band} are substituted. */
  template: string
}

export interface Instrument {
  id: string
  name: string
  /** Which client population the instrument is intended for. */
  population: 'adult' | 'child'
  citation: string
  /** Opening sentence naming the instrument. */
  preamble: string
  scales: ScoreScale[]
  /** Free-form select-based instruments (DIAMOND, CCSM) declare fields instead. */
  fields?: InstrumentField[]
  /** Template used when the instrument is field-based rather than score-based. */
  fieldTemplate?: string
}

export interface InstrumentField {
  id: string
  label: string
  kind: 'select' | 'text' | 'number'
  options?: string[]
}

/* ---------- Runtime state ---------- */

export interface Selection {
  /** Chosen option ids for the item. */
  chosen: string[]
  /** Free-text values keyed by option id. */
  text: Record<string, string>
  /** Chosen option id per group (prefix/suffix). */
  groups?: Record<string, string>
}

export type Answers = Record<string, Selection>

export interface PsychometricEntry {
  instrumentId: string
  scores: Record<string, string>
  fields: Record<string, string>
}

export type Language = 'en-AU' | 'en-US'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'long'

export interface Settings {
  identified: boolean
  language: Language
  dateFormat: DateFormat
  /** Substitute the word "client" for a name, when identified mode is on. */
  clientName: string
  authorName: string
}
