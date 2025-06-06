  // ===================== Modal Handling =====================
function toggleModal(modalId = 'loginModal') {
  const userStr = localStorage.getItem('user');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      // Semua user (admin atau bukan) langsung ke account.html
      window.location.href = "/publik/account.html";

    } catch (e) {
      // Kalau userStr rusak / tidak bisa di-parse
      console.error("User data tidak valid", e);
      localStorage.removeItem('user');

      // Tampilkan modal login
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.toggle('hidden');
    }
  } else {
    // Kalau belum login, tampilkan modal login
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('hidden');
  }
}

function showLogin() {
  document.getElementById("loginModal")?.classList.remove("hidden");
  document.getElementById("registerModal")?.classList.add("hidden");
}

function showRegister() {
  document.getElementById("registerModal")?.classList.remove("hidden");
  document.getElementById("loginModal")?.classList.add("hidden");
}

// ===================== Count Update =====================
function updateCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    if (cart.length > 0) {
      cartCountElement.textContent = cart.length;
      cartCountElement.style.display = 'inline-block'; // tampilkan
    } else {
      cartCountElement.textContent = '';
      cartCountElement.style.display = 'none'; // sembunyikan kalau kosong
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

function updateWishlistCount() {
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCountElement = document.querySelector('.wishlist-count');
    if (!wishlistCountElement) return;

    if (wishlist.length > 0) {
      wishlistCountElement.textContent = wishlist.length;
      wishlistCountElement.style.display = 'inline-block'; // tampilkan
    } else {
      wishlistCountElement.textContent = '';
      wishlistCountElement.style.display = 'none'; // sembunyikan kalau kosong
    }
  } catch (error) {
    console.error('Error updating wishlist count:', error);
  }
}

// ===================== User Data Fetching =====================
async function fetchAndStoreUserData(userId) {
  try {
    const [cartRes, wishlistRes] = await Promise.all([
      fetch(`http://localhost:3000/api/cart/${userId}`),
      fetch(`http://localhost:3000/api/wishlist/${userId}`)
    ]);

    if (!cartRes.ok || !wishlistRes.ok) throw new Error('Gagal fetch cart/wishlist');

    const cart = await cartRes.json();
    const wishlist = await wishlistRes.json();

    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    updateCartCount();
    updateWishlistCount();
  } catch (err) {
    console.error('Fetch user data error:', err);
  }
}

// ===================== Add to Cart & Wishlist =====================
function addToCart(product) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return Swal.fire({
      icon: "warning",
      title: "Login Diperlukan",
      text: "Silakan login terlebih dahulu."
    });
  }

  const user = JSON.parse(userStr);

  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Cek apakah produk sudah ada di cart
    const exists = cart.some(p => p.product_id === product.product_id);
    if (exists) {
      return Swal.fire({
        icon: "info",
        title: "Sudah Ada",
        text: `"${product.product_name}" sudah ada di keranjang.`
      });
    }

    // Buat salinan produk baru, agar tidak mengubah objek asli
    const productToAdd = {
      ...product,
      quantity: 1,
      image_url: product.image || product.image_url || '', // pastikan properti image_url ada
    };
    delete productToAdd.image; // hapus properti image asli agar tidak redundan

    cart.push(productToAdd);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Kirim data ke backend tanpa blocking UI
    fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productToAdd, user_id: user.id })
    }).catch(err => {
      console.error('Error syncing cart to server:', err);
    });

    Swal.fire({
      icon: "success",
      title: "Ditambahkan ke Keranjang!",
      text: `"${product.product_name}" telah ditambahkan.`
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat menambahkan ke keranjang."
    });
  }
}

function addToWishlist(product) {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return Swal.fire({
      icon: "warning",
      title: "Login Diperlukan",
      text: "Silakan login terlebih dahulu."
    });
  }

  const user = JSON.parse(userStr);

  try {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Cek apakah produk sudah ada di wishlist
    const exists = wishlist.some(p => p.product_id === product.product_id);
    if (exists) {
      return Swal.fire({
        icon: "info",
        title: "Sudah Ada",
        text: `"${product.product_name}" sudah ada di wishlist.`
      });
    }

    // Buat salinan produk baru agar tidak mengubah objek asli
    const productToAdd = {
      ...product,
      image_url: product.image || product.image_url || ''
    };
    delete productToAdd.image;

    wishlist.push(productToAdd);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();

    // Kirim data ke backend tanpa blocking UI
    fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...productToAdd, user_id: user.id })
    }).catch(err => {
      console.error('Error syncing wishlist to server:', err);
    });

    Swal.fire({
      icon: "success",
      title: "Ditambahkan ke Wishlist!",
      text: `"${product.product_name}" telah ditambahkan.`
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Terjadi kesalahan saat menambahkan ke wishlist."
    });
  }
}

