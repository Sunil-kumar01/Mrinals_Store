async function loadProducts() {
  const res = await fetch('products.json');
  const products = await res.json();
  return products;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function formatPrice(price) {
  return `₹${price}`;
}

async function renderList() {
  const products = await loadProducts();
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    const card = el('article', 'product-card');
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <h3>${p.name}</h3>
      <p class="price">${formatPrice(p.price)}</p>
      <p class="desc">${p.short}</p>
      <a class="btn" href="product.html?id=${p.id}">View / Order</a>
    `;
    container.appendChild(card);
  });
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
  const container = document.getElementById('product');
  if (!p) {
    container.innerHTML = '<p>Product not found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="product-main">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <h2>${p.name}</h2>
        <p class="price">${formatPrice(p.price)}</p>
        <p>${p.long}</p>
        <p><strong>Payment:</strong> UPI (${p.upi}) • Cash on Delivery available</p>
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
            payment: { upi: p.upi, cod: true }
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

    const body = `Hello,%0D%0A%0D%0AI'd like to place an order for:${encodeURIComponent('\n')}
Name: ${buyerName}%0D%0APhone: ${phone}%0D%0AProduct: ${p.name}%0D%0AQuantity: ${qty}%0D%0AAddress: ${address}%0D%0ACustom notes: ${notes}%0D%0A%0D%0APayment: UPI ${p.upi} (or Cash on Delivery)%0D%0A%0D%0AThanks!`;
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
  });
}

// Decide which page to render
if (window.location.pathname.endsWith('product.html')) {
  renderProduct();
} else {
  renderList();
}
