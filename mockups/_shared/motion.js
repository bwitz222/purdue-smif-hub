/* ══════════════════════════════════════════════════════════════════════════
   PURDUE SMIF — MOCKUP BEHAVIOR LAYER
   Zero dependencies. Everything degrades to plain, visible, usable HTML when
   this file never runs, and every animated path checks prefers-reduced-motion
   before it moves anything.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  /* These mockups are published as body fragments, so there is no <html> tag
     of our own to carry the language. A real page sets it in the document. */
  if (!document.documentElement.lang) document.documentElement.lang = "en";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () {
    return REDUCED.matches;
  };
  var $ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ── Scroll reveal ─────────────────────────────────────────────────────
     Elements carry [data-reveal] and are hidden by CSS only while JS is
     present. Under reduced motion we reveal everything immediately rather
     than animating it in. */
  function initReveal() {
    var targets = $("[data-reveal], [data-inview-watch]");
    if (!targets.length) return;

    if (reduced() || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.dataset.inview = "true";
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.dataset.inview = "true";
          // Stagger direct children marked as a group, capped so long lists
          // never drag the entrance past ~600ms total.
          var kids = $("[data-reveal]", el);
          if (el.hasAttribute("data-stagger") && kids.length) {
            var step = Math.min(0.08, 0.6 / kids.length);
            kids.forEach(function (kid, i) {
              kid.style.setProperty("--reveal-delay", (i * step).toFixed(3) + "s");
              kid.dataset.inview = "true";
            });
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ── Count-up ──────────────────────────────────────────────────────────
     <span data-countup="638" data-decimals="0"> — the element's text content
     is the final value, so it is already correct before and without JS. */
  function initCountUp() {
    var els = $("[data-countup]");
    if (!els.length) return;
    if (reduced() || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });

    function run(el) {
      var to = parseFloat(el.dataset.countup);
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var duration = parseFloat(el.dataset.duration || "1.6") * 1000;
      var start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        // easeOutQuint — settles hard, matching the site's ease curve.
        var eased = 1 - Math.pow(1 - p, 5);
        el.textContent = (to * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = to.toFixed(decimals);
      }
      requestAnimationFrame(frame);
    }
  }

  /* ── Header scroll state + progress rail ───────────────────────────────── */
  function initScroll() {
    var header = document.querySelector(".site-header");
    var progress = document.querySelector(".progress");
    var applyBar = document.querySelector(".apply-bar");
    if (!header && !progress && !applyBar) return;

    var ticking = false;
    function update() {
      var y = window.scrollY;
      if (header) header.dataset.scrolled = y > 20 ? "true" : "false";
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      if (applyBar) applyBar.dataset.visible = y > 600 ? "true" : "false";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  /* ── Mega-menu ─────────────────────────────────────────────────────────
     Opens on hover for pointers and on click/Enter for keyboards, closes on
     Escape and on focus leaving the group. */
  function initNav() {
    var items = $(".nav__item");
    items.forEach(function (item) {
      var trigger = item.querySelector(".nav__trigger");
      if (!trigger) return;
      var close = function () {
        item.dataset.open = "false";
        trigger.setAttribute("aria-expanded", "false");
      };
      var open = function () {
        items.forEach(function (o) {
          if (o !== item) {
            o.dataset.open = "false";
            var t = o.querySelector(".nav__trigger");
            if (t) t.setAttribute("aria-expanded", "false");
          }
        });
        item.dataset.open = "true";
        trigger.setAttribute("aria-expanded", "true");
      };
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", close);
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        item.dataset.open === "true" ? close() : open();
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          close();
          trigger.focus();
        }
      });
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) close();
      });
    });
  }

  /* ── Mobile drawer ─────────────────────────────────────────────────────── */
  function initDrawer() {
    var drawer = document.querySelector(".drawer");
    var opener = document.querySelector("[data-drawer-open]");
    if (!drawer || !opener) return;
    var closers = $("[data-drawer-close]", drawer);
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.dataset.open = "true";
      document.body.style.overflow = "hidden";
      // Stagger link entrance, unless motion is reduced.
      $(".drawer__link", drawer).forEach(function (link, i) {
        link.style.animationDelay = reduced() ? "0s" : 0.05 + i * 0.05 + "s";
      });
      var first = drawer.querySelector("[data-drawer-close], a");
      if (first) first.focus();
    }
    function close() {
      drawer.dataset.open = "false";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    opener.addEventListener("click", open);
    closers.forEach(function (c) {
      c.addEventListener("click", close);
    });
    $("a", drawer).forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.dataset.open === "true") close();
      if (e.key !== "Tab" || drawer.dataset.open !== "true") return;
      trapFocus(e, drawer);
    });
  }

  function trapFocus(e, container) {
    var f = $(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      container
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── Accordion ─────────────────────────────────────────────────────────── */
  function initAccordion() {
    $("[data-accordion] .accordion__trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        var panel = document.getElementById(
          trigger.getAttribute("aria-controls")
        );
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.dataset.open = String(!expanded);
      });
    });
  }

  /* ── Segmented / chip toggles ──────────────────────────────────────────── */
  function initToggleGroups() {
    $("[data-toggle-group]").forEach(function (group) {
      var buttons = $("button", group);
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === btn));
          });
          group.dispatchEvent(
            new CustomEvent("toggled", {
              detail: { value: btn.dataset.value },
              bubbles: true,
            })
          );
        });
      });
    });
  }

  /* ── Sortable + filterable table ───────────────────────────────────────
     Works on any <table class="data"> whose header buttons carry
     data-sort-key, and whose rows carry matching data-<key> attributes.
     Sorting is keyboard-operable and announces via aria-sort. */
  function initTables() {
    $("table.data[data-sortable]").forEach(function (table) {
      var tbody = table.tBodies[0];
      if (!tbody) return;
      var headers = $(".th-sort", table);

      headers.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.dataset.sortKey;
          var th = btn.closest("th");
          var dir =
            th.getAttribute("aria-sort") === "descending"
              ? "ascending"
              : "descending";
          headers.forEach(function (h) {
            h.closest("th").setAttribute("aria-sort", "none");
          });
          th.setAttribute("aria-sort", dir);

          // Sort the data rows, carrying each one's expandable detail row with
          // it. Sorting the <tr> list flat would leave every thesis stranded
          // under whichever position happened to land above it.
          var groups = [];
          $("tr", tbody).forEach(function (r) {
            if (r.hasAttribute("data-detail-row")) {
              if (groups.length) groups[groups.length - 1].rows.push(r);
              return;
            }
            groups.push({ key: r.dataset[key], rows: [r] });
          });
          groups.sort(function (a, b) {
            var an = parseFloat(a.key);
            var bn = parseFloat(b.key);
            var cmp =
              isNaN(an) || isNaN(bn)
                ? String(a.key).localeCompare(String(b.key))
                : an - bn;
            return dir === "ascending" ? cmp : -cmp;
          });
          groups.forEach(function (g) {
            g.rows.forEach(function (r) {
              tbody.appendChild(r);
            });
          });
        });
      });
    });

    // Filter chips + search box, wired by data-filter-target.
    $("[data-filter-target]").forEach(function (control) {
      var table = document.querySelector(control.dataset.filterTarget);
      if (!table) return;
      var apply = function () {
        var scope = document.querySelector(
          '[data-filter-target="' + control.dataset.filterTarget + '"][data-filter-key]'
        );
        var activeChip = scope ? scope.querySelector('[aria-pressed="true"]') : null;
        var sector = activeChip ? activeChip.dataset.value : "all";
        var searchEl = document.querySelector(
          '[data-filter-target="' + control.dataset.filterTarget + '"] input, input[data-filter-target="' + control.dataset.filterTarget + '"]'
        );
        var q = searchEl ? searchEl.value.trim().toLowerCase() : "";
        var shown = 0;
        // Detail rows are deliberately excluded: their visibility belongs to
        // their own expand toggle, not to the filter. Matching them here would
        // un-hide every collapsed thesis the moment a filter was cleared.
        $(
          "tbody tr:not([data-detail-row]), [data-filter-row]",
          table
        ).forEach(function (row) {
          var okSector =
            sector === "all" || (row.dataset.sector || "") === sector;
          var okQuery =
            !q ||
            (row.dataset.search || row.textContent).toLowerCase().indexOf(q) >
              -1;
          var show = okSector && okQuery;
          row.hidden = !show;
          if (show) shown++;

          // A detail row follows its parent: hidden when the parent is filtered
          // out, otherwise left in whatever state its toggle reports.
          var detail = row.nextElementSibling;
          if (detail && detail.hasAttribute("data-detail-row")) {
            var toggle = row.querySelector("[data-expand]");
            var expanded =
              toggle && toggle.getAttribute("aria-expanded") === "true";
            detail.hidden = !show || !expanded;
          }
        });
        var counter = document.querySelector(
          '[data-filter-count="' + control.dataset.filterTarget + '"]'
        );
        if (counter) counter.textContent = shown;
        var empty = document.querySelector(
          '[data-filter-empty="' + control.dataset.filterTarget + '"]'
        );
        if (empty) empty.hidden = shown !== 0;
      };
      control.addEventListener("input", apply);
      control.addEventListener("click", function (e) {
        if (e.target.closest("button")) setTimeout(apply, 0);
      });
    });
  }

  /* ── Expandable table rows ─────────────────────────────────────────────── */
  function initRowExpand() {
    $("[data-expand]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("tr");
        var detail = row && row.nextElementSibling;
        if (!detail || !detail.hasAttribute("data-detail-row")) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        row.setAttribute("aria-expanded", String(!open));
        detail.hidden = open;
      });
    });
  }

  /* ── Slide-over sheet ──────────────────────────────────────────────────── */
  function initSheet() {
    var sheet = document.querySelector(".sheet");
    if (!sheet) return;
    var lastFocus = null;

    $("[data-sheet-open]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        lastFocus = trigger;
        // Populate from the trigger's data attributes so one sheet serves
        // every card on the page.
        Object.keys(trigger.dataset).forEach(function (k) {
          if (k.indexOf("sheet") !== 0 || k === "sheetOpen") return;
          var slot = sheet.querySelector(
            "[data-slot=" + k.replace("sheet", "").toLowerCase() + "]"
          );
          if (slot) slot.textContent = trigger.dataset[k];
        });
        sheet.dataset.open = "true";
        document.body.style.overflow = "hidden";
        var close = sheet.querySelector("[data-sheet-close]");
        if (close) close.focus();
      });
    });

    function close() {
      sheet.dataset.open = "false";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    $("[data-sheet-close], .sheet__scrim", sheet).forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (sheet.dataset.open !== "true") return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") trapFocus(e, sheet.querySelector(".sheet__panel"));
    });
  }

  /* ── Desk (dark) mode ──────────────────────────────────────────────────── */
  function initTheme() {
    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;
    var root = document.documentElement;
    toggle.addEventListener("click", function () {
      var desk = root.getAttribute("data-theme") === "desk";
      if (desk) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", "desk");
      toggle.setAttribute("aria-pressed", String(!desk));
      var label = toggle.querySelector("[data-theme-label]");
      if (label) label.textContent = desk ? "Desk mode" : "Paper mode";
    });
  }

  /* ── Countdown ─────────────────────────────────────────────────────────── */
  function initCountdown() {
    var el = document.querySelector("[data-countdown]");
    if (!el) return;
    var target = new Date(el.dataset.countdown).getTime();
    var units = {
      days: el.querySelector("[data-unit=days]"),
      hours: el.querySelector("[data-unit=hours]"),
      minutes: el.querySelector("[data-unit=minutes]"),
      seconds: el.querySelector("[data-unit=seconds]"),
    };
    function pad(n) {
      return String(Math.max(0, n)).padStart(2, "0");
    }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        el.dataset.closed = "true";
        return;
      }
      var s = Math.floor(diff / 1000);
      if (units.days) units.days.textContent = pad(Math.floor(s / 86400));
      if (units.hours) units.hours.textContent = pad(Math.floor(s / 3600) % 24);
      if (units.minutes) units.minutes.textContent = pad(Math.floor(s / 60) % 60);
      if (units.seconds) units.seconds.textContent = pad(s % 60);
      var mini = document.querySelector("[data-countdown-mini]");
      if (mini) mini.textContent = Math.floor(s / 86400) + " days left to apply";
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── Sparkline path length, so the draw animation is proportional ─────── */
  function initSparks() {
    $(".spark .spark-draw").forEach(function (path) {
      try {
        var len = path.getTotalLength();
        path.style.setProperty("--len", len);
      } catch (e) {
        /* jsdom / no layout — the dasharray fallback covers it */
      }
    });
  }

  function boot() {
    initSparks();
    initReveal();
    initCountUp();
    initScroll();
    initNav();
    initDrawer();
    initAccordion();
    initToggleGroups();
    initTables();
    initRowExpand();
    initSheet();
    initTheme();
    initCountdown();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
