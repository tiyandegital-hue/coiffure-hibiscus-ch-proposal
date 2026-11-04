/* Shared behaviour: mobile nav, scroll reveals, business-name injection. */
(function () {
  "use strict";

  /* Inject BUSINESS name wherever [data-business] appears. */
  document.querySelectorAll("[data-business]").forEach(function (el) {
    var key = el.getAttribute("data-business") || "name";
    if (window.BUSINESS && BUSINESS[key]) el.textContent = BUSINESS[key];
  });

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) links.classList.remove("open");
    });
  }

  /* Scroll reveals — content is visible by default if JS fails (see .rise CSS + reduced-motion). */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".rise").forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 0.08 + "s";
    io.observe(el);
  });

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
