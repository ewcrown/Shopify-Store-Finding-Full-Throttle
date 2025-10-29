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
          
          // Get cart total - try multiple methods
          let cartTotal = 0;
          
          // Method 1: From data-cart-total attribute (in cents)
          const cartTotalEl = container.closest('#cart-drawer, .cart-holder')?.querySelector('[data-cart-total]') || 
                              document.querySelector('[data-cart-total]');
          
          if (cartTotalEl) {
            const totalAttr = cartTotalEl.getAttribute('data-cart-total');
            if (totalAttr) {
              cartTotal = parseFloat(totalAttr) / 100; // Convert cents to dollars
              console.log('💰 [Milestones] Method 1 - From data-cart-total:', totalAttr, 'cents = $' + cartTotal);
            }
          }
          
          // Method 2: Fallback - calculate from cart items
          if (cartTotal === 0) {
            console.log('⚠️ [Milestones] Method 1 failed, trying method 2...');
            const cartItems = document.querySelectorAll('[data-cart-item], [data-item-id]');
            let calculatedTotal = 0;
            
            cartItems.forEach(item => {
              const priceEl = item.querySelector('[data-item-price], [data-price]');
              const qtyEl = item.querySelector('input[data-qty], input[name*="quantity"], .qty-input');
              
              if (priceEl && qtyEl) {
                const price = parseFloat(priceEl.getAttribute('data-item-price') || priceEl.getAttribute('data-price') || priceEl.textContent.replace(/[^0-9.]/g, '')) || 0;
                const qty = parseFloat(qtyEl.value || qtyEl.textContent) || 1;
                calculatedTotal += (price * qty);
              }
            });
            
            if (calculatedTotal > 0) {
              cartTotal = calculatedTotal;
              console.log('💰 [Milestones] Method 2 - Calculated from items: $' + cartTotal);
            }
          }
          
          // Method 3: From theme object if available
          if (cartTotal === 0 && window.theme?.cartItems?.subtotal) {
            cartTotal = window.theme.cartItems.subtotal / 100;
            console.log('💰 [Milestones] Method 3 - From theme object: $' + cartTotal);
          }
          
          console.log('💰 [Milestones] Final cart total: $' + cartTotal.toFixed(2));
          console.log('📊 [Milestones] Thresholds - Shipping: $' + shippingLimit + ', Gift: $' + giftThreshold);
          
          // Find elements
          const shippingLabel = container.querySelector('.free-shipping__milestone-labels .free-shipping__milestone--shipping');
          const giftLabel = container.querySelector('.free-shipping__milestone-labels .free-shipping__milestone--gift');
          const shippingPoint = container.querySelector('.free-shipping__milestone--shipping .free-shipping__milestone-point');
          const giftPoint = container.querySelector('.free-shipping__milestone--gift .free-shipping__milestone-point');
          
          // Update shipping milestone (show when >= $75)
          const showShipping = cartTotal >= shippingLimit;
          console.log('🚚 [Milestones] Shipping:', showShipping ? '✅ SHOW ($' + cartTotal.toFixed(2) + ' >= $' + shippingLimit + ')' : '❌ HIDE');
          
          if (shippingLabel && shippingPoint) {
            if (showShipping) {
              shippingPoint.classList.add('is-reached');
              shippingLabel.classList.add('is-reached');
              // REMOVE all inline styles so CSS can control it
              shippingLabel.style.removeProperty('display');
              shippingLabel.style.removeProperty('opacity');
              shippingLabel.style.removeProperty('visibility');
              console.log('✅ [Milestones] Shipping label SHOWN - inline styles REMOVED');
            } else {
              shippingPoint.classList.remove('is-reached');
              shippingLabel.classList.remove('is-reached');
              // Only add inline styles when hiding
              shippingLabel.style.setProperty('display', 'none', 'important');
              shippingLabel.style.setProperty('opacity', '0', 'important');
              shippingLabel.style.setProperty('visibility', 'hidden', 'important');
              console.log('❌ [Milestones] Shipping label HIDDEN');
            }
          } else {
            console.log('⚠️ [Milestones] Shipping elements not found - Label:', !!shippingLabel, 'Point:', !!shippingPoint);
          }
          
          // Update gift milestone (show only when >= $99)
          const showGift = cartTotal >= giftThreshold;
          console.log('🎁 [Milestones] Gift:', showGift ? '✅ SHOW ($' + cartTotal.toFixed(2) + ' >= $' + giftThreshold + ')' : '❌ HIDE');
          
          if (giftLabel && giftPoint) {
            if (showGift) {
              giftPoint.classList.add('is-reached');
              giftLabel.classList.add('is-reached');
              // REMOVE all inline styles so CSS can control it
              giftLabel.style.removeProperty('display');
              giftLabel.style.removeProperty('opacity');
              giftLabel.style.removeProperty('visibility');
              console.log('✅ [Milestones] Gift label SHOWN - inline styles REMOVED');
            } else {
              giftPoint.classList.remove('is-reached');
              giftLabel.classList.remove('is-reached');
              // Only add inline styles when hiding
              giftLabel.style.setProperty('display', 'none', 'important');
              giftLabel.style.setProperty('opacity', '0', 'important');
              giftLabel.style.setProperty('visibility', 'hidden', 'important');
              console.log('❌ [Milestones] Gift label HIDDEN');
            }
          } else {
            console.log('⚠️ [Milestones] Gift elements not found - Label:', !!giftLabel, 'Point:', !!giftPoint);
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
          
          const successMessage = container.querySelector('.free-shipping__success-message');
          if (successMessage) {
            if (showShipping && showGift) {
              successMessage.textContent = 'Congratulations! Your order qualifies for free shipping with a free gift';
              console.log('✅ [Message] Updated to combined message (free shipping + gift)');
            } else if (showShipping) {
              const amountNeeded = giftThreshold - cartTotal;
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
                successMessage.textContent = `You're ${formattedAmount} behind the free gift`;
                console.log('✅ [Message] Updated to show amount needed for gift');
              } else {
                successMessage.textContent = 'Congratulations! Your order qualifies for free shipping';
                console.log('✅ [Message] Updated to shipping-only message');
              }
            }
          }
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
      }, 150); // Increased delay to ensure DOM is updated
    }
    
    // Listen to ALL possible cart update events
    const events = [
      'theme:cart:update',
      'theme:product:added', 
      'theme:cart:change',
      'theme:cart:load',
      'theme:cart-drawer:open'
    ];
    
    events.forEach(eventName => {
      document.addEventListener(eventName, () => {
        console.log('📢 [Events]', eventName, 'triggered');
        updateMilestones();
      });
    });
    
    // Watch for DOM mutations in cart drawer
    const cartDrawer = document.querySelector('#cart-drawer');
    if (cartDrawer) {
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length || mutation.removedNodes.length || mutation.type === 'attributes') {
            // Check if free-shipping or cart-price was updated
            Array.from(mutation.addedNodes).forEach(node => {
              if (node.nodeType === 1 && (
                node.querySelector && (
                  node.querySelector('[data-free-shipping-limit]') || 
                  node.querySelector('[data-cart-total]') ||
                  node.classList?.contains('free-shipping')
                )
              )) {
                shouldUpdate = true;
              }
            });
            
            if (mutation.target && mutation.target.hasAttribute && (
              mutation.target.hasAttribute('data-cart-total') ||
              mutation.target.closest('.free-shipping') ||
              mutation.target.closest('[data-free-shipping-limit]')
            )) {
              shouldUpdate = true;
            }
          }
        });
        
        if (shouldUpdate) {
          console.log('👀 [Observer] Cart DOM changed, updating milestones');
          updateMilestones();
        }
      });
      
      observer.observe(cartDrawer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-cart-total', 'class']
      });
      
      console.log('✅ [Observer] MutationObserver started');
    }
    
    // Initial update
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📢 [Events] DOMContentLoaded - running initial update');
      setTimeout(updateMilestones, 300);
    });
    
    // Also update after a delay in case DOM is already loaded
    setTimeout(updateMilestones, 500);
  }

})();
