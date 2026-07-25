'use strict';
/* 数学の基礎 — 例題・まとめ・確認問題 */
(function () {
  const Q = (window.STATS_QUIZ = window.STATS_QUIZ || {});

  Q['math/vectors-matrices'] = {
    example: {
      title: '行列とベクトルの積',
      body: `
<p>3人の「数学・英語」の点数を行列 $X$、各科目の重み $\\boldsymbol{w}$ として、総合点を計算します。</p>
<div class="step">$$ X=\\begin{pmatrix}80&60\\\\50&90\\\\70&70\\end{pmatrix},\\quad \\boldsymbol{w}=\\begin{pmatrix}0.6\\\\0.4\\end{pmatrix} $$</div>
<div class="step">各行（各人）について「点数×重み」を足すのが行列×ベクトル：
$$ X\\boldsymbol{w}=\\begin{pmatrix}80\\cdot0.6+60\\cdot0.4\\\\50\\cdot0.6+90\\cdot0.4\\\\70\\cdot0.6+70\\cdot0.4\\end{pmatrix}=\\begin{pmatrix}72\\\\66\\\\70\\end{pmatrix} $$</div>
<p>結果は3人ぶんの総合点ベクトル。回帰の予測 $\\hat{\\boldsymbol y}=X\\boldsymbol\\beta$ もまったく同じ計算です。</p>`,
    },
    keypoints: [
      '<strong>1行＝1個体、1列＝1変数</strong>。データ表はそのまま行列 $X$（$n\\times p$）になる。',
      '行列 $A$ をかける操作は、平面（空間）を回転・拡大・せん断する<strong>変換</strong>と見なせる。',
      '<strong>行列式 $\\det$</strong> は面積・体積が何倍になるかを表す。$\\det=0$ は空間が低次元へつぶれ、情報が失われる（逆行列が作れない）合図。',
      '$m\\times k$ 行列と $k\\times n$ 行列は掛けられる（内側の $k$ が一致）。結果は $m\\times n$。',
    ],
    quiz: [
      {
        q: '$3\\times4$ 行列と $4\\times2$ 行列の積は、何行何列の行列になりますか。',
        choices: ['$3\\times2$', '$4\\times4$', '$3\\times4$', '掛けられない'],
        answer: 0,
        explain: '内側の次元（4と4）が一致するので掛けられ、結果は外側の $3\\times2$ になります。$(m\\times k)(k\\times n)=(m\\times n)$。',
      },
      {
        q: '$2\\times2$ 行列 $A$ の行列式が $\\det(A)=0$ のとき、正しいのは？',
        choices: [
          '$A$ は平面を1本の直線（以下）につぶす変換で、逆行列を持たない',
          '$A$ は必ず単位行列である',
          '$A$ をかけると面積が2倍になる',
          '$A$ は必ず回転を表す',
        ],
        answer: 0,
        explain: '$\\det=0$ は「面積が0倍」＝平面が線や点につぶれることを意味します。つぶれると元に戻せない（逆変換なし）ので逆行列は存在しません。多重共線性の数学的な正体でもあります。',
      },
    ],
  };

  Q['math/matrix-ops'] = {
    example: {
      title: '逆行列で連立方程式を解く',
      body: `
<p>連立方程式 $\\begin{cases}2x+y=5\\\\ x+3y=10\\end{cases}$ を、行列の言葉で解きます。</p>
<div class="step">$A\\boldsymbol x=\\boldsymbol b$ の形に書きます：$A=\\begin{pmatrix}2&1\\\\1&3\\end{pmatrix}$、$\\boldsymbol b=\\begin{pmatrix}5\\\\10\\end{pmatrix}$。</div>
<div class="step">行列式は $\\det A=2\\cdot3-1\\cdot1=5\\ne0$。逆行列が存在し、解は一意です。$2\\times2$ の逆行列は「対角を入れ替え、非対角の符号を変え、$\\det$ で割る」：
$$ A^{-1}=\\frac{1}{5}\\begin{pmatrix}3&-1\\\\-1&2\\end{pmatrix} $$</div>
<div class="step">$$ \\boldsymbol x=A^{-1}\\boldsymbol b=\\frac15\\begin{pmatrix}3\\cdot5-1\\cdot10\\\\-1\\cdot5+2\\cdot10\\end{pmatrix}=\\frac15\\begin{pmatrix}5\\\\15\\end{pmatrix}=\\begin{pmatrix}1\\\\3\\end{pmatrix} $$</div>
<div class="step">検算：$2(1)+3=5$ ✓、$1+3(3)=10$ ✓。</div>
<p>もし係数が $\\begin{pmatrix}2&1\\\\4&2\\end{pmatrix}$（2行目が1行目の2倍）なら $\\det=0$ で逆行列がなく、解は「なし」か「無数」になります。回帰の $(X^\\top X)^{-1}$ でこれが起きるのが<a href="#/prep1/multicollinearity">多重共線性</a>で、$\\det$ が0ちょうどでなく<strong>0に近い</strong>と、解は求まるものの少しのデータの揺れで大きく動きます。`,
    },
    keypoints: [
      '連立一次方程式は $A\\boldsymbol{x}=\\boldsymbol{b}$ と1本にまとめられ、解は $\\boldsymbol{x}=A^{-1}\\boldsymbol{b}$。',
      '$2\\times2$ の逆行列は $A^{-1}=\\dfrac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$。分母の $ad-bc$ が行列式。',
      '行列式が0に近い＝2直線がほぼ平行＝<strong>解が不安定</strong>。これが重回帰の<a href="#/prep1/multicollinearity">多重共線性</a>の本質。',
      '重回帰の係数 $\\hat{\\boldsymbol\\beta}=(X^\\top X)^{-1}X^\\top\\boldsymbol y$ も、この逆行列で一気に求まる。',
    ],
    quiz: [
      {
        q: '$A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ の行列式は？',
        choices: ['$3$', '$5$', '$0$', '$4$'],
        answer: 0,
        explain: '$\\det=ad-bc=2\\cdot2-1\\cdot1=3$。0でないので逆行列が存在し、連立方程式は一意に解けます。',
      },
      {
        q: '重回帰で説明変数どうしが強く相関すると $X^\\top X$ の行列式はどうなり、何が起きますか。',
        choices: [
          '行列式が0に近づき、逆行列が不安定になって係数の推定が大きくばらつく',
          '行列式が大きくなり、推定が安定する',
          '行列式は変わらず、影響はない',
          '行列式が負になり、予測が反転する',
        ],
        answer: 0,
        explain: '相関が強いと列が「似た方向」になり $X^\\top X$ がつぶれ気味（行列式≈0）に。逆行列が爆発して係数分散が増大します。これが多重共線性です。',
      },
    ],
  };

  Q['math/eigen'] = {
    example: {
      title: '固有値を求める',
      body: `
<p>$A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ の固有値を求めます。固有値 $\\lambda$ は $\\det(A-\\lambda I)=0$ の解。</p>
<div class="step">$$ \\det\\begin{pmatrix}2-\\lambda&1\\\\1&2-\\lambda\\end{pmatrix}=(2-\\lambda)^2-1=0 $$</div>
<div class="step">$(2-\\lambda)^2=1 \\Rightarrow 2-\\lambda=\\pm1 \\Rightarrow \\lambda=1,\\ 3$</div>
<p>固有ベクトルは $\\lambda=3$ で $(1,1)$ 方向、$\\lambda=1$ で $(1,-1)$ 方向（互いに直交）。対称行列の固有ベクトルは必ず直交します。</p>`,
    },
    keypoints: [
      '$A\\boldsymbol{v}=\\lambda\\boldsymbol{v}$：固有ベクトル $\\boldsymbol v$ は変換で<strong>向きが変わらず</strong>、長さだけ $\\lambda$ 倍になる特別な方向。',
      '固有値は $\\det(A-\\lambda I)=0$ を解いて求める。',
      '<strong>対称行列</strong>（共分散行列など）の固有ベクトルは互いに<strong>直交</strong>し、固有値は実数。',
      '共分散行列の固有ベクトル＝<a href="#/prep1/pca">主成分</a>の方向、固有値＝その方向の分散。PCAの心臓部。',
    ],
    quiz: [
      {
        q: '対称行列の固有ベクトルについて正しいものは？',
        choices: [
          '異なる固有値に属する固有ベクトルは互いに直交する',
          '必ずすべて平行になる',
          '固有値は必ず複素数になる',
          '固有ベクトルは常に1本しかない',
        ],
        answer: 0,
        explain: '対称行列（共分散行列はいつも対称）は直交する固有ベクトルの組を持ち、固有値はすべて実数です。これがPCAで直交する主成分が得られる理由です。',
      },
      {
        q: '共分散行列の「最大の固有値」に対応する固有ベクトルは、データの何を表しますか。',
        choices: [
          'データが最もばらつく方向（第1主成分）',
          'データの平均の位置',
          '最も情報が少ない方向',
          '外れ値の個数',
        ],
        answer: 0,
        explain: '固有値＝その方向の分散なので、最大固有値の固有ベクトルは「最も分散が大きい方向」＝第1主成分です。次元圧縮では、この方向を優先的に残します。',
      },
    ],
  };

  Q['math/covariance-matrix'] = {
    example: {
      title: '共分散行列から相関・主成分まで一気に読む',
      body: `
<p>2変数の分散共分散行列が $\\Sigma=\\begin{pmatrix}4&2\\\\2&4\\end{pmatrix}$ でした。ここから何が読めるかを全部出します。</p>
<div class="step"><strong>分散と相関</strong>：対角が各変数の分散（どちらも4、$\\mathrm{SD}=2$）。相関は $r=\\dfrac{2}{\\sqrt{4}\\sqrt{4}}=0.5$。</div>
<div class="step"><strong>固有値</strong>：$\\mathrm{tr}=8$、$\\det=16-4=12$ から $\\lambda^2-8\\lambda+12=0$、よって $\\lambda=6,\\ 2$。（和8＝トレース、積12＝行列式で検算できます）</div>
<div class="step"><strong>固有ベクトル</strong>：$\\lambda=6$ で $(1,1)/\\sqrt2$、$\\lambda=2$ で $(1,-1)/\\sqrt2$。<a href="#/prep1/pca">第1主成分</a>は「2変数が一緒に増減する方向」、第2は「一方が増えると他方が減る方向」です。</div>
<div class="step"><strong>寄与率</strong>：$6/(6+2)=75\\%$。2変数を1つの合成変数にまとめても、変動の75%を保てるということ。</div>
<p>相関 $r=0.5$ という1つの数字が、「楕円がどれだけ傾いて細長いか」＝固有値の比 $6:2$ として現れています。$r$ を0に近づけると固有値が等しくなって等方的（円）に、$\\pm1$ に近づけると片方の固有値が0に潰れます——後者が<a href="#/prep1/multicollinearity">多重共線性</a>の極限です。`,
    },
    keypoints: [
      '分散共分散行列 $\\Sigma$ は、対角に各変数の分散、非対角に共分散を並べた<strong>対称行列</strong>。',
      '相関 $\\rho=\\sigma_{XY}/(\\sigma_X\\sigma_Y)$ は共分散を $-1\\sim1$ に標準化したもの。',
      '2次元正規分布の「丘」の形は $\\Sigma$ で決まり、その等高線が<a href="#/prep1/correlation">散布図の楕円</a>。',
      '$\\Sigma$ の固有ベクトルが尾根の向き（主成分方向）、固有値がその方向の分散。',
    ],
    quiz: [
      {
        q: '分散共分散行列が必ず対称（$\\sigma_{XY}=\\sigma_{YX}$）になるのはなぜですか。',
        choices: [
          '$\\mathrm{Cov}(X,Y)=\\mathrm{Cov}(Y,X)$ だから（掛ける順序によらない）',
          '対角成分である分散が常に非負であることから、非対角成分も一致するため',
          '相関係数が $-1$ 以上 $1$ 以下に収まるという制約から導かれるため',
          '多くのデータでたまたま近い値になるだけで、厳密には対称とは限らない',
                ],
        answer: 0,
        explain: '共分散は $E[(X-\\mu_X)(Y-\\mu_Y)]$ で、$X$ と $Y$ の役割を入れ替えても同じ値です。よって $\\Sigma$ は常に対称になります。',
      },
      {
        q: '相関 $\\rho$ が $+1$ に近いとき、2次元正規分布の「丘」の形は？',
        choices: [
          '対角方向に細長くのびた尾根になる',
          '完全な円形になる',
          '平らになって消える',
          'X軸に平行な細い帯になる',
        ],
        answer: 0,
        explain: '$\\rho\\to1$ は「XとYが連動」を意味し、丘は対角線方向に細長い尾根になります。$\\rho=0$ なら円形（等方的）です。',
      },
    ],
  };

  Q['math/gradient'] = {
    example: {
      title: '学習率で結果が変わることを数値で見る',
      body: `
<p>$f(x)=x^2-4x+5$（最小は $x=2$）を勾配降下法で最小化します。$f'(x)=2x-4$、出発点は $x_0=0$。更新式は $x_{t+1}=x_t-\\eta f'(x_t)$。</p>
<div class="step"><strong>$\\eta=0.3$（適切）</strong>：$0\\to1.20\\to1.68\\to1.87\\to1.95\\to\\cdots$ と、$x=2$ へなめらかに近づきます。</div>
<div class="step"><strong>$\\eta=0.5$（この問題では最適）</strong>：$0\\to2$ と<strong>1回で到達</strong>。2次関数では $\\eta=1/f''=1/2$ がちょうど一発で最小に届く歩幅です。</div>
<div class="step"><strong>$\\eta=1.1$（大きすぎ）</strong>：$0\\to4.4\\to-0.88\\to5.46\\to-2.15\\to\\cdots$ と、谷を飛び越えて<strong>振幅が増えながら発散</strong>します。</div>
<p>境目は $\\eta<2/f''=1$ で、これを超えると発散します。実際の機械学習では $f''$（ヘッセ行列）が分からないので、小さめから試して損失が下がるかを見る、というのが実務です。$\\eta$ が小さすぎると収束が遅いだけで済みますが、大きすぎると<strong>学習そのものが壊れる</strong>——この非対称性が「まず小さく」と言われる理由です。`,
    },
    keypoints: [
      '勾配 $\\nabla f$ は各変数の偏微分を並べたベクトルで、「最も急に増える向き」を指す。',
      '勾配の<strong>逆向き</strong>に少しずつ進むのが勾配降下法。誤差の谷（最小）を目指す。',
      '更新式 $\\boldsymbol{x}_{新}=\\boldsymbol{x}_{旧}-\\eta\\nabla f$。$\\eta$（学習率）は歩幅。',
      '$\\eta$ が小さすぎると遅く、大きすぎると谷を飛び越えて<strong>発散</strong>する。最小二乗・最尤・ニューラルネットの学習の共通原理。',
    ],
    quiz: [
      {
        q: '勾配降下法で学習率 $\\eta$ を大きくしすぎると、典型的に何が起きますか。',
        choices: [
          '谷を飛び越えて振動し、発散することがある',
          '必ず最速で最小値に到達する',
          '勾配が0になる',
          '関数が対称になる',
        ],
        answer: 0,
        explain: '歩幅が大きすぎると谷の反対側へ行き過ぎ、往復しながら発散します。小さすぎると収束が遅い。適切な $\\eta$ を選ぶのが実務の勘所です。',
      },
      {
        q: '勾配 $\\nabla f$ が指す向きは何ですか。',
        choices: [
          'その地点で関数が最も急に増加する向き',
          '関数が最も減少する向き',
          '常に原点を指す向き',
          '関数の値そのもの',
        ],
        answer: 0,
        explain: '勾配は「最も急に増える向き」。だから最小化ではその逆向き（最も急に減る向き）へ進みます。',
      },
    ],
  };

  Q['math/linearization'] = {
    example: {
      title: 'Box-Cox の $\\lambda$ を選ぶ',
      body: `
<p>ある培養の菌数が $y=10,\\ 100,\\ 1000$ と等間隔の時点で観測されました。どの変換で「直線」になるかを Box-Cox で考えます。</p>
<div class="step">$\\lambda=1$（無変換）：$y$ の差は $90,\\ 900$ ——増え方が加速していて直線ではありません。</div>
<div class="step">$\\lambda=0.5$（平方根）：$2(\\sqrt y-1)=4.32,\\ 18.0,\\ 61.2$。差は $13.7,\\ 43.2$ でまだ加速。</div>
<div class="step">$\\lambda=0$（対数）：$\\ln y=2.303,\\ 4.605,\\ 6.908$。差はどちらも $2.303$ で<strong>ぴったり等間隔＝直線</strong>。</div>
<p>指数的な増殖では $\\lambda=0$（対数）が正解、というのが数値で見えました。実際の Box-Cox はこれを目分量でなく、<strong>変換後の残差の正規性・等分散性が最良になる $\\lambda$ を最尤法で選びます</strong>。得られた $\\lambda$ が $0.08$ のように中途半端でも、$0$（対数）に丸めて使うほうが解釈も報告もしやすく、当てはまりの差もふつう無視できます。「$\\lambda$ を1本のつまみとして眺め、切りのよい値に着地させる」のが実務的な使い方です。</p>`,
    },
    keypoints: [
      '曲がった関係も、軸を対数などに取り替えると直線になることがある（線形化）。',
      '$y=Ae^{kx}$ は両辺の対数で $\\ln y=\\ln A+kx$：$\\ln y$ を $x$ に対して描けば直線。',
      '温度依存 $\\ln k=a+b/T$ は横軸を $1/T$ にとると直線。分析化学でおなじみ。',
      '線形化できれば傾き・切片を最小二乗で安定に推定でき、<a href="#/prep1/multiple-regression">重回帰</a>で多要因も扱える。',
    ],
    quiz: [
      {
        q: '$y=Ae^{kx}$ を直線にするには、どの軸をどう変換しますか。',
        choices: [
          '縦軸を $\\ln y$ にする（横軸は $x$ のまま）',
          '横軸を $\\ln x$ にする',
          '両軸とも $\\ln$ をとる',
          '変換の必要はない',
        ],
        answer: 0,
        explain: '$\\ln y=\\ln A+kx$ なので、$\\ln y$ 対 $x$ が直線（傾き $k$、切片 $\\ln A$）。これを片対数プロットと呼びます。',
      },
      {
        q: 'Box-Cox 変換 $y^{(\\lambda)}=(y^{\\lambda}-1)/\\lambda$ で $\\lambda\\to0$ の極限はどの変換になりますか。',
        choices: ['$\\ln y$（対数変換）', '$y$ のまま（無変換）', '$1/y$（逆数）', '$\\sqrt y$（平方根）'],
        answer: 0,
        explain: '$\\lim_{\\lambda\\to0}(y^{\\lambda}-1)/\\lambda=\\ln y$。分子の $-1$ と分母の $\\lambda$ は、この極限で対数につながるように置かれています。だから Box-Cox は「無変換・平方根・対数・逆数」を1本のつまみで連続的に行き来できます。',
      },
      {
        q: '割合 $p$（$0<p<1$）を目的変数にするとき、そのまま直線を当てるのが不適切な理由は？',
        choices: [
          '予測が0未満や1超に飛び出しうるから。ロジット変換で $(0,1)$ を実数全体に写す',
          '割合は必ず正規分布するから',
          '割合には最小二乗法が定義できないから',
          '割合は対数をとらないと平均が計算できないから',
        ],
        answer: 0,
        explain: '直線は上下に限りなく伸びるので、$0$〜$1$ に収まるべき割合の予測がはみ出します。$\\mathrm{logit}(p)=\\ln\\frac{p}{1-p}$ は $(0,1)$ を実数直線全体に引き伸ばすのでこの破綻が起きず、逆変換のシグモイドが<a href="#/prep1/logistic">ロジスティック回帰</a>の中身になります。',
      },
      {
        q: '反応速度の温度依存 $\\ln k=a+b/T$ を直線化するとき、横軸に取るべきは？',
        choices: ['$1/T$', '$T$', '$T^2$', '$\\ln T$'],
        answer: 0,
        explain: '$\\ln k$ を $1/T$ に対して描くと傾き $b$、切片 $a$ の直線になります（アレニウス／ファントホッフ・プロット）。',
      },
    ],
  };
})();
