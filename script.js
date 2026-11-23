
/* ==========================================
   VMAN RACING TEAM
   WEBSITE FUNCTIONALITY
========================================== */

/* SHOP CONFIGURATION */

const SHOP_CONFIG = {
  phone: "639949254805",
  displayPhone: "0994 925 4805",
  address: "300 Visayas Avenue, Quezon City"
};

/* ==========================================
   PRODUCT DATABASE
========================================== */

const products = [
  {
    id: 1,
    name: "VMAN Fork Oil 120 ML",
    category: "Fork Oil",
    price: 120,
    description: "Fork oil for motorcycle suspension maintenance.",
    image: "images/vman-forkoil.jpg",
    badge: "VMAN"
  },
  {
    id: 2,
    name: "VMAN Gear Oil 120 ML",
    category: "Gear Oil",
    price: 85,
    description: "Gear oil for motorcycle drivetrain lubrication.",
    image: "images/vman-gearoil.jpg",
    badge: "VMAN"
  },
  {
    id: 3,
    name: "XTeer Scooter Motorcycle Oil 1L",
    category: "Engine Oil",
    price: 336,
    description: "XTeer scooter motorcycle oil, 1 liter.",
    image: "images/vman-xteer.jpg",
    badge: "XTEER"
  },
  {
    id: 4,
    name: "Pertamina Enduro 4T 20W-50",
    category: "Engine Oil",
    price: 304,
    description: "Pertamina Enduro 4T motorcycle oil.",
    image: "images/vman-enduro.jpg",
    badge: "ENDURO"
  },
  {
    id: 5,
    name: "Pirelli Diablo Rosso Corsa",
    category: "Tires",
    price: 4550,
    description: "Includes FREE sealant and tire valve.",
    image: "images/vman-pirelli-tires.jpg",
    badge: "FREEBIES"
  }
];

/* ==========================================
   SERVICE DATABASE
========================================== */

const services = [
  {
    name: "VMan Front Suspension Repack",
    price: 1300
  },
  {
    name: "Raider FI 154cc",
    price: 3000,
    inclusions: [
      "Bore 63.5",
      "Piston Ring",
      "Piston Pin",
      "Head Gasket",
      "Base Gasket"
    ]
  }
];

/* ==========================================
   STATE
========================================== */

let selectedCategory = "All";
let searchQuery = "";
let cart = loadCart();

/* ==========================================
   DOM ELEMENTS
========================================== */

const productGrid = document.getElementById("productGrid");
const emptyProducts = document.getElementById("emptyProducts");
const categoryFilters = document.getElementById("categoryFilters");
const productSearch = document.getElementById("productSearch");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const drawerCount = document.getElementById("drawerCount");
const cartSubtotal = document.getElementById("cartSubtotal");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutSummary = document.getElementById("checkoutSummary");

const toast = document.getElementById("toast");

/* ==========================================
   HELPERS
========================================== */

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(price);
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("vmanCart") || "[]");

    if (!Array.isArray(savedCart)) {
      return [];
    }

    // Keep only products that are currently in our catalog.
    // Refresh their names and prices from the current database.
    return savedCart
      .map(savedItem => {
        const currentProduct = products.find(
          product => product.id === Number(savedItem.id)
        );

        if (!currentProduct) return null;

        const quantity = Math.max(
          1,
          Math.floor(Number(savedItem.quantity) || 1)
        );

        return {
          ...currentProduct,
          quantity
        };
      })
      .filter(Boolean);

  } catch (error) {
    console.error("Cart loading error:", error);
    return [];
  }
}

function saveCart() {
  localStorage.setItem("vmanCart", JSON.stringify(cart));
}

let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getCartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

/* ==========================================
   RENDER PRODUCTS
========================================== */

