'use strict';
/* 検定の理論（ネイマン・ピアソン／尤度比・ワルド・スコア／正規検定／適合度／多重比較／サンプルサイズ） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* --- ネイマン・ピアソンの基本定理 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'neyman-pearson', title: 'ネイマン・ピアソンの基本定理',
    summary: '「有意水準を固定したとき検出力を最大にする検定は、尤度比を閾値で切る検定である」という最強力検定の原理を、2つの分布の重なりで理解します。',
    body: `
<p>単純仮説 $H_0:\\theta=\\theta_0$ 対 $H_1:\\theta=\\theta_1$ を考えます。第1種の誤り $\\alpha$ を固定したとき、<strong>検出力（$1-\\beta$）を最大にする</strong>検定はどれか？ 答えが<strong>ネイマン・ピアソンの基本定理</strong>です。</p>
<p>$$ \\frac{L(\\theta_1\\mid\\boldsymbol x)}{L(\\theta_0\\mid\\boldsymbol x)}\\ \\ge\\ c\\ \\Rightarrow\\ H_0\\text{ を棄却} $$</p>
<p>つまり<strong>尤度比</strong>がある閾値 $c$ を超えたら棄却する検定が「最強力検定」。閾値 $c$ は $\\alpha$ になるように決めます。</p>
<h3>なぜ尤度比で切るのが最適か</h3>
<p>棄却域は「予算 $\\alpha$（$H_0$ の下での面積）を使って、$H_1$ の下での面積（検出力）を最大化する」問題です。$\\alpha$ の予算を1単位使うごとに得られる検出力は、その点での<strong>尤度の比 $L(\\theta_1)/L(\\theta_0)$</strong>——「$H_0$ 面積あたりの $H_1$ 面積の稼ぎ」です。予算が限られているなら<strong>稼ぎ（尤度比）の大きい点から順に</strong>棄却域へ入れるのが最善で、これは「単価の高いものから買う」貪欲法と同じ理屈。だから最適な棄却域は「尤度比 $\\ge c$」の形になり、$c$ は面積が $\\alpha$ ちょうどになる高さに決まります。これがネイマン・ピアソン補題の心臓です。</p>
<h3>前提と、崩れたときの注意</h3>
<p>この補題が<strong>厳密に</strong>成り立つのは<strong>単純仮説 vs 単純仮説</strong>（$H_0,H_1$ とも1点）のときだけです。現実の $H_1:\\theta\\ne\\theta_0$ や $\\theta>\\theta_0$ は<strong>複合仮説</strong>で、「どの $\\theta_1$ でも同時に最強力」な検定（一様最強力検定 UMP）は<strong>いつでも存在するわけではありません</strong>。片側検定では、指数型分布族＋単調尤度比という条件下でUMPが存在します（だから片側 $z$ 検定は正当化される）が、<strong>両側対立には一般にUMP検定が存在しません</strong>——そこで<a href="#/prep1/three-tests">尤度比検定</a>のような「一様ではないが良い性質を持つ」検定で代用します。また尤度比の計算にはモデル（尤度の形）が正しいことが前提で、モデル誤特定があれば「最強力」の保証は失われます。</p>
<div class="note">直感：どのデータが「$H_1$ らしいか」を、$H_1$ と $H_0$ での尤度の比で順位づけし、$H_1$ らしい順に $\\alpha$ の分だけ棄却域に入れれば、同じ $\\alpha$ で最大の検出力が得られます。下で2つの分布の隔たり（効果量）と $\\alpha$ を動かし、棄却域（尤度比が閾値超）と検出力の関係を見てください。正規で分散共通なら「尤度比が閾値超」は「$Z$ が閾値超」と同値なので、境界が1本の縦線で描けています。</div>`,
    demo: {
      task: {
        q: '効果量を1.6に固定して有意水準を1%と20%にしたときの検出力を比べ、次に $\\alpha=5\\%$ のまま効果量を0.3と4にしてください。検出力を上げる2つの道の「代償」はそれぞれ何ですか。',
        a: '<p>効果量1.6のとき、検出力は $\\alpha=5\\%$ で <strong>0.48</strong>、$\\alpha=20\\%$ で <strong>0.78</strong>。$\\alpha=5\\%$ のまま効果量を変えると、0.3 で <strong>0.09</strong>、4 で <strong>0.99</strong>。</p><p>2つの道の代償はまったく違います。</p><ul><li><strong>$\\alpha$ を緩める</strong>：検出力は上がるが、<strong>偽陽性が同じだけ増えます</strong>。これは性能向上ではなく「第1種の誤りを売って第2種の誤りを買う」交換にすぎません。</li><li><strong>効果量が大きい</strong>：代償なしに検出力が上がりますが、<strong>効果量は自分で決められません</strong>（自然が決める量）。</li></ul><p>つまり<strong>本当に検出力を「買える」のは、標本数を増やすか測定精度を上げるかだけ</strong>です。効果量 $d=(\\theta_1-\\theta_0)/\\sigma$ の分母 $\\sigma$ を小さくする——測定のばらつきを減らす——のは実験家にできる数少ない正攻法で、$n$ を増やすより安いことも多い。<br>なお、ネイマン・ピアソンの補題が保証するのは「<strong>この $\\alpha$ のもとでこれ以上の検出力は原理的に不可能</strong>」ということ。検出力0.48が不満なら、検定手法を変えても解決しません。',
      },
      note: '効果量（2つの山の隔たり）を大きくすると、同じαでも棄却域に入るH₁の割合＝検出力が上がる。棄却の境界は尤度比が一定になる点＝2つの密度が同じ比になる位置です。',
      controls: [
        { type: 'range', id: 'effect', label: '効果量 (θ₁−θ₀)/σ', min: 0.3, max: 4, step: 0.1, value: 1.6 },
        { type: 'range', id: 'alpha', label: '有意水準 α (%)', min: 1, max: 20, step: 1, value: 5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const d = p.effect, alpha = p.alpha / 100;
        const zc = st.normalInv(1 - alpha);
        const xs = st.linspace(-4, 4 + d, 320);
        const ymax = 0.45;
        const pl = Pl.make(canvas, { xmin: -4, xmax: 4 + d, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '検定統計量', yLabel: '密度' });
        pl.line(xs.map(x => [x, st.normalPdf(x, 0, 1)]), { color: Pl.colors[0], width: 2 });
        pl.line(xs.map(x => [x, st.normalPdf(x, d, 1)]), { color: Pl.colors[1], width: 2 });
        const aReg = xs.filter(x => x >= zc).map(x => [x, st.normalPdf(x, 0, 1)]);
        if (aReg.length) pl.fillUnder(aReg, { color: '#e4572e', alpha: 0.3 });
        const powReg = xs.filter(x => x >= zc).map(x => [x, st.normalPdf(x, d, 1)]);
        if (powReg.length) pl.fillUnder(powReg, { color: '#2a9d8f', alpha: 0.22 });
        pl.vline(zc, { color: Pl.ink, label: '棄却域の境界（尤度比=c）' });
        const power = 1 - st.normalCdf(zc, d, 1);
        pl.legend([{ label: 'H₀', color: Pl.colors[0] }, { label: 'H₁', color: Pl.colors[1] }]);
        pl.text(4 + d, ymax, '検出力 1−β = ' + (power * 100).toFixed(1) + '%（このαで最大）', { align: 'right', baseline: 'top', dx: -8, dy: 6, color: '#2a9d8f', size: 13 });
      },
    },
  });

  /* --- 尤度比・ワルド・スコア検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'three-tests', title: '尤度比検定・ワルド検定・スコア検定',
    summary: '3つの代表的な検定が、対数尤度曲線上の「高さの差・頂点からの距離・帰無点での傾き」という別々の測り方であることを1枚の図で見比べます。',
    body: `
<p>合成仮説の検定には、尤度に基づく3つの一般的な方法があり、大標本では同じ結論に近づきます。対数尤度曲線 $\\ell(\\theta)$ の上での「測り方」が異なります。</p>
<ul>
<li><strong>尤度比検定 (LR)</strong>：最尤点と帰無点の<strong>高さの差</strong>。$\\ \\lambda=2\\big[\\ell(\\hat\\theta)-\\ell(\\theta_0)\\big]$</li>
<li><strong>ワルド検定 (Wald)</strong>：最尤点 $\\hat\\theta$ から $\\theta_0$ までの<strong>横の距離</strong>を、頂点の曲率で重みづけ。$\\ W=(\\hat\\theta-\\theta_0)^2\\,I(\\hat\\theta)$</li>
<li><strong>スコア検定 (Score, ラグランジュ乗数検定)</strong>：帰無点 $\\theta_0$ での<strong>傾き（スコア）</strong>の大きさ。$\\ U=\\dfrac{\\ell'(\\theta_0)^2}{I(\\theta_0)}$</li>
</ul>
<p>いずれも帰無仮説のもとで自由度1の $\\chi^2$ 分布に漸近します。ワルドは $\\hat\\theta$ だけ、スコアは $\\theta_0$ だけで計算でき（もう一方の当てはめが不要）、尤度比は両方使います。</p>
<h3>複数の制約に一般化する（実務ではこちらが主役）</h3>
<p>ここまでは母数1つ・制約1本の話でしたが、実際には「$\\beta_2=\\beta_3=0$ か」のように<strong>まとめて複数の制約</strong>を検定します。制約の数を $r$ とすると、漸近分布は<strong>自由度 $r$ の $\\chi^2$</strong> になります。</p>
<p>$$ \\lambda_{\\mathrm{LR}}=2\\big[\\ell(\\hat{\\boldsymbol\\theta}_{\\text{フル}})-\\ell(\\hat{\\boldsymbol\\theta}_{\\text{制約}})\\big]\\ \\sim\\ \\chi^2_r,\\qquad
W=(\\hat{\\boldsymbol\\theta}-\\boldsymbol\\theta_0)^\\top I(\\hat{\\boldsymbol\\theta})(\\hat{\\boldsymbol\\theta}-\\boldsymbol\\theta_0)\\ \\sim\\ \\chi^2_r $$</p>
<p>尤度比は「<strong>入れ子になった2つのモデルの対数尤度の差</strong>」という形になり、ここが実務との接点です——ロジスティック回帰やポアソン回帰の出力にある<strong>逸脱度（deviance）の差</strong>がまさにこの $\\lambda_{\\mathrm{LR}}$ で、自由度は落としたパラメータの本数。「変数を2本まとめて落としてよいか」を $\\chi^2_2$ で判定する、というのが日常的な使い方です。ワルドのほうは2次形式（距離を情報量で重みづけた形）になり、$r=1$ なら $(\\hat\\theta-\\theta_0)^2/\\mathrm{SE}^2$ ＝おなじみの $t^2$ に戻ります。</p>
<p><strong>なぜどれも $\\chi^2_1$ になるか</strong>：鍵はスコア $U(\\theta_0)=\\ell'(\\theta_0)$ の性質です。$H_0$ のもとで $E[U]=0$、$\\mathrm{Var}(U)=I(\\theta_0)$（<a href="#/prep1/fisher-cramer-rao">フィッシャー情報量</a>）となり、$U$ は独立な項の和なので中心極限定理で正規に近づく——標準化して2乗すれば $U^2/I(\\theta_0)\\to\\chi^2_1$。これがスコア検定です。さらに対数尤度を頂点 $\\hat\\theta$ のまわりで2次関数（放物線）で近似すると、「高さの差×2」（LR）も「横距離²×曲率」（Wald）も同じ量に化けます。<strong>曲線が放物線に近いほど3つは一致する</strong>——大標本で漸近同値になる理由はこれだけです。</p>
<h3>前提条件と、崩れたときの影響</h3>
<p>$\\chi^2_1$ への漸近は正則条件（真値がパラメータ空間の<strong>内点</strong>にある・情報量が正・モデルが正しい）を前提にします。境界上の検定（例：分散成分 $=0$）では $\\chi^2$ にならず、混合分布になります。小標本では漸近近似そのものが粗く、二項なら正確検定を使うのが安全です。3つの使い分けはトレードオフで整理できます。</p>
<table class="simple">
<tr><th>検定</th><th>必要な当てはめ</th><th>長所</th><th>弱点</th></tr>
<tr><td>尤度比 (LR)</td><td>$\\hat\\theta$ と $\\theta_0$ の両方</td><td>再パラメータ化に不変・小標本でも比較的信頼できる</td><td>両方の最尤推定が必要で計算が重い</td></tr>
<tr><td>ワルド</td><td>$\\hat\\theta$ のみ</td><td>計算が楽（回帰係数の $z$ 検定はこれ）</td><td>再パラメータ化で値が変わる。<a href="#/prep1/logistic">ロジスティック回帰</a>が分離に近いとき、効果が大きいほど統計量が逆に小さくなる非単調性（ハウク・ドナー現象）</td></tr>
<tr><td>スコア</td><td>$\\theta_0$ のみ</td><td>帰無モデルだけで計算できる（$\\chi^2$ 適合度検定はこの系譜）</td><td>対立側の情報を使わないぶん、検出力で劣る場面がある</td></tr>
</table>
<p>迷ったら尤度比、が実務の定石です。ワルドが標準出力に出てくるのは「楽だから」であって「優れているから」ではありません。</p>
<h3>有意性と実質的な意味</h3>
<p>下のデモの初期値（$p_0=0.5,\\ \\hat p=0.65,\\ n=40$）では <strong>Wald $=3.96$ だけが5%棄却域に入り、LR $=3.66$・スコア $=3.60$ は入りません</strong>。同じデータでも検定の選び方で結論が割れる——これが小標本の現実です。この状況で報告すべきは「有意/非有意」の二値ではなく、効果量 $\\hat p-p_0=0.15$ とその信頼区間です。なお信頼区間も検定と対応しており、Wald型区間は $\\hat p$ が0や1に近いと壊れます（スコア型のWilson区間が頑健）。$n$ を増やせば3つの検定は一致していきますが、同時に「無視できる差でも棄却する」ようにもなる——検定の一致と実質的意味は別問題です。</p>
<div class="note">下はベルヌーイ（表確率 $p$）の対数尤度。$\\theta_0$ と標本サイズ $n$ を動かすと、3つの検定統計量が別々の幾何量として値づけされます。$n$ を大きくすると曲線が二次関数に近づき、3つの値がほぼ一致していきます（漸近同値）。逆に $n$ を小さく・$\\hat p$ を端（0.2や0.8）に寄せると曲線が非対称になり、3つの値の差が開きます——「どの検定を使うかが結論を変えうる」領域です。</div>`,
    demo: {
      task: {
        q: '$p_0=0.5$、$\\hat p=0.65$ に固定して $n$ を 10 → 300 と上げてください。ワルド・スコア・尤度比の3統計量の差はどうなりますか。$n$ が小さいとき、どれが最も外れますか。',
        a: '<p>$n$ が大きくなるほど<strong>3つの値は互いに近づきます</strong>（漸近同値）。$n=300$ ではほぼ一致し、結論も当然そろいます。</p><p>$n=10$ のような小標本では3つがはっきり食い違い、<strong>ワルドが最も外れやすい</strong>のが見えるはずです。理由は、ワルドが $\\hat\\theta$ での情報量（＝尤度の曲がり）を使うのに対し、対数尤度がまだ2次関数に似ていないから。しかもワルドは<strong>パラメータの取り方に依存する</strong>（$p$ で計算するか $\\log\\frac{p}{1-p}$ で計算するかで答えが変わる）という弱点があります。</p><p>だから実務では、<strong>小標本や境界付近では尤度比検定を優先</strong>するのが定石です。ソフトの既定がワルド（係数÷標準誤差）であることが多いので、比率が0や1に近いとき・イベント数が少ないときは、尤度比や正確法に切り替える判断が要ります。',
      },
      note: 'LR=頂点と帰無点の高さの差(×2)、Wald=頂点からの横距離²×頂点の曲率、Score=帰無点での傾き²÷情報量。n を増やすと曲線が放物線に近づき3つが一致します。',
      controls: [
        { type: 'range', id: 'p0', label: '帰無値 p₀', min: 0.2, max: 0.8, step: 0.02, value: 0.5 },
        { type: 'range', id: 'phat', label: '観測 p̂ = k/n', min: 0.2, max: 0.8, step: 0.02, value: 0.65 },
        { type: 'range', id: 'n', label: '標本サイズ n', min: 10, max: 300, step: 10, value: 40 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const p0 = p.p0, phat = p.phat, n = Math.round(p.n);
        const k = phat * n;
        const ll = pp => k * Math.log(pp) + (n - k) * Math.log(1 - pp);
        const llmax = ll(phat);
        const ps = st.linspace(0.05, 0.95, 300);
        const pl = Pl.make(canvas, { xmin: 0, xmax: 1, ymin: -20, ymax: 1.5 });
        pl.clear(); pl.axes({ xLabel: '母数 p', yLabel: '対数尤度（相対）' });
        pl.line(ps.map(pp => [pp, Math.max(-20, ll(pp) - llmax)]), { color: Pl.colors[0], width: 2.5 });
        // 頂点・帰無点
        pl.scatter([[phat, 0]], { color: Pl.colors[1], r: 5 });
        pl.scatter([[p0, ll(p0) - llmax]], { color: Pl.ink, r: 5 });
        pl.vline(phat, { color: Pl.colors[1], dash: [4, 3] });
        pl.vline(p0, { color: Pl.ink, dash: [4, 3], label: 'p₀' });
        // スコア＝帰無点での接線
        const score = k / p0 - (n - k) / (1 - p0);
        const tangent = ps.filter(pp => Math.abs(pp - p0) < 0.18).map(pp => [pp, (ll(p0) - llmax) + score * (pp - p0)]);
        pl.line(tangent, { color: Pl.colors[2], width: 2, dash: [2, 2] });
        // 統計量
        const LR = 2 * (llmax - ll(p0));
        const Wald = (phat - p0) * (phat - p0) * n / (phat * (1 - phat));
        const Score = score * score * (p0 * (1 - p0) / n);
        const crit = 3.841; // χ²(1) 5%
        const fmt = v => v.toFixed(2) + (v > crit ? ' ✓棄却' : '');
        pl.text(0, 1.5, '尤度比 LR = ' + fmt(LR), { align: 'left', baseline: 'top', dx: 56, dy: 2, color: Pl.colors[0], size: 12.5 });
        pl.text(0, 1.5, 'ワルド W = ' + fmt(Wald), { align: 'left', baseline: 'top', dx: 56, dy: 22, color: Pl.colors[1], size: 12.5 });
        pl.text(0, 1.5, 'スコア U = ' + fmt(Score), { align: 'left', baseline: 'top', dx: 56, dy: 42, color: Pl.colors[2], size: 12.5 });
        pl.text(1, 1.5, 'χ²(1) 5%点=3.84', { align: 'right', baseline: 'top', dx: -8, dy: 2, color: '#98a2b3', size: 12 });
      },
    },
  });

  /* --- 正規分布に関する検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'normal-tests', title: '正規分布に関する検定（母平均・母分散・2標本・母相関）',
    summary: '「何を検定するか」で使う統計量と分布が決まります。母平均のt、母分散のカイ二乗、等分散のF、母相関の検定を一覧で結びつけます。',
    body: `
<p>正規母集団に関する代表的な検定を整理します。<strong>統計量の形</strong>と<strong>帰無分布</strong>をセットで覚えるのが要点です。</p>
<table class="simple">
<tr><th>検定したいもの</th><th>統計量</th><th>帰無分布</th></tr>
<tr><td>母平均（分散未知）</td><td>$t=\\dfrac{\\bar x-\\mu_0}{s/\\sqrt n}$</td><td>$t_{n-1}$</td></tr>
<tr><td>母分散</td><td>$\\chi^2=\\dfrac{(n-1)s^2}{\\sigma_0^2}$</td><td>$\\chi^2_{n-1}$</td></tr>
<tr><td>2標本の平均差（等分散）</td><td>$t=\\dfrac{\\bar x_1-\\bar x_2}{s_p\\sqrt{1/n_1+1/n_2}}$</td><td>$t_{n_1+n_2-2}$</td></tr>
<tr><td>2標本の平均差（等分散を仮定しない・Welch）</td><td>$t=\\dfrac{\\bar x_1-\\bar x_2}{\\sqrt{s_1^2/n_1+s_2^2/n_2}}$</td><td>$t_\\nu$（$\\nu$ は下の近似式）</td></tr>
<tr><td><strong>対応のある2標本</strong>（前後・同一被験者）</td><td>$t=\\dfrac{\\bar d}{s_d/\\sqrt n}$（$d_i=x_i-y_i$）</td><td>$t_{n-1}$</td></tr>
<tr><td>2標本の分散比（等分散性）</td><td>$F=\\dfrac{s_1^2}{s_2^2}$</td><td>$F_{n_1-1,\\,n_2-1}$</td></tr>
<tr><td>母相関 $\\rho=0$</td><td>$t=\\dfrac{r\\sqrt{n-2}}{\\sqrt{1-r^2}}$</td><td>$t_{n-2}$</td></tr>
</table>
<h3>2標本の検定：まず Welch を選ぶ</h3>
<p>古典的には「まずFで等分散を確認 → 等分散なら合併分散 $s_p$、そうでなければWelch」と教えられます。しかし現在の推奨は<strong>等分散を検定せず、最初からWelchを既定にする</strong>ことです。理由は2つ——(1) 等分散のF検定は正規性に極端に敏感で、それ自体が当てにならない、(2) 「予備検定してから本検定」という2段構えは検定を繰り返す行為なので、全体の第1種の誤り率が名目 $\\alpha$ からずれる。Welch は等分散が実際に成り立つ場合でもほとんど検出力を損なわないので、既定にして損がありません。自由度は次の近似（ウェルチ・サタスウェイト）で求めます。</p>
<p>$$ \\nu=\\frac{\\left(\\dfrac{s_1^2}{n_1}+\\dfrac{s_2^2}{n_2}\\right)^{\\!2}}{\\dfrac{(s_1^2/n_1)^2}{n_1-1}+\\dfrac{(s_2^2/n_2)^2}{n_2-1}} $$</p>
<p><strong>対応の有無は検定の選択を変えます</strong>。同一個体の前後測定のように対になっているなら、差 $d_i$ を取れば個体差が丸ごと消えるので誤差分散が小さくなり、検出力が上がります。逆に、対応があるのに独立2標本の検定を使うと個体差を誤差に含めたまま評価するため、検出力を大きく失います。データの取り方（デザイン）を見て選んでください。</p>
<p>母相関は $r$ をフィッシャーの $z$ 変換 $z=\\tfrac12\\ln\\frac{1+r}{1-r}=\\mathrm{artanh}\\,r$ すると正規近似できます。具体的には $z\\sim\\mathcal N\\!\\left(\\mathrm{artanh}\\,\\rho,\\ \\dfrac{1}{n-3}\\right)$ なので、$z\\pm z_{\\alpha/2}/\\sqrt{n-3}$ で区間を作り、$\\tanh$ で戻せば $\\rho$ の信頼区間になります（例：$r=0.6,\\ n=30$ なら $z=0.693$、$\\pm1.96/\\sqrt{27}=\\pm0.377$ で $[0.316,\\,1.070]$、$\\tanh$ に戻して $[0.306,\\ 0.790]$）。点推定は 0.6 でも区間はこれだけ広い、という感覚が大事です。</p>
<h3>なぜこの形の統計量になるか</h3>
<p>共通の作りは「<strong>推定量の実現値 ÷ その標準誤差</strong>」です。母平均の $t$ は $(\\bar x-\\mu_0)$ を標準誤差 $s/\\sqrt n$ で割ったもの——分散既知なら $z$ になりますが、$\\sigma$ を $s$ で推定した「二重の不確かさ」が分布を正規から $t_{n-1}$（裾が厚い）へ変えます。母分散の統計量が $\\chi^2_{n-1}$ なのは、正規標本で $(n-1)s^2/\\sigma^2$ が定義どおり $\\chi^2_{n-1}$ に従うから（<a href="#/prep1/distributions">標本分布</a>）。$F=s_1^2/s_2^2$ は<strong>2つの独立な $\\chi^2$ を自由度で割った比</strong>そのもので、これが $F$ 分布の定義です。$t$ 分布自身も「正規 ÷ $\\sqrt{\\chi^2/\\text{df}}$」——<strong>正規・$\\chi^2$・$t$・$F$ がすべて正規標本から芋づる式に導かれる</strong>のが、この表が「正規分布に関する検定」でまとまる理由です。</p>
<h3>前提と、崩れたときの影響</h3>
<p>すべて<strong>母集団の正規性</strong>を前提にします。崩れたときの頑健性は検定ごとに大きく違うのが要点——<strong>平均に関する $t$ 検定は比較的頑健</strong>（中心極限定理が効き、$n$ が大きければ非正規でもそこそこ）ですが、<strong>分散に関する $\\chi^2$・$F$ 検定は正規性に極端に敏感</strong>で、裾の重い分布だと名目 $\\alpha$ が大きくずれます（等分散のF検定が信用できないのはこのため。だから等分散性はLeveneやBrown-Forsytheで見る方が安全）。等分散が崩れた2標本比較は合併分散でなく<strong>Welchのt</strong>、正規性が疑わしければ<a href="#/prep1/nonparametric">順位に基づくノンパラメトリック検定</a>へ。母相関の検定は「$\\rho=0$（無相関）」を調べるもので、<a href="#/prep1/correlation">相関は直線関係しか測らない</a>点に注意します。</p>
<div class="note">下は1標本のt検定。標本平均が帰無値 $\\mu_0$ からどれだけ離れているかを $t$ 値にし、$t_{n-1}$ 分布の裾（両側）と比べます。$n$ を小さくするとt分布の裾が厚くなり、同じ隔たりでも有意になりにくくなります。効果量 $\\bar x/s$ が同じでも $n$ で結論が変わる＝有意性はサンプルサイズ依存、という点も確かめてください。</div>`,
    demo: {
      task: {
        q: '$\\bar x=0.6$ に固定したまま、$n$ を10→40にした場合と、$s$ を1.5→0.5にした場合を比べてください。$t$ 値はそれぞれいくつになりますか。どちらが効きますか。',
        a: '<p>$t=\\dfrac{\\bar x}{s/\\sqrt n}$ なので：</p><ul><li>$n=10,\\ s=1.5$ → $t=\\mathbf{1.27}$（非有意）</li><li>$n=40,\\ s=1.5$ → $t=\\mathbf{2.53}$（有意）……$n$ を4倍にして $t$ は2倍</li><li>$n=10,\\ s=0.5$ → $t=\\mathbf{3.79}$（有意）……$s$ を1/3にして $t$ は3倍</li></ul><p><strong>$s$ のほうがはるかに効きます</strong>。$t\\propto\\sqrt n$ に対して $t\\propto1/s$ ——$n$ は平方根でしか効かないのに、$s$ は逆数でまるごと効く。$n$ を4倍にする労力と、測定のばらつきを1/3にする労力を比べれば、後者が現実的なことも多いはずです。</p><p>実験計画の言葉でいえば、<strong>「反復を増やす」より「測定精度を上げる・局所管理でノイズを括り出す」ほうが安上がり</strong>ということ。<a href="#/prep1/blocking-designs">ブロック化</a>が効くのはまさにこの理屈で、誤差分散を下げれば同じ効果でも $t$（や $F$）が大きくなります。',
      },
      note: 'n が小さいとt分布の裾が厚く棄却域が外側に広がる＝有意になりにくい。標本平均の位置(x̄)を帰無値から離すとt値が大きくなり、両側の棄却域(赤)に入ると有意です。',
      controls: [
        { type: 'range', id: 'xbar', label: '標本平均 x̄（μ₀=0）', min: -1.5, max: 1.5, step: 0.05, value: 0.6 },
        { type: 'range', id: 'n', label: '標本サイズ n', min: 3, max: 40, step: 1, value: 10 },
        { type: 'range', id: 's', label: '標本標準偏差 s', min: 0.5, max: 3, step: 0.1, value: 1.5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const n = Math.round(p.n), df = n - 1;
        const tval = p.xbar / (p.s / Math.sqrt(n));
        const tcrit = (() => { let lo = 0, hi = 30; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (st.tCdf(m, df) < 0.975) lo = m; else hi = m; } return (lo + hi) / 2; })();
        const xs = st.linspace(-5, 5, 300);
        const pl = Pl.make(canvas, { xmin: -5, xmax: 5, ymin: 0, ymax: 0.42 });
        pl.clear(); pl.axes({ xLabel: 't 値', yLabel: '密度' });
        pl.line(xs.map(x => [x, st.tPdf(x, df)]), { color: Pl.colors[0], width: 2 });
        const rt = xs.filter(x => x >= tcrit).map(x => [x, st.tPdf(x, df)]);
        const lt = xs.filter(x => x <= -tcrit).map(x => [x, st.tPdf(x, df)]);
        if (rt.length) pl.fillUnder(rt, { color: '#e4572e', alpha: 0.3 });
        if (lt.length) pl.fillUnder(lt, { color: '#e4572e', alpha: 0.3 });
        pl.vline(tval, { color: Pl.ink, width: 2, label: 't=' + tval.toFixed(2) });
        const pval = 2 * (1 - st.tCdf(Math.abs(tval), df));
        pl.text(-5, 0.42, '自由度 ' + df + '　両側5%棄却限界 ±' + tcrit.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 2, color: '#475467', size: 12.5 });
        pl.text(-5, 0.42, 'p値 = ' + (pval < 0.001 ? '<0.001' : pval.toFixed(3)) + (pval < 0.05 ? ' ✓有意' : ' 有意でない'), { align: 'left', baseline: 'top', dx: 56, dy: 22, color: pval < 0.05 ? '#2a9d8f' : '#98a2b3', size: 12.5 });
      },
    },
  });

  /* --- 適合度検定 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'goodness-of-fit', title: '適合度検定（カイ二乗）',
    summary: '観測度数が「ある理論分布」から出たといえるか——観測と期待のズレを二乗して足し上げるカイ二乗適合度検定を、棒の食い違いで見ます。',
    body: `
<p>サイコロが公平か、遺伝比が3:1か——のように、観測度数が理論分布に従うかを調べるのが<strong>適合度検定</strong>です。カテゴリ $i$ の観測度数 $O_i$ と期待度数 $E_i=n\\,p_i$ のズレを合計します。</p>
<p>$$ \\chi^2=\\sum_{i}\\frac{(O_i-E_i)^2}{E_i}\\ \\sim\\ \\chi^2_{k-1-m} $$</p>
<p>自由度はカテゴリ数 $k$ から1を引き、さらに推定したパラメータ数 $m$ を引きます。$\\chi^2$ が大きい＝観測と理論が食い違う＝帰無仮説「理論分布に従う」を棄却。</p>
<h3>なぜ $(O-E)^2/E$ を足すと $\\chi^2$ になるか</h3>
<p>各セルの観測度数 $O_i$ は、$n$ 回中そのカテゴリに入る回数なので二項分布 $\\mathrm{Bin}(n,p_i)$ に従い、$n$ が大きいと<a href="#/prep1/normal-approx">正規近似</a>できます。$E_i$ で割るのは「期待度数が大きいセルほどズレも大きくて当然」だから相対化している、と読めます。</p>
<p>ただし、ここは<strong>各セルを独立に扱ってはいけない</strong>点が急所です。$\\mathrm{Var}(O_i)=E_i(1-p_i)$ であって $E_i$ ではなく、しかもセル度数の合計は必ず $n$ に固定されているので、セルどうしには負の相関 $\\mathrm{Cov}(O_i,O_j)=-np_ip_j$ があります（どこかが増えれば別のどこかが減る）。この「分散が $E_i$ より小さいぶん」と「負の相関」がちょうど打ち消し合い、和をとった $\\sum(O_i-E_i)^2/E_i$ は自由度 $k$ ではなく<strong>自由度 $k-1$ の $\\chi^2$</strong> に従います。合計が固定という制約1本ぶん、自由度が1減るわけです。パラメータを $m$ 個推定するとさらに $m$ 減ります。</p>
<p><strong>$k=2$ で確かめる</strong>：カテゴリが2つなら $O_2-E_2=-(O_1-E_1)$ なので、</p>
<p>$$ \\chi^2=\\frac{(O_1-E_1)^2}{E_1}+\\frac{(O_1-E_1)^2}{E_2}=(O_1-E_1)^2\\frac{E_1+E_2}{E_1E_2}=\\frac{(O_1-np)^2}{np(1-p)}=z^2 $$</p>
<p>と、母比率の $z$ 検定の2乗にぴったり一致します。自由度1（＝標準正規1個の2乗）である理由が、制約1本という形で目に見えます。</p>
<h3>前提と、崩れたときの注意</h3>
<p>これは<strong>大標本の近似</strong>で、成立の目安が有名な<strong>「各期待度数 $E_i\\ge5$」</strong>——小さい $E_i$ のセルでは正規近似が破れ、$\\chi^2$ 統計量が本来の分布からずれて $p$ 値が信用できません（隣接セルを<strong>併合</strong>するか、後述の正確検定へ）。他の注意：<strong>(1) 度数（カウント）に使う検定で、割合や平均に直接使ってはいけない</strong>。<strong>(2) 観測は独立</strong>（同じ個体を重複カウントしない）。代替として、少数セルには<strong>フィッシャーの正確検定</strong>、尤度比版の<strong>G検定</strong>（$G=2\\sum O\\ln(O/E)$、同じく $\\chi^2$ に漸近）があります。$\\chi^2$ は<strong>順序情報を捨てる</strong>ので、順序カテゴリ（不満〜満足など）では傾向を見るコクラン・アーミテージ検定の方が検出力が高い場合があります。</p>
<div class="note">下でサイコロ（6面）の観測度数を「ゆがみ」スライダーで偏らせると、期待度数（点線）からのズレが $\\chi^2$ に反映されます。$n$ を小さくすると各期待度数 $n/6$ が5を下回り、近似が粗くなる領域に入ります（少ないセルは併合が必要）。</div>`,
    demo: {
      task: {
        q: 'ゆがみを0にしたまま試行回数 $n$ を30から600へ上げると、$\\chi^2$ 値と $p$ 値はどう振る舞いますか。次にゆがみを0.4に固定して $n$ を上げると何が起きますか。',
        a: '<p><strong>ゆがみ0のとき</strong>：$n$ を増やしても $\\chi^2$ は<strong>特に大きくなりません</strong>（自由度5の分布のまわりを上下するだけ、期待値5）。$p$ 値も一様にばらつき、系統的に小さくはなりません。帰無仮説が正しいときは、データを増やしても棄却されない——これが正しい振る舞いです。</p><p><strong>ゆがみ0.4のとき</strong>：$\\chi^2$ は $n$ にほぼ<strong>比例して</strong>増え、$p$ 値は急速に0へ向かいます。$n=30$ では非有意でも、$n=600$ ではほぼ確実に棄却されます。</p><p>この対比が検定の本質です。<strong>$\\chi^2$ は「ズレの大きさ × 標本サイズ」</strong>で決まるので、$n$ を増やせば<em>どんなに小さなズレでも</em>いずれ有意になります。だから「有意だった」だけでは不十分で、<strong>ゆがみが実質的に問題になる大きさか</strong>を効果量（クラメールのVなど）で見る必要があります。',
      },
      note: 'ゆがみ0なら観測≈期待でχ²は小さくp値大（公平と言える）。ゆがみを強めると特定の目が増え、χ²が跳ね上がりp値が下がって「公平でない」と判定されます。',
      controls: [
        { type: 'range', id: 'bias', label: 'サイコロのゆがみ', min: 0, max: 1, step: 0.05, value: 0.4 },
        { type: 'range', id: 'n', label: '試行回数 n', min: 30, max: 600, step: 30, value: 120 },
        { type: 'button', id: 'reseed', label: '振り直す' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(11 + (p.reseed | 0) * 47);
        const n = Math.round(p.n), bias = p.bias;
        // 偏った確率（6の目が出やすい）
        const probs = [];
        let sum = 0;
        for (let i = 0; i < 6; i++) { const w = 1 + bias * (i / 5) * 3; probs.push(w); sum += w; }
        for (let i = 0; i < 6; i++) probs[i] /= sum;
        const O = [0, 0, 0, 0, 0, 0];
        for (let t = 0; t < n; t++) {
          let r = rand(), c = 0;
          for (let i = 0; i < 6; i++) { c += probs[i]; if (r <= c) { O[i]++; break; } }
        }
        const E = n / 6;
        let chi = 0; for (let i = 0; i < 6; i++) chi += (O[i] - E) ** 2 / E;
        const pval = 1 - st.chi2Cdf(chi, 5);
        const ymax = Math.max(Math.max.apply(null, O), E) * 1.25;
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: 6.7, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '出た目', yLabel: '度数', xTicks: [1, 2, 3, 4, 5, 6] });
        for (let i = 0; i < 6; i++) pl.bars([{ x0: i + 1 - 0.35, x1: i + 1 + 0.35, y: O[i] }], { color: Pl.colors[0], alpha: 0.75 });
        pl.hline(E, { color: Pl.colors[1], label: '期待度数 n/6=' + E.toFixed(1) });
        pl.text(0.3, ymax, 'χ² = ' + chi.toFixed(2) + '（自由度5）', { align: 'left', baseline: 'top', dx: 56, dy: 2, color: Pl.ink, size: 13 });
        pl.text(0.3, ymax, 'p = ' + (pval < 0.001 ? '<0.001' : pval.toFixed(3)) + (pval < 0.05 ? ' ✓公平でない' : ' 公平と矛盾せず'), { align: 'left', baseline: 'top', dx: 56, dy: 22, color: pval < 0.05 ? '#e4572e' : '#2a9d8f', size: 12.5 });
      },
    },
  });

  /* --- 多重比較 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'multiple-comparison', title: '多重比較の問題',
    summary: '検定を何度も繰り返すと「偶然の有意」が積み上がる——ファミリーワイズ誤り率の膨張と、ボンフェローニ補正の効き目を体感します。',
    body: `
<p>1回の検定なら第1種の誤りは $\\alpha$。しかし独立な検定を $m$ 回行うと、「1回でも誤って棄却する」確率（<strong>ファミリーワイズ誤り率, FWER</strong>）は膨らみます。</p>
<p>$$ \\mathrm{FWER}=1-(1-\\alpha)^m $$</p>
<p>例えば $\\alpha=0.05$ で $m=20$ 回なら $1-0.95^{20}\\approx 0.64$。何も差がなくても6割の確率でどこかが「有意」に見えてしまいます。</p>
<h3>ボンフェローニ補正</h3>
<p>各検定の水準を $\\alpha/m$ に厳しくすれば、$\\mathrm{FWER}\\le\\alpha$ に抑えられます（安全側だが保守的）。より検出力の高い方法にホルム法・テューキー法・FDR制御（ベンジャミニ・ホックバーグ）があります。分散分析の後の対比較で必須の考え方です。</p>
<h3>前提と、手法の使い分け</h3>
<p>$\\mathrm{FWER}=1-(1-\\alpha)^m$ という式は<strong>検定どうしが独立</strong>を仮定しています。実際の多重比較は正の相関を持つことが多く（同じ対照群を使い回すなど）、そのとき真のFWERはこの式より<strong>小さめ</strong>——独立は膨張が最も激しい最悪ケースの目安です。<strong>ボンフェローニ補正は独立性を仮定せず常に $\\mathrm{FWER}\\le\\alpha$ を保証する</strong>強みがありますが、その代償が<strong>保守性</strong>で、$m$ が大きいと $\\alpha/m$ が厳しすぎて本物の差も見逃します（検出力の低下）。ここに手法選択のトレードオフがあります。</p>
<table class="simple">
<tr><th>目的・状況</th><th>方法</th><th>特徴</th></tr>
<tr><td>1件でも偽陽性を絶対に避けたい</td><td>ボンフェローニ／ホルム</td><td>FWER制御。ホルムは段階的でボンフェローニより強力（同じ保証で棄却が増える）</td></tr>
<tr><td>全ペア比較（ANOVA後）</td><td>テューキーHSD</td><td>相関構造を使い、ボンフェローニより高検出力</td></tr>
<tr><td>対照群とだけ比較（ANOVA後）</td><td>ダネット法</td><td>比較数が $k(k-1)/2$ から $k-1$ に減るぶんテューキーより高検出力</td></tr>
<tr><td>探索的・多数の仮説（ゲノム等）</td><td>FDR（ベンジャミニ・ホックバーグ）</td><td>「棄却したうちの偽陽性割合」を抑える。FWERより緩く高検出力</td></tr>
</table>
<h3>ホルム法・BH法の手順</h3>
<p>この2つは名前だけ覚えても使えません。どちらも<strong>$p$ 値を小さい順に並べる</strong>ところから始まります（$p_{(1)}\\le p_{(2)}\\le\\dots\\le p_{(m)}$）。</p>
<ul>
<li><strong>ホルム法（FWER制御）</strong>：$i=1$ から順に $p_{(i)}\\le\\dfrac{\\alpha}{m-i+1}$ を確認し、満たす限り棄却。<strong>最初に破れた時点で停止</strong>し、それ以降はすべて棄却しない。最初の閾値は $\\alpha/m$（ボンフェローニと同じ）ですが、進むほど分母が小さくなり閾値が緩むぶん、ボンフェローニより多く棄却できます。</li>
<li><strong>BH法（FDR制御）</strong>：$p_{(i)}\\le\\dfrac{i}{m}\\alpha$ を満たす<strong>最大の $i$</strong> を探し、$1$ から $i$ 番目までをまとめて棄却。</li>
</ul>
<p><strong>同じデータで比べる</strong>（$m=5$、$\\alpha=0.05$、$p=(0.001,\\ 0.008,\\ 0.02,\\ 0.04,\\ 0.3)$）：</p>
<table class="simple">
<tr><th>$i$</th><th>$p_{(i)}$</th><th>ボンフェローニ $\\alpha/m=0.01$</th><th>ホルム $\\alpha/(m-i+1)$</th><th>BH $\\frac{i}{m}\\alpha$</th></tr>
<tr><td>1</td><td>0.001</td><td>棄却</td><td>0.0100 → 棄却</td><td>0.010 → 満たす</td></tr>
<tr><td>2</td><td>0.008</td><td>棄却</td><td>0.0125 → 棄却</td><td>0.020 → 満たす</td></tr>
<tr><td>3</td><td>0.020</td><td>×</td><td>0.0167 → <strong>ここで停止</strong></td><td>0.030 → 満たす</td></tr>
<tr><td>4</td><td>0.040</td><td>×</td><td>（停止済み）</td><td>0.040 → <strong>満たす（最大の $i$）</strong></td></tr>
<tr><td>5</td><td>0.300</td><td>×</td><td>（停止済み）</td><td>0.050 → 満たさず</td></tr>
</table>
<p>結果は<strong>ボンフェローニ2件・ホルム2件・BH 4件</strong>。BHが最も多く拾えるのは、守っている保証が「1件も間違えない」ではなく「間違いの割合を $\\alpha$ 以下に抑える」という緩いものだからです。ホルムはボンフェローニと同じFWER保証のまま棄却が増えるので、<strong>FWERを守るならボンフェローニよりホルムを使わない理由がありません</strong>。</p>
<p>FWER（1件も間違えない）とFDR（間違いの<em>割合</em>を抑える）は<strong>守る対象が違う</strong>点が肝心——数千の仮説を探索するときFWERは厳しすぎ、FDRが標準です。</p>
<div class="note">下で検定回数 $m$ を増やすと補正なしのFWER（赤）が急上昇する一方、ボンフェローニ補正後（緑）は $\\alpha$ 近くに保たれます。「たくさん検定するほど、基準を厳しくすべき」が視覚的に分かります。$m{=}20,\\alpha{=}5\\%$ で補正なしFWERは64%——何も差がなくても大半が「有意」に見える危険の実感です。</div>`,
    demo: {
      task: {
        q: '検定回数 $m$ を 1 → 5 → 20 → 50 と増やすと、少なくとも1つが誤って有意になる確率（FWER）はどう変わりますか。$m$ をいくつにすると5割を超えますか。',
        a: '<p>$\\mathrm{FWER}=1-(1-0.05)^m$ なので <strong>5.0% → 22.6% → 64.2% → 92.3%</strong>。<strong>$m=14$ で50%を超えます</strong>（$1-0.95^{14}=0.512$）。</p><p>14回——探索的な解析ではあっという間に届く数字です。「何も差がないのに、どこかが有意に見える」のがコイントスより起こりやすくなる。増え方が線形でなく<strong>指数的に1へ飽和する</strong>ことも確かめてください。$m=50$ では92%、つまりほぼ確実にどこかが「有意」になります。だから補正するのであって、補正は「厳しすぎる嫌がらせ」ではありません。',
      },
      note: '補正なしは m とともにFWERが1へ近づく（偽陽性だらけ）。ボンフェローニはα/mに絞ることで全体の誤りをα以下に維持。検定回数が多いほど補正の重要性が増します。',
      controls: [
        { type: 'range', id: 'm', label: '検定の回数 m', min: 1, max: 50, step: 1, value: 20 },
        { type: 'range', id: 'alpha', label: '各検定の α (%)', min: 1, max: 10, step: 1, value: 5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const alpha = p.alpha / 100, M = Math.round(p.m);
        const ms = [];
        for (let m = 1; m <= 50; m++) ms.push(m);
        const uncorr = ms.map(m => [m, 1 - Math.pow(1 - alpha, m)]);
        const bonf = ms.map(m => [m, 1 - Math.pow(1 - alpha / m, m)]);
        const pl = Pl.make(canvas, { xmin: 1, xmax: 50, ymin: 0, ymax: 1 });
        pl.clear(); pl.axes({ xLabel: '検定回数 m', yLabel: 'FWER（1回以上誤る確率）' });
        pl.line(uncorr, { color: Pl.colors[1], width: 2.5 });
        pl.line(bonf, { color: Pl.colors[2], width: 2.5 });
        pl.hline(alpha, { color: Pl.gray, label: '目標 α=' + (alpha * 100).toFixed(0) + '%' });
        pl.vline(M, { color: Pl.ink, dash: [4, 3] });
        pl.legend([{ label: '補正なし', color: Pl.colors[1] }, { label: 'ボンフェローニ補正', color: Pl.colors[2] }]);
        const f1 = 1 - Math.pow(1 - alpha, M);
        pl.text(50, 1, 'm=' + M + ' で補正なしFWER=' + (f1 * 100).toFixed(0) + '%', { align: 'right', baseline: 'top', dx: -8, dy: 4, color: Pl.colors[1], size: 12.5 });
      },
    },
  });

  /* --- サンプルサイズ設計 --- */
  T.push({
    section: 'prep1', group: '検定', id: 'sample-size', title: 'サンプルサイズの設計（検出力から n を決める）',
    summary: '「どれだけの差を、どれだけの確からしさで検出したいか」から必要な標本数を逆算する——研究計画の核を可視化します。',
    body: `
<p>検定を計画するとき、$\\alpha$（第1種の誤り）と目標<strong>検出力</strong> $1-\\beta$、検出したい<strong>効果量</strong> $d=(\\mu_1-\\mu_0)/\\sigma$ を決めると、必要な標本数が逆算できます（1標本・両側 $z$ 検定の近似）。</p>
<p>$$ n\\ \\approx\\ \\left(\\frac{z_{1-\\alpha/2}+z_{1-\\beta}}{d}\\right)^2 $$</p>
<h3>2群を比べるときは各群にこの2倍が要る</h3>
<p>上の式は<strong>1標本</strong>用です。実務や試験で多いのは「処置群と対照群を比べる」2群比較で、こちらは<strong>各群</strong>に次の数が必要です。</p>
<p>$$ n_{\\text{各群}}\\ \\approx\\ \\frac{2\\left(z_{1-\\alpha/2}+z_{1-\\beta}\\right)^2}{d^2} $$</p>
<p>係数 2 が付くのは、比べる量が2つの平均の<strong>差</strong>で、その標準誤差が $\\sigma\\sqrt{1/n+1/n}=\\sigma\\sqrt{2/n}$ と $\\sqrt2$ 倍に膨らむからです。$d=0.5$、両側 $\\alpha=0.05$、検出力 80% で計算すると、1標本なら $n\\approx32$ ですが、2群比較では<strong>各群 $n\\approx63$（合計126）</strong>——1標本の式をそのまま流用すると必要数を半分以下に見誤ることになります（$t$ 検定に基づく正確な計算では各群64。上の式は正規近似なので1〜2名少なく出ます）。</p>
<p>効果量 $d$ の置き方に迷ったら、Cohen の慣用的な目安（$d=0.2$ 小・$0.5$ 中・$0.8$ 大）が出発点になります。両側5%・検出力80%の1標本なら、それぞれ必要 $n$ はおよそ 197／32／13。ただしこの目安は分野を問わない便宜的なもので、可能なら「実質的に意味のある最小の差」から決めるべきです。</p>
<p>読み取れること：<strong>効果量が半分になると必要 $n$ は約4倍</strong>（$d^2$ に反比例）。小さな差を確実に捉えるには、たくさんのサンプルが要ります。検出力を上げる・$\\alpha$ を厳しくするほど $n$ は増えます。</p>
<h3>なぜこの式になるか</h3>
<p>棄却は「標準化した統計量 $Z=\\sqrt n\\,\\bar X/\\sigma$ が臨界値 $z_{1-\\alpha/2}$ を超える」こと。真の効果があると $Z$ の中心は $d\\sqrt n$ ずれます（<a href="#/prep1/normal-approx">非心</a>）。検出力を $1-\\beta$ にするには、この山が臨界値を $z_{1-\\beta}$ 分だけ上回ればよく、$d\\sqrt n=z_{1-\\alpha/2}+z_{1-\\beta}$。$n$ について解くと上の式です。要は<strong>「効果のシグナル $d\\sqrt n$」が「$\\alpha$ と $\\beta$ が要求する余裕」を超えるだけの $n$ を確保する</strong>という話——数値でも $d{=}0.5$ で $n\\approx31$、$d{=}0.25$ で $n\\approx126$（ちょうど4倍）を確認できます。</p>
<h3>前提と、崩れたときの注意</h3>
<p>この近似は<strong>$\\sigma$ 既知・正規・1標本 $z$ 検定</strong>が前提です。実務では $\\sigma$ が未知で $t$ 検定になるため、自由度を見込んで数名多めに取る（あるいは反復計算する）のが普通。最大の弱点は<strong>効果量 $d$ を事前に決め打ちする</strong>点で、$n\\propto1/d^2$ ゆえ $d$ の見積もりが甘いと必要数が桁で変わります——過去研究やパイロット試験、あるいは「これ以下なら実質的に無意味」という<strong>最小重要差</strong>から $d$ を置くのが誠実なやり方です。<strong>事後に「検出力が足りなかった」と観測データから計算する事後検出力（observed power）はほぼ無意味</strong>（p値と1対1で情報がない）——検出力分析は必ず<strong>研究の前に</strong>行います。効果量の設定自体が結論を左右するので、$n$ を1つの数字で出さず $d$ を振った表で示すのが実務的です。</p>
<div class="note">下で効果量と目標検出力を動かすと、必要な $n$ が計算され、その $n$ での帰無分布・対立分布の重なり（達成される検出力）が描かれます。効果量を小さくすると必要 $n$ が急増（$1/d^2$）するのを体感してください。</div>`,
    demo: {
      task: {
        q: '効果量 $d$ を 0.5 から 0.25（半分）に下げると、必要な標本数は何倍になりますか。また $d=0.5$ のまま検出力を80%から99%に上げると何倍ですか。',
        a: '<p>$d$ を半分にすると <strong>32 → 126 でおよそ4倍</strong>。式が $n\\propto1/d^2$ なので、効果量が半分なら必要数は2乗で効いて4倍です。<strong>「念のため小さい差も拾えるように」と $d$ を下げると、実験規模が一気に非現実的になります</strong>。</p><p>検出力を80%→99%に上げると <strong>32 → 74 で約2.3倍</strong>。こちらは $(z_{1-\\alpha/2}+z_{1-\\beta})^2$ の $z_{1-\\beta}$ が $0.84\\to2.33$ と増えるためで、最後の数ポイントが高くつくのが分かります。<strong>効果量のほうが検出力よりはるかに効く</strong>——だから「検出したい差」を現実的に決めることが、標本設計で最初にやるべき仕事です。',
      },
      note: '効果量 d を下げると必要 n が二次的に跳ね上がる。目標検出力(power)を上げても n は増える。下の2つの山は、算出した n における帰無(青)と対立(橙)の検定統計量分布です。',
      controls: [
        { type: 'range', id: 'd', label: '効果量 d = (μ₁−μ₀)/σ', min: 0.1, max: 1.5, step: 0.05, value: 0.5 },
        { type: 'range', id: 'power', label: '目標検出力 (%)', min: 50, max: 99, step: 1, value: 80 },
        { type: 'range', id: 'alpha', label: '有意水準 α (%)', min: 1, max: 10, step: 1, value: 5 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const d = p.d, power = p.power / 100, alpha = p.alpha / 100;
        const za = st.normalInv(1 - alpha / 2), zb = st.normalInv(power);
        const n = Math.ceil(Math.pow((za + zb) / d, 2));
        // n における非心（対立平均は d√n）
        const ncp = d * Math.sqrt(n);
        const xs = st.linspace(-4, ncp + 4, 320);
        const ymax = 0.45;
        const pl = Pl.make(canvas, { xmin: -4, xmax: ncp + 4, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: '検定統計量 Z', yLabel: '密度' });
        pl.line(xs.map(x => [x, st.normalPdf(x, 0, 1)]), { color: Pl.colors[0], width: 2 });
        pl.line(xs.map(x => [x, st.normalPdf(x, ncp, 1)]), { color: Pl.colors[1], width: 2 });
        const zc = za;
        const powReg = xs.filter(x => x >= zc).map(x => [x, st.normalPdf(x, ncp, 1)]);
        if (powReg.length) pl.fillUnder(powReg, { color: '#2a9d8f', alpha: 0.22 });
        pl.vline(zc, { color: Pl.ink, dash: [4, 3], label: '棄却限界' });
        pl.legend([{ label: 'H₀', color: Pl.colors[0] }, { label: 'H₁ (μ₁)', color: Pl.colors[1] }]);
        pl.text(-4, ymax, '必要な標本数 n ≈ ' + n, { align: 'left', baseline: 'top', dx: 56, dy: 2, color: Pl.ink, size: 14 });
        pl.text(-4, ymax, 'このnで達成する検出力 ≈ ' + (power * 100).toFixed(0) + '%', { align: 'left', baseline: 'top', dx: 56, dy: 24, color: '#2a9d8f', size: 12.5 });
      },
    },
  });

})();
