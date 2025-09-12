import assert from 'assert';
import { computeLadder } from './ladder.js';

// basic scenario
(() => {
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
})();

// tied points with varying percentages
(() => {
  const teams = [
    { id: 'T1', name: 'Team 1' },
    { id: 'T2', name: 'Team 2' },
    { id: 'T3', name: 'Team 3' }
  ];

  const fixtures = [
    { id: 'M1', home: 'T1', away: 'T3' },
    { id: 'M2', home: 'T2', away: 'T3' },
    { id: 'M3', home: 'T1', away: 'T2' }
  ];

  const results = [
    { matchId: 'M1', homeScore: 30, awayScore: 20 },
    { matchId: 'M2', homeScore: 40, awayScore: 30 },
    { matchId: 'M3', homeScore: 20, awayScore: 20 }
  ];

  const ladder = computeLadder(teams, fixtures, results);
  // T1 and T2 tied on points and PD but T1 has higher percentage
  assert.strictEqual(ladder[0].teamId, 'T1');
  assert.strictEqual(ladder[1].teamId, 'T2');
  assert.strictEqual(ladder[0].Pts, ladder[1].Pts);
  assert.strictEqual(ladder[0].PD, ladder[1].PD);
  assert(ladder[0]['%'] > ladder[1]['%']);
})();

// ordering when teams tied on points and percentage
(() => {
  const teams = [
    { id: 'X1', name: 'Alpha' },
    { id: 'X2', name: 'Beta' },
    { id: 'X3', name: 'Gamma' }
  ];

  const fixtures = [
    { id: 'N1', home: 'X1', away: 'X3' },
    { id: 'N2', home: 'X2', away: 'X3' },
    { id: 'N3', home: 'X1', away: 'X2' }
  ];

  const results = [
    { matchId: 'N1', homeScore: 40, awayScore: 20 },
    { matchId: 'N2', homeScore: 10, awayScore: 0 },
    { matchId: 'N3', homeScore: 20, awayScore: 20 }
  ];

  const ladder = computeLadder(teams, fixtures, results);
  // X1 and X2 tied on points and percentage; PD decides order
  assert.strictEqual(ladder[0].teamId, 'X1');
  assert.strictEqual(ladder[1].teamId, 'X2');
  assert.strictEqual(ladder[0].Pts, ladder[1].Pts);
  assert.strictEqual(ladder[0]['%'], ladder[1]['%']);
  assert(ladder[0].PD > ladder[1].PD);
})();

// missing fixtures ignored
(() => {
  const teams = [
    { id: 'A01', name: 'Kestrels' },
    { id: 'A02', name: 'Falcons' }
  ];

  const fixtures = [
    { id: 'R1', home: 'A01', away: 'A02' }
  ];

  const results = [
    { matchId: 'R1', homeScore: 10, awayScore: 8 },
    { matchId: 'UNKNOWN', homeScore: 5, awayScore: 5 }
  ];

  const ladder = computeLadder(teams, fixtures, results);
  const kestrels = ladder.find(t => t.teamId === 'A01');
  const falcons = ladder.find(t => t.teamId === 'A02');
  assert.strictEqual(kestrels.GP, 1);
  assert.strictEqual(falcons.GP, 1);
  assert.strictEqual(kestrels.Pts, 2);
  assert.strictEqual(falcons.Pts, 0);
})();

console.log('ladder tests passed');
