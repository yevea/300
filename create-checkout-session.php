<?php
require_once 'stripe-config.php';

header('Content-Type: application/json');

try {
    // Obtener datos del carrito
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data || !isset($data['items'])) {
        throw new Exception('Datos inválidos');
    }
    
    // Preparar items para Stripe
    $line_items = [];
    
    foreach ($data['items'] as $item) {
        $line_items[] = [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => [
                    'name' => $item['name'],
                ],
                'unit_amount' => intval($item['price'] * 100), // Stripe usa centavos
            ],
            'quantity' => $item['quantity'],
        ];
    }
    
    // Crear sesión de Checkout
    $checkout_session = \Stripe\Checkout\Session::create([
        'payment_method_types' => ['card'],
        'line_items' => $line_items,
        'mode' => 'payment',
        'success_url' => YOUR_DOMAIN . '/success.html?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => YOUR_DOMAIN . '/index.html',
        'billing_address_collection' => 'required',
        'shipping_address_collection' => [
            'allowed_countries' => ['ES', 'FR', 'DE', 'IT', 'PT'],
        ],
    ]);
    
    echo json_encode([
        'sessionId' => $checkout_session->id,
        'publishableKey' => STRIPE_PUBLISHABLE_KEY
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>