// ===================== Pop-up Handling =====================
function closeAllPopups() {
  document.getElementById('wishlistPopup')?.classList.remove('show');
  document.getElementById('cartPopup')?.classList.remove('show');
}

async function openCartModal() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return Swal.fire({
      icon: 'warning',
      title: 'Login Diperlukan',
      text: 'Silakan login dulu.'
    });
  }

  try {
    const user = JSON.parse(userStr);
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal fetch cart');

    const cart = await res.json();
    const container = document.getElementById('cartItems');
    container.innerHTML = cart.length === 0
      ? '<p class="text-gray-500">Keranjang kosong.</p>'
      : '';

    let subtotal = 0;

    cart.forEach(item => {
      const totalItemPrice = item.price * item.quantity;
      subtotal += totalItemPrice;

      const el = document.createElement('div');
      el.className = 'popup-item';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" />
        <div class="popup-item-info">
          <span class="popup-item-name">${item.product_name}</span>
          <div><strong>Rp ${Number(item.price).toLocaleString()}</strong></div>
          <div class="popup-item-buttons">
            <button class="btn" onclick="updateQuantity(${item.product_id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button class="btn" onclick="updateQuantity(${item.product_id}, 1)">+</button>
            <button class="btn btn-red" onclick="removeFromCart(${item.product_id})">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(el);
    });

    // Hitung total & tax
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    document.getElementById('subtotalAmount').textContent = `Rp ${subtotal.toLocaleString()}`;
    document.getElementById('shippingAmount').textContent = `Rp 0`;
    document.getElementById('taxAmount').textContent = `Rp ${tax.toLocaleString()}`;
    document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString()}`;

    closeAllPopups();
    document.getElementById('cartPopup')?.classList.add('show');

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Gagal membuka keranjang.'
    });
  }
}

async function openWishlistModal() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return Swal.fire({ icon: 'warning', title: 'Login Diperlukan', text: 'Silakan login dulu.' });

  try {
    const user = JSON.parse(userStr);
    const res = await fetch(`http://localhost:3000/api/wishlist/${user.id}`);
    if (!res.ok) throw new Error('Gagal fetch wishlist');

    const wishlist = await res.json();
    const container = document.getElementById('wishlistItems');
    container.innerHTML = wishlist.length === 0 ? '<p class="text-gray-500">Wishlist kosong.</p>' : '';

    wishlist.forEach(item => {
      const safeProduct = encodeURIComponent(JSON.stringify(item));
      const safeName = item.product_name.replace(/'/g, "\\'");
      const el = document.createElement('div');
      el.classList.add('popup-item');
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" />
        <div class="popup-item-info">
          <span class="popup-item-name">${item.product_name}</span>
          <div class="popup-item-buttons">
            <button class="btn btn-green" onclick='addToCartFromWishlistItem(JSON.parse(decodeURIComponent("${safeProduct}")))'>Add to Cart</button>
            <button class="btn btn-red" onclick="removeFromWishlist(${item.product_id}, '${safeName}')">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(el);
    });

    closeAllPopups(); // Tutup popup lain
    document.getElementById('wishlistPopup')?.classList.add('show');

  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal membuka wishlist.' });
  }
}

// Fungsi untuk update stok produk di UI berdasarkan productId dan quantity yang diambil dari cart
async function updateProductStockUI(productId) {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${productId}`);
    if (!res.ok) throw new Error('Gagal fetch produk stok');
    const product = await res.json();

    const stockElement = document.querySelector(`.product-stock[data-product-id="${productId}"] span`);
    if (!stockElement) return;

    // Tampilkan stok asli tanpa dikurangi quantity di cart
    if (product.stock <= 0) {
      stockElement.textContent = 'Habis';
      stockElement.style.color = 'red';
    } else if (product.stock <= 5) {
      stockElement.textContent = product.stock;
      stockElement.style.color = 'orange';
    } else {
      stockElement.textContent = product.stock;
      stockElement.style.color = '#4a7c59';
    }

  } catch (error) {
    console.error('Error updating product stock UI:', error);
  }
}

// Modifikasi updateQuantity supaya setelah update cart juga update stok UI-nya
async function updateQuantity(productId, quantityChange) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return;

  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`http://localhost:3000/api/cart/updateQuantity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        product_id: productId,
        quantity: quantityChange
      })
    });

    if (!res.ok) throw new Error('Gagal update kuantitas');

    // Refresh isi cart dan stok produk
    await openCartModal();
    await updateProductStockUI(productId);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Tidak bisa update kuantitas produk.'
    });
  }
}

