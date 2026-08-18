'use strict';
/* 多変量解析 */
(function () {
  const T = (window.STATS_TOPICS = window.STATS_TOPICS || []);
  const S = () => window.Stats;
  const P = () => window.Plot;

  /* 2x2 対称行列の固有値・固有ベクトル（PCA・相関で使用） */
  function eig2(a, b, c, d) {
    // 行列 [[a,b],[c,d]]（対称なら b=c）
    const tr = a + d, det = a * d - b * c;
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    const vecFor = l => {
      // (a-l)x + b y = 0 → v = [b, l-a] （bが0でなければ）
      let vx, vy;
      if (Math.abs(b) > 1e-9) { vx = b; vy = l - a; }
      else { vx = l - d; vy = c; if (Math.abs(vx) < 1e-9 && Math.abs(vy) < 1e-9) { vx = 1; vy = 0; } }
      const n = Math.hypot(vx, vy) || 1;
      return [vx / n, vy / n];
    };
    return { l1, l2, v1: vecFor(l1), v2: vecFor(l2) };
  }

  /* --- 1. 相関と共分散 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'correlation', title: '相関・共分散と散布の形',
    summary: '相関係数が散布図の「楕円の細さと傾き」にどう対応するかを、相関を連続的に変えながら見ます。',
    body: `
<p>多変量解析の出発点は、変数どうしの関係を測る<strong>共分散</strong>と<strong>相関係数</strong>です。</p>
<p>$$ \\mathrm{Cov}(X,Y)=\\frac{1}{n-1}\\sum (x_i-\\bar{x})(y_i-\\bar{y}),\\qquad r=\\frac{\\mathrm{Cov}(X,Y)}{s_X s_Y} $$</p>
<p>相関係数 $r$ は $-1 \\le r \\le 1$ に標準化された値で、散布図の形と対応します。</p>
<ul>
<li>$r \\to 1$：右上がりの細い直線状</li>
<li>$r \\to 0$：円形に散らばる（無相関）</li>
<li>$r \\to -1$：右下がりの細い直線状</li>
</ul>
<h3>なぜ $-1\\le r\\le1$ に収まるか</h3>
<p>相関は「中心化した2つのデータベクトル $\\tilde{\\boldsymbol x},\\tilde{\\boldsymbol y}$ のなす角の余弦」です：$r=\\dfrac{\\tilde{\\boldsymbol x}\\cdot\\tilde{\\boldsymbol y}}{\\|\\tilde{\\boldsymbol x}\\|\\,\\|\\tilde{\\boldsymbol y}\\|}=\\cos\\theta$（<a href="#/math/vectors-matrices">内積の幾何</a>）。余弦は必ず $[-1,1]$ なので $r$ もそこに収まり、$|r|=1$ は2ベクトルが同一直線上＝完全な直線関係、$r=0$ は直交を意味します。これは<strong>コーシー・シュワルツの不等式</strong> $|\\tilde{\\boldsymbol x}\\cdot\\tilde{\\boldsymbol y}|\\le\\|\\tilde{\\boldsymbol x}\\|\\,\\|\\tilde{\\boldsymbol y}\\|$ そのもので、相関の上下限が保証される理由です。$r^2$ が単回帰の<a href="#/prep1/regression">決定係数</a>に一致するのも、この「射影」の見方から自然に出ます。</p>
<h3>区間推定：$r$ をそのまま扱ってはいけない</h3>
<p>$r$ の標本分布は $\\rho$ が $\\pm1$ に近いほど押しつぶされて非対称になるため、$r\\pm1.96\\,\\mathrm{SE}$ という素朴な区間は使えません（区間が $\\pm1$ をはみ出すことすらあります）。<strong>フィッシャーの $z$ 変換</strong>で対称・等分散な世界に移してから区間を作り、戻します。</p>
<p>$$ z=\\tfrac12\\ln\\frac{1+r}{1-r}=\\mathrm{artanh}\\,r\\ \\sim\\ \\mathcal N\\!\\left(\\mathrm{artanh}\\,\\rho,\\ \\frac{1}{n-3}\\right) $$</p>
<p>手順は3段：①$z$ に移す ②$z\\pm z_{\\alpha/2}/\\sqrt{n-3}$ で区間を作る ③$\\tanh$ で $r$ の世界に戻す。<strong>数値で1本通す</strong>と、$r=0.6,\\ n=30$ なら $z=0.693$、$\\pm1.96/\\sqrt{27}=\\pm0.377$ で $[0.316,\\,1.070]$、$\\tanh$ に戻して $\\rho$ の95%区間は $[0.306,\\ 0.790]$。点推定が $0.6$ でも区間はこれだけ広い——$n=30$ 程度で相関の値を細かく論じるのは危うい、と数字が教えてくれます。戻した区間が $r$ を中心に<strong>非対称</strong>（下側に0.29、上側に0.19）になる点にも注目してください。</p>
<h3>順位相関と偏相関</h3>
<p>ピアソンの $r$ が使いにくい場面のための道具が2つあります。</p>
<p><strong>スピアマンの順位相関 $r_s$</strong>：値を順位に置き換えてからピアソンの $r$ を計算するだけ。外れ値に強く、<strong>単調でありさえすれば</strong>（直線でなくても）1に近づきます。$y=e^x$ のような単調な曲線関係は、ピアソンだと $r<1$ ですがスピアマンはちょうど $1$。タイがなければ $r_s=1-\\dfrac{6\\sum d_i^2}{n(n^2-1)}$（$d_i$ は順位差）と簡単に計算できます。もう1つの<strong>ケンドールの $\\tau$</strong> は「順序が一致する組の割合」で定義され、解釈が直接的で小標本に強い一方、$r_s$ より値が小さめに出ます。</p>
<p><strong>偏相関</strong>：第3の変数 $Z$ の影響を取り除いたうえでの $X,Y$ の相関です。</p>
<p>$$ r_{XY\\cdot Z}=\\frac{r_{XY}-r_{XZ}r_{YZ}}{\\sqrt{1-r_{XZ}^2}\\sqrt{1-r_{YZ}^2}} $$</p>
<p>「$X,Y$ をそれぞれ $Z$ で回帰した残差どうしの相関」と同じもので、$Z$ で説明できる部分を両方から抜いてから比べる、という意味です。アイスの売上と水難事故（$r$ が高い）から気温 $Z$ を抜くと $r_{XY\\cdot Z}\\approx0$ になる——これが「交絡を統計的に調整する」の最小の形で、<a href="#/prep1/multiple-regression">重回帰</a>の偏回帰係数が測っているものと同じ発想です。ただし<strong>調整してよい変数かどうかは統計では決まりません</strong>（中間変数を調整すると効果が消える）。何を入れるかは<a href="#/prep1/causal-inference">因果構造</a>の側の判断です。</p>
<h3>相関を読み違える典型パターン</h3>
<p>相関は<strong>直線的な</strong>関係しか測れません（<a href="#/prep1/joint-distribution">無相関≠独立</a>：$Y=X^2$ は $r\\approx0$ でも完全従属）。実務で頻出の落とし穴を挙げます。<strong>(1) 外れ値</strong>：1点で $r$ が大きく動く（$\\bar x,\\bar y$ と2乗和に効くため）→ロバスト相関やスピアマンの順位相関。<strong>(2) 範囲制限</strong>：$x$ の範囲を狭く絞ると相関が過小評価される（数値でも $x$ を $[-0.5,0.5]$ に制限すると $r$ が0.70→0.25へ低下）——合格者だけで「入試と成績は無相関」と結論する誤り。<strong>(3) 層別の逆転（シンプソンのパラドックス）</strong>：全体では正でも群ごとに見ると負、が起こる。<strong>(4) 相関≠因果</strong>：第3の変数（交絡）が両方を動かしているだけかもしれません。散布図を必ず描き、$r$ の1数字だけで判断しないのが鉄則です。</p>
<div class="note">相関を1や−1に近づけると点群は直線状に、0に近づけると円状になります。下で r を動かし、点群の楕円が細くなったり傾いたりする様子を確かめてください。$r$ は楕円の「細さ」に対応し、傾きそのものではない点に注意（傾きは<a href="#/prep1/regression">回帰</a>の話）。</div>`,
    demo: {
      task: {
        q: '$r=0.7$ に固定してデータ数を20と300で比べ、「再サンプル」を何度か押してください。標本相関はどれくらいぶれますか。次に $r$ を0にして同じことをすると？',
        a: '<p><strong>$n=20$</strong>：標本 $r$ は設定値0.7のまわりで <strong>0.4〜0.9</strong> ほども動きます。<strong>$n=300$</strong>：0.65〜0.75 程度に収まります。</p><p>フィッシャーの $z$ 変換で見ると、$\\mathrm{SD}(z)=1/\\sqrt{n-3}$ なので $n=20$ で $0.243$、$n=300$ で $0.058$ ——<strong>$n=20$ で相関の値を細かく論じるのは危うい</strong>と分かります。$r=0.7$ の95%区間は $n=20$ なら約 $[0.37,\\ 0.87]$ もの幅です。</p><p><strong>$r=0$ にすると</strong>：$n=20$ では $\\pm0.45$ 程度まで簡単に振れます。<strong>「相関がないのに、標本では0.4の相関が出る」ことは珍しくない</strong>——小標本で見つけた相関は、まず偶然を疑うべきです。</p><p>もう1つ確かめてほしいこと：$r$ が同じでも、<strong>データ数が違うと散布図の印象がまるで違います</strong>。$n=20$ で $r=0.7$ は「そこそこ乗っている」ように見えるのに、$n=300$ では「かなりばらついている」ように見える。<strong>目視の印象は $n$ に引きずられる</strong>ので、$r$ の値と信頼区間の両方で判断してください。',
      },
      note: '相関を1や−1に近づけると点群は直線状に、0に近づけると円状になります。青い楕円は分布の広がり（等確率線）を表します。',
      controls: [
        { type: 'range', id: 'r', label: '相関係数 r', min: -0.98, max: 0.98, step: 0.02, value: 0.7 },
        { type: 'range', id: 'n', label: 'データ数', min: 20, max: 300, step: 20, value: 120 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(64 + (p.reseed | 0) * 91);
        const r = p.r;
        const n = Math.round(p.n);
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          xs.push(z1);
          ys.push(r * z1 + Math.sqrt(1 - r * r) * z2);
        }
        const pl = Pl.make(canvas, { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5 });
        pl.clear(); pl.axes({ xLabel: 'X', yLabel: 'Y' });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3, alpha: 0.5 });
        // 共分散楕円（2σ）
        const e = eig2(1, r, r, 1);
        const ellipse = [];
        for (let a = 0; a <= 60; a++) {
          const t = a / 60 * Math.PI * 2;
          const s1 = 2 * Math.sqrt(e.l1) * Math.cos(t), s2 = 2 * Math.sqrt(e.l2) * Math.sin(t);
          ellipse.push([s1 * e.v1[0] + s2 * e.v2[0], s1 * e.v1[1] + s2 * e.v2[1]]);
        }
        pl.polygon(ellipse, { stroke: Pl.colors[1], width: 2 });
        const rEmp = st.corr(xs, ys);
        pl.text(-3.5, 3.5, '設定 r = ' + r.toFixed(2) + '　（標本 r = ' + rEmp.toFixed(2) + '）', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 2. 主成分分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'pca', title: '主成分分析（PCA）',
    summary: '相関のあるデータを「最もばらつく方向」に座標変換して次元を圧縮するPCAを、第1・第2主成分の軸として描きます。',
    body: `
<p><strong>主成分分析（PCA）</strong>は、相関のある多変数データを、情報（分散）を最大限保ちながら少数の新しい軸（主成分）で表現し直す手法です。</p>
<p>第1主成分は<strong>データが最もばらつく方向</strong>、第2主成分はそれと直交する中で次にばらつく方向……と選びます。数学的には、共分散行列 $\\Sigma$ の<strong>固有ベクトル</strong>が主成分の方向、<strong>固有値</strong>がその方向の分散です。</p>
<p>$$ \\Sigma\\, \\boldsymbol{v}_k = \\lambda_k \\boldsymbol{v}_k,\\qquad \\text{寄与率} = \\frac{\\lambda_k}{\\sum_j \\lambda_j} $$</p>
<p>寄与率は「その主成分がデータ全体の何割の情報を説明するか」。第1・第2主成分の寄与率の合計（累積寄与率）が高ければ、2次元の散布図でデータのほぼ全体像を捉えられます。</p>
<p><strong>なぜ固有ベクトルなのか</strong>：分散 $\\boldsymbol w^\\top\\Sigma\\boldsymbol w$ を制約 $\\|\\boldsymbol w\\|=1$ のもとで最大化すると、ラグランジュ未定乗数法から $\\Sigma\\boldsymbol w=\\lambda\\boldsymbol w$ が出ます。つまり分散を最大にする方向は $\\Sigma$ の最大固有値の固有ベクトルで、その方向の分散が固有値 $\\lambda$ そのもの。<a href="#/math/eigen">固有値・固有ベクトル</a>がそのまま主成分になります。</p>
<h3>主成分をいくつ残すか・どう読むか</h3>
<p>残す成分数の実務的な目安は3つ。<strong>(1) 累積寄与率</strong>：目標（例：80%）に達するまで。<strong>(2) スクリープロット</strong>：固有値を大きい順に折れ線で描き、急な下りが平坦に変わる「肘（エルボー）」の手前まで。<strong>(3) カイザー基準</strong>：標準化（相関行列）ベースなら固有値1以上——「元の変数1個分以上の情報を持つ成分」だけを残す、という意味です。どれも絶対の規則ではなく、可視化が目的なら2〜3成分、回帰の前処理なら<a href="#/prep1/crossval">交差検証</a>で決める、と目的に合わせます。</p>
<p>軸の解釈は<strong>負荷量</strong>（主成分と各変数の相関）で行います。たとえば「PC1は全変数に正の負荷 → 全体の大きさ（サイズ因子）」「PC2は変数群で符号が分かれる → 対比（パターンの違い）」のように意味づけします。標本のスコアと変数の負荷量を1枚に重ねた<strong>バイプロット</strong>が定番の読み方で、近い方向を向く変数どうしは正の相関、反対向きは負の相関と読めます。</p>
<h3>前提条件と、崩れたときの影響</h3>
<ul>
<li><strong>スケール依存</strong>：分散の大きい（単位の大きい）変数が主成分を支配する。単位がばらばらなら<strong>標準化</strong>して相関行列に対して行う。</li>
<li><strong>線形性</strong>：直線的な構造しか捉えない。曲がった構造には非線形手法（カーネルPCA・多様体学習）。</li>
<li><strong>外れ値に敏感</strong>：分散を膨らませ主成分方向を歪める → 頑健PCA。</li>
<li><strong>「分散大＝重要」とは限らない</strong>：分類など目的があるとき、分散最大の方向が有用とは限らない。ラベルを使う<a href="#/prep1/lda">LDA</a>や<a href="#/chemo/pls">PLS</a>と対照的。</li>
</ul>
<p>PCA は仮説検定ではなく<strong>探索的</strong>な手法です。寄与率が高い主成分でも下流のタスクに有用とは限らず、解釈は各変数の負荷量（主成分への寄与）と併せて行います。</p>
<div class="note">下のデータに対し、赤い矢印が第1主成分（最もばらつく方向）、緑が第2主成分。相関を強めると第1主成分に分散が集中し、第1主成分だけで大部分を説明できる＝次元圧縮が効く状態になります。</div>`,
    demo: {
      note: '矢印の長さが各主成分の分散（固有値）。相関を強めると第1主成分（赤）が長くなり寄与率が上がる＝2変数を1軸にまとめやすくなります。',
      task: {
        q: '相関 r を 0 付近から 0.95 まで上げていくと、第1主成分の寄与率はどこまで上がりますか。また <strong>r を負に振った</strong>とき、寄与率と矢印の向きはそれぞれどうなりますか。',
        a: '<p>r が 0 に近いと2つの矢印はほぼ同じ長さで、寄与率は 50% 前後。r を 0.95 まで上げると第1主成分に分散が集中し、寄与率は <strong>97〜98%</strong> まで上がります（標準化した2変数では寄与率がちょうど $(1+|r|)/2$ になります）。</p><p>r を負に振ると、<strong>寄与率は同じだけ上がりますが、第1主成分の矢印は逆向きの対角線（右下がり）を向きます</strong>。寄与率が $|r|$ だけで決まるのは、相関の符号が「どちらの対角線か」を決めるだけで、楕円の細長さには効かないからです。$r=+0.8$ と $r=-0.8$ で寄与率が一致することを確かめてください。</p>',
      },
      controls: [
        { type: 'range', id: 'r', label: '変数間の相関', min: -0.95, max: 0.95, step: 0.05, value: 0.75 },
        { type: 'range', id: 'scale', label: '変数2のスケール', min: 0.3, max: 2, step: 0.1, value: 1 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(202 + (p.reseed | 0) * 43);
        const r = p.r, sc = p.scale;
        const n = 150;
        const xs = [], ys = [];
        for (let i = 0; i < n; i++) {
          const z1 = st.randn(rand), z2 = st.randn(rand);
          xs.push(1.6 * z1);
          ys.push(sc * (r * z1 + Math.sqrt(1 - r * r) * z2) * 1.6);
        }
        const mx = st.mean(xs), my = st.mean(ys);
        const sxx = st.cov(xs, xs), syy = st.cov(ys, ys), sxy = st.cov(xs, ys);
        const e = eig2(sxx, sxy, sxy, syy);
        const total = e.l1 + e.l2;
        const pl = Pl.make(canvas, { xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
        pl.clear(); pl.axes({ xLabel: '変数1', yLabel: '変数2' });
        pl.scatter(xs.map((x, i) => [x, ys[i]]), { color: Pl.colors[0], r: 3, alpha: 0.45 });
        const s1 = 2.2 * Math.sqrt(e.l1), s2 = 2.2 * Math.sqrt(e.l2);
        pl.arrow(mx, my, mx + e.v1[0] * s1, my + e.v1[1] * s1, { color: Pl.colors[1], width: 3 });
        pl.arrow(mx, my, mx + e.v2[0] * s2, my + e.v2[1] * s2, { color: Pl.colors[2], width: 3 });
        pl.legend([
          { label: '第1主成分 (' + (e.l1 / total * 100).toFixed(0) + '%)', color: Pl.colors[1] },
          { label: '第2主成分 (' + (e.l2 / total * 100).toFixed(0) + '%)', color: Pl.colors[2] },
        ]);
      },
    },
  });

  /* --- 3. 判別分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'lda', title: '線形判別分析（LDA）',
    summary: '2つのグループを最もよく分ける直線（判別境界）を、群間の差と群内のばらつきの比を最大化する形で可視化します。',
    body: `
<p><strong>線形判別分析（LDA）</strong>は、2つ以上のグループを最もよく分離する軸（判別関数）を見つける手法です。フィッシャーのアイデアは明快で、<strong>「群間のばらつきを大きく、群内のばらつきを小さく」</strong>する方向を選びます。</p>
<p>$$ \\text{最大化}\\quad J(\\boldsymbol{w}) = \\frac{\\boldsymbol{w}^\\top S_B \\boldsymbol{w}}{\\boldsymbol{w}^\\top S_W \\boldsymbol{w}} = \\frac{\\text{群間分散}}{\\text{群内分散}} $$</p>
<p>PCAが「ラベルを無視して最もばらつく方向」を探すのに対し、LDAは「ラベルを分けるのに最も役立つ方向」を探します。目的が違うので、選ばれる軸も異なります。</p>
<p><strong>なぜこの向きになるか</strong>：フィッシャー基準 $J(\\boldsymbol w)$ を最大化すると一般化固有値問題 $S_B\\boldsymbol w=\\lambda S_W\\boldsymbol w$ に帰着し、2群では解が $\\boldsymbol w\\propto S_W^{-1}(\\bar{\\boldsymbol x}_1-\\bar{\\boldsymbol x}_2)$。「群平均の差を、群内のばらつき（共分散 $S_W$）で割り引いた方向」に判別軸が向く、と読めます。</p>
<h3>前提条件と、崩れたときの影響</h3>
<ul>
<li><strong>各群が等しい共分散をもつ多変量正規</strong>：この前提が成り立てば LDA は最適（ベイズ）な線形分類器になる。</li>
<li><strong>共分散が群で異なる</strong>と本来の境界は<strong>曲線</strong>になる → 二次判別分析(QDA)。</li>
<li><strong>正規性が疑わしい</strong>ときは、仮定の少ない<a href="#/prep1/logistic">ロジスティック回帰</a>や<a href="#/prep1/svm">SVM</a>が頑健。LDAは分布を仮定するぶん、成り立てば効率的だが外れると偏る（頑健性↔効率のトレードオフ）。</li>
<li>外れ値・クラス不均衡は平均・共分散としきい値を歪める。</li>
</ul>
<h3>有意性と実質的な意味</h3>
<p>分類器の良し悪しを<strong>正解率だけで測らない</strong>こと：クラスが不均衡だと「多数派を常に選ぶ」だけで高い正解率が出ます。<a href="#/prep1/roc-auc">混同行列・ROC・AUC</a>で評価し、誤分類のコストや事前確率（プライア）を踏まえてしきい値を決めます。</p>
<div class="note">下の2群（青・オレンジ）に対し、黒い直線が判別境界。2群の中心を離す、または群内のばらつきを小さくすると分離が良くなり、誤分類（境界を越えた点）が減ります。境界に垂直な方向がフィッシャーの判別軸です。</div>`,
    demo: {
      task: {
        q: '2群の中心距離を4、群内のばらつきを1.2に設定したときの理論上の最良誤分類率はいくつですか。次に距離を1に下げた場合と、ばらつきを3に上げた場合を比べてください。',
        a: '<p>誤分類率は $\\Phi(-\\Delta/2)$（$\\Delta$ はマハラノビス距離＝中心距離÷群内SD）で決まります。</p><ul><li>距離4・ばらつき1.2 → $\\Delta=3.33$、誤分類率 <strong>4.8%</strong></li><li>距離1・ばらつき1.2 → $\\Delta=0.83$、誤分類率 <strong>33.9%</strong></li><li>距離4・ばらつき3.0 → $\\Delta=1.33$、誤分類率 <strong>25.3%</strong></li></ul><p><strong>効いているのは距離そのものではなく「距離÷ばらつき」の比</strong>です。距離を4倍にしてもばらつきが3倍なら、判別しやすさはほとんど改善しません。</p><p>「群の並ぶ向き」を回してもこの誤分類率が変わらないことも確かめてください——LDAは座標の取り方に依存しない量（マハラノビス距離）で判別しているからです。分析の実務では「群を離す」より<strong>「測定のばらつきを減らす」ほうが効くことが多い</strong>のは、この比の形から読めます。',
      },
      note: '黒い直線が判別境界。群の中心距離を大きく、群内のばらつきを小さくすると、境界の反対側に紛れ込む誤分類点が減ります。',
      controls: [
        { type: 'range', id: 'dist', label: '2群の中心距離', min: 1, max: 8, step: 0.5, value: 4 },
        { type: 'range', id: 'spread', label: '群内のばらつき', min: 0.5, max: 3, step: 0.25, value: 1.2 },
        { type: 'range', id: 'angle', label: '群の並ぶ向き（度）', min: 0, max: 180, step: 10, value: 30 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(303 + (p.reseed | 0) * 59);
        const ang = p.angle * Math.PI / 180;
        const dir = [Math.cos(ang), Math.sin(ang)];
        const c0 = [-dir[0] * p.dist / 2, -dir[1] * p.dist / 2];
        const c1 = [dir[0] * p.dist / 2, dir[1] * p.dist / 2];
        const g0 = [], g1 = [];
        for (let i = 0; i < 50; i++) g0.push([c0[0] + st.randn(rand) * p.spread, c0[1] + st.randn(rand) * p.spread]);
        for (let i = 0; i < 50; i++) g1.push([c1[0] + st.randn(rand) * p.spread, c1[1] + st.randn(rand) * p.spread]);
        // 判別方向 w ∝ Sw^{-1}(m1-m0)。等方性なので w ∝ (m1-m0) = dir
        const m0 = [st.mean(g0.map(q => q[0])), st.mean(g0.map(q => q[1]))];
        const m1 = [st.mean(g1.map(q => q[0])), st.mean(g1.map(q => q[1]))];
        const w = [m1[0] - m0[0], m1[1] - m0[1]];
        const mid = [(m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2];
        const thr = w[0] * mid[0] + w[1] * mid[1];
        const pl = Pl.make(canvas, { xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
        pl.clear(); pl.axes({ xLabel: '変数1', yLabel: '変数2' });
        // 誤分類判定
        let err = 0;
        const classify = q => (w[0] * q[0] + w[1] * q[1]) > thr ? 1 : 0;
        g0.forEach(q => { if (classify(q) !== 0) err++; });
        g1.forEach(q => { if (classify(q) !== 1) err++; });
        pl.scatter(g0, { color: Pl.colors[0], r: 4, alpha: 0.7 });
        pl.scatter(g1, { color: Pl.colors[1], r: 4, alpha: 0.7 });
        // 判別境界：w·x = thr。方向 perp = (-w[1], w[0])
        const wn = Math.hypot(w[0], w[1]) || 1;
        const perp = [-w[1] / wn, w[0] / wn];
        const p1 = [mid[0] - perp[0] * 20, mid[1] - perp[1] * 20];
        const p2 = [mid[0] + perp[0] * 20, mid[1] + perp[1] * 20];
        pl.line([p1, p2], { color: Pl.ink, width: 2 });
        pl.legend([{ label: 'グループA', color: Pl.colors[0] }, { label: 'グループB', color: Pl.colors[1] }]);
        pl.text(-7, 7, '誤分類 ' + err + ' / 100 点', { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 4. クラスター分析（階層的） --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'clustering', title: '階層的クラスター分析',
    summary: '近いものから順に併合してデータの階層構造を作り、樹形図（デンドログラム）を「どの高さで切るか」で見ます。',
    body: `
<p><strong>階層的クラスター分析</strong>は、最初は各データを1つのクラスタとし、<strong>最も近いクラスタどうしを順に併合</strong>していく手法です。結果は<strong>デンドログラム（樹形図）</strong>で表され、「どの高さで枝を切るか」でクラスタ数を後から決められます。</p>
<p>クラスタ間の距離の測り方（連結法）にはいくつかあります。</p>
<table class="simple">
<tr><th>連結法</th><th>クラスタ間距離の定義</th></tr>
<tr><td>単連結法（最近隣）</td><td>最も近い点どうしの距離</td></tr>
<tr><td>完全連結法（最遠隣）</td><td>最も遠い点どうしの距離</td></tr>
<tr><td>群平均法</td><td>全ペアの平均距離</td></tr>
<tr><td>ウォード法</td><td>併合による分散増加が最小</td></tr>
</table>
<p>デンドログラムの<strong>縦軸（高さ）は併合が起きた距離</strong>で、低い位置でつながる点ほど似ています。ある高さで水平に切ると、それ未満でつながっている枝が1つのクラスタ——<strong>切る高さを変えるだけで $k$ を後から選べる</strong>のが、$k$ を先に決める<a href="#/prep1/kmeans">k-means</a>との大きな違いです。ウォード法は「併合でクラスタ内平方和がどれだけ増えるか」を最小化するので、実は<strong>k-meansと同じ基準の階層版</strong>——だから球状クラスタで両者は似た結果を出します。</p>
<h3>前提と、連結法の選び方（崩れたときの注意）</h3>
<p>結果は<strong>距離の定義（ユークリッド／相関／マンハッタン）と連結法の選択に強く依存</strong>し、唯一の正解はありません。連結法ごとの癖：<strong>単連結法</strong>は「最も近い1点」で繋ぐので鎖のように細長く伸びる<strong>チェイニング</strong>が起き、離れた塊が1本の橋でつながってしまう。<strong>完全連結法</strong>は逆にコンパクトな球状クラスタを好み外れ値に敏感。<strong>群平均・ウォード法</strong>は中庸で実務でよく使われます。共通の注意として、<strong>(1) スケール依存</strong>なので標準化が要る、<strong>(2) 教師なしゆえ「正しいクラスタ数」は決まらない</strong>——デンドログラムで大きく枝が離れる高さ（gap）や、コーフェン相関（樹形図が元の距離をどれだけ保つか）を手がかりにします。<strong>(3) 計算量が $O(n^2)$ 以上</strong>で大規模データには重い（その場合はk-means）。得られた樹形図は「1つの見方」であって真の構造の証明ではない、と捉えるのが安全です。</p>
<div class="note">下は少数の点を階層的に併合したデンドログラム。横の点線（切断線）を上下に動かすと、その高さで分かれるクラスタ数と色分けが変わります。低く切れば多く、高く切れば少ないクラスタになります。切る高さで $k$ を柔軟に選べる一方、「どこで切るのが正解か」は自動では決まらない点に注意してください。</div>`,
    demo: {
      task: {
        q: '切断の高さを最小(0.5)から最大(10)まで動かしてください。クラスタ数はどう変わりますか。「正しいクラスタ数」はデンドログラムのどこを見れば分かりますか。',
        a: '<p>切断を<strong>低くするほどクラスタ数は増え</strong>（まだ併合されていない細かい塊が残る）、<strong>高くするほど減って</strong>最後は1つになります。</p><p>「正しい数」を教えてくれるのは高さそのものではなく、<strong>枝の高さが急に飛ぶ場所</strong>です。ウォード法では枝の高さ＝併合によるクラスタ内平方和の増加量なので、<strong>高さが大きく跳ぶ＝本来離れているものを無理にくっつけた</strong>という合図。その手前で切ります。</p><p>逆に、高さがなだらかに続く区間で切るのは「どこで切っても大差ない＝はっきりした構造がない」ことを意味します。<strong>クラスタリングは常に何らかの答えを返しますが、その答えに意味があるとは限りません</strong>——デンドログラムの「跳び」を確認せずにクラスタ数を決めるのは危険です。シルエット係数やギャップ統計量など、別の基準と突き合わせるのが安全です。',
      },
      note: '点線（切断の高さ）を動かすと、線より下でつながっている点が同じクラスタ（同色）になります。切る高さでクラスタ数を柔軟に選べるのが階層法の利点です。',
      controls: [
        { type: 'range', id: 'cut', label: '切断の高さ', min: 0.5, max: 10, step: 0.25, value: 4 },
        { type: 'button', id: 'reseed', label: 'データ再生成' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(404 + (p.reseed | 0) * 73);
        // 3つの塊から12点生成
        const centers = [[-3, 0], [3, 1], [0, -3]];
        const pts = [];
        for (const c of centers) for (let i = 0; i < 4; i++) pts.push([c[0] + st.randn(rand) * 0.7, c[1] + st.randn(rand) * 0.7]);
        const N = pts.length;
        // 群平均法で階層併合。leaf の順序と併合高さを記録
        let clusters = pts.map((pt, i) => ({ id: i, members: [i], x: null }));
        const dist = (A, B) => {
          let s = 0, cnt = 0;
          for (const i of A.members) for (const j of B.members) { s += Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); cnt++; }
          return s / cnt;
        };
        const merges = [];
        while (clusters.length > 1) {
          let bi = 0, bj = 1, bd = Infinity;
          for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
            const d = dist(clusters[i], clusters[j]);
            if (d < bd) { bd = d; bi = i; bj = j; }
          }
          merges.push({ a: clusters[bi], b: clusters[bj], height: bd });
          const merged = { members: clusters[bi].members.concat(clusters[bj].members) };
          clusters = clusters.filter((_, k) => k !== bi && k !== bj);
          clusters.push(merged);
        }
        // leaf順序を決める（併合ツリーを辿る）
        const order = [];
        (function collect(node) {
          if (node.members.length === 1) { order.push(node.members[0]); return; }
          // 対応する merge を探す
          for (const m of merges) {
            const mm = m.a.members.concat(m.b.members);
            if (mm.length === node.members.length && mm.every(x => node.members.includes(x))) {
              collect({ members: m.a.members }); collect({ members: m.b.members }); return;
            }
          }
          node.members.forEach(x => order.push(x));
        })({ members: clusters[0].members });
        const leafX = {};
        order.forEach((leaf, i) => { leafX[leaf] = i; });
        const maxH = Math.max.apply(null, merges.map(m => m.height)) * 1.1;
        const pl = Pl.make(canvas, { xmin: -0.7, xmax: N - 0.3, ymin: 0, ymax: maxH, pad: { left: 46, right: 16, top: 18, bottom: 52 } });
        pl.clear();
        pl.axes({ yLabel: '併合の距離（高さ）', xTicks: [], xFmt: () => '' });
        // 各クラスタのx座標（併合ノードは子の中点）
        const nodeX = {};
        order.forEach(leaf => { nodeX['L' + leaf] = leafX[leaf]; });
        const ctx = pl.ctx;
        // 切断高さで色分けするための、切断時点のクラスタ判定
        const cut = p.cut;
        // union-find で cut 未満の併合のみ結合
        const parent = pts.map((_, i) => i);
        const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
        for (const m of merges) if (m.height < cut) { const ra = find(m.a.members[0]), rb = find(m.b.members[0]); if (ra !== rb) parent[ra] = rb; }
        const rootColor = {};
        let colorIdx = 0;
        const colorOf = leaf => { const r = find(leaf); if (rootColor[r] === undefined) rootColor[r] = colorIdx++; return Pl.colors[rootColor[r] % Pl.colors.length]; };
        // デンドログラムの枝を描画
        const nodeInfo = {}; // key -> {x, height}
        order.forEach(leaf => { nodeInfo['L' + leaf] = { x: leafX[leaf], h: 0, members: [leaf] }; });
        let mi = 0;
        const keyOf = members => 'M' + members.slice().sort((a, b) => a - b).join('_');
        order.forEach(leaf => { nodeInfo[keyOf([leaf])] = { x: leafX[leaf], h: 0, members: [leaf] }; });
        for (const m of merges) {
          const ka = keyOf(m.a.members), kb = keyOf(m.b.members);
          const na = nodeInfo[ka], nb = nodeInfo[kb];
          if (!na || !nb) continue;
          const h = m.height;
          const col = (h < cut) ? colorOf(m.a.members[0]) : Pl.gray;
          ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pl.X(na.x), pl.Y(na.h)); ctx.lineTo(pl.X(na.x), pl.Y(h));
          ctx.lineTo(pl.X(nb.x), pl.Y(h)); ctx.lineTo(pl.X(nb.x), pl.Y(nb.h));
          ctx.stroke();
          const merged = m.a.members.concat(m.b.members);
          nodeInfo[keyOf(merged)] = { x: (na.x + nb.x) / 2, h, members: merged };
          mi++;
        }
        // 葉のマーカー
        order.forEach(leaf => {
          ctx.fillStyle = colorOf(leaf);
          ctx.beginPath(); ctx.arc(pl.X(leafX[leaf]), pl.Y(0), 4, 0, Math.PI * 2); ctx.fill();
        });
        // 切断線
        pl.hline(cut, { color: Pl.colors[1], dash: [6, 4], label: '切断 h=' + cut.toFixed(1) });
        const nClusters = new Set(pts.map((_, i) => find(i))).size;
        pl.text(N - 0.3, maxH, nClusters + ' クラスタに分割', { align: 'right', baseline: 'top', dx: -6, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });

  /* --- 5. 因子分析 --- */
  T.push({
    section: 'prep1', group: '多変量解析', id: 'factor', title: '因子分析（潜在変数）',
    summary: '観測された多数の変数の背後にある「共通因子」を推定する考え方を、共通因子と独自因子の分解として見ます。',
    body: `
<p><strong>因子分析</strong>は、多数の観測変数の相関の背後に、少数の<strong>共通因子（潜在変数）</strong>があると仮定してその構造を推定します。例：5教科の点数の背後に「文系能力」「理系能力」という2因子を想定する、など。</p>
<p>各観測変数 $x_j$ は、共通因子 $f$ と、その変数固有の<strong>独自因子</strong> $u_j$ の和で表されます。</p>
<p>$$ x_j = \\underbrace{\\lambda_{j1}f_1 + \\lambda_{j2}f_2 + \\cdots}_{\\text{共通因子}} + \\underbrace{u_j}_{\\text{独自因子}} $$</p>
<p>係数 $\\lambda_{jk}$ は<strong>因子負荷量</strong>で、「変数 $x_j$ が因子 $f_k$ とどれだけ強く結びつくか」を表します。</p>
<h3>共分散を「共通＋独自」に分解する（PCAとの違い）</h3>
<p>モデルを行列で書くと $\\boldsymbol x=\\Lambda\\boldsymbol f+\\boldsymbol u$。因子と誤差が無相関で標準化されているとすると、観測変数の<strong>相関行列がきれいに分解</strong>されます：</p>
<p>$$ \\Sigma=\\Lambda\\Lambda^\\top+\\Psi $$</p>
<p>$\\Lambda\\Lambda^\\top$ が「共通因子で説明される相関」、対角行列 $\\Psi$ が「各変数<em>固有</em>の分散（独自性）」。各変数の分散のうち共通因子で説明される割合が<strong>共通性 $h_j^2=\\sum_k\\lambda_{jk}^2$</strong> で、標準化すれば $h_j^2+(\\text{独自性})=1$。ここが<a href="#/prep1/pca">PCA</a>との本質的な違いです——<strong>PCAは全分散（対角も含む）を説明しようとする</strong>のに対し、<strong>因子分析は最初から独自分散 $\\Psi$ を脇に置き、変数間で<em>共有</em>される相関だけをモデル化</strong>します。だから「観測変数の背後の潜在的な原因」を探る目的には因子分析、単に次元を落として要約したいだけならPCA、という使い分けになります。</p>
<h3>どう推定するか、いくつ因子を立てるか</h3>
<p>$\\Sigma=\\Lambda\\Lambda^\\top+\\Psi$ を満たす $\\Lambda,\\Psi$ を探すのが推定です。代表的な流儀が2つあります。</p>
<table class="simple">
<tr><th>方法</th><th>やること</th><th>性格</th></tr>
<tr><td><strong>主因子法</strong></td><td>相関行列の対角を1でなく<strong>共通性の推定値</strong>（例：その変数を他の全変数で回帰した $R^2$）に置き換えてから固有値分解し、共通性を更新して反復</td><td>分布の仮定が要らず頑健。適合度の検定はできない</td></tr>
<tr><td><strong>最尤法</strong></td><td>多変量正規を仮定して尤度を最大化</td><td>因子数の<strong>$\\chi^2$ 適合度検定</strong>や情報量規準が使える。正規性の逸脱に弱い</td></tr>
</table>
<p>対角を共通性に差し替えるところが、対角を1のまま使う<a href="#/prep1/pca">PCA</a>との計算上の分岐点です——「各変数の分散のうち、共通因子で説明される分だけを分解の対象にする」という因子分析の思想が、この一手に表れています。</p>
<p><strong>因子数の決め方</strong>は、固有値1以上（カイザー基準）やスクリープロットに加えて、因子分析では次の2つがよく効きます。<strong>平行分析</strong>：同じサイズの<em>無相関な</em>乱数データから固有値を何度も生成し、実データの固有値がその分布を上回る分だけ採用する——「偶然でもこれくらいは出る」という基準線を実測で引く方法で、カイザー基準より過大採用が起きにくい。<strong>解釈可能性</strong>：どの因子にも高く載る変数がなかったり、1変数だけの因子ができたりしたら因子数が多すぎる合図です。最尤法なら $\\chi^2$ 検定で「$k$ 因子で足りるか」を直接検定できますが、$n$ が大きいと些細なズレでも棄却されるため、RMSEA など当てはまりの<em>程度</em>を見る指標と併用します。</p>
<h3>回転：不定性を「解釈しやすさ」で1つに決める</h3>
<p>解が回転で不定だということは、裏を返せば<strong>好きな向きを選んでよい</strong>ということです。そこで「単純構造」——各変数が<em>どれか1つ</em>の因子にだけ高く載る状態——に近づける回転をかけます。</p>
<ul>
<li><strong>直交回転（バリマックス）</strong>：因子どうしの直交（無相関）を保ったまま、負荷量の二乗の分散を最大化して0と1に振り分ける。因子が互いに独立という解釈を保てる。</li>
<li><strong>斜交回転（プロマックス・オブリミン）</strong>：因子間の相関を許す。心理尺度や官能評価のように「背後の概念どうしが実際に相関している」場面ではこちらが自然で、因子間相関そのものも推定結果として読めます。</li>
</ul>
<p>斜交回転では<strong>パターン行列</strong>（他因子を統制した偏回帰係数にあたる。解釈はこちらを見る）と<strong>構造行列</strong>（変数と因子の単純相関）が一致しなくなるので、どちらの表を見ているのかを必ず確認してください。回転は<strong>当てはまり（共通性・$\\Sigma$ の再現）をまったく変えません</strong>——変わるのは見え方だけで、「回転したら適合が良くなった」ということは原理的に起こりません。</p>
<h3>前提と、崩れたときの注意</h3>
<p>因子分析には注意点が多い手法です。<strong>(1) 解は回転で不定</strong>：$\\Lambda$ を直交回転 $\\Lambda R$ しても $\\Lambda R R^\\top\\Lambda^\\top=\\Lambda\\Lambda^\\top$ で当てはまりは同じ——だから「解釈しやすさ」で回転を選ぶ（<a href="#/prep1/path-analysis">バリマックス等</a>）が、これは数学でなく<strong>解釈の選択</strong>で、恣意性が入ります。<strong>(2) 因子数の決定</strong>：固有値1以上（カイザー基準）・スクリープロット・平行分析などで決めるが決定打はなく、結果が大きく変わります。<strong>(3) 線形・多変量正規の仮定</strong>（最尤推定の場合）。<strong>(4) ヘイウッドケース</strong>：独自性が負になる不適解が出ることがあり、モデルや因子数の見直しが要ります。「因子に名前をつけた」ことが実在の証明ではない——探索的因子分析はあくまで仮説生成で、確認には別データでの<strong>確認的因子分析（CFA）</strong>が必要です。</p>
<div class="note">下は変数ごとの分散を「共通因子で説明される部分（共通性 $h_j^2$）」と「独自因子（誤差）」に分解した積み上げ図。共通性を上げると、変数群が少数の共通因子でよく説明できる（＝因子分析が有効な）状態になります。共通性が低い変数は「みんなと相関しない一匹狼」で、因子でまとめられない＝独自性が大きい様子です。</div>`,
    demo: {
      task: {
        q: '共通性の強さを 0.1 と 0.95 にしてください。積み上げ棒の青（共通因子で説明される分散）と灰（独自因子）の比はどうなりますか。共通性が低いとき、因子分析は何を意味しますか。',
        a: '<p>共通性0.1では棒のほとんどが<strong>灰色（独自性0.9）</strong>、0.95ではほとんどが<strong>青（共通性0.95）</strong>になります。共通性 $h_j^2$ と独自性 $1-h_j^2$ の和は常に1です。</p><p><strong>共通性が低いとき、因子分析は失敗しています。</strong>「観測変数の背後に共通の因子がある」というモデルの前提そのものが成り立っておらず、各変数はほぼ独立に動いている。この状態で無理に因子を抽出しても、解釈できる構造は出てきません。</p><p>実務の目安は<strong>共通性 $0.3$ 未満の変数は落とすか、因子数を見直す</strong>。逆に共通性が $1.0$ を超えてしまう（<strong>ヘイウッドケース</strong>）のも異常で、因子数が多すぎる・標本が小さすぎる・データが因子モデルに合っていない、のいずれかを疑います。<a href="#/prep1/pca">PCA</a>との違いはまさにここで、PCAは対角を1のまま使うので「共通性が低い」という診断自体が存在しません。',
      },
      note: '青が共通因子で説明される分散（共通性）、灰が各変数独自の分散（独自性）。共通性が高いほど、背後の少数因子でデータをうまくまとめられます。',
      controls: [
        { type: 'range', id: 'commonality', label: '共通性の強さ', min: 0.1, max: 0.95, step: 0.05, value: 0.6 },
        { type: 'range', id: 'nvars', label: '観測変数の数', min: 3, max: 8, step: 1, value: 6 },
        { type: 'button', id: 'reseed', label: '再サンプル' },
      ],
      draw(canvas, p) {
        const st = S(), Pl = P();
        const rand = st.rng(505 + (p.reseed | 0) * 83);
        const m = Math.round(p.nvars);
        const items = [];
        for (let i = 0; i < m; i++) {
          const comm = Math.min(0.98, Math.max(0.02, p.commonality + (rand() - 0.5) * 0.25));
          items.push({ common: comm, unique: 1 - comm });
        }
        const pl = Pl.make(canvas, { xmin: 0.3, xmax: m + 0.7, ymin: 0, ymax: 1.05 });
        pl.clear();
        pl.axes({ xLabel: '観測変数', yLabel: '分散の割合', xTicks: [], xFmt: () => '', yTicks: [0, 0.25, 0.5, 0.75, 1] });
        const ctx = pl.ctx;
        items.forEach((it, i) => {
          const x = i + 1;
          // 共通性（下）
          pl.bars([{ x0: x - 0.32, x1: x + 0.32, y: it.common }], { color: Pl.colors[0], alpha: 0.85 });
          // 独自性（上に積む）
          const x0 = pl.X(x - 0.32), x1 = pl.X(x + 0.32);
          ctx.fillStyle = Pl.gray; ctx.globalAlpha = 0.55;
          ctx.fillRect(x0, pl.Y(1), Math.max(1, x1 - x0 - 1), pl.Y(it.common) - pl.Y(1));
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#475467'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          ctx.fillText('x' + (i + 1), pl.X(x), pl.Y(0) + 6);
        });
        const avgComm = st.mean(items.map(it => it.common));
        pl.legend([{ label: '共通性（共通因子）', color: Pl.colors[0] }, { label: '独自性（誤差）', color: Pl.gray }]);
        pl.text(0.3, 1.05, '平均共通性 = ' + avgComm.toFixed(2), { align: 'left', baseline: 'top', dx: 60, dy: 4, color: '#475467', size: 12.5 });
      },
    },
  });
})();
