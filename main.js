const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"], .footer-nav a[href^="#"], .brand[href^="#"], .footer-brand[href^="#"]');
const revealItems = document.querySelectorAll("[data-reveal]");
const faqItems = document.querySelectorAll(".faq-item");
const codeOutput = document.querySelector("[data-code-output]");
const codeStatus = document.querySelector("[data-code-status]");
const codeFile = document.querySelector("[data-code-file]");
const servicesToggle = document.querySelector("[data-services-toggle]");
const extraServiceCards = document.querySelectorAll("[data-service-extra]");
const servicesSection = document.querySelector("#services");
const scrollTopButton = document.querySelector(".scroll-top-button");
const siteHeaderElement = document.querySelector(".site-header");
const reviewsSlider = document.querySelector("[data-reviews-slider]");
const reviewsTrack = reviewsSlider?.querySelector("[data-reviews-track]");
const reviewSlides = reviewsSlider ? Array.from(reviewsSlider.querySelectorAll("[data-review-slide]")) : [];
const reviewsDots = reviewsSlider?.querySelector("[data-reviews-dots]");
const reviewsStatus = reviewsSlider?.querySelector(".reviews-status");
const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const codeSnippets = [
  {
    file: "hero.tsx",
    code: [
      "const project = {",
      '  layout: "landing",',
      '  style: "glass",',
      '  status: "ready"',
      "};",
    ].join("\n"),
  },
  {
    file: "fix-ui.js",
    code: [
      "if (client.needsUpdate) {",
      "  improveUI();",
      "  fixBugs();",
      "  deployPatch();",
      "}",
    ].join("\n"),
  },
  {
    file: "support.ts",
    code: [
      "function launchTask(task) {",
      "  estimate(task);",
      "  buildCleanUI();",
      "  return deliverFast();",
      "}",
    ].join("\n"),
  },
];

function setMenuState(isOpen) {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.setAttribute("aria-expanded", String(isOpen));
  siteNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      setMenuState(false);
    }
  });
}

