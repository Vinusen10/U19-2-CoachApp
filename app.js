'use strict';

/* =========================================================================
   SV Menden U19/2 – Trainer App
   Alles läuft lokal im Browser (localStorage). Keine Server, keine Logins.
   ========================================================================= */

/* ---------------------------- Konstanten ------------------------------- */

const DB_KEY = 'svmU19TrainerDB';
const DB_VERSION = 4;

const POSITIONS = ['TW','IV','LV','RV','DM','ZM','OM','LM','RM','LF','RF','ST'];
const GROUP_OF = { TW:'TW', IV:'DEF', LV:'DEF', RV:'DEF', DM:'MID', ZM:'MID', OM:'MID', LM:'MID', RM:'MID', LF:'FWD', RF:'FWD', ST:'FWD' };
const GROUP_LABEL = { TW:'Torwart', DEF:'Verteidigung', MID:'Mittelfeld', FWD:'Sturm' };
const GROUP_ORDER = ['TW','DEF','MID','FWD'];

const CATEGORIES = ['Technik','Taktik','Fitness','Zweikampf','Mentalität','Verhalten','Position','Allgemein'];
const PRIORITIES = ['Hoch','Mittel','Niedrig'];
const PRIORITY_WEIGHT = { Hoch: 3, Mittel: 2, Niedrig: 1 };

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

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

/* ------------------------------- Avatare -------------------------------- */

const SKIN_TONES = ['#ffe0bd','#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a21'];
const HAIR_COLORS = ['#2b2b2b','#4b3621','#8a5a2b','#c9a24b','#a52a2a','#e8e8e8','#1e3a8a'];
const HAIR_SHAPES = ['bald','short','curly','long','mohawk'];
const FACE_SHAPES = ['round','oval','square'];
const HAIR_SHAPE_LABEL = { bald:'Kahl', short:'Kurz', curly:'Lockig', long:'Lang', mohawk:'Irokese' };
const FACE_SHAPE_LABEL = { round:'Rund', oval:'Oval', square:'Eckig' };

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function defaultAvatarFor(id) {
  const h = hashStr(String(id));
  return {
    skin: SKIN_TONES[h % SKIN_TONES.length],
    hair: HAIR_COLORS[Math.floor(h / 7) % HAIR_COLORS.length],
    hairShape: HAIR_SHAPES[Math.floor(h / 49) % HAIR_SHAPES.length],
    faceShape: FACE_SHAPES[Math.floor(h / 245) % FACE_SHAPES.length],
  };
}

function faceShapeSVG(shape, skin) {
  if (shape === 'oval') return `<ellipse cx="50" cy="55" rx="30" ry="40" fill="${skin}"/>`;
  if (shape === 'square') return `<rect x="17" y="19" width="66" height="70" rx="20" fill="${skin}"/>`;
  return `<circle cx="50" cy="55" r="36" fill="${skin}"/>`; // round (Standard)
}

function hairShapeSVG(shape, hair) {
  switch (shape) {
    case 'bald': return '';
    case 'curly': return `<g fill="${hair}">
        <circle cx="22" cy="38" r="11"/><circle cx="38" cy="23" r="12"/><circle cx="50" cy="17" r="12"/>
        <circle cx="62" cy="23" r="12"/><circle cx="78" cy="38" r="11"/><circle cx="50" cy="30" r="17"/>
      </g>`;
    case 'long': return `<path d="M14,50 Q50,4 86,50 L86,80 Q78,58 78,50 L78,88 Q69,64 69,50 L31,50 Q31,64 22,88 L22,50 Q14,58 14,80 Z" fill="${hair}"/>`;
    case 'mohawk': return `<path d="M44,4 L56,4 L59,42 L41,42 Z" fill="${hair}"/><path d="M14,48 Q50,30 86,48 Q86,32 50,26 Q14,32 14,48 Z" fill="${hair}" opacity="0.0"/>`;
    case 'short':
    default: return `<path d="M14,48 Q50,6 86,48 Q86,26 50,16 Q14,26 14,48 Z" fill="${hair}"/>`;
  }
}

