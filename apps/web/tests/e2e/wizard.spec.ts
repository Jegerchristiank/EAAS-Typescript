/**
 * Playwright placeholder-test for det centrale wizard-flow.
 */
import { test, expect } from '@playwright/test'

test('kan starte wizard og se første trin', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.getByRole('link', { name: 'Start beregning' }).click()
  await expect(page.getByRole('heading', { name: 'ESG Wizard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Scope 1' })).toBeVisible()
  await page.getByRole('button', { name: /A1 – Scope 1 stationære forbrændingskilder/ }).click()
  await expect(page.getByText('Planlagt modul')).toBeVisible()
  await page.getByRole('button', { name: /B1 – Scope 2 elforbrug/ }).click()
  await expect(page.getByRole('heading', { name: 'B1 – Scope 2 elforbrug' })).toBeVisible()
})
