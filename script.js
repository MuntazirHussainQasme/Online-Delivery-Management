// Application state
const appState = {
    orders: {
        urgent: [],
        normal: [],
        processed: []
    },
    nextId: 1,
    stats: {
        todayProcessed: 0,
        totalProcessed: 0
    }
};

// DOM Elements
const domElements = {
    // Navigation
    navLinks: null,
    mobileMenuBtn: null,
    mainNav: null,
    
    // Dashboard
    urgentCount: null,
    normalCount: null,
    processedCount: null,
    totalPending: null,
    
    // Form elements
    itemName: null,
    customerName: null,
    address: null,
    priority: null,
    priorityValue: null,
    
    // Buttons
    newOrderBtn: null,
    processNextBtn: null,
    addNormalBtn: null,
    addUrgentBtn: null,
    backToDashboardBtns: null,
    
    // Containers
    pendingOrdersContainer: null,
    allOrdersContainer: null,
    processedOrdersContainer: null,
    
    // Charts
    orderChart: null,
    trendChart: null
};

// Chart instances
let orderChartInstance, trendChartInstance;

// Initialize the app
function initApp() {
    cacheDomElements();
    loadAppState();
    setupEventListeners();
    updateAllDisplays();
    initializeCharts();
    
    // Load demo data on first run (optional)
    if (appState.orders.urgent.length === 0 && 
        appState.orders.normal.length === 0 && 
        appState.orders.processed.length === 0) {
        loadDemoData();
    }
}

// Cache DOM elements
function cacheDomElements() {
    // Navigation
    domElements.navLinks = document.querySelectorAll('.nav-link');
    domElements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    domElements.mainNav = document.getElementById('mainNav');
    
    // Stats
    domElements.urgentCount = document.getElementById('urgentCount');
    domElements.normalCount = document.getElementById('normalCount');
    domElements.processedCount = document.getElementById('processedCount');
    domElements.totalPending = document.getElementById('totalPending');
    
    // Form elements
    domElements.itemName = document.getElementById('itemName');
    domElements.customerName = document.getElementById('customerName');
    domElements.address = document.getElementById('address');
    domElements.priority = document.getElementById('priority');
    domElements.priorityValue = document.getElementById('priorityValue');
    
    // Buttons
    domElements.newOrderBtn = document.getElementById('newOrderBtn');
    domElements.processNextBtn = document.getElementById('processNextBtn');
    domElements.addNormalBtn = document.getElementById('addNormalBtn');
    domElements.addUrgentBtn = document.getElementById('addUrgentBtn');
    domElements.backToDashboardBtns = document.querySelectorAll('[id^="backToDashboardBtn"]');
    
    // Containers
    domElements.pendingOrdersContainer = document.getElementById('pendingOrdersContainer');
    domElements.allOrdersContainer = document.getElementById('allOrdersContainer');
    domElements.processedOrdersContainer = document.getElementById('processedOrdersContainer');
}

// Load data from localStorage
function loadAppState() {
    const savedState = localStorage.getItem('deliveryAppState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(appState, parsedState);
    }
}

// Save data to localStorage
function saveAppState() {
    localStorage.setItem('deliveryAppState', JSON.stringify(appState));
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    domElements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Mobile menu toggle
    domElements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                domElements.mainNav.classList.remove('active');
            }
        });
    });
    
    // Priority slider
    domElements.priority.addEventListener('input', updatePriorityValue);
    
    // Form submission
    domElements.addNormalBtn.addEventListener('click', addNormalOrder);
    domElements.addUrgentBtn.addEventListener('click', addUrgentOrder);
    domElements.processNextBtn.addEventListener('click', processNextOrder);
    domElements.newOrderBtn.addEventListener('click', () => switchPage('orders'));
    
    // Back to dashboard buttons
    domElements.backToDashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => switchPage('dashboard'));
    });
    
    // Allow Enter key to submit forms
    domElements.itemName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNormalOrder();
    });
}

// Event handlers
function handleNavClick(e) {
    e.preventDefault();
    const pageId = this.getAttribute('data-page');
    switchPage(pageId);
    
    // Update active nav link
    domElements.navLinks.forEach(l => l.classList.remove('active'));
    this.classList.add('active');
}

function toggleMobileMenu() {
    domElements.mainNav.classList.toggle('active');
}

function updatePriorityValue() {
    domElements.priorityValue.textContent = this.value;
}

// Switch between pages
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update nav links
    domElements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Update charts on analytics page
    if (pageId === 'analytics') {
        updateCharts();
    }
}

