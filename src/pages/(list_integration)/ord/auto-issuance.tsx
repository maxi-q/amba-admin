import { useParams } from "react-router-dom";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { OrdIssuanceRuleEditor } from "./components/OrdIssuanceRuleEditor";
import { ORD_COPY } from "./ord.constants";

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function OrdAutoIssuancePage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading, isError, error } = useGetRoomById(slug ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(error, ORD_COPY.roomNotFound)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <OrdIssuanceRuleEditor
        scope={{ type: "room", roomId: room.id }}
        roomSlug={slug ?? ""}
        hasOrdProfile={!!room.ordPerson}
        title={ORD_COPY.autoIssuanceTitle}
        description="Один шаблон и правило автовыпуска ORD-договоров для всех одобренных участников комнаты."
        backTo={`/rooms/${slug}/ord`}
        backLabel="К договорам ОРД"
      />
    </div>
  );
}
