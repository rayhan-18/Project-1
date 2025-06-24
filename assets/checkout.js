// ===================== Enhanced Checkout Multi-step =====================
const shippingCosts = {
  standard: 0,
  express: 40000,
  pickup: 0
};

let currentStep = 1;
const totalSteps = 3;

// Format Rupiah helper
function formatRupiah(value) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

// Save shipping info to localStorage
function saveShippingInfo() {
  const shippingInfo = {
    name: document.getElementById('shippingName').value.trim(),
    phone: document.getElementById('shippingPhone').value.trim(),
    address: document.getElementById('shippingAddress').value.trim()
  };
  localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
}

// Load shipping info from localStorage
function loadShippingInfo() {
  const saved = localStorage.getItem('shippingInfo');
  if (saved) {
    const info = JSON.parse(saved);
    document.getElementById('shippingName').value = info.name || '';
    document.getElementById('shippingPhone').value = info.phone || '';
    document.getElementById('shippingAddress').value = info.address || '';
  }
}

// Clear checkout data from localStorage
function clearCheckoutData() {
  localStorage.removeItem('shippingInfo');
}

// Validate shipping information
function validateShippingInfo() {
  let isValid = true;
  const name = document.getElementById('shippingName').value.trim();
  const phone = document.getElementById('shippingPhone').value.trim();
  const address = document.getElementById('shippingAddress').value.trim();

  // Name validation
  if (name.length < 3) {
    showError('shippingName', 'Nama minimal 3 karakter');
    isValid = false;
  } else {
    hideError('shippingName');
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10,13}$/;
  if (!phoneRegex.test(phone)) {
    showError('shippingPhone', 'Nomor telepon harus 10-13 digit angka');
    isValid = false;
  } else {
    hideError('shippingPhone');
  }

  // Address validation
  if (address.length < 10) {
    showError('shippingAddress', 'Alamat terlalu pendek, mohon lengkapi');
    isValid = false;
  } else {
    hideError('shippingAddress');
  }

  return isValid;
}

// Show error message
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = field.parentElement.querySelector('.error-message');
  field.classList.add('error-input');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Hide error message
function hideError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = field.parentElement.querySelector('.error-message');
  field.classList.remove('error-input');
  errorElement.style.display = 'none';
}

// Animate step transition
function animateStepTransition(newStep) {
  const currentContent = document.querySelector(`.step-content[data-step="${currentStep}"]`);
  const newContent = document.querySelector(`.step-content[data-step="${newStep}"]`);

  // Animate out current step
  if (currentContent) {
    currentContent.style.opacity = '0';
    currentContent.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      currentContent.classList.remove('active');
    }, 300);
  }

  // Animate in new step
  setTimeout(() => {
    newContent.classList.add('active');
    newContent.style.opacity = '1';
    newContent.style.transform = 'translateX(0)';
  }, 300);
}

// Render checkout items in step 1
async function renderCheckoutItems() {
  const container = document.querySelector('#checkoutItems .items-list');
  if (!container) {
    console.warn('Element with class "items-list" not found.');
    return;
  }

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    container.innerHTML = '<p class="empty-cart">Silakan login terlebih dahulu</p>';
    return;
  }

  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal memuat keranjang');

    const cart = await res.json();
    if (cart.length === 0) {
      container.innerHTML = '<p class="empty-cart">Keranjang Anda kosong</p>';
      return;
    }

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="checkout-item">
          <img src="${item.image_url || '/assets/default-product.png'}" alt="${item.product_name}">
          <div class="item-details">
            <h4>${item.product_name}</h4>
            <p>${formatRupiah(item.price)} x ${item.quantity}</p>
          </div>
          <div class="item-total">${formatRupiah(item.price * item.quantity)}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="error-message">Gagal memuat produk keranjang</p>';
  }
}

