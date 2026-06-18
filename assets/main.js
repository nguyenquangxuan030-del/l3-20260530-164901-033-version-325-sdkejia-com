(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector(".js-mobile-toggle");
    var panel = document.querySelector(".js-mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll(".js-global-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });

    var queryInput = document.querySelector(".js-query-input");
    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var value = params.get("q") || "";
      queryInput.value = value;
      if (value) {
        queryInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    document.querySelectorAll(".js-card-filter").forEach(function (input) {
      var scope = document.querySelector(".js-filter-scope");
      var empty = document.querySelector(".js-empty-state");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var filter = function () {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      };
      input.addEventListener("input", filter);
      filter();
    });

    document.querySelectorAll(".js-hero").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var controls = Array.prototype.slice.call(hero.querySelectorAll(".hero-control"));
      var current = 0;
      var timer;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      var restart = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide") || 0));
          restart();
        });
      });
      controls.forEach(function (control) {
        control.addEventListener("click", function () {
          var direction = control.getAttribute("data-direction") === "prev" ? -1 : 1;
          show(current + direction);
          restart();
        });
      });
      show(0);
      restart();
    });

    document.querySelectorAll(".js-hot-carousel").forEach(function (carousel) {
      var track = carousel.querySelector(".hot-track");
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hot-slide"));
      var current = 0;
      var show = function (index) {
        if (!track || !slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        track.style.transform = "translateX(-" + current * 100 + "%)";
      };
      carousel.querySelectorAll(".hot-control").forEach(function (control) {
        control.addEventListener("click", function () {
          var direction = control.getAttribute("data-direction") === "prev" ? -1 : 1;
          show(current + direction);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 6500);
      show(0);
    });

    var back = document.querySelector(".js-back-to-top");
    if (back) {
      var toggleBack = function () {
        back.classList.toggle("show", window.scrollY > 360);
      };
      window.addEventListener("scroll", toggleBack, { passive: true });
      back.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      toggleBack();
    }
  });
})();
