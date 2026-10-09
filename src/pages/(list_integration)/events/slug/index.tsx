import { useCallback, useRef, useState } from 'react';
import { Link, useBeforeUnload, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Input, Textarea, CheckBox, Calendar, PageLoader, DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@senler/ui';
import { toast } from 'sonner';
import type { CreateEventRequestDto, GetMyEventsResponseItemDto, RewardSummaryDto } from '@/api/generated/model';
import { rankRewardPlaceCount } from '@/utils/sprintRewardPreview';
import { useEvents } from '@/hooks/events/useEvents';
import { useCreateEvent } from '@/hooks/events/useCreateEvent';
import { usePatchEvent } from '@/hooks/events/usePatchEvent';
import { useApprovedParticipants, useCompetitionRules, useEventParticipants } from '@/hooks/competitions/useCompetitionQueries';
import { useEventCompetitionActions } from '@/hooks/competitions/useCompetitionActions';
import { EventRewardEditor } from './EventRewardEditor';
import { EventPromoSetupCard } from './components/EventPromoSetupCard';
import { EventTasksSetupSection } from './components/EventTasksSetupSection';

export default function EventsSetting() {
  const { slug = '', eventId = 'new' } = useParams();
  const query = useEvents({ page: 1, size: 100 }, slug, { allPages: true });
  if (query.isLoading) return <PageLoader label="Загрузка события…" />;
  if (query.isError) return <Button variant="outline" onClick={() => void query.refetch()}>Повторить загрузку события</Button>;
  const event = query.events.find((item) => item.id === eventId);
  if (eventId !== 'new' && !event) return <p className="p-4">Событие не найдено</p>;
  if (event && event.status !== 'active') return <p className="p-4">Настройки доступны только до проверки ответов. <Link to={`/rooms/${slug}/events/${event.id}`}>К событию</Link></p>;
  return <EventEditorForm key={eventId} roomId={slug} event={event} />;
}

function EventEditorForm({ roomId, event }: { roomId: string; event?: GetMyEventsResponseItemDto }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const step = event ? Math.min(3, Math.max(1, Math.floor(Number(params.get('step'))) || 1)) : 1;
  const scope = { kind: 'event' as const, id: event?.id ?? 'new', roomId };
  const create = useCreateEvent({ navigateOnSuccess: false });
  const patch = usePatchEvent();
  const relations = useEventCompetitionActions(scope);
  const participants = useEventParticipants(scope.id);
  const members = useApprovedParticipants(roomId);
  const rules = useCompetitionRules(scope);
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const selected = selectedIds ?? participants.data?.filter((item) => item.status === 'approved').map((item) => item.ambassadorId) ?? [];
  const [search, setSearch] = useState('');
  const [promoDirty, setPromoDirty] = useState(false);
  const [form, setForm] = useState<CreateEventRequestDto>(() => ({ roomId, name: event?.name ?? '', description: event?.description ?? '', promoCodesPrefix: event?.promoCodesPrefix ?? '', startDate: event?.startDate ?? '', endDate: event?.endDate ?? null, ignoreEndDate: event?.ignoreEndDate ?? false, rewardType: event?.rewardType ?? 'fix', rewardValue: event?.rewardValue ?? 0, rewardUnits: event?.rewardUnits ?? 'XP', ignorePromoCodeUsageLimit: event?.ignorePromoCodeUsageLimit ?? true, promoCodeUsageLimit: event?.promoCodeUsageLimit, isDeleted: false, isDraft: event?.isDraft ?? true, type: event?.type ?? 'contest' }));
  const busy = create.isPending || patch.isPending || relations.isPending;
  const savedForm = useRef(JSON.stringify(form));
  const leaving = useRef(false);
  const dirty = JSON.stringify(form) !== savedForm.current || selectedIds !== null || promoDirty;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname);
  useBeforeUnload(useCallback((e) => { if (dirty && !leaving.current) { e.preventDefault(); e.returnValue = ''; } }, [dirty]));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pool = new Map<string, { reward: RewardSummaryDto; amount: number; manual: boolean }>();
  for (const rule of rules.data ?? []) {
    const count = rule.type === 'each' ? selected.length : rule.type === 'byRank' ? rankRewardPlaceCount(rule) : 1;
    for (const position of rule.rewards) {
      const key = `${rule.type === 'manual'}-${position.rewardVersionId}`;
      pool.set(key, { reward: position.reward, manual: rule.type === 'manual', amount: Number(((pool.get(key)?.amount ?? 0) + position.amount * count).toFixed(10)) });
    }
  }
  const valid = form.name.trim().length >= 3 && form.name.trim().length <= 100 && (form.description?.length ?? 0) <= 1000 && (form.promoCodesPrefix.trim().length >= 3 && form.promoCodesPrefix.trim().length <= 50) && !form.promoCodesPrefix.includes('_') && !!form.startDate && (form.ignoreEndDate || !!form.endDate && new Date(form.endDate) > new Date(form.startDate)) && (form.ignorePromoCodeUsageLimit || Number.isSafeInteger(form.promoCodeUsageLimit) && form.promoCodeUsageLimit! >= 0);
  const update = <K extends keyof CreateEventRequestDto>(key: K, value: CreateEventRequestDto[K]) => setForm((old) => ({ ...old, [key]: value }));
  const save = async (nextStep?: number, publish = false) => {
    try {
      if (promoDirty) { toast.error('Сначала сохраните или отмените изменения правила промокода'); return; }
      if (step === 1) {
        if (!valid) { toast.error('Заполните название, даты и префикс промокода'); return; }
        // DTO still validates this integer even when the limit is disabled.
        const data = { ...form, endDate: form.ignoreEndDate ? null : form.endDate, promoCodeUsageLimit: form.promoCodeUsageLimit ?? 0 };
        if (!event) {
          const created = await create.mutateAsync({ ...data, name: form.name.trim(), promoCodesPrefix: form.promoCodesPrefix.trim(), isDraft: true });
          leaving.current = true;
          navigate(`/rooms/${roomId}/events/${created.id}/edit?step=${nextStep ?? 1}`, { replace: true });
          toast.success('Черновик сохранён'); return;
        }
        const changes: Omit<CreateEventRequestDto, 'roomId' | 'promoCodesPrefix'> & Partial<Pick<CreateEventRequestDto, 'roomId' | 'promoCodesPrefix'>> = { ...data };
        delete changes.roomId;
        delete changes.promoCodesPrefix;
        await patch.mutateAsync({ eventId: event.id, data: changes });
        savedForm.current = JSON.stringify(form);
      }
      if (step === 2) {
        if (participants.isError || members.isError || !participants.data || !members.data || !rules.data) throw new Error('Дождитесь загрузки участников и наград');
        await relations.mutateAsync({ type: 'participants', ambassadorIds: selected });
        setSelectedIds(null);
      }
      if (publish && event) {
        await patch.mutateAsync({ eventId: event.id, data: { isDraft: false } });
        leaving.current = true;
        navigate(`/rooms/${roomId}/events/${event.id}`); toast.success('Событие сохранено'); return;
      }
      if (nextStep) setParams({ step: String(nextStep) });
      else toast.success(event?.isDraft ? 'Черновик сохранён' : 'Изменения сохранены');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось сохранить событие'); }
  };
  const changeType = async (type: 'contest' | 'everyone') => {
    if (!event) return;
    try { await patch.mutateAsync({ eventId: event.id, data: { type } }); update('type', type); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось изменить тип'); }
  };
  return <div className="-m-4 text-[13px] font-medium">
    <header className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2"><ol className="flex gap-3">{['Настройка события', 'Участники', 'Задания'].map((label, index) => <li key={label} className={`flex items-center gap-1.5 ${step < index + 1 ? 'text-muted-foreground' : ''}`}><span className={`flex size-6 items-center justify-center rounded-full ${step === index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{step > index + 1 ? '✓' : index + 1}</span>{label}</li>)}</ol><Button size="sm" variant="outline" disabled={busy} onClick={() => void save()}>{event && !event.isDraft ? 'Сохранить' : 'Сохранить черновик'}</Button></header>
    <div className={step === 2 ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]' : ''}>
    <div className="mx-auto w-full max-w-[732px] px-4 py-9">
      {step === 1 && <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[224px_1fr]"><label htmlFor="event-name">Название</label><Input id="event-name" value={form.name} maxLength={100} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[224px_1fr]"><label htmlFor="event-description">Описание<p className="mt-1 text-muted-foreground">Пару слов о событии</p></label><Textarea id="event-description" value={form.description ?? ''} maxLength={1000} onChange={(e) => update('description', e.target.value)} /></div>
        <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[224px_1fr]"><span>Продолжительность</span><div><Calendar mode="range" numberOfMonths={2} className="max-w-full overflow-x-auto [--cell-size:28px]" selected={{ from: form.startDate ? new Date(form.startDate) : undefined, to: form.endDate ? new Date(form.endDate) : undefined }} onSelect={(range) => { update('startDate', range?.from?.toISOString() ?? ''); update('endDate', range?.to?.toISOString() ?? null); }} /><CheckBox label="Без даты окончания" checked={form.ignoreEndDate} onCheckedChange={(value) => update('ignoreEndDate', value === true)} /></div></div>
        <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[224px_1fr]"><label htmlFor="event-prefix">Префикс промокода</label><div><Input id="event-prefix" maxLength={50} disabled={!!event} value={form.promoCodesPrefix} onChange={(e) => update('promoCodesPrefix', e.target.value)} /><p className="mt-1 text-muted-foreground">Без символа _. После создания не изменяется.</p></div></div>
        <div className="grid gap-4 p-4 md:grid-cols-[224px_1fr]"><span>Лимит активаций</span><div className="space-y-2"><CheckBox label="Без ограничения" checked={form.ignorePromoCodeUsageLimit} onCheckedChange={(value) => update('ignorePromoCodeUsageLimit', value === true)} />{!form.ignorePromoCodeUsageLimit && <Input aria-label="Лимит активаций" type="number" min={0} value={form.promoCodeUsageLimit ?? ''} onChange={(e) => update('promoCodeUsageLimit', e.target.value === '' ? undefined : Number(e.target.value))} />}</div></div>
      </div>}
      {step === 2 && <>
        <section className="rounded-lg border border-border p-4"><h2 className="text-[15px]">Кто будет участвовать</h2><p className="my-2 text-primary">Выбрано: {selected.length}</p><Input type="search" placeholder="Поиск участников..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {members.isError || participants.isError ? <Button variant="outline" onClick={() => { void members.refetch(); void participants.refetch(); }}>Повторить загрузку участников</Button> : members.isLoading || participants.isLoading ? <PageLoader label="Загрузка участников…" /> : <div className="mt-3 max-h-60 space-y-2 overflow-auto">{members.data?.items.filter((item) => item.name.toLocaleLowerCase('ru-RU').includes(search.toLocaleLowerCase('ru-RU'))).map((item) => <CheckBox key={item.ambassadorId} label={item.name} checked={selected.includes(item.ambassadorId)} onCheckedChange={(value) => setSelectedIds(value === true ? [...selected, item.ambassadorId] : selected.filter((id) => id !== item.ambassadorId))} />)}</div>}
          <Button asChild variant="link" className="mt-2 px-0"><Link to={`/rooms/${roomId}/events/${event!.id}/invitations`}>Пригласить отдельно</Link></Button>
        </section>
        <div className="mt-3 flex gap-2"><Button variant={form.type === 'contest' ? 'default' : 'outline'} disabled={busy || !rules.data || rules.data.length > 0} onClick={() => void changeType('contest')}>Конкурс</Button><Button variant={form.type === 'everyone' ? 'default' : 'outline'} disabled={busy || !rules.data || rules.data.length > 0} onClick={() => void changeType('everyone')}>Равная награда</Button></div>
        {!!rules.data?.length && <p className="mt-2 text-muted-foreground">Для смены типа сначала удалите правила наград.</p>}
        <EventRewardEditor scope={scope} type={form.type ?? 'contest'} />
      </>}
      {step === 3 && event && <>
        <EventPromoSetupCard event={event} scope={scope} onDirtyChange={setPromoDirty} />
        <EventTasksSetupSection event={event} />
      </>}
      <footer className="mt-3 flex justify-between gap-3"><Button variant="outline" disabled={busy} onClick={() => promoDirty ? toast.error('Сначала сохраните или отмените изменения правила промокода') : step > 1 ? setParams({ step: String(step - 1) }) : navigate(`/rooms/${roomId}/events`)}>Назад</Button><Button disabled={busy || (step === 1 && !valid)} loading={busy} onClick={() => void save(step < 3 ? step + 1 : undefined, step === 3)}>{step === 3 ? event?.isDraft ? 'Создать событие' : 'Готово' : 'Продолжить'}</Button></footer>
      {event && (event.isDraft || new Date(event.startDate) > new Date()) && <Button variant="ghost" className="mt-4 text-destructive" disabled={busy} onClick={() => setDeleteOpen(true)}>Удалить событие</Button>}
    </div>
    {step === 2 && <aside className="border-l border-border p-4" aria-label="Превью пула наград события"><h2 className="text-[15px]">Пул наград</h2><p className="mt-1 text-muted-foreground">По текущим настройкам{form.type === 'everyone' ? ` · ${selected.length} участников` : ''}</p>{[false, true].map((manual) => <section key={String(manual)} className="mt-4"><h3>{manual ? 'Ручной отбор' : form.type === 'everyone' ? 'Награды каждому' : 'Награды рейтинга'}</h3>{rules.isError ? <p className="mt-2 text-destructive">Не удалось загрузить награды</p> : rules.isLoading ? <p className="mt-2 text-muted-foreground">Загрузка…</p> : [...pool.values()].filter((item) => item.manual === manual).map((item) => <div key={item.reward.versionId} className="mt-2 flex items-center gap-2">{item.reward.iconUrl && <img src={item.reward.iconUrl} alt="" className="size-12 rounded-lg border border-border object-cover" />}<div><p>{item.reward.name}</p><p className="text-muted-foreground">{item.amount.toLocaleString('ru-RU', { maximumFractionDigits: 10 })}</p></div></div>)}{!rules.isLoading && !rules.isError && ![...pool.values()].some((item) => item.manual === manual) && <p className="mt-2 text-muted-foreground">Награды не добавлены</p>}</section>)}</aside>}
    </div>
    <DialogRoot open={blocker.state === 'blocked'} onOpenChange={(open) => { if (!open && blocker.state === 'blocked') blocker.reset(); }}><DialogContent><DialogHeader><DialogTitle>Выйти без сохранения?</DialogTitle><DialogDescription>Несохранённые изменения настроек, выбора участников или промокода будут потеряны. Уже сохранённые правила наград останутся.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Остаться</Button><Button disabled={busy} onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Выйти</Button></DialogFooter></DialogContent></DialogRoot>
    <DialogRoot open={deleteOpen} onOpenChange={(open) => { if (!busy) setDeleteOpen(open); }}><DialogContent><DialogHeader><DialogTitle>Удалить событие?</DialogTitle><DialogDescription>Событие больше не будет доступно участникам.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setDeleteOpen(false)}>Отмена</Button><Button variant="destructive" disabled={busy} onClick={async () => { if (!event) return; try { await patch.mutateAsync({ eventId: event.id, data: { isDeleted: true } }); leaving.current = true; navigate(`/rooms/${roomId}/events`); } catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось удалить событие'); } }}>Удалить</Button></DialogFooter></DialogContent></DialogRoot>
  </div>;
}
