#!/usr/bin/env node
'use strict';
/* 全デモを「パラメータの端・境界値」で総当たり実行し、数値的な破綻を検出する。
 *
 * 検出するもの:
 *   1. 例外（描画中に throw）
 *   2. 座標に NaN / Infinity が入る（Canvas: moveTo/lineTo/fillRect 等、Plotly: trace の x/y/z）
 *   3. 軸範囲が NaN / ymin>=ymax などの退化（Plot.make の opts）
 *   4. 表示テキストに NaN / Infinity が出る（fillText / title）
 *
 * 使い方: node tools/audit-demos.js [--verbose]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

/* ---------- ブラウザ環境のスタブ ---------- */
const issues = [];
let current = null; // { key, params }

function flag(kind, detail) {
  issues.push({ key: current.key, kind, detail, params: JSON.stringify(current.params) });
}
const bad = v => typeof v === 'number' && !Number.isFinite(v);

function makeCtx() {
  const check = (name, args) => {
    for (const a of args) if (bad(a)) { flag('NaN座標', name + '(' + args.join(',') + ')'); return; }
  };
  const ctx = {
    canvas: null,
    save() {}, restore() {}, beginPath() {}, closePath() {}, stroke() {}, fill() {},
    clip() {}, setTransform() {}, clearRect() {}, setLineDash() {}, translate() {}, rotate() {}, scale() {},
    measureText() { return { width: 10 }; },
    createLinearGradient() { return { addColorStop() {} }; },
    moveTo(...a) { check('moveTo', a); },
    lineTo(...a) { check('lineTo', a); },
    rect(...a) { check('rect', a); },
    fillRect(...a) { check('fillRect', a); },
    strokeRect(...a) { check('strokeRect', a); },
    arc(...a) { check('arc', a); },
    quadraticCurveTo(...a) { check('quadraticCurveTo', a); },
    bezierCurveTo(...a) { check('bezierCurveTo', a); },
    fillText(t, x, y) {
      if (bad(x) || bad(y)) flag('NaN座標', 'fillText pos');
      if (/NaN|Infinity/.test(String(t))) flag('NaN表示', 'fillText "' + t + '"');
    },
    strokeText(t, x, y) { if (/NaN|Infinity/.test(String(t))) flag('NaN表示', 'strokeText "' + t + '"'); },
  };
  return ctx;
}

function makeCanvas() {
  const ctx = makeCtx();
  const c = { width: 900, height: 460, clientWidth: 900, clientHeight: 460, getContext: () => ctx, style: {} };
  ctx.canvas = c;
  return c;
}

function scanPlotly(data) {
  for (const tr of data || []) {
    for (const k of ['x', 'y', 'z']) {
      const v = tr[k];
      if (Array.isArray(v)) {
        for (const e of v) {
          if (bad(e)) { flag('NaN座標', 'trace.' + k + ' に NaN/Inf (' + (tr.name || tr.type) + ')'); break; }
          if (Array.isArray(e)) for (const e2 of e) if (bad(e2)) { flag('NaN座標', 'trace.' + k + '[][] に NaN/Inf'); break; }
        }
      }
    }
  }
}
function scanLayout(layout) {
  const s = JSON.stringify(layout || {});
  if (/NaN|null,null/.test(s)) flag('NaN表示', 'layout に NaN');
  const t = layout && layout.title && (layout.title.text || layout.title);
  if (t && /NaN|Infinity/.test(String(t))) flag('NaN表示', 'title "' + t + '"');
}
const fakePlotly = {
  react(div, data, layout) { scanPlotly(data); scanLayout(layout); },
  newPlot(div, data, layout) { scanPlotly(data); scanLayout(layout); },
  purge() {}, relayout() {}, restyle() {},
};

/* document / window の最小スタブ */
const elStub = () => new Proxy({}, {
  get(t, k) {
    if (k === 'style') return {};
    if (k === 'classList') return { add() {}, remove() {}, toggle() {}, contains: () => false };
    if (k === 'dataset') return {};
    if (k === 'children' || k === 'childNodes') return [];
    if (k in t) return t[k];
    if (typeof k === 'string' && /^(getContext)$/.test(k)) return () => makeCtx();
    return typeof k === 'symbol' ? undefined : (() => elStub());
  },
  set(t, k, v) { t[k] = v; return true; },
});
const documentStub = {
  documentElement: elStub(), body: elStub(), head: elStub(),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  createElement: () => elStub(), addEventListener() {}, removeEventListener() {},
};

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  document: documentStub,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  requestAnimationFrame: fn => fn(),
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  location: { hash: '#/math/functions', pathname: '/', href: '' },
  Math, JSON, Date, Number, String, Array, Object, isFinite, isNaN, parseFloat, parseInt,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.window.devicePixelRatio = 1;
sandbox.window.STATS_TOPICS = [];
sandbox.window.STATS_QUIZ = {};
sandbox.window.Plotly = fakePlotly;
sandbox.window.addEventListener = () => {};
sandbox.window.KaTeX = null;
vm.createContext(sandbox);

/* topics -> app.js の順（index.html と同じ） */
for (const f of fs.readdirSync(path.join(ROOT, 'topics')).filter(f => f.endsWith('.js'))) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'topics', f), 'utf8'), sandbox, { filename: f });
}
try {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), sandbox, { filename: 'app.js' });
} catch (e) {
  if (!sandbox.window.Stats || !sandbox.window.Plot) {
    console.error('app.js の読み込みに失敗（Stats/Plot が取れない）:', e.message);
    process.exit(2);
  }
}

/* Plot.make をラップして軸範囲の退化を検出。
 * さらに描画メソッドの「入力データ」を検査する — Plot.line 等は非有限点を
 * 自動スキップするため、ctx 側だけ見ていると「線が静かに欠ける」不具合を見逃す。 */
