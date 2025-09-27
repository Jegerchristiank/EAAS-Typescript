/**
 * Playwright placeholder-test for det centrale wizard-flow.
 */
import { test, expect } from '@playwright/test'

test('kan starte wizard og se første trin', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.getByRole('link', { name: 'Start beregning' }).click()
  await expect(page.getByRole('heading', { name: 'Modul B1' })).toBeVisible()
})
