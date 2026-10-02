import { useState } from 'react';
import { Button, CheckBox, DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@senler/ui';
import { toast } from 'sonner';
import { useCompetitionReview, useCompetitionGrants } from '@/hooks/competitions/useCompetitionQueries';
import { useCompetitionActions } from '@/hooks/competitions/useCompetitionActions';
import type { CompetitionScope, CompetitionStatus } from '@/hooks/competitions/types';

export function CompetitionLifecycle({ scope, status, onReview }: { scope: CompetitionScope; status: CompetitionStatus; onReview?: () => void }) {
  const review = useCompetitionReview(scope);
  const grants = useCompetitionGrants(scope, { delivered: false });
  const action = useCompetitionActions(scope);
  const [dialog, setDialog] = useState<'start' | 'finish' | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const unfinished = review.data?.unfinishedAnswers ?? 0;
  const noun = scope.kind === 'sprint' ? 'спринт' : 'событие';
  const run = (value: Parameters<typeof action.mutate>[0]) => action.mutate(value, {
    onSuccess: () => { setDialog(null); setConfirmed(false); toast.success('Статус обновлён'); },
    onError: (error) => toast.error(error.message),
  });
  const openFinish = async () => {
    const fresh = await review.refetch();
    if (fresh.isError) { toast.error('Не удалось проверить оставшиеся ответы'); return; }
    setDialog('finish');
  };
  if (status === 'completed') return <p className="px-4 pb-3 text-[13px] text-muted-foreground">{review.data?.resultsFixedAt ? 'Итоги зафиксированы. Все назначенные награды выданы.' : 'Завершено.'}</p>;
  if (status === 'awarding' && review.data && !review.data.resultsFixedAt) return <p className="px-4 pb-3 text-[13px] text-muted-foreground">Исторические итоги не сохранены. Выдача и завершение недоступны без зафиксированных результатов.</p>;
  return <>
    <section className="mx-4 mb-4 rounded-lg border border-border p-3 text-[13px] leading-4" aria-label="Завершение">
      {status === 'active' ? <div className="flex flex-wrap items-center justify-between gap-2"><span>Переход к проверке завершит приём новых ответов и активаций</span><Button variant="outline" size="sm" onClick={() => setDialog('start')}>Завершить {noun}</Button></div>
        : status === 'reviewing' ? <>
          <p>Приём новых ответов завершён</p>
          <p className="mt-1 text-muted-foreground">Проверьте оставшиеся ответы перед начислением наград</p>
          {review.isError ? <Button variant="outline" onClick={() => void review.refetch()}>Повторить загрузку проверки</Button> : <div className="mt-2 flex flex-wrap items-center gap-2">
            {onReview && <Button size="sm" onClick={onReview}>Смотреть ответы · {review.data?.waitingReviewAnswers ?? '…'}</Button>}
            <Button size="sm" variant="outline" disabled={!review.data || review.isFetching || action.isPending} onClick={() => void openFinish()}>{unfinished ? 'Пропустить' : 'Зафиксировать итоги'}</Button>
            {review.data && <span className="text-muted-foreground">На проверке: {review.data.uniqueAmbassadors} участников · Не завершено: {unfinished} ответов</span>}
          </div>}
        </> : <>
          <p>Итоги зафиксированы. Отправьте награды оставшимся участникам.</p>
          {grants.isError ? <Button variant="outline" onClick={() => void grants.refetch()}>Повторить загрузку наград</Button> : <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {grants.data?.total === 0 ? <CheckBox checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} label="Я отправил все награды" /> : <span className="text-muted-foreground">Осталось выдать: {grants.data?.total ?? '…'}. Откройте награды участника в рейтинге.</span>}
            <Button size="sm" disabled={!confirmed || !grants.data || grants.data.total > 0 || grants.isFetching || action.isPending} onClick={() => run({ type: 'status', status: 'completed' })}>Завершить {noun}</Button>
          </div>}
        </>}
    </section>
    <DialogRoot open={dialog !== null} onOpenChange={(open) => { if (!open && !action.isPending) setDialog(null); }}>
      <DialogContent className="max-w-[358px]">
        <DialogHeader><DialogTitle>{dialog === 'start' ? 'Перейти к проверке ответов?' : unfinished ? 'Пропустить проверку' : 'Зафиксировать итоги?'}</DialogTitle>
          <DialogDescription>{dialog === 'start' ? 'Новые ответы и активации промокодов больше не принимаются. Ранее отправленные ответы можно проверить до фиксации итогов.'
            : `Не завершено: ${unfinished} ответов. У ${review.data?.uniqueAmbassadors ?? 0} участников есть ответы на проверке. Неутверждённые ответы не принесут XP. После фиксации изменить результаты нельзя.`}</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" disabled={action.isPending} onClick={() => setDialog(null)}>Отмена</Button><Button variant={dialog === 'finish' && unfinished > 0 ? 'destructive' : 'default'} loading={action.isPending} disabled={action.isPending} onClick={() => run(dialog === 'start' ? { type: 'status', status: 'reviewing' } : { type: 'finish-review' })}>{dialog === 'start' ? 'Перейти к проверке' : unfinished ? 'Пропустить' : 'Зафиксировать'}</Button></DialogFooter>
      </DialogContent>
    </DialogRoot>
  </>;
}
