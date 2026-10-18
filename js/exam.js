/* =====================================================================
 * exam.js — 模試モード（CBT風UI）エンジン
 *
 * 学科模試（60問・90分）と実技模試（20問・60分）の両方をこのエンジンで
 * 動かす。CBTの操作感を意識し、
 *   - 1問ずつの画面遷移
 *   - 「あとで見直す」フラグ
 *   - 全問一覧からのジャンプ
 *   - 制限時間タイマー（自動提出）
 *   - 採点後、分野別正答率のレーダーチャート（SVG）と弱点分野リンク
 * を提供する。
 *
 * 依存: js/quiz.js（FP3.Quiz.createRunner）, js/app.js（FP3.Store 等）,
 *       学科は js/data/exam-bank.js（window.EXAM_BANK）,
 *       実技は js/data/jitsugi-data.js（window.JITSUGI）
 * ===================================================================== */
(function () {
  'use strict';
  var FP3 = window.FP3 || {};

  /* ---------------- 出題プールの構築 ---------------- */

  /* 学科模試：6分野から均等に抽出して60問（各分野10問）にする */
  function buildGakkaPool() {
    var bank = window.EXAM_BANK || [];
    var fields = ['life', 'risk', 'finance', 'tax', 'estate', 'inherit'];
    var perField = 10;
    var pool = [];
    fields.forEach(function (f) {
      var qs = bank.filter(function (q) {
        return (q.tags || []).indexOf('field:' + f) !== -1;
      });
      pool = pool.concat(FP3.Quiz.shuffle(qs).slice(0, perField));
    });
    return FP3.Quiz.shuffle(pool);
  }

  /* 実技模試：資料読み取り演習22問から20問を抽出 */
  function buildJitsugiPool() {
    var qs = (window.JITSUGI && window.JITSUGI.questions) || [];
    return FP3.Quiz.shuffle(qs).slice(0, 20);
  }

  var CONFIG = {
    gakka: { minutes: 90, pool: buildGakkaPool, label: '学科模試', unit: '問', passLabel: '36点以上（60点満点）' },
    jitsugi: { minutes: 60, pool: buildJitsugiPool, label: '実技模試', unit: '問', passLabel: '60点以上（100点満点）' },
  };

  /* ---------------- ユーティリティ ---------------- */
  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  /* シンプルなレーダーチャート（SVG）。items: [{label, pct}] */
  function radarChart(items) {
    var n = items.length;
    if (n < 3) {
      /* 軸が少なすぎるとレーダーにならないため棒グラフ的に代替 */
      return '<div class="table-scroll"><table class="cmp"><tbody>' +
        items.map(function (it) { return '<tr><td>' + it.label + '</td><td style="text-align:right">' + Math.round(it.pct) + '%</td></tr>'; }).join('') +
        '</tbody></table></div>';
    }
    var size = 280, cx = size / 2, cy = size / 2, R = size / 2 - 46;
    function angle(i) { return (Math.PI * 2 * i / n) - Math.PI / 2; }
    function pt(i, val) { var r = R * (Math.max(0, Math.min(100, val)) / 100); var a = angle(i); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }

    var grid = [1, 2, 3, 4].map(function (L) {
      var pts = [];
      for (var i = 0; i < n; i++) {
        var r = R * (L / 4), a = angle(i);
        pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
      }
      return '<polygon points="' + pts.join(' ') + '" fill="none" stroke="var(--border)" stroke-width="1"/>';
    }).join('');

    var axes = items.map(function (it, i) {
      var a = angle(i), x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="var(--border)"/>';
    }).join('');

    var dataPts = items.map(function (it, i) { var p = pt(i, it.pct); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');

    var labels = items.map(function (it, i) {
      var a = angle(i), lx = cx + (R + 26) * Math.cos(a), ly = cy + (R + 26) * Math.sin(a);
      return '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" font-size="10" fill="var(--text)" font-weight="700">' + it.label + '</text>' +
        '<text x="' + lx.toFixed(1) + '" y="' + (ly + 13).toFixed(1) + '" text-anchor="middle" font-size="9" fill="var(--muted)">' + Math.round(it.pct) + '%</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="分野別正答率レーダーチャート">' +
      grid + axes +
      '<polygon points="' + dataPts + '" fill="color-mix(in srgb, var(--blue) 30%, transparent)" stroke="var(--blue)" stroke-width="2"/>' +
      labels +
      '</svg>';
  }

  /* ---------------- CBTランナー本体 ---------------- */
  function ExamRunner(kind, root) {
    var cfg = CONFIG[kind];
    var pool = cfg.pool();
    var runner = FP3.Quiz.createRunner(pool, { shuffle: false });
    var totalSeconds = cfg.minutes * 60;
    var remaining = totalSeconds;
    var timerHandle = null;
    var finished = false;
    var mode = 'run'; // run | confirmSubmit | result

    function start() {
      timerHandle = setInterval(function () {
        remaining -= 1;
        if (remaining <= 0) {
          remaining = 0;
          clearInterval(timerHandle);
          if (FP3.Toast) FP3.Toast.show('⏰ 時間切れ。自動的に提出しました。');
          finish();
          return;
        }
        var t = root.querySelector('.exam-timer__val');
        if (t) {
          t.textContent = mmss(remaining);
          t.parentElement.classList.toggle('is-warn', remaining <= 300);
        }
      }, 1000);
      render();
    }

    function optionValue(q, choiceEl) {
      return q.type === 'ox' ? (choiceEl.dataset.val === 'true') : Number(choiceEl.dataset.val);
    }

    function selectAnswer(i, val) {
      runner.record(i, val);
      render();
    }

    function renderQuestionCard(i) {
      var q = runner.questions[i];
      var ans = runner.answerOf(i);
      var flagged = runner.isFlagged(i);
      var optsHtml;
      if (q.type === 'ox') {
        optsHtml = ['○', '×'].map(function (label, idx) {
          var val = idx === 0;
          var selected = ans && ans.chosen === val;
          return '<button type="button" class="exam-opt exam-opt--ox' + (selected ? ' is-selected' : '') + '" data-val="' + val + '">' + label + '</button>';
        }).join('');
      } else {
        optsHtml = (q.choices || []).map(function (c, idx) {
          var selected = ans && ans.chosen === idx;
          return '<button type="button" class="exam-opt' + (selected ? ' is-selected' : '') + '" data-val="' + idx + '">' +
            '<span class="q__optmark">' + String.fromCharCode(65 + idx) + '</span>' + c + '</button>';
        }).join('');
      }
      return (
        '<div class="exam-qcard">' +
          '<div class="exam-qcard__head">' +
            '<span class="exam-qcard__no">問' + (i + 1) + ' / ' + runner.total + '</span>' +
            '<button type="button" class="exam-flagbtn' + (flagged ? ' is-flagged' : '') + '" id="examFlagBtn">' +
              (flagged ? '🚩 見直すに登録中' : '🏳️ あとで見直す') +
            '</button>' +
          '</div>' +
          '<div class="exam-qcard__body">' + q.q + '</div>' +
          '<div class="exam-qcard__opts">' + optsHtml + '</div>' +
        '</div>'
      );
    }

    function renderGrid() {
      var cells = runner.questions.map(function (q, i) {
        var ans = runner.answerOf(i);
        var cls = ['exam-grid__cell'];
        if (i === runner.current()) cls.push('is-current');
        if (ans) cls.push('is-answered');
        if (runner.isFlagged(i)) cls.push('is-flagged');
        return '<button type="button" class="' + cls.join(' ') + '" data-jump="' + i + '">' + (i + 1) + '</button>';
      }).join('');
      var answeredCount = runner.answeredCount();
      return (
        '<div class="exam-grid">' +
          '<p class="muted small">回答済み ' + answeredCount + ' / ' + runner.total + '　🚩見直し登録あり</p>' +
          '<div class="exam-grid__cells">' + cells + '</div>' +
        '</div>'
      );
    }

    function renderConfirm() {
      var unanswered = runner.total - runner.answeredCount();
      return (
        '<div class="exam-qcard exam-confirm">' +
          '<h3>模試を提出しますか？</h3>' +
          (unanswered > 0 ? '<p class="callout callout--trap">まだ <b>' + unanswered + '問</b> が未回答です。</p>' : '<p class="callout callout--point">全問回答済みです。</p>') +
          '<div class="tool__actions">' +
            '<button type="button" class="btn btn--primary" id="examConfirmYes">はい、提出する</button>' +
            '<button type="button" class="btn btn--outline" id="examConfirmNo">いいえ、続ける</button>' +
          '</div>' +
        '</div>'
      );
    }

    function render() {
      if (mode === 'result') return; // 結果画面は renderResult が描画
      var i = runner.current();
      root.innerHTML =
        '<div class="exam-topbar">' +
          '<div class="exam-topbar__label">' + cfg.label + '</div>' +
          '<div class="exam-timer"><span class="exam-timer__ico">⏱</span><span class="exam-timer__val">' + mmss(remaining) + '</span></div>' +
        '</div>' +
        (mode === 'confirmSubmit' ? renderConfirm() : renderQuestionCard(i)) +
        '<div class="exam-navbar">' +
          '<button type="button" class="btn btn--outline" id="examPrev"' + (i === 0 ? ' disabled' : '') + '>← 前へ</button>' +
          '<button type="button" class="btn btn--outline" id="examNext"' + (i === runner.total - 1 ? ' disabled' : '') + '>次へ →</button>' +
        '</div>' +
        renderGrid() +
        '<div class="tool__actions" style="margin-top:10px">' +
          '<button type="button" class="btn btn--primary" id="examSubmit">提出する</button>' +
          '<button type="button" class="btn btn--outline" id="examAbort">✕ 中断してホームへ</button>' +
        '</div>';

      /* イベント結線 */
      var qEl = root.querySelector('.exam-qcard:not(.exam-confirm)');
      if (qEl) {
        qEl.querySelectorAll('.exam-opt').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var q = runner.questions[i];
            selectAnswer(i, optionValue(q, btn));
          });
        });
        var flagBtn = root.querySelector('#examFlagBtn');
        if (flagBtn) flagBtn.addEventListener('click', function () { runner.toggleFlag(i); render(); });
      }
      var prevBtn = root.querySelector('#examPrev');
      if (prevBtn) prevBtn.addEventListener('click', function () { runner.prev(); render(); });
      var nextBtn = root.querySelector('#examNext');
      if (nextBtn) nextBtn.addEventListener('click', function () { runner.next(); render(); });
      root.querySelectorAll('[data-jump]').forEach(function (cell) {
        cell.addEventListener('click', function () { runner.go(Number(cell.dataset.jump)); mode = 'run'; render(); });
      });
      var submitBtn = root.querySelector('#examSubmit');
      if (submitBtn) submitBtn.addEventListener('click', function () { mode = 'confirmSubmit'; render(); });
      var yesBtn = root.querySelector('#examConfirmYes');
      if (yesBtn) yesBtn.addEventListener('click', finish);
      var noBtn = root.querySelector('#examConfirmNo');
      if (noBtn) noBtn.addEventListener('click', function () { mode = 'run'; render(); });
      var abortBtn = root.querySelector('#examAbort');
      if (abortBtn) abortBtn.addEventListener('click', function () {
        if (finished) return;
        clearInterval(timerHandle);
        window.location.href = FP3.root('index.html');
      });
    }

    function fieldTitle(key) {
      var f = window.CURRICULUM && window.CURRICULUM.fieldByKey(key);
      return f ? f.emoji + ' ' + f.short : key;
    }

    function weakUnitLink(fieldKey) {
      if (!window.CURRICULUM) return null;
      var units = window.CURRICULUM.unitsOf(fieldKey);
      var target = units.find(function (u) { return u.href && FP3.Store.getMastery(u.id) !== 'mastered'; }) || units.find(function (u) { return u.href; });
      return target ? { title: fieldTitle(fieldKey) + ' ' + target.no + '. ' + target.title, href: FP3.root(target.href) } : null;
    }

    function finish() {
      if (finished) return;
      finished = true;
      mode = 'result';
      clearInterval(timerHandle);

      /* 統計・復習デッキへ反映（結果発表と同時に一括で記録） */
      runner.questions.forEach(function (q, i) {
        var a = runner.answerOf(i);
        if (a) {
          FP3.Store.recordAnswer(a.correct);
          if (!a.correct) FP3.Store.addToReview(q.id, { q: q.q, tags: q.tags || [] });
        }
      });
      FP3.Store.recordStudyToday();
      FP3.Badges.grant('first-exam');
      FP3.Badges.evaluate();

      renderResult();
    }

    function renderResult() {
      var s = runner.score();
      var isGakka = kind === 'gakka';
      var displayScore = isGakka ? s.correct : s.correct * 5;
      var displayTotal = isGakka ? s.total : s.total * 5;
      var passLine = isGakka ? 36 : 60;
      var passed = displayScore >= passLine;

      var byFieldOrRes;
      var items;
      if (isGakka) {
        byFieldOrRes = runner.byField();
        items = ['life', 'risk', 'finance', 'tax', 'estate', 'inherit'].map(function (key) {
          var b = byFieldOrRes[key] || { total: 0, correct: 0 };
          return { key: key, label: fieldTitle(key), pct: b.total ? (b.correct / b.total * 100) : 0, total: b.total, correct: b.correct };
        }).filter(function (it) { return it.total > 0; });
      } else {
        var byRes = {};
        runner.questions.forEach(function (q, i) {
          var a = runner.answerOf(i);
          var key = q.resourceId || 'other';
          if (!byRes[key]) byRes[key] = { total: 0, correct: 0 };
          byRes[key].total += 1;
          if (a && a.correct) byRes[key].correct += 1;
        });
        items = Object.keys(byRes).map(function (key) {
          var res = (window.JITSUGI.resources || []).find(function (r) { return r.id === key; });
          var b = byRes[key];
          return { key: key, label: res ? res.icon : key, pct: b.total ? (b.correct / b.total * 100) : 0, total: b.total, correct: b.correct };
        });
      }

      var weakItems = items.slice().sort(function (a, b) { return a.pct - b.pct; }).slice(0, 3).filter(function (it) { return it.pct < 100; });
      var weakLinksHtml = weakItems.map(function (it) {
        if (isGakka) {
          var link = weakUnitLink(it.key);
          if (!link) return '';
          return '<a class="field-card" href="' + link.href + '" style="display:block;margin-bottom:8px">' +
            '<b>' + it.label + '</b>（正答率' + Math.round(it.pct) + '%）を復習する →<br>' +
            '<span class="muted small">' + link.title + '</span></a>';
        } else {
          return '<a class="field-card" href="' + FP3.root('jitsugi/index.html#res-' + it.key) + '" style="display:block;margin-bottom:8px">' +
            '<b>' + it.label + '</b>（正答率' + Math.round(it.pct) + '%）の資料を復習する →</a>';
        }
      }).join('');

      var reviewHtml = runner.questions.map(function (q, i) {
        var a = runner.answerOf(i);
        var yourAnswer = '未回答';
        if (a) {
          yourAnswer = q.type === 'ox' ? (a.chosen ? '○' : '×') : (q.choices[a.chosen] || '');
        }
        var correctAnswer = q.type === 'ox' ? (q.answer ? '○' : '×') : q.choices[q.answer];
        return '<details class="acc"><summary>問' + (i + 1) + '　' + (a && a.correct ? '⭕' : '❌') + ' ' + q.q.replace(/<[^>]+>/g, '').slice(0, 40) + (q.q.length > 40 ? '…' : '') + '</summary>' +
          '<div class="acc__body">' +
            '<p>' + q.q + '</p>' +
            '<p>あなたの回答：<b>' + yourAnswer + '</b>　正解：<b>' + correctAnswer + '</b></p>' +
            '<p class="muted small">' + q.explain + '</p>' +
          '</div></details>';
      }).join('');

      root.innerHTML =
        '<div class="card ' + (passed ? 'card--done' : '') + '">' +
          '<div class="row-between"><h3>' + cfg.label + ' 結果</h3><span class="badge ' + (passed ? 'badge--info' : 'badge--warn') + '">' + (passed ? '合格ライン到達' : '合格ラインまであと少し') + '</span></div>' +
          '<p class="pct" style="font-size:1.8rem">' + displayScore + ' <span class="muted small">/ ' + displayTotal + '</span></p>' +
          '<p class="muted small">合格ラインの目安：' + cfg.passLabel + '</p>' +
        '</div>' +
        '<h2 class="section-title">📊 ' + (isGakka ? '分野別' : '資料別') + '正答率</h2>' +
        '<div class="card center">' + radarChart(items) + '</div>' +
        (weakLinksHtml ? '<h2 class="section-title">📌 弱点の復習リンク</h2>' + weakLinksHtml : '') +
        '<h2 class="section-title">📝 全問の見直し</h2>' +
        reviewHtml +
        '<div class="tool__actions" style="margin:16px 0 30px">' +
          '<a class="btn btn--outline" href="' + FP3.root('exam/index.html') + '">🔁 もう一度模試を受ける</a>' +
          '<a class="btn btn--primary" href="' + FP3.root('index.html') + '">🏠 ホームに戻る</a>' +
        '</div>';
    }

    this.start = start;
    this.getRunner = function () { return runner; };
    this.finish = finish;
  }

  FP3.Exam = {
    start: function (kind, root) {
      if (!CONFIG[kind]) return;
      var instance = new ExamRunner(kind, root);
      instance.start();
      FP3.Exam.current = instance; // デバッグ・自動テスト用の参照
      return instance;
    },
  };
  window.FP3 = FP3;
})();
