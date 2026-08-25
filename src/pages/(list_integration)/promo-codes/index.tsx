import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { BarChart3, Pencil, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  InputField,
  PageLoader,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from '@senler/ui';
import type { CustomPromoCodeDto } from '@/api/custom-promo-codes';
import { useGetRoomById } from '@/hooks/rooms/useGetRoomById';
import { useCustomPromoCodes } from '@/hooks/promoCodes/useCustomPromoCodes';
import {
  useCreateCustomPromoCode,
  useUpdateCustomPromoCode,
} from '@/hooks/promoCodes/useCustomPromoCodeMutations';

type PromoCodeFormState = {
  name: string;
  promoCode: string;
  startDate: string;
  endDate: string;
  hasUsageLimit: boolean;
  usageLimit: string;
};

const toDateTimeInput = (value: Date | string) =>
  format(typeof value === 'string' ? new Date(value) : value, "yyyy-MM-dd'T'HH:mm");

const emptyForm = (): PromoCodeFormState => {
  const now = new Date();

  return {
    name: '',
    promoCode: '',
    startDate: toDateTimeInput(now),
    endDate: toDateTimeInput(addDays(now, 30)),
    hasUsageLimit: false,
    usageLimit: '1',
  };
};

const getPromoCodeStatus = (promoCode: CustomPromoCodeDto) => {
  const now = Date.now();
  const start = new Date(promoCode.startDate).getTime();
  const end = new Date(promoCode.endDate).getTime();

  if (promoCode.promoCodeUsageLimit !== null && promoCode.promoCodeUsagesCount >= promoCode.promoCodeUsageLimit) {
    return { label: 'Лимит исчерпан', variant: 'secondary' as const };
  }

  if (now < start) {
    return { label: 'Запланирован', variant: 'warning' as const };
  }

  if (now > end) {
    return { label: 'Завершён', variant: 'secondary' as const };
  }

  return { label: 'Активен', variant: 'success' as const };
};

const formatDateTime = (value: string) => format(new Date(value), 'dd.MM.yyyy HH:mm');

export default function PromoCodesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading: isRoomLoading } = useGetRoomById(slug ?? '');
  const roomId = room?.id ?? '';
  const { promoCodes, isLoading, isError, error } = useCustomPromoCodes(roomId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CustomPromoCodeDto | null>(null);
  const [form, setForm] = useState<PromoCodeFormState>(emptyForm);
  const [formError, setFormError] = useState('');

  const {
    createPromoCode,
    isPending: isCreating,
    generalError: createError,
    validationErrors: createErrors,
  } = useCreateCustomPromoCode();
  const {
    updatePromoCode,
    isPending: isUpdating,
    generalError: updateError,
    validationErrors: updateErrors,
  } = useUpdateCustomPromoCode(roomId);

  const isPending = isCreating || isUpdating;
  const generalError = formError || (editing ? updateError : createError);
  const validationErrors = editing ? updateErrors : createErrors;

  useEffect(() => {
    if (!sheetOpen) {
      setEditing(null);
      setForm(emptyForm());
      setFormError('');
    }
  }, [sheetOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setSheetOpen(true);
  };

  const openEdit = (promoCode: CustomPromoCodeDto) => {
    setEditing(promoCode);
    setForm({
      name: promoCode.name,
      promoCode: promoCode.promoCode,
      startDate: toDateTimeInput(promoCode.startDate),
      endDate: toDateTimeInput(promoCode.endDate),
      hasUsageLimit: promoCode.promoCodeUsageLimit !== null,
      usageLimit: String(promoCode.promoCodeUsageLimit ?? 1),
    });
    setFormError('');
    setSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!roomId) return;

    const name = form.name.trim();
    const promoCode = form.promoCode.trim();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    const usageLimit = form.hasUsageLimit ? Number(form.usageLimit) : null;

    if (!name || !promoCode) {
      setFormError('Заполните название и промокод.');
      return;
    }

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
      setFormError('Дата начала должна быть раньше даты окончания.');
      return;
    }

    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) {
      setFormError('Лимит использований должен быть целым числом больше нуля.');
      return;
    }

    if (editing && usageLimit !== null && usageLimit < editing.promoCodeUsagesCount) {
      setFormError(`Лимит не может быть меньше уже выполненных активаций (${editing.promoCodeUsagesCount}).`);
      return;
    }

    const data = {
      name,
      promoCode,
      promoCodeUsageLimit: usageLimit,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    setFormError('');

    if (editing) {
      updatePromoCode(
        { id: editing.id, data },
        {
          onSuccess: () => {
            toast.success('Промокод обновлён');
            setSheetOpen(false);
          },
        }
      );
      return;
    }

    createPromoCode(
      { ...data, roomId },
      {
        onSuccess: () => {
          toast.success('Промокод создан');
          setSheetOpen(false);
        },
      }
    );
  };

  if (isRoomLoading || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <PageLoader label="Загрузка промокодов…" />
      </div>
    );
  }

  return (
    <div className="w-full px-2 py-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Промокоды</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Создавайте самостоятельные промокоды, задавайте сроки действия и ограничение активаций.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          Создать промокод
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error instanceof Error ? error.message : 'Не удалось загрузить промокоды'}</AlertDescription>
        </Alert>
      ) : null}

      {promoCodes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Произвольных промокодов пока нет. Создайте первый код для этой компании.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {promoCodes.map((promoCode) => {
            const status = getPromoCodeStatus(promoCode);
            const usageText =
              promoCode.promoCodeUsageLimit === null
                ? `${promoCode.promoCodeUsagesCount} / без лимита`
                : `${promoCode.promoCodeUsagesCount} / ${promoCode.promoCodeUsageLimit}`;

            return (
              <Card key={promoCode.id} className="border border-border shadow-none">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-foreground">{promoCode.name}</p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <Badge variant="outline" className="mt-2 max-w-full font-mono text-xs">
                        <span className="truncate">{promoCode.promoCode}</span>
                      </Badge>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to={`/rooms/${slug}/statistics?promoCodeId=${promoCode.id}`}>
                          <BarChart3 className="mr-1 size-4" />
                          Статистика
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Изменить промокод ${promoCode.name}`}
                        onClick={() => openEdit(promoCode)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted-foreground">Активации</p>
                      <p className="mt-0.5 font-medium tabular-nums text-foreground">{usageText}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Начало</p>
                      <p className="mt-0.5 font-medium tabular-nums text-foreground">
                        {formatDateTime(promoCode.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Окончание</p>
                      <p className="mt-0.5 font-medium tabular-nums text-foreground">
                        {formatDateTime(promoCode.endDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex !max-h-[min(100dvh,42rem)] flex-col gap-0 overflow-hidden rounded-t-2xl border-0 p-0 sm:mx-auto sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 flex-row items-center gap-2 space-y-0 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setSheetOpen(false)}
              aria-label="Закрыть"
            >
              <X className="size-5" />
            </Button>
            <SheetTitle className="flex-1 text-left text-lg font-medium text-primary-foreground">
              {editing ? 'Изменить промокод' : 'Создать промокод'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-4 py-4">
            {generalError ? (
              <Alert variant="destructive">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Название *</p>
              <InputField
                value={form.name}
                maxLength={100}
                onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                error={!!validationErrors.name?.length}
                helperText={validationErrors.name?.[0]}
                aria-label="Название промокода"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Промокод *</p>
              <InputField
                value={form.promoCode}
                maxLength={100}
                onChange={(event) => setForm((previous) => ({ ...previous, promoCode: event.target.value }))}
                error={!!validationErrors.promoCode?.length}
                helperText={validationErrors.promoCode?.[0]}
                aria-label="Промокод"
              />
              <p className="text-xs text-muted-foreground">От 1 до 100 символов. Код уникален внутри компании.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Начало действия *</p>
                <InputField
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) => setForm((previous) => ({ ...previous, startDate: event.target.value }))}
                  error={!!validationErrors.startDate?.length}
                  helperText={validationErrors.startDate?.[0]}
                  aria-label="Начало действия промокода"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Окончание действия *</p>
                <InputField
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(event) => setForm((previous) => ({ ...previous, endDate: event.target.value }))}
                  error={!!validationErrors.endDate?.length}
                  helperText={validationErrors.endDate?.[0]}
                  aria-label="Окончание действия промокода"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Ограничить число активаций</p>
                  <p className="text-xs text-muted-foreground">Без ограничения промокод действует до даты окончания.</p>
                </div>
                <Switch
                  checked={form.hasUsageLimit}
                  onCheckedChange={(checked) =>
                    setForm((previous) => ({ ...previous, hasUsageLimit: checked }))
                  }
                  aria-label="Ограничить число активаций"
                />
              </div>

              {form.hasUsageLimit ? (
                <InputField
                  type="number"
                  min={1}
                  step={1}
                  value={form.usageLimit}
                  onChange={(event) => setForm((previous) => ({ ...previous, usageLimit: event.target.value }))}
                  error={!!validationErrors.promoCodeUsageLimit?.length}
                  helperText={validationErrors.promoCodeUsageLimit?.[0]}
                  aria-label="Лимит активаций"
                />
              ) : null}
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t border-border bg-background py-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setSheetOpen(false)} disabled={isPending}>
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim() || !form.promoCode.trim() || !form.startDate || !form.endDate}
            >
              {isPending ? 'Сохранение…' : editing ? 'Сохранить' : 'Создать'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
