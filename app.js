'use strict';

/* =========================================================================
   SV Menden U19/2 – Trainer App
   Alles läuft lokal im Browser (localStorage). Keine Server, keine Logins.
   ========================================================================= */

/* ---------------------------- Konstanten ------------------------------- */

const DB_KEY = 'svmU19TrainerDB';
const DB_VERSION = 1;

const POSITIONS = ['TW','IV','LV','RV','DM','ZM','OM','LM','RM','LF','RF','ST'];
const GROUP_OF = { TW:'TW', IV:'DEF', LV:'DEF', RV:'DEF', DM:'MID', ZM:'MID', OM:'MID', LM:'MID', RM:'MID', LF:'FWD', RF:'FWD', ST:'FWD' };
const GROUP_LABEL = { TW:'Torwart', DEF:'Verteidigung', MID:'Mittelfeld', FWD:'Sturm' };
const GROUP_ORDER = ['TW','DEF','MID','FWD'];

const CATEGORIES = ['Technik','Taktik','Fitness','Zweikampf','Mentalität','Verhalten','Position','Allgemein'];
const PRIORITIES = ['Hoch','Mittel','Niedrig'];
const PRIORITY_WEIGHT = { Hoch: 3, Mittel: 2, Niedrig: 1 };

const STATUS = {
  anwesend:       { label: 'Da',            cls: 'st-da' },
  abgesagt:       { label: 'Abgesagt',      cls: 'st-abgesagt' },
  unentschuldigt: { label: 'Unentsch.',     cls: 'st-unentsch' },
  offen:          { label: 'Offen',         cls: 'st-offen' },
};

// Formationsdefinitionen mit grafischen Positionen (x/y in %, y=0 Angriff, y=100 Torwart)
const FORMATIONS = {
  '5-4-1': { slots: [
    { key:'TW',  label:'TW',  group:'TW',  x:50, y:92 },
    { key:'LAV', label:'LAV', group:'DEF', x:8,  y:74, pref:['LV'] },
    { key:'LIV', label:'LIV', group:'DEF', x:30, y:80, pref:['IV'] },
    { key:'IV',  label:'IV',  group:'DEF', x:50, y:83, pref:['IV'] },
    { key:'RIV', label:'RIV', group:'DEF', x:70, y:80, pref:['IV'] },
    { key:'RAV', label:'RAV', group:'DEF', x:92, y:74, pref:['RV'] },
    { key:'LM',  label:'LM',  group:'MID', x:10, y:48, pref:['LM'] },
    { key:'ZM1', label:'ZM',  group:'MID', x:37, y:52, pref:['ZM','DM','OM'] },
    { key:'ZM2', label:'ZM',  group:'MID', x:63, y:52, pref:['ZM','DM','OM'] },
    { key:'RM',  label:'RM',  group:'MID', x:90, y:48, pref:['RM'] },
    { key:'ST',  label:'ST',  group:'FWD', x:50, y:16, pref:['ST'] },
  ]},
  '4-2-3-1': { slots: [
    { key:'TW',  label:'TW',  group:'TW',  x:50, y:92 },
    { key:'LV',  label:'LV',  group:'DEF', x:12, y:76, pref:['LV'] },
    { key:'IV1', label:'IV',  group:'DEF', x:37, y:80, pref:['IV'] },
    { key:'IV2', label:'IV',  group:'DEF', x:63, y:80, pref:['IV'] },
    { key:'RV',  label:'RV',  group:'DEF', x:88, y:76, pref:['RV'] },
    { key:'DM1', label:'DM',  group:'MID', x:35, y:60, pref:['DM'] },
    { key:'DM2', label:'DM',  group:'MID', x:65, y:60, pref:['DM'] },
    { key:'LM',  label:'LM',  group:'MID', x:10, y:36, pref:['LM'] },
    { key:'OM',  label:'OM',  group:'MID', x:50, y:34, pref:['OM'] },
    { key:'RM',  label:'RM',  group:'MID', x:90, y:36, pref:['RM'] },
    { key:'ST',  label:'ST',  group:'FWD', x:50, y:14, pref:['ST'] },
  ]},
  '5-2-1-2': { slots: [
    { key:'TW',  label:'TW',  group:'TW',  x:50, y:92 },
    { key:'LAV', label:'LAV', group:'DEF', x:8,  y:74, pref:['LV'] },
    { key:'LIV', label:'LIV', group:'DEF', x:30, y:80, pref:['IV'] },
    { key:'IV',  label:'IV',  group:'DEF', x:50, y:83, pref:['IV'] },
    { key:'RIV', label:'RIV', group:'DEF', x:70, y:80, pref:['IV'] },
    { key:'RAV', label:'RAV', group:'DEF', x:92, y:74, pref:['RV'] },
    { key:'DM1', label:'DM',  group:'MID', x:35, y:55, pref:['DM'] },
    { key:'DM2', label:'DM',  group:'MID', x:65, y:55, pref:['DM'] },
    { key:'OM',  label:'OM',  group:'MID', x:50, y:36, pref:['OM'] },
    { key:'ST1', label:'ST',  group:'FWD', x:35, y:14, pref:['ST'] },
    { key:'ST2', label:'ST',  group:'FWD', x:65, y:14, pref:['ST'] },
  ]},
  '3-5-2': { slots: [
    { key:'TW',  label:'TW',  group:'TW',  x:50, y:92 },
    { key:'IV1', label:'IV',  group:'DEF', x:30, y:80, pref:['IV'] },
    { key:'IV2', label:'IV',  group:'DEF', x:50, y:83, pref:['IV'] },
    { key:'IV3', label:'IV',  group:'DEF', x:70, y:80, pref:['IV'] },
    { key:'LM',  label:'LM',  group:'MID', x:8,  y:52, pref:['LM','LV'] },
    { key:'DM1', label:'DM',  group:'MID', x:37, y:58, pref:['DM'] },
    { key:'ZM',  label:'ZM',  group:'MID', x:50, y:48, pref:['ZM','DM','OM'] },
    { key:'DM2', label:'DM',  group:'MID', x:63, y:58, pref:['DM'] },
    { key:'RM',  label:'RM',  group:'MID', x:92, y:52, pref:['RM','RV'] },
    { key:'ST1', label:'ST',  group:'FWD', x:35, y:14, pref:['ST'] },
    { key:'ST2', label:'ST',  group:'FWD', x:65, y:14, pref:['ST'] },
  ]},
  '4-3-3': { slots: [
    { key:'TW',  label:'TW',  group:'TW',  x:50, y:92 },
    { key:'LV',  label:'LV',  group:'DEF', x:12, y:76, pref:['LV'] },
    { key:'IV1', label:'IV',  group:'DEF', x:37, y:80, pref:['IV'] },
    { key:'IV2', label:'IV',  group:'DEF', x:63, y:80, pref:['IV'] },
    { key:'RV',  label:'RV',  group:'DEF', x:88, y:76, pref:['RV'] },
    { key:'DM',  label:'DM',  group:'MID', x:50, y:60, pref:['DM'] },
    { key:'ZM1', label:'ZM',  group:'MID', x:26, y:46, pref:['ZM','OM'] },
    { key:'ZM2', label:'ZM',  group:'MID', x:74, y:46, pref:['ZM','OM'] },
    { key:'LF',  label:'LF',  group:'FWD', x:14, y:16, pref:['LF'] },
    { key:'ST',  label:'ST',  group:'FWD', x:50, y:10, pref:['ST'] },
    { key:'RF',  label:'RF',  group:'FWD', x:86, y:16, pref:['RF'] },
  ]},
};
const FORMATION_NAMES = Object.keys(FORMATIONS);

