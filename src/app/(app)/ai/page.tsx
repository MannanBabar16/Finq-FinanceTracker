import { PageToolbar } from "@/components/layout/page-toolbar";
import { AiPageClient } from "@/components/ai/ai-page-client";
import { getAiData } from "@/lib/data";

export default async function AiPage({ searchParams }: { searchParams?: { session?: string } }) {
  const data = await getAiData(searchParams?.session);

  return (
    <div className="space-y-6">
      <PageToolbar />
      <AiPageClient initialSessions={data.sessions} initialMessages={data.messages} initialSessionId={data.activeSessionId} />
    </div>
  );
}
