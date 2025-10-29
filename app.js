// app.js - Tienda de Tableros de Olivo

// === Configuración de precios por m² ===
const pricesPerM2 = {
    3: 900,
    5: 1200,
    7: 1500
};

// === Estado global ===
let cart = [];
let edges = {
    north: 'recto',
    east: 'recto',
    south: 'recto',
    west: 'recto'
};
let uso = 'tabletop';
let usoOtros = '';

// === Producto actual ===
const product = {
    name: 'Tablero de Madera de Olivo',
    basePrice: 99.99,
    image: 'product.jpg'
};

// === Paths SVG para cantos rústicos ===
const liveEdgePath = {
    north: "M30,50 Q50,40 70,50 T110,50 T150,50 T190,50 T210,50",
    east: "M210,50 Q220,70 210,90 T210,130",
    south: "M210,130 Q190,140 170,130 T130,130 T90,130 T50,130 T30,130",
    west: "M30,130 Q20,110 30,90 T30,50"
};

// === Service Worker ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.log('Error al registrar SW', err));
}

// === PWA Installation ===
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('Resultado instalación:', outcome);
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });
}

// === Actualizar visualización de cantos ===
function updateEdge(side) {
    const path = document.getElementById(`edge-${side}`);
    const value = document.querySelector(`input[name="edge-${side}"]:checked`)?.value;
    
    if (!path || !value) return;
    
    edges[side] = value;

    if (value === 'rustico') {
        path.setAttribute('d', liveEdgePath[side]);
        path.setAttribute('stroke', '#5D4037');
    } else {
        const straightPaths = {
            north: 'M30,50 H210',
            east: 'M210,50 V130',
            south: 'M210,130 H30',
            west: 'M30,130 V50'
        };
        path.setAttribute('d', straightPaths[side]);
        path.setAttribute('stroke', '#999');
    }
    
    updateEdgesSummary();
}

// === Resumen de cantos ===
function updateEdgesSummary() {
    const labels = {
        north: 'Trasero',
        east: 'Derecho',
        south: 'Frontal',
        west: 'Izquierdo'
    };
    
    const parts = Object.entries(edges).map(([key, val]) => {
        const edgeName = labels[key];
        const edgeValue = val === 'recto' ? 'Recto' : 'Rústico';
        return `${edgeName}: <strong>${edgeValue}</strong>`;
    });
    
    const el = document.getElementById('edgesSummary');
    if (el) {
        el.innerHTML = `Configuración de cantos: ${parts.join(', ')}`;
    }
}

// === Actualizar uso ===
function updateUsage() {
    const radios = document.querySelectorAll('input[name="uso"]');
    uso = 'tabletop';

    for (const radio of radios) {
        if (radio.checked) {
            uso = radio.value;
            break;
        }
    }

    const otroInput = document.getElementById('uso-otro-input');
    if (uso === 'other' && otroInput) {
        otroInput.style.display = 'block';
        usoOtros = otroInput.value.trim() || 'otro tablero de olivo macizo';
    } else if (otroInput) {
        otroInput.style.display = 'none';
    }

    updateUsageSummary();
}

// === Resumen de uso ===
function updateUsageSummary() {
    const usageLabels = {
        'tabletop': 'Encimera de mesa',
        'kitchen-countertop': 'Encimera de cocina',
        'kitchen-island': 'Isla de cocina',
        'bathroom-countertop': 'Encimera de baño',
        'shelf': 'Estante',
        'other': usoOtros || 'Otro'
    };
    
    const text = usageLabels[uso] || uso;
    const el = document.getElementById('usageSummary');
    if (el) {
        el.innerHTML = `Uso: <strong>${text}</strong>`;
    }
}

// === Calcular precio dinámico ===
function updatePrice() {
    const thickness = parseFloat(document.getElementById('thickness')?.value || 3);
    const length = parseFloat(document.getElementById('length')?.value || 80);
    const width = parseFloat(document.getElementById('width')?.value || 30);
    
    if (isNaN(thickness) || isNaN(length) || isNaN(width)) return;
    
    const area = (length / 100) * (width / 100); // Convertir cm a m²
    const price = (area * pricesPerM2[thickness]).toFixed(2);
    
    const priceDisplay = document.getElementById('priceDisplay');
    if (priceDisplay) {
        priceDisplay.textContent = price + ' €';
    }
    
    return parseFloat(price);
}

// === Botones +/- para dimensiones ===
function changeValue(id, delta) {
    const input = document.getElementById(id);
    if (!input) return;
    
    let value = parseInt(input.value) || parseInt(input.min);
    value += delta;
    value = Math.max(parseInt(input.min), Math.min(value, parseInt(input.max)));
    input.value = value;
    updatePrice();
}

// === Validar inputs ===
function validateInput(input) {
    let value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (isNaN(value) || value < min) input.value = min;
    else if (value > max) input.value = max;
    
    updatePrice();
}

