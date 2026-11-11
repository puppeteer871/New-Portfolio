/**
 * PORTFOLIO JAVASCRIPT
 * Interactions for Filtering, Video/Audio Media Playback, and Carousel
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCategoryFilters();
  initVideoPlayers();
  initAudioPlayers();
  initCarousels();
  initBrandSheetScroll();
  initTapCarousels();
  initImageFallback();
});

/* --------------------------------------------------------------------------
   1b. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  const backdrop = document.getElementById('nav-backdrop');
  if (!menuBtn || !mainNav) return;

  const toggleMenu = (open) => {
    const shouldOpen = (open !== undefined) ? open : !mainNav.classList.contains('is-open');
    menuBtn.classList.toggle('is-active', shouldOpen);
    mainNav.classList.toggle('is-open', shouldOpen);
    if (backdrop) backdrop.classList.toggle('is-open', shouldOpen);
    menuBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', shouldOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('menu-open', shouldOpen);
  };

  menuBtn.addEventListener('click', () => toggleMenu());

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMenu(false));
  }

  // Close when clicking any nav link
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });

  // Close when viewport is resized above mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mainNav.classList.contains('is-open')) {
      toggleMenu(false);
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   2. Project Filter Tabs
   -------------------------------------------------------------------------- */
function initCategoryFilters() {
  const filterChips = document.querySelectorAll('.chip[data-f]');
  const cards = document.querySelectorAll('.card[data-cat]');

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle active states on chips
      filterChips.forEach(c => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));

      const category = chip.dataset.f;

      // Show/hide cards according to filter
      cards.forEach(card => {
        const matches = (category === 'all' || card.dataset.cat === category);
        if (matches) {
          card.hidden = false;
        } else {
          card.hidden = true;
          // Pause any media playing inside hidden card
          pauseMediaInCard(card);
        }
      });
    });
  });
}

function pauseMediaInCard(card) {
  const vid = card.querySelector('video');
  const aud = card.querySelector('audio');
  const playBtn = card.querySelector('.play');
  const audBtn = card.querySelector('.audio-play-btn');

  if (vid && !vid.paused) {
    vid.pause();
    if (playBtn) playBtn.style.opacity = '1';
  }
  if (aud && !aud.paused) {
    aud.pause();
    if (audBtn) audBtn.innerHTML = 'Ã¢â€“Â¶';
  }
}

/* --------------------------------------------------------------------------
   3. Video Player Controls
   -------------------------------------------------------------------------- */
function initVideoPlayers() {
  // Handle regular video cards (.card.vid)
  const videoCards = document.querySelectorAll('.card.vid');
  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.play');
    const poster = card.querySelector('.vid-poster');
    if (!video || !playBtn) return;
    const togglePlay = () => {
      const src = video.getAttribute('src');
      if (!src) { alert('To preview this video, add your .mp4 file to the "assets/video/" folder and link it via src="..." in index.html'); return; }
      if (video.paused) {
        pauseAllMedia(video);
        video.hidden = false;
        if (poster) poster.style.display = 'none';
        video.play().then(() => { playBtn.style.opacity = '0'; }).catch(err => { console.warn('Playback prevented:', err); if (poster) poster.style.display = ''; });
      } else { video.pause(); playBtn.style.opacity = '1'; }
    };
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('ended', () => { playBtn.style.opacity = '1'; video.hidden = true; if (poster) poster.style.display = ''; });
    video.addEventListener('pause', () => { playBtn.style.opacity = '1'; });
  });

  // Handle showreel Ã¢â‚¬â€ click anywhere on the box to play/pause
  const showreelBox = document.querySelector('.showreel-box');
  if (showreelBox) {
    const video = showreelBox.querySelector('video');
    const poster = showreelBox.querySelector('.vid-poster');
    if (video) {
      const togglePlay = () => {
        const src = video.getAttribute('src');
        if (!src) return;
        if (video.paused) {
          pauseAllMedia(video);
          video.hidden = false;
          if (poster) poster.style.display = 'none';
          video.play().then(() => { showreelBox.classList.add('is-playing'); })
            .catch(err => { console.warn('Playback prevented:', err); if (poster) poster.style.display = ''; });
        } else {
          video.pause();
          showreelBox.classList.remove('is-playing');
        }
      };
      showreelBox.addEventListener('click', togglePlay);
      video.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
      video.addEventListener('ended', () => { video.hidden = true; if (poster) poster.style.display = ''; showreelBox.classList.remove('is-playing'); });
      video.addEventListener('pause', () => { showreelBox.classList.remove('is-playing'); });
    }
  }
}

/* --------------------------------------------------------------------------
   4. Audio Player Controls
   -------------------------------------------------------------------------- */
