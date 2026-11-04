import { judgeModeService } from '../../../services/judgeModeService';

/**
 * Next.js App Router API Route for 1-Click Judge Mode:
 * POST /api/judge-mode
 */
export async function POST(req: Request) {
  try {
    const session = await judgeModeService.provisionGuestWallet();

    // Construct HTTP response with secure cookies
    const responseBody = {
      success: true,
      sessionId: session.sessionId,
      address: session.address,
      balanceSui: session.balanceSui,
      expiresAt: session.expiresAt,
      isSimulatedFaucet: session.isSimulatedFaucet,
    };

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `alpha_judge_session=${session.sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200`,
    });

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to provision guest wallet',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req: Request) {
  // Extract session ID from cookie or authorization header
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/alpha_judge_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (!sessionId) {
    return new Response(
      JSON.stringify({ authenticated: false, message: 'No active judge session' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const session = judgeModeService.getSession(sessionId);
  if (!session) {
    return new Response(
      JSON.stringify({ authenticated: false, message: 'Judge session expired or invalid' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      address: session.address,
      balanceSui: session.balanceSui,
      expiresAt: session.expiresAt,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

