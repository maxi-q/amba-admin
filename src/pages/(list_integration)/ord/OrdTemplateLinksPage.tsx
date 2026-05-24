import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import type { OrdTemplateLinkEntityType } from "@/hooks/ord/useOrdTemplateLinks";
import { OrdTemplateLinksSection } from "./components/OrdTemplateLinksSection";
import { ORD_COPY } from "./ord.constants";

const ENTITY_COPY: Record<OrdTemplateLinkEntityType, { title: string; description: string; backLabel: string }> = {
  room: {
    title: "ORD-шаблоны комнаты",
    description: "Выберите несколько шаблонов, которые должны применяться к этой комнате.",
    backLabel: "К настройкам комнаты",
  },
  event: {
    title: "ORD-шаблоны события",
    description: "Выберите несколько шаблонов, которые будут применяться к этому событию.",
    backLabel: "К настройкам события",
  },
  creativeTask: {
    title: "ORD-шаблоны задачи",
    description: "Выберите несколько шаблонов, которые будут применяться к этой творческой задаче.",
    backLabel: "К задаче",
  },
};

const isEntityType = (value: string | undefined): value is OrdTemplateLinkEntityType =>
  value === "room" || value === "event" || value === "creativeTask";

export default function OrdTemplateLinksPage() {
  const { slug, entityType, entityId } = useParams<{
    slug: string;
    entityType: string;
    entityId: string;
  }>();
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
          <AlertDescription>{(error as Error)?.message ?? ORD_COPY.roomNotFound}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isEntityType(entityType) || !entityId) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>Неверный тип привязки ORD-шаблонов</AlertDescription>
        </Alert>
      </div>
    );
  }

  const copy = ENTITY_COPY[entityType];
  const backPath =
    entityType === "room"
      ? `/rooms/${slug}/setting`
      : entityType === "event"
        ? `/rooms/${slug}/events/${entityId}`
        : `/rooms/${slug}/creativetasks/${entityId}`;

  return (
    <div className="w-full px-2 pb-6">
      <Link
        to={backPath}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {copy.backLabel}
      </Link>

      <OrdTemplateLinksSection
        roomId={room.id}
        entityId={entityId}
        entityType={entityType}
        title={copy.title}
        description={copy.description}
        disabled={entityType === "room" && !room.ordPerson}
      />
    </div>
  );
}
