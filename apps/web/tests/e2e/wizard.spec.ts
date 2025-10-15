import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const PROFILE_KEYS = [
  'hasVehicles',
  'hasHeating',
  'hasIndustrialProcesses',
  'usesRefrigerants',
  'hasBackupPower',
  'hasOpenFlames',
  'hasLabGas',
  'usesElectricity',
  'usesDistrictHeating',
  'hasPpaContracts',
  'hasGuaranteesOfOrigin',
  'leasesWithOwnMeter',
  'exportsEnergy',
  'purchasesMaterials',
  'hasTransportSuppliers',
  'generatesWaste',
  'leasesEquipment',
  'shipsGoodsUpstream',
  'usesGlobalFreight',
  'hasConsultantsTravel',
  'purchasesElectronics',
  'producesProducts',
  'leasesProducts',
  'hasFranchisePartners',
  'providesCustomerServices',
  'hasProductRecycling',
  'shipsFinishedGoods',
  'usesLargeWaterVolumes',
  'hasIndustrialEmissions',
  'impactsNatureAreas',
  'managesCriticalMaterials',
  'hasInvestments',
  'ownsSubsidiaries',
  'operatesInternationalOffices',
  'hasEsgPolicy',
  'hasSupplierCode',
  'doesEsgReporting',
  'hasBoardOversight',
  'isIso14001Certified',
  'hasNetZeroTarget',
  'hasDataInfrastructure',
  'hasMaterialTopics',
  'hasMaterialRisks',
  'hasMaterialOpportunities',
  'hasCsrdGapAssessment',
  'hasTransitionPlan',
  'assessesClimateResilience',
  'tracksFinancialEffects',
  'hasRemovalProjects',
] as const

const COMPLETED_PROFILE = Object.fromEntries(PROFILE_KEYS.map((key) => [key, true])) as Record<string, boolean>

const COMPLETED_STORAGE = {
  activeProfileId: 'e2e-profile',
  profiles: {
    'e2e-profile': {
      id: 'e2e-profile',
      name: 'E2E profil',
      state: {},
      profile: COMPLETED_PROFILE,
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      history: {},
      responsibilities: {},
      version: 1,
    },
  },
}

async function stubWizardSnapshot(page: Page) {
  await page.route('**/wizard/snapshot', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          storage: COMPLETED_STORAGE,
          auditLog: [],
          permissions: { canEdit: true, canPublish: false },
          user: { id: 'e2e-user', roles: [] },
        }),
      })
      return
    }

    if (method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          storage: COMPLETED_STORAGE,
          auditLog: [],
          permissions: { canEdit: true, canPublish: false },
          user: { id: 'e2e-user', roles: [] },
        }),
      })
      return
    }

    await route.fallback()
  })
}

async function openWizard(page: Page) {
  await stubWizardSnapshot(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Ny profil' }).click()
  await expect(page.getByRole('heading', { name: 'ESG-beregninger' })).toBeVisible()
  await expect(page.getByTestId('wizard-top-nav')).toBeVisible()
}

test.describe('Wizard layout', () => {
  test('kan starte wizard og navigere mellem moduler', async ({ page }) => {
    await openWizard(page)

    const scopeTwoButton = page
      .getByTestId('wizard-navigation')
      .getByRole('button', { name: /B1 – Scope 2 elforbrug/ })
    await expect(scopeTwoButton).toBeVisible()
    await expect(scopeTwoButton).toHaveAttribute('data-active', 'true')

    const scopeOneButton = page
      .getByTestId('wizard-navigation')
      .getByRole('button', { name: /A1 – Scope 1 stationære forbrændingskilder/ })
    await expect(scopeOneButton).toBeVisible()
    await scopeOneButton.click()
    await expect(scopeOneButton).toHaveAttribute('data-active', 'true')
    await expect(scopeTwoButton).not.toHaveAttribute('data-active', 'true')

    const recommendedButton = page
      .getByTestId('wizard-navigation')
      .getByRole('button', { name: /B1 – Scope 2 elforbrug/ })
    await recommendedButton.click()
    await expect(recommendedButton).toHaveAttribute('data-active', 'true')
  })

  test('mobil navigation kan åbnes som slide-in med aktiv overlay', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await openWizard(page)

    const navigationRoot = page.locator('.wizard-shell__navigation')
    await page.getByRole('button', { name: 'Moduloversigt' }).click()
    const navigation = page.getByTestId('wizard-navigation')

    await expect(navigationRoot).toHaveAttribute('data-open', 'true')
    await expect(navigation).toBeVisible()

    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="wizard-navigation"]')
      if (!panel) {
        return false
      }
      const rect = panel.getBoundingClientRect()
      return rect.left >= 0
    })

    const panelRect = await navigation.evaluate((element) => {
      const { left, right } = element.getBoundingClientRect()
      return { left, right }
    })
    expect(panelRect.left).toBeGreaterThanOrEqual(0)
    expect(panelRect.right - panelRect.left).toBeGreaterThan(200)

    const overlayStyles = await navigationRoot.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        pointerEvents: style.pointerEvents,
        opacity: parseFloat(style.opacity),
      }
    })
    expect(overlayStyles.pointerEvents).toBe('auto')
    expect(overlayStyles.opacity).toBeGreaterThan(0.9)

    await page.getByRole('button', { name: 'Luk' }).click()
    await expect(navigationRoot).not.toHaveAttribute('data-open', 'true')
    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="wizard-navigation"]')
      if (!panel) {
        return false
      }
      const rect = panel.getBoundingClientRect()
      return rect.right <= 2
    })
  })

  test('sticky top- og bottom-bar forbliver i viewporten ved scroll', async ({ page }) => {
    await openWizard(page)

    const topNav = page.getByTestId('wizard-top-nav')
    const navigation = page.getByTestId('wizard-navigation')
    const recommendedButton = navigation.getByRole('button', { name: /B1 – Scope 2 elforbrug/ })
    const bottomBar = page.locator('.wizard-shell__bottom-bar')

    await expect(recommendedButton).toHaveAttribute('data-active', 'true')
    await recommendedButton.click()
    await expect(recommendedButton).toHaveAttribute('data-active', 'true')

    const initialTopBox = await topNav.boundingBox()
    expect(initialTopBox).not.toBeNull()

    await page.evaluate(() => window.scrollBy(0, 200))

    const scrolledTopBox = await topNav.boundingBox()
    expect(scrolledTopBox).not.toBeNull()
    expect(Math.abs(scrolledTopBox!.y ?? 0)).toBeLessThan(2)

    await expect(bottomBar).toBeVisible()

    const viewportHeight = await page.evaluate(() => window.innerHeight)
    const rootFontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
    const expectedOffset = rootFontSize * 1.5
    const styles = await bottomBar.evaluate((element) => {
      const style = getComputedStyle(element)
      return { position: style.position, bottom: style.bottom }
    })
    expect(styles.position).toBe('sticky')
    expect(Math.abs(parseFloat(styles.bottom) - expectedOffset)).toBeLessThan(1)

    const rect = (await bottomBar.evaluate((element) => {
      const { top, bottom } = element.getBoundingClientRect()
      return { top, bottom }
    })) as { top: number; bottom: number }
    expect(rect.top).toBeGreaterThanOrEqual(0)
    expect(rect.bottom).toBeLessThanOrEqual(viewportHeight)
  })
})
