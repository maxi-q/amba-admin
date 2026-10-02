import { useState } from 'react';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@senler/ui';
import { toast } from 'sonner';
import { useRoomRewards } from '@/hooks/rewards/useRoomRewards';
import { useCompetitionRules } from '@/hooks/competitions/useCompetitionQueries';
import { useEventCompetitionActions } from '@/hooks/competitions/useCompetitionActions';
import type { CompetitionScope } from '@/hooks/competitions/types';
import type { SprintRewardRuleConfigDto } from '@/api/generated/model';
import pencil from '@/assets/task-flow/pencil.svg';
import trash from '@/assets/task-flow/trash.svg';

export function EventRewardEditor({ scope, type }: { scope: CompetitionScope; type: 'contest' | 'everyone' }) {
  const rules = useCompetitionRules(scope);
  const catalog = useRoomRewards(scope.roomId, { page: 1, size: 100 }, { allPages: true });
  const actions = useEventCompetitionActions(scope);
  const [draft, setDraft] = useState<SprintRewardRuleConfigDto | null>(null);
  const [editing, setEditing] = useState<string>();
  const [removeId, setRemoveId] = useState<string>();
  const [versionsOpen, setVersionsOpen] = useState(false);
  const outdatedRewardIds = [...new Set((rules.data ?? []).flatMap((rule) => rule.rewards.filter((position) => catalog.rewards.some((reward) => reward.id === position.rewardId && !reward.isDeleted && reward.version > position.reward.version)).map((position) => position.rewardId)))];
  const pinned = (rules.data ?? []).filter((rule) => rule.id === editing).flatMap((rule) => rule.rewards.map((position) => position.reward));
  const available = new Map([...catalog.rewards.filter((reward) => !reward.isDeleted), ...pinned].map((reward) => [reward.id, reward]));
  const valid = draft && draft.rewards.length > 0 && new Set(draft.rewards.map((item) => item.rewardId)).size === draft.rewards.length && draft.rewards.every((item) => {
    const reward = available.get(item.rewardId);
    const amount = String(item.amount);
    return reward && /^\d+(\.\d+)?$/.test(amount) && Number(amount) > 0 && Number.isFinite(Number(amount)) && (amount.split('.')[1]?.length ?? 0) <= (reward.isDivisible ? reward.divisionPrecision : 0);
  }) && (draft.type !== 'byRank' || Number.isSafeInteger(draft.rankFrom) && Number.isSafeInteger(draft.rankTo) && draft.rankFrom! >= 1 && draft.rankTo! >= draft.rankFrom!)
    && (draft.type !== 'byPoints' || (draft.rankFrom == null || Number.isSafeInteger(draft.rankFrom) && draft.rankFrom >= 1) && (draft.rankTo == null || Number.isSafeInteger(draft.rankTo) && draft.rankTo >= (draft.rankFrom ?? 1)) && (draft.minPoints == null || Number.isSafeInteger(draft.minPoints) && draft.minPoints >= 0) && (draft.rankTo != null || draft.minPoints != null));
  const labels = { byRank: 'По местам', byPoints: 'Пропорционально XP', manual: 'Ручной отбор', each: 'Каждому' };
  return <section className="mt-3 rounded-lg border border-border p-4 text-[13px]">
    <h2 className="mb-2 text-[15px]">Награды</h2>
    {outdatedRewardIds.length > 0 && <Button size="sm" variant="outline" disabled={actions.isPending} onClick={() => setVersionsOpen(true)}>Обновить версии наград</Button>}
    {rules.isError || catalog.isError ? <Button variant="outline" onClick={() => { void rules.refetch(); void catalog.refetch(); }}>Повторить загрузку наград</Button> : <>
      {(rules.data ?? []).map((rule) => <div key={rule.id} className="flex items-center gap-2 border-b border-border py-3">
        <div className="min-w-0 flex-1"><p>{labels[rule.type]}{rule.type === 'byRank' || rule.type === 'byPoints' ? ` · ${rule.rankFrom ?? 1}–${rule.rankTo ?? '∞'} место` : ''}</p><div className="mt-2 flex flex-wrap gap-3">{rule.rewards.map((position) => <span key={position.id} className="flex items-center gap-2">{position.reward.iconUrl && <img src={position.reward.iconUrl} className="size-10 rounded-lg object-cover" alt="" />}{position.reward.name} · {position.amount.toLocaleString('ru-RU')}</span>)}</div></div>
        <Button variant="outline" size="icon" aria-label="Изменить правило наград" onClick={() => { setEditing(rule.id); setDraft({ type: rule.type, rankFrom: rule.rankFrom, rankTo: rule.rankTo, minPoints: rule.minPoints, rewards: rule.rewards.map((position) => ({ rewardId: position.rewardId, amount: position.amount })) }); }}><img src={pencil} alt="" /></Button><Button variant="outline" size="icon" aria-label="Удалить правило наград" onClick={() => setRemoveId(rule.id)}><img src={trash} alt="" /></Button>
      </div>)}
      <Button className="mt-3" variant="outline" size="sm" disabled={rules.isLoading || catalog.isLoading || actions.isPending} onClick={() => { setEditing(undefined); setDraft({ type: type === 'everyone' ? 'each' : 'byRank', rankFrom: 1, rankTo: 1, minPoints: null, rewards: [{ rewardId: '', amount: 1 }] }); }}>Добавить награду</Button>
    </>}
    <DialogRoot open={!!draft} onOpenChange={(open) => { if (!open && !actions.isPending) setDraft(null); }}><DialogContent className="max-h-[85vh] max-w-[560px] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Изменить награды' : 'Добавить награды'}</DialogTitle><DialogDescription>Выберите способ распределения и количество из каталога компании.</DialogDescription></DialogHeader>
      {draft && <div className="space-y-3"><Select value={draft.type} onValueChange={(value) => setDraft({ ...draft, type: value as SprintRewardRuleConfigDto['type'] })}><SelectTrigger aria-label="Распределение наград"><SelectValue /></SelectTrigger><SelectContent>{(type === 'everyone' ? ['each', 'manual'] as const : ['byRank', 'byPoints', 'manual'] as const).map((value) => <SelectItem key={value} value={value}>{labels[value]}</SelectItem>)}</SelectContent></Select>
        {(draft.type === 'byRank' || draft.type === 'byPoints') && <div className="grid grid-cols-2 gap-2"><label>С места<Input type="number" min={1} value={draft.rankFrom ?? ''} onChange={(event) => setDraft({ ...draft, rankFrom: event.target.value === '' ? null : Number(event.target.value) })} /></label><label>По место<Input type="number" min={1} value={draft.rankTo ?? ''} onChange={(event) => setDraft({ ...draft, rankTo: event.target.value === '' ? null : Number(event.target.value) })} /></label></div>}
        {draft.type === 'byPoints' && <label className="block">Минимум XP<Input type="number" min={0} value={draft.minPoints ?? ''} onChange={(event) => setDraft({ ...draft, minPoints: event.target.value === '' ? null : Number(event.target.value) })} /></label>}
        {draft.rewards.map((line, index) => <div key={index} className="flex items-center gap-2"><Select value={line.rewardId} onValueChange={(rewardId) => setDraft({ ...draft, rewards: draft.rewards.map((item, i) => i === index ? { ...item, rewardId } : item) })}><SelectTrigger aria-label={`Награда ${index + 1}`}><SelectValue placeholder="Выберите награду" /></SelectTrigger><SelectContent>{[...available.values()].map((reward) => <SelectItem key={reward.id} value={reward.id}>{reward.name}</SelectItem>)}</SelectContent></Select><Input className="w-28 shrink-0" aria-label={`Количество ${index + 1}`} inputMode="decimal" value={String(line.amount)} onChange={(event) => setDraft({ ...draft, rewards: draft.rewards.map((item, i) => i === index ? { ...item, amount: event.target.value } : item) })} /><Button variant="outline" size="icon" aria-label={`Убрать награду ${index + 1}`} onClick={() => setDraft({ ...draft, rewards: draft.rewards.filter((_, i) => i !== index) })}><img src={trash} alt="" /></Button></div>)}
        <Button variant="outline" size="sm" onClick={() => setDraft({ ...draft, rewards: [...draft.rewards, { rewardId: '', amount: 1 }] })}>Ещё награда</Button>
      </div>}
      <DialogFooter><Button variant="outline" onClick={() => setDraft(null)} disabled={actions.isPending}>Отмена</Button><Button disabled={!valid || actions.isPending} loading={actions.isPending} onClick={() => draft && actions.mutate({ type: 'rule', id: editing, data: draft }, { onSuccess: () => setDraft(null), onError: (error) => toast.error(error.message) })}>Сохранить</Button></DialogFooter>
    </DialogContent></DialogRoot>
    <DialogRoot open={!!removeId} onOpenChange={(open) => { if (!open && !actions.isPending) setRemoveId(undefined); }}><DialogContent><DialogHeader><DialogTitle>Удалить правило наград?</DialogTitle><DialogDescription>Награды останутся в каталоге, но будут убраны из этого события.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setRemoveId(undefined)}>Отмена</Button><Button variant="destructive" disabled={actions.isPending} onClick={() => removeId && actions.mutate({ type: 'delete-rule', id: removeId }, { onSuccess: () => setRemoveId(undefined), onError: (error) => toast.error(error.message) })}>Удалить</Button></DialogFooter></DialogContent></DialogRoot>
    <DialogRoot open={versionsOpen} onOpenChange={(open) => { if (!actions.isPending) setVersionsOpen(open); }}><DialogContent><DialogHeader><DialogTitle>Обновить версии наград?</DialogTitle><DialogDescription>Выбранные награды получат актуальные названия, изображения и правила делимости из каталога. Изменение выполняется только по вашему подтверждению.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={actions.isPending} onClick={() => setVersionsOpen(false)}>Отмена</Button><Button disabled={actions.isPending} onClick={() => actions.mutate({ type: 'versions', rewardIds: outdatedRewardIds }, { onSuccess: () => setVersionsOpen(false), onError: (error) => toast.error(error.message) })}>Обновить</Button></DialogFooter></DialogContent></DialogRoot>
  </section>;
}
