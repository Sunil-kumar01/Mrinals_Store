async function loadProducts() {
  const savedProducts = localStorage.getItem('mrinalProducts');
  if (savedProducts) return JSON.parse(savedProducts);
  const res = await fetch('products.json');
  const products = await res.json();
  return products;
}

const defaultSettings = { name: "Mrinal's", brand: 'Creations', upi: '14bbt1019@okicici', contact: '14bbt1019@gmail.com', cod: true };
function loadSettings() { const saved = localStorage.getItem('mrinalSettings'); return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings; }
function applySettings() { const settings = loadSettings(); document.querySelectorAll('[data-store-name]').forEach(node => node.textContent = settings.name); document.querySelectorAll('[data-store-brand]').forEach(node => node.textContent = settings.brand); document.querySelectorAll('[data-upi]').forEach(node => node.textContent = settings.upi); document.querySelectorAll('[data-cod]').forEach(node => node.textContent = settings.cod ? 'Cash on Delivery available' : 'Online payment available'); document.querySelectorAll('[data-contact]').forEach(node => node.textContent = settings.contact); document.querySelectorAll('[data-contact-link]').forEach(node => node.href = `mailto:${settings.contact}`); }

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function formatPrice(price) {
  return `₹${price}`;
}

function categoryFor(product) {
  const name = product.name.toLowerCase();
  if (name.includes('t-shirt')) return 'shirt';
  if (name.includes('handkerchief')) return 'handkerchief';
  if (name.includes('custom')) return 'custom';
  return 'hoop';
}

function imageFallback(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%23f9d5e3"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2354263d" font-family="Georgia" font-size="28"%3EMrinal%27s Creations%3C/text%3E%3C/svg%3E';
  event.target.onerror = null;
}

