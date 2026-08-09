import type { Instrument } from '../types'

/**
 * Instruments and their interpretation bands, transcribed from the Noted it
 * manual (Section 2, "Psychometric Assessment"). Bands are inclusive on both
 * bounds. Citations are reproduced exactly as the manual gives them.
 */

const DIAMOND_MODULES = [
  'Anxiety Disorders',
  'Mood Disorders',
  'Obsessive-Compulsive and Related Disorders',
  'Somatic Symptoms and Related Disorders',
  'Trauma and Stressor-Related Disorders',
  'Feeding and Eating Disorders',
  'Substance-Related and Addictive Disorders',
  'Neurodevelopmental Disorders',
  'Schizophrenia Spectrum and Other Psychotic Disorders',
  'Substance/Medication-Induced Disorder, Disorder due to Another Medical Condition, Other Specified Disorder, and Unspecified Disorder',
  'Suicide Screen',
]

const DIAMOND_DIAGNOSES = [
  'Social Anxiety Disorder (Social Phobia)',
  'Panic Disorder',
  'Generalized Anxiety Disorder',
  'Specific Phobia',
  'Separation Anxiety Disorder',
  'Manic/Hypomanic Episode',
  'Persistent Depressive Disorder (Dysthymia)',
  'Major Depressive Episode',
  'Bipolar I Disorder',
  'Bipolar II Disorder',
  'Major Depressive Disorder',
  'Cyclothymic Disorder',
  'Obsessive-Compulsive Disorder',
  'Body Dysmorphic Disorder',
  'Trichotillomania',
  'Excoriation (Skin-Picking) Disorder',
  'Somatic Symptom Disorder',
  'Illness Anxiety Disorder',
  'Potentially Traumatic Event',
  'Acute Stress Disorder',
  'Posttraumatic Stress Disorder',
  'Adjustment Disorder',
  'Anorexia Nervosa',
  'Binge Eating',
  'Bulimia Nervosa',
  'Binge-Eating Disorder',
  'Avoidant/Restrictive Food Intake Disorder',
  'Substance Use Disorder',
  'Attention-Deficit/Hyperactivity Disorder',
  'Tic Disorders',
  'Delusions',
  'Hallucinations',
  'Schizophrenia Disorder',
  'Schizophreniform Disorder',
  'Schizoaffective Disorder',
  'Delusional Disorder',
  'Substance/Medication-Inducted Disorder',
  'Disorder due to another Medical Condition',
  'Other Specified Disorder',
  'Unspecified Disorder',
]

const CCSM_LEVELS = [
  'Level 0 (none, does not meet criteria for follow-up)',
  'Level 1 (slight, does not meet criteria for follow-up)',
  'Level 2 (mild, warrants further follow-up)',
  'Level 3 (moderate, warrants further follow-up)',
  'Level 4 (severe, warrants further follow-up)',
]

const CCSM_DOMAINS = [
  'depression', 'anger', 'mania', 'anxiety', 'somatic symptoms',
  'suicidal ideation', 'psychosis', 'sleep problems', 'memory',
  'repetitive thoughts and behaviours', 'dissociation',
  'personality functioning', 'substance use',
]

const CBCL_CATEGORIES = [
  'Anxious/Depressed', 'Withdrawn/Depressed', 'Somatic Complaints',
  'Social Problems', 'Thought Problems', 'Attention Problems',
  'Rule-Breaking Behaviour', 'Aggressive Behaviour', 'Other Problems',
]

