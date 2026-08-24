// ===== HERO CAROUSEL =====
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
const leftArrow = document.querySelector('.hero-arrow-left');
const rightArrow = document.querySelector('.hero-arrow-right');
let current = 0;
let autoPlay;

function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
}

function nextSlide() { showSlide(current + 1); }
function prevSlide() { showSlide(current - 1); }

function startAutoPlay() { autoPlay = setInterval(nextSlide, 3000); }
function resetAutoPlay() { clearInterval(autoPlay); startAutoPlay(); }

rightArrow.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
leftArrow.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        showSlide(parseInt(dot.dataset.index));
        resetAutoPlay();
    });
});

startAutoPlay();

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('fw_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('fw_wishlist')) || [];
let allProducts = [];

const heartSVG = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

// ===== TOAST =====
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== CART =====
const cartCountEl = document.getElementById('cartCount');
const cartNav = document.getElementById('cartNav');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartBody = document.getElementById('cartBody');
const cartFooter = document.getElementById('cartFooter');
const cartTotalEl = document.getElementById('cartTotal');

function saveCart() {
    localStorage.setItem('fw_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast(product.name + ' added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCart();
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        cartBody.innerHTML = '<p class="drawer-empty">Your cart is empty</p>';
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    cartBody.innerHTML = cart.map(item => `
        <div class="drawer-item">
            <div class="drawer-item-img" style="background-image: url('${item.image}');"></div>
            <div class="drawer-item-info">
                <h4>${item.name}</h4>
                <span class="drawer-item-price">$${(item.price * item.qty).toFixed(2)}</span>
                <div class="drawer-item-actions">
                    <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
                    <button class="drawer-item-remove" data-id="${item.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = '$' + total.toFixed(2);

    cartBody.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            changeQty(parseInt(btn.dataset.id), btn.dataset.action === 'plus' ? 1 : -1);
        });
    });

    cartBody.querySelectorAll('.drawer-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.id));
        });
    });
}

function openCart() {
    renderCart();
    cartDrawer.classList.add('show');
    cartOverlay.classList.add('show');
}

function closeCart() {
    cartDrawer.classList.remove('show');
    cartOverlay.classList.remove('show');
}

cartNav.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== WISHLIST =====
const wishlistCountEl = document.getElementById('wishlistCount');
const wishlistNav = document.getElementById('wishlistNav');
const wishlistDrawer = document.getElementById('wishlistDrawer');
const wishlistOverlay = document.getElementById('wishlistOverlay');
const wishlistClose = document.getElementById('wishlistClose');
const wishlistBody = document.getElementById('wishlistBody');
const wishlistFooter = document.getElementById('wishlistFooter');
const moveAllToCartBtn = document.getElementById('moveAllToCart');

function saveWishlist() {
    localStorage.setItem('fw_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    updateWishlistButtons();
}

function updateWishlistBadge() {
    wishlistCountEl.textContent = wishlist.length;
    wishlistCountEl.style.display = wishlist.length > 0 ? 'flex' : 'none';
}

function toggleWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        wishlist.push({ id: product.id, name: product.name, price: product.price, image: product.image });
        showToast(product.name + ' added to wishlist!');
    }
    saveWishlist();
    renderWishlist();
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist();
    renderWishlist();
}

function moveAllToCart() {
    wishlist.forEach(item => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
        }
    });
    wishlist = [];
    saveCart();
    saveWishlist();
    renderCart();
    renderWishlist();
    showToast('All items moved to cart!');
}

function renderWishlist() {
    updateWishlistButtons();

    if (wishlist.length === 0) {
        wishlistBody.innerHTML = '<p class="drawer-empty">Your wishlist is empty</p>';
        wishlistFooter.style.display = 'none';
        return;
    }

    wishlistFooter.style.display = 'block';
    wishlistBody.innerHTML = wishlist.map(item => `
        <div class="drawer-item">
            <div class="drawer-item-img" style="background-image: url('${item.image}');"></div>
            <div class="drawer-item-info">
                <h4>${item.name}</h4>
                <span class="drawer-item-price">$${item.price.toFixed(2)}</span>
                <div class="drawer-item-actions">
                    <button class="wishlist-move-btn" data-id="${item.id}">Add to Cart</button>
                    <button class="drawer-item-remove" data-id="${item.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    wishlistBody.querySelectorAll('.wishlist-move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const item = wishlist.find(w => w.id === id);
            if (item) {
                const existing = cart.find(c => c.id === id);
                if (existing) {
                    existing.qty++;
                } else {
                    cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
                }
                wishlist = wishlist.filter(w => w.id !== id);
                saveCart();
                saveWishlist();
                renderCart();
                renderWishlist();
                showToast(item.name + ' moved to cart!');
            }
        });
    });

    wishlistBody.querySelectorAll('.drawer-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromWishlist(parseInt(btn.dataset.id));
        });
    });
}

