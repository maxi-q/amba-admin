import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  InputField,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomOrdContracts } from "@/hooks/rooms/useRoomOrdContracts";
import { useCreateRoomOrdContract } from "@/hooks/rooms/useCreateRoomOrdContract";
import { useRoomApplications } from "@/hooks/ambassador/useRoomApplications";
import {
  ORD_CONTRACT_ACTION_OPTIONS,
  ORD_CONTRACT_SUBJECT_OPTIONS,
  ORD_CONTRACT_TYPE_OPTIONS,
  ORD_COPY,
} from "./ord.constants";
import { formatOrdDate, ordContractTypeLabel } from "./ord.utils";
import type { IOrdContractFlag, IOrdContractType } from "@services/rooms/rooms.types";

const FLAG_OPTIONS: { value: IOrdContractFlag; label: string }[] = [
  { value: "vat_included", label: "НДС включён" },
  { value: "contractor_is_creatives_reporter", label: "Исполнитель — репортёр креативов" },
  { value: "agent_acting_for_publisher", label: "Агент действует для издателя" },
  { value: "is_charge_paid_by_agent", label: "Вознаграждение платит агент" },
];

const SELECT_EMPTY = "__empty__";

export default function OrdContractsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading, isError, error } = useGetRoomById(slug ?? "");
  const roomId = room?.id ?? "";

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    contracts,
    pagination,
    isLoading: isContractsLoading,
    isError: isContractsError,
    error: contractsError,
  } = useRoomOrdContracts(roomId, { page, size: pageSize });

  const { applications: approvedApps, isLoading: isAppsLoading } = useRoomApplications({
    status: "approved",
    roomIds: roomId ? [roomId] : [],
    page: 1,
    size: 100,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [ambassadorRoomId, setAmbassadorRoomId] = useState("");
  const [contractType, setContractType] = useState<IOrdContractType>("service");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateEndStr, setDateEndStr] = useState("");
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState<string>("");
  const [subjectType, setSubjectType] = useState<string>("");
  const [flags, setFlags] = useState<IOrdContractFlag[]>([]);

  const {
    createRoomOrdContract,
    isPending: isCreatePending,
    generalError: createGeneralError,
    reset: resetCreate,
  } = useCreateRoomOrdContract();

  const resetForm = () => {
    setAmbassadorRoomId("");
    setContractType("service");
    setDateStr(new Date().toISOString().slice(0, 10));
    setDateEndStr("");
    setAmount("");
    setActionType("");
    setSubjectType("");
    setFlags([]);
    resetCreate();
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const toggleFlag = (value: IOrdContractFlag) => {
    setFlags((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));
  };

  const ambassadorOptions = useMemo(
    () =>
      approvedApps.map((a) => ({
        id: a.id,
        label: `${a.name} · ИНН ${a.inn}`,
      })),
    [approvedApps]
  );

  const handleSubmitCreate = () => {
    if (!roomId || !ambassadorRoomId) return;
    const dateIso = new Date(`${dateStr}T12:00:00`).toISOString();
    createRoomOrdContract(
      {
        roomId,
        data: {
          ambassadorRoomId,
          type: contractType,
          date: dateIso,
          ...(dateEndStr ? { dateEnd: new Date(`${dateEndStr}T12:00:00`).toISOString() } : {}),
          ...(amount.trim() ? { amount: amount.trim() } : {}),
          ...(actionType ? { actionType: actionType as (typeof ORD_CONTRACT_ACTION_OPTIONS)[number]["value"] } : {}),
          ...(subjectType
            ? { subjectType: subjectType as (typeof ORD_CONTRACT_SUBJECT_OPTIONS)[number]["value"] }
            : {}),
          ...(flags.length ? { flags } : {}),
        },
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const hasOrdProfile = !!room?.ordPerson;

  if (isRoomLoading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-2 py-6">
        <PageLoader label="Загрузка…" />
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="w-full px-2 py-3">
        <Alert variant="destructive">
          <AlertDescription>{(error as Error)?.message ?? ORD_COPY.roomNotFound}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{ORD_COPY.contractsTitle}</h2>
        <Button type="button" size="lg" onClick={handleOpenDialog} disabled={!hasOrdProfile || isAppsLoading}>
          {ORD_COPY.createContract}
        </Button>
      </div>

      {!hasOrdProfile ? (
        <Alert className="mb-4">
          <AlertDescription>
            {ORD_COPY.noOrdProfileHint}{" "}
            <RouterLink
              to={`/rooms/${slug}/ord/profile`}
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
            >
              Перейти к профилю ОРД
            </RouterLink>
          </AlertDescription>
        </Alert>
      ) : null}

      {isContractsError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {(contractsError as Error)?.message ?? "Не удалось загрузить договоры"}
          </AlertDescription>
        </Alert>
      ) : null}

      {isContractsLoading ? (
        <div className="flex justify-center py-10">
          <PageLoader label="Загрузка договоров…" />
        </div>
      ) : contracts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{ORD_COPY.noContracts}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Тип</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">Дата</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">{ORD_COPY.client}</th>
                  <th className="px-3 py-2.5 text-left font-medium text-foreground">{ORD_COPY.contractor}</th>
                  <th className="px-3 py-2.5 text-right font-medium text-foreground">Сумма</th>
                  <th className="px-3 py-2.5 text-right font-medium text-foreground" />
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-2.5 align-top text-foreground">{ordContractTypeLabel(c.type)}</td>
                    <td className="px-3 py-2.5 align-top text-foreground">{formatOrdDate(c.date)}</td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-foreground">{c.clientOrdPerson.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        ИНН {c.clientOrdPerson.inn}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="text-foreground">{c.contractorOrdPerson.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        ИНН {c.contractorOrdPerson.inn}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right align-top text-foreground">{c.amount ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right align-top">
                      <RouterLink
                        to={`/rooms/${slug}/ord/${c.id}`}
                        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {ORD_COPY.openContract}
                      </RouterLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Назад
              </Button>
              <span className="min-w-[4.5rem] text-center text-sm text-muted-foreground tabular-nums">
                {page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Вперёд
              </Button>
            </div>
          ) : null}
        </>
      )}

      <Sheet
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!next) setDialogOpen(false);
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex !max-h-[min(100dvh,36rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setDialogOpen(false)}
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </Button>
            <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
              {ORD_COPY.createContract}
            </SheetTitle>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {createGeneralError ? (
              <Alert variant="destructive">
                <AlertDescription>{createGeneralError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Амбассадор в комнате *</p>
              <Select
                value={ambassadorRoomId || SELECT_EMPTY}
                onValueChange={(v) => setAmbassadorRoomId(v === SELECT_EMPTY ? "" : v)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_EMPTY}>Выберите…</SelectItem>
                  {ambassadorOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ambassadorOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Нет одобренных амбассадоров с заявкой в эту комнату. Сначала одобрите заявку во вкладке «Заявки».
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Тип договора</p>
              <Select value={contractType} onValueChange={(v) => setContractType(v as IOrdContractType)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORD_CONTRACT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Дата заключения</p>
              <InputField
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                aria-label="Дата заключения"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Дата окончания</p>
              <InputField
                type="date"
                value={dateEndStr}
                onChange={(e) => setDateEndStr(e.target.value)}
                aria-label="Дата окончания"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Сумма</p>
              <InputField
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Необязательно"
                aria-label="Сумма"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Тип действия</p>
              <Select
                value={actionType || SELECT_EMPTY}
                onValueChange={(v) => setActionType(v === SELECT_EMPTY ? "" : v)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Не указано" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_EMPTY}>Не указано</SelectItem>
                  {ORD_CONTRACT_ACTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Предмет договора</p>
              <Select
                value={subjectType || SELECT_EMPTY}
                onValueChange={(v) => setSubjectType(v === SELECT_EMPTY ? "" : v)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Не указано" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_EMPTY}>Не указано</SelectItem>
                  {ORD_CONTRACT_SUBJECT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Флаги</p>
              <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                {FLAG_OPTIONS.map((f) => (
                  <label
                    key={f.value}
                    className="flex cursor-pointer items-start gap-2 text-sm leading-snug"
                  >
                    <input
                      type="checkbox"
                      className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      checked={flags.includes(f.value)}
                      onChange={() => toggleFlag(f.value)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4">
            <Button type="button" variant="outline" size="lg" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleSubmitCreate}
              disabled={!ambassadorRoomId || isCreatePending}
            >
              {isCreatePending ? "Создание…" : "Создать"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
