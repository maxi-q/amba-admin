import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { Avatar, Button, Input, PageLoader } from '@senler/ui';
import { useEvents } from '@/hooks/events/useEvents';
import { useCompetitionRules, useCompetitionGrants, useEventResults } from '@/hooks/competitions/useCompetitionQueries';
import { competitionStatusLabels } from '@/hooks/competitions/types';
import { CompetitionLifecycle } from '@/components/competitions/CompetitionLifecycle';
import { ManualAwardPicker } from '@/components/competitions/ManualAwardPicker';
import { PromoPointsPanel } from '@/components/competitions/PromoPointsPanel';
import pencil from '@/assets/task-flow/pencil.svg';
import user from '@/assets/task-flow/user.svg';

export default function OpenEventPage() {
  const { slug = '', eventId = '' } = useParams();
  const scope = { kind: 'event' as const, id: eventId, roomId: slug };
  const events = useEvents({ page: 1, size: 100 }, slug, { allPages: true });
  const event = events.events.find((item) => item.id === eventId);
  const [search, setSearch] = useState('');
  const [debounced] = useDebounce(search.trim(), 250);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('results');
  const results = useEventResults(eventId, page, debounced);
  const rules = useCompetitionRules(scope);
  const grants = useCompetitionGrants(scope);
  if (events.isLoading) return <PageLoader label="Загрузка события…" />;
  if (events.isError) return <Button onClick={() => void events.refetch()}>Повторить загрузку</Button>;
  if (!event) return <p>Событие не найдено</p>;
  if (event.isDraft) return <Navigate to={`/rooms/${slug}/events/${eventId}/edit`} replace />;
  return <div className="-m-4 grid min-h-[calc(100vh-44px)] grid-cols-1 text-[13px] font-medium lg:grid-cols-[minmax(0,1fr)_260px]">
    <article className="min-w-0"><header className="flex items-center justify-between gap-3 p-4"><h1 className="truncate text-xl font-medium leading-8">{event.name}</h1><div className="flex gap-2">{event.status !== 'completed' && rules.data?.some((rule) => rule.type === 'manual') && <ManualAwardPicker scope={scope} />}{event.status === 'active' && <Button asChild size="icon" variant="outline" className="size-7"><Link to={`/rooms/${slug}/events/${eventId}/edit`} aria-label="Настройки события"><img src={pencil} alt="" /></Link></Button>}</div></header>
      <CompetitionLifecycle scope={scope} status={event.status} />
      <div className="flex flex-wrap gap-2 border-y border-border px-4 py-2"><Button size="sm" variant={tab === 'results' ? 'secondary' : 'ghost'} onClick={() => setTab('results')}>{event.type === 'contest' ? 'Рейтинг' : 'Участники'}</Button><Button size="sm" variant={tab === 'promo' ? 'secondary' : 'ghost'} onClick={() => setTab('promo')}>Промокод</Button><Input className="h-8 min-w-28 flex-1 bg-muted" aria-label="Поиск по рейтингу события" placeholder="Поиск..." type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
      {tab === 'promo' ? <div className="p-4"><PromoPointsPanel scope={scope} editable={event.status === 'active'} /></div> : results.isLoading ? <PageLoader label="Загрузка результатов…" /> : results.isError ? <div className="p-4"><p>Не удалось загрузить итоги.</p><Button onClick={() => void results.refetch()}>Повторить</Button></div> : results.data?.historyUnavailable ? <p className="p-4 text-muted-foreground">Исторические результаты этого события не сохранены.</p> : <>
        {results.data?.items.map((entry) => {
          const ownGrants = grants.data?.items.filter((grant) => grant.ambassadorId === entry.ambassadorId) ?? [];
          const allDelivered = ownGrants.length > 0 && ownGrants.every((grant) => !!grant.deliveredAt);
          const profile = `/rooms/${slug}/events/${eventId}/participants/${entry.ambassadorId}`;
          return <div key={entry.ambassadorId} className="flex min-h-12 flex-wrap items-center gap-2 border-b border-border px-4 py-2">{event.type === 'contest' && <span>{entry.rank == null ? '—' : `${entry.rank}.`}</span>}<Avatar name={entry.username} colorKey={entry.ambassadorId} size="sm" shape="rounded" /><Link to={profile} className="min-w-0 flex-1 truncate">{entry.username}</Link>{event.type === 'contest' && <span title={`Задания: ${entry.taskPoints} XP; промокоды: ${entry.promoPoints} XP`}>{entry.points.toLocaleString('ru-RU')} XP</span>}
            {entry.rewards.map((reward) => <span key={`${reward.rewardId}-${reward.rewardVersionId}`} className="rounded-full bg-muted px-2 py-1 text-xs" title={reward.name}>{reward.name} · {reward.amount.toLocaleString('ru-RU')}</span>)}
            {(event.status === 'awarding' || event.status === 'completed') && !grants.isError && grants.data && (allDelivered ? <span className="text-muted-foreground">✓ Награды отправлены</span> : ownGrants.length > 0 ? <Button asChild size="sm" variant="outline"><Link to={profile}>Отправьте награды</Link></Button> : <span className="text-muted-foreground">Нет назначений</span>)}
            <Button asChild size="icon" variant="outline" className="size-7"><Link to={profile} aria-label={`Профиль исполнителя: ${entry.username}`}><img src={user} alt="" /></Link></Button>
          </div>;
        })}
        {results.data?.items.length === 0 && <p className="p-4 text-muted-foreground">{search ? 'Ничего не найдено' : 'Участников пока нет'}</p>}
        {(results.data?.totalPages ?? 0) > 1 && <div className="flex items-center justify-between p-4"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</Button><span>{page} / {results.data?.totalPages}</span><Button variant="outline" disabled={page >= (results.data?.totalPages ?? 1)} onClick={() => setPage(page + 1)}>Далее</Button></div>}
      </>}
    </article>
    <aside className="border-l border-border"><section className="border-b border-border p-4"><h2>О событии</h2><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{event.description || 'Описание не добавлено'}</p></section><section className="border-b border-border p-4"><p>Статус: {competitionStatusLabels[event.status]}</p><p className="mt-1 text-muted-foreground">{new Date(event.startDate).toLocaleDateString('ru-RU')} – {event.ignoreEndDate ? 'Бессрочно' : event.endDate && new Date(event.endDate).toLocaleDateString('ru-RU')}</p></section>
      {rules.isError ? <Button onClick={() => void rules.refetch()}>Повторить загрузку наград</Button> : rules.data?.map((rule) => <section key={rule.id} className="border-b border-border p-4"><h2>{rule.type === 'each' ? 'Награды каждому' : rule.type === 'manual' ? 'Ручной отбор' : 'Награды рейтинга'}</h2>{rule.rewards.map((position) => <div key={position.id} className="mt-2 flex items-center gap-2">{position.reward.iconUrl && <img src={position.reward.iconUrl} alt="" className="size-12 rounded-lg border border-border object-cover" />}<div><p>{position.reward.name}</p><p className="text-muted-foreground">{position.amount.toLocaleString('ru-RU')}</p></div></div>)}</section>)}
    </aside>
  </div>;
}
