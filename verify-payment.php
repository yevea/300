<?php
require_once 'stripe-config.php';

header('Content-Type: application/json');

try {
    if (!isset($_GET['session_id'])) {
        throw new Exception('Session ID no proporcionado');
    }
    
    $session_id = $_GET['session_id'];
    
    // Recuperar la sesión de Stripe
    $checkout_session = \Stripe\Checkout\Session::retrieve($session_id);
    
    // Verificar que el pago fue exitoso
    if ($checkout_session->payment_status === 'paid') {
        
        // Guardar pedido en base de datos o archivo
        $orderData = [
            'session_id' => $session_id,
            'customer_email' => $checkout_session->customer_details->email,
            'amount_total' => $checkout_session->amount_total,
            'currency' => $checkout_session->currency,
            'payment_status' => $checkout_session->payment_status,
            'date' => date('Y-m-d H:i:s'),
        ];
        
        // Guardar en archivo JSON (o base de datos)
        $ordersFile = 'orders.json';
        $orders = [];
        
        if (file_exists($ordersFile)) {
            $orders = json_decode(file_get_contents($ordersFile), true);
        }
        
        $orders[] = $orderData;
        file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'customer_email' => $checkout_session->customer_details->email,
            'amount_total' => $checkout_session->amount_total,
            'payment_status' => $checkout_session->payment_status,
        ]);
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Pago no completado',
            'payment_status' => $checkout_session->payment_status,
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>