'use strict';

/* =========================================================================
   SV Menden U19/2 – Trainer App
   Alles läuft lokal im Browser (localStorage). Keine Server, keine Logins.
   ========================================================================= */

/* ---------------------------- Konstanten ------------------------------- */

const DB_KEY = 'svmU19TrainerDB';
const DB_VERSION = 8;

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

const MATCH_STATUS = {
  zugesagt:       { label: 'Zugesagt',      cls: 'st-da' },
  abgesagt:       { label: 'Abgesagt',      cls: 'st-abgesagt' },
  unentschuldigt: { label: 'Unentsch.',     cls: 'st-unentsch' },
  offen:          { label: 'Offen',         cls: 'st-offen' },
  nichtImKader:   { label: 'Nicht im Kader', cls: 'st-nichtimkader' },
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
    { key:'LM',  label:'LM',  group:'MID', x:10, y:48, pref:['LM','LF'] },
    { key:'ZM1', label:'ZM',  group:'MID', x:37, y:52, pref:['ZM','DM','OM'] },
    { key:'ZM2', label:'ZM',  group:'MID', x:63, y:52, pref:['ZM','DM','OM'] },
    { key:'RM',  label:'RM',  group:'MID', x:90, y:48, pref:['RM','RF'] },
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
    { key:'LM',  label:'LM',  group:'MID', x:10, y:36, pref:['LM','LF'] },
    { key:'OM',  label:'OM',  group:'MID', x:50, y:34, pref:['OM'] },
    { key:'RM',  label:'RM',  group:'MID', x:90, y:36, pref:['RM','RF'] },
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
    { key:'LM',  label:'LM',  group:'MID', x:8,  y:52, pref:['LM','LV','LF'] },
    { key:'DM1', label:'DM',  group:'MID', x:37, y:58, pref:['DM'] },
    { key:'ZM',  label:'ZM',  group:'MID', x:50, y:48, pref:['ZM','DM','OM'] },
    { key:'DM2', label:'DM',  group:'MID', x:63, y:58, pref:['DM'] },
    { key:'RM',  label:'RM',  group:'MID', x:92, y:52, pref:['RM','RV','RF'] },
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
    { key:'LF',  label:'LF',  group:'FWD', x:14, y:16, pref:['LF','LM'] },
    { key:'ST',  label:'ST',  group:'FWD', x:50, y:10, pref:['ST'] },
    { key:'RF',  label:'RF',  group:'FWD', x:86, y:16, pref:['RF','RM'] },
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
  strength: '', devPoint: '', focus: '', avatar: defaultAvatarFor(id), birthday: null,
}));

// Beispielübungen inkl. fertiger Grafik, damit die Übungsbibliothek nicht leer startet
// und als Vorlage dient, wie eigene Grafiken aufgebaut werden können.
const SEED_EXERCISES = [
  {
    id: 'ex_seed1', name: 'Passdreieck', category: 'Technik', duration: 10,
    description: 'Drei Spieler bilden ein Dreieck und passen sich den Ball zu. Nach jedem Pass hinterherlaufen und Position wechseln. Auf sauberen ersten Kontakt achten.',
    materials: 'Ein Ball',
    diagram: { elements: [
      { id: 'e1', type: 'player', x: 25, y: 78 },
      { id: 'e2', type: 'player', x: 75, y: 78 },
      { id: 'e3', type: 'player', x: 50, y: 25 },
      { id: 'e4', type: 'ball', x: 50, y: 60 },
    ]},
  },
  {
    id: 'ex_seed2', name: '1 gegen 1 auf Minitore', category: 'Zweikampf', duration: 12,
    description: 'Zweikampf 1 gegen 1 auf zwei kleine Hütchentore. Angreifer startet mit Ball, Verteidiger schließt den Abstand. Nach Ballgewinn oder Torabschluss Rollenwechsel.',
    materials: '4 Hütchen, ein Ball pro Paar',
    diagram: { elements: [
      { id: 'e1', type: 'player', x: 30, y: 82 },
      { id: 'e2', type: 'player', x: 70, y: 18 },
      { id: 'e3', type: 'ball', x: 30, y: 70 },
      { id: 'e4', type: 'cone', x: 12, y: 50 },
      { id: 'e5', type: 'cone', x: 25, y: 50 },
      { id: 'e6', type: 'cone', x: 75, y: 50 },
      { id: 'e7', type: 'cone', x: 88, y: 50 },
    ]},
  },
  {
    id: 'ex_seed3', name: 'Sprint-Parcours', category: 'Fitness', duration: 8,
    description: 'Hütchen im Abstand von ca. 5 Metern aufstellen. Sprint zum ersten Hütchen, seitliches Ablaufen zum zweiten, Rückwärtslaufen zum dritten. 3 Durchgänge mit Pause.',
    materials: '4 Hütchen',
    diagram: { elements: [
      { id: 'e1', type: 'player', x: 12, y: 90 },
      { id: 'e2', type: 'cone', x: 15, y: 78 },
      { id: 'e3', type: 'cone', x: 38, y: 58 },
      { id: 'e4', type: 'cone', x: 61, y: 38 },
      { id: 'e5', type: 'cone', x: 84, y: 18 },
    ]},
  },
  {
    id: 'ex_seed4', name: '4-Tore-Spiel', category: 'Taktik', duration: 15,
    description: 'Zwei Teams spielen auf vier kleine Tore (je zwei pro Seite). Fördert Breite im Spielaufbau und schnelles Umschalten, sobald ein Tor droht.',
    materials: '8 Hütchen für 4 Minitore, Leibchen',
    diagram: { elements: [
      { id: 'e1', type: 'cone', x: 8, y: 22 }, { id: 'e2', type: 'cone', x: 8, y: 36 },
      { id: 'e3', type: 'cone', x: 8, y: 64 }, { id: 'e4', type: 'cone', x: 8, y: 78 },
      { id: 'e5', type: 'cone', x: 92, y: 22 }, { id: 'e6', type: 'cone', x: 92, y: 36 },
      { id: 'e7', type: 'cone', x: 92, y: 64 }, { id: 'e8', type: 'cone', x: 92, y: 78 },
      { id: 'e9', type: 'player', x: 35, y: 50 }, { id: 'e10', type: 'player', x: 65, y: 50 },
      { id: 'e11', type: 'ball', x: 50, y: 50 },
    ]},
  },
];
function cloneSeedExercises() {
  return SEED_EXERCISES.map(e => ({ ...e, diagram: { elements: e.diagram.elements.map(el => ({...el})) } }));
}

/* ------------------------------ Storage --------------------------------- */

function freshDB() {
  return {
    version: DB_VERSION,
    players: SEED_PLAYERS.map(p => ({...p, avatar: {...p.avatar}})),
    trainings: [],
    notes: [],
    generalNotes: [],
    matches: [],
    exercises: cloneSeedExercises(),
    settings: { trainingWeekdays: [1, 4], lastBackupAt: null, exercisesSeeded: true }, // Standard: Montag + Donnerstag
  };
}

