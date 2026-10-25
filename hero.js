      (function () {
        var prev = window.UCpageInit,
          T = [],
          R = 0,
          bound = 0;
        var PR = [
          "Data Science",
          "Data Analytics",
          "Business Analytics",
          "Automation Testing",
          "Playwright Testing",
          "Software Testing",
        ];
        var MS = [
            "The market has already changed",
            "AI is in every job description",
            "Skills now expire faster",
            "Your curriculum should keep up",
          ],
          WD = ["Built", "Ready", "Hired", "Future-proof"];
        function init() {
          T.forEach(clearInterval);
          T = [];
          cancelAnimationFrame(R);
          var cv = document.getElementById("uhFx");
          if (!cv) return;
          var $ = function (i) {
            return document.getElementById(i);
          };
          $("uhR").innerHTML = PR.concat(PR)
            .map(function (p) {
              return "<span>" + p + "</span>";
            })
            .join("");
          var mi = 0,
            eb = $("uhE");
          function setMsg(d) {
            mi = (mi + d + MS.length) % MS.length;
            eb.style.opacity = 0;
            eb.style.transform = "translateY(6px)";
            setTimeout(function () {
              eb.textContent = MS[mi];
              eb.style.opacity = 1;
              eb.style.transform = "none";
            }, 300);
          }
          $("uhP").onclick = function () {
            setMsg(-1);
          };
          $("uhN").onclick = function () {
            setMsg(1);
          };
          T.push(
            setInterval(function () {
              setMsg(1);
            }, 4000),
          );
          var wi = 0,
            w = $("uhW");
          T.push(
            setInterval(function () {
              wi = (wi + 1) % WD.length;
              w.style.opacity = 0;
              w.style.transform = "translateY(10px)";
              setTimeout(function () {
                w.textContent = WD[wi];
                w.style.opacity = 1;
                w.style.transform = "none";
              }, 300);
            }, 2800),
          );
          $("uhC").onclick = function () {
            var c = $("choose");
            if (c) c.scrollIntoView({ behavior: "smooth" });
          };
          var ctx = cv.getContext("2d"),
            W,
            H,
            P = [],
            rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
          function size() {
            var r = cv.getBoundingClientRect(),
              d = devicePixelRatio || 1;
            W = r.width;
            H = r.height;
            cv.width = W * d;
            cv.height = H * d;
            ctx.setTransform(d, 0, 0, d, 0, 0);
          }
          function spawn(i) {
            var m = Math.hypot(W, H) / 2;
            return {
              a: Math.random() * Math.PI * 2,
              r: i ? Math.random() * m : 80 + Math.random() * 60,
              v: 0.4 + Math.random() * 1.4,
              l: 20 + Math.random() * 60,
              k: Math.random() < 0.2,
            };
          }
          function start() {
            size();
            P = [];
            for (var i = 0; i < 110; i++) P.push(spawn(true));
          }
          function frame() {
            ctx.clearRect(0, 0, W, H);
            var cx = W / 2,
              cy = H * 0.48,
              m = Math.hypot(W, H) / 2;
            P.forEach(function (p, i) {
              var s = p.r / m;
              if (!rm) p.r += p.v * (1 + s * 2.2);
              var x1 = cx + Math.cos(p.a) * p.r,
                y1 = cy + Math.sin(p.a) * p.r,
                L = p.l * (0.5 + s * 1.5),
                x2 = cx + Math.cos(p.a) * (p.r + L),
                y2 = cy + Math.sin(p.a) * (p.r + L);
              ctx.strokeStyle =
                "rgba(235,94,40," + Math.min(1, s * 3) * (1 - s) * 0.55 + ")";
              ctx.lineWidth = p.k ? 2 : 1;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              if (p.r > m) P[i] = spawn(false);
            });
            if (!rm) R = requestAnimationFrame(frame);
          }
          start();
          frame();
          if (!bound) {
            bound = 1;
            addEventListener("resize", function () {
              if (document.getElementById("uhFx")) init();
            });
          }
        }
        window.UCpageInit = function () {
          if (prev) prev.apply(this, arguments);
          init();
        };
      })();