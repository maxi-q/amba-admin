import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@senler/ui';
import { useApprovedParticipants, useEventParticipants } from '@/hooks/competitions/useCompetitionQueries';
import type { CompetitionScope } from '@/hooks/competitions/types';

export function ManualAwardPicker({ scope }: { scope: CompetitionScope }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const members = useApprovedParticipants(open ? scope.roomId : '');
  const participants = useEventParticipants(open && scope.kind === 'event' ? scope.id : '');
  const eligible = members.data?.items.filter((item) => (scope.kind === 'sprint' || participants.data?.some((p) => p.ambassadorId === item.ambassadorId && p.status === 'approved')) && item.name.toLocaleLowerCase('ru-RU').includes(search.toLocaleLowerCase('ru-RU'))) ?? [];
  return <><Button size="sm" variant="outline" onClick={() => setOpen(true)}>Назначить награду</Button><DialogRoot open={open} onOpenChange={setOpen}><DialogContent className="max-w-[420px]"><DialogHeader><DialogTitle>Ручной отбор</DialogTitle><DialogDescription>Выберите участника, в том числе без места в рейтинге.</DialogDescription></DialogHeader><Input type="search" placeholder="Поиск участника" value={search} onChange={(e) => setSearch(e.target.value)} />
    {members.isError || participants.isError ? <Button onClick={() => { void members.refetch(); if (scope.kind === 'event') void participants.refetch(); }}>Повторить</Button> : members.isLoading || participants.isLoading ? <p>Загрузка…</p> : <div className="max-h-72 overflow-auto">{eligible.map((item) => <Button asChild variant="ghost" className="w-full justify-start" key={item.ambassadorId}><Link to={`/rooms/${scope.roomId}/${scope.kind === 'sprint' ? 'sprints' : 'events'}/${scope.id}/participants/${item.ambassadorId}`}>{item.name}</Link></Button>)}{!eligible.length && <p className="py-3 text-muted-foreground">Ничего не найдено</p>}</div>}
  </DialogContent></DialogRoot></>;
}
