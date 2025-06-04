async function loadProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  const tbody = document.querySelector('#productTable tbody');
  tbody.innerHTML = '';

  products.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.product_name}</td>
      <td>Rp ${p.price.toLocaleString()}</td>
      <td>${p.stock}</td>
      <td><button onclick="deleteProduct(${p.id})">Hapus</button></td>
    `;
    tbody.appendChild(row);
  });
}

document.getElementById('addProductForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const price = +document.getElementById('newPrice').value;
  const stock = +document.getElementById('newStock').value;
  const image = document.getElementById('newImage').value.trim();

  await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_name: name, price, stock, image_url: image })
  });

  loadProducts();
  this.reset();
});

async function deleteProduct(id) {
  if (!confirm('Yakin ingin menghapus produk ini?')) return;
  await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
  loadProducts();
}

function logoutAdmin() {
  localStorage.removeItem('admin');
  location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', loadProducts);
