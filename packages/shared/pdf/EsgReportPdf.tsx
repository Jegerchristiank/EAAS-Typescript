/**
 * React-PDF dokument der viser simple ESG-resultater.
 */
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ModuleResult } from '../types'

const styles = StyleSheet.create({
  page: { padding: 32 },
  heading: { fontSize: 20, marginBottom: 16 },
  row: { marginBottom: 8 }
})

export function EsgReportPdf({ results }: { results: ModuleResult[] }): JSX.Element {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>ESG Rapport</Text>
        <View>
          {results.map((result, index) => (
            <Text key={index} style={styles.row}>
              Resultat {index + 1}: {String(result.value)} {result.unit ?? ''}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
}
