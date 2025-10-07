/**
 * Beregning for modul S4 – forbrugere og slutbrugere.
 */
import type { ModuleInput, ModuleResult, S4Input } from '../../types'
import { factors } from '../factors'

const { s4 } = factors

type IssueRow = NonNullable<S4Input['issues']>[number]

type NormalisedIssue = {
  index: number
  productOrService: string | null
  market: string | null
  issueType: string | null
  usersAffected: number | null
  severityLevel: NormalisedSeverity
  remediationStatus: NormalisedStatus
  description: string | null
}

type NormalisedSeverity = NonNullable<IssueRow['severityLevel']> | null
type NormalisedStatus = NonNullable<IssueRow['remediationStatus']> | null

type PercentLike = number | null | undefined

export function runS4(input: ModuleInput): ModuleResult {
  const raw = (input.S4 ?? null) as S4Input | null
  const issues = normaliseIssues(raw?.issues)
  const trace: string[] = []
  const warnings: string[] = []
  const assumptions = [
    'Scoren vægter risikovurdering af produkter (30 %), klagehåndtering (20 %), klagemekanismer (10 %) og databeskyttelse (15 %).',
    'Indberettede hændelser reducerer scoren efter alvorlighed, antal berørte brugere og status på afhjælpning.'
  ]

  const coverageScore = resolveCoverageScore(raw, trace, warnings)
  const complaintsScore = resolveComplaintsScore(raw, trace, warnings)
  const mechanismScore = resolveMechanismScore(raw, warnings)
  const dataProtectionScore = resolveDataProtectionScore(raw, trace, warnings)
  const incidentPenalty = computeIncidentPenalty(raw, issues, trace, warnings)
  const additionalPenalty = computeAdditionalPenalty(raw, trace, warnings)

  const baseScore =
    s4.coverageWeight * coverageScore +
    s4.complaintResolutionWeight * complaintsScore +
    s4.mechanismWeight * mechanismScore +
    s4.dataProtectionWeight * dataProtectionScore

  const value = Number(
    (
      Math.max(0, Math.min(1, baseScore - s4.incidentWeight * Math.min(1, incidentPenalty + additionalPenalty))) * 100
    ).toFixed(s4.resultPrecision)
  )

  if (issues.length === 0) {
    trace.push('issues=0')
    if ((raw?.severeIncidentsCount ?? 0) > 0) {
      warnings.push('Der er registreret alvorlige hændelser, men ingen detaljeret liste. Udfyld S4 impacts-tabellen.')
    }
  }

  if (!hasNarrative(raw?.vulnerableUsersNarrative)) {
    warnings.push('Tilføj narrativ om støtte til udsatte brugergrupper og adgang til produkter (ESRS S4 §18).')
  }

  if (!hasNarrative(raw?.consumerEngagementNarrative)) {
    warnings.push('Tilføj narrativ om forbrugerkommunikation, uddannelse og samarbejde (ESRS S4 §22).')
  }

  return {
    value,
    unit: s4.unit,
    assumptions,
    trace,
    warnings
  }
}

function resolveCoverageScore(raw: S4Input | null, trace: string[], warnings: string[]): number {
  const percent = clampPercent(raw?.productsAssessedPercent)
  if (percent == null) {
    warnings.push('Angiv andel af produkter/tjenester med risikovurdering (ESRS S4 datapunkt S4-2).')
    return 0
  }
  trace.push('productsAssessedPercent=' + percent)
  if (percent < s4.productsCoverageWarningPercent) {
    warnings.push(
      'Kun ' +
        percent +
        '% af produkterne er risikovurderet – udvid processerne for at dække hele porteføljen.'
    )
  }
  return normalisePercent(percent)
}

function resolveComplaintsScore(raw: S4Input | null, trace: string[], warnings: string[]): number {
  const percent = clampPercent(raw?.complaintsResolvedPercent)
  if (percent == null) {
    warnings.push('Angiv hvor stor en andel af klager der løses inden for SLA.')
    return 0.5
  }
  trace.push('complaintsResolvedPercent=' + percent)
  if (percent < s4.complaintResolutionWarningPercent) {
    warnings.push('Kun ' + percent + '% af klagerne løses rettidigt – styrk kundeserviceprocesser.')
  }
  return normalisePercent(percent)
}

function resolveMechanismScore(raw: S4Input | null, warnings: string[]): number {
  if (raw?.grievanceMechanismInPlace == null) {
    warnings.push('Angiv om der findes klagemekanisme for forbrugere/slutbrugere.')
    return 0.5
  }
  if (raw.grievanceMechanismInPlace === false) {
    warnings.push('Ingen klagemekanisme markeret. Etabler hotline eller digitale kontaktpunkter.')
    return 0
  }
  if (raw.escalationTimeframeDays != null && raw.escalationTimeframeDays > s4.escalationWarningDays) {
    warnings.push(
      'Behandlingstiden for klager er ' +
        raw.escalationTimeframeDays +
        ' dage – reducer til under ' +
        s4.escalationWarningDays +
        ' dage.'
    )
  }
  return 1
}

