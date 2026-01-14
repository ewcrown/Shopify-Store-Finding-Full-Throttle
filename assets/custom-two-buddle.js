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
    const FREE_GIFT_VARIANT_ID = 47687962558681;
    const FREE_KEY_TAG_VARIANT_ID = 47468490064089;
    // Cached elements / config
    let containers = null; // NodeList (cached) - refreshed when DOM changes significantly
    const containerCacheKey = 'free-gift-config';

    // State
    let isManagingGift = false;
    let lastCartFetch = { ts: 0, data: null };
    const CART_TTL = 300; // ms - reuse cart response if recent (reduced for faster updates)

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

    // Enhanced loader UI with visible spinner
    function createSpinner(){
      const spinner = document.createElement('div');
      spinner.className = 'free-gift-spinner';
      spinner.innerHTML = '<div class="spinner-ring"><div></div><div></div><div></div><div></div></div>';
      return spinner;
    }

    function toggleLoader(show, action){
      // const els = getContainers();
      // if (!els || !els.length) return;
      
      // // Show loader immediately (synchronous for instant feedback)
      // els.forEach(container => {
      //   container.classList.toggle('free-gift-managing', !!show);
      //   const msg = container.querySelector('.free-shipping__success-message, .free-shipping__default-message');
      //   let spinner = container.querySelector('.free-gift-spinner');
        
      //   if (show){
      //     // Ensure container is positioned for absolute spinner
      //     if (getComputedStyle(container).position === 'static') {
      //       container.style.position = 'relative';
      //     }
          
      //     // Show spinner immediately
      //     if (!spinner) {
      //       spinner = createSpinner();
      //       container.appendChild(spinner);
      //     }
      //     spinner.style.display = 'block';
          
      //     // Update message
      //     if (msg) {
      //       if (!msg.dataset._orig) msg.dataset._orig = msg.textContent;
      //       const actionText = action === 'adding' ? 'Adding free gift...' : action === 'removing' ? 'Removing free gift...' : 'Updating cart...';
      //       if (msg.textContent !== actionText) msg.textContent = actionText;
      //       msg.classList.add('is-loading');
      //     }
      //   } else {
      //     // Hide spinner
      //     if (spinner) spinner.style.display = 'none';
          
      //     // Restore message
      //     if (msg) {
      //       if (msg.dataset._orig) {
      //         msg.textContent = msg.dataset._orig;
      //         delete msg.dataset._orig;
      //       }
      //       msg.classList.remove('is-loading');
      //     }
      //   }
      // });
    }

    // Fast helpers
    const isFreeGiftInCart = (cart) => !!(cart && cart.items && cart.items.some(i => i.variant_id === FREE_GIFT_VARIANT_ID));
    const getFreeGiftLineItem = (cart) => cart?.items?.find(i => i.variant_id === FREE_GIFT_VARIANT_ID) || null;
    const isVariantInCart = (cart, variantId) =>
  cart?.items?.some(i => i.variant_id === variantId);

