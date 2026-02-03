/*******************************
 * Dharun's Delight - app.js
 *******************************/

// ---------- Local Storage Keys ----------
const MENU_KEY = "dd_menu";
const CART_KEY = "dd_cart";
const SALES_KEY = "dd_sales";

// ---------- UPI ----------
const UPI_ID = "southdelight@paytm"; // change later if needed

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

const payNowBtn = document.getElementById("pay-now");
const payModal = document.getElementById("pay-modal");
const payClose = document.querySelector(".pay-close");
const qrContainer = document.getElementById("qr-code");
const payAmount = document.getElementById("pay-amount");

// ---------- Navigation ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`${btn.dataset.view}-view`).classList.add("active");
  };
});

// ---------- Render Menu ----------
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
        <div class="menu-item-category">${item.category}</div>
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
      <div>
        <strong>${item.name}</strong><br>
        Qty: ${item.qty}
      </div>
      <div>₹${item.price * item.qty}</div>
    `;
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
      <strong>${item.name}</strong> - ₹${item.price}
      <button class="btn btn-danger">Delete</button>
    `;
    div.querySelector("button").onclick = () => {
      menu = menu.filter(m => m.id !== item.id);
      saveMenu();
      renderMenu();
      renderManageMenu();
    };
    manageList.appendChild(div);
  });
}

// ---------- Menu Modal ----------
addMenuBtn.onclick = () => {
  menuForm.reset();
  menuModal.classList.add("active");
};

document.querySelectorAll(".modal-close, .modal-cancel").forEach(btn => {
  btn.onclick = () => menuModal.classList.remove("active");
});

// ---------- Menu Form ----------
menuForm.onsubmit = e => {
  e.preventDefault();

  const item = {
    id: Date.now(),
    name: document.getElementById("item-name").value,
    price: +document.getElementById("item-price").value,
    image: document.getElementById("item-image").value,
    category: document.getElementById("item-category").value,
  };

  menu.push(item);
  saveMenu();
  renderMenu();
  renderManageMenu();
  menuModal.classList.remove("active");
};

// ---------- Pay Now ----------
payNowBtn.onclick = () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  payAmount.textContent = `₹${total}`;

  qrContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  qrContainer.appendChild(canvas);

  QRCode.toCanvas(
    canvas,
    `upi://pay?pa=${UPI_ID}&pn=Dharuns%20Delight&am=${total}&cu=INR`
  );

  payModal.classList.add("active");
};

payClose.onclick = () => payModal.classList.remove("active");

// ---------- Confirm Payment ----------
document.getElementById("confirm-payment").onclick = () => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  saveMonthlySales(cart, total);

  cart = [];
  saveCart();
  renderCart();
  payModal.classList.remove("active");

  alert("Payment successful!");
};


// ---------- Print ----------
document.getElementById("print-bill").onclick = () => window.print();
document.getElementById("print-report").onclick = () => window.print();
function saveMonthlySales(cart, total) {
  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  let sales = JSON.parse(localStorage.getItem(SALES_KEY)) || {};

  if (!sales[monthKey]) {
    sales[monthKey] = {
      orders: 0,
      revenue: 0,
      items: []
    };
  }

  sales[monthKey].orders += 1;
  sales[monthKey].revenue += total;
  sales[monthKey].items.push(...cart);

  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}
document.getElementById("generate-report").onclick = () => {
  const sales = JSON.parse(localStorage.getItem(SALES_KEY)) || {};
  const month = new Date().toISOString().slice(0, 7);

  if (!sales[month]) {
    alert("No sales for this month");
    return;
  }

  const report = sales[month];

  alert(
     Month: ${month}\n` +
     Orders: ${report.orders}\n` +
     Revenue: ₹${report.revenue}`
  );
};


// ---------- Init ----------
renderMenu();
renderCart();
renderManageMenu();