function initAudioPlayers() {
  const audioCards = document.querySelectorAll('.card.audio-card');

  audioCards.forEach(card => {
    const audio = card.querySelector('audio');
    const playBtn = card.querySelector('.audio-play-btn');
    const progressBar = card.querySelector('.audio-bar');
    const progressFill = card.querySelector('.audio-fill');
    const currentTimeEl = card.querySelector('.current-time');
    const durationTimeEl = card.querySelector('.duration-time');

    if (!audio || !playBtn) return;

    const formatTime = (seconds) => {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Load duration when metadata is ready
    audio.addEventListener('loadedmetadata', () => {
      if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
    });

    const toggleAudio = () => {
      const src = audio.getAttribute('src');
      if (!src) {
        alert('To play this audio track, add your .mp3 file to the "assets/audio/" folder and link it via src="..." in index.html');
        return;
      }

      if (audio.paused) {
        pauseAllMedia(audio);
        audio.play().then(() => {
          playBtn.innerHTML = 'Ã¢ÂÅ¡Ã¢ÂÅ¡';
          playBtn.setAttribute('aria-label', 'Pause audio');
        }).catch(err => {
          console.warn('Playback prevented:', err);
        });
      } else {
        audio.pause();
        playBtn.innerHTML = 'Ã¢â€“Â¶';
        playBtn.setAttribute('aria-label', 'Play audio');
      }
    };

    playBtn.addEventListener('click', toggleAudio);

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    // Reset when finished
    audio.addEventListener('ended', () => {
      playBtn.innerHTML = 'Ã¢â€“Â¶';
      if (progressFill) progressFill.style.width = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '0:00';
    });

    // Click on progress bar to seek
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        audio.currentTime = clickPosition * audio.duration;
      });
    }
  });
}

function pauseAllMedia(exceptElement) {
  document.querySelectorAll('video').forEach(v => {
    if (v !== exceptElement && !v.paused) {
      v.pause();
      v.hidden = true;
      const parent = v.closest('.card.vid, .showreel-box');
      if (parent) {
        const btn = parent.querySelector('.play');
        if (btn) btn.style.opacity = '1';
        const poster = parent.querySelector('.vid-poster');
        if (poster) poster.style.display = '';
      }
    }
  });

  document.querySelectorAll('audio').forEach(a => {
    if (a !== exceptElement && !a.paused) {
      a.pause();
      const parent = a.closest('.card.audio-card');
      if (parent) {
        const btn = parent.querySelector('.audio-play-btn');
        if (btn) btn.innerHTML = 'Ã¢â€“Â¶';
      }
    }
  });
}

/* --------------------------------------------------------------------------
   5. Carousel Controllers
   -------------------------------------------------------------------------- */
function initCarousels() {
  // 1. Social Carousels (Supports buttons in .car-bar or .car-wrapper)
  const carCards = document.querySelectorAll('.carousel-card');
  carCards.forEach(card => {
    const container = card.querySelector('.car');
    const prevBtn = card.querySelector('.car-prev');
    const nextBtn = card.querySelector('.car-next');

    if (!container) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
      });
    }
  });

  // Standalone carousel wrappers fallback
  const carWrappers = document.querySelectorAll('.car-wrapper:not(.carousel-card .car-wrapper)');
  carWrappers.forEach(wrapper => {
    const container = wrapper.querySelector('.car');
    const prevBtn = wrapper.querySelector('.car-prev');
    const nextBtn = wrapper.querySelector('.car-next');

    if (!container) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
      });
    }
  });

  // 2. Brand Identity - Manual Scroll with Infinite Seamless Loop (vertical)
  const caseWrappers = document.querySelectorAll('.case-scroll-wrapper');
  caseWrappers.forEach(wrapper => {
    const container = wrapper.querySelector('.case-scroll');
    if (!container) return;

    // Clone all items to create a seamless loop
    const originalItems = Array.from(container.querySelectorAll('.case-item'));
    if (originalItems.length < 2) return;

    const itemCount = originalItems.length;
    const dots = Array.from(wrapper.querySelectorAll('.case-dot'));

    // Prepend + append clones for infinite loop
    const clonesBefore = originalItems.map(el => el.cloneNode(true));
    const clonesAfter  = originalItems.map(el => el.cloneNode(true));
    clonesBefore.reverse().forEach(cl => { cl.setAttribute('aria-hidden', 'true'); container.prepend(cl); });
    clonesAfter .forEach(cl => { cl.setAttribute('aria-hidden', 'true'); container.append(cl); });

    const totalSets = 3;

    // Jump to middle set instantly (no animation)
    const jumpToMiddle = () => {
      container.scrollTop = container.scrollHeight / totalSets;
    };
    requestAnimationFrame(() => requestAnimationFrame(jumpToMiddle));

    const getItemHeight = () => container.scrollHeight / totalSets / itemCount;

    // Update dot indicators to reflect current real index
    const updateDots = () => {
      if (!dots.length) return;
      const itemH       = getItemHeight();
      const setH        = itemH * itemCount;
      const offsetInSet = container.scrollTop % setH;
      const idx         = Math.round(offsetInSet / itemH) % itemCount;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };

    // Silent teleport back to middle set when reaching clone zones
    let scrollEndTimer = null;
    const handleScrollEnd = () => {
      const itemH = getItemHeight();
      const setH  = itemH * itemCount;
      const st    = container.scrollTop;
      if (st >= setH * 2) container.scrollTop = st - setH;
      if (st <  setH)     container.scrollTop = st + setH;
      updateDots();
    };

    container.addEventListener('scroll', () => {
      updateDots();
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(handleScrollEnd, 150);
    }, { passive: true });

    // Drag-to-scroll (mouse)
    let isDown = false, startY = 0, scrollTopStart = 0;

    container.addEventListener('mousedown', e => {
      isDown = true;
      startY = e.pageY - container.offsetTop;
      scrollTopStart = container.scrollTop;
      container.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.style.cursor = '';
      handleScrollEnd();
    });
    container.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      container.scrollTop = scrollTopStart - (e.pageY - container.offsetTop - startY) * 1.5;
    });
  });
}