// Render product summary in step 3
async function renderProductSummary() {
  const container = document.getElementById('productSummaryList');
  container.innerHTML = '';

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    container.innerHTML = '<p>Silakan login terlebih dahulu</p>';
    return;
  }
  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal memuat keranjang');
    const cart = await res.json();

    if (cart.length === 0) {
      container.innerHTML = '<p>Keranjang Anda kosong</p>';
      return;
    }

    cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'product-summary-item';
      
      itemEl.innerHTML = `
        <img src="${item.image_url || 'default-product.png'}" alt="${item.product_name}" class="product-summary-image" />
        <div class="product-summary-info">
          <span class="product-summary-name">${item.product_name}</span>
          <span class="product-summary-qty">${item.quantity} x ${formatRupiah(item.price)}</span>
        </div>
      `;
      container.appendChild(itemEl);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Gagal memuat produk ringkasan</p>';
  }
}

// Render price summary in step 3
async function renderSummary() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    document.getElementById('checkoutSubtotal').textContent = formatRupiah(0);
    document.getElementById('checkoutShipping').textContent = formatRupiah(0);
    document.getElementById('checkoutTax').textContent = formatRupiah(0);
    document.getElementById('checkoutTotal').textContent = formatRupiah(0);
    document.getElementById('productSummaryList').innerHTML = '';
    return;
  }
  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal fetch cart');
    const cart = await res.json();
    if (cart.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Keranjang Anda kosong.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
      return;
    }

    let subtotal = 0;
    cart.forEach(item => { subtotal += item.price * item.quantity; });

    const shippingMethod = document.getElementById('shippingMethod').value;
    const shippingCost = shippingCosts[shippingMethod] || 0;
    const tax = subtotal * 0.10;
    const total = subtotal + tax + shippingCost;

    document.getElementById('checkoutSubtotal').textContent = formatRupiah(subtotal);
    document.getElementById('checkoutShipping').textContent = formatRupiah(shippingCost);
    document.getElementById('checkoutTax').textContent = formatRupiah(tax);
    document.getElementById('checkoutTotal').textContent = formatRupiah(total);

  } catch (error) {
    console.error(error);
    Swal.fire({
      title: 'Error',
      text: 'Gagal memuat ringkasan harga.',
      icon: 'error',
      confirmButtonColor: '#4a7c59'
    });
  }
}

// Show current step
function showStep(step) {
  // Update stepper indicator
  document.querySelectorAll('.stepper .step').forEach(indicator => {
    const stepNum = Number(indicator.dataset.step);
    indicator.classList.toggle('active', stepNum === step);
    indicator.classList.toggle('completed', stepNum < step);
  });

  // Update navigation buttons
  const prevBtn = document.querySelector('.btn-prev');
  if (prevBtn) {
    prevBtn.disabled = step === 1;
    prevBtn.style.opacity = step === 1 ? '0.5' : '1';
    prevBtn.style.cursor = step === 1 ? 'not-allowed' : 'pointer';
  }

  const nextBtn = document.querySelector('.btn-next');
  if (nextBtn) {
    nextBtn.textContent = step === totalSteps ? '🎉 Buat Pesanan' : 'Selanjutnya';
    nextBtn.innerHTML = step === totalSteps ? '🎉 Buat Pesanan' : 'Selanjutnya <i class="fas fa-arrow-right"></i>';
  }

  // Animate step transition
  animateStepTransition(step);

  // Render content based on step
  if (step === 1) {
    renderCheckoutItems();
  } else if (step === 3) {
    renderSummary();
    renderProductSummary();
  }

  // Check validation for next button
  checkValid(step);
}

// Validate current step to enable next button
function checkValid(step) {
  let valid = false;

  if (step === 1) {
    const name = document.getElementById('shippingName').value.trim();
    const phone = document.getElementById('shippingPhone').value.trim();
    const address = document.getElementById('shippingAddress').value.trim();
    
    valid = name.length >= 3 && 
            /^[0-9]{10,13}$/.test(phone) && 
            address.length >= 10;
  } else if (step === 2) {
    valid = document.getElementById('shippingMethod').value !== '';
  } else if (step === 3) {
    valid = document.getElementById('paymentMethod').value !== '';
  }

  const nextBtn = document.querySelector('.btn-next');
  if (nextBtn) {
    nextBtn.disabled = !valid;
    nextBtn.style.opacity = valid ? '1' : '0.6';
    nextBtn.style.cursor = valid ? 'pointer' : 'not-allowed';
  }
}

