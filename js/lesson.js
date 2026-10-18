/* =====================================================================
 * lesson.js — 単元（レッスン）ページ共通処理
 *
 * 役割:
 *  - <body data-unit="life-1"> から現在の単元を特定
 *  - パンくず（分野名 → 単元名）を自動表示
 *  - ページを開いた時点で「続きから」位置を記録し、習熟度を最低「学習中」に
 *  - フッターに「前/次の単元」ナビと「この単元をマスターにする」ボタンを描画
 *
 * 使い方（単元ページ）:
 *   <body data-nav="learn" data-unit="life-1"
 *         data-title="1. FPの基本" data-back="chapters/index.html">
 *     <div id="appHeader"></div>
 *     <div id="lessonTop"></div>     ← パンくず（任意）
 *     ...本文...
 *     <div id="lessonFooter"></div>  ← 前後ナビ＋マスターボタン
 *     <nav id="appNav"></nav>
 *
 * 依存: curriculum.js, app.js（window.FP3）
 * ===================================================================== */
(function () {
  'use strict';

  function boot() {
    var FP3 = window.FP3;
    if (!FP3 || !window.CURRICULUM) return;

    var unitId = document.body.getAttribute('data-unit');
    if (!unitId) return;

    var unit = window.CURRICULUM.unitById(unitId);
    if (!unit) return;
    var field = window.CURRICULUM.fieldByKey(unit.fieldKey);
    var units = window.CURRICULUM.unitsOf(unit.fieldKey);
    var idx = units.findIndex(function (u) { return u.id === unitId; });
    var prev = idx > 0 ? units[idx - 1] : null;
    var next = idx < units.length - 1 ? units[idx + 1] : null;

    /* 続きから位置を記録＋最低「学習中」に引き上げ */
    FP3.Store.setLast(unit);
    FP3.Store.setMastery(unitId, 'learning');

    /* パンくず */
    var top = document.getElementById('lessonTop');
    if (top) {
      top.className = 'lesson-top';
      top.innerHTML =
        '<div class="crumbs">' +
          '<a href="' + FP3.root('chapters/index.html') + '#' + field.key + '">' + field.emoji + ' ' + field.no + '. ' + field.title + '</a>' +
          '<span class="crumbs__sep">›</span>' +
          '<span>' + unit.no + '. ' + unit.title + '</span>' +
        '</div>' +
        '<div class="lesson-progress" id="lessonMastery"></div>';
      renderMasteryChip();
    }

    /* フッターナビ */
    var footer = document.getElementById('lessonFooter');
    if (footer) {
      footer.className = 'lesson-footer';
      footer.innerHTML =
        '<button id="masterBtn" class="btn btn--primary">✓ この単元をマスターにする</button>' +
        '<div class="lesson-nav">' +
          (prev
            ? '<a class="lesson-nav__btn" href="' + FP3.root(prev.href || 'chapters/index.html') + '">← ' + prev.no + '. ' + shorten(prev.title) + '</a>'
            : '<span class="lesson-nav__btn is-disabled">← 最初の単元</span>') +
          (next
            ? '<a class="lesson-nav__btn lesson-nav__btn--next" href="' + FP3.root(next.href || 'chapters/index.html') + '">' + next.no + '. ' + shorten(next.title) + ' →</a>'
            : '<a class="lesson-nav__btn lesson-nav__btn--next" href="' + FP3.root('chapters/index.html') + '#' + field.key + '">分野一覧へ →</a>') +
        '</div>';

      var mb = document.getElementById('masterBtn');
      if (mb) {
        syncMasterBtn();
        mb.addEventListener('click', function () {
          FP3.Store.setMastery(unitId, 'mastered');
          FP3.Toast.show('🎉 「' + unit.title + '」をマスターにしました！');
          syncMasterBtn();
          renderMasteryChip();
        });
      }
    }

    function syncMasterBtn() {
      var mb = document.getElementById('masterBtn');
      if (!mb) return;
      if (FP3.Store.getMastery(unitId) === 'mastered') {
        mb.textContent = '★ マスター済み';
        mb.classList.remove('btn--primary');
        mb.classList.add('btn--outline');
      } else {
        mb.textContent = '✓ この単元をマスターにする';
        mb.classList.add('btn--primary');
        mb.classList.remove('btn--outline');
      }
    }

    function renderMasteryChip() {
      var host = document.getElementById('lessonMastery');
      if (!host) return;
      var lvl = FP3.Store.getMastery(unitId);
      host.innerHTML = '<span class="badge ' +
        (lvl === 'mastered' ? 'badge--info' : 'badge--warn') + '">' +
        FP3.MASTERY[lvl].label + '</span>';
    }
  }

  function shorten(s) { return s.length > 10 ? s.slice(0, 9) + '…' : s; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
