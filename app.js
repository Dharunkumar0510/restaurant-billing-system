/***********************
 * South Delight - app.js
 ***********************/

// ---------- Local Storage Keys ----------
const MENU_KEY = "sd_menu";
const CART_KEY = "sd_cart";
const SALES_KEY = "sd_sales";

// ---------- Default Menu ----------
const defaultMenu = [
  { id: 1, name: "Idly", price: 30, image: "", category: "Breakfast" },
  { id: 2, name: "Dosa", price: 50, image: "", category: "Breakfast" },
  { id: 3, name: "Poori", price: 45, image: "", category: "Breakfast" },
  { id: 4, name: "Vada", price: 15, image: "", category: "Snacks" },
  { id: 5, name: "Coffee", price: 20, image: "", category: "Beverage" },
];

// ---------- State ----------
let menu = JSON.parse(localStorage.getItem(MENU_KEY)) || defaultMenu;
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// ---------- Elements ----------
const menuGrid = document.getElementById("menu-grid");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

const manageList = document.getElementById("manage-menu-list");
const addMenuBtn = document.getElementById("add-menu-btn");

const menuModal = document.getElementById("menu-modal");
const menuForm = document.getElementById("menu-form");

const payModal = document.getElementById("pay-modal");
const qrContainer = document.getElementById("qr-code");
const payAmount = document.getElementById("pay-amount");

// ---------- Navigation ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`${btn.dataset.view}-view`).classList.add("active");
  });
});

// ---------- Menu Rendering ----------
function renderMenu() {
  menuGrid.innerHTML = "";
  menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <img class="menu-item-img" src="${item.image || "https://via.placeholder.com/300"}">
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-price">₹${item.price}</div>
        <div class="menu-item-category">${item.category || ""}</div>
      </div>
    `;
    div.onclick = () => addToCart(item);
    menuGrid.appendChild(div);
  });
}

// ---------- Cart ----------
function addToCart(item) {
  const found = cart.find(c => c.id === item.id);
  if (found) found.qty++;
  else cart.push({ ...item, qty: 1 });

  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">Cart is empty. Click items to add.</p>`;
    cartTotal.textContent = "₹0";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-info">
        <div class="cart-row-name">${item.name}</div>
        <div class="cart-row-qty">Qty: ${item.qty}</div>
      </div>
      <div class="cart-row-actions">
        <button class="qty-btn">+</button>
        <button class="qty-btn">−</button>
        <button class="remove-btn">×</button>
      </div>
      <div class="cart-row-price">₹${item.price * item.qty}</div>
    `;

    row.querySelectorAll(".qty-btn")[0].onclick = () => { item.qty++; saveCart(); renderCart(); };
    row.querySelectorAll(".qty-btn")[1].onclick = () => {
      item.qty--;
      if (item.qty <= 0) cart = cart.filter(c => c.id !== item.id);
      saveCart(); renderCart();
    };
    row.querySelector(".remove-btn").onclick = () => {
      cart = cart.filter(c => c.id !== item.id);
      saveCart(); renderCart();
    };

    cartItems.appendChild(row);
  });

  cartTotal.textContent = `₹${total}`;
}

// ---------- Save ----------
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function saveMenu() {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
}

// ---------- Clear Cart ----------
document.getElementById("clear-cart").onclick = () => {
  cart = [];
  saveCart();
  renderCart();
};

// ---------- Manage Menu ----------
function renderManageMenu() {
  manageList.innerHTML = "";
  menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "manage-item";
    div.innerHTML = `
      <img class="manage-item-img" src="${item.image || "https://via.placeholder.com/100"}">
      <div class="manage-item-info">
        <div class="manage-item-name">${item.name}</div>
        <div class="manage-item-price">₹${item.price}</div>
      </div>
      <div class="manage-item-actions">
        <button class="btn btn-secondary">Edit</button>
        <button class="btn btn-danger">Delete</button>
      </div>
    `;

    div.querySelector(".btn-secondary").onclick = () => openMenuModal(item);
    div.querySelector(".btn-danger").onclick = () => {
      menu = menu.filter(m => m.id !== item.id);
      saveMenu();
      renderMenu();
      renderManageMenu();
    };

    manageList.appendChild(div);
  });
}

// ---------- Modal ----------
addMenuBtn.onclick = () => openMenuModal();

function openMenuModal(item = null) {
  menuModal.classList.add("active");
  menuForm.reset();

  if (item) {
    document.getElementById("item-id").value = item.id;
    document.getElementById("item-name").value = item.name;
    document.getElementById("item-price").value = item.price;
    document.getElementById("item-image").value = item.image;
    document.getElementById("item-category").value = item.category;
  }
}

document.querySelectorAll(".modal-close, .modal-cancel").forEach(btn => {
  btn.onclick = () => menuModal.classList.remove("active");
});

menuForm.onsubmit = e => {
  e.preventDefault();
  const id = document.getElementById("item-id").value;

  const item = {
    id: id || Date.now(),
    name: itemName.value,
    price: +itemPrice.value,
    image: itemImage.value,
    category: itemCategory.value
  };

  if (id) menu = menu.map(m => m.id == id ? item : m);
  else menu.push(item);

  saveMenu();
  renderMenu();
  renderManageMenu();
  menuModal.classList.remove("active");
};

// ---------- Pay Now ----------
document.getElementById("pay-now").onclick = () => {
  if (cart.length === 0) return alert("Cart is empty");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  payAmount.textContent = `₹${total}`;
  qrContainer.innerHTML = "";

  QRCode.toCanvas(qrContainer, `upi://pay?pa=southdelight@paytm&am=${total}`, () => {});
  payModal.classList.add("active");
};

document.querySelector(".pay-close").onclick = () => payModal.classList.remove("active");

// ---------- Confirm Payment ----------
document.getElementById("confirm-payment").onclick = () => {
  const month = new Date().toISOString().slice(0, 7);
  const sales = JSON.parse(localStorage.getItem(SALES_KEY)) || {};
  sales[month] = (sales[month] || []).concat(cart);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));

  cart = [];
  saveCart();
  renderCart();
  payModal.classList.remove("active");
  alert("Payment successful!");
};

// ---------- Print ----------
document.getElementById("print-bill").onclick = () => window.print();
document.getElementById("print-report").onclick = () => window.print();

// ---------- Init ----------
renderMenu();
renderCart();
renderManageMenu();
