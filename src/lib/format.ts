export function formatScore(home?: number | string, away?: number | string): string {
  const hasHome = home !== undefined && home !== null && home !== '';
  const hasAway = away !== undefined && away !== null && away !== '';
  return hasHome && hasAway ? `${home}-${away}` : 'TBD';
}
