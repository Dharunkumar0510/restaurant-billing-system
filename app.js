/***********************
 Dharun’s Delight - app.js
***********************/

// ---------- STORAGE KEYS ----------
const MENU_KEY = "dd_menu";
const CART_KEY = "dd_cart";
const SALES_KEY = "dd_sales";

// ---------- DEFAULT MENU ----------
const defaultMenu = [
  { id: 1, name: "Idly", price: 30, image: "idly.jpg", category: "Breakfast" },
  { id: 2, name: "Dosa", price: 50, image: "dosa.jpg", category: "Breakfast" },
  { id: 3, name: "Poori", price: 45, image: "poori.jpg", category: "Breakfast" },
  { id: 4, name: "Vada", price: 15, image: "vada.jpg", category: "Snacks" },
  { id: 5, name: "Coffee", price: 20, image: "coffee.jpg", category: "Beverage" }
];

// ---------- STATE ----------
let menu = JSON.parse(localStorage.getItem(MENU_KEY)) || defaultMenu;
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// ---------- ELEMENTS ----------
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

// ---------- NAV ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.view + "-view").classList.add("active");
  };
});

// ---------- MENU ----------
function renderMenu() {
  menuGrid.innerHTML = "";
  menu.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${item.image}">
      <h4>${item.name}</h4>
      <p>₹${item.price}</p>
    `;
    div.onclick = () => addToCart(item);
    menuGrid.appendChild(div);
  });
}

// ---------- CART ----------
function addToCart(item) {
  const found = cart.find(i => i.id === item.id);
  if (found) found.qty++;
  else cart.push({ ...item, qty: 1 });

  saveCart();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(i => {
    total += i.price * i.qty;
    cartItems.innerHTML += `<p>${i.name} x ${i.qty}</p>`;
  });

  cartTotal.textContent = `₹${total}`;
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---------- CLEAR CART ----------
document.getElementById("clear-cart").onclick = () => {
  cart = [];
  saveCart();
  renderCart();
};

// ---------- MANAGE MENU ----------
function renderManageMenu() {
  manageList.innerHTML = "";
  menu.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${item.image}">
      <b>${item.name}</b> ₹${item.price}
      <button onclick="deleteItem(${item.id})">Delete</button>
    `;
    manageList.appendChild(div);
  });
}

function deleteItem(id) {
  menu = menu.filter(i => i.id !== id);
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  renderMenu();
  renderManageMenu();
}

// ---------- ADD MENU ----------
addMenuBtn.onclick = () => menuModal.classList.add("active");

menuForm.onsubmit = e => {
  e.preventDefault();
  const item = {
    id: Date.now(),
    name: itemName.value,
    price: +itemPrice.value,
    image: itemImage.value,
    category: itemCategory.value
  };
  menu.push(item);
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
  menuModal.classList.remove("active");
  renderMenu();
  renderManageMenu();
};

// ---------- PAY ----------
document.getElementById("pay-now").onclick = () => {
  if (!cart.length) return alert("Cart empty");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  payAmount.textContent = `₹${total}`;
  qrContainer.innerHTML = "";

  QRCode.toCanvas(
    qrContainer,
    `upi://pay?pa=southdelight@paytm&pn=DharunsDelight&am=${total}&cu=INR`
  );

  payModal.classList.add("active");
};

// ---------- CONFIRM PAYMENT ----------
document.getElementById("confirm-payment").onclick = () => {
  const month = new Date().toISOString().slice(0, 7);
  const sales = JSON.parse(localStorage.getItem(SALES_KEY)) || {};
  sales[month] = (sales[month] || 0) + cart.reduce((s, i) => s + i.price * i.qty, 0);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));

  cart = [];
  saveCart();
  renderCart();
  payModal.classList.remove("active");

  alert("Payment Successful");
};

// ---------- REPORT ----------
document.getElementById("generate-report").onclick = () => {
  const month = document.getElementById("report-month").value;
  const sales = JSON.parse(localStorage.getItem(SALES_KEY)) || {};
  document.getElementById("report-content").innerHTML =
    sales[month] ? `Total Sales: ₹${sales[month]}` : "No sales";
};

// ---------- INIT ----------
renderMenu();
renderCart();
renderManageMenu();
