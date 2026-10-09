import { useState, type ReactNode } from "react";
import checkIcon from "@/assets/event-instructions/check.svg";
import everyoneRewardIllustration from "@/assets/event-instructions/everyone-reward.svg";
import giftLargeIcon from "@/assets/event-instructions/gift-large.svg";
import giftSmallIcon from "@/assets/event-instructions/gift-small.svg";
import loaderIcon from "@/assets/event-instructions/loader.svg";
import messageIllustration from "@/assets/event-instructions/message.svg";
import timerIcon from "@/assets/event-instructions/timer.svg";
import userIcon from "@/assets/event-instructions/user.svg";

type EventType = "contest" | "everyone";

interface EventInstructionsProps {
  placement?: "page" | "dialog";
}

const illustrationClassName =
  "absolute right-[15px] top-[15px] size-[88px] overflow-hidden text-[#c1c1c1]";

const InformationIllustration = () => (
  <div className={illustrationClassName} aria-hidden>
    <div className="absolute left-0 top-0 size-[52px] overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
      <div className="absolute left-[9px] top-1/2 flex w-8 -translate-y-1/2 flex-col gap-1">
        <span className="block h-[3px] rounded-lg bg-[#c1c1c1]" />
        <span className="block h-[3px] rounded-lg bg-[#e4e4e4]" />
        <span className="block h-[3px] rounded-lg bg-[#e4e4e4]" />
        <span className="block h-[3px] w-[19px] rounded-lg bg-[#e4e4e4]" />
      </div>
    </div>
    <div className="absolute bottom-0 right-0 size-[52px] overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
      <span className="absolute left-[5px] top-[13px] text-[15px] font-medium leading-5 tracking-[-0.135px]">30</span>
      <span className="absolute left-[5px] top-[28px] text-[11px] font-medium leading-4 tracking-[0.055px]">дней</span>
      <img src={timerIcon} alt="" className="absolute left-[31px] top-[5px]" />
    </div>
  </div>
);

const ConditionsIllustration = ({ type }: { type: EventType }) => {
  if (type === "everyone") {
    return (
      <div className={illustrationClassName} aria-hidden>
        <img src={everyoneRewardIllustration} alt="" />
      </div>
    );
  }

  return (
    <div className={illustrationClassName} aria-hidden>
      <img src={giftSmallIcon} alt="" className="absolute left-1/2 top-0 -translate-x-1/2" />
      <div className="absolute bottom-0 left-0 flex w-full items-end gap-[3px]">
        {[
          { place: 3, height: 36 },
          { place: 1, height: 67 },
          { place: 2, height: 52 },
        ].map(({ place, height }) => (
          <div
            key={place}
            className="relative flex flex-1 items-end justify-center overflow-hidden rounded-md border border-[#e4e4e4] pb-1 text-[13px] font-medium leading-4 tracking-[-0.0325px]"
            style={{ height }}
          >
            {place}
          </div>
        ))}
      </div>
    </div>
  );
};

const TasksIllustration = ({ type }: { type: EventType }) => (
  <div className={illustrationClassName} aria-hidden>
    <div className="absolute left-1/2 top-[calc(50%+2px)] h-16 w-[52px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
      <div className="absolute left-1/2 top-1/2 flex w-[38px] -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5">
        {[0, 1, 2].map((item) => (
          <span key={item} className="flex items-center gap-0.5">
            <img src={checkIcon} alt="" />
            <span className="h-0.5 flex-1 rounded-full bg-[#c1c1c1]" />
          </span>
        ))}
      </div>
    </div>
    <span className="absolute left-[34px] top-[10px] h-2 w-5 rounded-[3px] border border-[#e4e4e4] bg-white" />
    <span className="absolute left-[43px] top-16 flex h-6 w-[37px] items-center justify-center rounded-full border border-[#e4e4e4] bg-white text-[11px] font-semibold leading-4 tracking-[0.055px]">
      <span className={type === "contest" ? "mr-0.5" : "mr-px"}>+</span>
      {type === "contest" ? "XP" : <img src={giftSmallIcon} alt="" />}
    </span>
  </div>
);

