document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');

    // Ensure the loadCart function runs after the DOM is ready
    loadCart();

    // Attach event listener to the checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }
});

// Array to hold cart items (retrieved or initialized)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
console.log('Initial cart:', cart);

// Function to add an item to the cart
function addToCart(name, price) {
    const item = { name, price };
    cart.push(item);

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Debug: Log the cart to check if it's added properly
    console.log('Cart after adding item:', cart);

    alert(`${name} has been added to your cart!`);
}

// Function to load cart items into the cart page
function loadCart() {
    console.log('loadCart function is running...');
    const cartContainer = document.querySelector('.cart-container');
    const totalContainer = document.querySelector('.cart-total');
    const proceedBtn = document.querySelector('.proceed-btn');

    // Debug: Log the cart content being loaded
    console.log('Loading cart items:', cart);

    if (!cartContainer || !totalContainer || !proceedBtn) {
        console.error('Cart elements not found in the DOM.');
        return;
    }

    // Clear previous content
    cartContainer.innerHTML = '';
    let total = 0;

    // Check if cart is empty
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty!</p>';
        totalContainer.textContent = 'Total: ₹0.00';
        proceedBtn.style.display = 'none';
        return;
    }

    // Loop through cart items and display them
    cart.forEach((item, index) => {
        console.log(`Adding item: ${item.name}, ₹${item.price}`);
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <p>${item.name} - ₹${item.price.toFixed(2)}</p>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartContainer.appendChild(cartItem);
        total += item.price;
    });

    // Update total and show proceed button
    totalContainer.textContent = `Total: ₹${total.toFixed(2)}`;
    proceedBtn.style.display = cart.length ? 'block' : 'none';
}

// Function to remove an item from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

// Function to place the order and show a success message
function placeOrder(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Gather form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;

    const cartItems = JSON.stringify(cart);
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    // Create an object to hold order details
    const orderDetails = {
        name,
        email,
        phone,
        address,
        pincode,
        cartItems,
        totalPrice
    };

    // Redirect to the view orders page with order details as query parameters
    window.location.href = `/view_orders?order_details=${encodeURIComponent(JSON.stringify(orderDetails))}`;
}
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! Please add items before proceeding.');
        return;
    }

    // Redirect to the checkout page
    window.location.href = '/checkout';
}

// Terms and Conditions Modal Functionality
const termsPopup = document.getElementById('terms-popup');
const termsLink = document.getElementById('terms-link');
const closeBtn = document.getElementsByClassName('close-btn')[0];

if (termsLink) {
    termsLink.onclick = function (event) {
        event.preventDefault(); // Prevent the default link behavior
        termsPopup.style.display = 'block'; // Show the modal
    };
}

if (closeBtn) {
    closeBtn.onclick = function () {
        termsPopup.style.display = 'none'; // Hide the modal
    };
}

window.onclick = function (event) {
    if (event.target == termsPopup) {
        termsPopup.style.display = 'none'; // Hide the modal
    }
};
