// ===== STATE =====
let cart = JSON.parse(localStorage.getItem('fw_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('fw_wishlist')) || [];
let allProducts = [];
let globalProducts = [];

const heartSVG = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

// ===== TOAST =====
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== CONFIRM DIALOG =====
const confirmDialog = document.getElementById('confirmDialog');
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
let confirmCallback = null;

function askConfirm(message, callback) {
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmDialog.classList.add('show');
    confirmOverlay.classList.add('show');
}

function closeConfirm() {
    confirmDialog.classList.remove('show');
    confirmOverlay.classList.remove('show');
    confirmCallback = null;
}

confirmYes.addEventListener('click', () => {
    const cb = confirmCallback;
    closeConfirm();
    if (cb) cb();
});

confirmNo.addEventListener('click', closeConfirm);
confirmOverlay.addEventListener('click', closeConfirm);

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
    const item = cart.find(i => i.id === productId);
    const label = item ? item.name : 'this item';
    askConfirm('Remove "' + label + '" from your cart?', () => {
        cart = cart.filter(i => i.id !== productId);
        saveCart();
        renderCart();
        showToast('Removed from cart');
    });
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
                    <select class="drawer-remove-qty" data-id="${item.id}">
                        <option value="" selected>Remove qty</option>
                        ${Array.from({ length: item.qty }, (_, i) => '<option value="' + (i + 1) + '">Remove ' + (i + 1) + '</option>').join('')}
                        <option value="all">Remove All</option>
                    </select>
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

    cartBody.querySelectorAll('.drawer-remove-qty').forEach(sel => {
        sel.addEventListener('change', () => {
            const id = parseInt(sel.dataset.id);
            const val = sel.value;
            sel.selectedIndex = 0;
            if (!val) return;
            const cartItem = cart.find(i => i.id === id);
            if (!cartItem) return;
            const qtyToRemove = val === 'all' ? cartItem.qty : Math.min(parseInt(val), cartItem.qty);
            if (cartItem.qty <= qtyToRemove) {
                cart = cart.filter(i => i.id !== id);
            } else {
                cartItem.qty -= qtyToRemove;
            }
            saveCart();
            renderCart();
            showToast('Removed ' + qtyToRemove + ' of ' + cartItem.name);
        });
    });
}

function clearCart() {
    if (cart.length === 0) return;
    askConfirm('Remove all items from your cart?', () => {
        cart = [];
        saveCart();
        renderCart();
        showToast('Cart cleared');
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
const clearCartBtn = document.getElementById('clearCartBtn');
clearCartBtn.addEventListener('click', clearCart);

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

function updateWishlistButtons() {
    [productsGrid, searchResultsGrid].forEach(grid => {
        grid.querySelectorAll('.wishlist-btn').forEach(btn => {
            const id = parseInt(btn.dataset.id);
            if (wishlist.find(w => w.id === id)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
}

async function loadProducts() {
    try {
        const res = await fetch('men.json');
        allProducts = await res.json();
        try {
            const gRes = await fetch('../../Home/products.json');
            globalProducts = await gRes.json();
        } catch (gErr) {}
        renderProducts(allProducts, productsGrid);
    } catch (err) {
        productsGrid.innerHTML = '<p class="section-subtitle">Failed to load men items. Please try again later.</p>';
    }

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
}

// Grid-scoped event delegation (single listeners, no duplicates)
function bindGrid(container) {
    container.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            addToCart(parseInt(addBtn.dataset.id));
            return;
        }

        const wishBtn = e.target.closest('.wishlist-btn');
        if (wishBtn) {
            e.stopPropagation();
            toggleWishlist(parseInt(wishBtn.dataset.id));
        }
    });
}
bindGrid(productsGrid);

// ===== SEARCH =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const searchResultsGrid = document.createElement('div');
searchResultsGrid.className = 'products-grid';
searchResults.appendChild(searchResultsGrid);
bindGrid(searchResultsGrid);

function showNoResultsBanner(query) {
    let banner = document.getElementById('fwNoResultsBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'fwNoResultsBanner';
        banner.style.position = 'fixed';
        banner.style.top = '140px';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.zIndex = '950';
        banner.style.background = '#fef2f2';
        banner.style.color = '#b91c1c';
        banner.style.fontFamily = "'Montserrat', Arial, sans-serif";
        banner.style.fontSize = '15px';
        banner.style.fontWeight = '600';
        banner.style.textAlign = 'center';
        banner.style.padding = '14px 20px';
        banner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.12)';
        banner.style.borderBottom = '2px solid #fca5a5';
        document.body.appendChild(banner);
    }
    banner.textContent = 'No products match "' + query + '".';
    banner.style.display = 'block';
}

function hideNoResultsBanner() {
    const banner = document.getElementById('fwNoResultsBanner');
    if (banner) banner.style.display = 'none';
}

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        showToast('Please enter a search term');
        hideNoResultsBanner();
        return;
    }

    const allSearchProducts = (globalProducts.length ? globalProducts : allProducts).filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );

    searchResults.style.display = 'block';
    document.getElementById('mensProducts').scrollIntoView({ behavior: 'smooth' });

    if (allSearchProducts.length === 0) {
        showNoResultsBanner(searchInput.value.trim());
        searchResultsGrid.innerHTML = '<p class="no-results">No products match "' + searchInput.value.trim() + '".</p>';
        return;
    }

    hideNoResultsBanner();

    const bar = document.createElement('div');
    bar.className = 'result-bar';
    bar.innerHTML = '<h3>' + allSearchProducts.length + ' result(s) for "' + searchInput.value.trim() + '"</h3><button class="back-btn">Clear Search</button>';
    searchResults.innerHTML = '';
    searchResults.appendChild(bar);
    searchResults.appendChild(searchResultsGrid);
    searchResultsGrid.innerHTML = '';
    renderProducts(allSearchProducts, searchResultsGrid);

    bar.querySelector('.back-btn').addEventListener('click', () => {
        searchResults.style.display = 'none';
        hideNoResultsBanner();
        searchInput.value = '';
    });
}

searchBtn.addEventListener('click', (e) => { e.preventDefault(); performSearch(); });
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); } });

