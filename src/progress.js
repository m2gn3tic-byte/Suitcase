import { LEVEL_COUNT, getLevel, getDailyLevel, validatePlacement } from './engine.js';

export const STORAGE = 'mahub-kull-v1';
export const MAX_BACKUP_BYTES = 1024 * 1024;
const FORMAT = 'mahub-kull-progress';
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const counter = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/** Read only known fields and legal placements, including older local saves. */
export function normalizeProgress(value) {
  const saved = isRecord(value) ? value : {};
  const completed = Array.isArray(saved.completed)
    ? [...new Set(saved.completed.filter(n => Number.isInteger(n) && n >= 0 && n < LEVEL_COUNT))].sort((a,b) => a-b) : [];
  const unlocked = Math.min(LEVEL_COUNT-1, Math.max(-1, ...completed)+1);
  const current = Number.isInteger(saved.current) && saved.current >= 0
    ? Math.min(saved.current, unlocked) : 0;
  const games = {};
  for (const [id, game] of Object.entries(isRecord(saved.games) ? saved.games : {})) {
    if (!isRecord(game)) continue;
    let level;
    const match = /^level-([1-9]\d?)$/.exec(id);
    if (match && Number(match[1]) <= LEVEL_COUNT) level = getLevel(Number(match[1])-1);
    else if (id.startsWith('daily-') && validDate(id.slice(6))) level = getDailyLevel(id.slice(6));
    else continue;
    if (game.revision !== level.revision) continue;
    const placements = {};
    if (isRecord(game.placements)) {
      for (const piece of level.pieces) {
        const p = game.placements[piece.id];
        if (isRecord(p) && validatePlacement(level, placements, piece.id, p.x, p.y, p.rotation)) {
          const rotation = p.rotation ?? 0;
          placements[piece.id] = {x:p.x, y:p.y,
            rotation:rotation > 0 && rotation < 4 ? rotation*90 : ((rotation%360)+360)%360};
        }
      }
    }
    games[id] = {revision:level.revision, placements, moves:counter(game.moves), hints:counter(game.hints)};
  }
  return {completed, current, games, sound:saved.sound !== false, daily:validDate(saved.daily) ? saved.daily : ''};
}

export function createProgressBackup(progress, date = new Date()) {
  return JSON.stringify({format:FORMAT, version:1, exportedAt:date.toISOString(),
    progress:normalizeProgress(progress)}, null, 2);
}

export function readProgressBackup(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) {
    throw new Error('Varukoopia on liiga suur. Vali kuni 1 MB JSON-fail.');
  }
  let backup;
  try { backup = JSON.parse(text); }
  catch { throw new Error('Faili ei õnnestu lugeda. Vali mängust salvestatud JSON-varukoopia.'); }
  if (!isRecord(backup) || backup.format !== FORMAT) throw new Error('See fail ei ole Mahub küll! edenemise varukoopia.');
  if (backup.version !== 1) throw new Error('See varukoopia vajab mängu uuemat versiooni.');
  const p = backup.progress;
  if (!isRecord(p) || !Array.isArray(p.completed) || !Number.isInteger(p.current) || !isRecord(p.games)) {
    throw new Error('Varukoopia on puudulik. Praegune edenemine jääb alles.');
  }
  return normalizeProgress(p);
}

/** Keep all achievements; imported partial games replace matching local games. */
export function mergeProgress(current, incoming) {
  const local = normalizeProgress(current), restored = normalizeProgress(incoming);
  return normalizeProgress({
    completed:[...local.completed, ...restored.completed],
    current:Math.max(local.current, restored.current),
    games:{...local.games, ...restored.games}, sound:restored.sound,
    daily:[local.daily, restored.daily].sort().at(-1),
  });
}
