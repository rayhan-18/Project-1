  // ===================== Modal Handling =====================
function toggleModal(modalId = 'loginModal') {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    window.location.href = "account.html";
  } else {
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
      Swal.fire({ title: "Success!", text: "Login Berhasil!", icon: "success" });
      document.getElementById("loginModal")?.classList.add("hidden");
    } else {
      Swal.fire({ icon: "error", title: "Oops...", text: data.message || "Login gagal!" });
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