// === Generar nombre del producto ===
function generateProductName() {
    const length = document.getElementById('length')?.value || 80;
    const width = document.getElementById('width')?.value || 30;
    const thickness = document.getElementById('thickness')?.value || 3;
    
    const edgeCode = ['north','east','south','west']
        .map(s => edges[s] === 'rustico' ? 's' : 'i')
        .join('');
    
    const edgeDescriptions = {
        'ssss': 'todos los cantos rústicos',
        'iiii': 'todos los cantos rectos',
        'sisi': 'cantos longitudinales rústicos | transversales rectos',
        'isis': 'cantos longitudinales rectos | transversales rústicos'
    };
    
    const edgesText = edgeDescriptions[edgeCode] || 'configuración personalizada';
    
    const skuPrefix = {
        'tabletop': '31',
        'kitchen-countertop': '32',
        'kitchen-island': '33',
        'bathroom-countertop': '34',
        'shelf': '35',
        'other': '36'
    };
    
    const prefix = skuPrefix[uso] || '36';
    
    const usageLabels = {
        'tabletop': 'Encimera de mesa',
        'kitchen-countertop': 'Encimera de cocina',
        'kitchen-island': 'Isla de cocina',
        'bathroom-countertop': 'Encimera de baño',
        'shelf': 'Estante',
        'other': usoOtros || 'Otro tablero'
    };
    
    const usoText = usageLabels[uso];
    
    return `${prefix}-${edgeCode}. ${usoText} ${length}x${width}x${thickness} cm, ${edgesText}`;
}

// === Añadir al carrito ===
function addToCart() {
    const price = updatePrice();
    
    if (isNaN(price) || price <= 0) {
        alert('Por favor, verifica las dimensiones del producto.');
        return;
    }
    
    const productName = generateProductName();
    
    const item = {
        name: productName,
        price: price,
        quantity: 1,
        id: Date.now(),
        thickness: document.getElementById('thickness')?.value || 3,
        length: document.getElementById('length')?.value || 80,
        width: document.getElementById('width')?.value || 30,
        edges: { ...edges },
        uso: uso,
        usoOtros: usoOtros
    };
    
    cart.push(item);
    updateCartDisplay();
    alert('✅ Producto añadido al carrito: ' + productName);
}

// === Eliminar del carrito ===
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
};

// === Actualizar visualización del carrito ===
function updateCartDisplay() {
    const cartCount = document.querySelector('#cartCount span');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkout');
    
    let total = 0;
    let itemCount = 0;
    
    if (cartItems) {
        cartItems.innerHTML = '';
        
        cart.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemCount += item.quantity;
            
            const div = document.createElement('div');
            div.innerHTML = `
                <p>
                    ${item.name}<br>
                    <span style="padding-left:3%;">${itemTotal.toFixed(2)} €</span>
                    <button onclick="removeFromCart(${item.id})">🗑️ Eliminar</button>
                </p>
            `;
            cartItems.appendChild(div);
        });
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Tu carrito está vacío.</p>';
        }
    }
    
    if (cartCount) {
        cartCount.textContent = itemCount;
    }
    
    if (totalPrice) {
        totalPrice.innerHTML = `<strong>Total: €${total.toFixed(2)}</strong>`;
    }
    
    // Habilitar/deshabilitar botón de pago
    if (checkoutBtn) {
        checkoutBtn.disabled = total < 175;
    }
}

// === Vaciar carrito ===
function clearCart() {
    if (confirm('¿Vaciar el carrito?')) {
        cart = [];
        updateCartDisplay();
    }
}

// === Proceso de pago con Stripe ===
async function checkout() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    if (total < 175) {
        alert('El pedido mínimo es de 175 €.');
        return;
    }
    
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Procesando... ⏳';
    }
    
    const orderData = {
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total
    };
    
    console.log('Enviando datos al servidor:', orderData);
    
    try {
        const response = await fetch('create-checkout-session.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('Respuesta del servidor:', response);
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.error) {
            alert('Error: ' + data.error);
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceder al Pago';
            }
            return;
        }
        
        // Redirigir a Stripe Checkout
        const stripe = Stripe(data.publishableKey);
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        
        if (result.error) {
            alert(result.error.message);
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceder al Pago';
            }
        }
    } catch (error) {
        console.error('Error completo:', error);
        alert('Error al procesar el pago. Revisa la consola (F12)');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Proceder al Pago';
        }
    }
}

// === Inicialización ===
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar visualizaciones
    updatePrice();
    updateEdgesSummary();
    updateUsage();
    updateUsageSummary();
    updateCartDisplay();
    
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    
    // Event listeners para dimensiones
    ['thickness', 'length', 'width'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePrice);
            el.addEventListener('change', updatePrice);
        }
    });
    
    // Event listener para uso
    document.querySelectorAll('input[name="uso"]').forEach(radio => {
        radio.addEventListener('change', updateUsage);
    });
    
    const usoOtroInput = document.getElementById('uso-otro-input');
    if (usoOtroInput) {
        usoOtroInput.addEventListener('input', updateUsage);
    }
    
    // Botón añadir al carrito
    const addBtn = document.getElementById('addToCart');
    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart();
        });
    }
    
    // Botón vaciar carrito
    const clearBtn = document.getElementById('clearCart');
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearCart();
        });
    }
    
    // Botón checkout
    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkout();
        });
    }
});

// Exportar funciones globales necesarias
window.updateEdge = updateEdge;
window.changeValue = changeValue;
window.validateInput = validateInput;
