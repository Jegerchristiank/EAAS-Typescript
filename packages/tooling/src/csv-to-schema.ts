/**
 * Konverterer modul-CSV til JSON Schema objekt.
 */
import { readFile } from 'node:fs/promises'

export type CsvSchemaRow = {
  module: string
  value_type: string
}

const b1Override = {
  type: 'object',
  title: 'B1Input',
  description: 'Scope 2 elforbrug',
  properties: {
    electricityConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt elforbrug (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af strøm indkøbt som vedvarende energi (%)'
    }
  },
  additionalProperties: false
} as const

const typeMap: Record<string, unknown> = {
  string: { type: 'string' },
  number: { type: 'number' },
  object: { type: 'object' }
}

const planningProperties = {
  dataOwner: {
    type: ['string', 'null'],
    maxLength: 120,
    description: 'Navn eller rolle for dataansvarlig.'
  },
  dataSource: {
    type: ['string', 'null'],
    maxLength: 240,
    description: 'Primære systemer eller processer hvor data hentes.'
  },
  targetGoLiveQuarter: {
    type: ['string', 'null'],
    maxLength: 32,
    description: 'Planlagt kvartal for fuld integration (fx Q1 2026).'
  },
  notes: {
    type: ['string', 'null'],
    maxLength: 2000,
    description: 'Supplerende noter om datakvalitet, antagelser eller governance.'
  }
} as const

function createPlanningOverride(title: string, description: string) {
  return {
    type: 'object',
    title,
    description,
    properties: planningProperties,
    additionalProperties: false
  } as const
}

const a1Override = {
  type: 'object',
  title: 'A1Input',
  description: 'Scope 1 stationære forbrændingskilder',
  properties: {
    fuelConsumptions: {
      type: 'array',
      description: 'Brændselslinjer for kedler, ovne og generatorer.',
      maxItems: 12,
      items: {
        type: 'object',
        properties: {
          fuelType: {
            type: 'string',
            enum: ['naturgas', 'diesel', 'fyringsolie', 'biogas'],
            description: 'Brændstoftype for linjen.'
          },
          unit: {
            type: 'string',
            enum: ['liter', 'Nm³', 'kg'],
            description: 'Måleenhed for brændselsmængden.'
          },
          quantity: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Mængde brændsel i valgt enhed.'
          },
          emissionFactorKgPerUnit: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Emissionsfaktor i kg CO2e pr. enhed.'
          },
          documentationQualityPercent: {
            type: ['number', 'null'],
            minimum: 0,
            maximum: 100,
            description: 'Dokumentationskvalitet i procent.'
          }
        },
        required: ['fuelType', 'unit'],
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
} as const

const a2Override = {
  type: 'object',
  title: 'A2Input',
  description: 'Scope 1 mobile forbrændingskilder',
  properties: {
    vehicleConsumptions: {
      type: 'array',
      description: 'Brændselslinjer for bilpark, trucks og entreprenørmaskiner.',
      maxItems: 20,
      items: {
        type: 'object',
        properties: {
          fuelType: {
            type: 'string',
            enum: ['benzin', 'diesel', 'biodiesel', 'cng'],
            description: 'Brændstoftype for køretøjet eller maskinen.'
          },
          unit: {
            type: 'string',
            enum: ['liter', 'kg'],
            description: 'Måleenhed for brændselsforbruget.'
          },
          quantity: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Mængde brændsel i valgt enhed.'
          },
          emissionFactorKgPerUnit: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Emissionsfaktor i kg CO2e pr. enhed.'
          },
          distanceKm: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Evt. kørt distance i kilometer for linjen.'
          },
          documentationQualityPercent: {
            type: ['number', 'null'],
            minimum: 0,
            maximum: 100,
            description: 'Dokumentationskvalitet i procent.'
          }
        },
        required: ['fuelType', 'unit'],
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
} as const

const a3Override = {
  type: 'object',
  title: 'A3Input',
  description: 'Scope 1 procesemissioner',
  properties: {
    processLines: {
      type: 'array',
      description: 'Proceslinjer for industrielle emissioner (cement, kemikalier, metaller).',
      maxItems: 20,
      items: {
        type: 'object',
        properties: {
          processType: {
            type: 'string',
            enum: ['cementClinker', 'limeCalcination', 'ammoniaProduction', 'aluminiumSmelting'],
            description: 'Proces- eller kemisk aktivitet.'
          },
          outputQuantityTon: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Produceret mængde i ton for processen.'
          },
          emissionFactorKgPerTon: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Emissionsfaktor i kg CO2e pr. ton output.'
          },
          documentationQualityPercent: {
            type: ['number', 'null'],
            minimum: 0,
            maximum: 100,
            description: 'Dokumentationskvalitet i procent.'
          }
        },
        required: ['processType'],
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
} as const

const a4Override = {
  type: 'object',
  title: 'A4Input',
  description: 'Scope 1 flugtige emissioner',
  properties: {
    refrigerantLines: {
      type: 'array',
      description: 'Kølemidler og andre gasser med årlig lækage og GWP100.',
      maxItems: 20,
      items: {
        type: 'object',
        properties: {
          refrigerantType: {
            type: 'string',
            enum: ['hfc134a', 'hfc125', 'hfc32', 'r410a', 'r407c', 'sf6'],
            description: 'Valgt kølemiddel eller gas.'
          },
          systemChargeKg: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'Fyldning eller beholdning (kg).'
          },
          leakagePercent: {
            type: ['number', 'null'],
            minimum: 0,
            maximum: 100,
            description: 'Årlig lækageandel (%)'
          },
          gwp100: {
            type: ['number', 'null'],
            minimum: 0,
            description: 'GWP100-værdi for kølemidlet.'
          },
          documentationQualityPercent: {
            type: ['number', 'null'],
            minimum: 0,
            maximum: 100,
            description: 'Dokumentationskvalitet i procent.'
          }
        },
        required: ['refrigerantType'],
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
} as const

const b2Override = {
  type: 'object',
  title: 'B2Input',
  description: 'Scope 2 varmeforbrug',
  properties: {
    heatConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt varmeforbrug fra leverandør (kWh)'
    },
    recoveredHeatKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet eller egenproduceret varme trukket fra (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for varmeleverancen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af certificeret vedvarende varme (%)'
    }
  },
  additionalProperties: false
} as const

const b3Override = {
  type: 'object',
  title: 'B3Input',
  description: 'Scope 2 køleforbrug',
  properties: {
    coolingConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt køleforbrug fra leverandør (kWh)'
    },
    recoveredCoolingKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet eller frikøling trukket fra (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for køleleverancen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af certificeret vedvarende køling (%)'
    }
  },
  additionalProperties: false
} as const

const b4Override = {
  type: 'object',
  title: 'B4Input',
  description: 'Scope 2 dampforbrug',
  properties: {
    steamConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt dampforbrug fra leverandør (kWh)'
    },
    recoveredSteamKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet kondensat eller procesdamp trukket fra (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for dampforsyningen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af certificeret vedvarende damp (%)'
    }
  },
  additionalProperties: false
} as const

const b5Override = {
  type: 'object',
  title: 'B5Input',
  description: 'Scope 2 øvrige energileverancer',
  properties: {
    otherEnergyConsumptionKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt forbrug af den indkøbte energitype (kWh)'
    },
    recoveredEnergyKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Genindvundet energi eller procesudnyttelse der reducerer behovet (kWh)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for energileverancen (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel dokumenteret som vedvarende energi (%)'
    }
  },
  additionalProperties: false
} as const

