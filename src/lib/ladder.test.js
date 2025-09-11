import assert from 'assert';
import { computeLadder } from './ladder.js';

const teams = [
  { id: 'A01', name: 'Kestrels' },
  { id: 'A02', name: 'Falcons' }
];

const fixtures = [
  { id: 'R1M1', home: 'A01', away: 'A02' }
];

const results = [
  { matchId: 'R1M1', homeScore: 10, awayScore: 8 }
];

const ladder = computeLadder(teams, fixtures, results);
assert.strictEqual(ladder[0].teamId, 'A01');
assert.strictEqual(ladder[0].W, 1);
assert.strictEqual(ladder[1].L, 1);
console.log('ladder tests passed');
