<?php
require_once 'stripe-config.php';

// Webhook secret - obtenerlo de Stripe Dashboard
// https://dashboard.stripe.com/webhooks
define('STRIPE_WEBHOOK_SECRET', 'whsec_TU_WEBHOOK_SECRET_AQUI');

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, STRIPE_WEBHOOK_SECRET
    );
    
    // Manejar el evento
    switch ($event->type) {
        case 'checkout.session.completed':
            $session = $event->data->object;
            
            // Log del evento
            $logData = [
                'event_type' => $event->type,
                'session_id' => $session->id,
                'customer_email' => $session->customer_details->email,
                'amount_total' => $session->amount_total,
                'date' => date('Y-m-d H:i:s'),
            ];
            
            file_put_contents(
                'webhook_log.json',
                json_encode($logData, JSON_PRETTY_PRINT) . "\n",
                FILE_APPEND
            );
            
            // Aquí puedes:
            // - Actualizar inventario
            // - Enviar email de confirmación
            // - Procesar el envío
            // - etc.
            
            break;
            
        case 'payment_intent.succeeded':
            $paymentIntent = $event->data->object;
            // Pago exitoso
            break;
            
        case 'payment_intent.payment_failed':
            $paymentIntent = $event->data->object;
            // Pago fallido
            break;
            
        default:
            error_log('Evento no manejado: ' . $event->type);
    }
    
    http_response_code(200);
    
} catch(\UnexpectedValueException $e) {
    http_response_code(400);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400);
    exit();
}
?>