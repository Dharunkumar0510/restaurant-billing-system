// Default menu with food images (Unsplash free images)
const DEFAULT_MENU = [
    { id: '1', name: 'Idly', price: 40, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400', category: 'Breakfast' },
    { id: '2', name: 'Puttu', price: 50, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', category: 'Breakfast' },
    { id: '3', name: 'Poori', price: 45, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Breakfast' },
    { id: '4', name: 'Coffee', price: 25, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', category: 'Beverage' },
    { id: '5', name: 'Dosa', price: 55, image: 'https://images.unsplash.com/photo-1630385616392-fc02f1d4e0d0?w=400', category: 'Breakfast' },
    { id: '6', name: 'Vada', price: 35, image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400', category: 'Snacks' },
    { id: '7', name: 'Bajji', price: 30, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', category: 'Snacks' },
    { id: '8', name: 'Salt Biscuit', price: 15, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Snacks' }
];

// Storage keys
const STORAGE_MENU = 'southDelight_menu';
const STORAGE_ORDERS = 'southDelight_orders';

// State
let menu = [];
let cart = [];
let orders = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    loadOrders();
    initNavigation();
    initMenuView();
    initCart();
    initManageMenu();
    initReports();
    initModals();
});

// Load menu from localStorage or use default
function loadMenu() {
    const stored = localStorage.getItem(STORAGE_MENU);
    menu = stored ? JSON.parse(stored) : [...DEFAULT_MENU.map(m => ({ ...m }))];
    if (!stored) saveMenu();
}

function saveMenu() {
    localStorage.setItem(STORAGE_MENU, JSON.stringify(menu));
}

function loadOrders() {
    const stored = localStorage.getItem(STORAGE_ORDERS);
    orders = stored ? JSON.parse(stored) : [];
}

function saveOrders() {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${view}-view`).classList.add('active');
            if (view === 'manage') renderManageMenu();
            if (view === 'reports') {
                const now = new Date();
                document.getElementById('report-month').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            }
        });
    });
}

// Menu View - Render menu items
function initMenuView() {
    renderMenu();
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = menu.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <img class="menu-item-img" src="${item.image || 'https://via.placeholder.com/200x120?text=' + encodeURIComponent(item.name)}" alt="${item.name}">
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price}</div>
                <div class="menu-item-category">${item.category || ''}</div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.menu-item').forEach(el => {
        el.addEventListener('click', () => addToCart(el.dataset.id));
    });
}

// Cart functionality
function initCart() {
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('pay-now').addEventListener('click', showPayModal);
    document.getElementById('print-bill').addEventListener('click', printBill);
}

function addToCart(itemId) {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    renderCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    renderCart();
}

function updateCartQty(itemId, delta) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(itemId);
    else renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Cart is empty. Click items to add.</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-row" data-id="${item.id}">
                <div class="cart-row-info">
                    <div class="cart-row-name">${item.name}</div>
                    <div class="cart-row-qty">Qty: ${item.qty} × ₹${item.price}</div>
                </div>
                <div class="cart-row-price">₹${item.price * item.qty}</div>
                <div class="cart-row-actions">
                    <button class="qty-btn" data-action="minus">−</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="plus">+</button>
                    <button class="remove-btn" title="Remove">✕</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.cart-row').forEach(row => {
            const id = row.dataset.id;
            row.querySelector('[data-action="minus"]').addEventListener('click', () => updateCartQty(id, -1));
            row.querySelector('[data-action="plus"]').addEventListener('click', () => updateCartQty(id, 1));
            row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(id));
        });
    }

    totalEl.textContent = `₹${getCartTotal()}`;
}

// Pay Now - QR Code
function showPayModal() {
    const total = getCartTotal();
    if (total <= 0) {
        alert('Cart is empty. Add items first.');
        return;
    }

    document.getElementById('pay-amount').textContent = `₹${total}`;

    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = '';
    const upiUrl = `upi://pay?pa=southdelight@paytm&pn=South%20Delight&am=${total}&cu=INR`;
    if (typeof QRCode !== 'undefined') {
        QRCode.toDataURL(upiUrl, { width: 180 }, (err, url) => {
            if (!err) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'QR Code for Payment';
                qrContainer.appendChild(img);
            }
        });
    }

    document.getElementById('pay-modal').classList.add('active');
}

document.getElementById('confirm-payment').addEventListener('click', () => {
    const total = getCartTotal();
    if (total <= 0) return;

    orders.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: [...cart],
        total
    });
    saveOrders();

    clearCart();
    document.getElementById('pay-modal').classList.remove('active');
    alert('Payment confirmed! Thank you for your order.');
});

document.querySelector('.pay-close').addEventListener('click', () => {
    document.getElementById('pay-modal').classList.remove('active');
});

// Print Bill
function printBill() {
    const total = getCartTotal();
    if (total <= 0) {
        alert('Cart is empty. Nothing to print.');
        return;
    }

    const printContent = `
        <html>
        <head><title>Bill - South Delight</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #c41e3a; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 1.2em; font-weight: bold; margin-top: 15px; }
            .date { color: #666; font-size: 0.9em; }
        </style>
        </head>
        <body>
            <h1>South Delight</h1>
            <p class="date">${new Date().toLocaleString('en-IN')}</p>
            <table>
                <tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
                ${cart.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`).join('')}
            </table>
            <p class="total">Total: ₹${total}</p>
            <p>Thank you! Visit again.</p>
        </body>
        </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
        win.print();
        win.close();
    }, 250);
}

