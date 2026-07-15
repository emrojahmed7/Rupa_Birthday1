/* =========================================================
   PREMIUM BIRTHDAY SURPRISE — script.js
   Vanilla JavaScript only. Shared across all pages.
   =========================================================
   CONTENTS
   1.  Helpers & Config
   2.  Loading screen
   3.  Navigation
   4.  Scroll progress + back to top
   5.  Scroll reveal
   6.  Decor: sparkles + floating hearts
   7.  Global music player
   8.  Secret heart modal
   9.  Memories: lightbox + slideshow
   10. Reasons: reveal one at a time
   11. Wishes: typewriter with controls
   12. Surprise finale: countdown, confetti, fireworks, balloons
   ========================================================= */

(function () {
  'use strict';

  /* =========================
     1. HELPERS & CONFIG
     ========================= */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => Math.random() * (max - min) + min;

  const CONFIG = {
    typewriterSpeed: 35, // ms per character
    lightboxSlideshowInterval: 3000, // ms
    confettiCount: 140,
    fireworksBursts: 6,
    balloonCount: 10,
  };

  /* =========================
     2. LOADING SCREEN
     ========================= */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('is-hidden'), 600);
  });

  /* =========================
     3. NAVIGATION
     ========================= */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  if (navToggle && navLinks) {
    const toggleNav = () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    };

    navToggle.addEventListener('click', toggleNav);

    $$('a', navLinks).forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* =========================
     4. SCROLL PROGRESS + BACK TO TOP + STICKY NAV
     ========================= */
  const progressBar = $('#progressBar');
  const toTop = $('#toTop');

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 20);
    if (toTop) toTop.classList.toggle('is-visible', scrollTop > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
    );
  }

  /* =========================
     5. SCROLL REVEAL
     ========================= */
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !prefersReduced) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* =========================
     6. DECOR: SPARKLES + FLOATING HEARTS
     ========================= */
  function buildSparkles() {
    const wrap = $('#sparkles');
    if (!wrap || prefersReduced) return;
    const count = window.innerWidth < 600 ? 18 : 34;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.style.left = rand(0, 100) + '%';
      s.style.top = rand(0, 100) + '%';
      s.style.animationDuration = rand(2.5, 6) + 's';
      s.style.animationDelay = rand(0, 5) + 's';
      frag.appendChild(s);
    }
    wrap.appendChild(frag);
  }

  function spawnHeart() {
    const wrap = $('#floatingHearts');
    if (!wrap || prefersReduced) return;
    const h = document.createElement('span');
    h.className = 'f-heart';
    h.textContent = ['❤', '💖', '💕', '✨'][Math.floor(rand(0, 4))];
    h.style.left = rand(0, 100) + '%';
    h.style.fontSize = rand(12, 26) + 'px';
    h.style.animationDuration = rand(6, 12) + 's';
    wrap.appendChild(h);
    setTimeout(() => h.remove(), 12000);
  }

  buildSparkles();
  if ($('#floatingHearts') && !prefersReduced) {
    setInterval(spawnHeart, 2200);
  }

  /* =========================
     7. GLOBAL MUSIC PLAYER
     ========================= */
  const audio = $('#bgMusic');
  const musicPlayer = $('#musicPlayer');
  const musicToggle = $('#musicToggle');
  const musicIcon = $('#musicIcon');
  const musicProgress = $('#musicProgress');
  const musicTooltip = $('#musicTooltip');

  if (audio && musicToggle) {
    audio.volume = 0.4;

    audio.addEventListener('loadedmetadata', () => {
      const savedTime = localStorage.getItem('rupa-music-time');
      if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
      }
    });

    const setPlayingUI = (playing) => {
      musicPlayer.classList.toggle('is-playing', playing);
      if (musicIcon) {
        musicIcon.textContent = playing ? '⏸' : '🎵';
      }
      musicToggle.setAttribute(
        'aria-label',
        playing ? 'Pause music' : 'Play music'
      );
    };

    const playMusic = () => {
      const savedTime = localStorage.getItem('rupa-music-time');
      if (savedTime && audio.currentTime < 1) {
        audio.currentTime = parseFloat(savedTime);
      }

      audio.play()
        .then(() => {
          setPlayingUI(true);
          localStorage.setItem('rupa-music', 'on');
        })
        .catch(() => {
          setPlayingUI(false);
        });
    };

    const pauseMusic = () => {
      localStorage.setItem('rupa-music-time', audio.currentTime);
      audio.pause();
      setPlayingUI(false);
      localStorage.setItem('rupa-music', 'off');
    };

    musicToggle.addEventListener('click', () => {
      if (audio.paused) {
        playMusic();
      } else {
        pauseMusic();
      }
    });

    audio.addEventListener('timeupdate', () => {
      localStorage.setItem('rupa-music-time', audio.currentTime);
      if (musicProgress && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        musicProgress.style.width = pct + '%';
        musicProgress.parentElement.setAttribute('aria-valuenow', Math.round(pct));
      }
    });

    audio.addEventListener('ended', () => {
      localStorage.setItem('rupa-music-time', 0);
      setPlayingUI(false);
    });

    // Click on progress bar to seek
    const progressContainer = musicProgress ? musicProgress.parentElement : null;
    if (progressContainer) {
      progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (audio.duration) {
          audio.currentTime = pct * audio.duration;
        }
      });
    }

    // Restore previous play state
    if (localStorage.getItem('rupa-music') === 'on') {
      playMusic();
    }
  }

  /* =========================
     8. SECRET HEART MODAL
     ========================= */
  const secretHeart = $('#secretHeart');
  const secretModal = $('#secretModal');
  const secretClose = $('#secretClose');

  if (secretHeart && secretModal) {
    const openSecret = () => {
      secretModal.classList.add('is-open');
      secretModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const focusable = secretModal.querySelector('button, a, input');
      if (focusable) setTimeout(() => focusable.focus(), 100);
    };

    const closeSecret = () => {
      secretModal.classList.remove('is-open');
      secretModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      secretHeart.focus();
    };

    secretHeart.addEventListener('click', openSecret);
    if (secretClose) secretClose.addEventListener('click', closeSecret);

    secretModal.addEventListener('click', (e) => {
      if (e.target === secretModal) closeSecret();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && secretModal.classList.contains('is-open')) {
        closeSecret();
      }
    });
  }

  /* =========================
     9. MEMORIES: LIGHTBOX + SLIDESHOW
     ========================= */
  const galleryItems = $$('.gallery__item');
  const lightbox = $('#lightbox');

  if (galleryItems.length && lightbox) {
    const lbImg = $('#lbImg');
    const lbCaption = $('#lbCaption');
    const lbCounter = $('#lbCounter');
    const lbLoader = $('#lbLoader');
    const lbClose = $('#lbClose');
    const lbPrev = $('#lbPrev');
    const lbNext = $('#lbNext');
    const lbPlay = $('#lbPlay');

    const slides = galleryItems.map((fig) => {
      const img = $('img', fig);
      const caption = fig.querySelector('figcaption');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') || '' : '',
        caption: caption ? caption.textContent.trim() : ''
      };
    });

    let current = 0;
    let slideTimer = null;

    const render = () => {
      const s = slides[current];
      if (lbLoader) lbLoader.style.display = 'block';
      lbImg.style.opacity = '0';

      const img = new Image();
      img.onload = () => {
        if (lbLoader) lbLoader.style.display = 'none';
        lbImg.style.opacity = '1';
      };
      img.onerror = () => {
        if (lbLoader) lbLoader.style.display = 'none';
        lbImg.style.opacity = '1';
      };
      img.src = s.src;

      lbImg.src = s.src;
      lbImg.alt = s.alt;
      lbCaption.textContent = s.caption;
      lbCounter.textContent = (current + 1) + ' / ' + slides.length;
    };

    const openAt = (i) => {
      current = i;
      render();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      stopSlideshow();
    };

    const next = () => {
      current = (current + 1) % slides.length;
      render();
    };

    const prev = () => {
      current = (current - 1 + slides.length) % slides.length;
      render();
    };

    const startSlideshow = () => {
      if (slideTimer) return;
      slideTimer = setInterval(next, CONFIG.lightboxSlideshowInterval);
      lbPlay.textContent = '❙❙ Pause';
    };

    const stopSlideshow = () => {
      clearInterval(slideTimer);
      slideTimer = null;
      lbPlay.textContent = '▶ Slideshow';
    };

    galleryItems.forEach((fig, i) => {
      fig.addEventListener('click', () => openAt(i));
      fig.setAttribute('tabindex', '0');
      fig.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    if (lbClose) lbClose.addEventListener('click', close);
    if (lbNext) lbNext.addEventListener('click', next);
    if (lbPrev) lbPrev.addEventListener('click', prev);

    if (lbPlay) {
      lbPlay.addEventListener('click', () => {
        slideTimer ? stopSlideshow() : startSlideshow();
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Touch swipe support for lightbox
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = touchStartX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    }, { passive: true });
  }

  /* =========================
     10. REASONS: REVEAL ONE AT A TIME
     ========================= */
  const reasonCards = $$('.reason');
  const reasonCounter = $('#reasonCounter');
  const reasonsCelebration = $('#reasonsCelebration');

  if (reasonCards.length) {
    const updateCounter = () => {
      const open = $$('.reason.is-open').length;
      if (reasonCounter) {
        reasonCounter.textContent = open + ' / ' + reasonCards.length + ' revealed';
      }
      if (reasonsCelebration) {
        if (open === reasonCards.length) {
          reasonsCelebration.classList.add('is-visible');
        } else {
          reasonsCelebration.classList.remove('is-visible');
        }
      }
    };

    reasonCards.forEach((card) => {
      card.addEventListener('click', () => {
        const isOpen = card.classList.contains('is-open');
        reasonCards.forEach((c) => {
          c.classList.remove('is-open');
          c.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          card.classList.add('is-open');
          card.setAttribute('aria-expanded', 'true');
        }
        updateCounter();
      });

      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    updateCounter();
  }

  /* =========================
     11. WISHES: TYPEWRITER
     ========================= */
  const typeEl = $('#typewriter');
  const typewriterCursor = $('#typewriterCursor');
  const typewriterSkip = $('#typewriterSkip');
  const typewriterProgress = $('#typewriterProgress');

  if (typeEl) {
    const letterText =
      "My dearest Rupa, on this special day I want you to know how genuinely and deeply you are valued. You carry a quiet warmth that makes ordinary moments feel meaningful and every space around you feel a little kinder. The way you understand people, and make them feel seen, is a rare and beautiful gift. As this new year begins, may it return to you all the joy, peace, and love you so freely give to others, and may every dream you hold close find its way to you. Thank you for simply being you. Happy Birthday, Rupa. Today, and always, you are truly appreciated.";

    if (prefersReduced) {
      typeEl.textContent = letterText;
      typeEl.classList.add('is-done');
      if (typewriterCursor) typewriterCursor.classList.add('is-hidden');
      if (typewriterSkip) typewriterSkip.classList.add('is-hidden');
      if (typewriterProgress) typewriterProgress.textContent = '100%';
    } else {
      let i = 0;
      let isSkipped = false;

      const type = () => {
        if (isSkipped) return;
        if (i <= letterText.length) {
          typeEl.textContent = letterText.slice(0, i);
          if (typewriterProgress) {
            const pct = Math.round((i / letterText.length) * 100);
            typewriterProgress.textContent = pct + '%';
          }
          i++;
          setTimeout(type, CONFIG.typewriterSpeed);
        } else {
          typeEl.classList.add('is-done');
          if (typewriterCursor) typewriterCursor.classList.add('is-hidden');
          if (typewriterSkip) typewriterSkip.classList.add('is-hidden');
          if (typewriterProgress) typewriterProgress.textContent = '100% ✓';
          // Trigger confetti or celebration
          const event = new CustomEvent('letterComplete');
          document.dispatchEvent(event);
        }
      };

      const skipTyping = () => {
        isSkipped = true;
        typeEl.textContent = letterText;
        typeEl.classList.add('is-done');
        if (typewriterCursor) typewriterCursor.classList.add('is-hidden');
        if (typewriterSkip) typewriterSkip.classList.add('is-hidden');
        if (typewriterProgress) typewriterProgress.textContent = '100% ✓';
        const event = new CustomEvent('letterComplete');
        document.dispatchEvent(event);
      };

      if (typewriterSkip) {
        typewriterSkip.addEventListener('click', skipTyping);
      }

      // Start typing after loader
      setTimeout(type, 800);
    }
  }

  /* =========================
     12. SURPRISE FINALE
     ========================= */
  const finaleStart = $('#finaleStart');
  const revealBtn = $('#revealBtn');
  const finaleCount = $('#finaleCount');
  const countNumber = $('#countNumber');
  const finaleReveal = $('#finaleReveal');
  const replayBtn = $('#replayBtn');
  const balloonsWrap = $('#balloons');
  const canvas = $('#fxCanvas');

  if (revealBtn && finaleReveal) {
    let ctx = null;
    let particles = [];
    let rafId = null;
    let isAnimating = false;

    /* ----- Canvas setup ----- */
    function sizeCanvas() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    if (canvas) {
      ctx = canvas.getContext('2d');
      sizeCanvas();
      window.addEventListener('resize', sizeCanvas);
    }

    const COLORS = ['#e26d8a', '#f7c5d4', '#c9a24b', '#8a7ad6', '#ffd36e', '#ffffff', '#ff6b6b'];

    /* ----- Particle system ----- */
    function addConfetti(amount) {
      const count = prefersReduced ? Math.floor(amount / 3) : amount;
      for (let i = 0; i < count; i++) {
        particles.push({
          type: 'confetti',
          x: rand(0, canvas.width / (window.devicePixelRatio || 1)),
          y: rand(-canvas.height / (window.devicePixelRatio || 1), 0),
          w: rand(6, 12),
          h: rand(8, 16),
          color: COLORS[Math.floor(rand(0, COLORS.length))],
          vx: rand(-1.5, 1.5),
          vy: rand(2, 6),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.2, 0.2)
        });
      }
    }

    function addFirework(x, y) {
      const color = COLORS[Math.floor(rand(0, COLORS.length))];
      const count = prefersReduced ? 20 : 34;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.1, 0.1);
        const speed = rand(2, 5.5);
        particles.push({
          type: 'spark',
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          life: 1,
          size: rand(2, 4)
        });
      }
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.type === 'confetti') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.rot += p.vr;
          if (p.y > canvas.height / (window.devicePixelRatio || 1) + 20) {
            particles.splice(i, 1);
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04;
          p.life -= 0.012;
          if (p.life <= 0) {
            particles.splice(i, 1);
          }
        }
      }
    }

    function drawParticles() {
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      particles.forEach((p) => {
        if (p.type === 'confetti') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        } else {
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    }

    function loop() {
      if (!ctx) return;
      updateParticles();
      drawParticles();
      rafId = requestAnimationFrame(loop);
    }

    function startFx() {
      if (prefersReduced || !ctx) return;
      if (isAnimating) return;
      isAnimating = true;
      particles = [];
      addConfetti(CONFIG.confettiCount);
      loop();

      let bursts = 0;
      const burstTimer = setInterval(() => {
        const dpr = window.devicePixelRatio || 1;
        addFirework(
          rand(canvas.width / dpr * 0.2, canvas.width / dpr * 0.8),
          rand(canvas.height / dpr * 0.2, canvas.height / dpr * 0.5)
        );
        bursts++;
        if (bursts >= CONFIG.fireworksBursts) {
          clearInterval(burstTimer);
          setTimeout(() => {
            isAnimating = false;
          }, 2000);
        }
      }, 700);
    }

    function stopFx() {
      cancelAnimationFrame(rafId);
      particles = [];
      isAnimating = false;
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }

    /* ----- Balloons ----- */
    function launchBalloons() {
      if (!balloonsWrap || prefersReduced) return;
      balloonsWrap.innerHTML = '';
      const colors = ['#e26d8a', '#8a7ad6', '#c9a24b', '#f7c5d4', '#ffd36e', '#ff6b6b', '#74b9ff'];
      const count = prefersReduced ? Math.floor(CONFIG.balloonCount / 2) : CONFIG.balloonCount;
      for (let i = 0; i < count; i++) {
        const b = document.createElement('span');
        b.className = 'balloon';
        b.style.left = rand(2, 92) + '%';
        b.style.background = colors[i % colors.length];
        b.style.width = rand(36, 56) + 'px';
        b.style.height = rand(46, 70) + 'px';
        b.style.animationDuration = rand(6, 12) + 's';
        b.style.animationDelay = rand(0, 3) + 's';
        b.style.transform = 'rotate(' + rand(-8, 8) + 'deg)';
        balloonsWrap.appendChild(b);
      }
    }

    /* ----- Countdown ----- */
    function runCountdown(done) {
      if (prefersReduced) { done(); return; }
      let n = 3;
      finaleCount.classList.add('is-active');
      finaleCount.setAttribute('aria-hidden', 'false');
      countNumber.textContent = n;

      const tick = setInterval(() => {
        n--;
        if (n <= 0) {
          clearInterval(tick);
          finaleCount.classList.remove('is-active');
          finaleCount.setAttribute('aria-hidden', 'true');
          done();
        } else {
          countNumber.textContent = n;
          countNumber.style.animation = 'none';
          void countNumber.offsetWidth;
          countNumber.style.animation = '';
        }
      }, 1000);
    }

    /* ----- The full show ----- */
    function playFinale() {
      if (finaleStart) finaleStart.style.display = 'none';

      runCountdown(() => {
        if (finaleReveal) {
          finaleReveal.classList.add('is-active');
          finaleReveal.setAttribute('aria-hidden', 'false');
        }
        launchBalloons();
        startFx();
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', playFinale);
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        stopFx();
        if (finaleReveal) {
          finaleReveal.classList.remove('is-active');
          finaleReveal.setAttribute('aria-hidden', 'true');
        }
        // Reset balloons
        if (balloonsWrap) balloonsWrap.innerHTML = '';
        // Reset start
        if (finaleStart) finaleStart.style.display = '';
        // Replay after brief delay
        setTimeout(playFinale, 300);
      });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      stopFx();
    });
  }

  /* =========================
     Letter completion celebration
     ========================= */
  document.addEventListener('letterComplete', () => {
    // Add floating hearts celebration
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnHeart(), i * 300);
    }
  });

})();