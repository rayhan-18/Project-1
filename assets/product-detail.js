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
    const tax = subtotal * 0.12;
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
    console.log("Response product object:", product);
    console.log("Keys available in product:", Object.keys(product));
    console.log("Stock value raw:", product.stock);

    // Ambil nama produk dari beberapa kemungkinan properti
    const productName = product.product_name || product.name || product.nama || "Nama Produk";

    // Ambil harga dan pastikan formatnya benar
    let productPrice = product.price;
    if (typeof productPrice === "string") {
      productPrice = parseFloat(productPrice.replace(/[^0-9.-]+/g, ""));
    }
    if (isNaN(productPrice)) productPrice = 0;

    // Ambil stok dan pastikan tipe number
    let stock = product.stock;
    if (typeof stock === "string") {
      stock = parseInt(stock, 10);
    }
    if (isNaN(stock)) stock = null;

    // Tampilkan detail produk di DOM
    document.getElementById("product-image").src = product.image_url || "placeholder.jpg";
    document.getElementById("product-name").textContent = productName;
    document.getElementById("product-description").textContent = product.description || "Deskripsi produk tidak tersedia.";
    document.getElementById("product-price").textContent = `Rp ${productPrice.toLocaleString("id-ID")}`;

    // Update stock display
    const stockElement = document.getElementById("product-stock");
    if (stockElement) {
      if (stock === null) {
        stockElement.textContent = "Stok: -";
        stockElement.classList.remove("low");
      } else if (stock > 5) {
        stockElement.textContent = `Stok: ${stock} tersedia`;
        stockElement.classList.remove("low");
      } else if (stock > 0) {
        stockElement.textContent = `Stok: ${stock} (hampir habis!)`;
        stockElement.classList.add("low");
      } else {
        stockElement.textContent = "Stok habis";
        stockElement.classList.add("low");
      }
    }

    document.getElementById("product-price").textContent = `Rp ${productPrice.toLocaleString("id-ID")}`;

    // Event Listener Tambah ke Keranjang dengan cek stok dulu
    document.getElementById("addToCartBtn")?.addEventListener("click", async () => {
      if (stock === 0) {
        return Swal.fire({
          icon: "error",
          title: "Stok Habis",
          text: "Maaf, produk ini sedang habis stok.",
        });
      }
      if (stock === null) {
        return Swal.fire({
          icon: "warning",
          title: "Stok Tidak Diketahui",
          text: "Tidak dapat menambahkan produk karena informasi stok tidak tersedia.",
        });
      }

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

    // Event Listener Tambah ke Wishlist
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