const getGiftLineItem = (cart, variantId) =>
  cart?.items?.find(i => i.variant_id === variantId) || null;

    // Remove gift - optimized for speed
    async function removeFreeGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'removing');
      
      // Show loader immediately using requestAnimationFrame for instant feedback
      requestAnimationFrame(() => {
        const cartPromise = getCartState(true);
        cartPromise.then(async (cart) => {
          if (!cart) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const idx = cart.items.findIndex(i => i.variant_id === FREE_GIFT_VARIANT_ID);
          if (idx === -1) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const line = idx + 1;
          try {
            const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ line, quantity: 0 })
            });
            if (res.ok) {
              lastCartFetch = { ts: 0, data: null };
              document.dispatchEvent(new CustomEvent('theme:cart:refresh'));
            }
          } catch(e) { 
            console.error(e); 
          } finally {
            toggleLoader(false);
            setTimeout(()=> isManagingGift = false, 50);
          }
        }).catch(e => {
          console.error(e);
          toggleLoader(false);
          isManagingGift = false;
        });
      });
    }
    // Remove Key - optimized for speed
    async function removeKeyGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'removing');
      
      // Show loader immediately using requestAnimationFrame for instant feedback
      requestAnimationFrame(() => {
        const cartPromise = getCartState(true);
        cartPromise.then(async (cart) => {
          if (!cart) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const idx = cart.items.findIndex(i => i.variant_id === FREE_KEY_TAG_VARIANT_ID);
          if (idx === -1) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const line = idx + 1;
          try {
            const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ line, quantity: 0 })
            });
            if (res.ok) {
              lastCartFetch = { ts: 0, data: null };
              document.dispatchEvent(new CustomEvent('theme:cart:refresh'));
            }
          } catch(e) { 
            console.error(e); 
          } finally {
            toggleLoader(false);
            setTimeout(()=> isManagingGift = false, 50);
          }
        }).catch(e => {
          console.error(e);
          toggleLoader(false);
          isManagingGift = false;
        });
      });
    }

    // Add gift - optimized for speed
    async function addFreeGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'adding');
      
      // Show loader immediately using requestAnimationFrame for instant feedback
      requestAnimationFrame(async () => {
        try {
          const cart = await getCartState();
          if (cart && isFreeGiftInCart(cart)) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
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
        } catch(e) { 
          console.error(e); 
        } finally {
          toggleLoader(false);
          setTimeout(()=> isManagingGift = false, 50);
        }
      });
    }
    // Add Key Tag - optimized for speed
   async function addKeyGift(){
  if (isManagingGift) return;
  isManagingGift = true;
  toggleLoader(true, 'adding');
  
  requestAnimationFrame(async () => {
    try {
      const cart = await getCartState();
      // Check if KEY TAG is already in cart, not t-shirt
      if (cart && isVariantInCart(cart, FREE_KEY_TAG_VARIANT_ID)) {
        toggleLoader(false);
        isManagingGift = false;
        return;
      }
      const fd = new FormData();
      fd.append('id', String(FREE_KEY_TAG_VARIANT_ID));
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
    } catch(e) { 
      console.error(e); 
    } finally {
      toggleLoader(false);
      setTimeout(()=> isManagingGift = false, 50);
    }
  });
}

    // Manage gift based on cart state - single source of truth
  async function manageFreeGift(){
  if (isManagingGift) return;

  const containers = getContainers();
  if (!containers.length) return;

  const cart = await getCartState();
  if (!cart) return;

  const apiTotal = (cart.total_price || 0) / 100;

  // subtract BOTH gifts from total
  let totalWithoutGifts = apiTotal;

  [FREE_GIFT_VARIANT_ID, FREE_KEY_TAG_VARIANT_ID].forEach(id => {
    const g = getGiftLineItem(cart, id);
    if (g) {
      const price = (g.final_price || g.price || 0) / 100;
      totalWithoutGifts -= price;
    }
  });

  const hasTshirt = isVariantInCart(cart, FREE_GIFT_VARIANT_ID);
  const hasKeyTag = isVariantInCart(cart, FREE_KEY_TAG_VARIANT_ID);

  // 🔥 TIER LOGIC - CORRECTED
  if (totalWithoutGifts >= 99) {
    // $99+ tier: Should have t-shirt AND key tag
    if (!hasTshirt) {
      await addFreeGift();
    }
    if (!hasKeyTag) {
      await addKeyGift();
    }
    return;
  }

  if (totalWithoutGifts >= 75) {
    // $75-98.99 tier: Should have key tag ONLY
    if (!hasKeyTag) {
      await addKeyGift();
    }
    // Remove t-shirt if present (we're below $99 threshold)
    if (hasTshirt) {
      await removeFreeGift();
    }
    return;
  }

  // Below $75 → remove all gifts
  if (hasTshirt) {
    await removeFreeGift();
  }
  if (hasKeyTag) {
    await removeKeyGift();
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
        if (showShipping && giftMilestone && showGift) newMsg = 'Congratulations! Your order qualifies for free shipping including Free key Tag with a free FFT Signature Shirt';
        else if (showShipping && giftMilestone && !showGift) newMsg = `You are $${(giftThreshold - cartTotal).toFixed(2)} away from a FREE SHIRT`;
        else if (showShipping) newMsg = 'Congratulations! Your order qualifies for free shipping';
        else newMsg = `You are $${(shippingLimit - cartTotal).toFixed(2)} away from FREE SHIPPING with KEY TAG!`;
        if (msgEl.textContent.trim() !== newMsg) msgEl.textContent = newMsg;
      }

      // Ask manageFreeGift to reconcile API state (non-blocking)
      manageFreeGift();
    }

    // Debounced update - optimized for faster response
    let debounceTimer = 0;
    function scheduleUpdate(ms = 30){
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        requestAnimationFrame(updateMilestonesFast);
      }, ms);
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
      if (should) scheduleUpdate(20);
    });

    observer.observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['data-cart-total','class']});
    const cartDrawer = document.querySelector('#cart-drawer');
    if (cartDrawer) observer.observe(cartDrawer, {attributes: true, childList: true, subtree: true});

    // Events: listen to a concise set, avoid duplicating work - faster response
    ['theme:cart:update','theme:cart:change','theme:product:added','cart:updated'].forEach(ev => {
      document.addEventListener(ev, () => scheduleUpdate(15));
    });

    // Input/button listeners - lightweight, faster response
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart__quantity-minus, .cart__quantity-plus, .quantity__minus, .quantity__plus, button[name="decrease"], button[name="increase"]');
      if (btn) scheduleUpdate(20);
    }, {passive: true});

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.matches('input[data-qty]') || e.target.matches('input[name*="quantity"]'))) scheduleUpdate(30);
    }, {passive: true});

    // Periodic safety check - more frequent for better sync
    setInterval(()=> scheduleUpdate(100), 3000);

    // Initial run - immediate
    requestAnimationFrame(() => scheduleUpdate(0));
  }
})();

