# HANDOVER — Stats-Learning-Hub 引き継ぎ

このリポジトリの作業を別セッションへ引き継ぐための文書。**深掘り（全トピックの5層化）は完了済み**なので、
本書は「到達点」と「やり方（今後の追補・改修で踏襲する規約）」を引き継ぐ。
到達点の一次情報は [DEEPENING_LOG.md](DEEPENING_LOG.md)（マトリクスと各イテレーションの記録）と
[DESIGN_LOG.md](DESIGN_LOG.md)（デザイン改善の記録）。

## 現状（2026-09-05 時点）— 深掘りは完了済み

- **88/88 トピックが5層完備。当初の「全トピック5層化」タスクは完了している**（Iter.1〜86 ＋ 後から追加した
  `prep1/lack-of-fit` / `prep1/variable-selection` の2件も新規時点で5層で作成）。
  マトリクスは [DEEPENING_LOG.md](DEEPENING_LOG.md) 冒頭
- **トピック総数は 88**。準1級範囲に追加された**因果推論**（`prep1/causal-inference`＝潜在結果・交絡・調整、
  topics/ml.js）も5層＋交絡デモ＋クイズで完備
- 自動検査は**すべてパス**（いずれも依存なし・ブラウザ不要）:
  - `node tools/verify-topics.js` → 88/88（構造・内部リンク実在・`$$`偶数性・quiz対応）
  - `node tools/audit-content.js` → 問題0（例題なし0件・課題カバレッジ・選択肢長バイアス）
  - `node tools/audit-demos.js` → デモ境界値の総当たり
- **デザイン改善 Iter.D1〜D7 完了**（[DESIGN_LOG.md](DESIGN_LOG.md) / [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)）:
  D1 カラートークン確立（UIアクセントをグラフ系列色と分離）/ D2 本文読み幅 `--measure:42em` /
  D3 コールアウト統一（角丸＋左バー）/ D4 本文リストのリズム / D5 サイドバー現在地 /
  D6 ページャホバー / D7 リード下線。**以降 CSS は必ず `:root` のトークンを参照すること**（ダークも同時に追従する）
- サイトは GitHub Pages で公開中（`main` ブランチ**ルート**配信・`.nojekyll` あり）。
  **Pages の配信元設定を `/docs` に変えないこと**（過去にこれで全デプロイが失敗した）

### 次に何をやるか（深掘り以外）

深掘りは終わっているので、以降は**維持と磨き込み**が主になる:

1. **デザイン Iter.D8 以降** — DESIGN_LOG.md 末尾の「次の改善候補」（h3 直後の余白リズム、
   カードのホバー影の強さ）。1イテレーション=1テーマ、実機スクショで before/after を確認して記録する
2. **不変条件の維持** — 新しいデモを足したら **`task`（グラフを動かして答える課題）も必ず書く**。
   `audit-content.js` が未記載を検出する。課題は「操作しないと答えられない問い」にすること
3. **内容の追補** — 出題範囲の改訂があれば新規トピックを足す（因果推論が前例）。
   新規でも**最初から5層＋デモ＋クイズ＋例題＋課題**で作る

### 引き継ぎ時の注意（このブランチの経緯）

`claude/stats-learning-hub-deepening-tjaxy7` は一時 main から分岐して古い状態のまま進んでいたが、
2026-09-05 に `origin/main` をマージして**追いつき済み**（競合なし）。
**必ず `git fetch origin main` してから作業を始めること。** main が唯一の正。

### この環境（クラウドセッション）の注意

- **Chromium は外部ネットに出られない**（egress proxy が CONNECT を拒否する）。表示確認は
  `python3 -m http.server` でローカル配信し `127.0.0.1` を開く（NO_PROXY 対象なので通る）
- KaTeX の CDN も届かないので、スクショ時は `npm install katex --no-save` でベンダーして
  `index.html` の CDN URL をローカルパスへ `sed` で差し替えた**一時ファイル**（`index.shot.html`）を使う。
  一時ファイルは `.git/info/exclude` に入れて**コミットしない**
- Playwright の chromium 実体は `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`（`playwright install` は不要）
- 数値検算は python3（numpy/scipy）か、**サイト自身の `Stats` ライブラリを Node で読む**方法が使える。
  後者はデモが実際に出す値との一致も同時に確認できる

## 5層の定義（完成条件）

1. **直感** — 何のための手法か・どんな場面で使うか。2級用語は再定義しない
2. **数式** — 導出を省略しない。**「なぜその式になるか」を必ず添える**（天下り禁止）
3. **前提条件と崩れたときの影響** — `<table class="simple">` で「前提／崩れると起きること／対処・代替」の3列表が定番
4. **グラフとの接続** — デモのどのパラメータを動かすと何が確認できるかを本文・note で言語化。**デモがないトピックは小さな Canvas デモを新設してよい**（Iter.16 sufficiency・Iter.18 moment-method が前例）
5. **有意性と実質的意味**（検定・推定・モデル系のみ）— 有意≠重要、効果量と n の影響

