import { useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useGetBots } from "@/hooks/projects/useGetBots";
import { useUpdateRoom } from "@/hooks/rooms/useUpdateRoom";
import type { IBotItem } from "@services/projects/projects.types";
import type { IGetRoomByIdResponse } from "@services/rooms/rooms.types";

const NONE_VALUE = "__none__";

function filterBots(bots: IBotItem[], input: string): IBotItem[] {
  if (!input.trim()) return bots.slice(0, 40);
  const lower = input.toLowerCase().trim();
  return bots.filter(
    (bot) =>
      bot.title.toLowerCase().includes(lower) ||
      bot.bot_id.toLowerCase().includes(lower)
  );
}

function getOptionLabel(bot: IBotItem) {
  return `${bot.title} (${bot.bot_id})`;
}

interface BotPickerProps {
  legend: string;
  bots: IBotItem[];
  value: IBotItem | null;
  onChange: (next: IBotItem | null) => void;
  isLoading: boolean;
}

function BotPicker({ legend, bots, value, onChange, isLoading }: BotPickerProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const base = filterBots(bots, query);
    if (value && !base.some((b) => b.bot_id === value.bot_id)) {
      return [value, ...base];
    }
    return base;
  }, [bots, query, value]);

  return (
    <div className="grid max-w-md gap-2">
      <p className="text-sm font-medium text-muted-foreground">{legend}</p>
      <InputField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        placeholder="Поиск по названию или ID"
        aria-label={`Поиск: ${legend}`}
      />
      <Select
        value={value?.bot_id ?? NONE_VALUE}
        onValueChange={(id) =>
          onChange(id === NONE_VALUE ? null : bots.find((b) => b.bot_id === id) ?? null)
        }
        disabled={isLoading || !bots.length}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите бота" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>Не выбрано</SelectItem>
          {filtered.map((bot) => (
            <SelectItem key={bot.bot_id} value={bot.bot_id}>
              {getOptionLabel(bot)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SettingsBotsSectionProps {
  slug: string;
  room: IGetRoomByIdResponse | undefined;
  onSaveSuccess?: () => void;
}

export function SettingsBotsSection({
  slug,
  room,
  onSaveSuccess,
}: SettingsBotsSectionProps) {
  const { bots, isLoading: isLoadingBots } = useGetBots();
  const { updateRoom, isPending: isUpdating, generalError } = useUpdateRoom();

  const [approvedBot, setApprovedBot] = useState<IBotItem | null>(null);
  const [rejectedBot, setRejectedBot] = useState<IBotItem | null>(null);

  useEffect(() => {
    if (!room || !bots.length) return;
    const approvedId = room.notificationCreativeTaskApprovedBotId;
    const rejectedId = room.notificationCreativeTaskRejectedBotId;
    setApprovedBot(bots.find((b) => b.bot_id === approvedId) ?? null);
    setRejectedBot(bots.find((b) => b.bot_id === rejectedId) ?? null);
  }, [room, bots]);

  const handleSave = () => {
    updateRoom(
      {
        data: {
          notificationCreativeTaskApprovedBotId:
            approvedBot?.bot_id ?? undefined,
          notificationCreativeTaskRejectedBotId:
            rejectedBot?.bot_id ?? undefined,
        },
        id: slug,
      },
      {
        onSuccess: () => {
          toast.success("Настройки успешно сохранены");
          onSaveSuccess?.();
        },
      }
    );
  };

  return (
    <Card id="bots">
      <CardHeader>
        <CardTitle className="text-lg">Боты уведомлений</CardTitle>
        <CardDescription>
          Боты для уведомлений при одобрении и отклонении креативной задачи
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <BotPicker
          legend="Бот при одобрении креативной задачи"
          bots={bots}
          value={approvedBot}
          onChange={setApprovedBot}
          isLoading={isLoadingBots}
        />
        <BotPicker
          legend="Бот при отклонении креативной задачи"
          bots={bots}
          value={rejectedBot}
          onChange={setRejectedBot}
          isLoading={isLoadingBots}
        />

        {generalError ? (
          <Alert variant="destructive">
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          type="button"
          className="w-fit"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? "Сохранение…" : "Сохранить"}
        </Button>

        {!bots?.length && !isLoadingBots ? (
          <Alert>
            <AlertDescription>Нет доступных ботов для выбора.</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
