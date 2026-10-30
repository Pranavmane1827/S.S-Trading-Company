/* ==========================================================================
   SS SOFT NAPKINS - S. S. TRADING COMPANY
   Interactive Application Script
   Owner Contact: Prop. Shahid S. Momin | 9699610044 / 7350936365
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Constants & Global State ---
  const OWNER_WHATSAPP = '919699610044';
  const OWNER_PHONE = '9699610044';
  const OWNER_EMAIL = 'sstradingco1512@gmail.com';

  // Standard Product Pricing Mapping (in INR)
  const PRODUCT_PRICES = {
    'Disposable Bedsheet': { unitPrice: 250, defaultUnit: 'Packets', unitLabel: 'Packet (10 pcs)' },
    'Disposable Apron': { unitPrice: 120, defaultUnit: 'Packets', unitLabel: 'Pack (10 pcs)' },
    'Disposable Fabric': {
      sizes: {
        '8 × 8': { price: 150, unitLabel: 'Pack (8x8)' },
        '12 × 12': { price: 280, unitLabel: 'Pack (12x12)' },
        '16 × 24': { price: 450, unitLabel: 'Pack (16x24)' }
      },
      defaultUnit: 'Packets'
    },
    'Tissue Paper': { unitPrice: 45, defaultUnit: 'Packets', unitLabel: 'Packet' },
    'Soft Napkins': { unitPrice: 65, defaultUnit: 'Packets', unitLabel: 'Luxury Pack' }
  };

  let currentSelectedSize = '12 × 12'; // Default size for fabric
  let currentUnitPrice = 250;

  // --- Mobile Drawer Navigation ---
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileNav() {
    const isOpen = mobileNavDrawer.classList.contains('is-open');
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function openMobileNav() {
    mobileNavDrawer.classList.add('is-open');
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNavDrawer.classList.remove('is-open');
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileNav);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- Smooth Scroll & Active Nav State ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 75;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Order Request Modal System ---
  const orderModalBackdrop = document.getElementById('orderModalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const orderForm = document.getElementById('orderForm');
  const orderFormContainer = document.getElementById('orderFormContainer');
  const orderSuccessContainer = document.getElementById('orderSuccessContainer');

  const orderProductSelect = document.getElementById('orderProductSelect');
  const sizeFieldGroup = document.getElementById('sizeFieldGroup');
  const sizeNoteBadge = document.getElementById('sizeNoteBadge');
  const sizeChipsContainer = document.getElementById('sizeChipsContainer');

  const qtyInput = document.getElementById('qtyInput');
  const qtyMinusBtn = document.getElementById('qtyMinusBtn');
  const qtyPlusBtn = document.getElementById('qtyPlusBtn');
  const calcPriceVal = document.getElementById('calcPriceVal');

  // Open Modal Triggers
  document.querySelectorAll('.js-open-order').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const product = this.getAttribute('data-product') || 'Disposable Bedsheet';
      const defaultSize = this.getAttribute('data-size') || '12 × 12';
      openOrderModal(product, defaultSize);
    });
  });

  function openOrderModal(productName, defaultSize) {
    if (!orderModalBackdrop) return;

    // Reset Form View
    orderFormContainer.style.display = 'block';
    orderSuccessContainer.style.display = 'none';

    // Auto-select Product
    if (orderProductSelect) {
      orderProductSelect.value = productName;
      handleProductSelectChange(productName, defaultSize);
    }

    // Reset Qty
    if (qtyInput) qtyInput.value = 1;

    // Reset Validation Errors
    clearFormErrors(orderForm);

    updateLivePriceCalculation();

    // Show Modal
    orderModalBackdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeOrderModal() {
    if (!orderModalBackdrop) return;
    orderModalBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeOrderModal);
  if (orderModalBackdrop) {
    orderModalBackdrop.addEventListener('click', (e) => {
      if (e.target === orderModalBackdrop) closeOrderModal();
    });
  }

  // Handle Product Change -> Dynamic Size & Price UI
  if (orderProductSelect) {
    orderProductSelect.addEventListener('change', (e) => {
      handleProductSelectChange(e.target.value);
    });
  }

  function handleProductSelectChange(productName, defaultSize = '12 × 12') {
    if (productName === 'Disposable Fabric') {
      sizeFieldGroup.style.display = 'block';
      sizeNoteBadge.style.display = 'none';
      setSelectedSize(defaultSize);
    } else {
      sizeFieldGroup.style.display = 'none';
      sizeNoteBadge.style.display = 'block';
      currentSelectedSize = 'Standard / Discussion on Call';
      if (PRODUCT_PRICES[productName]) {
        currentUnitPrice = PRODUCT_PRICES[productName].unitPrice;
      }
    }
    updateLivePriceCalculation();
  }

  // Size Chips handling
  if (sizeChipsContainer) {
    sizeChipsContainer.querySelectorAll('.size-chip').forEach(chip => {
      chip.addEventListener('click', function() {
        sizeChipsContainer.querySelectorAll('.size-chip').forEach(c => c.classList.remove('is-selected'));
        this.classList.add('is-selected');
        currentSelectedSize = this.getAttribute('data-size');
        updateLivePriceCalculation();
      });
    });
  }

  function setSelectedSize(sizeVal) {
    currentSelectedSize = sizeVal;
    if (sizeChipsContainer) {
      sizeChipsContainer.querySelectorAll('.size-chip').forEach(chip => {
        if (chip.getAttribute('data-size') === sizeVal) {
          chip.classList.add('is-selected');
        } else {
          chip.classList.remove('is-selected');
        }
      });
    }
  }

  // Live Price Calculation
  function updateLivePriceCalculation() {
    const selectedProduct = orderProductSelect ? orderProductSelect.value : 'Disposable Bedsheet';
    
    if (selectedProduct === 'Disposable Fabric') {
      const sizeObj = PRODUCT_PRICES['Disposable Fabric'].sizes[currentSelectedSize] || PRODUCT_PRICES['Disposable Fabric'].sizes['12 × 12'];
      currentUnitPrice = sizeObj.price;
    } else if (PRODUCT_PRICES[selectedProduct]) {
      currentUnitPrice = PRODUCT_PRICES[selectedProduct].unitPrice;
    }

    const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    const totalEst = currentUnitPrice * qty;

    if (calcPriceVal) {
      calcPriceVal.textContent = `₹ ${totalEst.toLocaleString('en-IN')}`;
    }
  }

  // Quantity Control Buttons
  if (qtyMinusBtn && qtyPlusBtn && qtyInput) {
    qtyMinusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        updateLivePriceCalculation();
      }
    });

    qtyPlusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
      updateLivePriceCalculation();
    });

    qtyInput.addEventListener('input', () => {
      updateLivePriceCalculation();
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value);
      if (isNaN(val) || val < 1) qtyInput.value = 1;
      updateLivePriceCalculation();
    });
  }

  // --- Order Form Submission & WhatsApp Link Generator ---
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Collect inputs
      const customerName = document.getElementById('custName').value.trim();
      const mobileNumber = document.getElementById('custMobile').value.trim();
      const emailAddress = document.getElementById('custEmail').value.trim();
      const selectedProduct = orderProductSelect.value;
      const quantity = qtyInput.value;
      const unit = document.getElementById('orderUnit').value;
      const deliveryAddress = document.getElementById('custAddress').value.trim();
      const city = document.getElementById('custCity').value.trim();
      const pincode = document.getElementById('custPincode').value.trim();
      const message = document.getElementById('custMessage').value.trim();

      // Validate Required Fields
      let isValid = true;
      clearFormErrors(orderForm);

      if (!customerName) {
        showFieldError('custName', 'Please enter your full name.');
        isValid = false;
      }

      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileNumber || !mobileRegex.test(mobileNumber.replace(/\D/g, ''))) {
        showFieldError('custMobile', 'Please enter a valid 10-digit Indian mobile number.');
        isValid = false;
      }

      if (emailAddress && !validateEmail(emailAddress)) {
        showFieldError('custEmail', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!deliveryAddress) {
        showFieldError('custAddress', 'Please enter your delivery address.');
        isValid = false;
      }

      if (pincode && !/^\d{6}$/.test(pincode)) {
        showFieldError('custPincode', 'Please enter a valid 6-digit Indian pincode.');
        isValid = false;
      }

      if (!isValid) return;

      const totalEst = currentUnitPrice * (parseInt(quantity) || 1);

      // Construct Order Object
      const orderData = {
        id: 'SS-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        customerName,
        mobileNumber,
        emailAddress: emailAddress || 'N/A',
        product: selectedProduct,
        size: currentSelectedSize,
        quantity,
        unit,
        unitPrice: `₹ ${currentUnitPrice}`,
        totalEst: `₹ ${totalEst.toLocaleString('en-IN')}`,
        deliveryAddress,
        city: city || 'Kolhapur',
        pincode: pincode || 'N/A',
        message: message || 'None',
        status: 'Pending Owner Confirmation'
      };

      // Save Order locally for Admin Dashboard
      saveOrderToLocalStorage(orderData);

      // Build WhatsApp Message with Price Details
      const waText = 
`Hello S. S. Trading Company,

I would like to place an order request.

Customer Name: ${customerName}
Product: ${selectedProduct}
Size: ${currentSelectedSize}
Quantity: ${quantity} ${unit}
Price Rate: ₹ ${currentUnitPrice} per unit
Estimated Total: ₹ ${totalEst.toLocaleString('en-IN')}

Mobile: ${mobileNumber}
${emailAddress ? 'Email: ' + emailAddress + '\n' : ''}Delivery Address: ${deliveryAddress}
City: ${city || 'N/A'}
Pincode: ${pincode || 'N/A'}

Additional Requirements:
${message || 'None'}

Please confirm product availability, final price rate and delivery details.

Thank you.`;

      const encodedWaUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(waText)}`;
      const telUrl = `tel:${OWNER_PHONE}`;
      const mailtoUrl = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('New Order Request: ' + selectedProduct)}&body=${encodeURIComponent(waText)}`;

      // Update Order Success View
      document.getElementById('successCustName').textContent = customerName;
      document.getElementById('successProduct').textContent = selectedProduct;
      document.getElementById('successQtyUnit').textContent = `${quantity} ${unit}`;
      document.getElementById('successSize').textContent = currentSelectedSize;
      document.getElementById('successPrice').textContent = `₹ ${currentUnitPrice} / unit (Total Est: ₹ ${totalEst.toLocaleString('en-IN')})`;

      const waBtn = document.getElementById('successWaBtn');
      if (waBtn) waBtn.href = encodedWaUrl;

      const callBtn = document.getElementById('successCallBtn');
      if (callBtn) callBtn.href = telUrl;

      const emailBtn = document.getElementById('successEmailBtn');
      if (emailBtn) emailBtn.href = mailtoUrl;

      // Switch View inside Modal
      orderFormContainer.style.display = 'none';
      orderSuccessContainer.style.display = 'block';

      // Reset Form fields
      orderForm.reset();
    });
  }

  // --- Contact Form Submission ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('cntName').value.trim();
      const phone = document.getElementById('cntPhone').value.trim();
      const email = document.getElementById('cntEmail').value.trim();
      const message = document.getElementById('cntMessage').value.trim();

      clearFormErrors(contactForm);
      let isValid = true;

      if (!name) {
        showFieldError('cntName', 'Please enter your name.');
        isValid = false;
      }

      const mobileRegex = /^[6-9]\d{9}$/;
      if (!phone || !mobileRegex.test(phone.replace(/\D/g, ''))) {
        showFieldError('cntPhone', 'Please enter a valid 10-digit mobile number.');
        isValid = false;
      }

      if (email && !validateEmail(email)) {
        showFieldError('cntEmail', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!message) {
        showFieldError('cntMessage', 'Please enter your message.');
        isValid = false;
      }

      if (!isValid) return;

      showToast('Thank you! Your enquiry has been received. We will contact you shortly.');
      contactForm.reset();
    });
  }

  // --- Helpers for Validation Errors ---
  function showFieldError(fieldId, errorMsg) {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;

    const group = inputEl.closest('.form-group');
    if (group) {
      group.classList.add('has-error');
      let errText = group.querySelector('.form-error-text');
      if (!errText) {
        errText = document.createElement('div');
        errText.className = 'form-error-text';
        group.appendChild(errText);
      }
      errText.textContent = errorMsg;
    }
  }

  function clearFormErrors(formElement) {
    if (!formElement) return;
    formElement.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error');
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Toast Notification ---
  function showToast(msg) {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <span>${msg}</span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --- LocalStorage & Admin Dashboard Portal ---
  function getStoredOrders() {
    return JSON.parse(localStorage.getItem('ss_trading_orders') || '[]');
  }

  function saveOrderToLocalStorage(orderObj) {
    const orders = getStoredOrders();
    orders.unshift(orderObj);
    localStorage.setItem('ss_trading_orders', JSON.stringify(orders));
  }

  const adminModalBackdrop = document.getElementById('adminModalBackdrop');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const adminCloseBtn = document.getElementById('adminCloseBtn');
  const adminOrdersList = document.getElementById('adminOrdersList');

  if (openAdminBtn) {
    openAdminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderAdminDashboard();
      if (adminModalBackdrop) {
        adminModalBackdrop.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      if (adminModalBackdrop) {
        adminModalBackdrop.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    });
  }

  function renderAdminDashboard() {
    const orders = getStoredOrders();

    // Stats
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'Pending Owner Confirmation' || o.status === 'Pending').length;
    const confirmedCount = orders.filter(o => o.status === 'Confirmed').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

    document.getElementById('statTotal').textContent = totalCount;
    document.getElementById('statPending').textContent = pendingCount;
    document.getElementById('statConfirmed').textContent = confirmedCount;
    document.getElementById('statDelivered').textContent = deliveredCount;

    if (!adminOrdersList) return;

    if (orders.length === 0) {
      adminOrdersList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">No order requests received yet.</p>`;
      return;
    }

    adminOrdersList.innerHTML = orders.map((ord, idx) => {
      const waMsg = encodeURIComponent(`Hello ${ord.customerName}, regarding your order request ${ord.id} for ${ord.product}...`);
      const statusClass = getStatusBadgeClass(ord.status);

      return `
        <div class="admin-order-card">
          <div class="admin-order-header">
            <div>
              <span class="admin-order-id">${ord.id}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 8px;">${ord.date}</span>
            </div>
            <span class="badge-status ${statusClass}">${ord.status}</span>
          </div>
          <div class="admin-order-body">
            <p><strong>Customer:</strong> ${ord.customerName} (${ord.mobileNumber})</p>
            <p><strong>Product:</strong> ${ord.product} | <strong>Size:</strong> ${ord.size}</p>
            <p><strong>Quantity:</strong> ${ord.quantity} ${ord.unit} | <strong>Total Est:</strong> ${ord.totalEst || 'N/A'}</p>
            <p><strong>Delivery:</strong> ${ord.deliveryAddress}, ${ord.city} - ${ord.pincode}</p>
            ${ord.message && ord.message !== 'None' ? `<p><strong>Note:</strong> ${ord.message}</p>` : ''}
          </div>
          <div class="admin-order-actions">
            <a href="https://wa.me/91${ord.mobileNumber.replace(/\D/g, '')}?text=${waMsg}" target="_blank" class="btn btn-whatsapp btn-sm">💬 WhatsApp Customer</a>
            <a href="tel:${ord.mobileNumber}" class="btn btn-secondary btn-sm">📞 Call Customer</a>
            <select class="form-select js-status-change" data-index="${idx}" style="width: auto; height: 38px; padding: 0 0.5rem; font-size: 0.8rem; border-radius: 8px;">
              <option value="Pending Owner Confirmation" ${ord.status === 'Pending Owner Confirmation' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${ord.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Processing" ${ord.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Dispatched" ${ord.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>
      `;
    }).join('');

    // Attach status change listeners
    document.querySelectorAll('.js-status-change').forEach(selectEl => {
      selectEl.addEventListener('change', function() {
        const idx = this.getAttribute('data-index');
        const newStatus = this.value;
        const allOrders = getStoredOrders();
        allOrders[idx].status = newStatus;
        localStorage.setItem('ss_trading_orders', JSON.stringify(allOrders));
        renderAdminDashboard();
        showToast('Order status updated to: ' + newStatus);
      });
    });
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Confirmed': return 'badge-confirmed';
      case 'Processing': return 'badge-processing';
      case 'Dispatched': return 'badge-dispatched';
      case 'Delivered': return 'badge-delivered';
      case 'Cancelled': return 'badge-cancelled';
      default: return 'badge-pending';
    }
  }
});
