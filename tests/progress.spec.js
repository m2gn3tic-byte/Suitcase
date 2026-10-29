import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { getLevel } from '../src/engine.js';
import { STORAGE, MAX_BACKUP_BYTES, createProgressBackup } from '../src/progress.js';

const state = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE);
async function openBackup(page) {
  await page.getByRole('button', {name:'Vali tase', exact:true}).click();
  await page.getByRole('button', {name:'Edenemise varukoopia', exact:true}).click();
}
const upload = (page, text) => page.getByLabel('Taasta varasemast failist').setInputFiles({
  name:'edenemine.json',mimeType:'application/json',buffer:Buffer.from(text),
});

test('a downloaded backup moves a real partial journey to the Suitcase origin and survives reload', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:'Lülita heli välja',exact:true}).click();
  for (let i=0;i<6 && await page.locator('.tray-piece').count();i++) await page.locator('[data-action="hint"]').click();
  await expect(page.getByRole('dialog')).toContainText('Mahubki küll!');
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-action="hint"]').click();
  const original = await state(page);
  await openBackup(page);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', {name:/Salvesta varukoopia/}).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/^Mahub-kull-edenemine-\d{4}-\d{2}-\d{2}\.json$/);
  const text = await readFile(await download.path(), 'utf8');
  expect(JSON.parse(text).progress.completed).toEqual([0]);

  await page.goto('http://127.0.0.1:4273/Suitcase/');
  await expect(page.locator('.packed-piece')).toHaveCount(0);
  await openBackup(page);
  await upload(page, text);
  await expect(page.locator('#backup-status')).toContainText('pakitud 1 kohver');
  expect((await state(page)).completed).toEqual([]);
  await page.getByRole('button', {name:/Taasta varukoopia/}).click();
  await expect(page.getByRole('heading', {name:/Kohver 02/})).toBeVisible();
  await expect(page.locator('.packed-piece')).toHaveCount(1);
  await page.reload();
  expect(await state(page)).toEqual(original);
  await expect(page.locator('.packed-piece')).toHaveCount(1);
  await expect(page.getByRole('button', {name:'Lülita heli sisse',exact:true})).toBeVisible();
});

test('preview and cancel preserve the active game; restoring an older journey keeps newer achievements', async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({
    completed:[0,1,2], current:3,games:{},sound:false,
  })), STORAGE);
  await page.goto('/');
  await page.locator('[data-action="hint"]').click();
  const before = await state(page), level = getLevel(1), piece = level.pieces[0];
  const text = createProgressBackup({completed:[0],current:1,sound:false,games:{'level-2':{
    revision:level.revision,moves:1,hints:0,placements:{[piece.id]:level.solution[piece.id]},
  }}});
  await openBackup(page);
  await upload(page,text);
  await expect(page.getByRole('button', {name:/Taasta varukoopia/})).toBeVisible();
  expect(await state(page)).toEqual(before);
  await page.getByRole('button', {name:'Loobu taastamisest',exact:true}).click();
  expect(await state(page)).toEqual(before);
  await expect(page.locator('#backup-preview')).toBeHidden();
  await upload(page,text);
  await page.getByRole('button', {name:/Taasta varukoopia/}).click();
  await expect(page.getByRole('heading', {name:/Kohver 04/})).toBeVisible();
  await expect(page.locator('.packed-piece')).toHaveCount(1);
  const restored = await state(page);
  expect(restored.completed).toEqual([0,1,2]);
  expect(restored.games['level-4']).toEqual(before.games['level-4']);
  expect(restored.games['level-2'].placements).toEqual({[piece.id]:level.solution[piece.id]});
});

test('bad files and unavailable browser storage leave the current journey intact', async ({page}) => {
  await page.goto('/');
  await page.locator('[data-action="hint"]').click();
  const before = await state(page);
  await openBackup(page);
  await upload(page,'{"unrelated":true}');
  await expect(page.locator('#backup-status')).toContainText('ei ole Mahub küll!');
  await expect(page.locator('#backup-preview')).toBeHidden();
  await upload(page,' '.repeat(MAX_BACKUP_BYTES+1));
  await expect(page.locator('#backup-status')).toContainText('liiga suur');
  expect(await state(page)).toEqual(before);
  await upload(page,createProgressBackup({completed:[0,1],current:2,games:{}}));
  await expect(page.getByRole('button', {name:/Taasta varukoopia/})).toBeVisible();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable','QuotaExceededError'); }; });
  await page.getByRole('button', {name:/Taasta varukoopia/}).click();
  await expect(page.locator('#backup-status')).toContainText('Praegust mängu ei muudetud');
  expect(await state(page)).toEqual(before);
  await page.getByRole('button', {name:'Sulge',exact:true}).click();
  await expect(page.getByRole('heading', {name:/Kohver 01/})).toBeVisible();
  await expect(page.locator('.packed-piece')).toHaveCount(1);
});
