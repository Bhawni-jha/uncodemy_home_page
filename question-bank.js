/* ===================== UC UPDATE: question bank, pagination, auth, nav buttons ===================== */
(function () {
  "use strict";
  var D = window.UC_D; /* built from js/data/bank/*.js by bank-build.js */
  var CO = D.co,
    PK = D.pk,
    CR = D.crs;
  var PER = 10;
  var FREE = 20; /* ← questions a guest can see on long lists; the rest is blurred until sign up / log in */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function hsh(s) {
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) {
      x ^= s.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return (x >>> 0) / 4294967296;
  }
  function svg(w, p, sw) {
    return (
      '<svg width="' + w + '" height="' + w +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>"
    );
  }
  var IC = {
    check: svg(18, '<path d="M20 6 9 17l-5-5"/>', 2.6),
    checkS: svg(15, '<path d="M20 6 9 17l-5-5"/>', 2.6),
    chev: svg(16, '<path d="m9 18 6-6-6-6"/>'),
    down: svg(16, '<path d="m6 9 6 6 6-6"/>'),
    table: svg(14, '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    wallet: svg(22, '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
    walletS: svg(14, '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
    back: svg(16, '<path d="m15 18-6-6 6-6"/>', 2),
    home: svg(16, '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', 2),
    x: svg(18, '<path d="M18 6 6 18M6 6l12 12"/>', 2),
  };

  function colo(i, size) {
    return '<span class="colo ' + size + '" data-co="' + CO[i].s + '" role="img" aria-label="' + esc(CO[i].n) + ' logo"></span>';
  }
  function crumbs(c, trail) {
    var base = "#/learn/" + c + "/",
      h = '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/learn/">Learn</a><span aria-hidden="true">›</span><a href="' + base + '">' + esc(CR[c].n) + "</a>";
    trail.forEach(function (t, i) {
      h += '<span aria-hidden="true">›</span>';
      h += i === trail.length - 1 ? '<span aria-current="page">' + esc(t[0]) + "</span>" : '<a href="' + t[1] + '">' + esc(t[0]) + "</a>";
    });
    return h + "</nav>";
  }
  var DN = { E: "Easy", M: "Medium", H: "Hard" };

  /* ----- Hot / Very Hot tags -----
     Score = how many companies + salary bands a question is tagged with (bands count double).
     The top HEAT_VERY share of a course's questions are "Very Hot", the next HEAT_HOT share are "Hot".
     Override any question in the bank with  heat: "very" | "hot" | "none". */
  var HEAT_VERY = 0.12, HEAT_HOT = 0.22;
  var FLAME = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
  var HT = {};
  function buildHeat(c) {
    var Q = CR[c].Q, n = Q.length, out = [];
    var rank = Q.map(function (q, i) { return [q[4].length + 2 * q[5].length + hsh(c + "h" + i) * 0.9, i]; }).sort(function (a, b) { return b[0] - a[0]; });
    var vh = Math.ceil(n * HEAT_VERY), ht = Math.ceil(n * HEAT_HOT);
    rank.forEach(function (r, k) { out[r[1]] = k < vh ? 2 : k < vh + ht ? 1 : 0; });
    Q.forEach(function (q, i) {
      if (q.heat === "very") out[i] = 2; else if (q.heat === "hot") out[i] = 1; else if (q.heat === "none") out[i] = 0;
    });
    HT[c] = out;
  }
  function heatLevel(c, i) { if (!HT[c]) buildHeat(c); return HT[c][i]; }
  function heatChip(c, i) {
    var l = heatLevel(c, i), Q = CR[c].Q[i];
    if (!l) return "";
    return '<span class="chip heat ' + (l === 2 ? "vhot" : "hot") + '" title="Asked in ' + Q[4].length + " companies across " + Q[5].length + ' salary bands">' + FLAME + (l === 2 ? " Very Hot" : " Hot") + "</span>";
  }
  function byHeat(c, idxs) {
    return idxs.map(function (i, k) { return [heatLevel(c, i), k, i]; })
      .sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; })
      .map(function (x) { return x[2]; });
  }
  function heatCount(c, idxs, lvl) {
    return idxs.filter(function (i) { return heatLevel(c, i) === lvl; }).length;
  }
  function heatStrip(c, idxs) {
    var v = heatCount(c, idxs, 2), h = heatCount(c, idxs, 1);
    if (!v && !h) return "";
    return '<div class="heat-strip"><span class="chip heat vhot">' + FLAME + " " + v + ' Very Hot</span><span class="chip heat hot">' + FLAME + " " + h +
      ' Hot</span><span class="hs-t">Most-asked questions come first — start with the Very Hot ones to prepare faster.</span></div>';
  }
  function coChip(c, x, mine) {
    return '<a class="chip' + (mine ? " mine" : "") + '" href="#/learn/' + c + "/interview-questions/" + CO[x].s + '/">' + colo(x, "sm") + " " + esc(CO[x].n) + "</a>";
  }
  function pkChip(c, x, mine) {
    return '<a class="chip' + (mine ? " mine" : "") + '" href="#/learn/' + c + "/interview-questions/" + PK[x].s + '/">' + esc(PK[x].l) + "</a>";
  }
  /* which tags a question shows depends on the list it is in:
       all list     -> heat, first 3 companies, first 2 salary bands
       company page -> heat, ONLY that company, first 2 salary bands
       package page -> heat, ONLY that LPA, then "Also asked at" the companies that asked it */
  function qChips(c, i, ctx) {
    var Q = CR[c].Q[i], co = Q[4], pk = Q[5], h = heatChip(c, i), t = ctx && ctx.t;
    if (t === "co") {
      h += coChip(c, ctx.j, true);
      pk.slice(0, 2).forEach(function (x) { h += pkChip(c, x); });
    } else if (t === "pk") {
      h += pkChip(c, ctx.j, true);
      if (co.length) {
        h += '<span class="q-also">Also asked at</span>';
        co.slice(0, 4).forEach(function (x) { h += coChip(c, x); });
        if (co.length > 4) h += '<span class="chip">+' + (co.length - 4) + " more</span>";
      }
    } else {
      co.slice(0, 3).forEach(function (x) { h += coChip(c, x); });
      if (co.length > 3) h += '<span class="chip">+' + (co.length - 3) + " more</span>";
      pk.slice(0, 2).forEach(function (x) { h += pkChip(c, x); });
    }
    return h + '<span class="chip ' + Q[1] + '">' + DN[Q[1]] + "</span>";
  }

  function qItem(c, i, n, ctx) {
    var Q = CR[c].Q[i],
      T = CR[c].T[Q[0]],
      base = "#/learn/" + c + "/",
      chips = "",
      co = Q[4],
      pk = Q[5];
    chips = qChips(c, i, ctx);
    return (
      '<article class="q" data-item id="q' + i + '"' + (n > PER ? " hidden" : "") + (n > FREE ? " data-locked" : "") + '><div class="q-top"><span class="q-num">' +
      (n < 10 ? "0" + n : n) + '</span><div class="q-txt"><h3>' + esc(Q[2]) + '</h3><div class="q-meta">' + chips +
      '</div></div><div class="q-actions" style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;position:relative"><button class="tick" data-k="q:' + c + ":" + i + '" aria-label="Mark as solved" title="Mark as solved">' + IC.check + '</button><details class="save-menu"><summary class="btn-line" style="padding:5px 10px;font-size:12px;cursor:pointer;list-style:none">Save to ▾</summary><div style="position:absolute;right:0;z-index:8;background:#fff;border:1px solid var(--line);border-radius:12px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:190px;margin-top:4px"><button type="button" class="save-opt" data-save="lm" data-qi="' + i + '" data-course="' + c + '" style="display:block;width:100%;text-align:left;padding:8px 12px;border-radius:8px;font-size:13px;background:none;border:0;cursor:pointer">Last-Minute Revision</button><button type="button" class="save-opt" data-save="jp" data-qi="' + i + '" data-course="' + c + '" style="display:block;width:100%;text-align:left;padding:8px 12px;border-radius:8px;font-size:13px;background:none;border:0;cursor:pointer">7-Day Job Prep</button></div></details></div></div><details class="ans"><summary>' + IC.down + " Show answer</summary><div class=\"a" +
      (/\n/.test(Q[3]) ? " mono" : "") + '">' + esc(Q[3]) + "</div></details></article>"
    );
  }
  function ctaHtml(n) {
    return '<div class="lock-cta" id="lockcta" hidden><span class="lc-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>' +
      '<div class="lc-t"><b>Sign up or log in to see all ' + n + ' questions</b><span class="muted">Guests can view the first ' + FREE + ' questions. Create a free account to unlock the rest.</span></div>' +
      '<div class="lc-b"><button type="button" class="btn-green" data-auth-tab="signup" data-auth-note="Sign up or log in to unlock all questions.">Sign up</button><button type="button" class="btn-line" data-auth-tab="login" data-auth-note="Sign up or log in to unlock all questions.">Log in</button></div></div>';
  }
  function lockCta(list) {
    var cta = document.getElementById("lockcta");
    if (!cta) return;
    var show = false;
    Array.prototype.forEach.call(list.children, function (it) { if (!it.hidden && it.hasAttribute("data-locked")) show = true; });
    cta.hidden = !show;
  }
  function listBlock(c, idxs, label, ctx) {
    idxs = byHeat(c, idxs);
    var h = heatStrip(c, idxs) +
      '<div class="card" data-scope="#qlist" style="margin-bottom:20px"><div class="between"><b style="font-weight:600">' + esc(label) +
      '</b><span class="muted" data-pt>0 / 0</span></div><div class="progress mt12"><i></i></div></div>' + (idxs.length > FREE ? ctaHtml(idxs.length) : "") + '<div class="qlist" id="qlist">';
    idxs.forEach(function (i, k) {
      h += qItem(c, i, k + 1, ctx);
    });
    return h + '</div><nav class="pager" data-pager data-list="qlist" data-per="' + PER + '" aria-label="Pagination"></nav>';
  }
  function idxFor(c, kind, j) {
    var out = [];
    CR[c].Q.forEach(function (q, i) {
      if (q[kind === "co" ? 4 : 5].indexOf(j) > -1) out.push(i);
    });
    return out;
  }
  function all(c) {
    return CR[c].Q.map(function (_, i) {
      return i;
    });
  }

  /* ----- page generators ----- */
  function pgInterview(c) {
    var n = CR[c].Q.length,
      nm = CR[c].n;
    return [
      nm + " Interview Questions & Answers (2026)", c, "interview-questions", "interview-questions",
      crumbs(c, [["Interview Questions"]]) +
        '<div class="page-head"><div><h1 class="h1">' + esc(nm) + " Interview Questions &amp; Answers (2026)</h1><p class=sub>" + n + " " +
        esc(nm.toLowerCase()) + " interview questions with answers — tagged by company, salary package, topic and difficulty. 10 questions per page; tick the ones you have solved to track progress.</p></div></div>\n" +
        listBlock(c, all(c), "Questions solved", { t: "all" }),
    ];
  }
  function hubHot(c, idxs) {
    var v = heatCount(c, idxs, 2);
    return v ? '<span class="chip heat vhot">' + FLAME + " " + v + " Very Hot</span>" : "";
  }
  function pgCompanyHub(c) {
    var nm = CR[c].n,
      h = "";
    CO.forEach(function (co, j) {
      h +=
        '<a class="card" href="#/learn/' + c + "/interview-questions/" + co.s + '/" style="display:flex;flex-direction:column;gap:10px"><div class="between">' +
        colo(j, "xl") + '<span class="hub-chips">' + hubHot(c, idxFor(c, "co", j)) + '<span class="chip">' + idxFor(c, "co", j).length + ' questions</span></span></div><h2 style="font-size:17px;font-weight:600">' +
        esc(co.n) + " " + esc(nm) + ' Interview Questions</h2><span class="open-link">View questions ' + IC.chev + "</span></a>";
    });
    return [
      "Company-Wise " + nm + " Interview Questions (2026)", c, "company-wise", "company-wise",
      crumbs(c, [["Interview Questions", "#/learn/" + c + "/interview-questions/"], ["Company-wise"]]) +
        '<div class="page-head"><div><h1 class="h1">Company-Wise ' + esc(nm) + " Interview Questions</h1><p class=sub>" + esc(nm) +
        " interview questions grouped by company — with answers for each company.</p></div></div>\n" +
        '<div class="rgrid">' + h + "</div>",
    ];
  }
  function pgCompany(c, j) {
    var co = CO[j],
      nm = CR[c].n,
      idx = idxFor(c, "co", j);
    return [
      co.n + " " + nm + " Interview Questions & Answers (2026)", c, "company", "company-wise",
      crumbs(c, [["Interview Questions", "#/learn/" + c + "/interview-questions/"], ["Company-wise", "#/learn/" + c + "/interview-questions/company-wise/"], [co.n]]) +
        '<div class="page-head"><div class="ph-co">' + colo(j, "xxl") + '<div><h1 class="h1">' + esc(co.n) + " " + esc(nm) +
        " Interview Questions &amp; Answers</h1><p class=sub>" + idx.length + " " + esc(nm.toLowerCase()) + " questions of the kind asked in " + esc(co.n) +
        " interviews, with answers.</p></div></div></div>\n" +
        listBlock(c, idx, "Solved for " + co.n, { t: "co", j: j }),
    ];
  }
  function pgPackageHub(c) {
    var nm = CR[c].n,
      h = "";
    PK.forEach(function (p, j) {
      h +=
        '<a class="card pk-card" href="#/learn/' + c + "/interview-questions/" + p.s + '/" style="display:flex;flex-direction:column;gap:10px"><div class="between"><span class="pk-ic">' +
        IC.wallet + '</span><span class="hub-chips">' + hubHot(c, idxFor(c, "pk", j)) + '<span class="chip">' + idxFor(c, "pk", j).length + ' questions</span></span></div><b class="pk-amt">' + esc(p.l) +
        '</b><h2 style="font-size:15px;font-weight:600">' + esc(nm) + " interview questions for " + esc(p.t) +
        '</h2><span class="muted" style="font-size:13.5px">' + esc(p.d) + '</span><span class="open-link">View questions ' + IC.chev + "</span></a>";
    });
    return [
      nm + " Interview Questions by Salary Package", c, "package-wise", "package-wise",
      crumbs(c, [["Interview Questions", "#/learn/" + c + "/interview-questions/"], ["Package-wise"]]) +
        '<div class="page-head"><div><h1 class="h1">' + esc(nm) + " Interview Questions by Salary Package</h1><p class=sub>Prepare for the salary band you are targeting — 12 bands from ₹3 LPA to ₹50+ LPA, each with 50+ questions and what interviewers expect.</p></div></div>\n" +
        '<div class="rgrid">' + h + "</div>",
    ];
  }
  function pgPackage(c, j) {
    var p = PK[j],
      nm = CR[c].n,
      idx = idxFor(c, "pk", j),
      ex = "";
    p.x.forEach(function (t) {
      ex += '<span class="chip">' + IC.walletS + " " + esc(t) + "</span>";
    });
    return [
      nm + " Interview Questions for " + p.t + " (" + p.l + ")", c, "package", "package-wise",
      crumbs(c, [["Interview Questions", "#/learn/" + c + "/interview-questions/"], ["Package-wise", "#/learn/" + c + "/interview-questions/package-wise/"], [p.l]]) +
        '<div class="page-head"><div><h1 class="h1">' + esc(nm) + " Interview Questions for " + esc(p.t) + " (" + esc(p.l) + ")</h1><p class=sub>" + idx.length +
        " questions for " + esc(p.d.charAt(0).toLowerCase() + p.d.slice(1)) + ".</p></div></div>\n" +
        '<div class="card" style="margin-bottom:20px"><h2 class="card-title">What ' + esc(p.l) + ' interviews expect</h2><div class="topics">' + ex + "</div></div>\n" +
        listBlock(c, idx, "Solved in this band", { t: "pk", j: j }),
    ];
  }

  /* practice sheets: every topic carries 11–15 real questions */
  var STOP = { and: 1, the: 1, for: 1, basics: 1, with: 1, project: 1, capstone: 1 };
  function words(t) {
    return t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(function (w) {
      return w.length >= 3 && !STOP[w];
    });
  }
  var DO = { E: 0, M: 1, H: 2 };
  function practicePick(c) {
    var cr = CR[c], used = {}, out = [];
    cr.PS.forEach(function (sh, si) {
      var allowed = cr.PM[si], row = [];
      sh[2].forEach(function (tp, ti) {
        var n = 11 + Math.floor(hsh(c + si + "-" + ti) * 5), ws = words(tp[0]);
        var sc = cr.Q.map(function (q, i) {
          var tx = (q[2] + " " + q[3]).toLowerCase(), ql = q[2].toLowerCase(), s = 0;
          ws.forEach(function (w) {
            var st = w.slice(0, Math.max(4, w.length - 2));
            if (tx.indexOf(st) > -1) s += 2;
            if (ql.indexOf(st) > -1) s += 2;
          });
          if (allowed.indexOf(q[0]) > -1) s += 3;
          s -= (used[i] || 0) * 1.4;
          s += hsh(c + i + tp[0]) * 1.5;
          return [s, i];
        });
        sc.sort(function (a, b) { return b[0] - a[0]; });
        var pick = sc.slice(0, n).map(function (x) { return x[1]; });
        pick.forEach(function (i) { used[i] = (used[i] || 0) + 1; });
        pick.sort(function (a, b) { return DO[cr.Q[a][1]] - DO[cr.Q[b][1]] || a - b; });
        row.push(pick);
      });
      out.push(row);
    });
    return out;
  }
  function pgPractice(c) {
    var nm = CR[c].n, cr = CR[c], pick = practicePick(c), h = "";
    cr.PS.forEach(function (sh, si) {
      var topics = "";
      sh[2].forEach(function (tp, ti) {
        var ids = pick[si][ti], lis = "";
        ids.forEach(function (i) {
          var Q = cr.Q[i];
          lis += "<li><span>" + esc(Q[2]) + "</span><details><summary>Show answer</summary><div>" + esc(Q[3]) + "</div></details></li>";
        });
        topics +=
          '<div class="sitem pq" data-item><button class="tick sm" data-k="prac:' + c + ":" + si + ":" + ti + '" aria-label="Mark done">' + IC.checkS +
          '</button><span class="st">Practise: ' + esc(tp[0]) + ' <span class="muted">· ' + ids.length + ' questions</span></span><span class="chip ' + tp[1] + '">' +
          DN[tp[1]] + '</span><button class="pq-toggle" data-pq aria-expanded="false">View questions</button><ol class="pq-list" hidden>' + lis + "</ol></div>";
      });
      h +=
        '<details class="ps-card card" id="sheet-' + (si + 1) + '" data-scope="#sheet-' + (si + 1) + '">' +
        '<summary class="ps-sum" style="cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 0">' +
        '<div class="row" style="gap:14px"><span class="rnum" style="width:46px;height:46px;font-size:17px;border-radius:14px">' +
        (si + 1) + '</span><div><h2 style="font-weight:600;font-size:16px">' + esc(sh[0]) + '</h2><div class="muted" style="font-size:13px">' + esc(sh[1]) +
        ' · ' + sh[2].length + ' topics</div></div></div>' +
        '<span class="muted" style="font-size:13px">Click to open topics ▾</span></summary>' +
        '<div class="sheet-items" style="margin-top:14px">' + topics + "</div></details>";
    });
    return [
      nm + " Practice Questions: Roadmap-Wise Sheets", c, "practice-sheets", "practice-sheets",
      crumbs(c, [["Practice Sheets"]]) +
        '<div class="page-head"><div><h1 class="h1">' + esc(nm) + " Practice Questions: Roadmap-Wise Sheets</h1><p class=sub>One practice sheet for every step of the " + esc(nm) +
        " roadmap. Click a sheet card to open its topics, then practise the questions.</p></div></div>\n" +
        '<div class="stack">' + h + "</div>",
    ];
  }

  window.UCgen = function (P) {
    Object.keys(P).forEach(function (k) {
      if (/\/interview-questions\/(freshers-3-6-lpa|experienced-6-12-lpa|12-lpa-plus)\/$/.test(k)) delete P[k];
    });
    Object.keys(CR).forEach(function (c) {
      var b = "/learn/" + c + "/";
      P[b + "interview-questions/"] = pgInterview(c);
      P[b + "interview-questions/company-wise/"] = pgCompanyHub(c);
      CO.forEach(function (co, j) { P[b + "interview-questions/" + co.s + "/"] = pgCompany(c, j); });
      P[b + "interview-questions/package-wise/"] = pgPackageHub(c);
      PK.forEach(function (p, j) { P[b + "interview-questions/" + p.s + "/"] = pgPackage(c, j); });
      P[b + "practice-sheets/"] = pgPractice(c);
    });
  };

  /* ----- pagination ----- */
  function pageWindow(cur, tot) {
    var s = {}, out = [];
    [1, tot, cur - 1, cur, cur + 1].forEach(function (p) { if (p >= 1 && p <= tot) s[p] = 1; });
    var ks = Object.keys(s).map(Number).sort(function (a, b) { return a - b; });
    ks.forEach(function (p, i) {
      if (i && p - ks[i - 1] > 1) out.push(0);
      out.push(p);
    });
    return out;
  }
  function pagerDraw(nav, cur) {
    var list = document.getElementById(nav.getAttribute("data-list")),
      per = +nav.getAttribute("data-per") || PER;
    if (!list) return;
    var items = Array.prototype.slice.call(list.children),
      tot = Math.max(1, Math.ceil(items.length / per));
    cur = Math.min(Math.max(1, cur), tot);
    nav.setAttribute("data-page", cur);
    items.forEach(function (it, i) {
      it.hidden = Math.floor(i / per) + 1 !== cur;
    });
    lockCta(list);
    if (tot < 2) { nav.innerHTML = ""; return; }
    var a = (cur - 1) * per + 1, b = Math.min(items.length, cur * per);
    var h = '<div class="pg-info">Showing ' + a + "–" + b + " of " + items.length + " questions</div>";
    h += '<button type="button" data-pg="' + (cur - 1) + '"' + (cur === 1 ? " disabled" : "") + ' aria-label="Previous page">‹ Prev</button>';
    pageWindow(cur, tot).forEach(function (p) {
      h += p ? '<button type="button" data-pg="' + p + '"' + (p === cur ? ' class="on" aria-current="page"' : "") + ' aria-label="Page ' + p + '">' + p + "</button>" : '<span class="gap">…</span>';
    });
    h += '<button type="button" data-pg="' + (cur + 1) + '"' + (cur === tot ? " disabled" : "") + ' aria-label="Next page">Next ›</button>';
    nav.innerHTML = h;
  }
  function pagerInit() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-pager]"), function (n) { pagerDraw(n, 1); });
  }

  /* ----- auth (front-end demo, stored in this browser only) ----- */
  var UK = "uc_users", SK = "uc_session";
  function jget(k, d) { try { return JSON.parse(localStorage.getItem(k) || "null") || d; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function digest(s) {
    try {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode("uc|" + s)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
      });
    } catch (e) { return Promise.resolve(btoa("uc|" + s)); }
  }
  function paintAuth() {
    var s = jget(SK, null);
    document.body.classList.toggle("is-auth", !!s);
    Array.prototype.forEach.call(document.querySelectorAll("[data-locked]"), function (el) { el.inert = !s; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-auth]"), function (b) {
      b.innerHTML = "<span>" + (s ? "Hi, " + esc(String(s.name || "there").split(" ")[0]) : 'Sign up<span class="hide-xs"> / Log in</span>') + "</span>";
      b.setAttribute("aria-label", s ? "Account" : "Sign up or log in");
    });
  }
  function openBox(html) {
    var m = document.getElementById("modal"), b = document.getElementById("mbox");
    if (!m || !b) return;
    b.className = "box";
    b.innerHTML = '<button class="x" data-close aria-label="Close">' + IC.x + "</button>" + html;
    m.classList.add("is-open");
  }
  var AN = ""; /* optional message shown at the top of the sign-up box */
  function authBox(tab, note) {
    if (note !== undefined) AN = note;
    var su = tab === "signup";
    openBox(
      '<h2 style="font-size:20px;font-weight:600;padding-right:40px">Welcome to UnCodemy Learn</h2><p class="muted" style="font-size:14px">' + esc(AN || "Save your progress and reminders to your account.") + '</p>' +
        '<div class="auth-tabs" role="tablist"><button type="button" data-auth-tab="login" class="' + (su ? "" : "on") + '">Log in</button><button type="button" data-auth-tab="signup" class="' + (su ? "on" : "") + '">Sign up</button></div>' +
        '<form class="auth-f" data-auth-form="' + tab + '" novalidate>' +
        (su ? '<label for="au-n">Full name</label><input id="au-n" name="name" autocomplete="name" placeholder="Your name">' : "") +
        '<label for="au-e">Email</label><input id="au-e" name="email" type="email" autocomplete="email" placeholder="you@example.com">' +
        '<label for="au-p">Password</label><input id="au-p" name="password" type="password" autocomplete="' + (su ? "new-password" : "current-password") + '" placeholder="At least 6 characters">' +
        '<div class="auth-err" role="alert"></div><button class="btn-green" type="submit">' + (su ? "Create account" : "Log in") + "</button></form>"
    );
    var f = document.querySelector("#mbox input");
    if (f) f.focus();
  }
  function accountBox(s) {
    openBox(
      '<h2 style="font-size:20px;font-weight:600;padding-right:40px">Hi, ' + esc(s.name) + '</h2><p class="muted" style="font-size:14px">' + esc(s.email) +
        '</p><div class="row mt20" style="gap:10px"><button class="btn-line" data-close>Close</button><button class="btn-green" data-logout type="button">Log out</button></div>'
    );
  }
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest("[data-auth-form]");
    if (!f) return;
    e.preventDefault();
    var su = f.getAttribute("data-auth-form") === "signup",
      name = su ? f.name.value.trim() : "",
      email = f.email.value.trim().toLowerCase(),
      pw = f.password.value,
      err = f.querySelector(".auth-err");
    if (su && name.length < 2) return (err.textContent = "Please enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return (err.textContent = "Enter a valid email address.");
    if (pw.length < 6) return (err.textContent = "Password must be at least 6 characters.");
    digest(email + pw).then(function (hx) {
      var users = jget(UK, {});
      if (su) {
        if (users[email]) return (err.textContent = "This email is already registered. Please log in.");
        users[email] = { name: name, h: hx };
        jset(UK, users);
      } else if (!users[email] || users[email].h !== hx) {
        return (err.textContent = "Email or password is incorrect.");
      }
      jset(SK, { name: users[email].name, email: email });
      document.getElementById("modal").classList.remove("is-open");
      AN = "";
      paintAuth();
      window.dispatchEvent(new Event("uc-auth-change"));
      window.UCtoast && window.UCtoast(su ? "Account created — welcome, " + users[email].name.split(" ")[0] + "!" : "Logged in successfully");
    });
  });

  /* ----- clicks: auth, pager, practice toggles, back/home ----- */
  window.UCnavCount = 0;
  function parentHref() {
    var a = document.querySelectorAll("#main .crumbs a");
    return a.length ? a[a.length - 1].getAttribute("href") : "#/learn/";
  }
  function goTo(u) {
    window.UCH = u;
    try { history.pushState(null, "", u); } catch (_) { try { location.hash = u; } catch (__) {} }
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  document.addEventListener("click", function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    var a = t.closest('a[href^="#/learn/"]');
    if (a && !e.defaultPrevented && !e.button && !e.metaKey && !e.ctrlKey && !e.shiftKey && !a.hasAttribute("download") && a.target !== "_blank") window.UCnavCount++;
    if ((el = t.closest("[data-auth]"))) {
      e.preventDefault();
      var s = jget(SK, null);
      return s ? accountBox(s) : authBox("login", "");
    }
    if ((el = t.closest("[data-auth-tab]"))) return authBox(el.getAttribute("data-auth-tab"), el.closest("#mbox") ? undefined : (el.getAttribute("data-auth-note") || ""));
    if (t.closest("[data-logout]")) {
      try { localStorage.removeItem(SK); } catch (_) {}
      document.getElementById("modal").classList.remove("is-open");
      paintAuth();
      window.dispatchEvent(new Event("uc-auth-change"));
      return window.UCtoast && window.UCtoast("You have been logged out");
    }
    if ((el = t.closest("[data-pg]"))) {
      var nav = el.closest("[data-pager]");
      if (!nav || el.disabled) return;
      pagerDraw(nav, +el.getAttribute("data-pg"));
      var list = document.getElementById(nav.getAttribute("data-list"));
      if (list) window.scrollTo({ top: Math.max(0, list.getBoundingClientRect().top + window.pageYOffset - 100), behavior: "smooth" });
      return;
    }
    if ((el = t.closest("[data-pq]"))) {
      var ol = el.parentNode.querySelector(".pq-list"), open = ol.hidden;
      ol.hidden = !open;
      el.setAttribute("aria-expanded", open ? "true" : "false");
      el.textContent = open ? "Hide questions" : "View questions";
      return;
    }
    if ((el = t.closest("[data-pn='back']"))) {
      e.preventDefault();
      if (window.UCnavCount > 0 && history.length > 1) history.back();
      else goTo(parentHref());
    }
  }, true);

  /* back / home buttons, injected after every render */
  window.UCnavbar = function (app, pg) {
    var main = app.querySelector("#main");
    if (!main || pg[2] === "hub" || main.querySelector(".pg-nav")) return;
    var d = document.createElement("div");
    d.className = "pg-nav";
    d.innerHTML =
      '<button type="button" class="pn-btn" data-pn="back" aria-label="Go to previous page">' + IC.back + ' Back</button>' +
      '<a class="pn-btn home" href="#/learn/" aria-label="Back to home">' + IC.home + " Back to home</a>";
    main.insertBefore(d, main.firstChild);
  };

  window.addEventListener("popstate", function () {
    if (window.UCnavCount > 0) window.UCnavCount--;
  });

  var prev = window.UCpageInit;
  window.UCpageInit = function () {
    if (prev) prev.apply(this, arguments);
    pagerInit();
    paintAuth();
  };
  /* used by saved.js */
  window.UCauth = {
    isIn: function () { return !!jget(SK, null); },
    open: function (note) { authBox("signup", note || ""); },
  };
})();
