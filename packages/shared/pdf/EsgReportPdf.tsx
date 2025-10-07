/**
 * React-PDF dokument der strukturerer beregninger efter ESRS-sektioner.
 */
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CalculatedModuleResult } from '../types'
import { groupResultsByEsrs } from '../reporting/esrsLayout'

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: '#1b1b1b',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: '2 solid #1f6f4f',
  },
  pageTitle: {
    fontSize: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#4b6158',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 4,
    color: '#1f6f4f',
  },
  sectionDescription: {
    fontSize: 10,
    marginBottom: 8,
    color: '#4a4a4a',
  },
  module: {
    border: '1 solid #d0d7d5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f8faf9',
  },
  moduleHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  moduleMetric: {
    fontSize: 11,
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#2f3e36',
  },
  list: {
    marginBottom: 4,
  },
  listItem: {
    fontSize: 9,
    marginLeft: 8,
    marginBottom: 2,
  },
  inline: {
    fontSize: 9,
    marginBottom: 2,
  },
  topicRow: {
    borderBottom: '1 solid #d0d7d5',
    paddingVertical: 4,
  },
  topicHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gapAlert: {
    fontSize: 9,
    color: '#b23d2e',
  },
})

type ModuleBlockProps = {
  entry: CalculatedModuleResult
}