function openWishlist() {
    renderWishlist();
    wishlistDrawer.classList.add('show');
    wishlistOverlay.classList.add('show');
}

function closeWishlist() {
    wishlistDrawer.classList.remove('show');
    wishlistOverlay.classList.remove('show');
}

wishlistNav.addEventListener('click', (e) => { e.preventDefault(); openWishlist(); });
wishlistClose.addEventListener('click', closeWishlist);
wishlistOverlay.addEventListener('click', closeWishlist);
moveAllToCartBtn.addEventListener('click', moveAllToCart);

// ===== RENDER PRODUCTS =====
const productsGrid = document.getElementById('productsGrid');
const newArrivalsGrid = document.getElementById('newArrivalsGrid');

function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (wishlist.find(w => w.id === id)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function loadProducts() {
    const res = await fetch('products.json');
    allProducts = await res.json();

    const featured = allProducts.slice(0, 8);
    const newArrivals = allProducts.slice(8, 12);

    renderProducts(featured, productsGrid);
    renderProducts(newArrivals, newArrivalsGrid);
    updateCartBadge();
    updateWishlistBadge();
    updateWishlistButtons();
}

function renderProducts(products, container) {
    container.innerHTML = '';
    products.forEach(p => {
        const isSale = p.oldPrice !== null;
        let badgeHTML = '';
        if (p.badge) {
            const badgeClass = isSale ? 'product-badge sale-badge' : 'product-badge';
            badgeHTML = `<div class="${badgeClass}">${p.badge}</div>`;
        }

        let priceHTML = `$${p.price.toFixed(2)}`;
        if (isSale) {
            priceHTML = `<span class="old-price">$${p.oldPrice.toFixed(2)}</span> $${p.price.toFixed(2)}`;
        }

        const inWishlist = wishlist.find(w => w.id === p.id);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = p.category;
        card.dataset.price = p.price;
        card.dataset.id = p.id;
        card.innerHTML = `
            ${badgeHTML}
            <button class="wishlist-btn${inWishlist ? ' active' : ''}" data-id="${p.id}">${heartSVG}</button>
            <div class="product-img" style="background-image: url('${p.image}');"></div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-price">${priceHTML}</p>
                <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });

    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(parseInt(btn.dataset.id));
        });
    });
}

// ===== FILTER TABS =====
const filterTabs = document.querySelectorAll('.filter-tab');
const sectionTitle = document.getElementById('productSectionTitle');

function filterProducts(category) {
    const visible = category === 'all'
        ? allProducts.slice(0, 8)
        : allProducts.filter(p => p.category === category).slice(0, 8);

    renderProducts(visible, productsGrid);

    filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === category);
    });

    const titles = {
        all: 'Featured Products',
        men: 'Men\'s Collection',
        women: 'Women\'s Collection',
        jackets: 'Jackets',
        hoodies: 'Hoodies'
    };
    sectionTitle.textContent = titles[category] || 'Featured Products';
}

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => filterProducts(tab.dataset.filter));
});

// ===== BOTTOM NAV FILTER LINKS =====
document.querySelectorAll('.bottom-nav a[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = link.dataset.filter;

        if (filter === 'all') {
            document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
            filterProducts('all');
        } else if (filter === 'sale') {
            document.getElementById('sale').scrollIntoView({ behavior: 'smooth' });
        } else if (filter === 'new') {
            document.getElementById('new-arrivals').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
            filterProducts(filter);
        }
    });
});

// ===== CATEGORY CARDS =====
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = card.dataset.filter;
        document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => filterProducts(filter), 400);
    });
});

// ===== NEWSLETTER =====
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Subscribed successfully!');
    e.target.reset();
});

// ===== INIT =====
loadProducts();
