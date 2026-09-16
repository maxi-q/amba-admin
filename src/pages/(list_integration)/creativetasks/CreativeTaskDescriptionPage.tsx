import { useOutletContext, useParams } from "react-router-dom";
import { CircleAlert, FileImage } from "lucide-react";
import { Card, CardContent } from "@senler/ui";
import type { CreativeTaskWithDefaultsDto } from "@/api/generated/model";
import { OrdCreativeSummaryCard } from "./components/OrdCreativeSummaryCard";

interface OutletCtx {
  task: CreativeTaskWithDefaultsDto;
}

export default function CreativeTaskDescriptionPage() {
  const { task } = useOutletContext<OutletCtx>();
  const { slug = "", taskId = "" } = useParams<{
    slug: string;
    taskId: string;
  }>();
  const hasMedia =
    task.defaultTargetUrls.length > 0 ||
    task.defaultMediaIds.length > 0 ||
    task.defaultTexts.length > 0;

  return (
    <div className={`space-y-2 px-4 pb-6 pt-3 ${task.isDeleted ? "opacity-70" : ""}`}>
      {task.ordProductDescription ? (
        <Card className="rounded-[12px] border-[#e4e4e4] shadow-none">
          <CardContent className="space-y-1 p-[15px]">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
              Информация о продукте/услуге
            </h2>
            <p className="whitespace-pre-wrap text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
              {task.ordProductDescription}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-[12px] border-[#e4e4e4] shadow-none">
        <CardContent className="space-y-1 p-[15px]">
          <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
            Что нужно сделать
          </h2>
          <p className="whitespace-pre-wrap text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
            {task.description || "—"}
          </p>
        </CardContent>
      </Card>

      {task.restrictions?.length ? (
        <section className="space-y-1 rounded-[12px] bg-[#ffebeb] p-4">
          <h2 className="flex items-center gap-1 text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
            <CircleAlert className="size-4 shrink-0 text-[#ff0000]" aria-hidden />
            Что запрещено
          </h2>
          <p className="whitespace-pre-line text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
            {task.restrictions.join("\n")}
          </p>
        </section>
      ) : null}

      {hasMedia ? (
        <Card className="rounded-[12px] border-[#e4e4e4] shadow-none">
          <CardContent className="space-y-3 p-[15px]">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
              Медиаматериалы
            </h2>

            {task.defaultTargetUrls.length ? (
              <div className="space-y-2 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                <p className="text-[#797979]">Целевая ссылка</p>
                <ol className="space-y-1">
                  {task.defaultTargetUrls.map((url, index) => (
                    <li key={`${url}-${index}`} className="flex gap-2">
                      <span className="w-4 shrink-0 text-right text-[#797979]">{index + 1}.</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 break-all text-[#2563eb] hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {task.defaultMediaIds.length ? (
              <div className="space-y-2">
                <p className="text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
                  Файлы
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {task.defaultMediaIds.map((mediaId) => (
                    <div
                      key={mediaId}
                      className="flex size-[75px] items-center justify-center rounded-[6px] border border-[#e4e4e4] bg-[#f0f0f0] text-[#797979]"
                      title={`Файл ${mediaId}`}
                      aria-label={`Прикреплённый файл ${mediaId}`}
                    >
                      <FileImage className="size-5" aria-hidden />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {task.defaultTexts.length ? (
              <div className="space-y-2 text-[13px] font-medium leading-4 tracking-[-0.0325px]">
                <p className="text-[#797979]">Текст</p>
                <ol className="space-y-2">
                  {task.defaultTexts.map((text, index) => (
                    <li key={`${text}-${index}`} className="flex gap-2 text-black">
                      <span className="w-4 shrink-0 text-right text-[#797979]">{index + 1}.</span>
                      <span className="min-w-0 flex-1">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {task.criteria?.length ? (
        <Card className="rounded-[12px] border-[#e4e4e4] shadow-none">
          <CardContent className="space-y-1 p-[15px]">
            <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px] text-black">
              Критерии оценки
            </h2>
            <ol className="list-decimal pl-5 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
              {task.criteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <OrdCreativeSummaryCard task={task} slug={slug} taskId={taskId} />
    </div>
  );
}
