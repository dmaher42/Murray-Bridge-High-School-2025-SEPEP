import { getFixtures, getTeams, getResults, saveFixtures } from './dataApi.js';
import { computeLadder } from './ladder.js';

function showSection(id) {
  document.querySelectorAll('main section').forEach(sec => {
    sec.hidden = sec.id !== id;
  });
}

async function renderFixtures() {
  const rounds = await getFixtures();
  const container = document.getElementById('fixtures-list');
  if (!container) return;
  container.innerHTML = '';
  rounds.forEach(r => {
    const div = document.createElement('div');
    div.className = 'rounded-2xl overflow-hidden ring-1 ring-black/5';
    div.innerHTML = `
      <div class="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 uppercase text-xs tracking-wide">Round ${r.round} – ${r.date}</div>
      <ul class="divide-y divide-slate-200/60 dark:divide-slate-800">
        ${r.matches.map(m => `
          <li class="p-4 flex items-center justify-between">
            <span class="font-medium text-slate-900 dark:text-slate-100">${m.home} vs ${m.away}</span>
            <span class="flex items-center gap-2 text-sm text-slate-500">${m.venue} ${m.time}
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-slate-50 text-slate-900 ring-slate-200">Scheduled</span>
            </span>
          </li>
        `).join('')}
      </ul>`;
    container.appendChild(div);
  });
}

async function renderLadder() {
  const teams = (await getTeams())[0]?.teams || [];
  const fixtures = (await getFixtures()).flatMap(r => r?.matches || []);
  const results = (await getResults()).results || [];
  const rows = computeLadder(teams, fixtures, results);
  const tbody = document.querySelector('#ladder-table tbody');
  if (!tbody) return;
  tbody.innerHTML = rows.map(r => `
    <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.name}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.GP}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.W}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.L}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.D}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.PF}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.PA}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r.Pts}</td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${r['%']}</td>
    </tr>
  `).join('');
}

function initials(name = '') {
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

async function renderTeams() {
  const divisions = await getTeams();
  const container = document.getElementById('teams-list');
  if (!container) return;
  container.innerHTML = '';
  divisions.forEach(d => {
    const div = document.createElement('div');
    div.className = 'space-y-4';
    const teamsHtml = d.teams.map(t => `
      <div class="rounded-2xl ring-1 ring-black/5 p-5 bg-white/80 dark:bg-slate-900/60">
        <div class="font-medium text-slate-900 dark:text-slate-100">${t.name}</div>
        <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">Coach ${t.coach}</div>
        ${t.players && t.players.length ? `
          <div class="mt-4 flex -space-x-2 overflow-hidden">
            ${t.players.slice(0,6).map(p => p.photo ?
              `<img src="${p.photo}" alt="${p.name}" class="h-8 w-8 rounded-full object-cover ring-2 ring-white">` :
              `<span class="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-medium text-slate-700 ring-2 ring-white">${initials(p.name)}</span>`
            ).join('')}
          </div>` : ''}
      </div>`).join('');
    div.innerHTML = `
      <h3 class="text-xl font-semibold text-slate-900 dark:text-white">${d.name}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${teamsHtml}</div>`;
    container.appendChild(div);
  });
}

function setupAdmin() {
  const exportBtn = document.getElementById('export-results');
  const uploadInput = document.getElementById('fixtures-upload');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const data = await getResults();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'results.json';
      a.click();
    });
  }
  if (uploadInput) {
    uploadInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const json = JSON.parse(evt.target.result);
          const rounds = json.rounds ?? [];
          saveFixtures(rounds);
          alert('Fixtures uploaded');
        } catch {
          alert('Invalid fixtures file');
        }
      };
      reader.readAsText(file);
    });
  }
}

function onHash() {
  const id = window.location.hash.replace('#', '') || 'dashboard';
  showSection(id);
  if (id === 'fixtures') renderFixtures();
  if (id === 'ladder') renderLadder();
  if (id === 'teams') renderTeams();
}

window.addEventListener('hashchange', onHash);
onHash();
setupAdmin();
