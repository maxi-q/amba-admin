import informationIllustration from "@/assets/sprint-instructions/information.png";
import conditionsIllustration from "@/assets/sprint-instructions/conditions.png";
import tasksIllustration from "@/assets/sprint-instructions/tasks.png";
import resultsIllustration from "@/assets/sprint-instructions/results.png";

interface SprintInstructionsProps {
  placement?: "page" | "dialog";
}

const steps = [
  {
    title: "Укажите информацию",
    description: "Название, описание и сроки проведения",
    illustration: informationIllustration,
  },
  {
    title: "Определите условия",
    description: "Укажите места и какие награды они получат",
    illustration: conditionsIllustration,
  },
  {
    title: "Создайте задания",
    description: "За выполнение заданий участники получают очки",
    illustration: tasksIllustration,
  },
  {
    title: "Подведите итоги",
    description: "Свяжитесь с победителями и отправьте награды",
    illustration: resultsIllustration,
  },
] as const;

export const SprintInstructions = ({
  placement = "page",
}: SprintInstructionsProps) => (
  <div className="flex w-[326px] max-w-full flex-col text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
    {placement === "page" ? (
      <div className="mb-3 text-center">
        <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">
          Как это работает
        </h2>
        <p className="mt-1 text-[#797979]">
          Спринт будет доступен всем участникам комнаты
        </p>
      </div>
    ) : (
      <p className="mb-2 text-[#797979] sm:whitespace-nowrap">
        Спринт будет доступен всем участникам комнаты
      </p>
    )}

    <div className="flex flex-col gap-2">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="relative h-[120px] w-full overflow-hidden rounded-lg border border-[#e4e4e4] bg-white"
        >
          <span className="absolute left-[15px] top-[15px] flex size-6 items-center justify-center rounded-full bg-[#f0f0f0]">
            {index + 1}
          </span>
          <p className="absolute left-[15px] top-[51px] w-[194px] text-black">
            {step.title}
          </p>
          <p className="absolute left-[15px] top-[71px] w-[194px] text-[#797979]">
            {step.description}
          </p>
          <img
            src={step.illustration}
            alt=""
            width={88}
            height={88}
            className="pointer-events-none absolute right-[15px] top-[15px] max-w-none"
            aria-hidden
          />
        </div>
      ))}
    </div>
  </div>
);