function ModuleBlock({ entry }: ModuleBlockProps): JSX.Element {
  const { result } = entry

  return (
    <View style={styles.module} wrap={false}>
      <Text style={styles.moduleHeader}>{entry.title}</Text>
      <Text style={styles.moduleMetric}>
        Resultat: {String(result.value)} {result.unit}
      </Text>

      {result.intensities && result.intensities.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Intensiteter</Text>
          {result.intensities.map((intensity, index) => (
            <Text key={`${entry.moduleId}-intensity-${index}`} style={styles.listItem}>
              • {intensity.label}: {intensity.value} {intensity.unit}
            </Text>
          ))}
        </View>
      )}

      {result.trend && (
        <View style={styles.list}>
          <Text style={styles.label}>Udvikling</Text>
          <Text style={styles.listItem}>
            • {result.trend.label}: {result.trend.previousValue ?? '–'} → {result.trend.currentValue} {result.trend.unit}
          </Text>
          {result.trend.absoluteChange != null && (
            <Text style={styles.listItem}>
              • Ændring: {result.trend.absoluteChange} {result.trend.unit} ({
                result.trend.percentChange != null ? `${result.trend.percentChange}%` : 'n/a'
              })
            </Text>
          )}
        </View>
      )}

      {result.targetProgress && (
        <View style={styles.list}>
          <Text style={styles.label}>Målopfølgning</Text>
          <Text style={styles.listItem}>
            • {result.targetProgress.name ?? 'Mål'} ({result.targetProgress.scope}) – mål{' '}
            {result.targetProgress.targetYear ?? 'ukendt'}: {result.targetProgress.targetValueTonnes ?? '–'} tCO2e
          </Text>
          <Text style={styles.listItem}>
            • Status: {result.targetProgress.status ?? 'ukendt'} | Afvigelse:{' '}
            {result.targetProgress.varianceTonnes ?? 'n/a'} tCO2e
          </Text>
          {result.targetProgress.progressPercent != null && (
            <Text style={styles.listItem}>• Fremskridt: {result.targetProgress.progressPercent}%</Text>
          )}
        </View>
      )}

      {result.energyMix && result.energyMix.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Energimix</Text>
          {result.energyMix.map((mixEntry, index) => (
            <Text key={`${entry.moduleId}-mix-${index}`} style={styles.listItem}>
              • {mixEntry.energyType}: {mixEntry.sharePercent}% ({mixEntry.consumptionKwh} kWh)
            </Text>
          ))}
        </View>
      )}

      {result.targetsOverview && result.targetsOverview.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Måloversigt</Text>
          {result.targetsOverview.map((target, index) => (
            <Text key={`${entry.moduleId}-target-${index}`} style={styles.listItem}>
              • {target.name} ({target.scope}) – mål {target.targetYear ?? 'ukendt'}:{' '}
              {target.targetValueTonnes ?? '–'} tCO2e | Ansvarlig: {target.owner ?? 'n/a'}
            </Text>
          ))}
        </View>
      )}

      {result.plannedActions && result.plannedActions.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Planlagte handlinger</Text>
          {result.plannedActions.map((action, index) => (
            <Text key={`${entry.moduleId}-action-${index}`} style={styles.listItem}>
              • {action.title ?? 'Handling'} – {action.status ?? 'ukendt'} ({action.dueQuarter ?? 'ukendt'})
            </Text>
          ))}
        </View>
      )}

      {result.narratives && result.narratives.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Narrativer</Text>
          {result.narratives.map((narrative, index) => (
            <View key={`${entry.moduleId}-narrative-${index}`} style={{ marginBottom: 3 }}>
              <Text style={styles.listItem}>• {narrative.label}</Text>
              <Text style={styles.inline}>{narrative.content}</Text>
            </View>
          ))}
        </View>
      )}

      {result.responsibilities && result.responsibilities.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Ansvar</Text>
          {result.responsibilities.map((responsible, index) => (
            <Text key={`${entry.moduleId}-responsible-${index}`} style={styles.listItem}>
              • {responsible.subject}: {responsible.owner}
              {responsible.role ? ` (${responsible.role})` : ''}
            </Text>
          ))}
        </View>
      )}

      {result.notes && result.notes.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Noter</Text>
          {result.notes.map((note, index) => (
            <Text key={`${entry.moduleId}-note-${index}`} style={styles.listItem}>
              • {note.label}: {note.detail}
            </Text>
          ))}
        </View>
      )}

      {result.warnings.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Advarsler</Text>
          {result.warnings.map((warning, index) => (
            <Text key={`${entry.moduleId}-warning-${index}`} style={styles.listItem}>
              • {warning}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.list}>
        <Text style={styles.label}>Antagelser</Text>
        {result.assumptions.map((assumption, index) => (
          <Text key={`${entry.moduleId}-assumption-${index}`} style={styles.listItem}>
            • {assumption}
          </Text>
        ))}
      </View>

      <View style={styles.list}>
        <Text style={styles.label}>Trace</Text>
        {result.trace.map((traceEntry, index) => (
          <Text key={`${entry.moduleId}-trace-${index}`} style={styles.listItem}>
            • {traceEntry}
          </Text>
        ))}
      </View>
    </View>
  )
}

function DoubleMaterialitySection({ entry }: { entry: CalculatedModuleResult }): JSX.Element {
  const { result } = entry
  const summary = result.doubleMateriality

  if (!summary) {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Dobbelt væsentlighed</Text>
        <Text style={styles.sectionDescription}>
          Ingen registrerede emner i D2-modulet. Udfyld materialitet for at dokumentere dobbelt væsentlighed.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>Dobbelt væsentlighed</Text>
      <Text style={styles.sectionDescription}>{summary.summary}</Text>

      {summary.gapAlerts.length > 0 && (
        <View style={styles.list}>
          <Text style={styles.label}>Gap-advarsler</Text>
          {summary.gapAlerts.map((topic, index) => (
            <Text key={`${entry.moduleId}-gap-${index}`} style={styles.gapAlert}>
              • Manglende CSRD-gap for {topic}
            </Text>
          ))}
        </View>
      )}

      {summary.topics.map((topic, index) => (
        <View key={`${entry.moduleId}-topic-${index}`} style={styles.topicRow} wrap={false}>
          <Text style={styles.topicHeader}>{topic.name}</Text>
          <Text style={styles.inline}>
            Impact: {topic.impactScore.toFixed(1)} · Finansiel: {topic.financialScore.toFixed(1)} · Kombineret:{' '}
            {topic.combinedScore.toFixed(2)}
          </Text>
          <Text style={styles.inline}>
            Risiko: {topic.riskType ?? 'ukendt'} · Tidslinje: {topic.timeline ?? 'ukendt'} · Ansvarlig:{' '}
            {topic.responsible ?? 'n/a'} · CSRD-gap: {topic.csrdGapStatus ?? 'ukendt'}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function EsgReportPdf({ results }: { results: CalculatedModuleResult[] }): JSX.Element {
  const layout = groupResultsByEsrs(results)
  const hasResults = results.length > 0

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>ESRS-rapport</Text>
          <Text style={styles.subtitle}>
            Struktureret efter generelle oplysninger, politikker, mål, metrics og dobbelt væsentlighed.
          </Text>
        </View>

        {!hasResults && <Text>Ingen beregninger tilgængelige.</Text>}

        {hasResults && (
          <>
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Generelle oplysninger</Text>
              <Text style={styles.sectionDescription}>
                D1 og D2-modulerne dokumenterer metodik, governance og materialitet.
              </Text>
              {layout.general.map((entry) => (
                <ModuleBlock key={entry.moduleId} entry={entry} />
              ))}
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Politikker og governance</Text>
              <Text style={styles.sectionDescription}>
                G1 og relaterede moduler giver overblik over politikker, kontroller og due diligence.
              </Text>
              {layout.policies.map((entry) => (
                <ModuleBlock key={entry.moduleId} entry={entry} />
              ))}
              {layout.policies.length === 0 && (
                <Text style={styles.inline}>Ingen politikker registreret for den aktive profil.</Text>
              )}
            </View>

            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Mål og fremskridt</Text>
              <Text style={styles.sectionDescription}>
                ESRS E1-mål og handlinger med ansvarlige og milestones.
              </Text>
              {layout.targets.map((entry) => (
                <ModuleBlock key={entry.moduleId} entry={entry} />
              ))}
              {layout.targets.length === 0 && (
                <Text style={styles.inline}>Ingen mål er registreret endnu.</Text>
              )}
            </View>

            {layout.metrics.map((section) => (
              <View key={section.id} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
                {section.modules.map((entry) => (
                  <ModuleBlock key={entry.moduleId} entry={entry} />
                ))}
              </View>
            ))}

            {layout.doubleMateriality && <DoubleMaterialitySection entry={layout.doubleMateriality} />}
          </>
        )}
      </Page>
    </Document>
  )
}
