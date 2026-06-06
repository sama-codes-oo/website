(function () {
  const EVENTS = [
    {
      title: "13 YEARS OF BTS",
      date: "2026-06-14",
      city: "Mumbai",
      venue: "Andheri, Mumbai",
      status: "upcoming",
      imageUrl: "photos%20and%20videos/BTS_13th_Anniversary.jpeg",
      description: "Celebrate 13 unforgettable years of BTS with DJ sets, Random Dance Play, games, canvas painting, and Korean food!",
      rsvpLink: "https://forms.gle/8WV3Ut4A7bCttGw19",
      recapLink: "",
      rating: ""
    }
  ];

  let activeFilter = "all";
  let searchQuery = "";
  let debounceTimer;

  const chipsEl = document.getElementById("wp-chips");
  const rowsEl = document.getElementById("wp-rows");
  const emptyEl = document.getElementById("wp-empty");
  const searchEl = document.getElementById("wp-search");

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderChips() {
    const filters = ["All", "Upcoming", "Past"];
    chipsEl.innerHTML = filters.map(f => {
      const val = f.toLowerCase();
      const active = activeFilter === val ? " wp-chip--active" : "";
      return `<button class="wp-chip${active}" data-filter="${val}">${f}</button>`;
    }).join("");
    chipsEl.querySelectorAll(".wp-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        renderChips();
        buildRows();
      });
    });
  }

  function getVisible() {
    return EVENTS.filter(ev => {
      const matchFilter = activeFilter === "all" || ev.status === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || [ev.title, ev.city, ev.venue, ev.description].some(f => f && f.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }

  function renderCard(ev) {
    const link = ev.recapLink || ev.rsvpLink || "";
    const el = document.createElement(link ? "a" : "div");
    el.className = "wp-card";
    if (link) el.href = link;
    el.setAttribute("role", "listitem");

    const badgeClass = { upcoming: "wp-badge--upcoming", past: "wp-badge--past" }[ev.status] || "wp-badge--upcoming";
    const badgeLabel = ev.status.charAt(0).toUpperCase() + ev.status.slice(1);
    const ctaText = ev.recapLink ? "View recap →" : ev.rsvpLink ? "Register interest →" : "";
    const dateLabel = formatDate(ev.date);
    const desc = (ev.description || "").slice(0, 110);

    el.innerHTML = `
      <div class="wp-card-thumb">
        ${ev.imageUrl ? `<img src="${ev.imageUrl}" alt="" loading="lazy" />` : `<p class="wp-card-ph-title">${ev.title}</p>`}
        <span class="wp-badge ${badgeClass}">${badgeLabel}</span>
        ${ev.rating ? `<span class="wp-rating">★ ${ev.rating}</span>` : ""}
        <div class="wp-card-overlay">
          <span class="wp-ov-title">${ev.title}</span>
          <p class="wp-ov-meta">${dateLabel}${ev.city ? " · " + ev.city : ""}</p>
          <p class="wp-ov-desc">${desc}${ev.description && ev.description.length > 110 ? "…" : ""}</p>
        </div>
      </div>
      <div class="wp-card-info">
        <p class="wp-card-title">${ev.title}</p>
        <p class="wp-card-meta">${dateLabel}${ev.city ? " · " + ev.city : ""}</p>
        ${ctaText ? `<span class="wp-card-cta">${ctaText}</span>` : ""}
      </div>`;
    return el;
  }

  function buildRows() {
    const visible = getVisible();
    rowsEl.innerHTML = "";

    if (!visible.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    const groups = [
      { label: "Coming Up", items: visible.filter(e => e.status === "upcoming") },
      { label: "Past Events", items: visible.filter(e => e.status === "past") }
    ].filter(g => g.items.length);

    groups.forEach(group => {
      const section = document.createElement("div");
      section.innerHTML = `
        <div class="wp-row-header">
          <span class="wp-row-title">${group.label}</span>
          <div class="wp-row-arrows">
            <button class="wp-arrow" data-dir="-1" aria-label="Scroll left">&#8592;</button>
            <button class="wp-arrow" data-dir="1" aria-label="Scroll right">&#8594;</button>
          </div>
        </div>
        <div class="wp-scroll"></div>`;

      const scroll = section.querySelector(".wp-scroll");
      group.items.forEach(ev => scroll.appendChild(renderCard(ev)));

      section.querySelectorAll(".wp-arrow").forEach(btn => {
        btn.addEventListener("click", () => {
          scroll.scrollBy({ left: parseInt(btn.dataset.dir) * 280, behavior: "smooth" });
        });
      });

      rowsEl.appendChild(section);
    });
  }

  function init() {
    const hero = document.getElementById("wp-hero");
    if (hero) {
      hero.classList.add("wp-hero--has-image");
      hero.innerHTML = `
        <img class="wp-hero-img" src="photos%20and%20videos/1000172855.jpg" alt="" loading="lazy" />
        <div class="wp-hero-gradient"></div>
        <div class="wp-hero-content page-shell">
          <p class="eyebrow">K-pop Crossover Nights</p>
          <h1 class="wp-hero-title">Playlist nights, comebacks, and fan swaps.</h1>
          <p class="wp-hero-desc">Monthly K-pop crossover events across India with themed swaps, fan games, and comeback celebrations.</p>
        </div>`;
    }

    renderChips();
    buildRows();

    if (searchEl) {
      searchEl.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          searchQuery = searchEl.value.trim();
          buildRows();
        }, 200);
      });
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