見出しは既存に合わせる: `<h3>前提条件と、崩れたときの影響</h3>` / `<h3>有意性と実質的な意味</h3>`。
**文体・密度の参照実装**: `prep1/regression`（topics/ml.js）、`prep1/three-tests`（topics/testing2.js）、`prep1/bootstrap`（topics/prep1b.js）。

## 1イテレーションの手順（1トピックずつ）

1. **選定**: DEEPENING_LOG.md 末尾の「次に深掘りすべきトピック」→ マトリクスの gap 大を優先。同じトピックを2回連続で選ばない
2. **現状読解**: `grep -n "id: 'xxx'" topics/*.js` で場所を特定し、既存の body・demo を読む。**妥当な記述は書き換えず、欠けている層だけ足す**
3. **検算**: 追加する数式・数値例は必ず python3 等で独立に再計算してから本文に書く（例: Iter.14 は LR/Wald/Score をデモ初期値で計算し「Waldだけ棄却」を発見して L5 の教材にした）
4. **編集**: 該当 topics/*.js の body（テンプレートリテラル）に追記
5. **検証**（すべて必須）:
   - `node --check topics/対象.js` — 構文
   - `node tools/verify-topics.js` — 全88トピックの構造・内部リンク実在・`$$`フェンス偶数性・quiz対応（依存なし・ブラウザ不要）
   - デモを追加・変更した場合: draw() をスタブ canvas で直接呼んで例外がないか（境界値含む）を確認するか、少なくとも全 controls の min/max で式が破綻しないことを机上確認
6. **記録**: DEEPENING_LOG.md の該当マトリクス行を `| **section/id** | o | o | o | o | o | 0 | ✅Iter.N |` に更新し、末尾にイテレーション記録（対象／選定理由／埋めた層／検算結果／次の候補）を追記
7. **コミット&プッシュ**: `深掘り Iter.N: <トピック名>を5層化` の形式で、本文とログを同一コミットに。`git push origin main` で Pages に自動デプロイされる

## 実装上の注意（壊れやすい箇所）

- **テンプレートリテラル内の KaTeX**: バックスラッシュは `\\`（例 `\\sum`、`\\dfrac`）。body の閉じは **バッククォート**（`` </div>`, `` の形）。過去に `'` で閉じて次のトピックを丸ごと飲み込むバグがあった
- **インライン数式内の `{}`**: `$e^{\\hat b}$` のように普通に書けるが、`$` の対応と `$$` の偶数性に注意（verify-topics.js が検出する）
- **内部リンクの形式**: `<a href="#/section/id">表示名</a>`。**section はファイル名でなくトピック定義の `section:` 値**（例: orthogonal は doe.js にあるが `#/prep1/orthogonal`）。verify-topics.js がデッドリンクを検出する
- **topics/*.js の冒頭**は `const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);` の自己初期化。崩さない
- **デモの参照**: `const st = S(), Pl = P();`（`window.Stats`/`window.Plot` の遅延参照）。draw(canvas, p) は Canvas、plot(div, p, Plotly) は Plotly（3D）
- **新デモの乱数**: `st.rng(シード + (p.reseed|0)*素数)` パターンで再現可能に。ガンマ等の特殊乱数は指数和（アーラン）などで自作（Iter.18 参照）
- **DOM 書き込みは render() 集約**の規律（CLAUDE.md）。トピック本文の追記だけなら触れない

## クラウドセッションに渡すプロンプト（コピペ用）

```
リポジトリ sgt9863/Stats-Learning-Hub のトピック深掘り作業を継続してください。

まず HANDOVER.md と DEEPENING_LOG.md（冒頭のマトリクスと最後のイテレーション記録）を読むこと。
やることは「1トピックずつ5層化」: HANDOVER.md の〈5層の定義〉と〈1イテレーションの手順〉に厳密に従う。

このセッションでは5トピックを目安に、DEEPENING_LOG.md 末尾の「次に深掘りすべきトピック」
から順に処理する（gap の大きいものを優先、同一トピックの連続選定は禁止）。

必須ルール:
- 既存の妥当な記述は書き換えない。欠けている層だけ差分で足す
- 追加する数式・数値は必ず python3 で独立に検算してから本文に書き、結果をログに残す
- 各トピック完了ごとに: node --check と node tools/verify-topics.js を通す →
  DEEPENING_LOG.md のマトリクス更新＋イテレーション記録追記 →
  「深掘り Iter.N: <トピック名>を5層化」でコミット
- デモがないトピックは HANDOVER.md の前例（Iter.16/18）に倣い小さな Canvas デモを新設してよい
- 全トピック完了後に main へプッシュ（GitHub Pages に自動デプロイされる）

最後に、処理したトピック一覧・検算結果の要約・次セッションへの申し送り
（次の優先候補3つ）を報告すること。
```

## 補足

- 検証スクリプト `tools/verify-topics.js` は本引き継ぎ時に新設（依存なし）。導入時に実デッドリンク1件（blocking-designs → doe/orthogonal）を検出・修正済み
- クイズ（content/quiz-*.js）はこの作業のスコープ外（すでに全85トピック分あり）。ただし本文と矛盾する記述を見つけたら直してよい
- デザインは「モダン・ソリッド」路線で確定済み（style.css）。深掘り作業では触らない
