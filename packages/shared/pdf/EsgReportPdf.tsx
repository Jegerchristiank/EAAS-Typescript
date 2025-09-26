/**
 * React-PDF dokument der viser simple ESG-resultater.
 */
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ModuleResult } from '../types'

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

export function EsgReportPdf({ results }: { results: ModuleResult[] }): JSX.Element {
  const sections = results.length ? results : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>ESG Rapport</Text>
        {sections.length === 0 ? (
          <Text style={styles.metric}>Ingen beregninger tilgængelige.</Text>
        ) : (
          sections.map((result) => (
            <View key={result.moduleId} style={styles.module}>
              <Text style={styles.moduleTitle}>{result.title ?? `Modul ${result.moduleId}`}</Text>
              <Text style={styles.metric}>
                Nettoresultat: {String(result.value)} {result.unit ?? ''}
              </Text>
              {result.warnings.length > 0 && (
                <View>
                  <Text style={styles.label}>Advarsler</Text>
                  {result.warnings.map((warning, index) => (
                    <Text key={`${result.moduleId}-warning-${index}`} style={styles.listItem}>
                      • {warning}
                    </Text>
                  ))}
                </View>
              )}
              <View>
                <Text style={styles.label}>Antagelser</Text>
                {result.assumptions.map((assumption, index) => (
                  <Text key={`${result.moduleId}-assumption-${index}`} style={styles.listItem}>
                    • {assumption}
                  </Text>
                ))}
              </View>
              <View>
                <Text style={styles.label}>Trace</Text>
                {result.trace.map((entry, index) => (
                  <Text key={`${result.moduleId}-trace-${index}`} style={styles.traceItem}>
                    {entry}
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