const Plot = sandbox.window.Plot;
const origMake = Plot.make.bind(Plot);
const DATA_METHODS = ['line', 'fillUnder', 'scatter', 'bars', 'polygon'];
const SCALAR_METHODS = ['vline', 'hline'];

function scanPts(name, pts) {
  if (!Array.isArray(pts)) return;
  let n = 0;
  for (const q of pts) {
    if (Array.isArray(q)) { if (bad(q[0]) || bad(q[1])) n++; }
    else if (bad(q)) n++;
  }
  if (n) flag('データNaN', name + '() の入力 ' + pts.length + ' 点中 ' + n + ' 点が NaN/Inf（描画時に欠落）');
}

Plot.make = function (canvas, opts) {
  const o = opts || {};
  for (const k of ['xmin', 'xmax', 'ymin', 'ymax']) {
    if (bad(o[k])) flag('軸範囲NaN', k + '=' + o[k]);
  }
  if (Number.isFinite(o.xmin) && Number.isFinite(o.xmax) && o.xmax <= o.xmin) flag('軸範囲退化', 'xmax<=xmin (' + o.xmin + ',' + o.xmax + ')');
  if (Number.isFinite(o.ymin) && Number.isFinite(o.ymax) && o.ymax <= o.ymin) flag('軸範囲退化', 'ymax<=ymin (' + o.ymin + ',' + o.ymax + ')');
  const pl = origMake(canvas, o);
  for (const m of DATA_METHODS) {
    if (typeof pl[m] !== 'function') continue;
    const orig = pl[m].bind(pl);
    pl[m] = (pts, ...rest) => { scanPts(m, pts); return orig(pts, ...rest); };
  }
  for (const m of SCALAR_METHODS) {
    if (typeof pl[m] !== 'function') continue;
    const orig = pl[m].bind(pl);
    pl[m] = (v, ...rest) => { if (bad(v)) flag('データNaN', m + '() の位置が NaN/Inf'); return orig(v, ...rest); };
  }
  return pl;
};

/* ---------- パラメータの端を総当たり ---------- */
function paramValues(c) {
  if (c.type === 'range') {
    const vals = new Set([c.min, c.max, c.value]);
    // 端のすぐ内側も見る（min+step / max-step）
    if (typeof c.step === 'number') { vals.add(c.min + c.step); vals.add(c.max - c.step); }
    return [...vals].filter(v => v >= c.min - 1e-9 && v <= c.max + 1e-9);
  }
  if (c.type === 'select') return c.options.map(o => o.value);
  if (c.type === 'checkbox') return [true, false];
  return [c.value];
}

const topics = sandbox.window.STATS_TOPICS;
let runs = 0, demos = 0;
for (const t of topics) {
  if (!t.demo) continue;
  demos++;
  const key = t.section + '/' + t.id;
  const controls = (t.demo.controls || []).filter(c => c.type !== 'button');
  const axes = controls.map(c => ({ id: c.id, vals: paramValues(c) }));
  const base = {};
  for (const c of t.demo.controls || []) base[c.id] = c.value;

  // 網羅方針: 総当たりが現実的なら全組合せ、そうでなければ
  // 「1因子だけ端に振る」＋「2因子ペアの全組合せ（pairwise）」＋「全部min/全部max」。
  const cases = [Object.assign({}, base)];
  const total = axes.reduce((s, a) => s * a.vals.length, 1);
  if (axes.length && total <= 600) {
    let acc = [{}];
    for (const a of axes) {
      const next = [];
      for (const p of acc) for (const v of a.vals) next.push(Object.assign({}, p, { [a.id]: v }));
      acc = next;
    }
    for (const p of acc) cases.push(Object.assign({}, base, p));
  } else {
    for (const a of axes) for (const v of a.vals) cases.push(Object.assign({}, base, { [a.id]: v }));
    for (let i = 0; i < axes.length; i++) {
      for (let j = i + 1; j < axes.length; j++) {
        for (const vi of axes[i].vals) for (const vj of axes[j].vals) {
          cases.push(Object.assign({}, base, { [axes[i].id]: vi, [axes[j].id]: vj }));
        }
      }
    }
    cases.push(Object.assign({}, base, ...axes.map(a => ({ [a.id]: a.vals[0] }))));
    cases.push(Object.assign({}, base, ...axes.map(a => ({ [a.id]: a.vals[a.vals.length - 1] }))));
  }

  for (const params of cases) {
    current = { key, params };
    runs++;
    try {
      if (t.demo.plot) t.demo.plot(elStub(), params, fakePlotly);
      else t.demo.draw(makeCanvas(), params);
    } catch (err) {
      flag('例外', err.message);
    }
  }
}

/* ---------- 結果 ---------- */
const byKey = new Map();
for (const it of issues) {
  const k = it.key + ' | ' + it.kind + ' | ' + it.detail;
  if (!byKey.has(k)) byKey.set(k, { ...it, n: 0, examples: [] });
  const e = byKey.get(k); e.n++;
  if (e.examples.length < 2) e.examples.push(it.params);
}
console.log(`デモ ${demos} 件 / 実行 ${runs} ケース / 問題 ${byKey.size} 種`);
if (byKey.size === 0) {
  console.log('✓ 例外・NaN座標・軸範囲の退化はいずれも検出されませんでした');
} else {
  for (const e of [...byKey.values()].sort((a, b) => b.n - a.n)) {
    console.log(`\n[${e.kind}] ${e.key}\n  ${e.detail}\n  ${e.n}ケースで発生 例: ${e.examples.join(' / ')}`);
  }
}
process.exit(byKey.size ? 1 : 0);
