/**
 * 1. PRODUCT DATABASE
 */
const products = [
    { id: 1, name: "Studio Pro Headphones", price: 299, category: "Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
    { id: 2, name: "Series 7 Smartwatch", price: 399, category: "Wearables", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" },
    { id: 3, name: "Titan Bluetooth Speaker", price: 145, category: "Audio", img: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600" },
    { id: 4, name: "Swift Wireless Mouse", price: 89, category: "Computing", img: "https://images.unsplash.com/photo-1527814732934-7634356e9c0c?w=600" },
    { id: 5, name: "Mechanical Glow Keypad", price: 159, category: "Computing", img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600" },
    { id: 6, name: "Noise-Cancelling Pods", price: 199, category: "Audio", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600" }
];

/**
 * 2. STATE MANAGEMENT
 */
let cart = JSON.parse(localStorage.getItem('cartData')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlistData')) || [];
let currentCategory = 'All';

/**
 * 3. INITIALIZATION (Runs on every page load)
 */
document.addEventListener('DOMContentLoaded', () => {
    updateCounters();
    
    // Determine which page we are on based on existing IDs
    if (document.getElementById('product-list')) {
        renderProducts(products, 'product-list');
        renderCategoryButtons();
    }
    
    if (document.getElementById('product-details-container')) {
        renderProductDetails();
    }
    
    if (document.getElementById('cart-table-container')) {
        renderCartPage();
    }

    if (document.getElementById('checkout-items')) {
        renderCheckoutSummary();
    }
});

/**
 * 4. SHARED UTILITIES
 */
function saveCart() {
    localStorage.setItem('cartData', JSON.stringify(cart));
    updateCounters();
}

function updateCounters() {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.innerText = totalQty);
    
    const wishCount = document.getElementById('wishlist-count');
    if (wishCount) wishCount.innerText = wishlist.length;
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] transition-all duration-500 transform translate-y-20 opacity-0 font-bold";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

/**
 * 5. INDEX PAGE FILTERING
 */
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || "";
    const maxPrice = parseInt(document.getElementById('price-range')?.value) || 500;
    
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCategory = (currentCategory === 'All' || p.category === currentCategory);
        const matchesPrice = p.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    renderProducts(filtered, 'product-list');
}

function updatePriceFilter() {
    const val = document.getElementById('price-range').value;
    document.getElementById('price-display').innerText = `$${val}`;
    applyFilters();
}

function filterByCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.category-btn').forEach(btn => {
        const isActive = btn.innerText.trim() === cat;
        btn.className = `category-btn whitespace-nowrap px-6 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`;
    });
    applyFilters();
}

function renderCategoryButtons() {
    const container = document.getElementById('category-btns');
    if (!container) return;
    const cats = ['All', ...new Set(products.map(p => p.category))];
    container.innerHTML = cats.map(c => `
        <button onclick="filterByCategory('${c}')" class="category-btn whitespace-nowrap px-6 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${c === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}">
            ${c}
        </button>
    `).join('');
}

/**
 * 6. RENDERING COMPONENTS
 */
function renderProducts(list, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<div class="col-span-full py-20 text-center text-slate-400">No items match your criteria.</div>`;
        return;
    }

    container.innerHTML = list.map(product => {
        const isWishlisted = wishlist.includes(product.id);
        return `
        <div class="group relative bg-white rounded-[2.3rem] p-3 transition-all duration-500 hover:shadow-xl border border-transparent hover:border-slate-100">
            <button onclick="toggleWishlist(${product.id})" class="absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-400 shadow-md'}">
                ${isWishlisted ? '❤️' : '🤍'}
            </button>
            <a href="product.html?id=${product.id}">
                <div class="aspect-square rounded-[1.8rem] bg-slate-50 overflow-hidden mb-6">
                    <img src="${product.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                </div>
                <div class="px-4 pb-4">
                    <span class="text-[10px] uppercase tracking-widest text-blue-600 font-black">${product.category}</span>
                    <h3 class="font-bold text-slate-900 text-lg mt-1">${product.name}</h3>
                    <p class="text-slate-400 font-medium mt-1">$${product.price}</p>
                </div>
            </a>
            <button onclick="addToCart(${product.id})" class="absolute bottom-6 right-6 bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-blue-600">
                +
            </button>
        </div>`;
    }).join('');
}

/**
 * 7. PRODUCT DETAILS & RECOMMENDED
 */
function renderProductDetails() {
    const container = document.getElementById('product-details-container');
    if (!container) return;
    
    const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `<h1 class="text-center py-20 font-bold">Gadget not found. <a href="index.html" class="text-blue-600">Go Home</a></h1>`;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <img src="${product.img}" class="rounded-[3rem] shadow-2xl">
            <div>
                <span class="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">${product.category}</span>
                <h1 class="text-5xl font-black text-slate-900 mt-6 mb-4">${product.name}</h1>
                <p class="text-4xl font-light text-slate-400 mb-8">$${product.price}</p>
                <div class="flex gap-4">
                    <button onclick="addToCart(${product.id})" class="flex-1 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-600 transition shadow-xl">Add to Bag</button>
                    <button onclick="toggleWishlist(${product.id})" class="p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 transition">❤️</button>
                </div>
            </div>
        </div>
        <div class="border-t border-slate-100 pt-16">
            <h3 class="text-2xl font-black mb-8">You might also like</h3>
            <div id="recommended-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"></div>
        </div>
    `;

    const recommended = products.filter(p => p.category === product.category && p.id !== product.id);
    renderProducts(recommended, 'recommended-list');
}

/**
 * 8. CART PAGE LOGIC
 */
function renderCartPage() {
    const container = document.getElementById('cart-table-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p class="text-slate-400 mb-6 font-medium">Your shopping bag is empty.</p>
                <a href="index.html" class="inline-block bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg">Go Shopping</a>
            </div>`;
        updateCartTotals(0);
        return;
    }

    container.innerHTML = `
        <div class="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm mb-10">
            <table class="w-full text-left">
                <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    <tr>
                        <th class="py-6 px-10">Product</th>
                        <th class="py-6">Price</th>
                        <th class="py-6">Quantity</th>
                        <th class="py-6 text-right px-10">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map((item, index) => `
                        <tr class="border-b border-slate-50 last:border-none">
                            <td class="py-8 px-10 flex items-center gap-6">
                                <button onclick="removeFromCart(${index})" class="text-slate-300 hover:text-red-500 transition text-lg">✕</button>
                                <div>
                                    <p class="font-bold text-slate-900">${item.name}</p>
                                    <p class="text-[10px] uppercase text-blue-600 font-bold">${item.category}</p>
                                </div>
                            </td>
                            <td class="py-8 text-slate-500 font-medium">$${item.price}</td>
                            <td class="py-8">
                                <div class="flex items-center gap-4 bg-slate-100 w-fit px-4 py-2 rounded-2xl">
                                    <button onclick="changeQty(${index}, -1)" class="font-black hover:text-blue-600 transition">-</button>
                                    <span class="text-sm font-black w-6 text-center">${item.quantity}</span>
                                    <button onclick="changeQty(${index}, 1)" class="font-black hover:text-blue-600 transition">+</button>
                                </div>
                            </td>
                            <td class="py-8 text-right px-10 font-black text-slate-900">$${item.price * item.quantity}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>`;

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    updateCartTotals(total);
}

function updateCartTotals(total) {
    const t1 = document.getElementById('cart-total');
    const t2 = document.getElementById('cart-total-final');
    if (t1) t1.innerText = `$${total}`;
    if (t2) t2.innerText = `$${total}`;
}

/**
 * 9. CHECKOUT PAGE SUMMARY
 */
function renderCheckoutSummary() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between pb-6 border-b border-slate-50 last:border-none last:pb-0">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden">
                    <img src="${item.img}" class="w-full h-full object-cover">
                </div>
                <div><p class="font-bold text-sm">${item.name}</p><p class="text-[10px] text-slate-400">Qty: ${item.quantity}</p></div>
            </div>
            <span class="font-bold text-sm">$${item.price * item.quantity}</span>
        </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const sub = document.getElementById('checkout-subtotal');
    const final = document.getElementById('checkout-total');
    if (sub) sub.innerText = `$${total}`;
    if (final) final.innerText = `$${total}`;
}

/**
 * 10. CORE ACTIONS
 */
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    showToast(`${product.name} added to bag!`);
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCartPage();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartPage();
}

function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx === -1) {
        wishlist.push(id);
        showToast("Added to wishlist!");
    } else {
        wishlist.splice(idx, 1);
        showToast("Removed from wishlist");
    }
    localStorage.setItem('wishlistData', JSON.stringify(wishlist));
    updateCounters();
    
    // Refresh page state
    if (document.getElementById('product-list')) applyFilters();
    if (document.getElementById('product-details-container')) renderProductDetails();
}