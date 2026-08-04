import { Check } from "lucide-react";
import { Button } from "@senler/ui";

interface SprintCreationHeaderProps {
  activeStep: 1 | 2 | 3;
  isSaving?: boolean;
  onSaveDraft: () => void;
}

const steps = ["Настройка спринта", "Вознаграждение", "Задания"];

export const SprintCreationHeader = ({
  activeStep,
  isSaving = false,
  onSaveDraft,
}: SprintCreationHeaderProps) => (
  <div className="border-b border-[#e4e4e4]">
    <div className="mx-auto flex min-h-11 w-full max-w-[700px] items-center justify-between gap-4 py-2">
      <ol
        className="flex min-w-0 items-center gap-3 overflow-x-auto"
        aria-label="Этапы создания спринта"
      >
        {steps.map((step, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3;
          const isComplete = stepNumber < activeStep;
          const isActive = stepNumber === activeStep;

          return (
            <li key={step} className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={[
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[13px] font-medium leading-4",
                    isComplete
                      ? "bg-[#22c55e] text-white"
                      : isActive
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#f0f0f0] text-[#797979]",
                  ].join(" ")}
                >
                  {isComplete ? <Check className="size-4" aria-hidden /> : stepNumber}
                </span>
                <span
                  className={[
                    "whitespace-nowrap text-[13px] font-medium leading-4",
                    isActive || isComplete ? "text-foreground" : "text-[#797979]",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span className="h-px w-4 shrink-0 bg-[#e4e4e4]" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 border-[#e4e4e4] bg-white px-2 text-[13px] font-medium shadow-none"
        disabled={isSaving}
        onClick={onSaveDraft}
      >
        {isSaving ? "Сохранение…" : "Сохранить черновик"}
      </Button>
    </div>
  </div>
);
