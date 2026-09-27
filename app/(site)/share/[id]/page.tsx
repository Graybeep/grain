import { ShareLoader } from "../../../../components/ShareLoader";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShareLoader id={id} />;
}
