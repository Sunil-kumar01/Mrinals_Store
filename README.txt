Mrinal's Creations — handmade store

What this is:
- A pink-themed static website that lists products and shows product detail pages.
- Buyers can click Order / Customise on a product; an order form will open and, on submit, open the buyer's email client (mailto:) prefilled with the order details. This keeps the site backend-free.
- UPI ID (14bbt1019@okicici) and Cash on Delivery are displayed per product.

Files:
- /site/index.html — product listing
- /site/product.html — product detail + order form
- /site/js/app.js — JavaScript to render the site
- /site/css/styles.css — basic styles
- /site/products.json — sample 10 products (all priced at ₹999)

How to use locally:
- Open index.html in a browser (double-click or use a local static server).
- Open admin.html for the product dashboard. Demo login: admin@mrinalscreations.com / mrinal123.
- To host publicly, upload this folder to GitHub Pages, Netlify, Vercel, or any static host.

Admin note:
- Product edits and uploaded images are stored in this browser's localStorage.
- Store name, brand subtitle, admin email/password, UPI, contact email, and payment method are editable in the dashboard.
- Open storefront tabs on the same browser update when dashboard changes are saved.
- For permanent database and image storage, run the Flask backend with `python server.py`. It creates `mrinals.db` and stores uploads in `uploads/`.
- GitHub Pages serves the static fallback only; deploy `server.py` to a Python host such as Render or Railway for shared admin changes.
- Render deployment is configured in `render.yaml`; it uses a persistent disk for SQLite and uploaded images.
- Use Export JSON in the admin dashboard, then replace products.json before deploying updates.
- The demo login is for local editing only. Use backend authentication before publishing private admin access.

Next steps / improvements (optional):
- Integrate Payment Links (Stripe/PayPal) so buyers can pay online.
- Add a form backend (Formspree, Netlify Forms) or a small server to record orders automatically into a Google Sheet or database.
- Replace placeholder images with real product photos (edit /site/products.json).
- Add shipping fees, countries supported, and an admin order dashboard.

If you'd like, the next tasks can be:
1) Replace placeholders with your product images and descriptions (you can provide them here).
2) Add Formspree integration to save orders automatically.
3) Create Payment Links integration.

Tell me which of these next steps to take or provide product images/descriptions and I'll continue.
