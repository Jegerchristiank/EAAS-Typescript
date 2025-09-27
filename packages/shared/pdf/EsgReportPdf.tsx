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
  traceItem: { fontSize: 9, marginLeft: 12, marginBottom: 1 }
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
