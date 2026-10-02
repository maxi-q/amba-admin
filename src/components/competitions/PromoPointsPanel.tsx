import { useState } from 'react';
import { Button, Input, PageLoader } from '@senler/ui';
import { toast } from 'sonner';
import { usePromoPoints, usePromoPointsRules } from '@/hooks/promoCodes/usePromoPoints';
import { usePromoPointsActions } from '@/hooks/promoCodes/usePromoPointsActions';
import type { CompetitionScope } from '@/hooks/competitions/types';
import star from '@/assets/task-flow/star.svg';

export function PromoPointsPanel({ scope, editable = false, ambassadorId, onDirtyChange }: { scope: CompetitionScope; editable?: boolean; ambassadorId?: string; onDirtyChange?: (dirty: boolean) => void }) {
  const rules = usePromoPointsRules(scope);
  const [page, setPage] = useState(1);
  const points = usePromoPoints(scope, ambassadorId, page);
  const action = usePromoPointsActions(scope);
  const [form, updateForm] = useState<{ usages: string; points: string } | null>(null);
  const setForm = (value: typeof form) => { updateForm(value); onDirtyChange?.(value !== null); };
  const current = rules.data?.find((rule) => rule.isActive);
  const draft = form ?? { usages: String(current?.usagesPerAward ?? ''), points: current?.pointsPerAward ?? '' };
  const valid = /^\d+$/.test(draft.usages) && Number.isSafeInteger(Number(draft.usages)) && Number(draft.usages) > 0 && Number(draft.usages) <= 2147483647 && /^[1-9]\d*$/.test(draft.points) && BigInt(draft.points) <= 9223372036854775807n;
  return <section className="mt-3 overflow-hidden rounded-lg border border-border bg-card text-[13px]">
    <header className="border-b border-border p-4"><h2 className="text-[15px] font-medium">Промокод</h2><p className="mt-1 text-muted-foreground">Дополнительные XP за успешные активации промокода участника</p></header>
    {rules.isLoading ? <PageLoader label="Загрузка правила…" /> : rules.isError ? <Button variant="outline" onClick={() => void rules.refetch()}>Повторить загрузку правила</Button> : <div className="p-4">
      {current ? <p className="flex items-center gap-1"><img src={star} alt="" />{BigInt(current.pointsPerAward).toLocaleString('ru-RU')} XP каждые {current.usagesPerAward} активаций</p> : <p className="text-muted-foreground">Начисление XP не настроено.</p>}
      {editable && <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); if (valid) action.mutate({ id: current?.id, usagesPerAward: Number(draft.usages), pointsPerAward: draft.points }, { onSuccess: () => { setForm(null); toast.success('Правило сохранено'); }, onError: (error) => toast.error(error.message) }); }}>
        <div className="grid grid-cols-2 gap-3"><label>Начислять XP<Input value={draft.points} inputMode="numeric" onChange={(event) => setForm({ ...draft, points: event.target.value })} /></label><label>Каждые N активаций<Input value={draft.usages} inputMode="numeric" onChange={(event) => setForm({ ...draft, usages: event.target.value })} /></label></div>
        <p className="text-xs text-muted-foreground">После изменения порог считается заново. Ранее начисленные XP сохраняются.</p>
        {form && <Button type="button" size="sm" variant="ghost" disabled={action.isPending} onClick={() => setForm(null)}>Отменить изменения</Button>}
        <div className="flex gap-2"><Button type="submit" size="sm" disabled={!valid || action.isPending || (!form && !!current)} loading={action.isPending}>Сохранить правило</Button>{current && <Button type="button" size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: current.id, remove: true }, { onSuccess: () => setForm(null), onError: (error) => toast.error(error.message) })}>Отключить</Button>}</div>
      </form>}
      {(rules.data?.length ?? 0) > 1 && <details className="mt-3 text-muted-foreground"><summary className="cursor-pointer">История правил</summary>{rules.data?.map((rule) => <p key={rule.id} className="mt-1">{new Date(rule.effectiveFrom).toLocaleString('ru-RU')} · {rule.pointsPerAward} XP / {rule.usagesPerAward} · {rule.isActive ? 'Действует' : 'Отключено'}</p>)}</details>}
    </div>}
    {points.isError ? <Button variant="outline" onClick={() => void points.refetch()}>Повторить загрузку начислений</Button> : points.isLoading ? <PageLoader label="Загрузка начислений…" /> : points.data && <>
      <div className="flex justify-between border-t border-border p-4"><span className="text-muted-foreground">Всего начислено</span><span>{BigInt(points.data.totalPoints).toLocaleString('ru-RU')} XP</span></div>
      {points.data.progress.map((progress) => <p className="px-4 pb-2 text-muted-foreground" key={`${progress.ruleId}-${progress.ambassadorId}`}>{ambassadorId ? 'До следующего начисления' : `Участник ${progress.ambassadorId}: до следующего начисления`}: {progress.usagesUntilNextAward} активаций</p>)}
      {points.data.accruals.map((entry) => <div key={entry.id} className="flex justify-between gap-2 border-t border-border p-4"><span>Начисление за активации №{entry.thresholdNumber}</span><span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString('ru-RU')}</span><span>+{entry.points} XP</span></div>)}
      {points.data.total > 50 && <div className="flex items-center justify-between p-3"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</Button><span>{page}</span><Button variant="outline" disabled={page * 50 >= points.data.total} onClick={() => setPage(page + 1)}>Далее</Button></div>}
    </>}
  </section>;
}