function avatarSVG(avatar, size) {
  size = size || 44;
  avatar = avatar || {};
  const skin = avatar.skin || '#f1c27d';
  const hair = avatar.hair || '#2b2b2b';
  const face = faceShapeSVG(avatar.faceShape || 'round', skin);
  const hairSvg = hairShapeSVG(avatar.hairShape || 'short', hair);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="49" fill="#eaf1ff"/>
    ${face}
    <circle cx="38" cy="56" r="3.2" fill="#1f2937"/>
    <circle cx="62" cy="56" r="3.2" fill="#1f2937"/>
    <path d="M40,70 Q50,76 60,70" stroke="#7a4b32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${hairSvg}
  </svg>`;
}

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
  strength: '', devPoint: '', focus: '', avatar: defaultAvatarFor(id),
}));

/* ------------------------------ Storage --------------------------------- */

function freshDB() {
  return {
    version: DB_VERSION,
    players: SEED_PLAYERS.map(p => ({...p, avatar: {...p.avatar}})),
    trainings: [],
    notes: [],
    generalNotes: [],
    matches: [],
    settings: { trainingWeekdays: [1, 4] }, // Standard: Montag + Donnerstag
  };
}

function migrate(db) {
  if (!db.version) db.version = 1;
  db.players = (db.players || []).map(p => {
    if (!p.avatar) p.avatar = defaultAvatarFor(p.id);
    return p;
  });
  db.generalNotes = db.generalNotes || [];
  db.settings = db.settings || {};
  if (!db.settings.trainingWeekdays) db.settings.trainingWeekdays = [1, 4];
  // Zukünftige Migrationen hier einhängen, z.B.:
  // if (db.version < 5) { ...db.version = 5; }
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
    db.generalNotes = db.generalNotes || [];
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

const WEEKDAYS = [
  { val: 1, label: 'Mo' }, { val: 2, label: 'Di' }, { val: 3, label: 'Mi' },
  { val: 4, label: 'Do' }, { val: 5, label: 'Fr' }, { val: 6, label: 'Sa' }, { val: 0, label: 'So' },
];

// Legt für die kommenden `horizonDays` Tage automatisch Trainings an den in
// DB.settings.trainingWeekdays hinterlegten Wochentagen an, sofern an dem Datum
// noch kein Training existiert. Gibt die Anzahl neu angelegter Trainings zurück.
function generateUpcomingTrainings(horizonDays) {
  horizonDays = horizonDays || 14;
  const weekdays = DB.settings.trainingWeekdays || [];
  if (!weekdays.length) return 0;
  const existingDates = new Set(DB.trainings.map(t => t.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let created = 0;
  for (let i = 0; i < horizonDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (!weekdays.includes(d.getDay())) continue;
    const iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (existingDates.has(iso)) continue;
    const attendance = {};
    activePlayers().forEach(p => attendance[p.id] = 'offen');
    DB.trainings.push({ id: uid('t'), date: iso, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' } });
    existingDates.add(iso);
    created++;
  }
  if (created > 0) saveDB();
  return created;
}

// Bestmögliche Erkennung von Datum + Gegner aus eingefügtem Spielplan-Text (z. B. von fußball.de).
// Kein Live-Abgleich, sondern ein Text-Parser: fußball.de bietet keine offene API für Drittanbieter.
// Unterstützt zwei Formate:
// 1) Das echte fußball.de-Exportformat: Blöcke aus Datumszeile + mehrzeiligen Teamnamen, durch "Zum Spiel" getrennt.
// 2) Einfaches Format "Team A - Team B" auf einer Zeile (z. B. bei manuell eingegebenem Text).
function parseFussballFixtures(text) {
  if (/zum spiel/i.test(text)) return parseFussballBlockFormat(text);
  return parseFussballDashFormat(text);
}

function parseFussballBlockFormat(text) {
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const looseDateRe = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
  const skipLineRe = /^zum spiel$/i;
  const colonOnlyRe = /^:+\s*$/;
  const compLineRe = /^(\d\.\s*)?Kreisklasse$|^ME\s*\|/i;

  const blocks = [];
  let current = [];
  rawLines.forEach(line => {
    if (skipLineRe.test(line)) {
      if (current.length) blocks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  });
  if (current.length) blocks.push(current);

  const results = [];
  blocks.forEach(block => {
    const dateLineIdx = block.findIndex(l => looseDateRe.test(l));
    if (dateLineIdx === -1) return;
    const dm = block[dateLineIdx].match(looseDateRe);
    const [, dd, mm, yy] = dm;
    const year = yy.length === 2 ? '20' + yy : yy;
    const iso = `${year}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;

    const nameCandidates = [];
    block.forEach((line, idx) => {
      if (idx === dateLineIdx) return;
      if (colonOnlyRe.test(line)) return;
      if (looseDateRe.test(line)) return;
      if (compLineRe.test(line)) return;
      if (nameCandidates.length === 0 || nameCandidates[nameCandidates.length - 1] !== line) {
        nameCandidates.push(line);
      }
    });

    let opponent = '';
    if (nameCandidates.length >= 2) {
      const home = nameCandidates[0], away = nameCandidates[1];
      if (/menden/i.test(home) && !/menden/i.test(away)) opponent = away;
      else if (/menden/i.test(away) && !/menden/i.test(home)) opponent = home;
      else opponent = away;
    } else if (nameCandidates.length === 1 && !/menden/i.test(nameCandidates[0])) {
      opponent = nameCandidates[0];
    }

    results.push({ tempId: uid('fi'), date: iso, opponent, checked: true });
  });

  return dedupeFixturesByDate(results);
}

function parseFussballDashFormat(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const dateRe = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
  const vsRe = /([A-ZÄÖÜ][\wÄÖÜäöüß.\-\/ ]{2,40}?)\s+-\s+([A-ZÄÖÜ][\wÄÖÜäöüß.\-\/ ]{2,40})/;
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const dm = lines[i].match(dateRe);
    if (!dm) continue;
    const [, dd, mm, yy] = dm;
    const year = yy.length === 2 ? '20' + yy : yy;
    const iso = `${year}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
    let opponent = '';
    for (let j = i; j <= i + 2 && j < lines.length; j++) {
      const vm = lines[j].match(vsRe);
      if (vm) {
        const a = vm[1].trim(), b = vm[2].trim();
        if (/menden/i.test(a) && !/menden/i.test(b)) opponent = b;
        else if (/menden/i.test(b) && !/menden/i.test(a)) opponent = a;
        else opponent = b;
        break;
      }
    }
    results.push({ tempId: uid('fi'), date: iso, opponent, checked: true });
  }
  return dedupeFixturesByDate(results);
}

function dedupeFixturesByDate(results) {
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.date)) return false;
    seen.add(r.date);
    return true;
  });
}

/* ------------------------------ Helpers ---------------------------------- */

function activePlayers() { return DB.players.filter(p => p.active); }
function playerById(id) { return DB.players.find(p => p.id === id); }
function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const datePart = String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
  const timePart = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  return datePart + ' · ' + timePart;
}
function monthLabel(ym) {
  const [y,m] = ym.split('-');
  return MONTH_NAMES[parseInt(m,10)-1] + ' ' + y;
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

// Donut-Diagramm der Saison-Verteilung (Anwesend/Abgesagt/Unentschuldigt/Offen).
function attendanceDonutSVG(stats, size) {
  size = size || 108;
  const total = stats.total;
  if (!total) return '';
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { color: '#16a34a', value: stats.anwesend },
    { color: '#eab308', value: stats.abgesagt },
    { color: '#dc2626', value: stats.unentschuldigt },
    { color: '#9ca3af', value: stats.offen },
  ];
  let offset = 0;
  let circles = '';
  segments.forEach(seg => {
    if (seg.value <= 0) return;
    const dash = (seg.value / total) * circumference;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="14"
      stroke-dasharray="${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}"
      stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += dash;
  });
  return `
  <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eef2fb" stroke-width="14"/>
    ${circles}
    <text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="19" font-weight="800" fill="#111827">${stats.quote}%</text>
    <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="9" fill="#6b7280">Beteiligung</text>
  </svg>`;
}

// Verlaufsstreifen der letzten Trainings (Balkenhöhe/Farbe je nach Status).
function trainingHistorySVG(list, playerId, width, height) {
  width = width || 300; height = height || 74;
  const recent = list.slice(-12);
  if (recent.length === 0) return '';
  const n = recent.length;
  const gap = 6;
  const barW = Math.max(9, (width - gap * (n + 1)) / n);
  const statusColor = { anwesend:'#16a34a', abgesagt:'#eab308', unentschuldigt:'#dc2626', offen:'#cbd5e1' };
  const statusHeight = { anwesend:1, abgesagt:0.55, unentschuldigt:0.3, offen:0.18 };
  const baseY = height - 8;
  const maxBarH = height - 12;
  let bars = '';
  recent.forEach((t, i) => {
    const status = t.attendance[playerId] || 'offen';
    const h = Math.max(5, maxBarH * (statusHeight[status] || 0.18));
    const x = gap + i * (barW + gap);
    const y = baseY - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3.5" fill="${statusColor[status]}"/>`;
  });
  const firstDate = fmtDate(recent[0].date);
  const lastDate = fmtDate(recent[recent.length - 1].date);
  return `
  <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <line x1="0" y1="${baseY + 2}" x2="${width}" y2="${baseY + 2}" stroke="#e2e8f5" stroke-width="1"/>
    ${bars}
  </svg>
  <div class="chart-axis-labels"><span>${esc(firstDate)}</span><span>${esc(lastDate)}</span></div>`;
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