function resolveDataProtectionScore(raw: S4Input | null, trace: string[], warnings: string[]): number {
  const breaches = clampCount(raw?.dataBreachesCount)
  if (breaches == null) {
    warnings.push('Angiv antal registrerede brud på datasikkerhed (ESRS S4 datapunkt S4-4).')
    return 0.6
  }
  trace.push('dataBreachesCount=' + breaches)
  if (breaches > 0) {
    warnings.push(
      String(breaches) +
        ' brud på datasikkerhed registreret – gennemgå kontroller og underret relevante myndigheder.'
    )
  }
  return Math.max(0, 1 - breaches * 0.15)
}

function computeIncidentPenalty(
  raw: S4Input | null,
  issues: NormalisedIssue[],
  trace: string[],
  warnings: string[]
): number {
  let penalty = 0

  issues.forEach((issue) => {
    const severity = issue.severityLevel ?? 'medium'
    const severityWeight = s4.severityWeights[severity]
    const statusMultiplier = resolveStatusMultiplier(issue.remediationStatus)
    const ratio = resolveIssueScale(issue.usersAffected)

    penalty += severityWeight * statusMultiplier * ratio

    if (issue.severityLevel === 'high' && issue.remediationStatus !== 'completed') {
      warnings.push(
        'Højrisiko-hændelsen for ' +
          formatLabel(issue.productOrService ?? 'produkt') +
          ' er ikke fuldt afhjulpet.'
      )
    }

    if (issue.remediationStatus == null) {
      warnings.push(
        'Angiv remedieringsstatus for hændelsen på ' +
          formatLabel(issue.productOrService ?? 'produkt') +
          '.'
      )
    }

    if (issue.usersAffected != null) {
      trace.push('usersAffected[' + issue.index + ']=' + issue.usersAffected)
      if (issue.usersAffected >= 500) {
        warnings.push(
          issue.usersAffected +
            ' brugere påvirket af ' +
            formatLabel(issue.productOrService ?? 'produkt') +
            ' – beskriv tilbagekaldelse og kompensation.'
        )
      }
    }

    trace.push(
      'issue[' +
        issue.index +
        ']=' +
        formatLabel(issue.productOrService ?? issue.market ?? 'ukendt') +
        '|type=' +
        (issue.issueType ?? 'null') +
        '|severity=' +
        (issue.severityLevel ?? 'null') +
        '|status=' +
        (issue.remediationStatus ?? 'null') +
        '|users=' +
        (issue.usersAffected ?? 'null')
    )
  })

  return penalty
}

function computeAdditionalPenalty(raw: S4Input | null, trace: string[], warnings: string[]): number {
  const severe = clampCount(raw?.severeIncidentsCount) ?? 0
  const recalls = clampCount(raw?.recallsCount) ?? 0

  trace.push('severeIncidentsCount=' + severe)
  trace.push('recallsCount=' + recalls)

  if (severe > 0) {
    warnings.push(
      String(severe) +
        ' alvorlige hændelser rapporteret – offentliggør detaljer og kompensation.'
    )
  }

  if (recalls > 0) {
    warnings.push(
      String(recalls) +
        ' produkt-/service-recalls registreret. Sikr dokumentation for forløb og kommunikation.'
    )
  }

  return severe * (s4.defaultIncidentScale * 2) + recalls * 0.05
}

function normaliseIssues(rows: S4Input['issues']): NormalisedIssue[] {
  if (!Array.isArray(rows)) {
    return []
  }

  return rows
    .map((row, index) => {
      if (row == null) {
        return null
      }

      return {
        index,
        productOrService: row.productOrService == null ? null : row.productOrService.trim() || null,
        market: row.market == null ? null : row.market.trim() || null,
        issueType: row.issueType ?? null,
        usersAffected: clampCount(row.usersAffected),
        severityLevel: row.severityLevel ?? null,
        remediationStatus: row.remediationStatus ?? null,
        description: row.description == null ? null : row.description.trim() || null
      }
    })
    .filter((row): row is NormalisedIssue => row != null)
}

function resolveStatusMultiplier(status: NormalisedStatus): number {
  if (status === 'completed') {
    return s4.resolvedMitigation
  }
  if (status === 'inProgress') {
    return s4.inProgressMitigation
  }
  return 1
}

function resolveIssueScale(usersAffected: number | null): number {
  if (usersAffected == null) {
    return s4.defaultIncidentScale
  }
  return Math.min(1, usersAffected / 1000)
}

function clampPercent(value: PercentLike): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null
  }
  const numeric = Number(value)
  return Math.max(0, Math.min(100, numeric))
}

function clampCount(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null
  }
  const numeric = Math.max(0, Math.floor(Number(value)))
  return Number.isFinite(numeric) ? numeric : null
}

function normalisePercent(value: number): number {
  return Math.max(0, Math.min(1, value / 100))
}

function hasNarrative(value: string | null | undefined): boolean {
  return value != null && value.trim().length >= 80
}

function formatLabel(label: string): string {
  return label.replaceAll('|', '/').replaceAll('\n', ' ').trim()
}
