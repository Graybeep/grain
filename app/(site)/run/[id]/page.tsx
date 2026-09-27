import { Studio } from "../../../../components/Studio";

export default async function RunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ replay?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <Studio id={id} replayGolden={query.replay === "golden"} />;
}
