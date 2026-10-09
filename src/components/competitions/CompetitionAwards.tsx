import { useState } from 'react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, PageLoader, DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@senler/ui';
import { toast } from 'sonner';
import { useCompetitionGrants, useCompetitionRules } from '@/hooks/competitions/useCompetitionQueries';
import { useCompetitionActions } from '@/hooks/competitions/useCompetitionActions';
import type { CompetitionScope, CompetitionStatus } from '@/hooks/competitions/types';

export function CompetitionAwards({ scope, ambassadorId, status }: { scope: CompetitionScope; ambassadorId: string; status: CompetitionStatus }) {
  const allGrants = useCompetitionGrants(scope, { includeHistory: true });
  const rules = useCompetitionRules(scope);
  const action = useCompetitionActions(scope);
  const [positionId, setPositionId] = useState('');
  const [amount, setAmount] = useState('');
  const [confirm, setConfirm] = useState<Parameters<typeof action.mutate>[0] | null>(null);
  const positions = (rules.data ?? []).filter((rule) => rule.type === 'manual').flatMap((rule) => rule.rewards);
  const grants = (allGrants.data?.items ?? []).filter((grant) => grant.ambassadorId === ambassadorId);
  const selected = positions.find((position) => position.id === positionId);
  const existing = grants.find((grant) => grant.ruleRewardId === positionId);
  const precision = selected?.reward.isDivisible ? selected.reward.divisionPrecision : 0;
  const available = selected ? Number((selected.amount - (allGrants.data?.items ?? []).filter((grant) => grant.ruleRewardId === selected.id && grant.ambassadorId !== ambassadorId).reduce((total, grant) => total + grant.amount, 0)).toFixed(precision)) : 0;
  const validAmount = /^\d+(?:\.\d+)?$/.test(amount) && Number(amount) > 0 && Number(amount) <= available && (amount.split('.')[1]?.length ?? 0) <= precision;
  const run = (value: Parameters<typeof action.mutate>[0]) => action.mutate(value, { onSuccess: () => { setConfirm(null); setAmount(''); toast.success('Награды обновлены'); }, onError: (error) => toast.error(error.message) });
  return <section className="mt-3 overflow-hidden rounded-lg border border-border bg-card text-[13px]" aria-label="Назначение и выдача наград">
    <h2 className="border-b border-border p-4 text-[15px] font-medium">Награды</h2>
    {allGrants.isLoading || rules.isLoading ? <div className="p-4"><PageLoader label="Загрузка наград…" /></div>
      : allGrants.isError || rules.isError ? <div className="p-4 text-destructive">Не удалось загрузить награды.<Button variant="outline" onClick={() => { void allGrants.refetch(); void rules.refetch(); }}>Повторить</Button></div>
      : <>
        {grants.length === 0 && <p className="p-4 text-muted-foreground">Награды ещё не назначены. Автоматические назначения появятся после фиксации итогов.</p>}
        {grants.map((grant) => <div key={grant.id} className="border-b border-border p-3 last:border-b-0">
          <div className="flex flex-wrap items-center gap-2">
            {grant.reward.iconUrl && <img src={grant.reward.iconUrl} alt="" className="size-10 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1"><p>{grant.reward.name} · {grant.amount.toLocaleString('ru-RU')}</p><p className="text-xs text-muted-foreground">{grant.assignmentType === 'manual' ? 'Ручное назначение' : 'По результатам'} · версия {grant.reward.version}</p></div>
            {grant.deliveredAt ? <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => setConfirm({ type: 'delivery', grantId: grant.id, delivered: false })}>Отменить выдачу</Button>
              : status === 'awarding' ? <Button size="sm" disabled={action.isPending} onClick={() => setConfirm({ type: 'delivery', grantId: grant.id, delivered: true })}>Отметить выданной</Button> : <span className="text-muted-foreground">Не выдана</span>}
            {grant.assignmentType === 'manual' && grant.ruleRewardId && !grant.deliveredAt && status !== 'completed' && <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => setConfirm({ type: 'remove-manual', ruleRewardId: grant.ruleRewardId!, ambassadorId })}>Снять</Button>}
          </div>
          {!!grant.history?.length && <details className="mt-2 text-xs text-muted-foreground"><summary className="cursor-pointer">История выдачи</summary>{grant.history.map((entry) => <p key={entry.id} className="mt-1">{new Date(entry.createdAt).toLocaleString('ru-RU')} · {entry.action === 'delivered' ? 'Выдана' : 'Выдача отменена'}</p>)}</details>}
        </div>)}
        {status !== 'completed' && positions.length > 0 && <div className="space-y-2 border-t border-border p-4">
          <h3>Ручной отбор</h3>
          <Select value={positionId} onValueChange={(value) => { setPositionId(value); setAmount(String(grants.find((grant) => grant.ruleRewardId === value)?.amount ?? '')); }}><SelectTrigger aria-label="Награда ручного пула"><SelectValue placeholder="Выберите награду" /></SelectTrigger><SelectContent>{positions.map((position, index) => <SelectItem key={position.id} value={position.id}>{position.reward.name} · позиция {index + 1}</SelectItem>)}</SelectContent></Select>
          {selected && <><p className="text-muted-foreground">Доступно для этого участника: {available.toLocaleString('ru-RU')}. {existing ? 'Новое количество заменит прежнее назначение.' : ''}</p><label className="block">Количество<Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label="Количество ручной награды" /></label><Button disabled={!validAmount || !!existing?.deliveredAt || action.isPending} onClick={() => run({ type: 'manual', ruleRewardId: positionId, ambassadorId, amount })}>{existing ? 'Изменить назначение' : 'Назначить'}</Button>{existing?.deliveredAt && <p className="text-muted-foreground">Сначала отмените выдачу этой награды.</p>}</>}
        </div>}
      </>}
    <DialogRoot open={!!confirm} onOpenChange={(open) => { if (!open && !action.isPending) setConfirm(null); }}><DialogContent className="max-w-[358px]"><DialogHeader><DialogTitle>{confirm?.type === 'remove-manual' ? 'Снять назначение?' : confirm?.type === 'delivery' && confirm.delivered ? 'Награда передана участнику?' : 'Отменить отметку о выдаче?'}</DialogTitle><DialogDescription>{status === 'completed' ? 'Событие или спринт вернётся в статус «Выдача наград».' : 'Отметка фиксирует передачу всей назначенной награды. Денежный перевод приложение не выполняет.'}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={action.isPending} onClick={() => setConfirm(null)}>Отмена</Button><Button disabled={action.isPending} loading={action.isPending} onClick={() => confirm && run(confirm)}>Подтвердить</Button></DialogFooter></DialogContent></DialogRoot>
  </section>;
}
