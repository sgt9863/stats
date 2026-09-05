'use strict';
/* 本文・例題・課題に書く数値を検算するためのヘルパー。
 *
 * サイト自身の app.js を vm サンドボックスで読み込み、window.Stats を取り出す。
 * scipy 等の外部ライブラリではなくサイトの実装を使う理由:
 *   - この環境から numpy/scipy が消えたため（以前は python3 で検算していた）
 *   - デモが実際に画面へ出す値と一致することを、同時に確認できるため
 *
 * 使い方:
 *   node -e "const S=require('./tools/calc.js'); console.log(S.normalInv(0.975));"
 *   → 1.959963984540003
 *
 * 使える関数（app.js の Stats がそのまま出てくる）:
 *   乱数    rng randn
 *   要約    linspace sum mean sd cov corr histogram
 *   分布    normalPdf normalCdf normalInv tPdf tCdf chi2Pdf chi2Cdf fPdf fCdf
 *           betaPdf binomPmf poissonPmf lgamma gammainc betainc erf
 *   線形代数 zeros transpose matmul matvec dot norm solve inverse eigSym
 *   多変量  colMeans center covMatrix plsNipals
 *
 * 分位点（上側 p 点）は tCdf 等を二分探索する:
 *   const q=(cdf,df,p)=>{let lo=0,hi=100;for(let i=0;i<200;i++){const m=(lo+hi)/2;
 *     cdf(m,df)<p?lo=m:hi=m;}return (lo+hi)/2;};
 *   q(S.tCdf,10,0.975)  // 2.2281
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* ブラウザ API の最小スタブ。app.js は読み込み時に DOM を触るので、
   何を呼ばれても落ちない Proxy を返しておく。 */
const el = () => new Proxy({}, {
  get(t, k) {
    if (k === 'style') return {};
    if (k === 'classList') return { add() {}, remove() {}, toggle() {}, contains: () => false };
    if (k in t) return t[k];
    return typeof k === 'symbol' ? undefined : (() => el());
  },
  set(t, k, v) { t[k] = v; return true; },
});

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  document: {
    documentElement: el(), body: el(), head: el(),
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => el(), addEventListener() {}, removeEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  requestAnimationFrame: f => f(),
  setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
  location: { hash: '', pathname: '/', href: '' },
  Math, JSON, Date, Number, String, Array, Object, isFinite, isNaN, parseFloat, parseInt,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.window.STATS_TOPICS = [];
sandbox.window.STATS_QUIZ = {};
sandbox.window.Plotly = { react() {}, newPlot() {} };
sandbox.window.addEventListener = () => {};
sandbox.window.devicePixelRatio = 1;
vm.createContext(sandbox);

/* app.js は末尾で DOM 初期化を試みて例外を投げうるが、
   その時点で Stats/Plot はすでに window に載っているので握りつぶしてよい。 */
try {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'), sandbox, { filename: 'app.js' });
} catch (e) {
  if (!sandbox.window.Stats) throw e;
}

if (!sandbox.window.Stats) {
  throw new Error('app.js から Stats を取り出せませんでした（window への公開が外れていないか確認）');
}

module.exports = sandbox.window.Stats;
module.exports.Plot = sandbox.window.Plot;
