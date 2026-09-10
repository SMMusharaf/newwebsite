// ===== CONFIG =====
const WHATSAPP_NUMBER = "94771234567"; // replace with the resort's real WhatsApp number, no + or leading zero

// ===== NAV: scroll state + mobile menu =====
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }));
}

// ===== CURSOR GLOW (desktop only) =====
const glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(hover:hover)').matches) {
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ===== HERO PHOTO PARALLAX (home page only) =====
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    heroBg.style.transform = `translateY(${y * 0.35}px)`;
  }, { passive: true });
}

// ===== SCROLL REVEAL (IntersectionObserver) =====
const revealTargets = document.querySelectorAll('[data-clip-reveal], .exp-card, .g-item, .contact-card, .review-card');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealTargets.forEach(el => io.observe(el));

document.querySelectorAll('.exp-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.review-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.08}s`;
});

// ===== ANIMATED COUNTERS =====
const counters = document.querySelectorAll('.stat__num');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => counterIO.observe(c));

// ===== DRAG-TO-SCROLL (gallery only — villas is now a static grid) =====
function makeDraggable(track) {
  if (!track) return;
  let isDown = false, startX, scrollLeft, moved = 0;
  track.addEventListener('mousedown', e => {
    isDown = true;
    moved = 0;
    track.classList.add('dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  ['mouseleave', 'mouseup'].forEach(evt =>
    track.addEventListener(evt, () => { isDown = false; track.classList.remove('dragging'); })
  );
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const delta = (x - startX) * 1.4;
    moved = Math.abs(delta);
    track.scrollLeft = scrollLeft - delta;
  });
  // suppress the click that follows a real drag, so gallery items don't
  // accidentally open the lightbox mid-swipe
  track.addEventListener('click', e => {
    if (moved > 6) { e.stopPropagation(); e.preventDefault(); }
  }, true);
}
makeDraggable(document.getElementById('galleryGrid'));

// ===== ARROW NAV BUTTONS =====
function wireTrackArrows(track, prevBtn, nextBtn) {
  if (!track || !prevBtn || !nextBtn) return;
  const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 20 : 300);
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  function updateDisabled() {
    const maxScroll = track.scrollWidth - track.clientWidth - 4;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }
  track.addEventListener('scroll', updateDisabled, { passive: true });
  window.addEventListener('resize', updateDisabled);
  updateDisabled();
}
wireTrackArrows(document.getElementById('galleryGrid'), document.getElementById('galleryPrev'), document.getElementById('galleryNext'));

// ===== EXPERIENCE CARDS: 3D tilt on hover =====
document.querySelectorAll('[data-tilt]').forEach(card => {
  if (!window.matchMedia('(hover:hover)').matches) return;
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateY(0)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== BOOKING FORM -> WHATSAPP (home page only) =====
const form = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');

if (form && submitBtn) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const checkin = form.checkin.value;
    const checkout = form.checkout.value;
    const guests = form.guests.value;
    const villa = form.villa.value;
    const notes = form.notes.value.trim();

    const lines = [
      `Hi Vaelo Bay, I'd like to book a stay.`,
      `Name: ${name}`,
      `Check-in: ${checkin || '—'}`,
      `Check-out: ${checkout || '—'}`,
      `Guests: ${guests}`,
      `Villa preference: ${villa}`,
    ];
    if (notes) lines.push(`Notes: ${notes}`);

    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    submitBtn.classList.add('sending');
    setTimeout(() => {
      window.open(url, '_blank', 'noopener');
      submitBtn.classList.remove('sending');
    }, 550);
  });

  const checkinEl = document.getElementById('checkin');
  const checkoutEl = document.getElementById('checkout');
  const today = new Date().toISOString().split('T')[0];
  if (checkinEl && checkoutEl) {
    checkinEl.min = today;
    checkoutEl.min = today;
    checkinEl.addEventListener('change', (e) => {
      checkoutEl.min = e.target.value;
    });
  }
}

// ===== GALLERY LIGHTBOX (home page only) =====
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const galleryItems = Array.from(document.querySelectorAll('#galleryGrid .g-item'));
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function updateLightbox() {
    const item = galleryItems[currentIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.dataset.caption || '';
    lightboxCaption.textContent = item.dataset.caption || '';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function showNext() { currentIndex = (currentIndex + 1) % galleryItems.length; updateLightbox(); }
  function showPrev() { currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length; updateLightbox(); }

  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxNext').addEventListener('click', showNext);
  document.getElementById('lightboxPrev').addEventListener('click', showPrev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}
const track = document.getElementById("galleryTrack");

let items = Array.from(
    document.querySelectorAll(".gallery-item")
);

function updateGallery() {

    items.forEach(item => {
        item.classList.remove("main-photo");
    });

    items[2].classList.add("main-photo");

    items.forEach(item => {
        track.appendChild(item);
    });
}

function nextPhoto() {
    const first = items.shift();
    items.push(first);

    updateGallery();
}

function prevPhoto() {
    const last = items.pop();
    items.unshift(last);

    updateGallery();
}