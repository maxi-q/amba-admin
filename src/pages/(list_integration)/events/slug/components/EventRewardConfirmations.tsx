import { useState } from "react";
import { Button, CheckBox, PageLoader } from "@senler/ui";
import { toast } from "sonner";
import { useCompetitionActions } from "@/hooks/competitions/useCompetitionActions";
import { useCompetitionGrants } from "@/hooks/competitions/useCompetitionQueries";
import type { CompetitionScope, CompetitionStatus } from "@/hooks/competitions/types";

type RewardKind = "tasks" | "promo";

export function EventRewardConfirmations({
  scope,
  ambassadorId,
  status,
}: {
  scope: CompetitionScope;
  ambassadorId: string;
  status: CompetitionStatus;
}) {
  const grantsQuery = useCompetitionGrants(scope, { includeHistory: true });
  const actions = useCompetitionActions(scope);
  const [checked, setChecked] = useState<Record<RewardKind, boolean>>({ tasks: false, promo: false });
  const grants = (grantsQuery.data?.items ?? []).filter((grant) => grant.ambassadorId === ambassadorId);
  const groups = {
    tasks: grants.filter((grant) => Boolean(grant.eventTaskSubmissionId)),
    promo: grants.filter((grant) => Boolean(grant.eventPromoRewardAccrualId)),
  };

  if (grantsQuery.isLoading) return <div className="border-t border-[#e4e4e4] p-4"><PageLoader label="Загрузка наград…" /></div>;
  if (grantsQuery.isError) return <div className="border-t border-[#e4e4e4] p-4 text-destructive">Не удалось загрузить награды.</div>;
  if (groups.tasks.length === 0 && groups.promo.length === 0) return null;

  const confirmGroup = async (kind: RewardKind) => {
    const pending = groups[kind].filter((grant) => !grant.deliveredAt);
    try {
      for (const grant of pending) {
        await actions.mutateAsync({ type: "delivery", grantId: grant.id, delivered: true });
      }
      setChecked((value) => ({ ...value, [kind]: false }));
      toast.success("Награды отмечены отправленными");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось подтвердить выдачу наград");
    }
  };

  return (
    <div className="mt-4 border-t border-[#e4e4e4] pt-4">
      {(["tasks", "promo"] as const).map((kind, index) => {
        const group = groups[kind];
        if (group.length === 0) return null;
        const delivered = group.every((grant) => Boolean(grant.deliveredAt));
        return (
          <div key={kind} className={`flex items-center gap-3 ${index > 0 ? "mt-3 border-t border-[#e4e4e4] pt-3" : ""}`}>
            <div className="min-w-0 flex-1">
              <CheckBox
                label={kind === "tasks" ? "Я отправил награды по заданиям" : "Я отправил награды по промокоду"}
                checked={delivered || checked[kind]}
                disabled={delivered || status !== "awarding" || actions.isPending}
                onCheckedChange={(value) => setChecked((old) => ({ ...old, [kind]: value === true }))}
              />
            </div>
            <Button
              className="h-7 shrink-0 px-2 text-[13px]"
              disabled={delivered || !checked[kind] || status !== "awarding" || actions.isPending}
              loading={actions.isPending && checked[kind]}
              onClick={() => void confirmGroup(kind)}
            >
              {delivered ? "Подтверждено" : "Подтвердить"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
