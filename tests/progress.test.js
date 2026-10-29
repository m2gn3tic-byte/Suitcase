import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, getDailyLevel } from '../src/engine.js';
import { MAX_BACKUP_BYTES, normalizeProgress, createProgressBackup, readProgressBackup, mergeProgress } from '../src/progress.js';

const partial = level => ({revision:level.revision, moves:3, hints:1,
  placements:{[level.pieces[0].id]:level.solution[level.pieces[0].id]}});

test('backup round trip retains achievements, campaign and daily placements, and preferences', () => {
  const daily = getDailyLevel('2026-10-29');
  const progress = {completed:[0,1], current:2, sound:false, daily:'2026-10-28',
    games:{'level-3':partial(getLevel(2)), [daily.id]:partial(daily)}};
  const text = createProgressBackup(progress, new Date('2026-10-29T10:00:00Z'));
  assert.equal(JSON.parse(text).exportedAt, '2026-10-29T10:00:00.000Z');
  assert.deepEqual(readProgressBackup(text), progress);
});

test('corrupt, unrelated, future and oversized files are rejected before restore', () => {
  for (const text of ['{', 'null', '[]', '{"completed":[0]}']) assert.throws(() => readProgressBackup(text));
  const backup = JSON.parse(createProgressBackup({}));
  assert.throws(() => readProgressBackup(JSON.stringify({...backup, version:2})), /uuemat/);
  assert.throws(() => readProgressBackup(JSON.stringify({...backup, progress:{}})), /puudulik/);
  assert.throws(() => readProgressBackup(' '.repeat(MAX_BACKUP_BYTES+1)), /liiga suur/);
  assert.throws(() => readProgressBackup('õ'.repeat(MAX_BACKUP_BYTES/2+1)), /liiga suur/);
});

test('imported coordinates cannot overlap, leave the board, or inject unknown games', () => {
  const level = getLevel(0), [first, second, third] = level.pieces;
  const progress = normalizeProgress({completed:[0,0,-1,24,'2'], current:23, daily:'2026-02-30',
    games:{'level-1':{revision:2,moves:-5,hints:Infinity,placements:{
      [first.id]:level.solution[first.id], [second.id]:level.solution[first.id],
      [third.id]:{x:100,y:0,rotation:0}, unknown:{x:0,y:0,rotation:0},
    }}, 'level-0':{}, 'level-25':{}, 'daily-2026-02-30':{}, constructor:{},
      'level-2':{revision:1, placements:level.solution}}});
  assert.deepEqual(progress.completed, [0]);
  assert.equal(progress.current, 1);
  assert.equal(progress.daily, '');
  assert.deepEqual(Object.keys(progress.games), ['level-1']);
  assert.deepEqual(progress.games['level-1'], {revision:2, moves:0,hints:0,
    placements:{[first.id]:level.solution[first.id]}});
  assert.equal({}.polluted, undefined);
});

test('restore merges both journeys and keeps the more advanced local level and daily achievement', () => {
  const local = {completed:[0,1,2,3], current:4, sound:true, daily:'2026-10-29',
    games:{'level-5':partial(getLevel(4)), 'level-2':partial(getLevel(1))}};
  const incoming = {completed:[0,1,5], current:6, sound:false, daily:'2026-10-28',
    games:{'level-2':{revision:2,placements:{},moves:0,hints:0}}};
  const before = structuredClone(local);
  const restored = mergeProgress(local, incoming);
  assert.deepEqual(local, before);
  assert.deepEqual(restored.completed, [0,1,2,3,5]);
  assert.equal(restored.current, 6);
  assert.equal(restored.daily, '2026-10-29');
  assert.equal(restored.sound, false);
  assert.deepEqual(restored.games['level-5'], local.games['level-5']);
  assert.deepEqual(restored.games['level-2'].placements, {});
  assert.equal(mergeProgress(local, {completed:[0],current:1}).current, 4);
});

test('layout migrations preserve completed levels and discard stale or malformed placements', () => {
  const normalized = normalizeProgress({completed:[0,1,2], current:3, sound:false,
    games:{'level-4':{moves:50,hints:10,placements:{bad:{x:0,y:0}}}}});
  assert.deepEqual(normalized.completed, [0,1,2]);
  assert.equal(normalized.current, 3);
  assert.deepEqual(normalized.games, {});
  assert.equal(normalized.sound, false);
  for (const invalid of [null, [], 'text', 3]) assert.deepEqual(normalizeProgress(invalid),
    {completed:[],current:0,games:{},sound:true,daily:''});
});
