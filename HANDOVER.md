# HANDOVER — トピック深掘り作業の引き継ぎ（クラウドセッション用）

ローカルセッションで進めてきた「全86トピックの5層化」を、クラウドセッションで継続するための文書。
**進捗の唯一の情報源は [DEEPENING_LOG.md](DEEPENING_LOG.md)**（冒頭のマトリクスと各イテレーションの記録）。本書は「やり方」を引き継ぐ。

## 現状（2026-09-05 時点）

- **32/86 トピックが5層完備**（Iter.1〜32）。進捗の唯一の情報源は [DEEPENING_LOG.md](DEEPENING_LOG.md) 冒頭のマトリクス
- **トピック総数は 86**（準1級範囲に「因果推論」が追加されたため 85→86。`prep1/causal-inference`＝潜在結果・交絡・調整、topics/ml.js に定義。交絡デモ＋クイズ3問つきで**5層完備済み**）
- `node tools/verify-topics.js` は **86/86 パス**（構造・内部リンク・`$$`偶数性・quiz対応）
- **デザイン改善 Iter.D1〜D7 完了**（[DESIGN_LOG.md](DESIGN_LOG.md) / [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)）:
  D1 カラートークン確立（UIアクセントをグラフ系列色と分離）/ D2 本文読み幅 `--measure:42em` /
  D3 コールアウト統一（角丸＋左バー）/ D4 本文リストのリズム / D5 サイドバー現在地 /
  D6 ページャホバー / D7 リード下線の軽量化。**以降 CSS は必ず `:root` のトークンを参照すること**
- 次の優先候補（gap 大・依存順）: `math/gradient`（**検算済み・本文未反映**／下記メモ）→ `prep1/odds-ratio` →
  `prep1/clt` → `prep1/monte-carlo`。DEEPENING_LOG.md 末尾の「次に深掘りすべきトピック」が最新
- サイトは GitHub Pages で公開中（`main` ブランチ**ルート**配信・`.nojekyll` あり）。**Pages の配信元設定を `/docs` に変えないこと**（過去にこれで全デプロイが失敗した）

### 申し送り: `math/gradient`（着手済み・本文未反映）

python3 で独立検算済みの材料。そのまま L2/L3/L4 に使える:

- **最急降下方向**: 方向微分 $D_u f = \nabla f \cdot u = |\nabla f|\cos\theta$ が最小になるのは $u = -\nabla f/|\nabla f|$ のとき（勾配 $(2,6)$ で数値探索し厳密一致を確認）
- **学習率の収束条件**: 二次形式 $f = ax^2 + by^2$（ヘッセ行列の固有値は $2a, 2b$）で $0 < \eta < 2/\lambda_{\max}$。
  デモの $a=1$ なら $\eta < 1/b$。実測: $b=8$ のとき $\eta=0.1125$ は収束（$f \to 2.5\times10^{-7}$）、$\eta \geq 0.125$ で発散
- **条件数** $\kappa = \lambda_{\max}/\lambda_{\min} = b/a$ がデモの「谷の細長さ」そのもの。大きいほどジグザグして収束が遅い（L4 のグラフ接続に使える）

### この環境（クラウドセッション）の注意

- **Chromium は外部ネットに出られない**（egress proxy が CONNECT を拒否）。スクショ検証は
  `python3 -m http.server` でローカル配信 → `file://`/`127.0.0.1` を開く形にする（NO_PROXY 対象）
- KaTeX の CDN も同様に届かないので、スクショ時は `npm install katex --no-save` でベンダーして
  `index.html` の CDN URL をローカルパスに `sed` で差し替えた **一時ファイル**（`index.shot.html`）を使う。
  一時ファイルは `.git/info/exclude` に入れて**コミットしない**
- Playwright の chromium 実体は `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`（`playwright install` は不要）

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
   - `node tools/verify-topics.js` — 全86トピックの構造・内部リンク実在・`$$`フェンス偶数性・quiz対応（依存なし・ブラウザ不要）
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
