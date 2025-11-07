const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
const slider = document.querySelector('.reviews-slider');
const slides = document.querySelectorAll('.review-card');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
let currentSlide = 0;
let autoSlideInterval;
let toastTimer;

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

const revealElements = document.querySelectorAll(
  '.about-card, .service-card, .expert-card, .technology-card'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerInstance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach((card) => {
    card.classList.add('fade-in');
    revealObserver.observe(card);
  });
} else {
  revealElements.forEach((card) => {
    card.classList.add('fade-in', 'visible');
  });
}

const observedSections = navItems
  .map((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return null;
    return document.querySelector(href);
  })
  .filter((section) => section instanceof HTMLElement);

if ('IntersectionObserver' in window) {
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
} else {
  const updateActiveNavByScroll = () => {
    const offset = window.innerHeight * 0.35;
    const scrollPosition = window.scrollY + offset;
    let currentId = observedSections[0]?.id;

    observedSections.forEach((section) => {
      const sectionTop = window.scrollY + section.getBoundingClientRect().top;
      if (sectionTop <= scrollPosition) {
        currentId = section.id;
      }
    });

    if (currentId) {
      setActiveNav(currentId);
    }
  };

  window.addEventListener('scroll', updateActiveNavByScroll, { passive: true });
  updateActiveNavByScroll();
}

const initialHash = window.location.hash.replace('#', '');
const initialSection = observedSections.find((section) => section.id === initialHash);

if (initialSection) {
  setActiveNav(initialSection.id);
} else if (observedSections.length > 0) {
  setActiveNav(observedSections[0].id);
}

const bookingForm = document.querySelector('.booking-form');
const formToast = document.querySelector('.form-toast');

if (bookingForm) {
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const targetForm = event.currentTarget;

    if (targetForm instanceof HTMLFormElement) {
      targetForm.reset();
    }

    if (formToast) {
      formToast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        formToast.classList.remove('show');
      }, 2600);
    }
  });
}

const cornerLights = document.querySelectorAll('.corner-light');

cornerLights.forEach((light) => {
  const handleEnter = () => light.classList.add('active');
  const handleLeave = () => light.classList.remove('active');

  light.addEventListener('mouseenter', handleEnter);
  light.addEventListener('mouseleave', handleLeave);
  light.addEventListener('touchstart', handleEnter, { passive: true });
  light.addEventListener('touchend', handleLeave);
  light.addEventListener('touchcancel', handleLeave);
});