const CBCL_RANGES = ['normal', 'borderline', 'clinical']

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'dass-21',
    name: 'DASS-21',
    population: 'adult',
    citation: 'Lovibond & Lovibond (1995)',
    preamble:
      "Client completed Lovibond & Lovibond's (1995) 21-item Depression, Anxiety, and Stress scales.",
    scales: [
      {
        id: 'depression',
        label: 'Depression score',
        min: 0,
        max: 21,
        template: "Client's depression score was {score} and in the {band} range.",
        bands: [
          { min: 0, max: 4, label: 'normal' },
          { min: 5, max: 6, label: 'mild' },
          { min: 7, max: 11, label: 'moderate' },
          { min: 12, max: 13, label: 'severe' },
          { min: 14, max: 21, label: 'extremely severe' },
        ],
      },
      {
        id: 'anxiety',
        label: 'Anxiety score',
        min: 0,
        max: 21,
        template: "Client's anxiety score was {score} and in the {band} range.",
        bands: [
          { min: 0, max: 2, label: 'normal' },
          { min: 3, max: 5, label: 'mild' },
          { min: 6, max: 7, label: 'moderate' },
          { min: 8, max: 9, label: 'severe' },
          { min: 10, max: 21, label: 'extremely severe' },
        ],
      },
      {
        id: 'stress',
        label: 'Stress score',
        min: 0,
        max: 21,
        template: "Client's stress score was {score} and in the {band} range.",
        bands: [
          { min: 0, max: 7, label: 'normal' },
          { min: 8, max: 9, label: 'mild' },
          { min: 10, max: 12, label: 'moderate' },
          { min: 13, max: 16, label: 'severe' },
          { min: 17, max: 21, label: 'extremely severe' },
        ],
      },
    ],
  },
  {
    id: 'bdi-ii',
    name: 'BDI-II',
    population: 'adult',
    citation: 'Beck et al. (1996)',
    preamble:
      "Client completed Beck et al.'s Depression Inventory: Second edition (1996).",
    scales: [
      {
        id: 'depression',
        label: 'BDI-II score',
        min: 0,
        max: 63,
        template:
          "Client's depression score was {score} and suggests {band} depression levels.",
        bands: [
          { min: 0, max: 16, label: 'minimal' },
          { min: 17, max: 19, label: 'mild' },
          { min: 20, max: 28, label: 'moderate' },
          { min: 29, max: 63, label: 'severe' },
        ],
      },
    ],
  },
  {
    id: 'bai',
    name: 'BAI',
    population: 'adult',
    citation: 'Beck et al. (1988)',
    preamble: "Client completed Beck et al.'s Anxiety Inventory (1988).",
    scales: [
      {
        id: 'anxiety',
        label: 'BAI score',
        min: 0,
        max: 63,
        template: "Client's anxiety score was {score} and suggests {band} anxiety levels.",
        bands: [
          { min: 0, max: 7, label: 'minimal' },
          { min: 8, max: 15, label: 'mild' },
          { min: 16, max: 25, label: 'moderate' },
          { min: 26, max: 63, label: 'severe' },
        ],
      },
    ],
  },
  {
    id: 'k10',
    name: 'K10',
    population: 'adult',
    citation: 'Andrews & Slade (2001)',
    preamble:
      "Client completed Andrews and Slade's Kessler Psychological Distress Scale (2001).",
    scales: [
      {
        id: 'distress',
        label: 'K10 score',
        min: 0,
        max: 50,
        template: 'Client scored {score} suggesting {band} psychological distress.',
        bands: [
          { min: 0, max: 15, label: 'little to no' },
          { min: 16, max: 21, label: 'moderate levels of' },
          { min: 22, max: 29, label: 'high levels of' },
          { min: 30, max: 50, label: 'very high levels of' },
        ],
      },
    ],
  },
  {
    id: 'whoqol-bref',
    name: 'WHOQoL-BREF',
    population: 'adult',
    citation: 'World Health Organisation (2000)',
    preamble:
      "Client completed World Health Organisation's Quality of Life instrument (2000).",
    scales: (
      [
        ['physical', 'Physical health', "Client's physical health score was {score}%."],
        ['psychological', 'Psychological', "Client's psychological health score was {score}%."],
        ['social', 'Social relationships', "Client's social relationships score was {score}%."],
        ['environment', 'Environment', "Client's environment score was {score}%."],
      ] as const
    ).map(([id, label, template]) => ({
      id,
      label: `${label} percentage`,
      min: 0,
      max: 100,
      template,
      bands: [],
    })),
  },
  {
    id: 'dsm-v-ccsm',
    name: 'DSM-V CCSM',
    population: 'adult',
    citation: 'Bastiaens & Galus (2018)',
    preamble:
      "Client completed Bastiaens and Galus's (2018) DSM-V Cross-cutting Symptom Measure.",
    scales: [],
    fields: CCSM_DOMAINS.map((d) => ({
      id: d.replace(/[^a-z]+/g, '-'),
      label: d.charAt(0).toUpperCase() + d.slice(1),
      kind: 'select' as const,
      options: CCSM_LEVELS,
    })),
    fieldTemplate: "Client's {label} score was {value}.",
  },
  {
    id: 'diamond',
    name: 'DIAMOND',
    population: 'adult',
    citation: 'Tolin et al. (2018)',
    preamble: '',
    scales: [],
    fields: [
      { id: 'module', label: 'Module administered', kind: 'select', options: DIAMOND_MODULES },
      { id: 'diagnosis', label: 'Diagnosis considered', kind: 'select', options: DIAMOND_DIAGNOSES },
      {
        id: 'outcome',
        label: 'Outcome',
        kind: 'select',
        options: ['Supported diagnosis', 'Did not support a diagnosis'],
      },
    ],
    fieldTemplate: '',
  },
  {
    id: 'byi',
    name: 'BYI',
    population: 'child',
    citation: 'Beck et al. (2012)',
    preamble: "Client completed Beck et al.'s Youth Inventories (2012).",
    scales: [
      {
        id: 'depression',
        label: 'BYI score',
        min: 0,
        max: 101,
        template: "Client's depression score was {score} suggesting {band} levels of distress.",
        bands: [
          { min: 0, max: 54, label: 'average' },
          { min: 55, max: 59, label: 'mildly elevated' },
          { min: 60, max: 69, label: 'moderately elevated' },
          { min: 70, max: 101, label: 'severe' },
        ],
      },
    ],
  },
  {
    id: 'cbcl',
    name: 'CBCL',
    population: 'child',
    citation: 'Achenbach (1999)',
    preamble: '',
    scales: [],
    fields: [
      {
        id: 'version',
        label: 'Version',
        kind: 'select',
        options: ['preschool (1.5–5 years)', 'school-age (5–18 years)'],
      },
      ...CBCL_CATEGORIES.map((c) => ({
        id: `client-${c.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`,
        label: `${c} (client)`,
        kind: 'select' as const,
        options: CBCL_RANGES,
      })),
      { id: 'informant', label: 'Informant relation to client', kind: 'text' as const },
      ...CBCL_CATEGORIES.map((c) => ({
        id: `informant-${c.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`,
        label: `${c} (informant)`,
        kind: 'select' as const,
        options: CBCL_RANGES,
      })),
    ],
    fieldTemplate: '',
  },
  {
    id: 'diamond-kid',
    name: 'DIAMOND-KID',
    population: 'child',
    citation: 'Tolin et al. (2023)',
    preamble: '',
    scales: [],
    fields: [
      { id: 'module', label: 'Module administered', kind: 'select', options: DIAMOND_MODULES },
      { id: 'diagnosis', label: 'Diagnosis considered', kind: 'select', options: DIAMOND_DIAGNOSES },
      {
        id: 'outcome',
        label: 'Outcome',
        kind: 'select',
        options: ['Supported diagnosis', 'Did not support a diagnosis'],
      },
    ],
    fieldTemplate: '',
  },
]

