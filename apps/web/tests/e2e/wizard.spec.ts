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
  await expect(page.getByRole('heading', { name: 'A1 – Scope 1 stationære forbrændingskilder' })).toBeVisible()
  await expect(page.getByText('Tilføj mindst én brændselslinje for at beregne Scope 1-emissioner.')).toBeVisible()
  await page.getByRole('button', { name: /A2 – Scope 1 mobile forbrændingskilder/ }).click()
  await expect(page.getByRole('heading', { name: 'A2 – Scope 1 mobile forbrændingskilder' })).toBeVisible()
  await expect(page.getByText('Tilføj mindst én køretøjslinje for at beregne Scope 1-emissioner.')).toBeVisible()
  await page.getByRole('button', { name: /A3 – Scope 1 procesemissioner/ }).click()
  await expect(page.getByRole('heading', { name: 'A3 – Scope 1 procesemissioner' })).toBeVisible()
  await expect(page.getByText('Tilføj mindst én proceslinje for at beregne Scope 1-emissioner.')).toBeVisible()
  await page.getByRole('button', { name: /A4 – Scope 1 flugtige emissioner/ }).click()
  await expect(page.getByRole('heading', { name: 'A4 – Scope 1 flugtige emissioner' })).toBeVisible()
  await expect(page.getByText('Tilføj mindst én kølemiddellinje for at beregne Scope 1-emissioner.')).toBeVisible()
  await page.getByRole('button', { name: /B1 – Scope 2 elforbrug/ }).click()
  await expect(page.getByRole('heading', { name: 'B1 – Scope 2 elforbrug' })).toBeVisible()
})
