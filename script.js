const weddingDate = new Date("2026-11-30T17:00:00+05:30");
const loader = document.querySelector(".page-loader");
const audio = document.getElementById("wedding-audio");
const musicControl = document.querySelector(".music-control");
window.addEventListener("load", () => setTimeout(() => loader.classList.add("hide"), 500));

function setMusicState(isPlaying) {
  musicControl.innerHTML = isPlaying ? "Ⅱ <span>Pause</span>" : "♫ <span>Play music</span>";
  musicControl.setAttribute("aria-pressed", String(isPlaying));
}

async function playWeddingMusic() {
  try {
    audio.load();
    await audio.play();
    setMusicState(true);
  } catch {
    setMusicState(false);
  }
}

document.querySelector(".open-invitation").addEventListener("click", () => {
  document.querySelector(".invitation-content").scrollIntoView({ behavior: "smooth" });
  startAutoScroll();
  playWeddingMusic();
});

const scrollControl = document.querySelector(".scroll-control");
let autoScrollTimer = null;
let autoScrollPaused = false;
let manualScrollTimeout = null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function startAutoScroll() {
  if (reduceMotion || autoScrollTimer || autoScrollPaused) return;
  autoScrollTimer = window.setInterval(() => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      stopAutoScroll();
      scrollControl.innerHTML = "↻ <span>Scroll again</span>";
      scrollControl.setAttribute("aria-label", "Start automatic scrolling again");
      scrollControl.setAttribute("aria-pressed", "true");
      return;
    }
    window.scrollBy({ top: 1, behavior: "auto" });
  }, 45);
}

function stopAutoScroll() {
  window.clearInterval(autoScrollTimer);
  autoScrollTimer = null;
}

scrollControl.addEventListener("click", () => {
  autoScrollPaused = !autoScrollPaused;
  if (autoScrollPaused) {
    stopAutoScroll();
    scrollControl.innerHTML = "▶ <span>Resume scroll</span>";
    scrollControl.setAttribute("aria-label", "Resume automatic scrolling");
  } else {
    scrollControl.innerHTML = "Ⅱ <span>Pause scroll</span>";
    scrollControl.setAttribute("aria-label", "Pause automatic scrolling");
    startAutoScroll();
  }
  scrollControl.setAttribute("aria-pressed", String(autoScrollPaused));
});

window.addEventListener("wheel", () => {
  if (!autoScrollTimer) return;
  stopAutoScroll();
  clearTimeout(manualScrollTimeout);
  manualScrollTimeout = window.setTimeout(startAutoScroll, 2500);
});

document.querySelector(".share-invitation").addEventListener("click", () => {
  const message = encodeURIComponent("You are warmly invited to celebrate the wedding of Nikki Yadav & Bablu Yadav on 30 November 2026.");
  window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
});

document.querySelector(".print-invitation").addEventListener("click", () => window.print());

const eventTrack = document.querySelector(".event-grid");
const eventCards = [...document.querySelectorAll(".event-card")];
const eventDots = document.querySelector(".carousel-dots");
let eventIndex = 0;
let eventTimer;
let eventInteractionTimer;
eventCards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = "carousel-dot";
  dot.setAttribute("aria-label", `Show event ${index + 1}`);
  dot.addEventListener("click", () => {
    eventIndex = index;
    renderEvents();
    restartEventTimer();
    window.addEventListener("resize", renderEvents);
  });
  eventDots.appendChild(dot);
});

function renderEvents() {
  const cardWidth = eventCards[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(eventTrack).gap) || 0;
  eventTrack.style.transform = `translateX(-${eventIndex * (cardWidth + gap)}px)`;
  document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === eventIndex);
    dot.setAttribute("aria-current", index === eventIndex ? "true" : "false");
  });
}

function moveEvent(direction) {
  eventIndex = (eventIndex + direction + eventCards.length) % eventCards.length;
  renderEvents();
}

function restartEventTimer() {
  clearInterval(eventTimer);
  eventTimer = setInterval(() => moveEvent(1), 4500);
}

document.querySelector(".event-arrow-left").addEventListener("click", () => { moveEvent(-1); restartEventTimer(); });
document.querySelector(".event-arrow-right").addEventListener("click", () => { moveEvent(1); restartEventTimer(); });
eventTrack.addEventListener("mouseenter", () => clearInterval(eventTimer));
eventTrack.addEventListener("mouseleave", restartEventTimer);
renderEvents();
restartEventTimer();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function updateCountdown() {
  const difference = weddingDate.getTime() - Date.now();
  const values = difference > 0 ? {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  } : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  Object.entries(values).forEach(([unit, value]) => {
    document.querySelector(`[data-unit="${unit}"]`).textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

musicControl.addEventListener("click", async () => {
  if (audio.paused) {
    await playWeddingMusic();
  } else {
    audio.pause();
    setMusicState(false);
  }
});

audio.addEventListener("ended", () => {
  audio.currentTime = 0;
  playWeddingMusic();
});
audio.addEventListener("error", () => setMusicState(false));

const lightbox = document.querySelector(".lightbox");
const lightboxLabel = document.querySelector(".lightbox-label");
document.querySelectorAll(".gallery-tile").forEach((tile) => tile.addEventListener("click", () => {
  lightboxLabel.textContent = tile.dataset.image;
  lightbox.hidden = false;
}));
document.querySelector(".lightbox-close").addEventListener("click", () => { lightbox.hidden = true; });
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.hidden = true; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") lightbox.hidden = true; });
