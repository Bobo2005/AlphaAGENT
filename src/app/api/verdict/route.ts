import { x402Service } from '../../../services/x402Service';

/**
 * Next.js App Router API Route for Machine-to-Machine Paid Verdicts (x402 Protocol):
 * GET /api/verdict?forecaster=0x...&category=NBA
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forecaster = searchParams.get('forecaster');
    const category = searchParams.get('category') || 'NBA';

    if (!forecaster) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query parameter "forecaster" (Sui address) is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Inspect incoming headers for Sui payment transaction digest
    const paymentDigest =
      req.headers.get('x-payment-digest') ||
      req.headers.get('x-payment-tx-digest') ||
      searchParams.get('paymentDigest');

    const invoiceNonce = req.headers.get('x-invoice-nonce') || searchParams.get('nonce') || undefined;

    // 2. Unpaid Query -> Respond with HTTP 402 Payment Required
    if (!paymentDigest) {
      const invoice = x402Service.createInvoice(forecaster, category);

      return new Response(JSON.stringify(invoice), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Protocol': 'x402/sui-v1',
          'X-Payment-Recipient': invoice.recipientTreasuryAddress,
          'X-Payment-Amount': invoice.amountMist,
          'X-Payment-Token': 'SUI',
          'X-Invoice-Nonce': invoice.nonce,
        },
      });
    }

    // 3. Paid Query -> Verify Payment Transaction on Sui Testnet
    const verification = await x402Service.verifyPayment(paymentDigest, invoiceNonce);

    if (!verification.verified) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment verification failed',
          reason: verification.reason,
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Release Paid Cryptographic Verdict Bundle
    const verdictPayload = await x402Service.generatePaidVerdict(
      forecaster,
      category,
      paymentDigest,
      verification.invoice?.nonce || 'settled_invoice'
    );

    return new Response(JSON.stringify(verdictPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Status': 'SETTLED',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error processing x402 verdict' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

