import Button from "@components/ui/button";
// import { Card } from "@components/ui/card";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

// Тип статуса
type SprintStatus = "active" | "upcoming" | "past";

// Тип спринта
type Sprint = {
  id: number;
  title: string;
  dateRange?: string;
  status: SprintStatus;
};

const statusStyles: Record<SprintStatus, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-yellow-100 text-yellow-700 border-yellow-200",
  past: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels: Record<SprintStatus, string> = {
  active: "активный",
  upcoming: "предстоящий",
  past: "прошедший",
};

const defaultSprints: Sprint[] = [
  {
    id: 1,
    title: "Подготовка к конференции",
    dateRange: "Без ограничений по датам",
    status: "active",
  },
  {
    id: 2,
    title: "Ретроспектива",
    dateRange: "10–15 августа 2025",
    status: "past",
  },
  {
    id: 3,
    title: "Промежуточный анализ",
    dateRange: "20–25 августа 2025",
    status: "upcoming",
  },
];

export default function SprintList({ sprints = defaultSprints }: { sprints?: Sprint[] }) {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {sprints.map((sprint) => (
          <Link to={`${sprint.id}`} key={sprint.id} className="flex justify-between items-center p-4 border-1 rounded-2xl">
            <div>
              <div className="text-lg font-medium">{sprint.title}</div>
              <div className="text-sm text-muted-foreground">
                {sprint.dateRange || "Без ограничений по датам"}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`border text-sm rounded px-3 py-1 ${
                  statusStyles[sprint.status]
                }`}
              >
                {statusLabels[sprint.status]}
              </span>
              <Button variant="ghost" size="icon">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </Link>
        ))}

        <div className="flex justify-end">
          <Button variant="default" className="bg-green-50 border border-green-200 text-green-700">
            Добавить спринт
          </Button>
        </div>
      </div>
    </div>
  );
}
