      /* Uncodemy /learn/ — page interactions. Content is in the HTML; this only adds progress, reminders and checkout. */
      (function () {
        "use strict";
        var COUPONS = [
          {
            code: "DIWALI25",
            title: "Diwali Dhamaka",
            desc: "Extra 25% off on any course — Recorded, Live or Combo.",
            pct: 25,
            ends: "2026-11-10T23:59:00+05:30",
            on: "All courses",
            hero: true,
          },
          {
            code: "LIVE15",
            title: "Live learner bonus",
            desc: "15% off on Live and Combo courses.",
            pct: 15,
            only: ["live", "combo"],
            ends: "2026-12-31T23:59:00+05:30",
            on: "Live & Combo",
          },
          {
            code: "FIRST500",
            title: "First course",
            desc: "Flat ₹500 off on your very first purchase.",
            flat: 500,
            first: true,
            ends: "2026-12-31T23:59:00+05:30",
            on: "All courses",
          },
          {
            code: "MILESTONE10",
            title: "Milestone reward",
            desc: "10% off — unlocks when you finish the 4 free milestones on your course dashboard.",
            pct: 10,
            needLevel: 4,
            ends: "2026-12-31T23:59:00+05:30",
            on: "All courses",
          },
        ];
        var BASE = "/learn/";
        var B = document.body,
          ROOT = "",
          C = "",
          PAGE = "";
        function readCtx() {
          ROOT = B.getAttribute("data-root") || "";
          C = B.getAttribute("data-course") || "";
          PAGE = B.getAttribute("data-page") || "";
        }

        /* Local preview: opened straight from disk, rewrite clean URLs to .../index.html */
        function fileRewrite() {
          if (location.protocol === "file:" && !window.UC_SINGLE) {
            document
              .querySelectorAll('a[href^="' + BASE + '"]')
              .forEach(function (a) {
                var h = a.getAttribute("href").slice(BASE.length),
                  hash = "",
                  i = h.indexOf("#");
                if (i >= 0) {
                  hash = h.slice(i);
                  h = h.slice(0, i);
                }
                if (h === "" || h.slice(-1) === "/") h += "index.html";
                a.setAttribute("href", ROOT + h + hash);
              });
          }
        }

        /* ---------- storage ---------- */
        var LS = "uncodemy_learn_v1",
          S = {};
        try {
          S = JSON.parse(localStorage.getItem(LS) || "{}") || {};
        } catch (e) {
          S = {};
        }
        function save() {
          try {
            localStorage.setItem(LS, JSON.stringify(S));
          } catch (e) {}
        }
        function has(k) {
          return !!S[k];
        }
        function put(k, v) {
          if (v) S[k] = v;
          else delete S[k];
          save();
        }
        function count(p) {
          return Object.keys(S).filter(function (k) {
            return k.indexOf(p) === 0;
          }).length;
        }
        function $(s, r) {
          return (r || document).querySelector(s);
        }
        function $$(s, r) {
          return Array.prototype.slice.call(
            (r || document).querySelectorAll(s),
          );
        }
        function inr(n) {
          return "₹" + Number(n).toLocaleString("en-IN");
        }
        function pad(n) {
          return String(n).padStart(2, "0");
        }

        var ICON = {
          check:
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
          bell: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
          x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
          play: '<svg width="26" height="26" viewBox="0 0 24 24"><polygon points="7 4 20 12 7 20 7 4" fill="currentColor"/></svg>',
          lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        };

        function toast(msg) {
          var t = $("#toast");
          if (!t) return;
          t.textContent = msg;
          t.classList.add("show");
          clearTimeout(toast._t);
          toast._t = setTimeout(function () {
            t.classList.remove("show");
          }, 2400);
        }

        /* ---------- greeting ---------- */
        
        /* "Save to" is handled in js/saved.js */

        function greet() {
          $$("[data-greet]").forEach(function (el) {
            var h = new Date().getHours();
            el.textContent =
              h < 12
                ? "Good morning"
                : h < 17
                  ? "Good afternoon"
                  : "Good evening";
          });
        }

        /* ---------- ticks & progress ---------- */
        function paintTicks() {
          $$("[data-k]").forEach(function (b) {
            var on = has(b.getAttribute("data-k"));
            b.classList.toggle("on", on);
            b.setAttribute("aria-pressed", on ? "true" : "false");
            var item = b.closest("[data-item]");
            if (item) item.classList.toggle("done", on);
            var lbl = b.querySelector("[data-lbl]");
            if (lbl)
              lbl.textContent = on
                ? b.getAttribute("data-on") || "Done"
                : b.getAttribute("data-off") || "Mark done";
          });
          $$("[data-scope]").forEach(function (w) {
            var scope = $(w.getAttribute("data-scope"));
            if (!scope) return;
            var all = $$("[data-k]", scope),
              done = all.filter(function (b) {
                return b.classList.contains("on");
              }).length;
            var t = $("[data-pt]", w);
            if (t) t.textContent = done + " / " + all.length;
            var bar = $(".progress i", w);
            if (bar)
              bar.style.width =
                (all.length ? (done / all.length) * 100 : 0) + "%";
          });
          paintMilestones();
        }

        /* ---------- milestones ---------- */
        function milestoneState(c) {
          return {
            sneak: has("sneak:" + c),
            roadmap: has("visited:" + c + ":roadmap"),
            q5: count("q:" + c + ":") >= 5,
            rev5: count("rev:" + c + ":") >= 5,
            buy: count("buy:" + c + ":") > 0,
          };
        }
        function freeLevel(c) {
          var m = milestoneState(c);
          return [m.sneak, m.roadmap, m.q5, m.rev5].filter(Boolean).length;
        }
        function paintMilestones() {
          if (!C) return;
          var m = milestoneState(C),
            steps = $$("[data-ms]"),
            firstOpen = true,
            lvl = 0;
          steps.forEach(function (s) {
            var done = !!m[s.getAttribute("data-ms")];
            if (done) lvl++;
            s.classList.remove("done", "now", "lock");
            if (done) s.classList.add("done");
            else if (firstOpen) {
              s.classList.add("now");
              firstOpen = false;
            } else s.classList.add("lock");
            var line = s.nextElementSibling;
            if (line && line.classList.contains("ms-line"))
              line.classList.toggle("done", done);
          });
          $$("[data-level]").forEach(function (el) {
            el.textContent = lvl;
          });
          var qd = count("q:" + C + ":"),
            need = Math.max(0, 5 - qd);
          $$("[data-qdone]").forEach(function (el) {
            el.textContent = qd;
          });
          $$("[data-qneed-wrap]").forEach(function (el) {
            el.hidden = need === 0;
          });
          $$("[data-qneed]").forEach(function (el) {
            el.textContent = need;
          });
          $$("[data-qok-wrap]").forEach(function (el) {
            el.hidden = need !== 0;
          });
          $$("[data-needlevel]").forEach(function (card) {
            var lv = freeLevel(C),
              needLv = +card.getAttribute("data-needlevel");
            card.classList.toggle("locked", lv < needLv);
            var p = $("[data-lvtxt]", card);
            if (p) p.textContent = lv + "/" + needLv;
            var bar = $(".progress i", card);
            if (bar) bar.style.width = (lv / needLv) * 100 + "%";
          });
          $$("[data-buy]").forEach(function (b) {
            var pid = b.getAttribute("data-pid");
            var own =
              has("buy:" + C + ":" + pid) ||
              (pid !== "combo" && has("buy:" + C + ":combo"));
            if (own && !b.getAttribute("data-owned")) {
              b.setAttribute("data-owned", "1");
              b.disabled = true;
              b.classList.add("green");
              b.innerHTML = ICON.check + " Enrolled";
            }
          });
        }

        function markVisit() {
          if (PAGE === "roadmap" && C && !has("visited:" + C + ":roadmap"))
            put("visited:" + C + ":roadmap", 1);
        }

        /* ---------- reminders ---------- */
        function paintRemind() {
          $$("[data-remind]").forEach(function (b) {
            var on = has(b.getAttribute("data-remind"));
            b.classList.toggle("on", on);
            b.innerHTML = on
              ? ICON.check + " Reminder set"
              : ICON.bell + " Remind me";
          });
        }

        /* ---------- countdowns ---------- */
        function countdown(iso) {
          var s = Math.max(0, Math.floor((new Date(iso) - new Date()) / 1000));
          if (!s) return "Offer ended";
          var d = Math.floor(s / 86400);
          s %= 86400;
          var h = Math.floor(s / 3600);
          s %= 3600;
          var m = Math.floor(s / 60);
          s %= 60;
          return d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
        }
        function tick() {
          $$("[data-cd]").forEach(function (el) {
            el.textContent = countdown(el.getAttribute("data-cd"));
          });
        }
        tick();
        setInterval(tick, 1000);

        /* ---------- "starts in N days" for batches ---------- */
        function startsIn() {
          var today = new Date();
          today.setHours(0, 0, 0, 0);
          $$("[data-start]").forEach(function (el) {
            var p = el.getAttribute("data-start").split("-"),
              d = new Date(+p[0], +p[1] - 1, +p[2]);
            var n = Math.round((d - today) / 864e5);
            el.textContent =
              n > 1
                ? "Starts in " + n + " days"
                : n === 1
                  ? "Starts tomorrow"
                  : n === 0
                    ? "Starts today"
                    : "Batch started";
            if (n < 0) {
              var row = el.closest("[data-batch]");
              if (row) row.style.opacity = ".55";
            }
          });
        }

        /* ---------- modal ---------- */
        var modal = $("#modal"),
          box = $("#mbox"),
          co = null;
        function openModal(html, wide) {
          box.className = "box" + (wide ? " wide" : "");
          box.innerHTML =
            '<button class="x" data-close aria-label="Close">' +
            ICON.x +
            "</button>" +
            html;
          modal.classList.add("is-open");
        }
        function closeModal() {
          modal.classList.remove("is-open");
          co = null;
        }

        function couponError(cp, pid) {
          if (!cp) return "This code is not valid.";
          if (new Date(cp.ends) < new Date()) return "This offer has ended.";
          if (cp.only && cp.only.indexOf(pid) < 0)
            return cp.code + " works only on " + cp.on + ".";
          if (
            cp.first &&
            Object.keys(S).some(function (k) {
              return k.indexOf("buy:") === 0;
            })
          )
            return cp.code + " is only for your first purchase.";
          if (cp.needLevel && freeLevel(C) < cp.needLevel)
            return (
              "Finish " +
              cp.needLevel +
              " free milestones to unlock " +
              cp.code +
              " (" +
              freeLevel(C) +
              "/" +
              cp.needLevel +
              " done)."
            );
          return null;
        }
        function drawCheckout() {
          var cp = co.code
            ? COUPONS.filter(function (x) {
                return x.code === co.code;
              })[0]
            : null;
          var disc = cp ? cp.flat || Math.round((co.price * cp.pct) / 100) : 0,
            total = Math.max(0, co.price - disc);
          co.total = total;
          if (co.step === "done") {
            openModal(
              '<div style="text-align:center;padding:10px 0"><span class="rc-ic green" style="width:72px;height:72px;margin:0 auto">' +
                ICON.check +
                "</span>" +
                '<h2 class="mt16" style="font-size:22px;font-weight:600">You’re enrolled!</h2><p class="muted mt8">' +
                co.cname +
                " — " +
                co.name +
                "<br>Paid " +
                inr(co.paid) +
                "</p>" +
                '<div class="row mt20" style="justify-content:center"><button class="btn" data-close>Continue</button></div></div>',
            );
            return;
          }
          var avail = COUPONS.filter(function (x) {
            return !couponError(x, co.pid);
          });
          openModal(
            '<span class="muted" style="font-size:13px">Checkout</span>' +
              '<h2 style="font-size:20px;font-weight:600;padding-right:40px">' +
              co.cname +
              " — " +
              co.name +
              "</h2>" +
              '<div class="mt20"><label for="cc" style="font-size:14px;font-weight:500">Have a coupon?</label>' +
              '<div class="inp mt8"><input id="cc" placeholder="Enter code" value="' +
              (co.typed || "") +
              '"><button class="btn" data-apply>Apply</button></div>' +
              (co.msg
                ? '<p class="mt8" style="font-size:13px;color:' +
                  (co.ok ? "#0F8A4C" : "#BE123C") +
                  '">' +
                  co.msg +
                  "</p>"
                : "") +
              (avail.length
                ? '<div class="row wrapx mt12" style="gap:6px"><span class="muted" style="font-size:12px">Available:</span>' +
                  avail
                    .map(function (x) {
                      return (
                        '<button class="chip paid" data-usecp="' +
                        x.code +
                        '">' +
                        x.code +
                        "</button>"
                      );
                    })
                    .join("") +
                  "</div>"
                : "") +
              '</div><div class="mt20">' +
              '<div class="sum-row"><span class="muted">MRP</span><s class="muted">' +
              inr(co.mrp) +
              "</s></div>" +
              '<div class="sum-row"><span class="muted">Course price</span><span>' +
              inr(co.price) +
              "</span></div>" +
              (cp
                ? '<div class="sum-row" style="color:#0F8A4C"><span>Coupon ' +
                  cp.code +
                  ' <button data-rmcp style="color:#BE123C;font-size:12px;margin-left:6px">remove</button></span><span>− ' +
                  inr(disc) +
                  "</span></div>"
                : "") +
              '<div class="sum-row total"><span>Total</span><span>' +
              inr(total) +
              "</span></div>" +
              '<p class="muted" style="font-size:12px">You save ' +
              inr(co.mrp - total) +
              " · inclusive of taxes</p></div>" +
              '<button class="btn mt20" style="width:100%;height:50px;font-size:16px" data-pay>Pay ' +
              inr(total) +
              "</button>" +
              '<p class="muted mt12" style="font-size:12px;text-align:center">' +
              ICON.lock +
              " Demo checkout — connect Razorpay / your payment gateway here.</p>",
          );
        }
        function applyCoupon(raw) {
          var code = (raw || "").trim().toUpperCase();
          co.typed = code;
          if (!code) {
            co.msg = "Enter a coupon code.";
            co.ok = false;
            return drawCheckout();
          }
          var cp = COUPONS.filter(function (x) {
              return x.code === code;
            })[0],
            err = couponError(cp, co.pid);
          if (err) {
            co.code = "";
            co.msg = err;
            co.ok = false;
          } else {
            co.code = code;
            co.ok = true;
            co.msg =
              code +
              " applied — " +
              (cp.pct ? cp.pct + "% off" : inr(cp.flat) + " off") +
              "!";
          }
          drawCheckout();
        }

        function ics(b) {
          var d = b.getAttribute("data-date"),
            t = b.getAttribute("data-time");
          var body = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Uncodemy//Batches//EN",
            "BEGIN:VEVENT",
            "UID:" + C + "-" + d + "@uncodemy.com",
            "DTSTAMP:" + d + "T000000",
            "DTSTART;TZID=Asia/Kolkata:" + d + "T" + t + "00",
            "DURATION:PT2H",
            "SUMMARY:" + b.getAttribute("data-title"),
            "DESCRIPTION:" + b.getAttribute("data-desc"),
            "BEGIN:VALARM",
            "TRIGGER:-P1D",
            "ACTION:DISPLAY",
            "DESCRIPTION:Batch starts tomorrow",
            "END:VALARM",
            "END:VEVENT",
            "END:VCALENDAR",
          ].join("\r\n");
          var a = document.createElement("a");
          a.href = URL.createObjectURL(
            new Blob([body], { type: "text/calendar" }),
          );
          a.download = C + "-batch-" + d + ".ics";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            URL.revokeObjectURL(a.href);
            a.remove();
          }, 500);
          toast("Calendar file downloaded");
        }
        function copy(txt) {
          function ok() {
            toast("Copied: " + txt);
          }
          try {
            navigator.clipboard.writeText(txt).then(ok, fb);
          } catch (e) {
            fb();
          }
          function fb() {
            var ta = document.createElement("textarea");
            ta.value = txt;
            document.body.appendChild(ta);
            ta.select();
            try {
              document.execCommand("copy");
            } catch (e) {}
            ta.remove();
            ok();
          }
        }

        /* ---------- clicks ---------- */
        document.addEventListener("click", function (e) {
          var t = e.target;
          var sw = $("details.cswitch[open]");
          if (sw && !sw.contains(t)) sw.removeAttribute("open");
          var el;
          if ((el = t.closest("[data-k]"))) {
            var k = el.getAttribute("data-k");
            put(k, has(k) ? 0 : 1);
            paintTicks();
            return;
          }
          if ((el = t.closest("[data-side]"))) {
            B.classList.toggle("side-open");
            return;
          }
          if ((el = t.closest("[data-remind]"))) {
            var r = el.getAttribute("data-remind");
            put(r, has(r) ? 0 : 1);
            paintRemind();
            toast(
              has(r)
                ? "Reminder set — we’ll remind you before the batch starts"
                : "Reminder removed",
            );
            return;
          }
          if ((el = t.closest("[data-ics]"))) {
            ics(el);
            return;
          }
          if ((el = t.closest("[data-copy]"))) {
            copy(el.getAttribute("data-copy"));
            return;
          }
          if ((el = t.closest("[data-sneak]"))) {
            e.preventDefault();
            put("sneak:" + C, 1);
            paintTicks();
            openModal(
              '<span class="chip free">Free class · 30 mins</span><h2 class="mt8" style="font-size:20px;font-weight:600;padding-right:40px">' +
                el.getAttribute("data-title") +
                '</h2><p class="muted" style="font-size:14px">' +
                el.getAttribute("data-mentor") +
                "</p>" +
                '<div class="video mt16"><div><span class="play" style="position:static;transform:none;margin:0 auto 14px;width:64px;height:64px">' +
                ICON.play +
                '</span><p style="opacity:.8;font-size:14px">Paste your YouTube / Vimeo embed here.</p></div></div>' +
                '<p class="muted mt16" style="font-size:14px">' +
                ICON.check +
                " Milestone completed: watched the sneak-peek class</p>",
              true,
            );
            return;
          }
          if ((el = t.closest("[data-buy]"))) {
            if (el.disabled) return;
            co = {
              pid: el.getAttribute("data-pid"),
              name: el.getAttribute("data-name"),
              cname: el.getAttribute("data-cname"),
              price: +el.getAttribute("data-price"),
              mrp: +el.getAttribute("data-mrp"),
              code: "",
              msg: "",
              step: "pay",
            };
            drawCheckout();
            return;
          }
          if (t.closest("[data-close]") || t.classList.contains("backdrop")) {
            closeModal();
            return;
          }
          if ((el = t.closest("[data-usecp]"))) {
            applyCoupon(el.getAttribute("data-usecp"));
            return;
          }
          if (t.closest("[data-apply]")) {
            applyCoupon($("#cc").value);
            return;
          }
          if (t.closest("[data-rmcp]")) {
            co.code = "";
            co.typed = "";
            co.msg = "";
            drawCheckout();
            return;
          }
          if ((el = t.closest("[data-pay]"))) {
            el.disabled = true;
            el.innerHTML = '<span class="spin"></span> Processing…';
            setTimeout(function () {
              put("buy:" + C + ":" + co.pid, {
                paid: co.total,
                code: co.code,
                date: new Date().toISOString(),
              });
              co.paid = co.total;
              co.step = "done";
              drawCheckout();
              paintTicks();
            }, 1100);
          }
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            closeModal();
            B.classList.remove("side-open");
          }
          if (e.key === "Enter" && e.target && e.target.id === "cc")
            applyCoupon(e.target.value);
        });

        function pageInit() {
          readCtx();
          fileRewrite();
          greet();
          markVisit();
          startsIn();
          paintTicks();
          paintRemind();
          tick();
        }
        window.UCpageInit = pageInit;
        window.UCtoast = toast;
        pageInit();
      })();