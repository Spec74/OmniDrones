<?php

namespace App\Services;

use Exception;

class PaymentService
{
    /**
     * Simulate Mercado Pago authorization and ticket generation.
     * Complies with Mercado Pago API reference protocol.
     *
     * @param string $paymentMethod ('card', 'yape', 'plin')
     * @param float $totalAmount
     * @return array
     * @throws Exception
     */
    public function authorizeAndPreApprove(string $paymentMethod, float $totalAmount): array
    {
        // Enforce supported methods validation
        if (!in_array($paymentMethod, ['card', 'yape', 'plin'])) {
            throw new Exception("Método de pago '{$paymentMethod}' no es soportado por la pasarela Mercado Pago.");
        }

        // Simulate secure API roundtrip lag
        usleep(300000); // 300ms network delay to replicate real sandbox transaction

        $transactionId = 'MPX-' . strtoupper(bin2hex(random_bytes(6)));
        $paymentStatus = 'approved';

        return [
            'status' => 'success',
            'gateway' => 'Mercado Pago',
            'secure_hash' => hash_hmac('sha256', $transactionId, 'omni_secret_key_2026'),
            'transaction' => [
                'id' => $transactionId,
                'status' => $paymentStatus,
                'currency' => 'USD',
                'amount' => $totalAmount,
                'method' => $paymentMethod,
                'statement_descriptor' => 'OMNIDRONES_AERO_COMPRAS',
                'barcode_or_qr_payload' => ($paymentMethod !== 'card') ? "mercado_pago_qr_payload_{$transactionId}" : null,
                'approved_at' => now()->toIso8601String(),
            ],
            'sandbox_mode' => true,
        ];
    }
}
