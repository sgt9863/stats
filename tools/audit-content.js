#!/usr/bin/env node
'use strict';
/* 例題・まとめ・確認問題の「作りの品質」を検査する。
 *
 * 契機: 確認問題193問すべてで正答が選択肢の先頭にあり、「一番上を選べば全問正解」
 *       という状態を長期間見逃していた。文章を読む監査では見つからず、集計して
 *       初めて分かる種類の欠陥だったため、恒久的な検査に落とす。
 *
 * 検査項目
 *   1. 正答位置の偏り（表示時のシャッフル後）— 特定位置に集中していないか
 *   2. シャッフルの健全性 — 全選択肢が1回ずつ／正答が正しく追跡されているか
 *   3. 問題文・選択肢・解説の重複と空欄
 *   4. 選択肢数のばらつき、正答以外の選択肢が明らかに手抜きでないか（極端に短い）
 *   5. インライン数式 $ の個数が偶数か（表示崩れの元）
 *   6. カバレッジ（例題・まとめ・確認問題の有無）
 *
 * 使い方: node tools/audit-content.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: { STATS_TOPICS: [], STATS_QUIZ: {} }, console };
vm.createContext(sandbox);
for (const d of ['topics', 'content']) {
  for (const f of fs.readdirSync(path.join(ROOT, d)).filter(f => f.endsWith('.js'))) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, d, f), 'utf8'), sandbox, { filename: f });
  }
}
const topics = sandbox.window.STATS_TOPICS;
const QUIZ = sandbox.window.STATS_QUIZ;

/* --- app.js の quizHtml() と同一のシャッフル。ここがずれると検査の意味がないので、
      実装を変えたら両方を合わせること。 --- */
function shuffleSeed(str) {
  let s = 2166136261;
  for (let i = 0; i < str.length; i++) { s ^= str.charCodeAt(i); s = Math.imul(s, 16777619); }
  return s >>> 0;
}
function rng(seed) {
  let t = (seed >>> 0) || 1;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffledChoices(choices, answer, key) {
  const rand = rng(shuffleSeed(key) || 1);
  const idx = choices.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = idx[i]; idx[i] = idx[j]; idx[j] = t;
  }
  return { order: idx, answer: idx.indexOf(answer) };
}

const problems = [];
const warn = (kind, detail) => problems.push({ kind, detail });

const answerDist = {};
const seenQ = new Map();
const seenChoiceSet = new Map();
let nQ = 0, nEx = 0, nKp = 0, maxChoices = 0;
const thinQuiz = [], noExample = [], noKeypoints = [];

