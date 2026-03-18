/* ════════════════════════════════════════════════════════════════
   MAISON ÉLISE — script.js
   Handles: navbar scroll, mobile menu, custom scroll animations,
   product filters, testimonial carousel, wishlist, newsletter,
   cart counter, back-to-top, toast notifications
════════════════════════════════════════════════════════════════ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initProductFilters();
  initWishlist();
  initTestimonialCarousel();
  initNewsletter();
  initCartCounter();
  initBackToTop();
  initSmoothScroll();
  initLazyImages();
});

/* ════════════════════════════════════════════════════════════════
   NAVBAR — scroll shrink + active link highlight
════════════════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run on load

  // Active link on scroll
  const sections = document.querySelectorAll("section[id], div[id='hero']");
  const navLinks  = document.querySelectorAll(".navbar-links a[data-section]");

  const linkObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove("active"));
          const match = document.querySelector(`.navbar-links a[data-section="${entry.target.id}"]`);
          if (match) match.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px" }
  );
  sections.forEach(s => linkObserver.observe(s));
}

/* ════════════════════════════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const links      = mobileMenu ? mobileMenu.querySelectorAll("a") : [];
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  links.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", false);
      document.body.style.overflow = "";
    });
  });

  // Close on outside click
  document.addEventListener("click", e => {
    if (
      mobileMenu.classList.contains("open") &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", false);
      document.body.style.overflow = "";
    }
  });
}

/* ════════════════════════════════════════════════════════════════
   CUSTOM SCROLL ANIMATIONS
   Uses IntersectionObserver to trigger data-anim elements
════════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const animEls = document.querySelectorAll("[data-anim]");
  if (!animEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("anim-visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.12 }
  );
  animEls.forEach(el => observer.observe(el));
}

/* ════════════════════════════════════════════════════════════════
   PRODUCT FILTERS
════════════════════════════════════════════════════════════════ */
function initProductFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const products   = document.querySelectorAll(".product-item");
  if (!filterBtns.length || !products.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.filter;

      products.forEach(item => {
        const match = category === "all" || item.dataset.category === category;

        if (match) {
          item.style.transition = "opacity .35s ease, transform .35s ease";
          item.style.opacity    = "1";
          item.style.transform  = "scale(1)";
          item.style.display    = "";
        } else {
          item.style.opacity    = "0";
          item.style.transform  = "scale(.95)";
          setTimeout(() => {
            if (item.dataset.category !== (document.querySelector(".filter-btn.active")?.dataset.filter || "all")) {
              item.style.display = "none";
            }
          }, 350);
        }
      });
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   WISHLIST (heart toggle)
════════════════════════════════════════════════════════════════ */
function initWishlist() {
  document.querySelectorAll(".product-wish").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const active = btn.classList.toggle("active");
      const icon   = btn.querySelector("i");
      if (icon) icon.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
      showToast(active ? "Added to wishlist" : "Removed from wishlist", active ? "fa-heart" : "fa-heart-crack");
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   TESTIMONIAL CAROUSEL
════════════════════════════════════════════════════════════════ */
function initTestimonialCarousel() {
  const track    = document.getElementById("testiTrack");
  const prevBtn  = document.getElementById("testiPrev");
  const nextBtn  = document.getElementById("testiNext");
  const dotsWrap = document.getElementById("testiDots");
  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll(".testimonial-slide");
  const total  = slides.length;
  let current  = 0;
  let autoTimer;

  // Build dots
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "testi-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll(".testi-dot").forEach((d, i) => {
      d.classList.toggle("active", i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  prevBtn.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener("click", () => { goTo(current + 1); resetAuto(); });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener("touchend",   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
    resetAuto();
  }, { passive: true });

  // Auto-advance every 5s
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();
}

/* ════════════════════════════════════════════════════════════════
   NEWSLETTER FORM
════════════════════════════════════════════════════════════════ */
function initNewsletter() {
  const form  = document.getElementById("newsletterForm");
  const input = document.getElementById("newsletterEmail");
  if (!form || !input) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email || !isValidEmail(email)) {
      input.style.outline = "2px solid #e05c5c";
      input.style.outlineOffset = "-2px";
      setTimeout(() => { input.style.outline = ""; }, 1800);
      showToast("Please enter a valid email address", "fa-circle-exclamation");
      return;
    }
    // Simulated submission
    const btn = form.querySelector(".newsletter-submit");
    btn.textContent = "✓ Subscribed!";
    btn.style.background = "#4caf82";
    input.value = "";
    showToast("Welcome! You're subscribed 🎉", "fa-envelope");
    setTimeout(() => {
      btn.textContent = "Subscribe";
      btn.style.background = "";
    }, 3000);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

/* ════════════════════════════════════════════════════════════════
   CART COUNTER — add to bag animation
════════════════════════════════════════════════════════════════ */
function initCartCounter() {
  const cartCountEl = document.getElementById("cartCount");
  let count = 2; // start with 2 items

  document.querySelectorAll(".product-overlay-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      count++;
      if (cartCountEl) cartCountEl.textContent = count;

      // Bump animation
      if (cartCountEl) {
        cartCountEl.style.transform = "scale(1.5)";
        cartCountEl.style.transition = "transform .2s";
        setTimeout(() => { cartCountEl.style.transform = ""; }, 200);
      }

      showToast("Item added to your bag", "fa-bag-shopping");
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ════════════════════════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 72; // navbar height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   LAZY IMAGE PLACEHOLDER ANIMATION
════════════════════════════════════════════════════════════════ */
function initLazyImages() {
  // Simulate a subtle load fade on placeholder elements
  document.querySelectorAll(".placeholder-img").forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transition = `opacity .6s ease ${i * 0.05}s`;
    requestAnimationFrame(() => { el.style.opacity = "1"; });
  });
}

/* ════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════════════════════════ */
let toastTimeout;
function showToast(message, iconClass = "fa-check") {
  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-msg";
    toast.id = "toastMsg";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${message}`;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ════════════════════════════════════════════════════════════════
   COUNTER ANIMATION (About section stats)
════════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll(".counter-num");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.target || "0");
      const suffix = el.dataset.suffix || "";
      const dur    = 1800;
      const start  = performance.now();

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (Number.isInteger(target) ? Math.floor(target * ease) : (target * ease).toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   CURSOR SPARKLE (subtle luxury touch on desktop)
════════════════════════════════════════════════════════════════ */
(function initCursorSparkle() {
  if (window.matchMedia("(pointer: coarse)").matches) return; // skip touch

  document.addEventListener("mousemove", e => {
    if (Math.random() > 0.92) { // only ~8% of moves
      const sparkle = document.createElement("div");
      sparkle.style.cssText = `
        position:fixed; pointer-events:none; z-index:99999;
        left:${e.clientX}px; top:${e.clientY}px;
        width:4px; height:4px; border-radius:50%;
        background:#c9a96e; opacity:.7;
        transform:translate(-50%,-50%);
        transition: opacity .6s ease, transform .6s ease;
      `;
      document.body.appendChild(sparkle);
      requestAnimationFrame(() => {
        sparkle.style.opacity = "0";
        sparkle.style.transform = `translate(-50%, -${20 + Math.random() * 20}px) scale(0)`;
      });
      setTimeout(() => sparkle.remove(), 700);
    }
  }, { passive: true });
})();