/* --------------------------------------------------------------------------
   6. Automatic Image Extension Fallback (.svg -> .png -> .jpg -> .webp)
   -------------------------------------------------------------------------- */
function initImageFallback() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      const src = this.getAttribute('src');
      if (!src) return;
      if (src.endsWith('.svg') && !this.dataset.fallback1) {
        this.dataset.fallback1 = 'true';
        this.src = src.replace('.svg', '.png');
      } else if (src.endsWith('.png') && !this.dataset.fallback2) {
        this.dataset.fallback2 = 'true';
        this.src = src.replace('.png', '.jpg');
      } else if (src.endsWith('.jpg') && !this.dataset.fallback3) {
        this.dataset.fallback3 = 'true';
        this.src = src.replace('.jpg', '.webp');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Tap-to-Advance Carousels (no buttons Ã¢â‚¬â€ tap anywhere to go forward, loops)
   -------------------------------------------------------------------------- */
function initTapCarousels() {
  const carCards = document.querySelectorAll('.carousel-card');

  carCards.forEach(card => {
    const track = card.querySelector('.car');
    if (!track) return;

    const slides = track.querySelectorAll('.slide-img, .ph');
    const total = slides.length;
    let currentIndex = 0;

    // Distinguish a tap from a drag/swipe Ã¢â‚¬â€ only fire if finger didn't move much
    let pointerStartX = 0;
    let pointerStartY = 0;
    let didMove = false;
    const MOVE_THRESHOLD = 8;

    track.addEventListener('pointerdown', e => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      didMove = false;
    }, { passive: true });

    track.addEventListener('pointermove', e => {
      const dx = Math.abs(e.clientX - pointerStartX);
      const dy = Math.abs(e.clientY - pointerStartY);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) didMove = true;
    }, { passive: true });

    track.addEventListener('pointerup', () => {
      if (didMove || !slides.length) return;
      currentIndex = (currentIndex + 1) % total;
      track.scrollTo({ left: slides[currentIndex].offsetLeft, behavior: 'smooth' });
    }, { passive: true });

    // Sync index on native swipe
    track.addEventListener('scroll', () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth) % total;
      currentIndex = idx;
    }, { passive: true });
  });
}

/* --------------------------------------------------------------------------
   Journey Viewer Ã¢â‚¬â€ pan-on-click scene viewer
   -------------------------------------------------------------------------- */
