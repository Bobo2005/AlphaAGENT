import { auditService } from '../../../services/auditService';

/**
 * Next.js App Router API Route for Completeness Audit:
 * GET /api/audit?forecaster=0x...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forecaster = searchParams.get('forecaster');

    if (!forecaster) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query parameter "forecaster" (Sui address) is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const report = await auditService.reconcileForecaster(forecaster);

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Audit reconciliation failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

