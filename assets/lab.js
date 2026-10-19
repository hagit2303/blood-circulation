// מנוע התרגול הסוקרטי — הועתק מקורס החקלאות (אתר-הקורס/assets/lab.js), שהועתק מיחידת הגנטיקה. במקור: גרירה (עכבר, מגע, ובחירה בלחיצה), שלבים, שאלות, התאמת מושגים ודוח להורדה
const $ = id => document.getElementById(id);
const L = s => `<span class="L">${s}</span>`;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
// טקסט רגיל לדוח: כתב עילי נשמר (Iᴬ, Iᴮ, A¹, A²)
const SUPC = { A: 'ᴬ', B: 'ᴮ', '1': '¹', '2': '²' };
const plain = h => String(h).replace(/<sup>(.*?)<\/sup>/g, (m, x) => [...x].map(c => SUPC[c] || c).join('')).replace(/<[^>]+>/g, '');
// הסבר בלי "נכון." בתחילתו — למשוב אחרי טעות
const why = x => String(x).replace(/^\s*(✓\s*)?נכון[.!:]?\s*(—\s*)?/, '');
const fb = (el, ok, html) => { el.className = 'fb ' + (ok ? 'ok' : 'no'); el.innerHTML = html };

const Lab = {
  log: {},          // כותרת ← {ok, d, right, why} — נרשם רק הניסיון הראשון
  rec(t, ok, d, right, why) {
    if (this.log[t]) return;
    this.log[t] = { ok, d: d || '', right: right || '', why: why || '' };
    this.renderMist();
  },
  // שלבים: פותחים את השלב הבא
  solve(n) {
    const s = document.querySelector(`.step[data-n="${n}"]`); if (s) s.classList.add('done');
    const nx = document.querySelector(`.step[data-n="${n + 1}"]`);
    if (nx && nx.hidden) { nx.hidden = false; nx.dispatchEvent(new Event('open')); setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'start' }), 600) }
  },
  // נעילת שלב אחרי ניסיון אחד: אי אפשר לשנות, רק ללמוד מהמשוב
  lock(n) {
    const s = document.querySelector(`.step[data-n="${n}"]`); if (!s) return;
    s.classList.add('locked');
    s.querySelectorAll('input,select,textarea,button').forEach(e => e.disabled = true);
    s.querySelectorAll('.slot').forEach(e => e.classList.add('lock'));
    s.querySelectorAll('.chrom[data-drag],.chip').forEach(e => { e.removeAttribute('data-drag'); e.classList.add('frozen') });
  },
  finish(n) { this.lock(n); this.solve(n) },
  reset(from) { document.querySelectorAll('.step').forEach(s => { if (+s.dataset.n > from) { s.hidden = true; s.classList.remove('done', 'locked'); s.querySelectorAll('input,select,textarea,button').forEach(e => e.disabled = false); s.querySelectorAll('.slot').forEach(e => e.classList.remove('lock', 'ok', 'no')) } }) },
  // דף הטעויות שלי
  renderMist() {
    const box = document.getElementById('mist'); if (!box) return;
    const bad = Object.entries(this.log).filter(([, r]) => !r.ok);
    box.innerHTML = !Object.keys(this.log).length ? '<p class="hint">כאן יופיעו השאלות שבהן טעיתם, עם התשובה הנכונה וההסבר.</p>'
      : !bad.length ? '<p class="fb ok" style="display:block">אין טעויות עד עכשיו. כל הכבוד!</p>'
      : bad.map(([t, r]) => `<div class="mi"><b>${t}</b><p>ענית: ${r.d || '—'}</p>${r.right ? `<p class="ri">התשובה הנכונה: ${r.right}</p>` : ''}${r.why ? `<p class="hint">${r.why}</p>` : ''}</div>`).join('');
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const dl = document.getElementById('dl'); if (!dl || document.getElementById('mist')) return;
  const sec = document.createElement('section'); sec.className = 'card';
  sec.innerHTML = '<h2>📒 דף הטעויות שלי</h2><p class="hint">כל שאלה שבה טעיתם, עם התשובה הנכונה וההסבר. טוב לחזרה לפני מבחן. הדף נכנס גם לקובץ שמורידים.</p><div id="mist"></div>';
  dl.closest('section').before(sec); Lab.renderMist();
});

