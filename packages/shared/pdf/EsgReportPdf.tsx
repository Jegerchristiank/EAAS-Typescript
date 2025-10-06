/**
 * React-PDF dokument der viser simple ESG-resultater.
 */
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CalculatedModuleResult } from '../types'

const styles = StyleSheet.create({
  page: { padding: 32 },
  heading: { fontSize: 20, marginBottom: 16 },
  module: { marginBottom: 16, paddingBottom: 12, borderBottom: '1 solid #d0d7d5' },
  moduleTitle: { fontSize: 14, marginBottom: 4 },
  metric: { fontSize: 12, marginBottom: 6 },
  label: { fontSize: 10, marginBottom: 2, color: '#555' },
  listItem: { fontSize: 10, marginLeft: 12, marginBottom: 2 },
  traceItem: { fontSize: 9, marginLeft: 12, marginBottom: 1 },
  subsection: { marginTop: 6 }
})

export function EsgReportPdf({ results }: { results: CalculatedModuleResult[] }): JSX.Element {
  const sections = results.length > 0 ? results : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>ESG Rapport</Text>
        {sections.length === 0 ? (
          <Text style={styles.metric}>Ingen beregninger tilgængelige.</Text>
        ) : (
          sections.map((entry) => (
            <View key={entry.moduleId} style={styles.module}>
              <Text style={styles.moduleTitle}>{entry.title}</Text>
              <Text style={styles.metric}>
                Nettoresultat: {String(entry.result.value)} {entry.result.unit}
              </Text>
              {entry.result.intensities && entry.result.intensities.length > 0 && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>Intensiteter</Text>
                  {entry.result.intensities.map((intensity, index) => (
                    <Text key={`${entry.moduleId}-intensity-${index}`} style={styles.listItem}>
                      • {intensity.label}: {intensity.value} {intensity.unit}
                    </Text>
                  ))}
                </View>
              )}
              {entry.result.trend && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>Udvikling</Text>
                  <Text style={styles.listItem}>
                    • {entry.result.trend.label}: {entry.result.trend.previousValue ?? '–'} →{' '}
                    {entry.result.trend.currentValue} {entry.result.trend.unit}
                  </Text>
                  {entry.result.trend.absoluteChange != null && (
                    <Text style={styles.listItem}>
                      • Ændring: {entry.result.trend.absoluteChange} {entry.result.trend.unit} ({
                        entry.result.trend.percentChange != null
                          ? `${entry.result.trend.percentChange}%`
                          : 'n/a'
                      })
                    </Text>
                  )}
                </View>
              )}
              {entry.result.targetProgress && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>Målopfølgning</Text>
                  <Text style={styles.listItem}>
                    • {entry.result.targetProgress.name ?? 'Mål'} ({entry.result.targetProgress.scope}) – mål{' '}
                    {entry.result.targetProgress.targetYear ?? 'ukendt'}: {entry.result.targetProgress.targetValueTonnes ?? '–'}{' '}
                    tCO2e
                  </Text>
                  <Text style={styles.listItem}>
                    • Status: {entry.result.targetProgress.status ?? 'ukendt'} | Afvigelse:{' '}
                    {entry.result.targetProgress.varianceTonnes ?? 'n/a'} tCO2e
                  </Text>
                  {entry.result.targetProgress.progressPercent != null && (
                    <Text style={styles.listItem}>
                      • Fremskridt: {entry.result.targetProgress.progressPercent}%
                    </Text>
                  )}
                </View>
              )}
              {entry.result.energyMix && entry.result.energyMix.length > 0 && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>Energimix</Text>
                  {entry.result.energyMix.map((mixEntry, index) => (
                    <Text key={`${entry.moduleId}-mix-${index}`} style={styles.listItem}>
                      • {mixEntry.energyType}: {mixEntry.sharePercent}% ({mixEntry.consumptionKwh} kWh)
                    </Text>
                  ))}
                </View>
              )}
              {entry.result.warnings.length > 0 && (
                <View>
                  <Text style={styles.label}>Advarsler</Text>
                  {entry.result.warnings.map((warning, index) => (
                    <Text key={`${entry.moduleId}-warning-${index}`} style={styles.listItem}>
                      • {warning}
                    </Text>
                  ))}
                </View>
              )}
              {entry.result.targetsOverview && entry.result.targetsOverview.length > 0 && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>E1-mål</Text>
                  {entry.result.targetsOverview.map((target, index) => (
                    <Text key={`${entry.moduleId}-target-${index}`} style={styles.listItem}>
                      • {target.name} ({target.scope}) – mål {target.targetYear ?? 'ukendt'}:{' '}
                      {target.targetValueTonnes ?? '–'} tCO2e | Ansvarlig: {target.owner ?? 'n/a'}
                    </Text>
                  ))}
                </View>
              )}
              {entry.result.plannedActions && entry.result.plannedActions.length > 0 && (
                <View style={styles.subsection}>
                  <Text style={styles.label}>Planlagte handlinger</Text>
                  {entry.result.plannedActions.map((action, index) => (
                    <Text key={`${entry.moduleId}-action-${index}`} style={styles.listItem}>
                      • {action.title ?? 'Handling'} – {action.status ?? 'ukendt'} ({action.dueQuarter ?? 'ukendt'})
                    </Text>
                  ))}
                </View>
              )}
              <View>
                <Text style={styles.label}>Antagelser</Text>
                {entry.result.assumptions.map((assumption, index) => (
                  <Text key={`${entry.moduleId}-assumption-${index}`} style={styles.listItem}>
                    • {assumption}
                  </Text>
                ))}
              </View>
              <View>
                <Text style={styles.label}>Trace</Text>
                {entry.result.trace.map((traceEntry, index) => (
                  <Text key={`${entry.moduleId}-trace-${index}`} style={styles.traceItem}>
                    {traceEntry}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </Page>
    </Document>
  )
}
