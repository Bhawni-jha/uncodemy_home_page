/* Hash router: renders header + sidebar + page + footer into #app. Loaded LAST. */
(function () {
          var P = window.UC_P, H = window.UC_H, SB = window.UC_SB, FOOT = window.UC_FOOT, CSV = window.UC_CSV,
          B = document.body,
          app = document.getElementById("app");
        window.UCgen(P);
        function render() {
          var h = (window.UCH || location.hash).slice(1);
          if (h.indexOf("/learn/") !== 0) {
            if (app.innerHTML) return;
            h = "/learn/";
          }
          var anchor = "",
            i = h.indexOf("#");
          if (i >= 0) {
            anchor = h.slice(i + 1);
            h = h.slice(0, i);
          }
          h = h.split("?")[0];
          var pg = P[h] || P["/learn/"];
          document.getElementById("modal").classList.remove("is-open");
          document.title = pg[0];
          B.setAttribute("data-course", pg[1]);
          B.setAttribute("data-page", pg[2]);
          B.classList.remove("side-open");
          app.innerHTML =
            H[pg[1]] +
            (pg[1]
              ? '<div class="shell">' +
                SB[pg[1]] +
                '<main id="main">' +
                pg[4] +
                "</main></div>"
              : '<main id="main" class="wrap">' + pg[4] + "</main>") +
            FOOT;
          if (pg[3]) {
            var n = app.querySelector('.nav[data-key="' + pg[3] + '"]');
            if (n) {
              n.classList.add("on");
              n.setAttribute("aria-current", "page");
            }
          }
          window.UCnavbar(app, pg);
          window.UCpageInit();
          var el = anchor && document.getElementById(anchor);
          if (el) el.scrollIntoView();
          else window.scrollTo(0, 0);
        }
        document.addEventListener(
          "click",
          function (e) {
            var a = e.target.closest("a[download]");
            if (!a) return;
            var k = a.getAttribute("href").replace(/^#/, "");
            if (!CSV[k]) return;
            e.preventDefault();
            e.stopPropagation();
            var l = document.createElement("a");
            l.href = URL.createObjectURL(
              new Blob(["﻿" + CSV[k]], { type: "text/csv" }),
            );
            l.download = k.split("/").pop();
            document.body.appendChild(l);
            l.click();
            setTimeout(function () {
              URL.revokeObjectURL(l.href);
              l.remove();
            }, 500);
            window.UCtoast &&
              window.UCtoast("Sheet downloaded — open it in Excel");
          },
          true,
        );
        window.addEventListener("hashchange", function () {
          window.UCH = null;
          render();
        });
        document.addEventListener(
          "click",
          function (e) {
            var a = e.target.closest && e.target.closest('a[href^="#/learn/"]');
            if (
              !a ||
              e.defaultPrevented ||
              e.button ||
              e.metaKey ||
              e.ctrlKey ||
              e.shiftKey ||
              a.target === "_blank" ||
              a.hasAttribute("download")
            )
              return;
            e.preventDefault();
            var u = a.getAttribute("href");
            window.UCH = u;
            try {
              history.pushState(null, "", u);
            } catch (_) {
              try {
                location.hash = u;
              } catch (__) {}
            }
            render();
          },
          false,
        );
        window.addEventListener("popstate", function () {
          window.UCH = null;
          render();
        });
        render();
      })();