async function removeFromCart(productId) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return;

  const user = JSON.parse(userStr);
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.product_id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  try {
    await fetch(`http://localhost:3000/api/cart/${user.id}/${productId}`, {
      method: 'DELETE'
    });

    await openCartModal(); // Refresh cart popup
    await updateProductStockUI(productId); // Update stok UI

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghapus dari keranjang.' });
  }
}

async function removeFromWishlist(productId, productName) {
  const result = await Swal.fire({
    title: `Hapus "${productName}" dari wishlist?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) return;

  const userStr = localStorage.getItem('user');
  if (!userStr) return;

  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`http://localhost:3000/api/wishlist/${user.id}/${productId}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Gagal menghapus wishlist');

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(item => item.product_id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();

    await openWishlistModal(); // Refresh UI

    Swal.fire({
      icon: 'success',
      title: 'Terhapus!',
      text: `"${productName}" sudah dihapus dari wishlist.`,
      timer: 1500,
      showConfirmButton: false
    });

  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghapus wishlist.' });
  }
}

// ===================== Toggle Manual (gunakan jika perlu) =====================
function toggleWishlistPopup() {
  const popup = document.getElementById('wishlistPopup');
  popup.classList.toggle('show');
  document.getElementById('cartPopup')?.classList.remove('show');
}

function toggleCartPopup() {
  const popup = document.getElementById('cartPopup');
  popup.classList.toggle('show');
  document.getElementById('wishlistPopup')?.classList.remove('show');
}

// ===================== Form Handling =====================
document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchAndStoreUserData(data.user.id);

      console.log('User login:', data.user); // 🐞 Tambahan log

      Swal.fire({ title: "Success!", text: "Login Berhasil!", icon: "success" }).then(() => {
        document.getElementById("loginModal")?.classList.add("hidden");

        if (data.user.is_admin) {
          console.log("Redirect ke admin.html"); // Debug info
          window.location.href = "/admin/admin.html";
        } else {
          console.log("Redirect ke account.html"); // Debug info
          window.location.href = "account.html";
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.message || "Login gagal!"
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Gagal melakukan login." });
  }
});

document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value.trim();
  const address = document.getElementById('registerAddress').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address })
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire({ title: "Success!", text: "Registrasi Berhasil! Silakan login.", icon: "success" });
      showLogin();
      document.getElementById("registerModal")?.classList.add("hidden");
    } else {
      Swal.fire({ icon: "error", title: "Gagal Registrasi", text: data.message || "Terjadi kesalahan." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Gagal melakukan registrasi." });
  }
});

// ===================== DOM Ready =====================
document.addEventListener('DOMContentLoaded', () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      fetchAndStoreUserData(user.id);
    } catch {}
  }

  updateCartCount();
  updateWishlistCount();

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const product = {
        product_id: parseInt(this.dataset.productId),
        product_name: this.dataset.productName,
        price: parseInt(this.dataset.price),
        image: this.dataset.image
      };
      addToCart(product);
    });
  });

  document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const product = {
        product_id: parseInt(this.dataset.productId),
        product_name: this.dataset.productName,
        price: parseInt(this.dataset.price),
        image: this.dataset.image
      };
      addToWishlist(product);
    });
  });
});

// ===================== Misc Event =====================
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.getElementById("loginModal")?.classList.add("hidden");
    document.getElementById("registerModal")?.classList.add("hidden");
  }
});

document.getElementById('registerLink')?.addEventListener('click', function (e) {
  e.preventDefault();
  showRegister();
});

document.getElementById('loginLink')?.addEventListener('click', function (e) {
  e.preventDefault();
  showLogin();
});

// ===================== Navigation =====================
function goToProductDetail(productId) {
  window.location.href = `./product-detail.html?id=${productId}`;
}

function addToCartFromWishlistItem(product) {
  addToCart(product);
}

