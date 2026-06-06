const root = document.documentElement;
const nav = document.getElementById("nav-links");
const menuToggle = document.getElementById("menu-toggle");
const themeToggle = document.getElementById("theme-toggle");
const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const themeIcons = {
  moon: '<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.99 12.62A8.5 8.5 0 1 1 11.38 3.01 6.5 6.5 0 0 0 20.99 12.62Z"></path></svg>',
  sun: '<svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>'
};

function syncThemeButton() {
  if (!themeToggle) return;
  const isDark = root.getAttribute("data-theme") === "dark";
  themeToggle.innerHTML = isDark ? themeIcons.sun : themeIcons.moon;
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
}

if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
  root.setAttribute("data-theme", "dark");
}

syncThemeButton();

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  if (nextTheme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  localStorage.setItem("theme", nextTheme);
  syncThemeButton();
});

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      if (link.hash === "#" + entry.target.id) {
        link.setAttribute("aria-current", "page");
      } else if (link.getAttribute("href")?.startsWith("#")) {
        link.removeAttribute("aria-current");
      }
    });
  });
}, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

sections.forEach((section) => observer.observe(section));

// â”€â”€ Search overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const searchOverlay = document.getElementById("search-overlay");
const searchToggle = document.getElementById("search-toggle");
const searchClose = document.getElementById("search-close");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

const SEARCH_INDEX = [
  { label: "Events", title: "BL Watch Parties", desc: "Curated BL screenings grouped by month.", href: "watch-parties.html" },
  { label: "Events", title: "BL Watch Party â€” May 2026", desc: "Fan meetup recap with photos from May 2026.", href: "event-watch-party-may-2026.html" },
  { label: "Events", title: "K-pop Crossover Nights", desc: "Playlist nights, comeback celebrations, and fan game sessions.", href: "kpop-crossover-nights.html" },
  { label: "Events", title: "Pop-ups & Partnerships", desc: "Partner-led fan experiences with cafes, creators, and fan tables.", href: "popups-partnerships.html" },
  { label: "BL Talk Zone", title: "Thai BL Reviews", desc: "Drama recaps, ratings, and episode guides for Thai BL.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Japanese BL Reviews", desc: "Films, live-action dramas, anime, and manga adaptations.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Korean BL Reviews", desc: "Short series, web dramas, and idol-led stories.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Shine", desc: "Thai BL. Rating: 9.3. Drama, choices, and life on the far side of the moon.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Zomvivor", desc: "Thai BL. Rating: 7.1. Zombie survival and plot critique.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Romance Scammer", desc: "Thai BL. Episode 7 review notes.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Khemjira", desc: "Thai BL. Rating: 8.9. Horror, fate, and strong production value.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Goddess Blesses You From Death", desc: "Thai BL. Rating: 9.0. Horror, lore, and chemistry.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "School Trip Joined a Group I Am Not Close To", desc: "Japanese BL. Rating: 8.9. Nostalgic school drama.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "The Boyfriend Season Two", desc: "Japanese BL. Rating: 9.0. Reality dating and connection.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Soulmate", desc: "Korean BL. Rating: 8.7. Connection, destiny, and emotional stillness.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Thundercloud Rainstorm", desc: "Korean BL. Rating: 9.1. Psychological romance with layered storytelling.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "His Man Season Four", desc: "Korean BL. Rating: 7.1. Reality dating season critique.", href: "talk-zone.html" },
  { label: "BL Talk Zone", title: "Heated Rivalry", desc: "Western BL. Rating: 8.1. Sports romance with abrupt time jumps.", href: "talk-zone.html" },
  { label: "Archive", title: "Photo Archive", desc: "Photos and videos from BLxKpopCrew events.", href: "archive.html" },
  { label: "Merch", title: "Merch Store", desc: "Official merch drops, event keepsakes, and fan table updates.", href: "merch-store.html" },
  { label: "Announcements", title: "Announcements", desc: "Event alerts, RSVP windows, and community updates.", href: "announcements.html" },
  { label: "Contact", title: "Contact Us", desc: "Reach BLxKpopCrew for events, collabs, or fan inquiries.", href: "index.html#contact" },
  { label: "RSVP", title: "RSVP for Events", desc: "Register your interest for upcoming BL watch parties and K-pop nights.", href: "watch-parties.html" },
];

function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = false;
  searchInput?.focus();
  document.body.style.overflow = "hidden";
}

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.hidden = true;
  document.body.style.overflow = "";
  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";
}

