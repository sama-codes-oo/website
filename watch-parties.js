(function () {
  const EVENTS = [
    {
      title: "Pride Month Watch Party – Mumbai Edition",
      date: "2026-06-21",
      city: "Mumbai",
      venue: "TBA (Mumbai)",
      status: "upcoming",
      imageUrl: "photos%20and%20videos/PrideMonthWatchParty.jpeg",
      description: "Celebrate Pride & World Yoga Day with BL watch party screenings of Ticket to Heaven and Love Upon a Time!",
      rsvpLink: "https://docs.google.com/forms/d/e/1FAIpQLSdJCpkHR8uKYchJi1617_DldbyP7eRETri9wtgb4RBGmig6yg/viewform?usp=publish-editor",
      recapLink: "",
      rating: ""
    },
    {
      title: "BL Watch Party – March 2026",
      date: "2026-03-15",
      city: "Mumbai",
      venue: "TBA",
      status: "past",
      imageUrl: "photos%20and%20videos/event-archive/IMG_1325.JPG",
      description: "Our March screening featuring the latest hits!",
      recapLink: "",
      rating: ""
    },
    {
      title: "BL Watch Party – Dec 2025 Anniversary",
      date: "2025-12-20",
      city: "Mumbai",
      venue: "TBA",
      status: "past",
      imageUrl: "photos%20and%20videos/event-archive/IMG_8416.JPG",
      description: "A special anniversary screening to wrap up the year.",
      recapLink: "",
      rating: ""
    },
    {
      title: "BL Watch Party – June 2025",
      date: "2025-06-10",
      city: "Mumbai",
      venue: "TBA",
      status: "past",
      imageUrl: "photos%20and%20videos/event-archive/22da1c57-5bd3-46e1-b597-b1a2a9254d8b.JPG",
      description: "Summer vibes and great dramas.",
      recapLink: "",
      rating: ""
    },
    {
      title: "BL Watch Party – May 2025",
      date: "2025-05-05",
      city: "Mumbai",
      venue: "TBA",
      status: "past",
      imageUrl: "photos%20and%20videos/event-archive/9083c603-492c-4346-9a75-87c08e9c4a6b.JPG",
      description: "Kickstarting the season with fan favorites.",
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
    const badgeClass = { upcoming: "wp-badge--upcoming", past: "wp-badge--past", full: "wp-badge--full", cancelled: "wp-badge--cancelled" }[ev.status] || "wp-badge--upcoming";
    const badgeLabel = ev.status.charAt(0).toUpperCase() + ev.status.slice(1);
    
    let link = ev.recapLink || ev.rsvpLink || "";
    if (ev.status === "past" && !link) {
      const slug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      link = `archive.html#${slug}`;
    }

    const el = document.createElement(link ? "a" : "div");
    el.className = "wp-card";
    if (link) el.href = link;
    el.setAttribute("role", "listitem");

    const ctaText = ev.recapLink ? "View recap →" : ev.rsvpLink ? "Register interest →" : ev.status === "past" ? "View archive →" : "";
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
      const scrollId = "scroll-" + group.label.replace(/\s+/g, "-").toLowerCase();

      section.innerHTML = `
        <div class="wp-row-header">
          <span class="wp-row-title">${group.label}</span>
          <div class="wp-row-arrows">
            <button class="wp-arrow" data-dir="-1" aria-label="Scroll left">&#8592;</button>
            <button class="wp-arrow" data-dir="1" aria-label="Scroll right">&#8594;</button>
          </div>
        </div>
        <div class="wp-scroll" id="${scrollId}"></div>`;

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
      const featured = EVENTS.find(e => e.imageUrl) || EVENTS[0];
      if (featured && featured.imageUrl) {
        hero.classList.add("wp-hero--has-image");
        hero.innerHTML = `
          <img class="wp-hero-img" src="${featured.imageUrl}" alt="" loading="lazy" />
          <div class="wp-hero-gradient"></div>
          <div class="wp-hero-content page-shell">
            <p class="eyebrow">BL Watch Parties</p>
            <h1 class="wp-hero-title">Curated BL screenings, month by month.</h1>
            <p class="wp-hero-desc">Recap links, photo dumps, live commentary, and fan moments across India.</p>
          </div>`;
      }
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