const chip = (v, html, cls = '') => `<span class="chip ${cls}" tabindex="0" role="button" data-v="${v}" aria-label="${v}">${html || v}</span>`;
const slot = (id, cls = '') => `<span class="slot ${cls}" tabindex="0" role="button" ${id ? `id="${id}"` : ''} aria-label="מקום ריק"></span>`;
const slotVals = sel => [...document.querySelectorAll(sel)].map(s => s.dataset.v || '');
const sameSet = (a, b) => [...a].sort().join('|') === [...b].sort().join('|');

/* ---------- שאלות עם משוב ---------- */
function renderQuestions(box, Q, tag) {
  box.innerHTML = Q.map((q, i) => `<section class="card" id="${tag}${i}"><span class="qn">שאלה ${i + 1}</span><p>${q.stem}</p>
   ${q.type === 'frac' ? `<div class="row"><input class="t" id="${tag}in${i}" inputmode="decimal" placeholder="1/4" aria-label="תשובה" style="width:7em;direction:ltr;text-align:center"><button data-i="${i}" class="fchk">בדיקה</button></div>`
   : `<div class="opts" role="radiogroup">${shuffle(q.opts.map((o, k) => [o, k])).map(([o, k]) => `<label><input type="radio" name="${tag}r${i}" value="${k}"> <span>${o}</span></label>`).join('')}</div>`}
   <div class="fb" id="${tag}fb${i}" role="status"></div><p class="src">מקור: ${q.src}</p>${q.t ? `<p class="tnote">${q.t}</p>` : ''}</section>`).join('');
  const title = i => `שאלה ${i + 1} (${Q[i].src})`;
  box.addEventListener('change', e => {
    if (e.target.type !== 'radio') return;
    const i = +e.target.name.slice(tag.length + 1), k = +e.target.value, q = Q[i], ok = k === q.ans;
    box.querySelectorAll(`input[name="${tag}r${i}"]`).forEach(r => { r.disabled = true; const lb = r.closest('label'); if (+r.value === q.ans) lb.classList.add('right'); else if (r.checked) lb.classList.add('wrong') });
    fb($(tag + 'fb' + i), ok, ok ? '✓ ' + q.ok : `✘ ${q.no[k]}<br><b>התשובה הנכונה:</b> ${q.opts[q.ans]}<br>${why(q.ok)}`);
    Lab.rec(title(i), ok, plain(q.opts[k]), plain(q.opts[q.ans]), plain(why(q.ok)));
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('.fchk'); if (!b) return;
    const i = +b.dataset.i, q = Q[i], inp = $(tag + 'in' + i), raw = inp.value.trim(), v = parseFrac(raw);
    if (!raw || isNaN(v)) { fb($(tag + 'fb' + i), false, 'כתבו תשובה (למשל 1/4) ואז לחצו בדיקה.'); return }
    const ok = Math.abs(v - q.ans) < .005; inp.disabled = b.disabled = true;
    fb($(tag + 'fb' + i), ok, ok ? '✓ ' + q.ok : `✘ לא נכון. <b>התשובה הנכונה: ${fr(q.ans)}</b><br>${why(q.ok)}`);
    Lab.rec(title(i), ok, raw, fr(q.ans), plain(why(q.ok)));
  });
}
function fr(x) { for (let d = 1; d <= 64; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return d === 1 ? String(n) : `${n}/${d}` } return String(x) }
function parseFrac(s) { s = (s || '').replace(',', '.').replace(/\s/g, ''); if (!s) return NaN; if (s.endsWith('%')) return parseFloat(s) / 100; if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN } return Number(s) }