function renderSearchResults(query) {
  if (!searchResults) return;
  const q = query.trim().toLowerCase();
  if (!q) { searchResults.innerHTML = ""; return; }
  const hits = SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q) ||
    item.label.toLowerCase().includes(q)
  );
  if (!hits.length) {
    searchResults.innerHTML = '<p class="search-empty">No results found. Try a different keyword.</p>';
    return;
  }
  searchResults.innerHTML = hits.map(item => `
    <a class="search-result" href="${item.href}" role="listitem">
      <span class="search-result__label">${item.label}</span>
      <span class="search-result__title">${item.title}</span>
      <span class="search-result__desc">${item.desc}</span>
    </a>
  `).join("");
}

searchToggle?.addEventListener("click", openSearch);
searchClose?.addEventListener("click", closeSearch);
searchInput?.addEventListener("input", (e) => renderSearchResults(e.target.value));
searchOverlay?.addEventListener("click", (e) => { if (e.target === searchOverlay) closeSearch(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && searchOverlay && !searchOverlay.hidden) closeSearch();
});

// â”€â”€ Footer notify form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.getElementById("footer-notify-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("footer-notify-status");
  const btn = form.querySelector("button[type='submit']");
  if (!status) return;
  if (form.action.includes("YOUR_FORM_ID")) {
    status.textContent = "Thanks! We'll notify you about upcoming events.";
    status.className = "form-status is-success";
    form.reset();
    return;
  }
  btn.disabled = true;
  try {
    const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error();
    status.textContent = "Thanks! We'll notify you about upcoming events.";
    status.className = "form-status is-success";
    form.reset();
  } catch {
    status.textContent = "Something went wrong. Email us at blxkpopcrew.in@gmail.com.";
    status.className = "form-status is-error";
  } finally {
    btn.disabled = false;
  }
});

// â”€â”€ Tab switcher (talk-zone) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
document.querySelectorAll("[data-tab-root]").forEach(root => {
  const tabs = root.querySelectorAll(".filter-tab");
  const panels = root.querySelectorAll(".tab-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach(p => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      root.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add("is-active");
      runZoneSearch();
    });
  });
});

// â”€â”€ Talk-zone search + sort â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function runZoneSearch() {
  const input = document.getElementById("zone-search-input");
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  document.querySelector(".tab-panel.is-active")?.querySelectorAll(".review-card").forEach(card => {
    card.hidden = q ? !card.textContent.toLowerCase().includes(q) : false;
  });
}

document.getElementById("zone-search-input")?.addEventListener("input", runZoneSearch);

document.querySelectorAll(".sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const mode = btn.dataset.sort;
    const list = document.querySelector(".tab-panel.is-active .review-list");
    if (!list) return;
    const cards = [...list.querySelectorAll(".review-card")];
    cards.sort((a, b) => {
      if (mode === "rating") {
        return parseFloat(b.querySelector(".rating-badge")?.textContent || 0) -
               parseFloat(a.querySelector(".rating-badge")?.textContent || 0);
      }
      if (mode === "title") {
        return (a.querySelector("h3")?.textContent || "").localeCompare(b.querySelector("h3")?.textContent || "");
      }
      return 0;
    });
    cards.forEach(c => list.appendChild(c));
  });
});

document.getElementById("contact-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("form-status");
  const submitButton = form.querySelector("button[type='submit']");

  status.className = "form-status full";

  if (form.action.includes("YOUR_FORM_ID")) {
    const data = new FormData(form);
    const name = data.get("name") || "";
    const email = data.get("email") || "";
    const message = data.get("message") || "";
    const subject = encodeURIComponent("New BLxKpopCrew inquiry");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:blxkpopcrew.in@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = "Opening your email app so you can send the message to BLxKpopCrew.";
    status.classList.add("is-success");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  status.textContent = "Sending your inquiry...";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Form submission failed");

    form.reset();
    status.textContent = "Thanks. Your inquiry has been sent.";
    status.classList.add("is-success");
  } catch (error) {
    status.textContent = "Something went wrong. Please email blxkpopcrew.in@gmail.com.";
    status.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send inquiry";
  }
});

// Archive media filter (All / Photos / Videos)
const archiveFilterBtns = document.querySelectorAll('[data-archive-filter]');
if (archiveFilterBtns.length) {
  archiveFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      archiveFilterBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const filter = btn.dataset.archiveFilter;
      document.querySelectorAll('[data-archive-type]').forEach(el => {
        el.hidden = filter !== 'all' && el.dataset.archiveType !== filter;
      });
    });
  });
}



