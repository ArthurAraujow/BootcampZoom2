import { test, expect } from '@playwright/test';
import path from 'node:path';

const dist = path.resolve(__dirname, '..', 'dist');

test('extensão ajusta o zoom corretamente', async ({ context }) => {
  // Abre uma página de teste
  const page = await context.newPage();
  await page.goto('https://example.com');

  // Obtém o background page (service worker) para pegar o ID da extensão
  let background = await context.serviceWorkers()[0];
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }
  const extensionId = background.url().split('/')[2]; // Extrai ID da URL do worker

  // Abre o popup da extensão
  const popupPage = await context.newPage();
  await popupPage.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

  // Verifica se o popup carrega
  await expect(popupPage.locator('#zoomIn')).toBeVisible();
  await expect(popupPage.locator('#zoomOut')).toBeVisible();
  await expect(popupPage.locator('#resetZoom')).toBeVisible();

  // Testa zoom in: Clique no botão e verifica o zoom na página principal
  await popupPage.click('#zoomIn');
  await page.bringToFront();
  const zoomAfterIn = await page.evaluate(() => document.documentElement.getBoundingClientRect().width / window.innerWidth);
  expect(zoomAfterIn).toBeCloseTo(1.1, 1); // +10%

  // Testa zoom out
  await popupPage.bringToFront();
  await popupPage.click('#zoomOut');
  await page.bringToFront();
  const zoomAfterOut = await page.evaluate(() => document.documentElement.getBoundingClientRect().width / window.innerWidth);
  expect(zoomAfterOut).toBeCloseTo(1.0, 1); // Volta para ~1

  // Testa reset
  await popupPage.bringToFront();
  await popupPage.click('#zoomIn'); // Aumenta de novo
  await popupPage.click('#resetZoom');
  await page.bringToFront();
  const zoomAfterReset = await page.evaluate(() => document.documentElement.getBoundingClientRect().width / window.innerWidth);
  expect(zoomAfterReset).toBe(1);
});