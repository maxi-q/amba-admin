import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@senler/ui";

const EventsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex justify-center overflow-auto bg-background text-foreground">
      <div className="w-full p-4 md:p-8">
        <div className="mb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-2 shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          Что такое события?
        </h1>

        <div className="grid max-w-3xl gap-6 text-sm leading-relaxed md:text-base">
          <p>
            События — это функция, которая позволяет создавать разовые активности.
            Под каждое событие автоматически создаются уникальные промокоды для
            каждого амбассадора.
          </p>

          <div>
            <h2 className="mb-3 text-lg font-semibold">В событиях вы можете:</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Назначить индивидуальные условия вознаграждений — бонус по
                промокоду для пользователя и награду амбассадору;
              </li>
              <li>
                Набрать амбассадоров под конкретное событие — добавить всех
                амбассадоров из комнаты или отправить персонализированное
                приглашение с предложением принять участие.
              </li>
            </ul>
          </div>

          <p>
            События хорошо подходят для конференций, коллабораций и ограниченных
            по времени акций, где важна гибкость в настройке и аналитика по
            конкретному событию.
          </p>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Отличия от Спринтов:</h2>
            <div className="grid gap-6">
              <div>
                <h3 className="mb-1.5 text-base font-medium">Промокоды:</h3>
                <p className="mb-1 text-muted-foreground">
                  Во всех спринтах амбассадор использует свой один промокод.
                </p>
                <p>
                  Под каждое событие амбассадору создается отдельный промокод.
                </p>
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-medium">Участники:</h3>
                <p className="mb-1 text-muted-foreground">
                  В каждом спринте автоматически участвуют все амбассадоры,
                  добавленные в комнату.
                </p>
                <p>
                  В событиях вы подбираете участников под каждое новое
                  событие — либо добавляете всех, либо рассылаете приглашения.
                </p>
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-medium">Статистика:</h3>
                <p>
                  В спринтах статистика привязывается к активному по дате
                  спринту, а в событиях — к конкретному мероприятию и
                  конкретному амбассадору по промокоду, это позволяет показывать
                  аналитику по каналам привлечения событиям.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsInfo;
