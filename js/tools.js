/* =====================================================================
 * tools.js — 「触って理解する」インタラクティブ教材
 *
 * 提供ツール:
 *   FP3.Tools.sixCoefficients(host)  … 6つの係数シミュレーター
 *   FP3.Tools.cashflowBuilder(host)  … キャッシュフロー表ビルダー（実技頻出）
 *
 * いずれも DOM要素(host) を渡すとその中にUIを描画する。
 * インラインSVGで図を描き、スライダー/入力に連動して更新する。
 * ===================================================================== */
(function () {
  'use strict';
  var FP3 = window.FP3 || {};

  function yen(n) { return Math.round(n).toLocaleString('ja-JP'); }
  function man(n) { return Math.round(n).toLocaleString('ja-JP'); } // 万円単位の整数表示

  /* =================================================================
   * 1. 6つの係数シミュレーター
   *   利率 r(%) と 期間 n(年) を動かすと、6係数の値と
   *   「元になる金額」を当てはめた結果が連動して更新される。
   * ================================================================= */
  function sixCoefficients(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">🎫 6つの係数シミュレーター</div>' +
      '<p class="muted small">利率と年数を動かすと、6つの係数と計算結果がリアルタイムで変わります。金額を入れて「いくらになる？」を体感しましょう。</p>' +

      '<div class="tool__controls">' +
        '<label class="ctrl">金額（万円）<input id="sc-amt" class="input" type="number" value="100" min="1" step="10"></label>' +
        '<label class="ctrl">年数 n：<b><span id="sc-n-val">10</span>年</b>' +
          '<input id="sc-n" type="range" min="1" max="40" value="10"></label>' +
        '<label class="ctrl">年利 r：<b><span id="sc-r-val">3.0</span>％</b>' +
          '<input id="sc-r" type="range" min="0" max="10" step="0.1" value="3"></label>' +
      '</div>' +

      '<div id="sc-svg" class="tool__svg"></div>' +

      '<div class="table-scroll"><table class="cmp" id="sc-table">' +
        '<thead><tr><th>係数</th><th>意味（何を求める？）</th><th>係数の値</th><th>計算結果</th></tr></thead>' +
        '<tbody></tbody>' +
      '</table></div>' +
      '<p class="muted small">※ 実際の試験では「係数表」から数値を読み取って掛け算します。ここでは係数を自動計算しています。</p>';

    var amtEl = host.querySelector('#sc-amt');
    var nEl = host.querySelector('#sc-n');
    var rEl = host.querySelector('#sc-r');
    var nVal = host.querySelector('#sc-n-val');
    var rVal = host.querySelector('#sc-r-val');
    var tbody = host.querySelector('#sc-table tbody');
    var svgHost = host.querySelector('#sc-svg');

    function coeffs(r, n) {
      var g = Math.pow(1 + r, n);           // (1+r)^n
      var annuityFactor = r === 0 ? n : (g - 1) / r;
      return {
        shuka:   g,                                   // 終価係数
        genka:   1 / g,                               // 現価係数
        nenkinShuka: annuityFactor,                   // 年金終価係数
        gensai:  r === 0 ? 1 / n : r / (g - 1),       // 減債基金係数
        shihon:  r === 0 ? 1 / n : (r * g) / (g - 1), // 資本回収係数
        nenkinGenka: r === 0 ? n : (g - 1) / (r * g), // 年金現価係数
      };
    }

    function render() {
      var A = Number(amtEl.value) || 0;      // 万円
      var n = Number(nEl.value);
      var r = Number(rEl.value) / 100;
      nVal.textContent = n;
      rVal.textContent = (r * 100).toFixed(1);
      var c = coeffs(r, n);

      var rows = [
        ['終価係数', '今の' + man(A) + '万円は<b>' + n + '年後いくら</b>になる？', c.shuka, A * c.shuka, '万円になる'],
        ['現価係数', '' + n + '年後に' + man(A) + '万円にするには<b>今いくら</b>必要？', c.genka, A * c.genka, '万円が必要'],
        ['年金終価係数', '毎年' + man(A) + '万円を積立てると<b>' + n + '年後いくら</b>？', c.nenkinShuka, A * c.nenkinShuka, '万円貯まる'],
        ['減債基金係数', '' + n + '年後に' + man(A) + '万円貯めるには<b>毎年いくら</b>積立て？', c.gensai, A * c.gensai, '万円ずつ積立て'],
        ['資本回収係数', '今の' + man(A) + '万円を運用しながら' + n + '年で<b>毎年いくら</b>受取れる？', c.shihon, A * c.shihon, '万円ずつ受取り'],
        ['年金現価係数', '毎年' + man(A) + '万円を' + n + '年間受取るには<b>今いくら</b>必要？', c.nenkinGenka, A * c.nenkinGenka, '万円が必要'],
      ];
      tbody.innerHTML = rows.map(function (row) {
        return '<tr><td><b>' + row[0] + '</b></td><td class="small">' + row[1] + '</td>' +
          '<td style="text-align:right">' + row[2].toFixed(4) + '</td>' +
          '<td style="text-align:right;white-space:nowrap"><b>' + man(row[3]) + '</b> ' + row[4] + '</td></tr>';
      }).join('');

      drawSvg(A, A * c.shuka, n, r);
    }

    /* 終価（今→n年後）を2本の棒＋時間軸で図示 */
    function drawSvg(now, future, n, r) {
      var W = 320, H = 150;
      var maxV = Math.max(future, now) * 1.15;
      var baseY = 115, maxBarH = 78;
      var h0 = (now / maxV) * maxBarH;
      var h1 = (future / maxV) * maxBarH;
      svgHost.innerHTML =
        '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="現在と' + n + '年後の金額の比較">' +
        '<defs><linearGradient id="scg" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>' +
        '<line x1="20" y1="' + baseY + '" x2="' + (W - 20) + '" y2="' + baseY + '" stroke="var(--border)"/>' +
        // 現在
        '<rect x="55" y="' + (baseY - h0) + '" width="60" height="' + h0 + '" rx="4" fill="#94a3b8"/>' +
        '<text x="85" y="' + (baseY - h0 - 6) + '" text-anchor="middle" font-size="11" fill="var(--text)">' + man(now) + '万</text>' +
        '<text x="85" y="' + (baseY + 16) + '" text-anchor="middle" font-size="10" fill="var(--muted)">現在</text>' +
        // 矢印
        '<text x="' + (W / 2) + '" y="' + (baseY - 30) + '" text-anchor="middle" font-size="18">🎫→</text>' +
        '<text x="' + (W / 2) + '" y="' + (baseY - 12) + '" text-anchor="middle" font-size="9" fill="var(--muted)">×(1+' + (r * 100).toFixed(1) + '%)^' + n + '</text>' +
        // n年後
        '<rect x="205" y="' + (baseY - h1) + '" width="60" height="' + h1 + '" rx="4" fill="url(#scg)"/>' +
        '<text x="235" y="' + (baseY - h1 - 6) + '" text-anchor="middle" font-size="11" fill="var(--text)" font-weight="700">' + man(future) + '万</text>' +
        '<text x="235" y="' + (baseY + 16) + '" text-anchor="middle" font-size="10" fill="var(--muted)">' + n + '年後</text>' +
        '</svg>';
    }

    [amtEl, nEl, rEl].forEach(function (el) {
      el.addEventListener('input', render);
    });
    render();
  }

  /* =================================================================
   * 2. キャッシュフロー表ビルダー
   *   2つの必須公式を「自分で計算 → 答え合わせ」で身につける。
   *     ① n年後の金額 = 現在値 ×(1+変動率)^n
   *     ② 貯蓄残高   = 前年末残高 ×(1+運用率) + その年の年間収支
   * ================================================================= */
  function cashflowBuilder(host) {
    if (!host) return;
    host.classList.add('tool');

    // モデル（万円）。変動率・運用率つき。
    var incomeBase = 500;   // 給与収入（現在）
    var incomeRate = 0.01;  // 給与の変動率 1%
    var expenseBase = 420;  // 支出（現在）
    var expenseRate = 0.02; // 支出の変動率 2%
    var startSaving = 300;  // 現在の貯蓄残高
    var yieldRate = 0.01;   // 運用利率 1%
    var years = [0, 1, 2, 3]; // 現在=0年目 と 3年分

    // 正解を計算
    function inc(y) { return incomeBase * Math.pow(1 + incomeRate, y); }
    function exp(y) { return expenseBase * Math.pow(1 + expenseRate, y); }
    function balance(y) {
      // 各年: 前年残高×(1+運用率) + 年間収支（四捨五入を各年で行う簡易版）
      var b = startSaving;
      for (var i = 1; i <= y; i++) {
        var net = Math.round(inc(i)) - Math.round(exp(i));
        b = Math.round(b * (1 + yieldRate)) + net;
      }
      return b;
    }
    function net(y) { return Math.round(inc(y)) - Math.round(exp(y)); }

    // 穴埋め対象: 2年目の給与収入 / 1年目の年間収支 / 2年目の貯蓄残高
    var blanks = {
      inc2: Math.round(inc(2)),
      net1: net(1),
      bal2: balance(2),
    };

    host.innerHTML =
      '<div class="tool__head">🧮 キャッシュフロー表ビルダー</div>' +
      '<p class="muted small">実技頻出。<b>黄色いセル</b>を自分で計算して入力し、「答え合わせ」を押しましょう。' +
        '（単位：万円 / 給与変動率+1% / 支出変動率+2% / 運用利率+1%）</p>' +
      '<div class="table-scroll"><table class="cmp cf">' +
        '<thead><tr><th>項目</th>' + years.map(function (y) {
          return '<th>' + (y === 0 ? '現在' : y + '年後') + '</th>';
        }).join('') + '</tr></thead>' +
        '<tbody>' +
          // 給与収入（2年後を穴埋め）
          '<tr><td>給与収入<span class="cf__rate">+1%</span></td>' +
            years.map(function (y) {
              if (y === 2) return '<td><input class="cf-in" data-key="inc2" inputmode="numeric" placeholder="?"></td>';
              return '<td>' + man(inc(y)) + '</td>';
            }).join('') + '</tr>' +
          // 支出
          '<tr><td>生活費など支出<span class="cf__rate">+2%</span></td>' +
            years.map(function (y) { return '<td>' + man(exp(y)) + '</td>'; }).join('') + '</tr>' +
          // 年間収支（1年後を穴埋め）
          '<tr class="cf__net"><td>年間収支<span class="cf__hint">収入−支出</span></td>' +
            years.map(function (y) {
              if (y === 1) return '<td><input class="cf-in" data-key="net1" inputmode="numeric" placeholder="?"></td>';
              return '<td>' + man(net(y)) + '</td>';
            }).join('') + '</tr>' +
          // 貯蓄残高（2年後を穴埋め）
          '<tr class="cf__bal"><td>貯蓄残高<span class="cf__hint">前年×1.01＋収支</span></td>' +
            years.map(function (y) {
              if (y === 2) return '<td><input class="cf-in" data-key="bal2" inputmode="numeric" placeholder="?"></td>';
              return '<td>' + man(balance(y)) + '</td>';
            }).join('') + '</tr>' +
        '</tbody>' +
      '</table></div>' +
      '<div class="tool__actions">' +
        '<button class="btn btn--primary" id="cf-check">答え合わせ</button>' +
        '<button class="btn btn--outline" id="cf-reveal">解き方を見る</button>' +
      '</div>' +
      '<div id="cf-feedback"></div>' +
      '<div id="cf-explain" class="cf-explain" style="display:none">' +
        '<div class="callout callout--point"><div class="callout__title">計算の手順</div>' +
        '<b>① 2年後の給与収入</b>＝ 500 ×(1.01)² ＝ ' + man(blanks.inc2) + '万円（四捨五入）<br>' +
        '<b>② 1年後の年間収支</b>＝ 収入' + man(inc(1)) + ' − 支出' + man(exp(1)) + ' ＝ ' + man(blanks.net1) + '万円<br>' +
        '<b>③ 2年後の貯蓄残高</b>＝ 1年後残高' + man(balance(1)) + ' ×1.01 ＋ 2年後収支' + man(net(2)) + ' ＝ ' + man(blanks.bal2) + '万円' +
        '</div></div>';

    var feedback = host.querySelector('#cf-feedback');

    host.querySelector('#cf-check').addEventListener('click', function () {
      var inputs = host.querySelectorAll('.cf-in');
      var allRight = true, filled = 0;
      inputs.forEach(function (inp) {
        var key = inp.dataset.key;
        var val = parseInt(String(inp.value).replace(/[^0-9-]/g, ''), 10);
        if (!isNaN(val)) filled++;
        inp.classList.remove('is-correct', 'is-wrong');
        if (val === blanks[key]) {
          inp.classList.add('is-correct');
        } else {
          inp.classList.add('is-wrong');
          allRight = false;
        }
      });
      if (filled === 0) {
        feedback.innerHTML = '<div class="callout callout--memo">まず黄色いセルに数値を入れてね。</div>';
        return;
      }
      feedback.innerHTML = allRight
        ? '<div class="minicheck__done is-good">✅ 全部正解！キャッシュフロー表の2大公式をマスターしました。</div>'
        : '<div class="callout callout--trap"><div class="callout__title">おしい！</div>赤いセルをもう一度。「解き方を見る」でヒントが出ます。</div>';
      if (allRight && FP3.Toast) FP3.Toast.show('🧮 キャッシュフロー表 正解！');
    });

    host.querySelector('#cf-reveal').addEventListener('click', function () {
      var e = host.querySelector('#cf-explain');
      e.style.display = e.style.display === 'none' ? '' : 'none';
    });
  }

  /* =================================================================
   * 3. 保険金の課税関係 判定ツール
   *   契約者(=保険料負担者)・被保険者・受取人の組み合わせと、
   *   死亡保険金/満期保険金の別で、かかる税金を判定して表示する。
   * ================================================================= */
  function insuranceTaxJudge(host) {
    if (!host) return;
    host.classList.add('tool');

    var people = [
      { v: 'A', label: 'Aさん（例：夫）' },
      { v: 'B', label: 'Bさん（例：妻）' },
      { v: 'C', label: 'Cさん（例：子）' },
    ];
    function opts(sel) {
      return people.map(function (p) {
        return '<option value="' + p.v + '"' + (p.v === sel ? ' selected' : '') + '>' + p.label + '</option>';
      }).join('');
    }

    host.innerHTML =
      '<div class="tool__head">⚖️ 保険金の税金 判定ツール</div>' +
      '<p class="muted small">「契約者（保険料を払う人）」「被保険者」「受取人」を選ぶと、保険金にかかる税金が分かります。' +
        '3人の関係だけで決まる——ここが試験のツボ。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">保険金の種類' +
          '<select id="it-kind" class="input"><option value="death">死亡保険金</option><option value="maturity">満期保険金</option></select></label>' +
        '<label class="ctrl">契約者（保険料負担者）<select id="it-payer" class="input">' + opts('A') + '</select></label>' +
        '<label class="ctrl" id="it-insured-wrap">被保険者<select id="it-insured" class="input">' + opts('A') + '</select></label>' +
        '<label class="ctrl">受取人<select id="it-receiver" class="input">' + opts('B') + '</select></label>' +
      '</div>' +
      '<div id="it-result"></div>';

    var kind = host.querySelector('#it-kind');
    var payer = host.querySelector('#it-payer');
    var insured = host.querySelector('#it-insured');
    var insuredWrap = host.querySelector('#it-insured-wrap');
    var receiver = host.querySelector('#it-receiver');
    var result = host.querySelector('#it-result');

    function judge() {
      var isDeath = kind.value === 'death';
      insuredWrap.style.display = isDeath ? '' : 'none'; // 満期は被保険者を問わない
      var p = payer.value, ins = insured.value, r = receiver.value;
      var tax, why, cls;
      if (!isDeath) {
        if (p === r) { tax = '所得税（一時所得）'; why = '保険料を払った人が満期金を受け取る＝自分のお金が戻るイメージ。'; cls = 'point'; }
        else { tax = '贈与税'; why = 'お金を出した人と受け取る人が違う＝贈与とみなされます。'; cls = 'trap'; }
      } else {
        if (p === ins) { tax = '相続税'; why = '契約者と被保険者が同じ人。亡くなった人が払っていた保険＝みなし相続財産。'; cls = 'point'; }
        else if (p === r) { tax = '所得税（一時所得）'; why = '保険料を払った人が受取人＝自分で受け取るので所得税。'; cls = 'point'; }
        else { tax = '贈与税'; why = '契約者・被保険者・受取人が全員バラバラ＝贈与税。'; cls = 'trap'; }
      }
      result.innerHTML =
        '<div class="callout callout--' + cls + '">' +
          '<div class="callout__title">かかる税金：' + tax + '</div>' + why +
        '</div>';
    }

    [kind, payer, insured, receiver].forEach(function (el) { el.addEventListener('change', judge); });
    judge();
  }

  /* =================================================================
   * 4. 債券利回り電卓
   *   表面利率・購入価格・償還(売却)価格・残存(所有)年数から、単利利回りを計算。
   *   利回り(%) =（表面利率 +（償還価格 − 購入価格）÷ 年数）÷ 購入価格 ×100
   *   ・最終利回り：購入後、償還（額面100）まで保有
   *   ・所有期間利回り：途中で売却価格で手放す
   * ================================================================= */
  function bondYield(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">📈 債券利回り電卓</div>' +
      '<p class="muted small">「表面利率」「購入価格」「償還（または売却）価格」「年数」を入れると、単利の利回りを計算します。' +
        '償還価格を100（額面）にすれば<b>最終利回り</b>、途中売却価格にすれば<b>所有期間利回り</b>。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">表面利率（％）<input id="by-coupon" class="input" type="number" value="2" step="0.1"></label>' +
        '<label class="ctrl">購入価格（額面100あたり）<input id="by-buy" class="input" type="number" value="98" step="0.1"></label>' +
        '<label class="ctrl">償還・売却価格<input id="by-sell" class="input" type="number" value="100" step="0.1"></label>' +
        '<label class="ctrl">残存・所有年数<input id="by-year" class="input" type="number" value="5" step="1" min="1"></label>' +
      '</div>' +
      '<div id="by-result"></div>';

    var els = ['by-coupon','by-buy','by-sell','by-year'].map(function (id) { return host.querySelector('#' + id); });
    function calc() {
      var c = Number(els[0].value), buy = Number(els[1].value), sell = Number(els[2].value), y = Number(els[3].value) || 1;
      var y0 = (c + (sell - buy) / y) / buy * 100;
      var kind = sell === 100 ? '最終利回り（償還まで保有）' : '所有期間利回り（途中売却）';
      host.querySelector('#by-result').innerHTML =
        '<div class="callout callout--point">' +
          '<div class="callout__title">' + kind + '：約 ' + y0.toFixed(3) + '％</div>' +
          '<span class="small">＝（' + c + ' ＋（' + sell + ' − ' + buy + '）÷ ' + y + '）÷ ' + buy + ' ×100</span>' +
        '</div>';
    }
    els.forEach(function (e) { e.addEventListener('input', calc); });
    calc();
  }

  /* =================================================================
   * 5. 株式指標 電卓（PER / PBR / ROE / 配当利回り / 配当性向）
   * ================================================================= */
  function stockIndicators(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">🧮 株式指標 電卓（PER・PBR・ROE）</div>' +
      '<p class="muted small">株価と1株あたりの数値を入れると、代表的な投資指標を計算します。数字を変えて感覚をつかみましょう。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">株価（円）<input id="si-price" class="input" type="number" value="2000" step="10"></label>' +
        '<label class="ctrl">1株当たり純利益 EPS（円）<input id="si-eps" class="input" type="number" value="100" step="1"></label>' +
        '<label class="ctrl">1株当たり純資産 BPS（円）<input id="si-bps" class="input" type="number" value="1000" step="10"></label>' +
        '<label class="ctrl">1株当たり配当（円）<input id="si-div" class="input" type="number" value="40" step="1"></label>' +
      '</div>' +
      '<div class="table-scroll"><table class="cmp" id="si-table"><tbody></tbody></table></div>';

    var price = host.querySelector('#si-price'), eps = host.querySelector('#si-eps'),
        bps = host.querySelector('#si-bps'), div = host.querySelector('#si-div');
    function calc() {
      var P = Number(price.value), E = Number(eps.value), B = Number(bps.value), D = Number(div.value);
      var rows = [
        ['PER（株価収益率）', '株価 ÷ EPS', E ? (P / E).toFixed(2) + ' 倍' : '—', '低いほど割安の目安'],
        ['PBR（株価純資産倍率）', '株価 ÷ BPS', B ? (P / B).toFixed(2) + ' 倍' : '—', '1倍が解散価値の目安'],
        ['ROE（自己資本利益率）', 'EPS ÷ BPS ×100', B ? (E / B * 100).toFixed(2) + ' ％' : '—', '高いほど稼ぐ力が強い'],
        ['配当利回り', '1株配当 ÷ 株価 ×100', P ? (D / P * 100).toFixed(2) + ' ％' : '—', '株価に対する配当の割合'],
        ['配当性向', '1株配当 ÷ EPS ×100', E ? (D / E * 100).toFixed(2) + ' ％' : '—', '利益のうち配当に回す割合'],
      ];
      host.querySelector('#si-table tbody').innerHTML = rows.map(function (r) {
        return '<tr><td><b>' + r[0] + '</b><br><span class="muted small">' + r[1] + '</span></td>' +
          '<td style="text-align:right;white-space:nowrap;font-weight:700">' + r[2] + '</td>' +
          '<td class="small">' + r[3] + '</td></tr>';
      }).join('');
    }
    [price, eps, bps, div].forEach(function (e) { e.addEventListener('input', calc); });
    calc();
  }

  /* =================================================================
   * 6. 所得税の計算フロー体験
   *   給与収入 →（給与所得控除）→ 給与所得 →（所得控除）→ 課税所得
   *   →（超過累進税率）→ 所得税額 の流れをステップ形式で見せる。
   * ================================================================= */
  function incomeTaxFlow(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">🧾 所得税の計算フロー体験</div>' +
      '<p class="muted small">給与収入と所得控除を入れると、「収入 → 所得 → 課税所得 → 税額」の流れが一目で分かります。' +
        '基礎控除48万円は自動で加算します。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">給与収入（年間・円）<input id="tf-income" class="input" type="number" value="5000000" step="100000"></label>' +
        '<label class="ctrl">所得控除（社会保険料控除など・円／基礎控除を除く）<input id="tf-deduction" class="input" type="number" value="1000000" step="50000"></label>' +
      '</div>' +
      '<div id="tf-steps" class="steps"></div>' +
      '<p class="muted small">※ 実際の税額計算では課税所得の1,000円未満を切り捨てます。復興特別所得税は含めていません。</p>';

    var incEl = host.querySelector('#tf-income');
    var dedEl = host.querySelector('#tf-deduction');
    var stepsHost = host.querySelector('#tf-steps');

    function kyuyoDeduction(inc) {
      if (inc <= 1625000) return 550000;
      if (inc <= 1800000) return inc * 0.4 - 100000;
      if (inc <= 3600000) return inc * 0.3 + 80000;
      if (inc <= 6600000) return inc * 0.2 + 440000;
      if (inc <= 8500000) return inc * 0.1 + 1100000;
      return 1950000;
    }
    /* 所得税の速算表（課税所得, 税率, 控除額） */
    var table = [
      [1950000, 0.05, 0],
      [3300000, 0.10, 97500],
      [6950000, 0.20, 427500],
      [9000000, 0.23, 636000],
      [18000000, 0.33, 1536000],
      [40000000, 0.40, 2796000],
      [Infinity, 0.45, 4796000],
    ];
    function calcTax(taxable) {
      for (var i = 0; i < table.length; i++) {
        if (taxable <= table[i][0]) return { tax: taxable * table[i][1] - table[i][2], rate: table[i][1], sub: table[i][2] };
      }
      return { tax: 0, rate: 0, sub: 0 };
    }

    function render() {
      var inc = Math.max(0, Number(incEl.value) || 0);
      var otherDed = Math.max(0, Number(dedEl.value) || 0);
      var basic = 480000; // 基礎控除（合計所得2,400万円以下）
      var kyuyoDed = kyuyoDeduction(inc);
      var salaryIncome = Math.max(0, inc - kyuyoDed);      // 給与所得
      var totalDed = otherDed + basic;
      var taxableRaw = Math.max(0, salaryIncome - totalDed);
      var taxable = Math.floor(taxableRaw / 1000) * 1000;  // 1,000円未満切捨て
      var t = calcTax(taxable);
      var tax = Math.max(0, Math.floor(t.tax));

      var rows = [
        ['① 給与収入', yen(inc) + ' 円', '会社からの年間の額面収入'],
        ['② 給与所得控除', '− ' + yen(kyuyoDed) + ' 円', '会社員の必要経費にあたる控除'],
        ['③ 給与所得', yen(salaryIncome) + ' 円', '①−②。これが「所得」'],
        ['④ 所得控除', '− ' + yen(totalDed) + ' 円', '社会保険料等 ' + yen(otherDed) + ' ＋ 基礎控除 ' + yen(basic)],
        ['⑤ 課税所得', yen(taxable) + ' 円', '③−④（1,000円未満切捨て）'],
        ['⑥ 所得税額', yen(tax) + ' 円', '課税所得 ×' + (t.rate * 100) + '％ − ' + yen(t.sub) + '（速算表）'],
      ];
      stepsHost.innerHTML = rows.map(function (r, i) {
        var accent = i === 5 ? ' style="background:var(--ok-bg)"' : '';
        return '<div class="step"' + accent + '><span class="step__no">' + (i + 1) + '</span>' +
          '<span class="step__txt"><b>' + r[0] + '：' + r[1] + '</b><br><span class="muted small">' + r[2] + '</span></span></div>';
      }).join('');
    }
    [incEl, dedEl].forEach(function (e) { e.addEventListener('input', render); });
    render();
  }

  /* =================================================================
   * 7. 建蔽率・容積率ビジュアライザー
   *   敷地面積・建蔽率・容積率を動かすと、建築面積・延べ床面積と、
   *   土地の上に建つ「建物の枠」がSVGで連動して変わる。
   * ================================================================= */
  function coverageFloor(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">🏠 建蔽率・容積率ビジュアライザー</div>' +
      '<p class="muted small">敷地面積と2つの割合を動かすと、建てられる「建築面積（1階の広さ）」と「延べ床面積（全階合計）」が計算され、図も変わります。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">敷地面積（㎡）<input id="cf2-land" class="input" type="number" value="200" step="10" min="10"></label>' +
        '<label class="ctrl">建蔽率：<b><span id="cf2-bcr-val">60</span>％</b><input id="cf2-bcr" type="range" min="30" max="80" step="10" value="60"></label>' +
        '<label class="ctrl">容積率：<b><span id="cf2-far-val">200</span>％</b><input id="cf2-far" type="range" min="50" max="500" step="50" value="200"></label>' +
      '</div>' +
      '<div id="cf2-svg" class="tool__svg"></div>' +
      '<div id="cf2-result"></div>';

    var land = host.querySelector('#cf2-land');
    var bcr = host.querySelector('#cf2-bcr');
    var far = host.querySelector('#cf2-far');
    var bcrVal = host.querySelector('#cf2-bcr-val');
    var farVal = host.querySelector('#cf2-far-val');
    var svgHost = host.querySelector('#cf2-svg');
    var result = host.querySelector('#cf2-result');

    function render() {
      var L = Math.max(0, Number(land.value) || 0);
      var b = Number(bcr.value) / 100;
      var f = Number(far.value) / 100;
      bcrVal.textContent = (b * 100).toFixed(0);
      farVal.textContent = (f * 100).toFixed(0);
      var buildArea = L * b;         // 建築面積
      var floorArea = L * f;         // 延べ床面積
      var floors = buildArea > 0 ? floorArea / buildArea : 0; // 目安の階数

      /* 敷地（正方形近似）に対して、建蔽率の割合ぶんの建物枠を描く */
      var side = 120, ox = 100, oy = 10;
      var innerSide = side * Math.sqrt(b); // 面積比 = b になるよう一辺をルート倍
      var pad = (side - innerSide) / 2;
      svgHost.innerHTML =
        '<svg viewBox="0 0 320 150" role="img" aria-label="敷地に対して建蔽率の割合で建物が建つ様子">' +
          '<rect x="' + ox + '" y="' + oy + '" width="' + side + '" height="' + side + '" fill="color-mix(in srgb, var(--green) 18%, transparent)" stroke="var(--green)" stroke-dasharray="4 3"/>' +
          '<text x="' + (ox + side / 2) + '" y="' + (oy + side + 14) + '" text-anchor="middle" font-size="9" fill="var(--muted)">敷地 ' + Math.round(L) + '㎡</text>' +
          '<rect x="' + (ox + pad) + '" y="' + (oy + pad) + '" width="' + innerSide + '" height="' + innerSide + '" rx="3" fill="var(--blue)"/>' +
          '<text x="' + (ox + side / 2) + '" y="' + (oy + side / 2) + '" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">建築面積</text>' +
        '</svg>';

      result.innerHTML =
        '<div class="callout callout--point">' +
          '<div class="callout__title">計算結果</div>' +
          '建築面積（1階の最大の広さ）＝ ' + Math.round(L) + '㎡ ×' + (b * 100).toFixed(0) + '％ ＝ <b>' + Math.round(buildArea) + '㎡</b><br>' +
          '延べ床面積（全階合計の上限）＝ ' + Math.round(L) + '㎡ ×' + (f * 100).toFixed(0) + '％ ＝ <b>' + Math.round(floorArea) + '㎡</b><br>' +
          '<span class="small">（建築面積いっぱいに建てると、およそ ' + floors.toFixed(1) + ' 階ぶんの広さ）</span>' +
        '</div>';
    }
    [land, bcr, far].forEach(function (e) { e.addEventListener('input', render); });
    render();
  }

  /* =================================================================
   * 8. 法定相続分シミュレーター
   *   配偶者の有無と血族相続人（子／直系尊属／兄弟姉妹）の人数を選ぶと、
   *   各人の法定相続分を計算し、円グラフ（ドーナツ）で表示する。
   * ================================================================= */
  function inheritanceShares(host) {
    if (!host) return;
    host.classList.add('tool');
    host.innerHTML =
      '<div class="tool__head">👪 法定相続分シミュレーター</div>' +
      '<p class="muted small">配偶者の有無と、相続人になる血族（子→いなければ親→いなければ兄弟姉妹）の人数を選ぶと、法定相続分を計算して円グラフで表示します。</p>' +
      '<div class="tool__controls">' +
        '<label class="ctrl">配偶者<select id="is-spouse" class="input"><option value="1">いる</option><option value="0">いない</option></select></label>' +
        '<label class="ctrl">血族相続人の種類' +
          '<select id="is-type" class="input">' +
            '<option value="child">子（第1順位）</option>' +
            '<option value="parent">直系尊属＝父母など（第2順位）</option>' +
            '<option value="sibling">兄弟姉妹（第3順位）</option>' +
            '<option value="none">なし</option>' +
          '</select></label>' +
        '<label class="ctrl" id="is-count-wrap">人数：<b><span id="is-count-val">2</span>人</b><input id="is-count" type="range" min="1" max="4" value="2"></label>' +
      '</div>' +
      '<div id="is-svg" class="tool__svg"></div>' +
      '<div id="is-result"></div>';

    var spouse = host.querySelector('#is-spouse');
    var type = host.querySelector('#is-type');
    var count = host.querySelector('#is-count');
    var countVal = host.querySelector('#is-count-val');
    var countWrap = host.querySelector('#is-count-wrap');
    var svgHost = host.querySelector('#is-svg');
    var result = host.querySelector('#is-result');

    var palette = ['#2563eb', '#0d9488', '#f59e0b', '#dc2626', '#7c3aed'];

    /* 分数を約分して文字列に */
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }
    function frac(n, d) {
      if (n === 0) return '0';
      var g = gcd(n, d);
      return (n / g) + '/' + (d / g);
    }

    function shares() {
      var hasSpouse = spouse.value === '1';
      var t = type.value;
      var n = Number(count.value);
      var list = []; // {label, num, den}（分子・分母をそろえて格納）

      if (t === 'none') {
        // 配偶者のみ
        if (hasSpouse) list.push({ label: '配偶者', num: 1, den: 1 });
        return list;
      }
      var bloodLabel = t === 'child' ? '子' : (t === 'parent' ? '親' : '兄弟姉妹');
      if (hasSpouse) {
        // 配偶者と血族で分ける
        var sp = t === 'child' ? [1, 2] : (t === 'parent' ? [2, 3] : [3, 4]);   // 配偶者の分
        var bl = t === 'child' ? [1, 2] : (t === 'parent' ? [1, 3] : [1, 4]);   // 血族全体の分
        list.push({ label: '配偶者', num: sp[0], den: sp[1] });
        for (var i = 0; i < n; i++) {
          list.push({ label: bloodLabel + (n > 1 ? (i + 1) : ''), num: bl[0], den: bl[1] * n });
        }
      } else {
        // 血族のみで均等
        for (var j = 0; j < n; j++) {
          list.push({ label: bloodLabel + (n > 1 ? (j + 1) : ''), num: 1, den: n });
        }
      }
      return list;
    }

    function polar(cx, cy, r, deg) {
      var rad = (deg - 90) * Math.PI / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    }
    function arc(cx, cy, r, start, end) {
      var s = polar(cx, cy, r, end), e = polar(cx, cy, r, start);
      var large = end - start <= 180 ? 0 : 1;
      return 'M' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + e[0] + ' ' + e[1] + ' L' + cx + ' ' + cy + ' Z';
    }

    function render() {
      var t = type.value;
      countWrap.style.display = t === 'none' ? 'none' : '';
      countVal.textContent = count.value;
      var list = shares();

      if (list.length === 0) {
        svgHost.innerHTML = '';
        result.innerHTML = '<div class="callout callout--trap">相続人がいません。配偶者か血族相続人を選んでください。</div>';
        return;
      }

      // 円グラフ
      var cx = 70, cy = 70, r = 60, acc = 0;
      var slices = list.map(function (p, i) {
        var frac0 = p.num / p.den;
        var start = acc * 360, end = (acc + frac0) * 360;
        acc += frac0;
        var d = list.length === 1 ? '' : arc(cx, cy, r, start, end);
        return list.length === 1
          ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette[i % palette.length] + '"/>'
          : '<path d="' + d + '" fill="' + palette[i % palette.length] + '"/>';
      }).join('');
      svgHost.innerHTML =
        '<svg viewBox="0 0 300 150" role="img" aria-label="法定相続分の円グラフ">' + slices +
          '<circle cx="' + cx + '" cy="' + cy + '" r="26" fill="var(--surface)"/>' +
          list.map(function (p, i) {
            return '<g transform="translate(160,' + (24 + i * 22) + ')">' +
              '<rect width="12" height="12" rx="2" fill="' + palette[i % palette.length] + '"/>' +
              '<text x="18" y="10" font-size="10" fill="var(--text)">' + p.label + '：' + frac(p.num, p.den) + '</text></g>';
          }).join('') +
        '</svg>';

      result.innerHTML =
        '<div class="callout callout--point"><div class="callout__title">法定相続分</div>' +
          list.map(function (p) { return p.label + ' … <b>' + frac(p.num, p.den) + '</b>'; }).join('　／　') +
        '</div>';
    }
    [spouse, type, count].forEach(function (e) { e.addEventListener('input', render); });
    render();
  }

  FP3.Tools = {
    sixCoefficients: sixCoefficients,
    cashflowBuilder: cashflowBuilder,
    insuranceTaxJudge: insuranceTaxJudge,
    bondYield: bondYield,
    stockIndicators: stockIndicators,
    incomeTaxFlow: incomeTaxFlow,
    coverageFloor: coverageFloor,
    inheritanceShares: inheritanceShares,
  };
  window.FP3 = FP3;
})();
