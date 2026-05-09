(function(){
  'use strict';
  // Free gift cart logic reads Theme Editor settings from the free-shipping snippet (data-* attrs).
  // Toggle "Enable free gift promotion" off to stop auto cart changes and strip promo-tagged lines.

  if (typeof theme === 'undefined') {
    window.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

  function init(){
    let containers = null;
    let isManagingGift = false;
    let lastCartFetch = { ts: 0, data: null };
    const CART_TTL = 300;

    let giftProductCache = { handle: '', product: null };
    let giftModalEl = null;
    let giftModalProductHandle = '';
    let giftModalOpen = false;
    let giftModalDismissed = false;
    let giftProductFetching = false;
    let disabledCleanupTimer = null;

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

    function getContainers(refresh = false){
      if (!containers || refresh) containers = document.querySelectorAll('[data-free-shipping-limit]');
      return containers;
    }

    function promoMarked(item){
      return item?.properties && String(item.properties._free_gift) === 'true';
    }

    async function removePromotionalGiftLines(){
      if (isManagingGift) return;
      const cart = await getCartState(true);
      if (!cart?.items?.length) return;
      const lines = [];
      cart.items.forEach((item, idx) => {
        if (promoMarked(item)) lines.push(idx + 1);
      });
      if (!lines.length) return;
      lines.sort((a, b) => b - a);
      isManagingGift = true;
      try {
        for (const line of lines) {
          const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line, quantity: 0 })
          });
          if (!res.ok) break;
        }
        lastCartFetch = { ts: 0, data: null };
        document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => { isManagingGift = false; }, 50);
      }
    }

    async function ensureGiftProduct(handle){
      if (!handle) return null;
      if (giftProductCache.handle === handle && giftProductCache.product) return giftProductCache.product;
      if (giftProductFetching) return null;
      giftProductFetching = true;
      try {
        const res = await fetch(`/products/${encodeURIComponent(handle)}.js`, { cache: 'no-store' });
        if (!res.ok) throw new Error('gift product fetch failed');
        const product = await res.json();
        giftProductCache = { handle, product };
        return product;
      } catch (e) {
        console.error(e);
        return null;
      } finally {
        giftProductFetching = false;
      }
    }

    function cartHasPromoGift(cart, giftVariantIds){
      if (!cart?.items?.length || !giftVariantIds?.length) return false;
      return cart.items.some(i => giftVariantIds.includes(i.variant_id) && promoMarked(i));
    }

    async function removePromoGiftForProduct(giftVariantIds){
      if (isManagingGift || !giftVariantIds?.length) return;
      const cart = await getCartState(true);
      if (!cart?.items?.length) return;
      const lines = [];
      cart.items.forEach((item, idx) => {
        if (giftVariantIds.includes(item.variant_id) && promoMarked(item)) lines.push(idx + 1);
      });
      if (!lines.length) return;
      lines.sort((a, b) => b - a);
      isManagingGift = true;
      try {
        for (const line of lines) {
          const res = await fetch(window.theme?.routes?.cart_change_url || '/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ line, quantity: 0 })
          });
          if (!res.ok) break;
        }
        lastCartFetch = { ts: 0, data: null };
        document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => { isManagingGift = false; }, 50);
      }
    }

    function giftNeedsVariantPicker(product){
      return (product?.variants || []).length > 1;
    }

    function ensureGiftModalStyles(){
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

    function applyGiftModalCopy(modal, cfg){
      const titleEl = modal.querySelector('.free-shirt-modal__header');
      const subEl = modal.querySelector('.free-shirt-modal__sub');
      const addBtn = modal.querySelector('.free-shirt-modal__add');
      if (titleEl) titleEl.textContent = cfg.title || 'Claim your free gift';
      if (subEl) subEl.textContent = cfg.subtitle || '';
      const btnLabel = cfg.buttonLabel || 'Add free gift';
      if (addBtn && addBtn.textContent !== 'Adding...') addBtn.textContent = btnLabel;
    }

    function createGiftModal(product, copyCfg){
      ensureGiftModalStyles();
      const modal = document.createElement('div');
      modal.className = 'free-shirt-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');

      const featuredImage = product?.images?.[0] || '';
      const defaultVariant = (product.variants || []).find(v => v.available) || (product.variants || [])[0];
      const optionMarkup = (product.options || []).map((opt, idx) => {
        const values = opt.values || [];
        const optionsHtml = values.map(v => `<option value="${String(v).replace(/"/g, '&quot;')}">${String(v).replace(/</g, '&lt;')}</option>`).join('');
        return `
          <div class="free-shirt-modal__field">
            <label>${String(opt.name || '').replace(/</g, '&lt;')}</label>
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
          <div class="free-shirt-modal__header"></div>
          <div class="free-shirt-modal__sub"></div>
          <div class="free-shirt-modal__body">
            <div class="free-shirt-modal__grid">
              <div class="free-shirt-modal__media">${featuredImage ? `<img data-free-shirt-image src="${featuredImage}" alt="">` : ''}</div>
              <div class="free-shirt-modal__options">
                ${optionMarkup}
                <div class="free-shirt-modal__actions">
                  <button class="btn btn--primary btn--solid free-shirt-modal__add" type="button"></button>
                  <span class="free-shirt-modal__note">Limit 1 per order.</span>
                  <div class="free-shirt-modal__note free-shirt-modal__error" style="display:none;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const imgHolder = modal.querySelector('[data-free-shirt-image]');
      if (imgHolder) imgHolder.alt = product.title || '';

      applyGiftModalCopy(modal, copyCfg);

      if (defaultVariant) {
        modal.querySelectorAll('[data-option-index]').forEach((sel, idx) => {
          sel.value = defaultVariant.options[idx];
        });
      }

      modal.addEventListener('click', (e) => {
        if (e.target && e.target.matches('[data-free-shirt-close]')) closeGiftModal();
      });
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeGiftModal();
      });
      document.body.appendChild(modal);
      return modal;
    }

    function getSelectedVariant(product, modal){
      const selects = modal.querySelectorAll('[data-option-index]');
      const selectedOptions = Array.from(selects).map(sel => sel.value);
      return product.variants.find(v => selectedOptions.every((val, idx) => v.options[idx] === val)) || null;
    }

    function updateGiftModalState(product, modal){
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

    function hideGiftModal(){
      if (!giftModalEl) return;
      giftModalEl.classList.remove('is-open');
      giftModalEl.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('free-shirt-modal-open');
      giftModalOpen = false;
    }

    function closeGiftModal(){
      hideGiftModal();
      giftModalDismissed = true;
    }

    function openGiftModal(product, copyCfg){
      if (giftModalOpen || giftModalDismissed) return;
      const handle = copyCfg.handle || '';
      if (giftModalEl && giftModalProductHandle !== handle) {
        giftModalEl.remove();
        giftModalEl = null;
      }
      if (!giftModalEl) {
        giftModalEl = createGiftModal(product, copyCfg);
        giftModalProductHandle = handle;
      } else {
        applyGiftModalCopy(giftModalEl, copyCfg);
      }

      const modal = giftModalEl;
      modal.querySelectorAll('[data-option-index]').forEach(sel => {
        if (!sel.dataset.giftModalBound) {
          sel.dataset.giftModalBound = 'true';
          sel.addEventListener('change', () => updateGiftModalState(product, modal), { passive: true });
        }
      });

      const addBtn = modal.querySelector('.free-shirt-modal__add');
      const btnLabel = copyCfg.buttonLabel || 'Add free gift';
      addBtn.onclick = async () => {
        const variant = updateGiftModalState(product, modal);
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
          giftModalDismissed = false;
          hideGiftModal();
        } catch (e){
          console.error(e);
          addBtn.disabled = false;
          addBtn.textContent = btnLabel;
        }
      };

      updateGiftModalState(product, modal);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('free-shirt-modal-open');
      giftModalOpen = true;
    }

    async function addGiftVariant(variantId){
      if (isManagingGift) return;
      isManagingGift = true;
      try {
        const fd = new FormData();
        fd.append('id', String(variantId));
        fd.append('quantity','1');
        fd.append('properties[_free_gift]','true');
        const res = await fetch(window.theme?.routes?.cart_add_url || '/cart/add.js', {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: fd
        });
        if (res.ok){
          lastCartFetch = { ts: 0, data: null };
          document.dispatchEvent(new CustomEvent('theme:cart:refresh', { bubbles: true }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => { isManagingGift = false; }, 50);
      }
    }

    function readUiConfig(container){
      if (!container) {
        return {
          enabled: false,
          handle: '',
          shippingLimit: 0,
          giftThreshold: 0,
          modalTitle: 'Claim your free gift',
          modalSubtitle: '',
          modalButton: 'Add free gift'
        };
      }
      return {
        enabled: container.getAttribute('data-free-gift-enabled') === 'true',
        handle: (container.getAttribute('data-free-gift-handle') || '').trim(),
        shippingLimit: parseFloat(container.getAttribute('data-free-shipping-limit')) || 0,
        giftThreshold: parseFloat(container.getAttribute('data-free-gift-threshold')) || 0,
        modalTitle: container.getAttribute('data-free-gift-modal-title') || 'Claim your free gift',
        modalSubtitle: container.getAttribute('data-free-gift-modal-subtitle') || '',
        modalButton: container.getAttribute('data-free-gift-modal-button') || 'Add free gift'
      };
    }

    async function manageFreeGift(){
      if (isManagingGift) return;
      const containers = getContainers();
      if (!containers.length) return;
      const cfg = readUiConfig(containers[0]);

      if (!cfg.enabled || !cfg.handle) {
        return;
      }

      const product = await ensureGiftProduct(cfg.handle);
      if (!product?.variants?.length) return;

      const giftVariantIds = product.variants.map(v => v.id);
      const cart = await getCartState();
      if (!cart) return;

      let totalBasis = (cart.total_price || 0) / 100;
      for (const item of cart.items || []) {
        if (giftVariantIds.includes(item.variant_id) && promoMarked(item)) {
          totalBasis -= (item.final_line_price || item.line_price || 0) / 100;
        }
      }

      const hasPromo = cartHasPromoGift(cart, giftVariantIds);

      if (totalBasis >= cfg.giftThreshold) {
        if (!hasPromo) {
          if (!giftNeedsVariantPicker(product)) {
            const v = product.variants.find(x => x.available) || product.variants[0];
            if (v?.available) await addGiftVariant(v.id);
          } else {
            openGiftModal(product, {
              handle: cfg.handle,
              title: cfg.modalTitle,
              subtitle: cfg.modalSubtitle,
              buttonLabel: cfg.modalButton
            });
          }
        }
        return;
      }

      giftModalDismissed = false;
      hideGiftModal();
      if (hasPromo) await removePromoGiftForProduct(giftVariantIds);
    }

    function scheduleDisabledPromoCleanup(){
      const c = getContainers()[0];
      if (!c || c.getAttribute('data-free-gift-enabled') === 'true') return;
      clearTimeout(disabledCleanupTimer);
      disabledCleanupTimer = setTimeout(() => removePromotionalGiftLines(), 600);
    }

    function updateMilestonesFast(){
      const containers = getContainers();
      if (!containers || !containers.length) return;
      const container = containers[0];
      const cfg = readUiConfig(container);
      const shippingLimit = cfg.shippingLimit;
      const giftThreshold = cfg.giftThreshold;
      const giftEnabled = cfg.enabled && !!cfg.handle;

      let cartTotal = 0;
      const totalEl = document.querySelector('[data-cart-total]');
      if (totalEl){
        const v = parseFloat(totalEl.getAttribute('data-cart-total')) || 0;
        if (v > 0) cartTotal = v / 100;
      }

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

      const shippingMilestone = container.querySelector('.free-shipping__milestone--shipping');
      const giftMilestone = container.querySelector('.free-shipping__milestone--gift');
      const showShipping = shippingLimit > 0 && cartTotal >= shippingLimit;
      const showGift = giftEnabled && giftMilestone && giftThreshold > 0 && cartTotal >= giftThreshold;

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
        const max = giftEnabled && giftThreshold > shippingLimit ? giftThreshold : Math.max(shippingLimit, 1);
        const pct = max > 0 ? Math.min((cartTotal / max) * 100, 100) : 0;
        progressBar.setAttribute('value', pct.toFixed(2));
      }

      if (!giftEnabled) scheduleDisabledPromoCleanup();
      else manageFreeGift();
    }

    let debounceTimer = 0;
    function scheduleUpdate(ms = 30){
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        requestAnimationFrame(updateMilestonesFast);
      }, ms);
    }

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

    ['theme:cart:update','theme:cart:change','theme:product:added','cart:updated'].forEach(ev => {
      document.addEventListener(ev, () => scheduleUpdate(15));
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cart__quantity-minus, .cart__quantity-plus, .quantity__minus, .quantity__plus, button[name="decrease"], button[name="increase"]');
      if (btn) scheduleUpdate(20);
    }, {passive: true});

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.matches('input[data-qty]') || e.target.matches('input[name*="quantity"]'))) scheduleUpdate(30);
    }, {passive: true});

    setInterval(()=> scheduleUpdate(100), 3000);

    requestAnimationFrame(() => {
      scheduleUpdate(0);
      setTimeout(() => {
        const c = getContainers()[0];
        if (c && c.getAttribute('data-free-gift-enabled') !== 'true') {
          removePromotionalGiftLines();
        }
      }, 500);
    });
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
