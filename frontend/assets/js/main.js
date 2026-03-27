// main.js — ES module

// Module loaded successfully — cancel the fallback timeout from init.js
clearTimeout(window.__jsModuleTimeout);

import { submitLead } from "./api.js";

// ── DOM References ──
const yearEl = document.getElementById("year");
const form = document.querySelector("#signup-form");
const submitBtn = form?.querySelector("button[type='submit']");
const statusEl = document.querySelector("#form-status");
const announcer = document.querySelector("#status-announcer");
const navToggle = document.querySelector(".js-nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const header = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".nav__link");
const backToTopBtn = document.querySelector(".js-back-to-top");
const footerNewsletter = document.querySelector(".footer__newsletter");

// ── Init ──
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// ── Event Listeners ──
form?.addEventListener("submit", handleFormSubmit);
navToggle?.addEventListener("click", handleNavToggle);
backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
footerNewsletter?.addEventListener("submit", handleFooterNewsletter);

// Close mobile nav when clicking a link
navMenu?.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

// ── Header Scroll State ──
function updateHeaderScroll() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  if (backToTopBtn) {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 400);
  }
}

window.addEventListener("scroll", updateHeaderScroll, { passive: true });
updateHeaderScroll();

// ── Scroll Reveal (Intersection Observer) ──
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const revealElements = document.querySelectorAll(".reveal, .reveal--left, .reveal--right, .reveal--scale");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((el) => observer.observe(el));
}

initScrollReveal();

// ── Active Nav Link Tracking ──
function initActiveNavTracking() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const link = document.querySelector(`.nav__link[href="#${id}"]`);
        if (link) {
          link.classList.toggle("is-active", entry.isIntersecting);
        }
      });
    },
    { threshold: 0.15, rootMargin: "-80px 0px -20% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

initActiveNavTracking();

// ── Handlers ──
function handleNavToggle() {
  const isOpen = navMenu?.classList.toggle("is-open");
  navToggle?.setAttribute("aria-expanded", String(isOpen));
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Honeypot check — silently discard
  if (data.website) {
    showStatus("success", "Thanks for signing up!");
    e.target.reset();
    return;
  }
  delete data.website;

  // Client-side validation
  if (!data.email || !data.email.includes("@")) {
    showStatus("error", "Please enter a valid email address.");
    return;
  }

  // Add source
  data.source = "lokality-website";

  setFormLoading(true);

  try {
    await submitLead(data);
    showStatus("success", "You\u2019re on the list! We\u2019ll keep you posted.");
    e.target.reset();
  } catch (error) {
    showStatus("error", error.message || "Something went wrong. Please try again.");
  } finally {
    setFormLoading(false);
  }
}

// ── UI Helpers ──
function setFormLoading(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.textContent = isLoading ? "Signing up\u2026" : "Sign Up for Updates";
  }
}

function showStatus(type, message) {
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `form-status form-status--${type}`;
    statusEl.hidden = false;
  }
  // Announce to screen readers
  if (announcer) {
    announcer.textContent = message;
  }
}

// ── Footer Newsletter Handler ──
async function handleFooterNewsletter(e) {
  e.preventDefault();
  const input = footerNewsletter.querySelector("input[type='email']");
  const email = input?.value?.trim();
  if (!email || !email.includes("@")) return;

  const btn = footerNewsletter.querySelector("button");
  btn.disabled = true;

  try {
    await submitLead({ email, source: "lokality-footer" });
    input.value = "";
    input.placeholder = "You\u2019re in!";
    setTimeout(() => { input.placeholder = "your@email.com"; }, 3000);
  } catch {
    input.placeholder = "Try again";
    setTimeout(() => { input.placeholder = "your@email.com"; }, 3000);
  } finally {
    btn.disabled = false;
  }
}

// ── Micro-interactions: 3D Card Tilt ──
function initCardTilt() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll(".feature-card, .founder-card");
  const MAX_TILT = 6; // degrees

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `perspective(600px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

initCardTilt();

// ── Phone Screenshot Carousel ──
function initPhoneCarousel() {
  const slides = document.querySelectorAll(".phone-carousel__slide");
  const dotsContainer = document.querySelector(".phone-carousel__dots");
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer;
  const INTERVAL = 3500;

  // Build segmented progress bar (Instagram-stories style)
  dotsContainer.className = "phone-carousel__progress";
  dotsContainer.innerHTML = "";
  const segments = [];

  slides.forEach((_, i) => {
    const segment = document.createElement("div");
    segment.className = "phone-carousel__segment";
    const fill = document.createElement("div");
    fill.className = "phone-carousel__segment-fill";
    segment.appendChild(fill);
    segment.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(segment);
    segments.push(fill);
  });

  function updateProgress() {
    segments.forEach((fill, i) => {
      fill.style.transition = "none";
      if (i < current) {
        fill.style.width = "100%";
      } else if (i === current) {
        fill.style.width = "0%";
        fill.offsetWidth; // force reflow
        fill.style.transition = `width ${INTERVAL}ms linear`;
        fill.style.width = "100%";
      } else {
        fill.style.width = "0%";
      }
    });
  }

  function goTo(index) {
    slides[current].classList.remove("is-active");
    current = index;
    slides[current].classList.add("is-active");
    resetTimer();
  }

  function advance() {
    goTo((current + 1) % slides.length);
  }

  function resetTimer() {
    clearInterval(timer);
    updateProgress();
    timer = setInterval(advance, INTERVAL);
  }

  resetTimer();
}

initPhoneCarousel();