const b6Override = {
  type: 'object',
  title: 'B6Input',
  description: 'Scope 2 nettab i elnettet',
  properties: {
    electricitySuppliedKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Årligt elforbrug der danner grundlag for nettab (kWh)'
    },
    gridLossPercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Forventet transmissions- og distributionstab (%)'
    },
    emissionFactorKgPerKwh: {
      type: ['number', 'null'],
      minimum: 0,
      description: 'Emissionsfaktor for tabt elektricitet (kg CO2e pr. kWh)'
    },
    renewableSharePercent: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      description: 'Andel af tabet der dækkes af vedvarende energi (%)'
    }
  },
  additionalProperties: false
} as const


const moduleOverrides: Record<string, unknown> = {
  A1: a1Override,
  A2: a2Override,
  A3: a3Override,
  A4: a4Override,
  B1: b1Override,
  B2: b2Override,
  B3: b3Override,
  B4: b4Override,
  B5: b5Override,
  B6: b6Override,
  C10: createPlanningOverride('C10Input', 'Scope 3 brug af solgte produkter (planlægning)'),
  C11: createPlanningOverride('C11Input', 'Scope 3 slutbehandling af solgte produkter (planlægning)'),
  C12: createPlanningOverride('C12Input', 'Scope 3 franchising og downstream services (planlægning)'),
  C13: createPlanningOverride('C13Input', 'Scope 3 investeringer og finansielle aktiviteter (planlægning)'),
  C14: createPlanningOverride('C14Input', 'Scope 3 øvrige downstream aktiviteter (planlægning)'),
  C15: createPlanningOverride('C15Input', 'Scope 3 øvrige kategorioplysninger (planlægning)'),
  D1: createPlanningOverride('D1Input', 'CSRD/ESRS governance-krav (planlægning)')
}

export async function convertCsvToSchema(csvPath: string): Promise<Record<string, unknown>> {
  const raw = await readFile(csvPath, 'utf-8')
  const lines = raw.trim().split(/\r?\n/)
  const [, ...rows] = lines

  const properties = rows.reduce<Record<string, unknown>>((acc, line) => {
    const [module, valueType] = line.split(',').map((cell) => cell.trim())
    if (!module) {
      return acc
    }
    const override = moduleOverrides[module]
    if (override) {
      acc[module] = override
      return acc
    }
    const mappedType = typeMap[valueType ?? '']
    acc[module] = mappedType ?? { type: 'string' }
    return acc
  }, {})

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ESGInput',
    type: 'object',
    properties,
    additionalProperties: true
  }
}