(function initJourneyViewer() {

  // Ã¢â€â‚¬Ã¢â€â‚¬ CONFIG (change these when you update the image) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const IMAGE_SRC   = 'assets/journey-strip.jpg';
  const SCENE_COUNT = 7;
  const SCENE_TITLES = [
    'December 2025: Starting from zero',
    'January 2026: First portfolio, first paychecks',
    "February 2026: My first 'job'",
    'March 2026: A project that mattered',
    'March to August 2026: Learning, always',
    'September 2026: Simira Diagnostics',
    'The next chapter',
  ];
  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  const frame    = document.getElementById('jny-frame');
  const track    = document.getElementById('jny-track');
  const img      = document.getElementById('jny-img');
  const dotsWrap = document.getElementById('jny-dots');
  const prevBtn  = document.getElementById('jny-prev');
  const nextBtn  = document.getElementById('jny-next');
  const hint     = document.getElementById('jny-hint');
  const live     = document.getElementById('jny-live');

  if (!frame || !track) return;   // section not on this page

  // Pass scene count to CSS for the track width calculation
  track.style.setProperty('--jny-scenes', SCENE_COUNT);
  // Also set it on :root so the CSS var is available
  document.documentElement.style.setProperty('--jny-scenes', SCENE_COUNT);

  let current = 0;
  let hintDismissed = false;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Build pager dots Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  for (let i = 0; i < SCENE_COUNT; i++) {
    const dot = document.createElement('button');
    dot.className = 'journey-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Chapter ${i + 1}: ${SCENE_TITLES[i]}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
    });
    dotsWrap.appendChild(dot);
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Core: go to a scene Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  function goTo(index) {
    if (index < 0 || index >= SCENE_COUNT) return;
    current = index;

    // Pan: offset = -100% Ãƒâ€” (current / SCENE_COUNT) of track width
    // Track is SCENE_COUNT Ãƒâ€” frame width Ã¢â€ â€™ each scene = 100%/SCENE_COUNT of track
    // So scene N starts at: N Ãƒâ€” (100% / SCENE_COUNT) of track = N Ãƒâ€” frameWidth
    // translateX moves the track left by N scene-widths
    // One scene-width in track-% = 100% / SCENE_COUNT
    const pct = (100 / SCENE_COUNT) * current;
    track.style.transform = `translateX(-${pct}%)`;

    // will-change only while animating
    track.style.willChange = 'transform';
    const clear = () => { track.style.willChange = 'auto'; };
    track.removeEventListener('transitionend', clear);
    track.addEventListener('transitionend', clear, { once: true });

    // Dots
    dotsWrap.querySelectorAll('.journey-dot').forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    // Arrows
    prevBtn.hidden = (current === 0);
    nextBtn.hidden = (current === SCENE_COUNT - 1);

    // Live region
    live.textContent = `Chapter ${current + 1} of ${SCENE_COUNT}: ${SCENE_TITLES[current]}`;

    // Dismiss hint on first interaction
    if (!hintDismissed) {
      hintDismissed = true;
      hint.classList.add('hidden');
    }
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Frame click: left half = prev, right half = next Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  let hasSwiped = false;

  frame.addEventListener('click', (e) => {
    if (hasSwiped) {
      hasSwiped = false;
      return;
    }
    const rect = frame.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    if (relX >= rect.width / 2) {
      goTo(current + 1);
    } else {
      goTo(current - 1);
    }
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Arrow buttons Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current - 1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current + 1); });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Keyboard (Enter/Space = forward; ArrowLeft/Right on the frame) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  frame.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Touch swipe (40px threshold, never blocks vertical scroll) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  let touchStartX = 0;
  let touchStartY = 0;

  frame.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    hasSwiped = false;
  }, { passive: true });

  frame.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only register as horizontal swipe if more horizontal than vertical
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    hasSwiped = true;
    if (dx < 0) goTo(current + 1);   // swipe left → next
    else        goTo(current - 1);   // swipe right → prev
  }, { passive: true });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Image fallback Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const fallback = track.querySelector('.journey-fallback');
  img.addEventListener('error', () => {
    img.style.display = 'none';
    if (fallback) fallback.classList.add('visible');
  });

  // Ã¢â€â‚¬Ã¢â€â‚¬ Initial state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  goTo(0);

})();

/* --------------------------------------------------------------------------
   9. Brand Sheet Scroll â€” drag-to-scroll for single tall-image brand cards
   -------------------------------------------------------------------------- */
function initBrandSheetScroll() {
  const sheets = document.querySelectorAll('.brand-sheet-scroll');

  sheets.forEach(container => {
    // â”€â”€ Mouse drag â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let isDown = false;
    let startY = 0;
    let scrollTopStart = 0;

    container.addEventListener('mousedown', e => {
      isDown = true;
      startY = e.pageY;
      scrollTopStart = container.scrollTop;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.style.cursor = '';
    });

    container.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      container.scrollTop = scrollTopStart - (e.pageY - startY) * 1.5;
    });

    // Scroll-hint pill: fade out after first scroll
    const wrapper = container.closest('.brand-sheet-wrapper');
    const pill = wrapper ? wrapper.querySelector('.case-scroll-pill') : null;
    if (pill) {
      container.addEventListener('scroll', () => {
        if (container.scrollTop > 20) {
          pill.style.opacity = '0';
          pill.style.pointerEvents = 'none';
        } else {
          pill.style.opacity = '';
          pill.style.pointerEvents = '';
        }
      }, { passive: true });
    }
  });
}

/* --------------------------------------------------------------------------
   10. Fun Fact Popup â€” loads facts.txt, picks randomly, shows popup
   -------------------------------------------------------------------------- */
