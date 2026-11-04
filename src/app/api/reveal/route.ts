import { revealService, RevealPayload } from '../../../services/revealService';

/**
 * Next.js App Router API Route for Pick Reveal:
 * POST /api/reveal
 */
export async function POST(req: Request) {
  try {
    const body: RevealPayload = await req.json();

    if (!body.eventId || !body.side || !body.probability || !body.salt || !body.commitTxDigest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters: eventId, side, probability, salt, commitTxDigest, gameStartTimeTs',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validation = await revealService.validateAndAcceptReveal(body);

    if (!validation.success) {
      return new Response(JSON.stringify(validation), {
        status: validation.status === 'LATE' ? 422 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(validation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal error processing reveal',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