revealItems.forEach((item) => {
  const delay = item.dataset.delay;

  if (delay) {
    item.style.setProperty("--delay", `${delay}ms`);
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

function renderCodeSnippet(snippet, visibleChars) {
  if (!codeOutput) {
    return;
  }

  codeOutput.textContent = snippet.code.slice(0, visibleChars);

  if (codeFile) {
    codeFile.textContent = snippet.file;
  }
}

function startCodeTypingAnimation() {
  if (!codeOutput || codeSnippets.length === 0) {
    return;
  }

  if (prefersReducedMotion) {
    renderCodeSnippet(codeSnippets[0], codeSnippets[0].code.length);

    if (codeStatus) {
      codeStatus.textContent = "preview";
    }

    return;
  }

  let snippetIndex = 0;
  let visibleChars = 0;
  let isDeleting = false;

  const tick = () => {
    const activeSnippet = codeSnippets[snippetIndex];

    renderCodeSnippet(activeSnippet, visibleChars);

    let delay = isDeleting ? 18 : 42;

    if (!isDeleting && visibleChars < activeSnippet.code.length) {
      visibleChars += 1;

      if (codeStatus) {
        codeStatus.textContent = "typing";
      }
    } else if (!isDeleting) {
      isDeleting = true;
      delay = 1100;

      if (codeStatus) {
        codeStatus.textContent = "clearing";
      }
    } else if (visibleChars > 0) {
      visibleChars -= 1;

      if (codeStatus) {
        codeStatus.textContent = "rewriting";
      }
    } else {
      isDeleting = false;
      snippetIndex = (snippetIndex + 1) % codeSnippets.length;
      delay = 240;

      if (codeStatus) {
        codeStatus.textContent = "typing";
      }
    }

    window.setTimeout(tick, delay);
  };

  tick();
}

startCodeTypingAnimation();

if (servicesToggle) {
  if (extraServiceCards.length === 0) {
    servicesToggle.hidden = true;
  } else {
    servicesToggle.addEventListener("click", () => {
      const isExpanded = servicesToggle.getAttribute("aria-expanded") === "true";
      const nextExpanded = !isExpanded;

      extraServiceCards.forEach((card) => {
        card.hidden = !nextExpanded;
      });

      servicesToggle.setAttribute("aria-expanded", String(nextExpanded));
      servicesToggle.textContent = nextExpanded ? "Скрыть" : "Показать еще";
    });
  }
}

if (reviewsSlider && reviewsTrack && reviewSlides.length > 0) {
  let activeReviewPage = 0;
  let reviewPageCount = 1;
  let reviewAutoplayId = 0;
  let reviewAutoplayPaused = false;

  function getReviewsPerView() {
    if (window.innerWidth <= 720) {
      return 1;
    }

    if (window.innerWidth <= 1150) {
      return 2;
    }

    return 3;
  }

  function updateReviewDots() {
    if (!reviewsDots) {
      return;
    }

    const dotButtons = Array.from(reviewsDots.querySelectorAll("button"));

    dotButtons.forEach((button, index) => {
      const isActive = index === activeReviewPage;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function stopReviewAutoplay() {
    if (reviewAutoplayId) {
      window.clearInterval(reviewAutoplayId);
      reviewAutoplayId = 0;
    }
  }

  function startReviewAutoplay() {
    stopReviewAutoplay();

    if (reviewPageCount <= 1) {
      if (reviewsStatus) {
        reviewsStatus.textContent = "Один экран отзывов";
      }

      return;
    }

    if (prefersReducedMotion || reviewAutoplayPaused) {
      if (reviewsStatus) {
        reviewsStatus.textContent = prefersReducedMotion ? "Автопрокрутка отключена" : "Автопрокрутка на паузе";
      }

      return;
    }

    reviewAutoplayId = window.setInterval(() => {
      activeReviewPage = (activeReviewPage + 1) % reviewPageCount;
      syncReviewsSlider();
    }, 4600);

    if (reviewsStatus) {
      reviewsStatus.textContent = "Автопрокрутка включена";
    }
  }

  function buildReviewDots() {
    if (!reviewsDots) {
      return;
    }

    reviewsDots.innerHTML = "";
    reviewsDots.hidden = reviewPageCount <= 1;

    for (let index = 0; index < reviewPageCount; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.setAttribute("aria-label", `Перейти к отзыву ${index + 1}`);

      dot.addEventListener("click", () => {
        activeReviewPage = index;
        syncReviewsSlider();
        startReviewAutoplay();
      });

      reviewsDots.append(dot);
    }
  }

  function syncReviewsSlider(resetPage = false) {
    const reviewsPerView = getReviewsPerView();
    const previousPageCount = reviewPageCount;
    const nextPageCount = Math.max(1, Math.ceil(reviewSlides.length / reviewsPerView));
    const viewport = reviewsTrack.parentElement;
    const firstSlide = reviewSlides[0];

    reviewsSlider.style.setProperty("--reviews-per-view", String(reviewsPerView));
    reviewPageCount = nextPageCount;

    if (resetPage || activeReviewPage >= reviewPageCount) {
      activeReviewPage = 0;
    }

    if (previousPageCount !== reviewPageCount) {
      buildReviewDots();
    }

    if (!viewport || !firstSlide) {
      updateReviewDots();
      return;
    }

    const trackStyles = window.getComputedStyle(reviewsTrack);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || "0");
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const stepWidth = (slideWidth + gap) * reviewsPerView;
    const rawOffset = activeReviewPage * stepWidth;
    const maxOffset = Math.max(0, reviewsTrack.scrollWidth - viewport.clientWidth);
    const offset = Math.min(rawOffset, maxOffset);

    reviewsTrack.style.transform = `translateX(-${offset}px)`;

    updateReviewDots();

    if (reviewsStatus && reviewPageCount <= 1) {
      reviewsStatus.textContent = "Один экран отзывов";
    }
  }

  buildReviewDots();
  syncReviewsSlider(true);
  startReviewAutoplay();

  reviewsSlider.addEventListener("mouseenter", () => {
    reviewAutoplayPaused = true;
    stopReviewAutoplay();

    if (reviewsStatus && !prefersReducedMotion) {
      reviewsStatus.textContent = "Автопрокрутка на паузе";
    }
  });

  reviewsSlider.addEventListener("mouseleave", () => {
    reviewAutoplayPaused = false;
    startReviewAutoplay();
  });

  reviewsSlider.addEventListener("focusin", () => {
    reviewAutoplayPaused = true;
    stopReviewAutoplay();

    if (reviewsStatus && !prefersReducedMotion) {
      reviewsStatus.textContent = "Автопрокрутка на паузе";
    }
  });

  reviewsSlider.addEventListener("focusout", (event) => {
    if (reviewsSlider.contains(event.relatedTarget)) {
      return;
    }

    reviewAutoplayPaused = false;
    startReviewAutoplay();
  });

  window.addEventListener("resize", () => {
    syncReviewsSlider();
    startReviewAutoplay();
  });
}

function updateScrollTopButtonVisibility() {
  if (!scrollTopButton || !servicesSection) {
    return;
  }

  const headerOffset = siteHeaderElement ? siteHeaderElement.offsetHeight : 0;
  const triggerPoint = Math.max(0, servicesSection.offsetTop - headerOffset - 24);
  const shouldShow = window.scrollY >= triggerPoint;

  scrollTopButton.classList.toggle("is-visible", shouldShow);
  scrollTopButton.setAttribute("aria-hidden", String(!shouldShow));
  scrollTopButton.tabIndex = shouldShow ? 0 : -1;
}

if (scrollTopButton && servicesSection) {
  updateScrollTopButtonVisibility();

  window.addEventListener("scroll", updateScrollTopButtonVisibility, { passive: true });
  window.addEventListener("resize", updateScrollTopButtonVisibility);
}

function closeFaq(item) {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!button || !answer) {
    return;
  }

  button.setAttribute("aria-expanded", "false");
  answer.classList.remove("open");
  answer.style.maxHeight = "0px";
}

function openFaq(item) {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!button || !answer) {
    return;
  }

  button.setAttribute("aria-expanded", "true");
  answer.classList.add("open");
  answer.style.maxHeight = `${answer.scrollHeight}px`;
}

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!button || !answer) {
    return;
  }

  if (button.getAttribute("aria-expanded") === "true") {
    openFaq(item);
  } else {
    closeFaq(item);
  }

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";

    faqItems.forEach((faqItem) => {
      if (faqItem !== item) {
        closeFaq(faqItem);
      }
    });

    if (isOpen) {
      closeFaq(item);
      return;
    }

    openFaq(item);
  });
});

window.addEventListener("load", () => {
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");

    if (button && button.getAttribute("aria-expanded") === "true") {
      openFaq(item);
    }
  });
});
