import { InputField } from "@senler/ui";
import type { IEvent } from "@services/events/events.types";

interface SubscriberGroupsSectionProps {
  event: IEvent;
  channelExternalId?: string;
}

export const SubscriberGroupsSection = ({ event, channelExternalId }: SubscriberGroupsSectionProps) => {
  const baseUrl = `https://vk.com/app5898182_-${channelExternalId}`;

  return (
    <div className="space-y-4 border-t border-border pt-6">
      <h3 className="text-xl font-bold tracking-tight">Группы подписчиков</h3>

      <div className="flex items-center gap-3">
        <div
          className="size-10 shrink-0 rounded-full border-2 border-dashed border-border"
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium">Группа подписчиков в Senler для подачи заявки участие в событии</p>
          <p className="text-sm text-muted-foreground">ID: 2353</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для подачи заявки:</p>
          <InputField
            value={`${baseUrl}#s=${event.pendingSubscriptionId}&force=1`}
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для одобренных участников:</p>
          <InputField
            value={`${baseUrl}#s=${event.approvedSubscriptionId}&force=1`}
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Ссылка для вступления в группу для исключенных участников:</p>
          <InputField
            value={`${baseUrl}#s=${event.rejectedSubscriptionId}&force=1`}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
