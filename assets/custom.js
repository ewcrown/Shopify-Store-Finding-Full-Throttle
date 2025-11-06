(function(){
  'use strict';
  // Optimized free-gift manager - focuses on fewer DOM queries, cached state,
  // throttled API calls and smaller observer scope for faster updates.

  if (typeof theme === 'undefined') {
    window.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  function init(){
    const FREE_GIFT_VARIANT_ID = 47468490064089;

    // Cached elements / config
    let containers = null; // NodeList (cached) - refreshed when DOM changes significantly
    const containerCacheKey = 'free-gift-config';

    // State
    let isManagingGift = false;
    let lastCartFetch = { ts: 0, data: null };
    const CART_TTL = 600; // ms - reuse cart response if recent

    // Throttle getCartState so we don't hammer /cart.js
    async function getCartState(force = false){
      const now = Date.now();
      if (!force && lastCartFetch.data && (now - lastCartFetch.ts) < CART_TTL) return lastCartFetch.data;
      try {
        const res = await fetch('/cart.js', {cache: 'no-store'});
        if (!res.ok) throw new Error('cart fetch failed');
        const json = await res.json();
        lastCartFetch = { ts: now, data: json };
        return json;
      } catch (e){
        return lastCartFetch.data || null;
      }
    }

    // Utility - get containers (cached)
    function getContainers(refresh = false){
      if (!containers || refresh) containers = document.querySelectorAll('[data-free-shipping-limit]');
      return containers;
    }

    // Minimal loader UI - only toggles class & text once
    function toggleLoader(show, action){
      const els = getContainers();
      if (!els || !els.length) return;
      els.forEach(container => {
        container.classList.toggle('free-gift-managing', !!show);
        const msg = container.querySelector('.free-shipping__success-message, .free-shipping__default-message');
        if (!msg) return;
        if (show){
          if (!msg.dataset._orig) msg.dataset._orig = msg.textContent;
          msg.textContent = action === 'adding' ? 'Adding free gift...' : action === 'removing' ? 'Removing free gift...' : 'Updating cart...';
          msg.classList.add('is-loading');
        } else {
          if (msg.dataset._orig) msg.textContent = msg.dataset._orig;
          msg.classList.remove('is-loading');
          delete msg.dataset._orig;
        }
      });
    }

    // Fast helpers
    const isFreeGiftInCart = (cart) => !!(cart && cart.items && cart.items.some(i => i.variant_id === FREE_GIFT_VARIANT_ID));
    const getFreeGiftLineItem = (cart) => cart?.items?.find(i => i.variant_id === FREE_GIFT_VARIANT_ID) || null;

    // Remove gift - simplified and faster
    async function removeFreeGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'removing');
      try{
        const cart = await getCartState(true);
        if (!cart) return;
        const idx = cart.items.findIndex(i => i.variant_id === FREE_GIFT_VARIANT_ID);
        if (idx === -1) return;
        const line = idx + 1;
        const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, quantity: 0 })
        });
        if (res.ok) {
          lastCartFetch = { ts: 0, data: null }; // invalidate cache
          document.dispatchEvent(new CustomEvent('theme:cart:refresh'));
        }
      }catch(e){ console.error(e); }
      finally{
        toggleLoader(false);
        setTimeout(()=> isManagingGift = false, 150);
      }
    }

    // Add gift - simplified and faster
    async function addFreeGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'adding');
      try{
        const cart = await getCartState();
        if (cart && isFreeGiftInCart(cart)) return;
        const fd = new FormData();
        fd.append('id', String(FREE_GIFT_VARIANT_ID));
        fd.append('quantity','1');
        fd.append('properties[_free_gift]','true');
        const res = await fetch(window.theme?.routes?.cart_add_url || '/cart/add.js', {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: fd
        });
        if (res.ok){
          lastCartFetch = { ts: 0, data: null };
          document.dispatchEvent(new CustomEvent('theme:cart:refresh'));
        }
      }catch(e){ console.error(e); }
      finally{
        toggleLoader(false);
        setTimeout(()=> isManagingGift = false, 200);
      }
    }

    // Manage gift based on cart state - single source of truth
    async function manageFreeGift(){
      if (isManagingGift) return;
      const containers = getContainers();
      if (!containers || !containers.length) return;
      const container = containers[0];
      const giftThreshold = parseFloat(container.getAttribute('data-free-gift-threshold')) || 99;

      const cart = await getCartState();
      if (!cart) return;
      const apiTotal = (cart.total_price || 0) / 100;
      const giftInCart = isFreeGiftInCart(cart);
      let totalWithoutGift = apiTotal;
      if (giftInCart){
        const g = getFreeGiftLineItem(cart);
        const gp = (g?.final_price || g?.price || 0) / 100;
        totalWithoutGift = apiTotal - gp;
      }

      if (totalWithoutGift >= giftThreshold && !giftInCart){
        addFreeGift();
      } else if (totalWithoutGift < giftThreshold && giftInCart){
        removeFreeGift();
      }
    }

    // Update UI milestones (fast, minimal DOM touches)
    function updateMilestonesFast(){
      const containers = getContainers();
      if (!containers || !containers.length) return;
      const container = containers[0];
      const shippingLimit = parseFloat(container.getAttribute('data-free-shipping-limit')) || 75;
      const giftThreshold = parseFloat(container.getAttribute('data-free-gift-threshold')) || 99;

      // Try to read a single authoritative source for cart total first
      let cartTotal = 0;
      const totalEl = document.querySelector('[data-cart-total]');
      if (totalEl){
        const v = parseFloat(totalEl.getAttribute('data-cart-total')) || 0;
        if (v > 0) cartTotal = v / 100;
      }

      // If not present, compute from visible cart items quickly
      if (cartTotal === 0){
        const items = document.querySelectorAll('[data-cart-item]');
        if (items && items.length){
          let calc = 0;
          items.forEach(it => {
            const lp = it.querySelector('[data-line-price]');
            const q = it.querySelector('input[type="number"]')?.value || it.querySelector('[data-qty]')?.textContent || '1';
            const qty = parseFloat(q) || 1;
            let price = 0;
            if (lp) price = parseFloat(lp.getAttribute('data-line-price')) || parseFloat((lp.textContent||'').replace(/[^0-9.]/g,'')) || 0;
            else price = parseFloat(it.querySelector('[data-item-price]')?.getAttribute('data-item-price') || it.querySelector('[data-price]')?.getAttribute('data-price') || (it.querySelector('.cart__price')?.textContent||'').replace(/[^0-9.]/g,'')) || 0;
            if (price > 1000) price = price/100;
            calc += (price * (qty || 1));
          });
          if (calc > 0) cartTotal = calc;
        }
      }

      // Update progress bar & messages with minimal writes
      const shippingMilestone = container.querySelector('.free-shipping__milestone--shipping');
      const giftMilestone = container.querySelector('.free-shipping__milestone--gift');
      const showShipping = cartTotal >= shippingLimit;
      const showGift = cartTotal >= giftThreshold;

      if (shippingMilestone){
        shippingMilestone.classList.toggle('is-reached', showShipping);
      }
      if (giftMilestone){
        giftMilestone.classList.toggle('is-reached', showGift);
      }

      container.classList.toggle('has-free-shipping', showShipping);
      container.classList.toggle('has-free-gift', showGift);

      const progressBar = container.querySelector('[data-progress-bar]');
      if (progressBar){
        const max = giftMilestone ? giftThreshold : shippingLimit;
        const pct = max > 0 ? Math.min((cartTotal / max) * 100, 100) : 0;
        progressBar.setAttribute('value', pct.toFixed(2));
      }

      // Message
      const msgEl = container.querySelector('.free-shipping__success-message, .free-shipping__default-message');
      if (msgEl){
        let newMsg = '';
        if (showShipping && giftMilestone && showGift) newMsg = 'Congratulations! Your order qualifies for free shipping with a free gift';
        else if (showShipping && giftMilestone && !showGift) newMsg = `You are $${(giftThreshold - cartTotal).toFixed(2)} away from a FREE Key Tag!`;
        else if (showShipping) newMsg = 'Congratulations! Your order qualifies for free shipping';
        else newMsg = `You are $${(shippingLimit - cartTotal).toFixed(2)} away from FREE SHIPPING!`;
        if (msgEl.textContent.trim() !== newMsg) msgEl.textContent = newMsg;
      }

      // Ask manageFreeGift to reconcile API state (non-blocking)
      manageFreeGift();
    }

    // Debounced update
    let debounceTimer = 0;
    function scheduleUpdate(ms = 60){
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateMilestonesFast, ms);
    }

    // Observe smaller scope: only body + potential cart drawer to reduce overhead
    const observer = new MutationObserver((mutations) => {
      let should = false;
      for (const m of mutations){
        if (m.type === 'attributes' && (m.attributeName === 'data-cart-total' || m.attributeName === 'class')){
          should = true; break;
        }
        if (m.addedNodes && m.addedNodes.length){
          should = true; break;
        }
      }
      if (should) scheduleUpdate(40);
    });

    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-cart-total','class']});
    const cartDrawer = document.querySelector('#cart-drawer');
    if (cartDrawer) observer.observe(cartDrawer, {attributes: true, childList: true, subtree: true});

    // Events: listen to a concise set, avoid duplicating work
    ['theme:cart:update','theme:cart:change','theme:product:added','cart:updated'].forEach(ev => {
      document.addEventListener(ev, () => scheduleUpdate(30));
    });

    // Input/button listeners - lightweight
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart__quantity-minus, .cart__quantity-plus, .quantity__minus, .quantity__plus, button[name="decrease"], button[name="increase"]');
      if (btn) scheduleUpdate(40);
    }, {passive: true});

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.matches('input[data-qty]') || e.target.matches('input[name*="quantity"]'))) scheduleUpdate(60);
    }, {passive: true});

    // Periodic safety check - less frequent
    setInterval(()=> scheduleUpdate(200), 5000);

    // Initial run
    scheduleUpdate(10);
  }
})();