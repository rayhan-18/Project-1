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
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) cartCountElement.textContent = cart.length;
}

function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const wishlistCountElement = document.querySelector('.wishlist-count');
  if (wishlistCountElement) wishlistCountElement.textContent = wishlist.length;
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
  if (!userStr) return Swal.fire({ icon: "warning", title: "Login Diperlukan", text: "Silakan login terlebih dahulu." });

  const user = JSON.parse(userStr);
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const exists = cart.find(p => p.product_id === product.product_id);

  if (exists) {
    return Swal.fire({ icon: "info", title: "Sudah Ada", text: `\"${product.product_name}\" sudah di keranjang.` });
  }

  product.quantity = 1;
  if (product.image) {
    product.image_url = product.image;
    delete product.image;
  }
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...product, user_id: user.id })
  }).catch(console.error);

  Swal.fire({ icon: "success", title: "Ditambahkan ke Keranjang!", text: `\"${product.product_name}\" telah ditambahkan.` });
  }

function addToWishlist(product) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return Swal.fire({ icon: "warning", title: "Login Diperlukan", text: "Silakan login terlebih dahulu." });

  const user = JSON.parse(userStr);
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const exists = wishlist.find(p => p.product_id === product.product_id);

  if (exists) {
    return Swal.fire({ icon: "info", title: "Sudah Ada", text: `\"${product.product_name}\" sudah di wishlist.` });
  }

  if (product.image) {
    product.image_url = product.image;
    delete product.image;
  }
  wishlist.push(product);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();

  fetch('http://localhost:3000/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...product, user_id: user.id })
  }).catch(console.error);

  Swal.fire({ icon: "success", title: "Ditambahkan ke Wishlist!", text: `\"${product.product_name}\" telah ditambahkan.` });
}

// ===================== Pop-up Handling =====================
async function openCartModal() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return Swal.fire({ icon: 'warning', title: 'Login Diperlukan', text: 'Silakan login dulu.' });

  try {
    const user = JSON.parse(userStr);
    const res = await fetch(`http://localhost:3000/api/cart/${user.id}`);
    if (!res.ok) throw new Error('Gagal fetch cart');

    const cart = await res.json();
    const container = document.getElementById('cartItems');
    container.innerHTML = cart.length === 0 ? '<p class="text-gray-500">Keranjang kosong.</p>' : '';

    cart.forEach(item => {
      const el = document.createElement('div');
      el.className = 'popup-item';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" />
        <span>${item.product_name}</span>
        <small>Rp ${Number(item.price).toLocaleString()}</small>
      `;
      container.appendChild(el);
    });

    document.getElementById('wishlistPopup')?.classList.add('hidden');
    document.getElementById('cartPopup')?.classList.toggle('hidden');
  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal membuka keranjang.' });
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
      const el = document.createElement('div');
      el.className = 'popup-item';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" />
        <span>${item.product_name}</span>
        <small>Rp ${Number(item.price).toLocaleString()}</small>
      `;
      container.appendChild(el);
    });

    document.getElementById('cartPopup')?.classList.add('hidden');
    document.getElementById('wishlistPopup')?.classList.toggle('hidden');
  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal membuka wishlist.' });
  }
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
