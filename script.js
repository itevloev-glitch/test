const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
const slider = document.querySelector('.reviews-slider');
const slides = document.querySelectorAll('.review-card');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
let currentSlide = 0;
let autoSlideInterval;

function setActiveSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function showNextSlide(step = 1) {
  currentSlide = (currentSlide + step + slides.length) % slides.length;
  setActiveSlide(currentSlide);
}

function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => showNextSlide(1), 6000);
}

function handleNavToggle() {
  if (!navLinks || !navToggle) return;
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
}

navToggle?.addEventListener('click', handleNavToggle);

function setActiveNav(id) {
  navItems.forEach((link) => {
    const targetId = link.getAttribute('href');
    const isMatch = targetId === `#${id}`;
    link.classList.toggle('active', isMatch);
    if (isMatch) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

navItems.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    navToggle?.classList.remove('open');
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      setActiveNav(href.replace('#', ''));
    }
  });
});

prevBtn?.addEventListener('click', () => {
  showNextSlide(-1);
  startAutoSlide();
});

nextBtn?.addEventListener('click', () => {
  showNextSlide(1);
  startAutoSlide();
});

if (slider && slides.length > 0) {
  setActiveSlide(currentSlide);
  startAutoSlide();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

document.querySelectorAll('.about-card, .service-card, .expert-card, .technology-card').forEach((card) => {
  card.classList.add('fade-in');
  observer.observe(card);
});

const observedSections = navItems
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter((section) => section instanceof HTMLElement);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    threshold: 0.45,
    rootMargin: '-20% 0px -40% 0px',
  }
);

observedSections.forEach((section) => navObserver.observe(section));

const initialHash = window.location.hash.replace('#', '');
const initialSection = observedSections.find((section) => section.id === initialHash);

if (initialSection) {
  setActiveNav(initialSection.id);
} else if (observedSections.length > 0) {
  setActiveNav(observedSections[0].id);
}
