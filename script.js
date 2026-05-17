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