(function initFunFact() {
  const factBtn  = document.getElementById('fact-btn');
  const popup    = document.getElementById('fact-popup');
  const textEl   = document.getElementById('fact-text');
  const nextBtn  = document.getElementById('fact-next');
  const closeBtn = document.getElementById('fact-close');
  if (!factBtn || !popup) return;

  // Web Audio API Synthesized Bubble Pop Sound
  let audioCtx = null;
  function playPopSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // Pre-loaded facts array with clean ASCII characters
  let facts = [
    "Nike\u0027s swoosh logo was designed by college student Carolyn Davidson for just $35 in 1971. Phil Knight later gifted her diamond ring and 500 shares of stock.",
    "The FedEx logo features a hidden arrow between the letters \"E\" and \"x\", symbolizing forward momentum and precision speed.",
    "It takes approximately 50 milliseconds (0.05 seconds) for a visitor to form a visual first impression of a website or brand.",
    "Red triggers appetite and heart-rate elevation, which is why McDonald\u0027s, KFC, Pizza Hut, and Burger King all prominently feature red.",
    "Kerning refers to adjusting the spatial balance between individual character pairs. Neglecting it can transform innocent phrases into unintentional memes.",
    "William Addison Dwiggins officially coined the title \"Graphic Designer\" in 1922 to describe his multifaceted work in book design, lettering, and typography.",
    "Visual perception studies show that up to 90% of snap purchase judgments are based on colour palette alone.",
    "Helvetica (created in 1957 by Max Miedinger and Eduard Hoffmann) is so iconic that it starred in its own feature-length documentary in 2007.",
    "The bite in the Apple logo was intentionally designed by Rob Janoff so people wouldn\u0027t confuse the icon with a cherry or tomato at miniature sizes.",
    "Negative space is active design. Removing visual clutter and letting layouts breathe directly commands user eye focus.",
    "The legendary Twitter blue bird silhouette was engineered using 13 overlapping geometric circles with strict circular arc constraints.",
    "Amazon\u0027s curved arrow smiles from letter \"a\" to \"z\", subtly promising delivery of every conceivable product from A to Z.",
    "The Golden Ratio (1:1.618033) appears throughout nature and art, influencing logo architecture for Apple, Pepsi, National Geographic, and Twitter.",
    "Vincent Connare created Comic Sans in 1994 for Microsoft Bob, aiming to replicate comic dialogue balloons for children software.",
    "The human eye is capable of discriminating between roughly 10 million distinct tint, shade, and saturation variations.",
    "Yellow is the fastest wavelength for the human brain to detect in peripheral vision, explaining yellow taxis, hazard cones, and caution tape.",
    "The oldest known printed advertisement in English was created in 1477 by William Caxton to market a clerical handbook.",
    "A \"typeface\" represents the overarching creative system (e.g., Helvetica), while a \"font\" denotes the exact digital weight, size, or file variant (e.g., Helvetica Bold 12pt).",
    "Blue consistently ranks as the world\u0027s most universally preferred colour across cultures, associated with serenity, stability, and corporate trust.",
    "The human eye perceives the color green with the least optical strain, which is why early night-vision gear and surgical scrubs utilize green shades.",
    "The flowing script of the Coca-Cola logo was hand-penned in Spencerian script in 1887 and has persisted virtually unchanged for well over a century.",
    "The World Wildlife Fund (WWF) panda mark uses Gestalt psychology closure principles: your brain seamlessly finishes the white outlines without line borders.",
    "Scottish physicist James Clerk Maxwell snapped the very first durable three-colour photographic ribbon plate in 1861.",
    "Optimized typographic hierarchy and comfortable line spacing (leading) can enhance reader textual comprehension by up to 40%.",
    "The Matterhorn mountain silhouette in the Toblerone logo holds a hidden standing bear, honoring the Swiss capital Bern (\"The City of Bears\").",
    "The Starbucks twin-tailed Siren siren emblem was inspired by a 16th-century Norse woodcut illustration.",
    "Paul Rand, godfather of corporate identities, charged Steve Jobs $100,000 for the NeXT computer cube identity and offered only a single definitive concept option.",
    "Black and yellow is nature\u0027s universal danger contrast combination, warning predators against bees, wasps, and venomous creatures.",
    "The Hollywood Sign originally read \"HOLLYWOODLAND\" when erected in 1923 as an advertisement for upscale hillside real estate development.",
    "Milton Glaser drew the classic \"I â¤ NY\" logo with a red crayon on the back of a crumpled paper envelope in the back of a New York yellow cab.",
    "The MGM lion roaring intro clip used nine different real lions across company history, the most famous named Jackie and Leo.",
    "Claude Garamond created typefaces in 16th-century Paris that are still standard defaults in publishing and modern word processors half a millennium later.",
    "The Bluetooth logo combines the Nordic Younger Futhark runes for King Harald Bluetooth\u0027s initials: H (áš¼) and B (á›\u0027).",
    "Pink was traditionally considered an assertive boy colour in 19th-century European fashion before a marketing shift flipped pastel palettes in the 1940s.",
    "The London Underground map designed by Harry Beck in 1931 abandoned topographical geographic accuracy in favor of a schematic electrical circuit board style.",
    "The colour purple was historically synonymous with royal monarchs because extracting dye from sea snails (Murex) was astronomically expensive.",
    "The Olympic Rings represent the five inhabited continents united in athletics, with at least one ring color appearing in every participating nation\u0027s flag.",
    "Salvador DalÃ­ created the vibrant daisy logo wrapper for the Spanish lollipop brand Chupa Chups in 1969 over a casual coffee session.",
    "Futura, drawn by Paul Renner in 1927, was carried on the Apollo 11 lunar module and appears on the commemorative plaque left behind on the Moon.",
    "The iconic Paramount Pictures mountain logo was modeled after Utah\u0027s Ben Lomond peak, sketched by founder W.W. Hodkinson on a notepad.",
    "Pantone originally started in the 1950s as a humble commercial printing company before revolutionizing modern color standardization in 1963.",
    "The \"Save\" icon remains a 3.5-inch floppy disk, preserving a piece of obsolete 1980s computer hardware in modern UI software.",
    "A single point in standard typographic measurement is exactly 1/72 of an inch (approximately 0.3527 millimeters).",
    "The famous \"Keep Calm and Carry On\" motivational poster was drafted by the British Ministry of Information in 1939 but barely ever displayed publicly during WWII.",
    "Serifs originated in Roman stone carvings; chisel cutters carved neat cross-strokes at letter ends to clean up chisel incisions.",
    "The Chupa Chups logo was designed by Salvador DalÃ­ with the specific instruction that the emblem should always sit on top of the lollipop, not the side.",
    "Over 75% of Fortune 500 company corporate logos feature either blue or black as their primary visual color anchor.",
    "The NBC peacock logo debuted in 1956 with vibrant plumage feathers specifically designed to persuade viewers to purchase new colour television sets.",
    "The phrase \"The quick brown fox jumps over the lazy dog\" is a pangram: a sentence containing every single letter of the English alphabet.",
    "The first banner advertisement on the web was purchased by AT\u0026T on HotWired.com in October 1994, achieving a staggering 44% click-through rate.",
    "Johannes Gutenberg\u0027s movable metal type press in Mainz around 1440 triggered the printing revolution and democratized human literacy across the globe.",
    "Warm lighting and amber colours evoke comfort and nostalgia, which is why luxury watch ads frequently set timepiece hands to 10:10 to mimic a welcoming smile.",
    "A grid system in layout design is derived from the architectural Swiss International Style pioneered in the 1950s by Josef MÃ¼ller-Brockmann.",
    "Target\u0027s red bullseye icon is so instantly recognizable in North America that over 96% of shoppers recognize the brand without any text whatsoever.",
    "The Chanel double-C monogram was designed by Coco Chanel herself in 1925, inspired by stained glass geometries in an Aubazine monastery.",
    "The McDonald\u0027s Golden Arches were initially physical 65-foot architectural building arches designed to catch the eyes of highway motorists.",
    "Cyan, Magenta, Yellow, and Black (CMYK) form subtractive colour printing, while Red, Green, and Blue (RGB) form additive screen luminescence.",
    "The \"K\" in CMYK stands for \"Key\" because early printers aligned colour registration plates to a black master key plate.",
    "Pure black ink printed on commercial paper is rarely rich enough; printers add percentages of Cyan, Magenta, and Yellow to produce \"Rich Black\".",
    "The Michelin Man tire mascot, named Bibendum, was conceived in 1894 after the Michelin brothers noticed a stacked pile of bicycle tires resembled a human torso.",
    "The Wikipedia jigsaw globe features 18 distinct writing systems on its puzzle pieces, each displaying the glyph corresponding to the letter \"W\".",
    "The Google logo was typeset in Catull until 2015, when it transitioned to a custom geometric sans-serif called Product Sans for crisp legibility on small screens.",
    "The original 1976 Apple computer logo featured an intricate hand-drawn pen illustration of Sir Isaac Newton sitting beneath an apple tree.",
    "Saul Bass created timeless title credit sequences and poster masterworks for Alfred Hitchcock, Stanley Kubrick, and Martin Scorsese.",
    "The Volkswagen \"VW\" emblem was born out of an employee design competition won by Franz Xaver Reimspiess, who received a 50-mark prize bonus.",
    "The Lacoste crocodile logo originated from tennis star RenÃ© Lacoste\u0027s on-court nickname \"The Alligator,\" bestowed upon him by fans and press.",
    "The Baskin-Robbins logo cleverly hides the pink number \"31\" between the letters B and R, representing their signature 31 flavour rotation.",
    "The first computer mouse invented by Douglas Engelbart in 1964 was carved out of solid pine wood and contained two perpendicular wheels.",
    "The famous smiley face graphic was created in 1963 by commercial artist Harvey Ball in 10 minutes for $45 to boost employee morale at an insurance firm.",
    "The term \"orphan\" in typesetting describes a lone word stranded at the top of a text column, while a \"widow\" sits abandoned at the bottom.",
    "Baskerville typeface caused controversy upon its 1757 release; critics claimed its razor-sharp contrast and bright woven paper would blind readers.",
    "The Levi\u0027s red tab pocket label was created in 1936 to help customers differentiate genuine Levi\u0027s jeans from imitators from a distance.",
    "The blue color of hyperlinked web text was popularized by the Mosaic browser in 1993 because blue offered high contrast against grey pages without masking black text.",
    "The MasterCard logo\u0027s overlapping red and yellow circles combine through optical illusion into warm orange, suggesting community connectivity.",
    "The original 1977 Star Wars logotype was designed by Suzy Rice, instructed by George Lucas to draft something that appeared distinctly \"fascist and imposing\".",
    "The triangular layout in visual arts (the rule of thirds) leads viewer gaze in natural circular loops across static canvas planes.",
    "The Gibson guitar \"open book\" headstock contour was trademarked to protect the instrument\u0027s recognizable silhouette from counterfeiters.",
    "The red and white Coca-Cola Santa Claus illustrations by Haddon Sundblom in the 1930s permanently codified the modern cultural appearance of Santa.",
    "The Sony VAIO logotype integrates analogue and digital signals: the \"VA\" draws a continuous sine wave, while the \"IO\" depicts binary 1 and 0.",
    "The recycling symbol was designed by 23-year-old college student Gary Anderson in 1970 for a nationwide container corporation contest.",
    "The Playboy rabbit bow-tie mascot was sketched by art director Art Paul in under half an hour for the magazine\u0027s sophomore issue in 1953.",
    "The legendary I Love NY heart campaign was originally planned to run for only a month during a 1977 tourism slump; it is still running nearly 50 years later.",
    "The original Firefox icon features a Red Panda curled around the world, not an actual fox, as \"firefox\" is a literal Chinese translation for the animal.",
    "The ray rays emanating from the Statue of Liberty\u0027s crown represent the seven seas and the seven continents of the world.",
    "The font Times New Roman was commissioned by the British newspaper The Times in 1931 after typographer Stanley Morison criticized their poor print quality.",
    "The classic brown tone of UPS delivery trucks was selected in 1919 by founder Jim Casey because brown effectively concealed highway dirt and road dust.",
    "A \"ligature\" binds two adjacent characters together (such as \"fi\", \"fl\", or \"Ã¦\") to prevent awkward visual collisions between tall ascenders and dots.",
    "The diagonal red, white, and blue stripes on barbershop poles trace back to medieval times when barbers also practiced surgical tooth-pulling and bloodletting.",
    "The iconic yellow M of McDonald\u0027s and the blue box of IKEA rely on the \"Stroop Effect\": colours communicate faster than text processing.",
    "The Ray-Ban Aviator sunglasses teardrop lens was calculated to mirror the human eye\u0027s natural convex shape and block maximum blinding cockpit glare.",
    "The Pinterest emblem\u0027s letter \"P\" incorporates a pointed pushpin tip at its bottom base.",
    "The red and white Campbell\u0027s soup can labels caught Andy Warhol\u0027s fascination because he consumed Campbell\u0027s tomato soup for lunch every day for 20 years.",
    "The triangular hazard symbol for radioactive material was designed in 1946 at the University of California, Berkeley Radiation Laboratory.",
    "The Polaroid rainbow stripe branding was designed to boast about the company\u0027s groundbreaking instant color film technology in the late 1960s.",
    "The Cisco Systems logo features digital sound waves that double as the silhouette contours of San Francisco\u0027s Golden Gate Bridge.",
    "The yellow and red colors of the Ferrari logo depict the official canary yellow emblem color of founder Enzo Ferrari\u0027s hometown of Modena.",
    "The \"hamburger menu\" icon (three horizontal stacked lines) was invented by Norm Cox in 1981 for the groundbreaking Xerox Star GUI workstation.",
    "The font Futura was strictly banned in Nazi Germany in 1941 after the regime abruptly declared Fraktur gothic blackletter to be \"Jewish script\".",
    "The iconic Abbey Road crossing album cover photograph was captured in just 10 minutes while a police officer temporarily halted London road traffic.",
    "The Fender Stratocaster electric guitar silhouette was inspired by 1950s Californian hot-rod cars and jet aviation aerodynamics.",
    "The MTV logo created by Manhattan Design in 1981 was intentionally left without fixed corporate colors so animators could constantly remix its textures.",
    "The peace symbol was designed in 1958 by Gerald Holtom for the British Campaign for Nuclear Disarmament, merging semaphore signals for N and D.",
    "The Rolex green identity color is guarded so tightly that the watchmaker keeps the exact historical origin of their hallmark shade an official secret.",
    "The green hue of US Dollar paper currency was chosen in the mid-19th century because green pigment chemistry resisted photographic counterfeit reproduction.",
    "The Toblerone triangle bar shape was inspired by cabaret dancers forming a human pyramid at the Folies BergÃ¨re, according to founder Theodor Tobler\u0027s sons.",
    "The original Monopoly board design was adapted from The Landlord\u0027s Game, created in 1903 by feminist designer Lizzie Magie to protest corporate monopolies.",
    "The red and white warning stripes on lighthouses are called \"daymarks\", calibrated to ensure maritime ships can spot rocky coastlines against various weather skies.",
    "The Subway sandwich logo features left and right arrows on the \"S\" and \"Y\" to evoke entering and exiting subway transit cars on the go.",
    "The Goodyear winged foot logo stems from a vintage statue of the Roman messenger god Mercury perched inside founder Frank Seiberling\u0027s home.",
    "The blue checkmark verification badge in UI design draws from ancient accounting ledger checks indicating validated balances.",
    "The Airbnb \"BÃ©lo\" symbol combines four foundational concepts: people, place, love, and the letter \"A\" for Airbnb into one continuous stroke.",
    "The Coca-Cola contour bottle was purposely engineered in 1915 so that a consumer could recognize it by touch alone in the dark or if shattered on the floor.",
    "The famous poster \"We Can Do It!\" featuring Rosie the Riveter by J. Howard Miller was seen by very few people during WWII; it only became iconic decades later.",
    "The iconic red soles on Christian Louboutin high heels came to life when the designer impulsively painted a prototype\u0027s bottom with an assistant\u0027s red nail polish.",
    "The Olympic torch relay was actually conceived by Carl Diem for the 1936 Berlin Olympics as a dramatic media propaganda event.",
    "The Michelin guide stars were created by a tire company in 1900 as an incentive to get French drivers to take road trips and wear down their tires.",
    "The Amazon kindle e-reader typeface \"Bookerly\" was engineered by Dalton Maag specifically to reduce eye fatigue across thousands of digital page turns.",
    "The yellow sticky note was invented by accident in 1968 when 3M scientist Dr. Spencer Silver developed an adhesive that was too weak to hold securely.",
    "The blue color of surgical scrubs was adopted in the early 20th century because looking away from red surgical incisions to green-blue relieves ocular fatigue.",
    "The Beats by Dre logo depicts a stylized side-profile silhouette of a human head wearing over-ear headphones.",
    "The red corner tab on Levi\u0027s jeans pockets was registered as an official trademark in 1938 because competitor stitching designs kept copying their back pockets.",
    "The classic yellow smiley face was trademarked in France in 1972 by journalist Franklin Loufrani to highlight uplifting good-news stories in the newspaper.",
    "The Guinness harp trademark was registered in 1862; when the Republic of Ireland later adopted the harp as its coat of arms, it had to face the opposite direction.",
    "The NASA \"meatball\" logo features a red chevron wing depicting supersonic flight and a spacecraft orbit trajectory around a field of stars.",
    "The IBM eight-bar logo designed by Paul Rand in 1972 uses horizontal scanline stripes to suggest speed, electron ray tubes, and corporate transparency.",
    "The legendary London double-decker bus is painted red because the London General Omnibus Company wanted their fleet to stand out against competing bus lines in 1907."
];
  let lastIndex = -1;

  // Dynamically refresh from assets/facts.txt if running over HTTP/HTTPS
  fetch('assets/facts.txt')
    .then(r => {
      if (!r.ok) throw new Error('Not ok');
      return r.text();
    })
    .then(raw => {
      const parsed = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (parsed.length > 0) {
        facts = parsed;
      }
    })
    .catch(() => {
      // Fallback works directly with embedded array
    });

  function pickFact() {
    if (!facts || !facts.length) return 'Design is intelligence made visible.';
    if (facts.length === 1) return facts[0];
    let idx;
    do {
      idx = Math.floor(Math.random() * facts.length);
    } while (idx === lastIndex);
    lastIndex = idx;
    return facts[idx];
  }

  function renderFact() {
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(6px)';
    textEl.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    setTimeout(() => {
      textEl.textContent = pickFact();
      textEl.style.opacity = '1';
      textEl.style.transform = '';
    }, 150);
  }

  function openPopup() {
    playPopSound();
    textEl.textContent = pickFact();
    popup.removeAttribute('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => popup.classList.add('open')));

    const icon = factBtn.querySelector('.nav-fact-icon');
    if (icon) {
      icon.style.animation = 'factShake 0.4s ease';
      icon.addEventListener('animationend', () => { icon.style.animation = ''; }, { once: true });
    }
  }

  function closePopup() {
    popup.classList.remove('open');
    popup.addEventListener('transitionend', () => {
      if (!popup.classList.contains('open')) popup.setAttribute('hidden', '');
    }, { once: true });
  }

  factBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (popup.classList.contains('open')) {
      playPopSound();
      renderFact();
    } else {
      openPopup();
    }
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playPopSound();
    renderFact();
  });

  closeBtn.addEventListener('click', closePopup);

  document.addEventListener('click', (e) => {
    if (popup.classList.contains('open') && !popup.contains(e.target) && !factBtn.contains(e.target)) {
      closePopup();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup.classList.contains('open')) closePopup();
  });
})();