import { fetchScoreboard, EspnError } from '@/lib/espn/client';
import { initPoller } from '@/lib/poller';

export const dynamic = 'force-dynamic';

export async function GET() {
  initPoller();
  try {
    const matches = await fetchScoreboard();
    return Response.json({ matches });
  } catch (err) {
    if (err instanceof EspnError) {
      return Response.json({ matches: [], stale: true, error: err.message }, { status: 503 });
    }
    throw err;
  }
}