// Manage Menu - CRUD
function initManageMenu() {
    document.getElementById('add-menu-btn').addEventListener('click', () => openMenuModal());
}

function renderManageMenu() {
    const list = document.getElementById('manage-menu-list');
    list.innerHTML = menu.map(item => `
        <div class="manage-item" data-id="${item.id}">
            <img class="manage-item-img" src="${item.image || 'https://via.placeholder.com/60?text=' + encodeURIComponent(item.name)}" alt="${item.name}">
            <div class="manage-item-info">
                <div class="manage-item-name">${item.name}</div>
                <div class="manage-item-price">₹${item.price} | ${item.category || '-'}</div>
            </div>
            <div class="manage-item-actions">
                <button class="btn btn-secondary edit-item-btn" data-id="${item.id}">Edit</button>
                <button class="btn btn-danger delete-item-btn" data-id="${item.id}">Delete</button>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => openMenuModal(btn.dataset.id));
    });
    list.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMenuItem(btn.dataset.id));
    });
}

function openMenuModal(itemId = null) {
    const modal = document.getElementById('menu-modal');
    const form = document.getElementById('menu-form');
    const title = document.getElementById('modal-title');

    if (itemId) {
        const item = menu.find(m => m.id === itemId);
        if (item) {
            title.textContent = 'Edit Menu Item';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-image').value = item.image || '';
            document.getElementById('item-category').value = item.category || '';
        }
    } else {
        title.textContent = 'Add Menu Item';
        document.getElementById('item-id').value = '';
        form.reset();
    }
    modal.classList.add('active');
}

function saveMenuItem(e) {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value.trim();
    const price = parseFloat(document.getElementById('item-price').value);
    const image = document.getElementById('item-image').value.trim();
    const category = document.getElementById('item-category').value.trim();

    if (!name || isNaN(price) || price < 0) {
        alert('Please enter valid name and price.');
        return;
    }

    if (id) {
        const idx = menu.findIndex(m => m.id === id);
        if (idx !== -1) {
            menu[idx] = { ...menu[idx], name, price, image: image || menu[idx].image, category };
        }
    } else {
        menu.push({
            id: Date.now().toString(),
            name,
            price,
            image: image || 'https://via.placeholder.com/200x120?text=' + encodeURIComponent(name),
            category
        });
    }

    saveMenu();
    renderMenu();
    document.getElementById('menu-modal').classList.remove('active');
    if (document.getElementById('manage-view').classList.contains('active')) {
        renderManageMenu();
    }
}

function deleteMenuItem(itemId) {
    if (!confirm('Delete this menu item?')) return;
    menu = menu.filter(m => m.id !== itemId);
    saveMenu();
    renderMenu();
    renderManageMenu();
}

// Menu Modal
function initModals() {
    const menuModal = document.getElementById('menu-modal');
    const form = document.getElementById('menu-form');

    form.addEventListener('submit', saveMenuItem);

    menuModal.querySelector('.modal-close').addEventListener('click', () => menuModal.classList.remove('active'));
    menuModal.querySelector('.modal-cancel').addEventListener('click', () => menuModal.classList.remove('active'));

    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) menuModal.classList.remove('active');
    });
}

// Monthly Sales Report
function initReports() {
    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('print-report').addEventListener('click', () => {
        const content = document.getElementById('report-content');
        if (!content.querySelector('.report-summary')) return;
        const printWin = window.open('', '_blank');
        printWin.document.write('<html><head><title>Monthly Sales Report</title></head><body>' + content.innerHTML + '</body></html>');
        printWin.document.close();
        printWin.print();
        printWin.close();
    });
}

function generateReport() {
    const monthInput = document.getElementById('report-month').value;
    const container = document.getElementById('report-content');

    if (!monthInput) {
        alert('Please select a month.');
        return;
    }

    const [year, month] = monthInput.split('-').map(Number);
    const monthOrders = orders.filter(o => {
        const d = new Date(o.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const totalSales = monthOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = monthOrders.length;

    const itemSales = {};
    monthOrders.forEach(order => {
        order.items.forEach(item => {
            itemSales[item.name] = (itemSales[item.name] || 0) + item.price * item.qty;
        });
    });

    const topItems = Object.entries(itemSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    container.innerHTML = `
        <div class="report-summary">
            <div class="report-stat">
                <div class="report-stat-value">₹${totalSales}</div>
                <div class="report-stat-label">Total Sales</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value">${totalOrders}</div>
                <div class="report-stat-label">Total Orders</div>
            </div>
        </div>
        <h3>Top Selling Items (${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year})</h3>
        <table class="report-table">
            <tr><th>Item</th><th>Sales (₹)</th></tr>
            ${topItems.map(([name, sales]) => `<tr><td>${name}</td><td>₹${sales}</td></tr>`).join('')}
        </table>
    `;
}