function migrate(db) {
  if (!db.version) db.version = 1;
  db.players = (db.players || []).map(p => {
    if (!p.avatar) p.avatar = defaultAvatarFor(p.id);
    if (!('birthday' in p)) p.birthday = null;
    return p;
  });
  db.generalNotes = db.generalNotes || [];
  db.settings = db.settings || {};
  if (!db.settings.trainingWeekdays) db.settings.trainingWeekdays = [1, 4];
  // Bereits vorhandene Spieltage mit ausgefülltem Kader gelten als abgeschlossen (sonst
  // würden bisher gezählte Einsatzstatistiken plötzlich verschwinden). Leere/geplante
  // Spieltage starten als nicht abgeschlossen und müssen manuell bestätigt werden.
  db.matches = (db.matches || []).map(m => {
    if (typeof m.completed !== 'boolean') {
      m.completed = !!(m.kader && m.kader.length > 0);
    }
    // Zusagen früher als true/false gespeichert, jetzt als Status wie beim Training.
    m.availability = m.availability || {};
    Object.keys(m.availability).forEach(pid => {
      const v = m.availability[pid];
      if (v === true) m.availability[pid] = 'zugesagt';
      else if (v === false) m.availability[pid] = 'abgesagt';
      else if (typeof v !== 'string') m.availability[pid] = 'offen';
    });
    // Spielminuten-Erfassung wurde entfernt.
    delete m.minutes;
    delete m.duration;
    return m;
  });
  db.exercises = db.exercises || [];
  db.trainings.forEach(t => { t.sessionPlan = t.sessionPlan || []; });
  if (!('lastBackupAt' in db.settings)) db.settings.lastBackupAt = null;
  // Beispielübungen einmalig nachrüsten, falls noch keine eigenen angelegt wurden
  // (nur beim allerersten Mal, damit absichtlich gelöschte Beispiele nicht zurückkehren).
  if (!db.settings.exercisesSeeded) {
    if (db.exercises.length === 0) db.exercises = cloneSeedExercises();
    db.settings.exercisesSeeded = true;
  }
  // Zukünftige Migrationen hier einhängen, z.B.:
  // if (db.version < 8) { ...db.version = 8; }
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
    db.exercises = db.exercises || [];
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
// Legt so lange Trainings an den in DB.settings.trainingWeekdays hinterlegten
// Wochentagen an, bis insgesamt `count` anstehende Trainings (heute oder in der
// Zukunft) existieren - unabhängig davon, wie viele Tage das umfasst. Bereits
// vorhandene anstehende Trainings zählen mit, damit nicht immer wieder neue über
// das Ziel hinaus entstehen.
function generateUpcomingTrainings(count) {
  count = count || 2;
  const weekdays = DB.settings.trainingWeekdays || [];
  if (!weekdays.length) return 0;
  const todayStr = todayISO();
  const existingDates = new Set(DB.trainings.map(t => t.date));
  const upcomingCount = DB.trainings.filter(t => t.date >= todayStr).length;
  let needed = Math.max(0, count - upcomingCount);
  if (needed === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let created = 0;
  for (let i = 0; i < 60 && needed > 0; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (!weekdays.includes(d.getDay())) continue;
    const iso = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (existingDates.has(iso)) continue;
    const attendance = {};
    activePlayers().forEach(p => attendance[p.id] = 'offen');
    DB.trainings.push({ id: uid('t'), date: iso, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' }, sessionPlan: [] });
    existingDates.add(iso);
    created++;
    needed--;
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
function fmtBirthday(bday) {
  if (!bday) return null;
  const parts = bday.split('-');
  if (parts.length < 3) return null;
  const m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
  if (!m || !d) return null;
  return `${d}. ${MONTH_NAMES[m-1]}`;
}
// Aktive Spieler, die heute Geburtstag haben, mit dem Alter, das sie heute erreichen.
function todaysBirthdays() {
  const todayMD = todayISO().slice(5);
  const year = new Date().getFullYear();
  return activePlayers()
    .filter(p => p.birthday && p.birthday.slice(5) === todayMD)
    .map(p => ({ name: p.name, age: year - p.jahrgang }));
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

// Ein Training zählt erst in der Statistik, wenn für JEDEN Spieler ein echter Status
// gesetzt wurde (kein "offen" mehr übrig) - verhindert, dass automatisch angelegte,
// noch nicht stattgefundene Trainings die Trainingsbeteiligung verfälschen.
function isTrainingComplete(t) {
  const values = Object.values(t.attendance || {});
  if (values.length === 0) return false;
  return values.every(s => s !== 'offen');
}

// Wählt das für "Teams erstellen" sinnvollste Standard-Training: zuerst das
// heutige, sonst das nächste bevorstehende, sonst notfalls das zuletzt vergangene.
function pickDefaultTraining() {
  if (DB.trainings.length === 0) return null;
  const todayStr = todayISO();
  const today = DB.trainings.find(t => t.date === todayStr);
  if (today) return today;
  const future = DB.trainings.filter(t => t.date > todayStr).sort((a,b) => a.date < b.date ? -1 : 1);
  if (future.length) return future[0];
  const past = DB.trainings.filter(t => t.date < todayStr).sort((a,b) => b.date < a.date ? -1 : 1);
  return past[0] || null;
}

function trainingsForPlayer(playerId) {
  return DB.trainings
    .filter(t => t.attendance && Object.prototype.hasOwnProperty.call(t.attendance, playerId))
    .filter(isTrainingComplete)
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
    <text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="19" font-weight="800" fill="currentColor">${stats.quote}%</text>
    <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.6">Beteiligung</text>
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

// Ein Spieltag zählt erst in der Statistik, wenn der Trainer ihn manuell als
// abgeschlossen markiert hat (Kader/Startelf final) - sonst würden geplante,
// aber noch nicht gespielte Spieltage die Einsatzstatistik verfälschen.
function matchStats(playerId) {
  const completed = DB.matches.filter(m => m.completed);
  let imKader = 0, startelf = 0, nichtImKader = 0;
  completed.forEach(m => {
    if ((m.kader || []).includes(playerId)) {
      imKader++;
      if (Object.values(m.startElf || {}).includes(playerId)) startelf++;
    } else if ((m.availability || {})[playerId] === 'nichtImKader') {
      nichtImKader++;
    }
  });
  return { imKader, startelf, bank: imKader - startelf, nichtImKader };
}

// Erzeugt kategorisierte Hinweise (rot = sehr bedenklich, gelb = weniger bedenklich,
// grün = besonders gut). Negative Hinweise haben Vorrang, grün ist auf max. 3 begrenzt,
// insgesamt werden maximal 10 Hinweise zurückgegeben.
function computeHints() {
  const red = [];
  const yellow = [];
  const greenCandidates = [];
  const players = activePlayers();

  players.forEach(p => {
    const s = playerStats(p.id);
    if (s.total < 2) return;

    const last3 = s.list.slice(-3);
    if (last3.length === 3 && last3.every(t => t.attendance[p.id] !== 'anwesend')) {
      red.push({ text: `${p.name} – 3 Trainings in Folge nicht anwesend`, weight: 100 });
    }
    const last5 = s.list.slice(-5);
    const unentsch5 = last5.filter(t => t.attendance[p.id] === 'unentschuldigt').length;
    if (unentsch5 >= 2) {
      red.push({ text: `${p.name} – ${unentsch5}x unentschuldigt in den letzten ${last5.length} Trainings`, weight: 95 });
    } else if (unentsch5 === 1) {
      yellow.push({ text: `${p.name} – 1x unentschuldigt in den letzten ${last5.length} Trainings`, weight: 35 });
    }
    if (s.total >= 3 && s.quote < 60) {
      red.push({ text: `${p.name} – Trainingsbeteiligung unter 60 % (${s.quote} %)`, weight: 90 });
    } else if (s.total >= 3 && s.quote < 75) {
      yellow.push({ text: `${p.name} – Trainingsbeteiligung im unteren Mittelfeld (${s.quote} %)`, weight: 40 });
    }
    if (s.last5Quote != null && s.total >= 5 && s.last5Quote < s.quote - 15) {
      yellow.push({ text: `${p.name} – Trainingsbeteiligung zuletzt deutlich gesunken`, weight: 60 });
    }
  });

  const withStats = players.map(p => ({ p, s: playerStats(p.id) })).filter(x => x.s.total >= 3);
  if (withStats.length) {
    const maxQuote = Math.max(...withStats.map(x => x.s.quote));
    if (maxQuote > 0) {
      withStats.filter(x => x.s.quote === maxQuote).forEach(x => {
        greenCandidates.push({ text: `${x.p.name} – beste Trainingsbeteiligung der Mannschaft (${maxQuote} %)`, weight: 200 + maxQuote });
      });
    }
  }
  withStats.forEach(({ p, s }) => {
    if (s.last5Quote != null && s.total >= 5 && s.last5Quote > s.quote + 15) {
      greenCandidates.push({ text: `${p.name} – Trainingsbeteiligung deutlich gesteigert (${s.quote} % → ${s.last5Quote} %)`, weight: 150 + (s.last5Quote - s.quote) });
    }
    const lastStreak = s.list.slice(-6);
    if (lastStreak.length >= 5 && lastStreak.every(t => t.attendance[p.id] === 'anwesend')) {
      greenCandidates.push({ text: `${p.name} – ${lastStreak.length}x in Folge anwesend`, weight: 100 + lastStreak.length });
    }
  });

  red.sort((a,b) => b.weight - a.weight);
  yellow.sort((a,b) => b.weight - a.weight);
  greenCandidates.sort((a,b) => b.weight - a.weight);

  const green = greenCandidates.slice(0, 3).map(h => ({ text: h.text, level: 'green' }));
  const remainingSlots = Math.max(0, 10 - green.length);
  const redCountKept = Math.min(red.length, remainingSlots);
  const negFinal = [...red, ...yellow].slice(0, remainingSlots).map((h, i) => ({
    text: h.text,
    level: i < redCountKept ? 'red' : 'yellow',
  }));

  return [...negFinal, ...green];
}

function teamQuote() {
  const players = activePlayers();
  const withData = players.map(p => playerStats(p.id)).filter(s => s.total > 0);
  if (withData.length === 0) return null;
  const sum = withData.reduce((a,s) => a + s.quote, 0);
  return Math.round(sum / withData.length);
}

// Gibt zurück, vor wie vielen Tagen zuletzt ein Backup exportiert wurde, oder null,
// wenn noch nie eines exportiert wurde.
function daysSinceBackup() {
  const at = DB.settings.lastBackupAt;
  if (!at) return null;
  const then = new Date(at);
  if (isNaN(then.getTime())) return null;
  const diffMs = Date.now() - then.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
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

// Ermittelt eine sinnvolle Formations-Richtgröße (Abwehr/Sechser/Mittelfeld/Sturm) für
// eine gegebene Anzahl Feldspieler PRO TEAM (Torhüter nicht mitgezählt). Kleinere
// Teams bekommen bewusst nur einen Sechser und eine Dreierkette statt einer vollen
// Viererkette, damit nicht zu viele Spieler in der Abwehr "geparkt" werden.
function computeFormationShape(perTeam) {
  if (perTeam <= 0) return { def: 0, dm: 0, mid: 0, fwd: 0 };
  let fwd = perTeam <= 8 ? 1 : 2;
  let dm = perTeam <= 5 ? 0 : (perTeam <= 9 ? 1 : 2);
  let def = perTeam <= 9 ? (perTeam <= 4 ? Math.max(1, perTeam - fwd - dm - 1) : 3) : 4;
  let mid = perTeam - def - dm - fwd;
  while (mid < 0 && def > 1) { def--; mid++; }
  while (mid < 0 && fwd > 0) { fwd--; mid++; }
  if (mid < 0) mid = 0;
  return { def, dm, mid, fwd };
}

// Füllt Teams, die noch unter `perTeam` Spielern liegen, reihum (jeweils das kleinste
// Team zuerst) mit den übrigen Spielern auf. Bei nicht exakt durch die Teamzahl
// teilbarer Gesamtzahl bleibt am Ende genau ein Spieler neutral (keinem Team
// zugeteilt), da er sonst ein Team größer als die anderen machen würde.
function fillTeamsToSize(teams, leftoverPlayers, perTeam, posOf) {
  // perTeam bezieht sich nur auf Feldspieler; Teams mit Torhüter dürfen daher ein
  // Feld mehr bekommen, sonst würden sie fälschlich schon zu früh als "voll" gelten.
  const targetSize = teams.map(t => perTeam + (t.some(p => p.pos === 'TW') ? 1 : 0));
  const neutral = [];
  leftoverPlayers.forEach(p => {
    let idx = 0;
    for (let i = 1; i < teams.length; i++) {
      if (teams[i].length < teams[idx].length) idx = i;
    }
    const e = { id: p.id, name: p.name, pos: posOf(p) };
    if (teams[idx].length < targetSize[idx]) teams[idx].push(e); else neutral.push(e);
  });
  return neutral;
}

function generateTeams(presentIds, numTeams, overrideMap) {
  const players = presentIds.map(playerById).filter(Boolean);
  const posOf = p => effectivePosition(p, overrideMap);

  const tws = shuffle(players.filter(p => posOf(p) === 'TW'));
  let outfield = players.filter(p => posOf(p) !== 'TW');
  const perTeam = Math.floor(outfield.length / numTeams);
  const shape = computeFormationShape(perTeam);
  const teams = Array.from({ length: numTeams }, () => []);

  tws.forEach((p, i) => {
    if (i < numTeams) teams[i].push({ id: p.id, name: p.name, pos: 'TW' });
    else outfield.push(p);
  });

  const pools = {
    DEF: shuffle(outfield.filter(p => GROUP_OF[posOf(p)] === 'DEF')),
    DM:  shuffle(outfield.filter(p => posOf(p) === 'DM')),
    MID: shuffle(outfield.filter(p => GROUP_OF[posOf(p)] === 'MID' && posOf(p) !== 'DM')),
    FWD: shuffle(outfield.filter(p => GROUP_OF[posOf(p)] === 'FWD')),
  };
  const targets = { DEF: shape.def, DM: shape.dm, MID: shape.mid, FWD: shape.fwd };
  const leftover = [];
  ['DEF','DM','MID','FWD'].forEach(key => {
    pools[key].forEach((p, i) => {
      const teamIdx = i % numTeams;
      const slot = Math.floor(i / numTeams);
      if (slot < targets[key]) teams[teamIdx].push({ id: p.id, name: p.name, pos: posOf(p) });
      else leftover.push(p);
    });
  });

  const neutral = fillTeamsToSize(teams, shuffle(leftover), perTeam, posOf);
  return { teams, neutral };
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
  // Deterministisch (kein Zufalls-Tiebreaker mehr): "Nach Stärke" soll bei erneuter
  // Berechnung (z.B. nach Positionsanpassung) nicht einfach neu durchmischen.
  return players
    .slice()
    .sort((a,b) => playerStrengthScore(b.id) - playerStrengthScore(a.id) || a.name.localeCompare(b.name, 'de'));
}

// Teilt anwesende Spieler in eine stärkere und eine schwächere Gruppe auf, getrennt nach
// Trainings-/Spielbeteiligung, aber je Positionsgruppe (Verteidigung/Mittelfeld/Sturm), damit
// beide Gruppen möglichst eine sinnvolle Positionsverteilung behalten. Die stärkere Gruppe
// bekommt bevorzugt einen Torhüter, falls einer anwesend ist.
function generateTeamsBySkill(presentIds, overrideMap) {
  const players = presentIds.map(playerById).filter(Boolean);
  const posOf = p => effectivePosition(p, overrideMap);

  const tws = sortByStrengthDesc(players.filter(p => posOf(p) === 'TW'));
  let outfield = players.filter(p => posOf(p) !== 'TW');
  const perTeam = Math.floor(outfield.length / 2);
  const shape = computeFormationShape(perTeam);

  const strong = [];
  const weak = [];

  if (tws.length === 1) {
    strong.push({ id: tws[0].id, name: tws[0].name, pos: 'TW' });
  } else if (tws.length >= 2) {
    strong.push({ id: tws[0].id, name: tws[0].name, pos: 'TW' });
    weak.push({ id: tws[1].id, name: tws[1].name, pos: 'TW' });
    outfield = outfield.concat(tws.slice(2));
  }

  const pools = {
    DEF: sortByStrengthDesc(outfield.filter(p => GROUP_OF[posOf(p)] === 'DEF')),
    DM:  sortByStrengthDesc(outfield.filter(p => posOf(p) === 'DM')),
    MID: sortByStrengthDesc(outfield.filter(p => GROUP_OF[posOf(p)] === 'MID' && posOf(p) !== 'DM')),
    FWD: sortByStrengthDesc(outfield.filter(p => GROUP_OF[posOf(p)] === 'FWD')),
  };
  const targets = { DEF: shape.def, DM: shape.dm, MID: shape.mid, FWD: shape.fwd };
  const leftover = [];
  ['DEF','DM','MID','FWD'].forEach(key => {
    const target = targets[key];
    pools[key].forEach((p, i) => {
      const entry = { id: p.id, name: p.name, pos: posOf(p) };
      if (i < target) strong.push(entry);
      else if (i < target * 2) weak.push(entry);
      else leftover.push(p);
    });
  });

  const teams = [strong, weak];
  const neutral = fillTeamsToSize(teams, sortByStrengthDesc(leftover), perTeam, posOf);
  return { strong, weak, neutral };
}

// Teilt anwesende Spieler in "Offensive" (Stürmer, 10er/OM, Flügelspieler LM/RM, ein
// angriffslastiger 6er) gegen "Defensive" (komplette Abwehr, Torwart, ein
// defensiverer 6er) auf. Der Rest wird positionsgerecht auf beide Teams verteilt,
// damit am Ende zwei vollständige, spielbare Mannschaften entstehen.
// "Gute" Spieler werden für diesen Modus anhand der Beteiligung der letzten 5 Trainings
// bestimmt (nicht der Saisonquote), da das die aktuelle Form besser abbildet.
function last5Quote(playerId) {
  const s = playerStats(playerId);
  return s.last5Quote != null ? s.last5Quote : s.quote;
}
function sortByLast5Desc(players) {
  // Deterministisch, aus demselben Grund wie sortByStrengthDesc.
  return players
    .slice()
    .sort((a,b) => last5Quote(b.id) - last5Quote(a.id) || a.name.localeCompare(b.name, 'de'));
}

// Team Offensive bekommt die BESTEN Angreifer (Stürmer/10er/Flügel) plus einen
// angriffslastigen 6er - begrenzt auf die Formations-Richtgröße -; die Abwehr dieses
// Teams wird mit den SCHLECHTEREN Verteidigern aufgefüllt. Team Defensive bekommt
// spiegelbildlich die beste Abwehr plus einen defensiven 6er, aufgefüllt mit den
// schlechteren Angreifern. So spielen die guten Offensivspieler gegen die guten
// Defensivspieler, und keines der Teams wird positionell einseitig.
function generateOffenseDefenseTeams(presentIds, overrideMap) {
  const players = presentIds.map(playerById).filter(Boolean);
  const posOf = p => effectivePosition(p, overrideMap);
  const entry = (p, pos) => ({ id: p.id, name: p.name, pos: pos || posOf(p) });

  const attackPositions = ['ST', 'LF', 'RF', 'OM', 'LM', 'RM'];
  const defensePositions = ['IV', 'LV', 'RV'];

  const tws = sortByLast5Desc(players.filter(p => posOf(p) === 'TW'));
  let outfield = players.filter(p => posOf(p) !== 'TW');
  const perTeam = Math.floor(outfield.length / 2);
  const shape = computeFormationShape(perTeam);
  const attackNeed = shape.mid + shape.fwd; // 10er, Flügel und Stürmer zusammen
  const defNeed = shape.def;

  const usedIds = new Set();
  const teamOffense = [];
  const teamDefense = [];
  const leftover = [];

  if (tws[0]) { teamDefense.push(entry(tws[0], 'TW')); usedIds.add(tws[0].id); }
  if (tws[1]) { teamOffense.push(entry(tws[1], 'TW')); usedIds.add(tws[1].id); }
  outfield = outfield.concat(tws.slice(2));

  // Angreifer nach Form sortiert: die besten `attackNeed` zur Offensive (ihre
  // Spezialität), die nächsten `attackNeed` als Auffüllung zur Defensive, Rest in
  // den allgemeinen Restpool.
  const attackers = sortByLast5Desc(outfield.filter(p => !usedIds.has(p.id) && attackPositions.includes(posOf(p))));
  attackers.forEach((p, i) => {
    usedIds.add(p.id);
    const e = entry(p);
    if (i < attackNeed) teamOffense.push(e);
    else if (i < attackNeed * 2) teamDefense.push(e);
    else leftover.push(p);
  });

  // Verteidiger nach Form sortiert: die besten `defNeed` zur Defensive, die nächsten
  // `defNeed` als Auffüllung zur Offensive, Rest in den allgemeinen Restpool.
  const defenders = sortByLast5Desc(outfield.filter(p => !usedIds.has(p.id) && defensePositions.includes(posOf(p))));
  defenders.forEach((p, i) => {
    usedIds.add(p.id);
    const e = entry(p);
    if (i < defNeed) teamDefense.push(e);
    else if (i < defNeed * 2) teamOffense.push(e);
    else leftover.push(p);
  });

  // Die "6er" (DM) nur, wenn die Formation für die aktuelle Teamgröße überhaupt einen
  // vorsieht: der beste mit angriffslastiger Sekundärposition zur Offensive, der
  // beste mit defensiver Sekundärposition zur Defensive.
  const dms = sortByLast5Desc(outfield.filter(p => !usedIds.has(p.id) && posOf(p) === 'DM'));
  if (shape.dm > 0) {
    let attackDM = dms.find(p => p.posSecondary && attackPositions.includes(p.posSecondary));
    let defenseDM = dms.find(p => p !== attackDM && p.posSecondary && defensePositions.includes(p.posSecondary));
    if (!attackDM && dms.length) attackDM = dms.find(p => p !== defenseDM);
    if (!defenseDM && dms.length) defenseDM = dms.find(p => p !== attackDM);
    if (attackDM) { teamOffense.push(entry(attackDM, 'DM')); usedIds.add(attackDM.id); }
    if (defenseDM) { teamDefense.push(entry(defenseDM, 'DM')); usedIds.add(defenseDM.id); }
  }
  dms.forEach(p => { if (!usedIds.has(p.id)) leftover.push(p); });

  // Rest (ZM, überzählige TW, nicht verwendete Angreifer/Verteidiger/6er) auf das
  // jeweils kleinere Team verteilen; was am Ende nicht mehr passt, bleibt neutral.
  outfield.forEach(p => { if (!usedIds.has(p.id) && !leftover.includes(p)) leftover.push(p); });

  const teams = [teamOffense, teamDefense];
  const neutral = fillTeamsToSize(teams, sortByLast5Desc(leftover), perTeam, posOf);
  return { offense: teamOffense, defense: teamDefense, neutral };
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

// Für die manuelle Spielerauswahl auf dem Feld: nur echte Positions-Treffer zählen
// (kein loses "gleiche Gruppe"-Fallback wie bei der Automatik), damit z.B. bei einer
// DM-Position nicht ein reiner Verteidiger mit fachfremder Sekundärposition vor
// echten DM-Kandidaten auftaucht.
function slotPickerScore(slot, player) {
  if (slot.pref) {
    if (slot.pref.includes(player.posPrimary)) return 2;
    if (player.posSecondary && slot.pref.includes(player.posSecondary)) return 1;
    return 0;
  }
  if (GROUP_OF[player.posPrimary] === slot.group) return 2;
  if (player.posSecondary && GROUP_OF[player.posSecondary] === slot.group) return 1;
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

// Hält den Kader eines Spieltags mit den Zusagen synchron: wer absagt, fehlt
// oder auf "Nicht im Kader" gesetzt wird, fliegt aus Kader und Startelf. Wer zusagt,
// kommt automatisch auf die Bank, sofern schon ein Kader existiert und Platz ist.
// Gibt eine kurze Meldung zurück, wenn sich etwas geändert hat.
function syncKaderWithAvailability(m, pid) {
  m.kader = m.kader || [];
  m.startElf = m.startElf || {};
  const status = m.availability[pid];
  const p = playerById(pid);
  const name = p ? p.name : 'Spieler';
  const inKader = m.kader.includes(pid);
  if (['abgesagt', 'unentschuldigt', 'nichtImKader'].includes(status) && inKader) {
    m.kader = m.kader.filter(x => x !== pid);
    let wasStarter = false;
    Object.keys(m.startElf).forEach(slot => { if (m.startElf[slot] === pid) { delete m.startElf[slot]; wasStarter = true; } });
    return `${name} aus dem Kader genommen${wasStarter ? ' – Startelf-Position ist jetzt frei' : ''}`;
  }
  if (status === 'zugesagt' && !inKader && m.kader.length > 0 && m.kader.length < m.kaderSize) {
    m.kader.push(pid);
    return `${name} auf die Bank gesetzt`;
  }
  return null;
}

function autoSelectKaderAndXI(formationKey, kaderSize, availabilityMap) {
  const formation = FORMATIONS[formationKey];
  const candidates = activePlayers().filter(p => {
    const av = availabilityMap && availabilityMap[p.id];
    return av !== 'abgesagt' && av !== 'unentschuldigt' && av !== 'nichtImKader';
  });
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
  playerFilter: { search: '', position: '', sortBy: 'trainingQuote' },
  trainingFilter: { period: 'all' },
  fussballImport: { raw: '', parsed: [] },
  teamSwapSelection: null,
  matchSwapSelection: null,
  detailsOpen: {},
  exerciseFilter: { category: '' },
  sidebarOpen: false,
  flashKeys: [],
  matchTab: {},
};

function isDetailsOpen(key, defaultOpen) {
  if (state.detailsOpen && Object.prototype.hasOwnProperty.call(state.detailsOpen, key)) {
    return state.detailsOpen[key];
  }
  return defaultOpen;
}

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
  state.sidebarOpen = false;
  state.teamSwapSelection = null;
  state.matchSwapSelection = null;
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
    case 'exercises': html = viewExercises(); break;
    case 'exerciseForm': html = viewExerciseForm(state.params.id); break;
    case 'importFussball': html = viewImportFussball(); break;
    default: html = viewDashboard();
  }
  app.innerHTML = html;
  bindNav();
  // Flash-Markierungen gelten nur für genau dieses eine Rendern (Animation läuft einmal).
  state.flashKeys = [];

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

function emptyState(icon, text, btnHtml) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${text}</p>${btnHtml || ''}</div>`;
}

const DOUBLE_TAP_MS = 450;
function isDoubleTap(sel) {
  return !!(sel && sel.at && (Date.now() - sel.at) < DOUBLE_TAP_MS);
}

function flashClass(key) {
  return (state.flashKeys || []).includes(key) ? 'just-set' : '';
}

function bindNav() {
  document.querySelectorAll('.tabbar button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === topLevel(state.route));
  });
}
function topLevel(route) {
  if (['dashboard'].includes(route)) return 'dashboard';
  if (['trainingList','trainingDetail'].includes(route)) return 'trainingList';
  if (['exercises','exerciseForm'].includes(route)) return 'exercises';
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
    <button data-tab="players" data-nav="players"><span>👥</span>Spieler</button>
    <button data-tab="trainingList" data-nav="trainingList"><span>📋</span>Training</button>
    <button data-tab="teams" data-nav="teams"><span>⚽</span>Teams</button>
    <button data-tab="matchList" data-nav="matchList"><span>🏟️</span>Spieltag</button>
    <button data-tab="exercises" data-nav="exercises"><span>📚</span>Übungen</button>
  </nav>`;
}

/* ------------------------------- Dashboard --------------------------------- */

function viewDashboard() {
  const hints = computeHints();
  const focus = recommendedFocus();
  const openImportant = DB.notes.filter(n => !n.done && n.priority === 'Hoch').length;
  const tq = teamQuote();
  const backupDays = daysSinceBackup();
  const showBackupReminder = backupDays === null || backupDays >= 21;
  const birthdays = todaysBirthdays();

  return `
  <header class="topbar topbar--brand">
    <div class="brand">
      <div class="brand-badge">U19</div>
      <div>
        <h1>SV Menden U19/2</h1>
        <div class="brand-sub">Trainer-Cockpit</div>
      </div>
    </div>
    <button class="icon-btn" data-action="toggleSidebar" title="Menü">☰</button>
  </header>
  <main class="content">
    ${birthdays.length ? `<div class="callout callout--birthday">
      <div class="callout-title">🎂 Geburtstag${birthdays.length > 1 ? 'e' : ''} heute</div>
      <div class="callout-body">${birthdays.map(b => `${esc(b.name)} wird ${b.age}`).join(' · ')}</div>
    </div>` : ''}

    ${showBackupReminder ? `<div class="callout callout--backup">
      <div class="callout-title">💾 Backup-Erinnerung</div>
      <div class="callout-body">${backupDays === null ? 'Noch nie gesichert.' : `Letztes Backup vor ${backupDays} Tagen.`} Jetzt sichern, damit nichts verloren geht.</div>
      <button class="btn btn-block" data-nav="backup">Zum Backup</button>
    </div>` : ''}

    ${renderTodayCards()}

    <div class="section-head"><span>Überblick</span></div>
    <div class="grid2">
      <div class="stat-card"><div class="stat-num">${activePlayers().length}</div><div class="stat-label">Spieler</div></div>
      <div class="stat-card"><div class="stat-num">${DB.trainings.filter(isTrainingComplete).length}</div><div class="stat-label">Trainings erfasst</div></div>
      <div class="stat-card"><div class="stat-num">${openImportant}</div><div class="stat-label">Wichtige Notizen offen</div></div>
      <div class="stat-card"><div class="stat-num">${tq != null ? tq + ' %' : '–'}</div><div class="stat-label">Ø Trainingsbeteiligung</div></div>
    </div>

    ${focus ? `<div class="callout callout--blue">
      <div class="callout-title">Empfohlener Trainingsschwerpunkt</div>
      <div class="callout-body">${esc(focus)}</div>
    </div>` : ''}

    ${hints.length ? `<div class="callout callout--hints">
      <div class="callout-title">Hinweise (${hints.length})</div>
      <ul class="hint-list">${hints.map(h => `<li class="hint-item hint-${h.level}">${esc(h.text)}</li>`).join('')}</ul>
    </div>` : ''}
  </main>
  ${renderDashboardSidebar()}
  ${tabbar()}`;
}

const WEEKDAY_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
function relDayLabel(iso) {
  const today = todayISO();
  if (iso === today) return 'Heute';
  const d = new Date(iso + 'T12:00:00');
  const t = new Date(today + 'T12:00:00');
  const diff = Math.round((d - t) / 86400000);
  if (diff === 1) return 'Morgen';
  return `${WEEKDAY_SHORT[d.getDay()]}, ${fmtDate(iso)}`;
}

// "Was steht als Nächstes an?" – nächstes Training und nächster offener Spieltag.
function renderTodayCards() {
  const today = todayISO();
  const nextTraining = DB.trainings.filter(t => t.date >= today).sort((a,b) => a.date < b.date ? -1 : 1)[0];
  const nextMatch = DB.matches.filter(m => m.date >= today && !m.completed).sort((a,b) => a.date < b.date ? -1 : 1)[0];
  let html = '';
  if (nextTraining) {
    const vals = Object.values(nextTraining.attendance || {});
    const offen = vals.filter(v => v === 'offen').length;
    const da = vals.filter(v => v === 'anwesend').length;
    const info = offen === vals.length ? 'Anwesenheit noch nicht erfasst' : (offen ? `${da} anwesend · ${offen} noch offen` : `${da} anwesend – erfasst ✓`);
    html += `
    <div class="today-card today-card--training" data-nav="trainingDetail" data-params='{"id":"${nextTraining.id}"}'>
      <div class="today-icon">📋</div>
      <div class="today-main">
        <div class="today-label">${relDayLabel(nextTraining.date)} · Training</div>
        <div class="today-info">${info}</div>
      </div>
      <div class="today-arrow">›</div>
    </div>`;
  }
  if (nextMatch) {
    const zu = activePlayers().filter(p => (nextMatch.availability || {})[p.id] === 'zugesagt').length;
    const k = (nextMatch.kader || []).length;
    const info = `${zu} Zusagen · ${k ? `Kader ${k}/${nextMatch.kaderSize}` : 'Kader noch offen'}`;
    html += `
    <div class="today-card today-card--match" data-nav="matchDetail" data-params='{"id":"${nextMatch.id}"}'>
      <div class="today-icon">🏟️</div>
      <div class="today-main">
        <div class="today-label">${relDayLabel(nextMatch.date)} · ${esc(nextMatch.opponent ? 'gegen ' + nextMatch.opponent : 'Spieltag')}</div>
        <div class="today-info">${info}</div>
      </div>
      <div class="today-arrow">›</div>
    </div>`;
  }
  if (!html) {
    html = emptyState('🌤️', 'Gerade steht nichts an. Trainings werden automatisch angelegt, Spieltage kannst du aus fußball.de importieren.');
  }
  return `<div class="section-head section-head--first"><span>Als Nächstes</span></div>${html}`;
}

function renderDashboardSidebar() {
  if (!state.sidebarOpen) return '';
  const items = [
    { nav: 'trainingList', icon: '📋', label: 'Training' },
    { nav: 'teams', icon: '⚽', label: 'Teams erstellen' },
    { nav: 'matchList', icon: '🏟️', label: 'Spieltag' },
    { nav: 'players', icon: '👥', label: 'Spieler' },
    { nav: 'notes', icon: '📝', label: 'Notizen' },
    { nav: 'exercises', icon: '📚', label: 'Übungen' },
    { nav: 'backup', icon: '💾', label: 'Backup' },
  ];
  return `
  <div class="sidebar-overlay show" data-action="closeSidebar"></div>
  <nav class="sidebar-panel show">
    <div class="sidebar-head">
      <span>Menü</span>
      <button class="icon-btn" data-action="closeSidebar">✕</button>
    </div>
    ${items.map(it => `<button class="sidebar-nav-item" data-nav="${it.nav}"><span>${it.icon}</span>${it.label}</button>`).join('')}
  </nav>`;
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
      ${list.length === 0 ? (DB.trainings.length ? emptyState('📅', 'Keine Trainings in diesem Zeitraum.') : emptyState('📋', 'Noch keine Trainings angelegt.', '<button class="btn btn-primary" data-action="newTrainingToday">Erstes Training anlegen</button>')) : list.map(t => {
        const counts = { anwesend:0, abgesagt:0, unentschuldigt:0, offen:0 };
        Object.values(t.attendance).forEach(s => counts[s] = (counts[s]||0)+1);
        return `
        <div class="card card-tap" data-nav="trainingDetail" data-params='{"id":"${t.id}"}'>
          <div class="card-title">${fmtDate(t.date)} ${counts.offen > 0 ? '<span class="badge-open">Offen</span>' : ''}</div>
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
    ${!isTrainingComplete(t) ? `<p class="muted small-note">Zählt erst in der Trainingsbeteiligung, sobald jeder Spieler einen Status außer „Offen" hat (noch ${Object.values(t.attendance).filter(s=>s==='offen').length} offen).</p>` : ''}
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
              <button class="status-btn ${meta.cls} ${s === key ? 'is-active' : ''} ${s === key ? flashClass('att:'+p.id) : ''}"
                data-action="setAttendance" data-id="${t.id}" data-player="${p.id}" data-status="${key}">${meta.label}</button>
            `).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <button class="btn btn-block" data-nav="teams" data-params='{"id":"${t.id}"}'>⚽ Teams aus diesem Training erstellen</button>

    <div class="section-head"><span>Sitzungsplan${t.sessionPlan && t.sessionPlan.length ? ` · ${t.sessionPlan.reduce((a,i)=>a+i.duration,0)} Min.` : ''}</span></div>
    <div class="list">
      ${!t.sessionPlan || t.sessionPlan.length === 0 ? emptyState('🗒️', 'Noch kein Plan für dieses Training. Füge unten Übungen aus der Bibliothek oder eigene Blöcke hinzu.') : t.sessionPlan.map((item, idx) => `
        <div class="session-item">
          <div class="session-item-main">
            <div class="card-title">${esc(item.name)}</div>
            <div class="card-sub">${item.category ? esc(item.category) + ' · ' : ''}${item.duration} Min.</div>
          </div>
          <div class="session-item-actions">
            <button data-action="moveSessionItem" data-id="${t.id}" data-item="${item.id}" data-dir="up" ${idx===0?'disabled':''}>↑</button>
            <button data-action="moveSessionItem" data-id="${t.id}" data-item="${item.id}" data-dir="down" ${idx===t.sessionPlan.length-1?'disabled':''}>↓</button>
            <button data-action="removeSessionItem" data-id="${t.id}" data-item="${item.id}">✕</button>
          </div>
        </div>`).join('')}
    </div>
    <div class="row-actions">
      <button class="btn" data-action="addSessionExercise" data-id="${t.id}">+ Aus Bibliothek</button>
      <button class="btn" data-action="addCustomSessionBlock" data-id="${t.id}">+ Eigener Block</button>
    </div>
    ${t.sessionPlan && t.sessionPlan.length ? `<button class="btn btn-block" data-action="copySessionPlanWhatsApp" data-id="${t.id}">📋 Für WhatsApp kopieren</button>` : ''}

    <button class="btn btn-danger btn-block" data-action="deleteTraining" data-id="${t.id}">Training löschen</button>
  </main>
  ${tabbar()}`;
}

/* --------------------------------- Teams ------------------------------------ */

function viewTeams(trainingId) {
  const trainings = DB.trainings.slice().sort((a,b) => b.date < a.date ? -1 : b.date > a.date ? 1 : 0);
  const t = trainingId ? DB.trainings.find(x => x.id === trainingId) : pickDefaultTraining();

  if (!t) {
    return `${header('Teams erstellen')}
    <main class="content">${emptyState('⚽', 'Erstelle zuerst ein Training und trage die Anwesenheit ein – dann kannst du hier Teams bilden.', '<button class="btn btn-primary" data-nav="trainingList">Zum Training</button>')}</main>${tabbar()}`;
  }

  t.teamGen = t.teamGen || { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' };
  if (!t.teamGen.mode) t.teamGen.mode = 'strength';
  const presentIds = Object.entries(t.attendance).filter(([,s]) => s === 'anwesend').map(([id]) => id);
  const presentPlayers = presentIds.map(playerById).filter(Boolean);
  const withSecondary = presentPlayers.filter(p => p.posSecondary);

  const teamsHtml = t.teamGen.teams ? renderTeamsResult(t.teamGen.teams, t.id, t.teamGen.teamLabels, t.teamGen.neutral) : '';

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
      <div class="segmented segmented--3">
        <button class="${t.teamGen.mode==='strength'?'active':''}" data-action="setTeamMode" data-id="${t.id}" data-mode="strength">Nach Stärke</button>
        <button class="${t.teamGen.mode==='offense_defense'?'active':''}" data-action="setTeamMode" data-id="${t.id}" data-mode="offense_defense">Off. / Def.</button>
        <button class="${t.teamGen.mode==='random'?'active':''}" data-action="setTeamMode" data-id="${t.id}" data-mode="random">Zufällig</button>
      </div>
      ${t.teamGen.mode === 'strength' ? `<p class="muted small-note">Team A = stärkere Gruppe, Team B = schwächere Gruppe – nach Trainings- und Spielbeteiligung, je Position getrennt aufgeteilt. Team A bekommt bevorzugt den Torhüter.</p>` : ''}
      ${t.teamGen.mode === 'offense_defense' ? `<p class="muted small-note">Team A = die besten Offensivspieler (Stürmer, 10er, Flügel, ein Angriffs-6er), aufgefüllt mit den schwächeren Verteidigern. Team B = die beste Abwehr plus ein defensiver 6er, aufgefüllt mit den schwächeren Offensivspielern. Bewertung nach Beteiligung der letzten 5 Trainings – so spielen die guten Offensiv- gegen die guten Defensivspieler.</p>` : ''}
    </div>` : ''}

    ${withSecondary.length ? `
    <details class="details-block" data-remember="posOverride-${t.id}" ${isDetailsOpen('posOverride-'+t.id, false) ? 'open' : ''}>
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
      ${t.teamGen.teams ? `<p class="muted small-note">Änderung übernommen? Unten auf „Teams anpassen" tippen.</p>` : ''}
    </details>` : ''}

    <button class="btn btn-primary btn-block" data-action="drawTeams" data-id="${t.id}" ${presentPlayers.length===0?'disabled':''}>${
      t.teamGen.teams
        ? (t.teamGen.mode === 'random' ? '🔀 Neu auslosen' : 'Teams anpassen')
        : (t.teamGen.mode === 'random' ? 'Teams auslosen' : 'Teams erstellen')
    }</button>
    ${t.teamGen.teams ? `<button class="btn btn-block" data-action="copyTeamsWhatsApp" data-id="${t.id}">📋 Für WhatsApp kopieren</button>` : ''}

    ${teamsHtml}

    ${t.teamGen.teams && t.teamGen.numTeams === 3 ? renderRotation() : ''}
  </main>
  ${tabbar()}`;
}

// Reihenfolge links -> rechts je nach tatsächlicher Positionsbezeichnung, nicht nach
// Array-Reihenfolge - sonst bleibt ein Spieler nach einem Tausch optisch auf der
// falschen Seite stehen, obwohl sich sein Label geändert hat.
const LR_ORDER = { LV: 0, IV: 1, RV: 2, LM: 0, ZM: 1, OM: 1, RM: 2, LF: 0, ST: 1, RF: 2, DM: 1, TW: 1 };

function renderMiniPitch(team, trainingId, teamIdx, sel, neutralStyle) {
  const lines = { FWD: [], MID: [], DM: [], DEF: [], TW: [] };
  team.forEach(pl => {
    if (pl.pos === 'DM') lines.DM.push(pl);
    else lines[GROUP_OF[pl.pos] || 'MID'].push(pl);
  });
  const rows = [
    { key: 'FWD', y: 13 },
    { key: 'MID', y: 39 },
    { key: 'DM',  y: 58 },
    { key: 'DEF', y: 79 },
    { key: 'TW',  y: 94 },
  ];
  let slots = '';
  rows.forEach(row => {
    const players = lines[row.key].slice().sort((a, b) => {
      const oa = LR_ORDER[a.pos] != null ? LR_ORDER[a.pos] : 1;
      const ob = LR_ORDER[b.pos] != null ? LR_ORDER[b.pos] : 1;
      return oa - ob;
    });
    const n = players.length;
    if (!n) return;
    players.forEach((pl, i) => {
      const x = ((i + 1) / (n + 1)) * 100;
      const isSelected = sel && sel.trainingId === trainingId && sel.teamIdx === teamIdx && sel.playerId === pl.id;
      // Ein Tipp: Spieler zum Tauschen auswählen (mit Team oder Position, je nach
      // zweitem Ziel). Zwei Tipps auf denselben Spieler: direkte Positionsauswahl.
      // Der ganze Chip ist EIN Tippbereich, damit auf dem Handy nichts knapp daneben geht.
      slots += `<div class="mini-slot ${isSelected ? 'is-selected' : ''} ${neutralStyle ? 'mini-slot-neutral' : ''} ${flashClass('slot:' + pl.id)}" style="left:${x.toFixed(1)}%; top:${row.y}%;"
        data-action="teamPlayerClick" data-id="${trainingId}" data-player="${pl.id}" data-team-idx="${teamIdx}">
        <span class="mini-slot-pos">${pl.pos}</span>
        <span class="mini-slot-name">${esc(pl.name)}</span>
      </div>`;
    });
  });
  return `<div class="mini-pitch ${neutralStyle ? 'mini-pitch-neutral' : ''}">${slots}</div>`;
}

function renderTeamsResult(teams, trainingId, labels, neutral) {
  const letters = ['A','B','C'];
  const colorClass = ['team-A','team-B','team-C'];
  const sel = state.teamSwapSelection;
  let html = '<div class="mini-pitch-wrap">';
  teams.forEach((team, i) => {
    const title = labels && labels[i] ? `Team ${letters[i]} · ${labels[i]}` : `Team ${letters[i]}`;
    html += `
    <div class="mini-pitch-block">
      <div class="mini-pitch-header ${colorClass[i]}">${title} <span class="team-count">${team.length}</span></div>
      ${renderMiniPitch(team, trainingId, i, sel, false)}
    </div>`;
  });
  if (neutral && neutral.length) {
    html += `
    <div class="mini-pitch-block">
      <div class="mini-pitch-header neutral-header">Neutral <span class="team-count">${neutral.length}</span></div>
      ${renderMiniPitch(neutral, trainingId, 'neutral', sel, true)}
    </div>`;
  }
  html += '</div>';
  if (neutral && neutral.length) {
    html += `<p class="muted small-note">Neutral spielt bei der Mannschaft mit, die gerade den Ball hat – lässt sich genauso wie die anderen antippen und tauschen.</p>`;
  }
  html += `<p class="muted team-hint">${sel ? 'Jetzt einen zweiten Spieler antippen, um zu tauschen (nochmal denselben antippen zum Abbrechen).' : 'Tipp: Spieler antippen, dann einen zweiten – sie tauschen ihren Platz (auch links ↔ rechts oder zwischen den Teams). Doppelt antippen: Position direkt wählen.'}</p>`;
  return html;
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

function matchQuoteValue(playerId) {
  const ms = matchStats(playerId);
  if (ms.imKader === 0) return -1;
  return Math.round((ms.startelf / ms.imKader) * 100);
}

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
  const sortBy = f.sortBy || 'name';
  players.sort((a, b) => {
    const activeDiff = (b.active - a.active);
    if (activeDiff !== 0) return activeDiff;
    if (sortBy === 'position') {
      const ga = GROUP_ORDER.indexOf(GROUP_OF[a.posPrimary]);
      const gb = GROUP_ORDER.indexOf(GROUP_OF[b.posPrimary]);
      if (ga !== gb) return ga - gb;
      if (a.posPrimary !== b.posPrimary) return a.posPrimary.localeCompare(b.posPrimary);
      return a.name.localeCompare(b.name, 'de');
    }
    if (sortBy === 'trainingQuote') {
      const qa = playerStats(a.id).total ? playerStats(a.id).quote : -1;
      const qb = playerStats(b.id).total ? playerStats(b.id).quote : -1;
      return qb - qa || a.name.localeCompare(b.name, 'de');
    }
    if (sortBy === 'matchQuote') {
      return matchQuoteValue(b.id) - matchQuoteValue(a.id) || a.name.localeCompare(b.name, 'de');
    }
    return a.name.localeCompare(b.name, 'de');
  });

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
    <div class="filter-row">
      <select id="playerSortBy">
        <option value="name" ${sortBy==='name'?'selected':''}>Sortieren: Name (A-Z)</option>
        <option value="position" ${sortBy==='position'?'selected':''}>Sortieren: Position</option>
        <option value="trainingQuote" ${sortBy==='trainingQuote'?'selected':''}>Sortieren: Trainingsbeteiligung</option>
        <option value="matchQuote" ${sortBy==='matchQuote'?'selected':''}>Sortieren: Spielbeteiligung</option>
      </select>
    </div>

    <div class="list">
      ${players.length === 0 ? emptyState('🔍', 'Keine Spieler gefunden. Suche oder Positionsfilter anpassen.') : players.map(p => {
        const s = playerStats(p.id);
        const mq = matchQuoteValue(p.id);
        return `
        <div class="card card-tap ${!p.active ? 'card-inactive' : ''}" data-nav="playerProfile" data-params='{"id":"${p.id}"}'>
          <div class="player-card-row">
            <div class="list-avatar">${avatarSVG(p.avatar, 40)}</div>
            <div>
              <div class="card-title">${esc(p.name)} ${!p.active ? '<span class="badge-off">inaktiv</span>' : ''}</div>
              <div class="card-sub">${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''} · Jg. ${p.jahrgang}</div>
              <div class="card-sub">Training: ${s.total ? s.quote + ' %' : '–'} ${s.last5Quote != null ? `(Letzte 5: ${s.last5Quote} % ${s.trend})` : ''} · Spiel: ${mq >= 0 ? mq + ' %' : '–'}</div>
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
      <label>Geburtstag (optional)</label>
      <input name="birthday" type="date" value="${p && p.birthday ? p.birthday : ''}">
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
        <div class="muted">Jg. ${p.jahrgang} · ${p.posPrimary}${p.posSecondary ? ' / ' + p.posSecondary : ''}${p.birthday ? ' · 🎂 ' + fmtBirthday(p.birthday) : ''}</div>
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
        </div>
      </div>
      <div class="chart-subtitle">Letzte ${Math.min(12, s.total)} Trainings</div>
      ${trainingHistorySVG(s.list, p.id)}
      `}
    </div>

    <div class="card">
      <div class="card-title">Spieleinsätze</div>
      <div class="card-sub">${m.imKader}x im Kader · ${m.startelf}x Startelf · ${m.bank}x Bank${m.nichtImKader ? ` · ${m.nichtImKader}x nicht im Kader` : ''}</div>
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
      ${notes.length === 0 ? emptyState('📝', 'Noch keine Notizen zu diesem Spieler.', `<button class="btn btn-primary" data-nav="noteForm" data-params='{"playerId":"${p.id}"}'>Erste Notiz anlegen</button>`) : notes.map(n => noteCard(n)).join('')}
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
      ${general.length === 0 ? emptyState('🗒️', 'Noch keine Notizen – z. B. für die Planung der nächsten Einheit oder ein Foto der Taktiktafel.', '<button class="btn btn-primary" data-action="newGeneralNote">Erste Notiz anlegen</button>') : general.map(n => generalNoteCard(n)).join('')}
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
      ${list.length === 0 ? emptyState('🏟️', 'Noch keine Spieltage angelegt.', '<button class="btn btn-primary" data-nav="importFussball">Spielplan importieren</button>') : list.map(m => `
        <div class="card card-tap" data-nav="matchDetail" data-params='{"id":"${m.id}"}'>
          <div class="card-title">${fmtDate(m.date)} vs. ${esc(m.opponent || '–')} ${!m.completed ? '<span class="badge-open">Offen</span>' : ''}</div>
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
  const zugesagtCount = activePlayers().filter(p => (m.availability[p.id] || 'offen') === 'zugesagt').length;
  const offenCount = activePlayers().filter(p => (m.availability[p.id] || 'offen') === 'offen').length;
  const tab = state.matchTab[m.id] || (m.kader && m.kader.length ? 'aufstellung' : 'zusagen');
  const msel = state.matchSwapSelection;
  const title = `${fmtDate(m.date)}${m.opponent ? ' · ' + m.opponent : ''}`;

  let body = '';
  if (tab === 'zusagen') {
    body = `
    <div class="summary-line">${zugesagtCount} zugesagt · ${offenCount} offen</div>
    <div class="row-actions">
      <button class="btn btn-ghost" data-action="allMatchAvailability" data-id="${m.id}" data-status="zugesagt">Alle zugesagt</button>
      <button class="btn btn-ghost" data-action="allMatchAvailability" data-id="${m.id}" data-status="offen">Alle offen</button>
    </div>
    <div class="attend-list">
      ${activePlayers().slice().sort((a,b) => {
        // Offene Rückmeldungen nach oben, damit nicht gescrollt werden muss
        const oa = (m.availability[a.id] || 'offen') === 'offen' ? 0 : 1;
        const ob = (m.availability[b.id] || 'offen') === 'offen' ? 0 : 1;
        return oa - ob || a.name.localeCompare(b.name,'de');
      }).map((p, idx, arr) => {
        const s = m.availability[p.id] || 'offen';
        const prev = idx > 0 ? (m.availability[arr[idx-1].id] || 'offen') : null;
        const divider = idx > 0 && prev === 'offen' && s !== 'offen' ? '<div class="list-divider">Bereits erfasst</div>' : '';
        return `${divider}<div class="attend-row">
          <div class="attend-name">${esc(p.name)}</div>
          <div class="attend-btns">
            ${Object.entries(MATCH_STATUS).map(([key, meta]) => `
              <button class="status-btn ${meta.cls} ${s === key ? 'is-active' : ''} ${s === key ? flashClass('mav:'+p.id) : ''}"
                data-action="setMatchAvailability" data-id="${m.id}" data-player="${p.id}" data-status="${key}">${meta.label}</button>
            `).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="sticky-action">
      <button class="btn btn-primary btn-block" data-action="kaderFromZusagen" data-id="${m.id}">✅ Zusagen in Kader übernehmen</button>
    </div>`;
  } else if (tab === 'aufstellung') {
    body = `
    <div class="select-row">
      <label>Formation</label>
      <select data-action="setMatchFormation" data-id="${m.id}">${FORMATION_NAMES.map(f => `<option value="${f}" ${f===m.formation?'selected':''}>${f}</option>`).join('')}</select>
    </div>
    ${renderPitch(m, formation)}

    <div class="section-head"><span>Bank (${benchIds.length})</span></div>
    <div class="chip-list bench-list">
      ${benchIds.map(bid => {
        const bp = playerById(bid);
        const isSel = msel && msel.matchId === m.id && msel.kind === 'bench' && msel.playerId === bid;
        return `<button class="chip bench-chip ${isSel ? 'is-selected' : ''} ${flashClass('bench:' + bid)}" data-action="benchClick" data-id="${m.id}" data-player="${bid}">${esc(bp.name)}</button>`;
      }).join('') || '<span class="muted">Niemand auf der Bank.</span>'}
    </div>
    <p class="muted team-hint">${msel && msel.matchId === m.id
      ? 'Jetzt den zweiten Spieler (Feld oder Bank) oder eine freie Position antippen. Nochmal denselben antippen zum Abbrechen.'
      : 'Tipp: Spieler antippen, dann einen zweiten – sie tauschen die Plätze (auch Feld ↔ Bank). Doppelt antippen: Spieler geht auf die Bank.'}</p>

    <div class="text-actions">
      <button class="link-btn" data-action="autoArrange" data-id="${m.id}">Startelf automatisch anordnen</button>
    </div>

    <details class="details-block" data-remember="kaderEdit-${m.id}" ${isDetailsOpen('kaderEdit-'+m.id, !(m.kader && m.kader.length)) ? 'open' : ''}>
      <summary>Kader bearbeiten (${kaderPlayers.length}/${m.kaderSize})</summary>
      <div class="chip-list">
        ${kaderPlayers.map(p => `<span class="chip">${esc(p.name)} <button data-action="removeFromKader" data-id="${m.id}" data-player="${p.id}">✕</button></span>`).join('') || '<span class="muted">Noch leer – im Reiter „Zusagen" übernehmen.</span>'}
      </div>
      <div class="small-note muted">Hinzufügen:</div>
      <div class="chip-list">
        ${activePlayers().filter(p => !(m.kader||[]).includes(p.id)).map(p => `<button class="chip chip-add" data-action="addToKader" data-id="${m.id}" data-player="${p.id}">+ ${esc(p.name)}</button>`).join('')}
      </div>
    </details>

    <button class="btn btn-primary btn-block" data-action="copyMatchWhatsApp" data-id="${m.id}">📋 Für WhatsApp kopieren</button>`;
  } else {
    body = `
    <form class="form" data-form="matchMeta" data-id="${m.id}">
      <label>Datum</label><input name="date" type="date" value="${m.date}">
      <label>Gegner</label><input name="opponent" value="${esc(m.opponent||'')}">
      <label>Kadergröße</label><input name="kaderSize" type="number" min="11" max="30" value="${m.kaderSize}">
      <button class="btn btn-primary btn-block" type="submit">Speichern</button>
    </form>

    <div class="card completed-card">
      <label class="checkbox-row">
        <input type="checkbox" data-action="toggleMatchCompleted" data-id="${m.id}" ${m.completed?'checked':''}>
        Spieltag abgeschlossen
      </label>
      <p class="muted small-note">Erst mit Haken fließt der Spieltag in die Einsatzstatistik der Spieler ein.</p>
    </div>

    <button class="btn btn-danger btn-block" data-action="deleteMatch" data-id="${m.id}">Spieltag löschen</button>`;
  }

  return `
  ${header(title, 'matchList')}
  <div class="tab-strip">
    <div class="segmented">
      <button class="${tab==='zusagen'?'active':''}" data-action="setMatchTab" data-id="${m.id}" data-tab="zusagen">Zusagen</button>
      <button class="${tab==='aufstellung'?'active':''}" data-action="setMatchTab" data-id="${m.id}" data-tab="aufstellung">Aufstellung</button>
      <button class="${tab==='infos'?'active':''}" data-action="setMatchTab" data-id="${m.id}" data-tab="infos">Infos</button>
    </div>
  </div>
  <main class="content">
    ${body}
  </main>
  ${tabbar()}`;
}

function renderPitch(m, formation) {
  const sel = state.matchSwapSelection;
  return `
  <div class="pitch">
    ${formation.slots.map(slot => {
      const playerId = (m.startElf||{})[slot.key];
      const p = playerId ? playerById(playerId) : null;
      const isSel = sel && sel.matchId === m.id && sel.kind === 'slot' && sel.slot === slot.key;
      return `<button class="pitch-slot ${p ? '' : 'pitch-slot-empty'} ${isSel ? 'is-selected' : ''} ${flashClass('pslot:' + slot.key)}" style="left:${slot.x}%; top:${slot.y}%;" data-action="pitchSlotClick" data-id="${m.id}" data-slot="${slot.key}">
        <div class="pitch-pos">${slot.label}</div>
        <div class="pitch-name">${p ? esc(p.name) : 'frei'}</div>
      </button>`;
    }).join('')}
  </div>`;
}

// Antippen in der Aufstellung: 1. Tipp wählt aus, 2. Tipp auf ein anderes Ziel tauscht.
// Ziele sind Feldpositionen (auch freie) und Bankspieler. Doppelt antippen auf einen
// Feldspieler schickt ihn auf die Bank.
function handleLineupTap(m, target) {
  m.startElf = m.startElf || {};
  const sel = state.matchSwapSelection;
  const same = sel && sel.matchId === m.id && sel.kind === target.kind &&
    (target.kind === 'slot' ? sel.slot === target.slot : sel.playerId === target.playerId);

  if (same) {
    state.matchSwapSelection = null;
    if (isDoubleTap(sel) && target.kind === 'slot' && m.startElf[target.slot]) {
      const pid = m.startElf[target.slot];
      delete m.startElf[target.slot];
      state.flashKeys = ['bench:' + pid];
      saveDB();
    }
    render();
    return;
  }
  if (!sel || sel.matchId !== m.id) {
    state.matchSwapSelection = { matchId: m.id, ...target, at: Date.now() };
    render();
    return;
  }

  const pidOf = t => t.kind === 'slot' ? (m.startElf[t.slot] || null) : t.playerId;
  const a = sel, b = target;
  const flashFor = (t, pid) => t.kind === 'slot' ? 'pslot:' + t.slot : 'bench:' + pid;

  if (a.kind === 'bench' && b.kind === 'bench') {
    // Zwei Bankspieler: nichts zu tauschen, einfach neu auswählen
    state.matchSwapSelection = { matchId: m.id, ...target, at: Date.now() };
    render();
    return;
  }
  if (a.kind === 'slot' && b.kind === 'slot') {
    const pa = pidOf(a), pb = pidOf(b);
    if (!pa && !pb) {
      state.matchSwapSelection = { matchId: m.id, ...target, at: Date.now() };
      render();
      return;
    }
    if (pb) m.startElf[a.slot] = pb; else delete m.startElf[a.slot];
    if (pa) m.startElf[b.slot] = pa; else delete m.startElf[b.slot];
    state.flashKeys = ['pslot:' + a.slot, 'pslot:' + b.slot];
  } else {
    // Feld <-> Bank: Bankspieler kommt auf die Position, bisheriger Spieler geht auf die Bank
    const slotT = a.kind === 'slot' ? a : b;
    const benchT = a.kind === 'bench' ? a : b;
    const oldPid = m.startElf[slotT.slot] || null;
    m.startElf[slotT.slot] = benchT.playerId;
    state.flashKeys = ['pslot:' + slotT.slot].concat(oldPid ? ['bench:' + oldPid] : []);
  }
  state.matchSwapSelection = null;
  saveDB();
  render();
}

/* --------------------------------- Backup -------------------------------------- */

/* ------------------------------ Übungsbibliothek -------------------------------- */

// Zeichnet ein Übungs-Spielfeld mit Spielern (nummeriert nach Ablaufreihenfolge),
// Bällen und Hütchen/Material. Im editable-Modus sind die Elemente per Ziehen
// verschiebbar und haben ein kleines Löschen-Kreuz.
function renderDiagramField(diagram, editable, ownerId) {
  const elements = (diagram && diagram.elements) || [];
  let playerCount = 0;
  const items = elements.map(el => {
    let content;
    if (el.type === 'player') {
      playerCount++;
      content = `<span class="diagram-num">${playerCount}</span>`;
    } else if (el.type === 'ball') {
      content = '⚽';
    } else {
      content = '🔶';
    }
    return `<div class="diagram-el diagram-${el.type} ${editable ? 'diagram-el-editable' : ''}" style="left:${el.x}%; top:${el.y}%;" data-el-id="${el.id}">
      ${content}
      ${editable ? `<button type="button" class="diagram-el-remove" data-action="removeDiagramElement" data-id="${ownerId}" data-el="${el.id}">✕</button>` : ''}
    </div>`;
  }).join('');
  return `<div class="diagram-field ${editable ? 'diagram-field-editable' : ''}" data-owner="${ownerId || ''}">${items}</div>`;
}

function viewExercises() {
  const f = state.exerciseFilter;
  let list = DB.exercises.slice();
  if (f.category) list = list.filter(e => e.category === f.category);
  list.sort((a,b) => a.name.localeCompare(b.name, 'de'));

  return `
  ${header('Übungen')}
  <main class="content">
    <button class="btn btn-primary btn-block" data-nav="exerciseForm" data-params='{}'>+ Neue Übung</button>

    ${DB.exercises.length ? `<div class="filter-row">
      <select id="exerciseCategoryFilter">
        <option value="">Alle Kategorien</option>
        ${CATEGORIES.map(c => `<option value="${c}" ${f.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>` : ''}

    <div class="list">
      ${list.length === 0 ? (DB.exercises.length ? emptyState('🔍', 'Keine Übungen in dieser Kategorie.') : emptyState('📚', 'Noch keine Übungen angelegt.', `<button class="btn btn-primary" data-nav="exerciseForm" data-params='{}'>Erste Übung anlegen</button>`)) : list.map(ex => `
        <div class="card card-tap" data-nav="exerciseForm" data-params='{"id":"${ex.id}"}'>
          ${ex.diagram && ex.diagram.elements && ex.diagram.elements.length ? renderDiagramField(ex.diagram, false) : ''}
          <div class="card-title">${esc(ex.name)}</div>
          <div class="card-sub">${esc(ex.category)} · ${ex.duration} Min.${ex.materials ? ' · ' + esc(ex.materials) : ''}</div>
          ${ex.description ? `<div class="card-body">${esc(ex.description)}</div>` : ''}
        </div>`).join('')}
    </div>
  </main>
  ${tabbar()}`;
}

function viewExerciseForm(id) {
  const ex = id ? DB.exercises.find(x => x.id === id) : null;
  return `
  ${header(ex ? 'Übung bearbeiten' : 'Neue Übung', 'exercises')}
  <main class="content">
    <form class="form" data-form="exercise" data-id="${ex ? ex.id : ''}">
      <label>Name</label>
      <input name="name" required value="${ex ? esc(ex.name) : ''}">
      <label>Kategorie</label>
      <select name="category">${CATEGORIES.map(c => `<option value="${c}" ${ex && ex.category===c?'selected':''}>${c}</option>`).join('')}</select>
      <label>Dauer (Minuten)</label>
      <input name="duration" type="number" min="1" value="${ex ? ex.duration : 15}">
      <label>Material (optional)</label>
      <input name="materials" value="${ex ? esc(ex.materials||'') : ''}">
      <label>Beschreibung (optional)</label>
      <textarea name="description" rows="4">${ex ? esc(ex.description||'') : ''}</textarea>
      <button class="btn btn-primary btn-block" type="submit">Speichern</button>
      ${ex ? `<button type="button" class="btn btn-danger btn-block" data-action="deleteExercise" data-id="${ex.id}">Übung löschen</button>` : ''}
    </form>

    <div class="section-head"><span>Grafik</span></div>
    ${ex ? `
      ${renderDiagramField(ex.diagram, true, ex.id)}
      <div class="row-actions">
        <button type="button" class="btn" data-action="addDiagramElement" data-id="${ex.id}" data-type="player">+ Spieler</button>
        <button type="button" class="btn" data-action="addDiagramElement" data-id="${ex.id}" data-type="ball">+ Ball</button>
        <button type="button" class="btn" data-action="addDiagramElement" data-id="${ex.id}" data-type="cone">+ Hütchen</button>
      </div>
      <p class="muted small-note">Elemente lassen sich auf dem Feld verschieben. Spieler sind automatisch nach Reihenfolge des Hinzufügens nummeriert (1 = zuerst gesetzt).</p>
      ${ex.diagram && ex.diagram.elements && ex.diagram.elements.length ? `<button type="button" class="btn" data-action="clearDiagram" data-id="${ex.id}">Grafik leeren</button>` : ''}
    ` : `<p class="muted small-note">Erst speichern, dann kannst du eine Grafik hinzufügen.</p>`}
  </main>
  ${tabbar()}`;
}

function viewBackup() {
  const weekdays = DB.settings.trainingWeekdays || [];
  return `
  ${header('Einstellungen')}
  <main class="content">
    <div class="card">
      <div class="card-title">Trainingstage</div>
      <p class="muted">An diesen Wochentagen werden automatisch die nächsten 2 anstehenden Trainings angelegt – neue Trainings erscheinen dann von selbst unter „Training", ohne dass du sie manuell erstellen musst.</p>
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

// details-Elemente merken sich ihren Auf/Zu-Zustand über Re-Renders hinweg (sonst
// würde jedes Antippen eines Buttons darin die Klappe wieder schließen).
document.addEventListener('toggle', (e) => {
  const el = e.target;
  if (el && el.tagName === 'DETAILS' && el.dataset && el.dataset.remember) {
    state.detailsOpen[el.dataset.remember] = el.open;
  }
}, true);

// Ziehen von Diagramm-Elementen (Spieler/Ball/Hütchen) auf dem Übungs-Spielfeld.
// Position wird laufend nur visuell aktualisiert und erst beim Loslassen gespeichert.
document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.diagram-el-remove')) return;
  const el = e.target.closest('.diagram-el-editable');
  if (!el) return;
  const field = el.closest('.diagram-field');
  if (!field) return;
  e.preventDefault();
  const ownerId = field.dataset.owner;
  const elId = el.dataset.elId;
  const fieldRect = field.getBoundingClientRect();

  const clamp = v => Math.max(2, Math.min(98, v));
  function onMove(ev) {
    const x = clamp(((ev.clientX - fieldRect.left) / fieldRect.width) * 100);
    const y = clamp(((ev.clientY - fieldRect.top) / fieldRect.height) * 100);
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.dataset.pendingX = x;
    el.dataset.pendingY = y;
  }
  function onUp() {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    const x = parseFloat(el.dataset.pendingX);
    const y = parseFloat(el.dataset.pendingY);
    if (!isNaN(x) && !isNaN(y) && ownerId) {
      const ex = DB.exercises.find(e2 => e2.id === ownerId);
      const data = ex && ex.diagram && ex.diagram.elements.find(d => d.id === elId);
      if (data) { data.x = x; data.y = y; saveDB(); }
    }
  }
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
});

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
  if (e.target.matches('[data-action="setMatchFormation"]')) {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === e.target.dataset.id);
    if (m) {
      m.formation = e.target.value;
      m.startElf = autoArrangeStartXI(m.kader || [], m.formation).startElf;
      saveDB(); render();
    }
  }
  if (e.target.matches('[data-action="toggleMatchCompleted"]')) {
    const m = DB.matches.find(x => x.id === e.target.dataset.id);
    if (m) {
      m.completed = e.target.checked;
      saveDB();
      render();
      toast(m.completed ? 'Spieltag abgeschlossen – zählt jetzt in der Statistik ✓' : 'Spieltag als offen markiert');
    }
  }
  if (e.target.id === 'trainingPeriodFilter') {
    state.trainingFilter.period = e.target.value;
    render();
  }
  if (e.target.id === 'playerPosFilter') {
    state.playerFilter.position = e.target.value;
    render();
  }
  if (e.target.id === 'playerSortBy') {
    state.playerFilter.sortBy = e.target.value;
    render();
  }
  if (e.target.id === 'exerciseCategoryFilter') {
    state.exerciseFilter = state.exerciseFilter || {};
    state.exerciseFilter.category = e.target.value;
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
      birthday: fd.get('birthday') || null,
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
    const newFormation = fd.get('formation') || m.formation;
    m.date = fd.get('date');
    m.opponent = fd.get('opponent');
    m.kaderSize = Math.max(11, parseInt(fd.get('kaderSize')) || 18);
    if (newFormation !== m.formation) {
      m.formation = newFormation;
      const kader = m.kader || [];
      const { startElf } = autoArrangeStartXI(kader, newFormation);
      m.startElf = startElf;
    }
    saveDB();
    toast('Übernommen ✓');
    render();
  } else if (type === 'exercise') {
    let id = form.dataset.id;
    const data = {
      name: fd.get('name').trim(),
      category: fd.get('category'),
      duration: Math.max(1, parseInt(fd.get('duration')) || 15),
      materials: fd.get('materials').trim(),
      description: fd.get('description').trim(),
    };
    if (!data.name) { alert('Bitte einen Namen eingeben.'); return; }
    if (id) {
      Object.assign(DB.exercises.find(e => e.id === id), data);
    } else {
      id = uid('ex');
      DB.exercises.push({ id, ...data });
    }
    saveDB();
    toast('Gespeichert ✓');
    nav('exercises');
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

// Übung aus der Bibliothek zum Sitzungsplan eines Trainings hinzufügen. Übungen, deren
// Kategorie zum aktuell empfohlenen Trainingsschwerpunkt passt, werden vorne gelistet.
function openSessionExercisePicker(trainingId) {
  const t = DB.trainings.find(x => x.id === trainingId);
  const focusCats = openNotesGrouped().slice(0, 2).map(g => g.category);
  const sorted = DB.exercises.slice().sort((a,b) => {
    const fa = focusCats.includes(a.category) ? 0 : 1;
    const fb = focusCats.includes(b.category) ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return a.name.localeCompare(b.name, 'de');
  });
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">Übung hinzufügen<button class="icon-btn" id="sheetClose">✕</button></div>
      ${sorted.length === 0 ? `<p class="muted">Noch keine Übungen in der Bibliothek.</p>` : `
      <div class="sheet-list">
        ${sorted.map(ex => `
          <button class="sheet-item" data-pick="${ex.id}">
            <span>${esc(ex.name)}${focusCats.includes(ex.category) ? ' <span class="focus-badge">🎯</span>' : ''}<br><span class="muted">${esc(ex.category)} · ${ex.duration} Min.</span></span>
          </button>`).join('')}
      </div>`}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    const pickBtn = e.target.closest('[data-pick]');
    if (!pickBtn) return;
    const ex = DB.exercises.find(x => x.id === pickBtn.dataset.pick);
    if (ex) {
      t.sessionPlan = t.sessionPlan || [];
      t.sessionPlan.push({ id: uid('sp'), name: ex.name, category: ex.category, duration: ex.duration, exerciseId: ex.id });
      saveDB();
    }
    overlay.remove();
    render();
  });
}

// Einzelnen, nicht in der Bibliothek gespeicherten Block zum Sitzungsplan hinzufügen
// (z.B. "Aufwärmen"), ohne extra eine Übung anlegen zu müssen.
function openCustomSessionBlockSheet(trainingId) {
  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">Eigener Block<button class="icon-btn" id="sheetClose">✕</button></div>
      <input type="text" id="customBlockName" placeholder="z.B. Aufwärmen" class="date-picker-input">
      <input type="number" id="customBlockDuration" placeholder="Minuten" min="1" value="10" class="date-picker-input">
      <button class="btn btn-primary btn-block" id="customBlockConfirm">Hinzufügen</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    if (e.target.id === 'customBlockConfirm') {
      const name = document.getElementById('customBlockName').value.trim();
      const duration = Math.max(1, parseInt(document.getElementById('customBlockDuration').value) || 10);
      if (!name) { alert('Bitte einen Namen eingeben.'); return; }
      const t = DB.trainings.find(x => x.id === trainingId);
      t.sessionPlan = t.sessionPlan || [];
      t.sessionPlan.push({ id: uid('sp'), name, category: null, duration, exerciseId: null });
      saveDB();
      overlay.remove();
      render();
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
    const t = { id: uid('t'), date, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' }, sessionPlan: [] };
    DB.trainings.push(t);
    saveDB();
    nav('trainingDetail', { id: t.id });
  }
  else if (action === 'newTrainingPickDate') {
    openDatePicker(todayISO(), (date) => {
      const attendance = {};
      activePlayers().forEach(p => attendance[p.id] = 'offen');
      const t = { id: uid('t'), date, attendance, teamGen: { numTeams: 2, posOverride: {}, teams: null, mode: 'strength' }, sessionPlan: [] };
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
  else if (action === 'addSessionExercise') {
    openSessionExercisePicker(id);
  }
  else if (action === 'addCustomSessionBlock') {
    openCustomSessionBlockSheet(id);
  }
  else if (action === 'removeSessionItem') {
    const t = DB.trainings.find(x => x.id === id);
    t.sessionPlan = (t.sessionPlan || []).filter(i => i.id !== btn.dataset.item);
    saveDB(); render();
  }
  else if (action === 'moveSessionItem') {
    const t = DB.trainings.find(x => x.id === id);
    const arr = t.sessionPlan || [];
    const idx = arr.findIndex(i => i.id === btn.dataset.item);
    const dir = btn.dataset.dir === 'up' ? -1 : 1;
    const newIdx = idx + dir;
    if (idx === -1 || newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    saveDB(); render();
  }
  else if (action === 'copySessionPlanWhatsApp') {
    const t = DB.trainings.find(x => x.id === id);
    let text = `📋 Trainingsplan ${fmtDate(t.date)}\n\n`;
    (t.sessionPlan || []).forEach(item => { text += `- ${item.name} (${item.duration} Min.)\n`; });
    const total = (t.sessionPlan || []).reduce((a,i) => a + i.duration, 0);
    text += `\nGesamt: ${total} Minuten`;
    copyToClipboard(text.trim());
  }
  else if (action === 'setAttendance') {
    const t = DB.trainings.find(x => x.id === id);
    t.attendance[btn.dataset.player] = btn.dataset.status;
    state.flashKeys = ['att:' + btn.dataset.player];
    saveDB(); render();
  }
  else if (action === 'allAttendance') {
    const t = DB.trainings.find(x => x.id === id);
    Object.keys(t.attendance).forEach(pid => t.attendance[pid] = btn.dataset.status);
    saveDB(); render();
  }
  else if (action === 'setMatchTab') {
    state.matchSwapSelection = null;
    state.matchTab[id] = btn.dataset.tab;
    window.scrollTo(0, 0);
    render();
  }
  else if (action === 'toggleSidebar') {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  }
  else if (action === 'closeSidebar') {
    state.sidebarOpen = false;
    render();
  }
  else if (action === 'deleteTraining') {
    if (!confirm('Sicher, dass du dieses Training endgültig löschen möchtest?')) return;
    const idx = DB.trainings.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.trainings[idx];
    DB.trainings.splice(idx, 1);
    saveDB();
    nav('trainingList');
    showUndoToast('Training gelöscht', () => {
      DB.trainings.splice(idx, 0, removed);
      saveDB(); render();
    });
  }
  else if (action === 'setNumTeams') {
    const t = DB.trainings.find(x => x.id === id);
    t.teamGen.numTeams = parseInt(btn.dataset.num, 10);
    if (t.teamGen.numTeams !== 2) t.teamGen.mode = 'random'; // Stärke-/Off-Def-Split nur für 2 Teams definiert
    t.teamGen.teams = null;
    t.teamGen.teamLabels = null;
    state.teamSwapSelection = null;
    saveDB(); render();
  }
  else if (action === 'setTeamMode') {
    const t = DB.trainings.find(x => x.id === id);
    t.teamGen.mode = btn.dataset.mode;
    t.teamGen.teams = null;
    t.teamGen.teamLabels = null;
    state.teamSwapSelection = null;
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
    state.teamSwapSelection = null;
    if (t.teamGen.numTeams === 2 && t.teamGen.mode === 'strength') {
      const { strong, weak, neutral } = generateTeamsBySkill(presentIds, t.teamGen.posOverride);
      t.teamGen.teams = [strong, weak];
      t.teamGen.teamLabels = ['Stärker', 'Schwächer'];
      t.teamGen.neutral = neutral;
    } else if (t.teamGen.numTeams === 2 && t.teamGen.mode === 'offense_defense') {
      const { offense, defense, neutral } = generateOffenseDefenseTeams(presentIds, t.teamGen.posOverride);
      t.teamGen.teams = [offense, defense];
      t.teamGen.teamLabels = ['Offensive', 'Defensive'];
      t.teamGen.neutral = neutral;
    } else {
      const { teams, neutral } = generateTeams(presentIds, t.teamGen.numTeams, t.teamGen.posOverride);
      t.teamGen.teams = teams;
      t.teamGen.teamLabels = null;
      t.teamGen.neutral = neutral;
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
    if (t.teamGen.neutral && t.teamGen.neutral.length) {
      text += `Neutral\n`;
      t.teamGen.neutral.forEach(pl => text += `- ${pl.name}\n`);
    }
    copyToClipboard(text.trim());
  }
  else if (action === 'teamPlayerClick') {
    const trainingId = id;
    const rawTeamIdx = btn.dataset.teamIdx;
    const teamIdx = rawTeamIdx === 'neutral' ? 'neutral' : parseInt(rawTeamIdx, 10);
    const playerId = btn.dataset.player;
    const sel = state.teamSwapSelection;

    if (!sel || sel.trainingId !== trainingId) {
      state.teamSwapSelection = { trainingId, teamIdx, playerId, at: Date.now() };
      render();
      return;
    }
    if (sel.playerId === playerId && sel.teamIdx === teamIdx) {
      state.teamSwapSelection = null;
      if (isDoubleTap(sel)) {
        // Doppel-Tipp: direkte Positionsauswahl für genau diesen Spieler
        openPlayerPositionPicker(trainingId, teamIdx, playerId);
      }
      render();
      return;
    }
    const t = DB.trainings.find(x => x.id === trainingId);
    const groupFor = idx => idx === 'neutral' ? (t.teamGen.neutral || (t.teamGen.neutral = [])) : t.teamGen.teams[idx];
    const teamA = groupFor(sel.teamIdx);
    const teamB = groupFor(teamIdx);
    const idxA = teamA.findIndex(p => p.id === sel.playerId);
    const idxB = teamB.findIndex(p => p.id === playerId);
    state.teamSwapSelection = null;
    if (idxA === -1 || idxB === -1) { render(); return; }

    if (sel.teamIdx === teamIdx) {
      // Gleiches Team: die beiden Spieler tauschen ihren Platz auf dem Feld.
      // Position UND Reihenfolge werden getauscht - sonst bleiben z.B. zwei IV
      // (links/rechts) optisch unverändert, weil beide dieselbe Bezeichnung haben.
      const a = teamA[idxA], b = teamA[idxB];
      const tmpPos = a.pos;
      a.pos = b.pos;
      b.pos = tmpPos;
      teamA[idxA] = b;
      teamA[idxB] = a;
      state.flashKeys = ['slot:' + sel.playerId, 'slot:' + playerId];
      saveDB();
      render();
      return;
    }

    const tmp = teamA[idxA];
    teamA[idxA] = teamB[idxB];
    teamB[idxB] = tmp;
    state.flashKeys = ['slot:' + sel.playerId, 'slot:' + playerId];
    saveDB();
    render();
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
      ok = confirm('Sicher, dass du diesen Spieler endgültig löschen möchtest?');
    }
    if (!ok) return;
    const idx = DB.players.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.players[idx];
    DB.players.splice(idx, 1);
    saveDB();
    nav('players');
    showUndoToast('Spieler gelöscht', () => {
      DB.players.splice(idx, 0, removed);
      saveDB(); render();
    });
  }
  else if (action === 'deleteNote') {
    if (!confirm('Sicher, dass du diese Notiz endgültig löschen möchtest?')) return;
    const idx = DB.notes.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.notes[idx];
    const pid = removed.playerId;
    DB.notes.splice(idx, 1);
    saveDB();
    pid ? nav('playerProfile', { id: pid }) : nav('notes');
    showUndoToast('Notiz gelöscht', () => {
      DB.notes.splice(idx, 0, removed);
      saveDB(); render();
    });
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
    if (!confirm('Sicher, dass du diese Notiz endgültig löschen möchtest?')) return;
    const idx = DB.generalNotes.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.generalNotes[idx];
    DB.generalNotes.splice(idx, 1);
    saveDB();
    nav('notes');
    showUndoToast('Notiz gelöscht', () => {
      DB.generalNotes.splice(idx, 0, removed);
      saveDB(); render();
    });
  }
  else if (action === 'newMatch') {
    const m = {
      id: uid('m'), date: todayISO(), opponent: '', formation: '4-3-3',
      kaderSize: 18, availability: {}, kader: [], startElf: {}, completed: false,
    };
    activePlayers().forEach(p => { m.availability[p.id] = 'offen'; });
    DB.matches.push(m);
    saveDB();
    nav('matchDetail', { id: m.id });
  }
  else if (action === 'setMatchAvailability') {
    const m = DB.matches.find(x => x.id === id);
    const pid = btn.dataset.player;
    m.availability[pid] = btn.dataset.status;
    state.flashKeys = ['mav:' + pid];
    const msg = syncKaderWithAvailability(m, pid);
    saveDB(); render();
    if (msg) toast(msg);
  }
  else if (action === 'allMatchAvailability') {
    const m = DB.matches.find(x => x.id === id);
    activePlayers().forEach(p => { m.availability[p.id] = btn.dataset.status; });
    activePlayers().forEach(p => syncKaderWithAvailability(m, p.id));
    saveDB(); render();
  }
  else if (action === 'kaderFromZusagen') {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === id);
    const zugesagt = activePlayers().filter(p => m.availability[p.id] === 'zugesagt');
    if (zugesagt.length === 0) { toast('Noch keine Zusagen erfasst'); return; }
    const hasManual = (m.kader && m.kader.length) || Object.keys(m.startElf||{}).length;
    if (hasManual && !confirm('Kader und Startelf werden mit den Zusagen neu aufgebaut. Fortfahren?')) return;
    // Mehr Zusagen als Kaderplätze: die mit der höchsten Trainingsbeteiligung kommen rein,
    // positionsgerecht über dieselbe Logik wie die Automatik.
    let kaderIds = zugesagt.map(p => p.id);
    let cut = 0;
    if (kaderIds.length > m.kaderSize) {
      const onlyZugesagt = {};
      activePlayers().forEach(p => { onlyZugesagt[p.id] = m.availability[p.id] === 'zugesagt' ? 'zugesagt' : 'abgesagt'; });
      kaderIds = autoSelectKaderAndXI(m.formation, m.kaderSize, onlyZugesagt).kaderIds;
      cut = zugesagt.length - kaderIds.length;
    }
    m.kader = kaderIds;
    m.startElf = autoArrangeStartXI(kaderIds, m.formation).startElf;
    state.matchTab[m.id] = 'aufstellung';
    window.scrollTo(0, 0);
    saveDB(); render();
    toast(cut > 0
      ? `${kaderIds.length} Zusagen übernommen – ${cut} zu viel, bitte als „Nicht im Kader" markieren`
      : `${kaderIds.length} Zusagen übernommen ✓`);
  }
  else if (action === 'autoKader') {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === id);
    const hasManual = (m.kader && m.kader.length) || Object.keys(m.startElf||{}).length;
    if (hasManual && !confirm('Bestehender Kader und Startelf werden überschrieben. Fortfahren?')) return;
    const result = autoSelectKaderAndXI(m.formation, m.kaderSize, m.availability);
    m.kader = result.kaderIds;
    m.startElf = result.startElf;
    saveDB(); render();
  }
  else if (action === 'addToKader') {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === id);
    m.kader = m.kader || [];
    if (!m.kader.includes(btn.dataset.player)) m.kader.push(btn.dataset.player);
    saveDB(); render();
  }
  else if (action === 'removeFromKader') {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === id);
    m.kader = (m.kader||[]).filter(pid => pid !== btn.dataset.player);
    Object.keys(m.startElf||{}).forEach(slot => { if (m.startElf[slot] === btn.dataset.player) delete m.startElf[slot]; });
    saveDB(); render();
  }
  else if (action === 'autoArrange') {
    state.matchSwapSelection = null;
    const m = DB.matches.find(x => x.id === id);
    const { startElf } = autoArrangeStartXI(m.kader||[], m.formation);
    m.startElf = startElf;
    saveDB(); render();
  }
  else if (action === 'pitchSlotClick') {
    const m = DB.matches.find(x => x.id === id);
    if (m) handleLineupTap(m, { kind: 'slot', slot: btn.dataset.slot });
  }
  else if (action === 'benchClick') {
    const m = DB.matches.find(x => x.id === id);
    if (m) handleLineupTap(m, { kind: 'bench', playerId: btn.dataset.player });
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
    if (!confirm('Sicher, dass du diesen Spieltag endgültig löschen möchtest?')) return;
    const idx = DB.matches.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.matches[idx];
    DB.matches.splice(idx, 1);
    saveDB();
    nav('matchList');
    showUndoToast('Spieltag gelöscht', () => {
      DB.matches.splice(idx, 0, removed);
      saveDB(); render();
    });
  }
  else if (action === 'deleteExercise') {
    if (!confirm('Sicher, dass du diese Übung endgültig löschen möchtest?')) return;
    const idx = DB.exercises.findIndex(x => x.id === id);
    if (idx === -1) return;
    const removed = DB.exercises[idx];
    DB.exercises.splice(idx, 1);
    saveDB();
    nav('exercises');
    showUndoToast('Übung gelöscht', () => {
      DB.exercises.splice(idx, 0, removed);
      saveDB(); render();
    });
  }
  else if (action === 'addDiagramElement') {
    const ex = DB.exercises.find(x => x.id === id);
    if (!ex) return;
    ex.diagram = ex.diagram || { elements: [] };
    const type = btn.dataset.type;
    const n = ex.diagram.elements.length;
    const x = 15 + (n % 5) * 18;
    const y = 15 + Math.floor(n / 5) * 22;
    ex.diagram.elements.push({ id: uid('de'), type, x: Math.min(90, x), y: Math.min(90, y) });
    saveDB(); render();
  }
  else if (action === 'removeDiagramElement') {
    const ex = DB.exercises.find(x => x.id === id);
    if (!ex || !ex.diagram) return;
    ex.diagram.elements = ex.diagram.elements.filter(e => e.id !== btn.dataset.el);
    saveDB(); render();
  }
  else if (action === 'clearDiagram') {
    if (!confirm('Grafik wirklich leeren?')) return;
    const ex = DB.exercises.find(x => x.id === id);
    if (!ex) return;
    ex.diagram = { elements: [] };
    saveDB(); render();
  }
  else if (action === 'toggleWeekday') {
    const val = parseInt(btn.dataset.val, 10);
    DB.settings.trainingWeekdays = DB.settings.trainingWeekdays || [];
    const idx = DB.settings.trainingWeekdays.indexOf(val);
    if (idx >= 0) DB.settings.trainingWeekdays.splice(idx, 1);
    else DB.settings.trainingWeekdays.push(val);
    saveDB();
    const created = generateUpcomingTrainings(2);
    render();
    if (created > 0) toast(`${created} Training(s) angelegt ✓`);
  }
  else if (action === 'fillTrainings') {
    const created = generateUpcomingTrainings(2);
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
      const availability = {};
      activePlayers().forEach(p => { availability[p.id] = 'offen'; });
      DB.matches.push({
        id: uid('m'), date: r.date, opponent: r.opponent || '', formation: '4-3-3',
        kaderSize: 18, availability, kader: [], startElf: {}, completed: false,
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
    DB.settings.lastBackupAt = new Date().toISOString();
    saveDB();
    render();
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

/* ------------------------- Löschen mit Rückgängig-Fenster ------------------------- */

let undoState = null;

// Zeigt eine Löschbestätigung als Meldung mit "Rückgängig"-Button für einige Sekunden.
// restoreFn() macht die Löschung bei Bedarf wieder rückgängig.
function showUndoToast(message, restoreFn, duration) {
  finalizeUndo();
  const el = document.createElement('div');
  el.className = 'toast toast-undo';
  el.innerHTML = `<span>${esc(message)}</span><button type="button" id="undoBtn">Rückgängig</button>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  const timer = setTimeout(() => { finalizeUndo(); }, duration || 8000);
  undoState = { el, restoreFn, timer };
  el.querySelector('#undoBtn').addEventListener('click', () => {
    if (!undoState) return;
    clearTimeout(undoState.timer);
    const s = undoState;
    undoState = null;
    s.restoreFn();
    s.el.classList.remove('show');
    setTimeout(() => s.el.remove(), 300);
    toast('Wiederhergestellt ✓');
  });
}

// Beendet ein offenes Rückgängig-Fenster endgültig (Löschung bleibt bestehen).
function finalizeUndo() {
  if (!undoState) return;
  clearTimeout(undoState.timer);
  const s = undoState;
  undoState = null;
  s.el.classList.remove('show');
  setTimeout(() => s.el.remove(), 300);
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

// Direkte Positionsauswahl für einen einzelnen Spieler in den Trainingsteams -
// unabhängig davon, ob gerade ein anderer Spieler diese Position hat.
function openPlayerPositionPicker(trainingId, teamIdx, playerId) {
  const t = DB.trainings.find(x => x.id === trainingId);
  const arr = teamIdx === 'neutral' ? (t.teamGen.neutral || []) : t.teamGen.teams[teamIdx];
  const pl = arr && arr.find(p => p.id === playerId);
  if (!pl) return;

  const overlay = document.createElement('div');
  overlay.className = 'sheet-overlay';
  overlay.innerHTML = `
    <div class="sheet">
      <div class="sheet-head">Position für ${esc(pl.name)}<button class="icon-btn" id="sheetClose">✕</button></div>
      ${GROUP_ORDER.map(group => `
        <div class="pos-pick-group-label">${GROUP_LABEL[group]}</div>
        <div class="pos-pick-row">
          ${POSITIONS.filter(pos => GROUP_OF[pos] === group).map(pos => `
            <button class="pos-pick-btn ${pl.pos === pos ? 'active' : ''}" data-pos="${pos}">${pos}</button>
          `).join('')}
        </div>
      `).join('')}
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.id === 'sheetClose') { overlay.remove(); return; }
    const posBtn = e.target.closest('[data-pos]');
    if (!posBtn) return;
    pl.pos = posBtn.dataset.pos;
    overlay.remove();
    state.flashKeys = ['slot:' + pl.id];
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

const autoCreatedTrainings = generateUpcomingTrainings(2);
render();
if (autoCreatedTrainings > 0) toast(`${autoCreatedTrainings} Training(s) automatisch angelegt ✓`);
registerServiceWorker();
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