// Size Swatches with Add to Cart functionality - Optimized
(function(){
  'use strict';

  let isProcessing = false;
  const processingSwatches = new Set();

  if (typeof theme === 'undefined') {
    window.addEventListener('DOMContentLoaded', () => initSizeSwatches());
  } else {
    initSizeSwatches();
  }

  function initSizeSwatches(){
    const sizeSwatches = document.querySelectorAll('.size-swatch:not([disabled])');
    
    sizeSwatches.forEach(swatch => {
      if (!swatch.hasAttribute('data-size-listener')) {
        swatch.setAttribute('data-size-listener', 'true');
        swatch.addEventListener('click', handleSizeSwatchClick, { passive: true });
      }
    });
  }

  function handleSizeSwatchClick(e){
    e.preventDefault();
    e.stopPropagation();
    
    const swatch = e.currentTarget;
    const variantId = swatch.getAttribute('data-variant-id');
    const productHandle = swatch.getAttribute('data-product-handle');
    
    if (!variantId || swatch.disabled || swatch.classList.contains('is-loading') || processingSwatches.has(swatch)) {
      return;
    }

    // Use requestAnimationFrame for instant visual feedback
    requestAnimationFrame(() => {
      addToCartFromSizeSwatch(swatch, variantId, productHandle);
    });
  }

  async function addToCartFromSizeSwatch(swatch, variantId, productHandle){
    // Prevent duplicate clicks
    if (processingSwatches.has(swatch)) return;
    processingSwatches.add(swatch);

    // Immediate visual feedback
    swatch.classList.add('is-loading');
    swatch.disabled = true;

    const productContainer = swatch.closest('.product-item__size-swatches');
    const allSwatches = productContainer ? productContainer.querySelectorAll('.size-swatch') : [];
    
    // Disable other swatches temporarily
    allSwatches.forEach(s => {
      if (s !== swatch) {
        s.classList.add('is-disabled');
        s.disabled = true;
      }
    });

    try {
      // Use the theme's cart system if available for better integration
      const cartItems = document.querySelector('cart-items');
      
      if (cartItems && typeof cartItems.addToCart === 'function') {
        // Use theme's addToCart method for better integration
        const formData = new FormData();
        formData.append('id', variantId);
        formData.append('quantity', '1');
        
        // Create a temporary button for the theme's addToCart method
        const tempButton = document.createElement('button');
        tempButton.setAttribute('data-add-to-cart', '');
        tempButton.style.display = 'none';
        
        cartItems.addToCart(formData, tempButton);
        
        // Wait a bit for the cart to update
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Fallback to direct fetch - optimized
        const formData = new FormData();
        formData.append('id', variantId);
        formData.append('quantity', '1');

        const cartAddUrl = window.theme?.routes?.cart_add_url || '/cart/add.js';
        
        const response = await fetch(cartAddUrl, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
          body: formData,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.status) {
          throw new Error(data.description || 'Failed to add to cart');
        }

        // Dispatch cart:add event to trigger theme's cart system
        document.dispatchEvent(new CustomEvent('theme:cart:add', {
          detail: { variantId, quantity: 1 },
          bubbles: true
        }));
      }

      // Success - immediate visual feedback
      swatch.classList.remove('is-loading');
      swatch.classList.add('is-added');
      
      // Dispatch cart refresh immediately
      document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
      
      // Dispatch product added event (this triggers cart drawer opening)
      document.dispatchEvent(new CustomEvent('theme:product:added', {
        detail: { 
          variantId, 
          productHandle,
          response: { items: [{ variant_id: parseInt(variantId), quantity: 1 }] }
        },
        bubbles: true
      }));
      
      // Also explicitly trigger cart drawer if it exists
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.openCartDrawer === 'function') {
        setTimeout(() => {
          cartDrawer.openCartDrawer(true);
        }, 50);
      }

      // Reset UI after brief delay
      setTimeout(() => {
        swatch.classList.remove('is-added');
        resetSwatches(allSwatches);
        processingSwatches.delete(swatch);
      }, 1500);

    } catch (error) {
      console.error('Error adding to cart:', error);
      swatch.classList.remove('is-loading');
      swatch.classList.add('is-error');
      
      // Show error briefly, then reset
      setTimeout(() => {
        swatch.classList.remove('is-error');
        resetSwatches(allSwatches);
        processingSwatches.delete(swatch);
      }, 2000);
    }
  }

  function resetSwatches(swatches) {
    swatches.forEach(s => {
      s.classList.remove('is-disabled', 'is-loading', 'is-added', 'is-error');
      const isAvailable = s.getAttribute('data-variant-id') && !s.classList.contains('size-swatch--soldout');
      s.disabled = !isAvailable;
    });
  }

  // Re-initialize when new products are loaded (optimized observer)
  const observer = new MutationObserver((mutations) => {
    let hasNewSwatches = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const newSwatches = node.querySelectorAll ? node.querySelectorAll('.size-swatch:not([disabled]):not([data-size-listener])') : [];
          if (newSwatches.length > 0) {
            hasNewSwatches = true;
            newSwatches.forEach(swatch => {
              swatch.setAttribute('data-size-listener', 'true');
              swatch.addEventListener('click', handleSizeSwatchClick, { passive: true });
            });
          }
        }
      });
    });
  });

  // Observe only product items to reduce overhead
  const productItems = document.querySelectorAll('.product-item');
  productItems.forEach(item => {
    observer.observe(item, { childList: true, subtree: true });
  });
  
  // Also observe body for dynamically added product grids
  observer.observe(document.body, { childList: true, subtree: false });
})();