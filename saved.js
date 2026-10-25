/* "Save to" system: questions a visitor adds with  Save to ▾  appear on that course's
   Last-Minute Revision / 7-Day Job Prep page — and nothing else does.
   Limits: guests can add GUEST_MAX questions per page; logged-in users up to MAX[page].
   Saved in this browser's localStorage under  save:lm:<course>  and  save:jp:<course>. */
(function () {
  "use strict";
  var GUEST_MAX = 5;                 /* ← questions a guest may add (per page, per course) */
  var MAX = { lm: 20, jp: 100 };     /* ← limit after sign up / log in */
  var NAME = { lm: "Last-Minute Revision", jp: "7-Day Job Prep" };
  var DN = { E: "Easy", M: "Medium", H: "Hard" };
  var D = window.UC_D;
  var CHECK15 = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var CHECK14 = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var MARK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function toast(m) { window.UCtoast && window.UCtoast(m); }
  function loggedIn() { return !!(window.UCauth && window.UCauth.isIn()); }
  function limitFor(kind) { return loggedIn() ? MAX[kind] : GUEST_MAX; }
  function skey(kind, c) { return "save:" + kind + ":" + c; }
  function get(kind, c) {
    try { var l = JSON.parse(localStorage.getItem(skey(kind, c)) || "[]"); return Array.isArray(l) ? l.map(String) : []; } catch (e) { return []; }
  }
  function put(kind, c, l) { try { localStorage.setItem(skey(kind, c), JSON.stringify(l)); } catch (e) {} }

  /* ---------- add / remove ---------- */
  function toggle(kind, c, qi) {
    qi = String(qi);
    var list = get(kind, c), at = list.indexOf(qi);
    if (at >= 0) {
      list.splice(at, 1); put(kind, c, list);
      toast("Removed from " + NAME[kind]);
    } else {
      var lim = limitFor(kind);
      if (list.length >= lim) {
        if (!loggedIn()) window.UCauth && window.UCauth.open("You can add up to " + GUEST_MAX + " questions to " + NAME[kind] + " without an account. Sign up or log in to add more (up to " + MAX[kind] + ").");
        else toast("Limit reached — " + MAX[kind] + " questions max in " + NAME[kind]);
        return false;
      }
      list.push(qi); put(kind, c, list);
      toast("Added to " + NAME[kind] + " (" + list.length + "/" + lim + ")");
    }
    refresh();
    return true;
  }

  /* ---------- page rendering ---------- */
  function chips(c, qi) {
    var Q = D.crs[c].Q[qi];
    return '<div class="plan-chips"><span class="chip">' + esc(D.crs[c].T[Q[0]][1]) + '</span><span class="chip ' + Q[1] + '">' + DN[Q[1]] + "</span></div>";
  }
  function rmBtn(kind, c, qi) {
    return '<button type="button" class="saved-rm" data-saved-rm data-kind="' + kind + '" data-course="' + c + '" data-qi="' + qi + '" aria-label="Remove this question">Remove</button>';
  }
  function html(kind, c) {
    var ids = get(kind, c).filter(function (i) { return D.crs[c].Q[i]; });
    if (!ids.length) {
      return '<div class="card saved-empty"><div class="se-ic">' + MARK + "</div><h2>No questions added yet</h2>" +
        '<p class="muted">Open any question in the interview-questions lists and choose <b>Save to ▾ → ' + NAME[kind] + "</b>. Only the questions you add will show on this page.</p>" +
        '<p class="muted se-small">Without an account you can add up to ' + GUEST_MAX + " questions. Sign up or log in to add more.</p>" +
        '<a class="btn-green" href="#/learn/' + c + '/interview-questions/">Browse questions</a></div>';
    }
    var lim = limitFor(kind);
    var h = '<div class="card" data-scope="#saved-list" style="margin-bottom:16px"><div class="between"><b style="font-weight:600">' + (kind === "lm" ? "Revised" : "Completed") +
      '</b><span class="muted" data-pt>0 / 0</span></div><div class="progress mt12"><i></i></div></div>' +
      '<div class="saved-bar"><span class="muted">' + ids.length + " added · limit " + lim + (loggedIn() ? "" : " (sign up or log in to add more)") +
      '</span><button type="button" class="saved-rm" data-saved-clear data-kind="' + kind + '" data-course="' + c + '">Remove all</button></div>' +
      '<div id="saved-list" class="' + (kind === "lm" ? "revgrid" : "saved-stack") + '">';
    ids.forEach(function (qi, n) {
      var Q = D.crs[c].Q[qi];
      if (kind === "lm") {
        h += '<div class="card rev" data-item><span class="n">#' + (n < 9 ? "0" : "") + (n + 1) + "</span><h3>" + esc(Q[2]) + "</h3>" + chips(c, qi) +
          ' <details><summary>Show answer</summary><p>' + esc(Q[3]) + '</p></details> <div class="saved-act"><button class="btn-line" data-k="rev:' + c + ":q" + qi +
          '" data-on="Revised" data-off="Got it">' + CHECK15 + ' <span data-lbl>Got it</span></button>' + rmBtn(kind, c, qi) + "</div></div>";
      } else {
        h += '<div class="sitem plan-q" data-item><button class="tick sm" data-k="job:' + c + ":q" + qi + '" aria-label="Mark done">' + CHECK14 +
          '</button><div class="st"><span class="pq-t">' + esc(Q[2]) + "</span>" + chips(c, qi) + '<details><summary>Show answer</summary><div class="pq-a">' + esc(Q[3]) +
          "</div></details></div>" + rmBtn(kind, c, qi) + "</div>";
      }
    });
    return h + "</div>";
  }
  function render() {
    var root = document.getElementById("saved-root");
    if (!root) return false;
    root.innerHTML = html(root.getAttribute("data-kind"), root.getAttribute("data-course"));
    return true;
  }

  /* "Save to ▾" menu shows what is already saved */
  function paintMenus() {
    Array.prototype.forEach.call(document.querySelectorAll(".save-menu"), function (det) {
      var any = false;
      Array.prototype.forEach.call(det.querySelectorAll(".save-opt"), function (b) {
        if (!b.getAttribute("data-label")) b.setAttribute("data-label", b.textContent);
        var on = get(b.getAttribute("data-save"), b.getAttribute("data-course")).indexOf(String(b.getAttribute("data-qi"))) >= 0;
        b.textContent = on ? "✓ " + b.getAttribute("data-label") + " · remove" : b.getAttribute("data-label");
        b.classList.toggle("on", on);
        any = any || on;
      });
      var sum = det.querySelector("summary");
      if (sum) sum.textContent = any ? "Saved ✓ ▾" : "Save to ▾";
    });
  }
  var chain = window.UCpageInit;
  function refresh() {
    if (render() && chain) chain(); /* repaint ticks + progress bars */
    paintMenus();
  }
  window.UCpageInit = function () {
    render();
    if (chain) chain.apply(this, arguments);
    paintMenus();
  };
  window.addEventListener("uc-auth-change", refresh);

  /* ---------- clicks ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    if ((el = t.closest(".save-opt"))) {
      e.preventDefault(); e.stopPropagation();
      toggle(el.getAttribute("data-save"), el.getAttribute("data-course"), el.getAttribute("data-qi"));
      var det = el.closest("details");
      if (det) det.removeAttribute("open");
    } else if ((el = t.closest("[data-saved-rm]"))) {
      e.preventDefault();
      toggle(el.getAttribute("data-kind"), el.getAttribute("data-course"), el.getAttribute("data-qi"));
    } else if ((el = t.closest("[data-saved-clear]"))) {
      e.preventDefault();
      var k = el.getAttribute("data-kind"), c = el.getAttribute("data-course");
      if (window.confirm("Remove all questions from " + NAME[k] + "?")) { put(k, c, []); toast("All questions removed"); refresh(); }
    }
  });

  /* ---------- page shells (title, breadcrumb, empty container) ---------- */
  function shell(kind, c, name) {
    var lm = kind === "lm", h1 = lm ? name + " Last-Minute Revision" : "7-Day " + name + " Interview Preparation Plan";
    var sub = lm ? "Quickly revise the questions you picked. Add questions from the interview-questions lists with Save to → Last-Minute Revision."
                 : "Your own 7-day question plan. Add questions from the interview-questions lists with Save to → 7-Day Job Prep.";
    var crumb = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/learn/">Learn</a><span aria-hidden="true">›</span><a href="#/learn/' + c + '/">' + esc(name) +
      '</a><span aria-hidden="true">›</span><span aria-current="page">' + (lm ? "Last-Minute Revision" : "7-Day Job Prep") + "</span></nav>";
    return [h1 + " | Uncodemy", c, lm ? "revision" : "jobprep", lm ? "last-minute-revision" : "7-day-interview-preparation-plan",
      crumb + '<div class="page-head"><div><h1 class="h1">' + esc(h1) + "</h1><p class=sub>" + esc(sub) + '</p></div></div> <div id="saved-root" data-kind="' + kind + '" data-course="' + c + '"></div>'];
  }
  var prevGen = window.UCgen;
  window.UCgen = function (P) {
    prevGen(P);
    Object.keys(D.crs).forEach(function (c) {
      var b = "/learn/" + c + "/", name = D.crs[c].n;
      P[b + "last-minute-revision/"] = shell("lm", c, name);
      P[b + "7-day-interview-preparation-plan/"] = shell("jp", c, name);
    });
  };
  window.UCsaved = { toggle: toggle, get: get, html: html, limitFor: limitFor };
})();