// Stärke-Score: kombiniert Trainingsbeteiligung (immer vorhanden) mit Spielbeteiligung
// (Startelf-Quote aus Spieltagen, falls schon Spieltage erfasst sind).
function playerStrengthScore(playerId) {
  const trainingsQuote = playerStats(playerId).quote;
  const ms = matchStats(playerId);
  if (ms.imKader === 0) return trainingsQuote;
  const spielQuote = Math.round((ms.startelf / ms.imKader) * 100);
  return Math.round(trainingsQuote * 0.6 + spielQuote * 0.4);
}

function sortByStrengthDesc(players) {
  // Zufälliger Tiebreaker bei Gleichstand, damit "Neu auslosen" bei gleichauf liegenden
  // Spielern trotzdem eine leichte Durchmischung bringt.
  return players
    .map(p => ({ p, score: playerStrengthScore(p.id), rnd: Math.random() }))
    .sort((a,b) => b.score - a.score || b.rnd - a.rnd)
    .map(x => x.p);
}

// Teilt anwesende Spieler in eine stärkere und eine schwächere Gruppe auf, getrennt nach
// Trainings-/Spielbeteiligung, aber je Positionsgruppe (Verteidigung/Mittelfeld/Sturm), damit
// beide Gruppen möglichst eine sinnvolle Positionsverteilung behalten. Die schwächere Gruppe
// bekommt bevorzugt einen Torhüter, falls einer anwesend ist.
function generateTeamsBySkill(presentIds, overrideMap) {
  const players = presentIds.map(playerById).filter(Boolean);
  const byGroup = { TW: [], DEF: [], MID: [], FWD: [] };
  players.forEach(p => {
    const pos = effectivePosition(p, overrideMap);
    byGroup[GROUP_OF[pos]].push(p);
  });

  const strong = [];
  const weak = [];

  const tws = sortByStrengthDesc(byGroup.TW);
  if (tws.length === 1) {
    weak.push({ id: tws[0].id, name: tws[0].name, pos: 'TW' });
  } else if (tws.length >= 2) {
    weak.push({ id: tws[0].id, name: tws[0].name, pos: 'TW' });
    strong.push({ id: tws[1].id, name: tws[1].name, pos: 'TW' });
    tws.slice(2).forEach((p, i) => {
      (i % 2 === 0 ? strong : weak).push({ id: p.id, name: p.name, pos: 'TW' });
    });
  }

  ['DEF','MID','FWD'].forEach(group => {
    const sorted = sortByStrengthDesc(byGroup[group]);
    const half = Math.ceil(sorted.length / 2);
    sorted.forEach((p, i) => {
      const pos = effectivePosition(p, overrideMap);
      const entry = { id: p.id, name: p.name, pos };
      if (i < half) strong.push(entry); else weak.push(entry);
    });
  });

  return { strong, weak };
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
  history: [],
  playerFilter: { search: '', position: '' },
  trainingFilter: { period: 'all' },
  fussballImport: { raw: '', parsed: [] },
};

function leavingRouteHook(nextRoute) {
  if (state.route === 'generalNoteForm' && nextRoute !== 'generalNoteForm') {
    finalizeGeneralNote();
  }
}

function nav(route, params = {}) {
  leavingRouteHook(route);
  state.history.push({ route: state.route, params: state.params });
  state.route = route;
  state.params = params;
  window.scrollTo(0, 0);
  render();
}

function goBack() {
  if (state.history.length === 0) { nav('dashboard'); return; }
  const prev = state.history.pop();
  leavingRouteHook(prev.route);
  state.route = prev.route;
  state.params = prev.params;
  window.scrollTo(0, 0);
  render();
}

function finalizeGeneralNote() {
  const ta = document.getElementById('generalNoteText');
  if (!ta) return;
  const id = ta.dataset.id;
  const n = DB.generalNotes.find(x => x.id === id);
  if (!n) return;
  n.text = ta.value;
  n.updatedAt = new Date().toISOString();
  if (!ta.value.trim() && (!n.images || n.images.length === 0)) {
    DB.generalNotes = DB.generalNotes.filter(x => x.id !== id);
  }
  saveDB();
}

/* --------------------------------- Render ---------------------------------- */

const app = document.getElementById('app');

function render() {
  const activeEl = document.activeElement;
  let restore = null;
  if (activeEl && app.contains(activeEl) && (activeEl.id || activeEl.name)) {
    restore = { id: activeEl.id, name: activeEl.name, selStart: activeEl.selectionStart, selEnd: activeEl.selectionEnd };
  }

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
    case 'generalNoteForm': html = viewGeneralNoteForm(state.params.id); break;
    case 'matchList': html = viewMatchList(); break;
    case 'matchDetail': html = viewMatchDetail(state.params.id); break;
    case 'backup': html = viewBackup(); break;
    case 'importFussball': html = viewImportFussball(); break;
    default: html = viewDashboard();
  }
  app.innerHTML = html;
  bindNav();

  if (restore) {
    const el = restore.id ? document.getElementById(restore.id) : app.querySelector(`[name="${restore.name}"]`);
    if (el) {
      el.focus();
      if (typeof restore.selStart === 'number' && el.setSelectionRange) {
        try { el.setSelectionRange(restore.selStart, restore.selEnd); } catch (e) {}
      }
    }
  }
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
  if (['matchList','matchDetail','importFussball'].includes(route)) return 'matchList';
  if (['players','playerProfile','playerForm'].includes(route)) return 'players';
  if (['notes','noteForm','generalNoteForm'].includes(route)) return 'notes';
  return route;
}

