(function () {
  const EVENTS = [
    {
      title: "Cafe Pop-up",
      date: "",
      city: "India",
      venue: "Partner cafe or creator space",
      status: "upcoming",
      imageUrl: "photos%20and%20videos/1000172849.jpg",
      description: "Partner cafe or creator space event with a fan table, themed menu, and community activities alongside BLxKpopCrew.",
      rsvpLink: "index.html#contact",
      recapLink: "",
      rating: ""
    },
    {
      title: "Fan Table Event",
      date: "",
      city: "India",
      venue: "Partner venue",
      status: "upcoming",
      imageUrl: "photos%20and%20videos/1000172855.jpg",
      description: "Community fan table with merch, photocard trades, and fandom activities at a partner venue.",
      rsvpLink: "index.html#contact",
      recapLink: "",
      rating: ""
    },
    {
      title: "Partnership Night",
      date: "",
      city: "India",
      venue: "TBA",
      status: "upcoming",
      imageUrl: "photos%20and%20videos/1000172856.jpg",
      description: "Creator, brand, or store collaboration with a BLxKpopCrew-curated fan experience attached.",
      rsvpLink: "index.html#contact",
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
    const badgeLabel = "Open";
    const ctaText = ev.recapLink ? "View recap →" : "Reach out to collab →";
    const desc = (ev.description || "").slice(0, 110);

    el.innerHTML = `
      <div class="wp-card-thumb">
        ${ev.imageUrl ? `<img src="${ev.imageUrl}" alt="" loading="lazy" />` : `<p class="wp-card-ph-title">${ev.title}</p>`}
        <span class="wp-badge ${badgeClass}">${badgeLabel}</span>
        <div class="wp-card-overlay">
          <span class="wp-ov-title">${ev.title}</span>
          <p class="wp-ov-meta">${ev.city ? ev.city : ""}${ev.venue && ev.venue !== "TBA" ? " · " + ev.venue : ""}</p>
          <p class="wp-ov-desc">${desc}${ev.description && ev.description.length > 110 ? "…" : ""}</p>
        </div>
      </div>
      <div class="wp-card-info">
        <p class="wp-card-title">${ev.title}</p>
        <p class="wp-card-meta">Partner x BLxKpopCrew · ${ev.city}</p>
        <span class="wp-card-cta">${ctaText}</span>
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

    const section = document.createElement("div");
    section.innerHTML = `
      <div class="wp-row-header">
        <span class="wp-row-title">Open for Collabs</span>
        <div class="wp-row-arrows">
          <button class="wp-arrow" data-dir="-1" aria-label="Scroll left">&#8592;</button>
          <button class="wp-arrow" data-dir="1" aria-label="Scroll right">&#8594;</button>
        </div>
      </div>
      <div class="wp-scroll"></div>`;

    const scroll = section.querySelector(".wp-scroll");
    visible.forEach(ev => scroll.appendChild(renderCard(ev)));

    section.querySelectorAll(".wp-arrow").forEach(btn => {
      btn.addEventListener("click", () => {
        scroll.scrollBy({ left: parseInt(btn.dataset.dir) * 280, behavior: "smooth" });
      });
    });

    rowsEl.appendChild(section);
  }

  function init() {
    const hero = document.getElementById("wp-hero");
    if (hero) {
      hero.classList.add("wp-hero--has-image");
      hero.innerHTML = `
        <img class="wp-hero-img" src="photos%20and%20videos/1000172849.jpg" alt="" loading="lazy" />
        <div class="wp-hero-gradient"></div>
        <div class="wp-hero-content page-shell">
          <p class="eyebrow">Pop-ups and Partnerships</p>
          <h1 class="wp-hero-title">Collaborations, fan tables, and pop-ups.</h1>
          <p class="wp-hero-desc">Partner-led fan experiences with BLxKpopCrew. Reach out to co-host a cafe pop-up, fan table, or brand night.</p>
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
