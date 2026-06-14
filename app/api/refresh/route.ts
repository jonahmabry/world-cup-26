import { runPipeline } from '@/lib/pipeline';
import { initPoller } from '@/lib/poller';

export const dynamic = 'force-dynamic';

export async function POST() {
  initPoller();
  const snapshot = await runPipeline();
  return Response.json(snapshot);
}
