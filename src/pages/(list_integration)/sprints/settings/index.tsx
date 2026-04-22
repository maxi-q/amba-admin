import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription, PageLoader } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useSprints } from "@/hooks/sprints/useSprints";
import { useGetProject } from "@/hooks/projects/useGetProject";
import { SprintSettingsHeader } from "./components/SprintSettingsHeader";
import { SubscriberGroupCard } from "./components/SubscriberGroupCard";
import { SprintSettingsErrorState } from "./components/SprintSettingsErrorState";

export default function SprintSettingsPage() {
  const { slug } = useParams();

  const {
    room,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
  } = useGetRoomById(slug || "");

  const {
    sprints,
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    error: sprintsError,
  } = useSprints({ page: 1, size: 100 }, slug || "");

  const {
    project,
    isLoading: isLoadingProject,
    isError: isProjectError,
    error: projectError,
  } = useGetProject();

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Скопировано");
    } catch (error) {
      console.error("Ошибка при копировании:", error);
      toast.error("Не удалось скопировать ссылку");
    }
  };

  if (isLoadingRoom || isLoadingSprints || isLoadingProject) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomError || isSprintsError || isProjectError) {
    return (
      <SprintSettingsErrorState
        roomError={roomError?.message}
        sprintsError={sprintsError?.message}
        projectError={projectError?.message}
      />
    );
  }

  if (!room || !project) {
    return (
      <div className="w-full px-4 py-6">
        {!room ? (
          <Alert className="mb-2">
            <AlertDescription>Данные комнаты не найдены</AlertDescription>
          </Alert>
        ) : null}
        {!project ? (
          <Alert>
            <AlertDescription>Данные проекта не найдены</AlertDescription>
          </Alert>
        ) : null}
      </div>
    );
  }

  const groups = [
    {
      id: 1,
      title: "Группа подписчиков в Senler для подачи заявки в амбассадорку",
      name: "Заявки амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${room.pendingSubscriptionId}&force=1`,
      instructions: [
        "Отправить прямую ссылку на группу подписчиков:",
        "Сделать рассылку через бота с предложением об участии и кнопкой \"Принять\" (при нажатии на которую вызвать действие добавления в группу)",
        "Самостоятельно добавить участников в группу подписчиков в кабинете Senler",
        "И так далее. Варианты ограничиваются только вашей фантазией…",
      ],
    },
    {
      id: 2,
      title: "Группа подписчиков в Senler для одобренных амбассадоров",
      name: "Одобренные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${room.approvedSubscriptionId}&force=1`,
      instructions: [
        "Добавляйте в данную группу одобренных амбассадоров, чтобы они смогли принять участие.",
        "Если вы хотите принимать без амбассадоров без процесса одобрения, организуйте подписку на данную группу минуя группу с заявками.",
        "Прямая ссылка на вступление в данную группу минуя процесс одобрения:",
      ],
    },
    {
      id: 3,
      title: "Группа подписчиков в Senler для исключенных амбассадоров",
      name: "Исключенные амбассадоры: Конференция суровый маркетинг 2025",
      senlerId: 123456,
      link: `https://vk.com/app5898182_-${project?.channelExternalId}#s=${room.rejectedSubscriptionId}&force=1`,
      instructions: [
        "В данной группе можно сохранять исключенных амбассадоров, чтобы автоматически отключать их участие в комнате.",
        "Вступление будет отключаться из группы с заявками и одобренными амбассадорами.",
      ],
    },
  ];

  const activeSprints = sprints.filter((sprint) => !sprint.isDeleted).length;
  const totalSprints = sprints.length;

  return (
    <div className="w-full px-2 py-6">
      <SprintSettingsHeader
        activeSprints={activeSprints}
        totalSprints={totalSprints}
      />
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <SubscriberGroupCard
            key={group.id}
            title={group.title}
            name={group.name}
            senlerId={group.senlerId}
            link={group.link}
            instructions={group.instructions}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
}
