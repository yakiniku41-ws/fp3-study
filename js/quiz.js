/* =====================================================================
 * quiz.js — クイズエンジン
 *
 * 単元ページの「ミニチェック（○×）」、三答択一、実技の資料読み取り問題、
 * 模試まで、同じデータ構造とAPIで扱えるようにする共通エンジン。
 *
 * 問題データの形（1問）:
 *   {
 *     id:      'life-2-q1',          // 一意ID（復習デッキのキーにもなる）
 *     type:    'ox' | 'choice',      // ○× か 三答/多肢択一
 *     q:       '問題文（HTML可）',
 *     choices: ['選択肢A','選択肢B','選択肢C'],  // type:'choice' のとき
 *     answer:  true | 0,             // ox は true/false、choice は正解index
 *     explain: '解説（HTML可）',
 *     hint:    '（任意）ヒント',
 *     tags:    ['field:life','unit:life-2'] // 集計・弱点分析用（任意）
 *   }
 *
 * 使い方（単元ページ）:
 *   FP3.Quiz.mountMiniCheck(document.getElementById('mini'), questions, {
 *     unitId: 'life-2'      // 全問正解時に習熟度を practiced へ引き上げる
 *   });
 *
 * 依存: app.js（window.FP3.Store 等）。単独でも最低限動く。
 * ===================================================================== */
