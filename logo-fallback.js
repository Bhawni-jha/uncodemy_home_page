      /* company logo fallback: google favicon -> duckduckgo -> keep coloured monogram */
      document.addEventListener(
        "error",
        function (e) {
          var t = e.target;
          if (!t || t.tagName !== "IMG" || !t.classList.contains("colo-img"))
            return;
          var f = t.getAttribute("data-f");
          if (f) {
            t.removeAttribute("data-f");
            t.src = f;
          } else {
            t.remove();
          }
        },
        true,
      );