for (const t of topics) {
  const key = t.section + '/' + t.id;
  const c = QUIZ[key] || {};
  const quiz = c.quiz || [];
  if (c.example) nEx++; else noExample.push(key);
  if ((c.keypoints || []).length) nKp++; else noKeypoints.push(key);
  if (quiz.length < 2) thinQuiz.push(key);

  quiz.forEach((it, qi) => {
    nQ++;
    const qkey = key + '#' + qi;
    const ch = it.choices || [];
    maxChoices = Math.max(maxChoices, ch.length);

    if (!it.q || !String(it.q).trim()) warn('空の問題文', qkey);
    if (!it.explain || !String(it.explain).trim()) warn('解説なし', qkey);
    if (ch.length < 3) warn('選択肢が少ない', qkey + ' (' + ch.length + '個)');
    if (typeof it.answer !== 'number' || it.answer < 0 || it.answer >= ch.length) {
      warn('answer が範囲外', qkey + ' answer=' + it.answer);
      return;
    }

    // シャッフルの健全性
    const sh = shuffledChoices(ch, it.answer, qkey);
    if (new Set(sh.order).size !== ch.length) warn('シャッフルで選択肢が欠落/重複', qkey);
    if (sh.order[sh.answer] !== it.answer) warn('シャッフル後の正答位置が不整合', qkey);
    answerDist[sh.answer] = (answerDist[sh.answer] || 0) + 1;

    // 重複
    const qn = String(it.q).replace(/\s+/g, '');
    if (seenQ.has(qn)) warn('問題文が重複', qkey + ' ⇔ ' + seenQ.get(qn));
    else seenQ.set(qn, qkey);

    const cs = ch.map(x => String(x).replace(/\s+/g, '')).sort().join('|');
    if (seenChoiceSet.has(cs)) warn('選択肢一式が重複', qkey + ' ⇔ ' + seenChoiceSet.get(cs));
    else seenChoiceSet.set(cs, qkey);

    if (new Set(ch.map(x => String(x).replace(/\s+/g, ''))).size !== ch.length) {
      warn('同一問題内で選択肢が重複', qkey);
    }

    // 正答だけが極端に長い＝「長い方が正解」で当てられてしまう。
    // 測るのは “学習者が画面で見る長さ” なので、タグを外し、インライン数式は
    // ソース長でなく表示幅の目安（一律4文字）に潰してから数える。
    const visibleLen = x => String(x)
      .replace(/<[^>]*>/g, '')
      .replace(/\$[^$]*\$/g, '____')
      .length;
    const len = ch.map(visibleLen);
    const other = len.filter((_, i) => i !== it.answer);
    if (len[it.answer] > 2.5 * Math.max(...other) && len[it.answer] > 40) {
      warn('正答だけが極端に長い（長さで当てられる）', qkey);
    }

    // インライン数式の $ が偶数か
    for (const [label, s] of [['問題文', it.q], ['解説', it.explain], ...ch.map((x, i) => ['選択肢' + i, x])]) {
      const n = (String(s).match(/\$/g) || []).length;
      if (n % 2 !== 0) warn('$ の数が奇数（数式が閉じていない）', qkey + ' ' + label);
    }
  });

  for (const [label, s] of [['例題', c.example && c.example.body], ...(c.keypoints || []).map((p, i) => ['まとめ' + i, p])]) {
    if (!s) continue;
    const body = String(s).replace(/\$\$[\s\S]*?\$\$/g, '');
    const n = (body.match(/\$/g) || []).length;
    if (n % 2 !== 0) warn('$ の数が奇数（数式が閉じていない）', key + ' ' + label);
  }
}

/* 正答位置の偏り: 一様なら各位置 nQ/maxChoices 程度。カイ二乗で粗く見る */
const expected = nQ / maxChoices;
let chi2 = 0;
for (let i = 0; i < maxChoices; i++) {
  const o = answerDist[i] || 0;
  chi2 += (o - expected) ** 2 / expected;
}
// 自由度 maxChoices-1 の 99.9% 点（4択なら df=3 → 16.27）を超えたら偏りとみなす
const CRIT = { 1: 10.83, 2: 13.82, 3: 16.27, 4: 18.47, 5: 20.52 };
const crit = CRIT[maxChoices - 1] || 16.27;
if (chi2 > crit) {
  warn('正答位置に強い偏り', 'χ²=' + chi2.toFixed(1) + ' > ' + crit + ' 分布=' + JSON.stringify(answerDist));
}

console.log(`トピック ${topics.length} / 例題 ${nEx} / まとめ ${nKp} / 確認問題 ${nQ}問`);
console.log(`正答位置（シャッフル後）: ${JSON.stringify(answerDist)}  χ²=${chi2.toFixed(2)}（棄却限界 ${crit}）`);
if (thinQuiz.length) console.log(`確認問題が1問以下: ${thinQuiz.length} 件 — ${thinQuiz.join(', ')}`);
if (noKeypoints.length) console.log(`まとめなし: ${noKeypoints.length} 件`);
console.log(`例題なし: ${noExample.length} 件${noExample.length ? ' — ' + noExample.join(', ') : ''}`);

if (problems.length === 0) {
  console.log('✓ 問題は検出されませんでした');
  process.exit(0);
}
console.log(`\n✗ ${problems.length} 件の問題`);
for (const p of problems) console.log(`  [${p.kind}] ${p.detail}`);
process.exit(1);