export function bandFor(score: number, bands: { min: number; max: number; label: string }[]) {
  return bands.find((b) => score >= b.min && score <= b.max)?.label ?? ''
}

/** DIAMOND and CBCL have bespoke prose that doesn't fit the generic templates. */
export function composeInstrument(
  inst: Instrument,
  scores: Record<string, string>,
  fields: Record<string, string>,
): string {
  const out: string[] = []

  if (inst.id === 'diamond' || inst.id === 'diamond-kid') {
    const { module, diagnosis, outcome } = fields
    if (!module || !diagnosis || !outcome) return ''
    const source =
      inst.id === 'diamond'
        ? "Tolin et al's Structured Diagnostic Interview for Anxiety, Mood, and OCD and Related Neuropsychiatric Disorders was administered to the client (2018)"
        : "Tolin et al.'s Structured Diagnostic Interview for DSM-V Anxiety, Mood, and Obsessive-Compulsive and Related Disorders in Children and Adolescents was administered to the client (2023)"
    const verdict =
      outcome === 'Supported diagnosis'
        ? `The client's responses supported a diagnosis of ${diagnosis}`
        : `The client's responses did not support a diagnosis of ${diagnosis}`
    return `The ${module} module from ${source}. ${verdict} according to the DSM-V-TR (American Psychological Association, 2022).`
  }

  if (inst.id === 'cbcl') {
    const version = fields.version
    if (!version) return ''
    const label = version.startsWith('preschool') ? 'preschool' : 'school-age'
    out.push(
      `Client completed the ${label} version of Achenbach's The Child Behavior Checklist (1999).`,
    )
    for (const c of CBCL_CATEGORIES) {
      const key = `client-${c.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`
      if (fields[key]) {
        out.push(`Client's ${c} category results fell within the ${fields[key]} range.`)
      }
    }
    if (fields.informant) {
      out.push(
        `Client's ${fields.informant} completed the checklist as an informant and reported the following outcomes.`,
      )
      for (const c of CBCL_CATEGORIES) {
        const key = `informant-${c.replace(/[^a-zA-Z]+/g, '-').toLowerCase()}`
        if (fields[key]) {
          out.push(`Informant's ${c} category results fell within the ${fields[key]} range.`)
        }
      }
    }
    return out.join(' ')
  }

  const hasAny =
    inst.scales.some((s) => scores[s.id]?.trim()) ||
    (inst.fields ?? []).some((f) => fields[f.id]?.trim())
  if (!hasAny) return ''

  if (inst.preamble) out.push(inst.preamble)

  for (const scale of inst.scales) {
    const raw = scores[scale.id]?.trim()
    if (!raw) continue
    const n = Number(raw)
    if (Number.isNaN(n)) continue
    const band = bandFor(n, scale.bands)
    out.push(scale.template.replace('{score}', String(n)).replace('{band}', band))
  }

  for (const f of inst.fields ?? []) {
    const v = fields[f.id]?.trim()
    if (!v || !inst.fieldTemplate) continue
    out.push(inst.fieldTemplate.replace('{label}', f.label.toLowerCase()).replace('{value}', v))
  }

  return out.join(' ')
}