function renderProducts() {
  const filteredProducts = products.filter(product => {

    const categoryMatch =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchableContent = (
      product.name + " " +
      product.category + " " +
      product.description + " " +
      product.badge
    ).toLowerCase();

    const searchMatch = searchableContent.includes(searchQuery);

    return categoryMatch && searchMatch;
  });

  productGrid.innerHTML = "";

  emptyProducts.hidden = filteredProducts.length > 0;

  filteredProducts.forEach(product => {

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

        <span class="product-badge">
          ${product.badge}
        </span>
      </div>

      <div class="product-details">

        <span class="product-category">
          ${product.category}
        </span>

        <h3>${product.name}</h3>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="product-bottom">

          <span class="product-price">
            ${formatPrice(product.price)}
          </span>

          <button
            class="add-cart-btn"
            data-id="${product.id}"
            aria-label="Add ${product.name} to cart"
          >
            + ADD
          </button>

        </div>

      </div>
    `;

    productGrid.appendChild(card);
  });
}

/* ==========================================
   CATEGORY FILTER
========================================== */

categoryFilters.addEventListener("click", event => {

  const button = event.target.closest(".filter-btn");

  if (!button) return;

  selectedCategory = button.dataset.category;

  document.querySelectorAll(".filter-btn").forEach(filter => {
    filter.classList.remove("active");
  });

  button.classList.add("active");

  renderProducts();
});

/* ==========================================
   SEARCH
========================================== */

productSearch.addEventListener("input", event => {

  searchQuery = event.target.value.trim().toLowerCase();

  renderProducts();
});

/* ==========================================
   ADD PRODUCTS TO CART
========================================== */

productGrid.addEventListener("click", event => {

  const button = event.target.closest(".add-cart-btn");

  if (!button) return;

  const productId = Number(button.dataset.id);

  const product = products.find(item => item.id === productId);

  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  renderCart();

  showToast(`${product.name} added to cart!`);
});

/* ==========================================
   RENDER CART
========================================== */

function renderCart() {

  cartItems.innerHTML = "";

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <div class="cart-empty">
        <h3>YOUR CART IS EMPTY</h3>
        <p>Start adding products to your cart.</p>
      </div>
    `;
  }

  cart.forEach(item => {

    const cartItem = document.createElement("div");

    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img
        src="${item.image}"
        alt="${item.name}"
      >

      <div class="cart-item-info">

        <h3>${item.name}</h3>

        <p>${formatPrice(item.price)}</p>

        <div class="quantity-control">

          <button
            data-action="decrease"
            data-id="${item.id}"
            aria-label="Decrease quantity"
          >−</button>

          <span>${item.quantity}</span>

          <button
            data-action="increase"
            data-id="${item.id}"
            aria-label="Increase quantity"
          >+</button>

          <button
            class="remove-item"
            data-action="remove"
            data-id="${item.id}"
          >REMOVE</button>

        </div>

      </div>
    `;

    cartItems.appendChild(cartItem);
  });

  const quantity = getCartQuantity();
  const total = getCartTotal();

  cartCount.textContent = quantity;
  drawerCount.textContent = `(${quantity})`;
  cartSubtotal.textContent = formatPrice(total);

  saveCart();
}

/* ==========================================
   CART QUANTITY CONTROLS
========================================== */

cartItems.addEventListener("click", event => {

  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  const item = cart.find(product => product.id === id);

  if (!item) return;

  switch (action) {

    case "increase":
      item.quantity += 1;
      break;

    case "decrease":
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
      }
      break;

    case "remove":
      cart = cart.filter(product => product.id !== id);
      break;
  }

  renderCart();
});

/* ==========================================
   OPEN AND CLOSE CART
========================================== */

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

document.getElementById("openCart").addEventListener("click", openCart);

document.getElementById("closeCart").addEventListener("click", closeCart);

document.getElementById("continueShopping").addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);

/* ==========================================
   CHECKOUT SUMMARY
========================================== */

function openCheckout() {

  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }

  const subtotal = getCartTotal();

  checkoutSummary.innerHTML = `
    ${cart.map(item => `
      <div class="checkout-summary-row">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join("")}

    <div class="checkout-summary-total">
      <span>SUBTOTAL</span>
      <strong>${formatPrice(subtotal)}</strong>
    </div>
  `;

  closeCart();

  checkoutModal.classList.add("show");

  document.body.classList.add("no-scroll");
}

document.getElementById("checkoutButton").addEventListener("click", openCheckout);

/* CLOSE CHECKOUT */

function closeCheckout() {
  checkoutModal.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

document.getElementById("closeCheckout").addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {

  if (event.target === checkoutModal) {
    closeCheckout();
  }
});

/* ==========================================
   WHATSAPP ORDER CHECKOUT
========================================== */

document.getElementById("checkoutForm").addEventListener("submit", event => {

  event.preventDefault();

  if (cart.length === 0) {
    showToast("Your cart is empty!");
    closeCheckout();
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const orderNotes = document.getElementById("orderNotes").value.trim();

  const subtotal = getCartTotal();

  const itemsText = cart.map(item => {
    return `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`;
  }).join("\n");

  const message = `
🏁 VMAN RACING TEAM - ORDER REQUEST

CUSTOMER DETAILS
Name: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}
Payment Preference: ${paymentMethod}

ORDER ITEMS
${itemsText}

SUBTOTAL: ${formatPrice(subtotal)}

Notes: ${orderNotes || "None"}

Please confirm the availability of my items, delivery fee, and final order total. Thank you!
  `.trim();

  const whatsappURL =
    `https://wa.me/${SHOP_CONFIG.phone}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp from the form submission
  window.open(whatsappURL, "_blank");

  // Reset cart after preparing the order
  cart = [];

  saveCart();
  renderCart();

  document.getElementById("checkoutForm").reset();

  closeCheckout();

  showToast("Order message prepared!");
});

/* ==========================================
   SERVICE BOOKING BUTTONS
========================================== */

document.querySelectorAll(".service-book").forEach(button => {

  button.addEventListener("click", () => {

    const serviceName = button.dataset.service;

    const bookingService = document.getElementById("bookingService");

    bookingService.value = serviceName;

    document.getElementById("booking").scrollIntoView({
      behavior: "smooth"
    });

    setTimeout(() => {
      document.getElementById("bookingName").focus();
    }, 500);

  });

});

/* ==========================================
   SERVICE BOOKING FORM
========================================== */

document.getElementById("bookingForm").addEventListener("submit", event => {

  event.preventDefault();

  const name = document.getElementById("bookingName").value.trim();
  const phone = document.getElementById("bookingPhone").value.trim();
  const motorcycle = document.getElementById("bookingMotorcycle").value.trim();
  const service = document.getElementById("bookingService").value;
  const date = document.getElementById("bookingDate").value;
  const time = document.getElementById("bookingTime").value;
  const notes = document.getElementById("bookingNotes").value.trim();

  const message = `
🏁 VMAN RACING TEAM - SERVICE BOOKING

CUSTOMER DETAILS
Name: ${name}
Phone: ${phone}
Motorcycle: ${motorcycle}

SERVICE DETAILS
Service: ${service}
Preferred Date: ${date}
Preferred Time: ${time}

Additional Details:
${notes || "None"}

Please confirm my requested appointment schedule and service availability. Thank you!
  `.trim();

  const whatsappURL =
    `https://wa.me/${SHOP_CONFIG.phone}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp from the booking form
  window.open(whatsappURL, "_blank");

  document.getElementById("bookingForm").reset();

  showToast("Booking message prepared!");
});

/* ==========================================
   MOBILE NAVIGATION
========================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

  const isOpen = navLinks.classList.toggle("show");

  menuToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", () => {

    navLinks.classList.remove("show");

    menuToggle.setAttribute("aria-expanded", "false");
  });

});

/* ==========================================
   BOOKING DATE RESTRICTION
========================================== */

const bookingDate = document.getElementById("bookingDate");

const currentDate = new Date();

const localDate = new Date(
  currentDate.getTime() -
  currentDate.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

bookingDate.min = localDate;

/* ==========================================
   ESCAPE KEY
========================================== */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeCart();
    closeCheckout();

    navLinks.classList.remove("show");

    menuToggle.setAttribute("aria-expanded", "false");
  }

});

/* ==========================================
   FOOTER YEAR
========================================== */

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

/* ==========================================
   INITIALIZE WEBSITE
========================================== */

renderProducts();
renderCart();
