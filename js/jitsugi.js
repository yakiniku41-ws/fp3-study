/* =====================================================================
 * jitsugi.js — 実技（資産設計提案業務）資料読み取り演習の描画エンジン
 *
 * js/data/jitsugi-data.js の資料・設問データを受け取り、
 *  - 資料（HTML/SVG）をカードとして表示
 *  - その資料に紐づく設問を FP3.Quiz.renderQuestion で描画
 *  - 各設問に「🔍 資料のどこを見る？」ボタンを添え、
 *    クリックすると資料内の該当要素に .hl-mark を付けてスクロールする
 * ===================================================================== */
(function () {
  'use strict';
  var FP3 = window.FP3 || {};

  function mount(root, summaryHost) {
    if (!root || !window.JITSUGI) return;
    root.innerHTML = '';

    var total = JITSUGI.questions.length;
    var graded = 0, correct = 0;
    function renderSummary() {
      if (!summaryHost) return;
      var pct = total ? Math.round((graded / total) * 100) : 0;
      summaryHost.innerHTML =
        '<div class="card">' +
          '<div class="row-between"><h3>演習の進み具合</h3><b class="pct">' + graded + ' / ' + total + '</b></div>' +
          '<div class="meter"><div class="meter__fill" style="width:' + pct + '%"></div></div>' +
          '<p class="muted small">正解 ' + correct + ' 問（正答率 ' + (graded ? Math.round(correct / graded * 100) : 0) + '％）</p>' +
        '</div>';
    }
    renderSummary();

    var qIndex = 0;
    JITSUGI.resources.forEach(function (res) {
      var section = document.createElement('section');
      section.className = 'resource-block';
      section.id = 'res-' + res.id;

      var resCard = document.createElement('div');
      resCard.className = 'resource-card';
      resCard.innerHTML = '<div class="resource-card__title">' + res.icon + ' ' + res.title + '</div>' + res.html;
      section.appendChild(resCard);

      var qs = JITSUGI.questions.filter(function (q) { return q.resourceId === res.id; });
      var qHost = document.createElement('div');
      qHost.className = 'resource-questions';

      qs.forEach(function (q) {
        var wrap = document.createElement('div');
        wrap.className = 'q-with-hl';

        var hlBtn = document.createElement('button');
        hlBtn.type = 'button';
        hlBtn.className = 'hl-btn';
        hlBtn.textContent = '🔍 資料のどこを見る？';
        hlBtn.addEventListener('click', function () {
          resCard.querySelectorAll('.hl-mark').forEach(function (e) { e.classList.remove('hl-mark'); });
          (q.highlight || []).forEach(function (sel) {
            resCard.querySelectorAll(sel).forEach(function (e) { e.classList.add('hl-mark'); });
          });
          resCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        wrap.appendChild(hlBtn);

        var item = FP3.Quiz.renderQuestion(q, {
          index: qIndex++,
          onGraded: function (isCorrect) {
            graded += 1;
            if (isCorrect) correct += 1;
            renderSummary();
          },
        });
        wrap.appendChild(item.el);
        qHost.appendChild(wrap);
      });

      section.appendChild(qHost);
      root.appendChild(section);
    });
  }

  FP3.Jitsugi = { mount: mount };
  window.FP3 = FP3;
})();
