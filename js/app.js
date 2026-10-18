/* =====================================================================
 * app.js  — サイト共通処理
 *
 * 役割:
 *  - localStorage を使った状態管理（進捗 / 習熟度 / ストリーク / 復習デッキ
 *    / バッジ / 設定 / 最終位置）を一箇所に集約する Store
 *  - ダークモードの適用と切替
 *  - ヘッダー / 下部ナビ / 法令基準日バッジなど共通UIの注入
 *  - ホーム（index.html）のダッシュボード描画
 *
 * すべてのページで <script> として読み込む前提。ES Modules 不使用。
 * 依存: js/data/curriculum.js（window.CURRICULUM）
 * ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
   * 0. ルート相対パスの解決
   *  サブディレクトリ配下のページ（chapters/life/... など）からでも
   *  css/js/リンクが壊れないよう、各ページの <html data-root="../../">
   *  を基準にルートを求める。data-root 未指定なら "" （＝ホーム階層）。
   * ------------------------------------------------------------- */
  const ROOT = (document.documentElement.getAttribute('data-root') || '');
  function r(path) { return ROOT + path; }

  /* ---------------------------------------------------------------
   * 1. localStorage ラッパ（キーを一元管理・JSON安全に読み書き）
   * ------------------------------------------------------------- */
  const KEYS = {
    progress: 'fp3.progress',      // { unitId: masteryLevel }
    streak: 'fp3.streak',          // { last, current, longest, days:{} }
    settings: 'fp3.settings',      // { dark, examDate }
    review: 'fp3.review',          // { questionId: { due, interval, ease } }
    badges: 'fp3.badges',          // [badgeId]
    last: 'fp3.last',              // { unitId, href, at }
    stats: 'fp3.stats',            // { answered, correct }
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { /* 容量超過等は握りつぶす（学習を止めない） */ }
  }

  /* ---------------------------------------------------------------
   * 2. 日付ユーティリティ（ローカル日付の YYYY-MM-DD 文字列）
   * ------------------------------------------------------------- */
  function todayStr(d) {
    d = d || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return todayStr(d);
  }
  function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  /* ---------------------------------------------------------------
   * 3. 習熟度（4段階）
   * ------------------------------------------------------------- */
  const MASTERY = {
    unlearned: { key: 'unlearned', label: '未学習', order: 0 },
    learning:  { key: 'learning',  label: '学習中', order: 1 },
    practiced: { key: 'practiced', label: '演習済み', order: 2 },
    mastered:  { key: 'mastered',  label: 'マスター', order: 3 },
  };

  /* ---------------------------------------------------------------
   * 4. Store: アプリの状態を扱う公開API
   * ------------------------------------------------------------- */
  const Store = {
    /* ---- 進捗 / 習熟度 ---- */
    getProgress: function () { return read(KEYS.progress, {}); },
    getMastery: function (unitId) {
      const p = this.getProgress();
      return p[unitId] || 'unlearned';
    },
    /* 習熟度は「後退させない」（例: mastered を learning で上書きしない） */
    setMastery: function (unitId, level) {
      if (!MASTERY[level]) return;
      const p = this.getProgress();
      const cur = p[unitId] || 'unlearned';
      if (MASTERY[level].order >= MASTERY[cur].order) {
        p[unitId] = level;
        write(KEYS.progress, p);
      }
      this.recordStudyToday();
      Badges.evaluate();
    },

    /* 分野の進捗率（0..1）。mastered=1, practiced=0.66, learning=0.33 で加重 */
    fieldProgress: function (fieldKey) {
      const units = window.CURRICULUM.unitsOf(fieldKey);
      if (!units.length) return 0;
      let sum = 0;
      units.forEach(function (u) {
        const lvl = Store.getMastery(u.id);
        sum += MASTERY[lvl].order / 3;
      });
      return sum / units.length;
    },
    overallProgress: function () {
      const all = window.CURRICULUM.allUnits();
      if (!all.length) return 0;
      let sum = 0;
      all.forEach(function (u) { sum += MASTERY[Store.getMastery(u.id)].order / 3; });
      return sum / all.length;
    },
    /* 「次にやるべき1単元」: 学習順で最初の未マスター単元（href有りを優先） */
    nextUnit: function () {
      const all = window.CURRICULUM.allUnits();
      let firstIncomplete = null;
      for (let i = 0; i < all.length; i++) {
        const lvl = this.getMastery(all[i].id);
        if (lvl !== 'mastered') {
          if (all[i].href) return all[i];        // 実装済み単元を優先
          if (!firstIncomplete) firstIncomplete = all[i];
        }
      }
      return firstIncomplete; // 全マスター済みなら null
    },

    /* ---- 最終位置（続きから） ---- */
    setLast: function (unit) {
      write(KEYS.last, { unitId: unit.id, title: unit.title, href: unit.href, at: Date.now() });
    },
    getLast: function () { return read(KEYS.last, null); },

    /* ---- ストリーク ---- */
    getStreak: function () {
      return read(KEYS.streak, { last: null, current: 0, longest: 0, days: {} });
    },
    recordStudyToday: function () {
      const s = this.getStreak();
      const t = todayStr();
      if (s.last === t) { return s; }             // 今日はすでに記録済み
      if (s.last && daysBetween(s.last, t) === 1) {
        s.current += 1;                            // 連続
      } else {
        s.current = 1;                            // 初回 or 途切れてリセット
      }
      s.last = t;
      s.longest = Math.max(s.longest || 0, s.current);
      s.days = s.days || {};
      s.days[t] = true;
      write(KEYS.streak, s);
      Badges.evaluate();
      return s;
    },
    /* 表示用: 今日学習済みか / 継続が途切れていないか */
    streakStatus: function () {
      const s = this.getStreak();
      const t = todayStr();
      const studiedToday = s.last === t;
      const brokenRisk = s.last && daysBetween(s.last, t) >= 1 && !studiedToday;
      return { current: studiedToday ? s.current : (brokenRisk && daysBetween(s.last, t) === 1 ? s.current : (studiedToday ? s.current : s.current)), studiedToday: studiedToday, longest: s.longest || 0, atRisk: !studiedToday };
    },

    /* ---- 復習デッキ（間隔反復） ----
     * 間違えた問題を登録し、1日後→3日後→7日後→14日後…と間隔を伸ばす。
     * 正解できたら間隔ステップを1つ進める。もう一度間違えたら最初に戻す。 */
    reviewIntervals: [1, 3, 7, 14, 30],
    getReview: function () { return read(KEYS.review, {}); },
    addToReview: function (questionId, meta) {
      const deck = this.getReview();
      deck[questionId] = {
        due: addDays(todayStr(), this.reviewIntervals[0]),
        step: 0,
        meta: meta || null,
      };
      write(KEYS.review, deck);
    },
    /* 復習で正解 → 次の間隔へ / 不正解 → step を0に戻す */
    gradeReview: function (questionId, correct) {
      const deck = this.getReview();
      const card = deck[questionId];
      if (!card) return;
      if (correct) {
        card.step = Math.min(card.step + 1, this.reviewIntervals.length - 1);
        // 最終ステップを正解し続けたら卒業（デッキから除外）
        if (card.step >= this.reviewIntervals.length - 1 && daysBetween(card.due, todayStr()) >= 0) {
          delete deck[questionId];
          write(KEYS.review, deck);
          return;
        }
      } else {
        card.step = 0;
      }
      card.due = addDays(todayStr(), this.reviewIntervals[card.step]);
      write(KEYS.review, deck);
    },
    dueReviewCount: function () {
      const deck = this.getReview();
      const t = todayStr();
      let n = 0;
      Object.keys(deck).forEach(function (id) {
        if (daysBetween(deck[id].due, t) >= 0) n += 1;
      });
      return n;
    },

    /* ---- 回答統計 ---- */
    getStats: function () { return read(KEYS.stats, { answered: 0, correct: 0 }); },
    recordAnswer: function (correct) {
      const s = this.getStats();
      s.answered += 1;
      if (correct) s.correct += 1;
      write(KEYS.stats, s);
    },

    /* ---- 設定 ---- */
    getSettings: function () { return read(KEYS.settings, { dark: null, examDate: null }); },
    setSetting: function (k, v) {
      const s = this.getSettings();
      s[k] = v;
      write(KEYS.settings, s);
    },

    /* ---- リセット（デバッグ / ユーザー任意） ---- */
    resetAll: function () {
      Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
    },
  };

  /* ---------------------------------------------------------------
   * 5. バッジ・実績
   * ------------------------------------------------------------- */
  const BADGE_DEFS = [
    { id: 'first-step', emoji: '🌱', name: 'はじめの一歩', desc: '最初の単元を学習した' },
    { id: 'streak-3',   emoji: '🔥', name: '3日つづいた', desc: '学習ストリーク3日達成' },
    { id: 'streak-7',   emoji: '🔥', name: '一週間の習慣', desc: '学習ストリーク7日達成' },
    { id: 'field-life', emoji: '🗺️', name: 'ライフ制覇', desc: '分野①を全マスター' },
    { id: 'field-risk', emoji: '🛡️', name: 'リスク制覇', desc: '分野②を全マスター' },
    { id: 'field-finance', emoji: '📈', name: '金融制覇', desc: '分野③を全マスター' },
    { id: 'field-tax',  emoji: '🧾', name: 'タックス制覇', desc: '分野④を全マスター' },
    { id: 'field-estate', emoji: '🏠', name: '不動産制覇', desc: '分野⑤を全マスター' },
    { id: 'field-inherit', emoji: '👪', name: '相続制覇', desc: '分野⑥を全マスター' },
    { id: 'first-exam', emoji: '📝', name: '初挑戦', desc: 'はじめての模試を受験' },
    { id: 'century',    emoji: '💯', name: '100問ノック', desc: '累計100問に回答' },
  ];
  const Badges = {
    defs: BADGE_DEFS,
    owned: function () { return read(KEYS.badges, []); },
    has: function (id) { return this.owned().indexOf(id) !== -1; },
    grant: function (id) {
      if (this.has(id)) return false;
      const list = this.owned();
      list.push(id);
      write(KEYS.badges, list);
      Toast.show('🏅 バッジ獲得：' + (BADGE_DEFS.find(function (b) { return b.id === id; }) || {}).name);
      return true;
    },
    /* 現在の状態からバッジ達成条件を評価（重複付与はしない） */
    evaluate: function () {
      const anyLearned = Object.keys(Store.getProgress()).length > 0;
      if (anyLearned) this.grant('first-step');

      const s = Store.getStreak();
      if ((s.current || 0) >= 3 || (s.longest || 0) >= 3) this.grant('streak-3');
      if ((s.current || 0) >= 7 || (s.longest || 0) >= 7) this.grant('streak-7');

      window.CURRICULUM.FIELDS.forEach(function (f) {
        if (Store.fieldProgress(f.key) >= 0.999) Badges.grant('field-' + f.key);
      });

      if (Store.getStats().answered >= 100) this.grant('century');
    },
  };

  /* ---------------------------------------------------------------
   * 6. ダークモード
   *  優先順位: ユーザー設定 > OSの prefers-color-scheme
   * ------------------------------------------------------------- */
  const Theme = {
    apply: function () {
      const s = Store.getSettings();
      let dark;
      if (s.dark === true || s.dark === false) {
        dark = s.dark;
      } else {
        dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    },
    toggle: function () {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark';
      Store.setSetting('dark', !cur);
      this.apply();
      const btn = document.getElementById('themeToggle');
      if (btn) btn.textContent = !cur ? '☀️' : '🌙';
    },
  };

  /* ---------------------------------------------------------------
   * 7. トースト通知（バッジ獲得など）
   * ------------------------------------------------------------- */
  const Toast = {
    show: function (msg) {
      let host = document.getElementById('toastHost');
      if (!host) {
        host = document.createElement('div');
        host.id = 'toastHost';
        host.className = 'toast-host';
        document.body.appendChild(host);
      }
      const el = document.createElement('div');
      el.className = 'toast';
      el.textContent = msg;
      host.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('show'); });
      setTimeout(function () {
        el.classList.remove('show');
        setTimeout(function () { el.remove(); }, 300);
      }, 2600);
    },
  };

  /* ---------------------------------------------------------------
   * 8. 共通UI: ヘッダーと下部ナビの注入
   *  各ページは <body> 先頭付近に <div id="appHeader"></div>、
   *  末尾に <nav id="appNav"></nav> を置くだけでよい。
   * ------------------------------------------------------------- */
  const NAV_ITEMS = [
    { key: 'home',   label: 'ホーム',   emoji: '🏠', href: 'index.html' },
    { key: 'learn',  label: '学習',     emoji: '📚', href: 'chapters/index.html' },
    { key: 'jitsugi',label: '実技',     emoji: '📄', href: 'jitsugi/index.html' },
    { key: 'exam',   label: '模試',     emoji: '📝', href: 'exam/index.html' },
    { key: 'review', label: '復習',     emoji: '🔁', href: 'review.html' },
  ];

  const UI = {
    injectHeader: function (opts) {
      opts = opts || {};
      const host = document.getElementById('appHeader');
      if (!host) return;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      host.className = 'app-header';
      host.innerHTML =
        '<div class="app-header__inner">' +
          (opts.back
            ? '<a class="iconbtn" href="' + r(opts.back) + '" aria-label="戻る">←</a>'
            : '<a class="brand" href="' + r('index.html') + '"><span class="brand__mark">FP</span><span class="brand__txt">3級 合格ナビ</span></a>') +
          '<div class="app-header__title">' + (opts.title || '') + '</div>' +
          '<button id="themeToggle" class="iconbtn" aria-label="ダークモード切替">' + (dark ? '☀️' : '🌙') + '</button>' +
        '</div>' +
        '<div class="lawbadge">📅 法令基準日：' + window.CURRICULUM.EXAM.lawBaseDate +
          '　<span class="badge badge--warn" title="税制改正で変わりやすい数値には各所で「改正注意」を表示します">改正注意あり</span></div>';
      const tb = document.getElementById('themeToggle');
      if (tb) tb.addEventListener('click', function () { Theme.toggle(); });
    },

    injectNav: function (active) {
      const host = document.getElementById('appNav');
      if (!host) return;
      host.className = 'bottom-nav';
      host.innerHTML = NAV_ITEMS.map(function (it) {
        const isActive = it.key === active ? ' is-active' : '';
        return '<a class="bottom-nav__item' + isActive + '" href="' + r(it.href) + '">' +
          '<span class="bottom-nav__ico">' + it.emoji + '</span>' +
          '<span class="bottom-nav__lb">' + it.label + '</span></a>';
      }).join('');
    },
  };

  /* ---------------------------------------------------------------
   * 9. ホーム（ダッシュボード）描画
   *  index.html に各プレースホルダ要素がある場合のみ描画する。
   * ------------------------------------------------------------- */
  const Home = {
    render: function () {
      if (!document.getElementById('home')) return; // ホーム以外では何もしない
      this.renderResume();
      this.renderStreak();
      this.renderNextUnit();
      this.renderOverall();
      this.renderExamPlan();
      this.renderRoadmap();
      this.renderBadges();
    },

    renderResume: function () {
      const host = document.getElementById('resume');
      if (!host) return;
      const last = Store.getLast();
      if (!last) { host.style.display = 'none'; return; }
      host.style.display = '';
      host.innerHTML =
        '<a class="resume-btn" href="' + (last.href ? r(last.href) : '#') + '">' +
          '<span class="resume-btn__lb">▶ 続きから</span>' +
          '<span class="resume-btn__unit">' + last.title + '</span>' +
        '</a>';
    },

    renderStreak: function () {
      const host = document.getElementById('streak');
      if (!host) return;
      const st = Store.streakStatus();
      const flame = st.studiedToday ? '🔥' : '🕯️';
      host.innerHTML =
        '<div class="streak">' +
          '<div class="streak__flame">' + flame + '</div>' +
          '<div class="streak__body">' +
            '<div class="streak__num">' + (st.current || 0) + '<span>日連続</span></div>' +
            '<div class="streak__sub">' +
              (st.studiedToday
                ? '今日も学習しました。えらい！'
                : '今日はまだです。<b>○×3問だけでもOK</b>、火を絶やさないで！') +
            '</div>' +
          '</div>' +
          '<div class="streak__best">最長 ' + (st.longest || 0) + '日</div>' +
        '</div>';
    },

    renderNextUnit: function () {
      const host = document.getElementById('nextUnit');
      if (!host) return;
      const u = Store.nextUnit();
      if (!u) {
        host.innerHTML = '<div class="card card--done"><h3>🎉 全単元マスター達成！</h3>' +
          '<p>あとは模試で仕上げましょう。</p>' +
          '<a class="btn btn--primary" href="' + r('exam/index.html') + '">模試に挑戦する</a></div>';
        return;
      }
      const f = window.CURRICULUM.fieldByKey(u.fieldKey);
      const locked = !u.href;
      host.innerHTML =
        '<div class="card next-card" style="--accent:' + f.color + '">' +
          '<div class="next-card__tag">今日やるべき1単元</div>' +
          '<div class="next-card__field">' + f.emoji + ' ' + f.no + '. ' + f.title + '</div>' +
          '<h3 class="next-card__title">' + u.no + '　' + u.title + '</h3>' +
          '<p class="next-card__sum">' + (u.summary || '') + '</p>' +
          '<div class="next-card__meta">⏱ 約' + u.minutes + '分</div>' +
          (locked
            ? '<button class="btn btn--ghost" disabled>準備中（フェーズ2以降で公開）</button>'
            : '<a class="btn btn--primary" href="' + r(u.href) + '">この単元を始める</a>') +
        '</div>';
    },

    renderOverall: function () {
      const host = document.getElementById('overall');
      if (!host) return;
      const p = Math.round(Store.overallProgress() * 100);
      host.innerHTML =
        '<div class="card">' +
          '<div class="row-between"><h3>全体の習熟度</h3><b class="pct">' + p + '%</b></div>' +
          '<div class="meter"><div class="meter__fill" style="width:' + p + '%"></div></div>' +
          '<p class="muted small">全' + window.CURRICULUM.totalUnits + '単元・累計' + Store.getStats().answered + '問回答' +
          '（正答率 ' + this.accuracy() + '％）</p>' +
        '</div>';
    },
    accuracy: function () {
      const s = Store.getStats();
      return s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
    },

    renderExamPlan: function () {
      const host = document.getElementById('examPlan');
      if (!host) return;
      const s = Store.getSettings();
      const val = s.examDate || '';
      let planHtml = '';
      if (val) {
        const remain = daysBetween(todayStr(), val);
        const all = window.CURRICULUM.allUnits();
        let remainingUnits = 0;
        all.forEach(function (u) { if (Store.getMastery(u.id) !== 'mastered') remainingUnits += 1; });
        if (remain > 0) {
          const perDay = Math.max(1, Math.ceil(remainingUnits / remain));
          planHtml = '<div class="plan__result">試験まであと <b>' + remain + '日</b>。未マスターは ' +
            remainingUnits + '単元 → <b>1日あたり約' + perDay + '単元</b>で間に合います。</div>';
        } else if (remain === 0) {
          planHtml = '<div class="plan__result">今日が試験日です。深呼吸して、いってらっしゃい！🍀</div>';
        } else {
          planHtml = '<div class="plan__result muted">設定した試験日は過ぎています。次の目標日を入れましょう。</div>';
        }
      }
      host.innerHTML =
        '<div class="card">' +
          '<div class="row-between"><h3>合格逆算プラン</h3></div>' +
          '<label class="plan__label">目標受験日' +
            '<input type="date" id="examDateInput" value="' + val + '" class="input"></label>' +
          planHtml +
        '</div>';
      const inp = document.getElementById('examDateInput');
      if (inp) inp.addEventListener('change', function () {
        Store.setSetting('examDate', inp.value || null);
        Home.renderExamPlan();
      });
    },

    /* すごろく/スキルツリー風のロードマップ。各分野を「駅」、単元を「マス」で表現。 */
    renderRoadmap: function () {
      const host = document.getElementById('roadmap');
      if (!host) return;
      const fields = window.CURRICULUM.FIELDS;
      let html = '<div class="roadmap">';
      fields.forEach(function (f) {
        const units = window.CURRICULUM.unitsOf(f.key);
        const pct = Math.round(Store.fieldProgress(f.key) * 100);
        html +=
          '<div class="rm-field" style="--accent:' + f.color + '">' +
            '<div class="rm-field__head">' +
              '<span class="rm-field__emoji">' + f.emoji + '</span>' +
              '<a class="rm-field__title" href="' + r('chapters/index.html') + '#' + f.key + '">' + f.no + '. ' + f.title + '</a>' +
              '<span class="rm-field__pct">' + pct + '%</span>' +
            '</div>' +
            '<div class="rm-track">' +
              units.map(function (u) {
                const lvl = Store.getMastery(u.id);
                const locked = !u.href;
                return '<span class="rm-node rm-node--' + lvl + (locked ? ' is-locked' : '') + '" ' +
                  'title="' + u.title + '（' + MASTERY[lvl].label + '）">' +
                  (lvl === 'mastered' ? '★' : (locked ? '🔒' : u.no)) + '</span>';
              }).join('') +
            '</div>' +
          '</div>';
      });
      html += '</div>';
      host.innerHTML = html;
    },

    renderBadges: function () {
      const host = document.getElementById('badges');
      if (!host) return;
      const owned = Badges.owned();
      const shown = Badges.defs.slice(0, 6);
      host.innerHTML =
        '<div class="card">' +
          '<div class="row-between"><h3>バッジ</h3><span class="muted small">' + owned.length + ' / ' + Badges.defs.length + '</span></div>' +
          '<div class="badge-grid">' +
            Badges.defs.map(function (b) {
              const has = owned.indexOf(b.id) !== -1;
              return '<div class="badge-chip' + (has ? '' : ' is-locked') + '" title="' + b.name + '：' + b.desc + '">' +
                '<span class="badge-chip__emoji">' + (has ? b.emoji : '🔒') + '</span>' +
                '<span class="badge-chip__name">' + b.name + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>';
    },
  };

  /* ---------------------------------------------------------------
   * 10. 起動
   * ------------------------------------------------------------- */
  function boot() {
    Theme.apply();
    const active = document.body.getAttribute('data-nav') || '';
    UI.injectHeader({
      title: document.body.getAttribute('data-title') || '',
      back: document.body.getAttribute('data-back') || '',
    });
    UI.injectNav(active);
    Home.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* 他ページ（単元・クイズ・模試）から使えるよう公開 */
  window.FP3 = {
    Store: Store,
    Badges: Badges,
    Theme: Theme,
    Toast: Toast,
    UI: UI,
    MASTERY: MASTERY,
    root: r,
    util: { todayStr: todayStr, addDays: addDays, daysBetween: daysBetween },
  };
})();
