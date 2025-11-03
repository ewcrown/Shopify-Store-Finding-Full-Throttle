/*
* Broadcast Theme
*
* Use this file to add custom Javascript to Broadcast.  Keeping your custom
* Javascript in this fill will make it easier to update Broadcast. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/

console.log('🔧 [Custom JS] Script loaded!');

(function() {
  'use strict';
  
  console.log('🔧 [Custom JS] IIFE started');
  
  // Wait for theme to load
  if (typeof theme === 'undefined') {
    console.log('⏳ [Custom JS] Waiting for theme object...');
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(init, 500);
    });
  } else {
    init();
  }
  
  function init() {
    console.log('✅ [Custom JS] Initializing milestone updates...');
    
    // Update milestones function
    function updateMilestones() {
      console.log('🔄 [Milestones] Update triggered');
      
      // Wait for DOM to settle after cart updates
      setTimeout(() => {
        const containers = document.querySelectorAll('[data-free-shipping-limit]');
        console.log('📦 [Milestones] Found containers:', containers.length);
        
        if (!containers.length) {
          console.log('⚠️ [Milestones] No containers found');
          return;
        }
        
        containers.forEach(container => {
          // Get thresholds
          const shippingLimit = parseFloat(container.getAttribute('data-free-shipping-limit')) || 75;
          const giftThreshold = parseFloat(container.getAttribute('data-free-gift-threshold')) || 99;
          
          // Get cart total - try multiple methods (ALWAYS recalculate, don't cache)
          let cartTotal = 0;
          let cartTotalCents = 0;
          const cartDrawer = container.closest('#cart-drawer, .cart-holder') || document.querySelector('#cart-drawer, .cart-holder');
          
          // Method 1: From data-cart-total attribute (in cents) - most reliable
          // Look specifically for .cart__total__price element with data-cart-total
          const cartTotalEl = cartDrawer?.querySelector('.cart__total__price[data-cart-total]') || 
                              cartDrawer?.querySelector('[data-cart-total]') ||
                              document.querySelector('.cart__total__price[data-cart-total]') ||
                              document.querySelector('[data-cart-total]');
          
          if (cartTotalEl) {
            const totalAttr = cartTotalEl.getAttribute('data-cart-total');
            if (totalAttr) {
              cartTotalCents = parseFloat(totalAttr);
              if (!isNaN(cartTotalCents) && cartTotalCents >= 0) {
                cartTotal = cartTotalCents / 100;
                console.log('💰 [Milestones] Method 1 - From data-cart-total:', totalAttr, 'cents = $' + cartTotal);
              }
            }
          }
          
          // Method 2: ALWAYS calculate from cart items as verification/fallback
          // This is more reliable for dynamic updates
          const cartItems = cartDrawer ? cartDrawer.querySelectorAll('[data-cart-item], [data-item-id], [data-line-item], cart-item') : 
                           document.querySelectorAll('[data-cart-item], [data-item-id], [data-line-item], cart-item');
          
          let calculatedTotal = 0;
          let itemCount = 0;
          
          cartItems.forEach(item => {
            // Try multiple ways to get line item price (total for that item)
            const linePriceEl = item.querySelector('[data-line-price]');
            const priceEl = item.querySelector('[data-item-price], [data-price], .cart__price, .line__price');
            const qtyEl = item.querySelector('input[data-qty], input[name*="quantity"], input.cart__quantity-field, .qty-input input');
            
            let linePrice = 0;
            let unitPrice = 0;
            let qty = 1;
            
            // First try to get line price (total for this line item)
            if (linePriceEl) {
              if (linePriceEl.hasAttribute('data-line-price')) {
                linePrice = parseFloat(linePriceEl.getAttribute('data-line-price')) || 0;
              } else {
                const text = linePriceEl.textContent || '';
                const match = text.match(/[\d,]+\.?\d*/);
                if (match) {
                  linePrice = parseFloat(match[0].replace(/[$,]/g, '')) || 0;
                }
              }
            }
            
            // If no line price, calculate from unit price * quantity
            if (linePrice === 0 && priceEl) {
              if (priceEl.hasAttribute('data-item-price')) {
                unitPrice = parseFloat(priceEl.getAttribute('data-item-price')) || 0;
              } else if (priceEl.hasAttribute('data-price')) {
                unitPrice = parseFloat(priceEl.getAttribute('data-price')) || 0;
              } else {
                const priceText = priceEl.textContent || '';
                const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                  unitPrice = parseFloat(priceMatch[0].replace(/[$,]/g, '')) || 0;
                }
              }
            }
            
            // Get quantity - try multiple selectors
            if (!qtyEl) {
              // Try alternative selectors
              qtyEl = item.querySelector('input.cart__quantity-field, input.quantity__input, input[type="number"]');
            }
            
            if (qtyEl) {
              if (qtyEl.tagName === 'INPUT') {
                qty = parseFloat(qtyEl.value) || 0;
                // If quantity is 0, it might be a removed item, skip it
                if (qty === 0) {
                  console.log('⚠️ [Milestones] Item has quantity 0, skipping');
                  return; // Skip this item
                }
              } else {
                qty = parseFloat(qtyEl.textContent) || 0;
              }
            }
            
            // If still no quantity found, default to 1 but log warning
            if (qty === 0) {
              qty = 1;
              console.log('⚠️ [Milestones] Could not find quantity for item, defaulting to 1');
            }
            
            // If prices are in cents, convert to dollars
            if (linePrice > 1000) linePrice = linePrice / 100;
            if (unitPrice > 1000) unitPrice = unitPrice / 100;
            
            // Use line price if available, otherwise calculate
            const itemTotal = linePrice > 0 ? linePrice : (unitPrice * qty);
            
            if (itemTotal > 0) {
              calculatedTotal += itemTotal;
              itemCount++;
            }
          });
          
          // Use calculated total if it's valid and different from data attribute
          // Prefer calculated total if data attribute seems stale (0 or much different)
          if (calculatedTotal > 0) {
            const diff = Math.abs(calculatedTotal - cartTotal);
            // If calculated total is significantly different or data attribute is 0, use calculated
            if (cartTotal === 0 || diff > 0.01) {
              cartTotal = calculatedTotal;
              cartTotalCents = calculatedTotal * 100;
              console.log('💰 [Milestones] Method 2 - Calculated from', itemCount, 'items: $' + cartTotal.toFixed(2));
              if (cartTotal === 0) {
                console.log('⚠️ [Milestones] Calculated total is 0, but found', itemCount, 'items - checking quantities...');
              }
            } else {
              console.log('💰 [Milestones] Method 1 confirmed by calculation (diff: $' + diff.toFixed(2) + ')');
            }
          }
          
          // Method 3: From theme object if available
          if (cartTotal === 0) {
            if (window.theme?.cartItems?.subtotal) {
              cartTotalCents = window.theme.cartItems.subtotal;
              cartTotal = cartTotalCents / 100;
              console.log('💰 [Milestones] Method 3 - From theme object: $' + cartTotal);
            } else if (window.theme?.subtotal) {
              cartTotalCents = window.theme.subtotal;
              cartTotal = cartTotalCents / 100;
              console.log('💰 [Milestones] Method 3b - From theme.subtotal: $' + cartTotal);
            }
          }
          
          // Method 4: Try to get from cart API response if available
          if (cartTotal === 0 && window.cart && window.cart.total_price) {
            cartTotalCents = window.cart.total_price;
            cartTotal = cartTotalCents / 100;
            console.log('💰 [Milestones] Method 4 - From window.cart: $' + cartTotal);
          }
          
          // Log cart total (0 is valid for empty cart)
          if (cartTotal === 0) {
            console.log('💰 [Milestones] Cart total is $0 (empty cart)');
          }
          
          console.log('💰 [Milestones] Final cart total: $' + cartTotal.toFixed(2));
          console.log('📊 [Milestones] Thresholds - Shipping: $' + shippingLimit + ', Gift: $' + giftThreshold);
          
          // Find elements - new structure with labels inside milestone containers
          const shippingMilestone = container.querySelector('.free-shipping__milestone--shipping');
          const giftMilestone = container.querySelector('.free-shipping__milestone--gift');
          const shippingPoint = shippingMilestone?.querySelector('.free-shipping__milestone-point');
          const shippingLabel = shippingMilestone?.querySelector('.free-shipping__milestone-label');
          const giftPoint = giftMilestone?.querySelector('.free-shipping__milestone-point');
          const giftLabel = giftMilestone?.querySelector('.free-shipping__milestone-label');
          
          // Update shipping milestone (mark as reached when >= $75)
          const showShipping = cartTotal >= shippingLimit;
          console.log('🚚 [Milestones] Shipping:', showShipping ? '✅ REACHED ($' + cartTotal.toFixed(2) + ' >= $' + shippingLimit + ')' : '⏳ PENDING');
          
          if (shippingPoint) {
            if (showShipping) {
              shippingPoint.classList.add('is-reached');
              shippingMilestone?.classList.add('is-reached');
              console.log('✅ [Milestones] Shipping milestone marked as reached');
            } else {
              shippingPoint.classList.remove('is-reached');
              shippingMilestone?.classList.remove('is-reached');
              console.log('⏳ [Milestones] Shipping milestone pending');
            }
          } else {
            console.log('⚠️ [Milestones] Shipping milestone elements not found');
          }
          
          // Update gift milestone (mark as reached when >= $99)
          const showGift = cartTotal >= giftThreshold;
          console.log('🎁 [Milestones] Gift:', showGift ? '✅ REACHED ($' + cartTotal.toFixed(2) + ' >= $' + giftThreshold + ')' : '⏳ PENDING');
          
          if (giftPoint) {
            if (showGift) {
              giftPoint.classList.add('is-reached');
              giftMilestone?.classList.add('is-reached');
              console.log('✅ [Milestones] Gift milestone marked as reached');
            } else {
              giftPoint.classList.remove('is-reached');
              giftMilestone?.classList.remove('is-reached');
              console.log('⏳ [Milestones] Gift milestone pending');
            }
          } else {
            console.log('⚠️ [Milestones] Gift milestone elements not found');
          }
          
          // Update container classes
          container.classList.toggle('has-free-shipping', showShipping);
          container.classList.toggle('has-free-gift', showGift);
          
          const progressBar = container.querySelector('[data-progress-bar]');
          if (progressBar) {
            const giftMilestone = container.querySelector('.free-shipping__milestone--gift');
            const isFreeGiftEnabled = giftMilestone !== null;
            const progressMax = isFreeGiftEnabled ? giftThreshold : shippingLimit;
            let progressPercent = 0;
            if (cartTotal > 0) {
              progressPercent = Math.min((cartTotal / progressMax) * 100, 100);
            }
            progressBar.setAttribute('value', progressPercent.toFixed(2));
            console.log('📊 [Progress] Updated progress bar to', progressPercent.toFixed(2) + '% (max: $' + progressMax + ')');
          }
          
          // Check for both success and default message elements
          const successMessage = container.querySelector('.free-shipping__success-message');
          const defaultMessage = container.querySelector('.free-shipping__default-message');
          const messageElement = successMessage || defaultMessage;
          
          if (messageElement) {
            // Check if free gift is enabled (gift milestone exists)
            const isFreeGiftEnabled = giftMilestone !== null;
            
            console.log('📝 [Message] Found element:', successMessage ? 'success-message' : 'default-message');
            console.log('📝 [Message] Current message:', messageElement.textContent.trim());
            console.log('📝 [Message] Conditions - Shipping:', showShipping, 'Gift:', showGift, 'GiftEnabled:', isFreeGiftEnabled);
            console.log('📝 [Message] Cart total: $' + cartTotal.toFixed(2), 'Gift threshold: $' + giftThreshold);
            
            let newMessage = null;
            let isSuccessMessage = false;
            
            if (showShipping && showGift && isFreeGiftEnabled) {
              newMessage = 'Congratulations! Your order qualifies for free shipping with a free gift';
              isSuccessMessage = true;
              console.log('✅ [Message] Setting combined message (free shipping + gift)');
            } else if (showShipping && isFreeGiftEnabled && !showGift) {
              // Free shipping reached, but free gift not reached yet
              const amountNeeded = giftThreshold - cartTotal;
              console.log('💰 [Message] Amount needed calculation:', 'Threshold:', giftThreshold, 'Cart:', cartTotal, 'Needed:', amountNeeded);
              
              if (amountNeeded > 0) {
                let formattedAmount;
                const amountInCents = Math.round(amountNeeded * 100);
                if (typeof formatMoney !== 'undefined' && window.theme && window.theme.moneyFormat) {
                  formattedAmount = formatMoney(amountInCents, window.theme.moneyFormat);
                } else if (typeof formatMoney !== 'undefined' && window.theme && window.theme.moneyWithCurrencyFormat) {
                  formattedAmount = formatMoney(amountInCents, window.theme.moneyWithCurrencyFormat);
                } else {
                  formattedAmount = '$' + amountNeeded.toFixed(2);
                }
                newMessage = `You are ${formattedAmount} away from a FREE Key Tag!`;
                isSuccessMessage = true;
                console.log('✅ [Message] Setting gift message:', newMessage);
              } else {
                newMessage = 'Congratulations! Your order qualifies for free shipping';
                isSuccessMessage = true;
                console.log('✅ [Message] Setting shipping-only message (amount needed <= 0)');
              }
            } else if (showShipping) {
              // Free shipping reached, but no free gift feature enabled
              newMessage = 'Congratulations! Your order qualifies for free shipping';
              isSuccessMessage = true;
              console.log('✅ [Message] Setting shipping-only message (no gift feature)');
            } else {
              // Free shipping NOT reached - show amount needed for free shipping
              const amountNeeded = shippingLimit - cartTotal;
              console.log('💰 [Message] Amount needed for shipping:', 'Threshold:', shippingLimit, 'Cart:', cartTotal, 'Needed:', amountNeeded);
              
              if (amountNeeded > 0) {
                let formattedAmount;
                const amountInCents = Math.round(amountNeeded * 100);
                if (typeof formatMoney !== 'undefined' && window.theme && window.theme.moneyFormat) {
                  formattedAmount = formatMoney(amountInCents, window.theme.moneyFormat);
                } else if (typeof formatMoney !== 'undefined' && window.theme && window.theme.moneyWithCurrencyFormat) {
                  formattedAmount = formatMoney(amountInCents, window.theme.moneyWithCurrencyFormat);
                } else {
                  formattedAmount = '$' + amountNeeded.toFixed(2);
                }
                newMessage = `You are ${formattedAmount} away from FREE SHIPPING!`;
                isSuccessMessage = false;
                console.log('✅ [Message] Setting shipping-needed message:', newMessage);
              }
            }
            
            // Always update if we have a new message, even if it seems the same
            // This ensures updates happen when cart total changes
            if (newMessage) {
              const currentMessage = messageElement.textContent.trim();
              if (currentMessage !== newMessage) {
                messageElement.textContent = newMessage;
                
                // Update message class based on state
                if (isSuccessMessage) {
                  messageElement.classList.remove('free-shipping__default-message');
                  messageElement.classList.add('free-shipping__success-message');
                } else {
                  messageElement.classList.remove('free-shipping__success-message');
                  messageElement.classList.add('free-shipping__default-message');
                }
                
                console.log('✅ [Message] Updated successfully to:', newMessage);
                console.log('📊 [Message] Previous message was:', currentMessage);
              } else {
                // Even if message is same, verify classes are correct
                const hasSuccessClass = messageElement.classList.contains('free-shipping__success-message');
                const hasDefaultClass = messageElement.classList.contains('free-shipping__default-message');
                
                if (isSuccessMessage && !hasSuccessClass) {
                  messageElement.classList.remove('free-shipping__default-message');
                  messageElement.classList.add('free-shipping__success-message');
                  console.log('✅ [Message] Fixed class - added success-message');
                } else if (!isSuccessMessage && !hasDefaultClass) {
                  messageElement.classList.remove('free-shipping__success-message');
                  messageElement.classList.add('free-shipping__default-message');
                  console.log('✅ [Message] Fixed class - added default-message');
                } else {
                  console.log('ℹ️ [Message] Message unchanged (already correct):', newMessage);
                }
              }
            } else {
              console.log('⚠️ [Message] No new message to set - cart total:', cartTotal, 'shipping:', showShipping, 'gift:', showGift);
            }
            
            console.log('📝 [Message] Final message:', messageElement.textContent.trim());
          } else {
            console.log('⚠️ [Message] No message element found!');
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
      }, 150); // Increased delay to ensure DOM is updated
    }
    
    // Debounce function to prevent too many rapid updates
    let updateTimeout;
    function debouncedUpdate(delay = 150) {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        console.log('🔄 [Debounced] Running debounced update');
        updateMilestones();
      }, delay);
    }
    
    // Force update function (no debounce) for critical events
    function forceUpdate() {
      console.log('⚡ [Force] Force updating milestones immediately');
      updateMilestones();
    }
    
    // Listen to ALL possible cart update events
    const events = [
      'theme:cart:update',
      'theme:product:added', 
      'theme:cart:change',
      'theme:cart:load',
      'theme:cart-drawer:open',
      'cart:updated',
      'cart:change',
      'cart:refresh'
    ];
    
    events.forEach(eventName => {
      document.addEventListener(eventName, () => {
        console.log('📢 [Events]', eventName, 'triggered');
        debouncedUpdate();
      });
    });
    
    // Watch for quantity button clicks (minus/plus buttons)
    document.addEventListener('click', (e) => {
      if (e.target && (
        e.target.closest('.cart__quantity-minus') ||
        e.target.closest('.cart__quantity-plus') ||
        e.target.closest('.quantity__minus') ||
        e.target.closest('.quantity__plus') ||
        e.target.closest('button[name="decrease"]') ||
        e.target.closest('button[name="increase"]')
      )) {
        console.log('➖➕ [Button] Quantity button clicked');
        // Wait for AJAX to complete - check multiple times
        setTimeout(() => updateMilestones(), 200);
        setTimeout(() => updateMilestones(), 500);
        setTimeout(() => updateMilestones(), 1000);
      }
    });
    
    // Watch for quantity input changes
    document.addEventListener('input', (e) => {
      if (e.target && (
        e.target.matches('input[data-qty]') ||
        e.target.matches('input[name*="quantity"]') ||
        e.target.matches('.qty-input input') ||
        e.target.matches('.cart__quantity-field') ||
        e.target.closest('[data-cart-item]') ||
        e.target.closest('[data-line-item]')
      )) {
        console.log('📝 [Input] Quantity input changed');
        // Wait for potential AJAX update
        setTimeout(() => updateMilestones(), 300);
        setTimeout(() => updateMilestones(), 800);
      }
    });
    
    // Watch for change events on quantity inputs
    document.addEventListener('change', (e) => {
      if (e.target && (
        e.target.matches('input[data-qty]') ||
        e.target.matches('input[name*="quantity"]') ||
        e.target.matches('.qty-input input') ||
        e.target.matches('.cart__quantity-field')
      )) {
        console.log('📝 [Change] Quantity changed');
        // Wait for AJAX to complete
        setTimeout(() => updateMilestones(), 300);
        setTimeout(() => updateMilestones(), 800);
        setTimeout(() => updateMilestones(), 1500);
      }
    });
    
    // Watch for cart loading state changes (when cart finishes updating)
    const watchCartLoading = () => {
      const cartDrawer = document.querySelector('#cart-drawer');
      if (!cartDrawer) return;
      
      // Watch for when loading class is removed (cart update complete)
      const loadingObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            const wasLoading = mutation.oldValue && mutation.oldValue.includes('loading');
            const isNowLoading = target.classList.contains('loading');
            
            // If cart was loading and is now not loading, update
            if (wasLoading && !isNowLoading) {
              console.log('✅ [Loading] Cart finished loading, updating milestones');
              setTimeout(() => updateMilestones(), 100);
              setTimeout(() => updateMilestones(), 400);
            }
          }
        });
      });
      
      loadingObserver.observe(cartDrawer, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
      });
      
      console.log('👀 [Loading] Watching cart loading state');
    };
    
    // Start watching cart loading after a delay
    setTimeout(watchCartLoading, 1000);
    
    // Watch for DOM mutations in cart drawer and document
    const cartDrawer = document.querySelector('#cart-drawer');
    const observerOptions = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-cart-total', 'class', 'value'],
      characterData: true
    };
    
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        // Check for added/removed nodes
        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === 1 && (
              (node.querySelector && (
                node.querySelector('[data-free-shipping-limit]') || 
                node.querySelector('[data-cart-total]') ||
                node.querySelector('[data-cart-item]') ||
                node.classList?.contains('free-shipping')
              )) ||
              node.hasAttribute('data-cart-total') ||
              node.hasAttribute('data-cart-item')
            )) {
              shouldUpdate = true;
            }
          });
          
          Array.from(mutation.removedNodes).forEach(node => {
            if (node.nodeType === 1 && (
              node.hasAttribute('data-cart-item') ||
              node.classList?.contains('cart__item')
            )) {
              shouldUpdate = true;
            }
          });
        }
        
        // Check for attribute changes
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (target && (
            target.hasAttribute('data-cart-total') ||
            target.closest('.free-shipping') ||
            target.closest('[data-free-shipping-limit]') ||
            target.closest('[data-cart-item]') ||
            target.closest('[data-items-holder]') ||
            target.closest('cart-items')
          )) {
            // If data-cart-total changed, update immediately
            if (target.hasAttribute('data-cart-total') || mutation.attributeName === 'data-cart-total') {
              console.log('💰 [Observer] Cart total attribute changed');
              setTimeout(() => forceUpdate(), 50);
            } else {
              shouldUpdate = true;
            }
          }
        }
        
        // Check for text content changes (cart totals, prices)
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const target = mutation.target;
          if (target && (
            target.nodeType === 3 || // Text node
            target.classList?.contains('cart__total') ||
            target.classList?.contains('cart__price') ||
            target.closest('.cart__total') ||
            target.closest('.cart__price')
          )) {
            shouldUpdate = true;
          }
        }
      });
      
      if (shouldUpdate) {
        console.log('👀 [Observer] Cart DOM changed, updating milestones');
        // Use shorter debounce for DOM changes
        debouncedUpdate(100);
      }
    });
    
    // Observe cart drawer if it exists
    if (cartDrawer) {
      observer.observe(cartDrawer, observerOptions);
      console.log('✅ [Observer] MutationObserver started on cart drawer');
    }
    
    // Also observe the document body for cart changes outside drawer
    observer.observe(document.body, observerOptions);
    console.log('✅ [Observer] MutationObserver started on document body');
    
    // Watch for cart drawer open/close
    const cartDrawerToggle = document.querySelector('[data-cart-drawer-toggle], [data-cart-open]');
    if (cartDrawerToggle) {
      cartDrawerToggle.addEventListener('click', () => {
        console.log('🛒 [Cart] Cart drawer opened');
        setTimeout(() => {
          updateMilestones();
        }, 300);
      });
    }
    
    // Initial update - run multiple times to catch different load scenarios
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('📢 [Events] DOMContentLoaded - running initial update');
        updateMilestones();
        setTimeout(updateMilestones, 300);
        setTimeout(updateMilestones, 1000);
      });
    } else {
      // DOM already loaded
      console.log('📢 [Events] DOM already loaded - running initial update');
      updateMilestones();
      setTimeout(updateMilestones, 300);
      setTimeout(updateMilestones, 1000);
    }
    
    // Force update periodically to catch any missed updates (less frequent now since we have better event detection)
    setInterval(() => {
      const containers = document.querySelectorAll('[data-free-shipping-limit]');
      if (containers.length > 0) {
        // Only update if cart drawer is visible/open
        const cartDrawer = document.querySelector('#cart-drawer');
        const isDrawerOpen = cartDrawer && (cartDrawer.classList.contains('is-open') || cartDrawer.hasAttribute('open') || !cartDrawer.hasAttribute('hidden'));
        
        // Also update if we're on cart page
        const isCartPage = document.body.classList.contains('template-cart') || window.location.pathname.includes('/cart');
        
        if (isDrawerOpen || isCartPage) {
          console.log('🔄 [Periodic] Running periodic milestone update');
          updateMilestones();
        }
      }
    }, 3000);
  }

})();
