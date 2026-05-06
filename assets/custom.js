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
    const DEFAULT_FREE_KEY_TAG_VARIANT_ID = 47468490064089;
    const DEFAULT_FREE_SHIRT_HANDLE = 'free-fft-speed-limit-shirt';
    const DEFAULT_FREE_SHIRT_THRESHOLD = 99;
    // Cached elements / config
    let containers = null; // NodeList (cached) - refreshed when DOM changes significantly
    const containerCacheKey = 'free-gift-config';

    // State
    let isManagingGift = false;
    let lastCartFetch = { ts: 0, data: null };
    const CART_TTL = 300; // ms - reuse cart response if recent (reduced for faster updates)
    let freeShirtProduct = null;
    let freeShirtVariantIds = null;
    let freeShirtModal = null;
    let freeShirtModalOpen = false;
    let freeShirtModalDismissed = false;
    let isFreeShirtFetching = false;

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

    function getPromoConfig(refresh = false){
      const els = getContainers(refresh);
      const container = els && els.length ? els[0] : null;
      const freeGiftVariantId = Number(container?.getAttribute('data-free-gift-variant-id')) || DEFAULT_FREE_KEY_TAG_VARIANT_ID;
      const freeShirtHandle =
        (container?.getAttribute('data-free-shirt-product-handle') || '').trim() ||
        (container?.getAttribute('data-free-gift-product-handle') || '').trim() ||
        DEFAULT_FREE_SHIRT_HANDLE;
      const giftThreshold =
        parseFloat(container?.getAttribute('data-free-shirt-threshold')) ||
        parseFloat(container?.getAttribute('data-free-gift-threshold')) ||
        DEFAULT_FREE_SHIRT_THRESHOLD;
      const shippingLimit = parseFloat(container?.getAttribute('data-free-shipping-limit')) || 75;
      return { freeGiftVariantId, freeShirtHandle, giftThreshold, shippingLimit };
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
    const isVariantInCart = (cart, variantId) =>
      cart?.items?.some(i => i.variant_id === variantId);

    const getGiftLineItem = (cart, variantId) =>
      cart?.items?.find(i => i.variant_id === variantId) || null;

    async function getFreeShirtProduct(){
      if (freeShirtProduct) return freeShirtProduct;
      if (isFreeShirtFetching) return null;
      isFreeShirtFetching = true;
      try {
        const { freeShirtHandle } = getPromoConfig();
        if (!freeShirtHandle) return null;
        const res = await fetch(`/products/${freeShirtHandle}.js`, { cache: 'no-store' });
        if (!res.ok) throw new Error('product fetch failed');
        freeShirtProduct = await res.json();
        freeShirtVariantIds = (freeShirtProduct.variants || []).map(v => v.id);
        return freeShirtProduct;
      } catch (e){
        console.error(e);
        return null;
      } finally {
        isFreeShirtFetching = false;
      }
    }

    function cartHasFreeShirt(cart){
      if (!cart || !freeShirtVariantIds || !freeShirtVariantIds.length) return false;
      return cart.items?.some(i => freeShirtVariantIds.includes(i.variant_id)) || false;
    }

    async function removeFreeShirt(){
      if (isManagingGift) return;
      if (!freeShirtVariantIds || !freeShirtVariantIds.length) return;
      isManagingGift = true;
      toggleLoader(true, 'removing');

      requestAnimationFrame(() => {
        const cartPromise = getCartState(true);
        cartPromise.then(async (cart) => {
          if (!cart) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const linesToRemove = [];
          cart.items.forEach((item, idx) => {
            if (freeShirtVariantIds.includes(item.variant_id)) linesToRemove.push(idx + 1);
          });
          if (!linesToRemove.length) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          try {
            for (const line of linesToRemove) {
              const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ line, quantity: 0 })
              });
              if (!res.ok) break;
            }
            lastCartFetch = { ts: 0, data: null };
            document.dispatchEvent(new CustomEvent('theme:cart:refresh'));
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

    function ensureFreeShirtModalStyles(){
      if (document.getElementById('free-shirt-modal-styles')) return;
      const style = document.createElement('style');
      style.id = 'free-shirt-modal-styles';
      style.textContent = `
        .free-shirt-modal { position: fixed; inset: 0; z-index: 10000; display: none; }
        .free-shirt-modal.is-open { display: block; }
        .free-shirt-modal__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }
        .free-shirt-modal__content {
          position: relative;
          width: min(720px, 92vw);
          margin: 6vh auto;
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.28);
          transform: translateY(8px);
          opacity: 0;
          transition: opacity .2s ease, transform .2s ease;
        }
        .free-shirt-modal.is-open .free-shirt-modal__content { opacity: 1; transform: translateY(0); }
        .free-shirt-modal__header { font-size: 22px; font-weight: 600; margin-bottom: 8px; text-transform: capitalize; }
        .free-shirt-modal__sub { color: #6f6f6f; font-size: 14px; margin-bottom: 16px; }
        .free-shirt-modal__body { display: grid; gap: 20px; }
        .free-shirt-modal__grid { display: grid; gap: 18px; align-items: start; }
        .free-shirt-modal__media {
          border-radius: 10px;
          overflow: hidden;
          background: #f6f6f6;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .free-shirt-modal__media img { width: 100%; height: 100%; object-fit: cover; }
        .free-shirt-modal__field { display: grid; gap: 6px; }
        .free-shirt-modal__field label { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #6f6f6f; }
        .free-shirt-modal__select { width: 100%; padding: 10px 12px; border: 1px solid #d5d5d5; border-radius: 6px; background: #fff; }
        .free-shirt-modal__actions { display: grid; gap: 10px; }
        .free-shirt-modal__actions .btn { width: 100%; }
        .free-shirt-modal__close {
          position: absolute; top: 12px; right: 12px;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid #e5e5e5; background: #fff; font-size: 20px; cursor: pointer;
        }
        .free-shirt-modal__note { font-size: 13px; color: #666; }
        .free-shirt-modal__error { color: #b11; }
        body.free-shirt-modal-open { overflow: hidden; }
        @media (min-width: 740px){
          .free-shirt-modal__grid { grid-template-columns: 1fr 1.1fr; }
        }
        @media (max-width: 520px){
          .free-shirt-modal__content { padding: 18px; }
          .free-shirt-modal__header { font-size: 20px; }
        }
      `;
      document.head.appendChild(style);
    }

    function createFreeShirtModal(product){
      ensureFreeShirtModalStyles();
      const modal = document.createElement('div');
      modal.className = 'free-shirt-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');

      const featuredImage = product?.images?.[0] || '';
      const defaultVariant = (product.variants || []).find(v => v.available) || (product.variants || [])[0];
      const optionMarkup = (product.options || []).map((opt, idx) => {
        const values = opt.values || [];
        const optionsHtml = values.map(v => `<option value="${v.replace(/"/g, '&quot;')}">${v}</option>`).join('');
        return `
          <div class="free-shirt-modal__field">
            <label>${opt.name}</label>
            <select class="free-shirt-modal__select" data-option-index="${idx}">
              ${optionsHtml}
            </select>
          </div>
        `;
      }).join('');

      modal.innerHTML = `
        <div class="free-shirt-modal__backdrop" data-free-shirt-close></div>
        <div class="free-shirt-modal__content">
          <button class="free-shirt-modal__close" aria-label="Close" data-free-shirt-close>&times;</button>
          <div class="free-shirt-modal__header">Claim your free shirt</div>
          <div class="free-shirt-modal__sub">Choose your size and color — free with $99+ order.</div>
          <div class="free-shirt-modal__body">
            <div class="free-shirt-modal__grid">
              <div class="free-shirt-modal__media">${featuredImage ? `<img data-free-shirt-image src="${featuredImage}" alt="${product.title}">` : ''}</div>
              <div class="free-shirt-modal__options">
                ${optionMarkup}
                <div class="free-shirt-modal__actions">
                  <button class="btn btn--primary btn--solid free-shirt-modal__add" type="button">Add free shirt</button>
                  <span class="free-shirt-modal__note">Limit 1 per order.</span>
                  <div class="free-shirt-modal__note free-shirt-modal__error" style="display:none;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (defaultVariant) {
        const selects = modal.querySelectorAll('[data-option-index]');
        selects.forEach((sel, idx) => {
          sel.value = defaultVariant.options[idx];
        });
      }

      modal.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[data-free-shirt-close]')) closeFreeShirtModal();
      });
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFreeShirtModal();
      });
      document.body.appendChild(modal);
      return modal;
    }

    function getSelectedVariant(product, modal){
      const selects = modal.querySelectorAll('[data-option-index]');
      const selectedOptions = Array.from(selects).map(sel => sel.value);
      return product.variants.find(v => {
        return selectedOptions.every((val, idx) => v.options[idx] === val);
      }) || null;
    }

    function updateFreeShirtModalState(product, modal){
      const addBtn = modal.querySelector('.free-shirt-modal__add');
      const errorEl = modal.querySelector('.free-shirt-modal__error');
      const variant = getSelectedVariant(product, modal);
      const imgEl = modal.querySelector('[data-free-shirt-image]');
      if (imgEl && variant?.featured_image?.src) {
        imgEl.src = variant.featured_image.src;
        imgEl.alt = `${product.title} - ${variant.title}`;
      }
      if (!variant || !variant.available) {
        addBtn.disabled = true;
        if (errorEl) {
          errorEl.style.display = 'block';
          errorEl.textContent = 'Selected variant is unavailable.';
        }
        return null;
      }
      addBtn.disabled = false;
      if (errorEl) errorEl.style.display = 'none';
      return variant;
    }

    function openFreeShirtModal(product){
      if (freeShirtModalOpen || freeShirtModalDismissed) return;
      if (!freeShirtModal) freeShirtModal = createFreeShirtModal(product);

      const selects = freeShirtModal.querySelectorAll('[data-option-index]');
      selects.forEach(sel => {
        if (!sel.dataset.freeShirtBound) {
          sel.dataset.freeShirtBound = 'true';
          sel.addEventListener('change', () => updateFreeShirtModalState(product, freeShirtModal), { passive: true });
        }
      });
      const addBtn = freeShirtModal.querySelector('.free-shirt-modal__add');
      addBtn.textContent = 'Add free shirt';
      addBtn.onclick = async () => {
        const variant = updateFreeShirtModalState(product, freeShirtModal);
        if (!variant || addBtn.disabled) return;
        addBtn.disabled = true;
        addBtn.textContent = 'Adding...';
        try {
          const fd = new FormData();
          fd.append('id', String(variant.id));
          fd.append('quantity','1');
          fd.append('properties[_free_gift]','true');
          const res = await fetch(window.theme?.routes?.cart_add_url || '/cart/add.js', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: fd
          });
          if (!res.ok) throw new Error('add failed');
          lastCartFetch = { ts: 0, data: null };
          document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
          document.dispatchEvent(new CustomEvent('theme:product:added', {
            detail: { variantId: variant.id, quantity: 1 },
            bubbles: true
          }));
          closeFreeShirtModal();
        } catch (e){
          console.error(e);
          addBtn.disabled = false;
          addBtn.textContent = 'Add free shirt';
        }
      };

      updateFreeShirtModalState(product, freeShirtModal);
      freeShirtModal.classList.add('is-open');
      freeShirtModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('free-shirt-modal-open');
      freeShirtModalOpen = true;
    }

    function closeFreeShirtModal(){
      if (!freeShirtModal) return;
      freeShirtModal.classList.remove('is-open');
      freeShirtModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('free-shirt-modal-open');
      freeShirtModalOpen = false;
      freeShirtModalDismissed = true;
    }

    // Remove Key Tag - optimized for speed
    async function removeKeyGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'removing');
      const { freeGiftVariantId } = getPromoConfig();
      
      // Show loader immediately using requestAnimationFrame for instant feedback
      requestAnimationFrame(() => {
        const cartPromise = getCartState(true);
        cartPromise.then(async (cart) => {
          if (!cart) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const idx = cart.items.findIndex(i => i.variant_id === freeGiftVariantId);
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

    // Add Key Tag - optimized for speed
    async function addKeyGift(){
      if (isManagingGift) return;
      isManagingGift = true;
      toggleLoader(true, 'adding');
      const { freeGiftVariantId } = getPromoConfig();
      
      requestAnimationFrame(async () => {
        try {
          const cart = await getCartState();
          // Check if KEY TAG is already in cart
          if (cart && isVariantInCart(cart, freeGiftVariantId)) {
            toggleLoader(false);
            isManagingGift = false;
            return;
          }
          const fd = new FormData();
          fd.append('id', String(freeGiftVariantId));
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

    // Manage gift based on cart state - single source of truth ($75/$99 thresholds)
    async function manageFreeGift(){
      if (isManagingGift) return;

      const containers = getContainers();
      if (!containers.length) return;

      const cart = await getCartState();
      if (!cart) return;
      const { freeGiftVariantId, giftThreshold, shippingLimit } = getPromoConfig();

      const apiTotal = (cart.total_price || 0) / 100;

      // subtract gifts from total
      let totalWithoutGift = apiTotal;
      const g = getGiftLineItem(cart, freeGiftVariantId);
      if (g) {
        const price = (g.final_price || g.price || 0) / 100;
        totalWithoutGift -= price;
      }
      if (!freeShirtVariantIds) await getFreeShirtProduct();
      if (freeShirtVariantIds && freeShirtVariantIds.length) {
        const shirtLine = cart.items?.find(i => freeShirtVariantIds.includes(i.variant_id));
        if (shirtLine) {
          const price = (shirtLine.final_price || shirtLine.price || 0) / 100;
          totalWithoutGift -= price;
        }
      }

      const hasKeyTag = isVariantInCart(cart, freeGiftVariantId);
      const hasFreeShirt = cartHasFreeShirt(cart);

      // $99+ tier: show shirt popup, add key tag
      if (totalWithoutGift >= giftThreshold) {
        if (!hasKeyTag) await addKeyGift();
        if (!hasFreeShirt) {
          const product = await getFreeShirtProduct();
          if (product) openFreeShirtModal(product);
        }
        return;
      }

      // $75+ tier: add/remove key tag
      if (totalWithoutGift >= shippingLimit) {
        freeShirtModalDismissed = false;
        if (!hasKeyTag) {
          await addKeyGift();
        }
        if (hasFreeShirt) {
          await removeFreeShirt();
        }
      } else {
        // Below $75 → remove key tag + shirt
        freeShirtModalDismissed = false;
        if (hasFreeShirt) {
          await removeFreeShirt();
        }
        if (hasKeyTag) {
          await removeKeyGift();
        }
      }
    }

    // Update UI milestones (fast, minimal DOM touches)
    function updateMilestonesFast(){
      const containers = getContainers();
      if (!containers || !containers.length) return;
      const container = containers[0];
      const { giftThreshold, shippingLimit } = getPromoConfig();

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
        if (cartTotal >= giftThreshold) {
          newMsg = 'Congratulations! Your order qualifies for free shipping with KEY TAG & Free SHIRT!';
        } else if (cartTotal >= shippingLimit) {
          newMsg = `You are $${(giftThreshold - cartTotal).toFixed(2)} away from FREE SHIPPING with Free Shirt!`;
        } else {
          newMsg = `You are $${(shippingLimit - cartTotal).toFixed(2)} away from FREE SHIPPING with KEY TAG!`;
        }
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