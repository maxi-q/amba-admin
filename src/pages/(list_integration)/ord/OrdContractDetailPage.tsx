import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  PageLoader,
} from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomOrdContract } from "@/hooks/rooms/useRoomOrdContract";
import { useDeleteRoomOrdContract } from "@/hooks/rooms/useDeleteRoomOrdContract";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_COPY,
} from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";

function labelFromOptions<T extends string>(
  options: { value: T; label: string }[],
  value: T | null | undefined
): string {
  if (value == null) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function OrdContractDetailPage() {
  const { slug, contractId } = useParams<{ slug: string; contractId: string }>();
  const navigate = useNavigate();

  const { room, isLoading: isRoomLoading, isError: isRoomErr, error: roomError } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const {
    contract,
    isLoading: isContractLoading,
    isError: isContractErr,
    error: contractError,
  } = useRoomOrdContract(roomId, contractId ?? "");

  const { deleteRoomOrdContract, isPending: isDeletePending, generalError: deleteError } =
    useDeleteRoomOrdContract();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = () => {
    if (!roomId || !contractId) return;
    deleteRoomOrdContract(
      { roomId, contractId },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          navigate(`/rooms/${slug}/ord`);
        },
      }
    );
  };

  if (!contractId) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>Не указан договор</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isRoomLoading || (roomId && contractId && isContractLoading)) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isRoomErr || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{(roomError as Error)?.message ?? ORD_COPY.roomNotFound}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isContractErr || !contract) {
    return (
      <div className="w-full space-y-4 px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{(contractError as Error)?.message ?? "Договор не найден"}</AlertDescription>
        </Alert>
        <RouterLink
          to={`/rooms/${slug}/ord`}
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          К списку договоров
        </RouterLink>
      </div>
    );
  }

  const c = contract;

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{ORD_COPY.contractDetail}</h2>
        <div className="flex flex-wrap gap-2">
          <RouterLink
            to={`/rooms/${slug}/ord`}
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            К списку
          </RouterLink>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeletePending}
          >
            {ORD_COPY.deleteContract}
          </Button>
        </div>
      </div>

      {deleteError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border border-border shadow-sm">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <Row label="Тип" value={ordContractTypeLabel(c.type)} />
          <Row label="Дата заключения" value={formatOrdDate(c.date)} />
          <Row label="Дата окончания" value={c.dateEnd ? formatOrdDate(c.dateEnd) : "—"} />
          <Row label="Сумма" value={c.amount ?? "—"} />
          <Row label="Тип действия" value={labelFromOptions(ORD_CONTRACT_ACTION_OPTIONS, c.actionType)} />
          <Row label="Предмет" value={labelFromOptions(ORD_CONTRACT_SUBJECT_OPTIONS, c.subjectType)} />
          <Row label="Флаги" value={c.flags.length ? c.flags.join(", ") : "—"} />
          <p className="pt-2 text-sm font-semibold text-foreground">{ORD_COPY.client}</p>
          <p className="text-sm text-foreground">
            {c.clientOrdPerson.name} · ИНН {c.clientOrdPerson.inn}
          </p>
          <p className="pt-2 text-sm font-semibold text-foreground">{ORD_COPY.contractor}</p>
          <p className="text-sm text-foreground">
            {c.contractorOrdPerson.name} · ИНН {c.contractorOrdPerson.inn}
          </p>
          <Row label="Синхронизация" value={c.syncedAt ? formatOrdDate(c.syncedAt) : "—"} />
          {c.lastSyncError ? (
            <Alert className="border-amber-500/40 bg-amber-500/5">
              <AlertDescription>{c.lastSyncError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) setConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить договор?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {isDeletePending ? "Удаление…" : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <p className="min-w-[10rem] shrink-0 text-sm text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
