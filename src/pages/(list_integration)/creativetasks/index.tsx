import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Alert, AlertDescription, Button, PageLoader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomCreativeTasks } from "@/hooks/creativetasks/useRoomCreativeTasks";
import { useSprints } from "@/hooks/sprints/useSprints";
import { CreativeTaskRow } from "./components/CreativeTaskRow";
import { CreativesPaginationControls } from "./components/CreativesPaginationControls";
import plus from "@/assets/task-flow/plus.svg";

export default function CreativeTasksPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const roomQuery = useGetRoomById(slug);
  const tasksQuery = useRoomCreativeTasks(roomQuery.room?.id ?? "", { page, size: pageSize });
  const sprintsQuery = useSprints({ page: 1, size: 100 }, slug, { allPages: true });
  const { tasks, pagination } = tasksQuery;
  const createPath = "/rooms/" + slug + "/creativetasks/new";
  const loading = roomQuery.isLoading || tasksQuery.isLoading;
  const error = roomQuery.isError || tasksQuery.isError;

  return <div className="-m-4 min-h-full w-[calc(100%+2rem)] bg-card text-black">
    <header className="flex h-12 items-center justify-between border-b border-border px-4">
      <h1 className="text-[13px] font-medium leading-4 tracking-[-0.0325px]">Задания</h1>
      <Button asChild className="h-7 gap-1 bg-[#2563eb] px-2 text-[13px] font-medium shadow-none hover:bg-[#2563eb]/90"><Link to={createPath}><img src={plus} alt="" />Добавить</Link></Button>
    </header>
    {error ? <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить задания.<Button variant="outline" onClick={() => { void roomQuery.refetch(); void tasksQuery.refetch(); }}>Повторить</Button></AlertDescription></Alert> : loading ? <div className="flex justify-center py-8"><PageLoader label="Загрузка заданий…" /></div> : <>
      {sprintsQuery.isError && <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>Не удалось загрузить сроки и статусы спринтов. Редактирование временно недоступно.<Button variant="outline" onClick={() => void sprintsQuery.refetch()}>Повторить</Button></AlertDescription></Alert>}
      <div className="overflow-x-auto">{tasks.filter((task) => !task.isDeleted).map((task) => <CreativeTaskRow key={task.id} task={task} sprint={sprintsQuery.sprints.find((sprint) => sprint.id === task.sprintId)} roomSlug={slug} />)}</div>
      {tasks.length === 0 && <p className="px-4 py-6 text-[13px] text-muted-foreground">{page === 1 ? <>Заданий пока нет. <Link to={createPath} className="text-primary underline">Добавьте первое задание</Link>.</> : "На этой странице заданий нет. Вернитесь на предыдущую страницу."}</p>}
      {pagination && pagination.total > 0 && <footer className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted-foreground">
        <span>Всего: {pagination.total}</span>
        {pagination.totalPages > 1 && <CreativesPaginationControls page={page} totalPages={pagination.totalPages} onPageChange={setPage} />}
        <div className="flex items-center gap-2"><span>На странице</span><Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}><SelectTrigger aria-label="Заданий на странице" className="h-7 w-20"><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select></div>
      </footer>}
      {tasks.length === 0 && page > 1 && <Button variant="outline" className="mx-4" onClick={() => setPage(page - 1)}>Предыдущая страница</Button>}
    </>}
  </div>;
}
