# Mrinal's Creations: Project Handoff

This document records what was done from the initial project discovery through GitHub deployment.

## 1. Starting Point

The original VS Code workspace was the Flask document-search bot:

- `/Users/sunilkumar/Document_search_poc`

The handmade store website was found in a separate Git worktree under a `site/` folder. The site README identified it as **Mrinal's Store**, with products, product detail pages, ordering by email, UPI, and Cash on Delivery.

The store was separated into its own project folder:

- `/Users/sunilkumar/Mrinals_Store`

This kept the store project independent from the document-search bot.

## 2. Files in the Store Project

```text
Mrinals_Store/
|-- index.html                 Storefront homepage and product listing
|-- product.html               Product detail page and order form
|-- admin.html                 Admin login and product dashboard
|-- products.json              Initial catalog of 10 products
|-- config.json                Optional order endpoint configuration
|-- README.txt                 Basic project instructions
|-- PROJECT_HANDOFF.md         This complete project history
|-- css/
|   `-- styles.css             Pink theme, layout, responsive styles
|-- js/
|   |-- app.js                 Storefront rendering, search, filtering, orders
|   `-- admin.js               Admin login, product editing, uploads, export
|-- .gitignore                 Ignores macOS .DS_Store files
|-- .nojekyll                  Prevents GitHub Pages Jekyll processing
`-- .github/workflows/pages.yml GitHub Pages deployment workflow
```

## 3. Storefront Features Added

The original static site was improved with:

- Mrinal's Creations branding
- Pink and blush visual theme
- Responsive desktop and mobile layout
- Handmade-focused hero section
- Product collection section
- Search by product name and description
- Category filtering for hoops, shirts, handkerchiefs, and custom requests
- Product detail pages
- Order/customisation form
- Email order fallback using `mailto:`
- UPI and Cash on Delivery information
- Branded fallback artwork when an image URL fails
- Empty search-result message
- Relative paths so the standalone folder works correctly

## 4. Admin Features

The admin page is available at `admin.html` and includes:

- Demo login
- Product listing
- Add new products
- Edit existing products
- Delete products
- Change product name, price, short description, and full description
- Set an image URL
- Upload an image from the computer
- Export the current catalog as `products.json`
- Log out

Demo login used for local testing:

- Email: `admin@mrinalscreations.com`
- Password: `mrinal123`

### Important Admin Limitation

This is a static website. Admin changes are saved in the browser's `localStorage`, so they are visible only in that same browser and device. They do not automatically update the GitHub repository or other users' browsers.

For a real production admin system, the next version should use:

- Backend authentication
- A database for products and orders
- Permanent image storage
- Server-side authorization
- Secure password handling

The demo password should be changed before using the site for real customers.

## 5. Local Testing

A local Python server was used because browser security rules can block data loading when HTML files are opened directly.

From the project folder:

```bash
cd ~/Mrinals_Store
python3 -m http.server 8001
```

The complete preview was served from the parent directory on port `8002` because the original asset paths expected a `/site/` prefix during early testing:

```text
http://localhost:8002/Mrinals_Store/index.html
http://localhost:8002/Mrinals_Store/admin.html
```

The final standalone project uses relative asset paths, so it can also be served directly from `Mrinals_Store`.

## 6. Git History

The standalone repository was initialized with its own `main` branch.

| Commit | Purpose |
|---|---|
| `76bdb1a` | Added the initial Mrinal store website |
| `7a2dc1e` | Fixed standalone CSS, JavaScript, product, and config paths |
| `a329298` | Added pink branding and the admin dashboard |
| `3212128` | Added filters, image fallbacks, GitHub Pages workflow, and repository cleanup |

The local branch tracks the GitHub `main` branch.

## 7. SSH Access Setup

GitHub push initially failed because SSH authentication returned `Permission denied (publickey)`.

The following facts were verified:

- An existing public/private RSA key pair was present at `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`.
- The private key contents were not shared or stored in this document.
- The public key was loaded into the macOS SSH agent with:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_rsa
```

- The public key was added to GitHub under **Settings -> SSH and GPG keys**.
- SSH authentication was then confirmed for the GitHub account `Sunil-kumar01`.

## 8. GitHub Repository

A separate public GitHub repository was created:

- https://github.com/Sunil-kumar01/Mrinals_Store

The local remote is:

```text
git@github.com:Sunil-kumar01/Mrinals_Store.git
```

The project was pushed with:

```bash
cd ~/Mrinals_Store
git push -u origin main
```

## 9. Deployment

GitHub Pages was configured to use GitHub Actions. The workflow file is:

```text
.github/workflows/pages.yml
```

The workflow uploads the repository as a Pages artifact and deploys it automatically whenever changes are pushed to `main`.

Public website:

- https://sunil-kumar01.github.io/Mrinals_Store/

Public admin page for testing:

- https://sunil-kumar01.github.io/Mrinals_Store/admin.html

The storefront is suitable for mobile viewing. The public admin page is only a demo because its login and local-storage behavior are not secure enough for production administration.

## 10. How to Continue Work

Open the standalone project in VS Code:

1. Select **File -> Open Folder...**
2. Choose `/Users/sunilkumar/Mrinals_Store`
3. Or use **File -> Add Folder to Workspace...** if both projects should appear in Explorer.

After making changes:

```bash
cd ~/Mrinals_Store
git status
git add -A
git commit -m "Describe the change"
git push
```

A push to `main` will trigger the GitHub Pages deployment workflow.

## 11. Recommended Future Improvements

- Replace placeholder product image URLs with real product photos
- Add a real backend admin login
- Store products and images in a database or cloud storage
- Add online payment links or checkout
- Store orders in a database or Google Sheet
- Add shipping fees and delivery regions
- Add stock availability
- Add a contact or WhatsApp order button
- Add analytics and SEO metadata
- Add automated browser tests for mobile and desktop layouts