const SEED_PLAYERS = [
  ['p1','Lukas S.',2009,'TW',null],
  ['p2','Julius',2011,'TW',null],
  ['p3','Omar',2010,'IV',null],
  ['p4','Leon',2009,'IV',null],
  ['p5','Tim',2009,'IV','DM'],
  ['p6','Max P.',2010,'IV','DM'],
  ['p7','Anouar',2008,'IV',null],
  ['p8','Thilo',2009,'LV','LM'],
  ['p9','Mika',2010,'LV','IV'],
  ['p10','Phillip',2010,'RV','DM'],
  ['p11','Silas',2010,'RV','RM'],
  ['p12','Konrad',2010,'RV',null],
  ['p13','Max H.',2009,'DM',null],
  ['p14','Neo',2010,'DM','OM'],
  ['p15','Elias',2010,'OM','DM'],
  ['p16','Dominik',2009,'LF','RF'],
  ['p17','Till',2009,'RF',null],
  ['p18','Justus',2010,'ST','LF'],
  ['p19','Moritz',2010,'ST',null],
  ['p20','Veli',2009,'ST',null],
  ['p21','Ben',2010,'ST','OM'],
  ['p22','Lutalo',2010,'OM','DM'],
].map(([id,name,jahrgang,posPrimary,posSecondary]) => ({
  id, name, jahrgang, posPrimary, posSecondary, active: true,
  strength: '', devPoint: '', focus: ''
}));

/* ------------------------------ Storage --------------------------------- */

function freshDB() {
  return {
    version: DB_VERSION,
    players: SEED_PLAYERS.map(p => ({...p})),
    trainings: [],
    notes: [],
    matches: [],
    settings: {},
  };
}

function migrate(db) {
  if (!db.version) db.version = 1;
  // Zukünftige Migrationen hier einhängen, z.B.:
  // if (db.version < 2) { ...db.version = 2; }
  db.version = DB_VERSION;
  return db;
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return freshDB();
    let db = JSON.parse(raw);
    if (!db.players) return freshDB();
    db.players = db.players || [];
    db.trainings = db.trainings || [];
    db.notes = db.notes || [];
    db.matches = db.matches || [];
    db.settings = db.settings || {};
    return migrate(db);
  } catch (e) {
    console.error('DB Ladefehler, starte neu', e);
    return freshDB();
  }
}

let DB = loadDB();

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(DB));
  } catch (e) {
    alert('Speichern fehlgeschlagen: ' + e.message);
  }
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ------------------------------ Helpers ---------------------------------- */

function activePlayers() { return DB.players.filter(p => p.active); }
function playerById(id) { return DB.players.find(p => p.id === id); }
function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* --------------------- Statistik-Berechnungen ---------------------------- */

