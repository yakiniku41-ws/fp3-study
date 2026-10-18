/* =====================================================================
 * exam-bank.js — 学科模試用の問題バンク
 *
 * 各単元のミニチェック問題（js/data 配下ではなく各 chapters/*.html に
 * インラインで定義されているもの）を、模試モードで再利用できるよう
 * ここに集約する。id は各単元ページのミニチェックと同一にしており、
 * 模試で間違えた問題も、単元ページのミニチェックで間違えた問題も、
 * 同じ復習デッキのエントリとして扱われる（Store.addToReview は id
 * をキーにするため）。
 *
 * 各問題には tags: ['field:xxx', 'unit:xxx-n'] を付与しており、
 * 模試の分野別正答率（レーダーチャート）はこの tags を見て集計する
 * （js/quiz.js の createRunner().byField() が対応）。
 * ===================================================================== */
(function () {
  'use strict';

  var BANK = [];

  /* ---------------- ① ライフプランニングと資金計画 ---------------- */
  BANK.push(
    { id: 'life-1-q1', type: 'ox', q: '税理士資格を持たないFPが、顧客の求めに応じ、無償で確定申告書を作成した。これは適切である。', answer: false, explain: '税務書類の作成は有償・無償を問わず税理士の独占業務です。無償でもできません。', tags: ['field:life', 'unit:life-1'] },
    { id: 'life-1-q2', type: 'ox', q: 'FPが、一般的な税制の説明や、仮定の数値を用いた所得税額の計算例を顧客に示すことは、税理士法に抵触しない。', answer: true, explain: '「個別具体的」でない一般的な説明・仮定の試算は問題ありません。', tags: ['field:life', 'unit:life-1'] },
    { id: 'life-1-q3', type: 'choice', q: '生命保険募集人の登録を受けていないFPの行為として、最も適切なものはどれか。', choices: ['顧客に具体的な保険商品を勧め、契約の申込みを受け付けた', '生命保険の一般的なしくみや必要保障額の考え方を説明した', '顧客に代わって保険会社へ契約の意思を伝えた'], answer: 1, explain: '募集・勧誘・契約手続きは登録が必要ですが、一般的なしくみの説明はできます。', tags: ['field:life', 'unit:life-1'] },
    { id: 'life-1-q4', type: 'choice', q: 'ファイナンシャル・プランニングのプロセスとして、一般に「情報収集と目標の明確化」の次に行うのはどれか。', choices: ['顧客との関係確立', '顧客の現状分析', 'プランの定期的な見直し'], answer: 1, explain: '順序は ①関係確立 → ②情報収集・目標 → ③現状分析 → ④提案 → ⑤実行支援 → ⑥見直し。', tags: ['field:life', 'unit:life-1'] },
    { id: 'life-1-q5', type: 'ox', q: 'FPには、顧客の利益よりも自身が得る手数料を優先して商品を提案してよいという原則がある。', answer: false, explain: '逆です。FP倫理の基本は「顧客利益の優先」です。', tags: ['field:life', 'unit:life-1'] },

    { id: 'life-2-q1', type: 'ox', q: 'キャッシュフロー表において、基準年から2年後の給与収入は「現在の額 ×（1＋変動率）²」で求める。', answer: true, explain: '将来値は変動率を年数分だけ累乗します。2年後なら2乗です。', tags: ['field:life', 'unit:life-2'] },
    { id: 'life-2-q2', type: 'ox', q: '可処分所得は、年収から所得税・住民税・社会保険料に加えて、生命保険料も差し引いて求める。', answer: false, explain: '差し引くのは「所得税・住民税・社会保険料」だけ。生命保険料やローンは含めません。', tags: ['field:life', 'unit:life-2'] },
    { id: 'life-2-q3', type: 'choice', q: 'キャッシュフロー表の「年末の貯蓄残高」の求め方として正しいものはどれか。', choices: ['前年末残高 ＋ その年の年間収支（利息は考えない）', '前年末残高 ×（1＋運用利率）＋ その年の年間収支', '（前年末残高 ＋ 年間収支）×（1＋運用利率）'], answer: 1, explain: '前年末残高にまず利息を付け、その後にその年の年間収支を足します。', tags: ['field:life', 'unit:life-2'] },
    { id: 'life-2-q4', type: 'choice', q: '個人バランスシートで「純資産」を求める式はどれか。', choices: ['資産（時価）＋ 負債', '資産（時価）− 負債', '収入 − 支出'], answer: 1, explain: '純資産＝資産−負債。資産は時価で評価します。', tags: ['field:life', 'unit:life-2'] },

    { id: 'life-3-q1', type: 'choice', q: '現在の100万円を年利で運用した場合の、10年後の元利合計を求めるのに使う係数はどれか。', choices: ['終価係数', '現価係数', '年金現価係数'], answer: 0, explain: '一時金を将来へ増やす → 終価係数。', tags: ['field:life', 'unit:life-3'] },
    { id: 'life-3-q2', type: 'choice', q: '10年後に300万円を用意するために、毎年いくら積み立てればよいかを求める係数はどれか。', choices: ['年金終価係数', '減債基金係数', '資本回収係数'], answer: 1, explain: '将来の目標額から毎年の積立額を求める → 減債基金係数。', tags: ['field:life', 'unit:life-3'] },
    { id: 'life-3-q3', type: 'choice', q: '毎年60万円を10年間積み立てたとき、10年後にいくら貯まるかを求める係数はどれか。', choices: ['年金終価係数', '減債基金係数', '終価係数'], answer: 0, explain: '毎年の積立の将来合計 → 年金終価係数。', tags: ['field:life', 'unit:life-3'] },
    { id: 'life-3-q4', type: 'choice', q: '手元の1,000万円を運用しながら20年間で取り崩すとき、毎年受け取れる額を求める係数はどれか。（住宅ローンの毎年返済額を求めるのと同じ）', choices: ['年金現価係数', '資本回収係数', '減債基金係数'], answer: 1, explain: '今ある元手から毎年の受取額（＝ローン返済額）を求める → 資本回収係数。', tags: ['field:life', 'unit:life-3'] },
    { id: 'life-3-q5', type: 'ox', q: '終価係数と現価係数は、互いに逆数の関係にある。', answer: true, explain: '将来へ増やす終価係数と、今へ割り引く現価係数は逆数の関係です。', tags: ['field:life', 'unit:life-3'] },

    { id: 'life-4-q1', type: 'ox', q: '日本学生支援機構の奨学金のうち、第一種奨学金は無利子である。', answer: true, explain: '第一種＝無利子、第二種＝有利子です。', tags: ['field:life', 'unit:life-4'] },
    { id: 'life-4-q2', type: 'choice', q: '「教育一般貸付（国の教育ローン）」について正しいものはどれか。', choices: ['借りるのは原則として学生本人である', '融資金は入学前などに一括で受け取れる', '金利は変動金利のみである'], answer: 1, explain: '原則保護者が借り、一括で受け取れる固定金利のローンです。限度額は子1人350万円（要件により450万円）。', tags: ['field:life', 'unit:life-4'] },
    { id: 'life-4-q3', type: 'ox', q: '他の条件が同じ場合、元金均等返済よりも元利均等返済のほうが総返済額は多くなる。', answer: true, explain: '当初に元金が多く残る元利均等のほうが利息総額が大きく、総返済額は多くなります。', tags: ['field:life', 'unit:life-4'] },
    { id: 'life-4-q4', type: 'choice', q: '住宅ローンの繰上げ返済で、一般に利息の軽減効果が大きいのはどちらか。', choices: ['返済額軽減型', '期間短縮型', 'どちらも同じ'], answer: 1, explain: '返済期間を縮める「期間短縮型」のほうが利息軽減効果は大きくなります。', tags: ['field:life', 'unit:life-4'] },
    { id: 'life-4-q5', type: 'ox', q: 'フラット35は、住宅金融支援機構が関与する変動金利型の住宅ローンである。', answer: false, explain: 'フラット35は長期「固定」金利型です。', tags: ['field:life', 'unit:life-4'] },

    { id: 'life-5-q1', type: 'ox', q: '労働者災害補償保険（労災保険）の保険料は、事業主と労働者が折半で負担する。', answer: false, explain: '労災保険料は全額事業主負担です。労働者の負担はありません。', tags: ['field:life', 'unit:life-5'] },
    { id: 'life-5-q2', type: 'choice', q: '健康保険の傷病手当金に関する説明として正しいものはどれか。', choices: ['療養のため休んだ初日から支給される', '連続3日の待期の後、4日目から支給される', '支給期間に上限はない'], answer: 1, explain: '連続3日の待期後、4日目から、標準報酬日額の3分の2が通算1年6か月まで支給されます。', tags: ['field:life', 'unit:life-5'] },
    { id: 'life-5-q3', type: 'choice', q: '健康保険の任意継続被保険者について、正しいものはどれか。', choices: ['退職後2か月以内に申請すればよい', '加入できる期間は最長2年である', '保険料は在職時と同じく労使折半である'], answer: 1, explain: '退職後20日以内の申請で、最長2年間。保険料は全額自己負担になります。', tags: ['field:life', 'unit:life-5'] },
    { id: 'life-5-q4', type: 'ox', q: '公的介護保険の被保険者となるのは、65歳以上の者に限られる。', answer: false, explain: '40歳以上が被保険者。65歳以上が第1号、40〜64歳が第2号被保険者です。', tags: ['field:life', 'unit:life-5'] },
    { id: 'life-5-q5', type: 'ox', q: '雇用保険の基本手当は、自己都合で退職した場合、原則として待期期間に加えて給付制限が設けられている。', answer: true, explain: '自己都合退職では原則7日の待期に加え、一定の給付制限期間があります。', tags: ['field:life', 'unit:life-5'] },

    { id: 'life-6-q1', type: 'ox', q: '国民年金の第3号被保険者は、自分で国民年金保険料を納付する必要がある。', answer: false, explain: '第3号被保険者は保険料の負担がありません（配偶者が加入する制度全体で負担）。', tags: ['field:life', 'unit:life-6'] },
    { id: 'life-6-q2', type: 'choice', q: '老齢基礎年金の受給資格期間として正しいものはどれか。', choices: ['原則10年以上', '原則20年以上', '原則25年以上'], answer: 0, explain: '受給資格期間は原則10年（120月）以上です（かつては25年でした）。', tags: ['field:life', 'unit:life-6'] },
    { id: 'life-6-q3', type: 'choice', q: '国民年金の被保険者区分について、会社員に扶養される配偶者（要件を満たす）が該当するのはどれか。', choices: ['第1号被保険者', '第2号被保険者', '第3号被保険者'], answer: 2, explain: '第2号被保険者に扶養される配偶者は第3号被保険者です。', tags: ['field:life', 'unit:life-6'] },
    { id: 'life-6-q4', type: 'ox', q: '老齢基礎年金を満額受給するには、原則として40年（480月）の保険料納付済期間が必要である。', answer: true, explain: '20歳から60歳までの40年間すべて納付すると満額になります。', tags: ['field:life', 'unit:life-6'] },
    { id: 'life-6-q5', type: 'ox', q: '厚生年金保険の保険料は、被保険者と事業主が折半で負担する。', answer: true, explain: '厚生年金保険料は労使折半です。国民年金第1号の保険料は定額を本人が納付します。', tags: ['field:life', 'unit:life-6'] },

    { id: 'life-7-q1', type: 'choice', q: '老齢基礎年金の繰下げ受給による増額率として正しいものはどれか。', choices: ['1か月あたり0.4%', '1か月あたり0.7%', '1か月あたり1.0%'], answer: 1, explain: '繰下げは1か月あたり0.7%増額（繰上げは0.4%減額）。', tags: ['field:life', 'unit:life-7'] },
    { id: 'life-7-q2', type: 'ox', q: '老齢年金の繰上げ・繰下げによる増減率は、一度決めると生涯にわたって適用される。', answer: true, explain: '繰上げの減額・繰下げの増額は一生続きます。あとで取り消して元に戻すことはできません。', tags: ['field:life', 'unit:life-7'] },
    { id: 'life-7-q3', type: 'ox', q: '遺族基礎年金は、子のない配偶者にも支給される。', answer: false, explain: '遺族基礎年金は「子のある配偶者」または「子」に限られます。子がいない場合は支給されません。', tags: ['field:life', 'unit:life-7'] },
    { id: 'life-7-q4', type: 'choice', q: 'iDeCo（個人型確定拠出年金）の掛金に関する税制上の取扱いとして正しいものはどれか。', choices: ['掛金は生命保険料控除の対象となる', '掛金は全額が小規模企業共済等掛金控除の対象となる', '掛金は所得控除の対象にならない'], answer: 1, explain: 'iDeCoの掛金は全額が「小規模企業共済等掛金控除」として所得控除の対象です。', tags: ['field:life', 'unit:life-7'] },
    { id: 'life-7-q5', type: 'ox', q: '確定拠出年金の運用期間中に得られた運用益は非課税である。', answer: true, explain: '確定拠出年金（iDeCo・企業型）の運用益は非課税です。', tags: ['field:life', 'unit:life-7'] }
  );

  /* ---------------- ② リスク管理 ---------------- */
  BANK.push(
    { id: 'risk-1-q1', type: 'ox', q: '保険料の計算に用いる「予定利率」を高く見込むほど、保険料は高くなる。', answer: false, explain: '予定利率が高いほど運用で稼げる前提となり、保険料は安くなります。', tags: ['field:risk', 'unit:risk-1'] },
    { id: 'risk-1-q2', type: 'choice', q: '生命保険のクーリングオフについて正しいものはどれか。', choices: ['契約日から一律10日以内であれば撤回できる', '申込日または書面交付日のいずれか遅い日から8日以内に撤回できる', '一度契約すると撤回はできない'], answer: 1, explain: '原則、申込日と書面交付日のいずれか遅い日から8日以内なら書面等で撤回できます。', tags: ['field:risk', 'unit:risk-1'] },
    { id: 'risk-1-q3', type: 'ox', q: '国内で事業を行う生命保険会社が破綻した場合、生命保険契約者保護機構により、破綻時点の責任準備金等の全額（100%）が補償される。', answer: false, explain: '生命保険は原則として責任準備金等の90%までの補償です（100%ではありません）。', tags: ['field:risk', 'unit:risk-1'] },
    { id: 'risk-1-q4', type: 'choice', q: '「多数の契約を集めるほど事故の発生確率が予測しやすくなる」という考え方を何というか。', choices: ['収支相等の原則', '大数の法則', '利得禁止の原則'], answer: 1, explain: '大数の法則です。収支相等の原則は「集める保険料と支払う保険金がつり合う」設計原則。', tags: ['field:risk', 'unit:risk-1'] },

    { id: 'risk-2-q1', type: 'ox', q: '養老保険は、保険期間中に死亡した場合の死亡保険金と、満期まで生存した場合の満期保険金が同額である。', answer: true, explain: '養老保険は死亡保険金と満期保険金が同額で、貯蓄性が高い保険です。', tags: ['field:risk', 'unit:risk-2'] },
    { id: 'risk-2-q2', type: 'ox', q: '終身保険には満期があり、満期時に満期保険金が支払われる。', answer: false, explain: '終身保険は一生涯の保障で満期がありません。満期保険金もありません。', tags: ['field:risk', 'unit:risk-2'] },
    { id: 'risk-2-q3', type: 'choice', q: 'リビング・ニーズ特約の説明として正しいものはどれか。', choices: ['所定の先進医療を受けたときに給付金が支払われる', '余命6か月以内と診断されたとき、死亡保険金の一部を生前に受け取れる', '入院1日目から入院給付金が支払われる'], answer: 1, explain: 'リビング・ニーズ特約は余命6か月以内と判断された場合に生前給付を受けられ、特約保険料は不要です。', tags: ['field:risk', 'unit:risk-2'] },
    { id: 'risk-2-q4', type: 'choice', q: '保険料の払込みを中止し、その時点の解約返戻金をもとに、保険期間を変えずに保障額を下げた保険に変更する方法はどれか。', choices: ['延長（定期）保険', '払済保険', '契約者貸付'], answer: 1, explain: '払済保険は「保険期間そのまま・保障額を下げる」変更です。延長保険は「保障額そのまま・期間を短くする」。', tags: ['field:risk', 'unit:risk-2'] },

    { id: 'risk-3-q1', type: 'choice', q: '契約者（保険料負担者）と被保険者が同一人物（夫）で、受取人が妻である生命保険の死亡保険金にかかる税金はどれか。', choices: ['相続税', '所得税', '贈与税'], answer: 0, explain: '契約者＝被保険者の死亡保険金は、みなし相続財産として相続税の対象です。', tags: ['field:risk', 'unit:risk-3'] },
    { id: 'risk-3-q2', type: 'choice', q: '契約者・受取人が妻、被保険者が夫である生命保険の死亡保険金にかかる税金はどれか。', choices: ['相続税', '所得税（一時所得）', '贈与税'], answer: 1, explain: '契約者＝受取人（保険料を払った人が受け取る）なので、所得税（一時所得）です。', tags: ['field:risk', 'unit:risk-3'] },
    { id: 'risk-3-q3', type: 'choice', q: '契約者が夫、被保険者が妻、受取人が子である生命保険の死亡保険金にかかる税金はどれか。', choices: ['相続税', '所得税', '贈与税'], answer: 2, explain: '契約者・被保険者・受取人が全員異なる場合は贈与税の対象です。', tags: ['field:risk', 'unit:risk-3'] },
    { id: 'risk-3-q4', type: 'ox', q: '契約者と受取人が同一人物である満期保険金は、所得税（一時所得）の課税対象となる。', answer: true, explain: '満期保険金は「契約者＝受取人」なら所得税、異なれば贈与税です。', tags: ['field:risk', 'unit:risk-3'] },
    { id: 'risk-3-q5', type: 'ox', q: '2012年以降に契約した生命保険では、一般・介護医療・個人年金の3区分で生命保険料控除が受けられる。', answer: true, explain: '新制度（2012年〜）は3区分。各区分で所得税は最大4万円（合計最大12万円）です。', tags: ['field:risk', 'unit:risk-3'] },

    { id: 'risk-4-q1', type: 'ox', q: '地震保険は、火災保険に付帯して契約するもので、単独では契約できない。', answer: true, explain: '地震保険は単独契約不可。火災保険に付帯して加入します。', tags: ['field:risk', 'unit:risk-4'] },
    { id: 'risk-4-q2', type: 'choice', q: '地震保険の保険金額は、付帯する火災保険金額のどの範囲内で設定するか。', choices: ['10%〜30%', '30%〜50%', '50%〜80%'], answer: 1, explain: '地震保険は火災保険金額の30%〜50%の範囲（建物5,000万円・家財1,000万円が上限）。', tags: ['field:risk', 'unit:risk-4'] },
    { id: 'risk-4-q3', type: 'ox', q: '地震により発生した火災による建物の損害は、通常の火災保険で補償される。', answer: false, explain: '地震・噴火・津波が原因の火災は火災保険では補償されず、地震保険の対象です。', tags: ['field:risk', 'unit:risk-4'] },
    { id: 'risk-4-q4', type: 'choice', q: '自動車損害賠償責任保険（自賠責保険）について正しいものはどれか。', choices: ['対人・対物の両方を補償する', '補償の対象は対人賠償のみである', '加入は任意である'], answer: 1, explain: '自賠責は全車強制加入で、補償対象は対人賠償のみ（物損・自分のケガは対象外）です。', tags: ['field:risk', 'unit:risk-4'] },

    { id: 'risk-5-q1', type: 'ox', q: '普通傷害保険では、地震・噴火・津波によるケガは原則として補償されない。', answer: true, explain: '普通傷害保険では地震等によるケガは原則対象外です。海外旅行傷害保険では補償されます。', tags: ['field:risk', 'unit:risk-5'] },
    { id: 'risk-5-q2', type: 'choice', q: '海外旅行傷害保険で、一般に補償の対象となるものはどれか。', choices: ['旅行中の細菌性食中毒', '旅行前からの持病の通常の療養', '故意によるケガ'], answer: 0, explain: '海外旅行傷害保険は、旅行中の病気・細菌性食中毒・地震によるケガも補償対象です。', tags: ['field:risk', 'unit:risk-5'] },
    { id: 'risk-5-q3', type: 'ox', q: '個人賠償責任保険では、業務遂行中に他人に与えた損害の賠償責任も補償される。', answer: false, explain: '個人賠償責任保険は日常生活での賠償が対象で、業務中・自動車事故・借り物の損害は対象外です。', tags: ['field:risk', 'unit:risk-5'] },
    { id: 'risk-5-q4', type: 'choice', q: '製造・販売した製品の欠陥により、消費者にケガをさせた場合の賠償に備える保険はどれか。', choices: ['個人賠償責任保険', 'PL保険（生産物賠償責任保険）', '施設所有者賠償責任保険'], answer: 1, explain: '製品が原因で第三者に損害を与えた場合はPL保険（生産物賠償責任保険）で備えます。', tags: ['field:risk', 'unit:risk-5'] },

    { id: 'risk-6-q1', type: 'ox', q: 'がん保険には、一般に契約日から一定期間（約90日）の免責期間があり、その期間中にがんと診断されても保障の対象外となる。', answer: true, explain: 'がん保険には通常90日（3か月）程度の免責期間があります。', tags: ['field:risk', 'unit:risk-6'] },
    { id: 'risk-6-q2', type: 'ox', q: '医療保険やがん保険などの第三分野の保険は、生命保険会社のみが取り扱うことができる。', answer: false, explain: '第三分野の保険は生命保険会社・損害保険会社のどちらも取り扱えます。', tags: ['field:risk', 'unit:risk-6'] },
    { id: 'risk-6-q3', type: 'choice', q: '先進医療特約における「先進医療」の判定時点として正しいものはどれか。', choices: ['保険契約時点', '療養を受けた時点', '保険金請求時点'], answer: 1, explain: '先進医療特約は「療養を受けた時点」で承認されている先進医療が対象です。', tags: ['field:risk', 'unit:risk-6'] },
    { id: 'risk-6-q4', type: 'choice', q: '遺族の必要保障額の考え方として正しいものはどれか。', choices: ['遺族に必要な支出総額に、遺族の収入や保有資産を上乗せした額', '遺族に必要な支出総額から、遺族年金や保有資産などを差し引いた額', '世帯主の年収の10倍で固定する'], answer: 1, explain: '必要保障額＝必要な支出総額−（遺族の収入・遺族年金・保有資産など）。準備済みの分を差し引きます。', tags: ['field:risk', 'unit:risk-6'] }
  );

  /* ---------------- ③ 金融資産運用 ---------------- */
  BANK.push(
    { id: 'finance-1-q1', type: 'ox', q: '為替相場が1ドル＝100円から1ドル＝120円になることは、円高が進んだことを意味する。', answer: false, explain: '1ドルを買うのに多くの円が必要になった＝円の価値が下がった＝円安です。', tags: ['field:finance', 'unit:finance-1'] },
    { id: 'finance-1-q2', type: 'choice', q: '日本銀行が行う金融政策のうち、市場に資金を供給し、金利を低下させる方向に働くものはどれか。', choices: ['売りオペレーション', '買いオペレーション', '預金準備率の引上げ'], answer: 1, explain: '買いオペは市場に資金を供給し、金利を低下させる方向に働きます。', tags: ['field:finance', 'unit:finance-1'] },
    { id: 'finance-1-q3', type: 'choice', q: '消費者が購入する商品やサービスの価格変動を表す物価指数はどれか。', choices: ['企業物価指数', '消費者物価指数（CPI）', 'GDPデフレーター'], answer: 1, explain: '家計が購入する財・サービスの価格を表すのは消費者物価指数（CPI）です。', tags: ['field:finance', 'unit:finance-1'] },
    { id: 'finance-1-q4', type: 'ox', q: '景気動向指数のうち、CIは景気変動の大きさやテンポ（勢い）を、DIは景気の各分野への波及の度合い（広がり）を表す。', answer: true, explain: 'CI＝勢い、DI＝広がり、と押さえます。', tags: ['field:finance', 'unit:finance-1'] },

    { id: 'finance-2-q1', type: 'ox', q: '複利では、一定期間ごとに支払われる利息を元本に組み入れ、その合計額に対して次の利息が計算される。', answer: true, explain: '複利は利息を元本に組み入れて次の利息を計算するため、雪だるま式に増えます。', tags: ['field:finance', 'unit:finance-2'] },
    { id: 'finance-2-q2', type: 'choice', q: '元本100万円を年利2%（1年複利）で3年間預けたときの、3年後の元利合計に最も近いものはどれか。', choices: ['106万円ちょうど', '約106.1万円', '約112万円'], answer: 1, explain: '100万円×1.02³≒106.12万円。単利なら106万円ちょうどです。', tags: ['field:finance', 'unit:finance-2'] },
    { id: 'finance-2-q3', type: 'ox', q: '同じ利率・同じ元本であれば、預入期間が長くなるほど単利と複利の元利合計の差は大きくなる。', answer: true, explain: '複利効果は期間が長いほど効いてくるため、差は拡大します。', tags: ['field:finance', 'unit:finance-2'] },
    { id: 'finance-2-q4', type: 'choice', q: '半年複利で計算する場合の扱いとして正しいものはどれか。', choices: ['年利率をそのまま用い、年数を2倍にする', '年利率を2分の1にし、期間（複利回数）を2倍にする', '年利率を2倍にし、年数はそのまま'], answer: 1, explain: '半年複利は「利率÷2」を「年数×2」乗します。', tags: ['field:finance', 'unit:finance-2'] },

    { id: 'finance-3-q1', type: 'ox', q: '一般に、市場金利が上昇すると、既に発行されている債券の価格は下落する。', answer: true, explain: '金利と債券価格はシーソーの関係（逆相関）です。', tags: ['field:finance', 'unit:finance-3'] },
    { id: 'finance-3-q2', type: 'choice', q: '債券の信用格付けについて、一般に「投資適格」とされる下限はどれか。', choices: ['BBB（トリプルB）格', 'BB（ダブルB）格', 'C格'], answer: 0, explain: 'BBB格以上が投資適格、BB格以下は投機的（投資不適格）とされます。', tags: ['field:finance', 'unit:finance-3'] },
    { id: 'finance-3-q3', type: 'ox', q: '一般に、他の条件が同じであれば、信用格付けが低い債券ほど利回りは高くなる傾向がある。', answer: true, explain: 'リスクが高い（格付けが低い）ほど、その分高い利回りが求められます。', tags: ['field:finance', 'unit:finance-3'] },
    { id: 'finance-3-q4', type: 'choice', q: 'すでに発行されている債券を購入し、償還まで保有した場合の利回りを何というか。', choices: ['応募者利回り', '最終利回り', '直接利回り'], answer: 1, explain: '既発債を買って償還まで保有＝最終利回り。新発債で償還まで＝応募者利回り。', tags: ['field:finance', 'unit:finance-3'] },

    { id: 'finance-4-q1', type: 'choice', q: '株価2,000円、1株当たり純利益（EPS）100円のとき、PER（株価収益率）はいくらか。', choices: ['0.05倍', '20倍', '200倍'], answer: 1, explain: 'PER＝株価2,000 ÷ EPS100 ＝ 20倍。', tags: ['field:finance', 'unit:finance-4'] },
    { id: 'finance-4-q2', type: 'choice', q: '株価2,000円、1株当たり配当40円のとき、配当利回りはいくらか。', choices: ['2%', '5%', '40%'], answer: 0, explain: '配当利回り＝1株配当40 ÷ 株価2,000 ×100 ＝ 2%。', tags: ['field:finance', 'unit:finance-4'] },
    { id: 'finance-4-q3', type: 'ox', q: 'PER（株価収益率）は、一般に数値が低いほど株価が割安であると判断される。', answer: true, explain: 'PERは低いほど、利益に対して株価が割安であることの目安になります。', tags: ['field:finance', 'unit:finance-4'] },
    { id: 'finance-4-q4', type: 'choice', q: 'ROE（自己資本利益率）を求める式として正しいものはどれか。', choices: ['当期純利益 ÷ 自己資本 ×100', '株価 ÷ 1株当たり純資産', '配当金 ÷ 当期純利益 ×100'], answer: 0, explain: 'ROE＝当期純利益÷自己資本×100。2番目はPBR、3番目は配当性向の式です。', tags: ['field:finance', 'unit:finance-4'] },

    { id: 'finance-5-q1', type: 'ox', q: '投資信託の運用管理費用（信託報酬）は、購入時に一度だけ支払う費用である。', answer: false, explain: '信託報酬は保有期間中、日々、信託財産から差し引かれる費用です。', tags: ['field:finance', 'unit:finance-5'] },
    { id: 'finance-5-q2', type: 'choice', q: '日経平均株価やTOPIXなどの指数に連動する運用成果を目指す運用スタイルはどれか。', choices: ['アクティブ運用', 'パッシブ（インデックス）運用', 'グロース運用'], answer: 1, explain: '指数への連動を目指すのはパッシブ（インデックス）運用。一般に信託報酬は低めです。', tags: ['field:finance', 'unit:finance-5'] },
    { id: 'finance-5-q3', type: 'ox', q: '公社債投資信託は、株式を一切組み入れずに運用される。', answer: true, explain: '公社債投資信託は株式を組み入れません（MRF・MMFなど）。', tags: ['field:finance', 'unit:finance-5'] },
    { id: 'finance-5-q4', type: 'choice', q: '購入時手数料がかからない投資信託を何というか。', choices: ['ノーロード', 'ETF', 'MMF'], answer: 0, explain: '購入時手数料が無料の投資信託をノーロードといいます。', tags: ['field:finance', 'unit:finance-5'] },

    { id: 'finance-6-q1', type: 'ox', q: '外貨預金は、預金保険制度による保護の対象となる。', answer: false, explain: '外貨預金は預金保険制度の対象外です。', tags: ['field:finance', 'unit:finance-6'] },
    { id: 'finance-6-q2', type: 'choice', q: '円を外貨に換えて外貨預金を始めるときに適用される為替レートはどれか。', choices: ['TTB（対顧客電信買相場）', 'TTS（対顧客電信売相場）', 'TTM（仲値）'], answer: 1, explain: '円を外貨に換える（銀行が外貨を売る）ときはTTSを用います。', tags: ['field:finance', 'unit:finance-6'] },
    { id: 'finance-6-q3', type: 'ox', q: 'ポートフォリオを構成する2資産の相関係数が−1に近いほど、分散投資によるリスク低減効果は大きくなる。', answer: true, explain: '相関係数が−1に近い（逆の値動き）ほど、リスク低減効果は大きくなります。', tags: ['field:finance', 'unit:finance-6'] },
    { id: 'finance-6-q4', type: 'ox', q: '外貨預金では、預入時に比べて満期時に円高となった場合、為替差益が生じる。', answer: false, explain: '円高になると外貨を円に戻したとき目減りし、為替差損となります。差益は円安のときです。', tags: ['field:finance', 'unit:finance-6'] },

    { id: 'finance-7-q1', type: 'choice', q: '上場株式等の配当金や譲渡益に対する税率（所得税・復興特別所得税・住民税の合計）はどれか。', choices: ['10.21%', '20.315%', '30.42%'], answer: 1, explain: '所得税15%＋復興特別所得税0.315%＋住民税5%＝合計20.315%です。', tags: ['field:finance', 'unit:finance-7'] },
    { id: 'finance-7-q2', type: 'ox', q: 'NISA口座内で生じた上場株式等の譲渡損失は、他の特定口座で生じた譲渡益と損益通算できる。', answer: false, explain: 'NISAはそもそも非課税であるため、損失は他口座の利益と損益通算できません。', tags: ['field:finance', 'unit:finance-7'] },
    { id: 'finance-7-q3', type: 'choice', q: '預金保険制度（ペイオフ）で保護される一般預金等の範囲として正しいものはどれか。', choices: ['1金融機関ごとに預金者1人あたり元本1,000万円までとその利息', '預金者1人あたり2,000万円まで', '金額に関係なく全額'], answer: 0, explain: '一般預金等は1金融機関につき1人あたり元本1,000万円までとその利息が保護されます。', tags: ['field:finance', 'unit:finance-7'] },
    { id: 'finance-7-q4', type: 'ox', q: '特定口座（源泉徴収あり）で上場株式を取引した場合、その譲渡益について原則として確定申告は不要である。', answer: true, explain: '源泉徴収ありの特定口座では、証券会社が源泉徴収するため原則確定申告は不要です。', tags: ['field:finance', 'unit:finance-7'] }
  );

  /* ---------------- ④ タックスプランニング ---------------- */
  BANK.push(
    { id: 'tax-1-q1', type: 'ox', q: '所得税は、その年（1月1日から12月31日まで）の個人の所得に対して課される国税である。', answer: true, explain: '所得税はその年の所得に対する国税です。前年所得に翌年課税されるのは住民税です。', tags: ['field:tax', 'unit:tax-1'] },
    { id: 'tax-1-q2', type: 'choice', q: '所得控除と税額控除の違いとして正しいものはどれか。', choices: ['所得控除は税額から直接差し引く', '所得控除は課税所得を、税額控除は税額を減らす', 'どちらも課税所得を減らす'], answer: 1, explain: '所得控除は課税所得金額を減らし、税額控除は算出した税額から直接差し引きます。', tags: ['field:tax', 'unit:tax-1'] },
    { id: 'tax-1-q3', type: 'ox', q: '所得税は、所得が多くなるほど高い税率が適用される超過累進課税である。', answer: true, explain: '所得税は5%〜45%の超過累進課税です。', tags: ['field:tax', 'unit:tax-1'] },
    { id: 'tax-1-q4', type: 'choice', q: '次のうち、原則として分離課税の対象となる所得はどれか。', choices: ['給与所得', '退職所得', '一時所得'], answer: 1, explain: '退職所得は分離課税です。給与所得・一時所得は総合課税が原則。', tags: ['field:tax', 'unit:tax-1'] },

    { id: 'tax-2-q1', type: 'choice', q: 'アパートを賃貸して得た家賃収入は、原則としてどの所得に区分されるか。', choices: ['事業所得', '不動産所得', '雑所得'], answer: 1, explain: '不動産の貸付けによる所得は、事業的規模であっても不動産所得に区分されます。', tags: ['field:tax', 'unit:tax-2'] },
    { id: 'tax-2-q2', type: 'choice', q: '勤続25年で退職した人の退職所得控除額として正しいものはどれか。', choices: ['40万円 × 25年 ＝ 1,000万円', '800万円 ＋ 70万円 ×（25年 − 20年）＝ 1,150万円', '70万円 × 25年 ＝ 1,750万円'], answer: 1, explain: '20年超は「800万円＋70万円×(勤続年数−20年)」。25年なら800＋70×5＝1,150万円です。', tags: ['field:tax', 'unit:tax-2'] },
    { id: 'tax-2-q3', type: 'ox', q: '一時所得は、その金額を全額そのまま総所得金額に算入する。', answer: false, explain: '一時所得は特別控除50万円を引いた後、さらにその2分の1を総所得金額に算入します。', tags: ['field:tax', 'unit:tax-2'] },
    { id: 'tax-2-q4', type: 'ox', q: '退職所得は、原則として（退職金−退職所得控除額）×2分の1で計算される。', answer: true, explain: '退職所得は原則として（収入金額−退職所得控除額）×1/2で求めます。', tags: ['field:tax', 'unit:tax-2'] },

    { id: 'tax-3-q1', type: 'choice', q: '次の所得の損失のうち、原則として損益通算ができないものはどれか。', choices: ['不動産所得の損失', '事業所得の損失', '雑所得の損失'], answer: 2, explain: '損益通算できるのは不動産・事業・山林・譲渡の損失。雑所得の損失は通算できません。', tags: ['field:tax', 'unit:tax-3'] },
    { id: 'tax-3-q2', type: 'ox', q: '控除対象配偶者となるには、配偶者の合計所得金額が48万円以下であることなどが必要である。', answer: true, explain: '配偶者の合計所得48万円以下（給与のみなら年収103万円以下）などが要件です。', tags: ['field:tax', 'unit:tax-3'] },
    { id: 'tax-3-q3', type: 'choice', q: '医療費控除の控除額（総所得金額等が200万円以上の場合）の計算で、支払った医療費（保険金等を控除後）から差し引く金額はどれか。', choices: ['5万円', '10万円', '20万円'], answer: 1, explain: '総所得200万円以上なら10万円を差し引きます（200万円未満は総所得の5%）。', tags: ['field:tax', 'unit:tax-3'] },
    { id: 'tax-3-q4', type: 'ox', q: '納税者が支払った社会保険料は、その全額が社会保険料控除の対象となる。', answer: true, explain: '社会保険料控除は支払った全額が対象です。', tags: ['field:tax', 'unit:tax-3'] },

    { id: 'tax-4-q1', type: 'ox', q: '所得税は超過累進課税であり、課税所得金額のうち一定額を超えた部分にのみ、より高い税率が適用される。', answer: true, explain: '超過累進なので、増えた（超えた）部分だけに高い税率がかかります。', tags: ['field:tax', 'unit:tax-4'] },
    { id: 'tax-4-q2', type: 'ox', q: '給与所得者が住宅ローン控除を受ける場合、適用の初年度は確定申告が必要である。', answer: true, explain: '初年度は確定申告が必要。2年目以降は年末調整で受けられます。', tags: ['field:tax', 'unit:tax-4'] },
    { id: 'tax-4-q3', type: 'choice', q: '配当控除を受けるための条件として正しいものはどれか。', choices: ['配当所得を申告分離課税で申告する', '配当所得を総合課税で申告する', 'NISA口座で配当を受け取る'], answer: 1, explain: '配当控除は配当所得を総合課税で申告した場合に受けられます。申告分離やNISAでは不可。', tags: ['field:tax', 'unit:tax-4'] },
    { id: 'tax-4-q4', type: 'choice', q: '「住宅借入金等特別控除」と「配当控除」に共通する性質はどれか。', choices: ['いずれも課税所得金額から差し引く所得控除である', 'いずれも算出税額から直接差し引く税額控除である', 'いずれも収入から差し引く必要経費である'], answer: 1, explain: 'どちらも税額控除で、算出した所得税額から直接差し引きます。', tags: ['field:tax', 'unit:tax-4'] },

    { id: 'tax-5-q1', type: 'choice', q: '所得税の確定申告の期間（原則）として正しいものはどれか。', choices: ['翌年の1月1日から1月31日まで', '翌年の2月16日から3月15日まで', '翌年の3月16日から4月15日まで'], answer: 1, explain: '確定申告は原則として翌年2月16日から3月15日までです。', tags: ['field:tax', 'unit:tax-5'] },
    { id: 'tax-5-q2', type: 'ox', q: '給与所得者でも、給与以外の所得金額が20万円を超える場合は、原則として確定申告が必要である。', answer: true, explain: '給与・退職所得以外の所得が20万円を超えると、原則確定申告が必要です。', tags: ['field:tax', 'unit:tax-5'] },
    { id: 'tax-5-q3', type: 'choice', q: '青色申告の特典に関する説明として正しいものはどれか。', choices: ['純損失を翌年以降3年間繰り越すことができる', '純損失は繰り越せない', '青色申告特別控除は一律10万円のみ'], answer: 0, explain: '青色申告では純損失を3年間繰り越せます。特別控除は最高65万円（要件により）です。', tags: ['field:tax', 'unit:tax-5'] },
    { id: 'tax-5-q4', type: 'ox', q: 'その年分の給与の収入金額が2,000万円を超える給与所得者は、確定申告が必要である。', answer: true, explain: '給与収入2,000万円超の人は年末調整の対象外となり、確定申告が必要です。', tags: ['field:tax', 'unit:tax-5'] },

    { id: 'tax-6-q1', type: 'ox', q: '個人住民税は、前年の所得に対して課税される。', answer: true, explain: '住民税は前年所得に対して翌年課税されます。所得税はその年の所得に課税されます。', tags: ['field:tax', 'unit:tax-6'] },
    { id: 'tax-6-q2', type: 'choice', q: '個人住民税の課税方式として正しいものはどれか。', choices: ['申告納税方式', '賦課課税方式', '源泉分離課税'], answer: 1, explain: '住民税は市区町村が税額を計算して通知する賦課課税方式です。', tags: ['field:tax', 'unit:tax-6'] },
    { id: 'tax-6-q3', type: 'choice', q: 'ふるさと納税のワンストップ特例制度を利用できる、1年間の寄附先団体数の上限はどれか。', choices: ['3団体', '5団体', '10団体'], answer: 1, explain: 'ワンストップ特例は、確定申告不要な給与所得者等で寄附先が5団体以内の場合に利用できます。', tags: ['field:tax', 'unit:tax-6'] },
    { id: 'tax-6-q4', type: 'ox', q: '個人住民税は、その年の1月1日現在の住所地の市区町村等で課税される。', answer: true, explain: 'その年の1月1日時点で住所のある市区町村・都道府県が課税します。', tags: ['field:tax', 'unit:tax-6'] }
  );

  /* ---------------- ⑤ 不動産 ---------------- */
  BANK.push(
    { id: 'estate-1-q1', type: 'choice', q: '不動産の抵当権に関する事項が記録されるのは、登記記録のどの部分か。', choices: ['表題部', '権利部（甲区）', '権利部（乙区）'], answer: 2, explain: '所有権以外の権利（抵当権など）は権利部の乙区に記録されます。甲区は所有権。', tags: ['field:estate', 'unit:estate-1'] },
    { id: 'estate-1-q2', type: 'ox', q: '不動産登記には公信力がないため、登記記録を信頼して取引しても、必ずしも保護されるとは限らない。', answer: true, explain: '登記には対抗力はありますが公信力はありません。', tags: ['field:estate', 'unit:estate-1'] },
    { id: 'estate-1-q3', type: 'choice', q: '相続税路線価は、一般に公示価格のおおよそどの程度の水準か。', choices: ['約70%', '約80%', '約90%'], answer: 1, explain: '相続税路線価は公示価格の約80%、固定資産税評価額は約70%が目安です。', tags: ['field:estate', 'unit:estate-1'] },
    { id: 'estate-1-q4', type: 'ox', q: '登記事項証明書は、その不動産の所有者本人でなければ取得できない。', answer: false, explain: '登記事項証明書は、手数料を納付すれば誰でも取得できます。', tags: ['field:estate', 'unit:estate-1'] },

    { id: 'estate-2-q1', type: 'ox', q: '解約手付が交付された場合、相手方が契約の履行に着手する前であれば、買主は手付を放棄することで契約を解除できる。', answer: true, explain: '解約手付では、相手方の履行着手前なら買主は手付放棄、売主は倍返しで解除できます。', tags: ['field:estate', 'unit:estate-2'] },
    { id: 'estate-2-q2', type: 'choice', q: '宅地建物取引業者が自ら売主となる売買契約で、受け取ることができる手付金の上限はどれか。', choices: ['代金の1割', '代金の2割', '代金の5割'], answer: 1, explain: '宅建業者が自ら売主となる場合、手付金は代金の2割（20%）が上限です。', tags: ['field:estate', 'unit:estate-2'] },
    { id: 'estate-2-q3', type: 'ox', q: '宅地建物取引業者による重要事項の説明は、売買契約が成立した後に行うこととされている。', answer: false, explain: '重要事項説明は契約成立前に、宅地建物取引士が書面を交付して行います。', tags: ['field:estate', 'unit:estate-2'] },
    { id: 'estate-2-q4', type: 'choice', q: '専任媒介契約と比べて、依頼者が自ら見つけた相手方と直接契約すること（自己発見取引）もできないのはどの媒介契約か。', choices: ['一般媒介契約', '専属専任媒介契約', 'すべて可能'], answer: 1, explain: '専属専任媒介契約では、依頼者は自己発見取引もできません（必ず業者を介する）。', tags: ['field:estate', 'unit:estate-2'] },

    { id: 'estate-3-q1', type: 'choice', q: '一般定期借地権の存続期間として正しいものはどれか。', choices: ['30年以上', '50年以上', '10年以上50年未満'], answer: 1, explain: '一般定期借地権は50年以上。普通借地権は30年以上、事業用定期借地権は10年以上50年未満です。', tags: ['field:estate', 'unit:estate-3'] },
    { id: 'estate-3-q2', type: 'choice', q: '区分所有法における建替え決議に必要な賛成の割合はどれか。', choices: ['過半数', '4分の3以上', '5分の4以上'], answer: 2, explain: '建替え決議は区分所有者および議決権の各5分の4以上の賛成が必要です。', tags: ['field:estate', 'unit:estate-3'] },
    { id: 'estate-3-q3', type: 'choice', q: '区分所有法における規約の設定・変更・廃止に必要な賛成の割合はどれか。', choices: ['過半数', '4分の3以上', '5分の4以上'], answer: 1, explain: '規約の設定・変更・廃止は4分の3以上の賛成が必要です。', tags: ['field:estate', 'unit:estate-3'] },
    { id: 'estate-3-q4', type: 'ox', q: '定期借家契約は、契約の更新がなく、期間の満了により終了する。', answer: true, explain: '定期借家契約は更新がなく、期間満了で終了します。契約は書面で行う必要があります。', tags: ['field:estate', 'unit:estate-3'] },

    { id: 'estate-4-q1', type: 'choice', q: '敷地面積300㎡、建蔽率60%のとき、建築面積の上限はいくらか。', choices: ['150㎡', '180㎡', '500㎡'], answer: 1, explain: '建築面積の上限＝敷地面積300㎡ ×60% ＝ 180㎡。', tags: ['field:estate', 'unit:estate-4'] },
    { id: 'estate-4-q2', type: 'choice', q: '敷地面積300㎡、容積率200%のとき、延べ床面積の上限はいくらか。', choices: ['150㎡', '600㎡', '900㎡'], answer: 1, explain: '延べ床面積の上限＝敷地面積300㎡ ×200% ＝ 600㎡。', tags: ['field:estate', 'unit:estate-4'] },
    { id: 'estate-4-q3', type: 'ox', q: '建築物の敷地は、原則として幅員4m以上の道路に2m以上接していなければならない（接道義務）。', answer: true, explain: '接道義務です。幅員4m以上の道路に2m以上接する必要があります。', tags: ['field:estate', 'unit:estate-4'] },
    { id: 'estate-4-q4', type: 'ox', q: '容積率とは、敷地面積に対する建築面積（真上から見た面積）の割合をいう。', answer: false, explain: '容積率は敷地面積に対する「延べ床面積」の割合です。建築面積の割合は建蔽率。', tags: ['field:estate', 'unit:estate-4'] },

    { id: 'estate-5-q1', type: 'ox', q: '相続により不動産を取得した場合、不動産取得税は課されない。', answer: true, explain: '相続による取得は不動産取得税が非課税です（贈与や売買は課税）。', tags: ['field:estate', 'unit:estate-5'] },
    { id: 'estate-5-q2', type: 'choice', q: '固定資産税は、原則として誰に課されるか。', choices: ['その年の1月1日現在の固定資産の所有者', 'その年の4月1日現在の所有者', '実際に居住している者'], answer: 0, explain: '固定資産税は、その年1月1日時点の所有者に課税されます。', tags: ['field:estate', 'unit:estate-5'] },
    { id: 'estate-5-q3', type: 'choice', q: '居住用財産（自宅）を譲渡した場合に、譲渡所得から控除できる特別控除の最高額はどれか。', choices: ['2,000万円', '3,000万円', '5,000万円'], answer: 1, explain: '居住用財産の譲渡では最高3,000万円の特別控除が受けられます。', tags: ['field:estate', 'unit:estate-5'] },
    { id: 'estate-5-q4', type: 'ox', q: '土地・建物の譲渡所得の長期・短期の区分は、譲渡した年の1月1日時点での所有期間により判定する。', answer: true, explain: '譲渡した年の1月1日時点で所有期間が5年超なら長期、5年以下なら短期です。', tags: ['field:estate', 'unit:estate-5'] },

    { id: 'estate-6-q1', type: 'choice', q: '投資総額5,000万円、年間賃料収入300万円のとき、表面（単純）利回りはいくらか。', choices: ['3%', '6%', '10%'], answer: 1, explain: '表面利回り＝年間賃料300万 ÷ 投資5,000万 ×100 ＝ 6%。', tags: ['field:estate', 'unit:estate-6'] },
    { id: 'estate-6-q2', type: 'ox', q: '実質利回りは、年間の賃料収入から諸経費を差し引いて計算するため、一般に表面利回りよりも低くなる。', answer: true, explain: '経費を差し引く分、実質利回りは表面利回りより低くなります。', tags: ['field:estate', 'unit:estate-6'] },
    { id: 'estate-6-q3', type: 'choice', q: '土地所有者が土地を提供し、その価値に応じて完成した建物の一部を取得する有効活用の方式はどれか。', choices: ['等価交換方式', '事業受託方式', '建設協力金方式'], answer: 0, explain: '土地を出して建物の一部を取得するのは等価交換方式。土地所有者の資金負担が少ないのが特徴です。', tags: ['field:estate', 'unit:estate-6'] },
    { id: 'estate-6-q4', type: 'ox', q: 'DCF法は、対象不動産が将来生み出す収益等を現在価値に割り引いて価格を求める方法である。', answer: true, explain: 'DCF法は将来のキャッシュフローを現在価値に割り引いて評価します。', tags: ['field:estate', 'unit:estate-6'] }
  );

  /* ---------------- ⑥ 相続・事業承継 ---------------- */
  BANK.push(
    { id: 'inherit-1-q1', type: 'choice', q: '民法上の相続人の順位について、第2順位に当たるのはどれか。', choices: ['子', '直系尊属（父母など）', '兄弟姉妹'], answer: 1, explain: '第1順位が子、第2順位が直系尊属、第3順位が兄弟姉妹です。配偶者は常に相続人。', tags: ['field:inherit', 'unit:inherit-1'] },
    { id: 'inherit-1-q2', type: 'choice', q: '相続の限定承認・放棄は、原則として自己のために相続の開始があったことを知った時から何か月以内に行うか。', choices: ['3か月以内', '4か月以内', '10か月以内'], answer: 0, explain: '限定承認・相続放棄は原則3か月以内。準確定申告は4か月、相続税申告は10か月です。', tags: ['field:inherit', 'unit:inherit-1'] },
    { id: 'inherit-1-q3', type: 'ox', q: '相続を放棄した者の子は、その放棄した者を代襲して相続人となる。', answer: false, explain: '相続放棄をすると初めから相続人でなかったものとみなされ、代襲相続は生じません。', tags: ['field:inherit', 'unit:inherit-1'] },
    { id: 'inherit-1-q4', type: 'ox', q: '公正証書遺言は、家庭裁判所による検認の手続きが不要である。', answer: true, explain: '公正証書遺言は検認不要です。自筆証書遺言は原則検認が必要（法務局保管なら不要）。', tags: ['field:inherit', 'unit:inherit-1'] },

    { id: 'inherit-2-q1', type: 'choice', q: '相続人が配偶者と子2人の場合、子1人の法定相続分はいくらか。', choices: ['2分の1', '4分の1', '3分の1'], answer: 1, explain: '配偶者1/2、子全体で1/2。子2人なので1人あたり1/2÷2＝1/4です。', tags: ['field:inherit', 'unit:inherit-2'] },
    { id: 'inherit-2-q2', type: 'choice', q: '相続人が配偶者と被相続人の兄弟姉妹の場合、配偶者の法定相続分はいくらか。', choices: ['2分の1', '3分の2', '4分の3'], answer: 2, explain: '配偶者と兄弟姉妹なら、配偶者3/4・兄弟姉妹全体1/4です。', tags: ['field:inherit', 'unit:inherit-2'] },
    { id: 'inherit-2-q3', type: 'ox', q: '被相続人の兄弟姉妹には、遺留分が認められている。', answer: false, explain: '兄弟姉妹に遺留分はありません。', tags: ['field:inherit', 'unit:inherit-2'] },
    { id: 'inherit-2-q4', type: 'choice', q: '遺留分の総額は、原則として相続財産のどれだけか（相続人が直系尊属のみの場合を除く）。', choices: ['3分の1', '2分の1', '3分の2'], answer: 1, explain: '遺留分の総額は原則2分の1（直系尊属のみが相続人の場合は3分の1）です。', tags: ['field:inherit', 'unit:inherit-2'] },

    { id: 'inherit-3-q1', type: 'choice', q: '法定相続人が3人である場合、遺産に係る基礎控除額はいくらか。', choices: ['4,200万円', '4,800万円', '8,000万円'], answer: 1, explain: '3,000万円＋600万円×3人＝4,800万円です。', tags: ['field:inherit', 'unit:inherit-3'] },
    { id: 'inherit-3-q2', type: 'choice', q: '相続人が受け取った死亡保険金（生命保険金）の非課税限度額の計算式はどれか。', choices: ['300万円 ×法定相続人の数', '500万円 ×法定相続人の数', '600万円 ×法定相続人の数'], answer: 1, explain: '生命保険金・死亡退職金の非課税限度額は「500万円×法定相続人の数」です。', tags: ['field:inherit', 'unit:inherit-3'] },
    { id: 'inherit-3-q3', type: 'ox', q: '基礎控除額を計算する際の「法定相続人の数」は、相続放棄をした人がいても、その放棄がなかったものとして数える。', answer: true, explain: '基礎控除・非課税限度額の計算では、相続放棄はなかったものとして人数に含めます。', tags: ['field:inherit', 'unit:inherit-3'] },
    { id: 'inherit-3-q4', type: 'ox', q: '配偶者の税額軽減により、配偶者が取得した財産は、法定相続分相当額と1億6,000万円のいずれか多い金額まで相続税がかからない。', answer: true, explain: '配偶者の税額軽減は「法定相続分」または「1億6,000万円」のいずれか多い金額までです。', tags: ['field:inherit', 'unit:inherit-3'] },

    { id: 'inherit-4-q1', type: 'choice', q: '贈与税の暦年課税における基礎控除額（年間・受贈者1人あたり）はいくらか。', choices: ['60万円', '110万円', '2,500万円'], answer: 1, explain: '暦年課税の基礎控除は受贈者1人につき年間110万円です。', tags: ['field:inherit', 'unit:inherit-4'] },
    { id: 'inherit-4-q2', type: 'ox', q: '相続時精算課税制度を一度選択すると、その贈与者からの贈与について暦年課税に戻すことはできない。', answer: true, explain: '相続時精算課税を選択すると、その贈与者からの贈与は暦年課税に戻せません。', tags: ['field:inherit', 'unit:inherit-4'] },
    { id: 'inherit-4-q3', type: 'choice', q: '贈与税の配偶者控除を受けるための婚姻期間の要件はどれか。', choices: ['10年以上', '20年以上', '25年以上'], answer: 1, explain: '贈与税の配偶者控除は婚姻期間20年以上の夫婦間の居住用不動産等の贈与が対象で、最高2,000万円です。', tags: ['field:inherit', 'unit:inherit-4'] },
    { id: 'inherit-4-q4', type: 'ox', q: '個人が法人から財産の贈与を受けた場合、その財産には贈与税が課される。', answer: false, explain: '法人からの贈与は贈与税ではなく所得税（一時所得等）の対象です。', tags: ['field:inherit', 'unit:inherit-4'] },

    { id: 'inherit-5-q1', type: 'choice', q: '小規模宅地等の特例における「特定居住用宅地等」の限度面積と減額割合の組合せとして正しいものはどれか。', choices: ['330㎡まで・80%減', '400㎡まで・80%減', '200㎡まで・50%減'], answer: 0, explain: '特定居住用宅地等は330㎡まで80%減。特定事業用は400㎡・80%、貸付事業用は200㎡・50%です。', tags: ['field:inherit', 'unit:inherit-5'] },
    { id: 'inherit-5-q2', type: 'choice', q: '路線価のない地域の宅地を評価する方法はどれか。', choices: ['路線価方式', '倍率方式', '収益還元方式'], answer: 1, explain: '路線価が定められていない地域は、固定資産税評価額に倍率を乗じる倍率方式で評価します。', tags: ['field:inherit', 'unit:inherit-5'] },
    { id: 'inherit-5-q3', type: 'ox', q: '上場株式の相続税評価額は、課税時期の終値のほか、当月・前月・前々月の各月の終値の平均額のうち、最も低い価額とすることができる。', answer: true, explain: '4つの価額のうち最も低いものを用いることができます。', tags: ['field:inherit', 'unit:inherit-5'] },
    { id: 'inherit-5-q4', type: 'ox', q: '貸家建付地は、同じ土地を自分で使用する自用地よりも相続税評価額が高くなる。', answer: false, explain: '貸家建付地は借家人の権利がある分、自用地より評価額は低くなります。', tags: ['field:inherit', 'unit:inherit-5'] },

    { id: 'inherit-6-q1', type: 'choice', q: '取引相場のない株式について、同族株主等が取得した場合に用いられる評価方式はどれか。', choices: ['配当還元方式', '原則的評価方式', '収益還元方式'], answer: 1, explain: '同族株主等は原則的評価方式、少数株主等は特例的評価方式（配当還元方式）で評価します。', tags: ['field:inherit', 'unit:inherit-6'] },
    { id: 'inherit-6-q2', type: 'ox', q: '経営者を被保険者とする生命保険に加入することは、相続時の納税資金や自社株の買取り資金を準備する対策として有効である。', answer: true, explain: '死亡保険金を納税資金・自社株の買取り資金に充てることで、事業承継を円滑にできます。', tags: ['field:inherit', 'unit:inherit-6'] },
    { id: 'inherit-6-q3', type: 'ox', q: '役員退職金を支給すると、一般に会社の純資産や利益が増加し、自社株の評価額は高くなる。', answer: false, explain: '役員退職金の支給は利益・純資産を圧縮するため、一般に自社株評価の引下げに働きます。', tags: ['field:inherit', 'unit:inherit-6'] },
    { id: 'inherit-6-q4', type: 'ox', q: '事業承継税制を利用すると、一定の要件のもとで後継者が取得した自社株式に係る相続税・贈与税の納税が猶予される。', answer: true, explain: '事業承継税制は、要件を満たせば自社株にかかる相続税・贈与税の納税猶予・免除が受けられる制度です。', tags: ['field:inherit', 'unit:inherit-6'] }
  );

  window.EXAM_BANK = BANK;
})();