// Add a normal priority order
function addNormalOrder() {
    const itemName = domElements.itemName.value.trim();
    const customerName = domElements.customerName.value.trim();
    const address = domElements.address.value.trim();
    
    if (!itemName || !customerName || !address) {
        showNotification('Please fill in all order details', 'warning');
        return;
    }
    
    const order = {
        id: appState.nextId++,
        item: itemName,
        customer: customerName,
        address: address,
        priority: 0,
        type: 'normal',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    appState.orders.normal.push(order);
    
    // Clear form
    clearForm();
    
    // Update UI and save
    updateAllDisplays();
    saveAppState();
    
    // Show confirmation
    showNotification(`Normal order #${order.id} added successfully!`, 'success');
}

// Add an urgent order
function addUrgentOrder() {
    const itemName = domElements.itemName.value.trim();
    const customerName = domElements.customerName.value.trim();
    const address = domElements.address.value.trim();
    const priority = parseInt(domElements.priority.value);
    
    if (!itemName || !customerName || !address) {
        showNotification('Please fill in all order details', 'warning');
        return;
    }
    
    const order = {
        id: appState.nextId++,
        item: itemName,
        customer: customerName,
        address: address,
        priority: priority,
        type: 'urgent',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    appState.orders.urgent.push(order);
    // Sort urgent orders by priority (highest first)
    appState.orders.urgent.sort((a, b) => b.priority - a.priority);
    
    // Clear form
    clearForm();
    
    // Update UI and save
    updateAllDisplays();
    saveAppState();
    
    // Show confirmation
    showNotification(`Urgent order #${order.id} added with priority ${priority}!`, 'success');
}

// Process the next order (urgent first, then normal)
function processNextOrder() {
    let order;
    let orderType;
    
    // Check for urgent orders first
    if (appState.orders.urgent.length > 0) {
        order = appState.orders.urgent.shift();
        orderType = 'urgent';
    } 
    // Then check for normal orders
    else if (appState.orders.normal.length > 0) {
        order = appState.orders.normal.shift();
        orderType = 'normal';
    } 
    // No orders to process
    else {
        showNotification('No orders to process!', 'warning');
        return;
    }
    
    // Mark as processed
    order.processedAt = new Date().toISOString();
    order.processedBy = 'John Driver';
    appState.orders.processed.push(order);
    
    // Update stats
    appState.stats.todayProcessed++;
    appState.stats.totalProcessed++;
    
    // Update UI and save
    updateAllDisplays();
    saveAppState();
    
    // Show notification
    showNotification(`Processed ${orderType} order #${order.id}: ${order.item}`, 'success');
}

// Process a specific order by ID
function processOrder(orderId) {
    // Search in urgent orders
    let orderIndex = appState.orders.urgent.findIndex(order => order.id === orderId);
    let orderType = 'urgent';
    
    if (orderIndex === -1) {
        // Search in normal orders
        orderIndex = appState.orders.normal.findIndex(order => order.id === orderId);
        orderType = 'normal';
    }
    
    if (orderIndex === -1) {
        showNotification('Order not found!', 'warning');
        return;
    }
    
    // Remove from pending and add to processed
    const order = orderType === 'urgent' 
        ? appState.orders.urgent.splice(orderIndex, 1)[0]
        : appState.orders.normal.splice(orderIndex, 1)[0];
    
    // Mark as processed
    order.processedAt = new Date().toISOString();
    order.processedBy = 'John Driver';
    appState.orders.processed.push(order);
    
    // Update stats
    appState.stats.todayProcessed++;
    appState.stats.totalProcessed++;
    
    // Update UI and save
    updateAllDisplays();
    saveAppState();
    
    // Show notification
    showNotification(`Processed ${orderType} order #${order.id}: ${order.item}`, 'success');
}

// Cancel/delete an order
function cancelOrder(orderId) {
    // Search in urgent orders
    let orderIndex = appState.orders.urgent.findIndex(order => order.id === orderId);
    let orderType = 'urgent';
    
    if (orderIndex === -1) {
        // Search in normal orders
        orderIndex = appState.orders.normal.findIndex(order => order.id === orderId);
        orderType = 'normal';
    }
    
    if (orderIndex === -1) {
        showNotification('Order not found!', 'warning');
        return;
    }
    
    // Remove from pending
    const order = orderType === 'urgent' 
        ? appState.orders.urgent.splice(orderIndex, 1)[0]
        : appState.orders.normal.splice(orderIndex, 1)[0];
    
    // Update UI and save
    updateAllDisplays();
    saveAppState();
    
    // Show notification
    showNotification(`Cancelled ${orderType} order #${order.id}: ${order.item}`, 'warning');
}

// Clear form fields
function clearForm() {
    domElements.itemName.value = '';
    domElements.customerName.value = '';
    domElements.address.value = '';
    domElements.priority.value = '5';
    domElements.priorityValue.textContent = '5';
}

// Update all displays
function updateAllDisplays() {
    updateStats();
    renderPendingOrders();
    renderAllOrders();
    renderProcessedOrders();
}

// Update statistics
function updateStats() {
    domElements.urgentCount.textContent = appState.orders.urgent.length;
    domElements.normalCount.textContent = appState.orders.normal.length;
    domElements.processedCount.textContent = appState.stats.todayProcessed;
    domElements.totalPending.textContent = appState.orders.urgent.length + appState.orders.normal.length;
}

// Render pending orders for dashboard
function renderPendingOrders() {
    const container = domElements.pendingOrdersContainer;
    
    // Combine urgent and normal orders
    const allPending = [
        ...appState.orders.urgent.map(order => ({...order, isUrgent: true})),
        ...appState.orders.normal.map(order => ({...order, isUrgent: false}))
    ];
    
    if (allPending.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No pending orders</h3>
                <p>Add orders using the form on the left</p>
            </div>
        `;
        return;
    }
    
    // Sort by urgency and timestamp
    allPending.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    // Render first 5 orders only for dashboard
    const ordersToShow = allPending.slice(0, 5);
    
    container.innerHTML = ordersToShow.map(order => `
        <div class="order-item ${order.isUrgent ? 'urgent' : ''}">
            <div class="order-info">
                <h4>${order.item}</h4>
                <div class="order-meta">
                    <span><i class="fas fa-user"></i> ${order.customer}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${order.address.substring(0, 20)}...</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(order.timestamp)}</span>
                    ${order.isUrgent ? `<span class="priority-badge">P:${order.priority}</span>` : ''}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary" onclick="processOrder(${order.id})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Show "more orders" indicator if there are more than 5
    if (allPending.length > 5) {
        container.innerHTML += `
            <div style="text-align: center; padding: 1rem; color: var(--gray);">
                <i class="fas fa-ellipsis-h"></i> ${allPending.length - 5} more orders pending
            </div>
        `;
    }
}

// Render all orders for orders page
function renderAllOrders() {
    const container = domElements.allOrdersContainer;
    
    // Combine urgent and normal orders
    const allPending = [
        ...appState.orders.urgent.map(order => ({...order, isUrgent: true})),
        ...appState.orders.normal.map(order => ({...order, isUrgent: false}))
    ];
    
    if (allPending.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No pending orders</h3>
                <p>Add orders from the dashboard</p>
            </div>
        `;
        return;
    }
    
    // Sort by urgency and timestamp
    allPending.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        if (a.isUrgent && b.isUrgent) return b.priority - a.priority;
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    container.innerHTML = allPending.map(order => `
        <div class="order-item ${order.isUrgent ? 'urgent' : ''}">
            <div class="order-info">
                <h4>${order.item} <span style="font-size: 0.8rem; color: var(--gray);">#${order.id}</span></h4>
                <div class="order-meta">
                    <span><i class="fas fa-user"></i> ${order.customer}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${order.address}</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(order.timestamp)}</span>
                    ${order.isUrgent ? `<span class="priority-badge">Priority: ${order.priority}</span>` : ''}
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary" onclick="processOrder(${order.id})">
                    <i class="fas fa-check"></i> Process
                </button>
                <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `).join('');
}

// Render processed orders for history page
function renderProcessedOrders() {
    const container = domElements.processedOrdersContainer;
    
    if (appState.orders.processed.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No order history yet</h3>
                <p>Process some orders to see history here</p>
            </div>
        `;
        return;
    }
    
    // Sort by processing time (newest first)
    const processedSorted = [...appState.orders.processed].sort(
        (a, b) => new Date(b.processedAt) - new Date(a.processedAt)
    );
    
    container.innerHTML = processedSorted.map(order => `
        <div class="history-item">
            <div class="order-info">
                <h4>${order.item} <span style="font-size: 0.8rem; color: var(--gray);">#${order.id}</span></h4>
                <div class="order-meta">
                    <span><i class="fas fa-user"></i> ${order.customer}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${order.address.substring(0, 30)}...</span>
                    <span><i class="fas fa-clock"></i> ${formatTime(order.processedAt)}</span>
                    <span style="color: ${order.type === 'urgent' ? 'var(--danger)' : 'var(--primary)'};">
                        <i class="fas fa-${order.type === 'urgent' ? 'fire' : 'clock'}"></i> ${order.type === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                </div>
            </div>
            <div style="color: var(--success); font-weight: 600;">
                <i class="fas fa-check-circle"></i> Processed
            </div>
        </div>
    `).join('');
}

// Chart.js initialization
function initializeCharts() {
    const ctx1 = document.getElementById('orderChart').getContext('2d');
    orderChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Urgent Orders', 'Normal Orders', 'Processed Today'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(247, 37, 133, 0.8)',
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(76, 201, 240, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    const ctx2 = document.getElementById('trendChart').getContext('2d');
    trendChartInstance = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Orders Processed',
                    data: [12, 19, 8, 15, 22, 18, 25],
                    borderColor: 'rgba(67, 97, 238, 1)',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Orders Received',
                    data: [15, 22, 12, 18, 25, 20, 30],
                    borderColor: 'rgba(247, 37, 133, 1)',
                    backgroundColor: 'rgba(247, 37, 133, 0.1)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });
    
    updateCharts();
}

// Update charts with current data
function updateCharts() {
    if (orderChartInstance) {
        orderChartInstance.data.datasets[0].data = [
            appState.orders.urgent.length,
            appState.orders.normal.length,
            appState.stats.todayProcessed
        ];
        orderChartInstance.update();
    }
    
    // For demo purposes, generate some random trend data
    if (trendChartInstance) {
        const baseProcessed = appState.stats.todayProcessed;
        trendChartInstance.data.datasets[0].data = [
            Math.max(5, baseProcessed - 15),
            Math.max(8, baseProcessed - 12),
            Math.max(6, baseProcessed - 10),
            Math.max(10, baseProcessed - 8),
            Math.max(12, baseProcessed - 5),
            Math.max(9, baseProcessed - 3),
            baseProcessed
        ];
        
        const baseReceived = appState.orders.urgent.length + appState.orders.normal.length + appState.stats.todayProcessed;
        trendChartInstance.data.datasets[1].data = [
            Math.max(8, baseReceived - 20),
            Math.max(12, baseReceived - 16),
            Math.max(9, baseReceived - 14),
            Math.max(14, baseReceived - 10),
            Math.max(16, baseReceived - 6),
            Math.max(13, baseReceived - 4),
            baseReceived
        ];
        
        trendChartInstance.update();
    }
}

// Helper function to format time
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Reset today's processed count (simulate daily reset)
function resetDailyStats() {
    appState.stats.todayProcessed = 0;
    updateStats();
    saveAppState();
    showNotification('Daily stats have been reset', 'info');
}

// Load demo data for first-time users
function loadDemoData() {
    // Add some demo orders
    const demoOrders = [
        { item: 'Laptop', customer: 'Sarah Johnson', address: '123 Main St, Apt 4B', priority: 9, type: 'urgent' },
        { item: 'Groceries', customer: 'Mike Chen', address: '456 Oak Ave', priority: 0, type: 'normal' },
        { item: 'Medicine', customer: 'Robert Davis', address: '789 Pine Rd', priority: 10, type: 'urgent' },
        { item: 'Books', customer: 'Emma Wilson', address: '321 Elm St', priority: 0, type: 'normal' },
        { item: 'Electronics', customer: 'David Lee', address: '654 Maple Dr', priority: 7, type: 'urgent' }
    ];
    
    demoOrders.forEach(orderData => {
        const order = {
            id: appState.nextId++,
            item: orderData.item,
            customer: orderData.customer,
            address: orderData.address,
            priority: orderData.priority,
            type: orderData.type,
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            status: 'pending'
        };
        
        if (orderData.type === 'urgent') {
            appState.orders.urgent.push(order);
        } else {
            appState.orders.normal.push(order);
        }
    });
    
    // Sort urgent orders
    appState.orders.urgent.sort((a, b) => b.priority - a.priority);
    
    // Add some processed orders for history
    const processedOrders = [
        { item: 'Phone Charger', customer: 'Lisa Brown', address: '555 Cedar Ln', priority: 0, type: 'normal' },
        { item: 'Documents', customer: 'James Miller', address: '777 Birch St', priority: 8, type: 'urgent' }
    ];
    
    processedOrders.forEach(orderData => {
        const order = {
            id: appState.nextId++,
            item: orderData.item,
            customer: orderData.customer,
            address: orderData.address,
            priority: orderData.priority,
            type: orderData.type,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            processedAt: new Date(Date.now() - 43200000).toISOString(),
            processedBy: 'John Driver',
            status: 'processed'
        };
        
        appState.orders.processed.push(order);
        appState.stats.todayProcessed++;
        appState.stats.totalProcessed++;
    });
    
    updateAllDisplays();
    saveAppState();
    showNotification('Demo data loaded successfully!', 'success');
}

// Export functions to global scope for onclick handlers
window.processOrder = processOrder;
window.cancelOrder = cancelOrder;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);