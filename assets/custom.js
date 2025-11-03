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
            
            if (showShipping && showGift && isFreeGiftEnabled) {
              newMessage = 'Congratulations! Your order qualifies for free shipping with a free gift';
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
                newMessage = `You're ${formattedAmount} away from a FREE Key Tag!`;
                console.log('✅ [Message] Setting gift message:', newMessage);
              } else {
                newMessage = 'Congratulations! Your order qualifies for free shipping';
                console.log('✅ [Message] Setting shipping-only message (amount needed <= 0)');
              }
            } else if (showShipping) {
              // Free shipping reached, but no free gift feature enabled
              newMessage = 'Congratulations! Your order qualifies for free shipping';
              console.log('✅ [Message] Setting shipping-only message (no gift feature)');
            }
            
            if (newMessage && messageElement.textContent.trim() !== newMessage) {
              messageElement.textContent = newMessage;
              // If it was a default message, convert to success message
              if (defaultMessage && !successMessage) {
                defaultMessage.classList.remove('free-shipping__default-message');
                defaultMessage.classList.add('free-shipping__success-message');
              }
              console.log('✅ [Message] Updated successfully to:', newMessage);
            } else if (newMessage) {
              console.log('ℹ️ [Message] Message unchanged (already correct)');
            } else {
              console.log('ℹ️ [Message] No new message to set');
            }
            
            console.log('📝 [Message] Final message:', messageElement.textContent.trim());
          } else {
            console.log('⚠️ [Message] No message element found!');
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
    
    // Force update periodically to catch any missed updates
    setInterval(() => {
      const containers = document.querySelectorAll('[data-free-shipping-limit]');
      if (containers.length > 0) {
        console.log('🔄 [Periodic] Running periodic milestone update');
        updateMilestones();
      }
    }, 2000);
  }

})();