/* ---------- התאמת מושגים ---------- */
function renderMatch(box, pairs, btn, out) {
  const terms = shuffle(pairs.map(p => p[0]).slice());
  box.innerHTML = shuffle(pairs.map((p, i) => [p, i])).map(([p, i]) => `<span>${p[1]}</span><select data-i="${i}" aria-label="המושג המתאים"><option value="">בחרו מושג</option>${terms.map(t => `<option>${t}</option>`).join('')}</select>`).join('');
  btn.onclick = () => {
    const sels = [...box.querySelectorAll('select')];
    if (sels.some(s => !s.value)) { fb(out, false, 'בחרו מושג לכל הגדרה, ואז לחצו בדיקה.'); return }
    let ok = 0; const wrong = [];
    sels.forEach(s => { const want = pairs[+s.dataset.i][0], g = s.value === want; s.className = g ? 'm-ok' : 'm-no'; s.disabled = true; if (g) ok++; else { wrong.push(`${s.value} ← ${want}`); s.insertAdjacentHTML('afterend', `<span class="ri" style="grid-column:1/-1">✘ הנכון: <b>${want}</b></span>`) } });
    btn.disabled = true;
    fb(out, ok === pairs.length, ok === pairs.length ? `מצוין! כל ${ok} המושגים במקום.` : `${ok} מתוך ${pairs.length} נכונים. ליד כל טעות כתוב המושג הנכון.`);
    Lab.rec('התאמת מושגים', ok === pairs.length, `${ok}/${pairs.length}`, wrong.join(' · '), '');
  };
}

