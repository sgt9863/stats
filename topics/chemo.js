'use strict';
/* ケモメトリクス（PLS回帰 / PLS-DA / OPLS-DA） — 準1級範囲外 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const TH = () => window.PlotlyTheme;

  /* なめらかな「スペクトルの山」型の負荷ベクトルを作る */
  function bump(p, center, width) {
    const v = [];
    for (let j = 0; j < p; j++) v.push(Math.exp(-((j - center) ** 2) / (2 * width * width)));
    const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map(x => x / n);
  }

  /* 2群のスペクトル様データを生成。class ±1、予測方向 pd と交絡方向 co を持つ */
  function makeClassData(rand, n, p, sep, orthAmt, noise) {
    const st = S();
    const pd = bump(p, p * 0.32, p * 0.06);   // クラスを分ける成分
    const co = bump(p, p * 0.68, p * 0.08);   // クラスと無関係な交絡（ロット差など）
    const X = [], cls = [];
    for (let i = 0; i < n; i++) {
      const c = i < n / 2 ? 1 : -1;
      const batch = st.randn(rand); // 交絡因子（装置差・ロット）
      const row = [];
      for (let j = 0; j < p; j++) {
        row.push(c * sep * pd[j] + orthAmt * batch * co[j] + noise * st.randn(rand) + 1.0 * bump(p, p * 0.5, p * 0.3)[j]);
      }
      X.push(row); cls.push(c);
    }
    return { X, cls, pd, co };
  }

  /* --- 1. PLS回帰 --- */
  T.push({
    section: 'chemo', id: 'pls', title: 'PLS回帰（部分最小二乗回帰）',
    summary: 'スペクトルのように「変数が多くて互いに強く相関する」データから、少数の潜在成分を通して物性値を予測する回帰法です。',
    body: `
<p>近赤外スペクトルやクロマトグラムは、<strong>変数（波長・保持時間）が数百〜数千あるのに、サンプル数はずっと少ない</strong>のがふつうです。しかも隣りあう波長は強く相関しています。この状況では<a href="#/prep1/multiple-regression">通常の重回帰</a>は<a href="#/prep1/multicollinearity">多重共線性</a>で破綻します（$X^\\top X$ が逆行列を持てない）。</p>
<h3>潜在変数という発想</h3>
<p><strong>PLS回帰（部分最小二乗）</strong>は、$X$ を少数の<strong>潜在成分（latent variable）</strong>に圧縮してから回帰します。ここが<a href="#/prep1/pca">主成分分析</a>と決定的に違う点で、PCA が「$X$ の分散が最大の方向」を探すのに対し、PLS は<strong>「$X$ の分散が大きく、かつ目的変数 $y$ との共分散も大きい方向」</strong>を探します。予測に役立つ方向を優先して抜き出すわけです。</p>
<p>$$ \\boldsymbol{t}_a=X\\boldsymbol{w}_a \\quad(\\boldsymbol{w}_a\\text{は }\\mathrm{Cov}(X\\boldsymbol{w},\\,y)\\text{ を最大化する方向}) $$</p>
<p>成分数（使う潜在変数の数）が最重要のハイパーパラメータで、少なすぎると当てられず（過少）、多すぎるとノイズまで拾って<a href="#/prep1/overfitting">過学習</a>します。<a href="#/prep1/crossval">交差検証</a>で最適な成分数を選ぶのが定石です。漢方・生薬の品質管理では、指紋（フィンガープリント）から指標成分量や薬効指標を予測するのに使われます。</p>

<h3>成分をどう作るか（NIPALS）</h3>
<p>中心化した $X,y$ に対し、第1成分の重みは $\\mathrm{Cov}(X\\boldsymbol{w},y)$ を $\\|\\boldsymbol{w}\\|=1$ のもとで最大化する方向——解は $\\boldsymbol{w}_1\\propto X^\\top\\boldsymbol{y}$（$y$ との共分散が大きい波長に重みが乗る）です。ここからスコア $\\boldsymbol{t}_1=X\\boldsymbol{w}_1$ を作り、$X$ と $y$ を $\\boldsymbol{t}_1$ に回帰した分（ローディング $\\boldsymbol{p}_1,q_1$）を<strong>差し引いて（デフレーション）</strong>、残差に同じ操作を繰り返して $\\boldsymbol{w}_2,\\boldsymbol{t}_2,\\dots$ を得ます。最後に $A$ 個の成分をまとめると、元の変数に戻した回帰係数 $\\hat{\\boldsymbol\\beta}=W(P^\\top W)^{-1}\\boldsymbol{q}$ が求まり、$\\hat y=\\bar y+(\\boldsymbol{x}-\\bar{\\boldsymbol{x}})^\\top\\hat{\\boldsymbol\\beta}$ で予測します。</p>
<p><a href="#/prep1/pca">主成分回帰（PCR）</a>との違いもこの一歩に集約されます。PCRは $y$ を見ずに「$X$ の分散最大方向」を成分にするので、<strong>分散は大きいが予測に無関係な方向</strong>（強い吸収帯だが濃度と無関係、など）を先に拾いがち。PLSは初手から $y$ との共分散を見るため、同じ予測精度を<strong>より少ない成分</strong>で達成できることが多いのです。</p>

<h3>前処理：スペクトルでは、モデルより前処理が効く</h3>
<p>近赤外や赤外のスペクトルでは、<strong>目的成分と無関係な変動のほうが大きい</strong>のがふつうです。粒子径のばらつきによる散乱、試料の詰め方による光路長の違い、ベースラインの傾き——これらは目的成分の吸収より桁で大きいことがあり、そのまま PLS にかけると<strong>潜在変数の1〜2本が「散乱の説明」に費やされます</strong>。前処理はこれを先に落とす作業です。</p>
<table class="simple">
<tr><th>前処理</th><th>やること</th><th>落とせるもの</th></tr>
<tr><td><strong>SNV</strong>（標準正規変量変換）</td><td>各<strong>スペクトル1本ごと</strong>に、その平均を引き標準偏差で割る</td><td>乗法的な散乱（スケールのずれ）＋加法的なベースラインの上下</td></tr>
<tr><td><strong>MSC</strong>（多重散乱補正）</td><td>各スペクトルを基準スペクトル（通常は全試料の平均）へ回帰し、$x_i\\approx a_i+b_i\\bar x$ の $a_i,b_i$ で $ (x_i-a_i)/b_i $ と補正</td><td>同上。基準を要する点がSNVとの違い</td></tr>
<tr><td><strong>1次微分</strong></td><td>波長方向に差分をとる</td><td>加法的なベースラインのオフセット（定数項が消える）</td></tr>
<tr><td><strong>2次微分</strong></td><td>差分を2回</td><td>傾いたベースライン（1次の項まで消える）。重なったピークの分離にも効く</td></tr>
<tr><td><strong>Savitzky-Golay平滑化</strong></td><td>移動窓ごとに多項式を当てはめ、その値（または微分係数）を返す</td><td>微分がノイズを増幅する問題。平滑化と微分を1手で行える</td></tr>
</table>
<p>関係を整理すると、<strong>SNV・MSC は「試料ごとの倍率とオフセット」を、微分は「波長方向のベースライン」を落とす</strong>——効く方向が違うので、実務では「SNV → SG 1次微分」のように組み合わせます。微分の次数を上げるほどベースラインは強く落ちますが<strong>ノイズは増幅される</strong>（差分はノイズの分散を約2倍にする）ので、Savitzky-Golay の窓幅と多項式次数で平滑化とのバランスを取ります。窓を広げすぎるとピークが潰れて情報まで失うため、ここも過学習と同じトレードオフです。</p>
<p><strong>前処理の選び方に王道はなく、交差検証の $Q^2$／RMSECV で選ぶ</strong>のが実際です。そして決定的な注意——<strong>前処理も含めて交差検証の中で行う</strong>こと。全データで前処理してから分割すると、検証セットの情報が前処理を通じて漏れ、$Q^2$ が楽観的になります（MSC の基準スペクトルや標準化の平均・SDは、訓練セットだけから決めて検証セットに<em>適用</em>する）。</p>
<h3>モデルを運用する：ホテリング $T^2$ と Q統計量</h3>
<p>PLS モデルを作った後、新しい試料を予測してよいかを判定する道具が2つあります。「予測値を出すこと」と「その予測が信用できること」は別だからです。</p>
<p>$$ T^2=\\sum_{a=1}^{A}\\frac{t_a^2}{s_{t_a}^2}\\ \\ (\\text{モデル空間の<strong>内側</strong>でどれだけ中心から遠いか}),\\qquad Q=\\|\\boldsymbol x-\\hat{\\boldsymbol x}\\|^2\\ \\ (\\text{モデルで<strong>説明できなかった</strong>残差の大きさ}) $$</p>
<p>この2つは<strong>直交する別種の異常</strong>を捉えます。$T^2$ が大きい試料は「モデルの想定する変動の向きには乗っているが、極端に振れている」——外挿の警告です。$Q$ が大きい試料は「モデルがまったく知らない変動を含む」——別の夾雑物の混入や、装置の状態変化を示します。$T^2$ は正常なら $F$ 分布に、$Q$ は近似的に $\\chi^2$ 系の分布に従うとして管理限界（95%・99%）を引きます。$T^2$ の $\\chi^2$ 的な性格は<a href="#/prep1/multivariate-normal">マハラノビス距離</a>そのもので、実際 $T^2$ はスコア空間でのマハラノビス距離の2乗です。</p>
<p>運用では $T^2$-$Q$ の平面に新試料をプロットし、<strong>両方が限界内にある試料についてのみ予測値を採用</strong>します。生薬のような自然物では産地・収穫年でスペクトルの素性が変わりうるので、この2つを見ずに予測値だけを信じるのは危険です。限界を超えた変数（$Q$ への寄与が大きい波長）を調べる<strong>寄与プロット</strong>まで併せると、「何が普段と違うのか」の診断まで届きます。</p>
<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr>
<tr><td>$X,y$ を中心化（通常は標準化も）</td><td>スケールの大きい変数が重みを独占し、微量だが効く波長が埋もれる</td><td>オートスケーリング（各変数を標準化）／前処理（微分・SNV）</td></tr>
<tr><td>成分数を交差検証で決める</td><td>$p\\gg n$ では成分を増やすほど校正当てはまりは上がり続け過学習</td><td><a href="#/prep1/crossval">交差検証</a>の $Q^2$/RMSECV で最適成分数（下記L5）</td></tr>
<tr><td>低ランクな線形関係</td><td>強い非線形（飽和・散乱）は線形成分で捉えきれない</td><td>カーネルPLS・非線形前処理・区間モデル</td></tr>
<tr><td>予測は校正範囲の内側</td><td>校正データの外へ外挿すると予測が信用できない</td><td>ホテリング $T^2$・残差 $Q$ で範囲外サンプルを検出</td></tr>
</table>

<h3>有意性と実質的な意味</h3>
<p>校正データでの $R^2$ は成分を増やすほど<strong>ほぼ必ず上がる</strong>ため、当てはまりの良さは予測力の証拠になりません（数値実験では成分数 1→10 で $R^2$ が 0.951→0.993 と上がり続けました）。判断は<strong>交差検証した $Q^2$（または RMSECV）</strong>で行い、これは真の潜在次元（この例では2）付近でピークを打って以降は下がります（$Q^2$ は $A{=}2{\\sim}3$ の 0.976 が最大で $A{=}10$ では 0.969）。<strong>$R^2$ と $Q^2$ の乖離＝過学習の大きさ</strong>です。最終的な性能は校正に使っていない<strong>独立試料の RMSEP</strong> で報告します。「$R^2$ が高い＝良いモデル」ではなく「$Q^2$・RMSEP で汎化を確かめる」が鉄則です。</p>
<h3>どの変数が効いているか：VIP</h3>
<p>「どの波長・どのピークが効いたのか」を読む標準的な指標が <strong>VIP（Variable Importance in Projection）</strong>です。変数 $j$ について</p>
<p>$$ \\mathrm{VIP}_j=\\sqrt{\\ p\\cdot\\frac{\\sum_a w_{aj}^2\\,\\mathrm{SSY}_a}{\\sum_a \\mathrm{SSY}_a}\\ } $$</p>
<p>（$p$ は変数の数、$w_{aj}$ は成分 $a$ における変数 $j$ の重み、$\\mathrm{SSY}_a$ はその成分が説明した $Y$ の変動量）。意味は「<strong>各成分での重みを、その成分が $Y$ をどれだけ説明したかで加重平均したもの</strong>」です。全変数の $\\mathrm{VIP}^2$ の平均がちょうど1になるよう規格化されているので、<strong>VIP > 1 が慣習的な選抜基準</strong>になります（平均以上の寄与、という意味）。</p>
<p>使う際の注意が2つ。<strong>(1)</strong> 相関の強い変数が群をなしていると、寄与がその中で分散して個々の VIP は下がります——単独で VIP が低いことは「効いていない」証拠になりません。<strong>(2)</strong> VIP は予測への寄与を測るだけで、因果や生物学的な意味を保証しません。生薬のフィンガープリントから Q-marker 候補を挙げるような場面では、VIP に加えて回帰係数の符号・負荷量・実際のピーク帰属を突き合わせ、最終的には独立試料で確かめるのが定石です。</p>
<div class="note">下は潜在的に2成分で駆動されるスペクトル様データ。青が<strong>校正</strong>（自分自身を当てはめた予測、$R^2$）、オレンジが<strong>一つ抜き交差検証</strong>（自分を除いて学習したモデルの予測、$Q^2$）です。成分数を増やすと青は必ず対角線に寄って $R^2$ が上がり続けますが、真の成分数（2）を超えるとオレンジは散らばり始め $Q^2$ が下がります。この<strong>$R^2$ と $Q^2$ の乖離が過学習</strong>そのもの——だから成分数は $R^2$ ではなく $Q^2$ で決めます。ノイズを上げると乖離が起きやすくなることも確かめてください。</div>`,
    demo: {
      task: {
        q: 'ノイズを0.3に固定して成分数を1から8まで上げてください。青（校正 $R^2$）とオレンジ（交差検証 $Q^2$）はそれぞれどう動きますか。成分数はどこで決めるべきですか。',
        a: '<p><strong>青（$R^2$）は成分を増やすほど単調に上がり続けます</strong>が、<strong>オレンジ（$Q^2$）は真の潜在次元（2）付近でピークを打ち、以降は下がります</strong>。</p><p>この乖離が<strong>過学習そのもの</strong>です。$R^2$ は「自分自身を当てはめた」当てはまりなので、成分を足せば必ず良くなる——だから<strong>成分数の判断には使えません</strong>。判断は $Q^2$（または RMSECV）のピークで行います。</p><p>ノイズを1.2まで上げると、$Q^2$ のピークが<strong>より少ない成分数</strong>に移り、$R^2$ との乖離が早く始まることも確かめてください。<strong>データが汚いほど、使える成分は少ない</strong>——ノイズを潜在変数として拾ってしまうからです。</p><p>サンプル数 $n$ を20と80で比べると、$n$ が少ないほど $Q^2$ が不安定になります。<strong>$p\\gg n$ の状況では $Q^2$ 自体が信用しにくい</strong>ので、独立試料での RMSEP まで確認するのが鉄則。「$R^2$ が0.99だから良いモデル」は、ケモメトリクスで最も多い誤りです。',
      },
      heading: '📈 実測 vs 予測（PLS）',
      note: '点が対角線（y=x）に乗るほど予測が良好。成分数を増やすと青（校正 R²）は上がり続けますが、オレンジ（交差検証 Q²）は真の成分数2〜3でピークを打ち、以降は下がります。この差が過学習です。',
      controls: [
        { type: 'range', id: 'ncomp', label: '潜在成分の数', min: 1, max: 8, step: 1, value: 2 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.05, max: 1.2, step: 0.05, value: 0.3 },
        { type: 'range', id: 'n', label: 'サンプル数', min: 20, max: 80, step: 5, value: 45 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1200 + (p.reseed | 0) * 29);
        const n = Math.round(p.n), pdim = 24;
        const L1 = bump(pdim, 6, 2.2), L2 = bump(pdim, 16, 2.8);
        const X = [], y = [];
        for (let i = 0; i < n; i++) {
          const f1 = st.randn(rand), f2 = st.randn(rand);
          const row = [];
          for (let j = 0; j < pdim; j++) row.push(f1 * L1[j] + f2 * L2[j] + p.noise * st.randn(rand));
          X.push(row);
          y.push([4 * f1 - 2 * f2 + 10 + 0.5 * p.noise * st.randn(rand)]);
        }
        const ncomp = Math.min(Math.round(p.ncomp), pdim - 1);
        // 予測 yhat = (X - xmean) B + ymean
        const predict = (model, row) => {
          const xc = row.map((v, j) => v - model.xmean[j]);
          return st.dot(xc, model.B.map(r => r[0])) + model.ymean[0];
        };
        // 校正（自分自身を当てはめた予測）
        const model = st.plsNipals(X, y, ncomp);
        const yhat = X.map(row => predict(model, row));
        // 一つ抜き交差検証（自分を除いて学習した予測）＝汎化性能の代理
        const yloo = X.map((row, i) => {
          const Xt = X.filter((_, k) => k !== i), yt = y.filter((_, k) => k !== i);
          return predict(st.plsNipals(Xt, yt, ncomp), row);
        });
        const yv = y.map(r => r[0]);
        const ybar = st.mean(yv);
        let ssr = 0, press = 0, sst = 0;
        for (let i = 0; i < n; i++) {
          ssr += (yv[i] - yhat[i]) ** 2;
          press += (yv[i] - yloo[i]) ** 2;
          sst += (yv[i] - ybar) ** 2;
        }
        const r2 = 1 - ssr / sst;      // 校正の決定係数：成分を増やすほど必ず上がる
        const q2 = 1 - press / sst;    // 予測的決定係数：過学習すると下がる
        const all = yv.concat(yhat, yloo);
        const lo = Math.min.apply(null, all) - 1, hi = Math.max.apply(null, all) + 1;
        const data = [
          { type: 'scatter', mode: 'lines', x: [lo, hi], y: [lo, hi], line: { color: '#c7cdd8', dash: 'dash', width: 1.5 }, hoverinfo: 'skip', showlegend: false },
          { type: 'scatter', mode: 'markers', name: '交差検証 (Q²)', x: yv, y: yloo, marker: { size: 8, color: '#e4572e', opacity: 0.75 }, hovertemplate: '実測 %{x:.1f}<br>CV予測 %{y:.1f}<extra></extra>' },
          { type: 'scatter', mode: 'markers', name: '校正 (R²)', x: yv, y: yhat, marker: { size: 8, color: '#4f6df5', opacity: 0.8 }, hovertemplate: '実測 %{x:.1f}<br>予測 %{y:.1f}<extra></extra>' },
        ];
        const layout = TH().layout({
          xaxis: { title: '実測値 y', range: [lo, hi] },
          yaxis: { title: '予測値 ŷ', range: [lo, hi], scaleanchor: 'x' },
          margin: { l: 52, r: 12, t: 28, b: 42 },
          showlegend: true,
          legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { size: 11 } },
          title: { text: ncomp + ' 成分　R² = ' + r2.toFixed(3) + ' / Q² = ' + q2.toFixed(3), font: { size: 13 }, x: 0.5 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 2. PLS-DA --- */
  T.push({
    section: 'chemo', id: 'pls-da', title: 'PLS-DA（判別のためのPLS）',
    summary: 'PLS回帰の目的変数を「クラス（0/1）」にして分類に使う手法。多変数の指紋データから2群を分けるスコアプロットを描きます。',
    body: `
<p><strong>PLS-DA</strong>は、<a href="#/chemo/pls">PLS回帰</a>の目的変数を<strong>クラスを表すダミー変数</strong>（例：真正品=+1／偽和品=−1）に置き換え、分類に転用した手法です。ケモメトリクスでの<a href="#/prep1/lda">判別分析</a>の定番で、変数がサンプル数より多い高次元データでもそのまま使えます。</p>
<h3>スコアプロットで群を見る</h3>
<p>PLS-DAは、クラスの違いをよく説明する潜在成分 $\\boldsymbol{t}_1,\\boldsymbol{t}_2$ を作ります。各サンプルをこの成分の座標（<strong>スコア</strong>）で描いた<strong>スコアプロット</strong>を見ると、群がどれだけ分離しているかが一目で分かります。どの変数（波長・成分）が分離に効いたかは<strong>負荷量（ローディング）</strong>で読み取ります。</p>
<p>漢方・生薬の品質管理では、産地判別・真贋判定・製法の違いの検出などに広く使われます。ただしPLS-DAは<strong>群を無理にでも分けてしまう</strong>過学習傾向があるため、必ず<a href="#/prep1/crossval">交差検証</a>や並べ替え検定で「その分離は本物か」を確認します。</p>

<h3>潜在成分はどう作られるか</h3>
<p>PLS-DAは特別な分類器ではなく、<strong>目的変数をクラスのダミー $y\\in\\{+1,-1\\}$ にした<a href="#/chemo/pls">PLS回帰</a>そのもの</strong>です。第1成分の重み $\\boldsymbol{w}_1$ は $\\mathrm{Cov}(X\\boldsymbol{w},y)$ を最大化する方向でしたが、中心化した $X$ とダミー $y$ ではこれが具体的な形になります。</p>
<p>$$ \\boldsymbol{w}_1 \\;\\propto\\; X^\\top\\boldsymbol{y} \\;=\\; \\sum_i \\boldsymbol{x}_i\\,y_i \\;=\\; \\tfrac{n}{2}\\,(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B) $$</p>
<p>右側の等号は、$y_i=+1$（クラスA）と $y_i=-1$（クラスB）で和を分ければ $\\sum_A\\boldsymbol{x}_i-\\sum_B\\boldsymbol{x}_i$ になり、各群 $n/2$ 個なら $\\tfrac{n}{2}(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B)$ になるからです。つまり<strong>第1予測方向は「2群の平均ベクトルの差」そのもの</strong>——これがスコアプロットで群が横に分かれる正体です。</p>
<p><a href="#/prep1/lda">線形判別分析（LDA）</a>との違いもここで見えます。LDAは同じ平均差を<strong>群内共分散 $S_W$ の逆行列で割って</strong>白色化しますが（$\\boldsymbol{w}\\propto S_W^{-1}(\\bar{\\boldsymbol{x}}_A-\\bar{\\boldsymbol{x}}_B)$）、変数がサンプルより多い（$p>n$）と $S_W$ が特異で逆行列を持てません。PLS-DAは逆行列を取らず共分散だけで方向を決めるので、<strong>高次元でもそのまま動く</strong>——ここがケモメトリクスでLDAでなくPLS-DAが使われる理由です。分類は予測値 $\\hat y$ の符号（多クラスならクラスごとにダミー列を作り最大の $\\hat y$）で行います。</p>

<h3>前提条件と、崩れたときの影響</h3>
<table class="simple">
<thead><tr><th>前提</th><th>崩れると起きること</th><th>対処・代替</th></tr></thead>
<tbody>
<tr><td>変数のスケールがそろっている</td><td>分散の大きい変数（強い吸収帯）が方向を独占し、微量マーカーが埋もれる</td><td>オートスケーリング（各変数を標準化）／Pareto スケーリング</td></tr>
<tr><td>$p$ に対し十分な $n$ とCV</td><td>$p\\gg n$ ではランダムなラベルでも標本内で完全分離＝過学習。「きれいな分離」が情報ゼロのこともある</td><td>交差検証で成分数を決める・並べ替え検定で有意性を確認（下記L5）</td></tr>
<tr><td>クラスサイズが均衡</td><td>不均衡だと多数派へ予測が偏り、少数派の感度が落ちる（見かけの正解率は高い）</td><td>クラス重み・バランス化・balanced accuracy／混同行列で評価</td></tr>
<tr><td>群を分けるのはクラス由来の変動</td><td>ロット差・装置差など交絡が予測軸に混入し、産地でなく測定日を分けてしまう</td><td><a href="#/chemo/opls-da">OPLS-DA</a>で直交変動を分離・実験計画でブロック化</td></tr>
<tr><td>群構造が線形に分けられる</td><td>非線形な群配置は潜在成分では捉えきれない</td><td>カーネルPLS・非線形判別／特徴量の変換</td></tr>
</tbody>
</table>

<h3>有意性と実質的な意味</h3>
<p>PLS-DAで一番危険なのは「スコアプロットで群が分かれた＝意味がある」と読むことです。<strong>標本内の当てはまり $R^2Y$ はほぼ常に1近くまで上がる</strong>ため、当てはまりの良さは証拠になりません。実際、$n=20,\\ p=200$ のデータに<strong>でたらめなクラスラベル</strong>を貼っても、2成分PLS-DAの標本内正解率は<strong>100%</strong>になります（どんなラベルでも完全分離できてしまう）。</p>
<p>そこで有意性は<strong>並べ替え検定（permutation test）</strong>で測ります。クラスラベルを何百回もシャッフルして毎回モデルを組み直し、<strong>交差検証</strong>で得た $Q^2$（または CV 正解率）の分布＝帰無分布を作り、実データの $Q^2$ がその上位何%に入るかで $p$ 値を出します。先の「でたらめラベル」でも、一つ抜き交差検証（LOO-CV）の正解率は<strong>約0.5（偶然と同じ）</strong>に落ちます——標本内の100%とCVの50%のギャップが、そのまま過学習の大きさです。</p>
<p>報告では「分離した」ではなく、<strong>$Q^2$・CV混同行列・並べ替え $p$ 値・効果量（群間距離やマーカーのVIP）</strong>をそろえます。統計的に有意でも、実務では「その差で真贋・産地を判定できる誤分類率か」まで見て初めて意味を持ちます。</p>

<div class="note">下は2群（青・オレンジ）の高次元スペクトルデータのスコアプロット。クラスの分離度を上げると2群が左右に離れ、<strong>ノイズ</strong>を増やすと重なって誤分類が増えます。一方<strong>交絡（ロット差など）</strong>を増やしたときは様子が違います——第1成分は上で導いたとおり2群の平均差の方向なので分離自体はおおむね保たれ、代わりにクラスと無関係な変動が $t_2$（一部は $t_1$）に乗って、群のかたまりが伸び分離軸が斜めに傾きます。つまり「分離できない」のではなく<strong>「どの軸がクラスの違いなのか読み取りにくくなる」</strong>のが問題です。だから次の<a href="#/chemo/opls-da">OPLS-DA</a>で、この「分離軸」と「無関係なばらつき軸」を分けて整理します。</div>`,
    demo: {
      task: {
        q: 'クラス分離度を1.5に固定して、ノイズを1.0に上げた場合と、交絡（ロット差）を3に上げた場合を比べてください。スコアプロットの見え方はどう違いますか。どちらが「気づきにくい」問題ですか。',
        a: '<p><strong>ノイズを上げると</strong>：2群が重なって<strong>明らかに分離が悪くなります</strong>。問題が目に見えるので、気づけます。</p><p><strong>交絡を上げると</strong>：第1成分は2群の平均差方向なので<strong>分離自体はおおむね保たれます</strong>。代わりにクラスと無関係な変動が第2成分（一部は第1成分）に乗り、群のかたまりが<strong>伸びて、分離軸が斜めに傾きます</strong>。</p><p><strong>危険なのは後者です。</strong>スコアプロットは「きれいに分かれている」ように見えるのに、その軸が何を表しているのか読めなくなっている。ロット差を「産地の違い」と誤読する——バイオマーカー探索で最も多い事故がこれです。</p><p>対策は3つ。<strong>(1)</strong> 実験計画の段階でロットと群を<a href="#/prep1/principles">無作為化</a>・ブロック化して交絡させない。<strong>(2)</strong> <a href="#/chemo/opls-da">OPLS-DA</a> で予測方向と直交方向を分けて、何が分離軸なのかを可視化する。<strong>(3)</strong> ローディングを見て、分離に効いている変数が生物学的・化学的に説明できるか確かめる。<strong>スコアプロットの見た目だけで判断しない</strong>のが鉄則です。',
      },
      heading: '🎯 PLS-DA スコアプロット（t₁ vs t₂）',
      note: 'クラス分離度を上げると2群が離れ、ノイズを上げると重なって誤分類が増えます。交絡（ロット差）は違い、分離自体は保たれたまま群が伸びて分離軸が斜めに傾く＝どの軸がクラス差か読みにくくなります。',
      controls: [
        { type: 'range', id: 'sep', label: 'クラスの分離度', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'orth', label: '交絡（ロット差など）', min: 0, max: 3, step: 0.2, value: 1 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.1, max: 1, step: 0.1, value: 0.3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1300 + (p.reseed | 0) * 37);
        const n = 60, pdim = 24;
        const { X, cls } = makeClassData(rand, n, pdim, p.sep, p.orth, p.noise);
        const Y = cls.map(c => [c]);
        const model = st.plsNipals(X, Y, 2);
        const T2 = model.T; // n×2
        const g1x = [], g1y = [], g2x = [], g2y = [];
        for (let i = 0; i < n; i++) {
          if (cls[i] > 0) { g1x.push(T2[i][0]); g1y.push(T2[i][1]); }
          else { g2x.push(T2[i][0]); g2y.push(T2[i][1]); }
        }
        const data = [
          { type: 'scatter', mode: 'markers', x: g1x, y: g1y, marker: { size: 9, color: '#4f6df5', opacity: 0.8 }, name: 'クラスA（真正品）' },
          { type: 'scatter', mode: 'markers', x: g2x, y: g2y, marker: { size: 9, color: '#e4572e', opacity: 0.8 }, name: 'クラスB（偽和品）' },
        ];
        const layout = TH().layout({
          showlegend: true, legend: { x: 0.5, y: 1.12, xanchor: 'center', orientation: 'h', font: { size: 11 } },
          xaxis: { title: '第1成分 t₁' }, yaxis: { title: '第2成分 t₂' },
          margin: { l: 52, r: 12, t: 34, b: 42 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });

  /* --- 3. OPLS-DA --- */
  T.push({
    section: 'chemo', id: 'opls-da', title: 'OPLS-DA（直交補正つきPLS-DA）',
    summary: 'クラスに関係する変動と、関係しない変動（ロット差・装置差）を分離。分離軸を1本に集約して、解釈しやすいスコアプロットにします。',
    body: `
<p>PLS-DAのスコアプロットでは、クラスを分ける情報が第1・第2成分に<strong>斜めに散らばって</strong>しまい、「どの軸がクラスの違いか」が読みにくいことがあります。原因は、クラスとは無関係な大きな変動（ロット差・装置差・日間差＝<strong>直交変動</strong>）が成分に混ざるためです。</p>
<h3>予測成分と直交成分に分ける</h3>
<p><strong>OPLS-DA</strong>は、$X$ の変動を2種類に分解します。</p>
<ul>
<li><strong>予測成分（predictive）</strong> $t_{\\mathrm{p}}$：クラスの違いに関係する変動。横軸に集約する。</li>
<li><strong>直交成分（orthogonal）</strong> $t_{\\mathrm{o}}$：クラスと無関係な変動。縦軸へ追い出す。</li>
</ul>
<p>こうすると、<strong>クラスの分離はすべて横軸（1本）に乗り</strong>、縦軸は「クラスと関係ないばらつき」を表します。予測性能自体はPLS-DAと基本的に同じですが、<strong>解釈が格段にしやすく</strong>なるのが利点です。「どの成分がクラスを分けるのか」を負荷量から読みやすくなるため、メタボロミクスや生薬フィンガープリントの<strong>バイオマーカー探索</strong>で標準的に使われます。</p>
<h3>「分けるだけ」で予測力は増えない（重要な注意）</h3>
<p>OPLS-DA を理解する鍵は、<strong>PLS-DA と数学的にほぼ等価</strong>だという点です。OPLS-DA は同じ情報を<strong>回転させて表示を整理しているだけ</strong>で、$Y$ と関係する変動を1本の予測成分に集め、残りを直交成分に振り分けます。だから<strong>予測性能（交差検証の $Q^2$、正答率）は PLS-DA と変わりません</strong>——変わるのは<em>見やすさ・解釈しやすさ</em>だけ。「OPLS-DA にしたら $R^2$ が上がった」は改善ではなく、むしろ<strong>過学習の危険信号</strong>のことがあります。ここが最大の落とし穴で、OPLS-DA の美しい1軸分離は<a href="#/chemo/pls-da">PLS-DA と同じく</a>、変数がサンプルより多いと<strong>ランダムなデータでも作れてしまいます</strong>。</p>
<h3>直交成分をどう取り出すか（手続き）</h3>
<p>「クラスと無関係な変動を分ける」を実際にどうやるのか。手続きは意外なほど素直です。</p>
<ol>
<li>まず通常どおり PLS の重み $\\boldsymbol w$（$X$ と $y$ の共分散が最大になる向き）を求める。これが<strong>予測方向</strong>。</li>
<li>$X$ の負荷量 $\\boldsymbol p$ のうち、<strong>$\\boldsymbol w$ に平行な成分を引き去った残り</strong>を直交重み $\\boldsymbol w_{\\perp}$ とする：$\\boldsymbol w_{\\perp}=\\boldsymbol p-\\dfrac{\\boldsymbol p^\\top\\boldsymbol w}{\\boldsymbol w^\\top\\boldsymbol w}\\,\\boldsymbol w$。</li>
<li>その向きのスコア $\\boldsymbol t_{\\perp}=X\\boldsymbol w_{\\perp}/(\\boldsymbol w_{\\perp}^\\top\\boldsymbol w_{\\perp})$ を計算し、$X\\leftarrow X-\\boldsymbol t_{\\perp}\\boldsymbol p_{\\perp}^\\top$ と<strong>$X$ から抜き去る</strong>。</li>
<li>直交成分が出尽くすまで（交差検証で決めた本数だけ）2〜3を繰り返し、最後に残った $X$ で普通の PLS を1成分だけ当てる。</li>
</ol>
<p>ステップ2が<a href="#/math/vectors-matrices">正射影</a>そのもの——「$X$ の変動のうち、$y$ の方向に平行でない部分」を定義しているだけです。だから <strong>OPLS-DA は情報を捨てているのではなく、置き場所を変えている</strong>：予測に効く分をすべて第1成分に集め、残りを直交成分に追い出しています。$y$ が1変数（2クラス）なら予測成分は必ず1本になり、「横軸＝クラス差、縦軸＝クラスと無関係なばらつき」というあの見やすいスコアプロットが得られます。</p>
<h3>S-プロット：見やすさに潜む罠</h3>
<p>OPLS-DA とセットで使われるのが <strong>S-プロット</strong>で、横軸に<strong>共分散</strong> $\\mathrm{cov}(x_j,t_1)$、縦軸に<strong>相関</strong> $\\mathrm{corr}(x_j,t_1)$ を取って変数を散布します。S字の両端（共分散も相関も大きい変数）がバイオマーカー候補、という読み方です。</p>
<p>2軸に分ける意味は明確です。<strong>横軸＝寄与の大きさ</strong>（強度の大きい変数ほど大きくなる＝実測で追いやすい）、<strong>縦軸＝関係の確からしさ</strong>（強度によらず、そのクラス差との結びつきの強さ）。<strong>共分散だけで選ぶと強度の大きいピークばかりが、相関だけで選ぶとノイズレベルの微小ピークまで拾われる</strong>ので、両方が大きい端点を見る——これがS-プロットの設計思想です。</p>
<p>ただし致命的な注意があります。<strong>S-プロットは「そのモデルの中での」重要度を描くだけで、統計的な有意性を含みません</strong>。モデル自体が過学習していれば（$Q^2$ が低い、順列検定で有意でない）、S-プロットの端点は<strong>ノイズを並べた美しい図</strong>にすぎません。順序は必ず「①モデルの妥当性を $Q^2$ と順列検定で確かめる → ②S-プロットや VIP で候補を挙げる → ③独立試料と別手法（定量・MS/MS 同定）で確認する」。図の見た目の説得力と、証拠としての強さは別物です。</p>
<h3>前提と、バイオマーカー探索での作法</h3>
<p>だから検証は PLS-DA と全く同じ厳しさが要ります：<strong>(1) 交差検証の $Q^2$</strong>（訓練当てはめ $R^2$ ではなく）で本当に予測できるか、<strong>(2) 並べ替え検定</strong>でラベルをシャッフルした分布より本物が有意に良いか、<strong>(3) 独立検証セット</strong>での確認。とくにバイオマーカー探索では、直交補正で「クリアに分離した」図を見せられると差が本物だと錯覚しやすい——<strong>スコアプロットの見た目は証拠になりません</strong>。負荷量や VIP・S-plot で「効いた変数」を挙げるときも、交絡（ロット・測定バッチ）が直交成分でなく予測成分に漏れていないか、選んだ変数が別コホートで再現するかを必ず確かめます。OPLS-DA は<strong>解釈のための可視化ツールであって、検証を省ける魔法ではない</strong>と理解するのが肝心です。</p>
<div class="note">下は同じデータを OPLS-DA で描いたもの。<strong>横軸（予測成分）だけで2群が分離</strong>し、縦軸（直交成分）はクラスと無関係なばらつき＝交絡を上げると縦に伸びます。<a href="#/chemo/pls-da">PLS-DA</a>の斜めの散らばりと見比べてください。分離が1軸にまとまるぶん解釈はクリアですが、分離の「本物さ」は見た目でなく交差検証で判断する点は PLS-DA と同じです。</div>`,
    demo: {
      task: {
        q: '交絡（ロット差）を0と3で切り替えてください。予測成分（横軸）と直交成分（縦軸）の役割分担はどう見えますか。交絡が大きいとき、PLS-DAと比べて何が改善しますか。',
        a: '<p>交絡0では点は横軸方向にだけ分かれ、縦軸方向の広がりはわずか。交絡を3にすると<strong>縦方向（直交成分）に大きく伸びますが、横方向の2群の分離は保たれます</strong>。</p><p>これが OPLS-DA の役割分担です。<strong>横軸＝クラスの違い、縦軸＝クラスと無関係なばらつき</strong>。<a href="#/chemo/pls-da">PLS-DA</a> では両方が混ざって軸が斜めに傾いてしまうのに対し、OPLS-DA は<strong>「どちらの方向がクラス差なのか」を一目で読めるように整理します</strong>。</p><p>ただし<strong>改善するのは解釈性だけで、予測力は上がりません</strong>。OPLS-DA は情報を捨てても増やしてもおらず、<a href="#/math/vectors-matrices">正射影</a>で置き場所を変えているだけ——同じ情報を回転して見やすくしているにすぎません。$Q^2$ は PLS-DA とほぼ同じになります。</p><p>だから<strong>「OPLS-DA を使ったからきれいに分かれた」は誤りです</strong>。見かけの分離は必ず $Q^2$ と順列検定で検証してください。縦軸に大きな広がりが出たら、それは「何か強い交絡がある」という<strong>診断情報</strong>——その正体（ロット・測定日・前処理）を突き止めるほうが、モデルを磨くより先です。',
      },
      heading: '🎯 OPLS-DA スコアプロット（予測成分 vs 直交成分）',
      note: '2群は横軸（予測成分）で分離、縦軸（直交成分）はクラスと無関係なばらつき。交絡を増やすと点が縦に伸びるだけで、横方向の分離は保たれます。ここがOPLS-DAの読みやすさです。',
      controls: [
        { type: 'range', id: 'sep', label: 'クラスの分離度', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'orth', label: '交絡（ロット差など）', min: 0, max: 3, step: 0.2, value: 1.5 },
        { type: 'range', id: 'noise', label: '測定ノイズ', min: 0.1, max: 1, step: 0.1, value: 0.3 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      plot(div, p, Plotly) {
        const st = S();
        const rand = st.rng(1400 + (p.reseed | 0) * 41);
        const n = 60, pdim = 24;
        const { X, cls } = makeClassData(rand, n, pdim, p.sep, p.orth, p.noise);
        // 中心化
        const { Xc } = st.center(X);
        // 予測方向: クラス平均差
        const idx1 = [], idx0 = [];
        cls.forEach((c, i) => (c > 0 ? idx1 : idx0).push(i));
        const m1 = new Array(pdim).fill(0), m0 = new Array(pdim).fill(0);
        idx1.forEach(i => Xc[i].forEach((v, j) => m1[j] += v / idx1.length));
        idx0.forEach(i => Xc[i].forEach((v, j) => m0[j] += v / idx0.length));
        let wp = m1.map((v, j) => v - m0[j]);
        const wpn = st.norm(wp) || 1; wp = wp.map(v => v / wpn);
        const tp = Xc.map(row => st.dot(row, wp)); // 予測スコア
        // 予測成分を除いた残差
        const Xres = Xc.map((row, i) => row.map((v, j) => v - tp[i] * wp[j]));
        // 直交方向: 残差の最大分散方向（PC1）
        const C = st.matmul(st.transpose(Xres), Xres);
        const eig = st.eigSym(C);
        const wo = eig.vectors[0];
        const to = Xres.map(row => st.dot(row, wo)); // 直交スコア
        const g1x = [], g1y = [], g2x = [], g2y = [];
        for (let i = 0; i < n; i++) {
          if (cls[i] > 0) { g1x.push(tp[i]); g1y.push(to[i]); }
          else { g2x.push(tp[i]); g2y.push(to[i]); }
        }
        const data = [
          { type: 'scatter', mode: 'markers', x: g1x, y: g1y, marker: { size: 9, color: '#4f6df5', opacity: 0.8 }, name: 'クラスA（真正品）' },
          { type: 'scatter', mode: 'markers', x: g2x, y: g2y, marker: { size: 9, color: '#e4572e', opacity: 0.8 }, name: 'クラスB（偽和品）' },
          { type: 'scatter', mode: 'lines', x: [0, 0], y: [Math.min.apply(null, to) - 0.5, Math.max.apply(null, to) + 0.5], line: { color: '#c7cdd8', dash: 'dot', width: 1 }, hoverinfo: 'skip', showlegend: false },
        ];
        const layout = TH().layout({
          showlegend: true, legend: { x: 0.5, y: 1.12, xanchor: 'center', orientation: 'h', font: { size: 11 } },
          xaxis: { title: '予測成分 t_p（クラスを分ける軸）' },
          yaxis: { title: '直交成分 t_o（クラスと無関係）' },
          margin: { l: 52, r: 12, t: 34, b: 42 },
        });
        Plotly.react(div, data, layout, TH().config);
      },
    },
  });
})();
