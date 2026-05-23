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

// Scroll entrance animations
const animateEls = document.querySelectorAll('[data-animate]');
if (animateEls.length) {
  const animObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      animObs.unobserve(entry.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });
  animateEls.forEach(el => animObs.observe(el));
}

// Filter / tab switching
document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
  tabGroup.addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    const target = tab.dataset.tab;
    const root = tabGroup.closest('[data-tab-root]') || document;
    tabGroup.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    root.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('is-active', p.dataset.panel === target);
    });
  });
});

// Lightbox
(function () {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  const img = lb.querySelector('.lightbox__img');
  const closeBtn = lb.querySelector('.lightbox__close');

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.dataset.lightbox;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}());

// Footer notify form
document.getElementById('footer-notify-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const status = document.getElementById('footer-notify-status');
  if (!status) return;
  status.className = 'form-status';
  if (form.action.includes('YOUR_FORM_ID')) {
    status.textContent = 'Add your Formspree ID to enable notifications.';
    return;
  }
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error();
    form.reset();
    status.textContent = "You're on the list.";
    status.classList.add('is-success');
  } catch {
    status.textContent = 'Something went wrong. Email us directly.';
    status.classList.add('is-error');
  }
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
