// TUS Günlüğü — standalone PWA implementation.
// Ported from the Claude Design prototype (TUS Günlüğü.dc.html): same screens,
// same data/behaviour, but a real render loop + localStorage persistence
// instead of the design tool's DC runtime, and no phone-bezel chrome.
"use strict";

/* ── Real program data (from the user's uploaded TUS 2026 plan) ───────── */

const ICONS = {
  bugun: 'M8 2v4M16 2v4M3 10h18M3 5h18v16H3z',
  program: 'M3 4h18v16H3zM3 10h18M9 10v10M15 10v10',
  konular: 'M4 6h16M4 12h16M4 18h10',
  yanlis: 'M12 3L2 21h20L12 3zM12 10v5M12 18h.01',
  istatistik: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  ayarlar: 'M4 8h16M4 16h16M9 5v6M15 13v6'
};

const PROGRAM = [
  { tarih: '25 Tem', gun: 'Cmt', tur: 'Soru', sabah: 'Biyokimya + Farmakoloji (~150 soru)', ogle: 'Pediatri (~150 soru)', aksam: 'Günün yanlış analizi' },
  { tarih: '26 Tem', gun: 'Paz', tur: 'Soru', sabah: 'Mikrobiyoloji + Patoloji (~150 soru)', ogle: 'Dahiliye (~150 soru)', aksam: 'Yanlış analizi' },
  { tarih: '27 Tem', gun: 'Pzt', tur: 'Soru', sabah: 'Anatomi + Fizyoloji (~150 soru)', ogle: 'Genel Cerrahi + Küçük Stajlar (~150 soru)', aksam: 'Yanlış analizi' },
  { tarih: '28 Tem', gun: 'Sal', tur: 'Çıkmış Sorular', sabah: 'Son 5-6 dönem TTBT (~120)', ogle: 'Son 5-6 dönem KTBT (~120)', aksam: 'Yanlış analizi' },
  { tarih: '29 Tem', gun: 'Çar', tur: 'Soru', sabah: 'Histoloji-Embriyo + 4 büyük karışık tekrar', ogle: 'Kadın-Doğum + karışık tekrar', aksam: 'Yanlış analizi' },
  { tarih: '30 Tem', gun: 'Per', tur: 'Soru', sabah: 'Biyokimya + Mikrobiyoloji (~150 soru)', ogle: 'Pediatri + Dahiliye (~150 soru)', aksam: 'Yanlış analizi' },
  { tarih: '31 Tem', gun: 'Cum', tur: 'Çıkmış Sorular', sabah: 'Son 5-6 dönem TTBT (~120)', ogle: 'Son 5-6 dönem KTBT (~120)', aksam: 'Yanlış analizi' },
  { tarih: '1 Ağu', gun: 'Cmt', tur: 'Deneme', sabah: 'DENEME 1 (Baseline) · 10:15', ogle: 'DENEME 1 (Baseline) · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '2 Ağu', gun: 'Paz', tur: 'Analiz', sabah: 'D1 detaylı analiz, zayıf ders listesi', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri aç' },
  { tarih: '3 Ağu', gun: 'Pzt', tur: 'Deneme', sabah: 'DENEME 2 · 10:15', ogle: 'DENEME 2 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '4 Ağu', gun: 'Sal', tur: 'Analiz', sabah: 'D2 detaylı analiz', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri güncelle' },
  { tarih: '5 Ağu', gun: 'Çar', tur: 'Deneme', sabah: 'DENEME 3 · 10:15', ogle: 'DENEME 3 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '6 Ağu', gun: 'Per', tur: 'Analiz', sabah: 'D3 detaylı analiz', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri güncelle' },
  { tarih: '7 Ağu', gun: 'Cum', tur: 'Deneme', sabah: 'DENEME 4 · 10:15', ogle: 'DENEME 4 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '8 Ağu', gun: 'Cmt', tur: 'Analiz', sabah: 'D4 detaylı analiz', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri güncelle' },
  { tarih: '9 Ağu', gun: 'Paz', tur: 'Deneme', sabah: 'DENEME 5 (Pazar sim.) · 10:15', ogle: 'DENEME 5 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '10 Ağu', gun: 'Pzt', tur: 'Analiz', sabah: 'D5 detaylı analiz', ogle: 'Patoloji + Farmakoloji taraması', aksam: 'Yanlış defteri güncelle' },
  { tarih: '11 Ağu', gun: 'Sal', tur: 'Deneme', sabah: 'DENEME 6 · 10:15', ogle: 'DENEME 6 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '12 Ağu', gun: 'Çar', tur: 'Analiz', sabah: 'D6 detaylı analiz', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri güncelle' },
  { tarih: '13 Ağu', gun: 'Per', tur: 'Deneme', sabah: 'DENEME 7 · 10:15', ogle: 'DENEME 7 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '14 Ağu', gun: 'Cum', tur: 'Analiz', sabah: 'D7 detaylı analiz', ogle: 'Tüm derslerden karışık genel tekrar', aksam: 'Yanlış defteri güncelle' },
  { tarih: '15 Ağu', gun: 'Cmt', tur: 'Deneme', sabah: 'DENEME 8 · 10:15', ogle: 'DENEME 8 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '16 Ağu', gun: 'Paz', tur: 'Analiz', sabah: 'D8 detaylı analiz (Pazar)', ogle: 'Zayıf derslerden hedefli soru', aksam: 'Yanlış defteri güncelle' },
  { tarih: '17 Ağu', gun: 'Pzt', tur: 'Deneme', sabah: 'DENEME 9 · 10:15', ogle: 'DENEME 9 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '18 Ağu', gun: 'Sal', tur: 'Analiz', sabah: 'D9 detaylı analiz', ogle: 'Yanlış defterinin genel taraması', aksam: 'Yanlış defteri güncelle' },
  { tarih: '19 Ağu', gun: 'Çar', tur: 'Deneme', sabah: 'DENEME 10 (son) · 10:15', ogle: 'DENEME 10 · 14:45', aksam: 'Hızlı ilk analiz' },
  { tarih: '20 Ağu', gun: 'Per', tur: 'Analiz', sabah: 'D10 detaylı analiz', ogle: 'Yanlış defteri son tarama', aksam: 'Yanlış defteri güncelle' },
  { tarih: '21 Ağu', gun: 'Cum', tur: 'Taper', sabah: 'Hafif tekrar', ogle: 'Yanlış defterinden son 2 haftanın hataları', aksam: 'Erken dinlenme' },
  { tarih: '22 Ağu', gun: 'Cmt', tur: 'Taper', sabah: 'High-yield özet okuma (yeni soru yok)', ogle: 'Sınav lojistiği: kimlik, giriş belgesi, yol planı', aksam: 'Erken yat, ekran süresi az' },
  { tarih: '23 Ağu', gun: 'Paz', tur: 'Sınav', sabah: 'TTBT sınavı · 10:15–12:30', ogle: 'KTBT sınavı · 14:45–17:00', aksam: '—' }
];

const TARGET_BY_TYPE = { Soru: 300, 'Çıkmış Sorular': 240, Deneme: 200, Analiz: 100, Taper: 0, Sınav: 0 };
// Rough minute targets per program block, by day type — drives the "Bugün" task list.
const PERIOD_PLAN = { Soru: 100, 'Çıkmış Sorular': 80, Deneme: 135, Analiz: 90, Taper: 60, Sınav: 135 };

const TOPIC_MAP = {
  'Biyokimya': ['Enzimler ve kinetik', 'Karbonhidrat metabolizması', 'Lipid metabolizması', 'Vitaminler', 'Moleküler biyoloji'],
  'Mikrobiyoloji': ['Bakteriyoloji genel', 'Viroloji', 'Mikoloji', 'İmmünoloji', 'Parazitoloji'],
  'Patoloji': ['Hücre hasarı', 'İnflamasyon', 'Neoplazi', 'Genetik hastalıklar', 'Sistem patolojileri'],
  'Farmakoloji': ['Otonom sinir sistemi ilaçları', 'Antibiyotikler', 'Kardiyovasküler ilaçlar', 'SSS ilaçları', 'Farmakokinetik'],
  'Anatomi': ['Üst ekstremite', 'Alt ekstremite', 'Toraks', 'Baş-boyun', 'Nöroanatomi'],
  'Fizyoloji': ['Kardiyovasküler fizyoloji', 'Renal fizyoloji', 'Solunum fizyolojisi', 'Endokrin fizyoloji'],
  'Histoloji-Embriyoloji': ['Epitel doku', 'Erken embriyoloji', 'Organogenez'],
  'Pediatri': ['Neonatoloji', 'Büyüme-gelişme', 'Enfeksiyon hastalıkları', 'Kardiyoloji', 'Hematoloji'],
  'Dahiliye': ['Kardiyoloji', 'Endokrinoloji', 'Gastroenteroloji', 'Nefroloji', 'Romatoloji'],
  'Küçük Stajlar': ['Göz hastalıkları', 'KBB', 'Deri hastalıkları', 'Ortopedi', 'Psikiyatri'],
  'Genel Cerrahi': ['Travma', 'Gastrointestinal cerrahi', 'Onkolojik cerrahi', 'Üroloji'],
  'Kadın-Doğum': ['Obstetrik', 'Jinekolojik onkoloji', 'İnfertilite', 'Gebelik komplikasyonları']
};

// Daily question-priority weights from the user's plan notes ("Ders önceliği").
const PRIORITY_PER_DAY = {
  'Biyokimya': 18, 'Mikrobiyoloji': 18, 'Patoloji': 18, 'Farmakoloji': 18,
  'Anatomi': 13, 'Fizyoloji': 8, 'Histoloji-Embriyoloji': 7,
  'Pediatri': 25, 'Dahiliye': 23, 'Küçük Stajlar': 22, 'Genel Cerrahi': 20, 'Kadın-Doğum': 10
};

const KONULAR_SEED = [
  { g: 'TTBT — Temel bilimler', n: 'Biyokimya', total: 360 },
  { g: 'TTBT — Temel bilimler', n: 'Mikrobiyoloji', total: 360 },
  { g: 'TTBT — Temel bilimler', n: 'Patoloji', total: 360 },
  { g: 'TTBT — Temel bilimler', n: 'Farmakoloji', total: 360 },
  { g: 'TTBT — Temel bilimler', n: 'Anatomi', total: 260 },
  { g: 'TTBT — Temel bilimler', n: 'Fizyoloji', total: 160 },
  { g: 'TTBT — Temel bilimler', n: 'Histoloji-Embriyoloji', total: 140 },
  { g: 'KTBT — Klinik bilimler', n: 'Pediatri', total: 500 },
  { g: 'KTBT — Klinik bilimler', n: 'Dahiliye', total: 460 },
  { g: 'KTBT — Klinik bilimler', n: 'Küçük Stajlar', total: 440 },
  { g: 'KTBT — Klinik bilimler', n: 'Genel Cerrahi', total: 400 },
  { g: 'KTBT — Klinik bilimler', n: 'Kadın-Doğum', total: 200 }
];
const GROUP_NAMES = ['TTBT — Temel bilimler', 'KTBT — Klinik bilimler'];

/* ── Date / program-day helpers ────────────────────────────────────────── */

const MONTHS = { Tem: 6, Ağu: 7 }; // 0-indexed JS month: Temmuz=6 (July), Ağustos=7

function programEntryDate(entry) {
  const [dayStr, mon] = entry.tarih.split(' ');
  return new Date(2026, MONTHS[mon], parseInt(dayStr, 10));
}
function pad2(n) { return String(n).padStart(2, '0'); }
function dateKey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }

function findTodayIndex() {
  const key = dateKey(new Date());
  const idx = PROGRAM.findIndex((e) => dateKey(programEntryDate(e)) === key);
  if (idx !== -1) return idx;
  const first = programEntryDate(PROGRAM[0]);
  return new Date() < first ? 0 : PROGRAM.length - 1;
}

/* ── Persistence ────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'tusGunlugu.v1';

function defaultPersisted() {
  return {
    version: 1,
    sessions: [],          // { date, topic, minutes, questions, ts }
    tasksByDate: {},        // { [dateKey]: { [taskId]: doneMinutes } }
    konularDone: {},        // { [konuName]: doneCount }
    denemeler: [],          // { no, tarih, temel, klinik }
    yanlislar: [],          // { konu, baslik, not, tarih, ts }
    goalOverride: null,
    activeTopic: 'Serbest çalışma',
    sw: { pomodoro: false, bildirim: true, sessiz: true, hafta: false },
    timer: { running: false, startedAt: 0, elapsed: 0, sessionQ: 0, timerOpen: false }
  };
}
function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj && obj.version === 1) return Object.assign(defaultPersisted(), obj);
  } catch (e) { console.error('[TUS Günlüğü] failed to load saved data', e); }
  return null;
}
let P = loadPersisted() || defaultPersisted();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(P)); }
  catch (e) { console.error('[TUS Günlüğü] failed to save', e); }
}

/* Transient (not persisted) UI state. */
let UI = { tab: 'bugun', programDay: findTodayIndex(), denemeOpen: false, mistakeOpen: false, mSelKonu: null, mSelTopic: null, openDers: null };
let draftMistakeNote = '';
let draftDeneme = { tD: '', tY: '', kD: '', kY: '' };
let deferredInstallPrompt = null;

/* ── Domain helpers ─────────────────────────────────────────────────────── */

function fmtClock(ms) {
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h > 0 ? h + ':' + pad2(m) + ':' + pad2(sec) : pad2(m) + ':' + pad2(sec);
}
function hm(min) {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h === 0 ? m + ' dk' : h + 's ' + (m ? pad2(m) + 'dk' : '00dk');
}
function netCalc(dogru, yanlis) { return Math.max(0, (Number(dogru) || 0) - (Number(yanlis) || 0) / 4); }
function currentElapsedMs() { return P.timer.elapsed + (P.timer.running ? Date.now() - P.timer.startedAt : 0); }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function getKonular() {
  return KONULAR_SEED.map((k) => ({ ...k, done: Math.min(k.total, P.konularDone[k.n] || 0) }));
}

function buildDayTasks(dayEntry, dkey) {
  const stored = P.tasksByDate[dkey] || {};
  const type = dayEntry.tur;
  const blockPlan = PERIOD_PLAN[type] != null ? PERIOD_PLAN[type] : 90;
  const aksamPlan = type === 'Taper' ? 45 : 30;
  const defs = [];
  if (dayEntry.sabah) defs.push(['sabah', type + ' · TTBT', dayEntry.sabah, blockPlan]);
  if (dayEntry.ogle) defs.push(['ogle', type + ' · KTBT', dayEntry.ogle, blockPlan]);
  if (dayEntry.aksam && dayEntry.aksam !== '—') defs.push(['aksam', 'Akşam', dayEntry.aksam, aksamPlan]);
  return defs.map(([suffix, topic, title, plan]) => {
    const id = dkey + ':' + suffix;
    return { id, topic, title, plan, done: Math.min(plan, stored[id] || 0) };
  });
}
function setTaskDone(dkey, id, minutes) {
  if (!P.tasksByDate[dkey]) P.tasksByDate[dkey] = {};
  P.tasksByDate[dkey][id] = minutes;
  persist();
}

function activeDateSet() { return new Set(P.sessions.map((s) => s.date)); }
function computeStreak() {
  const set = activeDateSet();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let cursor = today;
  if (!set.has(dateKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!set.has(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(dateKey(cursor))) { streak++; cursor = addDays(cursor, -1); }
  return streak;
}

/* ── Actions ────────────────────────────────────────────────────────────── */

function setTab(key) { UI.tab = key; render(); }

function startTimer(topic) {
  P.activeTopic = topic;
  P.timer = { running: true, startedAt: Date.now(), elapsed: 0, sessionQ: 0, timerOpen: true };
  persist(); render();
}
function quickStart() { startTimer(P.activeTopic); }
function openTimerOverlay() { P.timer.timerOpen = true; persist(); render(); }
function closeTimerOverlay() { P.timer.timerOpen = false; persist(); render(); }
function toggleRun() {
  if (P.timer.running) { P.timer.elapsed += Date.now() - P.timer.startedAt; P.timer.running = false; }
  else { P.timer.startedAt = Date.now(); P.timer.running = true; }
  persist(); render();
}
function qAdjust(delta) { P.timer.sessionQ = Math.max(0, P.timer.sessionQ + delta); persist(); render(); }

function finishSession() {
  const minutes = Math.round(currentElapsedMs() / 60000);
  const q = P.timer.sessionQ;
  const topic = P.activeTopic;
  const dkey = dateKey(new Date());
  if (minutes > 0 || q > 0) {
    P.sessions.push({ date: dkey, topic, minutes, questions: q, ts: Date.now() });
    const tasks = buildDayTasks(PROGRAM[findTodayIndex()], dkey);
    const match = tasks.find((t) => t.topic === topic && t.done < t.plan);
    if (match) setTaskDone(dkey, match.id, Math.min(match.plan, match.done + minutes));
    const konu = KONULAR_SEED.find((k) => k.n === topic);
    if (konu) P.konularDone[topic] = Math.min(konu.total, (P.konularDone[topic] || 0) + q);
  }
  P.timer = { running: false, startedAt: 0, elapsed: 0, sessionQ: 0, timerOpen: false };
  persist(); render();
}

function toggleTask(id) {
  const dkey = id.split(':')[0];
  const tasks = buildDayTasks(PROGRAM[findTodayIndex()], dkey);
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  setTaskDone(dkey, id, t.done >= t.plan ? 0 : t.plan);
  render();
}

function pickDay(idx) { UI.programDay = idx; render(); }

function openMistakeSheet() { draftMistakeNote = ''; UI.mistakeOpen = true; UI.mSelKonu = null; UI.mSelTopic = null; render(); }
function closeMistakeSheet() { UI.mistakeOpen = false; render(); }
function pickMistakeKonu(name) { UI.mSelKonu = name; UI.mSelTopic = null; render(); }
function pickMistakeTopic(name) { UI.mSelTopic = name; render(); }
function saveMistake() {
  if (!UI.mSelKonu) return;
  const today = PROGRAM[findTodayIndex()];
  P.yanlislar.unshift({ konu: UI.mSelKonu, baslik: UI.mSelTopic, not: draftMistakeNote.trim(), tarih: today.tarih, ts: Date.now() });
  persist(); UI.mistakeOpen = false; render();
}
function toggleDers(name) { UI.openDers = UI.openDers === name ? null : name; render(); }

function openDenemeSheet() { draftDeneme = { tD: '', tY: '', kD: '', kY: '' }; UI.denemeOpen = true; render(); }
function closeDenemeSheet() { UI.denemeOpen = false; render(); }
function saveDeneme() {
  const temel = netCalc(draftDeneme.tD, draftDeneme.tY);
  const klinik = netCalc(draftDeneme.kD, draftDeneme.kY);
  const today = PROGRAM[findTodayIndex()];
  P.denemeler.unshift({ no: 'DENEME ' + (P.denemeler.length + 1), tarih: today.tarih, temel, klinik });
  persist(); UI.denemeOpen = false; render();
}
function updateDenemePreview() {
  const el = document.getElementById('denemeNetPreview');
  if (!el) return;
  const temel = netCalc(draftDeneme.tD, draftDeneme.tY);
  const klinik = netCalc(draftDeneme.kD, draftDeneme.kY);
  el.textContent = ((temel + klinik) / 2).toFixed(2);
}

function goalStep(delta) {
  const today = PROGRAM[findTodayIndex()];
  const base = P.goalOverride != null ? P.goalOverride : (TARGET_BY_TYPE[today.tur] || 0);
  P.goalOverride = Math.max(0, base + delta);
  persist(); render();
}
function toggleSetting(key) { P.sw[key] = !P.sw[key]; persist(); render(); }
function resetAllData() {
  if (!confirm('Tüm çalışma verilerin (süre, net, yanlış defteri, ayarlar) silinsin mi? Bu işlem geri alınamaz.')) return;
  localStorage.removeItem(STORAGE_KEY);
  P = defaultPersisted();
  UI = { tab: 'ayarlar', programDay: findTodayIndex(), denemeOpen: false, mistakeOpen: false, mSelKonu: null, mSelTopic: null, openDers: null };
  render();
}
function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => { deferredInstallPrompt = null; render(); });
}

/* ── Small render helpers ──────────────────────────────────────────────── */

function svgIcon(key, color, size) {
  size = size || 21;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="square"><path d="' + ICONS[key] + '"></path></svg>';
}
const PLAY_ICON = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polygon points="6 3 20 12 6 21 6 3" fill="currentColor"></polygon></svg>';
const STOPWATCH_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2.5 2.5"></path><path d="M9 2h6"></path></svg>';
const CHEVRON_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" style="transform:rotate({ROT});transition:transform .15s"><path d="M6 9l6 6 6-6"></path></svg>';
const X_ICON_SM = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"><path d="M6 9l6 6 6-6"></path></svg>';

function typeColor(t) { return (t === 'Deneme' || t === 'Sınav') ? 'var(--color-accent-700)' : (t === 'Analiz' ? 'var(--color-neutral-700)' : 'var(--color-text)'); }

/* ── Screen renderers ──────────────────────────────────────────────────── */

function renderTopbar(streak) {
  return '' +
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:calc(14px + env(safe-area-inset-top)) 18px 12px;border-bottom:2px solid var(--color-text);background:var(--color-bg)">' +
      '<div style="font-weight:900;font-size:14px;letter-spacing:.2em;text-transform:uppercase">TUS Günlüğü</div>' +
      '<div style="display:flex;align-items:center;gap:6px">' +
        '<div style="width:8px;height:8px;background:var(--color-accent)"></div>' +
        '<div style="font-weight:700;font-size:11px;letter-spacing:.1em;color:var(--color-accent-700)">' + streak + ' GÜN SERİ</div>' +
      '</div>' +
    '</div>';
}

function renderBugun(ctx) {
  const { today, tasks, doneCount, todayMin, todayQ, hedefSoru, goalPct, lastNet } = ctx;
  const kalanLabel = hedefSoru === 0
    ? 'Bugün yeni soru yok — analiz ve tekrar günü.'
    : (todayQ >= hedefSoru ? 'Hedefi tamamladın — devam!' : (hedefSoru - todayQ) + ' soru kaldı, bırakma.');

  const taskRows = tasks.map((t) => {
    const ok = t.done >= t.plan;
    const pct = Math.min(100, Math.round((t.done / t.plan) * 100)) + '%';
    const barColor = ok ? 'var(--color-text)' : 'var(--color-accent)';
    const titleColor = ok ? 'var(--color-neutral-600)' : 'var(--color-text)';
    const checkBg = ok ? 'var(--color-surface)' : 'var(--color-bg)';
    const checkBorder = ok ? 'var(--color-accent)' : 'var(--color-text)';
    const checkFill = ok ? 'var(--color-accent)' : 'transparent';
    return '' +
      '<div style="display:flex;align-items:stretch;border-top:1px solid var(--color-divider)">' +
        '<button class="hv-neutral-200" data-action="toggleTask" data-id="' + t.id + '" style="width:52px;flex:none;border:0;border-right:1px solid var(--color-divider);background:' + checkBg + ';display:flex;align-items:center;justify-content:center;padding:0">' +
          '<div style="width:18px;height:18px;border:2px solid ' + checkBorder + ';background:' + checkFill + '"></div>' +
        '</button>' +
        '<div style="flex:1;min-width:0;padding:13px 14px">' +
          '<div style="font-weight:600;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700)">' + esc(t.topic) + '</div>' +
          '<div style="margin-top:3px;font-weight:700;font-size:15px;line-height:1.25;text-decoration:' + (ok ? 'line-through' : 'none') + ';color:' + titleColor + '">' + esc(t.title) + '</div>' +
          '<div style="margin-top:6px;display:flex;align-items:center;gap:8px">' +
            '<div style="flex:1;height:4px;background:var(--color-neutral-300)"><div style="height:100%;width:' + pct + ';background:' + barColor + '"></div></div>' +
            '<div style="font-weight:600;font-size:10px;letter-spacing:.06em;color:var(--color-neutral-700)">' + t.done + '/' + t.plan + ' dk</div>' +
          '</div>' +
        '</div>' +
        '<button class="hv-fill-accent" data-action="startTopic" data-topic="' + esc(t.topic) + '" style="width:54px;flex:none;border:0;border-left:1px solid var(--color-divider);background:var(--color-bg);display:flex;align-items:center;justify-content:center;color:var(--color-text)">' + PLAY_ICON + '</button>' +
      '</div>';
  }).join('');

  return '' +
    '<div style="padding:20px 18px 18px;border-bottom:2px solid var(--color-text)">' +
      '<div style="font-weight:600;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--color-neutral-700)">' + today.tarih + ' · ' + today.gun + ' · ' + today.tur + ' günü</div>' +
      '<div style="display:flex;align-items:flex-end;gap:10px;margin-top:10px">' +
        '<div style="font-weight:900;font-size:52px;line-height:.85;letter-spacing:-.03em">' + todayQ + '</div>' +
        '<div style="font-weight:700;font-size:15px;line-height:1;padding-bottom:5px;color:var(--color-neutral-700)">/ ' + hedefSoru + ' soru hedef</div>' +
      '</div>' +
      '<div style="height:10px;background:var(--color-neutral-300);margin-top:14px"><div style="height:100%;width:' + goalPct + '%;background:var(--color-accent)"></div></div>' +
      '<div style="margin-top:8px;font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-neutral-700)">' + kalanLabel + '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:2px solid var(--color-text)">' +
      '<div style="padding:14px 12px 14px 16px;border-right:1px solid var(--color-divider)"><div style="font-weight:900;font-size:22px;line-height:1">' + hm(todayMin) + '</div><div style="margin-top:4px;font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">Süre</div></div>' +
      '<div style="padding:14px 12px;border-right:1px solid var(--color-divider)"><div style="font-weight:900;font-size:22px;line-height:1">' + doneCount + '</div><div style="margin-top:4px;font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">Görev</div></div>' +
      '<div style="padding:14px 12px"><div style="font-weight:900;font-size:22px;line-height:1">' + lastNet + '</div><div style="margin-top:4px;font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">Son net</div></div>' +
    '</div>' +
    '<div style="padding:18px 18px 8px;display:flex;align-items:baseline;justify-content:space-between">' +
      '<div style="font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase">Bugünün planı</div>' +
      '<div style="font-weight:600;font-size:11px;color:var(--color-neutral-700)">' + doneCount + '/' + tasks.length + '</div>' +
    '</div>' +
    taskRows +
    '<div style="border-top:2px solid var(--color-text);padding:18px">' +
      '<button class="hv-accent-600" data-action="quickStart" style="width:100%;border:0;background:var(--color-accent);color:#fff;padding:18px;display:flex;align-items:center;justify-content:space-between">' +
        '<span style="font-weight:800;font-size:15px;letter-spacing:.14em;text-transform:uppercase">Kronometreyi başlat</span>' + STOPWATCH_ICON +
      '</button>' +
      '<div style="margin-top:14px;font-weight:500;font-size:12px;line-height:1.5;color:var(--color-neutral-700)">Serbest sayar. Bitirdiğinde süreyi konuya yazarsın.</div>' +
    '</div><div style="height:20px"></div>';
}

function renderProgram() {
  const day = PROGRAM[UI.programDay];
  const chips = PROGRAM.map((d, i) => {
    const sel = i === UI.programDay;
    const bg = sel ? 'var(--color-text)' : 'var(--color-bg)';
    const fg = sel ? 'var(--color-bg)' : 'var(--color-text)';
    const dot = (d.tur === 'Deneme' || d.tur === 'Sınav') ? 'var(--color-accent)' : (sel ? 'var(--color-neutral-400)' : 'transparent');
    return '<button data-action="pickDay" data-idx="' + i + '" data-selected="' + (sel ? '1' : '0') + '" style="flex:none;width:50px;border:0;border-right:1px solid var(--color-divider);background:' + bg + ';color:' + fg + ';padding:12px 0 10px;display:flex;flex-direction:column;align-items:center;gap:6px">' +
      '<span style="font-weight:700;font-size:9px;letter-spacing:.1em">' + d.gun + '</span>' +
      '<span style="font-weight:900;font-size:16px;line-height:1">' + d.tarih.split(' ')[0] + '</span>' +
      '<span style="width:14px;height:3px;background:' + dot + '"></span>' +
    '</button>';
  }).join('');
  const blocks = [
    { period: 'SABAH (TTBT)', text: day.sabah, accent: typeColor(day.tur) },
    { period: 'ÖĞLEDEN SONRA (KTBT)', text: day.ogle, accent: typeColor(day.tur) },
    { period: 'AKŞAM', text: day.aksam, accent: 'var(--color-neutral-400)' }
  ].map((b) => '' +
    '<div style="display:flex;border-top:1px solid var(--color-divider)">' +
      '<div style="width:96px;flex:none;padding:14px 0 14px 18px;border-right:1px solid var(--color-divider)"><div style="font-weight:700;font-size:10px;letter-spacing:.1em;text-transform:uppercase;line-height:1.3">' + b.period + '</div></div>' +
      '<div style="flex:1;min-width:0;padding:14px;border-left:4px solid ' + b.accent + '"><div style="font-weight:500;font-size:13px;line-height:1.4">' + esc(b.text) + '</div></div>' +
    '</div>'
  ).join('');

  return '' +
    '<div style="padding:18px 18px 14px;border-bottom:2px solid var(--color-text)">' +
      '<div style="font-weight:900;font-size:26px;line-height:1;letter-spacing:-.02em">Gün gün program</div>' +
      '<div style="margin-top:8px;font-weight:600;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">25 Temmuz – 23 Ağustos 2026 · 10 tam deneme</div>' +
    '</div>' +
    '<div id="dayScroller" style="display:flex;overflow-x:auto;border-bottom:2px solid var(--color-text)">' + chips + '</div>' +
    '<div style="padding:16px 18px 10px;display:flex;align-items:baseline;justify-content:space-between">' +
      '<div style="font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase">' + day.tarih + ' ' + day.gun + '</div>' +
      '<div style="font-weight:700;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:' + typeColor(day.tur) + '">' + day.tur + '</div>' +
    '</div>' +
    blocks + '<div style="height:20px"></div>';
}

function renderKonular() {
  const konular = getKonular();
  const allDone = konular.reduce((a, k) => a + k.done, 0);
  const allTotal = konular.reduce((a, k) => a + k.total, 0);
  const allPct = allTotal ? Math.round((allDone / allTotal) * 100) : 0;

  const groups = GROUP_NAMES.map((g) => {
    const items = konular.filter((k) => k.g === g).map((k) => {
      const pct = Math.round((k.done / k.total) * 100) + '%';
      const color = k.done / k.total >= 0.4 ? 'var(--color-text)' : 'var(--color-accent)';
      return '' +
        '<button class="hv-accent-100" data-action="startTopic" data-topic="' + esc(k.n) + '" style="width:100%;display:block;text-align:left;border:0;border-bottom:1px solid var(--color-divider);background:var(--color-bg);padding:13px 18px;color:var(--color-text)">' +
          '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px">' +
            '<div style="font-weight:700;font-size:15px">' + esc(k.n) + '</div>' +
            '<div style="font-weight:600;font-size:11px;color:var(--color-neutral-700)">' + (PRIORITY_PER_DAY[k.n] || 0) + '/gün</div>' +
          '</div>' +
          '<div style="margin-top:8px;display:flex;align-items:center;gap:10px">' +
            '<div style="flex:1;height:6px;background:var(--color-neutral-300)"><div style="height:100%;width:' + pct + ';background:' + color + '"></div></div>' +
            '<div style="width:72px;text-align:right;font-weight:600;font-size:10px;letter-spacing:.06em;color:var(--color-neutral-700)">' + k.done + '/' + k.total + '</div>' +
          '</div>' +
        '</button>';
    }).join('');
    return '<div><div style="padding:14px 18px 10px;background:var(--color-surface);border-bottom:1px solid var(--color-divider)"><div style="font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase">' + g + '</div></div>' + items + '</div>';
  }).join('');

  return '' +
    '<div style="padding:18px 18px 14px;border-bottom:2px solid var(--color-text)">' +
      '<div style="font-weight:900;font-size:26px;line-height:1;letter-spacing:-.02em">Ders bazlı ilerleme</div>' +
      '<div style="margin-top:10px;display:flex;align-items:center;gap:10px">' +
        '<div style="flex:1;height:10px;background:var(--color-neutral-300)"><div style="height:100%;width:' + allPct + '%;background:var(--color-accent)"></div></div>' +
        '<div style="font-weight:800;font-size:13px">' + allPct + '%</div>' +
      '</div>' +
      '<div style="margin-top:8px;font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-neutral-700)">' + allDone + ' / ' + allTotal + ' soru çözüldü</div>' +
    '</div>' + groups + '<div style="height:20px"></div>';
}

function renderYanlis() {
  const konular = getKonular();
  const counts = {};
  P.yanlislar.forEach((y) => { counts[y.konu] = (counts[y.konu] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const topKonuLabel = top ? top[0] : '—';
  const maxC = Math.max.apply(null, konular.map((k) => counts[k.n] || 0).concat([1]));

  const wrongByKonu = konular.map((k) => {
    const dersYanlis = P.yanlislar.filter((y) => y.konu === k.n);
    const topicCounts = {};
    dersYanlis.forEach((y) => { const key = y.baslik || 'Diğer'; topicCounts[key] = (topicCounts[key] || 0) + 1; });
    const topicNames = (TOPIC_MAP[k.n] || []).concat(topicCounts['Diğer'] ? ['Diğer'] : []);
    const maxT = Math.max.apply(null, topicNames.map((t) => topicCounts[t] || 0).concat([1]));
    const topics = topicNames.map((t) => ({ n: t, count: topicCounts[t] || 0, pct: Math.round(((topicCounts[t] || 0) / maxT) * 100) + '%' })).sort((a, b) => b.count - a.count);
    return { n: k.n, count: counts[k.n] || 0, pct: Math.round(((counts[k.n] || 0) / maxC) * 100) + '%', topics };
  }).sort((a, b) => b.count - a.count);

  const dersRows = wrongByKonu.map((w) => {
    const isOpen = UI.openDers === w.n;
    const chevron = CHEVRON_ICON.replace('{ROT}', isOpen ? '180deg' : '0deg');
    const topicsHtml = isOpen ? ('<div style="background:var(--color-surface);padding:4px 18px 10px 30px">' + w.topics.map((tp) => '' +
      '<div style="padding:7px 0">' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px"><div style="font-weight:600;font-size:12px;color:var(--color-neutral-800)">' + esc(tp.n) + '</div><div style="font-weight:700;font-size:11px;color:var(--color-accent-700)">' + tp.count + '</div></div>' +
        '<div style="margin-top:4px;height:4px;background:var(--color-neutral-300)"><div style="height:100%;width:' + tp.pct + ';background:var(--color-neutral-700)"></div></div>' +
      '</div>'
    ).join('') + '</div>') : '';
    return '' +
      '<div style="border-top:1px solid var(--color-divider)">' +
        '<button class="hv-surface" data-action="toggleDers" data-name="' + esc(w.n) + '" style="width:100%;text-align:left;border:0;background:transparent;padding:10px 18px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
            '<div style="font-weight:700;font-size:14px">' + esc(w.n) + '</div>' +
            '<div style="display:flex;align-items:center;gap:8px"><div style="font-weight:800;font-size:13px;color:var(--color-accent-700)">' + w.count + '</div>' + chevron + '</div>' +
          '</div>' +
          '<div style="margin-top:6px;height:6px;background:var(--color-neutral-300)"><div style="height:100%;width:' + w.pct + ';background:var(--color-accent)"></div></div>' +
        '</button>' + topicsHtml +
      '</div>';
  }).join('');

  const recent = P.yanlislar.slice(0, 8).map((y) => '' +
    '<div style="padding:12px 18px;border-top:1px solid var(--color-divider)">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px"><div style="font-weight:700;font-size:13px">' + esc(y.konu) + (y.baslik ? ' · ' + esc(y.baslik) : '') + '</div><div style="font-weight:600;font-size:10px;color:var(--color-neutral-600)">' + y.tarih + '</div></div>' +
      (y.not ? '<div style="margin-top:4px;font-weight:500;font-size:12px;color:var(--color-neutral-700)">' + esc(y.not) + '</div>' : '') +
    '</div>'
  ).join('') || '<div style="padding:12px 18px;font-weight:500;font-size:12px;color:var(--color-neutral-700)">Henüz yanlış kaydedilmedi.</div>';

  return '' +
    '<div style="padding:18px 18px 14px;border-bottom:2px solid var(--color-text)">' +
      '<div style="font-weight:900;font-size:26px;line-height:1;letter-spacing:-.02em">Yanlış defteri</div>' +
      '<div style="margin-top:8px;font-weight:600;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">' + P.yanlislar.length + ' yanlış kayıtlı · en zayıf: ' + esc(topKonuLabel) + '</div>' +
    '</div>' +
    '<div style="padding:16px 18px 8px;font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-700)">Derse göre yanlış sayısı</div>' +
    dersRows +
    '<div style="padding:18px 18px 8px;border-top:2px solid var(--color-text);font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-700)">Son kayıtlar</div>' +
    recent +
    '<div style="border-top:2px solid var(--color-text);padding:18px">' +
      '<button class="hv-accent-600" data-action="openMistake" style="width:100%;border:0;background:var(--color-accent);color:#fff;padding:16px;display:flex;align-items:center;justify-content:space-between">' +
        '<span style="font-weight:800;font-size:13px;letter-spacing:.14em;text-transform:uppercase">Yanlış ekle</span><span style="font-weight:800;font-size:16px">+</span>' +
      '</button>' +
    '</div><div style="height:20px"></div>';
}

function renderIstatistik(ctx) {
  const todayIdx = ctx.todayIdx;
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(new Date(), -i));
  const dayTotals = days.map((d) => {
    const dk = dateKey(d);
    const q = P.sessions.filter((s) => s.date === dk).reduce((a, s) => a + s.questions, 0);
    const progIdx = PROGRAM.findIndex((e) => dateKey(programEntryDate(e)) === dk);
    const label = progIdx !== -1 ? PROGRAM[progIdx].gun : ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][d.getDay()];
    return { dk, q, label, isToday: dk === dateKey(new Date()) };
  });
  const maxW = Math.max.apply(null, dayTotals.map((d) => d.q).concat([1]));
  const weekSum = dayTotals.reduce((a, d) => a + d.q, 0);
  const netAvg = P.denemeler.length ? (P.denemeler.reduce((a, d) => a + (d.temel + d.klinik) / 2, 0) / P.denemeler.length).toFixed(1) : '—';

  const bars = dayTotals.map((d) => '' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:stretch;gap:6px;height:100%;justify-content:flex-end">' +
      '<div style="font-weight:700;font-size:9px;text-align:center;color:var(--color-neutral-700)">' + (d.q || '—') + '</div>' +
      '<div style="height:' + Math.round((d.q / maxW) * 96) + 'px;background:' + (d.isToday ? 'var(--color-accent)' : 'var(--color-neutral-700)') + '"></div>' +
      '<div style="font-weight:700;font-size:9px;letter-spacing:.06em;text-align:center;color:var(--color-neutral-700)">' + d.label + '</div>' +
    '</div>'
  ).join('');

  const denemeRows = P.denemeler.length ? P.denemeler.map((d) => '' +
    '<div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-top:1px solid var(--color-divider)">' +
      '<div style="width:58px;flex:none;font-weight:800;font-size:12px;letter-spacing:.08em">' + d.no + '</div>' +
      '<div style="flex:1;font-weight:500;font-size:11px;color:var(--color-neutral-700)">' + d.tarih + '</div>' +
      '<div style="font-weight:700;font-size:14px;width:52px;text-align:right">' + d.temel.toFixed(2) + '</div>' +
      '<div style="font-weight:700;font-size:14px;width:52px;text-align:right;color:var(--color-accent-700)">' + d.klinik.toFixed(2) + '</div>' +
    '</div>'
  ).join('') : '';

  return '' +
    '<div style="padding:18px 18px 14px;border-bottom:2px solid var(--color-text)"><div style="font-weight:900;font-size:26px;line-height:1;letter-spacing:-.02em">İstatistik</div></div>' +
    '<div style="padding:18px 18px 6px;font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-700)">Son 7 gün · çözülen soru</div>' +
    '<div style="padding:6px 18px 18px;border-bottom:2px solid var(--color-text)">' +
      '<div style="display:flex;align-items:flex-end;gap:8px;height:132px">' + bars + '</div>' +
      '<div style="margin-top:14px;display:flex;justify-content:space-between;border-top:1px solid var(--color-divider);padding-top:10px"><div style="font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--color-neutral-700)">Toplam</div><div style="font-weight:800;font-size:13px">' + weekSum + ' soru</div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:2px solid var(--color-text)">' +
      '<div style="padding:16px 14px 16px 18px;border-right:1px solid var(--color-divider)"><div style="font-weight:900;font-size:26px;line-height:1">' + weekSum + '</div><div style="margin-top:5px;font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">Soru / hafta</div></div>' +
      '<div style="padding:16px 14px"><div style="font-weight:900;font-size:26px;line-height:1;color:var(--color-accent-700)">' + netAvg + '</div><div style="margin-top:5px;font-weight:600;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--color-neutral-700)">Net ortalaması</div></div>' +
    '</div>' +
    '<div style="padding:18px 18px 8px;display:flex;align-items:baseline;justify-content:space-between"><div style="font-weight:800;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--color-neutral-700)">Denemeler</div><div style="font-weight:600;font-size:11px;color:var(--color-neutral-700)">Temel / Klinik</div></div>' +
    denemeRows +
    '<div style="border-top:1px solid var(--color-divider);padding:14px 18px;font-weight:500;font-size:12px;line-height:1.5;color:var(--color-neutral-700)">Deneme 1 (baseline) 1 Ağustos\'ta yapıldı. Netini aşağıdan gir.</div>' +
    '<div style="border-top:2px solid var(--color-text);padding:18px">' +
      '<button class="hv-fill-accent" data-action="openDeneme" style="width:100%;border:0;background:var(--color-text);color:var(--color-bg);padding:16px;display:flex;align-items:center;justify-content:space-between">' +
        '<span style="font-weight:800;font-size:13px;letter-spacing:.14em;text-transform:uppercase">Deneme net gir</span><span style="font-weight:800;font-size:16px">+</span>' +
      '</button>' +
    '</div><div style="height:20px"></div>';
}

function renderAyarlar() {
  const today = PROGRAM[findTodayIndex()];
  const goalLabel = P.goalOverride == null ? 'Oto' : P.goalOverride + ' soru';
  const swDef = [
    ['pomodoro', 'Pomodoro modu', '25 dk çalış / 5 dk mola döngüsü. Kapalıyken serbest sayar.'],
    ['bildirim', 'Blok hatırlatması', 'Program bloğu başlarken bildirim gönder.'],
    ['sessiz', 'Odak sırasında sessiz', 'Kronometre çalışırken bildirimleri sustur.'],
    ['hafta', 'Haftalık rapor', 'Pazar akşamı hafta özetini göster.']
  ];
  const toggles = swDef.map(([k, n, d]) => {
    const on = !!P.sw[k];
    return '' +
      '<button class="hv-neutral-200" data-action="toggleSetting" data-key="' + k + '" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;text-align:left;border:0;border-bottom:1px solid var(--color-divider);background:var(--color-bg);padding:16px 18px;color:var(--color-text)">' +
        '<span style="flex:1;min-width:0"><span style="display:block;font-weight:700;font-size:14px">' + n + '</span><span style="display:block;margin-top:3px;font-weight:500;font-size:11px;line-height:1.4;color:var(--color-neutral-700)">' + d + '</span></span>' +
        '<span style="width:46px;height:26px;flex:none;border:2px solid var(--color-text);background:' + (on ? 'var(--color-accent)' : 'transparent') + ';display:flex;align-items:center;justify-content:' + (on ? 'flex-end' : 'flex-start') + ';padding:2px"><span style="width:18px;height:18px;background:' + (on ? '#fff' : 'var(--color-text)') + '"></span></span>' +
      '</button>';
  }).join('');

  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  let installHtml = '';
  if (!standalone) {
    installHtml = deferredInstallPrompt
      ? '<button class="hv-accent-600" data-action="installApp" style="width:100%;border:0;background:var(--color-accent);color:#fff;padding:16px;text-align:left;cursor:pointer;font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Ana ekrana ekle</button>'
      : '<div style="font-weight:500;font-size:11px;line-height:1.6;color:var(--color-neutral-600)">iPhone: Paylaş → Ana Ekrana Ekle.<br>Android/Chrome: sağ üst ⋮ menüsü → Ana ekrana ekle.</div>';
  }

  return '' +
    '<div style="padding:18px 18px 14px;border-bottom:2px solid var(--color-text)"><div style="font-weight:900;font-size:26px;line-height:1;letter-spacing:-.02em">Ayarlar</div></div>' +
    '<div style="padding:16px 18px;border-bottom:1px solid var(--color-divider)">' +
      '<div style="font-weight:800;font-size:11px;letter-spacing:.16em;text-transform:uppercase">Günlük soru hedefi</div>' +
      '<div style="margin-top:12px;display:flex;align-items:center;gap:0;border:2px solid var(--color-text)">' +
        '<button class="hv-neutral-200" data-action="goalDown" style="width:46px;height:44px;border:0;border-right:2px solid var(--color-text);background:transparent;font-weight:800;font-size:18px;color:var(--color-text)">–</button>' +
        '<div style="flex:1;text-align:center;font-weight:900;font-size:17px">' + goalLabel + '</div>' +
        '<button class="hv-neutral-200" data-action="goalUp" style="width:46px;height:44px;border:0;border-left:2px solid var(--color-text);background:transparent;font-weight:800;font-size:18px;color:var(--color-text)">+</button>' +
      '</div>' +
      '<div style="margin-top:8px;font-weight:500;font-size:11px;line-height:1.5;color:var(--color-neutral-600)">Boşsa gün türüne göre otomatik hesaplanır (soru günü ~300, analiz ~100, deneme ~200). Bugün: ' + today.tur + '.</div>' +
    '</div>' +
    toggles +
    '<div style="padding:18px">' +
      '<button class="hv-fill-accent" data-action="resetData" style="width:100%;border:2px solid var(--color-accent);background:transparent;color:var(--color-accent-700);padding:14px;text-align:left;font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Verileri sıfırla</button>' +
      '<div style="margin-top:14px;font-weight:500;font-size:11px;line-height:1.5;color:var(--color-neutral-600)">TUS Günlüğü · 25 Temmuz – 23 Ağustos 2026 programı · kişisel kullanım · veriler bu cihazda saklanır</div>' +
      (installHtml ? '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--color-divider)">' + installHtml + '</div>' : '') +
    '</div><div style="height:20px"></div>';
}

/* ── Overlays: mini bar, bottom nav, timer, sheets ─────────────────────── */

function renderMiniBar() {
  if (P.timer.timerOpen || !(P.timer.running || currentElapsedMs() > 0)) return '';
  return '' +
    '<button data-action="openTimer" style="display:flex;align-items:center;gap:12px;width:100%;border:0;border-top:2px solid var(--color-text);background:var(--color-accent);color:#fff;padding:12px 18px;text-align:left">' +
      '<span style="width:9px;height:9px;background:#fff;animation:tusblink 1s steps(1,end) infinite"></span>' +
      '<span style="flex:1;min-width:0;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(P.activeTopic) + '</span>' +
      '<span id="miniClock" style="font-weight:800;font-size:16px;font-variant-numeric:tabular-nums;letter-spacing:.02em">' + fmtClock(currentElapsedMs()) + '</span>' +
    '</button>';
}

function renderBottomNav() {
  const navDef = [['bugun', 'Bugün'], ['program', 'Program'], ['konular', 'Dersler'], ['yanlis', 'Yanlış'], ['istatistik', 'İstatistik'], ['ayarlar', 'Ayarlar']];
  const items = navDef.map(([k, n]) => {
    const active = UI.tab === k;
    const color = active ? 'var(--color-accent)' : 'var(--color-neutral-600)';
    return '' +
      '<button class="hv-neutral-200" data-action="setTab" data-tab="' + k + '" style="border:0;background:transparent;padding:0;color:' + color + ';display:flex;flex-direction:column;align-items:center;gap:5px">' +
        '<span style="width:100%;height:3px;background:' + (active ? 'var(--color-accent)' : 'transparent') + '"></span>' +
        '<span style="padding-top:5px">' + svgIcon(k, color) + '</span>' +
        '<span style="font-weight:700;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;padding-bottom:calc(9px + env(safe-area-inset-bottom))">' + n + '</span>' +
      '</button>';
  }).join('');
  return '<div style="display:grid;grid-template-columns:repeat(6,1fr);border-top:2px solid var(--color-text);background:var(--color-bg)">' + items + '</div>';
}

function renderTimerOverlay() {
  if (!P.timer.timerOpen) return '';
  const running = P.timer.running;
  const runLabel = running ? 'Sayıyor · odaklan' : 'Duraklatıldı';
  const runBtnLabel = running ? 'Duraklat' : 'Devam et';
  const runBtnBg = running ? 'var(--color-bg)' : 'var(--color-accent)';
  const runBtnFg = running ? 'var(--color-text)' : '#fff';
  return '' +
    '<div style="position:absolute;inset:0;background:var(--color-text);color:var(--color-bg);display:flex;flex-direction:column;z-index:10">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:calc(16px + env(safe-area-inset-top)) 18px 16px;border-bottom:2px solid var(--color-bg)">' +
        '<div style="font-weight:800;font-size:11px;letter-spacing:.2em;text-transform:uppercase">Kronometre</div>' +
        '<button class="hv-accent-400-text" data-action="closeTimer" style="border:0;background:transparent;color:var(--color-bg);padding:4px;display:flex">' + X_ICON_SM + '</button>' +
      '</div>' +
      '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 18px">' +
        '<div style="font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--color-accent-400)">' + esc(P.activeTopic) + '</div>' +
        '<div id="timerClock" style="margin-top:12px;font-weight:900;font-size:66px;line-height:.9;letter-spacing:-.04em;font-variant-numeric:tabular-nums">' + fmtClock(currentElapsedMs()) + '</div>' +
        '<div style="margin-top:10px;height:2px;background:var(--color-neutral-700)"></div>' +
        '<div style="margin-top:10px;font-weight:600;font-size:12px;color:var(--color-neutral-400)">' + runLabel + '</div>' +
        '<div style="margin-top:28px;display:flex;align-items:center;justify-content:space-between;gap:14px">' +
          '<div style="font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-400)">Çözülen soru</div>' +
          '<div style="display:flex;align-items:center;border:2px solid var(--color-bg)">' +
            '<button class="hv-neutral-800" data-action="qDown" style="width:42px;height:40px;border:0;border-right:2px solid var(--color-bg);background:transparent;color:var(--color-bg);font-weight:800;font-size:17px">–</button>' +
            '<div style="width:56px;text-align:center;font-weight:900;font-size:17px;font-variant-numeric:tabular-nums">' + P.timer.sessionQ + '</div>' +
            '<button class="hv-neutral-800" data-action="qUp" style="width:42px;height:40px;border:0;border-left:2px solid var(--color-bg);background:transparent;color:var(--color-bg);font-weight:800;font-size:17px">+</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:18px;display:flex;flex-direction:column;gap:10px">' +
        '<button class="hv-opacity" data-action="toggleRun" style="width:100%;border:0;background:' + runBtnBg + ';color:' + runBtnFg + ';padding:20px;display:flex;align-items:center;justify-content:space-between">' +
          '<span style="font-weight:800;font-size:15px;letter-spacing:.16em;text-transform:uppercase">' + runBtnLabel + '</span><span style="width:14px;height:14px;background:currentColor"></span>' +
        '</button>' +
        '<button class="hv-invert" data-action="finishTimer" style="width:100%;border:2px solid var(--color-bg);background:transparent;color:var(--color-bg);padding:15px 20px;text-align:left;font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase">Bitir ve kaydet</button>' +
      '</div>' +
    '</div>';
}

function renderMistakeSheet() {
  if (!UI.mistakeOpen) return '';
  const konular = getKonular();
  const chips = konular.map((k) => {
    const sel = UI.mSelKonu === k.n;
    return '<button class="hv-accent-100" data-action="pickMistakeKonu" data-name="' + esc(k.n) + '" style="border:2px solid ' + (sel ? 'var(--color-accent)' : 'var(--color-text)') + ';background:' + (sel ? 'var(--color-accent)' : 'transparent') + ';color:' + (sel ? '#fff' : 'var(--color-text)') + ';padding:8px 12px;font-weight:700;font-size:12px">' + esc(k.n) + '</button>';
  }).join('');
  let topicHtml = '';
  if (UI.mSelKonu) {
    const topics = (TOPIC_MAP[UI.mSelKonu] || []).map((t) => {
      const sel = UI.mSelTopic === t;
      return '<button class="hv-accent-100" data-action="pickMistakeTopic" data-name="' + esc(t) + '" style="border:2px solid ' + (sel ? 'var(--color-accent)' : 'var(--color-text)') + ';background:' + (sel ? 'var(--color-accent)' : 'transparent') + ';color:' + (sel ? '#fff' : 'var(--color-text)') + ';padding:7px 11px;font-weight:600;font-size:11.5px">' + esc(t) + '</button>';
    }).join('');
    topicHtml = '<div style="margin-top:16px"><div style="font-weight:700;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">Konu başlığı (opsiyonel)</div><div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">' + topics + '</div></div>';
  }
  return '' +
    '<div style="position:absolute;inset:0;background:color-mix(in srgb,#201e1d 55%,transparent);display:flex;align-items:flex-end;z-index:20">' +
      '<div style="width:100%;background:var(--color-bg);border-top:2px solid var(--color-text);max-height:82%;display:flex;flex-direction:column">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:2px solid var(--color-text)">' +
          '<div style="font-weight:900;font-size:15px;letter-spacing:.14em;text-transform:uppercase">Yanlış ekle</div>' +
          '<button class="hv-accent-text" data-action="closeMistake" style="border:0;background:transparent;color:var(--color-text);font-weight:800;font-size:16px;padding:4px 6px">✕</button>' +
        '</div>' +
        '<div style="overflow-y:auto;padding:14px 18px">' +
          '<div style="font-weight:700;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">Ders seç</div>' +
          '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">' + chips + '</div>' +
          topicHtml +
          '<div style="margin-top:16px;font-weight:700;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">Not (opsiyonel)</div>' +
          '<input id="mistakeNote" type="text" value="' + esc(draftMistakeNote) + '" placeholder="Örn: aritmi EKG yorumlama karıştırdım" class="field-input" style="margin-top:8px;font-weight:600;font-size:13px">' +
        '</div>' +
        '<div style="padding:18px;border-top:2px solid var(--color-text)">' +
          '<button class="hv-accent-600" data-action="saveMistake" style="width:100%;border:0;background:var(--color-accent);color:#fff;padding:17px;text-align:left;font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase">Kaydet</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderDenemeSheet() {
  if (!UI.denemeOpen) return '';
  const temel = netCalc(draftDeneme.tD, draftDeneme.tY);
  const klinik = netCalc(draftDeneme.kD, draftDeneme.kY);
  const preview = ((temel + klinik) / 2).toFixed(2);
  const field = (label, key, borderR, borderB) => '' +
    '<div style="padding:16px ' + (borderR ? '12px' : '18px') + ' 16px ' + (borderR ? '18px' : '12px') + ';' + (borderR ? 'border-right:1px solid var(--color-divider);' : '') + (borderB ? 'border-bottom:1px solid var(--color-divider);' : '') + '">' +
      '<div style="font-weight:700;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">' + label + '</div>' +
      '<input type="number" inputmode="numeric" data-deneme-field="' + key + '" value="' + esc(draftDeneme[key]) + '" class="field-input" style="margin-top:8px;font-weight:800;font-size:17px">' +
    '</div>';
  return '' +
    '<div style="position:absolute;inset:0;background:color-mix(in srgb,#201e1d 55%,transparent);display:flex;align-items:flex-end;z-index:20">' +
      '<div style="width:100%;background:var(--color-bg);border-top:2px solid var(--color-text)">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:2px solid var(--color-text)">' +
          '<div style="font-weight:900;font-size:15px;letter-spacing:.14em;text-transform:uppercase">Deneme ' + (P.denemeler.length + 1) + '</div>' +
          '<button class="hv-accent-text" data-action="closeDeneme" style="border:0;background:transparent;color:var(--color-text);font-weight:800;font-size:16px;padding:4px 6px">✕</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr">' +
          field('Temel doğru', 'tD', true, true) + field('Temel yanlış', 'tY', false, true) +
          field('Klinik doğru', 'kD', true, false) + field('Klinik yanlış', 'kY', false, false) +
        '</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-top:2px solid var(--color-text);background:var(--color-surface)">' +
          '<div style="font-weight:700;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-neutral-700)">Net</div>' +
          '<div id="denemeNetPreview" style="font-weight:900;font-size:20px;color:var(--color-accent-700)">' + preview + '</div>' +
        '</div>' +
        '<div style="padding:18px">' +
          '<button class="hv-accent-600" data-action="saveDeneme" style="width:100%;border:0;background:var(--color-accent);color:#fff;padding:17px;text-align:left;font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase">Kaydet</button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

/* ── Root render ────────────────────────────────────────────────────────── */

function render() {
  const todayIdx = findTodayIndex();
  const today = PROGRAM[todayIdx];
  const dkey = dateKey(new Date());
  const tasks = buildDayTasks(today, dkey);
  const doneCount = tasks.filter((t) => t.done >= t.plan).length;
  const todaysSessions = P.sessions.filter((s) => s.date === dkey);
  const todayMin = todaysSessions.reduce((a, s) => a + s.minutes, 0);
  const todayQ = todaysSessions.reduce((a, s) => a + s.questions, 0);
  const streak = computeStreak();
  const hedefSoru = P.goalOverride != null ? P.goalOverride : (TARGET_BY_TYPE[today.tur] || 0);
  const goalPct = hedefSoru > 0 ? Math.min(100, Math.round((todayQ / hedefSoru) * 100)) : 0;
  const lastNet = P.denemeler.length ? ((P.denemeler[0].temel + P.denemeler[0].klinik) / 2).toFixed(1) : '—';
  const ctx = { today, todayIdx, tasks, doneCount, todayMin, todayQ, hedefSoru, goalPct, lastNet };

  let screen = '';
  if (UI.tab === 'bugun') screen = renderBugun(ctx);
  else if (UI.tab === 'program') screen = renderProgram();
  else if (UI.tab === 'konular') screen = renderKonular();
  else if (UI.tab === 'yanlis') screen = renderYanlis();
  else if (UI.tab === 'istatistik') screen = renderIstatistik(ctx);
  else if (UI.tab === 'ayarlar') screen = renderAyarlar();

  const html = '' +
    '<div class="app-shell">' +
      renderTopbar(streak) +
      '<div class="screen-scroll">' + screen + '</div>' +
      renderMiniBar() +
      renderBottomNav() +
      renderTimerOverlay() +
      renderMistakeSheet() +
      renderDenemeSheet() +
    '</div>';

  document.getElementById('app').innerHTML = html;

  if (UI.tab === 'program') {
    const scroller = document.getElementById('dayScroller');
    const sel = scroller && scroller.querySelector('[data-selected="1"]');
    if (sel) sel.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
}

/* ── Ticking clock (updates text nodes directly — no full re-render) ────── */

setInterval(() => {
  if (!P.timer.running) return;
  const text = fmtClock(currentElapsedMs());
  const a = document.getElementById('timerClock');
  const b = document.getElementById('miniClock');
  if (a) a.textContent = text;
  if (b) b.textContent = text;
}, 500);

/* ── Event delegation ──────────────────────────────────────────────────── */

const ACTIONS = {
  setTab: (ds) => setTab(ds.tab),
  toggleTask: (ds) => toggleTask(ds.id),
  startTopic: (ds) => startTimer(ds.topic),
  quickStart: () => quickStart(),
  pickDay: (ds) => pickDay(parseInt(ds.idx, 10)),
  openTimer: () => openTimerOverlay(),
  closeTimer: () => closeTimerOverlay(),
  toggleRun: () => toggleRun(),
  qUp: () => qAdjust(5),
  qDown: () => qAdjust(-5),
  finishTimer: () => finishSession(),
  openMistake: () => openMistakeSheet(),
  closeMistake: () => closeMistakeSheet(),
  pickMistakeKonu: (ds) => pickMistakeKonu(ds.name),
  pickMistakeTopic: (ds) => pickMistakeTopic(ds.name),
  saveMistake: () => saveMistake(),
  toggleDers: (ds) => toggleDers(ds.name),
  openDeneme: () => openDenemeSheet(),
  closeDeneme: () => closeDenemeSheet(),
  saveDeneme: () => saveDeneme(),
  goalUp: () => goalStep(25),
  goalDown: () => goalStep(-25),
  toggleSetting: (ds) => toggleSetting(ds.key),
  resetData: () => resetAllData(),
  installApp: () => installApp()
};

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (fn) fn(el.dataset);
  });

  app.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'mistakeNote') { draftMistakeNote = t.value; return; }
    if (t.dataset && t.dataset.denemeField) { draftDeneme[t.dataset.denemeField] = t.value; updateDenemePreview(); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (UI.mistakeOpen) closeMistakeSheet();
    else if (UI.denemeOpen) closeDenemeSheet();
    else if (P.timer.timerOpen) closeTimerOverlay();
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (UI.tab === 'ayarlar') render();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((err) => console.error('[TUS Günlüğü] SW registration failed', err));
  }

  render();
});