async function renderList() {
  const products = await loadProducts();
  const container = document.getElementById('products');
  const search = document.getElementById('searchProducts');
  const category = document.getElementById('categoryProducts');
  const draw = (term = '', selectedCategory = 'all') => {
    container.innerHTML = '';
    const visibleProducts = products.filter(p => selectedCategory === 'all' || categoryFor(p) === selectedCategory).filter(p => `${p.name} ${p.short}`.toLowerCase().includes(term.toLowerCase()));
    visibleProducts.forEach(p => {
    const card = el('article', 'product-card');
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="imageFallback(event)">
      <h3>${p.name}</h3>
      <p class="price">${formatPrice(p.price)}</p>
      <p class="desc">${p.short}</p>
      <a class="btn" href="product.html?id=${p.id}">View / Order</a>
    `;
      container.appendChild(card);
    });
    if (!visibleProducts.length) container.innerHTML = '<p class="empty-state">No creations match your search.</p>';
  };
  draw();
  search?.addEventListener('input', event => draw(event.target.value, category.value));
  category?.addEventListener('change', event => draw(search.value, event.target.value));
  window.addEventListener('storage', event => { if (event.key === 'mrinalProducts' || event.key === 'mrinalSettings') window.location.reload(); });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function openMailto(to, subject, body) {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function copyToClipboard(text) {
  return navigator.clipboard ? navigator.clipboard.writeText(text) : (function(){
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  })();
}

async function renderProduct() {
  const id = getQueryParam('id');
  const products = await loadProducts();
  const p = products.find(x => String(x.id) === String(id));
  applySettings();
  const container = document.getElementById('product');
  if (!p) {
    container.innerHTML = '<p>Product not found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="product-main">
      <img src="${p.image}" alt="${p.name}" onerror="imageFallback(event)">
      <div class="product-info">
        <h2>${p.name}</h2>
        <p class="price">${formatPrice(p.price)}</p>
        <p>${p.long}</p>
        <p><strong>Payment:</strong> UPI (<span data-upi>${p.upi}</span>) • <span data-cod>Cash on Delivery available</span></p>
        <button id="orderBtn" class="btn primary">Order / Customise</button>
        <button id="copyLink" class="btn">Copy link</button>
      </div>
    </div>
    <div id="orderFormWrap" class="order-form-wrap hidden">
      <h3>Order: ${p.name}</h3>
      <form id="orderForm">
        <label>Name<br><input name="buyerName" required></label>
        <label>Phone<br><input name="phone" required></label>
        <label>Quantity<br><input name="qty" type="number" value="1" min="1" required></label>
        <label>Address (for delivery)<br><textarea name="address"></textarea></label>
        <label>Custom requirement / notes<br><textarea name="notes" placeholder="Colors, sizes, initials, etc."></textarea></label>
        <div class="form-actions">
          <button type="submit" class="btn primary">Send Order (open email)</button>
          <button type="button" id="cancelOrder" class="btn">Cancel</button>
        </div>
      </form>
    </div>
  `;
  applySettings();

  document.getElementById('orderBtn').addEventListener('click', () => {
    document.getElementById('orderFormWrap').classList.remove('hidden');
  });
  document.getElementById('copyLink').addEventListener('click', async () => {
    await copyToClipboard(window.location.href);
    alert('Product link copied to clipboard');
  });

  document.getElementById('cancelOrder').addEventListener('click', () => {
    document.getElementById('orderFormWrap').classList.add('hidden');
  });

  document.getElementById('orderForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const buyerName = fd.get('buyerName');
    const phone = fd.get('phone');
    const qty = fd.get('qty');
    const address = fd.get('address') || 'N/A';
    const notes = fd.get('notes') || 'N/A';

    const to = '14bbt1019@gmail.com';
    const subject = `Order: ${p.name} (x${qty})`;

    // First try serverless endpoint if configured
    try {
      const cfgRes = await fetch('config.json');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.orderEndpoint && cfg.orderEndpoint.trim() !== '') {
          // POST order as JSON
          const payload = {
            productId: p.id,
            productName: p.name,
            qty,
            price: p.price,
            buyerName,
            phone,
            address,
            notes,
            payment: { upi: loadSettings().upi, cod: loadSettings().cod }
          };
          const postRes = await fetch(cfg.orderEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (postRes.ok) {
            alert('Order submitted successfully. We will contact you soon.');
            // optionally clear/hide form
            document.getElementById('orderFormWrap').classList.add('hidden');
            return;
          } else {
            console.warn('Order endpoint returned non-OK', postRes.status);
            // fall back to mailto
          }
        }
      }
    } catch (e) {
      console.warn('Error calling order endpoint, falling back to email', e);
    }

    // Fallbacks: try Netlify form (if present) else open buyer email with prefilled order
    const netForm = document.getElementById('netlifyOrderForm');
    if (netForm) {
      // populate hidden inputs then submit the hidden form so Netlify picks it up
      netForm.querySelector('input[name="productId"]').value = p.id;
      netForm.querySelector('input[name="productName"]').value = p.name;
      netForm.querySelector('input[name="price"]').value = p.price;
      netForm.querySelector('input[name="upi"]').value = p.upi;
      netForm.querySelector('input[name="buyerName"]').value = buyerName;
      netForm.querySelector('input[name="phone"]').value = phone;
      netForm.querySelector('input[name="qty"]').value = qty;
      netForm.querySelector('input[name="address"]').value = address;
      netForm.querySelector('input[name="notes"]').value = notes;
      netForm.submit();
      alert('Order submitted via site forms. Thank you!');
      document.getElementById('orderFormWrap').classList.add('hidden');
      return;
    }

    const currentSettings = loadSettings();
    const paymentText = currentSettings.cod ? `UPI ${currentSettings.upi} (or Cash on Delivery)` : `UPI ${currentSettings.upi}`;
    const body = `Hello,%0D%0A%0D%0AI'd like to place an order for:${encodeURIComponent('\n')}
  Name: ${buyerName}%0D%0APhone: ${phone}%0D%0AProduct: ${p.name}%0D%0AQuantity: ${qty}%0D%0AAddress: ${address}%0D%0ACustom notes: ${notes}%0D%0A%0D%0APayment: ${paymentText}%0D%0A%0D%0AThanks!`;
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
  });
}

// Decide which page to render
applySettings();
if (window.location.pathname.endsWith('product.html')) {
  renderProduct();
} else {
  renderList();
}
