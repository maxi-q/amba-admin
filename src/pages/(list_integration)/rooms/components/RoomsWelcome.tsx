import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calendar,
  Eye,
  Image,
  Megaphone,
  PieChart,
  RefreshCw,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Button } from "@senler/ui";

interface FeatureTag {
  label: string;
  icon: LucideIcon;
  className: string;
}

const FEATURE_ROWS: FeatureTag[][] = [
  [
    {
      label: "Автоматизация ОРД",
      icon: RefreshCw,
      className: "bg-primary text-primary-foreground shadow-sm",
    },
  ],
  [
    {
      label: "Задания",
      icon: Users,
      className: "bg-blue-50 text-foreground border border-blue-100",
    },
    {
      label: "Выплаты",
      icon: Banknote,
      className: "bg-emerald-50 text-foreground border border-emerald-100",
    },
  ],
  [
    {
      label: "Аналитика",
      icon: PieChart,
      className: "bg-emerald-500 text-white shadow-sm",
    },
    {
      label: "Кампании",
      icon: Megaphone,
      className: "bg-blue-500 text-white shadow-sm",
    },
  ],
  [
    {
      label: "Амбассадоры",
      icon: User,
      className: "bg-violet-50 text-foreground border border-violet-100",
    },
    {
      label: "Спринты",
      icon: Calendar,
      className: "bg-slate-100 text-foreground border border-slate-200",
    },
  ],
  [
    {
      label: "Контент",
      icon: Image,
      className: "bg-blue-500 text-white shadow-sm",
    },
    {
      label: "Охваты",
      icon: TrendingUp,
      className: "bg-emerald-500 text-white shadow-sm",
    },
  ],
  [
    {
      label: "Контроль работы",
      icon: Eye,
      className: "bg-slate-50 text-muted-foreground border border-slate-200",
    },
  ],
];

function FeatureTagPill({ label, icon: Icon, className }: FeatureTag) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${className}`}
    >
      <Icon className="size-3.5 shrink-0 sm:size-4" aria-hidden />
      {label}
    </span>
  );
}

interface RoomsWelcomeProps {
  onGetStarted: () => void;
}

export function RoomsWelcome({ onGetStarted }: RoomsWelcomeProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="relative mb-8 w-full sm:mb-10">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl sm:size-64"
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-2 sm:gap-2.5">
            {FEATURE_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {row.map((tag) => (
                  <FeatureTagPill key={tag.label} {...tag} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Амбассадор
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
          Управляйте сотрудничеством с амбассадорами легко и прозрачно
        </p>

        <Button
          type="button"
          size="lg"
          className="mt-8 min-w-[10rem] sm:mt-10"
          onClick={onGetStarted}
        >
          Приступить
        </Button>
      </div>
    </div>
  );
}
