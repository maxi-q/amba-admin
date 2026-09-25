import { InputField } from "@senler/ui";
import type { GetMyEventsResponseItemDto } from "@/api/generated/model";
import { getSenlerSubscriptionUrl } from "@/utils/projectLinks";

type EventWithSubscriptionGroups = GetMyEventsResponseItemDto & {
  pendingSubscriptionId?: number;
  approvedSubscriptionId?: number;
  rejectedSubscriptionId?: number;
};

interface SubscriberGroupsSectionProps {
  event: EventWithSubscriptionGroups;
  channelExternalId?: string | null;
}

export const SubscriberGroupsSection = ({ event, channelExternalId }: SubscriberGroupsSectionProps) => {
  if (!channelExternalId) {
    return <p className="text-sm text-muted-foreground">Ссылки на группы подписчиков доступны только для проекта Senler.ru с подключённым VK-сообществом.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold tracking-tight">Группы подписчиков</h3>

      <div className="flex items-center gap-3">
        <div
          className="size-10 shrink-0 rounded-full border-2 border-dashed border-border"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium">Группа подписчиков в Senler для подачи заявки участие в событии</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для подачи заявки:</p>
          <InputField
            value={getSenlerSubscriptionUrl(channelExternalId, event.pendingSubscriptionId)}
            placeholder="Ссылка недоступна"
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для одобренных участников:</p>
          <InputField
            value={getSenlerSubscriptionUrl(channelExternalId, event.approvedSubscriptionId)}
            placeholder="Ссылка недоступна"
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для исключенных участников:</p>
          <InputField
            value={getSenlerSubscriptionUrl(channelExternalId, event.rejectedSubscriptionId)}
            placeholder="Ссылка недоступна"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
