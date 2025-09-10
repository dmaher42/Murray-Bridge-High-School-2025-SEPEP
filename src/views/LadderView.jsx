import React, { useMemo } from 'react';
import Section from '../components/Section.jsx';
import Table from '../components/Table.jsx';
import { computeLadder, computeNeighbourhoodTotals } from '../utils/helpers.js';

export default function LadderView({ division, data }) {
  const teams = data.teams.filter(t => t.division === division);
  const fixtures = data.fixtures.filter(f => f.division === division);
  const results = data.results;
  const ladder = useMemo(() => teams.length ? computeLadder(teams, fixtures, results) : [], [teams, fixtures, results]);
  const neighbourhoods = useMemo(() => teams.length ? computeNeighbourhoodTotals(teams, results, fixtures) : [], [teams, results, fixtures]);
  return (
    <div className="grid gap-6">
      <Section title="Ladder">
        <Table caption={`League ladder for ${division} division`} columns={[
          { key: 'pos', header: 'Pos', cell: (_, i) => i + 1 },
          { key: 'team', header: 'Team', cell: r => r.team.name },
          { key: 'P', header: 'P' },
          { key: 'W', header: 'W' },
          { key: 'D', header: 'D' },
          { key: 'L', header: 'L' },
          { key: 'PF', header: 'PF' },
          { key: 'PA', header: 'PA' },
          { key: 'PTS', header: 'PTS' },
          { key: '%', header: '%' },
        ]} rows={ladder} rowKey={r => r.team.id} />
        {ladder.length === 0 && <p className="text-slate-500 text-center py-8">No games played yet. Add some fixtures and results to see the ladder.</p>}
      </Section>
      <Section title="Neighbourhood Totals">
        <Table caption={`Neighbourhood performance totals for ${division} division`} columns={[
          { key: 'neighbourhood', header: 'Neighbourhood' },
          { key: 'Wins', header: 'W' },
          { key: 'Losses', header: 'L' },
          { key: 'Draws', header: 'D' },
          { key: 'PF', header: 'PF' },
          { key: 'PA', header: 'PA' },
        ]} rows={neighbourhoods} />
        {neighbourhoods.length === 0 && <p className="text-slate-500 text-center py-8">No neighbourhood data available yet.</p>}
      </Section>
    </div>
  );
}
