export function validateTeam(team) {
  const errors = {};
  if (!team.name?.trim()) errors.name = 'Team name is required';
  if (!team.coach?.trim()) errors.coach = 'Coach name is required';
  if (team.name && team.name.length > 50) errors.name = 'Team name too long (max 50 chars)';
  if (team.coach && team.coach.length > 50) errors.coach = 'Coach name too long (max 50 chars)';
  return errors;
}

export function validateFixture(fixture, existingFixtures = []) {
  const errors = {};
  if (!fixture.round?.trim()) errors.round = 'Round is required';
  if (!fixture.date) errors.date = 'Date is required';
  if (!fixture.time) errors.time = 'Time is required';
  if (!fixture.court?.trim()) errors.court = 'Court is required';
  if (!fixture.homeId) errors.homeId = 'Home team is required';
  if (!fixture.awayId) errors.awayId = 'Away team is required';
  if (fixture.homeId === fixture.awayId && fixture.homeId) errors.awayId = 'Teams cannot play themselves';
  const conflict = existingFixtures.find(f => f.id !== fixture.id && f.date === fixture.date && f.time === fixture.time && f.court === fixture.court);
  if (conflict) errors.time = 'Time conflict with existing fixture';
  return errors;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}
