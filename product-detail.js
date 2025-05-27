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
      el.className = 'popup-item flex items-center gap-3 mb-3';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" class="w-12 h-12 object-cover rounded" />
        <div>
          <span class="block font-semibold">${item.product_name}</span>
          <small class="text-gray-600">Rp ${Number(item.price).toLocaleString()}</small>
        </div>
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
      el.className = 'popup-item flex items-center gap-3 mb-3';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.product_name}" class="w-12 h-12 object-cover rounded" />
        <div>
          <span class="block font-semibold">${item.product_name}</span>
          <small class="text-gray-600">Rp ${Number(item.price).toLocaleString()}</small>
        </div>
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

  if (!email || !password) {
    return Swal.fire({ icon: 'warning', title: 'Input kosong', text: 'Email dan password harus diisi.' });
  }

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

  if (!name || !email || !password || !phone || !address) {
    return Swal.fire({ icon: 'warning', title: 'Input kosong', text: 'Semua field harus diisi.' });
  }

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

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    await Swal.fire({
      icon: "error",
      title: "Produk tidak ditemukan",
      text: "Silakan kembali ke halaman produk.",
    });
    return (window.location.href = "products.html");
  }

  try {
    const res = await fetch(`http://localhost:3000/api/products/${productId}`);
    if (!res.ok) throw new Error("Produk tidak ditemukan");

    const product = await res.json();
    console.log("Product data:", product);

    // Ambil nama produk dari beberapa kemungkinan properti
    const productName = product.product_name || product.name || product.nama || "Nama Produk";

    // Ambil harga dan pastikan formatnya benar
    let productPrice = product.price;
    if (typeof productPrice === "string") {
      productPrice = parseFloat(productPrice.replace(/[^0-9.-]+/g, ""));
    }
    if (isNaN(productPrice)) productPrice = 0;

    // Tampilkan detail produk di DOM
    document.getElementById("product-image").src = product.image_url || "placeholder.jpg";
    document.getElementById("product-name").textContent = productName;
    document.getElementById("product-price").textContent = `Rp ${productPrice.toLocaleString("id-ID")}`;
    document.getElementById("product-description").textContent = product.description || "Tidak ada deskripsi.";

    // Tambah ke Keranjang
    document.getElementById("addToCartBtn")?.addEventListener("click", async () => {
      const user = safelyParseUser();
      if (!user) return;

      const cartItem = {
        user_id: user.id,
        product_id: product.product_id || product.id,
        product_name: productName,
        price: productPrice,
        image_url: product.image_url,
        quantity: 1,
      };

      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
      const alreadyInCart = existingCart.some(item => item.product_id === cartItem.product_id);

      if (alreadyInCart) {
        return Swal.fire({
          icon: "info",
          title: "Sudah Ada",
          text: `"${cartItem.product_name}" sudah ada di keranjang Anda.`,
        });
      }

      try {
        const res = await fetch(`http://localhost:3000/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartItem),
        });

        if (!res.ok) throw new Error("Gagal tambah ke keranjang");

        const updatedCart = await res.json();
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        updateCartCount();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Produk ditambahkan ke keranjang!",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: "Gagal menambahkan ke keranjang." });
      }
    });

    // Tambah ke Wishlist
    document.getElementById("addToWishlistBtn")?.addEventListener("click", async () => {
      const user = safelyParseUser();
      if (!user) return;

      let price = productPrice;
      if (typeof price === "string") {
        price = parseFloat(price.replace(/[^0-9.-]+/g, ""));
      }
      if (isNaN(price)) {
        return Swal.fire({ icon: "error", title: "Error", text: "Harga produk tidak valid." });
      }

      const wishlistItem = {
        user_id: user.id,
        product_id: product.product_id || product.id,
        product_name: productName,
        price,
        image_url: product.image_url,
      };

      const existingWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const alreadyInWishlist = existingWishlist.some(item => item.product_id === wishlistItem.product_id);

      if (alreadyInWishlist) {
        return Swal.fire({
          icon: "info",
          title: "Sudah Ada",
          text: `"${wishlistItem.product_name}" sudah ada di wishlist Anda.`,
        });
      }

      try {
        const res = await fetch(`http://localhost:3000/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wishlistItem),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          if (errorData?.message === "Produk sudah ada di wishlist.") {
            return Swal.fire({
              icon: "info",
              title: "Sudah Ada",
              text: `"${wishlistItem.product_name}" sudah ada di wishlist Anda.`,
            });
          }
          throw new Error(errorData?.message || "Gagal tambah ke wishlist");
        }

        const updatedWishlist = await res.json();
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        updateWishlistCount();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Produk ditambahkan ke wishlist!",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Gagal menambahkan ke wishlist.",
        });
      }
    });

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
    window.location.href = "products.html";
  }

  // ========== FUNGSI UTILITAS ==========

  function safelyParseUser() {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        Swal.fire({ icon: "warning", title: "Login Diperlukan", text: "Silakan login terlebih dahulu." });
        return null;
      }
      return user;
    } catch (err) {
      console.error("User parse error:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Data login rusak. Silakan login ulang." });
      localStorage.removeItem("user");
      return null;
    }
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = cart.length;
  }

  function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const wishlistCount = document.querySelector(".wishlist-count");
    if (wishlistCount) wishlistCount.textContent = wishlist.length;
  }

  updateCartCount();
  updateWishlistCount();
});