// Handle next step
async function nextStep() {
  if (currentStep === 1 && !validateShippingInfo()) return;
  
  if (currentStep === 1) saveShippingInfo();

  if (!await validateStep(currentStep)) return;

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    // Confirm before placing order
    const { isConfirmed } = await Swal.fire({
      title: 'Konfirmasi Pesanan',
      html: 'Anda yakin ingin memesan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pesan Sekarang',
      cancelButtonText: 'Periksa Kembali',
      backdrop: 'rgba(0,0,0,0.4)',
      confirmButtonColor: '#4a7c59',
      cancelButtonColor: '#6c757d'
    });
    
    if (isConfirmed) {
      await placeOrder();
    }
  }
}

// Handle previous step
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// Validate current step
async function validateStep(step) {
  if (step === 1) {
    if (!validateShippingInfo()) {
      await Swal.fire({
        title: 'Error',
        text: 'Mohon lengkapi informasi pengiriman dengan benar.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
      return false;
    }
  }
  if (step === 2) {
    const shippingMethod = document.getElementById('shippingMethod').value;
    if (!shippingMethod) {
      await Swal.fire({
        title: 'Error',
        text: 'Pilih metode pengiriman.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
      return false;
    }
  }
  if (step === 3) {
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) {
      await Swal.fire({
        title: 'Error',
        text: 'Pilih metode pembayaran.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
      return false;
    }
  }
  return true;
}

// Place order function
async function placeOrder() {
  const nextBtn = document.querySelector('.btn-next');
  try {
    // Show loading state
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    nextBtn.disabled = true;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return Swal.fire({
        title: 'Error',
        text: 'Anda harus login untuk melakukan checkout.',
        icon: 'error',
        confirmButtonColor: '#4a7c59'
      });
    }
    const user = JSON.parse(userStr);

    // Get form data
    const name = document.getElementById('shippingName').value.trim();
    const phone = document.getElementById('shippingPhone').value.trim();
    const address = document.getElementById('shippingAddress').value.trim();
    const shippingMethod = document.getElementById('shippingMethod').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    // Validate inputs
    if (!name || !phone || !address) {
      return Swal.fire({
        title: 'Error',
        text: 'Mohon lengkapi informasi pengiriman.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
    }
    if (!shippingMethod) {
      return Swal.fire({
        title: 'Error',
        text: 'Pilih metode pengiriman.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
    }
    if (!paymentMethod) {
      return Swal.fire({
        title: 'Error',
        text: 'Pilih metode pembayaran.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
    }

    // Get cart from server
    const resCart = await fetch(`/api/cart/${user.id}`);
    if (!resCart.ok) throw new Error('Gagal mengambil data keranjang');
    const cart = await resCart.json();

    if (cart.length === 0) {
      return Swal.fire({
        title: 'Error',
        text: 'Keranjang Anda kosong.',
        icon: 'warning',
        confirmButtonColor: '#4a7c59'
      });
    }

    // Calculate subtotal
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    // Calculate shipping and tax
    const shippingCost = shippingCosts[shippingMethod] || 0;
    const tax = subtotal * 0.10;
    const totalAmount = subtotal + tax + shippingCost;

    // Generate payment details
    const payment_details = generatePaymentDetails(paymentMethod, totalAmount);

    // Prepare order data
    const orderData = {
      user_id: user.id,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      payment_method: paymentMethod,
      subtotal: subtotal,
      tax: tax,
      total: totalAmount,
      items: cart,
      payment_details: payment_details,
      shipping: {
        name: name,
        phone: phone,
        address: address,
        method: shippingMethod,
        cost: shippingCost
      }
    };

    // Submit order
    const resOrder = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!resOrder.ok) {
      const errorData = await resOrder.json();
      throw new Error(errorData.message || 'Gagal membuat pesanan');
    }

    const data = await resOrder.json();
    const orderId = data.order_id;

    // Clear cart from server after successful order
    try {
      const deleteCartRes = await fetch(`/api/cart/${user.id}`, {
        method: 'DELETE',
      });

      if (!deleteCartRes.ok) {
        throw new Error('Gagal menghapus cart setelah checkout');
      }

      // Clear local storage
      clearCheckoutData();

      // Show payment instructions
      showPaymentInstructions(paymentMethod, payment_details, orderId);

    } catch (error) {
      console.error('Gagal menghapus cart:', error);
      // Meskipun gagal hapus cart, tetap lanjutkan ke payment instructions
      // karena order sudah berhasil dibuat
      clearCheckoutData();
      showPaymentInstructions(paymentMethod, payment_details, orderId);
    }

  } catch (error) {
    console.error(error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'Gagal membuat pesanan.',
      icon: 'error',
      confirmButtonColor: '#4a7c59'
    });
  } finally {
    if (nextBtn) {
      nextBtn.innerHTML = '🎉 Buat Pesanan';
      nextBtn.disabled = false;
    }
  }
}

// Generate payment details based on method
function generatePaymentDetails(method, total) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  if (method === 'transfer') {
    const selectedBank = document.querySelector('.bank-option.active')?.dataset.bank || 'bca';
    const bankName = {
      bca: 'BCA',
      mandiri: 'Mandiri',
      bri: 'BRI',
      btn: 'BTN'
    }[selectedBank] || 'BCA';
    
    return {
      bank_name: bankName,
      virtual_account: '812' + Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 10),
      amount: total,
      expiry_time: expiryDate.toISOString()
    };
  } else if (method === 'ewallet') {
    const selectedWallet = document.querySelector('.ewallet-option.active')?.dataset.wallet || 'ovo';
    const walletName = {
      ovo: 'OVO',
      gopay: 'Gopay',
      dana: 'Dana'
    }[selectedWallet] || 'OVO';
    const phoneNumber = '08' + Math.floor(1000000000 + Math.random() * 9000000000);
    
    return {
      wallet_name: walletName,
      phone_number: phoneNumber,
      amount: total,
      expiry_time: expiryDate.toISOString()
    };
  } else if (method === 'cod') {
    return {
      amount: total
    };
  }
}

// Show payment instructions
function showPaymentInstructions(method, details, orderId) {
  let html = '';
  let title = '';
  let timer = 24 * 60 * 60; // 24 hours in seconds

  if (method === 'transfer') {
    title = 'Virtual Account Pembayaran';
    html = `
      <div style="text-align: center;">
        <h3>${details.bank_name} Virtual Account</h3>
        <p style="font-size: 24px; font-weight: bold; margin: 15px 0;">${details.virtual_account}</p>
        <p>Jumlah yang harus dibayar:</p>
        <p style="font-size: 20px; font-weight: bold; color: #4a7c59;">${formatRupiah(details.amount)}</p>
        <p style="color: #e74c3c;">Batas waktu pembayaran: ${new Date(details.expiry_time).toLocaleString('id-ID')}</p>
      </div>
      <div style="margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h4 style="margin-top: 0;">Cara Pembayaran:</h4>
        <ol style="text-align: left; padding-left: 20px;">
          <li>Buka aplikasi mobile banking ${details.bank_name} Anda</li>
          <li>Pilih menu "Transfer" lalu "Virtual Account"</li>
          <li>Masukkan nomor virtual account di atas</li>
          <li>Konfirmasi nominal pembayaran</li>
          <li>Selesaikan transaksi</li>
        </ol>
      </div>
    `;
  } else if (method === 'ewallet') {
    title = 'Pembayaran E-Wallet';
    html = `
      <div style="text-align: center;">
        <h3>${details.wallet_name}</h3>
        <p style="font-size: 24px; font-weight: bold; margin: 15px 0;">${details.phone_number}</p>
        <p>Jumlah yang harus dibayar:</p>
        <p style="font-size: 20px; font-weight: bold; color: #4a7c59;">${formatRupiah(details.amount)}</p>
        <p style="color: #e74c3c;">Batas waktu pembayaran: ${new Date(details.expiry_time).toLocaleString('id-ID')}</p>
      </div>
      <div style="margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h4 style="margin-top: 0;">Cara Pembayaran:</h4>
        <ol style="text-align: left; padding-left: 20px;">
          <li>Buka aplikasi ${details.wallet_name} Anda</li>
          <li>Pilih menu "Transfer" atau "Bayar"</li>
          <li>Masukkan nomor ${details.phone_number}</li>
          <li>Masukkan nominal ${formatRupiah(details.amount)}</li>
          <li>Tambahkan catatan "Order #${orderId}"</li>
          <li>Selesaikan transaksi</li>
        </ol>
      </div>
    `;
  } else if (method === 'cod') {
    title = 'Pembayaran di Tempat (COD)';
    html = `
      <div style="text-align: center;">
        <h3>Bayar saat barang diterima</h3>
        <p>Total yang harus dibayar:</p>
        <p style="font-size: 24px; font-weight: bold; color: #4a7c59; margin: 15px 0;">${formatRupiah(details.amount)}</p>
        <p>Pesanan Anda akan segera diproses dan dikirimkan ke alamat yang telah Anda berikan.</p>
      </div>
    `;
  }

  // Show payment instructions
  Swal.fire({
    title: title,
    html: html,
    icon: 'info',
    confirmButtonText: 'Saya Sudah Memahami',
    confirmButtonColor: '#4a7c59',
    width: '600px'
  }).then(() => {
    window.location.href = `/publik/order-sukses.html?order_id=${orderId}`;
  });

  // Start countdown timer (optional)
  if (method !== 'cod') {
    startPaymentTimer(timer, orderId);
  }
}

// Start payment countdown timer
function startPaymentTimer(duration, orderId) {
  const timerDisplay = document.createElement('div');
  timerDisplay.style.position = 'fixed';
  timerDisplay.style.bottom = '20px';
  timerDisplay.style.right = '20px';
  timerDisplay.style.backgroundColor = '#4a7c59';
  timerDisplay.style.color = 'white';
  timerDisplay.style.padding = '10px 15px';
  timerDisplay.style.borderRadius = '5px';
  timerDisplay.style.zIndex = '9999';
  timerDisplay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  document.body.appendChild(timerDisplay);

  const timer = setInterval(() => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    timerDisplay.textContent = `Batas waktu pembayaran: ${hours} jam ${minutes} menit ${seconds} detik`;

    if (--duration < 0) {
      clearInterval(timer);
      timerDisplay.textContent = 'Waktu pembayaran telah habis';
      timerDisplay.style.backgroundColor = '#e74c3c';
      
      // Show timeout notification
      setTimeout(() => {
        Swal.fire({
          title: 'Waktu Pembayaran Habis',
          text: 'Batas waktu pembayaran Anda telah berakhir. Silakan buat pesanan baru jika masih ingin melanjutkan.',
          icon: 'warning',
          confirmButtonColor: '#4a7c59'
        });
      }, 1000);
    }
  }, 1000);

  // Remove timer when navigating away
  window.addEventListener('beforeunload', () => {
    clearInterval(timer);
    document.body.removeChild(timerDisplay);
  });
}

// Update payment details when payment method changes
document.getElementById('paymentMethod').addEventListener('change', function() {
  const paymentMethod = this.value;
  const paymentDetails = document.getElementById('paymentDetails');
  
  if (!paymentMethod) {
    paymentDetails.style.display = 'none';
    return;
  }

  // Generate sample details for preview
  const sampleDetails = generatePaymentDetails(paymentMethod, 100000); // Sample amount
  
  if (paymentMethod === 'transfer') {
    paymentDetails.innerHTML = `
      <div class="bank-options">
        <h4>Pilih Bank:</h4>
        <div class="bank-option active" data-bank="bca">
          <img src="/images/bca.png" alt="BCA">
          <span>BCA Virtual Account</span>
        </div>
        <div class="bank-option" data-bank="mandiri">
          <img src="/images/mandiri.png" alt="Mandiri">
          <span>Mandiri Virtual Account</span>
        </div>
        <div class="bank-option" data-bank="bri">
          <img src="/images/bri.png" alt="BRI">
          <span>BRI Virtual Account</span>
        </div>
        <div class="bank-option" data-bank="btn">
          <img src="/images/btn.png" alt="BTN">
          <span>BTN Virtual Account</span>
        </div>
      </div>
      <p class="payment-note">Nomor virtual account akan ditampilkan setelah Anda menyelesaikan pesanan.</p>
    `;
    
    // Add click event for bank options
    document.querySelectorAll('.bank-option').forEach(option => {
      option.addEventListener('click', function() {
        document.querySelectorAll('.bank-option').forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
      });
    });
  } else if (paymentMethod === 'ewallet') {
    paymentDetails.innerHTML = `
      <div class="ewallet-options">
        <h4>Pilih E-Wallet:</h4>
        <div class="ewallet-option active" data-wallet="ovo">
          <img src="/images/ovo.png" alt="OVO">
          <span>OVO</span>
        </div>
        <div class="ewallet-option" data-wallet="gopay">
          <img src="/images/gopay.png" alt="Gopay">
          <span>Gopay</span>
        </div>
        <div class="ewallet-option" data-wallet="dana">
          <img src="/images/dana.png" alt="Dana">
          <span>Dana</span>
        </div>
      </div>
      <p class="payment-note">Nomor pembayaran akan ditampilkan setelah Anda menyelesaikan pesanan.</p>
    `;
    
    // Add click event for e-wallet options
    document.querySelectorAll('.ewallet-option').forEach(option => {
      option.addEventListener('click', function() {
        document.querySelectorAll('.ewallet-option').forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
      });
    });
  } else if (paymentMethod === 'cod') {
    paymentDetails.innerHTML = `
      <div class="cod-info">
        <p><i class="fas fa-info-circle"></i> Anda akan membayar ketika barang sudah diterima.</p>
        <p>Pastikan Anda menyiapkan uang tunai sebesar total pembayaran.</p>
      </div>
    `;
  }

  paymentDetails.style.display = 'block';
});

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
  // Load saved shipping info
  loadShippingInfo();

  // Real-time validation for inputs
  document.getElementById('shippingName').addEventListener('input', () => {
    const name = document.getElementById('shippingName').value.trim();
    if (name.length < 3 && name.length > 0) {
      showError('shippingName', 'Nama minimal 3 karakter');
    } else {
      hideError('shippingName');
    }
    checkValid(currentStep);
  });

  document.getElementById('shippingPhone').addEventListener('input', () => {
    const phone = document.getElementById('shippingPhone').value.trim();
    if (!/^[0-9]{10,13}$/.test(phone) && phone.length > 0) {
      showError('shippingPhone', 'Nomor telepon harus 10-13 digit angka');
    } else {
      hideError('shippingPhone');
    }
    checkValid(currentStep);
  });

  document.getElementById('shippingAddress').addEventListener('input', () => {
    const address = document.getElementById('shippingAddress').value.trim();
    if (address.length < 10 && address.length > 0) {
      showError('shippingAddress', 'Alamat terlalu pendek, mohon lengkapi');
    } else {
      hideError('shippingAddress');
    }
    checkValid(currentStep);
  });

  document.getElementById('shippingMethod').addEventListener('change', () => {
    checkValid(currentStep);
    if (currentStep === 3) renderSummary();
  });

  document.getElementById('paymentMethod').addEventListener('change', () => {
    checkValid(currentStep);
  });

  // Navigation button event listeners
  const nextBtn = document.querySelector('.btn-next');
  const prevBtn = document.querySelector('.btn-prev');
  
  if (nextBtn) nextBtn.addEventListener('click', nextStep);
  if (prevBtn) prevBtn.addEventListener('click', prevStep);
  
  // Initialize first step
  showStep(currentStep);
});