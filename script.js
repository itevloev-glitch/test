const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];
const slider = document.querySelector('.reviews-slider');
const slides = document.querySelectorAll('.review-card');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
const scrollProgressBar = document.querySelector('.scroll-progress .progress-bar');
const parallaxSections = document.querySelectorAll('[data-parallax]');
const magneticButtons = document.querySelectorAll('.btn.magnetic');
const counterElements = document.querySelectorAll('[data-counter]');
const navSnakeCanvas = document.querySelector('.nav-snake');
const interactiveCards = document.querySelectorAll('.about-card, .technology-card');
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

if (scrollProgressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    scrollProgressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

const updateParallax = () => {
  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const progress = Math.max(Math.min(offset / window.innerHeight, 1), -1);
    section.style.setProperty('--parallax-offset', progress.toFixed(4));
  });
};

if (parallaxSections.length > 0) {
  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();
}

if (magneticButtons.length > 0) {
  magneticButtons.forEach((button) => {
    const strength = Number(button.dataset.magneticStrength) || 18;
    const resetMagnet = () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    };

    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const relativeX = event.clientX - rect.left - rect.width / 2;
      const relativeY = event.clientY - rect.top - rect.height / 2;
      button.style.setProperty('--magnet-x', `${relativeX / strength}px`);
      button.style.setProperty('--magnet-y', `${relativeY / strength}px`);
    });

    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') {
        resetMagnet();
      }
    });

    button.addEventListener('pointerleave', resetMagnet);
    button.addEventListener('blur', resetMagnet);
  });
}

