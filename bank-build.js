/* Turns the readable question bank (js/data/bank/*.js + my-questions.js) into the compact
   structure the page generators use (window.UC_D). Loaded right before question-bank.js. */
(function () {
  "use strict";
  var B = window.UC_BANK, co = B.companies, pk = B.packages;
  function at(list, slug) {
    for (var i = 0; i < list.length; i++) if (list[i].s === slug) return i;
    return -1;
  }
  var crs = {};
  Object.keys(B.courses).forEach(function (c) {
    var src = B.courses[c], topicIdx = {}, Q = [];
    src.topics.forEach(function (t, i) { topicIdx[t[0]] = i; });
    src.questions.forEach(function (q, n) {
      var t = topicIdx[q.topic];
      if (t === undefined) { console.warn("[bank] " + c + ": unknown topic \"" + q.topic + "\" in question:", q.q); return; }
      function ids(list, slugs, what) {
        var out = [];
        (slugs || []).forEach(function (s) {
          var i = at(list, s);
          if (i < 0) console.warn("[bank] " + c + ": unknown " + what + " \"" + s + "\"");
          else out.push(i);
        });
        return out;
      }
      var row = [t, q.level || "M", q.q, q.a || "", ids(co, q.companies, "company"), ids(pk, q.packages, "package")];
      row.heat = q.heat; /* optional override: "very" | "hot" | "none" */
      row.id = n; /* position in the bank = the id shown as #n in the bank files */
      Q.push(row);
    });
    crs[c] = {
      n: src.name,
      T: src.topics,
      Q: Q,
      PS: src.practiceSheets,
      PM: src.practiceTopics.map(function (row) { return row.map(function (s) { return topicIdx[s]; }); }),
    };
  });
  window.UC_D = { crs: crs, co: co, pk: pk };
})();
