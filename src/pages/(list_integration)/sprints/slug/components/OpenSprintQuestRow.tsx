import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useSubmissions } from "@/hooks/creativetasks/useSubmissions";

interface OpenSprintQuestRowProps {
  taskId: string;
  title: string;
  roomSlug: string;
}

function answersLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ответ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} ответа`;
  }
  return `${count} ответов`;
}

export function OpenSprintQuestRow({
  taskId,
  title,
  roomSlug,
}: OpenSprintQuestRowProps) {
  const { submissions, pagination, isLoading } = useSubmissions(taskId, {
    page: 1,
    size: 100,
  });
  const total = pagination?.total ?? submissions.length;
  const pending = submissions.filter(
    (item) =>
      item.status === "new" ||
      item.status === "waiting_for_review_materials" ||
      item.status === "waiting_for_review_publication"
  ).length;
  const allReviewed = total > 0 && pending === 0;

  let badge: React.ReactNode;
  if (isLoading) {
    badge = (
      <span className="text-[13px] font-medium text-[#797979]">…</span>
    );
  } else if (total === 0) {
    badge = (
      <span className="inline-flex items-center rounded-full bg-[#f0f0f0] px-1.5 py-1 text-[13px] font-medium leading-4 text-[#797979]">
        Ответов нет
      </span>
    );
  } else if (allReviewed) {
    badge = (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f0f0f0] px-1.5 py-1 text-[13px] font-medium leading-4 text-foreground">
        <Check className="size-3 shrink-0" aria-hidden />
        Все проверено
      </span>
    );
  } else {
    badge = (
      <span className="inline-flex items-center rounded-full bg-[rgba(213,32,148,0.15)] px-1.5 py-1 text-[13px] font-medium leading-4 text-[#d52094]">
        {answersLabel(total)}
      </span>
    );
  }

  return (
    <Link
      to={`/rooms/${roomSlug}/creativetasks/${taskId}/answers`}
      className="flex h-12 items-center gap-4 border-b border-[#e4e4e4] px-4 transition-colors hover:bg-[#fafafa]"
    >
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-4 tracking-[-0.25px] text-foreground">
        {title}
      </p>
      {badge}
    </Link>
  );
}
