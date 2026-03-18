// main.js — ES module

import { submitLead } from "./api.js";

// ── DOM References ──
const yearEl = document.getElementById("year");
const form = document.querySelector("#contact-form");
const submitBtn = form?.querySelector("button[type='submit']");
const statusEl = document.querySelector("#form-status");
const announcer = document.querySelector("#status-announcer");

// ── Init ──
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// ── Event Listeners ──
form?.addEventListener("submit", handleFormSubmit);

// ── Handlers ──
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Honeypot check — silently discard
  if (data.website) {
    showStatus("success", "Thank you! Your message has been sent.");
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
  data.source = "kore-starter";

  setFormLoading(true);

  try {
    await submitLead(data);
    showStatus("success", "Sent! We\u2019ll get back to you soon.");
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
    submitBtn.textContent = isLoading ? "Sending\u2026" : "Send Message";
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
