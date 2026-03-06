
/*
* @license
* Broadcast Theme (c) Invisible Themes
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Invisible Themes.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/

(function (scrollLock, Flickity, FlickityFade) {
    'use strict';

    (function() {
        const env = {"NODE_ENV":"production"};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    window.theme = window.theme || {};

    // Define theme routes if not already defined
    if (!window.theme.routes) {
      window.theme.routes = {
        root: '/',
        cart_url: '/cart',
        cart_add_url: '/cart/add.js',
        cart_change_url: '/cart/change.js',
        predictive_search_url: '/search/suggest.json',
        product_recommendations_url: '/recommendations/products.json'
      };
    }

    // Define theme settings if not already defined
    if (!window.theme.settings) {
      window.theme.settings = {
        cartType: 'drawer',
        enableAnimations: true
      };
    }

    // Define theme strings if not already defined
    if (!window.theme.strings) {
      window.theme.strings = {
        free: 'Free'
      };
    }

    // Define money format if not already defined
    if (!window.theme.moneyWithCurrencyFormat) {
      window.theme.moneyWithCurrencyFormat = '{{amount}}';
    }

    // Define subtotal if not already defined
    if (!window.theme.subtotal) {
      window.theme.subtotal = 0;
    }

    window.theme.sizes = {
      mobile: 480,
      small: 750,
      large: 990,
      widescreen: 1400,
    };

    window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function appendCartItems() {
      if (document.querySelector('cart-items')) return;

      // Add cart items tag when the cart drawer section is missing so we can still run the JS associated with the error handling
      const cartItems = document.createElement('cart-items');
      document.body.appendChild(cartItems);
    }

    function floatLabels(container) {
      const floats = container.querySelectorAll('.form-field');
      floats.forEach((element) => {
        const label = element.querySelector('label');
        const input = element.querySelector('input, textarea');
        if (label && input) {
          input.addEventListener('keyup', (event) => {
            if (event.target.value !== '') {
              label.classList.add('label--float');
            } else {
              label.classList.remove('label--float');
            }
          });
          if (input.value && input.value.length) {
            label.classList.add('label--float');
          }
        }
      });
    }

    let screenOrientation = getScreenOrientation();
    window.initialWindowHeight = Math.min(window.screen.height, window.innerHeight);

    function readHeights() {
      const h = {};
      h.windowHeight = Math.min(window.screen.height, window.innerHeight);
      h.footerHeight = getHeight('[data-section-type*="footer"]');
      h.headerHeight = getHeight('[data-header-height]');
      h.stickyHeaderHeight = document.querySelector('[data-header-sticky]') ? h.headerHeight : 0;
      h.collectionNavHeight = getHeight('[data-collection-nav]');
      h.logoHeight = getFooterLogoWithPadding();

      return h;
    }

    function setVarsOnResize() {
      document.addEventListener('theme:resize', resizeVars);
      setVars();
    }

    function setVars() {
      const {windowHeight, headerHeight, logoHeight, footerHeight, collectionNavHeight} = readHeights();

      document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
      document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
      document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
      document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
      document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

      document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    }

    function resizeVars() {
      // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
      const {windowHeight, headerHeight, logoHeight, footerHeight, collectionNavHeight} = readHeights();
      const currentScreenOrientation = getScreenOrientation();

      if (currentScreenOrientation !== screenOrientation || window.innerWidth > window.theme.sizes.mobile) {
        // Only update the heights on screen orientation change or larger than mobile devices
        document.documentElement.style.setProperty('--full-height', `${windowHeight}px`);
        document.documentElement.style.setProperty('--three-quarters', `${windowHeight * (3 / 4)}px`);
        document.documentElement.style.setProperty('--two-thirds', `${windowHeight * (2 / 3)}px`);
        document.documentElement.style.setProperty('--one-half', `${windowHeight / 2}px`);
        document.documentElement.style.setProperty('--one-third', `${windowHeight / 3}px`);

        // Update the screen orientation state
        screenOrientation = currentScreenOrientation;
      }

      document.documentElement.style.setProperty('--collection-nav-height', `${collectionNavHeight}px`);

      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
      document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    }

    function getScreenOrientation() {
      if (window.matchMedia('(orientation: portrait)').matches) {
        return 'portrait';
      }

      if (window.matchMedia('(orientation: landscape)').matches) {
        return 'landscape';
      }
    }

    function getHeight(selector) {
      const el = document.querySelector(selector);
      if (el) {
        return el.offsetHeight;
      } else {
        return 0;
      }
    }

    function getFooterLogoWithPadding() {
      const height = getHeight('[data-footer-logo]');
      if (height > 0) {
        return height + 20;
      } else {
        return 0;
      }
    }

    function debounce(fn, time) {
      let timeout;
      return function () {
        // eslint-disable-next-line prefer-rest-params
        if (fn) {
          const functionCall = () => fn.apply(this, arguments);
          clearTimeout(timeout);
          timeout = setTimeout(functionCall, time);
        }
      };
    }

    function getWindowWidth() {
      return document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
    }

    function getWindowHeight() {
      return document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
    }

    function isDesktop() {
      return getWindowWidth() >= window.theme.sizes.small;
    }

    function isMobile() {
      return getWindowWidth() < window.theme.sizes.small;
    }

    let lastWindowWidth = getWindowWidth();
    let lastWindowHeight = getWindowHeight();

    function dispatch$1() {
      document.dispatchEvent(
        new CustomEvent('theme:resize', {
          bubbles: true,
        })
      );

      if (lastWindowWidth !== getWindowWidth()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:width', {
            bubbles: true,
          })
        );

        lastWindowWidth = getWindowWidth();
      }

      if (lastWindowHeight !== getWindowHeight()) {
        document.dispatchEvent(
          new CustomEvent('theme:resize:height', {
            bubbles: true,
          })
        );

        lastWindowHeight = getWindowHeight();
      }
    }

    function resizeListener() {
      window.addEventListener(
        'resize',
        debounce(function () {
          dispatch$1();
        }, 50)
      );
    }

    let prev = window.scrollY;
    let up = null;
    let down = null;
    let wasUp = null;
    let wasDown = null;
    let scrollLockTimer = 0;

    function dispatch() {
      const position = window.scrollY;
      if (position > prev) {
        down = true;
        up = false;
      } else if (position < prev) {
        down = false;
        up = true;
      } else {
        up = null;
        down = null;
      }
      prev = position;
      document.dispatchEvent(
        new CustomEvent('theme:scroll', {
          detail: {
            up,
            down,
            position,
          },
          bubbles: false,
        })
      );
      if (up && !wasUp) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:up', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      if (down && !wasDown) {
        document.dispatchEvent(
          new CustomEvent('theme:scroll:down', {
            detail: {position},
            bubbles: false,
          })
        );
      }
      wasDown = down;
      wasUp = up;
    }

    function lock(e) {
      // Prevent body scroll lock race conditions
      setTimeout(() => {
        if (scrollLockTimer) {
          clearTimeout(scrollLockTimer);
        }

        scrollLock.disablePageScroll(e.detail, {
          allowTouchMove: (el) => el.tagName === 'TEXTAREA',
        });

        document.documentElement.setAttribute('data-scroll-locked', '');
      });
    }

    function unlock(e) {
      const timeout = e.detail;

      if (timeout) {
        scrollLockTimer = setTimeout(removeScrollLock, timeout);
      } else {
        removeScrollLock();
      }
    }

    function removeScrollLock() {
      scrollLock.clearQueueScrollLocks();
      scrollLock.enablePageScroll();
      document.documentElement.removeAttribute('data-scroll-locked');
    }

    function scrollListener() {
      let timeout;
      window.addEventListener(
        'scroll',
        function () {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(function () {
            dispatch();
          });
        },
        {passive: true}
      );

      window.addEventListener('theme:scroll:lock', lock);
      window.addEventListener('theme:scroll:unlock', unlock);
    }

    const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
      const wrapper = wrapperOption || document.createElement('div');
      wrapper.classList.add(wrapperClass);
      toWrap.parentNode.insertBefore(wrapper, toWrap);
      return wrapper.appendChild(toWrap);
    };

    function wrapElements(container) {
      // Target tables to make them scrollable
      const tableSelectors = '.rte table';
      const tables = container.querySelectorAll(tableSelectors);
      tables.forEach((table) => {
        wrap(table, 'rte__table-wrapper');
        table.setAttribute('data-scroll-lock-scrollable', '');
      });

      // Target iframes to make them responsive
      const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
      const frames = container.querySelectorAll(iframeSelectors);
      frames.forEach((frame) => {
        wrap(frame, 'rte__video-wrapper');
      });
    }

    function isTouchDevice() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function isTouch() {
      if (isTouchDevice()) {
        document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
        window.theme.touch = true;
      } else {
        window.theme.touch = false;
      }
    }

    function ariaToggle(container) {
      const toggleButtons = container.querySelectorAll('[data-aria-toggle]');
      if (toggleButtons.length) {
        toggleButtons.forEach((element) => {
          element.addEventListener('click', function (event) {
            event.preventDefault();
            const currentTarget = event.currentTarget;
            currentTarget.setAttribute('aria-expanded', currentTarget.getAttribute('aria-expanded') == 'false' ? 'true' : 'false');
            const toggleID = currentTarget.getAttribute('aria-controls');
            const toggleElement = document.querySelector(`#${toggleID}`);
            const removeExpandingClass = () => {
              toggleElement.classList.remove('expanding');
              toggleElement.removeEventListener('transitionend', removeExpandingClass);
            };
            const addExpandingClass = () => {
              toggleElement.classList.add('expanding');
              toggleElement.removeEventListener('transitionstart', addExpandingClass);
            };

            toggleElement.addEventListener('transitionstart', addExpandingClass);
            toggleElement.addEventListener('transitionend', removeExpandingClass);

            toggleElement.classList.toggle('expanded');
          });
        });
      }
    }

    function loading() {
      document.body.classList.add('is-loaded');
    }

    const classes$B = {
      loading: 'is-loading',
    };

    const selectors$M = {
      img: 'img.is-loading',
    };

    /*
      Catch images loaded events and add class "is-loaded" to them and their containers
    */
    function loadedImagesEventHook() {
      document.addEventListener(
        'load',
        (e) => {
          if (e.target.tagName.toLowerCase() == 'img' && e.target.classList.contains(classes$B.loading)) {
            e.target.classList.remove(classes$B.loading);
            e.target.parentNode.classList.remove(classes$B.loading);

            if (e.target.parentNode.parentNode.classList.contains(classes$B.loading)) {
              e.target.parentNode.parentNode.classList.remove(classes$B.loading);
            }
          }
        },
        true
      );
    }

    /*
      Remove "is-loading" class to the loaded images and their containers
    */
    function removeLoadingClassFromLoadedImages(container) {
      container.querySelectorAll(selectors$M.img).forEach((img) => {
        if (img.complete) {
          img.classList.remove(classes$B.loading);
          img.parentNode.classList.remove(classes$B.loading);

          if (img.parentNode.parentNode.classList.contains(classes$B.loading)) {
            img.parentNode.parentNode.classList.remove(classes$B.loading);
          }
        }
      });
    }

    function isVisible(el) {
      var style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }

    /**
     * Moves focus to an HTML element
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects. Used in bindInPageLinks()
     * eg move focus to a modal that is opened. Used in trapFocus()
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */
    function forceFocus(element, options) {
      options = options || {};

      var savedTabIndex = element.tabIndex;

      element.tabIndex = -1;
      element.dataset.tabIndex = savedTabIndex;
      element.focus();
      if (typeof options.className !== 'undefined') {
        element.classList.add(options.className);
      }
      element.addEventListener('blur', callback);

      function callback(event) {
        event.target.removeEventListener(event.type, callback);

        element.tabIndex = savedTabIndex;
        delete element.dataset.tabIndex;
        if (typeof options.className !== 'undefined') {
          element.classList.remove(options.className);
        }
      }
    }

    /**
     * If there's a hash in the url, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - Selector for elements to not include.
     */

    function focusHash(options) {
      options = options || {};
      var hash = window.location.hash;
      var element = document.getElementById(hash.slice(1));

      // if we are to ignore this element, early return
      if (element && options.ignore && element.matches(options.ignore)) {
        return false;
      }

      if (hash && element) {
        forceFocus(element, options);
      }
    }

    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - CSS selector for elements to not include.
     */

    function bindInPageLinks(options) {
      options = options || {};
      var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

      function queryCheck(selector) {
        return document.getElementById(selector) !== null;
      }

      return links.filter(function (link) {
        if (link.hash === '#' || link.hash === '') {
          return false;
        }

        if (options.ignore && link.matches(options.ignore)) {
          return false;
        }

        if (!queryCheck(link.hash.substr(1))) {
          return false;
        }

        var element = document.querySelector(link.hash);

        if (!element) {
          return false;
        }

        link.addEventListener('click', function () {
          forceFocus(element, options);
        });

        return true;
      });
    }

    function focusable(container) {
      var elements = Array.prototype.slice.call(
        container.querySelectorAll('[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled')
      );

      // Filter out elements that are not visible.
      // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
      return elements.filter(function (element) {
        return !!((element.offsetWidth || element.offsetHeight || element.getClientRects().length) && isVisible(element));
      });
    }

    /**
     * Traps the focus in a particular container
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Element} elementToFocus - Element to be focused on first
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */

    var trapFocusHandlers = {};

    function trapFocus(container, options) {
      options = options || {};
      var elements = focusable(container);
      var elementToFocus = options.elementToFocus || container;
      var first = elements[0];
      var last = elements[elements.length - 1];

      removeTrapFocus();

      trapFocusHandlers.focusin = function (event) {
        if (container !== event.target && !container.contains(event.target) && first && first === event.target) {
          first.focus();
        }

        if (event.target !== container && event.target !== last && event.target !== first) return;
        document.addEventListener('keydown', trapFocusHandlers.keydown);
      };

      trapFocusHandlers.focusout = function () {
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
      };

      trapFocusHandlers.keydown = function (event) {
        if (event.code !== 'Tab') return; // If not TAB key

        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
          event.preventDefault();
          first.focus();
        }

        //  On the first focusable element and tab backward, focus the last element.
        if ((event.target === container || event.target === first) && event.shiftKey) {
          event.preventDefault();
          last.focus();
        }
      };

      document.addEventListener('focusout', trapFocusHandlers.focusout);
      document.addEventListener('focusin', trapFocusHandlers.focusin);

      forceFocus(elementToFocus, options);
    }

    /**
     * Removes the trap of focus from the page
     */
    function removeTrapFocus() {
      document.removeEventListener('focusin', trapFocusHandlers.focusin);
      document.removeEventListener('focusout', trapFocusHandlers.focusout);
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    }

    /**
     * Auto focus the last element
     */
    function autoFocusLastElement() {
      if (window.a11y.lastElement && document.body.classList.contains('is-focused')) {
        setTimeout(() => {
          window.a11y.lastElement?.focus();
        });
      }
    }

    /**
     * Add a preventive message to external links and links that open to a new window.
     * @param {string} elements - Specific elements to be targeted
     * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
     * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
     * @param {string} options.messages.external - When the link is to a different host domain.
     * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
     * @param {object} options.prefix - Prefix to namespace "id" of the messages
     */
    function accessibleLinks(elements, options) {
      if (typeof elements !== 'string') {
        throw new TypeError(elements + ' is not a String.');
      }

      elements = document.querySelectorAll(elements);

      if (elements.length === 0) {
        return;
      }

      options = options || {};
      options.messages = options.messages || {};

      var messages = {
        newWindow: options.messages.newWindow || 'Opens in a new window.',
        external: options.messages.external || 'Opens external website.',
        newWindowExternal: options.messages.newWindowExternal || 'Opens external website in a new window.',
      };

      var prefix = options.prefix || 'a11y';

      var messageSelectors = {
        newWindow: prefix + '-new-window-message',
        external: prefix + '-external-message',
        newWindowExternal: prefix + '-new-window-external-message',
      };

      function generateHTML(messages) {
        var container = document.createElement('ul');
        var htmlMessages = Object.keys(messages).reduce(function (html, key) {
          return (html += '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
        }, '');

        container.setAttribute('hidden', true);
        container.innerHTML = htmlMessages;

        document.body.appendChild(container);
      }

      function externalSite(link) {
        return link.hostname !== window.location.hostname;
      }

      elements.forEach(function (link) {
        var target = link.getAttribute('target');
        var rel = link.getAttribute('rel');
        var isExternal = externalSite(link);
        var isTargetBlank = target === '_blank';
        var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;

        if (isTargetBlank && missingRelNoopener) {
          var relValue = rel === null ? 'noopener' : rel + ' noopener';
          link.setAttribute('rel', relValue);
        }

        if (isExternal && isTargetBlank) {
          link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
        } else if (isExternal) {
          link.setAttribute('aria-describedby', messageSelectors.external);
        } else if (isTargetBlank) {
          link.setAttribute('aria-describedby', messageSelectors.newWindow);
        }
      });

      generateHTML(messages);
    }

    var a11y = /*#__PURE__*/Object.freeze({
        __proto__: null,
        forceFocus: forceFocus,
        focusHash: focusHash,
        bindInPageLinks: bindInPageLinks,
        focusable: focusable,
        trapFocus: trapFocus,
        removeTrapFocus: removeTrapFocus,
        autoFocusLastElement: autoFocusLastElement,
        accessibleLinks: accessibleLinks
    });

    /*
      Trigger event after animation completes
    */
    function waitForAnimationEnd(element) {
      return new Promise((resolve) => {
        function onAnimationEnd(event) {
          if (event.target != element) return;

          element.removeEventListener('animationend', onAnimationEnd);
          resolve();
        }

        element?.addEventListener('animationend', onAnimationEnd);
      });
    }

    const selectors$L = {
      drawerInner: '[data-drawer-inner]',
      drawerClose: '[data-drawer-close]',
      drawerMenu: '[data-drawer-menu]',
      underlay: '[data-drawer-underlay]',
      stagger: '[data-stagger-animation]',
      wrapper: '[data-header-wrapper]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$A = {
      animated: 'drawer--animated',
      open: 'is-open',
      closing: 'is-closing',
      isFocused: 'is-focused',
      headerStuck: 'js__header__stuck',
    };

    class HeaderDrawer extends HTMLElement {
      constructor() {
        super();

        this.isAnimating = false;
        this.drawer = this;
        this.drawerMenu = this.querySelector(selectors$L.drawerMenu);

        this.drawerInner = this.querySelector(selectors$L.drawerInner);
        this.underlay = this.querySelector(selectors$L.underlay);
        this.triggerButton = null;

        this.staggers = this.querySelectorAll(selectors$L.stagger);
        this.showDrawer = this.showDrawer.bind(this);
        this.hideDrawer = this.hideDrawer.bind(this);

        this.connectDrawer();
        this.closers();
      }

      connectDrawer() {
        this.addEventListener('theme:drawer:toggle', (e) => {
          this.triggerButton = e.detail?.button;

          if (this.classList.contains(classes$A.open)) {
            this.dispatchEvent(
              new CustomEvent('theme:drawer:close', {
                bubbles: true,
              })
            );
          } else {
            this.dispatchEvent(
              new CustomEvent('theme:drawer:open', {
                bubbles: true,
              })
            );
          }
        });

        this.addEventListener('theme:drawer:close', this.hideDrawer);
        this.addEventListener('theme:drawer:open', this.showDrawer);

        document.addEventListener('theme:cart-drawer:open', this.hideDrawer);
      }

      closers() {
        this.querySelectorAll(selectors$L.drawerClose)?.forEach((button) => {
          button.addEventListener('click', () => {
            this.hideDrawer();
          });
        });

        document.addEventListener('keyup', (event) => {
          if (event.code !== 'Escape') {
            return;
          }

          this.hideDrawer();
        });

        this.underlay.addEventListener('click', () => {
          this.hideDrawer();
        });
      }

      showDrawer() {
        if (this.isAnimating) return;

        this.isAnimating = true;

        this.triggerButton?.setAttribute('aria-expanded', true);
        this.classList.add(classes$A.open, classes$A.animated);

        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        if (this.drawerInner) {
          removeTrapFocus();

          waitForAnimationEnd(this.drawerInner).then(() => {
            this.isAnimating = false;

            trapFocus(this.drawerInner, {
              elementToFocus: this.querySelector(selectors$L.focusable),
            });
          });
        }
      }

      hideDrawer() {
        if (this.isAnimating || !this.classList.contains(classes$A.open)) return;

        this.isAnimating = true;

        this.classList.add(classes$A.closing);
        this.classList.remove(classes$A.open);

        if (this.drawerMenu) {
          this.drawerMenu.style.height = 'auto';
        }

        removeTrapFocus();

        if (this.triggerButton) {
          this.triggerButton.setAttribute('aria-expanded', false);

          if (document.body.classList.contains(classes$A.isFocused)) {
            this.triggerButton.focus();
          }
        }

        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        waitForAnimationEnd(this.drawerInner).then(() => {
          this.classList.remove(classes$A.closing, classes$A.animated);

          this.isAnimating = false;

          // Reset menu items state after drawer hiding animation completes
          document.dispatchEvent(new CustomEvent('theme:sliderule:close', {bubbles: false}));
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:cart-drawer:open', this.hideDrawer);
      }
    }

    const selectors$K = {
      inputSearch: 'input[type="search"]',
      focusedElements: '[aria-selected="true"] a',
      resetButton: 'button[type="reset"]',
    };

    const classes$z = {
      hidden: 'hidden',
    };

    class HeaderSearchForm extends HTMLElement {
      constructor() {
        super();

        this.input = this.querySelector(selectors$K.inputSearch);
        this.resetButton = this.querySelector(selectors$K.resetButton);

        if (this.input) {
          this.input.form.addEventListener('reset', this.onFormReset.bind(this));
          this.input.addEventListener(
            'input',
            debounce((event) => {
              this.onChange(event);
            }, 300).bind(this)
          );
        }
      }

      toggleResetButton() {
        const resetIsHidden = this.resetButton.classList.contains(classes$z.hidden);
        if (this.input.value.length > 0 && resetIsHidden) {
          this.resetButton.classList.remove(classes$z.hidden);
        } else if (this.input.value.length === 0 && !resetIsHidden) {
          this.resetButton.classList.add(classes$z.hidden);
        }
      }

      onChange() {
        this.toggleResetButton();
      }

      shouldResetForm() {
        return !document.querySelector(selectors$K.focusedElements);
      }

      onFormReset(event) {
        // Prevent default so the form reset doesn't set the value gotten from the url on page load
        event.preventDefault();
        // Don't reset if the user has selected an element on the predictive search dropdown
        if (this.shouldResetForm()) {
          this.input.value = '';
          this.toggleResetButton();
          event.target.querySelector(selectors$K.inputSearch).focus();
        }
      }
    }

    customElements.define('header-search-form', HeaderSearchForm);

    const selectors$J = {
      allVisibleElements: '[role="option"]',
      ariaSelected: '[aria-selected="true"]',
      popularSearches: '[data-popular-searches]',
      predictiveSearch: 'predictive-search',
      predictiveSearchResults: '[data-predictive-search-results]',
      predictiveSearchStatus: '[data-predictive-search-status]',
      searchInput: 'input[type="search"]',
      searchPopdown: '[data-popdown]',
      searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
      searchResultsGroupsWrapper: '[data-search-results-groups-wrapper]',
      searchForText: '[data-predictive-search-search-for-text]',
      sectionPredictiveSearch: '#shopify-section-predictive-search',
      selectedLink: '[aria-selected="true"] a',
      selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
    };

    class PredictiveSearch extends HeaderSearchForm {
      constructor() {
        super();
        this.a11y = a11y;
        this.abortController = new AbortController();
        this.allPredictiveSearchInstances = document.querySelectorAll(selectors$J.predictiveSearch);
        this.cachedResults = {};
        this.input = this.querySelector(selectors$J.searchInput);
        this.isOpen = false;
        this.predictiveSearchResults = this.querySelector(selectors$J.predictiveSearchResults);
        this.searchPopdown = this.closest(selectors$J.searchPopdown);
        this.popularSearches = this.searchPopdown?.querySelector(selectors$J.popularSearches);
        this.searchTerm = '';
      }

      connectedCallback() {
        this.input.addEventListener('focus', this.onFocus.bind(this));
        this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.addEventListener('keyup', this.onKeyup.bind(this));
        this.addEventListener('keydown', this.onKeydown.bind(this));
      }

      getQuery() {
        return this.input.value.trim();
      }

      onChange() {
        super.onChange();
        const newSearchTerm = this.getQuery();

        if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
          // Remove the results when they are no longer relevant for the new search term
          // so they don't show up when the dropdown opens again
          this.querySelector(selectors$J.searchResultsGroupsWrapper)?.remove();
        }

        // Update the term asap, don't wait for the predictive search query to finish loading
        this.updateSearchForTerm(this.searchTerm, newSearchTerm);

        this.searchTerm = newSearchTerm;

        if (!this.searchTerm.length) {
          this.reset();
          return;
        }

        this.getSearchResults(this.searchTerm);
      }

      onFormSubmit(event) {
        if (!this.getQuery().length || this.querySelector(selectors$J.selectedLink)) event.preventDefault();
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.searchTerm = '';
          this.abortController.abort();
          this.abortController = new AbortController();
          this.closeResults(true);
        }
      }

      shouldResetForm() {
        return !document.querySelector(selectors$J.selectedLink);
      }

      onFocus() {
        const currentSearchTerm = this.getQuery();

        if (!currentSearchTerm.length) return;

        if (this.searchTerm !== currentSearchTerm) {
          // Search term was changed from other search input, treat it as a user change
          this.onChange();
        } else if (this.getAttribute('results') === 'true') {
          this.open();
        } else {
          this.getSearchResults(this.searchTerm);
        }
      }

      onFocusOut() {
        setTimeout(() => {
          if (!this.contains(document.activeElement)) this.close();
        });
      }

      onKeyup(event) {
        if (!this.getQuery().length) this.close(true);
        event.preventDefault();

        switch (event.code) {
          case 'ArrowUp':
            this.switchOption('up');
            break;
          case 'ArrowDown':
            this.switchOption('down');
            break;
          case 'Enter':
            this.selectOption();
            break;
        }
      }

      onKeydown(event) {
        // Prevent the cursor from moving in the input when using the up and down arrow keys
        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
          event.preventDefault();
        }
      }

      updateSearchForTerm(previousTerm, newTerm) {
        const searchForTextElement = this.querySelector(selectors$J.searchForText);
        const currentButtonText = searchForTextElement?.innerText;

        if (currentButtonText) {
          if (currentButtonText.match(new RegExp(previousTerm, 'g'))?.length > 1) {
            // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
            return;
          }
          const newButtonText = currentButtonText.replace(previousTerm, newTerm);
          searchForTextElement.innerText = newButtonText;
        }
      }

      switchOption(direction) {
        if (!this.getAttribute('open')) return;

        const moveUp = direction === 'up';
        const selectedElement = this.querySelector(selectors$J.ariaSelected);

        // Filter out hidden elements (duplicated page and article resources) thanks
        // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
        const allVisibleElements = Array.from(this.querySelectorAll(selectors$J.allVisibleElements)).filter((element) => element.offsetParent !== null);

        let activeElementIndex = 0;

        if (moveUp && !selectedElement) return;

        let selectedElementIndex = -1;
        let i = 0;

        while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
          if (allVisibleElements[i] === selectedElement) {
            selectedElementIndex = i;
          }
          i++;
        }

        this.statusElement.textContent = '';

        if (!moveUp && selectedElement) {
          activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
        } else if (moveUp) {
          activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
        }

        if (activeElementIndex === selectedElementIndex) return;

        const activeElement = allVisibleElements[activeElementIndex];

        activeElement.setAttribute('aria-selected', true);
        if (selectedElement) selectedElement.setAttribute('aria-selected', false);

        this.input.setAttribute('aria-activedescendant', activeElement.id);
      }

      selectOption() {
        const selectedOption = this.querySelector(selectors$J.selectedOption);

        if (selectedOption) selectedOption.click();
      }

      getSearchResults(searchTerm) {
        const queryKey = searchTerm.replace(' ', '-').toLowerCase();
        this.setLiveRegionLoadingState();

        if (this.cachedResults[queryKey]) {
          this.renderSearchResults(this.cachedResults[queryKey]);
          return;
        }

        fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {signal: this.abortController.signal})
          .then((response) => {
            if (!response.ok) {
              var error = new Error(response.status);
              this.close();
              throw error;
            }

            return response.text();
          })
          .then((text) => {
            const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$J.sectionPredictiveSearch).innerHTML;
            // Save bandwidth keeping the cache in all instances synced
            this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
              predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
            });
            this.renderSearchResults(resultsMarkup);
          })
          .catch((error) => {
            if (error?.code === 20) {
              // Code 20 means the call was aborted
              return;
            }
            this.close();
            throw error;
          });
      }

      setLiveRegionLoadingState() {
        this.statusElement = this.statusElement || this.querySelector(selectors$J.predictiveSearchStatus);
        this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

        this.setLiveRegionText(this.loadingText);
        this.setAttribute('loading', true);
      }

      setLiveRegionText(statusText) {
        this.statusElement.setAttribute('aria-hidden', 'false');
        this.statusElement.textContent = statusText;

        setTimeout(() => {
          this.statusElement.setAttribute('aria-hidden', 'true');
        }, 1000);
      }

      renderSearchResults(resultsMarkup) {
        this.predictiveSearchResults.innerHTML = resultsMarkup;

        this.setAttribute('results', true);

        this.setLiveRegionResults();
        this.open();
      }

      setLiveRegionResults() {
        this.removeAttribute('loading');
        this.setLiveRegionText(this.querySelector(selectors$J.searchResultsLiveRegion).textContent);
      }

      open() {
        this.setAttribute('open', true);
        this.input.setAttribute('aria-expanded', true);
        this.isOpen = true;
        this.predictiveSearchResults.style.setProperty('--full-screen', `${window.visualViewport.height}px`);
      }

      close(clearSearchTerm = false) {
        this.closeResults(clearSearchTerm);
        this.isOpen = false;
        this.predictiveSearchResults.style.removeProperty('--full-screen');
      }

      closeResults(clearSearchTerm = false) {
        if (clearSearchTerm) {
          this.input.value = '';
          this.removeAttribute('results');
        }
        const selected = this.querySelector(selectors$J.ariaSelected);

        if (selected) selected.setAttribute('aria-selected', false);

        this.input.setAttribute('aria-activedescendant', '');
        this.removeAttribute('loading');
        this.removeAttribute('open');
        this.input.setAttribute('aria-expanded', false);
        this.predictiveSearchResults?.removeAttribute('style');
      }

      reset() {
        this.predictiveSearchResults.innerHTML = '';

        this.input.val = '';
        this.a11y.removeTrapFocus();

        if (this.popularSearches) {
          this.input.dispatchEvent(new Event('blur', {bubbles: false}));
          this.a11y.trapFocus(this.searchPopdown, {
            elementToFocus: this.input,
          });
        }
      }
    }

    const selectors$I = {
      popoutList: '[data-popout-list]',
      popoutToggle: '[data-popout-toggle]',
      popoutToggleText: '[data-popout-toggle-text]',
      popoutInput: '[data-popout-input]',
      popoutOptions: '[data-popout-option]',
      productGridImage: '[data-product-image]',
      productGridItem: '[data-grid-item]',
      section: '[data-section-type]',
    };

    const classes$y = {
      listVisible: 'popout-list--visible',
      visible: 'is-visible',
      active: 'is-active',
      popoutListTop: 'popout-list--top',
    };

    const attributes$s = {
      ariaExpanded: 'aria-expanded',
      ariaCurrent: 'aria-current',
      dataValue: 'data-value',
      popoutToggleText: 'data-popout-toggle-text',
      submit: 'submit',
    };

    class Popout extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.popoutList = this.querySelector(selectors$I.popoutList);
        this.popoutToggle = this.querySelector(selectors$I.popoutToggle);
        this.popoutToggleText = this.querySelector(selectors$I.popoutToggleText);
        this.popoutInput = this.querySelector(selectors$I.popoutInput);
        this.popoutOptions = this.querySelectorAll(selectors$I.popoutOptions);
        this.productGridItem = this.popoutList.closest(selectors$I.productGridItem);
        this.fireSubmitEvent = this.hasAttribute(attributes$s.submit);

        this.popupToggleFocusoutEvent = (evt) => this.onPopupToggleFocusout(evt);
        this.popupListFocusoutEvent = (evt) => this.onPopupListFocusout(evt);
        this.popupToggleClickEvent = (evt) => this.onPopupToggleClick(evt);
        this.keyUpEvent = (evt) => this.onKeyUp(evt);
        this.bodyClickEvent = (evt) => this.onBodyClick(evt);

        this._connectOptions();
        this._connectToggle();
        this._onFocusOut();
        this.popupListSetDimensions();
      }

      onPopupToggleClick(evt) {
        const button = evt.currentTarget;
        const ariaExpanded = button.getAttribute(attributes$s.ariaExpanded) === 'true';

        if (this.productGridItem) {
          const productGridItemImage = this.productGridItem.querySelector(selectors$I.productGridImage);

          if (productGridItemImage) {
            productGridItemImage.classList.toggle(classes$y.visible, !ariaExpanded);
          }

          this.popoutList.style.maxHeight = `${Math.abs(this.popoutToggle.getBoundingClientRect().bottom - this.productGridItem.getBoundingClientRect().bottom)}px`;
        }

        evt.currentTarget.setAttribute(attributes$s.ariaExpanded, !ariaExpanded);
        this.popoutList.classList.toggle(classes$y.listVisible);
        this.popupListSetDimensions();
        this.toggleListPosition();

        document.body.addEventListener('click', this.bodyClickEvent);
      }

      onPopupToggleFocusout(evt) {
        const popoutLostFocus = this.contains(evt.relatedTarget);

        if (!popoutLostFocus) {
          this._hideList();
        }
      }

      onPopupListFocusout(evt) {
        const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
        const isVisible = this.popoutList.classList.contains(classes$y.listVisible);

        if (isVisible && !childInFocus) {
          this._hideList();
        }
      }

      toggleListPosition() {
        const button = this.querySelector(selectors$I.popoutToggle);
        const ariaExpanded = button.getAttribute(attributes$s.ariaExpanded) === 'true';
        const windowHeight = window.innerHeight;
        const popoutTop = this.getBoundingClientRect().top;

        const removeTopClass = () => {
          this.popoutList.classList.remove(classes$y.popoutListTop);
          this.popoutList.removeEventListener('transitionend', removeTopClass);
        };

        if (ariaExpanded) {
          if (windowHeight / 2 > popoutTop) {
            this.popoutList.classList.add(classes$y.popoutListTop);
          }
        } else {
          this.popoutList.addEventListener('transitionend', removeTopClass);
        }
      }

      popupListSetDimensions() {
        this.popoutList.style.setProperty('--max-width', '100vw');
        this.popoutList.style.setProperty('--max-height', '100vh');

        requestAnimationFrame(() => {
          this.popoutList.style.setProperty('--max-width', `${parseInt(document.body.clientWidth - this.popoutList.getBoundingClientRect().left)}px`);
          this.popoutList.style.setProperty('--max-height', `${parseInt(window.innerHeight - this.popoutList.getBoundingClientRect().top)}px`);
        });
      }

      popupOptionsClick(evt) {
        const link = evt.target.closest(selectors$I.popoutOptions);
        if (link.attributes.href.value === '#') {
          evt.preventDefault();

          const attrValue = evt.currentTarget.hasAttribute(attributes$s.dataValue) ? evt.currentTarget.getAttribute(attributes$s.dataValue) : '';

          this.popoutInput.value = attrValue;

          if (this.popoutInput.disabled) {
            this.popoutInput.removeAttribute('disabled');
          }

          if (this.fireSubmitEvent) {
            this._submitForm(attrValue);
          } else {
            const currentTarget = evt.currentTarget.parentElement;
            const listTargetElement = this.popoutList.querySelector(`.${classes$y.active}`);
            const targetAttribute = this.popoutList.querySelector(`[${attributes$s.ariaCurrent}]`);

            this.popoutInput.dispatchEvent(new Event('change'));

            if (listTargetElement) {
              listTargetElement.classList.remove(classes$y.active);
              currentTarget.classList.add(classes$y.active);
            }

            if (this.popoutInput.name == 'quantity' && !currentTarget.nextSibling) {
              this.classList.add(classes$y.active);
            }

            if (targetAttribute && targetAttribute.hasAttribute(`${attributes$s.ariaCurrent}`)) {
              targetAttribute.removeAttribute(`${attributes$s.ariaCurrent}`);
              evt.currentTarget.setAttribute(`${attributes$s.ariaCurrent}`, 'true');
            }

            if (attrValue !== '') {
              this.popoutToggleText.innerHTML = attrValue;

              if (this.popoutToggleText.hasAttribute(attributes$s.popoutToggleText) && this.popoutToggleText.getAttribute(attributes$s.popoutToggleText) !== '') {
                this.popoutToggleText.setAttribute(attributes$s.popoutToggleText, attrValue);
              }
            }
            this.onPopupToggleFocusout(evt);
            this.onPopupListFocusout(evt);
          }
        }
      }

      onKeyUp(evt) {
        if (evt.code !== 'Escape') {
          return;
        }
        this._hideList();
        this.popoutToggle.focus();
      }

      onBodyClick(evt) {
        const isOption = this.contains(evt.target);
        const isVisible = this.popoutList.classList.contains(classes$y.listVisible);

        if (isVisible && !isOption) {
          this._hideList();
        }
      }

      _connectToggle() {
        this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
      }

      _connectOptions() {
        if (this.popoutOptions.length) {
          this.popoutOptions.forEach((element) => {
            element.addEventListener('click', (evt) => this.popupOptionsClick(evt));
          });
        }
      }

      _onFocusOut() {
        this.addEventListener('keyup', this.keyUpEvent);
        this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
        this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
      }

      _submitForm() {
        const form = this.closest('form');
        if (form) {
          form.submit();
        }
      }

      _hideList() {
        this.popoutList.classList.remove(classes$y.listVisible);
        this.popoutToggle.setAttribute(attributes$s.ariaExpanded, false);
        this.toggleListPosition();
        document.body.removeEventListener('click', this.bodyClickEvent);
      }
    }

    const selectors$H = {
      aos: '[data-aos]:not(.aos-animate)',
      aosAnchor: '[data-aos-anchor]',
      aosIndividual: '[data-aos]:not([data-aos-anchor]):not(.aos-animate)',
    };

    const classes$x = {
      aosAnimate: 'aos-animate',
    };

    const observerConfig = {
      attributes: false,
      childList: true,
      subtree: true,
    };

    let anchorContainers = [];

    const mutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          const element = mutation.target;
          const elementsToAnimate = element.querySelectorAll(selectors$H.aos);
          const anchors = element.querySelectorAll(selectors$H.aosAnchor);

          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((element) => {
              aosItemObserver.observe(element);
            });
          }

          if (anchors.length) {
            // Get all anchors and attach observers
            initAnchorObservers(anchors);
          }
        }
      }
    };

    /*
      Observe each element that needs to be animated
    */
    const aosItemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes$x.aosAnimate);

            // Stop observing element after it was animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Observe anchor elements
    */
    const aosAnchorObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            const elementsToAnimate = entry.target.querySelectorAll(selectors$H.aos);

            if (elementsToAnimate.length) {
              elementsToAnimate.forEach((item) => {
                item.classList.add(classes$x.aosAnimate);
              });
            }

            // Stop observing anchor element after inner elements were animated
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    /*
      Watch for mutations in the body and start observing the newly added animated elements and anchors
    */
    function bodyMutationObserver() {
      const bodyObserver = new MutationObserver(mutationCallback);
      bodyObserver.observe(document.body, observerConfig);
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function elementsIntersectionObserver() {
      const elementsToAnimate = document.querySelectorAll(selectors$H.aosIndividual);

      if (elementsToAnimate.length) {
        elementsToAnimate.forEach((element) => {
          aosItemObserver.observe(element);
        });
      }
    }

    /*
      Observe animated elements that have attribute [data-aos]
    */
    function anchorsIntersectionObserver() {
      const anchors = document.querySelectorAll(selectors$H.aosAnchor);

      if (anchors.length) {
        // Get all anchors and attach observers
        initAnchorObservers(anchors);
      }
    }

    function initAnchorObservers(anchors) {
      if (!anchors.length) return;

      anchors.forEach((anchor) => {
        const containerId = anchor.dataset.aosAnchor;

        // Avoid adding multiple observers to the same element
        if (containerId && anchorContainers.indexOf(containerId) === -1) {
          const container = document.querySelector(containerId);

          if (container) {
            aosAnchorObserver.observe(container);
            anchorContainers.push(containerId);
          }
        }
      });
    }

    function initAnimations() {
      elementsIntersectionObserver();
      anchorsIntersectionObserver();
      bodyMutationObserver();

      // Remove unloaded section from the anchors array on section:unload event
      document.addEventListener('shopify:section:unload', (e) => {
        const sectionId = '#' + e.target.querySelector('[data-section-id]')?.id;
        const sectionIndex = anchorContainers.indexOf(sectionId);

        if (sectionIndex !== -1) {
          anchorContainers.splice(sectionIndex, 1);
        }
      });
    }

    const selectors$G = {
      deferredMediaButton: '[data-deferred-media-button]',
      media: 'video, model-viewer, iframe',
      youtube: '[data-host="youtube"]',
      vimeo: '[data-host="vimeo"]',
      productGridItem: '[data-grid-item]',
      section: '.shopify-section',
      template: 'template',
      video: 'video',
      productModel: 'product-model',
    };

    const attributes$r = {
      loaded: 'loaded',
      autoplay: 'autoplay',
    };

    class DeferredMedia extends HTMLElement {
      constructor() {
        super();
        const poster = this.querySelector(selectors$G.deferredMediaButton);
        poster?.addEventListener('click', this.loadContent.bind(this));
        this.section = this.closest(selectors$G.section);
        this.productGridItem = this.closest(selectors$G.productGridItem);
        this.hovered = false;

        this.mouseEnterEvent = () => this.mouseEnterActions();
        this.mouseLeaveEvent = () => this.mouseLeaveActions();
      }

      connectedCallback() {
        if (this.productGridItem) {
          this.section.addEventListener('mouseover', this.mouseOverEvent, {once: true});

          this.addEventListener('mouseenter', this.mouseEnterEvent);

          this.addEventListener('mouseleave', this.mouseLeaveEvent);
        }
      }

      disconnectedCallback() {
        if (this.productGridItem) {
          this.section.removeEventListener('mouseover', this.mouseOverEvent, {once: true});

          this.removeEventListener('mouseenter', this.mouseEnterEvent);

          this.removeEventListener('mouseleave', this.mouseLeaveEvent);
        }
      }

      mouseEnterActions() {
        this.hovered = true;

        this.videoActions();

        if (!this.getAttribute(attributes$r.loaded)) {
          this.loadContent();
        }
      }

      mouseLeaveActions() {
        this.hovered = false;

        this.videoActions();
      }

      videoActions() {
        if (this.getAttribute(attributes$r.loaded)) {
          const youtube = this.querySelector(selectors$G.youtube);
          const vimeo = this.querySelector(selectors$G.vimeo);
          const mediaExternal = youtube || vimeo;
          const mediaNative = this.querySelector(selectors$G.video);
          if (mediaExternal) {
            let action = this.hovered ? 'playVideo' : 'pauseVideo';
            let string = `{"event":"command","func":"${action}","args":""}`;

            if (vimeo) {
              action = this.hovered ? 'play' : 'pause';
              string = `{"method":"${action}"}`;
            }

            mediaExternal.contentWindow.postMessage(string, '*');

            mediaExternal.addEventListener('load', (e) => {
              // Call videoActions() again when iframe is loaded to prevent autoplay being triggered if it loads after the "mouseleave" event
              this.videoActions();
            });
          } else if (mediaNative) {
            if (this.hovered) {
              mediaNative.play();
            } else {
              mediaNative.pause();
            }
          }
        }
      }

      loadContent(focus = true) {
        this.pauseAllMedia();

        if (!this.getAttribute(attributes$r.loaded)) {
          const content = document.createElement('div');
          const templateContent = this.querySelector(selectors$G.template).content.firstElementChild.cloneNode(true);
          content.appendChild(templateContent);
          this.setAttribute(attributes$r.loaded, true);

          const mediaElement = this.appendChild(content.querySelector(selectors$G.media));
          if (focus) mediaElement.focus();
          if (mediaElement.nodeName == 'VIDEO' && mediaElement.getAttribute(attributes$r.autoplay)) {
            // Force autoplay on Safari browsers
            mediaElement.play();
          }

          if (this.productGridItem) {
            this.videoActions();
          }
        }
      }

      pauseAllMedia() {
        document.querySelectorAll(selectors$G.youtube).forEach((video) => {
          video.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });
        document.querySelectorAll(selectors$G.vimeo).forEach((video) => {
          video.contentWindow.postMessage('{"method":"pause"}', '*');
        });
        document.querySelectorAll(selectors$G.video).forEach((video) => video.pause());
        document.querySelectorAll(selectors$G.productModel).forEach((model) => {
          if (model.modelViewerUI) model.modelViewerUI.pause();
        });
      }
    }

    /*
      Observe whether or not elements are visible in their container.
      Used for sections with horizontal sliders built by native scrolling
    */

    const classes$w = {
      visible: 'is-visible',
    };

    class IsInView {
      constructor(container, itemSelector) {
        if (!container || !itemSelector) return;

        this.observer = null;
        this.container = container;
        this.itemSelector = itemSelector;

        this.init();
      }

      init() {
        const options = {
          root: this.container,
          threshold: [0.01, 0.5, 0.75, 0.99],
        };

        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.99) {
              entry.target.classList.add(classes$w.visible);
            } else {
              entry.target.classList.remove(classes$w.visible);
            }
          });
        }, options);

        this.container.querySelectorAll(this.itemSelector)?.forEach((item) => {
          this.observer.observe(item);
        });
      }

      destroy() {
        this.observer.disconnect();
      }
    }

    const classes$v = {
      dragging: 'is-dragging',
      enabled: 'is-enabled',
      scrolling: 'is-scrolling',
      visible: 'is-visible',
    };

    const selectors$F = {
      image: 'img, svg',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    class DraggableSlider {
      constructor(sliderElement) {
        this.slider = sliderElement;
        this.isDown = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.velX = 0;
        this.scrollAnimation = null;
        this.isScrolling = false;
        this.duration = 800; // Change this value if you want to increase or decrease the velocity

        this.scrollStep = this.scrollStep.bind(this);
        this.scrollToSlide = this.scrollToSlide.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseWheel = this.handleMouseWheel.bind(this);

        this.slider.addEventListener('mousedown', this.handleMouseDown);
        this.slider.addEventListener('mouseleave', this.handleMouseLeave);
        this.slider.addEventListener('mouseup', this.handleMouseUp);
        this.slider.addEventListener('mousemove', this.handleMouseMove);
        this.slider.addEventListener('wheel', this.handleMouseWheel, {passive: true});

        this.slider.classList.add(classes$v.enabled);
      }

      handleMouseDown(e) {
        e.preventDefault();
        this.isDown = true;
        this.startX = e.pageX - this.slider.offsetLeft;
        this.scrollLeft = this.slider.scrollLeft;
        this.cancelMomentumTracking();
      }

      handleMouseLeave() {
        if (!this.isDown) return;
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseUp() {
        this.isDown = false;
        this.beginMomentumTracking();
      }

      handleMouseMove(e) {
        if (!this.isDown) return;
        e.preventDefault();

        const x = e.pageX - this.slider.offsetLeft;
        const ratio = 1; // Increase the number to make it scroll-fast
        const walk = (x - this.startX) * ratio;
        const prevScrollLeft = this.slider.scrollLeft;
        const direction = walk > 0 ? 1 : -1;

        this.slider.classList.add(classes$v.dragging, classes$v.scrolling);
        this.slider.scrollLeft = this.scrollLeft - walk;

        if (this.slider.scrollLeft !== prevScrollLeft) {
          this.velX = this.slider.scrollLeft - prevScrollLeft || direction;
        }
      }

      handleMouseWheel() {
        this.cancelMomentumTracking();
        this.slider.classList.remove(classes$v.scrolling);
      }

      beginMomentumTracking() {
        this.isScrolling = false;
        this.slider.classList.remove(classes$v.dragging);
        this.cancelMomentumTracking();
        this.scrollToSlide();
      }

      cancelMomentumTracking() {
        cancelAnimationFrame(this.scrollAnimation);
      }

      scrollToSlide() {
        if (!this.velX && !this.isScrolling) return;

        const slide = this.slider.querySelector(`${selectors$F.slide}.${classes$v.visible}`);
        if (!slide) return;

        const gap = parseInt(window.getComputedStyle(slide).marginRight) || 0;
        const slideWidth = slide.offsetWidth + gap;
        const targetPosition = slide.offsetLeft;
        const direction = this.velX > 0 ? 1 : -1;
        const slidesToScroll = Math.floor(Math.abs(this.velX) / 100) || 1;

        this.startPosition = this.slider.scrollLeft;
        this.distance = targetPosition - this.startPosition;
        this.startTime = performance.now();
        this.isScrolling = true;

        // Make sure it will move to the next slide if you don't drag far enough
        if (direction < 0 && this.velX < slideWidth) {
          this.distance -= slideWidth * slidesToScroll;
        }

        // Make sure it will move to the previous slide if you don't drag far enough
        if (direction > 0 && this.velX < slideWidth) {
          this.distance += slideWidth * slidesToScroll;
        }

        // Run scroll animation
        this.scrollAnimation = requestAnimationFrame(this.scrollStep);
      }

      scrollStep() {
        const currentTime = performance.now() - this.startTime;
        const scrollPosition = parseFloat(this.easeOutCubic(Math.min(currentTime, this.duration))).toFixed(1);

        this.slider.scrollLeft = scrollPosition;

        if (currentTime < this.duration) {
          this.scrollAnimation = requestAnimationFrame(this.scrollStep);
        } else {
          this.slider.classList.remove(classes$v.scrolling);

          // Reset velocity
          this.velX = 0;
          this.isScrolling = false;
        }
      }

      easeOutCubic(t) {
        t /= this.duration;
        t--;
        return this.distance * (t * t * t + 1) + this.startPosition;
      }

      destroy() {
        this.slider.classList.remove(classes$v.enabled);
        this.slider.removeEventListener('mousedown', this.handleMouseDown);
        this.slider.removeEventListener('mouseleave', this.handleMouseLeave);
        this.slider.removeEventListener('mouseup', this.handleMouseUp);
        this.slider.removeEventListener('mousemove', this.handleMouseMove);
        this.slider.removeEventListener('wheel', this.handleMouseWheel);
      }
    }

    /*
      Trigger event after all animations complete in a specific section
    */
    function waitForAllAnimationsEnd(section) {
      return new Promise((resolve, rejected) => {
        const animatedElements = section.querySelectorAll('[data-aos]');
        let animationCount = 0;

        function onAnimationEnd(event) {
          animationCount++;

          if (animationCount === animatedElements.length) {
            // All animations have ended
            resolve();
          }

          event.target.removeEventListener('animationend', onAnimationEnd);
        }

        animatedElements.forEach((element) => {
          element.addEventListener('animationend', onAnimationEnd);
        });

        if (!animationCount) rejected();
      });
    }

    const selectors$E = {
      buttonArrow: '[data-button-arrow]',
      collectionImage: '[data-collection-image]',
      columnImage: '[data-column-image]',
      productImage: '[data-product-image]',
      slide: '[data-grid-item]',
      slider: '[data-grid-slider]',
    };

    const attributes$q = {
      buttonPrev: 'data-button-prev',
      buttonNext: 'data-button-next',
      alignArrows: 'align-arrows',
    };

    const classes$u = {
      arrows: 'slider__arrows',
      visible: 'is-visible',
      scrollSnapDisabled: 'scroll-snap-disabled',
    };

    class GridSlider extends HTMLElement {
      constructor() {
        super();

        this.isInitialized = false;
        this.draggableSlider = null;
        this.positionArrows = this.positionArrows.bind(this);
        this.onButtonArrowClick = (e) => this.buttonArrowClickEvent(e);
        this.slidesObserver = null;
        this.firstLastSlidesObserver = null;
        this.isDragging = false;
        this.toggleSlider = this.toggleSlider.bind(this);
      }

      connectedCallback() {
        this.init();
        this.addEventListener('theme:grid-slider:init', this.init);
      }

      init() {
        this.slider = this.querySelector(selectors$E.slider);
        this.slides = this.querySelectorAll(selectors$E.slide);
        this.buttons = this.querySelectorAll(selectors$E.buttonArrow);
        this.slider.classList.add(classes$u.scrollSnapDisabled);
        this.toggleSlider();
        document.addEventListener('theme:resize:width', this.toggleSlider);

        waitForAllAnimationsEnd(this)
          .then(() => {
            this.slider.classList.remove(classes$u.scrollSnapDisabled);
          })
          .catch(() => {
            this.slider.classList.remove(classes$u.scrollSnapDisabled);
          });
      }

      toggleSlider() {
        const sliderWidth = this.slider.clientWidth;
        const slidesWidth = this.getSlidesWidth();
        const isEnabled = sliderWidth < slidesWidth;

        if (isEnabled && (isDesktop() || !window.theme.touch)) {
          if (this.isInitialized) return;

          this.slidesObserver = new IsInView(this.slider, selectors$E.slide);

          this.initArrows();
          this.isInitialized = true;

          // Create an instance of DraggableSlider
          this.draggableSlider = new DraggableSlider(this.slider);
        } else {
          this.destroy();
        }
      }

      initArrows() {
        // Create arrow buttons if don't exist
        if (!this.buttons.length) {
          const buttonsWrap = document.createElement('div');
          buttonsWrap.classList.add(classes$u.arrows);
          buttonsWrap.innerHTML = theme.sliderArrows.prev + theme.sliderArrows.next;

          // Append buttons outside the slider element
          this.append(buttonsWrap);
          this.buttons = this.querySelectorAll(selectors$E.buttonArrow);
          this.buttonPrev = this.querySelector(`[${attributes$q.buttonPrev}]`);
          this.buttonNext = this.querySelector(`[${attributes$q.buttonNext}]`);
        }

        this.toggleArrowsObserver();

        if (this.hasAttribute(attributes$q.alignArrows)) {
          this.positionArrows();
          this.arrowsResizeObserver();
        }

        this.buttons.forEach((buttonArrow) => {
          buttonArrow.addEventListener('click', this.onButtonArrowClick);
        });
      }

      buttonArrowClickEvent(e) {
        e.preventDefault();

        const firstVisibleSlide = this.slider.querySelector(`${selectors$E.slide}.${classes$u.visible}`);
        let slide = null;

        if (e.target.hasAttribute(attributes$q.buttonPrev)) {
          slide = firstVisibleSlide?.previousElementSibling;
        }

        if (e.target.hasAttribute(attributes$q.buttonNext)) {
          slide = firstVisibleSlide?.nextElementSibling;
        }

        this.goToSlide(slide);
      }

      removeArrows() {
        this.querySelector(`.${classes$u.arrows}`)?.remove();
      }

      // Go to prev/next slide on arrow click
      goToSlide(slide) {
        if (!slide) return;

        this.slider.scrollTo({
          top: 0,
          left: slide.offsetLeft,
          behavior: 'smooth',
        });
      }

      getSlidesWidth() {
        return this.slider.querySelector(selectors$E.slide)?.clientWidth * this.slider.querySelectorAll(selectors$E.slide).length;
      }

      toggleArrowsObserver() {
        // Add disable class/attribute on prev/next button

        if (this.buttonPrev && this.buttonNext) {
          const slidesCount = this.slides.length;
          const firstSlide = this.slides[0];
          const lastSlide = this.slides[slidesCount - 1];

          const config = {
            attributes: true,
            childList: false,
            subtree: false,
          };

          const callback = (mutationList) => {
            for (const mutation of mutationList) {
              if (mutation.type === 'attributes') {
                const slide = mutation.target;
                const isDisabled = Boolean(slide.classList.contains(classes$u.visible));

                if (slide == firstSlide) {
                  this.buttonPrev.disabled = isDisabled;
                }

                if (slide == lastSlide) {
                  this.buttonNext.disabled = isDisabled;
                }
              }
            }
          };

          if (firstSlide && lastSlide) {
            this.firstLastSlidesObserver = new MutationObserver(callback);
            this.firstLastSlidesObserver.observe(firstSlide, config);
            this.firstLastSlidesObserver.observe(lastSlide, config);
          }
        }
      }

      positionArrows() {
        const targetElement = this.slider.querySelector(selectors$E.productImage) || this.slider.querySelector(selectors$E.collectionImage) || this.slider.querySelector(selectors$E.columnImage) || this.slider;

        if (!targetElement) return;

        this.style.setProperty('--button-position', `${targetElement.clientHeight / 2}px`);
      }

      arrowsResizeObserver() {
        document.addEventListener('theme:resize:width', this.positionArrows);
      }

      disconnectedCallback() {
        this.destroy();
        document.removeEventListener('theme:resize:width', this.toggleSlider);
      }

      destroy() {
        this.isInitialized = false;
        this.draggableSlider?.destroy();
        this.draggableSlider = null;
        this.slidesObserver?.destroy();
        this.slidesObserver = null;
        this.removeArrows();

        document.removeEventListener('theme:resize:width', this.positionArrows);
      }
    }

    const selectors$D = {
      time: 'time',
      days: '[data-days]',
      hours: '[data-hours]',
      minutes: '[data-minutes]',
      seconds: '[data-seconds]',
      shopifySection: '.shopify-section',
      countdownBlock: '[data-countdown-block]',
      tickerText: '[data-ticker-text]',
    };

    const attributes$p = {
      expirationBehavior: 'data-expiration-behavior',
      clone: 'data-clone',
    };

    const classes$t = {
      showMessage: 'show-message',
      hideCountdown: 'hidden',
    };

    const settings$1 = {
      hideSection: 'hide-section',
      showMessage: 'show-message',
    };

    class CountdownTimer extends HTMLElement {
      constructor() {
        super();

        this.section = this.closest(selectors$D.shopifySection);
        this.countdownParent = this.closest(selectors$D.countdownBlock) || this.section;
        this.expirationBehavior = this.getAttribute(attributes$p.expirationBehavior);

        this.time = this.querySelector(selectors$D.time);
        this.days = this.querySelector(selectors$D.days);
        this.hours = this.querySelector(selectors$D.hours);
        this.minutes = this.querySelector(selectors$D.minutes);
        this.seconds = this.querySelector(selectors$D.seconds);

        // Get the current and expiration dates in Unix timestamp format (milliseconds)
        this.endDate = Date.parse(this.time.dateTime);
        this.daysInMs = 1000 * 60 * 60 * 24;
        this.hoursInMs = this.daysInMs / 24;
        this.minutesInMs = this.hoursInMs / 60;
        this.secondsInMs = this.minutesInMs / 60;

        this.shouldHideOnComplete = this.expirationBehavior === settings$1.hideSection;
        this.shouldShowMessage = this.expirationBehavior === settings$1.showMessage;

        this.update = this.update.bind(this);
      }

      connectedCallback() {
        if (isNaN(this.endDate)) {
          this.onComplete();
          return;
        }

        if (this.endDate <= Date.now()) {
          this.onComplete();
          return;
        }
        // Initial update to avoid showing old time
        this.update();
        // Update the countdown every second
        this.interval = setInterval(this.update, 1000);
      }

      disconnectedCallback() {
        this.stopTimer();
      }

      convertTime(timeInMs) {
        const days = this.formatDigits(parseInt(timeInMs / this.daysInMs, 10));
        timeInMs -= days * this.daysInMs;

        const hours = this.formatDigits(parseInt(timeInMs / this.hoursInMs, 10));
        timeInMs -= hours * this.hoursInMs;

        const minutes = this.formatDigits(parseInt(timeInMs / this.minutesInMs, 10));
        timeInMs -= minutes * this.minutesInMs;

        const seconds = this.formatDigits(parseInt(timeInMs / this.secondsInMs, 10));

        return {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        };
      }

      // Make numbers less than 10 to appear with a leading zero like 01, 02, 03
      formatDigits(number) {
        if (number < 10) number = '0' + number;
        return number;
      }

      render(timer) {
        this.days.textContent = timer.days;
        this.hours.textContent = timer.hours;
        this.minutes.textContent = timer.minutes;
        this.seconds.textContent = timer.seconds;
      }

      stopTimer() {
        clearInterval(this.interval);
      }

      onComplete() {
        this.render({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        if (this.shouldHideOnComplete) {
          this.countdownParent?.classList.add(classes$t.hideCountdown);
          this.countdownParent?.dispatchEvent(
            new CustomEvent('theme:countdown:hide', {
              detail: {
                element: this,
              },
              bubbles: true,
            })
          );
        }

        if (this.shouldShowMessage) {
          this.classList?.add(classes$t.showMessage);

          // Prevent cloned elements to dispatch events multiple times as it causes call stack
          if (this.closest(selectors$D.tickerText).hasAttribute(attributes$p.clone)) return;

          this.countdownParent?.dispatchEvent(
            new CustomEvent('theme:countdown:expire', {
              bubbles: true,
            })
          );
        }
      }

      // Function to update the countdown
      update() {
        const timeNow = new Date().getTime();
        const timeDiff = this.endDate - timeNow;

        if (timeDiff < 1000) {
          this.stopTimer();
          this.onComplete();
        }

        const timeRemaining = this.convertTime(timeDiff);
        this.render(timeRemaining);
      }
    }

    const selectors$C = {
      animates: 'data-animates',
      drawerMenu: '[data-drawer-menu]',
      links: '[data-links]',
      sliderule: '[data-sliderule]',
      slideruleOpen: 'data-sliderule-open',
      slideruleClose: 'data-sliderule-close',
      sliderulePane: 'data-sliderule-pane',
      drawerContent: '[data-drawer-content]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      children: `:scope > [data-animates],
             :scope > * > [data-animates],
             :scope > * > * > [data-animates],
             :scope > * > .sliderule-grid  > *`,
    };

    const classes$s = {
      isOpen: 'is-open',
      isVisible: 'is-visible',
      isHiding: 'is-hiding',
      isHidden: 'is-hidden',
      focused: 'is-focused',
      scrolling: 'is-scrolling',
    };

    const attributes$o = {
      sliderule: 'data-sliderule',
    };

    class HeaderMobileSliderule extends HTMLElement {
      constructor() {
        super();

        this.key = this.id;
        this.drawerMenu = this.closest(selectors$C.drawerMenu);
        this.sliderule = this.querySelector(selectors$C.sliderule);
        const btnSelector = `[${selectors$C.slideruleOpen}='${this.key}']`;
        this.exitSelector = `[${selectors$C.slideruleClose}='${this.key}']`;
        this.trigger = this.querySelector(btnSelector);
        this.exit = document.querySelectorAll(this.exitSelector);
        this.pane = this.trigger.closest(`[${selectors$C.sliderulePane}]`);
        this.childrenElements = this.querySelectorAll(selectors$C.children);
        this.drawerContent = this.closest(selectors$C.drawerContent);
        this.cachedButton = null;
        this.accessibility = a11y;

        this.trigger.setAttribute('aria-haspopup', true);
        this.trigger.setAttribute('aria-expanded', false);
        this.trigger.setAttribute('aria-controls', this.key);
        this.closeSliderule = this.closeSliderule.bind(this);

        this.clickEvents();
        this.keyboardEvents();

        document.addEventListener('theme:sliderule:close', this.closeSliderule);
      }

      clickEvents() {
        this.trigger.addEventListener('click', () => {
          this.cachedButton = this.trigger;
          this.showSliderule();
        });
        this.exit.forEach((element) => {
          element.addEventListener('click', () => {
            this.hideSliderule();
          });
        });
      }

      keyboardEvents() {
        this.addEventListener('keyup', (evt) => {
          evt.stopPropagation();
          if (evt.code !== 'Escape') {
            return;
          }

          this.hideSliderule();
        });
      }

      trapFocusSliderule(showSliderule = true) {
        const trapFocusButton = showSliderule ? this.querySelector(this.exitSelector) : this.cachedButton;

        this.accessibility.removeTrapFocus();

        if (trapFocusButton && this.drawerContent) {
          this.accessibility.trapFocus(this.drawerContent, {
            elementToFocus: document.body.classList.contains(classes$s.focused) ? trapFocusButton : null,
          });
        }
      }

      hideSliderule(close = false) {
        const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
        this.pane.setAttribute(selectors$C.sliderulePane, newPosition);
        this.pane.classList.add(classes$s.isHiding);
        this.sliderule.classList.add(classes$s.isHiding);
        const hiddenSelector = close ? `[${selectors$C.animates}].${classes$s.isHidden}` : `[${selectors$C.animates}="${newPosition}"]`;
        const hiddenItems = this.pane.querySelectorAll(hiddenSelector);
        if (hiddenItems.length) {
          hiddenItems.forEach((element) => {
            element.classList.remove(classes$s.isHidden);
          });
        }

        const isDrawerMenuOpen = this.closest('header-drawer').classList.contains(classes$s.isOpen);

        if (newPosition > 0 && isDrawerMenuOpen) {
          const sliderulePrev = this.sliderule.closest(`[${attributes$o.sliderule}="${newPosition}"]`);
          const linksHeight = sliderulePrev.querySelector(selectors$C.links).scrollHeight;

          setTimeout(() => {
            this.drawerMenu.style.height = `${linksHeight}px`;
          }, 500);
        } else {
          setTimeout(() => {
            this.drawerMenu.style.height = `auto`;
          }, 500);
        }

        const children = close ? this.pane.querySelectorAll(`.${classes$s.isVisible}, .${classes$s.isHiding}`) : this.childrenElements;
        children.forEach((element, index) => {
          const lastElement = children.length - 1 == index;
          element.classList.remove(classes$s.isVisible);
          if (close) {
            element.classList.remove(classes$s.isHiding);
            this.pane.classList.remove(classes$s.isHiding);
          }
          const removeHidingClass = () => {
            if (parseInt(this.pane.getAttribute(selectors$C.sliderulePane)) === newPosition) {
              this.sliderule.classList.remove(classes$s.isVisible);
            }
            this.sliderule.classList.remove(classes$s.isHiding);
            this.pane.classList.remove(classes$s.isHiding);

            if (lastElement) {
              this.accessibility.removeTrapFocus();
              if (!close) {
                this.trapFocusSliderule(false);
              }
            }

            element.removeEventListener('animationend', removeHidingClass);
          };

          if (window.theme.settings.enableAnimations) {
            element.addEventListener('animationend', removeHidingClass);
          } else {
            removeHidingClass();
          }
        });
      }

      showSliderule() {
        let lastScrollableFrame = null;
        const parent = this.closest(`.${classes$s.isVisible}`);
        let lastScrollableElement = this.pane;

        if (parent) {
          lastScrollableElement = parent;
        }

        lastScrollableElement.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });

        lastScrollableElement.classList.add(classes$s.scrolling);

        const lastScrollableIsScrolling = () => {
          if (lastScrollableElement.scrollTop <= 0) {
            lastScrollableElement.classList.remove(classes$s.scrolling);
            if (lastScrollableFrame) {
              cancelAnimationFrame(lastScrollableFrame);
            }
          } else {
            lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);
          }
        };

        lastScrollableFrame = requestAnimationFrame(lastScrollableIsScrolling);

        const oldPosition = parseInt(this.pane.dataset.sliderulePane, 10);
        const newPosition = oldPosition + 1;
        this.sliderule.classList.add(classes$s.isVisible);
        this.pane.setAttribute(selectors$C.sliderulePane, newPosition);

        if (newPosition > 0) {
          const linksHeight = this.sliderule.scrollHeight;
          this.drawerMenu.style.height = `${linksHeight}px`;
        }

        const hiddenItems = this.pane.querySelectorAll(`[${selectors$C.animates}="${oldPosition}"]`);
        if (hiddenItems.length) {
          hiddenItems.forEach((element, index) => {
            const lastElement = hiddenItems.length - 1 == index;
            element.classList.add(classes$s.isHiding);
            const removeHidingClass = () => {
              element.classList.remove(classes$s.isHiding);
              if (parseInt(this.pane.getAttribute(selectors$C.sliderulePane)) !== oldPosition) {
                element.classList.add(classes$s.isHidden);
              }

              if (lastElement) {
                this.trapFocusSliderule();
              }
              element.removeEventListener('animationend', removeHidingClass);
            };

            if (window.theme.settings.enableAnimations) {
              element.addEventListener('animationend', removeHidingClass);
            } else {
              removeHidingClass();
            }
          });
        }
      }

      closeSliderule() {
        if (this.pane && this.pane.hasAttribute(selectors$C.sliderulePane) && parseInt(this.pane.getAttribute(selectors$C.sliderulePane)) > 0) {
          this.hideSliderule(true);
          if (parseInt(this.pane.getAttribute(selectors$C.sliderulePane)) > 0) {
            this.pane.setAttribute(selectors$C.sliderulePane, 0);
          }
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:sliderule:close', this.closeSliderule);
      }
    }

    // Safari requestIdleCallback polyfill
    window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now();
        return setTimeout(function () {
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 50 - (Date.now() - start));
            },
          });
        }, 1);
      };
    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id);
      };

    if (window.theme.settings.enableAnimations) {
      initAnimations();
    }

    resizeListener();
    scrollListener();
    isTouch();
    setVars();
    loadedImagesEventHook();

    window.addEventListener('DOMContentLoaded', () => {
      setVarsOnResize();
      ariaToggle(document);
      floatLabels(document);
      wrapElements(document);
      removeLoadingClassFromLoadedImages(document);
      loading();
      appendCartItems();

      requestIdleCallback(() => {
        if (Shopify.visualPreviewMode) {
          document.documentElement.classList.add('preview-mode');
        }
      });
    });

    document.addEventListener('shopify:section:load', (e) => {
      const container = e.target;
      floatLabels(container);
      wrapElements(container);
      ariaToggle(document);
      setVarsOnResize();
    });

    if (!customElements.get('header-drawer')) {
      customElements.define('header-drawer', HeaderDrawer);
    }

    if (!customElements.get('mobile-sliderule')) {
      customElements.define('mobile-sliderule', HeaderMobileSliderule);
    }

    if (!customElements.get('popout-select')) {
      customElements.define('popout-select', Popout);
    }

    if (!customElements.get('predictive-search')) {
      customElements.define('predictive-search', PredictiveSearch);
    }

    if (!customElements.get('deferred-media')) {
      customElements.define('deferred-media', DeferredMedia);
    }

    if (!customElements.get('grid-slider')) {
      customElements.define('grid-slider', GridSlider);
    }

    if (!customElements.get('countdown-timer')) {
      customElements.define('countdown-timer', CountdownTimer);
    }

    /**
     * Module to show Recently Viewed Products
     *
     * Copyright (c) 2014 Caroline Schnapp (11heavens.com)
     * Dual licensed under the MIT and GPL licenses:
     * http://www.opensource.org/licenses/mit-license.php
     * http://www.gnu.org/licenses/gpl.html
     *
     */

    Shopify.Products = (function () {
      const config = {
        howManyToShow: 4,
        howManyToStoreInMemory: 10,
        wrapperId: 'recently-viewed-products',
        section: null,
        target: 'api-product-grid-item',
        onComplete: null,
      };

      let productHandleQueue = [];
      let wrapper = null;
      let howManyToShowItems = null;

      const today = new Date();
      const expiresDate = new Date();
      const daysToExpire = 90;
      expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

      const cookie = {
        configuration: {
          expires: expiresDate.toGMTString(),
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        },
        name: 'shopify_recently_viewed',
        write: function (recentlyViewed) {
          const recentlyViewedString = encodeURIComponent(recentlyViewed.join(' '));
          document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        },
        read: function () {
          let recentlyViewed = [];
          let cookieValue = null;

          if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
            cookieValue = document.cookie
              .split('; ')
              .find((row) => row.startsWith(this.name))
              .split('=')[1];
          }

          if (cookieValue !== null) {
            recentlyViewed = decodeURIComponent(cookieValue).split(' ');
          }

          return recentlyViewed;
        },
        destroy: function () {
          const cookieVal = null;
          document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        },
        remove: function (productHandle) {
          const recentlyViewed = this.read();
          const position = recentlyViewed.indexOf(productHandle);
          if (position !== -1) {
            recentlyViewed.splice(position, 1);
            this.write(recentlyViewed);
          }
        },
      };

      const finalize = (wrapper, section) => {
        wrapper.classList.remove('hidden');
        const cookieItemsLength = cookie.read().length;

        if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
          let allClassesArr = [];
          let addClassesArr = [];
          let objCounter = 0;
          for (const property in Shopify.recentlyViewed) {
            objCounter += 1;
            const objString = Shopify.recentlyViewed[property];
            const objArr = objString.split(' ');
            const propertyIdx = parseInt(property.split('_')[1]);
            allClassesArr = [...allClassesArr, ...objArr];

            if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
              addClassesArr = [...addClassesArr, ...objArr];
            }
          }

          for (let i = 0; i < wrapper.children.length; i++) {
            const element = wrapper.children[i];
            if (allClassesArr.length) {
              element.classList.remove(...allClassesArr);
            }

            if (addClassesArr.length) {
              element.classList.add(...addClassesArr);
            }
          }
        }

        // If we have a callback.
        if (config.onComplete) {
          try {
            config.onComplete(wrapper, section);
          } catch (error) {
            console.log(error);
          }
        }
      };

      const moveAlong = (shown, productHandleQueue, wrapper, section, target, howManyToShow) => {
        if (productHandleQueue.length && shown < howManyToShow) {
          fetch(`${window.theme.routes.root}products/${productHandleQueue[0]}?section_id=${target}`)
            .then((response) => response.text())
            .then((product) => {
              const aosDelay = shown * 100;
              const aosAnchor = wrapper.id ? `#${wrapper.id}` : '';
              const fresh = document.createElement('div');
              let productReplaced = product;
              productReplaced = productReplaced.includes('||itemAnimationDelay||') ? productReplaced.replaceAll('||itemAnimationDelay||', aosDelay) : productReplaced;
              productReplaced = productReplaced.includes('||itemAnimationAnchor||') ? productReplaced.replaceAll('||itemAnimationAnchor||', aosAnchor) : productReplaced;
              fresh.innerHTML = productReplaced;

              wrapper.innerHTML += fresh.querySelector('[data-api-content]').innerHTML;

              productHandleQueue.shift();
              shown++;
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            })
            .catch(() => {
              cookie.remove(productHandleQueue[0]);
              productHandleQueue.shift();
              moveAlong(shown, productHandleQueue, wrapper, section, target, howManyToShow);
            });
        } else {
          finalize(wrapper, section);
        }
      };

      return {
        showRecentlyViewed: function (params) {
          const paramsNew = params || {};
          const shown = 0;

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          productHandleQueue = cookie.read();

          // Element where to insert.
          wrapper = document.querySelector(`#${config.wrapperId}`);

          // How many products to show.
          howManyToShowItems = config.howManyToShow;
          config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

          // If we have any to show.
          if (config.howManyToShow && wrapper) {
            // Getting each product with an Ajax call and rendering it on the page.
            moveAlong(shown, productHandleQueue, wrapper, config.section, config.target, howManyToShowItems);
          }
        },

        getConfig: function () {
          return config;
        },

        clearList: function () {
          cookie.destroy();
        },

        recordRecentlyViewed: function (params) {
          const paramsNew = params || {};

          // Update defaults.
          Object.assign(config, paramsNew);

          // Read cookie.
          let recentlyViewed = cookie.read();

          // If we are on a product page.
          if (window.location.pathname.indexOf('/products/') !== -1) {
            // What is the product handle on this page.
            let productHandle = decodeURIComponent(window.location.pathname)
              .match(
                /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
              )[0]
              .split('/products/')[1];

            if (config.handle) {
              productHandle = config.handle;
            }

            // In what position is that product in memory.
            const position = recentlyViewed.indexOf(productHandle);

            // If not in memory.
            if (position === -1) {
              // Add product at the start of the list.
              recentlyViewed.unshift(productHandle);
              // Only keep what we need.
              recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
            } else {
              // Remove the product and place it at start of list.
              recentlyViewed.splice(position, 1);
              recentlyViewed.unshift(productHandle);
            }

            // Update cookie.
            cookie.write(recentlyViewed);
          }
        },

        hasProducts: cookie.read().length > 0,
      };
    })();

    const classes$r = {
      focus: 'is-focused',
    };

    const selectors$B = {
      inPageLink: '[data-skip-content]',
      linkesWithOnlyHash: 'a[href="#"]',
    };

    class Accessibility {
      constructor() {
        this.init();
      }

      init() {
        this.a11y = a11y;

        // DOM Elements
        this.html = document.documentElement;
        this.body = document.body;
        this.inPageLink = document.querySelector(selectors$B.inPageLink);
        this.linkesWithOnlyHash = document.querySelectorAll(selectors$B.linkesWithOnlyHash);

        // A11Y init methods
        this.a11y.focusHash();
        this.a11y.bindInPageLinks();

        // Events
        this.clickEvents();
        this.focusEvents();
      }

      /**
       * Clicked events accessibility
       *
       * @return  {Void}
       */

      clickEvents() {
        if (this.inPageLink) {
          this.inPageLink.addEventListener('click', (event) => {
            event.preventDefault();
          });
        }

        if (this.linkesWithOnlyHash) {
          this.linkesWithOnlyHash.forEach((item) => {
            item.addEventListener('click', (event) => {
              event.preventDefault();
            });
          });
        }
      }

      /**
       * Focus events
       *
       * @return  {Void}
       */

      focusEvents() {
        document.addEventListener('mousedown', () => {
          this.body.classList.remove(classes$r.focus);
        });

        document.addEventListener('keyup', (event) => {
          if (event.code !== 'Tab') {
            return;
          }

          this.body.classList.add(classes$r.focus);
        });
      }
    }

    window.a11y = new Accessibility();

    /**
     * Currency Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help with currency formatting
     *
     * Current contents
     * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
     *
     */

    const moneyFormat = '${{amount}}';

    /**
     * Format money values based on your shop currency settings
     * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
     * or 3.00 dollars
     * @param  {String} format - shop money_format setting
     * @return {String} value - formatted value
     */
    function formatMoney(cents, format) {
      if (typeof cents === 'string') {
        cents = cents.replace('.', '');
      }
      let value = '';
      const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      const formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
        if (isNaN(number) || number == null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        const parts = number.split('.');
        const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
        const centsAmount = parts[1] ? decimal + parts[1] : '';

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
          value = formatWithDelimiters(cents, 2);
          break;
        case 'amount_no_decimals':
          value = formatWithDelimiters(cents, 0);
          break;
        case 'amount_with_comma_separator':
          value = formatWithDelimiters(cents, 2, '.', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          value = formatWithDelimiters(cents, 0, '.', ',');
          break;
        case 'amount_with_apostrophe_separator':
          value = formatWithDelimiters(cents, 2, "'", '.');
          break;
        case 'amount_no_decimals_with_space_separator':
          value = formatWithDelimiters(cents, 0, ' ', '');
          break;
        case 'amount_with_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', ',');
          break;
        case 'amount_with_period_and_space_separator':
          value = formatWithDelimiters(cents, 2, ' ', '.');
          break;
      }

      return formatString.replace(placeholderRegex, value);
    }

    const throttle = (fn, wait) => {
      let prev, next;
      return function invokeFn(...args) {
        const now = Date.now();
        next = clearTimeout(next);
        if (!prev || now - prev >= wait) {
          // eslint-disable-next-line prefer-spread
          fn.apply(null, args);
          prev = now;
        } else {
          next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
        }
      };
    };

    function FetchError(object) {
      this.status = object.status || null;
      this.headers = object.headers || null;
      this.json = object.json || null;
      this.body = object.body || null;
    }
    FetchError.prototype = Error.prototype;

    const classes$q = {
      animated: 'is-animated',
      active: 'is-active',
      added: 'is-added',
      disabled: 'is-disabled',
      empty: 'is-empty',
      error: 'has-error',
      headerStuck: 'js__header__stuck',
      hidden: 'is-hidden',
      hiding: 'is-hiding',
      loading: 'is-loading',
      open: 'is-open',
      removed: 'is-removed',
      success: 'is-success',
      visible: 'is-visible',
      expanded: 'is-expanded',
      updated: 'is-updated',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
    };

    const selectors$A = {
      apiContent: '[data-api-content]',
      apiLineItems: '[data-api-line-items]',
      apiUpsellItems: '[data-api-upsell-items]',
      apiCartPrice: '[data-api-cart-price]',
      animation: '[data-animation]',
      additionalCheckoutButtons: '.additional-checkout-buttons',
      buttonSkipUpsellProduct: '[data-skip-upsell-product]',
      cartBarAdd: '[data-add-to-cart-bar]',
      cartCloseError: '[data-cart-error-close]',
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartEmpty: '[data-cart-empty]',
      cartErrors: '[data-cart-errors]',
      cartItemRemove: '[data-item-remove]',
      cartPage: '[data-cart-page]',
      cartForm: '[data-cart-form]',
      cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
      cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
      cartCheckoutButton: '[data-cart-checkout-button]',
      cartTotal: '[data-cart-total]',
      checkoutButtons: '[data-checkout-buttons]',
      errorMessage: '[data-error-message]',
      formCloseError: '[data-close-error]',
      formErrorsContainer: '[data-cart-errors-container]',
      formWrapper: '[data-form-wrapper]',
      freeShipping: '[data-free-shipping]',
      freeShippingGraph: '[data-progress-graph]',
      freeShippingProgress: '[data-progress-bar]',
      headerWrapper: '[data-header-wrapper]',
      item: '[data-item]',
      itemsHolder: '[data-items-holder]',
      leftToSpend: '[data-left-to-spend]',
      navDrawer: '[data-drawer]',
      outerSection: '[data-section-id]',
      priceHolder: '[data-cart-price-holder]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      qtyInput: 'input[name="updates[]"]',
      upsellProductsHolder: '[data-upsell-products]',
      upsellWidget: '[data-upsell-widget]',
      termsErrorMessage: '[data-terms-error-message]',
      collapsibleBody: '[data-collapsible-body]',
      recentlyViewedHolderId: 'recently-viewed-products-cart',
      noscript: 'noscript',
    };

    const attributes$n = {
      cartTotal: 'data-cart-total',
      disabled: 'disabled',
      freeShipping: 'data-free-shipping',
      freeShippingLimit: 'data-free-shipping-limit',
      item: 'data-item',
      itemIndex: 'data-item-index',
      itemTitle: 'data-item-title',
      open: 'open',
      quickAddHolder: 'data-quick-add-holder',
      quickAddVariant: 'data-quick-add-variant',
      scrollLocked: 'data-scroll-locked',
      upsellAutoOpen: 'data-upsell-auto-open',
      name: 'name',
    };

    class CartItems extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        // DOM Elements
        this.cartPage = document.querySelector(selectors$A.cartPage);
        this.cartForm = document.querySelector(selectors$A.cartForm);
        this.cartDrawer = document.querySelector(selectors$A.cartDrawer);
        this.cartEmpty = document.querySelector(selectors$A.cartEmpty);
        this.cartTermsCheckbox = document.querySelector(selectors$A.cartTermsCheckbox);
        this.cartCheckoutButtonWrapper = document.querySelector(selectors$A.cartCheckoutButtonWrapper);
        this.cartCheckoutButton = document.querySelector(selectors$A.cartCheckoutButton);
        this.checkoutButtons = document.querySelector(selectors$A.checkoutButtons);
        this.itemsHolder = document.querySelector(selectors$A.itemsHolder);
        this.priceHolder = document.querySelector(selectors$A.priceHolder);
        this.items = document.querySelectorAll(selectors$A.item);
        this.cartTotal = document.querySelector(selectors$A.cartTotal);
        this.freeShipping = document.querySelectorAll(selectors$A.freeShipping);
        this.cartErrorHolder = document.querySelector(selectors$A.cartErrors);
        this.cartCloseErrorMessage = document.querySelector(selectors$A.cartCloseError);
        this.headerWrapper = document.querySelector(selectors$A.headerWrapper);
        this.navDrawer = document.querySelector(selectors$A.navDrawer);
        this.upsellProductsHolder = document.querySelector(selectors$A.upsellProductsHolder);
        this.subtotal = window.theme.subtotal;

        // Define Cart object depending on if we have cart drawer or cart page
        this.cart = this.cartDrawer || this.cartPage;

        // Cart events
        this.animateItems = this.animateItems.bind(this);
        this.addToCart = this.addToCart.bind(this);
        this.cartAddEvent = this.cartAddEvent.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.onCartDrawerClose = this.onCartDrawerClose.bind(this);

        // Set global event listeners for "Add to cart" and Announcement bar wheel progress
        document.addEventListener('theme:cart:add', this.cartAddEvent);
        document.addEventListener('theme:announcement:init', this.updateProgress);

        if (theme.settings.cartType == 'drawer') {
          document.addEventListener('theme:cart-drawer:open', this.animateItems);
          document.addEventListener('theme:cart-drawer:close', this.onCartDrawerClose);
        }

        // Upsell products
        this.skipUpsellProductsArray = [];
        this.skipUpsellProductEvent();
        this.checkSkippedUpsellProductsFromStorage();
        this.toggleCartUpsellWidgetVisibility();

        // Free Shipping values
        this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI
        this.freeShippingLimit = this.freeShipping.length ? Number(this.freeShipping[0].getAttribute(attributes$n.freeShippingLimit)) * 100 * window.Shopify.currency.rate : 0;

        this.freeShippingMessageHandle(this.subtotal);
        this.updateProgress();

        this.build = this.build.bind(this);
        this.updateCart = this.updateCart.bind(this);
        this.productAddCallback = this.productAddCallback.bind(this);
        this.formSubmitHandler = throttle(this.formSubmitHandler.bind(this), 50);

        if (this.cartPage) {
          this.animateItems();
        }

        if (this.cart) {
          // Recently viewed products
          this.recentlyViewedProducts();

          // Checking
          this.hasItemsInCart = this.hasItemsInCart.bind(this);
          this.cartCount = this.getCartItemCount();
        }

        // Set classes
        this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

        // Flags
        this.totalItems = this.items.length;

        this.cartUpdateFailed = false;

        // Cart Events
        this.cartEvents();
        this.cartRemoveEvents();
        this.cartUpdateEvents();

        document.addEventListener('theme:product:add', this.productAddCallback);
        document.addEventListener('theme:product:add-error', this.productAddCallback);
        document.addEventListener('theme:cart:refresh', this.getCart.bind(this));
        document.addEventListener('theme:cart:change', this.refreshFreeShippingComponent.bind(this));

        document.dispatchEvent(new CustomEvent('theme:cart:load', {bubbles: true}));
      }

      disconnectedCallback() {
        document.removeEventListener('theme:cart:add', this.cartAddEvent);
        document.removeEventListener('theme:cart:refresh', this.cartAddEvent);
        document.removeEventListener('theme:announcement:init', this.updateProgress);
        document.removeEventListener('theme:product:add', this.productAddCallback);
        document.removeEventListener('theme:product:add-error', this.productAddCallback);

        document.dispatchEvent(new CustomEvent('theme:cart:unload', {bubbles: true}));

        if (document.documentElement.hasAttribute(attributes$n.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      onCartDrawerClose() {
        this.resetAnimatedItems();

        if (this.cartDrawer?.classList.contains(classes$q.open)) {
          this.cart.classList.remove(classes$q.updated);
        }

        this.cartEmpty.classList.remove(classes$q.updated);
        this.cartErrorHolder.classList.remove(classes$q.expanded);
        this.cart.querySelectorAll(selectors$A.animation).forEach((item) => {
          const removeHidingClass = () => {
            item.classList.remove(classes$q.hiding);
            item.removeEventListener('animationend', removeHidingClass);
          };

          item.classList.add(classes$q.hiding);
          item.addEventListener('animationend', removeHidingClass);
        });
      }

      /**
       * Cart update event hook
       *
       * @return  {Void}
       */

      cartUpdateEvents() {
        this.items = document.querySelectorAll(selectors$A.item);

        this.items.forEach((item) => {
          item.addEventListener('theme:cart:update', (event) => {
            this.updateCart(
              {
                id: event.detail.id,
                quantity: event.detail.quantity,
              },
              item
            );
          });
        });
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartRemoveEvents() {
        const cartItemRemove = document.querySelectorAll(selectors$A.cartItemRemove);

        cartItemRemove.forEach((button) => {
          const item = button.closest(selectors$A.item);
          button.addEventListener('click', (event) => {
            event.preventDefault();

            if (button.classList.contains(classes$q.disabled)) return;

            this.updateCart(
              {
                id: button.dataset.id,
                quantity: 0,
              },
              item
            );
          });
        });

        if (this.cartCloseErrorMessage) {
          this.cartCloseErrorMessage.addEventListener('click', (event) => {
            event.preventDefault();

            this.cartErrorHolder.classList.remove(classes$q.expanded);
          });
        }
      }

      /**
       * Cart event add product to cart
       *
       * @return  {Void}
       */

      cartAddEvent(event) {
        let formData = '';
        let button = event.detail.button;

        if (button.hasAttribute('disabled')) return;
        const form = button.closest('form');
        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        formData = new FormData(form);

        const hasInputsInNoScript = [...form.elements].some((el) => el.closest(selectors$A.noscript));
        if (hasInputsInNoScript) {
          formData = this.handleFormDataDuplicates([...form.elements], formData);
        }

        if (form !== null && form.querySelector('[type="file"]')) {
          return;
        }
        if (theme.settings.cartType === 'drawer' && this.cartDrawer) {
          event.preventDefault();
        }
        this.addToCart(formData, button);
      }

      /**
       * Modify the `formData` object in case there are key/value pairs with an overlapping `key`
       *  - the presence of form input fields inside a `noscript` tag leads to a duplicate `key`, which overwrites the existing `value` when the `FormData` is constructed
       *  - such key/value pairs discrepancies occur in the Theme editor, when any setting is updated, and right before one presses the "Save" button
       *
       * @param   {Array}  A list of all `HTMLFormElement.elements` DOM nodes
       * @param   {Object}  `FormData` object, created with the `FormData()` constructor
       *
       * @return  {Object} Updated `FormData` object that does not contain any duplicate keys
       */
      handleFormDataDuplicates(elements, formData) {
        if (!elements.length || typeof formData !== 'object') return formData;

        elements.forEach((element) => {
          if (element.closest(selectors$A.noscript)) {
            const key = element.getAttribute(attributes$n.name);
            const value = element.value;

            if (key) {
              const values = formData.getAll(key);
              if (values.length > 1) values.splice(values.indexOf(value), 1);

              formData.delete(key);
              formData.set(key, values[0]);
            }
          }
        });

        return formData;
      }

      /**
       * Cart events
       *
       * @return  {Void}
       */

      cartEvents() {
        if (this.cartTermsCheckbox) {
          this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
          this.cartForm.removeEventListener('submit', this.formSubmitHandler);

          this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
          this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
          this.cartForm.addEventListener('submit', this.formSubmitHandler);
        }
      }

      formSubmitHandler() {
        const termsAccepted = document.querySelector(selectors$A.cartTermsCheckbox).checked;
        const termsError = document.querySelector(selectors$A.termsErrorMessage);

        // Disable form submit if terms and conditions are not accepted
        if (!termsAccepted) {
          if (document.querySelector(selectors$A.termsErrorMessage).length > 0) {
            return;
          }

          termsError.innerText = theme.strings.cartAcceptanceError;
          this.cartCheckoutButton.setAttribute(attributes$n.disabled, true);
          termsError.classList.add(classes$q.expanded);
        } else {
          termsError.classList.remove(classes$q.expanded);
          this.cartCheckoutButton.removeAttribute(attributes$n.disabled);
        }
      }

      /**
       * Cart event remove out of stock error
       *
       * @return  {Void}
       */

      formErrorsEvents(errorContainer) {
        const buttonErrorClose = errorContainer.querySelector(selectors$A.formCloseError);
        buttonErrorClose?.addEventListener('click', (e) => {
          e.preventDefault();

          if (errorContainer) {
            errorContainer.classList.remove(classes$q.visible);
          }
        });
      }

      /**
       * Get response from the cart
       *
       * @return  {Void}
       */

      getCart() {
        fetch(theme.routes.cart_url + '?section_id=api-cart-items')
          .then(this.cartErrorsHandler)
          .then((response) => response.text())
          .then((response) => {
            const element = document.createElement('div');
            element.innerHTML = response;

            const cleanResponse = element.querySelector(selectors$A.apiContent);
            this.build(cleanResponse);
          })
          .catch((error) => console.log(error));
      }

      /**
       * Add item(s) to the cart and show the added item(s)
       *
       * @param   {String}  formData
       * @param   {DOM Element}  button
       *
       * @return  {Void}
       */

      addToCart(formData, button) {
        if (this.cart) {
          this.cart.classList.add(classes$q.loading);
        }

        const quickAddHolder = button?.closest(selectors$A.quickAddHolder);

        if (button) {
          button.classList.add(classes$q.loading);
          button.disabled = true;
        }

        if (quickAddHolder) {
          quickAddHolder.classList.add(classes$q.visible);
        }

        fetch(theme.routes.cart_add_url, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/javascript',
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.addToCartError(response, button);

              if (button) {
                button.classList.remove(classes$q.loading);
                button.disabled = false;
              }

              return;
            }

            if (this.cart) {
              if (button) {
                button.classList.remove(classes$q.loading);
                button.classList.add(classes$q.added);

                button.dispatchEvent(
                  new CustomEvent('theme:product:add', {
                    detail: {
                      response: response,
                      button: button,
                    },
                    bubbles: true,
                  })
                );
              }
              if (theme.settings.cartType === 'page') {
                window.location = theme.routes.cart_url;
              }
              this.getCart();
            } else {
              // Redirect to cart page if "Add to cart" is successful
              window.location = theme.routes.cart_url;
            }
          })
          .catch((error) => {
            this.addToCartError(error, button);
            this.enableCartButtons();
          });
      }

      /**
       * Update cart
       *
       * @param   {Object}  updateData
       *
       * @return  {Void}
       */

      updateCart(updateData = {}, currentItem = null) {
        this.cart.classList.add(classes$q.loading);

        let updatedQuantity = updateData.quantity;
        if (currentItem !== null) {
          if (updatedQuantity) {
            currentItem.classList.add(classes$q.loading);
          } else {
            currentItem.classList.add(classes$q.removed);
          }
        }
        this.disableCartButtons();

        const newItem = this.cart.querySelector(`[${attributes$n.item}="${updateData.id}"]`) || currentItem;
        const lineIndex = newItem?.hasAttribute(attributes$n.itemIndex) ? parseInt(newItem.getAttribute(attributes$n.itemIndex)) : 0;
        const itemTitle = newItem?.hasAttribute(attributes$n.itemTitle) ? newItem.getAttribute(attributes$n.itemTitle) : null;

        if (lineIndex === 0) return;

        const data = {
          line: lineIndex,
          quantity: updatedQuantity,
        };

        fetch(theme.routes.cart_change_url, {
          method: 'post',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(data),
        })
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            const parsedState = JSON.parse(state);

            if (parsedState.errors) {
              this.cartUpdateFailed = true;
              this.updateErrorText(itemTitle);
              this.toggleErrorMessage();
              this.resetLineItem(currentItem);
              this.enableCartButtons();

              return;
            }

            this.getCart();
          })
          .catch((error) => {
            console.log(error);
            this.enableCartButtons();
          });
      }

      /**
       * Reset line item initial state
       *
       * @return  {Void}
       */
      resetLineItem(item) {
        const qtyInput = item.querySelector(selectors$A.qtyInput);
        const qty = qtyInput.getAttribute('value');
        qtyInput.value = qty;
        item.classList.remove(classes$q.loading);
      }

      /**
       * Disable cart buttons and inputs
       *
       * @return  {Void}
       */
      disableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$A.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.add(classes$q.disabled);
            item.blur();
            item.disabled = true;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.setAttribute(attributes$n.disabled, true);
          });
        }
      }

      /**
       * Enable cart buttons and inputs
       *
       * @return  {Void}
       */
      enableCartButtons() {
        const inputs = this.cart.querySelectorAll('input');
        const buttons = this.cart.querySelectorAll(`button, ${selectors$A.cartItemRemove}`);

        if (inputs.length) {
          inputs.forEach((item) => {
            item.classList.remove(classes$q.disabled);
            item.disabled = false;
          });
        }

        if (buttons.length) {
          buttons.forEach((item) => {
            item.removeAttribute(attributes$n.disabled);
          });
        }

        this.cart.classList.remove(classes$q.loading);
      }

      /**
       * Update error text
       *
       * @param   {String}  itemTitle
       *
       * @return  {Void}
       */

      updateErrorText(itemTitle) {
        this.cartErrorHolder.querySelector(selectors$A.errorMessage).innerText = itemTitle;
      }

      /**
       * Toggle error message
       *
       * @return  {Void}
       */

      toggleErrorMessage() {
        if (!this.cartErrorHolder) return;

        this.cartErrorHolder.classList.toggle(classes$q.expanded, this.cartUpdateFailed);

        // Reset cart error events flag
        this.cartUpdateFailed = false;
      }

      /**
       * Handle errors
       *
       * @param   {Object}  response
       *
       * @return  {Object}
       */

      cartErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      /**
       * Add to cart error handle
       *
       * @param   {Object}  data
       * @param   {DOM Element/Null} button
       *
       * @return  {Void}
       */

      addToCartError(data, button) {
        if (button !== null) {
          const outerContainer = button.closest(selectors$A.outerSection) || button.closest(selectors$A.quickAddHolder) || button.closest(selectors$A.quickAddModal);
          let errorContainer = outerContainer?.querySelector(selectors$A.formErrorsContainer);
          const buttonUpsellHolder = button.closest(selectors$A.quickAddHolder);

          if (buttonUpsellHolder && buttonUpsellHolder.querySelector(selectors$A.formErrorsContainer)) {
            errorContainer = buttonUpsellHolder.querySelector(selectors$A.formErrorsContainer);
          }

          if (errorContainer) {
            let errorMessage = `${data.message}: ${data.description}`;

            if (data.message == data.description) {
              errorMessage = data.message;
            }

            errorContainer.innerHTML = `<div class="errors">${errorMessage}<button type="button" class="errors__close" data-close-error><svg aria-hidden="true" focusable="false" role="presentation" width="24px" height="24px" stroke-width="1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="icon icon-cancel"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`;
            errorContainer.classList.add(classes$q.visible);
            this.formErrorsEvents(errorContainer);
          }

          button.dispatchEvent(
            new CustomEvent('theme:product:add-error', {
              detail: {
                response: data,
                button: button,
              },
              bubbles: true,
            })
          );
        }

        const quickAddHolder = button?.closest(selectors$A.quickAddHolder);

        if (quickAddHolder) {
          quickAddHolder.dispatchEvent(
            new CustomEvent('theme:cart:error', {
              bubbles: true,
              detail: {
                message: data.message,
                description: data.description,
                holder: quickAddHolder,
              },
            })
          );
        }

        this.cart?.classList.remove(classes$q.loading);
      }

      /**
       * Add product to cart events
       *
       * @return  {Void}
       */
      productAddCallback(event) {
        let buttons = [];
        let quickAddHolder = null;
        const hasError = event.type == 'theme:product:add-error';
        const buttonATC = event.detail.button;
        const cartBarButtonATC = document.querySelector(selectors$A.cartBarAdd);

        buttons.push(buttonATC);
        quickAddHolder = buttonATC.closest(selectors$A.quickAddHolder);

        if (cartBarButtonATC) {
          buttons.push(cartBarButtonATC);
        }

        buttons.forEach((button) => {
          button.classList.remove(classes$q.loading);
          if (!hasError) {
            button.classList.add(classes$q.added);
          }
        });

        setTimeout(() => {
          buttons.forEach((button) => {
            button.classList.remove(classes$q.added);
            const isVariantUnavailable =
              button.closest(selectors$A.formWrapper)?.classList.contains(classes$q.variantSoldOut) || button.closest(selectors$A.formWrapper)?.classList.contains(classes$q.variantUnavailable);

            if (!isVariantUnavailable) {
              button.disabled = false;
            }
          });

          quickAddHolder?.classList.remove(classes$q.visible);
        }, 1000);
      }

      /**
       * Toggle classes on different containers and messages
       *
       * @return  {Void}
       */

      toggleClassesOnContainers() {
        const hasItemsInCart = this.hasItemsInCart();

        this.cart.classList.toggle(classes$q.empty, !hasItemsInCart);

        if (!hasItemsInCart && this.cartDrawer) {
          setTimeout(() => {
            trapFocus(this.cartDrawer, {
              elementToFocus: this.cartDrawer.querySelector(selectors$A.cartDrawerClose),
            });
          }, 100);
        }
      }

      /**
       * Build cart depends on results
       *
       * @param   {Object}  data
       *
       * @return  {Void}
       */

      build(data) {
        const cartItemsData = data.querySelector(selectors$A.apiLineItems);
        const upsellItemsData = data.querySelector(selectors$A.apiUpsellItems);
        const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null);
        const priceData = data.querySelector(selectors$A.apiCartPrice);
        const cartTotal = data.querySelector(selectors$A.cartTotal);

        if (this.priceHolder && priceData) {
          this.priceHolder.innerHTML = priceData.innerHTML;
        }

        if (cartEmptyData) {
          this.itemsHolder.innerHTML = data.innerHTML;

          if (this.upsellProductsHolder) {
            this.upsellProductsHolder.innerHTML = '';
          }
        } else {
          this.itemsHolder.innerHTML = cartItemsData.innerHTML;

          if (this.upsellProductsHolder) {
            this.upsellProductsHolder.innerHTML = upsellItemsData.innerHTML;
          }

          this.skipUpsellProductEvent();
          this.checkSkippedUpsellProductsFromStorage();
          this.toggleCartUpsellWidgetVisibility();
        }

        this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors$A.item).length ? cartItemsData.querySelectorAll(selectors$A.item).length : 0;
        this.subtotal = cartTotal && cartTotal.hasAttribute(attributes$n.cartTotal) ? parseInt(cartTotal.getAttribute(attributes$n.cartTotal)) : 0;
        this.cartCount = this.getCartItemCount();

        document.dispatchEvent(
          new CustomEvent('theme:cart:change', {
            bubbles: true,
            detail: {
              cartCount: this.cartCount,
            },
          })
        );

        // Update cart total price
        this.cartTotal.innerHTML = this.subtotal === 0 ? window.theme.strings.free : formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);

        if (this.totalItems !== this.newTotalItems) {
          this.totalItems = this.newTotalItems;

          this.toggleClassesOnContainers();
        }

        // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
        if (this.cartDrawer?.classList.contains(classes$q.open)) {
          this.cart.classList.add(classes$q.updated);
        }

        // Remove cart loading class
        this.cart.classList.remove(classes$q.loading);

        // Prepare empty cart buttons for animation
        if (!this.hasItemsInCart()) {
          this.cartEmpty.querySelectorAll(selectors$A.animation).forEach((item) => {
            item.classList.remove(classes$q.animated);
          });
        }

        this.freeShippingMessageHandle(this.subtotal);
        this.cartRemoveEvents();
        this.cartUpdateEvents();
        this.toggleErrorMessage();
        this.enableCartButtons();
        this.updateProgress();
        this.animateItems();

        document.dispatchEvent(
          new CustomEvent('theme:product:added', {
            bubbles: true,
          })
        );
      }

      /**
       * Get cart item count
       *
       * @return  {Void}
       */

      getCartItemCount() {
        return Array.from(this.cart.querySelectorAll(selectors$A.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
      }

      /**
       * Check for items in the cart
       *
       * @return  {Void}
       */

      hasItemsInCart() {
        return this.totalItems > 0;
      }

      /**
       * Show/hide free shipping message
       *
       * @param   {Number}  total
       *
       * @return  {Void}
       */

      freeShippingMessageHandle(total) {
        if (!this.freeShipping.length) return;

        this.freeShipping.forEach((message) => {
          const hasQualifiedShippingMessage = message.hasAttribute(attributes$n.freeShipping) && message.getAttribute(attributes$n.freeShipping) === 'true' && total >= 0;
          message.classList.toggle(classes$q.success, hasQualifiedShippingMessage && total >= this.freeShippingLimit);
        });
      }

      /**
       * Update progress when update cart
       *
       * @return  {Void}
       */

      updateProgress() {
        this.freeShipping = document.querySelectorAll(selectors$A.freeShipping);

        if (!this.freeShipping.length) return;

        const percentValue = isNaN(this.subtotal / this.freeShippingLimit) ? 100 : this.subtotal / this.freeShippingLimit;
        
        const percent = Math.min(percentValue * 100, 100);

        const dashoffset = this.circumference - ((percent / 100) * this.circumference) / 2;
        const leftToSpend = formatMoney(this.freeShippingLimit - this.subtotal, theme.moneyFormat);

        this.freeShipping.forEach((item) => {
          const progressBar = item.querySelector(selectors$A.freeShippingProgress);
          const progressGraph = item.querySelector(selectors$A.freeShippingGraph);
          const leftToSpendMessage = item.querySelector(selectors$A.leftToSpend);

          if (leftToSpendMessage) {
            leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '');
          }

          // Set progress bar value
          if (progressBar) {
            progressBar.value = percent;
          }

          // Set circle progress
          if (progressGraph) {
            progressGraph.style.setProperty('--stroke-dashoffset', `${dashoffset}`);
          }
        });
      }

      /**
       * Skip upsell product
       */
      skipUpsellProductEvent() {
        if (this.upsellProductsHolder === null) {
          return;
        }
        const skipButtons = this.upsellProductsHolder.querySelectorAll(selectors$A.buttonSkipUpsellProduct);

        if (skipButtons.length) {
          skipButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
              event.preventDefault();
              const productID = button.closest(selectors$A.quickAddHolder).getAttribute(attributes$n.quickAddHolder);

              if (!this.skipUpsellProductsArray.includes(productID)) {
                this.skipUpsellProductsArray.push(productID);
              }

              // Add skipped upsell product to session storage
              window.sessionStorage.setItem('skip_upsell_products', this.skipUpsellProductsArray);

              // Remove upsell product from cart
              this.removeUpsellProduct(productID);
              this.toggleCartUpsellWidgetVisibility();
            });
          });
        }
      }

      /**
       * Check for skipped upsell product added to session storage
       */
      checkSkippedUpsellProductsFromStorage() {
        const skippedUpsellItemsFromStorage = window.sessionStorage.getItem('skip_upsell_products');
        if (!skippedUpsellItemsFromStorage) return;

        const skippedUpsellItemsFromStorageArray = skippedUpsellItemsFromStorage.split(',');

        skippedUpsellItemsFromStorageArray.forEach((productID) => {
          if (!this.skipUpsellProductsArray.includes(productID)) {
            this.skipUpsellProductsArray.push(productID);
          }

          this.removeUpsellProduct(productID);
        });
      }

      removeUpsellProduct(productID) {
        if (!this.upsellProductsHolder) return;

        // Remove skipped upsell product from Cart
        const upsellProduct = this.upsellProductsHolder.querySelector(`[${attributes$n.quickAddHolder}="${productID}"]`);

        if (upsellProduct) {
          upsellProduct.parentNode.remove();
        }
      }

      /**
       * Show or hide cart upsell products widget visibility
       */
      toggleCartUpsellWidgetVisibility() {
        if (!this.upsellProductsHolder) return;

        // Hide upsell container if no items
        const upsellItems = this.upsellProductsHolder.querySelectorAll(selectors$A.quickAddHolder);
        const upsellWidget = this.upsellProductsHolder.closest(selectors$A.upsellWidget);

        if (!upsellWidget) return;

        upsellWidget.classList.toggle(classes$q.hidden, !upsellItems.length);

        if (upsellItems.length && !upsellWidget.hasAttribute(attributes$n.open) && upsellWidget.hasAttribute(attributes$n.upsellAutoOpen)) {
          upsellWidget.setAttribute(attributes$n.open, true);
          const upsellWidgetBody = upsellWidget.querySelector(selectors$A.collapsibleBody);

          if (upsellWidgetBody) {
            upsellWidgetBody.style.height = 'auto';
          }
        }
      }

      /**
       * Remove initially added AOS classes to allow animation on cart drawer open
       *
       * @return  {Void}
       */
      resetAnimatedItems() {
        this.cart.querySelectorAll(selectors$A.animation).forEach((item) => {
          item.classList.remove(classes$q.animated);
          item.classList.remove(classes$q.hiding);
        });
      }

      /**
       * Cart elements opening animation
       *
       * @return  {Void}
       */
      animateItems(e) {
        requestAnimationFrame(() => {
          let cart = this.cart;

          if (e && e.detail && e.detail.target) {
            cart = e.detail.target;
          }

          cart?.querySelectorAll(selectors$A.animation).forEach((item) => {
            item.classList.add(classes$q.animated);
          });
        });
      }

      recentlyViewedProducts() {
        const recentlyViewedHolder = this.cart.querySelector(`#${selectors$A.recentlyViewedHolderId}`);
        if (recentlyViewedHolder) {
          Shopify.Products.showRecentlyViewed({
            howManyToShow: 3,
            wrapperId: selectors$A.recentlyViewedHolderId,
            section: this,
            target: 'api-upsell-product',
          });
        }
      }
    }

    if (!customElements.get('cart-items')) {
      customElements.define('cart-items', CartItems);
    }

    const attributes$m = {
      count: 'data-cart-count',
      limit: 'data-limit',
    };

    class CartCount extends HTMLElement {
      constructor() {
        super();

        this.cartCount = null;
        this.limit = this.getAttribute(attributes$m.limit);
        this.onCartChangeCallback = this.onCartChange.bind(this);
      }

      connectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      disconnectedCallback() {
        document.addEventListener('theme:cart:change', this.onCartChangeCallback);
      }

      onCartChange(event) {
        this.cartCount = event.detail.cartCount;
        this.update();
      }

      update() {
        if (this.cartCount !== null) {
          this.setAttribute(attributes$m.count, this.cartCount);
          let countValue = this.cartCount;

          if (this.limit && this.cartCount >= this.limit) {
            countValue = '9+';
          }

          this.innerText = countValue;
        }
      }
    }

    if (!customElements.get('cart-count')) {
      customElements.define('cart-count', CartCount);
    }

    const classes$p = {
      open: 'is-open',
      closing: 'is-closing',
      duplicate: 'drawer--duplicate',
      drawerEditorError: 'drawer-editor-error',
    };

    const selectors$z = {
      cartDrawer: 'cart-drawer',
      cartDrawerClose: '[data-cart-drawer-close]',
      cartDrawerSection: '[data-section-type="cart-drawer"]',
      cartDrawerInner: '[data-cart-drawer-inner]',
      shopifySection: '.shopify-section',
    };

    const attributes$l = {
      drawerUnderlay: 'data-drawer-underlay',
    };

    class CartDrawer extends HTMLElement {
      constructor() {
        super();

        this.cartDrawerIsOpen = false;

        this.cartDrawerClose = this.querySelector(selectors$z.cartDrawerClose);
        this.cartDrawerInner = this.querySelector(selectors$z.cartDrawerInner);
        this.openCartDrawer = this.openCartDrawer.bind(this);
        this.closeCartDrawer = this.closeCartDrawer.bind(this);
        this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
        this.openCartDrawerOnProductAdded = this.openCartDrawerOnProductAdded.bind(this);
        this.openCartDrawerOnSelect = this.openCartDrawerOnSelect.bind(this);
        this.closeCartDrawerOnDeselect = this.closeCartDrawerOnDeselect.bind(this);
        this.cartDrawerSection = this.closest(selectors$z.shopifySection);

        this.closeCartEvents();
      }

      connectedCallback() {
        const drawerSection = this.closest(selectors$z.shopifySection);

        /* Prevent duplicated cart drawers */
        if (window.theme.hasCartDrawer) {
          if (!window.Shopify.designMode) {
            drawerSection.remove();
            return;
          } else {
            const errorMessage = document.createElement('div');
            errorMessage.classList.add(classes$p.drawerEditorError);
            errorMessage.innerText = 'Cart drawer section already exists.';

            if (!this.querySelector(`.${classes$p.drawerEditorError}`)) {
              this.querySelector(selectors$z.cartDrawerInner).append(errorMessage);
            }

            this.classList.add(classes$p.duplicate);
          }
        }

        window.theme.hasCartDrawer = true;

        this.addEventListener('theme:cart-drawer:show', this.openCartDrawer);
        document.addEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.addEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.addEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.addEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.addEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:product:added', this.openCartDrawerOnProductAdded);
        document.removeEventListener('theme:cart:toggle', this.toggleCartDrawer);
        document.removeEventListener('theme:quick-add:open', this.closeCartDrawer);
        document.removeEventListener('shopify:block:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:select', this.openCartDrawerOnSelect);
        document.removeEventListener('shopify:section:deselect', this.closeCartDrawerOnDeselect);

        if (document.querySelectorAll(selectors$z.cartDrawer).length <= 1) {
          window.theme.hasCartDrawer = false;
        }

        appendCartItems();
      }

      /**
       * Open cart drawer when product is added to cart
       *
       * @return  {Void}
       */
      openCartDrawerOnProductAdded() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        }
      }

      /**
       * Open cart drawer on block or section select
       *
       * @return  {Void}
       */
      openCartDrawerOnSelect(e) {
        const cartDrawerSection = e.target.querySelector(selectors$z.shopifySection) || e.target.closest(selectors$z.shopifySection) || e.target;

        if (cartDrawerSection === this.cartDrawerSection) {
          this.openCartDrawer(true);
        }
      }

      /**
       * Close cart drawer on section deselect
       *
       * @return  {Void}
       */
      closeCartDrawerOnDeselect() {
        if (this.cartDrawerIsOpen) {
          this.closeCartDrawer();
        }
      }

      /**
       * Open cart drawer and add class on body
       *
       * @return  {Void}
       */

      openCartDrawer(forceOpen = false) {
        if (!forceOpen && this.classList.contains(classes$p.duplicate)) return;

        this.cartDrawerIsOpen = true;
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
        document.body.addEventListener('click', this.onBodyClickEvent);

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:open', {
            detail: {
              target: this,
            },
            bubbles: true,
          })
        );
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

        this.classList.add(classes$p.open);

        // Observe Additional Checkout Buttons
        this.observeAdditionalCheckoutButtons();

        waitForAnimationEnd(this.cartDrawerInner).then(() => {
          trapFocus(this, {
            elementToFocus: this.querySelector(selectors$z.cartDrawerClose),
          });
        });
      }

      /**
       * Close cart drawer and remove class on body
       *
       * @return  {Void}
       */

      closeCartDrawer() {
        if (!this.classList.contains(classes$p.open)) return;

        this.classList.add(classes$p.closing);
        this.classList.remove(classes$p.open);

        this.cartDrawerIsOpen = false;

        document.dispatchEvent(
          new CustomEvent('theme:cart-drawer:close', {
            bubbles: true,
          })
        );

        removeTrapFocus();
        autoFocusLastElement();

        document.body.removeEventListener('click', this.onBodyClickEvent);
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

        waitForAnimationEnd(this.cartDrawerInner).then(() => {
          this.classList.remove(classes$p.closing);
        });
      }

      /**
       * Toggle cart drawer
       *
       * @return  {Void}
       */

      toggleCartDrawer() {
        if (!this.cartDrawerIsOpen) {
          this.openCartDrawer();
        } else {
          this.closeCartDrawer();
        }
      }

      /**
       * Event click to element to close cart drawer
       *
       * @return  {Void}
       */

      closeCartEvents() {
        this.cartDrawerClose.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeCartDrawer();
        });

        this.addEventListener('keyup', (e) => {
          if (e.code === 'Escape') {
            this.closeCartDrawer();
          }
        });
      }

      onBodyClick(e) {
        if (e.target.hasAttribute(attributes$l.drawerUnderlay)) this.closeCartDrawer();
      }

      observeAdditionalCheckoutButtons() {
        // identify an element to observe
        const additionalCheckoutButtons = this.querySelector(selectors$z.additionalCheckoutButtons);
        if (additionalCheckoutButtons) {
          // create a new instance of `MutationObserver` named `observer`,
          // passing it a callback function
          const observer = new MutationObserver(() => {
            trapFocus(this, {
              elementToFocus: this.querySelector(selectors$z.cartDrawerClose),
            });
            observer.disconnect();
          });

          // call `observe()` on that MutationObserver instance,
          // passing it the element to observe, and the options object
          observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
        }
      }
    }

    if (!customElements.get('cart-drawer')) {
      customElements.define('cart-drawer', CartDrawer);
    }

    const selectors$y = {
      collapsible: '[data-collapsible]',
      trigger: '[data-collapsible-trigger]',
      body: '[data-collapsible-body]',
      content: '[data-collapsible-content]',
    };

    const attributes$k = {
      desktop: 'desktop',
      disabled: 'disabled',
      mobile: 'mobile',
      open: 'open',
      single: 'single',
    };

    class CollapsibleElements extends HTMLElement {
      constructor() {
        super();

        this.collapsibles = this.querySelectorAll(selectors$y.collapsible);
        this.single = this.hasAttribute(attributes$k.single);
        this.toggle = this.toggle.bind(this);
      }

      connectedCallback() {
        this.toggle();
        document.addEventListener('theme:resize:width', this.toggle);

        this.collapsibles.forEach((collapsible) => {
          const trigger = collapsible.querySelector(selectors$y.trigger);
          const body = collapsible.querySelector(selectors$y.body);

          trigger?.addEventListener('click', (event) => this.onCollapsibleClick(event));

          body?.addEventListener('transitionend', (event) => {
            if (event.target !== body) return;

            if (collapsible.getAttribute(attributes$k.open) == 'true') {
              this.setBodyHeight(body, 'auto');
            }

            if (collapsible.getAttribute(attributes$k.open) == 'false') {
              collapsible.removeAttribute(attributes$k.open);
              this.setBodyHeight(body, '');
            }
          });
        });
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.toggle);
      }

      toggle() {
        const isDesktopView = isDesktop();

        this.collapsibles.forEach((collapsible) => {
          if (!collapsible.hasAttribute(attributes$k.desktop) && !collapsible.hasAttribute(attributes$k.mobile)) return;

          const enableDesktop = collapsible.hasAttribute(attributes$k.desktop) ? collapsible.getAttribute(attributes$k.desktop) : 'true';
          const enableMobile = collapsible.hasAttribute(attributes$k.mobile) ? collapsible.getAttribute(attributes$k.mobile) : 'true';
          const isEligible = (isDesktopView && enableDesktop == 'true') || (!isDesktopView && enableMobile == 'true');
          const body = collapsible.querySelector(selectors$y.body);

          if (isEligible) {
            collapsible.removeAttribute(attributes$k.disabled);
            collapsible.querySelector(selectors$y.trigger).removeAttribute('tabindex');
            collapsible.removeAttribute(attributes$k.open);

            this.setBodyHeight(body, '');
          } else {
            collapsible.setAttribute(attributes$k.disabled, '');
            collapsible.setAttribute('open', true);
            collapsible.querySelector(selectors$y.trigger).setAttribute('tabindex', -1);
          }
        });
      }

      open(collapsible) {
        if (collapsible.getAttribute('open') == 'true') return;

        const body = collapsible.querySelector(selectors$y.body);
        const content = collapsible.querySelector(selectors$y.content);

        collapsible.setAttribute('open', true);

        this.setBodyHeight(body, content.offsetHeight);
      }

      close(collapsible) {
        if (!collapsible.hasAttribute('open')) return;

        const body = collapsible.querySelector(selectors$y.body);
        const content = collapsible.querySelector(selectors$y.content);

        this.setBodyHeight(body, content.offsetHeight);

        collapsible.setAttribute('open', false);

        setTimeout(() => {
          requestAnimationFrame(() => {
            this.setBodyHeight(body, 0);
          });
        });
      }

      setBodyHeight(body, contentHeight) {
        body.style.height = contentHeight !== 'auto' && contentHeight !== '' ? `${contentHeight}px` : contentHeight;
      }

      onCollapsibleClick(event) {
        event.preventDefault();

        const trigger = event.target;
        const collapsible = trigger.closest(selectors$y.collapsible);

        // When we want only one item expanded at the same time
        if (this.single) {
          this.collapsibles.forEach((otherCollapsible) => {
            // if otherCollapsible has attribute open and it's not the one we clicked on, remove the open attribute
            if (otherCollapsible.hasAttribute(attributes$k.open) && otherCollapsible != collapsible) {
              requestAnimationFrame(() => {
                this.close(otherCollapsible);
              });
            }
          });
        }

        if (collapsible.hasAttribute(attributes$k.open)) {
          this.close(collapsible);
        } else {
          this.open(collapsible);
        }

        collapsible.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'accordion',
            },
          })
        );
        collapsible.dispatchEvent(
          new CustomEvent('theme:collapsible:toggle', {
            bubbles: true,
          })
        );
      }
    }

    if (!customElements.get('collapsible-elements')) {
      customElements.define('collapsible-elements', CollapsibleElements);
    }

    const selectors$x = {
      details: 'details',
      popdown: '[data-popdown]',
      popdownClose: '[data-popdown-close]',
      input: 'input:not([type="hidden"])',
      mobileMenu: 'mobile-menu',
    };

    const attributes$j = {
      popdownUnderlay: 'data-popdown-underlay',
      scrollLocked: 'data-scroll-locked',
    };

    const classes$o = {
      open: 'is-open',
    };
    class SearchPopdown extends HTMLElement {
      constructor() {
        super();
        this.popdown = this.querySelector(selectors$x.popdown);
        this.popdownContainer = this.querySelector(selectors$x.details);
        this.popdownClose = this.querySelector(selectors$x.popdownClose);
        this.popdownTransitionCallback = this.popdownTransitionCallback.bind(this);
        this.detailsToggleCallback = this.detailsToggleCallback.bind(this);
        this.mobileMenu = this.closest(selectors$x.mobileMenu);
        this.a11y = a11y;
      }

      connectedCallback() {
        this.popdown.addEventListener('transitionend', this.popdownTransitionCallback);
        this.popdownContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
        this.popdownContainer.addEventListener('toggle', this.detailsToggleCallback);
        this.popdownClose.addEventListener('click', this.close.bind(this));
      }

      detailsToggleCallback(event) {
        if (event.target.hasAttribute('open')) {
          this.open();
        }
      }

      popdownTransitionCallback(event) {
        if (event.target !== this.popdown) return;

        if (!this.classList.contains(classes$o.open)) {
          this.popdownContainer.removeAttribute('open');
          this.a11y.removeTrapFocus();
        } else if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
          // Wait for the 'transform' transition to complete in order to prevent jumping content issues because of the trapFocus
          this.a11y.trapFocus(this.popdown, {
            elementToFocus: this.popdown.querySelector(selectors$x.input),
          });
        }
      }

      onBodyClick(event) {
        if (!this.contains(event.target) || event.target.hasAttribute(attributes$j.popdownUnderlay)) this.close();
      }

      open() {
        this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);

        document.body.addEventListener('click', this.onBodyClickEvent);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:open'));

        if (!document.documentElement.hasAttribute(attributes$j.scrollLocked)) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        requestAnimationFrame(() => {
          this.classList.add(classes$o.open);
        });
      }

      close() {
        this.classList.remove(classes$o.open);
        this.mobileMenu?.dispatchEvent(new CustomEvent('theme:search:close'));

        document.body.removeEventListener('click', this.onBodyClickEvent);

        if (!this.mobileMenu) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }
    }

    customElements.define('header-search-popdown', SearchPopdown);

    const selectors$w = {
      inputSearch: 'input[type="search"]',
    };

    class MainSearch extends HeaderSearchForm {
      constructor() {
        super();

        this.allSearchInputs = document.querySelectorAll(selectors$w.inputSearch);
        this.setupEventListeners();
      }

      setupEventListeners() {
        let allSearchForms = [];
        this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        if (allSearchForms.length < 2) return;
        allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
        this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
      }

      onFormReset(event) {
        super.onFormReset(event);
        if (super.shouldResetForm()) {
          this.keepInSync('', this.input);
        }
      }

      onInput(event) {
        const target = event.target;
        this.keepInSync(target.value, target);
      }

      onInputFocus() {
        if (!isDesktop()) {
          this.scrollIntoView({behavior: 'smooth'});
        }
      }

      keepInSync(value, target) {
        this.allSearchInputs.forEach((input) => {
          if (input !== target) {
            input.value = value;
          }
        });
      }
    }

    customElements.define('main-search', MainSearch);

    const selectors$v = {
      actions: '[data-actions]',
      content: '[data-content]',
      trigger: '[data-button]',
    };

    const attributes$i = {
      height: 'data-height',
    };

    const classes$n = {
      open: 'is-open',
      enabled: 'is-enabled',
    };

    class ToggleEllipsis extends HTMLElement {
      constructor() {
        super();

        this.initialHeight = this.getAttribute(attributes$i.height);
        this.content = this.querySelector(selectors$v.content);
        this.trigger = this.querySelector(selectors$v.trigger);
        this.actions = this.querySelector(selectors$v.actions);
        this.toggleActions = this.toggleActions.bind(this);
      }

      connectedCallback() {
        // Make sure the data attribute height value matches the CSS value
        this.setHeight(this.initialHeight);

        this.trigger.addEventListener('click', () => {
          this.setHeight(this.content.offsetHeight);
          this.classList.add(classes$n.open);
        });

        this.setHeight(this.initialHeight);
        this.toggleActions();

        document.addEventListener('theme:resize', this.toggleActions);
        document.addEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize', this.toggleActions);
        document.removeEventListener('theme:collapsible:toggle', this.toggleActions);
      }

      setHeight(contentHeight) {
        this.style.setProperty('--height', `${contentHeight}px`);
      }

      toggleActions() {
        this.classList.toggle(classes$n.enabled, this.content.offsetHeight + this.actions.offsetHeight > this.initialHeight);
      }
    }

    if (!customElements.get('toggle-ellipsis')) {
      customElements.define('toggle-ellipsis', ToggleEllipsis);
    }

    window.Shopify = window.Shopify || {};
    window.Shopify.theme = window.Shopify.theme || {};
    window.Shopify.theme.sections = window.Shopify.theme.sections || {};

    window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
    window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
    const registered = window.Shopify.theme.sections.registered;
    const instances = window.Shopify.theme.sections.instances;

    const selectors$u = {
      id: 'data-section-id',
      type: 'data-section-type',
    };

    class Registration {
      constructor(type = null, components = []) {
        this.type = type;
        this.components = validateComponentsArray(components);
        this.callStack = {
          onLoad: [],
          onUnload: [],
          onSelect: [],
          onDeselect: [],
          onBlockSelect: [],
          onBlockDeselect: [],
          onReorder: [],
        };
        components.forEach((comp) => {
          for (const [key, value] of Object.entries(comp)) {
            const arr = this.callStack[key];
            if (Array.isArray(arr) && typeof value === 'function') {
              arr.push(value);
            } else {
              console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
              console.warn(value);
            }
          }
        });
      }

      getStack() {
        return this.callStack;
      }
    }

    class Section {
      constructor(container, registration) {
        this.container = validateContainerElement(container);
        this.id = container.getAttribute(selectors$u.id);
        this.type = registration.type;
        this.callStack = registration.getStack();

        try {
          this.onLoad();
        } catch (e) {
          console.warn(`Error in section: ${this.id}`);
          console.warn(this);
          console.warn(e);
        }
      }

      callFunctions(key, e = null) {
        this.callStack[key].forEach((func) => {
          const props = {
            id: this.id,
            type: this.type,
            container: this.container,
          };
          if (e) {
            func.call(props, e);
          } else {
            func.call(props);
          }
        });
      }

      onLoad() {
        this.callFunctions('onLoad');
      }

      onUnload() {
        this.callFunctions('onUnload');
      }

      onSelect(e) {
        this.callFunctions('onSelect', e);
      }

      onDeselect(e) {
        this.callFunctions('onDeselect', e);
      }

      onBlockSelect(e) {
        this.callFunctions('onBlockSelect', e);
      }

      onBlockDeselect(e) {
        this.callFunctions('onBlockDeselect', e);
      }

      onReorder(e) {
        this.callFunctions('onReorder', e);
      }
    }

    function validateContainerElement(container) {
      if (!(container instanceof Element)) {
        throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
      }
      if (container.getAttribute(selectors$u.id) === null) {
        throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$u.id + ' attribute.');
      }

      return container;
    }

    function validateComponentsArray(value) {
      if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
        throw new TypeError('Theme Sections: The components object provided is not a valid');
      }

      return value;
    }

    /*
     * @shopify/theme-sections
     * -----------------------------------------------------------------------------
     *
     * A framework to provide structure to your Shopify sections and a load and unload
     * lifecycle. The lifecycle is automatically connected to theme editor events so
     * that your sections load and unload as the editor changes the content and
     * settings of your sections.
     */

    function register(type, components) {
      if (typeof type !== 'string') {
        throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
      }

      if (typeof registered[type] !== 'undefined') {
        throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
      }

      if (!Array.isArray(components)) {
        components = [components];
      }

      const section = new Registration(type, components);
      registered[type] = section;

      return registered;
    }

    function load(types, containers) {
      types = normalizeType(types);

      if (typeof containers === 'undefined') {
        containers = document.querySelectorAll('[' + selectors$u.type + ']');
      }

      containers = normalizeContainers(containers);

      types.forEach(function (type) {
        const registration = registered[type];

        if (typeof registration === 'undefined') {
          return;
        }

        containers = containers.filter(function (container) {
          // Filter from list of containers because container already has an instance loaded
          if (isInstance(container)) {
            return false;
          }

          // Filter from list of containers because container doesn't have data-section-type attribute
          if (container.getAttribute(selectors$u.type) === null) {
            return false;
          }

          // Keep in list of containers because current type doesn't match
          if (container.getAttribute(selectors$u.type) !== type) {
            return true;
          }

          instances.push(new Section(container, registration));

          // Filter from list of containers because container now has an instance loaded
          return false;
        });
      });
    }

    function reorder(selector) {
      var instancesToReorder = getInstances(selector);

      instancesToReorder.forEach(function (instance) {
        instance.onReorder();
      });
    }

    function unload(selector) {
      var instancesToUnload = getInstances(selector);

      instancesToUnload.forEach(function (instance) {
        var index = instances
          .map(function (e) {
            return e.id;
          })
          .indexOf(instance.id);
        instances.splice(index, 1);
        instance.onUnload();
      });
    }

    function getInstances(selector) {
      var filteredInstances = [];

      // Fetch first element if its an array
      if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
        var firstElement = selector[0];
      }

      // If selector element is DOM element
      if (selector instanceof Element || firstElement instanceof Element) {
        var containers = normalizeContainers(selector);

        containers.forEach(function (container) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.container === container;
            })
          );
        });

        // If select is type string
      } else if (typeof selector === 'string' || typeof firstElement === 'string') {
        var types = normalizeType(selector);

        types.forEach(function (type) {
          filteredInstances = filteredInstances.concat(
            instances.filter(function (instance) {
              return instance.type === type;
            })
          );
        });
      }

      return filteredInstances;
    }

    function getInstanceById(id) {
      var instance;

      for (var i = 0; i < instances.length; i++) {
        if (instances[i].id === id) {
          instance = instances[i];
          break;
        }
      }
      return instance;
    }

    function isInstance(selector) {
      return getInstances(selector).length > 0;
    }

    function normalizeType(types) {
      // If '*' then fetch all registered section types
      if (types === '*') {
        types = Object.keys(registered);

        // If a single section type string is passed, put it in an array
      } else if (typeof types === 'string') {
        types = [types];

        // If single section constructor is passed, transform to array with section
        // type string
      } else if (types.constructor === Section) {
        types = [types.prototype.type];

        // If array of typed section constructors is passed, transform the array to
        // type strings
      } else if (Array.isArray(types) && types[0].constructor === Section) {
        types = types.map(function (Section) {
          return Section.type;
        });
      }

      types = types.map(function (type) {
        return type.toLowerCase();
      });

      return types;
    }

    function normalizeContainers(containers) {
      // Nodelist with entries
      if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
        containers = Array.prototype.slice.call(containers);

        // Empty Nodelist
      } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
        containers = [];

        // Handle null (document.querySelector() returns null with no match)
      } else if (containers === null) {
        containers = [];

        // Single DOM element
      } else if (!Array.isArray(containers) && containers instanceof Element) {
        containers = [containers];
      }

      return containers;
    }

    if (window.Shopify.designMode) {
      document.addEventListener('shopify:section:load', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$u.id + '="' + id + '"]');

        if (container !== null) {
          load(container.getAttribute(selectors$u.type), container);
        }
      });

      document.addEventListener('shopify:section:reorder', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$u.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          reorder(container);
        }
      });

      document.addEventListener('shopify:section:unload', function (event) {
        var id = event.detail.sectionId;
        var container = event.target.querySelector('[' + selectors$u.id + '="' + id + '"]');
        var instance = getInstances(container)[0];

        if (typeof instance === 'object') {
          unload(container);
        }
      });

      document.addEventListener('shopify:section:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onSelect(event);
        }
      });

      document.addEventListener('shopify:section:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onDeselect(event);
        }
      });

      document.addEventListener('shopify:block:select', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockSelect(event);
        }
      });

      document.addEventListener('shopify:block:deselect', function (event) {
        var instance = getInstanceById(event.detail.sectionId);

        if (typeof instance === 'object') {
          instance.onBlockDeselect(event);
        }
      });
    }

    const selectors$t = {
      sectionId: '[data-section-id]',
      tooltip: 'data-tooltip',
      tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
    };

    const classes$m = {
      tooltipDefault: 'tooltip-default',
      visible: 'is-visible',
      hiding: 'is-hiding',
    };

    let sections$h = {};

    class Tooltip {
      constructor(el, options = {}) {
        this.tooltip = el;
        if (!this.tooltip.hasAttribute(selectors$t.tooltip)) return;
        this.label = this.tooltip.getAttribute(selectors$t.tooltip);
        this.class = options.class || classes$m.tooltipDefault;

        this.transitionSpeed = options.transitionSpeed || 200;
        this.hideTransitionTimeout = 0;
        this.addPinEvent = () => this.addPin();
        this.addPinMouseEvent = () => this.addPin(true);
        this.removePinEvent = (event) => throttle(this.removePin(event), 50);
        this.removePinMouseEvent = (event) => this.removePin(event, true, true);
        this.init();
      }

      init() {
        if (!document.querySelector(`.${this.class}`)) {
          const tooltipTemplate = `<div class="${this.class}__arrow"></div><div class="${this.class}__inner"><div class="${this.class}__text"></div></div>`;
          const tooltipElement = document.createElement('div');
          tooltipElement.className = this.class;
          tooltipElement.innerHTML = tooltipTemplate;
          document.body.appendChild(tooltipElement);
        }

        this.tooltip.addEventListener('mouseenter', this.addPinMouseEvent);
        this.tooltip.addEventListener('mouseleave', this.removePinMouseEvent);
        this.tooltip.addEventListener('theme:tooltip:init', this.addPinEvent);
        document.addEventListener('theme:tooltip:close', this.removePinEvent);
      }

      addPin(stopMouseEnter = false) {
        const tooltipTarget = document.querySelector(`.${this.class}`);

        const section = this.tooltip.closest(selectors$t.sectionId);
        const colorSchemeClass = Array.from(section.classList).find((cls) => cls.startsWith('color-scheme-'));
        tooltipTarget?.classList.add(colorSchemeClass); // add the section's color scheme class to the tooltip

        if (this.label && tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(selectors$t.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          const tooltipTargetArrow = tooltipTarget.querySelector(`.${this.class}__arrow`);
          const tooltipTargetInner = tooltipTarget.querySelector(`.${this.class}__inner`);
          const tooltipTargetText = tooltipTarget.querySelector(`.${this.class}__text`);
          tooltipTargetText.innerHTML = this.label;

          const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
          const tooltipRect = this.tooltip.getBoundingClientRect();
          const tooltipTop = tooltipRect.top;
          const tooltipWidth = tooltipRect.width;
          const tooltipHeight = tooltipRect.height;
          const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
          let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
          const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
          const sideOffset = 24;
          const tooltipTargetWindowDifference = tooltipLeftWithWidth - getWindowWidth() + sideOffset;

          if (tooltipTargetWindowDifference > 0) {
            tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
          }

          if (tooltipTargetPositionLeft < 0) {
            tooltipTargetPositionLeft = 0;
          }

          tooltipTargetArrow.style.left = `${tooltipRect.left + tooltipWidth / 2}px`;
          tooltipTarget.style.setProperty('--tooltip-top', `${tooltipTargetPositionTop}px`);

          tooltipTargetInner.style.transform = `translateX(${tooltipTargetPositionLeft}px)`;
          tooltipTarget.classList.remove(classes$m.hiding);
          tooltipTarget.classList.add(classes$m.visible);

          document.addEventListener('theme:scroll', this.removePinEvent);
        }
      }

      removePin(event, stopMouseEnter = false, hideTransition = false) {
        const tooltipTarget = document.querySelector(`.${this.class}`);
        const tooltipVisible = tooltipTarget.classList.contains(classes$m.visible);

        if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(selectors$t.tooltipStopMouseEnter)) || !stopMouseEnter)) {
          if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
            tooltipTarget.classList.add(classes$m.hiding);

            if (this.hideTransitionTimeout) {
              clearTimeout(this.hideTransitionTimeout);
            }

            this.hideTransitionTimeout = setTimeout(() => {
              tooltipTarget.classList.remove(classes$m.hiding);
            }, this.transitionSpeed);
          }

          tooltipTarget.classList.remove(classes$m.visible);

          document.removeEventListener('theme:scroll', this.removePinEvent);
        }
      }

      unload() {
        this.tooltip.removeEventListener('mouseenter', this.addPinMouseEvent);
        this.tooltip.removeEventListener('mouseleave', this.removePinMouseEvent);
        this.tooltip.removeEventListener('theme:tooltip:init', this.addPinEvent);
        document.removeEventListener('theme:tooltip:close', this.removePinEvent);
        document.removeEventListener('theme:scroll', this.removePinEvent);
      }
    }

    const tooltipSection = {
      onLoad() {
        sections$h[this.id] = [];
        const els = this.container.querySelectorAll(`[${selectors$t.tooltip}]`);
        els.forEach((el) => {
          sections$h[this.id].push(new Tooltip(el));
        });
      },
      onUnload: function () {
        sections$h[this.id].forEach((el) => {
          if (typeof el.unload === 'function') {
            el.unload();
          }
        });
      },
    };

    register('article', [tooltipSection]);

    const selectors$s = {
      aos: '[data-aos]',
      collectionImage: '.collection-item__image',
      columnImage: '[data-column-image]',
      flickityNextArrow: '.flickity-button.next',
      flickityPrevArrow: '.flickity-button.previous',
      link: 'a:not(.btn)',
      productItemImage: '.product-item__image',
      slide: '[data-slide]',
      slideValue: 'data-slide',
      slider: '[data-slider]',
      sliderThumb: '[data-slider-thumb]',
    };

    const attributes$h = {
      arrowPositionMiddle: 'data-arrow-position-middle',
      slideIndex: 'data-slide-index',
      sliderOptions: 'data-options',
      slideTextColor: 'data-slide-text-color',
    };

    const classes$l = {
      aosAnimate: 'aos-animate',
      desktop: 'desktop',
      focused: 'is-focused',
      flickityEnabled: 'flickity-enabled',
      heroContentTransparent: 'hero__content--transparent',
      initialized: 'is-initialized',
      isLoading: 'is-loading',
      isSelected: 'is-selected',
      mobile: 'mobile',
      singleSlide: 'single-slide',
      sliderInitialized: 'js-slider--initialized',
    };

    const sections$g = {};

    class Slider {
      constructor(container, slideshow = null) {
        this.container = container;
        this.slideshow = slideshow || this.container.querySelector(selectors$s.slider);

        if (!this.slideshow) return;

        this.slideshowSlides = this.slideshow.querySelectorAll(selectors$s.slide);

        if (this.slideshowSlides.length <= 1) return;

        this.sliderThumbs = this.container.querySelectorAll(selectors$s.sliderThumb);

        if (this.slideshow.hasAttribute(attributes$h.sliderOptions)) {
          this.customOptions = JSON.parse(decodeURIComponent(this.slideshow.getAttribute(attributes$h.sliderOptions)));
        }

        this.flkty = null;

        this.init();
      }

      init() {
        this.slideshow.classList.add(classes$l.isLoading);

        let slideSelector = selectors$s.slide;
        const isDesktopView = isDesktop();
        const slideMobile = `${selectors$s.slide}:not(.${classes$l.mobile})`;
        const slideDesktop = `${selectors$s.slide}:not(.${classes$l.desktop})`;
        const hasDeviceSpecificSelectors = this.slideshow.querySelectorAll(slideDesktop).length || this.slideshow.querySelectorAll(slideMobile).length;

        if (hasDeviceSpecificSelectors) {
          if (isDesktopView) {
            slideSelector = slideMobile;
          } else {
            slideSelector = slideDesktop;
          }
        }

        if (this.slideshow.querySelectorAll(slideSelector).length <= 1) {
          this.slideshow.classList.add(classes$l.singleSlide);
          this.slideshow.classList.remove(classes$l.isLoading);
        }

        this.sliderOptions = {
          cellSelector: slideSelector,
          contain: true,
          wrapAround: true,
          adaptiveHeight: true,
          ...this.customOptions,
          on: {
            ready: () => {
              requestAnimationFrame(() => {
                this.slideshow.classList.add(classes$l.initialized);
                this.slideshow.classList.remove(classes$l.isLoading);
                this.slideshow.parentNode.dispatchEvent(
                  new CustomEvent('theme:slider:loaded', {
                    bubbles: true,
                    detail: {
                      slider: this,
                    },
                  })
                );
              });

              this.slideActions();

              if (this.sliderOptions.prevNextButtons) {
                this.positionArrows();
              }
            },
            change: (index) => {
              const slide = this.slideshowSlides[index];
              if (!slide || this.sliderOptions.groupCells) return;

              const elementsToAnimate = slide.querySelectorAll(selectors$s.aos);
              if (elementsToAnimate.length) {
                elementsToAnimate.forEach((el) => {
                  el.classList.remove(classes$l.aosAnimate);
                  requestAnimationFrame(() => {
                    // setTimeout with `0` delay fixes functionality on Mobile and Firefox
                    setTimeout(() => {
                      el.classList.add(classes$l.aosAnimate);
                    }, 0);
                  });
                });
              }
            },
            resize: () => {
              if (this.sliderOptions.prevNextButtons) {
                this.positionArrows();
              }
            },
          },
        };

        if (this.sliderOptions.fade) {
          this.flkty = new FlickityFade(this.slideshow, this.sliderOptions);
        }

        if (!this.sliderOptions.fade) {
          this.flkty = new Flickity(this.slideshow, this.sliderOptions);
        }

        this.flkty.on('change', () => this.slideActions(true));

        if (this.sliderThumbs.length) {
          this.sliderThumbs.forEach((element) => {
            element.addEventListener('click', (e) => {
              e.preventDefault();
              const slideIndex = [...element.parentElement.children].indexOf(element);
              this.flkty.select(slideIndex);
            });
          });
        }

        if (!this.flkty || !this.flkty.isActive) {
          this.slideshow.classList.remove(classes$l.isLoading);
        }
      }

      slideActions(changeEvent = false) {
        const currentSlide = this.slideshow.querySelector(`.${classes$l.isSelected}`);
        if (!currentSlide) return;
        const currentSlideTextColor = currentSlide.hasAttribute(attributes$h.slideTextColor) ? currentSlide.getAttribute(attributes$h.slideTextColor) : '';
        const currentSlideLink = currentSlide.querySelector(selectors$s.link);
        const buttons = this.slideshow.querySelectorAll(`${selectors$s.slide} a, ${selectors$s.slide} button`);

        if (document.body.classList.contains(classes$l.focused) && currentSlideLink && this.sliderOptions.groupCells && changeEvent) {
          currentSlideLink.focus();
        }

        if (buttons.length) {
          buttons.forEach((button) => {
            const slide = button.closest(selectors$s.slide);
            if (slide) {
              const tabIndex = slide.classList.contains(classes$l.isSelected) ? 0 : -1;
              button.setAttribute('tabindex', tabIndex);
            }
          });
        }

        this.slideshow.style.setProperty('--text', currentSlideTextColor);

        if (this.sliderThumbs.length && this.sliderThumbs.length === this.slideshowSlides.length && currentSlide.hasAttribute(attributes$h.slideIndex)) {
          const slideIndex = parseInt(currentSlide.getAttribute(attributes$h.slideIndex));
          const currentThumb = this.container.querySelector(`${selectors$s.sliderThumb}.${classes$l.isSelected}`);
          if (currentThumb) {
            currentThumb.classList.remove(classes$l.isSelected);
          }
          this.sliderThumbs[slideIndex].classList.add(classes$l.isSelected);
        }
      }

      positionArrows() {
        if (this.slideshow.hasAttribute(attributes$h.arrowPositionMiddle) && this.sliderOptions.prevNextButtons) {
          const itemImage = this.slideshow.querySelector(selectors$s.collectionImage) || this.slideshow.querySelector(selectors$s.productItemImage) || this.slideshow.querySelector(selectors$s.columnImage);

          // Prevent 'clientHeight' of null error if no image
          if (!itemImage) return;

          this.slideshow.querySelector(selectors$s.flickityPrevArrow).style.top = itemImage.clientHeight / 2 + 'px';
          this.slideshow.querySelector(selectors$s.flickityNextArrow).style.top = itemImage.clientHeight / 2 + 'px';
        }
      }

      onUnload() {
        if (this.slideshow && this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }
      }

      onBlockSelect(evt) {
        if (!this.slideshow) return;
        // Ignore the cloned version
        const slide = this.slideshow.querySelector(`[${selectors$s.slideValue}="${evt.detail.blockId}"]`);

        if (!slide) return;
        let slideIndex = parseInt(slide.getAttribute(attributes$h.slideIndex));

        this.slideshow.classList.add(classes$l.isSelected);

        // Go to selected slide, pause autoplay
        if (this.flkty && this.slideshow.classList.contains(classes$l.flickityEnabled)) {
          this.flkty.selectCell(slideIndex);
          this.flkty.stopPlayer();
        }
      }

      onBlockDeselect() {
        if (!this.slideshow) return;
        this.slideshow.classList.remove(classes$l.isSelected);

        if (this.flkty && this.sliderOptions.hasOwnProperty('autoPlay') && this.sliderOptions.autoPlay) {
          this.flkty.playPlayer();
        }
      }
    }

    const slider = {
      onLoad() {
        sections$g[this.id] = [];
        const els = this.container.querySelectorAll(selectors$s.slider);
        els.forEach((el) => {
          sections$g[this.id].push(new Slider(this.container, el));
        });
      },
      onUnload() {
        sections$g[this.id].forEach((el) => {
          if (typeof el.onUnload === 'function') {
            el.onUnload();
          }
        });
      },
      onBlockSelect(e) {
        sections$g[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(e);
          }
        });
      },
      onBlockDeselect(e) {
        sections$g[this.id].forEach((el) => {
          if (typeof el.onBlockDeselect === 'function') {
            el.onBlockDeselect(e);
          }
        });
      },
    };

    register('blog-section', [slider]);

    register('double', slider);

    const scrollTo = (elementTop) => {
      /* Sticky header check */
      let {stickyHeaderHeight} = readHeights();

      window.scrollTo({
        top: elementTop + window.scrollY - stickyHeaderHeight,
        left: 0,
        behavior: 'smooth',
      });
    };

    class PopupCookie {
      constructor(name, value, daysToExpire = 7) {
        const today = new Date();
        const expiresDate = new Date();
        expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

        this.configuration = {
          expires: expiresDate.toGMTString(), // session cookie
          path: '/',
          domain: window.location.hostname,
          sameSite: 'none',
          secure: true,
        };
        this.name = name;
        this.value = value;
      }

      write() {
        const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));

        if (hasCookie || document.cookie.indexOf('; ') === -1) {
          document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
        }
      }

      read() {
        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          const returnCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];

          return returnCookie;
        } else {
          return false;
        }
      }

      destroy() {
        if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
        }
      }
    }

    const selectors$r = {
      newsletterForm: '[data-newsletter-form]',
      newsletterHeading: '[data-newsletter-heading]',
      newsletterPopup: '[data-newsletter]',
    };

    const classes$k = {
      success: 'has-success',
      error: 'has-error',
      hidden: 'hidden',
    };

    const attributes$g = {
      cookieNameAttribute: 'data-cookie-name',
    };

    const sections$f = {};

    class NewsletterCheckForResult {
      constructor(newsletter) {
        this.sessionStorage = window.sessionStorage;
        this.newsletter = newsletter;
        this.popup = this.newsletter.closest(selectors$r.newsletterPopup);
        if (this.popup) {
          this.cookie = new PopupCookie(this.popup.getAttribute(attributes$g.cookieNameAttribute), 'user_has_closed', null);
        }

        this.stopSubmit = true;
        this.isChallengePage = false;
        this.formID = null;

        this.checkForChallengePage();

        this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

        if (!this.isChallengePage) {
          this.init();
        }
      }

      init() {
        this.newsletter.addEventListener('submit', this.newsletterSubmit);

        this.showMessage();
      }

      newsletterSubmitEvent(e) {
        if (this.stopSubmit) {
          e.preventDefault();
          e.stopImmediatePropagation();

          this.removeStorage();
          this.writeStorage();
          this.stopSubmit = false;
          this.newsletter.submit();
        }
      }

      checkForChallengePage() {
        this.isChallengePage = window.location.pathname === '/challenge';
      }

      writeStorage() {
        if (this.sessionStorage !== undefined) {
          this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
        }
      }

      readStorage() {
        this.formID = this.sessionStorage.getItem('newsletter_form_id');
      }

      removeStorage() {
        this.sessionStorage.removeItem('newsletter_form_id');
      }

      showMessage() {
        this.readStorage();

        if (this.newsletter.id === this.formID) {
          const newsletter = document.getElementById(this.formID);
          const newsletterHeading = newsletter.parentElement.querySelector(selectors$r.newsletterHeading);
          const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
          const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

          if (submissionSuccess) {
            newsletter.classList.remove(classes$k.error);
            newsletter.classList.add(classes$k.success);

            if (newsletterHeading) {
              newsletterHeading.classList.add(classes$k.hidden);
              newsletter.classList.remove(classes$k.hidden);
            }

            if (this.popup) {
              this.cookie.write();
            }
          } else if (submissionFailure) {
            newsletter.classList.remove(classes$k.success);
            newsletter.classList.add(classes$k.error);

            if (newsletterHeading) {
              newsletterHeading.classList.add(classes$k.hidden);
              newsletter.classList.remove(classes$k.hidden);
            }
          }

          if (submissionSuccess || submissionFailure) {
            window.addEventListener('load', () => {
              this.scrollToForm(newsletter);
            });
          }
        }
      }

      scrollToForm(newsletter) {
        const rect = newsletter.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.left >= 0 && rect.bottom <= getWindowHeight() && rect.right <= getWindowWidth();

        if (!isVisible) {
          setTimeout(() => {
            scrollTo(newsletter.getBoundingClientRect().top);
          }, 500);
        }
      }

      unload() {
        this.newsletter.removeEventListener('submit', this.newsletterSubmit);
      }
    }

    const newsletterCheckForResultSection = {
      onLoad() {
        sections$f[this.id] = [];
        const newsletters = this.container.querySelectorAll(selectors$r.newsletterForm);
        newsletters.forEach((form) => {
          sections$f[this.id].push(new NewsletterCheckForResult(form));
        });
      },
      onUnload() {
        sections$f[this.id].forEach((form) => {
          if (typeof form.unload === 'function') {
            form.unload();
          }
        });
      },
    };

    register('footer', [newsletterCheckForResultSection]);

    const selectors$q = {
      collectionSidebar: '[data-collection-sidebar]',
      collectionSidebarSlideOut: '[data-collection-sidebar-slide-out]',
      collectionSidebarCloseButton: '[data-collection-sidebar-close]',
      groupTagsButton: '[data-aria-toggle]',
      animation: '[data-animation]',
    };

    const classes$j = {
      animated: 'drawer--animated',
      hiding: 'is-hiding',
      expanded: 'expanded',
      noMobileAnimation: 'no-mobile-animation',
      focused: 'is-focused',
    };

    let sections$e = {};
    class Collection {
      constructor(section) {
        this.container = section.container;
        this.collectionSidebar = this.container.querySelector(selectors$q.collectionSidebar);
        this.groupTagsButton = this.container.querySelector(selectors$q.groupTagsButton);
        this.a11y = a11y;

        this.groupTagsButtonClickEvent = (evt) => this.groupTagsButtonClick(evt);
        this.sidebarResizeEvent = () => this.toggleSidebarSlider();
        this.collectionSidebarCloseEvent = (evt) => this.collectionSidebarClose(evt);

        this.init();
      }

      init() {
        if (this.groupTagsButton !== null) {
          document.addEventListener('theme:resize:width', this.sidebarResizeEvent);

          this.groupTagsButton.addEventListener('click', this.groupTagsButtonClickEvent);

          // Prevent filters closing animation on page load
          if (this.collectionSidebar) {
            setTimeout(() => {
              this.collectionSidebar.classList.remove(classes$j.noMobileAnimation);
            }, 1000);
          }

          const toggleFiltersObserver = new MutationObserver((mutationList) => {
            for (const mutation of mutationList) {
              if (mutation.type === 'attributes') {
                const expanded = mutation.target.getAttribute('aria-expanded') == 'true';

                if (expanded) {
                  this.showSidebarCallback();
                }
              }
            }
          });

          toggleFiltersObserver.observe(this.groupTagsButton, {
            attributes: true,
            childList: false,
            subtree: false,
          });
        }

        // Hide filters sidebar on ESC keypress
        this.container.addEventListener(
          'keyup',
          function (evt) {
            if (evt.code !== 'Escape') {
              return;
            }
            this.hideSidebar();
          }.bind(this)
        );

        if (this.collectionSidebar) {
          this.collectionSidebar.addEventListener('transitionend', () => {
            if (!this.collectionSidebar.classList.contains(classes$j.expanded)) {
              this.collectionSidebar.classList.remove(classes$j.animated);
            }
          });

          this.toggleSidebarSlider();

          this.container.addEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
        }
      }

      showSidebarCallback() {
        const collectionSidebarSlideOut = this.container.querySelector(selectors$q.collectionSidebarSlideOut);
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

        const isMobileView = isMobile();
        this.collectionSidebar.classList.add(classes$j.animated);

        if (collectionSidebarSlideOut === null) {
          if (!isMobileView && isScrollLocked) {
            this.a11y.removeTrapFocus();
            document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          }
        }

        if (isMobileView || collectionSidebarSlideOut !== null) {
          if (collectionSidebarSlideOut) {
            this.a11y.trapFocus(this.collectionSidebar, {
              elementToFocus: this.collectionSidebar.querySelector(selectors$q.collectionSidebarCloseButton),
            });
          }
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }
      }

      hideSidebar() {
        const collectionSidebarSlideOut = this.container.querySelector(selectors$q.collectionSidebarSlideOut);
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

        this.groupTagsButton.setAttribute('aria-expanded', 'false');
        this.collectionSidebar.classList.remove(classes$j.expanded);

        if (collectionSidebarSlideOut) {
          this.a11y.removeTrapFocus();
        }

        if (isScrollLocked) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      toggleSidebarSlider() {
        if (isMobile()) {
          this.hideSidebar();
        } else if (this.collectionSidebar.classList.contains(classes$j.expanded)) {
          this.showSidebarCallback();
        }
      }

      collectionSidebarClose(evt) {
        evt.preventDefault();
        this.hideSidebar();
        if (document.body.classList.contains(classes$j.focused) && this.groupTagsButton) {
          this.groupTagsButton.focus();
        }
      }

      groupTagsButtonClick() {
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');

        if (isScrollLocked) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }

      onUnload() {
        if (this.groupTagsButton !== null) {
          document.removeEventListener('theme:resize:width', this.sidebarResizeEvent);
          this.groupTagsButton.removeEventListener('click', this.groupTagsButtonClickEvent);
        }

        if (this.collectionSidebar) {
          this.container.removeEventListener('theme:filter:close', this.collectionSidebarCloseEvent);
        }
      }
    }

    const collectionSection = {
      onLoad() {
        sections$e[this.id] = new Collection(this);
      },
      onUnload() {
        sections$e[this.id].onUnload();
      },
    };

    register('collection', [slider, collectionSection, tooltipSection]);

    const selectors$p = {
      marquee: '.announcement__bar-holder--marquee',
      slide: '[data-slide]',
      slider: '[data-slider]',
      ticker: 'ticker-bar',
      tickerSlide: '.announcement__slide',
    };

    const classes$i = {
      hidden: 'hidden',
    };

    class AnnouncementBar extends HTMLElement {
      constructor() {
        super();

        this.slider = this.querySelector(selectors$p.slider);
        this.enableSlider = isDesktop();
        this.slidesCount = this.querySelectorAll(selectors$p.tickerSlide).length;
        this.initSliderEvent = (event) => this.initSlider(event);
      }

      connectedCallback() {
        if (this.slider) {
          this.initSliders();
        }

        this.addEventListener('theme:block:select', (e) => {
          this.onBlockSelect(e);
        });

        this.addEventListener('theme:block:deselect', (e) => {
          this.onBlockDeselect(e);
        });

        this.addEventListener('theme:countdown:hide', (e) => {
          if (window.Shopify.designMode) return;

          const isMarquee = e.target.closest(selectors$p.marquee);

          if (this.slidesCount === 1) {
            const tickerBar = this.querySelector(selectors$p.ticker);
            tickerBar.style.display = 'none';
          }

          if (isMarquee) {
            const tickerText = e.target.closest(selectors$p.tickerSlide);
            this.removeTickerText(tickerText);
          } else {
            const slide = e.target.closest(selectors$p.slide);
            this.removeSlide(slide);
          }
        });

        this.addEventListener('theme:countdown:expire', () => {
          this.querySelectorAll(selectors$p.ticker)?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });

        document.dispatchEvent(new CustomEvent('theme:announcement:init', {bubbles: true}));
      }

      /**
       * Init slider
       */
      initSliders() {
        this.initSlider();
        document.addEventListener('theme:resize:width', this.initSliderEvent);

        this.addEventListener('theme:slider:loaded', () => {
          this.querySelectorAll(selectors$p.tickerBar)?.forEach((ticker) => {
            ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
          });
        });
      }

      initSlider() {
        const isDesktopView = isDesktop();
        const isMobileView = !isDesktopView;

        if ((isDesktopView && this.enableSlider) || (isMobileView && !this.enableSlider)) {
          this.slider.flkty?.destroy();

          if (isDesktopView && this.enableSlider) {
            this.enableSlider = false;
          } else if (isMobileView && !this.enableSlider) {
            this.enableSlider = true;
          }

          this.slider = new Slider(this, this.querySelector(selectors$p.slider));
          this.slider.flkty?.reposition();
        }
      }

      removeSlide(slide) {
        this.slider.flkty?.remove(slide);

        if (this.slider.flkty?.cells.length === 0) {
          this.section.classList.add(classes$i.hidden);
        }
      }

      removeTickerText(tickerText) {
        const ticker = tickerText.closest(selectors$p.ticker);
        tickerText.remove();
        ticker.dispatchEvent(new CustomEvent('theme:ticker:refresh'));
      }

      onBlockSelect(e) {
        if (this.slider) {
          this.slider.onBlockSelect(e);
        }
      }

      onBlockDeselect(e) {
        if (this.slider) {
          this.slider.onBlockDeselect(e);
        }
      }

      disconnectedCallback() {
        document.removeEventListener('theme:resize:width', this.initSliderEvent);
        document.removeEventListener('theme:resize:width', this.tickerResizeEvent);

        this.removeEventListener('theme:block:select', (e) => {
          this.onBlockSelect(e);
        });

        this.removeEventListener('theme:block:deselect', (e) => {
          this.onBlockDeselect(e);
        });
      }
    }

    if (!customElements.get('announcement-bar')) {
      customElements.define('announcement-bar', AnnouncementBar);
    }

    const selectors$o = {
      pageHeader: '.page-header',
    };

    const classes$h = {
      stuck: 'js__header__stuck',
      sticky: 'has-header-sticky',
      headerGroup: 'shopify-section-group-header-group',
    };

    const attributes$f = {
      stickyHeader: 'data-header-sticky',
      scrollLock: 'data-scroll-locked',
    };

    let sections$d = {};

    class Sticky {
      constructor(el) {
        this.wrapper = el;
        this.sticks = this.wrapper.hasAttribute(attributes$f.stickyHeader);

        document.body.classList.toggle(classes$h.sticky, this.sticks);

        if (!this.sticks) return;

        this.isStuck = false;
        this.cls = this.wrapper.classList;
        this.headerOffset = document.querySelector(selectors$o.pageHeader)?.offsetTop;
        this.updateHeaderOffset = this.updateHeaderOffset.bind(this);
        this.scrollEvent = (e) => this.onScroll(e);

        this.listen();
        this.stickOnLoad();
      }

      listen() {
        document.addEventListener('theme:scroll', this.scrollEvent);
        document.addEventListener('shopify:section:load', this.updateHeaderOffset);
        document.addEventListener('shopify:section:unload', this.updateHeaderOffset);
      }

      onScroll(e) {
        if (e.detail.down) {
          if (!this.isStuck && e.detail.position > this.headerOffset) {
            this.stickSimple();
          }
        } else if (e.detail.position <= this.headerOffset) {
          this.unstickSimple();
        }
      }

      updateHeaderOffset(event) {
        if (!event.target.classList.contains(classes$h.headerGroup)) return;

        // Update header offset after any "Header group" section has been changed
        setTimeout(() => {
          this.headerOffset = document.querySelector(selectors$o.pageHeader)?.offsetTop;
        });
      }

      stickOnLoad() {
        if (window.scrollY > this.headerOffset) {
          this.stickSimple();
        }
      }

      stickSimple() {
        this.cls.add(classes$h.stuck);
        this.isStuck = true;
      }

      unstickSimple() {
        if (!document.documentElement.hasAttribute(attributes$f.scrollLock)) {
          // check for scroll lock
          this.cls.remove(classes$h.stuck);
          this.isStuck = false;
        }
      }

      unload() {
        document.removeEventListener('theme:scroll', this.scrollEvent);
        document.removeEventListener('shopify:section:load', this.updateHeaderOffset);
        document.removeEventListener('shopify:section:unload', this.updateHeaderOffset);
      }
    }

    const stickyHeader = {
      onLoad() {
        sections$d = new Sticky(this.container);
      },
      onUnload: function () {
        if (typeof sections$d.unload === 'function') {
          sections$d.unload();
        }
      },
    };

    const selectors$n = {
      disclosureToggle: 'data-hover-disclosure-toggle',
      disclosureWrappper: '[data-hover-disclosure]',
      link: '[data-top-link]',
      wrapper: '[data-header-wrapper]',
      stagger: '[data-stagger]',
      staggerPair: '[data-stagger-first]',
      staggerAfter: '[data-stagger-second]',
      focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const classes$g = {
      isVisible: 'is-visible',
      meganavVisible: 'meganav--visible',
      meganavIsTransitioning: 'meganav--is-transitioning',
    };

    let sections$c = {};
    let disclosures = {};
    class HoverDisclosure {
      constructor(el) {
        this.disclosure = el;
        this.wrapper = el.closest(selectors$n.wrapper);
        this.key = this.disclosure.id;
        this.trigger = document.querySelector(`[${selectors$n.disclosureToggle}='${this.key}']`);
        this.link = this.trigger.querySelector(selectors$n.link);
        this.grandparent = this.trigger.classList.contains('grandparent');
        this.transitionTimeout = 0;

        this.trigger.setAttribute('aria-haspopup', true);
        this.trigger.setAttribute('aria-expanded', false);
        this.trigger.setAttribute('aria-controls', this.key);

        this.connectHoverToggle();
        this.handleTablets();
        this.staggerChildAnimations();
      }

      onBlockSelect(evt) {
        if (this.disclosure.contains(evt.target)) {
          this.showDisclosure(evt);
        }
      }

      onBlockDeselect(evt) {
        if (this.disclosure.contains(evt.target)) {
          this.hideDisclosure();
        }
      }

      showDisclosure(e) {
        if (e && e.type && e.type === 'mouseenter') {
          this.wrapper.classList.add(classes$g.meganavIsTransitioning);
        }

        if (this.grandparent) {
          this.wrapper.classList.add(classes$g.meganavVisible);
        } else {
          this.wrapper.classList.remove(classes$g.meganavVisible);
        }
        this.trigger.setAttribute('aria-expanded', true);
        this.trigger.classList.add(classes$g.isVisible);
        this.disclosure.classList.add(classes$g.isVisible);

        if (this.transitionTimeout) {
          clearTimeout(this.transitionTimeout);
        }

        this.transitionTimeout = setTimeout(() => {
          this.wrapper.classList.remove(classes$g.meganavIsTransitioning);
        }, 200);
      }

      hideDisclosure() {
        this.disclosure.classList.remove(classes$g.isVisible);
        this.trigger.classList.remove(classes$g.isVisible);
        this.trigger.setAttribute('aria-expanded', false);
        this.wrapper.classList.remove(classes$g.meganavVisible, classes$g.meganavIsTransitioning);
      }

      staggerChildAnimations() {
        const simple = this.disclosure.querySelectorAll(selectors$n.stagger);
        let step = 50;
        simple.forEach((el, index) => {
          el.style.transitionDelay = `${index * step + 10}ms`;
          step *= 0.95;
        });

        const pairs = this.disclosure.querySelectorAll(selectors$n.staggerPair);
        pairs.forEach((child, i) => {
          const d1 = i * 100;
          child.style.transitionDelay = `${d1}ms`;
          child.parentElement.querySelectorAll(selectors$n.staggerAfter).forEach((grandchild, i2) => {
            const di1 = i2 + 1;
            const d2 = di1 * 20;
            grandchild.style.transitionDelay = `${d1 + d2}ms`;
          });
        });
      }

      handleTablets() {
        // first click opens the popup, second click opens the link
        this.trigger.addEventListener(
          'touchstart',
          function (e) {
            const isOpen = this.disclosure.classList.contains(classes$g.isVisible);
            if (!isOpen) {
              e.preventDefault();
              this.showDisclosure(e);
            }
          }.bind(this),
          {passive: true}
        );
      }

      connectHoverToggle() {
        this.trigger.addEventListener('mouseenter', (e) => this.showDisclosure(e));
        this.link.addEventListener('focus', (e) => this.showDisclosure(e));

        this.trigger.addEventListener('mouseleave', () => this.hideDisclosure());
        this.trigger.addEventListener('focusout', (e) => {
          const inMenu = this.trigger.contains(e.relatedTarget);
          if (!inMenu) {
            this.hideDisclosure();
          }
        });
        this.disclosure.addEventListener('keyup', (evt) => {
          if (evt.code !== 'Escape') {
            return;
          }
          this.hideDisclosure();
        });
      }
    }

    const hoverDisclosure = {
      onLoad() {
        sections$c[this.id] = [];
        disclosures = this.container.querySelectorAll(selectors$n.disclosureWrappper);
        disclosures.forEach((el) => {
          sections$c[this.id].push(new HoverDisclosure(el));
        });
      },
      onBlockSelect(evt) {
        sections$c[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(evt);
          }
        });
      },
      onBlockDeselect(evt) {
        sections$c[this.id].forEach((el) => {
          if (typeof el.onBlockDeselect === 'function') {
            el.onBlockDeselect(evt);
          }
        });
      },
    };

    const selectors$m = {
      wrapper: '[data-header-wrapper]',
      style: 'data-header-style',
      widthContentWrapper: '[data-takes-space-wrapper]',
      widthContent: '[data-child-takes-space]',
      desktop: '[data-header-desktop]',
      deadLink: '.navlink[href="#"]',
      cartDrawer: 'cart-drawer',
      cartToggleButton: '[data-cart-toggle]',
      firstSectionOverlayHeader: '.main-content > .shopify-section.section-overlay-header:first-of-type',
      preventTransparent: '[data-prevent-transparent-header]',
    };

    const classes$f = {
      clone: 'js__header__clone',
      firstSectionOverlayHeader: 'has-first-section-overlay-header',
      showMobileClass: 'js__show__mobile',
      transparent: 'has-header-transparent',
    };

    const attributes$e = {
      drawer: 'data-drawer',
      drawerToggle: 'data-drawer-toggle',
      transparent: 'data-header-transparent',
    };

    let sections$b = {};

    class Header {
      constructor(el) {
        this.wrapper = el;
        this.style = this.wrapper.dataset.style;
        this.desktop = this.wrapper.querySelector(selectors$m.desktop);
        this.deadLinks = document.querySelectorAll(selectors$m.deadLink);
        this.resizeObserver = null;
        this.checkWidth = this.checkWidth.bind(this);

        this.killDeadLinks();
        if (this.style !== 'drawer' && this.desktop) {
          this.minWidth = this.getMinWidth();
          this.listenWidth();
        }

        this.drawerToggleEvent();
        this.cartToggleEvent();

        // Fallback for CSS :has() selectors
        let enableTransparentHeader = false;
        const firstSectionOverlayHeader = document.querySelector(selectors$m.firstSectionOverlayHeader);
        if (firstSectionOverlayHeader && !firstSectionOverlayHeader.querySelector(selectors$m.preventTransparent)) {
          enableTransparentHeader = true;
        }

        document.body.classList.toggle(classes$f.transparent, this.wrapper.hasAttribute(attributes$e.transparent));
        document.body.classList.toggle(classes$f.firstSectionOverlayHeader, enableTransparentHeader);
      }

      initTicker(stopClone = false) {
        this.tickerFrames.forEach((frame) => {
          new Ticker(frame, stopClone);
        });

        this.tickerResizeEvent = (event) => this.onTickerResize(event);

        document.addEventListener('theme:resize:width', this.tickerResizeEvent);
      }

      listenWidth() {
        if ('ResizeObserver' in window) {
          this.resizeObserver = new ResizeObserver(this.checkWidth);
          this.resizeObserver.observe(this.wrapper);
        } else {
          document.addEventListener('theme:resize', this.checkWidth);
        }
      }

      drawerToggleEvent() {
        this.wrapper.querySelectorAll(`[${attributes$e.drawerToggle}]`)?.forEach((button) => {
          button.addEventListener('click', () => {
            let drawer;
            const key = button.hasAttribute(attributes$e.drawerToggle) ? button.getAttribute(attributes$e.drawerToggle) : '';
            const desktopDrawer = document.querySelector(`[${attributes$e.drawer}="${key}"]`);
            const mobileDrawer = document.querySelector(`mobile-menu > [${attributes$e.drawer}]`);
            const isDesktopView = isDesktop();

            if (isDesktopView) {
              drawer = desktopDrawer;
            } else {
              drawer = theme.settings.mobileMenuType === 'new' ? mobileDrawer || desktopDrawer : desktopDrawer;
            }

            drawer.dispatchEvent(
              new CustomEvent('theme:drawer:toggle', {
                bubbles: false,
                detail: {
                  button: button,
                },
              })
            );
          });
        });
      }

      killDeadLinks() {
        this.deadLinks.forEach((el) => {
          el.onclick = (e) => {
            e.preventDefault();
          };
        });
      }

      checkWidth() {
        if (document.body.clientWidth < this.minWidth) {
          this.wrapper.classList.add(classes$f.showMobileClass);

          // Update --header-height CSS variable when switching to a mobile nav
          const {headerHeight} = readHeights();
          document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        } else {
          this.wrapper.classList.remove(classes$f.showMobileClass);
        }
      }

      getMinWidth() {
        const comparitor = this.wrapper.cloneNode(true);
        comparitor.classList.add(classes$f.clone);
        document.body.appendChild(comparitor);
        const widthWrappers = comparitor.querySelectorAll(selectors$m.widthContentWrapper);
        let minWidth = 0;
        let spaced = 0;

        widthWrappers.forEach((context) => {
          const wideElements = context.querySelectorAll(selectors$m.widthContent);
          let thisWidth = 0;
          if (wideElements.length === 3) {
            thisWidth = _sumSplitWidths(wideElements);
          } else {
            thisWidth = _sumWidths(wideElements);
          }
          if (thisWidth > minWidth) {
            minWidth = thisWidth;
            spaced = wideElements.length * 20;
          }
        });

        document.body.removeChild(comparitor);
        return minWidth + spaced;
      }

      cartToggleEvent() {
        if (theme.settings.cartType !== 'drawer') return;

        this.wrapper.querySelectorAll(selectors$m.cartToggleButton)?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const cartDrawer = document.querySelector(selectors$m.cartDrawer);

            if (cartDrawer) {
              e.preventDefault();
              cartDrawer.dispatchEvent(new CustomEvent('theme:cart-drawer:show'));
              window.a11y.lastElement = button;
            }
          });
        });
      }

      toggleButtonClick(e) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('theme:cart:toggle', {bubbles: true}));
      }

      unload() {
        if ('ResizeObserver' in window) {
          this.resizeObserver?.unobserve(this.wrapper);
        } else {
          document.removeEventListener('theme:resize', this.checkWidth);
        }
      }
    }

    function _sumSplitWidths(nodes) {
      let arr = [];
      nodes.forEach((el) => {
        if (el.firstElementChild) {
          arr.push(el.firstElementChild.clientWidth);
        }
      });
      if (arr[0] > arr[2]) {
        arr[2] = arr[0];
      } else {
        arr[0] = arr[2];
      }
      const width = arr.reduce((a, b) => a + b);
      return width;
    }
    function _sumWidths(nodes) {
      let width = 0;
      nodes.forEach((el) => {
        width += el.clientWidth;
      });
      return width;
    }

    const header = {
      onLoad() {
        sections$b = new Header(this.container);
      },
      onUnload() {
        if (typeof sections$b.unload === 'function') {
          sections$b.unload();
        }
      },
    };

    register('header', [header, stickyHeader, hoverDisclosure]);

    const selectors$l = {
      slider: '[data-slider-mobile]',
      slide: '[data-slide]',
      thumb: '[data-slider-thumb]',
      sliderContainer: '[data-slider-container]',
      popupContainer: '[data-popup-container]',
      popupClose: '[data-popup-close]',
    };

    const classes$e = {
      isAnimating: 'is-animating',
      isSelected: 'is-selected',
      isOpen: 'is-open',
    };

    const attributes$d = {
      thumbValue: 'data-slider-thumb',
    };

    const sections$a = {};

    class Look {
      constructor(section) {
        this.container = section.container;
        this.slider = this.container.querySelector(selectors$l.slider);
        this.slides = this.container.querySelectorAll(selectors$l.slide);
        this.thumbs = this.container.querySelectorAll(selectors$l.thumb);
        this.popupContainer = this.container.querySelector(selectors$l.popupContainer);
        this.popupClose = this.container.querySelectorAll(selectors$l.popupClose);
        this.popupCloseByEvent = this.popupCloseByEvent.bind(this);

        this.init();
      }

      init() {
        if (this.slider && this.slides.length && this.thumbs.length) {
          this.popupContainer.addEventListener('transitionend', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.remove(classes$e.isAnimating);
            if (e.target.classList.contains(classes$e.isOpen)) {
              this.popupOpenCallback();
            } else {
              this.popupCloseCallback();
            }
          });

          this.popupContainer.addEventListener('transitionstart', (e) => {
            if (e.target != this.popupContainer) return;

            this.popupContainer.classList.add(classes$e.isAnimating);
          });

          this.popupClose.forEach((button) => {
            button.addEventListener('click', () => {
              this.popupContainer.classList.remove(classes$e.isOpen);
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            });
          });

          this.thumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', (e) => {
              e.preventDefault();
              const idx = thumb.hasAttribute(attributes$d.thumbValue) && thumb.getAttribute(attributes$d.thumbValue) !== '' ? parseInt(thumb.getAttribute(attributes$d.thumbValue)) : i;
              const slide = this.slides[idx];
              if (isMobile()) {
                const parentPadding = parseInt(window.getComputedStyle(this.slider).paddingLeft);
                this.slider.scrollTo({
                  top: 0,
                  left: slide.offsetLeft - parentPadding,
                  behavior: 'auto',
                });
                document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
                this.popupContainer.classList.add(classes$e.isAnimating, classes$e.isOpen);
              } else {
                let {stickyHeaderHeight} = readHeights();
                const slideTop = slide.getBoundingClientRect().top;
                const slideHeightHalf = slide.offsetHeight / 2;
                const windowHeight = window.innerHeight;
                const windowHeightHalf = windowHeight / 2;
                const sliderContainer = this.container.querySelector(selectors$l.sliderContainer);
                let scrollTarget = slideTop + slideHeightHalf - windowHeightHalf + window.scrollY;

                if (sliderContainer) {
                  const sliderContainerTop = sliderContainer.getBoundingClientRect().top + window.scrollY;
                  const sliderContainerHeight = sliderContainer.offsetHeight;
                  const sliderContainerBottom = sliderContainerTop + sliderContainerHeight;

                  if (scrollTarget < sliderContainerTop) {
                    scrollTarget = sliderContainerTop - stickyHeaderHeight;
                  } else if (scrollTarget + windowHeight > sliderContainerBottom) {
                    scrollTarget = sliderContainerBottom - windowHeight;
                  }
                }

                window.scrollTo({
                  top: scrollTarget,
                  left: 0,
                  behavior: 'smooth',
                });
              }
            });
          });
        }
      }

      popupCloseByEvent() {
        this.popupContainer.classList.remove(classes$e.isOpen);
      }

      popupOpenCallback() {
        document.addEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.addEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }

      popupCloseCallback() {
        document.removeEventListener('theme:quick-add:open', this.popupCloseByEvent, {once: true});
        document.removeEventListener('theme:product:added', this.popupCloseByEvent, {once: true});
      }
    }

    const lookSection = {
      onLoad() {
        sections$a[this.id] = new Look(this);
      },
    };

    register('look', [lookSection]);

    function Listeners() {
      this.entries = [];
    }

    Listeners.prototype.add = function (element, event, fn) {
      this.entries.push({element: element, event: event, fn: fn});
      element.addEventListener(event, fn);
    };

    Listeners.prototype.removeAll = function () {
      this.entries = this.entries.filter(function (listener) {
        listener.element.removeEventListener(listener.event, listener.fn);
        return false;
      });
    };

    /**
     * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromSerializedArray(product, collection) {
      _validateProductStructure(product);

      // If value is an array of options
      var optionArray = _createOptionArrayFromOptionCollection(product, collection);
      return getVariantFromOptionArray(product, optionArray);
    }

    /**
     * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
     * @param {Object} product Product JSON object
     * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
     * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
     */
    function getVariantFromOptionArray(product, options) {
      _validateProductStructure(product);
      _validateOptionsArray(options);

      var result = product.variants.filter(function (variant) {
        return options.every(function (option, index) {
          return variant.options[index] === option;
        });
      });

      return result[0] || null;
    }

    /**
     * Creates an array of selected options from the object
     * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
     * @param {Object} product Product JSON object
     * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
     * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
     */
    function _createOptionArrayFromOptionCollection(product, collection) {
      _validateProductStructure(product);
      _validateSerializedArray(collection);

      var optionArray = [];

      collection.forEach(function (option) {
        for (var i = 0; i < product.options.length; i++) {
          var name = product.options[i].name || product.options[i];
          if (name.toLowerCase() === option.name.toLowerCase()) {
            optionArray[i] = option.value;
            break;
          }
        }
      });

      return optionArray;
    }

    /**
     * Check if the product data is a valid JS object
     * Error will be thrown if type is invalid
     * @param {object} product Product JSON object
     */
    function _validateProductStructure(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (Object.keys(product).length === 0 && product.constructor === Object) {
        throw new Error(product + ' is empty.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted like jQuery's serializeArray()
     * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
     */
    function _validateSerializedArray(collection) {
      if (!Array.isArray(collection)) {
        throw new TypeError(collection + ' is not an array.');
      }

      if (collection.length === 0) {
        throw new Error(collection + ' is empty.');
      }

      if (collection[0].hasOwnProperty('name')) {
        if (typeof collection[0].name !== 'string') {
          throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
        }
      } else {
        throw new Error(collection[0] + 'does not contain name key.');
      }
    }

    /**
     * Validate the structure of the array
     * It must be formatted as list of values
     * @param {Array} collection Array of object (e.g. ['36', 'Black'])
     */
    function _validateOptionsArray(options) {
      if (Array.isArray(options) && typeof options[0] === 'object') {
        throw new Error(options + 'is not a valid array of options.');
      }
    }

    var selectors$k = {
      idInput: '[name="id"]',
      planInput: '[name="selling_plan"]',
      optionInput: '[name^="options"]',
      quantityInput: '[name="quantity"]',
      propertyInput: '[name^="properties"]',
    };

    // Public Methods
    // -----------------------------------------------------------------------------

    /**
     * Returns a URL with a variant ID query parameter. Useful for updating window.history
     * with a new URL based on the currently select product variant.
     * @param {string} url - The URL you wish to append the variant ID to
     * @param {number} id  - The variant ID you wish to append to the URL
     * @returns {string} - The new url which includes the variant ID query parameter
     */

    function getUrlWithVariant(url, id) {
      if (/variant=/.test(url)) {
        return url.replace(/(variant=)[^&]+/, '$1' + id);
      } else if (/\?/.test(url)) {
        return url.concat('&variant=').concat(id);
      }

      return url.concat('?variant=').concat(id);
    }

    /**
     * Constructor class that creates a new instance of a product form controller.
     *
     * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
     * @param {Object} product - A product object
     * @param {Object} options - Optional options object
     * @param {Function} options.onOptionChange - Callback for whenever an option input changes
     * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
     * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
     * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
     * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
     */
    class ProductFormReader {
      constructor(element, product, options) {
        this.element = element;
        this.product = this._validateProductObject(product);
        this.variantElement = this.element.querySelector(selectors$k.idInput);

        options = options || {};

        this._listeners = new Listeners();
        this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

        this.optionInputs = this._initInputs(selectors$k.optionInput, options.onOptionChange);

        this.planInputs = this._initInputs(selectors$k.planInput, options.onPlanChange);

        this.quantityInputs = this._initInputs(selectors$k.quantityInput, options.onQuantityChange);

        this.propertyInputs = this._initInputs(selectors$k.propertyInput, options.onPropertyChange);
      }

      /**
       * Cleans up all event handlers that were assigned when the Product Form was constructed.
       * Useful for use when a section needs to be reloaded in the theme editor.
       */
      destroy() {
        this._listeners.removeAll();
      }

      /**
       * Getter method which returns the array of currently selected option values
       *
       * @returns {Array} An array of option values
       */
      options() {
        return this._serializeInputValues(this.optionInputs, function (item) {
          var regex = /(?:^(options\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the currently selected variant, or `null` if variant
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      variant() {
        const opts = this.options();
        if (opts.length) {
          return getVariantFromSerializedArray(this.product, opts);
        } else {
          return this.product.variants[0];
        }
      }

      /**
       * Getter method which returns the current selling plan, or `null` if plan
       * doesn't exist.
       *
       * @returns {Object|null} Variant object
       */
      plan(variant) {
        let plan = {
          allocation: null,
          group: null,
          detail: null,
        };
        const sellingPlanChecked = this.element.querySelector(`${selectors$k.planInput}:checked`);
        if (!sellingPlanChecked) return null;
        const sellingPlanCheckedValue = sellingPlanChecked.value;
        const id = sellingPlanCheckedValue && sellingPlanCheckedValue !== '' ? sellingPlanCheckedValue : null;

        if (id && variant) {
          plan.allocation = variant.selling_plan_allocations.find(function (item) {
            return item.selling_plan_id.toString() === id.toString();
          });
        }
        if (plan.allocation) {
          plan.group = this.product.selling_plan_groups.find(function (item) {
            return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
          });
        }
        if (plan.group) {
          plan.detail = plan.group.selling_plans.find(function (item) {
            return item.id.toString() === id.toString();
          });
        }

        if (plan && plan.allocation && plan.detail && plan.allocation) {
          return plan;
        } else return null;
      }

      /**
       * Getter method which returns a collection of objects containing name and values
       * of property inputs
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      properties() {
        return this._serializeInputValues(this.propertyInputs, function (item) {
          var regex = /(?:^(properties\[))(.*?)(?:\])/;
          item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
          return item;
        });
      }

      /**
       * Getter method which returns the current quantity or 1 if no quantity input is
       * included in the form
       *
       * @returns {Array} Collection of objects with name and value keys
       */
      quantity() {
        return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
      }

      getFormState() {
        const variant = this.variant();
        return {
          options: this.options(),
          variant: variant,
          properties: this.properties(),
          quantity: this.quantity(),
          plan: this.plan(variant),
        };
      }

      // Private Methods
      // -----------------------------------------------------------------------------
      _setIdInputValue(variant) {
        if (variant && variant.id) {
          this.variantElement.value = variant.id.toString();
        } else {
          this.variantElement.value = '';
        }

        this.variantElement.dispatchEvent(new Event('change'));
      }

      _onSubmit(options, event) {
        event.dataset = this.getFormState();
        if (options.onFormSubmit) {
          options.onFormSubmit(event);
        }
      }

      _onOptionChange(event) {
        this._setIdInputValue(event.dataset.variant);
      }

      _onFormEvent(cb) {
        if (typeof cb === 'undefined') {
          return Function.prototype.bind();
        }

        return function (event) {
          event.dataset = this.getFormState();
          this._setIdInputValue(event.dataset.variant);
          cb(event);
        }.bind(this);
      }

      _initInputs(selector, cb) {
        var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

        return elements.map(
          function (element) {
            this._listeners.add(element, 'change', this._onFormEvent(cb));
            return element;
          }.bind(this)
        );
      }

      _serializeInputValues(inputs, transform) {
        return inputs.reduce(function (options, input) {
          if (
            input.checked || // If input is a checked (means type radio or checkbox)
            (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
          ) {
            options.push(transform({name: input.name, value: input.value}));
          }

          return options;
        }, []);
      }

      _validateProductObject(product) {
        if (typeof product !== 'object') {
          throw new TypeError(product + ' is not an object.');
        }

        if (typeof product.variants[0].options === 'undefined') {
          throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
        }
        return product;
      }
    }

    function fetchProduct(handle) {
      const requestRoute = `${window.theme.routes.root}products/${handle}.js`;

      return window
        .fetch(requestRoute)
        .then((response) => {
          return response.json();
        })
        .catch((e) => {
          console.error(e);
        });
    }

    const selectors$j = {
      scrollbarAttribute: 'data-scrollbar',
      scrollbar: 'data-scrollbar-slider',
      scrollbarSlideFullWidth: 'data-scrollbar-slide-fullwidth',
      scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
      scrollbarArrowNext: '[data-scrollbar-arrow-next]',
    };
    const classes$d = {
      hidden: 'is-hidden',
    };

    class NativeScrollbar {
      constructor(scrollbar) {
        this.scrollbar = scrollbar;

        this.arrowNext = this.scrollbar.parentNode.querySelector(selectors$j.scrollbarArrowNext);
        this.arrowPrev = this.scrollbar.parentNode.querySelector(selectors$j.scrollbarArrowPrev);

        if (this.scrollbar.hasAttribute(selectors$j.scrollbarAttribute)) {
          this.init();
          this.listen();
        }

        if (this.scrollbar.hasAttribute(selectors$j.scrollbar)) {
          this.scrollToVisibleElement();
        }
      }

      init() {
        if (this.arrowNext && this.arrowPrev) {
          this.toggleNextArrow();

          this.events();
        }
      }

      listen() {
        document.addEventListener('theme:modal:open', () => {
          this.toggleNextArrow();
        });

        document.addEventListener('theme:resize', () => {
          this.toggleNextArrow();
        });
      }

      events() {
        this.arrowNext.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToNext();
        });

        this.arrowPrev.addEventListener('click', (event) => {
          event.preventDefault();

          this.goToPrev();
        });

        this.scrollbar.addEventListener('scroll', () => {
          this.togglePrevArrow();
          this.toggleNextArrow();
        });
      }

      goToNext() {
        const moveWith = this.scrollbar.hasAttribute(selectors$j.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
        const position = moveWith + this.scrollbar.scrollLeft;

        this.move(position);

        this.arrowPrev.classList.remove(classes$d.hidden);

        this.toggleNextArrow();
      }

      goToPrev() {
        const moveWith = this.scrollbar.hasAttribute(selectors$j.scrollbarSlideFullWidth) ? this.scrollbar.getBoundingClientRect().width : this.scrollbar.getBoundingClientRect().width / 2;
        const position = this.scrollbar.scrollLeft - moveWith;

        this.move(position);

        this.arrowNext.classList.remove(classes$d.hidden);

        this.togglePrevArrow();
      }

      toggleNextArrow() {
        requestAnimationFrame(() => {
          this.arrowNext?.classList.toggle(classes$d.hidden, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
        });
      }

      togglePrevArrow() {
        requestAnimationFrame(() => {
          this.arrowPrev.classList.toggle(classes$d.hidden, this.scrollbar.scrollLeft <= 0);
        });
      }

      scrollToVisibleElement() {
        [].forEach.call(this.scrollbar.children, (element) => {
          element.addEventListener('click', (event) => {
            event.preventDefault();

            this.move(element.offsetLeft - element.clientWidth);
          });
        });
      }

      move(offsetLeft) {
        this.scrollbar.scrollTo({
          top: 0,
          left: offsetLeft,
          behavior: 'smooth',
        });
      }
    }

    const selectors$i = {
      gridSwatchForm: '[data-grid-swatch-form]',
      input: '[data-swatch-input]',
      productItem: '[data-grid-item]',
      productInfo: '[data-product-information]',
      sectionId: '[data-section-id]',
      productImage: '[data-product-image]',
      swatchButton: '[data-swatch-button]',
      swatchLink: '[data-swatch-link]',
      swatchText: '[data-swatch-text]',
      template: '[data-swatch-template]',
    };

    const classes$c = {
      visible: 'is-visible',
      hidden: 'hidden',
      stopEvents: 'no-events',
      swatch: 'swatch',
    };

    const attributes$c = {
      image: 'data-swatch-image',
      handle: 'data-swatch-handle',
      label: 'data-swatch-label',
      scrollbar: 'data-scrollbar',
      swatchCount: 'data-swatch-count',
      tooltip: 'data-tooltip',
      variant: 'data-swatch-variant',
      variantName: 'data-swatch-variant-name',
      variantTitle: 'data-variant-title',
      swatchValues: 'data-swatch-values',
    };

    class RadioSwatch extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        if (this.hasAttribute(attributes$c.tooltip)) {
          new Tooltip(this);
        }
      }
    }

    class GridSwatch extends HTMLElement {
      constructor() {
        super();

        this.productItemMouseLeaveEvent = () => this.hideVariantImages();
        this.showVariantImageEvent = (swatchButton) => this.showVariantImage(swatchButton);
      }

      connectedCallback() {
        this.handle = this.getAttribute(attributes$c.handle);
        this.productItem = this.closest(selectors$i.productItem);
        this.productInfo = this.closest(selectors$i.productInfo);
        this.productImage = this.productItem.querySelector(selectors$i.productImage);
        this.template = document.querySelector(selectors$i.template).innerHTML;
        this.swatchesJSON = this.getSwatchesJSON();
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        const label = this.getAttribute(attributes$c.label).trim().toLowerCase();

        fetchProduct(this.handle).then((product) => {
          this.product = product;
          this.colorOption = product.options.find(function (element) {
            return element.name.toLowerCase() === label || null;
          });

          if (this.colorOption) {
            this.swatches = this.colorOption.values;
            this.init();
          }
        });
      }

      init() {
        this.innerHTML = '';
        this.count = 0;
        this.limitedCount = 0;

        this.swatches.forEach((swatch) => {
          let variant = null;
          let variantAvailable = false;
          let image = '';

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (!variant && optionWithSwatch) {
              variant = productVariant;
            }

            // Use a variant with image if exists
            if (optionWithSwatch && productVariant.featured_media) {
              image = productVariant.featured_media.preview_image.src;
              variant = productVariant;
              break;
            }
          }

          for (const productVariant of this.product.variants) {
            const optionWithSwatch = productVariant.options.includes(swatch);

            if (optionWithSwatch && productVariant.available) {
              variantAvailable = true;
              break;
            }
          }

          if (variant) {
            const swatchTemplate = document.createElement('div');
            swatchTemplate.innerHTML = this.template;
            const swatchButton = swatchTemplate.querySelector(selectors$i.swatchButton);
            const swatchLink = swatchTemplate.querySelector(selectors$i.swatchLink);
            const swatchText = swatchTemplate.querySelector(selectors$i.swatchText);
            const swatchHandle = this.swatchesJSON[swatch];
            const swatchStyle = theme.settings.swatchesType == 'native' ? swatchHandle : `var(--${swatchHandle})`;
            const variantTitle = variant.title.replaceAll('"', "'");

            swatchButton.style = `--animation-delay: ${(100 * this.count) / 1250}s`;
            swatchButton.classList.add(`${classes$c.swatch}-${swatchHandle}`);
            swatchButton.dataset.tooltip = swatch;
            swatchButton.dataset.swatchVariant = variant.id;
            swatchButton.dataset.swatchVariantName = variantTitle;
            swatchButton.dataset.swatchImage = image;
            swatchButton.dataset.variant = variant.id;
            swatchButton.style.setProperty('--swatch', swatchStyle);
            swatchLink.href = getUrlWithVariant(this.product.url, variant.id);
            swatchLink.dataset.swatch = swatch;
            swatchLink.disabled = !variantAvailable;
            swatchText.innerText = swatch;

            if (this.swatchesStyle != 'limited') {
              this.innerHTML += swatchTemplate.innerHTML;
            } else if (this.count <= 4) {
              this.innerHTML += swatchTemplate.innerHTML;
              this.limitedCount++;
            }
            this.count++;
          }
        });

        this.swatchCount = this.productInfo.querySelector(`[${attributes$c.swatchCount}]`);
        this.swatchElements = this.querySelectorAll(selectors$i.swatchLink);
        this.swatchForm = this.productInfo.querySelector(selectors$i.gridSwatchForm);
        this.hideSwatchesTimer = 0;

        if (this.swatchCount.hasAttribute(attributes$c.swatchCount)) {
          if (this.swatchesStyle == 'text' || this.swatchesStyle == 'text-slider') {
            this.swatchCount.innerText = `${this.count} ${this.count > 1 ? theme.strings.otherColor : theme.strings.oneColor}`;

            if (this.swatchesStyle == 'text') return;

            this.swatchCount.addEventListener('mouseenter', () => {
              if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

              this.productInfo.classList.add(classes$c.stopEvents);
              this.swatchForm.classList.add(classes$c.visible);
            });

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => {
              this.hideSwatchesTimer = setTimeout(() => {
                this.productInfo.classList.remove(classes$c.stopEvents);
                this.swatchForm.classList.remove(classes$c.visible);
              }, 100);
            });
          }

          if (this.swatchesStyle == 'slider' || this.swatchesStyle == 'grid') {
            this.swatchForm.classList.add(classes$c.visible);
          }

          if (this.swatchesStyle == 'limited') {
            const swatchesLeft = this.count - this.limitedCount;

            this.swatchForm.classList.add(classes$c.visible);

            if (swatchesLeft > 0) {
              this.innerHTML += `<div class="swatch-limited">+${swatchesLeft}</div>`;
            }
          }
        }

        if (this.swatchesStyle == 'text-slider' || this.swatchesStyle == 'slider') {
          if (this.hasAttribute(attributes$c.scrollbar)) {
            new NativeScrollbar(this);
          }
        }

        this.bindSwatchButtonEvents();
      }

      bindSwatchButtonEvents() {
        this.querySelectorAll(selectors$i.swatchButton)?.forEach((swatchButton) => {
          // Show variant image when hover on color swatch
          swatchButton.addEventListener('mouseenter', this.showVariantImageEvent);

          // Init Tooltips
          if (swatchButton.hasAttribute(attributes$c.tooltip)) {
            new Tooltip(swatchButton);
          }
        });

        this.productItem.addEventListener('mouseleave', this.productItemMouseLeaveEvent);
      }

      showVariantImage(event) {
        const swatchButton = event.target;
        const variantName = swatchButton.getAttribute(attributes$c.variantName)?.replaceAll('"', "'");
        const variantImages = this.productImage.querySelectorAll(`[${attributes$c.variantTitle}]`);
        const variantImageSelected = this.productImage.querySelector(`[${attributes$c.variantTitle}="${variantName}"]`);

        // Hide all variant images
        variantImages?.forEach((image) => {
          image.classList.remove(classes$c.visible);
        });

        // Show selected variant image
        variantImageSelected?.classList.add(classes$c.visible);
      }

      hideVariantImages() {
        // Hide all variant images
        this.productImage.querySelectorAll(`[${attributes$c.variantTitle}].${classes$c.visible}`)?.forEach((image) => {
          image.classList.remove(classes$c.visible);
        });
      }

      getSwatchesJSON() {
        if (!this.hasAttribute(attributes$c.swatchValues)) return {};

        // Splitting the string by commas to get individual key-value pairs
        const pairs = this.getAttribute(attributes$c.swatchValues).split(',');

        // Creating an empty object to store the key-value pairs
        const jsonObject = {};

        // Iterating through the pairs and constructing the JSON object
        pairs?.forEach((pair) => {
          const [key, value] = pair.split(':');
          jsonObject[key.trim()] = value.trim();
        });

        return jsonObject;
      }
    }

    /**
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
      if (size === null) {
        return src;
      }

      if (size === 'master') {
        return removeProtocol(src);
      }

      const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

      if (match) {
        const prefix = src.split(match[0]);
        const suffix = match[0];

        return removeProtocol(`${prefix[0]}_${size}${suffix}`);
      } else {
        return null;
      }
    }

    function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
    }

    const selectors$h = {
      productCutline: '[data-product-cutline]',
      productLink: '[data-product-link]',
      productGridItem: '[data-grid-item]',
      productInfo: '[data-product-information]',
      productImage: '[data-product-image-default]',
      productImageSibling: '[data-product-image-sibling]',
      productPrice: '[data-product-price]',
      siblingsInnerHolder: '[data-sibling-inner]',
      siblingCount: '[data-sibling-count]',
      siblingFieldset: '[data-sibling-fieldset]',
      siblingLink: '[data-sibling-link]',
      tooltip: '[data-tooltip]',
    };

    const classes$b = {
      visible: 'is-visible',
      fade: 'is-fade',
      stopEvents: 'no-events',
      active: 'is-active',
    };

    const attributes$b = {
      siblingAddedImage: 'data-sibling-added-image',
      siblingCutline: 'data-sibling-cutline',
      siblingImage: 'data-sibling-image',
      siblingLink: 'data-sibling-link',
      siblingPrice: 'data-sibling-price',
      siblingCompareAtPrice: 'data-sibling-compare-at-price',
      productLink: 'data-product-link',
    };

    class SiblingSwatches {
      constructor(swatches, product) {
        this.swatches = swatches;
        this.product = product;
        this.productLinks = this.product.querySelectorAll(selectors$h.productLink);
        this.productCutline = this.product.querySelector(selectors$h.productCutline);
        this.productPrice = this.product.querySelector(selectors$h.productPrice);
        this.productImage = this.product.querySelector(selectors$h.productImage);
        this.productImageSibling = this.product.querySelector(selectors$h.productImageSibling);

        this.init();
      }

      init() {
        this.cacheDefaultValues();

        this.product.addEventListener('mouseleave', () => this.resetProductValues());
        this.product.addEventListener('focusout', () => this.resetProductValues());

        this.swatches.forEach((swatch) => {
          swatch.addEventListener('mouseenter', (event) => this.showSibling(event));
          swatch.addEventListener('focusin', (event) => this.showSibling(event));
        });

        if (this.productLinks.length) {
          this.swatches.forEach((swatch) => {
            swatch.addEventListener('click', () => {
              this.productLinks[0].click();
            });

            swatch.addEventListener('keyup', (e) => {
              if (e.code === 'Enter') {
                this.productLinks[0].click();
              }
            });
          });
        }
      }

      cacheDefaultValues() {
        this.productLinkValue = this.productLinks[0].hasAttribute(attributes$b.productLink) ? this.productLinks[0].getAttribute(attributes$b.productLink) : '';
        this.productPriceValue = this.productPrice.innerHTML;

        if (this.productCutline) {
          this.productCutlineValue = this.productCutline.innerHTML;
        }
      }

      resetProductValues() {
        this.product.classList.remove(classes$b.active);

        if (this.productLinkValue) {
          this.productLinks.forEach((productLink) => {
            productLink.href = this.productLinkValue;
          });
        }

        if (this.productPrice) {
          this.productPrice.innerHTML = this.productPriceValue;
        }

        if (this.productCutline && this.productCutline) {
          this.productCutline.innerHTML = this.productCutlineValue;
          this.productCutline.title = this.productCutlineValue;
        }

        this.hideSiblingImage();
      }

      showSibling(event) {
        const swatch = event.target;
        const siblingLink = swatch.hasAttribute(attributes$b.siblingLink) ? swatch.getAttribute(attributes$b.siblingLink) : '';
        const siblingPrice = swatch.hasAttribute(attributes$b.siblingPrice) ? swatch.getAttribute(attributes$b.siblingPrice) : '';
        const siblingCompareAtPrice = swatch.hasAttribute(attributes$b.siblingCompareAtPrice) ? swatch.getAttribute(attributes$b.siblingCompareAtPrice) : '';
        const siblingCutline = swatch.hasAttribute(attributes$b.siblingCutline) ? swatch.getAttribute(attributes$b.siblingCutline) : '';
        const siblingImage = swatch.hasAttribute(attributes$b.siblingImage) ? swatch.getAttribute(attributes$b.siblingImage) : '';

        if (siblingLink) {
          this.productLinks.forEach((productLink) => {
            productLink.href = siblingLink;
          });
        }

        if (siblingCompareAtPrice) {
          this.productPrice.innerHTML = `<span class="price sale"><span class="new-price">${siblingPrice}</span> <span class="old-price">${siblingCompareAtPrice}</span></span>`;
        } else {
          this.productPrice.innerHTML = `<span class="price">${siblingPrice}</span>`;
        }

        if (this.productCutline) {
          if (siblingCutline) {
            this.productCutline.innerHTML = siblingCutline;
            this.productCutline.title = siblingCutline;
          } else {
            this.productCutline.innerHTML = '';
            this.productCutline.title = '';
          }
        }

        if (siblingImage) {
          this.showSiblingImage(siblingImage);
        }
      }

      showSiblingImage(siblingImage) {
        if (!this.productImageSibling) return;

        // Add current sibling swatch image to PGI image
        const ratio = window.devicePixelRatio || 1;
        const pixels = this.productImage.offsetWidth * ratio;
        const widthRounded = Math.ceil(pixels / 180) * 180;
        const imageSrc = getSizedImageUrl(siblingImage, `${widthRounded}x`);
        const imageExists = this.productImageSibling.querySelector(`[src="${imageSrc}"]`);
        const showCurrentImage = () => {
          this.productImageSibling.classList.add(classes$b.visible);
          this.productImageSibling.querySelector(`[src="${imageSrc}"]`).classList.add(classes$b.fade);
        };
        const swapImages = () => {
          this.productImageSibling.querySelectorAll('img').forEach((image) => {
            image.classList.remove(classes$b.fade);
          });
          requestAnimationFrame(showCurrentImage);
        };

        if (imageExists) {
          swapImages();
        } else {
          const imageTag = document.createElement('img');

          imageTag.src = imageSrc;

          if (this.productCutline) {
            imageTag.alt = this.productCutline.innerText;
          }

          imageTag.addEventListener('load', () => {
            this.productImageSibling.append(imageTag);

            swapImages();
          });
        }
      }

      hideSiblingImage() {
        if (!this.productImageSibling) return;

        this.productImageSibling.classList.remove(classes$b.visible);
        this.productImageSibling.querySelectorAll('img').forEach((image) => {
          image.classList.remove(classes$b.fade);
        });
      }
    }

    class ProductSiblings extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.product = this.closest(selectors$h.productGridItem);
        this.siblingScrollbar = this.querySelector(selectors$h.siblingsInnerHolder);
        this.siblingCount = this.querySelector(selectors$h.siblingCount);
        this.siblingFieldset = this.querySelector(selectors$h.siblingFieldset);
        this.siblingLinks = this.querySelectorAll(selectors$h.siblingLink);
        this.productInfo = this.closest(selectors$h.productInfo);
        this.productLink = this.closest(selectors$h.link);
        this.hideSwatchesTimer = 0;
        this.swatchesStyle = theme.settings.collectionSwatchStyle;

        this.initScrollbar();

        if (this.siblingFieldset && this.productInfo) {
          if (this.swatchesStyle == 'grid' || this.swatchesStyle == 'slider' || this.swatchesStyle == 'limited') {
            this.siblingFieldset.classList.add(classes$b.visible);
          }

          if (this.siblingCount) {
            this.siblingCount.addEventListener('mouseenter', () => this.showSiblings());

            // Prevent color swatches blinking on mouse move
            this.productInfo.addEventListener('mouseleave', () => this.hideSiblings());
          }
        }

        if (this.siblingLinks.length) {
          new SiblingSwatches(this.siblingLinks, this.product);
        }

        // Init Tooltips
        this.querySelectorAll(selectors$h.tooltip).forEach((tooltip) => {
          new Tooltip(tooltip);
        });
      }

      showSiblings() {
        if (this.hideSwatchesTimer) clearTimeout(this.hideSwatchesTimer);

        if (this.productLink) {
          this.productLink.classList.add(classes$b.stopEvents);
        }

        if (this.swatchesStyle == 'text') return;

        this.siblingFieldset.classList.add(classes$b.visible);
      }

      hideSiblings() {
        this.hideSwatchesTimer = setTimeout(() => {
          if (this.productLink) {
            this.productLink.classList.remove(classes$b.stopEvents);
          }

          this.siblingFieldset.classList.remove(classes$b.visible);
        }, 100);
      }

      initScrollbar() {
        if (this.siblingScrollbar) {
          new NativeScrollbar(this.siblingScrollbar);
        }
      }
    }

    const selectors$g = {
      slide: '[data-hover-slide]',
      slideTouch: '[data-hover-slide-touch]',
      slider: '[data-hover-slider]',
      productLink: '[data-product-link]',
      flickityButton: '.flickity-prev-next-button',
    };

    class HoverImages extends HTMLElement {
      constructor() {
        super();

        this.flkty = null;
        this.slider = this.querySelector(selectors$g.slider);
        this.handleScroll = this.handleScroll.bind(this);
      }

      connectedCallback() {
        if (window.theme.touch) {
          this.initTouch();
        } else {
          this.initFlickity();
        }
      }

      disconnectedCallback() {
        if (this.flkty) {
          this.flkty.options.watchCSS = false;
          this.flkty.destroy();
        }
      }

      initTouch() {
        this.style.setProperty('--slides-count', this.querySelectorAll(selectors$g.slideTouch).length);
        this.slider.addEventListener('scroll', this.handleScroll);
      }

      handleScroll() {
        const slideIndex = this.slider.scrollLeft / this.slider.clientWidth;
        this.style.setProperty('--slider-index', slideIndex);
      }

      initFlickity() {
        if (this.querySelectorAll(selectors$g.slide).length < 2) return;

        this.flkty = new Flickity(this.slider, {
          cellSelector: selectors$g.slide,
          contain: true,
          wrapAround: true,
          watchCSS: true,
          autoPlay: false,
          draggable: false,
          pageDots: false,
          prevNextButtons: true,
        });

        this.flkty.pausePlayer();

        this.addEventListener('mouseenter', () => {
          this.flkty.unpausePlayer();
        });

        this.addEventListener('mouseleave', () => {
          this.flkty.pausePlayer();
        });

        // Prevent page redirect on Flickity arrow click
        this.closest(selectors$g.productLink).addEventListener('click', (e) => {
          if (e.target.matches(selectors$g.flickityButton)) {
            e.preventDefault();
          }
        });
      }
    }

    const selectors$f = {
      body: 'body',
      dataRelatedSectionElem: '[data-related-section]',
      dataTabsHolder: '[data-tabs-holder]',
      dataTab: 'data-tab',
      dataTabIndex: 'data-tab-index',
      dataAos: '[data-aos]',
      blockId: 'data-block-id',
      tabsLi: '[data-tab]',
      tabLink: '.tab-link',
      tabLinkRecent: '.tab-link__recent',
      tabContent: '.tab-content',
      scrollbarHolder: '[data-scrollbar]',
    };

    const classes$a = {
      current: 'current',
      hidden: 'hidden',
      aosAnimate: 'aos-animate',
      aosNoTransition: 'aos-no-transition',
      focused: 'is-focused',
    };

    const sections$9 = {};

    class GlobalTabs {
      constructor(holder) {
        this.container = holder;
        this.body = document.querySelector(selectors$f.body);
        this.a11y = window.a11y;

        if (this.container) {
          this.scrollbarHolder = this.container.querySelectorAll(selectors$f.scrollbarHolder);

          this.init();

          // Init native scrollbar
          this.initNativeScrollbar();
        }
      }

      init() {
        const tabsNavList = this.container.querySelectorAll(selectors$f.tabsLi);

        this.container.addEventListener('theme:tab:check', () => this.checkRecentTab());
        this.container.addEventListener('theme:tab:hide', () => this.hideRelatedTab());

        if (tabsNavList.length) {
          tabsNavList.forEach((element) => {
            const tabId = parseInt(element.getAttribute(selectors$f.dataTab));
            const tab = this.container.querySelector(`${selectors$f.tabContent}-${tabId}`);

            element.addEventListener('click', () => {
              this.tabChange(element, tab);
            });

            element.addEventListener('keyup', (event) => {
              if ((event.code === 'Space' || event.code === 'Enter') && this.body.classList.contains(classes$a.focused)) {
                this.tabChange(element, tab);
              }
            });
          });
        }
      }

      tabChange(element, tab) {
        if (element.classList.contains(classes$a.current)) {
          return;
        }

        const currentTab = this.container.querySelector(`${selectors$f.tabsLi}.${classes$a.current}`);
        const currentTabContent = this.container.querySelector(`${selectors$f.tabContent}.${classes$a.current}`);

        currentTab?.classList.remove(classes$a.current);
        currentTabContent?.classList.remove(classes$a.current);

        element.classList.add(classes$a.current);
        tab.classList.add(classes$a.current);

        if (element.classList.contains(classes$a.hidden)) {
          tab.classList.add(classes$a.hidden);
        }

        this.a11y.a11y.removeTrapFocus();

        this.container.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: true}));

        element.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'tab',
            },
          })
        );

        this.animateItems(tab);
      }

      animateItems(tab, animated = true) {
        const animatedItems = tab.querySelectorAll(selectors$f.dataAos);

        if (animatedItems.length) {
          animatedItems.forEach((animatedItem) => {
            animatedItem.classList.remove(classes$a.aosAnimate);

            if (animated) {
              animatedItem.classList.add(classes$a.aosNoTransition);

              requestAnimationFrame(() => {
                animatedItem.classList.remove(classes$a.aosNoTransition);
                animatedItem.classList.add(classes$a.aosAnimate);
              });
            }
          });
        }
      }

      initNativeScrollbar() {
        if (this.scrollbarHolder.length) {
          this.scrollbarHolder.forEach((scrollbar) => {
            new NativeScrollbar(scrollbar);
          });
        }
      }

      checkRecentTab() {
        const tabLink = this.container.querySelector(selectors$f.tabLinkRecent);

        if (tabLink) {
          tabLink.classList.remove(classes$a.hidden);
          const tabLinkIdx = parseInt(tabLink.getAttribute(selectors$f.dataTab));
          const tabContent = this.container.querySelector(`${selectors$f.tabContent}[${selectors$f.dataTabIndex}="${tabLinkIdx}"]`);

          if (tabContent) {
            tabContent.classList.remove(classes$a.hidden);

            this.animateItems(tabContent, false);
          }

          this.initNativeScrollbar();
        }
      }

      hideRelatedTab() {
        const relatedSection = this.container.querySelector(selectors$f.dataRelatedSectionElem);
        if (!relatedSection) {
          return;
        }

        const parentTabContent = relatedSection.closest(`${selectors$f.tabContent}.${classes$a.current}`);
        if (!parentTabContent) {
          return;
        }
        const parentTabContentIdx = parseInt(parentTabContent.getAttribute(selectors$f.dataTabIndex));
        const tabsNavList = this.container.querySelectorAll(selectors$f.tabsLi);

        if (tabsNavList.length > parentTabContentIdx) {
          const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

          if (nextTabsNavLink) {
            tabsNavList[parentTabContentIdx].classList.add(classes$a.hidden);
            nextTabsNavLink.dispatchEvent(new Event('click'));
            this.initNativeScrollbar();
          }
        }
      }

      onBlockSelect(evt) {
        const element = this.container.querySelector(`${selectors$f.tabLink}[${selectors$f.blockId}="${evt.detail.blockId}"]`);
        if (element) {
          element.dispatchEvent(new Event('click'));

          element.parentNode.scrollTo({
            top: 0,
            left: element.offsetLeft - element.clientWidth,
            behavior: 'smooth',
          });
        }
      }
    }

    const tabs = {
      onLoad() {
        sections$9[this.id] = [];
        const tabHolders = this.container.querySelectorAll(selectors$f.dataTabsHolder);

        tabHolders.forEach((holder) => {
          sections$9[this.id].push(new GlobalTabs(holder));
        });
      },
      onBlockSelect(e) {
        sections$9[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(e);
          }
        });
      },
    };

    /*
      Observe whether or not there are open modals that require scroll lock
    */

    function hasOpenModals() {
      const openModals = Boolean(document.querySelectorAll('dialog[open][data-scroll-lock-required]').length);
      const openDrawers = Boolean(document.querySelectorAll('.drawer.is-open').length);

      return openModals || openDrawers;
    }

    const classes$9 = {
      added: 'is-added',
      animated: 'is-animated',
      disabled: 'is-disabled',
      error: 'has-error',
      loading: 'is-loading',
      open: 'is-open',
      overlayText: 'product-item--overlay-text',
      visible: 'is-visible',
      siblingLinkCurrent: 'sibling__link--current',
    };

    const settings = {
      errorDelay: 3000,
    };

    const selectors$e = {
      animation: '[data-animation]',
      apiContent: '[data-api-content]',
      buttonQuickAdd: '[data-quick-add-btn]',
      buttonAddToCart: '[data-add-to-cart]',
      cartDrawer: 'cart-drawer',
      cartPage: '[data-cart-page]',
      cartLineItems: '[data-line-items]',
      dialog: 'dialog',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      messageError: '[data-message-error]',
      modalButton: '[data-quick-add-modal-handle]',
      modalContainer: '[data-product-upsell-container]',
      modalContent: '[data-product-upsell-ajax]',
      modalClose: '[data-quick-add-modal-close]',
      productGridItem: 'data-grid-item',
      productInformationHolder: '[data-product-information]',
      quickAddHolder: '[data-quick-add-holder]',
      quickAddModal: '[data-quick-add-modal]',
      quickAddModalTemplate: '[data-quick-add-modal-template]',
      tooltip: '[data-tooltip]',
    };

    const attributes$a = {
      closing: 'closing',
      productId: 'data-product-id',
      modalHandle: 'data-quick-add-modal-handle',
      siblingSwapper: 'data-sibling-swapper',
      quickAddHolder: 'data-quick-add-holder',
    };

    class QuickAddProduct extends HTMLElement {
      constructor() {
        super();

        this.container = this;
        this.quickAddHolder = this.container.querySelector(selectors$e.quickAddHolder);

        if (this.quickAddHolder) {
          this.modal = null;
          this.currentModal = null;
          this.productId = this.quickAddHolder.getAttribute(attributes$a.quickAddHolder);
          this.modalButton = this.quickAddHolder.querySelector(selectors$e.modalButton);
          this.handle = this.modalButton?.getAttribute(attributes$a.modalHandle);
          this.buttonQuickAdd = this.quickAddHolder.querySelector(selectors$e.buttonQuickAdd);
          this.buttonATC = this.quickAddHolder.querySelector(selectors$e.buttonAddToCart);
          this.button = this.modalButton || this.buttonATC;
          this.modalClose = this.modalClose.bind(this);
          this.modalCloseOnProductAdded = this.modalCloseOnProductAdded.bind(this);
          this.a11y = a11y;
          this.isAnimating = false;

          this.modalButtonClickEvent = this.modalButtonClickEvent.bind(this);
          this.quickAddLoadingToggle = this.quickAddLoadingToggle.bind(this);
        }
      }

      connectedCallback() {
        /**
         * Modal button works for multiple variants products
         */
        if (this.modalButton) {
          this.modalButton.addEventListener('click', this.modalButtonClickEvent);
        }

        /**
         * Quick add button works for single variant products
         */
        if (this.buttonATC) {
          this.buttonATC.addEventListener('click', (e) => {
            e.preventDefault();

            window.a11y.lastElement = this.buttonATC;

            document.dispatchEvent(
              new CustomEvent('theme:cart:add', {
                detail: {
                  button: this.buttonATC,
                },
              })
            );
          });
        }

        if (this.quickAddHolder) {
          this.quickAddHolder.addEventListener('animationend', this.quickAddLoadingToggle);
          this.errorHandler();
        }
      }

      modalButtonClickEvent(e) {
        e.preventDefault();

        const isSiblingSwapper = this.modalButton.hasAttribute(attributes$a.siblingSwapper);
        const isSiblingLinkCurrent = this.modalButton.classList.contains(classes$9.siblingLinkCurrent);

        if (isSiblingLinkCurrent) return;

        this.modalButton.classList.add(classes$9.loading);
        this.modalButton.disabled = true;

        // Siblings product modal swapper
        if (isSiblingSwapper && !isSiblingLinkCurrent) {
          this.currentModal = e.target.closest(selectors$e.quickAddModal);
          this.currentModal.classList.add(classes$9.loading);
        }

        this.renderModal();
      }

      modalCreate(response) {
        const cachedModal = document.querySelector(`${selectors$e.quickAddModal}[${attributes$a.productId}="${this.productId}"]`);

        if (cachedModal) {
          this.modal = cachedModal;
          this.modalOpen();
        } else {
          const modalTemplate = this.quickAddHolder.querySelector(selectors$e.quickAddModalTemplate);
          if (!modalTemplate) return;

          const htmlObject = document.createElement('div');
          htmlObject.innerHTML = modalTemplate.innerHTML;

          // Add dialog to the body
          document.body.appendChild(htmlObject.querySelector(selectors$e.quickAddModal));
          modalTemplate.remove();

          this.modal = document.querySelector(`${selectors$e.quickAddModal}[${attributes$a.productId}="${this.productId}"]`);
          this.modal.querySelector(selectors$e.modalContent).innerHTML = new DOMParser().parseFromString(response, 'text/html').querySelector(selectors$e.apiContent).innerHTML;

          // Init Tooltips
          this.modal.querySelectorAll(selectors$e.tooltip).forEach((tooltip) => {
            new Tooltip(tooltip);
          });

          this.modalCreatedCallback();
        }
      }

      modalOpen() {
        if (this.currentModal) {
          this.currentModal.dispatchEvent(new CustomEvent('theme:modal:close', {bubbles: false}));
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.show === 'function') {
          this.modal.show();
        }

        this.modal.setAttribute('open', true);
        this.modal.removeAttribute('inert');

        this.quickAddHolder.classList.add(classes$9.disabled);

        if (this.modalButton) {
          this.modalButton.classList.remove(classes$9.loading);
          this.modalButton.disabled = false;
          window.a11y.lastElement = this.modalButton;
        }

        // Animate items
        requestAnimationFrame(() => {
          this.modal.querySelectorAll(selectors$e.animation).forEach((item) => {
            item.classList.add(classes$9.animated);
          });
        });

        document.dispatchEvent(new CustomEvent('theme:quick-add:open', {bubbles: true}));
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        document.addEventListener('theme:product:added', this.modalCloseOnProductAdded, {once: true});
      }

      modalClose() {
        if (this.isAnimating) {
          return;
        }

        if (!this.modal.hasAttribute(attributes$a.closing)) {
          this.modal.setAttribute(attributes$a.closing, '');
          this.isAnimating = true;
          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.modal.close === 'function') {
          this.modal.close();
        } else {
          this.modal.removeAttribute('open');
        }

        this.modal.removeAttribute(attributes$a.closing);
        this.modal.setAttribute('inert', '');
        this.modal.classList.remove(classes$9.loading);

        if (this.modalButton) {
          this.modalButton.disabled = false;
        }

        if (this.quickAddHolder && this.quickAddHolder.classList.contains(classes$9.disabled)) {
          this.quickAddHolder.classList.remove(classes$9.disabled);
        }

        this.resetAnimatedItems();

        // Unlock scroll if no other drawers & modals are open
        if (!hasOpenModals()) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        document.removeEventListener('theme:product:added', this.modalCloseOnProductAdded);

        this.a11y.removeTrapFocus();
        this.a11y.autoFocusLastElement();
      }

      modalEvents() {
        // Close button click event
        this.modal.querySelector(selectors$e.modalClose)?.addEventListener('click', (e) => {
          e.preventDefault();
          this.modalClose();
        });

        // Close dialog on click outside content
        this.modal.addEventListener('click', (event) => {
          if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
            this.modalClose();
          }
        });

        // Close dialog on click ESC key pressed
        this.modal.addEventListener('keydown', (event) => {
          if (event.code == 'Escape') {
            event.preventDefault();
            this.modalClose();
          }
        });

        this.modal.addEventListener('theme:modal:close', () => {
          this.modalClose();
        });

        // Close dialog after animation completes
        this.modal.addEventListener('animationend', (event) => {
          if (event.target !== this.modal) return;
          this.isAnimating = false;

          if (this.modal.hasAttribute(attributes$a.closing)) {
            this.modalClose();
          } else {
            setTimeout(() => {
              this.a11y.trapFocus(this.modal);
              const focusTarget = this.modal.querySelector('[autofocus]') || this.modal.querySelector(selectors$e.focusable);
              focusTarget?.focus();
            }, 50);
          }
        });
      }

      modalCloseOnProductAdded() {
        this.resetQuickAddButtons();
        if (this.modal && this.modal.hasAttribute('open')) {
          this.modalClose();
        }
      }

      quickAddLoadingToggle(e) {
        if (e.target != this.quickAddHolder) return;

        this.quickAddHolder.classList.remove(classes$9.disabled);
      }

      /**
       * Handle error cart response
       */
      errorHandler() {
        this.quickAddHolder.addEventListener('theme:cart:error', (event) => {
          const holder = event.detail.holder;
          const parentProduct = holder.closest(`[${selectors$e.productGridItem}]`);
          if (!parentProduct) return;

          const errorMessageHolder = holder.querySelector(selectors$e.messageError);
          const hasOverlayText = parentProduct.classList.contains(classes$9.overlayText);
          const productInfo = parentProduct.querySelector(selectors$e.productInformationHolder);
          const button = holder.querySelector(selectors$e.buttonAddToCart);

          if (button) {
            button.classList.remove(classes$9.added, classes$9.loading);
            holder.classList.add(classes$9.error);
          }

          if (errorMessageHolder) {
            errorMessageHolder.innerText = event.detail.description;
          }

          if (hasOverlayText) {
            productInfo.classList.add(classes$9.hidden);
          }

          setTimeout(() => {
            this.resetQuickAddButtons();

            if (hasOverlayText) {
              productInfo.classList.remove(classes$9.hidden);
            }
          }, settings.errorDelay);
        });
      }

      /**
       * Reset buttons to default states
       */
      resetQuickAddButtons() {
        if (this.quickAddHolder) {
          this.quickAddHolder.classList.remove(classes$9.visible, classes$9.error);
        }

        if (this.buttonQuickAdd) {
          this.buttonQuickAdd.classList.remove(classes$9.added);
          this.buttonQuickAdd.disabled = false;
        }
      }

      renderModal() {
        if (this.modal) {
          this.modalOpen();
        } else {
          window
            .fetch(`${window.theme.routes.root}products/${this.handle}?section_id=api-product-upsell`)
            .then(this.upsellErrorsHandler)
            .then((response) => {
              return response.text();
            })
            .then((response) => {
              this.modalCreate(response);
            });
        }
      }

      modalCreatedCallback() {
        this.modalEvents();
        this.modalOpen();

        wrapElements(this.modal);
      }

      upsellErrorsHandler(response) {
        if (!response.ok) {
          return response.json().then(function (json) {
            const e = new FetchError({
              status: response.statusText,
              headers: response.headers,
              json: json,
            });
            throw e;
          });
        }
        return response;
      }

      resetAnimatedItems() {
        this.modal?.querySelectorAll(selectors$e.animation).forEach((item) => {
          item.classList.remove(classes$9.animated);
        });
      }
    }

    register('product-grid', [tabs]);

    if (!customElements.get('quick-add-product')) {
      customElements.define('quick-add-product', QuickAddProduct);
    }

    if (!customElements.get('radio-swatch')) {
      customElements.define('radio-swatch', RadioSwatch);
    }

    if (!customElements.get('grid-swatch')) {
      customElements.define('grid-swatch', GridSwatch);
    }

    if (!customElements.get('product-siblings')) {
      customElements.define('product-siblings', ProductSiblings);
    }

    if (!customElements.get('hover-images')) {
      customElements.define('hover-images', HoverImages);
    }

    const selectors$d = {
      productPage: '.product__page',
      formWrapper: '[data-form-wrapper]',
      headerSticky: '[data-header-sticky]',
      productMediaList: '[data-product-media-list]',
    };

    const classes$8 = {
      sticky: 'is-sticky',
    };

    const attributes$9 = {
      stickyEnabled: 'data-sticky-enabled',
    };

    window.theme.variables = {
      productPageSticky: false,
    };

    const sections$8 = {};

    class ProductSticky {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.stickyEnabled = this.container.getAttribute(attributes$9.stickyEnabled) === 'true';
        this.formWrapper = this.container.querySelector(selectors$d.formWrapper);
        this.stickyScrollTop = 0;
        this.scrollLastPosition = 0;
        this.stickyDefaultTop = 0;
        this.currentPoint = 0;
        this.defaultTopBottomSpacings = 30;
        this.scrollTop = window.scrollY;
        this.scrollDirectionDown = true;
        this.requestAnimationSticky = null;
        this.stickyFormLoad = true;
        this.stickyFormLastHeight = null;
        this.onChangeCounter = 0;
        this.scrollEvent = (e) => this.scrollEvents(e);
        this.resizeEvent = (e) => this.resizeEvents(e);
        this.stickyFormEvent = (e) => this.stickyFormEvents(e);

        // The code should execute after truncate text in product.js - 50ms
        setTimeout(() => {
          this.init();
        }, 50);
      }

      init() {
        if (this.stickyEnabled) {
          this.stickyScrollCheck();

          document.addEventListener('theme:resize', this.resizeEvent);
        }

        this.initSticky();
      }

      initSticky() {
        if (theme.variables.productPageSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

          this.formWrapper.addEventListener('theme:form:sticky', this.stickyFormEvent);

          document.addEventListener('theme:scroll', this.scrollEvent);
        }
      }

      stickyFormEvents(e) {
        this.removeAnimationFrameSticky();

        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
      }

      scrollEvents(e) {
        this.scrollTop = e.detail.position;
        this.scrollDirectionDown = e.detail.down;

        if (!this.requestAnimationSticky) {
          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
        }
      }

      resizeEvents(e) {
        this.stickyScrollCheck();

        document.removeEventListener('theme:scroll', this.scrollEvent);

        this.formWrapper.removeEventListener('theme:form:sticky', this.stickyFormEvent);

        this.initSticky();
      }

      stickyScrollCheck() {
        const targetFormWrapper = this.container.querySelector(`${selectors$d.productPage} ${selectors$d.formWrapper}`);

        if (!targetFormWrapper) return;

        if (isDesktop()) {
          const form = this.container.querySelector(selectors$d.formWrapper);
          const productMediaList = this.container.querySelector(selectors$d.productMediaList);

          if (!form || !productMediaList) return;

          const productCopyHeight = form.offsetHeight;
          const productImagesHeight = productMediaList.offsetHeight;

          // Is the product description and form taller than window space
          // Is also shorter than the window and images
          if (productCopyHeight < productImagesHeight) {
            theme.variables.productPageSticky = true;
            targetFormWrapper.classList.add(classes$8.sticky);
          } else {
            theme.variables.productPageSticky = false;
            targetFormWrapper.classList.remove(classes$8.sticky);
          }
        } else {
          theme.variables.productPageSticky = false;
          targetFormWrapper.classList.remove(classes$8.sticky);
        }
      }

      calculateStickyPosition(e = null) {
        const isScrollLocked = document.documentElement.hasAttribute('data-scroll-locked');
        if (isScrollLocked) {
          this.removeAnimationFrameSticky();
          return;
        }

        const eventExist = Boolean(e && e.detail);
        const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
        const formWrapperHeight = this.formWrapper.offsetHeight;
        const heightDifference = window.innerHeight - formWrapperHeight - this.defaultTopBottomSpacings;
        const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

        if (this.scrollDirectionDown) {
          this.stickyScrollTop -= scrollDifference;
        } else {
          this.stickyScrollTop += scrollDifference;
        }

        if (this.stickyFormLoad) {
          if (document.querySelector(selectors$d.headerSticky)) {
            let {headerHeight} = readHeights();
            this.stickyDefaultTop = headerHeight;
          } else {
            this.stickyDefaultTop = this.defaultTopBottomSpacings;
          }

          this.stickyScrollTop = this.stickyDefaultTop;
        }

        this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

        const differencePoint = this.stickyScrollTop - this.currentPoint;
        this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

        this.formWrapper.style.setProperty('--sticky-top', `${this.currentPoint}px`);

        this.scrollLastPosition = this.scrollTop;
        this.stickyFormLoad = false;

        if (
          (isAccordion && this.onChangeCounter <= 10) ||
          (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) ||
          (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
        ) {
          if (isAccordion) {
            this.onChangeCounter += 1;
          }

          if (isAccordion && this.stickyFormLastHeight !== formWrapperHeight) {
            this.onChangeCounter = 11;
          }

          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
        } else if (this.requestAnimationSticky) {
          this.removeAnimationFrameSticky();
        }

        this.stickyFormLastHeight = formWrapperHeight;
      }

      removeAnimationFrameSticky() {
        if (this.requestAnimationSticky) {
          cancelAnimationFrame(this.requestAnimationSticky);
          this.requestAnimationSticky = null;
          this.onChangeCounter = 0;
        }
      }

      onUnload() {
        if (this.stickyEnabled) {
          document.removeEventListener('theme:resize', this.resizeEvent);
        }

        if (theme.variables.productPageSticky) {
          document.removeEventListener('theme:scroll', this.scrollEvent);
        }
      }
    }

    const productStickySection = {
      onLoad() {
        sections$8[this.id] = new ProductSticky(this);
      },
      onUnload() {
        sections$8[this.id].onUnload();
      },
    };

    const selectors$c = {
      optionPosition: 'data-option-position',
      optionInput: '[name^="options"], [data-popout-option]',
      optionInputCurrent: '[name^="options"]:checked, [name^="options"][type="hidden"]',
      selectOptionValue: 'data-value',
      popout: '[data-popout]',
    };

    const classes$7 = {
      soldOut: 'sold-out',
      unavailable: 'unavailable',
      sale: 'sale',
    };

    /**
     * Variant Sellout Precrime Click Preview
     * I think of this like the precrime machine in Minority report.  It gives a preview
     * of every possible click action, given the current form state.  The logic is:
     *
     * for each clickable name=options[] variant selection element
     * find the value of the form if the element were clicked
     * lookup the variant with those value in the product json
     * clear the classes, add .unavailable if it's not found,
     * and add .sold-out if it is out of stock
     *
     * Caveat: we rely on the option position so we don't need
     * to keep a complex map of keys and values.
     */

    class SelloutVariants {
      constructor(section, productJSON) {
        this.container = section;
        this.productJSON = productJSON;
        this.optionElements = this.container.querySelectorAll(selectors$c.optionInput);

        if (this.productJSON && this.optionElements.length) {
          this.init();
        }
      }

      init() {
        this.update();
      }

      update() {
        this.getCurrentState();

        this.optionElements.forEach((el) => {
          const parent = el.closest(`[${selectors$c.optionPosition}]`);
          if (!parent) return;
          const val = el.value || el.getAttribute(selectors$c.selectOptionValue);
          const positionString = parent.getAttribute(selectors$c.optionPosition);
          // subtract one because option.position in liquid does not count form zero, but JS arrays do
          const position = parseInt(positionString, 10) - 1;
          const selectPopout = el.closest(selectors$c.popout);

          let newVals = [...this.selections];
          newVals[position] = val;

          const found = this.productJSON.variants.find((element) => {
            // only return true if every option matches our hypothetical selection
            let perfectMatch = true;
            for (let index = 0; index < newVals.length; index++) {
              if (element.options[index] !== newVals[index]) {
                perfectMatch = false;
              }
            }
            return perfectMatch;
          });

          el.classList.remove(classes$7.soldOut, classes$7.unavailable);
          el.parentNode.classList.remove(classes$7.sale);

          if (selectPopout) {
            selectPopout.classList.remove(classes$7.soldOut, classes$7.unavailable, classes$7.sale);
          }

          if (typeof found === 'undefined') {
            el.classList.add(classes$7.unavailable);

            if (selectPopout) {
              selectPopout.classList.add(classes$7.unavailable);
            }
          } else if (found && found.available === false) {
            el.classList.add(classes$7.soldOut);

            if (selectPopout) {
              selectPopout.classList.add(classes$7.soldOut);
            }
          }

          if (found && found.compare_at_price > found.price && theme.settings.variantOnSale) {
            el.parentNode.classList.add(classes$7.sale);
          }
        });
      }

      getCurrentState() {
        this.selections = [];

        const options = this.container.querySelectorAll(selectors$c.optionInputCurrent);
        if (options.length) {
          options.forEach((element) => {
            const elemValue = element.value;
            if (elemValue && elemValue !== '') {
              this.selections.push(elemValue);
            }
          });
        }
      }
    }

    const selectors$b = {
      product: '[data-product]',
      productForm: '[data-product-form]',
      productNotification: 'product-notification',
      variantTitle: '[data-variant-title]',
      notificationProduct: '[data-notification-product]',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      cartPage: '[data-cart-page]',
      comparePrice: '[data-compare-price]',
      comparePriceText: '[data-compare-text]',
      finalSaleBadge: '[data-final-sale-badge]',
      formWrapper: '[data-form-wrapper]',
      originalSelectorId: '[data-product-select]',
      priceWrapper: '[data-price-wrapper]',
      productImages: 'product-images',
      productImage: '[data-product-image]',
      productMediaList: '[data-product-media-list]',
      productJson: '[data-product-json]',
      productPrice: '[data-product-price]',
      unitPrice: '[data-product-unit-price]',
      unitBase: '[data-product-base]',
      unitWrapper: '[data-product-unit]',
      isPreOrder: '[data-product-preorder]',
      productSlide: '.product__slide',
      subPrices: '[data-subscription-watch-price]',
      subSelectors: '[data-subscription-selectors]',
      subsToggle: '[data-toggles-group]',
      subsChild: 'data-group-toggle',
      subDescription: '[data-plan-description]',
      section: '[data-section-type]',
      variantSku: '[data-variant-sku]',
      variantFinalSaleMeta: '[data-variant-final-sale-metafield]',
      variantButtons: '[data-variant-buttons]',
      variantOptionImage: '[data-variant-option-image]',
      quickAddModal: '[data-quick-add-modal]',
      priceOffAmount: '[data-price-off-amount]',
      priceOffBadge: '[data-price-off-badge]',
      priceOffType: '[data-price-off-type]',
      priceOffWrap: '[data-price-off]',
      remainingCount: '[data-remaining-count]',
      remainingMax: '[data-remaining-max]',
      remainingWrapper: '[data-remaining-wrapper]',
      remainingJSON: '[data-product-remaining-json]',
      optionValue: '[data-option-value]',
      optionPosition: '[data-option-position]',
      installment: '[data-product-form-installment]',
      inputId: 'input[name="id"]',
    };

    const classes$6 = {
      hidden: 'hidden',
      variantSoldOut: 'variant--soldout',
      variantUnavailable: 'variant--unavailable',
      productPriceSale: 'product__price--sale',
      remainingLow: 'count-is-low',
      remainingIn: 'count-is-in',
      remainingOut: 'count-is-out',
      remainingUnavailable: 'count-is-unavailable',
    };

    const attributes$8 = {
      remainingMaxAttr: 'data-remaining-max',
      enableHistoryState: 'data-enable-history-state',
      notificationPopup: 'data-notification-popup',
      faderDesktop: 'data-fader-desktop',
      faderMobile: 'data-fader-mobile',
      optionPosition: 'data-option-position',
      imageId: 'data-image-id',
      mediaId: 'data-media-id',
      quickAddButton: 'data-quick-add-btn',
      finalSale: 'data-final-sale',
      variantImageScroll: 'data-variant-image-scroll',
    };

    class ProductForm extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.cartAddEvents();

        this.container = this.closest(selectors$b.section) || this.closest(selectors$b.quickAddModal);
        if (!this.container) return;

        this.sectionId = this.container.dataset.sectionId;
        this.product = this.container.querySelector(selectors$b.product);
        this.productForm = this.container.querySelector(selectors$b.productForm);
        this.productNotification = this.container.querySelector(selectors$b.productNotification);
        this.productImages = this.container.querySelector(selectors$b.productImages);
        this.productMediaList = this.container.querySelector(selectors$b.productMediaList);
        this.installmentForm = this.container.querySelector(selectors$b.installment);
        this.skuWrapper = this.container.querySelector(selectors$b.variantSku);
        this.sellout = null;
        this.variantImageScroll = this.container.getAttribute(attributes$8.variantImageScroll) === 'true';

        this.priceOffWrap = this.container.querySelector(selectors$b.priceOffWrap);
        this.priceOffAmount = this.container.querySelector(selectors$b.priceOffAmount);
        this.priceOffType = this.container.querySelector(selectors$b.priceOffType);
        this.planDescription = this.container.querySelector(selectors$b.subDescription);

        this.remainingWrapper = this.container.querySelector(selectors$b.remainingWrapper);

        if (this.remainingWrapper) {
          const remainingMaxWrap = this.container.querySelector(selectors$b.remainingMax);
          if (remainingMaxWrap) {
            this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(attributes$8.remainingMaxAttr), 10);
            this.remainingCount = this.container.querySelector(selectors$b.remainingCount);
            this.remainingJSONWrapper = this.container.querySelector(selectors$b.remainingJSON);
            this.remainingJSON = null;

            if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
              this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
            } else {
              console.warn('Missing product quantity JSON');
            }
          }
        }

        this.enableHistoryState = this.container.getAttribute(attributes$8.enableHistoryState) === 'true';
        this.hasUnitPricing = this.container.querySelector(selectors$b.unitWrapper);
        this.subSelectors = this.container.querySelector(selectors$b.subSelectors);
        this.subPrices = this.container.querySelector(selectors$b.subPrices);
        this.isPreOrder = this.container.querySelector(selectors$b.isPreOrder);

        let productJSON = null;
        const productElemJSON = this.container.querySelector(selectors$b.productJson);
        if (productElemJSON) {
          productJSON = productElemJSON.innerHTML;
        }
        if (productJSON) {
          this.productJSON = JSON.parse(productJSON);
          this.linkForm();
          this.sellout = new SelloutVariants(this.container, this.productJSON);
        } else {
          console.error('Missing product JSON');
        }

        this.variantOptionImages = this.container.querySelectorAll(selectors$b.variantOptionImage);
        this.variantButtons = this.container.querySelectorAll(selectors$b.variantButtons);
        if (this.variantOptionImages.length > 1) {
          this.optionImagesWidth();
        }
      }

      cartAddEvents() {
        this.buttonATC = this.querySelector(selectors$b.addToCart);

        this.buttonATC.addEventListener('click', (e) => {
          e.preventDefault();

          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              detail: {
                button: this.buttonATC,
              },
              bubbles: false,
            })
          );

          if (!this.closest(selectors$b.quickAddModal)) {
            window.a11y.lastElement = this.buttonATC;
          }
        });
      }

      destroy() {
        this.productForm.destroy();
      }

      linkForm() {
        this.productForm = new ProductFormReader(this.container, this.productJSON, {
          onOptionChange: this.onOptionChange.bind(this),
          onPlanChange: this.onPlanChange.bind(this),
        });
        this.pushState(this.productForm.getFormState(), true);
        this.subsToggleListeners();
      }

      onOptionChange(evt) {
        this.pushState(evt.dataset);
        this.updateProductImage(evt);
      }

      onPlanChange(evt) {
        if (this.subPrices) {
          this.pushState(evt.dataset);
        }
      }

      pushState(formState, init = false) {
        this.productState = this.setProductState(formState);
        this.updateAddToCartState(formState);
        this.updateNotificationForm(formState);
        this.updateProductPrices(formState);
        this.updateSaleText(formState);
        this.updateSku(formState);
        this.updateSubscriptionText(formState);
        this.updateRemaining(formState);
        this.updateLegend(formState);
        this.fireHookEvent(formState);
        this.sellout?.update(formState);

        if (this.enableHistoryState && !init) {
          this.updateHistoryState(formState);
        }
      }

      updateAddToCartState(formState) {
        const variant = formState.variant;
        let addText = theme.strings.addToCart;
        const priceWrapper = this.container.querySelectorAll(selectors$b.priceWrapper);
        const addToCart = this.container.querySelectorAll(selectors$b.addToCart);
        const addToCartText = this.container.querySelectorAll(selectors$b.addToCartText);
        const formWrapper = this.container.querySelectorAll(selectors$b.formWrapper);

        if (this.installmentForm && variant) {
          const installmentInput = this.installmentForm.querySelector(selectors$b.inputId);
          installmentInput.value = variant.id;
          installmentInput.dispatchEvent(new Event('change', {bubbles: true}));
        }

        if (this.isPreOrder) {
          addText = theme.strings.preOrder;
        }

        if (priceWrapper.length && variant) {
          priceWrapper.forEach((element) => {
            element.classList.remove(classes$6.hidden);
          });
        }

        addToCart?.forEach((button) => {
          if (button.hasAttribute(attributes$8.quickAddButton)) return;

          if (variant) {
            if (variant.available) {
              button.disabled = false;
            } else {
              button.disabled = true;
            }
          } else {
            button.disabled = true;
          }
        });

        addToCartText?.forEach((element) => {
          let btnText = addText;
          if (variant) {
            if (!variant.available) {
              btnText = theme.strings.soldOut;
            }
          } else {
            btnText = theme.strings.unavailable;
          }

          element.textContent = btnText;
        });

        if (formWrapper.length) {
          formWrapper.forEach((element) => {
            if (variant) {
              if (variant.available) {
                element.classList.remove(classes$6.variantSoldOut, classes$6.variantUnavailable);
              } else {
                element.classList.add(classes$6.variantSoldOut);
                element.classList.remove(classes$6.variantUnavailable);
              }

              const formSelect = element.querySelector(selectors$b.originalSelectorId);
              if (formSelect) {
                formSelect.value = variant.id;
              }

              const inputId = element.querySelector(`${selectors$b.inputId}[form]`);
              if (inputId) {
                inputId.value = variant.id;
                inputId.dispatchEvent(new Event('change'));
              }
            } else {
              element.classList.add(classes$6.variantUnavailable);
              element.classList.remove(classes$6.variantSoldOut);
            }
          });
        }
      }

      updateNotificationForm(formState) {
        if (!this.productNotification) return;

        const variantTitle = this.productNotification.querySelector(selectors$b.variantTitle);
        const notificationProduct = this.productNotification.querySelector(selectors$b.notificationProduct);
        if (variantTitle != null) {
          variantTitle.textContent = formState.variant.title;
          notificationProduct.value = formState.variant.name;
        }
      }

      updateHistoryState(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const location = window.location.href;
        if (variant && location.includes('/product')) {
          const url = new window.URL(location);
          const params = url.searchParams;
          params.set('variant', variant.id);
          if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
            params.set('selling_plan', plan.detail.id);
          } else {
            params.delete('selling_plan');
          }
          url.search = params.toString();
          const urlString = url.toString();
          window.history.replaceState({path: urlString}, '', urlString);
        }
      }

      updateRemaining(formState) {
        const variant = formState.variant;

        this.remainingWrapper?.classList.remove(classes$6.remainingIn, classes$6.remainingOut, classes$6.remainingUnavailable, classes$6.remainingLow);

        if (variant && this.remainingWrapper && this.remainingJSON) {
          const remaining = this.remainingJSON[variant.id];

          if (remaining === 'out' || remaining < 1) {
            this.remainingWrapper.classList.add(classes$6.remainingOut);
          }

          if (remaining === 'in' || remaining >= this.remainingMaxInt) {
            this.remainingWrapper.classList.add(classes$6.remainingIn);
          }

          if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
            this.remainingWrapper.classList.add(classes$6.remainingLow);

            if (this.remainingCount) {
              this.remainingCount.innerHTML = remaining;
            }
          }
        } else if (!variant && this.remainingWrapper) {
          this.remainingWrapper.classList.add(classes$6.remainingUnavailable);
        }
      }

      optionImagesWidth() {
        if (!this.variantButtons) return;

        let maxItemWidth = 0;

        requestAnimationFrame(() => {
          this.variantOptionImages.forEach((item) => {
            const itemWidth = item.clientWidth;
            if (itemWidth > maxItemWidth) {
              maxItemWidth = itemWidth;
            }
          });

          this.variantButtons.forEach((item) => {
            item.style?.setProperty('--option-image-width', maxItemWidth + 'px');
          });
        });
      }

      getBaseUnit(variant) {
        return variant.unit_price_measurement.reference_value === 1
          ? variant.unit_price_measurement.reference_unit
          : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
      }

      subsToggleListeners() {
        const toggles = this.container.querySelectorAll(selectors$b.subsToggle);

        toggles.forEach((toggle) => {
          toggle.addEventListener(
            'change',
            function (e) {
              const val = e.target.value.toString();
              const selected = this.container.querySelector(`[${selectors$b.subsChild}="${val}"]`);
              const groups = this.container.querySelectorAll(`[${selectors$b.subsChild}]`);
              if (selected) {
                selected.classList.remove(classes$6.hidden);
                const first = selected.querySelector(`[name="selling_plan"]`);
                first.checked = true;
                first.dispatchEvent(new Event('change'));
              }
              groups.forEach((group) => {
                if (group !== selected) {
                  group.classList.add(classes$6.hidden);
                  const plans = group.querySelectorAll(`[name="selling_plan"]`);
                  plans.forEach((plan) => {
                    plan.checked = false;
                    plan.dispatchEvent(new Event('change'));
                  });
                }
              });
            }.bind(this)
          );
        });
      }

      updateSaleText(formState) {
        if (this.productState.planSale) {
          this.updateSaleTextSubscription(formState);
        } else if (this.productState.onSale) {
          this.updateSaleTextStandard(formState);
        } else if (this.priceOffWrap) {
          this.priceOffWrap.classList.add(classes$6.hidden);
        }
      }

      isVariantFinalSale(variant) {
        const metafieldsData = document.querySelector(selectors$b.variantFinalSaleMeta)?.textContent;
        if (!metafieldsData) return;

        const variantsMetafields = JSON.parse(metafieldsData);
        let variantIsFinalSale = false;

        variantsMetafields.forEach((variantMetafield) => {
          if (Number(variantMetafield.variant_id) === variant.id) {
            variantIsFinalSale = variantMetafield.metafield_value === 'true';
          }
        });

        return variantIsFinalSale;
      }

      updateSaleTextStandard(formState) {
        const variant = formState.variant;
        const finalSaleBadge = this.priceOffWrap?.querySelector(selectors$b.finalSaleBadge);
        const priceOffBadge = this.priceOffWrap?.querySelector(selectors$b.priceOffBadge);
        const comparePrice = variant?.compare_at_price;
        const salePrice = variant?.price;

        // Set sale type text if element exists
        if (this.priceOffType) {
          this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
        }

        // If priceOffBadge or priceOffAmount are missing, hide priceOffBadge and exit early
        if (!priceOffBadge || !this.priceOffAmount || !comparePrice || !salePrice || comparePrice <= salePrice) {
          priceOffBadge?.classList.add(classes$6.hidden);
        } else {
          // Calculate and display discount percentage (ceil to nearest whole)
          const discountInt = Math.ceil(((comparePrice - salePrice) / comparePrice) * 100);
          this.priceOffAmount.innerHTML = `${discountInt}%`;
          priceOffBadge.classList.remove(classes$6.hidden);
        }

        // Display or hide the final sale badge
        const isFinalSale = this.priceOffWrap?.hasAttribute(attributes$8.finalSale) || this.isVariantFinalSale(variant);
        if (finalSaleBadge) {
          finalSaleBadge.classList.toggle(classes$6.hidden, !isFinalSale);
        }

        this.priceOffWrap.classList.remove(classes$6.hidden);
      }

      updateSubscriptionText(formState) {
        if (formState.plan && this.planDescription) {
          this.planDescription.innerHTML = formState.plan.detail.description;
          this.planDescription.classList.remove(classes$6.hidden);
        } else if (this.planDescription) {
          this.planDescription.classList.add(classes$6.hidden);
        }
      }

      updateSaleTextSubscription(formState) {
        if (this.priceOffType) {
          this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
        }

        if (this.priceOffAmount && this.priceOffWrap) {
          const adjustment = formState.plan.detail.price_adjustments[0];
          const discount = adjustment.value;
          if (adjustment && adjustment.value_type === 'percentage') {
            this.priceOffAmount.innerHTML = `${Math.ceil(discount)}%`;
          } else {
            this.priceOffAmount.innerHTML = formatMoney(discount, theme.moneyFormat);
          }
          this.priceOffWrap.classList.remove(classes$6.hidden);
        }
      }

      updateProductPrices(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        const priceWrappers = this.container.querySelectorAll(selectors$b.priceWrapper);

        priceWrappers.forEach((wrap) => {
          const comparePriceEl = wrap.querySelector(selectors$b.comparePrice);
          const productPriceEl = wrap.querySelector(selectors$b.productPrice);
          const comparePriceText = wrap.querySelector(selectors$b.comparePriceText);

          let comparePrice = '';
          let price = '';

          if (this.productState.available) {
            comparePrice = variant.compare_at_price;
            price = variant.price;
          }

          if (this.productState.hasPlan) {
            price = plan.allocation.price;
          }

          if (this.productState.planSale) {
            comparePrice = plan.allocation.compare_at_price;
            price = plan.allocation.price;
          }

          if (comparePriceEl) {
            if (this.productState.onSale || this.productState.planSale) {
              comparePriceEl.classList.remove(classes$6.hidden);
              comparePriceText.classList.remove(classes$6.hidden);
              productPriceEl.classList.add(classes$6.productPriceSale);
            } else {
              comparePriceEl.classList.add(classes$6.hidden);
              comparePriceText.classList.add(classes$6.hidden);
              productPriceEl.classList.remove(classes$6.productPriceSale);
            }
            comparePriceEl.innerHTML = formatMoney(comparePrice, theme.moneyFormat);
          }

          productPriceEl.innerHTML = price === 0 ? window.theme.strings.free : formatMoney(price, theme.moneyFormat);
        });

        if (this.hasUnitPricing) {
          this.updateProductUnits(formState);
        }
      }

      updateProductUnits(formState) {
        const variant = formState.variant;
        const plan = formState.plan;
        let unitPrice = null;

        if (variant && variant.unit_price) {
          unitPrice = variant.unit_price;
        }
        if (plan && plan.allocation && plan.allocation.unit_price) {
          unitPrice = plan.allocation.unit_price;
        }

        if (unitPrice) {
          const base = this.getBaseUnit(variant);
          const formattedPrice = formatMoney(unitPrice, theme.moneyFormat);
          this.container.querySelector(selectors$b.unitPrice).innerHTML = formattedPrice;
          this.container.querySelector(selectors$b.unitBase).innerHTML = base;
          this.container.querySelector(selectors$b.unitWrapper).classList.remove(classes$6.hidden);
        } else {
          this.container.querySelector(selectors$b.unitWrapper).classList.add(classes$6.hidden);
        }
      }

      updateSku(formState) {
        if (!this.skuWrapper) return;

        this.skuWrapper.innerHTML = `${theme.strings.sku}: ${formState.variant.sku}`;
      }

      fireHookEvent(formState) {
        const variant = formState.variant;
        this.container.dispatchEvent(
          new CustomEvent('theme:variant:change', {
            detail: {
              variant: variant,
            },
            bubbles: true,
          })
        );
      }

      /**
       * Tracks aspects of the product state that are relevant to UI updates
       * @param {object} evt - variant change event
       * @return {object} productState - represents state of variant + plans
       *  productState.available - current variant and selling plan options result in valid offer
       *  productState.soldOut - variant is sold out
       *  productState.onSale - variant is on sale
       *  productState.showUnitPrice - variant has unit price
       *  productState.requiresPlan - all the product variants requires a selling plan
       *  productState.hasPlan - there is a valid selling plan
       *  productState.planSale - plan has a discount to show next to price
       *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscription
       */
      setProductState(dataset) {
        const variant = dataset.variant;
        const plan = dataset.plan;

        const productState = {
          available: true,
          soldOut: false,
          onSale: false,
          showUnitPrice: false,
          requiresPlan: false,
          hasPlan: false,
          planPerDelivery: false,
          planSale: false,
        };

        if (!variant || (variant.requires_selling_plan && !plan)) {
          productState.available = false;
        } else {
          if (!variant.available) {
            productState.soldOut = true;
          }

          if (variant.compare_at_price > variant.price) {
            productState.onSale = true;
          }

          if (variant.unit_price) {
            productState.showUnitPrice = true;
          }

          if (this.product && this.product.requires_selling_plan) {
            productState.requiresPlan = true;
          }

          if (plan && this.subPrices) {
            productState.hasPlan = true;
            if (plan.allocation.per_delivery_price !== plan.allocation.price) {
              productState.planPerDelivery = true;
            }
            if (variant.price > plan.allocation.price) {
              productState.planSale = true;
            }
          }
        }
        return productState;
      }

      updateProductImage(evt) {
        const variant = evt.dataset.variant;

        if (variant) {
          // Update variant image, if one is set
          if (variant.featured_media) {
            const selectedImage = this.container.querySelector(`[${attributes$8.imageId}="${variant.featured_media.id}"]`);
            // If we have a mobile breakpoint or the tall layout is disabled,
            // just switch the slideshow.

            if (selectedImage) {
              const selectedImageId = selectedImage.getAttribute(attributes$8.mediaId);
              const isDesktopView = isDesktop();

              selectedImage.dispatchEvent(
                new CustomEvent('theme:media:select', {
                  bubbles: true,
                  detail: {
                    id: selectedImageId,
                  },
                })
              );

              if (isDesktopView && !this.productImages.hasAttribute(attributes$8.faderDesktop) && this.variantImageScroll) {
                const selectedImageTop = selectedImage.getBoundingClientRect().top;

                // Scroll to variant image
                document.dispatchEvent(
                  new CustomEvent('theme:tooltip:close', {
                    bubbles: false,
                    detail: {
                      hideTransition: false,
                    },
                  })
                );

                scrollTo(selectedImageTop);
              }

              if (!isDesktopView && !this.productImages.hasAttribute(attributes$8.faderMobile)) {
                this.productMediaList.scrollTo({
                  left: selectedImage.offsetLeft,
                });
              }
            }
          }
        }
      }

      updateLegend(formState) {
        const variant = formState.variant;
        if (variant) {
          const optionValues = this.container.querySelectorAll(selectors$b.optionValue);
          if (optionValues.length) {
            optionValues.forEach((optionValue) => {
              const selectorWrapper = optionValue.closest(selectors$b.optionPosition);
              if (selectorWrapper) {
                const optionPosition = selectorWrapper.getAttribute(attributes$8.optionPosition);
                const optionIndex = parseInt(optionPosition, 10) - 1;
                const selectedOptionValue = variant.options[optionIndex];
                optionValue.innerHTML = selectedOptionValue;
              }
            });
          }
        }
      }
    }

    const selectors$a = {
      open: '[data-popup-open]',
      close: '[data-popup-close]',
      focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    };

    const attributes$7 = {
      closing: 'closing',
    };

    class PopupActions {
      constructor(popup, holder, showModal = true, scrollLock = true) {
        this.popup = popup;
        this.holder = holder;
        this.a11y = a11y;
        this.isAnimating = false;
        this.showModal = showModal;
        this.enableScrollLock = scrollLock;
        this.buttonPopupOpen = this.holder?.querySelector(selectors$a.open);

        this.popupEvents();
      }

      popupOpen() {
        if (!this.popup) return;

        this.isAnimating = true;

        // Check if browser supports Dialog tags
        if (this.showModal && typeof this.popup.showModal === 'function') {
          this.popup.showModal();
        } else if (!this.showModal && typeof this.popup.show === 'function') {
          this.popup.show();
        } else {
          this.popup.setAttribute('open', '');
        }

        this.popup.removeAttribute('inert');
        this.popup.setAttribute('aria-hidden', false);
        this.popup.focus(); // Focus <dialog> tag element to prevent immediate closing on Escape keypress

        if (this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        }

        waitForAnimationEnd(this.popup).then(() => {
          this.isAnimating = false;

          if (this.enableScrollLock) {
            this.a11y.trapFocus(this.popup);
          }

          const focusTarget = this.popup.querySelector('[autofocus]') || this.popup.querySelector(selectors$a.focusable);
          focusTarget?.focus();
        });
      }

      popupClose() {
        if (this.isAnimating || !this.popup || this.popup.hasAttribute('inert')) {
          return;
        }

        if (!this.popup.hasAttribute(attributes$7.closing)) {
          this.popup.setAttribute(attributes$7.closing, '');
          this.isAnimating = true;

          waitForAnimationEnd(this.popup).then(() => {
            this.isAnimating = false;
            this.popupClose();
          });

          return;
        }

        // Check if browser supports Dialog tags
        if (typeof this.popup.close === 'function') {
          this.popup.close();
        } else {
          this.popup.removeAttribute('open');
          this.popup.setAttribute('aria-hidden', true);
        }

        this.popupCloseActions();
      }

      popupCloseActions() {
        if (this.popup.hasAttribute('inert')) return;

        this.popup.setAttribute('inert', '');
        this.popup.setAttribute('aria-hidden', true);
        this.popup.removeAttribute(attributes$7.closing);

        // Unlock scroll if no other popups & modals are open
        if (!hasOpenModals() && this.enableScrollLock) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }

        this.popup.dispatchEvent(new CustomEvent('theme:popup:onclose', {bubbles: false}));

        if (this.enableScrollLock) {
          this.a11y.removeTrapFocus();
          this.a11y.autoFocusLastElement();
        }
      }

      popupEvents() {
        if (!this.popup) return;

        // Open button click event
        this.buttonPopupOpen?.addEventListener('click', (e) => {
          e.preventDefault();
          this.popupOpen();
          window.a11y.lastElement = this.buttonPopupOpen;
        });

        // Close button click event
        const closeButtons = this.popup.querySelectorAll(selectors$a.close);
        if (closeButtons.length) {
          closeButtons.forEach((closeButton) => {
            closeButton.addEventListener('click', (e) => {
              e.preventDefault();
              this.popupClose();
            });
          });
        }

        // Close dialog on click outside content
        if (this.showModal) {
          this.popup.addEventListener('click', (event) => {
            if (event.target.nodeName === 'DIALOG' && event.type === 'click') {
              this.popupClose();
            }
          });
        }

        // Close dialog on click ESC key pressed
        this.popup.addEventListener('keydown', (event) => {
          if (event.code === 'Escape') {
            event.preventDefault();
            this.popupClose();
          }
        });

        this.popup.addEventListener('close', () => this.popupCloseActions());
      }
    }

    const selectors$9 = {
      dialog: 'dialog',
    };

    class ProductModal extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        new PopupActions(this.querySelector(selectors$9.dialog), this, true, true);
      }
    }

    class ProductModel extends DeferredMedia {
      constructor() {
        super();
      }

      loadContent() {
        super.loadContent();

        Shopify.loadFeatures([
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: this.setupModelViewerUI.bind(this),
          },
        ]);
      }

      setupModelViewerUI(errors) {
        if (errors) return;

        this.modelViewerUI = new Shopify.ModelViewerUI(this.querySelector('model-viewer'));
      }
    }

    window.ProductModel = {
      loadShopifyXR() {
        Shopify.loadFeatures([
          {
            name: 'shopify-xr',
            version: '1.0',
            onLoad: this.setupShopifyXR.bind(this),
          },
        ]);
      },

      setupShopifyXR(errors) {
        if (errors) return;

        if (!window.ShopifyXR) {
          document.addEventListener('shopify_xr_initialized', () => this.setupShopifyXR());
          return;
        }

        document.querySelectorAll('[id^="ModelJSON-"]').forEach((modelJSON) => {
          window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
          modelJSON.remove();
        });
        window.ShopifyXR.setupXRElements();
      },
    };

    window.addEventListener('DOMContentLoaded', () => {
      if (window.ProductModel) window.ProductModel.loadShopifyXR();
    });

    const selectors$8 = {
      addToCart: '[data-add-to-cart]',
      productImage: '[data-product-image]',
      productJson: '[data-product-json]',
      form: '[data-product-form]',
      cartBar: '#cart-bar',
      productNotificationPopupButton: '[data-popup-open]',
      productSubmitAdd: '.product__submit__add',
      formWrapper: '[data-form-wrapper]',
      productVariants: '[data-product-variants]',
      slider: '[data-slider]',
    };

    const classes$5 = {
      expanded: 'is-expanded',
      visible: 'is-visible',
      loading: 'is-loading',
      added: 'is-added',
    };

    const attributes$6 = {
      cartBarEnabled: 'data-cart-bar-enabled',
      cartBarAdd: 'data-add-to-cart-bar',
      cartBarScroll: 'data-cart-bar-scroll',
      cartBarProductNotification: 'data-cart-bar-product-notification',
      sectionId: 'data-section-id',
      sliderIndex: 'data-slider-index',
    };

    const sections$7 = {};

    /**
     * Product section constructor.
     * @param {string} container - selector for the section container DOM element
     */
    class Product {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.id = this.container.getAttribute(attributes$6.sectionId);
        this.sliders = this.container.querySelectorAll(selectors$8.slider);
        this.slider = [];
        this.formWrapper = this.container.querySelector(selectors$8.formWrapper);
        this.cartBarEnabled = this.container.hasAttribute(attributes$6.cartBarEnabled);
        this.cartBar = this.container.querySelector(selectors$8.cartBar);
        this.setCartBarHeight = this.setCartBarHeight.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.toggleCartBarOnScroll = this.toggleCartBarOnScroll.bind(this);
        this.unlockTimer = 0;
        this.accessibility = a11y;

        // Stop parsing if we don't have the product json script tag when loading
        // section in the Theme Editor
        const productJson = this.container.querySelector(selectors$8.productJson);
        if ((productJson && !productJson.innerHTML) || !productJson) {
          return;
        }

        const productJsonHandle = JSON.parse(productJson.innerHTML).handle;
        let recentObj = {};
        if (productJsonHandle) {
          recentObj = {
            handle: productJsonHandle,
          };
        }

        // Record recently viewed products when the product page is loading
        Shopify.Products.recordRecentlyViewed(recentObj);

        this.form = this.container.querySelector(selectors$8.form);

        if (this.sliders.length) {
          this.sliders.forEach((slider, index) => {
            slider.setAttribute(attributes$6.sliderIndex, index);
            this.slider.push(new Slider(this.container, slider));
          });
        }

        if (this.cartBarEnabled) {
          this.initCartBar();
          this.setCartBarHeight();

          document.addEventListener('theme:scroll', this.toggleCartBarOnScroll);
          document.addEventListener('theme:resize', this.setCartBarHeight);
        }
      }

      initCartBar() {
        // Submit product form on cart bar button click
        this.cartBarBtns = this.cartBar.querySelectorAll(selectors$8.productSubmitAdd);
        if (this.cartBarBtns.length > 0) {
          this.cartBarBtns.forEach((button) => {
            button.addEventListener('click', (e) => {
              e.preventDefault();

              if (e.currentTarget.hasAttribute(attributes$6.cartBarAdd)) {
                if (this.cartBarEnabled) {
                  e.currentTarget.classList.add(classes$5.loading);
                  e.currentTarget.setAttribute('disabled', 'disabled');
                }

                this.form.querySelector(selectors$8.addToCart).dispatchEvent(
                  new Event('click', {
                    bubbles: true,
                  })
                );
              } else if (e.currentTarget.hasAttribute(attributes$6.cartBarScroll)) {
                this.scrollToTop();
              } else if (e.currentTarget.hasAttribute(attributes$6.cartBarProductNotification)) {
                this.form.querySelector(selectors$8.productNotificationPopupButton)?.dispatchEvent(new Event('click'));
              }
            });

            if (button.hasAttribute(attributes$6.cartBarAdd)) {
              document.addEventListener('theme:product:add-error', this.scrollToTop);
            }
          });
        }

        this.setCartBarHeight();
      }

      scrollToTop() {
        const productVariants = this.container.querySelector(selectors$8.productVariants);
        const scrollTarget = isDesktop() ? this.container : productVariants ? productVariants : this.form;
        const scrollTargetTop = scrollTarget.getBoundingClientRect().top;

        scrollTo(isDesktop() ? scrollTargetTop : scrollTargetTop - 10);
      }

      toggleCartBarOnScroll() {
        const scrolled = window.scrollY;
        const element = theme.variables.productPageSticky && this.formWrapper ? this.formWrapper : this.form;

        if (element && this.cartBar) {
          const formOffset = element.offsetTop;
          const formHeight = element.offsetHeight;
          const checkPosition = scrolled > formOffset + formHeight;

          this.cartBar.classList.toggle(classes$5.visible, checkPosition);
        }
      }

      setCartBarHeight() {
        const cartBarHeight = this.cartBar.offsetHeight;

        document.documentElement.style.setProperty('--cart-bar-height', `${cartBarHeight}px`);
      }

      onUnload() {
        document.removeEventListener('theme:product:add-error', this.scrollToTop);

        if (this.cartBarEnabled) {
          document.removeEventListener('theme:scroll', this.toggleCartBarOnScroll);
          document.removeEventListener('theme:resize', this.setCartBarHeight);
        }
      }

      onBlockSelect(e) {
        const slider = e.srcElement.closest(selectors$8.slider);
        if (slider && this.slider.length) {
          const sliderIndex = slider.hasAttribute(attributes$6.sliderIndex) ? slider.getAttribute(attributes$6.sliderIndex) : 0;
          if (!this.slider[sliderIndex]) return;
          this.slider[sliderIndex].onBlockSelect(e);
        }
      }

      onBlockDeselect(e) {
        const slider = e.srcElement.closest(selectors$8.slider);
        if (slider && this.slider.length) {
          const sliderIndex = slider.hasAttribute(attributes$6.sliderIndex) ? slider.getAttribute(attributes$6.sliderIndex) : 0;
          if (!this.slider[sliderIndex]) return;
          this.slider[sliderIndex].onBlockDeselect(e);
        }
      }
    }

    const productSection = {
      onLoad() {
        sections$7[this.id] = new Product(this);
      },
      onUnload(e) {
        sections$7[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$7[this.id].onBlockSelect(e);
      },
      onBlockDeselect(e) {
        sections$7[this.id].onBlockDeselect(e);
      },
    };

    register('product', [productSection, tooltipSection, tabs, productStickySection]);

    if (!customElements.get('product-form')) {
      customElements.define('product-form', ProductForm);
    }

    if (!customElements.get('product-modal')) {
      customElements.define('product-modal', ProductModal);
    }

    if (!customElements.get('product-model')) {
      customElements.define('product-model', ProductModel);
    }

    if (!customElements.get('product-siblings')) {
      customElements.define('product-siblings', ProductSiblings);
    }

    if (!customElements.get('radio-swatch')) {
      customElements.define('radio-swatch', RadioSwatch);
    }

    const selectors$7 = {
      apiRelatedProductsTemplate: '[data-api-related-template]',
      relatedSection: '[data-related-section]',
      relatedProduct: '[data-grid-item]',
      recentlyViewed: '[data-recent-wrapper]',
      recentlyViewedWrapper: '[data-recently-viewed-wrapper]',
      section: '[data-section-type]',
      productItem: '.product-item',
      slider: 'grid-slider',
    };

    const attributes$5 = {
      limit: 'data-limit',
      minimum: 'data-minimum',
      productId: 'data-product-id',
    };

    const classes$4 = {
      isHidden: 'is-hidden',
      gridMobileSlider: 'grid--mobile-slider',
    };

    const sections$6 = {};

    class Related {
      constructor(section) {
        this.section = section;
        this.sectionId = section.id;
        this.container = section.container;
        this.relatedItems = 0;

        this.init();
      }

      init() {
        this.loadRelatedProducts();
        this.loadRecentlyViewedProducts();
      }

      loadRelatedProducts() {
        const relatedSection = this.container.querySelector(selectors$7.relatedSection);
        if (!relatedSection) return;

        const productId = relatedSection.getAttribute(attributes$5.productId);
        const limit = relatedSection.getAttribute(attributes$5.limit);
        const requestUrl = `${window.theme.routes.product_recommendations_url}?section_id=api-product-recommendation&limit=${limit}&product_id=${productId}&intent=related`;

        fetch(requestUrl)
          .then((response) => response.text())
          .then((data) => this.handleRelatedProductsResponse(data, relatedSection))
          .catch(() => this.hideSection(relatedSection));
      }

      handleRelatedProductsResponse(data, relatedSection) {
        const relatedContent = document.createElement('div');
        relatedContent.innerHTML = new DOMParser().parseFromString(data, 'text/html').querySelector(selectors$7.apiRelatedProductsTemplate).innerHTML;
        const relatedProducts = relatedContent.querySelectorAll(selectors$7.relatedProduct).length;

        if (relatedProducts > 0) {
          relatedSection.innerHTML = relatedContent.innerHTML;
          this.relatedItems = relatedProducts;

          const styleMobile = parseInt(relatedSection.style.getPropertyValue('--COLUMNS-MOBILE'));
          if (styleMobile === 0) {
            const addedProduct = relatedSection.querySelector(selectors$7.relatedProduct);
            addedProduct.parentElement.classList.add(classes$4.gridMobileSlider);
          }
        } else {
          this.hideSection(relatedSection);
        }

        this.updateVisibility();
      }

      loadRecentlyViewedProducts() {
        const recentlyViewedHolder = this.container.querySelector(selectors$7.recentlyViewed);
        const howManyToShow = parseInt(recentlyViewedHolder.getAttribute(attributes$5.limit)) || 4;
        const minimumNumberProducts = parseInt(recentlyViewedHolder.getAttribute(attributes$5.minimum)) || 4;

        Shopify.Products.showRecentlyViewed({
          howManyToShow,
          wrapperId: `recently-viewed-products-${this.sectionId}`,
          section: this.section,
          target: 'api-product-grid-item',
          onComplete: (wrapper, section) => this.handleRecentlyViewedResponse(wrapper, section, recentlyViewedHolder, minimumNumberProducts),
        });
      }

      handleRecentlyViewedResponse(wrapper, section, recentlyViewedHolder, minimumNumberProducts) {
        const container = section.container;
        if (!container) return;

        const recentlyViewedWrapper = container.querySelector(selectors$7.recentlyViewedWrapper);
        const recentProducts = wrapper.querySelectorAll(selectors$7.productItem);
        const slider = recentlyViewedHolder.querySelector(selectors$7.slider);
        const checkRecentInRelated = !recentlyViewedWrapper && recentProducts.length > 0;
        const checkRecentOutsideRelated = recentlyViewedWrapper && recentProducts.length >= minimumNumberProducts;

        if (checkRecentInRelated || checkRecentOutsideRelated) {
          if (checkRecentOutsideRelated) {
            recentlyViewedWrapper.classList.remove(classes$4.isHidden);
          }

          recentlyViewedHolder.classList.remove(classes$4.isHidden);
          recentlyViewedHolder.dispatchEvent(new CustomEvent('theme:tab:check', {bubbles: true}));

          if (slider) {
            slider.dispatchEvent(new CustomEvent('theme:grid-slider:init', {bubbles: true}));
          }
        }

        this.updateVisibility();
      }

      hideSection(section) {
        section.dispatchEvent(new CustomEvent('theme:tab:hide', {bubbles: true}));
      }

      updateVisibility() {
        const currentProductsCount = Shopify.Products.getConfig().howManyToShow;
        const shouldHideSection = currentProductsCount < 1 && this.relatedItems < 1;

        this.container.classList.toggle(classes$4.isHidden, shouldHideSection);
      }
    }

    const relatedSection = {
      onLoad() {
        sections$6[this.id] = new Related(this);
      },
    };

    register('related', [relatedSection, tabs]);

    register('reviews', [slider]);

    const sections$5 = {};

    const selectors$6 = {
      sliderLogos: '[data-slider-logos]',
      sliderText: '[data-slider-text]',
      slide: '[data-slide]',
    };

    const classes$3 = {
      isSelected: 'is-selected',
      isInitialized: 'is-initialized',
      flickityEnabled: 'flickity-enabled',
    };

    const attributes$4 = {
      slideData: 'data-slide',
      slideIndex: 'data-slide-index',
    };

    class LogoList {
      constructor(section) {
        this.container = section.container;
        this.slideshowNav = this.container.querySelector(selectors$6.sliderLogos);
        this.slideshowText = this.container.querySelector(selectors$6.sliderText);
        this.setSlideshowNavStateOnResize = () => this.setSlideshowNavState();
        this.flkty = null;
        this.flktyNav = null;
        this.logoSlides = this.slideshowNav.querySelectorAll(selectors$6.slide);
        this.logoSlidesWidth = this.getSlidesWidth();

        this.initSlideshowText();
        this.initSlideshowNav();
      }

      getSlidesWidth() {
        const slidesCount = this.logoSlides.length;
        const slideWidth = 200; // 200px fixed width

        return slidesCount * slideWidth;
      }

      initSlideshowText() {
        if (!this.slideshowText) return;

        this.flkty = new FlickityFade(this.slideshowText, {
          fade: true,
          autoPlay: false,
          prevNextButtons: false,
          cellAlign: 'left', // Prevents blurry text on Safari
          contain: true,
          pageDots: false,
          wrapAround: false,
          selectedAttraction: 0.2,
          friction: 0.6,
          draggable: false,
          accessibility: false,
          on: {
            ready: () => this.sliderAccessibility(),
            change: () => this.sliderAccessibility(),
          },
        });
      }

      sliderAccessibility() {
        const buttons = this.slideshowText.querySelectorAll(`${selectors$6.slide} a, ${selectors$6.slide} button`);

        if (buttons.length) {
          buttons.forEach((button) => {
            const slide = button.closest(selectors$6.slide);
            if (slide) {
              const tabIndex = slide.classList.contains(classes$3.isSelected) ? 0 : -1;
              button.setAttribute('tabindex', tabIndex);
            }
          });
        }
      }

      initSlideshowNav() {
        if (!this.slideshowNav) return;

        if (this.logoSlides.length) {
          this.logoSlides.forEach((logoItem) => {
            logoItem.addEventListener('click', () => {
              const index = parseInt(logoItem.getAttribute(attributes$4.slideIndex));
              const hasSlider = this.slideshowNav.classList.contains(classes$3.flickityEnabled);

              if (this.flkty) {
                this.flkty.select(index);
              }

              if (hasSlider) {
                this.flktyNav.select(index);
                if (!this.slideshowNav.classList.contains(classes$3.isSelected)) {
                  this.flktyNav.playPlayer();
                }
              } else {
                const selectedSlide = this.slideshowNav.querySelector(`.${classes$3.isSelected}`);
                if (selectedSlide) {
                  selectedSlide.classList.remove(classes$3.isSelected);
                }
                logoItem.classList.add(classes$3.isSelected);
              }
            });
          });
        }

        this.setSlideshowNavState();

        document.addEventListener('theme:resize', this.setSlideshowNavStateOnResize);
      }

      setSlideshowNavState() {
        const sliderInitialized = this.slideshowNav.classList.contains(classes$3.flickityEnabled);

        if (this.logoSlidesWidth > getWindowWidth()) {
          if (!sliderInitialized) {
            this.slideshowNav.classList.add(classes$3.isInitialized);

            const selectedSlide = this.slideshowNav.querySelector(`.${classes$3.isSelected}`);

            if (selectedSlide) {
              selectedSlide.classList.remove(classes$3.isSelected);
            }
            this.logoSlides[0].classList.add(classes$3.isSelected);

            // Init slider only once and then listen for watchCSS events
            if (!this.flktyNav) {
              this.flktyNav = new Flickity(this.slideshowNav, {
                autoPlay: 4000,
                prevNextButtons: false,
                contain: false,
                pageDots: false,
                wrapAround: true,
                watchCSS: true,
                selectedAttraction: 0.05,
                friction: 0.8,
                initialIndex: 0,
              });

              this.flktyNav.on('deactivate', () => {
                this.slideshowNav.querySelector(selectors$6.slide).classList.add(classes$3.isSelected);

                if (this.flkty) {
                  this.flkty.select(0);
                }
              });

              if (this.flkty) {
                this.flkty.select(0);
                this.flktyNav.on('change', (index) => this.flkty.select(index));
              }
            }
          }
        } else if (sliderInitialized) {
          // This will deactivate the Logos slider without actually destroying it
          this.slideshowNav.classList.remove(classes$3.isInitialized);
        }
      }

      onBlockSelect(evt) {
        if (!this.slideshowNav) return;
        const slide = this.slideshowNav.querySelector(`[${attributes$4.slideData}="${evt.detail.blockId}"]`);
        const slideIndex = parseInt(slide.getAttribute(attributes$4.slideIndex));

        if (this.slideshowNav.classList.contains(classes$3.flickityEnabled)) {
          this.flktyNav.select(slideIndex);
          this.flktyNav.stopPlayer();
          this.slideshowNav.classList.add(classes$3.isSelected);
        } else {
          slide.dispatchEvent(new Event('click'));
        }
      }

      onBlockDeselect() {
        if (this.slideshowNav && this.slideshowNav.classList.contains(classes$3.flickityEnabled)) {
          this.flktyNav.playPlayer();
          this.slideshowNav.classList.remove(classes$3.isSelected);
        }
      }

      onUnload() {
        document.removeEventListener('theme:resize', this.setSlideshowNavStateOnResize);
      }
    }

    const LogoListSection = {
      onLoad() {
        sections$5[this.id] = new LogoList(this);
      },
      onUnload(e) {
        sections$5[this.id].onUnload(e);
      },
      onBlockSelect(e) {
        sections$5[this.id].onBlockSelect(e);
      },
      onBlockDeselect(e) {
        sections$5[this.id].onBlockDeselect(e);
      },
    };

    register('logos', [LogoListSection]);

    register('slideshow', [slider]);

    register('custom-content', [slider, newsletterCheckForResultSection]);

    const selectors$5 = {
      largePromo: '[data-large-promo]',
      largePromoInner: '[data-large-promo-inner]',
      cartBar: 'cart-bar',
      newsletterPopup: '[data-newsletter]',
      newsletterPopupHolder: '[data-newsletter-holder]',
      newsletterHeading: '[data-newsletter-heading]',
      newsletterField: '[data-newsletter-field]',
      promoPopup: '[data-promo-text]',
      newsletterForm: '[data-newsletter-form]',
      delayAttribite: 'data-popup-delay',
      cookieNameAttribute: 'data-cookie-name',
      dataTargetReferrer: 'data-target-referrer',
    };

    const classes$2 = {
      hidden: 'hidden',
      hasValue: 'has-value',
      cartBarVisible: 'cart-bar-visible',
      isVisible: 'is-visible',
      success: 'has-success',
      selected: 'selected',
      hasBlockSelected: 'has-block-selected',
      mobile: 'mobile',
      desktop: 'desktop',
      bottom: 'bottom',
    };

    let sections$4 = {};

    class DelayShow {
      constructor(holder, element, popupEvents) {
        this.element = element;
        this.delay = holder.getAttribute(selectors$5.delayAttribite);
        this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
        this.popupActions = popupEvents;
        this.showPopupOnScrollEvent = () => this.showPopupOnScroll();

        if (this.delay === 'always' || this.isSubmitted) {
          this.always();
        }

        if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
          const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;
          this.delayed(seconds);
        }

        if (this.delay === 'bottom' && !this.isSubmitted) {
          this.bottom();
        }

        if (this.delay === 'idle' && !this.isSubmitted) {
          this.idle();
        }
      }

      always() {
        this.popupActions.popupOpen();
      }

      delayed(seconds = 10) {
        // Show popup after specific seconds
        setTimeout(() => {
          this.popupActions.popupOpen();
        }, seconds * 1000);
      }

      // Idle for 1 min
      idle() {
        let timer = 0;
        let idleTime = 60000;
        const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
        const windowEvents = ['load', 'resize', 'scroll'];

        const startTimer = () => {
          timer = setTimeout(() => {
            timer = 0;
            this.popupActions.popupOpen();
          }, idleTime);

          documentEvents.forEach((eventType) => {
            document.addEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.addEventListener(eventType, resetTimer);
          });
        };

        const resetTimer = () => {
          if (timer) {
            clearTimeout(timer);
          }

          documentEvents.forEach((eventType) => {
            document.removeEventListener(eventType, resetTimer);
          });

          windowEvents.forEach((eventType) => {
            window.removeEventListener(eventType, resetTimer);
          });

          startTimer();
        };

        startTimer();
      }

      // Scroll to the bottom of the page
      bottom() {
        document.addEventListener('theme:scroll', this.showPopupOnScrollEvent);
      }

      showPopupOnScroll() {
        if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
          this.popupActions.popupOpen();
          document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
        }
      }

      onUnload() {
        document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
      }
    }

    class TargetReferrer {
      constructor(el) {
        this.el = el;
        this.locationPath = location.href;

        if (!this.el.hasAttribute(selectors$5.dataTargetReferrer)) {
          return false;
        }

        this.init();
      }

      init() {
        if (this.locationPath.indexOf(this.el.getAttribute(selectors$5.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
          this.el.parentNode.removeChild(this.el);
        }
      }
    }

    class LargePopup {
      constructor(el) {
        this.popup = el;
        this.modal = this.popup.querySelector(selectors$5.largePromoInner);
        this.form = this.popup.querySelector(selectors$5.newsletterForm);
        this.cookie = new PopupCookie(this.popup.getAttribute(selectors$5.cookieNameAttribute), 'user_has_closed');
        this.isTargeted = new TargetReferrer(this.popup);
        this.popupActions = new PopupActions(this.modal, this.modal, true, true);
        this.a11y = a11y;

        this.init();
      }

      init() {
        const cookieExists = this.cookie.read() !== false;
        const targetMobile = this.popup.classList.contains(classes$2.mobile);
        const targetDesktop = this.popup.classList.contains(classes$2.desktop);
        const isMobileView = !isDesktop();
        let targetMatches = true;

        if ((targetMobile && !isMobileView) || (targetDesktop && isMobileView)) {
          targetMatches = false;
        }

        if (!targetMatches) {
          this.a11y.removeTrapFocus();
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
          return;
        }

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode && !window.location.pathname.endsWith('/challenge')) {
            new DelayShow(this.popup, this.modal, this.popupActions);
          }

          if (this.form && this.form.classList.contains(classes$2.success)) {
            this.checkForSuccess();
          }

          this.modal.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }
      }

      checkForSuccess() {
        this.popupActions.popupOpen();
        this.cookie.write();
      }

      onBlockSelect(evt) {
        if (this.popup.contains(evt.target)) {
          this.popupActions.popupOpen();
          this.popup.classList.add(classes$2.selected);
          this.popup.parentNode.classList.add(classes$2.hasBlockSelected);
        }
      }

      onBlockDeselect(evt) {
        if (this.popup.contains(evt.target)) {
          this.popupActions.popupClose();
          this.popup.classList.remove(classes$2.selected);
          this.popup.parentNode.classList.remove(classes$2.hasBlockSelected);
        }
      }
    }

    class PromoText {
      constructor(el) {
        this.popup = el;
        this.cookie = new PopupCookie(this.popup.getAttribute(selectors$5.cookieNameAttribute), 'user_has_closed');
        this.isTargeted = new TargetReferrer(this.popup);
        this.popupActions = new PopupActions(this.popup, this.popup, false, false);

        this.init();
      }

      init() {
        const cookieExists = this.cookie.read() !== false;

        if (!cookieExists || window.Shopify.designMode) {
          if (!window.Shopify.designMode) {
            new DelayShow(this.popup, this.popup, this.popupActions);
          } else {
            this.popupActions.popupOpen();
          }

          this.popup.addEventListener('theme:popup:onclose', () => this.cookie.write());
        }
      }

      onSelect() {
        this.popupActions.popupOpen();
        this.popup.classList.add(classes$2.selected);
        this.popup.parentNode.classList.add(classes$2.hasBlockSelected);
      }

      onDeselect() {
        this.popupActions.popupClose();
        this.popup.classList.remove(classes$2.selected);
        this.popup.parentNode.classList.remove(classes$2.hasBlockSelected);
      }
    }

    class NewsletterPopup {
      constructor(el) {
        this.popup = el;
        this.holder = this.popup.querySelector(selectors$5.newsletterPopupHolder);
        this.heading = this.popup.querySelector(selectors$5.newsletterHeading);
        this.newsletterField = this.popup.querySelector(selectors$5.newsletterField);
        this.cookie = new PopupCookie(this.popup.getAttribute(selectors$5.cookieNameAttribute), 'newsletter_is_closed');
        this.form = this.popup.querySelector(selectors$5.newsletterForm);
        this.isTargeted = new TargetReferrer(this.popup);
        this.popupActions = new PopupActions(this.holder, this.holder, false, false);
        this.resetClassTimer = 0;

        this.init();
      }

      init() {
        const cookieExists = this.cookie.read() !== false;
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        const classesString = [...this.holder.classList].toString();
        const isPositionBottom = classesString.includes(classes$2.bottom);

        if (submissionSuccess) {
          this.delay = 0;
        }

        if (!cookieExists || window.Shopify.designMode) {
          this.show();

          if (this.form.classList.contains(classes$2.success)) {
            this.checkForSuccess();
          }
        }

        if (isPositionBottom) {
          this.observeCartBar();
        }
      }

      show() {
        if (!window.location.pathname.endsWith('/challenge')) {
          if (!window.Shopify.designMode) {
            new DelayShow(this.popup, this.holder, this.popupActions);
          } else {
            this.popupActions.popupOpen();
          }
        }

        this.showForm();
        this.inputField();

        this.holder.addEventListener('theme:popup:onclose', () => this.cookie.write());
      }

      checkForSuccess() {
        this.popupActions.popupOpen();
        this.cookie.write();
      }

      observeCartBar() {
        this.cartBar = document.getElementById(selectors$5.cartBar);

        if (!this.cartBar) return;

        const config = {attributes: true, childList: false, subtree: false};
        let isVisible = this.cartBar.classList.contains(classes$2.isVisible);
        document.body.classList.toggle(classes$2.cartBarVisible, isVisible);

        // Callback function to execute when mutations are observed
        const callback = (mutationList) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'attributes') {
              isVisible = mutation.target.classList.contains(classes$2.isVisible);
              document.body.classList.toggle(classes$2.cartBarVisible, isVisible);
            }
          }
        };

        this.observer = new MutationObserver(callback);
        this.observer.observe(this.cartBar, config);
      }

      showForm() {
        this.heading.addEventListener('click', (event) => {
          event.preventDefault();

          this.heading.classList.add(classes$2.hidden);
          this.form.classList.remove(classes$2.hidden);
          this.newsletterField.focus();
        });

        this.heading.addEventListener('keyup', (event) => {
          if (event.code === 'Enter') {
            this.heading.dispatchEvent(new Event('click'));
          }
        });
      }

      inputField() {
        const setClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          if (this.newsletterField.value !== '') {
            this.holder.classList.add(classes$2.hasValue);
          }
        };

        const unsetClass = () => {
          // Reset timer if exists and is active
          if (this.resetClassTimer) {
            clearTimeout(this.resetClassTimer);
          }

          // Reset class
          this.resetClassTimer = setTimeout(() => {
            this.holder.classList.remove(classes$2.hasValue);
          }, 2000);
        };

        this.newsletterField.addEventListener('input', setClass);
        this.newsletterField.addEventListener('focus', setClass);
        this.newsletterField.addEventListener('focusout', unsetClass);
      }

      onBlockSelect(evt) {
        if (this.popup.contains(evt.target)) {
          this.popupActions.popupOpen();
          this.popup.classList.add(classes$2.selected);
          this.popup.parentNode.classList.add(classes$2.hasBlockSelected);
        }
      }

      onBlockDeselect(evt) {
        if (this.popup.contains(evt.target)) {
          this.popupActions.popupClose();
          this.popup.classList.remove(classes$2.selected);
          this.popup.parentNode.classList.remove(classes$2.hasBlockSelected);
        }
      }

      onUnload() {
        if (this.observer) {
          this.observer.disconnect();
        }
      }
    }

    const popupSection = {
      onLoad() {
        sections$4[this.id] = [];

        const newsletters = this.container.querySelectorAll(selectors$5.largePromo);
        newsletters.forEach((el) => {
          sections$4[this.id].push(new LargePopup(el));
        });

        const newsletterPopup = this.container.querySelectorAll(selectors$5.newsletterPopup);
        newsletterPopup.forEach((el) => {
          sections$4[this.id].push(new NewsletterPopup(el));
        });

        const promoPopup = this.container.querySelectorAll(selectors$5.promoPopup);
        promoPopup.forEach((el) => {
          sections$4[this.id].push(new PromoText(el));
        });
      },

      onBlockSelect(evt) {
        sections$4[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(evt);
          }
        });
      },
      onBlockDeselect(evt) {
        sections$4[this.id].forEach((el) => {
          if (typeof el.onBlockDeselect === 'function') {
            el.onBlockDeselect(evt);
          }
        });
      },
      onSelect() {
        sections$4[this.id].forEach((el) => {
          if (typeof el.onSelect === 'function') {
            el.onSelect();
          }
        });
      },
      onDeselect() {
        sections$4[this.id].forEach((el) => {
          if (typeof el.onDeselect === 'function') {
            el.onDeselect();
          }
        });
      },
      onUnload() {
        sections$4[this.id].forEach((el) => {
          if (typeof el.onUnload === 'function') {
            el.onUnload();
          }
        });
      },
    };

    register('popups', [popupSection, newsletterCheckForResultSection]);

    const selectors$4 = {
      modal: '[data-password-modal]',
      loginErrors: '#login_form .errors',
    };

    class Password {
      constructor(section) {
        this.container = section.container;
        this.popupActions = new PopupActions(this.container.querySelector(selectors$4.modal), this.container, true, true);

        if (this.container.querySelector(selectors$4.loginErrors)) {
          this.popupActions.popupOpen();
        }
      }
    }

    const passwordSection = {
      onLoad() {
        new Password(this);
      },
    };

    register('password-template', passwordSection);

    register('list-collections', [slider]);

    register('columns', [slider]);

    register('newsletter', newsletterCheckForResultSection);

    const selectors$3 = {
      scrollToElement: '[data-scroll-to]',
      tooltip: '[data-tooltip]',
      collapsibleTrigger: '[data-collapsible-trigger]',
    };

    const attributes$3 = {
      open: 'open',
      dataScrollTo: 'data-scroll-to',
      tooltipStopMousenterValue: 'data-tooltip-stop-mouseenter',
    };

    const sections$3 = {};

    class ScrollToElement {
      constructor(section) {
        this.section = section;
        this.container = section.container;
        this.scrollToButtons = this.container.querySelectorAll(selectors$3.scrollToElement);

        if (this.scrollToButtons.length) {
          this.init();
        }
      }

      init() {
        this.scrollToButtons.forEach((element) => {
          element.addEventListener('click', () => {
            const target = this.container.querySelector(element.getAttribute(attributes$3.dataScrollTo));

            if (!target || element.tagName === 'A') return;

            this.scrollToElement(target);
          });
        });
      }

      scrollToElement(element) {
        scrollTo(element.getBoundingClientRect().top + 1);

        const collapsibleElement = element.nextElementSibling.matches('details') ? element.nextElementSibling : null;

        if (collapsibleElement) {
          const collapsibleTrigger = collapsibleElement?.querySelector(selectors$3.collapsibleTrigger);
          const isOpen = collapsibleElement.hasAttribute(attributes$3.open);

          if (!isOpen) {
            collapsibleTrigger?.dispatchEvent(new Event('click'));
          }
        }

        const tooltips = document.querySelectorAll(`${selectors$3.tooltip}:not([${attributes$3.tooltipStopMousenterValue}])`);
        if (tooltips.length) {
          tooltips.forEach((tooltip) => {
            tooltip.setAttribute(attributes$3.tooltipStopMousenterValue, '');

            setTimeout(() => {
              tooltip.removeAttribute(attributes$3.tooltipStopMousenterValue);
            }, 1000);
          });
        }
      }
    }

    const scrollToElement = {
      onLoad() {
        sections$3[this.id] = new ScrollToElement(this);
      },
    };

    const selectors$2 = {
      scrollSpy: '[data-scroll-spy]',
    };

    const classes$1 = {
      selected: 'is-selected',
    };

    const attributes$2 = {
      scrollSpy: 'data-scroll-spy',
      mobile: 'data-scroll-spy-mobile',
      desktop: 'data-scroll-spy-desktop',
      triggerPoint: 'data-scroll-trigger-point',
    };

    const sections$2 = {};

    class ScrollSpy {
      constructor(container, element) {
        this.container = container;
        this.elementToSpy = element;
        this.anchorSelector = `[${attributes$2.scrollSpy}="#${this.elementToSpy.id}"]`;
        this.anchor = this.container.querySelector(this.anchorSelector);
        this.anchorSiblings = this.container.querySelectorAll(`[${attributes$2.scrollSpy}]`);
        this.initialized = false;

        if (!this.anchor) return;

        this.triggerPoint = this.anchor.getAttribute(attributes$2.triggerPoint);

        this.scrollCallback = () => this.onScroll();
        this.toggleScrollObserver = this.toggleScrollObserver.bind(this);
        this.init();
      }

      init() {
        this.toggleScrollObserver();
        document.addEventListener('theme:resize:width', this.toggleScrollObserver);
      }

      toggleScrollObserver() {
        if (this.isEligible()) {
          if (!this.initialized) {
            document.addEventListener('theme:scroll', this.scrollCallback);
            this.initialized = true;
          }
        } else {
          document.removeEventListener('theme:scroll', this.scrollCallback);
          this.initialized = false;
        }
      }

      isEligible() {
        const isDesktopView = isDesktop();
        const isMobileView = !isDesktopView;
        return (
          (isMobileView && this.anchor.hasAttribute(attributes$2.mobile)) ||
          (isDesktopView && this.anchor.hasAttribute(attributes$2.desktop)) ||
          (!this.anchor.hasAttribute(attributes$2.desktop) && !this.anchor.hasAttribute(attributes$2.mobile))
        );
      }

      onScroll() {
        this.top = this.elementToSpy.getBoundingClientRect().top;

        // Check element's visibility in the viewport
        const windowHeight = Math.round(window.innerHeight);
        const scrollTop = Math.round(window.scrollY);
        const scrollBottom = scrollTop + windowHeight;
        const elementOffsetTopPoint = Math.round(this.top + scrollTop);
        const elementHeight = this.elementToSpy.offsetHeight;
        const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
        const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
        const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
        const isInView = isTopOfElementReached && !isBottomOfElementPassed;

        if (!isInView) return;
        if (!this.triggerPointReached()) return;

        // Update active classes
        this.anchorSiblings.forEach((anchor) => {
          if (!anchor.matches(this.anchorSelector)) {
            anchor.classList.remove(classes$1.selected);
          }
        });

        this.anchor.classList.add(classes$1.selected);
      }

      triggerPointReached() {
        let triggerPointReached = false;

        switch (this.triggerPoint) {
          case 'top':
            triggerPointReached = this.top <= 0;
            break;

          case 'middle':
            triggerPointReached = this.top <= window.innerHeight / 2;
            break;

          case 'bottom':
            triggerPointReached = this.top <= window.innerHeight;
            break;

          default:
            triggerPointReached = this.top <= 0;
        }

        return triggerPointReached;
      }

      onUnload() {
        document.removeEventListener('theme:resize:width', this.toggleScrollObserver);
        document.removeEventListener('theme:scroll', this.scrollCallback);
      }
    }

    const scrollSpy = {
      onLoad() {
        sections$2[this.id] = [];

        this.container.querySelectorAll(selectors$2.scrollSpy)?.forEach((element) => {
          const scrollSpy = this.container.querySelector(element.getAttribute(attributes$2.scrollSpy));
          sections$2[this.id].push(new ScrollSpy(this.container, scrollSpy));
        });
      },
      onUnload() {
        sections$2[this.id].forEach((section) => {
          if (typeof section.onUnload === 'function') {
            section.onUnload();
          }
        });
      },
    };

    register('sidebar', [scrollToElement, scrollSpy]);

    const selectors$1 = {
      button: '[data-hover-target]',
      image: '[data-collection-image]',
    };

    const attributes$1 = {
      target: 'data-hover-target',
    };

    const classes = {
      visible: 'is-visible',
      selected: 'is-selected',
    };

    let sections$1 = {};

    class CollectionsHover {
      constructor(section) {
        this.container = section.container;
        this.buttons = this.container.querySelectorAll(selectors$1.button);

        this.init();
      }

      init() {
        if (this.buttons.length) {
          this.buttons.forEach((button) => {
            button.addEventListener('mouseenter', (e) => {
              const targetId = e.currentTarget.getAttribute(attributes$1.target);

              this.updateState(targetId);
            });
          });
        }
      }

      updateState(targetId) {
        const button = this.container.querySelector(`[${attributes$1.target}="${targetId}"]`);
        const target = this.container.querySelector(`#${targetId}:not(.${classes.visible})`);
        const buttonSelected = this.container.querySelector(`${selectors$1.button}.${classes.selected}`);
        const imageVisible = this.container.querySelector(`${selectors$1.image}.${classes.visible}`);

        if (target && isDesktop()) {
          imageVisible?.classList.remove(classes.visible);
          buttonSelected?.classList.remove(classes.selected);

          target.classList.add(classes.visible);
          button.classList.add(classes.selected);
        }
      }

      onBlockSelect(e) {
        this.updateState(e.target.id);
      }
    }

    const collectionsHover = {
      onLoad() {
        sections$1[this.id] = new CollectionsHover(this);
      },
      onBlockSelect(e) {
        sections$1[this.id].onBlockSelect(e);
      },
    };

    register('collections-hover', [collectionsHover, scrollSpy]);

    const selectors = {
      image: '[data-featured-image]',
      imagesHolder: '[data-featured-aside]',
      contentHolder: '[data-featured-content]',
      wrapper: '[data-featured-wrapper]',
    };

    const attributes = {
      horizontalScroll: 'data-horizontal-scroll',
      horizontalScrollReversed: 'data-horizontal-scroll-reversed',
    };

    const sections = {};

    class FeaturedProduct {
      constructor(section) {
        this.container = section.container;
        this.horizontalScroll = this.container.hasAttribute(attributes.horizontalScroll);
        this.horizontalScrollReversed = this.container.hasAttribute(attributes.horizontalScrollReversed);
        this.images = this.container.querySelectorAll(selectors.image);
        this.imagesHolder = this.container.querySelector(selectors.imagesHolder);
        this.contentHolder = this.container.querySelector(selectors.contentHolder);
        this.wrapper = this.container.querySelector(selectors.wrapper);
        this.requestAnimationSticky = null;
        this.lastPercent = 0;

        this.scrollEvent = () => this.scrollEvents();
        this.calculateHorizontalPositionEvent = () => this.calculateHorizontalPosition();
        this.calculateHeightEvent = () => this.calculateHeight();

        this.init();
      }

      init() {
        if (this.horizontalScroll && this.imagesHolder) {
          this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
          document.addEventListener('theme:scroll', this.scrollEvent);
        }

        if (this.wrapper && this.contentHolder && this.images.length) {
          this.calculateHeight();

          document.addEventListener('theme:resize:width', this.calculateHeightEvent);
        }
      }

      scrollEvents() {
        if (!this.requestAnimationSticky) {
          this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
        }
      }

      removeAnimationFrame() {
        if (this.requestAnimationSticky) {
          cancelAnimationFrame(this.requestAnimationSticky);
          this.requestAnimationSticky = null;
        }
      }

      calculateHorizontalPosition() {
        let scrollTop = window.scrollY + this.headerHeight;

        const windowBottom = scrollTop + window.innerHeight;
        const elemTop = this.imagesHolder.offsetTop;
        const elemHeight = this.imagesHolder.offsetHeight;
        const elemBottom = elemTop + elemHeight + this.headerHeight;
        const elemBottomTop = elemHeight - (window.innerHeight - this.headerHeight);
        const direction = this.horizontalScrollReversed ? 1 : -1;
        let percent = 0;

        if (scrollTop >= elemTop && windowBottom <= elemBottom) {
          percent = ((scrollTop - elemTop) / elemBottomTop) * 100;
        } else if (scrollTop < elemTop) {
          percent = 0;
        } else {
          percent = 100;
        }

        percent *= this.images.length - 1;

        this.container.style.setProperty('--translateX', `${percent * direction}%`);

        if (this.lastPercent !== percent) {
          this.requestAnimationSticky = requestAnimationFrame(this.calculateHorizontalPositionEvent);
        } else if (this.requestAnimationSticky) {
          this.removeAnimationFrame();
        }

        this.lastPercent = percent;
      }

      calculateHeight() {
        let {stickyHeaderHeight} = readHeights();
        this.container.style.removeProperty('--min-height');
        this.container.style.setProperty('--min-height', `${this.wrapper.offsetHeight + this.contentHolder.offsetHeight}px`);
        this.headerHeight = stickyHeaderHeight;
      }

      onUnload() {
        if (this.horizontalScroll && this.imagesHolder) {
          document.removeEventListener('theme:scroll', this.calculateHorizontalPositionEvent);
        }

        if (this.wrapper && this.contentHolder && this.images.length) {
          document.removeEventListener('theme:resize:width', this.calculateHeightEvent);
        }
      }
    }

    const featuredProduct = {
      onLoad() {
        sections[this.id] = new FeaturedProduct(this);
      },
      onUnload(e) {
        sections[this.id].onUnload(e);
      },
    };

    register('featured-product', [featuredProduct]);

    function getScript(url, callback, callbackError) {
      let head = document.getElementsByTagName('head')[0];
      let done = false;
      let script = document.createElement('script');
      script.src = url;

      // Attach handlers for all browsers
      script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
          done = true;
          callback();
        } else {
          callbackError();
        }
      };

      head.appendChild(script);
    }

    const loaders = {};

    function loadScript(options = {}) {
      if (!options.type) {
        options.type = 'json';
      }

      if (options.url) {
        if (loaders[options.url]) {
          return loaders[options.url];
        } else {
          return getScriptWithPromise(options.url, options.type);
        }
      } else if (options.json) {
        if (loaders[options.json]) {
          return Promise.resolve(loaders[options.json]);
        } else {
          return window
            .fetch(options.json)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              loaders[options.json] = response;
              return response;
            });
        }
      } else if (options.name) {
        const key = ''.concat(options.name, options.version);
        if (loaders[key]) {
          return loaders[key];
        } else {
          return loadShopifyWithPromise(options);
        }
      } else {
        return Promise.reject();
      }
    }

    function getScriptWithPromise(url, type) {
      const loader = new Promise((resolve, reject) => {
        if (type === 'text') {
          fetch(url)
            .then((response) => response.text())
            .then((data) => {
              resolve(data);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          getScript(
            url,
            function () {
              resolve();
            },
            function () {
              reject();
            }
          );
        }
      });

      loaders[url] = loader;
      return loader;
    }

    function loadShopifyWithPromise(options) {
      const key = ''.concat(options.name, options.version);
      const loader = new Promise((resolve, reject) => {
        try {
          window.Shopify.loadFeatures([
            {
              name: options.name,
              version: options.version,
              onLoad: (err) => {
                onLoadFromShopify(resolve, reject, err);
              },
            },
          ]);
        } catch (err) {
          reject(err);
        }
      });
      loaders[key] = loader;
      return loader;
    }

    function onLoadFromShopify(resolve, reject, err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    }

    document.addEventListener('DOMContentLoaded', function () {
      // Load all registered sections on the page.
      load('*');

      // Scroll to top button
      const scrollTopButton = document.querySelector('[data-scroll-top-button]');
      if (scrollTopButton) {
        scrollTopButton.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        });
        document.addEventListener('theme:scroll', () => {
          scrollTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight);
        });
      }

      if (window.self !== window.top) {
        document.querySelector('html').classList.add('iframe');
      }

      // Safari smoothscroll polyfill
      let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
      if (!hasNativeSmoothScroll) {
        loadScript({url: window.theme.assets.smoothscroll});
      }
    });

    // Apply a specific class to the html element for browser support of cookies.
    if (window.navigator.cookieEnabled) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

})(themeVendor.ScrollLock, themeVendor.Flickity, themeVendor.FlickityFade);
