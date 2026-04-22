import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@senler/ui";

const SprintInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex justify-center overflow-auto bg-background">
      <div className="w-full p-4 md:p-8">
        <div className="mb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          Что такое спринты?
        </h1>

        <div className="flex max-w-3xl flex-col gap-8 text-foreground">
          <p className="text-base leading-relaxed">
            Спринт — это формат кампании с амбассадорами, где все участники из
            выбранной комнаты автоматически принимают участие, используя свой
            постоянный промокод. Такой формат идеально подходит для длительных
            или повторяющихся активностей с едиными условиями участия и
            вознаграждений.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              ⚙️ Особенности спринта:
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed">
              <li>
                <strong>Автоматическое участие:</strong> Все амбассадоры,
                добавленные в комнату, автоматически становятся участниками
                каждого активного спринта. Не требуется ручной отбор или
                приглашение.
              </li>
              <li>
                <strong>Единый промокод:</strong> У каждого амбассадора есть
                один постоянный промокод, используемый во всех спринтах. Это
                упрощает отслеживание результатов и продвижение.
              </li>
              <li>
                <strong>Фиксированные условия:</strong> Условия по
                вознаграждению (бонус пользователю и награда амбассадору) едины в
                рамках спринта и применяются ко всем участникам.
              </li>
              <li>
                <strong>Аналитика по периоду:</strong> Статистика привязывается
                ко времени действия спринта, что позволяет оценивать эффективность
                конкретного периода активности. Удобно для регулярных метрик и
                A/B-тестирования.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Отличия Событий от Спринтов
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">Формат участия:</h3>
                <p className="mb-2 text-base leading-relaxed">
                  В спринтах участвуют все амбассадоры, добавленные в комнату,
                  автоматически.
                </p>
                <p className="text-base leading-relaxed">
                  В событиях вы вручную выбираете участников: добавляете всех или
                  рассылаете персональные приглашения.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">Промокоды:</h3>
                <p className="mb-2 text-base leading-relaxed">
                  В спринтах у каждого амбассадора есть один постоянный промокод,
                  который действует на протяжении всех спринтов.
                </p>
                <p className="text-base leading-relaxed">
                  В событиях для каждого амбассадора создаётся уникальный
                  промокод, привязанный к конкретному событию.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">Условия вознаграждений:</h3>
                <p className="mb-2 text-base leading-relaxed">
                  В спринтах действуют единые условия для всех участников.
                </p>
                <p className="text-base leading-relaxed">
                  В событиях можно задавать индивидуальные условия: как для
                  пользователя, так и для амбассадора.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">Аналитика:</h3>
                <p className="mb-2 text-base leading-relaxed">
                  В спринтах статистика собирается по активному по дате периоду
                  (то есть по времени действия спринта).
                </p>
                <p className="text-base leading-relaxed">
                  В событиях аналитика ведётся по каждому мероприятию отдельно —
                  это позволяет видеть эффективность по каждому каналу привлечения
                  и по каждому амбассадору.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">Гибкость настройки:</h3>
                <p className="mb-2 text-base leading-relaxed">
                  Спринты лучше подходят для рутинных, регулярных кампаний с
                  минимальной настройкой.
                </p>
                <p className="text-base leading-relaxed">
                  События дают максимум гибкости: подходят для конференций,
                  коллабораций, временных акций, где важны индивидуальные условия и
                  точная аналитика.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SprintInfo;
