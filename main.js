/* =====================================================
   TRUPTI GANDHI – Main JS
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  // ---- LOADER ----
  const loader = document.getElementById('loader');
  if (loader) {
    const hideLoader = () => loader.classList.add('hidden');
    if (document.readyState === 'complete') {
      requestAnimationFrame(hideLoader);
    } else {
      window.addEventListener('load', hideLoader, { once: true });
    }
  }

  // ---- CUSTOM CURSOR (desktop only) ----
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (cursor && follower && window.innerWidth > 768 && hasFinePointer && !prefersReducedMotion) {
    let fx = 0, fy = 0;
    window.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      fx += (e.clientX - fx) * 0.12;
      fy += (e.clientY - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
    });
    // Lerp loop for smooth follower
    function lerpCursor() {
      fx += (parseFloat(cursor.style.left || 0) - fx) * 0.1;
      fy += (parseFloat(cursor.style.top  || 0) - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(lerpCursor);
    }
    lerpCursor();

    document.querySelectorAll('a, button, .service-card, .gallery__card, .pkg-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        follower.style.width = '56px';
        follower.style.height = '56px';
        follower.style.borderColor = 'var(--rose)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        follower.style.width = '36px';
        follower.style.height = '36px';
        follower.style.borderColor = 'var(--gold)';
      });
    });
  }

  // ---- NAV: scroll shrink + toggle ----
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const overlay = document.getElementById('mobile-overlay');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });
    // Close on mobile link click
    overlay.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav__link');
  if (sections.length && navAnchors.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active-link'));
          const match = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
          if (match) match.classList.add('active-link');
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));
  }

  // ---- COUNTER ANIMATION ----
  function animateCount(el, target) {
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) {
        clearInterval(timer);
        el.textContent = target;
      }
    }, 20);
  }

  const counters = document.querySelectorAll('.stat__num');
  if (counters.length) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.done) {
          entry.target.dataset.done = true;
          animateCount(entry.target, parseInt(entry.target.dataset.count));
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));
  }

  // ---- SCROLL REVEAL (class-based) ----
  if (!prefersReducedMotion && typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({ reset: false, distance: '50px', duration: 900, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
    sr.reveal('.service-card',  { origin: 'bottom', interval: 120 });
    sr.reveal('.pkg-card',      { origin: 'bottom', interval: 150 });
    sr.reveal('.testi-card',    { origin: 'bottom', interval: 150 });
    sr.reveal('.insta-tile',    { origin: 'bottom', interval: 100 });
    sr.reveal('.gallery__card', { origin: 'bottom', interval: 100 });
  }

  // ---- HERO CAROUSEL ----
  const heroSlides = document.querySelectorAll('.hero__slide');
  if (heroSlides.length > 1) {
    const switchDelay = 5000;
    let currentSlide = 0;
    let sliderTimer;

    const goToSlide = (nextIndex) => {
      heroSlides[currentSlide].classList.remove('is-active');
      currentSlide = nextIndex;
      heroSlides[currentSlide].classList.add('is-active');
    };

    const startSlider = () => {
      sliderTimer = setInterval(() => {
        const next = (currentSlide + 1) % heroSlides.length;
        goToSlide(next);
      }, switchDelay);
    };

    const stopSlider = () => {
      clearInterval(sliderTimer);
    };

    if (!prefersReducedMotion) startSlider();

    document.addEventListener('visibilitychange', () => {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        stopSlider();
      } else {
        stopSlider();
        startSlider();
      }
    });
  }

  // ---- GALLERY LIGHTBOX ----
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  if (lightbox) {
    let images = [];
    let currentIndex = 0;

    const clickableMedia = document.querySelectorAll('.gallery__card, .insta-tile');
    clickableMedia.forEach((tile) => {
      const img = tile.querySelector('img');
      if (img) {
        const index = images.length;
        images.push({ src: img.src, alt: img.alt });
        tile.addEventListener('click', (e) => {
          // Insta tiles are anchors; keep click on-page and open lightbox instead.
          if (tile.matches('.insta-tile')) e.preventDefault();
          currentIndex = index;
          openLightbox(index);
        });
      }
    });

    function openLightbox(i) {
      if (!images[i]) return;
      lbImg.src = images[i].src;
      lbImg.alt = images[i].alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    lbClose && lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    lbPrev && lbPrev.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      openLightbox(currentIndex);
    });
    lbNext && lbNext.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      openLightbox(currentIndex);
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + images.length) % images.length; openLightbox(currentIndex); }
      if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % images.length; openLightbox(currentIndex); }
    });
  }

  // ---- FILTER TABS (portfolio page) ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery__card[data-cat]');
  if (filterBtns.length) {
    const applyFilter = (filter) => {
      filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
      galleryCards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.style.display = 'block';
          card.style.animation = 'revealUp 0.5s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyFilter(btn.dataset.filter);
      });
    });

    const validFilters = new Set(Array.from(filterBtns, btn => btn.dataset.filter));
    const qsFilter = new URLSearchParams(window.location.search).get('filter');
    if (qsFilter && validFilters.has(qsFilter)) {
      applyFilter(qsFilter);
    }
  }

  // ---- WHATSAPP CONTACT FORM ----
  window.sendWhatsApp = function () {
    const name    = document.getElementById('fname')?.value.trim();
    const phone   = document.getElementById('fphone')?.value.trim();
    const service = document.getElementById('fservice')?.value;
    const date    = document.getElementById('fdate')?.value;
    const msg     = document.getElementById('fmsg')?.value.trim();

    if (!name) { alert('Please enter your name.'); return; }
    if (!service) { alert('Please select a service.'); return; }

    let text = `Hi Trupti! 🙏\n\n`;
    text += `*Name:* ${name}\n`;
    if (phone) text += `*Phone:* ${phone}\n`;
    text += `*Service:* ${service}\n`;
    if (date) text += `*Date:* ${date}\n`;
    if (msg) text += `*Message:* ${msg}\n`;

    const url = `https://wa.me/917038884076?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ---- SMOOTH PARALLAX on Hero orbs ----
  const orbs = document.querySelectorAll('.hero__orb');
  if (orbs.length && !prefersReducedMotion) {
    // Use requestAnimationFrame for smoother performance on scroll
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 0.15;
          orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
      });
    }, { passive: true });
  }

});
