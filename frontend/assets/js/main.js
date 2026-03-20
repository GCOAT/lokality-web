// main.js — ES module

import { submitLead } from "./api.js";

// ── DOM References ──
const yearEl = document.getElementById("year");
const form = document.querySelector("#signup-form");
const submitBtn = form?.querySelector("button[type='submit']");
const statusEl = document.querySelector("#form-status");
const announcer = document.querySelector("#status-announcer");
const navToggle = document.querySelector(".js-nav-toggle");
const navMenu = document.querySelector("#nav-menu");

// ── Init ──
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// ── Event Listeners ──
form?.addEventListener("submit", handleFormSubmit);
navToggle?.addEventListener("click", handleNavToggle);

// Close mobile nav when clicking a link
navMenu?.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

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
    submitBtn.textContent = isLoading ? "Signing up\u2026" : "Sign Up";
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
