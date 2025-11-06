const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
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
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
}

navToggle?.addEventListener('click', handleNavToggle);

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
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
