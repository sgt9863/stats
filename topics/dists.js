'use strict';
/* 種々の確率分布（離散型・連続型ギャラリーと多変量正規） */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  // 対数二項係数
  function logC(n, k) {
    const st = S();
    if (k < 0 || k > n) return -Infinity;
    return st.lgamma(n + 1) - st.lgamma(k + 1) - st.lgamma(n - k + 1);
  }

  /* --- 離散型分布ギャラリー --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'discrete-distributions', title: '離散型分布ギャラリー',
    summary: 'ベルヌーイ・二項・超幾何・ポアソン・幾何・負の二項・多項——「何を数えているか」で分布を選び分けられるようになります。',
    body: `
<p>離散分布は「回数・個数」を数える確率変数の分布です。どれも<strong>試行の設定の違い</strong>から生まれます。</p>
<table class="simple">
<tr><th>分布</th><th>数えるもの</th><th>確率関数 $P(X=k)$</th><th>平均</th><th>分散</th></tr>
<tr><td>ベルヌーイ $\\mathrm{Bern}(p)$</td><td>1回の成功(1)/失敗(0)</td><td>$p^k(1-p)^{1-k}$</td><td>$p$</td><td>$p(1-p)$</td></tr>
<tr><td>二項 $\\mathrm{Bin}(n,p)$</td><td>独立 $n$ 回中の成功数</td><td>$\\dbinom{n}{k}p^k(1-p)^{n-k}$</td><td>$np$</td><td>$np(1-p)$</td></tr>
<tr><td>超幾何</td><td>非復元抽出での成功数</td><td>$\\dfrac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}$</td><td>$n\\frac{K}{N}$</td><td>$n\\frac{K}{N}\\frac{N-K}{N}\\frac{N-n}{N-1}$</td></tr>
<tr><td>ポアソン $\\mathrm{Po}(\\lambda)$</td><td>単位時間のまれな事象数</td><td>$\\dfrac{e^{-\\lambda}\\lambda^k}{k!}$</td><td>$\\lambda$</td><td>$\\lambda$</td></tr>
<tr><td>幾何 $\\mathrm{Geo}(p)$</td><td>初成功までの試行回数（$k\\ge1$）</td><td>$(1-p)^{k-1}p$</td><td>$1/p$</td><td>$(1-p)/p^2$</td></tr>
<tr><td>負の二項 $\\mathrm{NB}(r,p)$</td><td>$r$ 回成功するまでの失敗数（$k\\ge0$）</td><td>$\\dbinom{k+r-1}{k}p^r(1-p)^k$</td><td>$r(1-p)/p$</td><td>$r(1-p)/p^2$</td></tr>
<tr><td>離散一様 $\\{1,\\dots,K\\}$</td><td>どの目も等確率</td><td>$1/K$</td><td>$\\frac{K+1}{2}$</td><td>$\\frac{K^2-1}{12}$</td></tr>
<tr><td>多項 $\\mathrm{Mult}(n,\\boldsymbol p)$</td><td>$m$ カテゴリへの振り分け</td><td>$\\dfrac{n!}{k_1!\\cdots k_m!}p_1^{k_1}\\cdots p_m^{k_m}$</td><td>$np_i$</td><td>$np_i(1-p_i)$</td></tr>
</table>
<p>確率関数はどれも「<strong>何回成功 × 何回失敗 × その並べ方の数</strong>」の3因子でできています。二項の $\\binom{n}{k}$ は「$n$ 回のうちどこで成功したか」の場合の数、幾何に係数が付かないのは「最後が成功」と並びが1通りに決まるから、と読めば暗記せず再構成できます。</p>
<p><strong>二項 vs 超幾何</strong>：くじを引くとき「戻す」なら二項、「戻さない」なら超幾何。$N$ が大きいと両者はほぼ一致します。<br>
<strong>二項 vs ポアソン</strong>：$n$ 大・$p$ 小の極限が $\\mathrm{Po}(np)$。ポアソンは平均＝分散が特徴。<br>
<strong>離散一様</strong>：連続一様の $(b-a)^2/12$ の離散版。サイコロ（$K=6$）なら平均 3.5、分散 $35/12\\approx2.92$。</p>
<h3>幾何分布と負の二項分布：2つの流儀に注意</h3>
<p>この2つは<strong>教科書によって定義が違う</strong>ので、式を突き合わせるときは必ず流儀を確認してください。</p>
<ul>
<li><strong>試行回数版</strong>：初成功までに<strong>何回試したか</strong>（$k\\ge1$、平均 $1/p$）。本サイトの幾何はこちら。</li>
<li><strong>失敗数版</strong>：初成功までに<strong>何回失敗したか</strong>（$k\\ge0$、平均 $(1-p)/p$）。本サイトの負の二項（$r$ 回成功までの失敗数）はこちら。</li>
</ul>
<p>両者は $k$ を1ずらしただけで、分散はどちらも $(1-p)/p^2$ で同じです。したがって「幾何は負の二項の $r=1$ の場合」という対応が成り立つのは<strong>同じ流儀どうしで比べたとき</strong>——本サイトの負の二項で $r=1$ とすると平均 $(1-p)/p$ の<strong>失敗数版</strong>の幾何になり、表の幾何（$1/p$）とは1だけずれます。試験では問題文が「回数」を数えているのか「失敗数」を数えているのかを読み取るのが第一歩です。</p>
<h3>多項分布：カテゴリが3つ以上のとき</h3>
<p>二項の一般化で、$n$ 個を $m$ 個のカテゴリに振り分けたときの内訳 $(k_1,\\dots,k_m)$ の分布です。押さえるべき性質が2つあります。</p>
<ul>
<li><strong>周辺分布は二項</strong>：1つのカテゴリだけ見れば「そこに入るか否か」なので $X_i\\sim\\mathrm{Bin}(n,p_i)$。</li>
<li><strong>成分どうしは負の相関</strong>：$\\mathrm{Cov}(X_i,X_j)=-np_ip_j$。合計が $n$ に固定されているので、どこかが増えれば別のどこかは必ず減ります。</li>
</ul>
<p>この負の相関は飾りではなく、<a href="#/prep1/goodness-of-fit">適合度検定</a>の自由度が $k$ ではなく $k-1$ になる理由そのものです。<a href="#/prep1/contingency">分割表</a>の土台でもあります。</p>
<h3>なぜその平均・分散になるか</h3>
<p>二項は独立なベルヌーイ試行の和 $X=\\sum B_i$ なので、期待値と分散が<strong>そのまま足し算</strong>で $E=np$、$V=np(1-p)$（独立ゆえ共分散項なし）。ポアソンは<strong>二項の極限</strong>——$n\\to\\infty,\\ p\\to0$ を $np=\\lambda$ 一定で取ると $\\mathrm{Bin}(n,\\lambda/n)\\to\\mathrm{Po}(\\lambda)$（数値でも $P(X{=}2)$ が $n{=}10$ の0.234 → $n{=}1000$ の0.224 と収束）。極限で $V=np(1-p)\\to\\lambda(1-0)=\\lambda=E$ となり、<strong>ポアソンの「平均＝分散」はこの極限の名残</strong>です。幾何分布の無記憶性——「すでに $k$ 回失敗しても、次に成功するまでの分布は最初と同じ」——は離散版の指数分布にあたります。</p>
<h3>分布の選択が仮定になっている（崩れたときの注意）</h3>
<p>分布を選ぶことは、暗黙に<strong>データ生成の仮定を置く</strong>ことです。<strong>二項</strong>は「各試行が独立・成功確率 $p$ が一定」を仮定——学習効果や伝染で $p$ が変動すると当てはまりません。<strong>ポアソン</strong>は「一定強度・独立・同時に2件起きない」を仮定し、その帰結が $V=E$。ところが現実のカウントデータは<strong>過分散（$V>E$）</strong>がむしろ普通で（事象が群れる・個体差がある）、ポアソンを当てると標準誤差を過小評価し偽陽性が増えます→<strong>負の二項分布</strong>（ポアソンの $\\lambda$ 自体がガンマ分布で揺れるモデル）で対処します。<strong>超幾何 vs 二項</strong>は復元の有無で、母集団 $N$ が標本に対して大きければ有限母集団修正 $\\frac{N-n}{N-1}\\to1$ で二項に一致します。カウントを見たらまず「$V$ と $E$ の比」を確認するのが実務の第一歩です。</p>
<div class="note">下で分布を切り替え、パラメータを動かしてください。グラフ上部に「今のパラメータの意味と平均・分散」が表示されます。ポアソンで山の位置（平均）と広がり（分散）が連動するのは $V=E$ だから——過分散データはこの連動から外れます。</div>`,
    demo: {
      task: {
        q: '分布を「ポアソン」にしてパラメータ①（λ）を1 → 15 と上げてください。形はどう変わりますか。次に「二項」でパラメータ①(n)を30、②(p)を小さめにして、ポアソンと重ねて比べてください。',
        a: '<p>ポアソンは $\\lambda$ が小さいと<strong>0付近に張り付いた強い右歪み</strong>ですが、$\\lambda$ を15まで上げると<strong>対称な釣鐘型</strong>に近づきます。歪度が $1/\\sqrt\\lambda$ なので、$\\lambda=1$ で1.0、$\\lambda=15$ で0.26まで下がるためです。</p><p>二項で $n$ を大きく $p$ を小さくすると、$\\mathrm{Po}(np)$ とほとんど重なります。これが<strong>ポアソンの少数の法則</strong>——$n\\to\\infty$、$p\\to0$、$np=\\lambda$ 一定の極限がポアソンです。</p><p>見分け方は<strong>平均と分散の関係</strong>。二項は $np(1-p)<np$ で分散が平均より<em>小さい</em>、ポアソンは平均＝分散。$p$ が小さいと $(1-p)\\approx1$ で両者が一致します。実データで平均より分散が<strong>大きい</strong>なら、どちらでもなく過分散——負の二項分布を検討する合図です。',
      },
      note: 'ポアソンは平均=分散なので λ を上げると山が右へ広がる。幾何は必ず右下がり。超幾何は母集団N=50固定で、非復元のぶん二項より分散がやや小さくなります。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 'binom', options: [
          { value: 'uniform', label: '離散一様' },
          { value: 'bernoulli', label: 'ベルヌーイ' },
          { value: 'binom', label: '二項' },
          { value: 'hyper', label: '超幾何 (N=50)' },
          { value: 'poisson', label: 'ポアソン' },
          { value: 'geom', label: '幾何' },
          { value: 'negbinom', label: '負の二項' },
          { value: 'multinom', label: '多項 (3カテゴリ)' },
        ]},
        { type: 'range', id: 'a', label: 'パラメータ①', min: 1, max: 30, step: 1, value: 15 },
        { type: 'range', id: 'b', label: 'パラメータ②', min: 1, max: 30, step: 1, value: 12 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = Math.round(p.a), b = Math.round(p.b);
        let kmax = 20, items = [], label = '', mean = 0, varr = 0;
        const prob = Math.min(0.95, Math.max(0.05, b / 30));
        if (p.dist === 'uniform') {
          const K = a; kmax = K;
          for (let k = 1; k <= K; k++) items.push({ k, pr: 1 / K });
          mean = (K + 1) / 2; varr = (K * K - 1) / 12; label = '離散一様{1..' + K + '}';
        } else if (p.dist === 'bernoulli') {
          kmax = 1; items = [{ k: 0, pr: 1 - prob }, { k: 1, pr: prob }];
          mean = prob; varr = prob * (1 - prob); label = 'Bern(p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'binom') {
          const n = a; kmax = n;
          for (let k = 0; k <= n; k++) items.push({ k, pr: st.binomPmf(k, n, prob) });
          mean = n * prob; varr = n * prob * (1 - prob); label = 'Bin(n=' + n + ', p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'hyper') {
          const N = 50, K = Math.min(N, a), n = Math.min(N, b); kmax = Math.min(n, K);
          for (let k = 0; k <= Math.min(n, K); k++) {
            const lp = logC(K, k) + logC(N - K, n - k) - logC(N, n);
            items.push({ k, pr: Math.exp(lp) });
          }
          mean = n * K / N; varr = n * (K / N) * (1 - K / N) * (N - n) / (N - 1);
          label = '超幾何(N=50, K=' + K + ', n=' + n + ')';
        } else if (p.dist === 'poisson') {
          const lam = a; kmax = Math.max(12, Math.round(lam * 2 + 6));
          for (let k = 0; k <= kmax; k++) items.push({ k, pr: st.poissonPmf(k, lam) });
          mean = lam; varr = lam; label = 'Po(λ=' + lam + ')';
        } else if (p.dist === 'geom') {
          kmax = Math.max(10, Math.round(3 / prob));
          for (let k = 1; k <= kmax; k++) items.push({ k, pr: Math.pow(1 - prob, k - 1) * prob });
          mean = 1 / prob; varr = (1 - prob) / (prob * prob); label = 'Geo(p=' + prob.toFixed(2) + ')';
        } else if (p.dist === 'negbinom') {
          const r = a; kmax = Math.max(12, Math.round(r * (1 - prob) / prob * 2 + 8));
          for (let k = 0; k <= kmax; k++) {
            const lp = logC(k + r - 1, k) + r * Math.log(prob) + k * Math.log(1 - prob);
            items.push({ k, pr: Math.exp(lp) });
          }
          mean = r * (1 - prob) / prob; varr = r * (1 - prob) / (prob * prob);
          label = 'NB(r=' + r + ', p=' + prob.toFixed(2) + ')';
        } else { // multinom（3カテゴリの期待度数）
          const n = a; const probs = [0.5, 0.3, 0.2];
          const pl2 = Pl.make(canvas, { xmin: 0.3, xmax: 3.7, ymin: 0, ymax: n * 0.6 + 1 });
          pl2.clear(); pl2.axes({ xLabel: 'カテゴリ', yLabel: '期待度数 n·pᵢ', xTicks: [1, 2, 3], xFmt: v => ['A', 'B', 'C'][v - 1] });
          probs.forEach((pr, i) => {
            pl2.bars([{ x0: i + 1 - 0.3, x1: i + 1 + 0.3, y: n * pr }], { color: Pl.colors[i], alpha: 0.8 });
            pl2.text(i + 1, n * pr, (n * pr).toFixed(1), { align: 'center', baseline: 'bottom', dy: -2, color: Pl.ink, size: 12 });
          });
          pl2.text(0.3, n * 0.6 + 1, '多項分布: n=' + n + ' 回を確率(0.5,0.3,0.2)で3カテゴリへ配分。各カテゴリの周辺分布は二項', { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12 });
          return;
        }
        const ymax = Math.max.apply(null, items.map(it => it.pr)) * 1.18 || 1;
        const x0 = p.dist === 'geom' ? 0.5 : -0.5;
        const pl = Pl.make(canvas, { xmin: x0, xmax: kmax + 0.5, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'k', yLabel: '確率 P(X=k)' });
        pl.bars(items.map(it => ({ x0: it.k - 0.42, x1: it.k + 0.42, y: it.pr })), { color: Pl.colors[0], alpha: 0.78 });
        pl.text(x0, ymax, label + '　平均=' + mean.toFixed(2) + '　分散=' + varr.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 連続型分布ギャラリー --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'continuous-distributions', title: '連続型分布ギャラリー',
    summary: '一様・正規・指数・ガンマ・ベータ・対数正規・コーシー——それぞれの「素性」と、パラメータで形がどう動くかを一望します。',
    body: `
<p>連続分布は密度 $f(x)$ で表され、面積が確率です。準1級で頻出のものを整理します。</p>
<table class="simple">
<tr><th>分布</th><th>密度 $f(x)$</th><th>平均</th><th>分散</th><th>使いどころ・素性</th></tr>
<tr><td>連続一様 $U(a,b)$</td><td>$\\dfrac{1}{b-a}$</td><td>$\\frac{a+b}{2}$</td><td>$\\frac{(b-a)^2}{12}$</td><td>区間内で等しい確率。乱数生成の土台</td></tr>
<tr><td>正規 $N(\\mu,\\sigma^2)$</td><td>$\\dfrac{1}{\\sqrt{2\\pi}\\sigma}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$</td><td>$\\mu$</td><td>$\\sigma^2$</td><td>誤差・平均の分布。中心極限定理の到達点</td></tr>
<tr><td>指数 $\\mathrm{Exp}(\\lambda)$</td><td>$\\lambda e^{-\\lambda x}$</td><td>$1/\\lambda$</td><td>$1/\\lambda^2$</td><td>「次に起こるまでの待ち時間」。無記憶性をもつ</td></tr>
<tr><td>ガンマ $\\mathrm{Ga}(k,\\theta)$</td><td>$\\dfrac{x^{k-1}e^{-x/\\theta}}{\\Gamma(k)\\theta^k}$</td><td>$k\\theta$</td><td>$k\\theta^2$</td><td>指数の和（$k$ 回起こるまでの時間）。$k$ で形が変わる</td></tr>
<tr><td>ベータ $\\mathrm{Be}(a,b)$</td><td>$\\dfrac{x^{a-1}(1-x)^{b-1}}{B(a,b)}$</td><td>$\\frac{a}{a+b}$</td><td>$\\frac{ab}{(a+b)^2(a+b+1)}$</td><td>$[0,1]$ 上。割合・確率そのものの分布（ベイズの事前）</td></tr>
<tr><td>対数正規</td><td>$\\dfrac{1}{\\sqrt{2\\pi}\\sigma x}e^{-\\frac{(\\ln x-\\mu)^2}{2\\sigma^2}}$</td><td>$e^{\\mu+\\sigma^2/2}$</td><td>$(e^{\\sigma^2}-1)e^{2\\mu+\\sigma^2}$</td><td>$\\ln X$ が正規。正の右歪みデータ（濃度・所得）</td></tr>
<tr><td>コーシー</td><td>$\\dfrac{1}{\\pi(1+x^2)}$（標準）</td><td colspan="2"><strong>どちらも存在しない</strong></td><td>裾が極端に重い（要注意）</td></tr>
</table>
<p><strong>ガンマのパラメータ化に2流儀</strong>：本サイトは<strong>尺度</strong> $\\theta$ 表記（平均 $k\\theta$）ですが、教科書やソフトでは<strong>率</strong> $\\beta=1/\\theta$ 表記（平均 $\\alpha/\\beta$）も一般的です（R の <code>rgamma</code> は率が既定）。式を突き合わせて合わないときはここを疑ってください。カイ二乗 $\\chi^2_k=\\mathrm{Ga}(k/2,\\ \\theta=2)$ も尺度表記です。ガンマは指数（$k=1$）を含み、$k$ を増やすと山ができて正規に近づきます。</p>
<h3>指数の無記憶性とハザード関数</h3>
<p>指数分布の生存関数は $P(X>t)=e^{-\\lambda t}$。これを条件付き確率に入れると</p>
<p>$$ P(X>s+t\\mid X>s)=\\frac{e^{-\\lambda(s+t)}}{e^{-\\lambda s}}=e^{-\\lambda t}=P(X>t) $$</p>
<p>と、$s$ がきれいに約分で消えます——<strong>すでに待った時間は次の待ち時間に影響しない</strong>（無記憶性）。これは<strong>ハザード関数</strong> $h(t)=\\dfrac{f(t)}{S(t)}$（「$t$ まで生き延びた上で、今まさに起きる勢い」）が一定であることと同値で、指数では $h(t)=\\lambda e^{-\\lambda t}/e^{-\\lambda t}=\\lambda$ で定数です。ワイブル分布はこれを一般化し、形状 $m<1$ でハザード減少（初期故障）、$m=1$ で指数、$m>1$ で増加（摩耗）——信頼性工学のバスタブ曲線に対応します（<a href="#/prep1/survival">生存時間解析</a>へ）。</p>
<h3>対数正規：戻すと平均でなく中央値になる</h3>
<p>実務で最も誤解が多い分布です。$\\ln X\\sim N(\\mu,\\sigma^2)$ のとき、代表値は次の順に並びます。</p>
<p>$$ \\underbrace{e^{\\mu-\\sigma^2}}_{\\text{最頻値}}\\ <\\ \\underbrace{e^{\\mu}}_{\\text{中央値}}\\ <\\ \\underbrace{e^{\\mu+\\sigma^2/2}}_{\\text{平均}} $$</p>
<p>つまり「対数変換して平均を取り、指数で戻す」と得られるのは $e^{\\bar{\\ln x}}\\approx e^\\mu$ ＝<strong>中央値（幾何平均）であって算術平均ではありません</strong>。$\\mu=0,\\sigma=1$ なら中央値 1 に対し平均は $e^{0.5}=1.65$ と6割以上違います。濃度データを対数で解析して報告するときは、どちらの代表値を示しているのかを明示してください（<a href="#/math/linearization">線形化</a>の補正項 $\\exp(\\hat\\sigma^2/2)$ はこのズレを埋めるためのものです）。</p>
<h3>コーシー：大数の法則が効かない分布</h3>
<p>コーシーは $t_1$（自由度1の $t$ 分布）そのもので、独立な標準正規の比 $Z_1/Z_2$ としても作れます。決定的な性質は<strong>標本平均 $\\bar X_n$ がまた同じコーシー分布に従う</strong>こと——$n$ をいくら増やしても分布が1ミリも縮まないので、<a href="#/prep1/lln">大数の法則</a>が成り立ちません。「たくさん測れば平均が安定する」という直感が通用しない反例として押さえておいてください。</p>
<h3>分布どうしのつながり（なぜ関係するか）</h3>
<p>連続分布の多くは<strong>操作でつながっています</strong>。指数分布の無記憶性 $P(X>s+t\\mid X>s)=P(X>t)$ は「ハザード（瞬間故障率）が一定」と同値で、その独立な和が<strong>ガンマ</strong>（$k$ 個の待ち時間の合計）。$\\chi^2_k=\\mathrm{Ga}(k/2,2)$ なので平均 $k$・分散 $2k$（数値でも $k{=}5$ で平均5・分散10）。<strong>対数正規</strong>は「多数の要因が<em>掛け算</em>で効く」過程から出ます——対数を取ると和になり<a href="#/prep1/clt">中心極限定理</a>で正規、だから元は右歪みの正の量（濃度・所得・粒径）に合います。<strong>ベータ</strong>は $[0,1]$ 上で割合そのものを表し、二項の共役事前として<a href="#/prep1/bayes">ベイズ</a>で主役。<strong>正規</strong>は和の極限（CLT）の到達点です。</p>
<h3>裾と前提の注意</h3>
<p>分布選択は裾の重さの仮定でもあります。<strong>コーシー</strong>は正規そっくりの釣鐘型に見えて<strong>平均も分散も存在しない</strong>——標本平均や最小二乗など<a href="#/prep1/moments-shape">モーメント</a>に頼る手法がすべて破綻します（<a href="#/prep1/lln">大数の法則</a>も効かない）。<strong>指数の無記憶性は「古くなっても壊れやすさが変わらない」という強い仮定</strong>で、摩耗・劣化のある機械や生物には合わず、ハザードが時間変化する<strong>ワイブル分布</strong>が使われます（<a href="#/prep1/survival">生存時間解析</a>）。正の右歪みデータに正規を当てると負の値に確率を置いてしまう——対数正規やガンマが適切、という判断も重要です。「どの分布か」は「どんな生成メカニズムと裾を仮定するか」の選択だと意識してください。</p>
<div class="note">下で分布とパラメータを動かし、形の変化を確かめてください。コーシーと正規を見比べると「裾の重さ」の違い（外れ値の出やすさ）がよく分かります。ガンマの形状 $k$ を1にすると指数に一致し、$k$ を上げると正規に近づく——分布どうしのつながりを目で追えます。</div>`,
    demo: {
      task: {
        q: '分布を「ガンマ」にしてパラメータ①(k)を 0.5 → 2 → 6 と上げてください。形はどう変わりますか。$k=1$ のときは何という分布になりますか。',
        a: '<p>$k=0.5$ では<strong>0で発散する強い右歪み</strong>、$k=2$ で山ができ、$k=6$ では<strong>ほぼ左右対称な釣鐘型</strong>に。歪度は $2/\\sqrt k$ なので $2.83\\to1.41\\to0.82$ と減ります。</p><p><strong>$k=1$ はちょうど指数分布</strong>です（$\\mathrm{Ga}(1,\\theta)=\\mathrm{Exp}(1/\\theta)$）。ガンマは「指数分布を $k$ 個足したもの」＝<strong>$k$ 回目のイベントが起きるまでの待ち時間</strong>なので、$k$ を増やすと中心極限定理が効いて正規に近づく、と読めます。</p><p>$k$ を上げても<strong>常に正の値しか取らない</strong>ことも確かめてください。ここが正規分布との決定的な違いで、濃度・時間・待ち行列など<strong>負になりえない量</strong>のモデルにガンマが使われる理由です。$\\theta$（パラメータ②）は形を変えず横に伸縮させるだけ——<strong>$k$ が形、$\\theta$ が尺度</strong>という役割分担も見えます。',
      },
      note: 'ガンマの形状 k を1にすると指数分布に一致。対数正規は必ず右に裾を引く。コーシーは正規そっくりに見えても裾が桁違いに重い＝平均が定義できない分布です。',
      controls: [
        { type: 'select', id: 'dist', label: '分布', value: 'gamma', options: [
          { value: 'uniform', label: '連続一様' },
          { value: 'normal', label: '正規' },
          { value: 'exp', label: '指数' },
          { value: 'gamma', label: 'ガンマ' },
          { value: 'beta', label: 'ベータ' },
          { value: 'lognormal', label: '対数正規' },
          { value: 'cauchy', label: 'コーシー' },
        ]},
        { type: 'range', id: 'a', label: 'パラメータ①', min: 0.5, max: 6, step: 0.1, value: 2 },
        { type: 'range', id: 'b', label: 'パラメータ②', min: 0.5, max: 6, step: 0.1, value: 2 },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const a = p.a, b = p.b;
        let xmin = 0, xmax = 8, ymax = 1, f, label;
        if (p.dist === 'uniform') {
          const lo = 0, hi = a + 1; xmin = -1; xmax = 8;
          f = x => (x >= lo && x <= hi) ? 1 / (hi - lo) : 0; ymax = 1.2 / (hi - lo);
          label = 'U(0, ' + hi.toFixed(1) + ')';
        } else if (p.dist === 'normal') {
          xmin = -6; xmax = 6; f = x => st.normalPdf(x, a - 2, b * 0.5); ymax = 0.9 / (b * 0.5);
          label = 'N(μ=' + (a - 2).toFixed(1) + ', σ=' + (b * 0.5).toFixed(2) + ')';
        } else if (p.dist === 'exp') {
          const lam = a; xmin = 0; xmax = 8; f = x => x < 0 ? 0 : lam * Math.exp(-lam * x); ymax = lam * 1.1;
          label = 'Exp(λ=' + lam.toFixed(1) + ')';
        } else if (p.dist === 'gamma') {
          const k = a, th = b * 0.5; xmin = 0; xmax = 16;
          f = x => x <= 0 ? 0 : Math.exp((k - 1) * Math.log(x) - x / th - st.lgamma(k) - k * Math.log(th));
          ymax = 0.5; label = 'Gamma(k=' + k.toFixed(1) + ', θ=' + th.toFixed(2) + ')';
        } else if (p.dist === 'beta') {
          xmin = 0; xmax = 1; f = x => st.betaPdf(x, a, b); ymax = 4;
          label = 'Beta(a=' + a.toFixed(1) + ', b=' + b.toFixed(1) + ')';
        } else if (p.dist === 'lognormal') {
          const mu = (a - 2) * 0.3, sig = b * 0.3; xmin = 0; xmax = 10;
          f = x => x <= 0 ? 0 : Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sig * sig)) / (x * sig * Math.sqrt(2 * Math.PI));
          ymax = 0.8; label = 'LogN(μ=' + mu.toFixed(2) + ', σ=' + sig.toFixed(2) + ')';
        } else { // cauchy
          const x0 = a - 2, g = b * 0.4; xmin = -8; xmax = 8;
          f = x => 1 / (Math.PI * g * (1 + Math.pow((x - x0) / g, 2))); ymax = 1 / (Math.PI * g) * 1.1;
          label = 'Cauchy(x₀=' + x0.toFixed(1) + ', γ=' + g.toFixed(2) + ')';
        }
        const xs = st.linspace(xmin, xmax, 300);
        const pl = Pl.make(canvas, { xmin, xmax, ymin: 0, ymax });
        pl.clear(); pl.axes({ xLabel: 'x', yLabel: '密度 f(x)' });
        if (p.dist === 'cauchy') pl.line(xs.map(x => [x, st.normalPdf(x, a - 2, b * 0.4)]), { color: Pl.gray, dash: [5, 4], width: 1.5 });
        pl.line(xs.map(x => [x, f(x)]), { color: Pl.colors[0], width: 2.5 });
        pl.fillUnder(xs.map(x => [x, f(x)]), { color: Pl.colors[0], alpha: 0.12 });
        const legend = [{ label: label, color: Pl.colors[0] }];
        if (p.dist === 'cauchy') legend.push({ label: '同スケールの正規（比較）', color: Pl.gray });
        pl.legend(legend);
      },
    },
  });

  /* --- 多変量正規分布 --- */
  T.push({
    section: 'prep1', group: '種々の確率分布', id: 'multivariate-normal', title: '多変量正規分布',
    summary: '平均ベクトルと分散共分散行列 Σ が「丘の位置と楕円の形」をどう決めるかを、標本点と等高線で確かめます。',
    body: `
<p>多変量正規分布は、複数の正規変数がまとめて従う分布です。密度は</p>
<p>$$ f(\\boldsymbol x)=\\frac{1}{(2\\pi)^{p/2}|\\Sigma|^{1/2}}\\exp\\!\\left(-\\tfrac12(\\boldsymbol x-\\boldsymbol\\mu)^\\top\\Sigma^{-1}(\\boldsymbol x-\\boldsymbol\\mu)\\right) $$</p>
<p>平均ベクトル $\\boldsymbol\\mu$ が丘の位置、<strong>分散共分散行列 $\\Sigma$</strong> が広がりと傾きを決めます。等高線は $\\Sigma$ の固有ベクトル方向を軸とする楕円で、軸の長さは固有値の平方根に比例します（＝<a href="#/prep1/pca">主成分</a>）。</p>
<h3>すべての基は「線形変換で閉じる」こと</h3>
<p>多変量正規のいちばん強い性質はこれ一つです。</p>
<p>$$ \\boldsymbol X\\sim N(\\boldsymbol\\mu,\\Sigma)\\ \\Longrightarrow\\ A\\boldsymbol X+\\boldsymbol b\\sim N\\!\\left(A\\boldsymbol\\mu+\\boldsymbol b,\\ A\\Sigma A^\\top\\right) $$</p>
<p>よく挙げられる性質は、$A$ の選び方を変えただけの系にすぎません。</p>
<ul>
<li><strong>周辺分布も正規</strong>：$A$ を「1行だけ取り出す行列」にすれば、どの1変数を取り出しても正規分布。</li>
<li><strong>主成分は無相関な正規</strong>：$A=V^\\top$（固有ベクトルを並べた行列）とすると $V^\\top\\Sigma V=\\Lambda$ が対角＝<a href="#/prep1/pca">主成分</a>どうしは無相関で、分散は固有値そのもの。</li>
<li><strong>白色化</strong>：$A=\\Sigma^{-1/2}$ とすれば $N(\\boldsymbol 0,I)$ になり、相関を消して単位分散に揃えられる。</li>
<li><strong>条件付き分布も正規</strong>：$X_2$ を固定した $X_1$ も正規で、$\\rho$ が大きいほど条件付き分散が小さくなる（＝予測が効く）。</li>
</ul>
<h3>楕円が含む確率は $\\chi^2$ で決まる（1σ楕円は68%ではない）</h3>
<p>マハラノビス距離の2乗は、$p$ 変量正規のもとで<strong>自由度 $p$ のカイ二乗分布</strong>に従います。</p>
<p>$$ (\\boldsymbol x-\\boldsymbol\\mu)^\\top\\Sigma^{-1}(\\boldsymbol x-\\boldsymbol\\mu)\\ \\sim\\ \\chi^2_p $$</p>
<p>ここに1次元の感覚を持ち込むと誤ります。1次元では「$\\pm1\\sigma$ に約68%、$\\pm2\\sigma$ に約95%」ですが、<strong>2次元の1σ楕円が含むのは約39%、2σ楕円でも約86%</strong>にすぎません（$\\chi^2_2$ で $P(\\chi^2_2\\le1)=0.393$、$P(\\chi^2_2\\le4)=0.865$）。次元が増えるほど「中心から離れた殻」に確率が逃げていくためです。</p>
<p>逆に95%を含む楕円が欲しければ $\\chi^2_2$ の上側5%点 $5.991$ を使い、半径は $\\sqrt{5.991}\\approx2.45\\sigma$ になります。この $\\chi^2$ 基準はそのまま<strong>多変量の外れ値検出</strong>（マハラノビス距離が $\\chi^2_{p,0.99}$ を超える点を疑う）や、<a href="#/chemo/pls">PLS</a> のホテリング $T^2$ 管理限界にも使われます。</p>
<h3>指数の中身と条件付きの公式</h3>
<p>密度の指数部にある $(\\boldsymbol x-\\boldsymbol\\mu)^\\top\\Sigma^{-1}(\\boldsymbol x-\\boldsymbol\\mu)$ は<strong>マハラノビス距離</strong>の2乗——「$\\Sigma$ の形で測った中心からの距離」で、これが一定の点が等高線の楕円です。$\\Sigma=V\\Lambda V^\\top$ と<a href="#/prep1/pca">固有分解</a>すると、楕円の軸が固有ベクトル $V$ の向き、軸の長さが $\\sqrt{\\lambda}$ に比例します。2変数の条件付き分布は</p>
<p>$$ X_1\\mid X_2{=}x_2\\ \\sim\\ N\\!\\Big(\\mu_1+\\rho\\tfrac{\\sigma_1}{\\sigma_2}(x_2-\\mu_2),\\ \\sigma_1^2(1-\\rho^2)\\Big) $$</p>
<p>で、条件付き平均が $x_2$ の1次式＝<a href="#/prep1/regression">回帰直線</a>、条件付き分散が $\\sigma_1^2(1-\\rho^2)$＝$x_2$ を知って減った不確かさ（数値でも $\\rho{=}0.7$ で条件付き分散0.518≒理論0.51）。$|\\rho|\\to1$ で条件付き分散が0に近づく＝ほぼ完全予測です。</p>
<h3>前提と、崩れたときの注意</h3>
<p>多変量正規は<strong>楕円対称</strong>という強い形を仮定します。実データが歪んでいたり裾が重かったりすると等高線は楕円になりません（周辺が正規でも同時分布が正規とは限らない）。最大の注意は<strong>「無相関⇒独立」が言えるのは同時分布が正規のときだけ</strong>——一般には $\\rho=0$ でも従属があり得ます（<a href="#/prep1/joint-distribution">同時分布</a>参照）。また $\\Sigma$ は<strong>正定値</strong>でなければならず、変数が完全に共線（$|\\rho|=1$）だと $|\\Sigma|=0$ で $\\Sigma^{-1}$ が作れず密度が定義できません（退化）——<a href="#/prep1/multicollinearity">多重共線性</a>の極限です。外れ値・非正規が疑われるときは、$t$ 分布版（多変量 $t$）やロバスト共分散推定を使います。</p>
<div class="note">下で相関 $\\rho$ と各軸の標準偏差を動かすと、標本点（散布）と等高線の楕円が同時に変わります。$\\rho$ の符号で楕円が右上がり／右下がりに傾きます。$\\rho\\to\\pm1$ で楕円がつぶれる＝$\\Sigma$ が退化して逆行列を持てなくなる極限です。</div>`,
    demo: {
      task: {
        q: '$\\rho=0$ のまま $\\sigma_1=2.5$、$\\sigma_2=0.4$ にした場合と、$\\sigma_1=\\sigma_2=1$ で $\\rho=0.9$ にした場合を比べてください。どちらも細長い楕円ですが、決定的な違いは何ですか。',
        a: '<p>どちらも細長い楕円ですが——</p><ul><li><strong>$\\sigma$ を変えた場合</strong>：楕円は<strong>座標軸に平行</strong>。$X$ を知っても $Y$ の予想はまったく変わりません（独立）。</li><li><strong>$\\rho$ を上げた場合</strong>：楕円が<strong>斜めに傾く</strong>。$X$ を知ると $Y$ の条件付き分布が $N(\\rho x,\\ 1-\\rho^2)$ に締まります（$\\rho=0.9$ なら条件付き分散は $0.19$ で、元の1から8割減）。</li></ul><p><strong>「細長さ」は情報量ではなく、「傾き」が情報量です。</strong>予測に使えるのは相関のほうで、分散の違いは単なるスケールの差にすぎません。</p><p>$\\rho$ を $-0.9$ に振ると楕円が逆向きに傾くこと、$\\rho=\\pm1$ に近づけると楕円が<strong>1本の線に潰れる</strong>（＝一方が他方で完全に決まる、共分散行列が特異になる）ことも確かめてください。これが<a href="#/prep1/multicollinearity">多重共線性</a>の幾何的な姿です。',
      },
      note: 'σ₁とσ₂を変えると楕円が縦横に伸縮。ρを±に振ると楕円が傾く（固有ベクトルが回る）。ρ→±1で楕円がつぶれ、2変数が1直線に乗る＝共線性の極限です。',
      controls: [
        { type: 'range', id: 's1', label: 'σ₁（横の広がり）', min: 0.4, max: 2.5, step: 0.1, value: 1.4 },
        { type: 'range', id: 's2', label: 'σ₂（縦の広がり）', min: 0.4, max: 2.5, step: 0.1, value: 1 },
        { type: 'range', id: 'rho', label: '相関 ρ', min: -0.9, max: 0.9, step: 0.1, value: 0.5 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const s1 = p.s1, s2 = p.s2, rho = p.rho;
        const c12 = rho * s1 * s2;
        // コレスキー分解で相関つき標本を生成
        const L11 = s1, L21 = c12 / s1, L22 = Math.sqrt(Math.max(1e-6, s2 * s2 - L21 * L21));
        const rand = st.rng(7 + (p.reseed | 0) * 41);
        const pts = [];
        for (let i = 0; i < 400; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          pts.push([L11 * z1, L21 * z1 + L22 * z2]);
        }
        const lim = 6;
        const pl = Pl.make(canvas, { xmin: -lim, xmax: lim, ymin: -lim, ymax: lim });
        pl.clear(); pl.axes({ xLabel: 'X₁', yLabel: 'X₂' });
        pl.scatter(pts, { color: Pl.colors[0], r: 2.6, alpha: 0.4 });
        // 等高線楕円（1σ,2σ）を固有分解で
        const tr = s1 * s1 + s2 * s2, det = s1 * s1 * s2 * s2 - c12 * c12;
        const l1 = tr / 2 + Math.sqrt(Math.max(0, tr * tr / 4 - det));
        const l2 = tr / 2 - Math.sqrt(Math.max(0, tr * tr / 4 - det));
        let ang = 0.5 * Math.atan2(2 * c12, s1 * s1 - s2 * s2);
        for (const scale of [1, 2]) {
          const ell = [];
          for (let a = 0; a <= 60; a++) {
            const t = a / 60 * 2 * Math.PI;
            const ex = scale * Math.sqrt(l1) * Math.cos(t), ey = scale * Math.sqrt(l2) * Math.sin(t);
            ell.push([ex * Math.cos(ang) - ey * Math.sin(ang), ex * Math.sin(ang) + ey * Math.cos(ang)]);
          }
          pl.line(ell, { color: Pl.colors[1], width: scale === 1 ? 2.5 : 1.5, alpha: scale === 1 ? 1 : 0.6 });
        }
        // 固有ベクトル軸
        pl.arrow(0, 0, 2 * Math.sqrt(l1) * Math.cos(ang), 2 * Math.sqrt(l1) * Math.sin(ang), { color: Pl.ink, width: 2 });
        pl.legend([{ label: '標本点', color: Pl.colors[0] }, { label: '1σ・2σ 等高線', color: Pl.colors[1] }]);
        pl.text(-lim, lim, '主軸方向 ' + (ang * 180 / Math.PI).toFixed(0) + '°　|Σ|=' + det.toFixed(2), { align: 'left', baseline: 'top', dx: 56, dy: 4, color: '#475467', size: 12 });
      },
    },
  });

})();