document.addEventListener('DOMContentLoaded', async () => {
  const stockElements = document.querySelectorAll('.product-stock');

  for (const el of stockElements) {
    const productId = el.dataset.productId;
    try {
      const res = await fetch(`http://localhost:3000/api/products/${productId}`);
      const product = await res.json();

      if (!res.ok) {
        throw new Error(product.message || 'Gagal ambil stok');
      }

      const stockSpan = el.querySelector('span');

      if (product.stock === 0) {
        stockSpan.textContent = 'Habis';
        stockSpan.style.color = 'red';
      } else if (product.stock <= 5) {
        stockSpan.textContent = product.stock;
        stockSpan.style.color = 'orange';
      } else {
        stockSpan.textContent = product.stock;
        stockSpan.style.color = '#4a7c59;';
      }

    } catch (err) {
      console.error(`Gagal memuat stok produk ID ${productId}:`, err);
    }
  }
});

// ===================== Checkout Multi-step =====================
const shippingCosts = {
  standard: 20000,
  express: 40000,
  pickup: 0
};

let currentStep = 1;
const totalSteps = 3;

// Helper format Rupiah
function formatRupiah(value) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

// Render produk checkout di step 1 (#checkoutItems)
async function renderCheckoutItems() {
  const container = document.getElementById('checkoutItems');
  if (!container) {
    console.warn('Element with ID "checkoutItems" not found.');
    return;
  }

  container.innerHTML = '<h3>Produk Anda:</h3>';

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    container.innerHTML += '<p>Silakan login terlebih dahulu.</p>';
    return;
  }

  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal memuat keranjang');

    const cart = await res.json();
    if (cart.length === 0) {
      container.innerHTML += '<p>Keranjang Anda kosong.</p>';
      return;
    }

    const listEl = document.createElement('ul');
    listEl.style.listStyle = 'none';
    listEl.style.padding = 0;

    cart.forEach(item => {
      const li = document.createElement('li');
      li.style.marginBottom = '10px';
      li.style.borderBottom = '1px solid #ddd';
      li.style.paddingBottom = '10px';
      li.innerHTML = `
        <strong>${item.product_name}</strong><br>
        Harga: Rp${item.price.toLocaleString()} x ${item.quantity} = 
        <em>Rp${(item.price * item.quantity).toLocaleString()}</em>
      `;
      listEl.appendChild(li);
    });

    container.appendChild(listEl);
  } catch (error) {
    console.error(error);
    container.innerHTML += '<p>Gagal memuat produk keranjang.</p>';
  }
}

// Render daftar produk di Step 3
async function renderProductSummary() {
  const container = document.getElementById('productSummaryList');
  container.innerHTML = '';

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    container.innerHTML = '<p>Silakan login terlebih dahulu.</p>';
    return;
  }
  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal memuat keranjang');
    const cart = await res.json();

    if (cart.length === 0) {
      container.innerHTML = '<p>Keranjang Anda kosong.</p>';
      return;
    }

    const listEl = document.createElement('ul');
    listEl.style.listStyle = 'none';
    listEl.style.padding = 0;

    cart.forEach(item => {
      const li = document.createElement('li');
      li.style.marginBottom = '10px';
      li.style.borderBottom = '1px solid #ddd';
      li.style.paddingBottom = '10px';

      li.innerHTML = `
        <strong>${item.product_name}</strong> 
        <br>Harga: ${formatRupiah(item.price)} x ${item.quantity} = <em>${formatRupiah(item.price * item.quantity)}</em>
      `;
      listEl.appendChild(li);
    });

    container.appendChild(listEl);

  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Gagal memuat produk ringkasan.</p>';
  }
}

// Render ringkasan harga pada step 3
async function renderSummary() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    document.getElementById('checkoutSubtotal').textContent = formatRupiah(0);
    document.getElementById('checkoutShipping').textContent = formatRupiah(0);
    document.getElementById('checkoutTax').textContent = formatRupiah(0);
    document.getElementById('checkoutTotal').textContent = formatRupiah(0);
    document.getElementById('productSummaryList').innerHTML = ''; // Clear product list
    return;
  }
  const user = JSON.parse(userStr);

  try {
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal fetch cart');
    const cart = await res.json();
    if (cart.length === 0) {
      Swal.fire('Error', 'Keranjang Anda kosong.', 'warning');
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

    // Render gambar produk ringkasan
    const productSummaryList = document.getElementById('productSummaryList');
    productSummaryList.innerHTML = ''; // Clear first

    cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'product-summary-item';

      itemEl.innerHTML = `
        <img src="${item.image_url || 'default-product.png'}" alt="${item.product_name}" class="product-summary-image" />
      `;

      productSummaryList.appendChild(itemEl);
    });

  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'Gagal memuat ringkasan harga.', 'error');
  }
}

