import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@senler/ui";

const SettingsInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full w-full justify-center overflow-auto bg-background text-foreground">
      <div className="w-full p-4 md:p-8">
        <div className="mb-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>

        <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
          Формат вебхука
        </h1>

        <div className="grid max-w-3xl gap-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Формат запроса</h2>
            <div className="rounded-lg border border-border bg-muted/40 p-4 md:p-6">
              <p className="mb-3 text-sm font-medium">Тип запроса: POST / JSON</p>
              <h3 className="mb-2 text-base font-semibold">Параметры:</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    channel_id: int
                  </code>{" "}
                  — идентификатор канала в Senler
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    room_id: int
                  </code>{" "}
                  — идентификатор комнаты. Текущий ID = 56
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    sprint_id: int
                  </code>{" "}
                  — идентификатор спринта
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    ambassador_id: string
                  </code>{" "}
                  — идентификатор амбассдора (id ВКонтакте или в Телеграмме)
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    secret: string
                  </code>{" "}
                  — секретный ключ для безопасности (находится в комнате)
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    action: enum(&apos;promocode_activate&apos;)
                  </code>{" "}
                  — действие
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    unique_id: int
                  </code>{" "}
                  — идентификатор, по которому нужно ограничивать повторное
                  использование промокодов, передается в форму ввода промокода
                  на сайте. В случае сенлера тут нужно передать ID проекта
                </li>
                <li>
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    security_code:
                  </code>{" "}
                  — генерируется сайтом для возможности сделать защиту,
                  передается в форму ввода промокода
                </li>
                <li>
                  <span className="block">
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      data:
                    </code>{" "}
                    object:
                  </span>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    <li>
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">
                        value: string
                      </code>{" "}
                      — промокод
                    </li>
                    <li>
                      <span className="block">
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          reward:
                        </code>{" "}
                        object:
                      </span>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5">
                        <li>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            type: enum(&apos;fix&apos;)
                          </code>{" "}
                          — тип награды
                        </li>
                        <li>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            value: int
                          </code>{" "}
                          — размер награды
                        </li>
                        <li>
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            units: string
                          </code>{" "}
                          — единицы измерения награды, например &apos;руб&apos;
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          <div className="h-px bg-border" />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Успешная обработка</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              При успешном начислении награды на вебхук необходимо ответить:
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
{`{
  "success": true
}`}
            </pre>
          </section>

          <div className="h-px bg-border" />

          <section>
            <h2 className="mb-3 text-lg font-semibold">Ошибка обработки</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Если произошла ошибка, то отправить текст этой ошибки в формате:
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm">
{`{
  "success": false,
  "error": "Текст ошибки"
}`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsInfo;
