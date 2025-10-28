<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data || !isset($data['items']) || !isset($data['total'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }
    
    $items = $data['items'];
    $total = $data['total'];
    
    // Validar y sanitizar datos
    $orderDetails = [];
    foreach ($items as $item) {
        $orderDetails[] = [
            'name' => htmlspecialchars($item['name']),
            'quantity' => intval($item['quantity']),
            'price' => floatval($item['price'])
        ];
    }
    
    // Generar número de pedido
    $orderNumber = 'ORD-' . date('YmdHis') . '-' . rand(1000, 9999);
    
    // Guardar pedido en archivo (o base de datos)
    $orderData = [
        'order_number' => $orderNumber,
        'date' => date('Y-m-d H:i:s'),
        'items' => $orderDetails,
        'total' => floatval($total)
    ];
    
    $ordersFile = 'orders.json';
    $orders = [];
    
    if (file_exists($ordersFile)) {
        $orders = json_decode(file_get_contents($ordersFile), true);
    }
    
    $orders[] = $orderData;
    file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT));
    
    // Enviar email (opcional)
    /*
    $to = 'tu@email.com';
    $subject = 'Nuevo pedido: ' . $orderNumber;
    $message = 'Detalles del pedido: ' . json_encode($orderData, JSON_PRETTY_PRINT);
    $headers = 'From: noreply@tutienda.com';
    
    mail($to, $subject, $message, $headers);
    */
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Pedido recibido correctamente',
        'order_number' => $orderNumber
    ]);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>