/* ---------- דוח והורדה ---------- */
function buildReport(title) {
  const st = window.STUDENT || {}, rows = Object.entries(Lab.log);
  const ok = rows.filter(([, r]) => r.ok).length, bad = rows.filter(([, r]) => !r.ok);
  $('report').innerHTML = `<h1>${title}</h1><p>שם: <b>${st.name || ''}</b> · כיתה: <b>${st.cls || ''}</b> · תאריך: ${new Date().toLocaleDateString('he-IL')}</p>
   <p style="font-size:18px;margin:8px 0">נכון בניסיון הראשון: <b>${ok}</b> מתוך <b>${rows.length}</b>${rows.length ? ` (${Math.round(ok / rows.length * 100)}%)` : ''}</p>
   ${rows.map(([t, r]) => `<div class="rr"><b>${t}</b><span class="${r.ok ? 'y' : 'n'}">${r.ok ? '✔' : '✘'}</span><span>ענה: ${r.d}${!r.ok && r.right ? `<br><span style="color:#1E7B4D">הנכון: ${r.right}</span>` : ''}</span></div>`).join('')}
   ${bad.length ? `<h2 style="font-size:20px;margin-top:16px">📒 דף הטעויות שלי</h2>${bad.map(([t, r]) => `<div class="rr" style="display:block"><b>${t}</b><br>ענה: ${r.d}<br>${r.right ? `<span style="color:#1E7B4D">הנכון: ${r.right}</span><br>` : ''}${r.why ? `<span style="color:#5E6E82">${r.why}</span>` : ''}</div>`).join('')}` : ''}
   <p style="margin-top:12px;color:#5E6E82;font-size:13px">${window.REPORT_FOOT || 'תרגול'} · נרשם הניסיון הראשון בכל שאלה</p>`;
}
async function labPdf(title, file) {
  const b = $('dl'), old = b.textContent; b.disabled = true; b.textContent = 'מכין קובץ…';
  try {
    buildReport(title); const r = $('report'); r.style.display = 'block';
    const nm = ((window.STUDENT || {}).name || 'תלמיד').replace(/[\\/:*?"<>|]/g, '');
    await downloadPdf(r, `${file}-${nm}.pdf`); $('dlmsg').textContent = 'הקובץ מוכן. שמרו אותו והעלו למשימה ב-Classroom.';
  } catch (e) { $('dlmsg').textContent = 'ההורדה לא הצליחה. נסו שוב, או הדפיסו את הדף (Ctrl+P) ושמרו כ-PDF.' }
  $('report').style.display = 'none'; b.disabled = false; b.textContent = old;
}

/* ---------- שאלות בסגנון בגרות: תשובה כתובה + מחוון לבדיקה עצמית ---------- */
// B = [{src, title, stem, parts:[{n:'א(1)', task, pts, rubric:[[טקסט, אחוז]], model}]}]
function renderBagrut(box, B, tag) {
  box.innerHTML = B.map((q, i) => `<section class="card bq"><span class="qn">שאלה בסגנון בגרות ${i + 1}</span><h3>${q.title}</h3><div>${q.stem}</div>
   ${q.parts.map((p, j) => `<div class="bpart" id="${tag}${i}_${j}"><p><b>${p.n}</b> ${p.task} <span class="hint">(${p.pts} נקודות)</span></p>
    <textarea rows="4" aria-label="תשובה לסעיף ${p.n}" placeholder="כתבו את התשובה כמו בבחינה: קביעה, ואחריה נימוק או הסבר."></textarea>
    <button class="ghost rv" data-i="${i}" data-j="${j}">סיימתי — הצגת המחוון</button><div class="fb" data-wmsg role="status"></div>
    <div class="rub" hidden><p><b>מחוון:</b> סמנו מה כלול בתשובה שלכם.</p>${p.rubric.map(([t, w], k) => `<label><input type="checkbox" data-w="${w}"> ${t} <span class="hint">(${w}%)</span></label>`).join('')}
     <button class="sc" data-i="${i}" data-j="${j}">חישוב הציון לסעיף</button><div class="fb" role="status"></div>
     <details><summary>תשובה לדוגמה</summary><p>${p.model}</p></details></div></div>`).join('')}
   <p class="src">מקור: ${q.src}</p></section>`).join('');
  box.addEventListener('click', e => {
    const b = e.target.closest('.rv,.sc'); if (!b) return;
    const part = $(`${tag}${b.dataset.i}_${b.dataset.j}`), P = B[+b.dataset.i].parts[+b.dataset.j], ta = part.querySelector('textarea');
    if (b.matches('.rv')) { const w = ta.value.trim(); if (w.length < 15 || w.split(/\s+/).length < 3) { ta.focus(); fb(part.querySelector('[data-wmsg]'), false, 'כתבו תשובה מלאה (לפחות משפט אחד) לפני שפותחים את המחוון.'); return } part.querySelector('[data-wmsg]').className = 'fb'; part.querySelector('.rub').hidden = false; ta.readOnly = true; b.hidden = true; return }
    const boxes = [...part.querySelectorAll('.rub input')], got = boxes.filter(c => c.checked).reduce((s, c) => s + +c.dataset.w, 0);
    boxes.forEach(c => c.disabled = true); b.disabled = true; part.querySelector('.rub details').open = true;
    const ticked = boxes.map((c, k) => (c.checked ? '☑ ' : '☐ ') + plain(P.rubric[k][0])).join(' | ');
    const out = part.querySelector('.rub .fb'); fb(out, got === 100, `${got}% מהניקוד בסעיף (${Math.round(got / 100 * P.pts * 10) / 10} מתוך ${P.pts} נקודות).` + (got < 100 ? ' קראו את התשובה לדוגמה ושימו לב מה היה חסר.' : ''));
    Lab.rec(`בגרות ${+b.dataset.i + 1}, סעיף ${P.n}`, got === 100, `"${ta.value.trim()}" — סימן במחוון: ${ticked} — ${got}%`, plain(P.model), '');
  });
}