const ResultsIllustration = () => (
  <div className={illustrationClassName} aria-hidden>
    <img src={loaderIcon} alt="" className="absolute left-[60px] top-0" />
    <img src={messageIllustration} alt="" className="absolute left-[10px] top-3" />
    <div className="absolute left-6 top-5 size-10 -scale-y-100 rotate-180">
      <img src={giftLargeIcon} alt="" />
    </div>
    <span className="absolute right-0 top-[52px] flex size-6 items-center justify-center overflow-hidden rounded-full border border-[#e4e4e4] bg-white">
      <img src={userIcon} alt="" />
    </span>
  </div>
);

const InstructionCard = ({
  number,
  title,
  description,
  illustration,
}: {
  number: number;
  title: string;
  description: string;
  illustration: ReactNode;
}) => (
  <div className="relative h-[120px] w-full overflow-hidden rounded-lg border border-[#e4e4e4] bg-white">
    <span className="absolute left-[15px] top-[15px] flex size-6 items-center justify-center rounded-full bg-[#f0f0f0] text-[13px] font-medium leading-4 tracking-[-0.0325px]">
      {number}
    </span>
    <p className="absolute left-[15px] top-[51px] w-[194px] text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
      {title}
    </p>
    <p className="absolute left-[15px] top-[71px] w-[194px] text-[13px] font-medium leading-4 tracking-[-0.0325px] text-[#797979]">
      {description}
    </p>
    {illustration}
  </div>
);

export const EventInstructions = ({ placement = "page" }: EventInstructionsProps) => {
  const [type, setType] = useState<EventType>("contest");
  const contest = type === "contest";

  const steps = [
    {
      title: "Укажите информацию",
      description: "Название, описание и сроки проведения",
      illustration: <InformationIllustration />,
    },
    {
      title: contest ? "Определите условия" : "Укажите награды",
      description: contest
        ? "Укажите места и какие награды они получат"
        : "Награды будут одинаковые для всех участников",
      illustration: <ConditionsIllustration type={type} />,
    },
    {
      title: "Создайте задания",
      description: contest
        ? "За выполнение заданий участники получают очки"
        : "Для награды нужно выполнить все задания",
      illustration: <TasksIllustration type={type} />,
    },
    {
      title: "Подведите итоги",
      description: contest
        ? "Свяжитесь с победителями и отправьте награды"
        : "Свяжитесь с участниками и отправьте награды",
      illustration: <ResultsIllustration />,
    },
  ];

  return (
    <div className="flex w-[326px] max-w-full flex-col gap-2 text-[13px] font-medium leading-4 tracking-[-0.0325px] text-black">
      {placement === "page" ? (
        <div className="mb-1 text-center">
          <h2 className="text-[15px] font-medium leading-5 tracking-[-0.135px]">Как это работает</h2>
          <p className="mt-1 text-[#797979]">
            Событие будет доступно участникам, которых
            <br />
            вы выберете
          </p>
        </div>
      ) : (
        <p className="text-[#797979]">
          Событие будет доступно участникам, которых
          <br />
          вы выберете
        </p>
      )}

      <div
        className={`grid h-7 grid-cols-2 gap-0.5 rounded-md bg-[#f0f0f0] p-0.5 ${
          placement === "page" ? "mx-auto w-[232px]" : "w-full"
        }`}
        role="tablist"
        aria-label="Тип события в инструкции"
      >
        {([
          ["contest", "Конкурс"],
          ["everyone", "Равная награда"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={type === value}
            onClick={() => setType(value)}
            className={`rounded px-1.5 py-1 text-[13px] font-medium leading-4 tracking-[-0.0325px] transition-colors ${
              type === value ? "bg-white text-black" : "text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {steps.map((step, index) => (
        <InstructionCard key={step.title} number={index + 1} {...step} />
      ))}
    </div>
  );
};
