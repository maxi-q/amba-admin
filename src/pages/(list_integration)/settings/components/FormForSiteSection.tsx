import { Copy } from "lucide-react";
import { Button, Textarea } from "@senler/ui";

interface FormForSiteSectionProps {
  roomId?: string;
  onCopy: (text: string) => void;
}

export const FormForSiteSection = ({ roomId, onCopy }: FormForSiteSectionProps) => {
  const installationCode = `<script async="" src="https://ambassador.sen.collabox.dev/index.js"></script>
<link href="https://ambassador.sen.collabox.dev/index.css" rel="stylesheet">`;

  const exampleCode = `<a href="#" onclick="openPromoAmbSEN(123, 'sdfsdfg4', ${roomId || 56})">Ввести промокод</a>`;

  return (
    <div className="mb-2">
      <h1 className="mb-4 text-lg font-semibold text-foreground">Форма для сайта</h1>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            Код для установки на сайт
          </h2>
          <p className="mb-2 text-sm text-muted-foreground">
            Разместите код как можно ближе к началу страницы, например, в пределах тегов{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">&lt;head&gt;&lt;/head&gt;</code>{" "}
            или{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">&lt;body&gt;&lt;/body&gt;</code>
          </p>
          <p className="mb-3 text-sm text-muted-foreground">
            Это универсальный код, который подходит для всех комнат, его нужно вставить
            на сайт только один раз
          </p>
          <div className="relative">
            <Textarea
              readOnly
              value={installationCode}
              className="min-h-[10rem] w-full resize-y pr-12 font-mono text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 bg-background/90 text-primary hover:bg-muted/90"
              aria-label="Скопировать код установки"
              onClick={() => onCopy(installationCode)}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            Код для вызова формы с вводом промокода
          </h2>
          <div className="mb-3 space-y-2 text-sm text-muted-foreground">
            <p className="font-mono text-foreground">
              openPromoAmbSEN(&lt;unique_id&gt;, &lt;security_code&gt;, &lt;room_id&gt;)
            </p>
            <p>
              <strong className="text-foreground">unique_id</strong> — идентификатор, по
              которому нужно ограничивать повторное использование промокодов
            </p>
            <p>
              <strong className="text-foreground">security_code</strong> — секретный ключ
              для защиты запросов. Вы можете указать этот параметр, чтобы защитить
              использование промокодов от недобросовестных пользователей. Его нужно
              сгенерировать на сервере, чтобы защитить алгоритм его формирования.
              Например, можно использовать функцию md5, в которой зашифровать
              unique_id и придуманную вами строку, чтобы потом проверить в вебхуке
              данный параметр md5(unique_id+&apos;45rtwtwb&apos;)
            </p>
            <p>
              <strong className="text-foreground">room_id</strong> — идентификатор комнаты.
              Текущий ID = {roomId ?? "N/A"}
            </p>
          </div>

          <p className="mb-2 text-sm font-medium text-foreground">Пример:</p>
          <div className="relative">
            <Textarea
              readOnly
              value={exampleCode}
              className="min-h-[4.5rem] w-full resize-y pr-12 font-mono text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 bg-background/90 text-primary hover:bg-muted/90"
              aria-label="Скопировать пример"
              onClick={() => onCopy(exampleCode)}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
