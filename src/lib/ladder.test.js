import assert from 'assert';
import { computeLadder } from './ladder.js';

const teams = [
  { id: 'A01', name: 'Kestrels' },
  { id: 'A02', name: 'Falcons' }
];

const fixtures = [
  { id: 'R1M1', home: 'A01', away: 'A02' },
  { id: 'R2M1', home: 'A02', away: 'A01' }
];

const results = [
  { matchId: 'R1M1', homeScore: 10, awayScore: 8 },
  { matchId: 'R2M1', homeScore: 12, awayScore: 6 }
];

const ladder = computeLadder(teams, fixtures, results);
assert.strictEqual(ladder[0].teamId, 'A02');
assert.strictEqual(ladder[0].PD, 4);
assert.strictEqual(ladder[1].PD, -4);
assert.strictEqual(ladder[0].Pts, ladder[1].Pts);
console.log('ladder tests passed');