// Tampilkan step sesuai currentStep
function showStep(step) {
  // Update konten step
  document.querySelectorAll('.step-content').forEach(section => {
    section.classList.toggle('active', Number(section.dataset.step) === step);
  });

  // Update tombol navigasi
  const prevBtn = document.querySelector('.btn-prev');
  if (prevBtn) prevBtn.disabled = step === 1;

  const nextBtn = document.querySelector('.btn-next');
  if (nextBtn) nextBtn.textContent = step === totalSteps ? '🎉 Place Order' : 'Selanjutnya →';

  // Update stepper indicator
  document.querySelectorAll('.stepper .step').forEach(indicator => {
    const stepNum = Number(indicator.dataset.step);
    indicator.classList.toggle('active', stepNum === step);
    indicator.classList.toggle('completed', stepNum < step);
  });

  // Render produk di step 1 jika elemennya ada
  if (step === 1) {
    renderCheckoutItems();
  }

  if (step === totalSteps) {
    renderSummary();
    renderProductSummary();
  }

  // Setelah tampilkan step, cek validasi untuk aktifkan tombol Next
  checkValid(step);
}

// Validasi tiap step untuk enable tombol next
function checkValid(step) {
  let valid = false;

  if (step === 1) {
    const name = document.getElementById('shippingName').value.trim();
    const phone = document.getElementById('shippingPhone').value.trim();
    const address = document.getElementById('shippingAddress').value.trim();
    valid = name !== '' && phone !== '' && address !== '';
  } else if (step === 2) {
    const shippingMethod = document.getElementById('shippingMethod').value;
    valid = shippingMethod !== '';
  } else if (step === 3) {
    const paymentMethod = document.getElementById('paymentMethod').value;
    valid = paymentMethod !== '';
  }

  const nextBtn = document.querySelector('.btn-next');
  if (nextBtn) nextBtn.disabled = !valid;
}

// Next step handler
async function nextStep() {
  if (!await validateStep(currentStep)) return;

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    // Submit order di step terakhir
    await placeOrder();
  }
}

// Prev step handler
function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

// Validasi tiap step
async function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('shippingName').value.trim();
    const phone = document.getElementById('shippingPhone').value.trim();
    const address = document.getElementById('shippingAddress').value.trim();
    if (!name || !phone || !address) {
      await Swal.fire('Error', 'Mohon lengkapi informasi pengiriman.', 'warning');
      return false;
    }
  }
  if (step === 2) {
    const shippingMethod = document.getElementById('shippingMethod').value;
    if (!shippingMethod) {
      await Swal.fire('Error', 'Pilih metode pengiriman.', 'warning');
      return false;
    }
  }
  if (step === 3) {
    const paymentMethod = document.getElementById('paymentMethod').value;
    if (!paymentMethod) {
      await Swal.fire('Error', 'Pilih metode pembayaran.', 'warning');
      return false;
    }
  }
  return true;
}

// Fungsi place order yang sama, dipanggil di step terakhir
async function placeOrder() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return Swal.fire('Error', 'Anda harus login untuk melakukan checkout.', 'error');
  }
  const user = JSON.parse(userStr);

  // Ambil data form
  const name = document.getElementById('shippingName').value.trim();
  const phone = document.getElementById('shippingPhone').value.trim();
  const address = document.getElementById('shippingAddress').value.trim();
  const shippingMethod = document.getElementById('shippingMethod').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  // Validasi input
  if (!name || !phone || !address) {
    return Swal.fire('Error', 'Mohon lengkapi informasi pengiriman.', 'warning');
  }
  if (!shippingMethod) {
    return Swal.fire('Error', 'Pilih metode pengiriman.', 'warning');
  }
  if (!paymentMethod) {
    return Swal.fire('Error', 'Pilih metode pembayaran.', 'warning');
  }

  try {
    // Ambil keranjang dari server
    const resCart = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!resCart.ok) throw new Error('Gagal mengambil data keranjang');
    const cart = await resCart.json();

    if (cart.length === 0) {
      return Swal.fire('Error', 'Keranjang Anda kosong.', 'warning');
    }

    // Hitung subtotal
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    // Hitung biaya pengiriman dan pajak
    const shippingCost = shippingCosts[shippingMethod] || 0;
    const tax = subtotal * 0.10;
    const total = subtotal + shippingCost + tax;

    // Buat payload order
    const orderData = {
      user_id: user.id,
      shipping: {
        name,
        phone,
        address,
        method: shippingMethod,
        cost: shippingCost
      },
      payment_method: paymentMethod,
      subtotal,
      tax,
      total,
      items: cart // ← ini menggantikan cartItems
    };

    console.log('ORDER DATA:', orderData);
    const resOrder = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!resOrder.ok) throw new Error('Gagal membuat pesanan');

    // parsing response jadi JSON
    const data = await resOrder.json();

    // ambil order_id dari response
    const orderId = data.order_id;  

    Swal.fire('Sukses', 'Pesanan Anda berhasil dibuat!', 'success').then(() => {
      localStorage.removeItem('cart');
      window.location.href = `/publik/order-sukses.html?order_id=${orderId}`;
    });

  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.message || 'Gagal membuat pesanan.', 'error');
  }
}

