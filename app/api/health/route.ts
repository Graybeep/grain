// Liveness probe for the always-on status page (GitHub Pages), which lives on another origin.
export const dynamic = "force-dynamic";

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" };

export function GET() {
  return Response.json({ ok: true, time: new Date().toISOString() }, { headers: CORS });
}
