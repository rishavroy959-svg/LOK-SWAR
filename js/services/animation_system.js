/**
 * GSAP Animation System & Physics-Based Micro-Interaction Engine
 * 
 * 1. Magnetic Hover Effect (elastic.out spring tracking)
 * 2. Click Ripple Animation (coordinate-based expanding wave in Blue)
 * 3. Menu-Origin Expanding Drawer (originates directly from top-left [≡] button)
 * 4. Animated Notification Stack (back.out spring entry in crisp Blue & Off-White)
 */

export class AnimationSystem {
  constructor() {
    this.gsap = window.gsap || null;
    this.isInitialized = false;
    this.magneticElements = new WeakSet();
    this.rippleElements = new WeakSet();
    this.toastContainer = null;
  }

  init() {
    if (typeof window === 'undefined') return;

    if (!window.gsap) {
      console.warn("GSAP 3 not loaded globally; loading fallback dynamic script");
      this.loadGsapScript(() => this.setup());
    } else {
      this.gsap = window.gsap;
      this.setup();
    }
  }

  loadGsapScript(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    script.onload = () => {
      this.gsap = window.gsap;
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  setup() {
    if (!this.gsap || this.isInitialized) return;
    this.isInitialized = true;

    this.initMagneticHover();
    this.initClickRipple();
    this.initNotificationContainer();

    // Observe dynamic DOM changes to automatically bind newly rendered elements
    const observer = new MutationObserver(() => {
      this.initMagneticHover();
      this.initClickRipple();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 1. MAGNETIC HOVER EFFECT
   * Elements track the mouse cursor and snap back with soft elastic spring physics
   */
  initMagneticHover(selector = '.magnetic-target, .btn, .btn-icon, .btn-sample-phrase, .theme-toggle, .nav-btn, .tab-btn') {
    if (!this.gsap) return;
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      if (this.magneticElements.has(el)) return;
      this.magneticElements.add(el);

      const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.28;

      const handleMouseMove = (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        this.gsap.to(el, {
          x: deltaX,
          y: deltaY,
          rotation: deltaX * 0.04,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      };

      const handleMouseLeave = () => {
        this.gsap.to(el, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.75,
          ease: 'elastic.out(1, 0.3)',
          overwrite: 'auto'
        });
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  /**
   * 2. CLICK RIPPLE ANIMATION (Clean Blue Wave)
   * Expanding wave radiating directly from exact click coordinates
   */
  initClickRipple(selector = '.ripple-target, .btn, .card, .drawer-item, .clickable') {
    if (!this.gsap) return;
    const elements = document.querySelectorAll(selector);

    elements.forEach((el) => {
      if (this.rippleElements.has(el)) return;
      this.rippleElements.add(el);

      const currentPos = window.getComputedStyle(el).position;
      if (currentPos === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';

      el.addEventListener('pointerdown', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const diameter = Math.max(rect.width, rect.height) * 2.2;

        const ripple = document.createElement('span');
        ripple.className = 'gsap-ripple';
        ripple.style.position = 'absolute';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = `${diameter}px`;
        ripple.style.height = `${diameter}px`;
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        ripple.style.zIndex = '5';

        const isDark = document.body.classList.contains('night-mode');
        ripple.style.background = isDark 
          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)'
          : 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 70%)';

        el.appendChild(ripple);

        this.gsap.fromTo(ripple,
          { scale: 0, opacity: 0.85 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.65,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
          }
        );
      });
    });
  }

  /**
   * 3. MENU-ORIGIN EXPANDING DRAWER
   * Unfolds smoothly directly from the top-left Hamburger Menu [≡] button!
   */
  animateDrawerOpen(drawerEl, overlayEl, itemsSelector = '.drawer-item, .drawer-nav-item, .gsap-drawer-item') {
    if (!this.gsap || !drawerEl) return;

    // Set origin to exact top-left menu icon
    drawerEl.style.transformOrigin = 'top left';

    // Overlay Fade In with backdrop blur
    if (overlayEl) {
      this.gsap.fromTo(overlayEl,
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(8px)', duration: 0.45, ease: 'power2.out' }
      );
    }

    // Expand drawer directly outward from the menu icon (scale & clipPath circular origin)
    this.gsap.fromTo(drawerEl,
      {
        scale: 0.15,
        opacity: 0,
        x: 10,
        y: 10,
        borderRadius: '24px',
        clipPath: 'circle(12% at 30px 30px)'
      },
      {
        scale: 1,
        opacity: 1,
        x: 0,
        y: 0,
        borderRadius: '0px',
        clipPath: 'circle(160% at 30px 30px)',
        duration: 0.55,
        ease: 'power3.out'
      }
    );

    // Staggered Bloom for Nav Links
    const items = drawerEl.querySelectorAll(itemsSelector);
    if (items.length > 0) {
      this.gsap.fromTo(items,
        { opacity: 0, x: -30, scale: 0.94 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.045,
          ease: 'back.out(1.2)',
          delay: 0.15
        }
      );
    }
  }

  animateDrawerClose(drawerEl, overlayEl, onComplete) {
    if (!this.gsap || !drawerEl) {
      if (onComplete) onComplete();
      return;
    }

    drawerEl.style.transformOrigin = 'top left';

    if (overlayEl) {
      this.gsap.to(overlayEl, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        duration: 0.35,
        ease: 'power2.in'
      });
    }

    // Shrink drawer smoothly right back into the top-left menu icon
    this.gsap.to(drawerEl, {
      scale: 0.15,
      opacity: 0,
      x: 10,
      y: 10,
      borderRadius: '24px',
      clipPath: 'circle(12% at 30px 30px)',
      duration: 0.38,
      ease: 'power3.in',
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * 4. ANIMATED NOTIFICATION STACK (Royal Blue Accents)
   */
  initNotificationContainer() {
    let container = document.getElementById('gsap-notification-stack');
    if (!container) {
      container = document.createElement('div');
      container.id = 'gsap-notification-stack';
      container.style.position = 'fixed';
      container.style.top = '24px';
      container.style.right = '24px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      container.style.maxWidth = '380px';
      container.style.width = 'calc(100vw - 32px)';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  showNotification({ title, message, icon = '🔔', type = 'info', duration = 4500 }) {
    if (!this.toastContainer) this.initNotificationContainer();
    const isDark = document.body.classList.contains('night-mode');

    const toast = document.createElement('div');
    toast.className = 'gsap-toast-card';
    toast.style.pointerEvents = 'auto';
    toast.style.padding = '14px 18px';
    toast.style.borderRadius = '16px';
    toast.style.boxShadow = isDark 
      ? '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 16px rgba(59, 130, 246, 0.3)' 
      : '0 10px 30px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(0, 0, 0, 0.06)';
    toast.style.border = isDark ? '2px solid #3b82f6' : '2px solid #2563eb';
    toast.style.background = isDark ? '#1e293b' : '#ffffff';
    toast.style.color = isDark ? '#ffffff' : '#0f172a';
    toast.style.display = 'flex';
    toast.style.alignItems = 'start';
    toast.style.gap = '12px';
    toast.style.overflow = 'hidden';
    toast.style.cursor = 'default';

    toast.innerHTML = `
      <div style="font-size: 1.35rem; line-height: 1; flex-shrink: 0; margin-top: 2px;">
        ${icon}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
          <h4 style="margin: 0; font-size: 0.92rem; font-weight: 800; color: ${isDark ? '#60a5fa' : '#2563eb'}; font-family: Outfit, sans-serif;">
            ${title || 'Civic Alert'}
          </h4>
          <span style="font-size: 0.7rem; font-weight: 600; opacity: 0.65;">Just now</span>
        </div>
        <p style="margin: 0; font-size: 0.82rem; font-weight: 500; line-height: 1.35; color: ${isDark ? '#f8fafc' : '#334155'};">
          ${message}
        </p>
      </div>
      <button class="toast-close-btn" style="background: transparent; border: none; font-size: 1rem; color: inherit; opacity: 0.6; cursor: pointer; padding: 0 2px; line-height: 1;" aria-label="Close">
        ✕
      </button>
    `;

    this.toastContainer.prepend(toast);

    if (this.gsap) {
      this.gsap.fromTo(toast,
        { opacity: 0, x: 70, scale: 0.85 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }

    const dismiss = () => {
      if (!toast.parentNode) return;
      if (this.gsap) {
        this.gsap.to(toast, {
          opacity: 0,
          x: 80,
          scale: 0.8,
          height: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => toast.remove()
        });
      } else {
        toast.remove();
      }
    };

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }
}