// Event listeners input untuk validasi realtime dan enable tombol next
document.querySelectorAll('#shippingName, #shippingPhone, #shippingAddress, #shippingMethod, #paymentMethod').forEach(el => {
  el.addEventListener('input', () => checkValid(currentStep));
});

document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.querySelector('.btn-next');
  const prevBtn = document.querySelector('.btn-prev');
  
  if (nextBtn) nextBtn.addEventListener('click', nextStep);
  if (prevBtn) prevBtn.addEventListener('click', prevStep);
  
  // Hanya jalankan showStep jika di halaman checkout
  if (nextBtn || prevBtn) {
    showStep(currentStep);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    const products = await res.json();
    if (!Array.isArray(products)) throw new Error("Data produk tidak valid");

    // Untuk halaman index.html → 3 produk
    const featuredGrid = document.getElementById('featuredProductGrid');
    if (featuredGrid) {
      const topThree = products.slice(0, 3);
      topThree.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.addEventListener('click', () => goToProductDetail(product.product_id));
        card.innerHTML = `
          <div class="product-img">
            <img src="${product.image_url}" alt="${product.product_name}">
          </div>
          <div class="product-info">
            <h3>${sanitizeHTML(product.product_name)}</h3>
            <div class="product-stock">Stok: <span>${product.stock}</span></div>
            <div class="product-price">Rp ${Number(product.price).toLocaleString()}</div>
          </div>
        `;
        featuredGrid.appendChild(card);
      });
    }

    // Untuk halaman products.html → semua produk
    const fullGrid = document.getElementById('productGrid');
    if (fullGrid) {
      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('onclick', `goToProductDetail(${product.product_id})`);
        card.innerHTML = `
          <div class="product-img">
            <img src="${product.image_url}" alt="${sanitizeHTML(product.product_name)}">
          </div>
          <div class="product-info">
            <h3>${sanitizeHTML(product.product_name)}</h3>
            <div class="product-stock">Stok: <span>${product.stock}</span></div>
            <div class="product-price">Rp ${Number(product.price).toLocaleString()}</div>
            <div class="product-actions">
              <button class="add-to-cart-btn"
                data-product-id="${product.product_id}"
                data-product-name="${encodeURIComponent(product.product_name)}"
                data-price="${product.price}"
                data-image="${encodeURIComponent(product.image_url)}">Add to Cart</button>
              <button class="add-to-wishlist-btn"
                data-product-id="${product.product_id}"
                data-product-name="${encodeURIComponent(product.product_name)}"
                data-price="${product.price}"
                data-image="${encodeURIComponent(product.image_url)}">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        `;
        fullGrid.appendChild(card);
      });

      bindProductButtonListeners();
    }

  } catch (err) {
    console.error('Gagal memuat produk:', err);
    const fallbackGrid = document.getElementById('featuredProductGrid') || document.getElementById('productGrid');
    if (fallbackGrid) fallbackGrid.innerHTML = '<p>Gagal memuat produk.</p>';
  }
});

function bindProductButtonListeners() {
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const product = {
        product_id: parseInt(this.dataset.productId),
        product_name: decodeURIComponent(this.dataset.productName),
        price: parseInt(this.dataset.price),
        image: decodeURIComponent(this.dataset.image)
      };
      if (typeof addToCart === 'function') addToCart(product);
    });
  });

  document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const product = {
        product_id: parseInt(this.dataset.productId),
        product_name: decodeURIComponent(this.dataset.productName),
        price: parseInt(this.dataset.price),
        image: decodeURIComponent(this.dataset.image)
      };
      if (typeof addToWishlist === 'function') addToWishlist(product);
    });
  });
}

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
