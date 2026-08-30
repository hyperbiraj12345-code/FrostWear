# FrostWear

A static multi-page winter clothing storefront built with HTML, CSS and JavaScript — no frameworks, no build step.

## Pages

- **Home** – landing page with hero slider, categories, featured & new arrivals
- **Men / Women / Sale / New Arrivals** – searchable product catalogs
- **About Us** – brand story, values and stats
- **Contact** – store info and a contact form

## Features

- Site-wide product search with a "no products match" banner
- Categories dropdown navigation
- Shopping cart drawer: quantity +/−, remove specific quantity (1, 2, 3…All), Clear Cart
- Wishlist with "Move All to Cart"
- Cart & wishlist saved in `localStorage`
- Responsive on desktop, tablet and mobile

## Project Structure

```
FrostWear/
├── Pages/            one folder per page (HTML, JS, CSS, product JSON)
├── common CSS/       shared nav & footer styles
├── common JS/        categories dropdown
└── asset/products/   product images (product-{id}.jpg)
```

## Getting Started

Open `Pages/Home/index.html` in a browser. No installation or build required.

## Product Data

Products are stored in a JSON file per page and look like:

```json
{
  "id": 1,
  "name": "Arctic Down Jacket",
  "price": 129.99,
  "category": "Men",
  "image": "product-1.jpg"
}
```

Images go in `asset/products/` as `product-{id}.jpg`.

## Customization

Add a product by dropping an image into `asset/products/` and adding an entry to the page's JSON file. Colors can be changed in `common CSS/style.css` and the per-page stylesheets.