function trainingsForPlayer(playerId) {
  return DB.trainings
    .filter(t => t.attendance && Object.prototype.hasOwnProperty.call(t.attendance, playerId))
    .sort((a,b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}

function playerStats(playerId) {
  const list = trainingsForPlayer(playerId);
  const total = list.length;
  let anwesend = 0, abgesagt = 0, unentschuldigt = 0, offen = 0;
  list.forEach(t => {
    const s = t.attendance[playerId];
    if (s === 'anwesend') anwesend++;
    else if (s === 'abgesagt') abgesagt++;
    else if (s === 'unentschuldigt') unentschuldigt++;
    else offen++;
  });
  const quote = total > 0 ? Math.round((anwesend / total) * 100) : 0;

  const last5 = list.slice(-5);
  const last5Anwesend = last5.filter(t => t.attendance[playerId] === 'anwesend').length;
  const last5Quote = last5.length > 0 ? Math.round((last5Anwesend / last5.length) * 100) : null;

  let trend = '→';
  if (last5Quote != null) {
    if (last5Quote > quote + 5) trend = '↗';
    else if (last5Quote < quote - 5) trend = '↘';
  }

  return { total, anwesend, abgesagt, unentschuldigt, offen, quote, last5Quote, trend, list };
}

function matchStats(playerId) {
  const matches = DB.matches.filter(m => (m.kader || []).includes(playerId));
  let startelf = 0, eingewechselt = 0, bankOhne = 0, minuten = 0;
  matches.forEach(m => {
    const isStarter = Object.values(m.startElf || {}).includes(playerId);
    const min = (m.minutes && m.minutes[playerId]) || 0;
    minuten += min;
    if (isStarter) startelf++;
    else if (min > 0) eingewechselt++;
    else bankOhne++;
  });
  return { imKader: matches.length, startelf, eingewechselt, bankOhne, minuten };
}

function computeWarnings() {
  const warnings = [];
  activePlayers().forEach(p => {
    const s = playerStats(p.id);
    if (s.total < 2) return;
    const lastN = s.list.slice(-3);
    if (lastN.length === 3 && lastN.every(t => t.attendance[p.id] !== 'anwesend')) {
      warnings.push(`${p.name} – 3 Trainings in Folge nicht anwesend`);
    }
    const last5 = s.list.slice(-5);
    const unentsch5 = last5.filter(t => t.attendance[p.id] === 'unentschuldigt').length;
    if (unentsch5 >= 2) {
      warnings.push(`${p.name} – ${unentsch5}x unentschuldigt in den letzten ${last5.length} Trainings`);
    }
    if (s.total >= 3 && s.quote < 60) {
      warnings.push(`${p.name} – Trainingsbeteiligung unter 60 % (${s.quote} %)`);
    }
    if (s.last5Quote != null && s.total >= 5 && s.last5Quote < s.quote - 15) {
      warnings.push(`${p.name} – Trainingsbeteiligung zuletzt deutlich gesunken`);
    }
  });
  return warnings;
}

function teamQuote() {
  const players = activePlayers();
  const withData = players.map(p => playerStats(p.id)).filter(s => s.total > 0);
  if (withData.length === 0) return null;
  const sum = withData.reduce((a,s) => a + s.quote, 0);
  return Math.round(sum / withData.length);
}

function openNotesGrouped() {
  const groups = {};
  CATEGORIES.forEach(c => groups[c] = { weight: 0, count: 0, players: new Set() });
  DB.notes.filter(n => !n.done).forEach(n => {
    if (!groups[n.category]) groups[n.category] = { weight: 0, count: 0, players: new Set() };
    groups[n.category].weight += PRIORITY_WEIGHT[n.priority] || 1;
    groups[n.category].count += 1;
    const p = playerById(n.playerId);
    if (p) groups[n.category].players.add(p.name);
  });
  return Object.entries(groups)
    .filter(([,g]) => g.count > 0)
    .map(([cat,g]) => ({ category: cat, ...g, players: Array.from(g.players) }))
    .sort((a,b) => b.weight - a.weight);
}

function recommendedFocus() {
  const grouped = openNotesGrouped();
  if (grouped.length === 0) return null;
  return grouped.slice(0, 2).map(g => g.category).join(' / ');
}

/* --------------------------- Team-Generator ------------------------------ */

function effectivePosition(player, overrideMap) {
  const ov = overrideMap && overrideMap[player.id];
  if (ov === 'secondary' && player.posSecondary) return player.posSecondary;
  return player.posPrimary;
}

function generateTeams(presentIds, numTeams, overrideMap) {
  const players = presentIds.map(playerById).filter(Boolean);
  const teams = Array.from({length: numTeams}, () => []);
  let rot = 0;
  GROUP_ORDER.forEach(group => {
    const inGroup = players.filter(p => GROUP_OF[effectivePosition(p, overrideMap)] === group);
    const arr = shuffle(inGroup);
    arr.forEach((p, i) => {
      const pos = effectivePosition(p, overrideMap);
      teams[(i + rot) % numTeams].push({ id: p.id, name: p.name, pos });
    });
    rot = (rot + arr.length) % numTeams;
  });
  return teams;
}

/* ------------------------- Formation / Startelf --------------------------- */

function slotScore(slot, player, overridePos) {
  const pos = overridePos || player.posPrimary;
  const sec = player.posSecondary;
  if (slot.pref && slot.pref.includes(pos)) return 3;
  if (slot.pref && sec && slot.pref.includes(sec)) return 2;
  if (GROUP_OF[pos] === slot.group) return 1.5;
  if (sec && GROUP_OF[sec] === slot.group) return 1;
  return 0;
}

function autoArrangeStartXI(kaderIds, formationKey) {
  const formation = FORMATIONS[formationKey];
  const pool = kaderIds.map(playerById).filter(Boolean);
  const used = new Set();
  const startElf = {};
  // TW zuerst, dann DEF, MID, FWD priorisieren für bessere Passung
  const orderedSlots = formation.slots.slice().sort((a,b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
  orderedSlots.forEach(slot => {
    let best = null, bestScore = -1, bestQuote = -1;
    pool.forEach(p => {
      if (used.has(p.id)) return;
      const score = slotScore(slot, p);
      if (score <= 0) return;
      const q = playerStats(p.id).quote;
      if (score > bestScore || (score === bestScore && q > bestQuote)) {
        best = p; bestScore = score; bestQuote = q;
      }
    });
    if (best) { startElf[slot.key] = best.id; used.add(best.id); }
  });
  const bench = pool.filter(p => !used.has(p.id)).map(p => p.id);
  return { startElf, bench };
}

function autoSelectKaderAndXI(formationKey, kaderSize, availabilityMap) {
  const formation = FORMATIONS[formationKey];
  const candidates = activePlayers().filter(p => !availabilityMap || availabilityMap[p.id] !== false);
  const ranked = candidates.map(p => {
    const s = playerStats(p.id);
    return { p, quote: s.quote, unentsch: s.unentschuldigt, total: s.total };
  }).sort((a,b) => b.quote - a.quote || a.unentsch - b.unentsch || b.total - a.total);

  const needed = {};
  formation.slots.forEach(s => { needed[s.group] = (needed[s.group]||0) + 1; });

  const chosen = [];
  const chosenIds = new Set();
  GROUP_ORDER.forEach(group => {
    const need = needed[group] || 0;
    const fit = ranked.filter(r => !chosenIds.has(r.p.id) &&
      (GROUP_OF[r.p.posPrimary] === group || (r.p.posSecondary && GROUP_OF[r.p.posSecondary] === group)));
    fit.slice(0, need).forEach(r => { chosen.push(r.p); chosenIds.add(r.p.id); });
  });
  // Restplätze bis kaderSize mit bestplatzierten übrigen Spielern auffüllen
  ranked.forEach(r => {
    if (chosen.length >= kaderSize) return;
    if (!chosenIds.has(r.p.id)) { chosen.push(r.p); chosenIds.add(r.p.id); }
  });
  const kaderIds = chosen.slice(0, Math.max(kaderSize, 11)).map(p => p.id);
  const { startElf, bench } = autoArrangeStartXI(kaderIds, formationKey);
  return { kaderIds: kaderIds.slice(0, kaderSize), startElf, bench: bench.filter(id => kaderIds.slice(0,kaderSize).includes(id)) };
}

/* --------------------------------- State ---------------------------------- */

const state = {
  route: 'dashboard',
  params: {},
};

function nav(route, params = {}) {
  state.route = route;
  state.params = params;
  window.scrollTo(0, 0);
  render();
}

/* --------------------------------- Render ---------------------------------- */

const app = document.getElementById('app');

function render() {
  let html = '';
  switch (state.route) {
    case 'dashboard': html = viewDashboard(); break;
    case 'trainingList': html = viewTrainingList(); break;
    case 'trainingDetail': html = viewTrainingDetail(state.params.id); break;
    case 'teams': html = viewTeams(state.params.id); break;
    case 'players': html = viewPlayers(); break;
    case 'playerProfile': html = viewPlayerProfile(state.params.id); break;
    case 'playerForm': html = viewPlayerForm(state.params.id); break;
    case 'notes': html = viewNotes(); break;
    case 'noteForm': html = viewNoteForm(state.params.id, state.params.playerId); break;
    case 'matchList': html = viewMatchList(); break;
    case 'matchDetail': html = viewMatchDetail(state.params.id); break;
    case 'backup': html = viewBackup(); break;
    default: html = viewDashboard();
  }
  app.innerHTML = html;
  bindNav();
}

function bindNav() {
  document.querySelectorAll('.tabbar button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === topLevel(state.route));
  });
}
function topLevel(route) {
  if (['dashboard'].includes(route)) return 'dashboard';
  if (['trainingList','trainingDetail'].includes(route)) return 'trainingList';
  if (['teams'].includes(route)) return 'teams';
  if (['matchList','matchDetail'].includes(route)) return 'matchList';
  if (['players','playerProfile','playerForm'].includes(route)) return 'players';
  if (['notes','noteForm'].includes(route)) return 'notes';
  return route;
}

function header(title, backRoute, backParams) {
  return `
  <header class="topbar">
    ${backRoute ? `<button class="icon-btn" data-nav="${backRoute}" data-params='${esc(JSON.stringify(backParams||{}))}'>←</button>` : `<span class="icon-btn-spacer"></span>`}
    <h1>${esc(title)}</h1>
    <button class="icon-btn" data-nav="backup" title="Backup">⋮</button>
  </header>`;
}

function tabbar() {
  return `
  <nav class="tabbar">
    <button data-tab="dashboard" data-nav="dashboard"><span>🏠</span>Start</button>
    <button data-tab="trainingList" data-nav="trainingList"><span>📋</span>Training</button>
    <button data-tab="teams" data-nav="teams"><span>⚽</span>Teams</button>
    <button data-tab="matchList" data-nav="matchList"><span>🏟️</span>Spieltag</button>
    <button data-tab="players" data-nav="players"><span>👥</span>Spieler</button>
    <button data-tab="notes" data-nav="notes"><span>📝</span>Notizen</button>
  </nav>`;
}

/* ------------------------------- Dashboard --------------------------------- */

function viewDashboard() {
  const warnings = computeWarnings();
  const focus = recommendedFocus();
  const openImportant = DB.notes.filter(n => !n.done && n.priority === 'Hoch').length;
  const tq = teamQuote();

  return `
  <header class="topbar topbar--brand">
    <div class="brand">
      <div class="brand-badge">U19</div>
      <div>
        <h1>SV Menden U19/2</h1>
        <div class="brand-sub">Trainer-Cockpit</div>
      </div>
    </div>
    <button class="icon-btn" data-nav="backup" title="Backup">⋮</button>
  </header>
  <main class="content">
    <div class="grid2">
      <div class="stat-card"><div class="stat-num">${activePlayers().length}</div><div class="stat-label">Spieler</div></div>
      <div class="stat-card"><div class="stat-num">${DB.trainings.length}</div><div class="stat-label">Trainings erfasst</div></div>
      <div class="stat-card"><div class="stat-num">${openImportant}</div><div class="stat-label">Wichtige Notizen offen</div></div>
      <div class="stat-card"><div class="stat-num">${tq != null ? tq + ' %' : '–'}</div><div class="stat-label">Ø Trainingsbeteiligung</div></div>
    </div>

    ${focus ? `<div class="callout callout--blue">
      <div class="callout-title">Empfohlener Trainingsschwerpunkt</div>
      <div class="callout-body">${esc(focus)}</div>
    </div>` : ''}

    ${warnings.length ? `<div class="callout callout--warn">
      <div class="callout-title">Hinweise (${warnings.length})</div>
      <ul class="warn-list">${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>
    </div>` : ''}

    <div class="big-nav">
      <button class="big-btn" data-nav="trainingList">📋<span>Training</span></button>
      <button class="big-btn" data-nav="teams">⚽<span>Teams erstellen</span></button>
      <button class="big-btn" data-nav="matchList">🏟️<span>Spieltag</span></button>
      <button class="big-btn" data-nav="players">👥<span>Spieler</span></button>
      <button class="big-btn" data-nav="notes">📝<span>Notizen</span></button>
      <button class="big-btn" data-nav="backup">💾<span>Backup</span></button>
    </div>
  </main>
  ${tabbar()}`;
}

/* ------------------------------- Training ----------------------------------- */

function viewTrainingList() {
  const list = DB.trainings.slice().sort((a,b) => b.date < a.date ? -1 : b.date > a.date ? 1 : 0);
  return `
  ${header('Training')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-action="newTraining">+ Neues Training</button>
    <div class="list">
      ${list.length === 0 ? `<p class="empty">Noch keine Trainings erfasst.</p>` : list.map(t => {
        const counts = { anwesend:0, abgesagt:0, unentschuldigt:0, offen:0 };
        Object.values(t.attendance).forEach(s => counts[s] = (counts[s]||0)+1);
        return `
        <div class="card card-tap" data-nav="trainingDetail" data-params='{"id":"${t.id}"}'>
          <div class="card-title">${fmtDate(t.date)}</div>
          <div class="card-sub">
            <span class="dot dot-green"></span>${counts.anwesend} anwesend
            <span class="dot dot-yellow"></span>${counts.abgesagt} abgesagt
            <span class="dot dot-red"></span>${counts.unentschuldigt} unentschuldigt
          </div>
        </div>`;
      }).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewTrainingDetail(id) {
  const t = DB.trainings.find(x => x.id === id);
  if (!t) return viewTrainingList();
  const players = activePlayers().slice().sort((a,b) => a.name.localeCompare(b.name, 'de'));
  return `
  ${header(fmtDate(t.date), 'trainingList')}
  <main class="content">
    <div class="row-actions">
      <button class="btn btn-ghost" data-action="allAttendance" data-id="${t.id}" data-status="anwesend">Alle anwesend</button>
      <button class="btn btn-ghost" data-action="allAttendance" data-id="${t.id}" data-status="offen">Alle offen</button>
    </div>
    <div class="attend-list">
      ${players.map(p => {
        const s = t.attendance[p.id] || 'offen';
        return `
        <div class="attend-row">
          <div class="attend-name">${esc(p.name)}</div>
          <div class="attend-btns">
            ${Object.entries(STATUS).map(([key, meta]) => `
              <button class="status-btn ${meta.cls} ${s === key ? 'is-active' : ''}"
                data-action="setAttendance" data-id="${t.id}" data-player="${p.id}" data-status="${key}">${meta.label}</button>
            `).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <button class="btn btn-block" data-nav="teams" data-params='{"id":"${t.id}"}'>⚽ Teams aus diesem Training erstellen</button>
    <button class="btn btn-danger btn-block" data-action="deleteTraining" data-id="${t.id}">Training löschen</button>
  </main>
  ${tabbar()}`;
}

/* --------------------------------- Teams ------------------------------------ */

function viewTeams(trainingId) {
  const trainings = DB.trainings.slice().sort((a,b) => b.date < a.date ? -1 : b.date > a.date ? 1 : 0);
  const t = trainingId ? DB.trainings.find(x => x.id === trainingId) : trainings[0];

  if (!t) {
    return `${header('Teams erstellen')}
    <main class="content"><p class="empty">Erstelle zuerst ein Training mit Anwesenheit, um Teams zu bilden.</p>
    <button class="btn btn-primary btn-block" data-nav="trainingList">Zum Training</button></main>${tabbar()}`;
  }

  t.teamGen = t.teamGen || { numTeams: 2, posOverride: {}, teams: null };
  const presentIds = Object.entries(t.attendance).filter(([,s]) => s === 'anwesend').map(([id]) => id);
  const presentPlayers = presentIds.map(playerById).filter(Boolean);
  const withSecondary = presentPlayers.filter(p => p.posSecondary);

  const teamsHtml = t.teamGen.teams ? renderTeamsResult(t.teamGen.teams, t.date) : '';

  return `
  ${header('Teams erstellen', 'trainingDetail', {id:t.id})}
  <main class="content">
    <div class="select-row">
      <label>Training</label>
      <select data-action="chooseTraining">
        ${trainings.map(tr => `<option value="${tr.id}" ${tr.id===t.id?'selected':''}>${fmtDate(tr.date)}</option>`).join('')}
      </select>
    </div>
    <p class="muted">${presentPlayers.length} anwesende Spieler in diesem Training.</p>

    <div class="select-row">
      <label>Anzahl Teams</label>
      <div class="segmented">
        <button class="${t.teamGen.numTeams===2?'active':''}" data-action="setNumTeams" data-id="${t.id}" data-num="2">2 Teams</button>
        <button class="${t.teamGen.numTeams===3?'active':''}" data-action="setNumTeams" data-id="${t.id}" data-num="3">3 Teams</button>
      </div>
    </div>

    ${withSecondary.length ? `
    <details class="details-block">
      <summary>Positionen für heute anpassen (${withSecondary.length})</summary>
      ${withSecondary.map(p => {
        const ov = t.teamGen.posOverride[p.id] || 'primary';
        return `<div class="override-row">
          <span>${esc(p.name)}</span>
          <div class="segmented small">
            <button class="${ov==='primary'?'active':''}" data-action="setOverride" data-id="${t.id}" data-player="${p.id}" data-mode="primary">${p.posPrimary}</button>
            <button class="${ov==='secondary'?'active':''}" data-action="setOverride" data-id="${t.id}" data-player="${p.id}" data-mode="secondary">${p.posSecondary}</button>
          </div>
        </div>`;
      }).join('')}
    </details>` : ''}

    <button class="btn btn-primary btn-block" data-action="drawTeams" data-id="${t.id}" ${presentPlayers.length===0?'disabled':''}>Teams auslosen</button>
    ${t.teamGen.teams ? `<button class="btn btn-block" data-action="drawTeams" data-id="${t.id}">🔀 Neu auslosen</button>` : ''}
    ${t.teamGen.teams ? `<button class="btn btn-block" data-action="copyTeamsWhatsApp" data-id="${t.id}">📋 Für WhatsApp kopieren</button>` : ''}

    ${teamsHtml}

    ${t.teamGen.teams && t.teamGen.numTeams === 3 ? renderRotation() : ''}
  </main>
  ${tabbar()}`;
}

function renderTeamsResult(teams, date) {
  const letters = ['A','B','C'];
  return `<div class="team-grid">
    ${teams.map((team, i) => `
      <div class="team-card team-${letters[i]}">
        <div class="team-head">Team ${letters[i]}</div>
        ${team.map(pl => `<div class="team-player"><span class="pos-chip">${pl.pos}</span>${esc(pl.name)}</div>`).join('')}
      </div>
    `).join('')}
  </div>`;
}

function renderRotation() {
  return `
  <div class="callout callout--blue">
    <div class="callout-title">Rotation</div>
    <div>Runde 1: A gegen B — C Pause</div>
    <div>Runde 2: B gegen C — A Pause</div>
    <div>Runde 3: A gegen C — B Pause</div>
  </div>
  <div class="timer-box">
    <div class="timer-display" id="timerDisplay">06:00</div>
    <div class="row-actions">
      <input type="number" id="timerMinutes" value="6" min="1" max="30" class="timer-input">
      <span class="muted">Minuten</span>
    </div>
    <div class="row-actions">
      <button class="btn" data-action="timerStart">Start</button>
      <button class="btn" data-action="timerPause">Pause</button>
      <button class="btn" data-action="timerReset">Reset</button>
      <button class="btn btn-primary" data-action="timerNextRound">Nächste Runde</button>
    </div>
    <div class="muted" id="roundLabel">Runde 1</div>
  </div>`;
}

/* ------------------------------ Spieler -------------------------------------- */

function viewPlayers() {
  const players = DB.players.slice().sort((a,b) => (b.active - a.active) || a.name.localeCompare(b.name, 'de'));
  return `
  ${header('Spieler')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-nav="playerForm" data-params='{}'>+ Spieler hinzufügen</button>
    <div class="list">
      ${players.map(p => {
        const s = playerStats(p.id);
        return `
        <div class="card card-tap ${!p.active ? 'card-inactive' : ''}" data-nav="playerProfile" data-params='{"id":"${p.id}"}'>
          <div class="card-title">${esc(p.name)} ${!p.active ? '<span class="badge-off">inaktiv</span>' : ''}</div>
          <div class="card-sub">${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''} · Jg. ${p.jahrgang}</div>
          <div class="card-sub">Beteiligung: ${s.total ? s.quote + ' %' : '–'} ${s.last5Quote != null ? `· Letzte 5: ${s.last5Quote} % ${s.trend}` : ''}</div>
        </div>`;
      }).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewPlayerForm(id) {
  const p = id ? playerById(id) : null;
  return `
  ${header(p ? 'Spieler bearbeiten' : 'Spieler hinzufügen', 'players')}
  <main class="content">
    <form class="form" data-form="player" data-id="${p ? p.id : ''}">
      <label>Name</label>
      <input name="name" required value="${p ? esc(p.name) : ''}">
      <label>Jahrgang</label>
      <input name="jahrgang" type="number" required value="${p ? p.jahrgang : ''}">
      <label>Primärposition</label>
      <select name="posPrimary">${POSITIONS.map(pos => `<option value="${pos}" ${p && p.posPrimary===pos?'selected':''}>${pos}</option>`).join('')}</select>
      <label>Sekundärposition (optional)</label>
      <select name="posSecondary">
        <option value="">–</option>
        ${POSITIONS.map(pos => `<option value="${pos}" ${p && p.posSecondary===pos?'selected':''}>${pos}</option>`).join('')}
      </select>
      ${p ? `<label class="checkbox-row"><input type="checkbox" name="active" ${p.active?'checked':''}> Aktiv</label>` : ''}
      <button class="btn btn-primary btn-block" type="submit">Speichern</button>
      ${p ? `<button type="button" class="btn btn-danger btn-block" data-action="deletePlayer" data-id="${p.id}">Spieler löschen</button>` : ''}
    </form>
  </main>
  ${tabbar()}`;
}

function viewPlayerProfile(id) {
  const p = playerById(id);
  if (!p) return viewPlayers();
  const s = playerStats(p.id);
  const m = matchStats(p.id);
  const notes = DB.notes.filter(n => n.playerId === id).sort((a,b) => b.date < a.date ? -1 : 1);

  return `
  ${header(p.name, 'players')}
  <main class="content">
    <div class="profile-head">
      <div class="profile-avatar">${esc(p.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div>
      <div>
        <div class="profile-name">${esc(p.name)} ${!p.active?'<span class="badge-off">inaktiv</span>':''}</div>
        <div class="muted">Jg. ${p.jahrgang} · ${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''}</div>
      </div>
      <button class="icon-btn" data-nav="playerForm" data-params='{"id":"${p.id}"}'>✎</button>
    </div>

    <div class="grid2">
      <div class="stat-card"><div class="stat-num">${s.total}</div><div class="stat-label">Trainings</div></div>
      <div class="stat-card"><div class="stat-num">${s.quote}${s.total?' %':''}</div><div class="stat-label">Beteiligung</div></div>
      <div class="stat-card"><div class="stat-num">${s.last5Quote != null ? s.last5Quote + ' %' : '–'} ${s.trend}</div><div class="stat-label">Letzte 5</div></div>
      <div class="stat-card"><div class="stat-num">${s.unentschuldigt}</div><div class="stat-label">Unentschuldigt</div></div>
    </div>

    <div class="card">
      <div class="card-title">Trainingshistorie</div>
      <div class="card-sub">Anwesend: ${s.anwesend} · Abgesagt: ${s.abgesagt} · Unentsch.: ${s.unentschuldigt}</div>
    </div>

    <div class="card">
      <div class="card-title">Spieleinsätze</div>
      <div class="card-sub">${m.imKader}x im Kader · ${m.startelf}x Startelf · ${m.eingewechselt}x eingewechselt · ${m.bankOhne}x Bank ohne Einsatz</div>
      <div class="card-sub">${m.minuten} Gesamtspielminuten</div>
    </div>

    <form class="form" data-form="playerProfileExtra" data-id="${p.id}">
      <label>Stärke</label>
      <input name="strength" value="${esc(p.strength||'')}">
      <label>Entwicklungspunkt</label>
      <input name="devPoint" value="${esc(p.devPoint||'')}">
      <label>Aktueller Trainingsfokus</label>
      <input name="focus" value="${esc(p.focus||'')}">
      <button class="btn btn-block" type="submit">Speichern</button>
    </form>

    <div class="section-head">
      <span>Notizen</span>
      <button class="btn btn-small" data-nav="noteForm" data-params='{"playerId":"${p.id}"}'>+ Notiz</button>
    </div>
    <div class="list">
      ${notes.length === 0 ? `<p class="empty">Keine Notizen.</p>` : notes.map(n => noteCard(n)).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

/* -------------------------------- Notizen ------------------------------------- */

function noteCard(n) {
  const p = playerById(n.playerId);
  return `
  <div class="card card-tap ${n.done ? 'card-done' : ''}" data-nav="noteForm" data-params='{"id":"${n.id}"}'>
    <div class="card-title">${p ? esc(p.name) : '–'} <span class="prio prio-${n.priority}">${n.priority}</span></div>
    <div class="card-sub">${esc(n.category)} · ${fmtDate(n.date)} ${n.done ? '· erledigt' : ''}</div>
    <div class="card-body">${esc(n.observation)}</div>
  </div>`;
}

function viewNotes() {
  const grouped = openNotesGrouped();
  const notes = DB.notes.slice().sort((a,b) => b.date < a.date ? -1 : 1);
  return `
  ${header('Notizen')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-nav="noteForm" data-params='{}'>+ Neue Notiz</button>

    ${grouped.length ? `<div class="card">
      <div class="card-title">Offene Schwerpunkte</div>
      ${grouped.map(g => `<div class="card-sub">${esc(g.category)}: ${g.count} offen ${g.players.length ? '(' + esc(g.players.join(', ')) + ')' : ''}</div>`).join('')}
    </div>` : ''}

    <div class="list">
      ${notes.length === 0 ? `<p class="empty">Noch keine Notizen.</p>` : notes.map(n => noteCard(n)).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewNoteForm(id, playerId) {
  const n = id ? DB.notes.find(x => x.id === id) : null;
  const players = DB.players.slice().sort((a,b) => a.name.localeCompare(b.name, 'de'));
  const selectedPlayer = n ? n.playerId : (playerId || '');
  return `
  ${header(n ? 'Notiz bearbeiten' : 'Neue Notiz', 'notes')}
  <main class="content">
    <form class="form" data-form="note" data-id="${n ? n.id : ''}">
      <label>Spieler</label>
      <select name="playerId" required>
        <option value="">– auswählen –</option>
        ${players.map(p => `<option value="${p.id}" ${selectedPlayer===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}
      </select>
      <label>Datum</label>
      <input name="date" type="date" value="${n ? n.date : todayISO()}">
      <label>Kategorie</label>
      <select name="category">${CATEGORIES.map(c => `<option value="${c}" ${n && n.category===c?'selected':''}>${c}</option>`).join('')}</select>
      <label>Beobachtung</label>
      <textarea name="observation" rows="3">${n ? esc(n.observation) : ''}</textarea>
      <label>Maßnahme fürs Training</label>
      <textarea name="action" rows="2">${n ? esc(n.action) : ''}</textarea>
      <label>Priorität</label>
      <div class="segmented">
        ${PRIORITIES.map(pr => `<button type="button" class="prio-select ${(n?n.priority:'Mittel')===pr?'active':''}" data-prio="${pr}">${pr}</button>`).join('')}
      </div>
      <input type="hidden" name="priority" value="${n ? n.priority : 'Mittel'}">
      <label class="checkbox-row"><input type="checkbox" name="done" ${n && n.done ? 'checked' : ''}> Erledigt</label>
      <button class="btn btn-primary btn-block" type="submit">Speichern</button>
      ${n ? `<button type="button" class="btn btn-danger btn-block" data-action="deleteNote" data-id="${n.id}">Notiz löschen</button>` : ''}
    </form>
  </main>
  ${tabbar()}`;
}

/* -------------------------------- Spieltag ------------------------------------- */

function viewMatchList() {
  const list = DB.matches.slice().sort((a,b) => b.date < a.date ? -1 : 1);
  return `
  ${header('Spieltag')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-action="newMatch">+ Neuer Spieltag</button>
    <div class="list">
      ${list.length === 0 ? `<p class="empty">Noch keine Spieltage gespeichert.</p>` : list.map(m => `
        <div class="card card-tap" data-nav="matchDetail" data-params='{"id":"${m.id}"}'>
          <div class="card-title">${fmtDate(m.date)} vs. ${esc(m.opponent || '–')}</div>
          <div class="card-sub">${m.formation} · Kader ${((m.kader)||[]).length}/${m.kaderSize}</div>
        </div>`).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewMatchDetail(id) {
  const m = DB.matches.find(x => x.id === id);
  if (!m) return viewMatchList();
  const formation = FORMATIONS[m.formation];
  const kaderPlayers = (m.kader||[]).map(playerById).filter(Boolean);
  const benchIds = kaderPlayers.filter(p => !Object.values(m.startElf||{}).includes(p.id)).map(p=>p.id);

  return `
  ${header('Spieltag', 'matchList')}
  <main class="content">
    <form class="form form-inline" data-form="matchMeta" data-id="${m.id}">
      <label>Datum</label><input name="date" type="date" value="${m.date}">
      <label>Gegner</label><input name="opponent" value="${esc(m.opponent||'')}">
      <label>Kadergröße</label><input name="kaderSize" type="number" min="11" max="30" value="${m.kaderSize}">
      <label>Spieldauer (Min)</label><input name="duration" type="number" value="${m.duration||90}">
      <label>Formation</label>
      <select name="formation">${FORMATION_NAMES.map(f => `<option value="${f}" ${f===m.formation?'selected':''}>${f}</option>`).join('')}</select>
      <button class="btn btn-block" type="submit">Übernehmen</button>
    </form>

    <details class="details-block" ${m.kader && m.kader.length ? '' : 'open'}>
      <summary>Verfügbarkeit (${activePlayers().filter(p=>m.availability[p.id]!==false).length}/${activePlayers().length} verfügbar)</summary>
      <div class="list">
        ${activePlayers().slice().sort((a,b)=>a.name.localeCompare(b.name,'de')).map(p => {
          const avail = m.availability[p.id] !== false;
          return `<div class="attend-row">
            <div class="attend-name">${esc(p.name)}</div>
            <div class="attend-btns">
              <button class="status-btn st-da ${avail?'is-active':''}" data-action="setAvailability" data-id="${m.id}" data-player="${p.id}" data-val="true">Verfügbar</button>
              <button class="status-btn st-unentsch ${!avail?'is-active':''}" data-action="setAvailability" data-id="${m.id}" data-player="${p.id}" data-val="false">Nicht dabei</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </details>

    <button class="btn btn-primary btn-block" data-action="autoKader" data-id="${m.id}">Kader + Startelf automatisch</button>

    <div class="section-head"><span>Kader (${kaderPlayers.length}/${m.kaderSize})</span></div>
    <div class="chip-list">
      ${kaderPlayers.map(p => `<span class="chip">${esc(p.name)} <button data-action="removeFromKader" data-id="${m.id}" data-player="${p.id}">✕</button></span>`).join('')}
    </div>
    <details class="details-block">
      <summary>Spieler zum Kader hinzufügen</summary>
      <div class="chip-list">
        ${activePlayers().filter(p => !(m.kader||[]).includes(p.id)).map(p => `<button class="chip chip-add" data-action="addToKader" data-id="${m.id}" data-player="${p.id}">+ ${esc(p.name)}</button>`).join('')}
      </div>
    </details>

    <div class="section-head"><span>Grafische Startelf</span>
      <button class="btn btn-small" data-action="autoArrange" data-id="${m.id}">Automatisch anordnen</button>
    </div>
    ${renderPitch(m, formation)}

    <div class="section-head"><span>Bank</span></div>
    <div class="chip-list">
      ${benchIds.map(id => `<span class="chip">${esc(playerById(id).name)}</span>`).join('') || '<span class="muted">–</span>'}
    </div>

    <div class="section-head"><span>Spielzeit</span></div>
    <div class="row-actions">
      <button class="btn" data-action="fillMinutes" data-id="${m.id}">Startelf voll / Bank 0</button>
    </div>
    <div class="minutes-list">
      ${kaderPlayers.map(p => `
        <div class="attend-row">
          <div class="attend-name">${esc(p.name)}</div>
          <input class="minutes-input" type="number" min="0" max="${m.duration||90}"
            value="${(m.minutes && m.minutes[p.id]) || 0}"
            data-action="setMinutes" data-id="${m.id}" data-player="${p.id}">
        </div>`).join('')}
    </div>

    <button class="btn btn-block" data-action="copyMatchWhatsApp" data-id="${m.id}">📋 Für WhatsApp kopieren</button>
    <button class="btn btn-danger btn-block" data-action="deleteMatch" data-id="${m.id}">Spieltag löschen</button>
  </main>
  ${tabbar()}`;
}

function renderPitch(m, formation) {
  return `
  <div class="pitch">
    ${formation.slots.map(slot => {
      const playerId = (m.startElf||{})[slot.key];
      const p = playerId ? playerById(playerId) : null;
      return `<button class="pitch-slot" style="left:${slot.x}%; top:${slot.y}%;" data-action="openSlot" data-id="${m.id}" data-slot="${slot.key}">
        <div class="pitch-pos">${slot.label}</div>
        <div class="pitch-name">${p ? esc(p.name) : '–'}</div>
      </button>`;
    }).join('')}
  </div>`;
}

/* --------------------------------- Backup -------------------------------------- */

function viewBackup() {
  return `
  ${header('Backup')}
  <main class="content">
    <div class="card">
      <div class="card-title">Daten sichern</div>
      <p class="muted">Lädt eine JSON-Datei mit allen Spielern, Trainings, Notizen und Spieltagen herunter.</p>
      <button class="btn btn-primary btn-block" data-action="exportBackup">JSON-Backup exportieren</button>
    </div>
    <div class="card">
      <div class="card-title">Daten wiederherstellen</div>
      <p class="muted">Achtung: überschreibt alle aktuell gespeicherten Daten.</p>
      <input type="file" id="importFile" accept="application/json" class="hidden">
      <button class="btn btn-block" data-action="importBackup">JSON-Backup importieren</button>
    </div>
  </main>
  ${tabbar()}`;
}

/* ---------------------------------- Actions ------------------------------------- */

let timerState = { seconds: 360, running: false, interval: null, round: 1 };

document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    const params = navBtn.dataset.params ? JSON.parse(navBtn.dataset.params) : {};
    nav(navBtn.dataset.nav, params);
    return;
  }
  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn) handleAction(actionBtn, e);
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-action="chooseTraining"]')) {
    nav('teams', { id: e.target.value });
  }
  if (e.target.matches('[data-action="setMinutes"]')) {
    const m = DB.matches.find(x => x.id === e.target.dataset.id);
    m.minutes = m.minutes || {};
    m.minutes[e.target.dataset.player] = Math.max(0, parseInt(e.target.value) || 0);
    saveDB();
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  const type = form.dataset.form;
  const fd = new FormData(form);
  if (type === 'player') {
    let id = form.dataset.id;
    const data = {
      name: fd.get('name').trim(),
      jahrgang: parseInt(fd.get('jahrgang')),
      posPrimary: fd.get('posPrimary'),
      posSecondary: fd.get('posSecondary') || null,
      active: fd.has('active') ? true : (id ? DB.players.find(p=>p.id===id).active : true),
    };
    if (id) {
      Object.assign(playerById(id), data);
      if (!fd.has('active') && form.querySelector('[name=active]')) data.active = false, Object.assign(playerById(id), {active:false});
    } else {
      id = uid('p');
      DB.players.push({ id, ...data, strength:'', devPoint:'', focus:'' });
    }
    saveDB();
    nav('playerProfile', { id });
  } else if (type === 'playerProfileExtra') {
    const p = playerById(form.dataset.id);
    p.strength = fd.get('strength');
    p.devPoint = fd.get('devPoint');
    p.focus = fd.get('focus');
    saveDB();
    render();
  } else if (type === 'note') {
    let id = form.dataset.id;
    const data = {
      playerId: fd.get('playerId'),
      date: fd.get('date') || todayISO(),
      category: fd.get('category'),
      observation: fd.get('observation').trim(),
      action: fd.get('action').trim(),
      priority: fd.get('priority'),
      done: fd.has('done'),
    };
    if (!data.playerId) { alert('Bitte Spieler auswählen.'); return; }
    if (id) {
      Object.assign(DB.notes.find(n => n.id === id), data);
    } else {
      id = uid('n');
      DB.notes.push({ id, ...data });
    }
    saveDB();
    nav('playerProfile', { id: data.playerId });
  } else if (type === 'matchMeta') {
    const m = DB.matches.find(x => x.id === form.dataset.id);
    const newFormation = fd.get('formation');
    m.date = fd.get('date');
    m.opponent = fd.get('opponent');
    m.kaderSize = Math.max(11, parseInt(fd.get('kaderSize')) || 18);
    m.duration = parseInt(fd.get('duration')) || 90;
    if (newFormation !== m.formation) {
      m.formation = newFormation;
      const kader = m.kader || [];
      const { startElf, bench } = autoArrangeStartXI(kader, newFormation);
      m.startElf = startElf;
    }
    saveDB();
    render();
  }
});

function handleAction(btn, e) {
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === 'newTraining') {
    const date = prompt('Datum des Trainings (JJJJ-MM-TT):', todayISO());
    if (!date) return;
    const attendance = {};
    activePlayers().forEach(p => attendance[p.id] = 'offen');
    const t = { id: uid('t'), date, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null } };
    DB.trainings.push(t);
    saveDB();
    nav('trainingDetail', { id: t.id });
  }
  else if (action === 'setAttendance') {
    const t = DB.trainings.find(x => x.id === id);
    t.attendance[btn.dataset.player] = btn.dataset.status;
    saveDB(); render();
  }
  else if (action === 'allAttendance') {
    const t = DB.trainings.find(x => x.id === id);
    Object.keys(t.attendance).forEach(pid => t.attendance[pid] = btn.dataset.status);
    saveDB(); render();
  }
  else if (action === 'deleteTraining') {
    if (!confirm('Training wirklich löschen?')) return;
    DB.trainings = DB.trainings.filter(x => x.id !== id);
    saveDB(); nav('trainingList');
  }
  else if (action === 'setNumTeams') {
    const t = DB.trainings.find(x => x.id === id);
    t.teamGen.numTeams = parseInt(btn.dataset.num);
    t.teamGen.teams = null;
    saveDB(); render();
  }
  else if (action === 'setOverride') {
    const t = DB.trainings.find(x => x.id === id);
    t.teamGen.posOverride[btn.dataset.player] = btn.dataset.mode;
    saveDB(); render();
  }
  else if (action === 'drawTeams') {
    const t = DB.trainings.find(x => x.id === id);
    const presentIds = Object.entries(t.attendance).filter(([,s]) => s === 'anwesend').map(([pid]) => pid);
    t.teamGen.teams = generateTeams(presentIds, t.teamGen.numTeams, t.teamGen.posOverride);
    saveDB(); render();
  }
  else if (action === 'copyTeamsWhatsApp') {
    const t = DB.trainings.find(x => x.id === id);
    const letters = ['A','B','C'];
    let text = `⚽ Trainingsspiele ${fmtDate(t.date)}\n\n`;
    t.teamGen.teams.forEach((team, i) => {
      text += `Team ${letters[i]}\n`;
      team.forEach(pl => text += `- ${pl.name} (${pl.pos})\n`);
      text += '\n';
    });
    copyToClipboard(text.trim());
  }
  else if (action === 'timerStart') { startTimer(); }
  else if (action === 'timerPause') { pauseTimer(); }
  else if (action === 'timerReset') { resetTimer(); }
  else if (action === 'timerNextRound') { nextRound(); }
  else if (action === 'deletePlayer') {
    if (!confirm('Spieler wirklich dauerhaft löschen? Statistikdaten bleiben erhalten, aber der Spieler verschwindet aus Listen.')) return;
    DB.players = DB.players.filter(p => p.id !== id);
    saveDB(); nav('players');
  }
  else if (action === 'deleteNote') {
    if (!confirm('Notiz löschen?')) return;
    const n = DB.notes.find(x => x.id === id);
    const pid = n ? n.playerId : null;
    DB.notes = DB.notes.filter(x => x.id !== id);
    saveDB();
    pid ? nav('playerProfile', { id: pid }) : nav('notes');
  }
  else if (action === 'newMatch') {
    const m = {
      id: uid('m'), date: todayISO(), opponent: '', formation: '4-3-3',
      kaderSize: 18, duration: 90, availability: {}, kader: [], startElf: {}, minutes: {},
    };
    DB.matches.push(m);
    saveDB();
    nav('matchDetail', { id: m.id });
  }
  else if (action === 'setAvailability') {
    const m = DB.matches.find(x => x.id === id);
    m.availability[btn.dataset.player] = btn.dataset.val === 'true';
    saveDB(); render();
  }
  else if (action === 'autoKader') {
    const m = DB.matches.find(x => x.id === id);
    const result = autoSelectKaderAndXI(m.formation, m.kaderSize, m.availability);
    m.kader = result.kaderIds;
    m.startElf = result.startElf;
    m.minutes = m.minutes || {};
    saveDB(); render();
  }
  else if (action === 'addToKader') {
    const m = DB.matches.find(x => x.id === id);
    m.kader = m.kader || [];
    if (!m.kader.includes(btn.dataset.player)) m.kader.push(btn.dataset.player);
    saveDB(); render();
  }
  else if (action === 'removeFromKader') {
    const m = DB.matches.find(x => x.id === id);
    m.kader = (m.kader||[]).filter(pid => pid !== btn.dataset.player);
    Object.keys(m.startElf||{}).forEach(slot => { if (m.startElf[slot] === btn.dataset.player) delete m.startElf[slot]; });
    if (m.minutes) delete m.minutes[btn.dataset.player];
    saveDB(); render();
  }
  else if (action === 'autoArrange') {
    const m = DB.matches.find(x => x.id === id);
    const { startElf } = autoArrangeStartXI(m.kader||[], m.formation);
    m.startElf = startElf;
    saveDB(); render();
  }
  else if (action === 'openSlot') {
    openSlotPicker(id, btn.dataset.slot);
  }
  else if (action === 'fillMinutes') {
    const m = DB.matches.find(x => x.id === id);
    m.minutes = m.minutes || {};
    const starters = new Set(Object.values(m.startElf||{}));
    (m.kader||[]).forEach(pid => { m.minutes[pid] = starters.has(pid) ? (m.duration||90) : 0; });
    saveDB(); render();
  }
  else if (action === 'copyMatchWhatsApp') {
    const m = DB.matches.find(x => x.id === id);
    const formation = FORMATIONS[m.formation];
    let text = `⚽ Kader ${fmtDate(m.date)} gegen ${m.opponent || 'Gegner'}\nFormation: ${m.formation}\n\nStartelf\n\n`;
    formation.slots.forEach(slot => {
      const pid = (m.startElf||{})[slot.key];
      text += `${slot.label}: ${pid ? playerById(pid).name : '–'}\n`;
    });
    text += `\nBank\n\n`;
    const starters = new Set(Object.values(m.startElf||{}));
    (m.kader||[]).filter(pid => !starters.has(pid)).forEach(pid => { text += `${playerById(pid).name}\n`; });
    copyToClipboard(text.trim());
  }
  else if (action === 'deleteMatch') {
    if (!confirm('Spieltag wirklich löschen?')) return;
    DB.matches = DB.matches.filter(x => x.id !== id);
    saveDB(); nav('matchList');
  }
  else if (action === 'exportBackup') {
    const data = JSON.stringify(DB, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `U19_Trainer_Backup_${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  else if (action === 'importBackup') {
    const input = document.getElementById('importFile');
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed.players || !Array.isArray(parsed.players)) throw new Error('Ungültiges Format');
          DB = migrate(parsed);
          saveDB();
          alert('Backup erfolgreich importiert.');
          nav('dashboard');
        } catch (err) {
          alert('Import fehlgeschlagen: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // Priorität-Auswahl im Notizformular
  if (btn.classList.contains('prio-select')) {
    const form = btn.closest('form');
    form.querySelector('[name=priority]').value = btn.dataset.prio;
    form.querySelectorAll('.prio-select').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('In Zwischenablage kopiert')).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('In Zwischenablage kopiert'); } catch (e) { alert('Kopieren nicht möglich.'); }
  document.body.removeChild(ta);
}
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 1800);
}

/* --------------------------------- Timer --------------------------------------- */

function startTimer() {
  if (timerState.running) return;
  const input = document.getElementById('timerMinutes');
  if (input && !timerState.started) timerState.seconds = Math.max(1, parseInt(input.value)||6) * 60;
  timerState.started = true;
  timerState.running = true;
  timerState.interval = setInterval(() => {
    timerState.seconds--;
    updateTimerDisplay();
    if (timerState.seconds <= 0) {
      pauseTimer();
      if (navigator.vibrate) navigator.vibrate([300,100,300]);
      toast('Zeit abgelaufen!');
    }
  }, 1000);
}
function pauseTimer() {
  timerState.running = false;
  clearInterval(timerState.interval);
}
function resetTimer() {
  pauseTimer();
  const input = document.getElementById('timerMinutes');
  timerState.seconds = Math.max(1, parseInt(input && input.value)||6) * 60;
  timerState.started = false;
  updateTimerDisplay();
}
function nextRound() {
  timerState.round = timerState.round >= 3 ? 1 : timerState.round + 1;
  resetTimer();
  const label = document.getElementById('roundLabel');
  if (label) label.textContent = 'Runde ' + timerState.round;
}
function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  if (!el) return;
  const m = Math.floor(timerState.seconds / 60);
  const s = timerState.seconds % 60;
  el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

/* ------------------------------ Slot-Picker (Pitch) ------------------------------ */

function openSlotPicker(matchId, slotKey) {
  const m = DB.matches.find(x => x.id === matchId);
  const kaderPlayers = (m.kader||[]).map(playerById).filter(Boolean);
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">Spieler für ${slotKey} wählen<button class="icon-btn" id="sheetClose">✕</button></div>
      <div class="sheet-list">
        ${kaderPlayers.map(p => {
          const currentSlot = Object.entries(m.startElf||{}).find(([,pid]) => pid === p.id);
          return `<button class="sheet-item" data-pick="${p.id}">
            ${esc(p.name)} <span class="muted">(${p.posPrimary}${p.posSecondary?'/'+p.posSecondary:''})</span>
            ${currentSlot ? `<span class="pos-chip">${currentSlot[0]}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    const pickBtn = e.target.closest('[data-pick]');
    if (!pickBtn) return;
    const newPlayerId = pickBtn.dataset.pick;
    assignSlot(m, slotKey, newPlayerId);
    overlay.remove();
    saveDB(); render();
  });
}

function assignSlot(m, slotKey, newPlayerId) {
  m.startElf = m.startElf || {};
  const existingSlotOfNewPlayer = Object.entries(m.startElf).find(([,pid]) => pid === newPlayerId);
  const previousOccupant = m.startElf[slotKey];
  if (existingSlotOfNewPlayer) {
    // Spieler steht schon auf anderer Position -> Tausch
    const [otherSlot] = existingSlotOfNewPlayer;
    m.startElf[otherSlot] = previousOccupant || null;
    if (!previousOccupant) delete m.startElf[otherSlot];
  }
  m.startElf[slotKey] = newPlayerId;
}

/* ---------------------------------- Init ----------------------------------------- */

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              toast('Neue Version verfügbar – Seite neu laden');
            }
          });
        });
      }).catch(err => console.warn('SW-Registrierung fehlgeschlagen', err));
    });
  }
}

render();
registerServiceWorker();
