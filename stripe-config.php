<?php
// Descargar Stripe PHP Library desde: https://github.com/stripe/stripe-php/releases
// O instalar con Composer: composer require stripe/stripe-php
require_once 'stripe-php/init.php';

// ⚠️ IMPORTANTE: Reemplaza estas claves con las tuyas de Stripe Dashboard
// https://dashboard.stripe.com/apikeys

// Clave secreta (NUNCA la expongas en el frontend)
define('STRIPE_SECRET_KEY', 'sk_test_51S6EIpEKnTcZwfwYI79DEJigKAepTH0EwnRvlF2y33JiLJA00ApFEUSvBhjSDhkKyONYXVeyHNRs01HrNFWGXjCz00kmlluTqM');

// Clave pública (sí se puede exponer)
define('STRIPE_PUBLISHABLE_KEY', 'pk_test_51S6EIpEKnTcZwfwY4sD8Ic8iW1PP5w95N4TWKINFpNLaEzgZZAolFO6VQYNg9vqYYyCodsScXkZGKx7rPnnFcNj000nByIfFSS');

// Tu dominio
define('YOUR_DOMAIN', 'https://yevea.com/300');

// Configurar Stripe con la clave secreta
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
?>