function header(title) {
  const showBack = state.history.length > 0;
  return `
  <header class="topbar">
    ${showBack ? `<button class="icon-btn" data-back="true">←</button>` : `<span class="icon-btn-spacer"></span>`}
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

function trainingPeriods() {
  const set = new Set();
  DB.trainings.forEach(t => set.add(t.date.slice(0,7)));
  return Array.from(set).sort().reverse();
}

function viewTrainingList() {
  const periods = trainingPeriods();
  let list = DB.trainings.slice();
  if (state.trainingFilter.period !== 'all') {
    list = list.filter(t => t.date.slice(0,7) === state.trainingFilter.period);
  }
  list.sort((a,b) => b.date < a.date ? -1 : b.date > a.date ? 1 : 0);

  return `
  ${header('Training')}
  <main class="content">
    <div class="row-actions">
      <button class="btn btn-primary" style="flex:1" data-action="newTrainingToday">+ Training heute</button>
      <button class="btn" style="flex:1" data-action="newTrainingPickDate">+ Anderes Datum</button>
    </div>

    ${periods.length > 1 ? `
    <div class="filter-row">
      <select id="trainingPeriodFilter">
        <option value="all" ${state.trainingFilter.period==='all'?'selected':''}>Alle Trainings</option>
        ${periods.map(p => `<option value="${p}" ${state.trainingFilter.period===p?'selected':''}>${monthLabel(p)}</option>`).join('')}
      </select>
    </div>` : ''}

    <div class="list">
      ${list.length === 0 ? `<p class="empty">Keine Trainings in diesem Zeitraum.</p>` : list.map(t => {
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
  <header class="topbar">
    <button class="icon-btn" data-back="true">←</button>
    <h1>${fmtDate(t.date)} <button class="inline-edit-btn" data-action="editTrainingDate" data-id="${t.id}" title="Datum ändern">✎</button></h1>
    <button class="icon-btn" data-nav="backup">⋮</button>
  </header>
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

  t.teamGen = t.teamGen || { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' };
  if (!t.teamGen.mode) t.teamGen.mode = 'strength';
  const presentIds = Object.entries(t.attendance).filter(([,s]) => s === 'anwesend').map(([id]) => id);
  const presentPlayers = presentIds.map(playerById).filter(Boolean);
  const withSecondary = presentPlayers.filter(p => p.posSecondary);

  const teamsHtml = t.teamGen.teams ? renderTeamsResult(t.teamGen.teams, t.id, t.teamGen.teamLabels) : '';

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

    ${t.teamGen.numTeams === 2 ? `
    <div class="select-row">
      <label>Verteilung</label>
      <div class="segmented">
        <button class="${t.teamGen.mode==='strength'?'active':''}" data-action="setTeamMode" data-id="${t.id}" data-mode="strength">Nach Stärke</button>
        <button class="${t.teamGen.mode==='random'?'active':''}" data-action="setTeamMode" data-id="${t.id}" data-mode="random">Zufällig</button>
      </div>
      ${t.teamGen.mode === 'strength' ? `<p class="muted small-note">Team A = stärkere Gruppe, Team B = schwächere Gruppe – nach Trainings- und Spielbeteiligung, je Position getrennt aufgeteilt. Team B bekommt bevorzugt einen Torhüter.</p>` : ''}
    </div>` : ''}

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

function renderTeamsResult(teams, trainingId, labels) {
  const letters = ['A','B','C'];
  return `<div class="team-grid">
    ${teams.map((team, i) => {
      const title = labels && labels[i] ? `Team ${letters[i]} · ${labels[i]}` : `Team ${letters[i]}`;
      return `
      <div class="team-card team-${letters[i]}">
        <div class="team-head">${title} <span class="team-count">${team.length}</span></div>
        ${team.map(pl => `
          <button class="team-player team-player-tap" data-action="moveTeamPlayer" data-id="${trainingId}" data-player="${pl.id}" data-from="${i}">
            <span class="pos-chip">${pl.pos}</span>${esc(pl.name)}
            <span class="move-hint">⇄</span>
          </button>`).join('')}
        ${team.length === 0 ? `<div class="team-empty">–</div>` : ''}
      </div>`;
    }).join('')}
  </div>
  <p class="muted team-hint">Tipp: Auf einen Spieler tippen, um ihn in ein anderes Team zu verschieben.</p>`;
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

function openTeamMoveSheet(trainingId, playerId, fromIndex) {
  const t = DB.trainings.find(x => x.id === trainingId);
  const teams = t.teamGen.teams;
  const letters = ['A','B','C'];
  const player = teams[fromIndex].find(p => p.id === playerId);
  if (!player) return;

  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">${esc(player.name)} verschieben<button class="icon-btn" id="sheetClose">✕</button></div>
      <div class="sheet-list">
        ${teams.map((team, i) => i === fromIndex ? '' : `
          <button class="sheet-item" data-move-to="${i}">Zu Team ${letters[i]} <span class="muted">(${team.length} Spieler)</span></button>
        `).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    const moveBtn = e.target.closest('[data-move-to]');
    if (!moveBtn) return;
    const toIndex = parseInt(moveBtn.dataset.moveTo, 10);
    teams[fromIndex] = teams[fromIndex].filter(p => p.id !== playerId);
    teams[toIndex].push(player);
    overlay.remove();
    saveDB(); render();
  });
}

/* ------------------------------ Spieler -------------------------------------- */

function viewPlayers() {
  let players = DB.players.slice();
  const f = state.playerFilter;
  if (f.search) {
    const q = f.search.toLowerCase();
    players = players.filter(p => p.name.toLowerCase().includes(q));
  }
  if (f.position) {
    players = players.filter(p => p.posPrimary === f.position || p.posSecondary === f.position);
  }
  players.sort((a,b) => (b.active - a.active) || a.name.localeCompare(b.name, 'de'));

  return `
  ${header('Spieler')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-nav="playerForm" data-params='{}'>+ Spieler hinzufügen</button>

    <div class="filter-row">
      <input id="playerSearch" type="text" placeholder="Suche nach Namen…" value="${esc(f.search)}">
      <select id="playerPosFilter">
        <option value="">Alle Positionen</option>
        ${POSITIONS.map(pos => `<option value="${pos}" ${f.position===pos?'selected':''}>${pos}</option>`).join('')}
      </select>
    </div>

    <div class="list">
      ${players.length === 0 ? `<p class="empty">Keine Spieler gefunden.</p>` : players.map(p => {
        const s = playerStats(p.id);
        return `
        <div class="card card-tap ${!p.active ? 'card-inactive' : ''}" data-nav="playerProfile" data-params='{"id":"${p.id}"}'>
          <div class="player-card-row">
            <div class="list-avatar">${avatarSVG(p.avatar, 40)}</div>
            <div>
              <div class="card-title">${esc(p.name)} ${!p.active ? '<span class="badge-off">inaktiv</span>' : ''}</div>
              <div class="card-sub">${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''} · Jg. ${p.jahrgang}</div>
              <div class="card-sub">Beteiligung: ${s.total ? s.quote + ' %' : '–'} ${s.last5Quote != null ? `· Letzte 5: ${s.last5Quote} % ${s.trend}` : ''}</div>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function avatarEditorHTML(avatar) {
  return `
  <label>Avatar</label>
  <div class="avatar-editor">
    <div class="avatar-preview" id="avatarPreview">${avatarSVG(avatar, 84)}</div>
    <div class="avatar-picker-group">
      <div class="avatar-picker-label">Hautfarbe</div>
      <div class="swatch-row">
        ${SKIN_TONES.map(c => `<button type="button" class="swatch ${avatar.skin===c?'active':''}" style="background:${c}" data-avatar-field="Skin" data-value="${c}"></button>`).join('')}
      </div>
      <div class="avatar-picker-label">Haarfarbe</div>
      <div class="swatch-row">
        ${HAIR_COLORS.map(c => `<button type="button" class="swatch ${avatar.hair===c?'active':''}" style="background:${c}" data-avatar-field="Hair" data-value="${c}"></button>`).join('')}
      </div>
      <div class="avatar-picker-label">Frisur</div>
      <div class="segmented small avatar-seg">
        ${HAIR_SHAPES.map(s => `<button type="button" class="${avatar.hairShape===s?'active':''}" data-avatar-field="HairShape" data-value="${s}">${HAIR_SHAPE_LABEL[s]}</button>`).join('')}
      </div>
      <div class="avatar-picker-label">Gesichtsform</div>
      <div class="segmented small avatar-seg">
        ${FACE_SHAPES.map(s => `<button type="button" class="${avatar.faceShape===s?'active':''}" data-avatar-field="FaceShape" data-value="${s}">${FACE_SHAPE_LABEL[s]}</button>`).join('')}
      </div>
    </div>
  </div>
  <input type="hidden" name="avatarSkin" value="${avatar.skin}">
  <input type="hidden" name="avatarHair" value="${avatar.hair}">
  <input type="hidden" name="avatarHairShape" value="${avatar.hairShape}">
  <input type="hidden" name="avatarFaceShape" value="${avatar.faceShape}">`;
}

function viewPlayerForm(id) {
  const p = id ? playerById(id) : null;
  const avatar = p ? p.avatar : defaultAvatarFor('new_' + Date.now());
  const hasData = p ? (DB.trainings.some(t => t.attendance && t.attendance[p.id]) ||
                        DB.notes.some(n => n.playerId === p.id) ||
                        DB.matches.some(m => (m.kader||[]).includes(p.id))) : false;
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

      ${avatarEditorHTML(avatar)}

      <button class="btn btn-primary btn-block" type="submit">Speichern</button>
      ${p ? `
      <div class="delete-hint">Tipp: Statt endgültig zu löschen, kannst du den Spieler oben einfach deaktivieren (Haken bei „Aktiv" entfernen und speichern). Er bleibt dann in der Statistik erhalten, taucht aber nicht mehr in aktiven Listen auf.</div>
      <button type="button" class="btn btn-danger btn-block" data-action="deletePlayer" data-id="${p.id}">Spieler endgültig löschen${hasData ? ' ⚠️' : ''}</button>
      ` : ''}
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
      <button class="profile-avatar" data-nav="playerForm" data-params='{"id":"${p.id}"}' title="Spieler & Avatar bearbeiten">
        ${avatarSVG(p.avatar, 54)}
        <span class="avatar-edit-badge">✎</span>
      </button>
      <div>
        <div class="profile-name">${esc(p.name)} ${!p.active?'<span class="badge-off">inaktiv</span>':''}</div>
        <div class="muted">Jg. ${p.jahrgang} · ${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''}</div>
      </div>
    </div>

    <div class="grid2">
      <div class="stat-card"><div class="stat-num">${s.total}</div><div class="stat-label">Trainings</div></div>
      <div class="stat-card"><div class="stat-num">${s.quote}${s.total?' %':''}</div><div class="stat-label">Beteiligung</div></div>
      <div class="stat-card"><div class="stat-num">${s.last5Quote != null ? s.last5Quote + ' %' : '–'} ${s.trend}</div><div class="stat-label">Letzte 5</div></div>
      <div class="stat-card"><div class="stat-num">${s.unentschuldigt}</div><div class="stat-label">Unentschuldigt</div></div>
    </div>

    <div class="card">
      <div class="card-title">Trainingsverlauf</div>
      ${s.total === 0 ? `<p class="muted">Noch keine Trainingsdaten.</p>` : `
      <div class="chart-row">
        <div class="donut-wrap">${attendanceDonutSVG(s, 108)}</div>
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#16a34a"></span>Anwesend: ${s.anwesend}</div>
          <div class="legend-item"><span class="legend-dot" style="background:#eab308"></span>Abgesagt: ${s.abgesagt}</div>
          <div class="legend-item"><span class="legend-dot" style="background:#dc2626"></span>Unentsch.: ${s.unentschuldigt}</div>
          <div class="legend-item"><span class="legend-dot" style="background:#9ca3af"></span>Offen: ${s.offen}</div>
        </div>
      </div>
      <div class="chart-subtitle">Letzte ${Math.min(12, s.total)} Trainings</div>
      ${trainingHistorySVG(s.list, p.id)}
      `}
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

function generalNoteCard(n) {
  const lines = (n.text || '').split('\n').filter(l => l.trim().length);
  const title = lines[0] ? lines[0].slice(0, 70) : 'Neue Notiz';
  const preview = lines.slice(1).join(' ').slice(0, 100);
  const hasImg = n.images && n.images.length > 0;
  return `
  <div class="card card-tap note-card" data-nav="generalNoteForm" data-params='{"id":"${n.id}"}'>
    ${hasImg ? `<div class="note-thumb"><img src="${n.images[0]}" alt=""></div>` : ''}
    <div class="note-card-body">
      <div class="card-title">${esc(title)}</div>
      ${preview ? `<div class="card-sub">${esc(preview)}</div>` : ''}
      <div class="card-sub note-date">${fmtDateTime(n.updatedAt)}${hasImg && n.images.length > 1 ? ` · ${n.images.length} Fotos` : hasImg ? ' · 1 Foto' : ''}</div>
    </div>
  </div>`;
}

function viewNotes() {
  const grouped = openNotesGrouped();
  const general = DB.generalNotes.slice().sort((a,b) => b.updatedAt < a.updatedAt ? -1 : b.updatedAt > a.updatedAt ? 1 : 0);

  return `
  ${header('Notizen')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-action="newGeneralNote">+ Neue Notiz</button>

    ${grouped.length ? `
    <details class="details-block">
      <summary>Offene Trainingsschwerpunkte aus Spielernotizen (${grouped.reduce((a,g)=>a+g.count,0)})</summary>
      ${grouped.map(g => `<div class="card-sub">${esc(g.category)}: ${g.count} offen ${g.players.length ? '(' + esc(g.players.join(', ')) + ')' : ''}</div>`).join('')}
      <p class="muted small-note">Einzelne Spielernotizen findest du im jeweiligen Spielerprofil.</p>
    </details>` : ''}

    <div class="list">
      ${general.length === 0 ? `<p class="empty">Noch keine Notizen. Tippe oben auf „+ Neue Notiz“ – z. B. um die nächste Trainingseinheit zu planen oder ein Foto von der Taktiktafel festzuhalten.</p>` : general.map(n => generalNoteCard(n)).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewGeneralNoteForm(id) {
  const n = DB.generalNotes.find(x => x.id === id);
  if (!n) return viewNotes();
  const images = n.images || [];
  return `
  ${header('Notiz', 'notes')}
  <main class="content">
    <textarea id="generalNoteText" class="note-textarea" placeholder="Notiz eingeben…" data-id="${n.id}" rows="10">${esc(n.text)}</textarea>

    ${images.length ? `
    <div class="note-photo-grid">
      ${images.map((img, i) => `
        <div class="note-photo-item">
          <img src="${img}" alt="">
          <button class="note-photo-remove" data-action="removeNotePhoto" data-id="${n.id}" data-index="${i}">✕</button>
        </div>`).join('')}
    </div>` : ''}

    <button class="btn btn-block" data-action="addNotePhoto" data-id="${n.id}">📷 Foto hinzufügen</button>
    <input type="file" id="notePhotoInput" accept="image/*" class="hidden">

    <p class="muted small-note">Wird automatisch gespeichert. Leer gelassene Notizen werden beim Verlassen wieder entfernt.</p>

    <button class="btn btn-danger btn-block" data-action="deleteGeneralNote" data-id="${n.id}">Notiz löschen</button>
  </main>
  ${tabbar()}`;
}

function viewNoteForm(id, playerId) {
  const n = id ? DB.notes.find(x => x.id === id) : null;
  const players = DB.players.slice().sort((a,b) => a.name.localeCompare(b.name, 'de'));
  const selectedPlayer = n ? n.playerId : (playerId || '');
  const backId = selectedPlayer || null;
  return `
  ${header(n ? 'Notiz bearbeiten' : 'Neue Notiz', backId ? 'playerProfile' : 'notes', backId ? {id: backId} : {})}
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
    <button class="btn btn-block" data-nav="importFussball">📋 Spielplan aus fußball.de importieren</button>
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

function viewImportFussball() {
  const imp = state.fussballImport;
  if (!imp.parsed || imp.parsed.length === 0) {
    return `
    ${header('Spielplan importieren', 'matchList')}
    <main class="content">
      <p class="muted">Öffne auf fußball.de den Spielplan eurer Mannschaft, markiere die kommenden Spiele in der Tabelle und kopiere den Text (Strg/Cmd+C). Füge ihn unten ein – die App versucht, Datum und Gegner automatisch zu erkennen.</p>
      <textarea id="fussballPasteText" class="note-textarea" rows="10" placeholder="Spielplan-Text hier einfügen…"></textarea>
      <button class="btn btn-primary btn-block" data-action="parseFussballText">Text analysieren</button>
      <p class="muted small-note">Hinweis: fußball.de bietet keine offene Schnittstelle für externe Apps – ein automatischer Live-Abgleich ist deshalb nicht möglich. Diese Funktion erkennt Termine bestmöglich aus eingefügtem Text; bitte vor dem Übernehmen prüfen.</p>
    </main>
    ${tabbar()}`;
  }
  return `
  ${header('Spielplan importieren', 'matchList')}
  <main class="content">
    <p class="muted">${imp.parsed.length} Termin(e) erkannt. Datum/Gegner bei Bedarf korrigieren, unpassende Zeilen abwählen.</p>
    <div class="list">
      ${imp.parsed.map(r => `
        <div class="import-row">
          <input type="checkbox" data-action="toggleImportRow" data-temp-id="${r.tempId}" ${r.checked?'checked':''}>
          <input type="date" data-action="editImportDate" data-temp-id="${r.tempId}" value="${r.date}">
          <input type="text" placeholder="Gegner" data-action="editImportOpponent" data-temp-id="${r.tempId}" value="${esc(r.opponent)}">
        </div>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" data-action="confirmFussballImport">Ausgewählte Spieltage anlegen</button>
    <button class="btn btn-block" data-action="resetFussballImport">Zurück zum Text</button>
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
  const weekdays = DB.settings.trainingWeekdays || [];
  return `
  ${header('Einstellungen')}
  <main class="content">
    <div class="card">
      <div class="card-title">Trainingstage</div>
      <p class="muted">An diesen Wochentagen werden automatisch für die kommenden 2 Wochen Trainings angelegt – neue Trainings erscheinen dann von selbst unter „Training", ohne dass du sie manuell erstellen musst.</p>
      <div class="weekday-row">
        ${WEEKDAYS.map(w => `<button class="weekday-btn ${weekdays.includes(w.val)?'active':''}" data-action="toggleWeekday" data-val="${w.val}">${w.label}</button>`).join('')}
      </div>
      <button class="btn btn-block" data-action="fillTrainings">Fehlende Trainingstage jetzt anlegen</button>
    </div>
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

let timerState = { seconds: 360, running: false, interval: null, round: 1, started: false };

document.addEventListener('click', (e) => {
  const backBtn = e.target.closest('[data-back]');
  if (backBtn) { goBack(); return; }

  const avatarBtn = e.target.closest('[data-avatar-field]');
  if (avatarBtn) { handleAvatarPick(avatarBtn); return; }

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
  if (e.target.id === 'trainingPeriodFilter') {
    state.trainingFilter.period = e.target.value;
    render();
  }
  if (e.target.id === 'playerPosFilter') {
    state.playerFilter.position = e.target.value;
    render();
  }
  if (e.target.matches('[data-action="toggleImportRow"]')) {
    const row = (state.fussballImport.parsed || []).find(r => r.tempId === e.target.dataset.tempId);
    if (row) row.checked = e.target.checked;
  }
  if (e.target.matches('[data-action="editImportDate"]')) {
    const row = (state.fussballImport.parsed || []).find(r => r.tempId === e.target.dataset.tempId);
    if (row) row.date = e.target.value;
  }
  if (e.target.matches('[data-action="editImportOpponent"]')) {
    const row = (state.fussballImport.parsed || []).find(r => r.tempId === e.target.dataset.tempId);
    if (row) row.opponent = e.target.value;
  }
});

let generalNoteSaveTimer = null;
document.addEventListener('input', (e) => {
  if (e.target.id === 'playerSearch') {
    state.playerFilter.search = e.target.value;
    render();
  }
  if (e.target.id === 'generalNoteText') {
    const noteId = e.target.dataset.id;
    const n = DB.generalNotes.find(x => x.id === noteId);
    if (n) {
      n.text = e.target.value;
      clearTimeout(generalNoteSaveTimer);
      generalNoteSaveTimer = setTimeout(() => {
        n.updatedAt = new Date().toISOString();
        saveDB();
      }, 500);
    }
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
    const avatar = {
      skin: fd.get('avatarSkin'),
      hair: fd.get('avatarHair'),
      hairShape: fd.get('avatarHairShape'),
      faceShape: fd.get('avatarFaceShape'),
    };
    const data = {
      name: fd.get('name').trim(),
      jahrgang: parseInt(fd.get('jahrgang')),
      posPrimary: fd.get('posPrimary'),
      posSecondary: fd.get('posSecondary') || null,
      active: id ? fd.has('active') : true,
      avatar,
    };
    if (id) {
      Object.assign(playerById(id), data);
    } else {
      id = uid('p');
      DB.players.push({ id, ...data, strength:'', devPoint:'', focus:'' });
    }
    saveDB();
    toast('Gespeichert ✓');
    nav('playerProfile', { id });
  } else if (type === 'playerProfileExtra') {
    const p = playerById(form.dataset.id);
    p.strength = fd.get('strength');
    p.devPoint = fd.get('devPoint');
    p.focus = fd.get('focus');
    saveDB();
    toast('Gespeichert ✓');
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
    toast('Gespeichert ✓');
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
      const { startElf } = autoArrangeStartXI(kader, newFormation);
      m.startElf = startElf;
    }
    saveDB();
    toast('Übernommen ✓');
    render();
  }
});

function handleAvatarPick(btn) {
  const form = btn.closest('form');
  if (!form) return;
  const field = btn.dataset.avatarField; // Skin | Hair | HairShape | FaceShape
  const value = btn.dataset.value;
  const input = form.querySelector(`[name="avatar${field}"]`);
  if (input) input.value = value;

  form.querySelectorAll(`[data-avatar-field="${field}"]`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const avatar = {
    skin: form.querySelector('[name="avatarSkin"]').value,
    hair: form.querySelector('[name="avatarHair"]').value,
    hairShape: form.querySelector('[name="avatarHairShape"]').value,
    faceShape: form.querySelector('[name="avatarFaceShape"]').value,
  };
  const preview = document.getElementById('avatarPreview');
  if (preview) preview.innerHTML = avatarSVG(avatar, 84);
}

function openDatePicker(defaultDate, onConfirm, title) {
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">${esc(title || 'Datum wählen')}<button class="icon-btn" id="sheetClose">✕</button></div>
      <input type="date" id="datePickInput" value="${defaultDate}" class="date-picker-input">
      <button class="btn btn-primary btn-block" id="datePickConfirm">Übernehmen</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    if (e.target.id === 'datePickConfirm') {
      const val = document.getElementById('datePickInput').value;
      overlay.remove();
      if (val) onConfirm(val);
    }
  });
}

function handleAction(btn, e) {
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === 'newTrainingToday') {
    const date = todayISO();
    const attendance = {};
    activePlayers().forEach(p => attendance[p.id] = 'offen');
    const t = { id: uid('t'), date, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' } };
    DB.trainings.push(t);
    saveDB();
    nav('trainingDetail', { id: t.id });
  }
  else if (action === 'newTrainingPickDate') {
    openDatePicker(todayISO(), (date) => {
      const attendance = {};
      activePlayers().forEach(p => attendance[p.id] = 'offen');
      const t = { id: uid('t'), date, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' } };
      DB.trainings.push(t);
      saveDB();
      nav('trainingDetail', { id: t.id });
    }, 'Datum des Trainings');
  }
  else if (action === 'editTrainingDate') {
    const t = DB.trainings.find(x => x.id === id);
    openDatePicker(t.date, (date) => {
      t.date = date;
      saveDB();
      render();
    }, 'Datum ändern');
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
    t.teamGen.numTeams = parseInt(btn.dataset.num, 10);
    if (t.teamGen.numTeams !== 2) t.teamGen.mode = 'random'; // Stärke-Split nur für 2 Teams definiert
    t.teamGen.teams = null;
    t.teamGen.teamLabels = null;
    saveDB(); render();
  }
  else if (action === 'setTeamMode') {
    const t = DB.trainings.find(x => x.id === id);
    t.teamGen.mode = btn.dataset.mode;
    t.teamGen.teams = null;
    t.teamGen.teamLabels = null;
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
    if (t.teamGen.numTeams === 2 && t.teamGen.mode === 'strength') {
      const { strong, weak } = generateTeamsBySkill(presentIds, t.teamGen.posOverride);
      t.teamGen.teams = [strong, weak];
      t.teamGen.teamLabels = ['Stärker', 'Schwächer'];
    } else {
      t.teamGen.teams = generateTeams(presentIds, t.teamGen.numTeams, t.teamGen.posOverride);
      t.teamGen.teamLabels = null;
    }
    saveDB(); render();
  }
  else if (action === 'copyTeamsWhatsApp') {
    const t = DB.trainings.find(x => x.id === id);
    const letters = ['A','B','C'];
    const labels = t.teamGen.teamLabels;
    let text = `⚽ Trainingsspiele ${fmtDate(t.date)}\n\n`;
    t.teamGen.teams.forEach((team, i) => {
      text += `Team ${letters[i]}${labels && labels[i] ? ' (' + labels[i] + ')' : ''}\n`;
      team.forEach(pl => text += `- ${pl.name} (${pl.pos})\n`);
      text += '\n';
    });
    copyToClipboard(text.trim());
  }
  else if (action === 'moveTeamPlayer') {
    openTeamMoveSheet(id, btn.dataset.player, parseInt(btn.dataset.from, 10));
  }
  else if (action === 'timerStart') { startTimer(); }
  else if (action === 'timerPause') { pauseTimer(); }
  else if (action === 'timerReset') { resetTimer(); }
  else if (action === 'timerNextRound') { nextRound(); }
  else if (action === 'deletePlayer') {
    const p = playerById(id);
    if (!p) return;
    const hasData = DB.trainings.some(t => t.attendance && t.attendance[id]) ||
                    DB.notes.some(n => n.playerId === id) ||
                    DB.matches.some(m => (m.kader||[]).includes(id));
    let ok;
    if (hasData) {
      ok = confirm(`${p.name} hat bereits Trainings-, Notiz- oder Spieltagsdaten. Endgültiges Löschen entfernt den Spieler dauerhaft; seine bisherigen Einträge bleiben ohne Namen stehen.\n\nEmpfohlen: stattdessen nur deaktivieren.\n\nTrotzdem endgültig löschen?`);
    } else {
      ok = confirm('Spieler wirklich endgültig löschen?');
    }
    if (!ok) return;
    DB.players = DB.players.filter(x => x.id !== id);
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
  else if (action === 'newGeneralNote') {
    const n = { id: uid('gn'), text: '', images: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    DB.generalNotes.push(n);
    saveDB();
    nav('generalNoteForm', { id: n.id });
  }
  else if (action === 'addNotePhoto') {
    const input = document.getElementById('notePhotoInput');
    input.onchange = () => {
      const file = input.files[0];
      if (!file) { return; }
      compressImageToDataURL(file, 1280, 0.72).then(dataUrl => {
        const n = DB.generalNotes.find(x => x.id === id);
        if (!n) return;
        n.images = n.images || [];
        n.images.push(dataUrl);
        n.updatedAt = new Date().toISOString();
        saveDB();
        render();
        toast('Foto hinzugefügt ✓');
      }).catch(() => alert('Foto konnte nicht geladen werden.'));
      input.value = '';
    };
    input.click();
  }
  else if (action === 'removeNotePhoto') {
    const n = DB.generalNotes.find(x => x.id === id);
    if (!n) return;
    const idx = parseInt(btn.dataset.index, 10);
    n.images.splice(idx, 1);
    n.updatedAt = new Date().toISOString();
    saveDB(); render();
  }
  else if (action === 'deleteGeneralNote') {
    if (!confirm('Notiz wirklich löschen?')) return;
    DB.generalNotes = DB.generalNotes.filter(x => x.id !== id);
    saveDB();
    nav('notes');
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
    const hasManual = (m.kader && m.kader.length) || Object.keys(m.startElf||{}).length;
    if (hasManual && !confirm('Bestehender Kader und Startelf werden überschrieben. Fortfahren?')) return;
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
  else if (action === 'toggleWeekday') {
    const val = parseInt(btn.dataset.val, 10);
    DB.settings.trainingWeekdays = DB.settings.trainingWeekdays || [];
    const idx = DB.settings.trainingWeekdays.indexOf(val);
    if (idx >= 0) DB.settings.trainingWeekdays.splice(idx, 1);
    else DB.settings.trainingWeekdays.push(val);
    saveDB();
    const created = generateUpcomingTrainings(14);
    render();
    if (created > 0) toast(`${created} Training(s) angelegt ✓`);
  }
  else if (action === 'fillTrainings') {
    const created = generateUpcomingTrainings(14);
    render();
    toast(created > 0 ? `${created} Training(s) angelegt ✓` : 'Bereits alles angelegt ✓');
  }
  else if (action === 'parseFussballText') {
    const ta = document.getElementById('fussballPasteText');
    const text = ta ? ta.value : '';
    const parsed = parseFussballFixtures(text);
    state.fussballImport = { raw: text, parsed };
    render();
    if (parsed.length === 0) toast('Keine Termine erkannt – bitte Text prüfen');
  }
  else if (action === 'resetFussballImport') {
    state.fussballImport = { raw: '', parsed: [] };
    render();
  }
  else if (action === 'confirmFussballImport') {
    const rows = (state.fussballImport.parsed || []).filter(r => r.checked && r.date);
    const existingDates = new Set(DB.matches.map(m => m.date));
    let count = 0;
    rows.forEach(r => {
      if (existingDates.has(r.date)) return;
      DB.matches.push({
        id: uid('m'), date: r.date, opponent: r.opponent || '', formation: '4-3-3',
        kaderSize: 18, duration: 90, availability: {}, kader: [], startElf: {}, minutes: {},
      });
      existingDates.add(r.date);
      count++;
    });
    saveDB();
    state.fussballImport = { raw: '', parsed: [] };
    toast(count > 0 ? `${count} Spieltag(e) angelegt ✓` : 'Keine neuen Spieltage (Duplikate übersprungen)');
    nav('matchList');
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
    toast('Backup heruntergeladen ✓');
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

  if (btn.classList.contains('prio-select')) {
    const form = btn.closest('form');
    form.querySelector('[name=priority]').value = btn.dataset.prio;
    form.querySelectorAll('.prio-select').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

// Verkleinert/komprimiert ein Foto vor dem Speichern in localStorage (Speicherplatz sparen).
function compressImageToDataURL(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width, height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
            ${avatarSVG(p.avatar, 28)}
            <span>${esc(p.name)} <span class="muted">(${p.posPrimary}${p.posSecondary?'/'+p.posSecondary:''})</span></span>
            ${currentSlot ? `<span class="pos-chip-dark">${currentSlot[0]}</span>` : ''}
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
    const [otherSlot] = existingSlotOfNewPlayer;
    m.startElf[otherSlot] = previousOccupant || null;
    if (!previousOccupant) delete m.startElf[otherSlot];
  }
  m.startElf[slotKey] = newPlayerId;
}

/* -------------------------- Online/Offline & Updates ------------------------------ */

function updateOnlineStatus() {
  const existing = document.getElementById('offlineBadge');
  if (!navigator.onLine) {
    if (!existing) {
      const b = document.createElement('div');
      b.id = 'offlineBadge';
      b.className = 'offline-badge';
      b.textContent = '📡 Offline – Daten werden lokal gespeichert';
      document.body.appendChild(b);
    }
  } else if (existing) {
    existing.remove();
  }
}

function showUpdateBanner(reg) {
  if (document.getElementById('updateBanner')) return;
  const bar = document.createElement('div');
  bar.id = 'updateBanner';
  bar.className = 'update-banner';
  bar.innerHTML = `<span>Neue Version verfügbar</span><button id="updateReloadBtn">Jetzt aktualisieren</button>`;
  document.body.appendChild(bar);
  document.getElementById('updateReloadBtn').addEventListener('click', () => {
    if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
    setTimeout(() => window.location.reload(), 1200);
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner(reg);
            }
          });
        });
      }).catch(err => console.warn('SW-Registrierung fehlgeschlagen', err));
    });
  }
}

/* ---------------------------------- Init ----------------------------------------- */

const autoCreatedTrainings = generateUpcomingTrainings(14);
render();
if (autoCreatedTrainings > 0) toast(`${autoCreatedTrainings} Training(s) automatisch angelegt ✓`);
registerServiceWorker();
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