(function () {
  'use strict';

  const FP3 = window.FP3 || {};
  const Store = FP3.Store || null;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* 配列シャッフル（模試の出題順ランダム化に使用） */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* -------------------------------------------------------------
   * 1問を描画して、採点フックを返すファクトリ
   * onGraded(correct) は採点確定時に一度だけ呼ばれる
   * ------------------------------------------------------------- */
  function renderQuestion(q, opts) {
    opts = opts || {};
    const wrap = el('div', 'q');
    let answered = false;

    /* 問題文 */
    const number = opts.index != null ? '<span class="q__no">Q' + (opts.index + 1) + '</span>' : '';
    wrap.appendChild(el('div', 'q__body', number + '<span class="q__text">' + q.q + '</span>'));

    /* 選択肢 */
    const optsHost = el('div', 'q__opts');
    let buttons = [];

    if (q.type === 'ox') {
      [['○', true], ['×', false]].forEach(function (pair) {
        const b = el('button', 'q__opt q__opt--ox', pair[0]);
        b.type = 'button';
        b.dataset.val = String(pair[1]);
        optsHost.appendChild(b);
        buttons.push(b);
      });
    } else {
      (q.choices || []).forEach(function (c, i) {
        const b = el('button', 'q__opt', '<span class="q__optmark">' + String.fromCharCode(65 + i) + '</span>' + c);
        b.type = 'button';
        b.dataset.val = String(i);
        optsHost.appendChild(b);
        buttons.push(b);
      });
    }
    wrap.appendChild(optsHost);

    /* 解説エリア（初期は非表示） */
    const fb = el('div', 'q__feedback');
    fb.style.display = 'none';
    wrap.appendChild(fb);

    function grade(chosen) {
      if (answered) return;
      answered = true;
      const correctVal = q.type === 'ox' ? q.answer : q.answer;
      const isCorrect = (q.type === 'ox')
        ? (chosen === q.answer)
        : (chosen === q.answer);

      buttons.forEach(function (b) {
        b.disabled = true;
        const v = q.type === 'ox' ? (b.dataset.val === 'true') : Number(b.dataset.val);
        if (v === correctVal) b.classList.add('is-correct');
        const chosenMatches = (q.type === 'ox') ? (v === chosen) : (v === chosen);
        if (chosenMatches && v !== correctVal) b.classList.add('is-wrong');
      });

      fb.style.display = '';
      fb.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      fb.innerHTML =
        '<div class="q__result">' + (isCorrect ? '⭕ 正解！' : '❌ 不正解') + '</div>' +
        (q.explain ? '<div class="q__explain">' + q.explain + '</div>' : '');

      /* 統計・復習デッキ・習熟度への反映 */
      if (Store) {
        Store.recordAnswer(isCorrect);
        if (!isCorrect && q.id) {
          Store.addToReview(q.id, { q: q.q, tags: q.tags || [] });
        }
        /* 復習モードから来た問題は採点を復習デッキに反映 */
        if (opts.reviewMode && q.id) {
          Store.gradeReview(q.id, isCorrect);
        }
      }

      if (typeof opts.onGraded === 'function') opts.onGraded(isCorrect);
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        const val = q.type === 'ox' ? (b.dataset.val === 'true') : Number(b.dataset.val);
        grade(val);
      });
    });

    return { el: wrap, isAnswered: function () { return answered; } };
  }

  /* -------------------------------------------------------------
   * ミニチェック: 単元ページ用。全問その場採点。
   * 全問正解でその単元を「演習済み(practiced)」に引き上げる。
   * ------------------------------------------------------------- */
  function mountMiniCheck(host, questions, opts) {
    opts = opts || {};
    if (!host) return;
    host.innerHTML = '';
    host.classList.add('minicheck');

    const total = questions.length;
    let gradedCount = 0;
    let correctCount = 0;

    const head = el('div', 'minicheck__head',
      '<h3>ミニチェック</h3><span class="minicheck__count muted small">全' + total + '問・その場で答え合わせ</span>');
    host.appendChild(head);

    const progress = el('div', 'minicheck__progress');
    host.appendChild(progress);

    questions.forEach(function (q, i) {
      const item = renderQuestion(q, {
        index: i,
        onGraded: function (correct) {
          gradedCount += 1;
          if (correct) correctCount += 1;
          progress.textContent = '解答 ' + gradedCount + '/' + total + '（正解 ' + correctCount + '）';
          if (gradedCount === total) {
            const allRight = correctCount === total;
            const done = el('div', 'minicheck__done ' + (allRight ? 'is-good' : ''),
              allRight
                ? '✅ 全問正解！この単元は「演習済み」になりました。'
                : '📝 ' + correctCount + '/' + total + ' 正解。間違えた問題は自動で復習デッキに入りました。');
            host.appendChild(done);
            if (opts.unitId && Store) {
              Store.setMastery(opts.unitId, allRight ? 'practiced' : 'learning');
            }
            if (typeof opts.onComplete === 'function') opts.onComplete(correctCount, total);
          }
        },
      });
      host.appendChild(item.el);
    });

    /* 単元ページを開いた時点で最低「学習中」にする */
    if (opts.unitId && Store) Store.setMastery(opts.unitId, 'learning');
  }

  /* -------------------------------------------------------------
   * 単問モード（模試のCBT風・1問ずつ表示）向けのファクトリを公開。
   * 模試UI（exam.js, フェーズ後半で実装）から使う想定。
   * ------------------------------------------------------------- */
  function createRunner(questions, opts) {
    opts = opts || {};
    const list = opts.shuffle ? shuffle(questions) : questions.slice();
    let idx = 0;
    const answers = new Array(list.length).fill(null); // {chosen, correct}
    const flags = new Array(list.length).fill(false);

    return {
      questions: list,
      total: list.length,
      current: function () { return idx; },
      go: function (i) { idx = Math.max(0, Math.min(list.length - 1, i)); },
      next: function () { this.go(idx + 1); },
      prev: function () { this.go(idx - 1); },
      toggleFlag: function (i) { i = i == null ? idx : i; flags[i] = !flags[i]; return flags[i]; },
      isFlagged: function (i) { return !!flags[i == null ? idx : i]; },
      record: function (i, chosen) {
        const q = list[i];
        const correct = q.type === 'ox' ? (chosen === q.answer) : (chosen === q.answer);
        answers[i] = { chosen: chosen, correct: correct };
        return correct;
      },
      answerOf: function (i) { return answers[i]; },
      answeredCount: function () { return answers.filter(function (a) { return a != null; }).length; },
      score: function () {
        let correct = 0;
        answers.forEach(function (a) { if (a && a.correct) correct += 1; });
        return { correct: correct, total: list.length };
      },
      /* 分野別正答率（レーダーチャート用集計）。tags の 'field:xxx' を見る */
      byField: function () {
        const map = {};
        list.forEach(function (q, i) {
          const tag = (q.tags || []).find(function (t) { return t.indexOf('field:') === 0; });
          const key = tag ? tag.split(':')[1] : 'other';
          if (!map[key]) map[key] = { total: 0, correct: 0 };
          map[key].total += 1;
          if (answers[i] && answers[i].correct) map[key].correct += 1;
        });
        return map;
      },
    };
  }

  FP3.Quiz = {
    renderQuestion: renderQuestion,
    mountMiniCheck: mountMiniCheck,
    createRunner: createRunner,
    shuffle: shuffle,
  };
  window.FP3 = FP3;
})();
