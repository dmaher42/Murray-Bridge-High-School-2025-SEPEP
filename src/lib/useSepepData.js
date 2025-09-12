import { useEffect, useState } from 'react';
import { parseScoreboard, parseFixtures } from './sepepData.js';

export function useSepepData() {
  const [fixtures, setFixtures] = useState([]);
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [fixturesRaw, resultsRaw] = await Promise.all([
          fetch('/data/fixtures.json').then(res => res.json()),
          fetch('/data/results.json').then(res => res.json()),
        ]);
        setFixtures(parseFixtures(fixturesRaw));
        setScoreboard(parseScoreboard(resultsRaw));
      } catch (err) {
        console.error('Failed to load SEPEP data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { fixtures, scoreboard, loading };
}
