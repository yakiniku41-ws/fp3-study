/* =====================================================================
 * curriculum.js
 * FP3級（日本FP協会・資産設計提案業務）カリキュラム定義
 *
 * サイト全体（ホームのロードマップ、進捗管理、次の1単元の提示、
 * 模試の分野別集計など）がこの定義を「唯一の情報源」として参照します。
 * 分野・単元を追加/変更するときは、原則このファイルだけを編集します。
 *
 * ビルド不要のため、ES Modules ではなく window 直下のグローバルに置きます
 * （file:// で開いても動くようにするための意図的な選択です）。
 * ===================================================================== */
(function () {
  'use strict';

  /* 6分野のメタ情報。key は URL / localStorage キー / CSS のアクセント色に使う */
  const FIELDS = [
    {
      key: 'life',
      no: 1,
      title: 'ライフプランニングと資金計画',
      short: 'ライフ',
      emoji: '🗺️',
      color: '#2563eb',
      dir: 'chapters/life/',
      description: 'FPの基本姿勢から、キャッシュフロー表・6つの係数・社会保険・公的年金まで。学習の土台になる分野です。',
    },
    {
      key: 'risk',
      no: 2,
      title: 'リスク管理',
      short: 'リスク',
      emoji: '🛡️',
      color: '#0d9488',
      dir: 'chapters/risk/',
      description: '生命保険・損害保険・第三分野の保険と、それにかかる税金。「もしも」に備える仕組みを学びます。',
    },
    {
      key: 'finance',
      no: 3,
      title: '金融資産運用',
      short: '金融',
      emoji: '📈',
      color: '#7c3aed',
      dir: 'chapters/finance/',
      description: '預貯金・債券・株式・投資信託と、利回りやリスクの考え方。NISAなどの制度もここで扱います。',
    },
    {
      key: 'tax',
      no: 4,
      title: 'タックスプランニング',
      short: 'タックス',
      emoji: '🧾',
      color: '#dc2626',
      dir: 'chapters/tax/',
      description: '所得税を中心に「収入→所得→課税所得→税額」の流れを理解します。控除の種類がヤマ場です。',
    },
    {
      key: 'estate',
      no: 5,
      title: '不動産',
      short: '不動産',
      emoji: '🏠',
      color: '#ea580c',
      dir: 'chapters/estate/',
      description: '登記・取引のルール、建蔽率/容積率、不動産にかかる税金と有効活用。図で押さえると得点源になります。',
    },
    {
      key: 'inherit',
      no: 6,
      title: '相続・事業承継',
      short: '相続',
      emoji: '👪',
      color: '#ca8a04',
      dir: 'chapters/inherit/',
      description: '相続分・相続税・贈与税・財産評価。家系図と計算のパターンをつかめば一気に解けるようになります。',
    },
  ];

  /* 各分野の単元（5〜8個 / 1単元10〜15分想定）。
   * id は "分野key-連番"。href は各単元ページ（フェーズ2以降で実装）。
   * href が null の単元は「準備中」として扱い、ロードマップ上でロック表示します。 */
  const UNITS = {
    life: [
      { id: 'life-1', no: 1, title: 'FPの基本と関連法規・倫理', minutes: 10, href: 'chapters/life/l1-kihon.html',
        summary: 'FPがやってはいけないこと（士業の独占業務）と、6ステップの提案プロセス。' },
      { id: 'life-2', no: 2, title: 'ライフプランニングの手法とキャッシュフロー表', minutes: 15, href: 'chapters/life/l2-cashflow.html',
        summary: 'ライフイベント表・キャッシュフロー表・個人バランスシートの読み方と作り方。' },
      { id: 'life-3', no: 3, title: '6つの係数（お金を過去・未来へ運ぶ切符）', minutes: 15, href: 'chapters/life/l3-keisu.html',
        summary: '終価・現価・年金終価・減債基金・資本回収・年金現価の6係数の使い分け。' },
      { id: 'life-4', no: 4, title: '教育資金・住宅取得資金プランニング', minutes: 12, href: 'chapters/life/l4-shikin.html',
        summary: '教育ローンと奨学金、住宅ローンの返済方式（元利均等/元金均等）と繰上げ返済。' },
      { id: 'life-5', no: 5, title: '社会保険（健康保険・雇用保険・労災）', minutes: 15, href: 'chapters/life/l5-shakaihoken.html',
        summary: '公的医療保険の給付、退職後の選択肢、雇用保険の基本手当、労災の対象。' },
      { id: 'life-6', no: 6, title: '公的年金の全体像（国民年金・厚生年金）', minutes: 15, href: 'chapters/life/l6-nenkin.html',
        summary: '2階建て構造、被保険者の種別、保険料と免除、老齢・障害・遺族の3給付。' },
      { id: 'life-7', no: 7, title: '年金給付と企業年金・iDeCo', minutes: 15, href: 'chapters/life/l7-kyufu-ideco.html',
        summary: '老齢給付の繰上げ/繰下げ、遺族年金の対象者、確定拠出年金（iDeCo）の要点。' },
    ],
    risk: [
      { id: 'risk-1', no: 1, title: '保険の基礎と契約者保護', minutes: 10, href: 'chapters/risk/l1-kiso.html',
        summary: '大数の法則・収支相等の原則、クーリングオフ、保険契約者保護機構。' },
      { id: 'risk-2', no: 2, title: '生命保険の仕組みと主要商品', minutes: 15, href: 'chapters/risk/l2-seimei.html',
        summary: '定期・終身・養老の違い、特約、保険料の仕組み（純保険料/付加保険料）。' },
      { id: 'risk-3', no: 3, title: '生命保険と税金', minutes: 15, href: 'chapters/risk/l3-zeikin.html',
        summary: '生命保険料控除、保険金の課税関係（契約者・被保険者・受取人の組み合わせ）。' },
      { id: 'risk-4', no: 4, title: '損害保険（火災・地震・自動車）', minutes: 15, href: 'chapters/risk/l4-songai.html',
        summary: '火災保険と地震保険、自賠責と任意保険、実損てん補と比例てん補。' },
      { id: 'risk-5', no: 5, title: '傷害保険・賠償責任保険', minutes: 10, href: 'chapters/risk/l5-shogai.html',
        summary: '普通傷害・家族傷害・国内旅行/海外旅行傷害、個人賠償責任保険。' },
      { id: 'risk-6', no: 6, title: '第三分野の保険と保険の見直し', minutes: 12, href: 'chapters/risk/l6-daisan.html',
        summary: '医療保険・がん保険・就業不能保険、必要保障額の考え方。' },
    ],
    finance: [
      { id: 'finance-1', no: 1, title: '経済・金融の基礎指標', minutes: 12, href: 'chapters/finance/l1-keizai.html',
        summary: 'GDP・景気動向指数・物価・金利・為替の関係と、代表的な経済指標。' },
      { id: 'finance-2', no: 2, title: '預貯金と金融類似商品', minutes: 10, href: 'chapters/finance/l2-yochokin.html',
        summary: '預金の種類、単利/複利、利回りの基本計算。' },
      { id: 'finance-3', no: 3, title: '債券投資と利回り', minutes: 15, href: 'chapters/finance/l3-saiken.html',
        summary: '債券価格と金利の関係、最終利回り/所有期間利回り、格付け。' },
      { id: 'finance-4', no: 4, title: '株式投資と投資指標（PER/PBR/ROE）', minutes: 15, href: 'chapters/finance/l4-kabushiki.html',
        summary: '株式の売買ルール、代表的な指標の意味と計算、配当利回り。' },
      { id: 'finance-5', no: 5, title: '投資信託', minutes: 15, href: 'chapters/finance/l5-toshin.html',
        summary: '投資信託の分類、基準価額とコスト、運用スタイル（パッシブ/アクティブ）。' },
      { id: 'finance-6', no: 6, title: '外貨建て商品とポートフォリオ', minutes: 12, href: 'chapters/finance/l6-gaika.html',
        summary: '為替リスク、外貨預金の利回り、分散投資と相関、リスクの考え方。' },
      { id: 'finance-7', no: 7, title: '金融商品と税金・NISA', minutes: 15, href: 'chapters/finance/l7-zeikin-nisa.html',
        summary: '利子・配当・譲渡益の課税、NISA制度、預金保険などのセーフティネット。' },
    ],
    tax: [
      { id: 'tax-1', no: 1, title: '所得税の仕組みと全体の流れ', minutes: 12, href: 'chapters/tax/l1-shikumi.html',
        summary: '所得税の性格、総合課税と分離課税、課税までの5ステップ。' },
      { id: 'tax-2', no: 2, title: '10種類の所得', minutes: 15, href: 'chapters/tax/l2-shotoku.html',
        summary: '給与・事業・不動産・利子・配当・退職・一時・雑・譲渡・山林の所得の求め方。' },
      { id: 'tax-3', no: 3, title: '損益通算と所得控除', minutes: 15, href: 'chapters/tax/l3-koujo.html',
        summary: '損益通算できる所得、基礎・配偶者・扶養・社会保険料などの所得控除。' },
      { id: 'tax-4', no: 4, title: '税額計算と税額控除', minutes: 15, href: 'chapters/tax/l4-zeigaku.html',
        summary: '超過累進税率、住宅ローン控除・配当控除などの税額控除。' },
      { id: 'tax-5', no: 5, title: '所得税の申告と納付', minutes: 12, href: 'chapters/tax/l5-shinkoku.html',
        summary: '確定申告と年末調整、青色申告のメリット、源泉徴収票の読み方。' },
      { id: 'tax-6', no: 6, title: '住民税・その他の税', minutes: 10, href: 'chapters/tax/l6-juminzei.html',
        summary: '個人住民税の仕組み、ふるさと納税の考え方の触り。' },
    ],
    estate: [
      { id: 'estate-1', no: 1, title: '不動産の基礎と登記', minutes: 12, href: 'chapters/estate/l1-kiso.html',
        summary: '登記事項証明書の構成、地価の4つの価格、不動産の調査。' },
      { id: 'estate-2', no: 2, title: '不動産の取引', minutes: 12, href: 'chapters/estate/l2-torihiki.html',
        summary: '宅建業法の基本、手付金、契約不適合責任、危険負担。' },
      { id: 'estate-3', no: 3, title: '借地借家法・区分所有法', minutes: 15, href: 'chapters/estate/l3-shakuchi.html',
        summary: '普通借地/定期借地、普通借家/定期借家、マンションの管理・集会。' },
      { id: 'estate-4', no: 4, title: '都市計画法・建築基準法（建蔽率・容積率）', minutes: 15, href: 'chapters/estate/l4-kenpei.html',
        summary: '用途地域、建蔽率と容積率の計算、接道義務とセットバック。' },
      { id: 'estate-5', no: 5, title: '不動産にかかる税金', minutes: 15, href: 'chapters/estate/l5-zeikin.html',
        summary: '取得・保有・譲渡・賃貸の各段階の税金、居住用財産の特例。' },
      { id: 'estate-6', no: 6, title: '不動産の有効活用と投資判断', minutes: 12, href: 'chapters/estate/l6-katsuyo.html',
        summary: '土地活用の方式、利回り（表面/実質）、投資判断の指標。' },
    ],
    inherit: [
      { id: 'inherit-1', no: 1, title: '相続の基礎', minutes: 12, href: 'chapters/inherit/l1-kiso.html',
        summary: '法定相続人の範囲と順位、相続の承認・放棄、遺言の種類。' },
      { id: 'inherit-2', no: 2, title: '相続分と遺産分割', minutes: 15, href: 'chapters/inherit/l2-souzokubun.html',
        summary: '法定相続分のパターン、遺留分、遺産分割の方法。' },
      { id: 'inherit-3', no: 3, title: '相続税の計算', minutes: 15, href: 'chapters/inherit/l3-souzokuzei.html',
        summary: '基礎控除、課税価格、生命保険金の非課税、税額の計算手順。' },
      { id: 'inherit-4', no: 4, title: '贈与と贈与税', minutes: 15, href: 'chapters/inherit/l4-zoyo.html',
        summary: '暦年課税と相続時精算課税、贈与税の配偶者控除、各種特例。' },
      { id: 'inherit-5', no: 5, title: '財産の評価', minutes: 15, href: 'chapters/inherit/l5-hyoka.html',
        summary: '宅地の評価（路線価方式/倍率方式）、小規模宅地等の特例、上場株式の評価。' },
      { id: 'inherit-6', no: 6, title: '事業承継対策', minutes: 10, href: 'chapters/inherit/l6-shokei.html',
        summary: '自社株評価の考え方、納税資金対策、事業承継税制の概要。' },
    ],
  };

  /* 全単元を配列で平坦化（順序＝学習の推奨順） */
  function allUnits() {
    const list = [];
    FIELDS.forEach(function (f) {
      (UNITS[f.key] || []).forEach(function (u) {
        list.push(Object.assign({ fieldKey: f.key, fieldNo: f.no }, u));
      });
    });
    return list;
  }

  function fieldByKey(key) {
    return FIELDS.find(function (f) { return f.key === key; }) || null;
  }

  function unitById(id) {
    return allUnits().find(function (u) { return u.id === id; }) || null;
  }

  function unitsOf(key) {
    return (UNITS[key] || []).map(function (u) {
      const f = fieldByKey(key);
      return Object.assign({ fieldKey: key, fieldNo: f ? f.no : 0 }, u);
    });
  }

  window.CURRICULUM = {
    FIELDS: FIELDS,
    UNITS: UNITS,
    allUnits: allUnits,
    unitsOf: unitsOf,
    fieldByKey: fieldByKey,
    unitById: unitById,
    totalUnits: allUnits().length,
    /* サイト共通の試験メタ情報（表示用） */
    EXAM: {
      org: '日本FP協会',
      jitsugi: '資産設計提案業務',
      lawBaseDate: '2025年4月1日', // ← 制作時点の法令基準日。最新の試験基準に合わせて更新してください
      gakka: { questions: 60, minutes: 90, pass: 36, format: '○×30問＋三答択一30問' },
      jitsugiExam: { questions: 20, minutes: 60, pass: 60, full: 100, format: '多肢選択式' },
    },
  };
})();