if (counterElements.length > 0 && 'IntersectionObserver' in window) {
  const animatedCounters = new WeakSet();

  const animateValue = (element) => {
    if (animatedCounters.has(element)) return;
    animatedCounters.add(element);

    const target = Number(element.dataset.counter) || 0;
    const suffix = element.dataset.suffix || '';
    const duration = target > 2000 ? 2000 : 1400;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const current = Math.round(target * eased);
      element.textContent = `${current.toLocaleString('ru-RU')}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counterElements.forEach((counter) => counterObserver.observe(counter));
}

if (counterElements.length > 0 && !('IntersectionObserver' in window)) {
  counterElements.forEach((counter) => {
    const target = Number(counter.dataset.counter) || 0;
    const suffix = counter.dataset.suffix || '';
    counter.textContent = `${target.toLocaleString('ru-RU')}${suffix}`;
  });
}

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

if (navSnakeCanvas instanceof HTMLCanvasElement) {
  const navBar = navSnakeCanvas.closest('.navbar');
  const context = navSnakeCanvas.getContext('2d');

  if (navBar && context) {
    const segmentCount = 22;
    const segments = [];
    let pointer = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let rest = { x: 0, y: 0 };
    let visibility = 0;
    let targetVisibility = 0;

    const initializeSegments = () => {
      segments.length = 0;
      for (let i = 0; i < segmentCount; i += 1) {
        segments.push({ x: rest.x, y: rest.y });
      }
    };

    const resizeCanvas = () => {
      const rect = navBar.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      navSnakeCanvas.width = rect.width * ratio;
      navSnakeCanvas.height = rect.height * ratio;
      navSnakeCanvas.style.width = `${rect.width}px`;
      navSnakeCanvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      rest = { x: rect.width / 2, y: rect.height / 2 };
      pointer = { ...rest };
      target = { ...rest };
      initializeSegments();
    };

    const drawSnake = () => {
      context.clearRect(0, 0, navSnakeCanvas.width, navSnakeCanvas.height);

      if (visibility < 0.01) {
        return;
      }

      context.globalAlpha = visibility;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 6;

      const gradient = context.createLinearGradient(0, 0, navSnakeCanvas.width, 0);
      gradient.addColorStop(0, 'rgba(69, 255, 210, 0.85)');
      gradient.addColorStop(0.5, 'rgba(69, 160, 255, 0.9)');
      gradient.addColorStop(1, 'rgba(130, 240, 255, 0.85)');
      context.strokeStyle = gradient;

      context.beginPath();
      context.moveTo(segments[0].x, segments[0].y);

      for (let i = 1; i < segments.length; i += 1) {
        const previous = segments[i - 1];
        const current = segments[i];
        const midX = (previous.x + current.x) / 2;
        const midY = (previous.y + current.y) / 2;
        context.quadraticCurveTo(previous.x, previous.y, midX, midY);
      }

      context.stroke();
      context.globalAlpha = 1;
    };

    const animate = () => {
      pointer.x += (target.x - pointer.x) * 0.22;
      pointer.y += (target.y - pointer.y) * 0.22;

      segments[0].x += (pointer.x - segments[0].x) * 0.28;
      segments[0].y += (pointer.y - segments[0].y) * 0.28;

      for (let i = 1; i < segments.length; i += 1) {
        const previous = segments[i - 1];
        const current = segments[i];
        current.x += (previous.x - current.x) * 0.38;
        current.y += (previous.y - current.y) * 0.38;
      }

      visibility += (targetVisibility - visibility) * 0.08;

      drawSnake();
      requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(animate);

    const updateTarget = (event) => {
      const rect = navSnakeCanvas.getBoundingClientRect();
      target = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      targetVisibility = 1;
    };

    navBar.addEventListener('pointerenter', updateTarget);
    navBar.addEventListener('pointermove', updateTarget);
    navBar.addEventListener('pointerleave', () => {
      target = { ...rest };
      targetVisibility = 0.18;
    });
  }
}

if (interactiveCards.length > 0) {
  const resetCard = (card) => {
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--pointer-x');
    card.style.removeProperty('--pointer-y');
    card.style.removeProperty('--lift');
  };

  interactiveCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width;
      const yRatio = (event.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - yRatio) * 14;
      const tiltY = (xRatio - 0.5) * 14;

      card.style.setProperty('--tilt-x', tiltX.toFixed(3));
      card.style.setProperty('--tilt-y', tiltY.toFixed(3));
      card.style.setProperty('--pointer-x', `${xRatio * 100}%`);
      card.style.setProperty('--pointer-y', `${yRatio * 100}%`);
      card.style.setProperty('--lift', '-12px');
    });

    card.addEventListener('pointerleave', () => resetCard(card));
    card.addEventListener('blur', () => resetCard(card));
  });
}

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

const detailData = {
  doctor: {
    sabirova: {
      name: 'Альбина Сабирова',
      subtitle: 'Главный врач, семейный терапевт',
      description:
        'Кандидат медицинских наук с 18-летним опытом. Сопровождает семьи на каждом этапе: от подготовки к беременности до поддержания здоровья старших поколений.',
      highlights: [
        'Автор комплексной семейной программы наблюдения',
        'Куратор школ по хроническим заболеваниям и профилактике',
        'Наставник молодых врачей клиники «Семья»',
      ],
      schedule: [
        { day: 'Пн, Ср', time: '09:00 – 15:00' },
        { day: 'Пт', time: '12:00 – 19:00' },
        { day: 'Сб', time: '10:00 – 14:00 (по записи)' },
      ],
      image:
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Альбина Сабирова — главный врач клиники «Семья»',
      reviews: [],
    },
    khasanov: {
      name: 'Ильнар Хасанов',
      subtitle: 'Педиатр-неонатолог',
      description:
        'Специализируется на ведении детей первого года жизни, поддерживает родителей в вопросах питания и безопасной вакцинации, проводит диагностику в клинике и дома.',
      highlights: [
        'Ведёт программу раннего развития «Здоровый старт»',
        'Сопровождает детей с перинатальными особенностями',
        'Проводит консультации в формате телемедицины',
      ],
      schedule: [
        { day: 'Вт, Чт', time: '08:30 – 14:00' },
        { day: 'Пт', time: '15:00 – 19:30' },
        { day: 'Вс', time: '10:00 – 13:00 (по записи)' },
      ],
      image:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Ильнар Хасанов — педиатр клиники «Семья»',
      reviews: [],
    },
    vavilova: {
      name: 'Ольга Вавилова',
      subtitle: 'Акушер-гинеколог',
      description:
        'Помогает будущим мамам пройти путь беременности уверенно и спокойно, сопровождает восстановление после родов и ведёт программы женского здоровья.',
      highlights: [
        'Сертифицированный специалист по доказательной медицине',
        'Ведёт курс подготовки к родам и постнатальной реабилитации',
        'Работает в мультидисциплинарной команде с психологом и доулой',
      ],
      schedule: [
        { day: 'Пн, Ср', time: '13:00 – 19:30' },
        { day: 'Сб', time: '09:00 – 15:00' },
      ],
      image:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Ольга Вавилова — акушер-гинеколог клиники «Семья»',
      reviews: [],
    },
  },
  program: {
    start: {
      name: 'Программа «Здоровый старт»',
      subtitle: 'Комплексное сопровождение малыша до года',
      description:
        'Годовой план наблюдения ребёнка с регулярными осмотрами педиатра, вакцинопрофилактикой и поддержкой мамы 24/7.',
      highlights: [
        'Персональный координатор семьи и круглосуточный чат',
        'Календарь вакцинации и напоминания о приёмах',
        'Домашние визиты неонатолога при необходимости',
      ],
      modules: [
        { title: '12 визитов педиатра', detail: 'каждые 4 недели' },
        { title: '5 консультаций узких специалистов', detail: 'по показаниям' },
        { title: 'Вакцинация', detail: 'по индивидуальному графику' },
        { title: 'Поддержка мамы', detail: 'консультант по ГВ' },
      ],
      duration: 'Длительность программы: 12 месяцев',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Мама с ребёнком в клинике «Семья»',
    },
    heart: {
      name: 'Программа «Сердце семьи»',
      subtitle: 'Кардиологическое наблюдение для родителей',
      description:
        'Системная профилактика сердечно-сосудистых заболеваний с участием терапевта, кардиолога и нутрициолога.',
      highlights: [
        'Контроль артериального давления и ЭКГ на дому',
        'Персональный план питания и активности',
        'Доступ к телемедицинским консультациям',
      ],
      modules: [
        { title: '8 консультаций специалистов', detail: 'кардиолог, терапевт' },
        { title: 'Лабораторные чекапы', detail: '2 раза в год' },
        { title: 'Функциональная диагностика', detail: 'ЭКГ, холтер' },
        { title: 'Рекомендации', detail: 'индивидуальный план' },
      ],
      duration: 'Длительность программы: 9 месяцев',
      image:
        'https://images.unsplash.com/photo-1580281658629-14147cb75b17?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Кардиологическая диагностика в клинике «Семья»',
    },
    care: {
      name: 'Программа «Забота о старших»',
      subtitle: 'Поддержка старших членов семьи',
      description:
        'Удобный формат сопровождения пожилых родственников: домашние визиты, телемедицина и контроль лечения без очередей.',
      highlights: [
        'Персональный план наблюдения и напоминания о приёмах',
        'Организация транспортировки и сопровождения',
        'Контроль приёма лекарств и отчёты семье',
      ],
      modules: [
        { title: 'Домашние визиты', detail: '2 раза в месяц' },
        { title: 'Телемедицина', detail: 'круглосуточная связь' },
        { title: 'Реабилитация', detail: 'индивидуальные занятия' },
        { title: 'Координация лечения', detail: 'узкие специалисты' },
      ],
      duration: 'Длительность программы: 6 месяцев с продлением',
      image:
        'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=880&q=80',
      imageAlt: 'Старшее поколение получает поддержку в клинике «Семья»',
    },
  },
};

const detailOverlay = document.querySelector('.detail-overlay');
const detailCloseButton = detailOverlay?.querySelector('.detail-close');
const detailImage = detailOverlay?.querySelector('.detail-image');
const detailTitle = detailOverlay?.querySelector('.detail-title');
const detailSubtitle = detailOverlay?.querySelector('.detail-subtitle');
const detailDescription = detailOverlay?.querySelector('.detail-description');
const detailHighlights = detailOverlay?.querySelector('.detail-highlights');
const detailSchedule = detailOverlay?.querySelector('.detail-schedule');
const scheduleList = detailOverlay?.querySelector('.schedule-list');
const detailProgram = detailOverlay?.querySelector('.detail-program');
const programList = detailOverlay?.querySelector('.program-list');
const programDuration = detailOverlay?.querySelector('.program-duration');
const detailReviewsContainer = detailOverlay?.querySelector('.detail-reviews');
const detailReviewsList = detailOverlay?.querySelector('.detail-reviews-list');
const detailNoReviews = detailOverlay?.querySelector('.detail-no-reviews');
const detailReviewForm = detailOverlay?.querySelector('.detail-review-form');
const detailReviewSuccess = detailOverlay?.querySelector('.detail-review-success');
const detailTriggers = document.querySelectorAll('[data-detail-type][data-detail-id]');

let activeDetail = null;
let lastFocusedElement = null;

function setHidden(element, hidden) {
  if (element) {
    element.classList.toggle('is-hidden', Boolean(hidden));
  }
}

function renderHighlights(items = []) {
  if (!detailHighlights) return;
  detailHighlights.innerHTML = '';

  if (!items.length) {
    detailHighlights.classList.add('is-hidden');
    return;
  }

  detailHighlights.classList.remove('is-hidden');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    detailHighlights.appendChild(li);
  });
}

function renderSchedule(schedule = []) {
  if (!scheduleList || !detailSchedule) return;
  scheduleList.innerHTML = '';

  if (!schedule.length) {
    setHidden(detailSchedule, true);
    return;
  }

  setHidden(detailSchedule, false);
  schedule.forEach(({ day, time }) => {
    const li = document.createElement('li');
    const daySpan = document.createElement('span');
    daySpan.textContent = day;
    const timeSpan = document.createElement('span');
    timeSpan.textContent = time;
    li.append(daySpan, timeSpan);
    scheduleList.appendChild(li);
  });
}

function renderProgram(modules = [], duration = '') {
  if (!programList || !programDuration || !detailProgram) return;
  programList.innerHTML = '';

  if (!modules.length) {
    setHidden(detailProgram, true);
    if (programDuration) {
      programDuration.textContent = '';
      programDuration.classList.add('is-hidden');
    }
    return;
  }

  setHidden(detailProgram, false);
  modules.forEach((module) => {
    const li = document.createElement('li');
    if (module && typeof module === 'object' && 'title' in module) {
      const titleSpan = document.createElement('span');
      titleSpan.textContent = module.title;
      li.appendChild(titleSpan);
      if ('detail' in module && module.detail) {
        const detailSpan = document.createElement('span');
        detailSpan.textContent = module.detail;
        li.appendChild(detailSpan);
      }
    } else {
      li.textContent = String(module);
    }
    programList.appendChild(li);
  });

  programDuration.textContent = duration;
  programDuration.classList.toggle('is-hidden', !duration);
}

function renderReviews(reviews = []) {
  if (!detailReviewsList || !detailNoReviews) return;
  detailReviewsList.innerHTML = '';

  if (!reviews.length) {
    setHidden(detailReviewsList, true);
    detailNoReviews.classList.remove('is-hidden');
    return;
  }

  setHidden(detailReviewsList, false);
  detailNoReviews.classList.add('is-hidden');

  reviews.forEach(({ name, rating, message, createdAt }) => {
    const li = document.createElement('li');
    const reviewer = document.createElement('strong');
    reviewer.textContent = `${name} — ${rating}★`;
    const text = document.createElement('p');
    text.textContent = message;
    const date = document.createElement('span');
    date.textContent = createdAt;
    li.append(reviewer, text, date);
    detailReviewsList.appendChild(li);
  });
}

function openDetail(type, id) {
  const dataset = detailData[type]?.[id];
  if (!dataset || !detailOverlay) return;

  activeDetail = { type, id };
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  detailTitle.textContent = dataset.name;
  detailSubtitle.textContent = dataset.subtitle ?? '';
  detailDescription.textContent = dataset.description ?? '';
  renderHighlights(dataset.highlights ?? []);

  if (detailImage) {
    detailImage.src = dataset.image ?? '';
    detailImage.alt = dataset.imageAlt ?? dataset.name;
  }

  if (type === 'doctor') {
    renderSchedule(dataset.schedule ?? []);
    renderProgram([], '');
    setHidden(detailReviewsContainer, false);
    renderReviews(dataset.reviews ?? []);
    if (detailNoReviews && (dataset.reviews?.length ?? 0) === 0) {
      detailNoReviews.classList.remove('is-hidden');
    }
    if (detailReviewForm) {
      detailReviewForm.dataset.detailType = type;
      detailReviewForm.dataset.detailId = id;
      detailReviewForm.reset();
      const ratingField = detailReviewForm.querySelector('#review-rating');
      if (ratingField instanceof HTMLSelectElement) {
        ratingField.value = '5';
      }
    }
  } else {
    renderSchedule([]);
    renderProgram(dataset.modules ?? [], dataset.duration ?? '');
    setHidden(detailReviewsContainer, true);
    if (detailReviewForm) {
      detailReviewForm.dataset.detailType = '';
      detailReviewForm.dataset.detailId = '';
    }
  }

  if (detailReviewSuccess) {
    detailReviewSuccess.textContent = '';
  }

  detailOverlay.classList.add('open');
  detailOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  detailCloseButton?.focus();
}

function closeDetail() {
  if (!detailOverlay) return;
  detailOverlay.classList.remove('open');
  detailOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  detailReviewForm?.reset();
  if (detailReviewSuccess) {
    detailReviewSuccess.textContent = '';
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
  activeDetail = null;
}

detailTriggers.forEach((trigger) => {
  const type = trigger.getAttribute('data-detail-type');
  const id = trigger.getAttribute('data-detail-id');
  if (!type || !id) return;

  const handleActivate = (event) => {
    event.preventDefault();
    openDetail(type, id);
  };

  trigger.addEventListener('click', handleActivate);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActivate(event);
    }
  });
});

detailCloseButton?.addEventListener('click', closeDetail);

detailOverlay?.addEventListener('click', (event) => {
  if (event.target === detailOverlay) {
    closeDetail();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && detailOverlay?.classList.contains('open')) {
    event.preventDefault();
    closeDetail();
  }
});

detailReviewForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeDetail || activeDetail.type !== 'doctor') return;

  const formData = new FormData(detailReviewForm);
  const name = (formData.get('review-name') || '').toString().trim();
  const rating = (formData.get('review-rating') || '5').toString();
  const message = (formData.get('review-message') || '').toString().trim();

  if (!name || !message) {
    return;
  }

  const review = {
    name,
    rating,
    message,
    createdAt: new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };

  detailData.doctor[activeDetail.id].reviews.unshift(review);
  renderReviews(detailData.doctor[activeDetail.id].reviews);
  detailReviewForm.reset();
  const ratingField = detailReviewForm.querySelector('#review-rating');
  if (ratingField instanceof HTMLSelectElement) {
    ratingField.value = '5';
  }
  if (detailReviewSuccess) {
    detailReviewSuccess.textContent = 'Спасибо! Ваш отзыв отправлен.';
  }
});
