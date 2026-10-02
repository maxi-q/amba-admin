import { Link, useParams } from 'react-router-dom';
import { Avatar, Button, PageLoader } from '@senler/ui';
import { useEvents } from '@/hooks/events/useEvents';
import { useAmbassadors } from '@/hooks/ambassador/useAmbassadors';
import { CompetitionAwards } from '@/components/competitions/CompetitionAwards';
import { PromoPointsPanel } from '@/components/competitions/PromoPointsPanel';
import back from '@/assets/task-flow/back.svg';

export default function EventParticipantPage() {
  const { slug = '', eventId = '', ambassadorId = '' } = useParams();
  const events = useEvents({ page: 1, size: 100 }, slug, { allPages: true });
  const people = useAmbassadors({ roomIds: [slug], ambassadorIds: [ambassadorId], page: 1, size: 1 });
  const event = events.events.find((item) => item.id === eventId);
  const person = people.ambassadors.find((item) => item.id === ambassadorId);
  const scope = { kind: 'event' as const, id: eventId, roomId: slug };
  return <div className="mx-auto max-w-[700px] text-[13px]"><Button asChild variant="outline" className="mb-3 size-7 p-0"><Link to={`/rooms/${slug}/events/${eventId}`} aria-label="Назад к событию"><img src={back} alt="" /></Link></Button>
    {events.isLoading || people.isLoading ? <PageLoader label="Загрузка участника…" /> : events.isError || people.isError ? <Button onClick={() => { void events.refetch(); void people.refetch(); }}>Повторить загрузку</Button> : !event || !person ? <p>Участник или событие не найдено</p> : <>
      <section className="flex items-center gap-3 rounded-lg border border-border p-4"><Avatar src={person.avatarUrl} name={person.username} colorKey={person.id} className="size-16 rounded-full" /><h1 className="text-xl font-medium">{person.username}</h1></section>
      <CompetitionAwards scope={scope} ambassadorId={ambassadorId} status={event.status} /><PromoPointsPanel scope={scope} ambassadorId={ambassadorId} />
    </>}
  </div>;
}