// ===== ACCOUNT =====
const accountNav = document.getElementById('accountNav');
const accountModal = document.getElementById('accountModal');
const accountOverlay = document.getElementById('accountOverlay');
const accountClose = document.getElementById('accountClose');
const accountLoggedOut = document.getElementById('accountLoggedOut');
const accountLoggedIn = document.getElementById('accountLoggedIn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const backToLogin = document.getElementById('backToLogin');
const backToLoginWrap = document.getElementById('backToLoginWrap');

const accountEmailDisplay = document.getElementById('accountEmailDisplay');
const accountNameDisplay = document.getElementById('accountNameDisplay');
const accountWishlistCount = document.getElementById('accountWishlistCount');
const accountCartCount = document.getElementById('accountCartCount');

function updateAccountUI() {
    const user = JSON.parse(localStorage.getItem('fw_user')) || null;
    if (user) {
        accountLoggedOut.style.display = 'none';
        accountLoggedIn.style.display = 'block';
        accountEmailDisplay.textContent = user.email;
        accountNameDisplay.textContent = user.name;
        accountWishlistCount.textContent = wishlist.length;
        accountCartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
    } else {
        accountLoggedOut.style.display = 'block';
        accountLoggedIn.style.display = 'none';
    }
}

function openAccount() {
    updateAccountUI();
    accountModal.classList.add('show');
    accountOverlay.classList.add('show');
}

function closeAccount() {
    accountModal.classList.remove('show');
    accountOverlay.classList.remove('show');
}

accountNav.addEventListener('click', (e) => { e.preventDefault(); openAccount(); });
accountClose.addEventListener('click', closeAccount);
accountOverlay.addEventListener('click', closeAccount);

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    showRegister.parentElement.style.display = 'none';
    registerForm.style.display = 'block';
    backToLoginWrap.style.display = 'block';
});

backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    backToLoginWrap.style.display = 'none';
    loginForm.style.display = 'block';
    showRegister.parentElement.style.display = 'block';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('fw_users')) || {};
    const stored = users[email];

    if (stored && stored.password === password) {
        localStorage.setItem('fw_user', JSON.stringify({ name: stored.name, email }));
        showToast('Welcome back, ' + stored.name + '!');
        updateAccountUI();
    } else {
        showToast('Invalid email or password');
    }
    e.target.reset();
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const users = JSON.parse(localStorage.getItem('fw_users')) || {};

    if (users[email]) {
        showToast('An account with this email already exists');
        return;
    }

    users[email] = { name, password };
    localStorage.setItem('fw_users', JSON.stringify(users));
    localStorage.setItem('fw_user', JSON.stringify({ name, email }));
    showToast('Account created. Welcome, ' + name + '!');
    updateAccountUI();
    e.target.reset();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('fw_user');
    showToast('Signed out successfully');
    updateAccountUI();
});

// ===== NEWSLETTER =====
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Subscribed successfully!');
    e.target.reset();
});

// ===== INIT =====
loadProducts();