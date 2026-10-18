/* =====================================================================
 * jitsugi-data.js — 実技（資産設計提案業務）資料読み取り演習のデータ
 *
 * 「資産設計提案業務」特有の資料読み取り型問題を、8種類の資料
 * （キャッシュフロー表・バランスシート・係数表・保険証券・源泉徴収票・
 *  登記事項証明書・路線価図・雑誌記事風資料）ごとにまとめる。
 *
 * 計算が絡む数値は、このファイル内の関数で毎回計算して埋め込む
 * （手計算による転記ミスを避けるため）。
 *
 * 各資料の要素には data-hl / data-col 属性を付け、設問側の
 * highlight 配列（CSSセレクタ）で「資料のどこを見るか」を
 * ハイライト表示できるようにしている。
 * ===================================================================== */
(function () {
  'use strict';

  function y(n) { return Math.round(n).toLocaleString('ja-JP'); }

  /* ---------- 6つの係数（life-3 と同じ算出式） ---------- */
  function coeffs(r, n) {
    var g = Math.pow(1 + r, n);
    var annuityFactor = r === 0 ? n : (g - 1) / r;
    return {
      shuka: g,
      genka: 1 / g,
      nenkinShuka: annuityFactor,
      gensai: r === 0 ? 1 / n : r / (g - 1),
      shihon: r === 0 ? 1 / n : (r * g) / (g - 1),
      nenkinGenka: r === 0 ? n : (g - 1) / (r * g),
    };
  }

  /* ---------- 給与所得控除（tax-1 の tools.js と同じ算出式） ---------- */
  function kyuyoDeduction(inc) {
    if (inc <= 1625000) return 550000;
    if (inc <= 1800000) return inc * 0.4 - 100000;
    if (inc <= 3600000) return inc * 0.3 + 80000;
    if (inc <= 6600000) return inc * 0.2 + 440000;
    if (inc <= 8500000) return inc * 0.1 + 1100000;
    return 1950000;
  }

  var RESOURCES = [];
  var QUESTIONS = [];

  /* =================================================================
   * 資料1：係数表（年利2%）
   * ================================================================= */
  (function () {
    var r = 0.02;
    var years = [5, 10, 20];
    var cols = [
      ['shuka', '終価係数'], ['genka', '現価係数'], ['nenkinShuka', '年金終価係数'],
      ['gensai', '減債基金係数'], ['shihon', '資本回収係数'], ['nenkinGenka', '年金現価係数'],
    ];
    var rows = years.map(function (n) { return { n: n, c: coeffs(r, n) }; });

    var html =
      '<p class="muted small">年利2%で運用した場合の係数表（抜粋）</p>' +
      '<div class="table-scroll"><table class="cmp">' +
        '<thead><tr><th>年数</th>' + cols.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody>' + rows.map(function (row) {
          return '<tr><td>' + row.n + '年</td>' + cols.map(function (c) {
            return '<td data-hl="coef-n' + row.n + '-' + c[0] + '" data-col="' + c[0] + '">' + row.c[c[0]].toFixed(4) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'coef', title: '① 係数表（年利2%）', icon: '🎫', html: html });

    var amt1 = 200, n1 = 10;
    var correct1 = Math.round(amt1 * coeffs(r, n1).shuka);
    var wrongYear1 = Math.round(amt1 * coeffs(r, 5).shuka);
    var wrongCoef1 = Math.round(amt1 * coeffs(r, n1).genka);
    QUESTIONS.push({
      id: 'jg-coef-1', resourceId: 'coef', type: 'choice',
      q: '資料の係数表を用いて、現在の元本200万円を年利2％で複利運用した場合の<b>10年後の元利合計</b>として、最も適切なものはどれか（万円未満四捨五入）。',
      choices: [correct1 + '万円', wrongYear1 + '万円', wrongCoef1 + '万円'],
      answer: 0,
      explain: '10年後の元利合計＝現在の元本 ×終価係数（10年）＝200万円 ×' + coeffs(r, n1).shuka.toFixed(4) + ' ＝ 約' + correct1 + '万円。',
      highlight: ['[data-hl="coef-n10-shuka"]'],
    });

    var amt3 = 1000, n3 = 20;
    var correct3 = Math.round(amt3 * coeffs(r, n3).gensai);
    var wrongShihon = Math.round(amt3 * coeffs(r, n3).shihon);
    var wrongYearRow = Math.round(amt3 * coeffs(r, 10).gensai);
    QUESTIONS.push({
      id: 'jg-coef-2', resourceId: 'coef', type: 'choice',
      q: '資料の係数表を用いて、20年後に1,000万円を用意するために、年利2％で運用しながら<b>毎年いくら積み立てればよいか</b>（万円未満四捨五入）。',
      choices: [correct3 + '万円', wrongShihon + '万円', wrongYearRow + '万円'],
      answer: 0,
      explain: '将来の目標額から毎年の積立額を求めるので<b>減債基金係数</b>を使う。1,000万円 ×' + coeffs(r, n3).gensai.toFixed(4) + ' ＝ 約' + correct3 + '万円。資本回収係数との取り違えに注意。',
      highlight: ['[data-hl="coef-n20-gensai"]'],
    });

    QUESTIONS.push({
      id: 'jg-coef-3', resourceId: 'coef', type: 'choice',
      q: '資料の「年金現価係数」の使い方として、最も適切なものはどれか。',
      choices: [
        '毎年一定額を受け取るために、現在いくらの元本が必要かを求める',
        '現在の一時金を複利運用した場合、将来いくらになるかを求める',
        '毎年一定額を積み立てた場合、将来いくら貯まるかを求める',
      ],
      answer: 0,
      explain: '年金現価係数は「毎年の受取額 → 今必要な元本」を求める係数。',
      highlight: ['[data-col="nenkinGenka"]'],
    });
  })();

  /* =================================================================
   * 資料2：キャッシュフロー表（抜粋）
   * ================================================================= */
  (function () {
    var incomeBase = 600, incomeRate = 0.01;
    var expenseBase = 450, expenseRate = 0.02;
    var loanFixed = 130;
    var savingsStart = 800, yieldRate = 0.01;

    function inc(yr) { return incomeBase * Math.pow(1 + incomeRate, yr); }
    function exp(yr) { return expenseBase * Math.pow(1 + expenseRate, yr); }
    function net(yr) { return Math.round(inc(yr)) - Math.round(exp(yr)) - loanFixed; }
    function bal(yr) {
      var b = savingsStart;
      for (var i = 1; i <= yr; i++) { b = Math.round(b * (1 + yieldRate)) + net(i); }
      return b;
    }
    var years = [0, 1, 2, 3];

    var html =
      '<p class="muted small">単位：万円／給与収入変動率+1％・基本生活費変動率+2％・住宅ローン返済（一定）' + y(loanFixed) + '万円／運用利率1％</p>' +
      '<div class="table-scroll"><table class="cmp cf">' +
        '<thead><tr><th>項目</th>' + years.map(function (yr) { return '<th>' + (yr === 0 ? '基準年' : yr + '年後') + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody>' +
          '<tr><td>給与収入</td>' + years.map(function (yr) { return '<td data-hl="cf-inc-' + yr + '">' + y(inc(yr)) + '</td>'; }).join('') + '</tr>' +
          '<tr><td>基本生活費</td>' + years.map(function (yr) { return '<td data-hl="cf-exp-' + yr + '">' + y(exp(yr)) + '</td>'; }).join('') + '</tr>' +
          '<tr><td>住宅ローン返済</td>' + years.map(function () { return '<td>' + y(loanFixed) + '</td>'; }).join('') + '</tr>' +
          '<tr class="cf__net"><td>年間収支</td>' + years.map(function (yr) {
            if (yr === 3) return '<td data-hl="cf-net-3">(ア)</td>';
            return '<td data-hl="cf-net-' + yr + '">' + y(net(yr)) + '</td>';
          }).join('') + '</tr>' +
          '<tr class="cf__bal"><td>貯蓄残高</td>' + years.map(function (yr) {
            if (yr === 3) return '<td data-hl="cf-bal-3">(イ)</td>';
            return '<td data-hl="cf-bal-' + yr + '">' + y(bal(yr)) + '</td>';
          }).join('') + '</tr>' +
        '</tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'cashflow', title: '② キャッシュフロー表（抜粋）', icon: '📋', html: html });

    var correctNet3 = net(3);
    var wrongNoLoan = Math.round(inc(3)) - Math.round(exp(3));
    var wrongYear = net(2);
    QUESTIONS.push({
      id: 'jg-cf-1', resourceId: 'cashflow', type: 'choice',
      q: '資料中の空欄(ア)（3年後の年間収支）に入る数値として、正しいものはどれか。',
      choices: [y(correctNet3) + '万円', y(wrongNoLoan) + '万円', y(wrongYear) + '万円'],
      answer: 0,
      explain: '年間収支＝給与収入 − 基本生活費 − 住宅ローン返済＝' + y(inc(3)) + ' − ' + y(exp(3)) + ' − ' + y(loanFixed) + ' ＝ ' + y(correctNet3) + '万円。住宅ローン返済を引き忘れないこと。',
      highlight: ['[data-hl="cf-inc-3"]', '[data-hl="cf-exp-3"]', '[data-hl="cf-net-3"]'],
    });

    var correctBal3 = bal(3);
    var wrongOrder = Math.round((Math.round(bal(2)) + correctNet3) * (1 + yieldRate));
    QUESTIONS.push({
      id: 'jg-cf-2', resourceId: 'cashflow', type: 'choice',
      q: '資料中の空欄(イ)（3年後の貯蓄残高）に入る数値として、正しいものはどれか。ただし、空欄(ア)は正しく計算できているものとする。',
      choices: [y(correctBal3) + '万円', y(wrongOrder) + '万円', y(bal(2)) + '万円'],
      answer: 0,
      explain: '貯蓄残高＝前年末残高 ×（1＋運用利率）＋ その年の年間収支。' + y(bal(2)) + ' ×1.01 ＋ ' + y(correctNet3) + ' ＝ ' + y(correctBal3) + '万円。先に利息、その後で年間収支を足す順番に注意。',
      highlight: ['[data-hl="cf-bal-2"]', '[data-hl="cf-net-3"]', '[data-hl="cf-bal-3"]'],
    });

    QUESTIONS.push({
      id: 'jg-cf-3', resourceId: 'cashflow', type: 'choice',
      q: 'このようなキャッシュフロー表の「給与収入」欄に記載する金額として、最も適切なものはどれか。',
      choices: ['源泉徴収前の額面年収', '税金・社会保険料を差し引いた可処分所得', '住宅ローン返済額を差し引いた後の金額'],
      answer: 1,
      explain: 'キャッシュフロー表の収入欄は可処分所得（手取り）で記載する。税金・社会保険料だけを差し引き、保険料やローン返済は差し引かない。',
      highlight: ['[data-hl="cf-inc-0"]'],
    });
  })();

  /* =================================================================
   * 資料3：個人バランスシート（抜粋）
   * ================================================================= */
  (function () {
    var assets = [['預貯金', 300], ['投資信託（時価）', 150], ['生命保険（解約返戻金相当額）', 80], ['自宅（時価）', 2500], ['自動車', 50]];
    var liabilities = [['住宅ローン残高', 1800], ['自動車ローン残高', 20]];
    var assetsTotal = assets.reduce(function (s, a) { return s + a[1]; }, 0);
    var liabTotal = liabilities.reduce(function (s, a) { return s + a[1]; }, 0);
    var net = assetsTotal - liabTotal;

    var html =
      '<p class="muted small">単位：万円</p>' +
      '<div class="table-scroll"><table class="cmp">' +
        '<thead><tr><th colspan="2">資産</th><th colspan="2">負債</th></tr></thead>' +
        '<tbody><tr>' +
          '<td colspan="2"><table class="cmp" style="margin:0;border:none">' +
            assets.map(function (a) { return '<tr><td>' + a[0] + '</td><td data-hl="bs-asset-item" style="text-align:right">' + y(a[1]) + '</td></tr>'; }).join('') +
            '<tr><td><b>資産合計</b></td><td data-hl="bs-asset-total" style="text-align:right"><b>' + y(assetsTotal) + '</b></td></tr>' +
          '</table></td>' +
          '<td colspan="2"><table class="cmp" style="margin:0;border:none">' +
            liabilities.map(function (a) { return '<tr><td>' + a[0] + '</td><td data-hl="bs-liab-item" style="text-align:right">' + y(a[1]) + '</td></tr>'; }).join('') +
            '<tr><td><b>負債合計</b></td><td data-hl="bs-liab-total" style="text-align:right"><b>' + y(liabTotal) + '</b></td></tr>' +
            '<tr><td><b>純資産</b></td><td data-hl="bs-net" style="text-align:right"><b>' + y(net) + '</b></td></tr>' +
          '</table></td>' +
        '</tr></tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'balance', title: '③ 個人バランスシート（抜粋）', icon: '⚖️', html: html });

    QUESTIONS.push({
      id: 'jg-bs-1', resourceId: 'balance', type: 'choice',
      q: '資料の資産合計として、正しいものはどれか。',
      choices: [y(assetsTotal) + '万円', y(assetsTotal - 2500) + '万円（自宅を除く）', y(assetsTotal + liabTotal) + '万円'],
      answer: 0,
      explain: '資産合計＝' + assets.map(function (a) { return a[1]; }).join('＋') + '＝' + y(assetsTotal) + '万円。',
      highlight: ['[data-hl="bs-asset-total"]'],
    });

    QUESTIONS.push({
      id: 'jg-bs-2', resourceId: 'balance', type: 'choice',
      q: '資料の純資産として、正しいものはどれか。',
      choices: [y(net) + '万円', y(assetsTotal) + '万円', y(liabTotal) + '万円'],
      answer: 0,
      explain: '純資産＝資産合計' + y(assetsTotal) + ' − 負債合計' + y(liabTotal) + ' ＝ ' + y(net) + '万円。',
      highlight: ['[data-hl="bs-asset-total"]', '[data-hl="bs-liab-total"]', '[data-hl="bs-net"]'],
    });

    QUESTIONS.push({
      id: 'jg-bs-3', resourceId: 'balance', type: 'choice',
      q: '個人バランスシートに「自宅」の金額を記載する際の評価基準として、最も適切なものはどれか。',
      choices: ['購入したときの価格（取得価額）', '現在の時価', '固定資産税評価額'],
      answer: 1,
      explain: '個人バランスシートの資産は、原則として作成時点の時価で記載する。',
      highlight: ['[data-hl="bs-asset-item"]'],
    });
  })();

  /* =================================================================
   * 資料4：生命保険証券（抜粋）
   * ================================================================= */
  (function () {
    var html =
      '<div class="table-scroll"><table class="cmp">' +
        '<tbody>' +
          '<tr><td>契約者／被保険者</td><td data-hl="ins-person">田中 太郎</td></tr>' +
          '<tr><td>死亡保険金受取人</td><td>田中 花子（妻）</td></tr>' +
          '<tr><td data-hl="ins-shukeiyaku">主契約：終身保険</td><td data-hl="ins-shukeiyaku-amt">死亡保険金額　500万円</td></tr>' +
          '<tr><td data-hl="ins-teiki">定期保険特約</td><td data-hl="ins-teiki-amt">死亡保険金額　2,000万円（死亡原因を問わない）</td></tr>' +
          '<tr><td data-hl="ins-saigai">災害割増特約</td><td data-hl="ins-saigai-amt">不慮の事故による死亡時に　500万円上乗せ</td></tr>' +
          '<tr><td data-hl="ins-nyuin">入院特約</td><td data-hl="ins-nyuin-amt">入院給付金日額　5,000円（1入院60日限度）</td></tr>' +
        '</tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'insurance', title: '④ 生命保険証券（抜粋）', icon: '📄', html: html });

    var shukei = 500, teiki = 2000, saigai = 500;
    QUESTIONS.push({
      id: 'jg-ins-1', resourceId: 'insurance', type: 'choice',
      q: '被保険者が交通事故（不慮の事故）により死亡した場合に支払われる死亡保険金の合計額として、正しいものはどれか。',
      choices: [y(shukei + teiki + saigai) + '万円', y(shukei + teiki) + '万円', y(shukei + teiki + saigai * 2) + '万円'],
      answer: 0,
      explain: '不慮の事故による死亡なので、主契約500万円＋定期保険特約2,000万円＋災害割増特約500万円＝' + y(shukei + teiki + saigai) + '万円。',
      highlight: ['[data-hl="ins-shukeiyaku-amt"]', '[data-hl="ins-teiki-amt"]', '[data-hl="ins-saigai-amt"]'],
    });

    QUESTIONS.push({
      id: 'jg-ins-2', resourceId: 'insurance', type: 'choice',
      q: '被保険者が病気により死亡した場合に支払われる死亡保険金の合計額として、正しいものはどれか。',
      choices: [y(shukei + teiki) + '万円', y(shukei + teiki + saigai) + '万円', y(shukei) + '万円'],
      answer: 0,
      explain: '災害割増特約は「不慮の事故」による死亡のみが対象のため、病気死亡では対象外。主契約500万円＋定期保険特約2,000万円＝' + y(shukei + teiki) + '万円。',
      highlight: ['[data-hl="ins-shukeiyaku-amt"]', '[data-hl="ins-teiki-amt"]', '[data-hl="ins-saigai-amt"]'],
    });

    QUESTIONS.push({
      id: 'jg-ins-3', resourceId: 'insurance', type: 'choice',
      q: '被保険者が病気により10日間入院した場合に支払われる入院給付金として、正しいものはどれか。',
      choices: ['50,000円', '5,000円', '500,000円'],
      answer: 0,
      explain: '入院給付金日額5,000円 ×10日＝50,000円（60日限度内）。',
      highlight: ['[data-hl="ins-nyuin-amt"]'],
    });
  })();

  /* =================================================================
   * 資料5：源泉徴収票（抜粋）
   * ================================================================= */
  (function () {
    var shiharai = 6000000;
    var kyuyoDed = kyuyoDeduction(shiharai);
    var kyuyoShotoku = shiharai - kyuyoDed;   // 4,360,000
    var kojoTotal = 1360000;
    var kazeiShotoku = kyuyoShotoku - kojoTotal; // 3,000,000

    var html =
      '<div class="table-scroll"><table class="cmp">' +
        '<tbody>' +
          '<tr><td>支払金額</td><td data-hl="gs-shiharai" style="text-align:right">' + y(shiharai) + ' 円</td></tr>' +
          '<tr><td>給与所得控除後の金額</td><td data-hl="gs-blank1" style="text-align:right">（ア）</td></tr>' +
          '<tr><td>所得控除の額の合計額</td><td data-hl="gs-kojo" style="text-align:right">' + y(kojoTotal) + ' 円</td></tr>' +
        '</tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'gensen', title: '⑤ 給与所得の源泉徴収票（抜粋）', icon: '🧾', html: html });

    var wrongNoDeduction = shiharai;
    var wrongHalf = Math.round(shiharai / 2);
    QUESTIONS.push({
      id: 'jg-gs-1', resourceId: 'gensen', type: 'choice',
      q: '資料の空欄（ア）「給与所得控除後の金額」に入る金額として、正しいものはどれか。',
      choices: [y(kyuyoShotoku) + '円', y(wrongNoDeduction) + '円', y(wrongHalf) + '円'],
      answer: 0,
      explain: '給与所得控除後の金額＝支払金額 − 給与所得控除額。支払金額600万円の場合、給与所得控除額は600万×20％＋44万＝' + y(kyuyoDed) + '円。600万円 − ' + y(kyuyoDed) + '円 ＝ ' + y(kyuyoShotoku) + '円。',
      highlight: ['[data-hl="gs-shiharai"]', '[data-hl="gs-blank1"]'],
    });

    QUESTIONS.push({
      id: 'jg-gs-2', resourceId: 'gensen', type: 'choice',
      q: '資料の「給与所得控除後の金額」を' + y(kyuyoShotoku) + '円とした場合、課税所得金額として正しいものはどれか。',
      choices: [y(kazeiShotoku) + '円', y(kyuyoShotoku) + '円', y(kyuyoShotoku + kojoTotal) + '円'],
      answer: 0,
      explain: '課税所得金額＝給与所得控除後の金額 − 所得控除の額の合計額＝' + y(kyuyoShotoku) + ' − ' + y(kojoTotal) + ' ＝ ' + y(kazeiShotoku) + '円。',
      highlight: ['[data-hl="gs-blank1"]', '[data-hl="gs-kojo"]'],
    });
  })();

  /* =================================================================
   * 資料6：登記事項証明書（抜粋）
   * ================================================================= */
  (function () {
    var html =
      '<div class="table-scroll"><table class="cmp">' +
        '<tbody>' +
          '<tr><td data-hl="reg-hyodai" colspan="2"><b>表題部</b>：所在 ○○市△△町一丁目2番3　地目 宅地　地積 165.28㎡</td></tr>' +
          '<tr><td data-hl="reg-koku1"><b>権利部（甲区）</b>順位1</td><td>所有権保存　所有者　鈴木 一郎</td></tr>' +
          '<tr><td data-hl="reg-koku2"><b>権利部（甲区）</b>順位2</td><td data-hl="reg-owner">所有権移転（原因：売買）　所有者　佐藤 次郎</td></tr>' +
          '<tr><td data-hl="reg-otsu"><b>権利部（乙区）</b>順位1</td><td data-hl="reg-teitoken">抵当権設定　債権額　金2,000万円　抵当権者　○○銀行</td></tr>' +
        '</tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'registry', title: '⑥ 登記事項証明書（抜粋）', icon: '📜', html: html });

    QUESTIONS.push({
      id: 'jg-reg-1', resourceId: 'registry', type: 'choice',
      q: '資料から読み取れる、この不動産の現在の所有者として正しいものはどれか。',
      choices: ['佐藤 次郎', '鈴木 一郎', '○○銀行'],
      answer: 0,
      explain: '権利部（甲区）順位2に「所有権移転（売買）所有者 佐藤次郎」とあり、これが現在の所有者。',
      highlight: ['[data-hl="reg-owner"]'],
    });

    QUESTIONS.push({
      id: 'jg-reg-2', resourceId: 'registry', type: 'choice',
      q: '資料の抵当権の債権額として正しいものはどれか。',
      choices: ['2,000万円', '1,650万円', '3,000万円'],
      answer: 0,
      explain: '権利部（乙区）に「抵当権設定　債権額　金2,000万円」と記載されている。',
      highlight: ['[data-hl="reg-teitoken"]'],
    });

    QUESTIONS.push({
      id: 'jg-reg-3', resourceId: 'registry', type: 'choice',
      q: '抵当権の内容が記載されているのは、登記記録のどの部分か。',
      choices: ['権利部（乙区）', '権利部（甲区）', '表題部'],
      answer: 0,
      explain: '所有権以外の権利（抵当権など）は権利部の乙区に記録される。',
      highlight: ['[data-hl="reg-otsu"]'],
    });
  })();

  /* =================================================================
   * 資料7：路線価図（抜粋）
   * ================================================================= */
  (function () {
    var rosenka = 300; // 千円/㎡
    var chiseki = 200; // ㎡
    var ratioLetter = 'C';
    var ratioTable = { A: 90, B: 80, C: 70, D: 60, E: 50, F: 40, G: 30 };
    var jiyoValue = rosenka * 1000 * chiseki; // 自用地評価額
    var shakuchiValue = jiyoValue * (ratioTable[ratioLetter] / 100);

    var html =
      '<svg viewBox="0 0 320 130" role="img" aria-label="路線価図の簡易イメージ。道路に300Cと表示され、対象地は地積200平方メートル">' +
        '<rect x="10" y="55" width="300" height="18" fill="var(--surface-2)"/>' +
        '<text x="160" y="68" text-anchor="middle" font-size="10" fill="var(--muted)">道路</text>' +
        '<rect x="120" y="76" width="80" height="40" fill="color-mix(in srgb, var(--blue) 16%, transparent)" stroke="var(--blue)" data-hl="rosen-lot"/>' +
        '<text x="160" y="100" text-anchor="middle" font-size="9" fill="var(--text)">対象地</text>' +
        '<text x="160" y="112" text-anchor="middle" font-size="8" fill="var(--muted)">地積200㎡</text>' +
        '<circle cx="160" cy="45" r="16" fill="var(--accent-2)" data-hl="rosen-label"/>' +
        '<text x="160" y="49" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">300C</text>' +
      '</svg>' +
      '<p class="muted small">「300C」は、<b>路線価300千円／㎡</b>・<b>借地権割合C（70%）</b>を示す。</p>' +
      '<div class="table-scroll" data-hl="rosen-table"><table class="cmp">' +
        '<thead><tr>' + Object.keys(ratioTable).map(function (k) { return '<th' + (k === ratioLetter ? ' data-hl="rosen-ratio-c"' : '') + '>' + k + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody><tr>' + Object.keys(ratioTable).map(function (k) { return '<td' + (k === ratioLetter ? ' data-hl="rosen-ratio-c-val"' : '') + '>' + ratioTable[k] + '%</td>'; }).join('') + '</tr></tbody>' +
      '</table></div>';

    RESOURCES.push({ id: 'rosenka', title: '⑦ 路線価図（抜粋）', icon: '🗺️', html: html });

    QUESTIONS.push({
      id: 'jg-ros-1', resourceId: 'rosenka', type: 'choice',
      q: 'この宅地（自用地）の相続税評価額として、最も適切なものはどれか（画地補正は考慮しない）。',
      choices: [y(jiyoValue) + '円', y(shakuchiValue) + '円', y(jiyoValue / 2) + '円'],
      answer: 0,
      explain: '自用地評価額＝路線価（300千円＝300,000円／㎡）× 地積200㎡ ＝ ' + y(jiyoValue) + '円。',
      highlight: ['[data-hl="rosen-label"]', '[data-hl="rosen-lot"]'],
    });

    QUESTIONS.push({
      id: 'jg-ros-2', resourceId: 'rosenka', type: 'choice',
      q: '「300C」の記号「C」が示す借地権割合として、正しいものはどれか。',
      choices: ['70%', '80%', '60%'],
      answer: 0,
      explain: '路線価図のアルファベットは A=90%、B=80%、C=70%…と10%刻みで下がる。Cは70%。',
      highlight: ['[data-hl="rosen-ratio-c"]', '[data-hl="rosen-ratio-c-val"]'],
    });

    QUESTIONS.push({
      id: 'jg-ros-3', resourceId: 'rosenka', type: 'choice',
      q: 'この宅地について借地権として評価する場合の評価額として、最も適切なものはどれか。',
      choices: [y(shakuchiValue) + '円', y(jiyoValue) + '円', y(jiyoValue * 0.3) + '円'],
      answer: 0,
      explain: '借地権評価額＝自用地評価額 × 借地権割合＝' + y(jiyoValue) + '円 ×70％ ＝ ' + y(shakuchiValue) + '円。',
      highlight: ['[data-hl="rosen-label"]', '[data-hl="rosen-ratio-c-val"]'],
    });
  })();

  /* =================================================================
   * 資料8：雑誌記事風資料
   * ================================================================= */
  (function () {
    var html =
      '<div class="callout callout--point" style="margin:0">' +
        '<div class="callout__title">マネー最前線：新NISAとiDeCoを使いこなす</div>' +
        '<p data-hl="mag-nisa" style="margin:.4em 0">新しいNISA制度は、「つみたて投資枠」と「成長投資枠」を<b>併用</b>できるのが大きな特徴だ。' +
        '非課税保有期間は無期限化され、口座内で得た配当金や譲渡益には税金がかからない。</p>' +
        '<p data-hl="mag-ideco" style="margin:.4em 0">一方、iDeCo（個人型確定拠出年金）は、掛金の全額が<b>小規模企業共済等掛金控除</b>の対象となり、' +
        '原則として<b>60歳以降</b>に受け取りが始まる。</p>' +
        '<p data-hl="mag-caution" style="margin:.4em 0">ただし、<b>NISA口座で生じた損失は、他の口座の利益と損益通算できない</b>点には注意が必要だ。</p>' +
      '</div>';

    RESOURCES.push({ id: 'magazine', title: '⑧ 雑誌記事風資料', icon: '📰', html: html });

    QUESTIONS.push({
      id: 'jg-mag-1', resourceId: 'magazine', type: 'choice',
      q: '資料（記事）の内容として、最も適切なものはどれか。',
      choices: [
        'NISA口座で生じた損失は、他の口座の利益と損益通算できない',
        'つみたて投資枠と成長投資枠は併用できない',
        'iDeCoは40歳から受け取りが始まる',
      ],
      answer: 0,
      explain: '記事に「NISA口座で生じた損失は、他の口座の利益と損益通算できない」とある。',
      highlight: ['[data-hl="mag-caution"]'],
    });

    QUESTIONS.push({
      id: 'jg-mag-2', resourceId: 'magazine', type: 'choice',
      q: '記事によれば、iDeCoの掛金は全額がどの所得控除の対象となるか。',
      choices: ['小規模企業共済等掛金控除', '生命保険料控除', '社会保険料控除'],
      answer: 0,
      explain: '記事に「掛金の全額が小規模企業共済等掛金控除の対象」とある。',
      highlight: ['[data-hl="mag-ideco"]'],
    });
  })();

  window.JITSUGI = { resources: RESOURCES, questions: QUESTIONS };
})();
