/* ==========================================================================
   La Isla Records — interacciones del prototipo
   Sin dependencias, sin backend y sin envío real de datos.
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navToggleLabel = document.querySelector('[data-nav-toggle-label]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileLinks = [...document.querySelectorAll('[data-mobile-link]')];
  const desktopNavLinks = [...document.querySelectorAll('.desktop-nav a[data-nav]')];
  const serviceLinks = [...document.querySelectorAll('[data-service]')];
  const serviceSelect = document.querySelector('[data-service-select]');
  const contactForm = document.querySelector('[data-contact-form]');
  const formStatus = document.getElementById('form-status');
  const messageField = document.getElementById('mensaje');
  const yearTarget = document.querySelector('[data-year]');
  const faqItems = [...document.querySelectorAll('.faq-item')];
  const revealItems = [...document.querySelectorAll('.reveal')];
  const menuAnimationDuration = 240;
  let lastFocusedElement = null;
  let closeMenuTimer = null;

  /* ------------------------------------------------------------------------
     Cabecera y navegación
     ------------------------------------------------------------------------ */
  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  const setActiveNavLink = () => {
    if (!desktopNavLinks.length) return;

    const offset = (header?.offsetHeight ?? 80) + 34;
    const currentSection = desktopNavLinks
      .map((link) => document.querySelector(link.hash))
      .filter(Boolean)
      .reduce((active, section) => {
        return section.getBoundingClientRect().top <= offset ? section : active;
      }, null);

    desktopNavLinks.forEach((link) => {
      if (currentSection && link.hash === `#${currentSection.id}`) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  let scrollTicking = false;
  const handleScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;

    window.requestAnimationFrame(() => {
      setHeaderState();
      setActiveNavLink();
      scrollTicking = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  setHeaderState();
  setActiveNavLink();

  /* ------------------------------------------------------------------------
     Menú móvil
     ------------------------------------------------------------------------ */
  const getMenuFocusables = () => {
    if (!mobileMenu) return [];
    return [
      navToggle,
      ...mobileMenu.querySelectorAll('a[href], button:not([disabled])')
    ].filter(Boolean);
  };

  const openMenu = () => {
    if (!mobileMenu || !navToggle) return;

    window.clearTimeout(closeMenuTimer);
    lastFocusedElement = document.activeElement;
    mobileMenu.hidden = false;
    document.body.classList.add('menu-abierto');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.classList.add('is-open');
    navToggleLabel.textContent = 'Cerrar menú';

    window.requestAnimationFrame(() => {
      mobileMenu.classList.add('is-open');
      const firstLink = mobileMenu.querySelector('a[href]');
      window.setTimeout(() => firstLink?.focus({ preventScroll: true }), 40);
    });
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!mobileMenu || !navToggle) return;

    mobileMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggleLabel.textContent = 'Abrir menú';
    document.body.classList.remove('menu-abierto');

    closeMenuTimer = window.setTimeout(() => {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileMenu.hidden = true;
      }
    }, reduceMotion ? 0 : menuAnimationDuration);

    if (restoreFocus) {
      (lastFocusedElement ?? navToggle).focus({ preventScroll: true });
    }
  };

  navToggle?.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });

  document.querySelectorAll('.brand').forEach((brand) => {
    brand.addEventListener('click', () => {
      if (mobileMenu?.classList.contains('is-open')) {
        closeMenu({ restoreFocus: false });
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!mobileMenu?.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusables = getMenuFocusables();
    if (!focusables.length) return;

    const firstName = focusables[0];
    const lastName = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === firstName) {
      event.preventDefault();
      lastName.focus();
    } else if (!event.shiftKey && document.activeElement === lastName) {
      event.preventDefault();
      firstName.focus();
    }
  });

  const desktopQuery = window.matchMedia('(min-width: 1081px)');
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches && mobileMenu?.classList.contains('is-open')) {
      closeMenu({ restoreFocus: false });
    }
  });

  /* ------------------------------------------------------------------------
     Preselección del servicio en el formulario
     ------------------------------------------------------------------------ */
  serviceLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const requestedService = link.dataset.service;
      if (!requestedService || !serviceSelect) return;

      const matchingOption = [...serviceSelect.options].find(
        (option) => option.value === requestedService
      );

      if (matchingOption) {
        serviceSelect.value = requestedService;
      }

      if (messageField && !messageField.value.trim()) {
        messageField.placeholder = `Cuéntanos sobre tu proyecto de ${requestedService.toLowerCase()}: etapa, canciones, referencias y fechas que tengas en mente...`;
      }

      if (formStatus) {
        formStatus.hidden = true;
        formStatus.textContent = '';
      }
    });
  });

  /* ------------------------------------------------------------------------
     Acordeón de preguntas frecuentes
     ------------------------------------------------------------------------ */
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.open) {
          otherItem.open = false;
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     Formulario de contacto (demostración, sin envío)
     ------------------------------------------------------------------------ */
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (!formStatus) return;

    formStatus.hidden = false;
    formStatus.textContent = 'Borrador listo. Este prototipo no ha enviado la consulta: conecta el formulario a [endpoint / CRM / correo] para activar el envío real.';

    formStatus.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest'
    });
  });

  /* ------------------------------------------------------------------------
     Aparición progresiva de bloques
     ------------------------------------------------------------------------ */
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ------------------------------------------------------------------------
     Año dinámico del pie de página
     ------------------------------------------------------------------------ */
  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }
})();
