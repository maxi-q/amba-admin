import { useContext, useState, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, Button, Card, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle, InputField, PageLoader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, TabsList, TabsRoot, TabsTrigger } from "@senler/ui";
import { toast } from "sonner";
import type { RoomOrdProfileResponseDto, UpdateRoomOrdProfileRequestDto } from "@/api/generated/model";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useCreateRoomOrdProfile } from "@/hooks/rooms/useCreateRoomOrdProfile";
import { useUpdateRoomOrdProfile } from "@/hooks/rooms/useUpdateRoomOrdProfile";
import { QueryKeys } from "@/config/tanstack/queryKeys";
import { validateOrdProfileName } from "@/utils/ordProfileName";
import { applyRuPhoneChange, formatRuMobileInput, INITIAL_RU_PHONE_DISPLAY, isCompleteRuMobile, ruPhoneToE164 } from "@/utils/ruPhone";
import { validateInn } from "@/utils/validateInn";
import earthIcon from "@/assets/ord-profile/earth.svg";
import closeIcon from "@/assets/ord-profile/close.svg";
import checkIcon from "@/assets/ord-profile/check.svg";
import userIcon from "@/assets/ord-profile/user.svg";
import { OrdProfilePreviewContext } from "./OrdProfilePreviewContext";
import { ORD_COPY, type OrdJuridicalType } from "./ord.constants";
import "./profile.css";

export default function OrdProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { room, isLoading, isError, error } = useGetRoomById(slug ?? "");

  return <section className="ord-profile-page">
    <header className="flex h-12 items-center border-b border-border px-4">
      <h1 className="text-[13px] font-medium leading-4">Профиль ОРД</h1>
    </header>
    {isLoading ? <div className="p-10"><PageLoader label="Загрузка…" /></div>
      : isError || !room ? <Alert variant="destructive" className="m-4 w-auto"><AlertDescription>{(error as Error)?.message ?? "Компания не найдена"}</AlertDescription></Alert>
        : <OrdProfileForm key={`${room.id}:${room.ordPerson?.id ?? "new"}`} roomId={room.id} profile={room.ordPerson ?? null} />}
  </section>;
}

function OrdProfileForm({ roomId, profile }: { roomId: string; profile: RoomOrdProfileResponseDto | null }) {
  const previewContext = useContext(OrdProfilePreviewContext);
  const preview = import.meta.env.DEV ? previewContext : null;
  const queryClient = useQueryClient();
  const create = useCreateRoomOrdProfile();
  const update = useUpdateRoomOrdProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile ? formatRuMobileInput(profile.phone) : INITIAL_RU_PHONE_DISPLAY);
  const [inn, setInn] = useState(profile?.inn ?? "");
  const [juridicalType, setJuridicalType] = useState<OrdJuridicalType>(
    profile?.juridicalType === "ip" || profile?.juridicalType === "juridical"
      ? profile.juridicalType
      : "physical",
  );
  const [details, setDetails] = useState(preview?.details ?? { foreign: false, paymentNumber: "", country: "", address: "" });
  const [savedDetails, setSavedDetails] = useState(details);
  const [savedForeignDraft, setSavedForeignDraft] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [lockOpen, setLockOpen] = useState(preview?.locked ?? false);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const pending = create.isPending || update.isPending;
  const mutation = profile ? update : create;
  const apiErrors = mutation.validationErrors;
  const fullName = name.trim().replace(/\s+/g, " ");
  const innValidation = validateInn(inn, juridicalType);
  const nameValidation = validateOrdProfileName(name, juridicalType);
  const nameError = apiErrors.name?.[0] ?? (attempted ? nameValidation : undefined);
  const phoneError = apiErrors.phone?.[0] ?? (attempted && !isCompleteRuMobile(phone) ? ORD_COPY.phoneFormatHint : undefined);
  const innError = apiErrors.inn?.[0] ?? ((attempted || !!inn) ? innValidation.error ?? undefined : undefined);
  const foreignDemo = !!preview && details.foreign;
  const nameLabel = juridicalType === "juridical" ? "Наименование организации" : "ФИО";
  const statusLabel = juridicalType === "juridical" ? "Юридическое лицо" : juridicalType === "ip" ? "Индивидуальный предприниматель" : "Физическое лицо";
  const locked = !!preview?.locked;
  const detailsChanged = JSON.stringify(details) !== JSON.stringify(savedDetails);
  const foreignDraft = JSON.stringify({ name: fullName, phone: ruPhoneToE164(phone), juridicalType, details });
  const changed = profile
    ? fullName !== profile.name || ruPhoneToE164(phone) !== profile.phone || detailsChanged
    : foreignDemo && savedForeignDraft ? foreignDraft !== savedForeignDraft : !!(name || inn || isCompleteRuMobile(phone));

  const saveDemoDetails = () => {
    setSavedDetails({ ...details });
    setSavedForeignDraft(foreignDraft);
    setAttempted(false);
  };

  const onSuccess = () => {
    saveDemoDetails();
    void queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOMS, roomId] });
    toast.success(preview ? "Демо-профиль сохранён на стенде" : "Профиль ОРД сохранён");
  };

  const handleSave = () => {
    if (pending || !changed) return;
    setAttempted(true);
    if (nameValidation || !isCompleteRuMobile(phone)) return;
    if (foreignDemo && (!details.paymentNumber.trim() || !details.country || !details.address.trim())) return;
    if (!profile && !foreignDemo && innValidation.error) return;
    mutation.reset();

    if (profile) {
      // The update contract allows only these two fields. Never send preview-only details.
      const data: UpdateRoomOrdProfileRequestDto = {};
      if (fullName !== profile.name) data.name = fullName;
      if (ruPhoneToE164(phone) !== profile.phone) data.phone = ruPhoneToE164(phone);
      if (Object.keys(data).length) update.updateRoomOrdProfile({ roomId, data }, { onSuccess });
      else { saveDemoDetails(); toast.success("Демо-реквизиты сохранены только в браузере"); }
    } else if (foreignDemo) {
      // Foreign-profile creation is not in the API. This is a local prototype, not a fake POST.
      saveDemoDetails();
      toast.success("Демо-реквизиты сохранены только в браузере");
    } else {
      create.createRoomOrdProfile({ roomId, data: {
        inn: innValidation.normalized, name: fullName, phone: ruPhoneToE164(phone), juridicalType,
      } }, { onSuccess });
    }
  };

  const lockedFieldProps = locked ? {
    readOnly: true,
    onClick: () => setLockOpen(true),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setLockOpen(true); }
    },
  } : {};

  const foreignControl = <div className="mb-1 flex h-12 items-center gap-1.5 rounded-md border border-border py-2 pl-2 pr-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-muted"><img src={earthIcon} alt="" className="size-5" /></span>
    <div className="min-w-0 flex-1"><label htmlFor="ord-foreign" className="block text-black">Иностранный контрагент</label><p className="text-muted-foreground">Для нерезидентов РФ</p></div>
    <Switch id="ord-foreign" aria-label="Иностранный контрагент" size="tiny" checked={foreignDemo} disabled={!preview || pending}
      aria-describedby={!preview ? "ord-foreign-unavailable" : undefined}
      onCheckedChange={(foreign) => locked ? setLockOpen(true) : setDetails((prev) => ({ ...prev, foreign }))} />
  </div>;

  return <>
    <form className="mx-auto mt-10 w-[358px] max-w-[calc(100%-32px)] pb-8" noValidate onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
      <Card className="flex flex-col gap-3 rounded-lg border border-border bg-white p-[15px] shadow-none">
        {profile ? <div className="ord-profile-status">
          <span className="ord-profile-status-avatar"><img src={userIcon} alt="" /></span>
          <div className="min-w-0 flex-1"><p>{statusLabel}</p><p className="text-muted-foreground">{foreignDemo ? "Нерезидент РФ" : "Резидент РФ"}</p></div>
          <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none" disabled={pending} onClick={() => setChangeStatusOpen(true)}>Сменить</Button>
        </div> : <>
        <TabsRoot value={juridicalType} onValueChange={(value) => setJuridicalType(value as OrdJuridicalType)}>
          <TabsList className="w-full" aria-label="Юридический тип">
            {([['physical', 'Физ. лицо'], ['juridical', 'Юр. лицо'], ['ip', 'ИП']] as const).map(([value, label]) => <TabsTrigger
              key={value} value={value} className="h-6 flex-1 disabled:opacity-100"
              disabled={pending}
            >{label}</TabsTrigger>)}
          </TabsList>
        </TabsRoot>
        {apiErrors.juridicalType?.[0] && <p role="alert" className="text-destructive">{apiErrors.juridicalType[0]}</p>}
        {foreignControl}
        </>}

        {profile && changed && <p className="rounded-md bg-muted p-2"><span className="text-[#f98600]">Внимание!</span> Убедитесь, что вы вносите актуальные данные, они будут отображаться в будущих актах</p>}

        {mutation.generalError && <Alert variant="destructive"><AlertDescription>{mutation.generalError}</AlertDescription></Alert>}
        {profile?.lastSyncError && <Alert variant="destructive"><AlertDescription>{profile.lastSyncError}</AlertDescription></Alert>}

        <InputField label={nameLabel} autoComplete={juridicalType === "juridical" ? "organization" : "name"} value={name} onChange={(event) => setName(event.target.value)} disabled={pending}
          error={!!nameError} aria-invalid={!!nameError} helperText={nameError} />
        <InputField label="Номер телефона" type="tel" autoComplete="tel" value={phone}
          onChange={(event) => setPhone((prev) => applyRuPhoneChange(prev, event.target.value))} disabled={pending}
          error={!!phoneError} aria-invalid={!!phoneError} helperText={phoneError} />

        {foreignDemo ? <>
          <InputField label="Номер электронного средства платежа" value={details.paymentNumber} disabled={pending} {...lockedFieldProps}
            onChange={(event) => setDetails((prev) => ({ ...prev, paymentNumber: event.target.value }))}
            error={attempted && !details.paymentNumber.trim()} aria-invalid={attempted && !details.paymentNumber.trim()} helperText={attempted && !details.paymentNumber.trim() ? ORD_COPY.requiredField : undefined} />
          <div className="flex flex-col gap-2">
            <label id="ord-country-label" className="text-muted-foreground">Страна</label>
            <Select value={details.country} onValueChange={(country) => setDetails((prev) => ({ ...prev, country }))} open={locked ? false : undefined} onOpenChange={(open) => { if (open && locked) setLockOpen(true); }}>
              <SelectTrigger aria-labelledby="ord-country-label" disabled={pending} aria-invalid={attempted && !details.country} className="h-10 w-full"><SelectValue placeholder="Выберите страну" /></SelectTrigger>
              <SelectContent className="ord-profile-select">{preview.countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
            </Select>
            {attempted && !details.country && <p role="alert" className="text-destructive">{ORD_COPY.requiredField}</p>}
          </div>
          <InputField label="Адрес" autoComplete="street-address" value={details.address} disabled={pending} {...lockedFieldProps}
            onChange={(event) => setDetails((prev) => ({ ...prev, address: event.target.value }))}
            error={attempted && !details.address.trim()} aria-invalid={attempted && !details.address.trim()} helperText={attempted && !details.address.trim() ? ORD_COPY.requiredField : undefined} />
        </> : <InputField label="ИНН" inputMode="numeric" value={inn} readOnly={!!profile} disabled={pending}
          title={profile ? "ИНН уже созданного профиля нельзя изменить через API" : undefined}
          onChange={(event) => setInn(event.target.value)} error={!profile && !!innError} aria-invalid={!profile && !!innError} helperText={!profile ? innError : undefined}
          {...lockedFieldProps} />}
      </Card>
      <div className="mt-3 flex justify-end"><Button type="submit" className="h-10 rounded-md px-3 text-[13px] font-medium leading-4 shadow-none disabled:opacity-100" disabled={pending || !changed}>
        {pending ? ORD_COPY.savePending : ORD_COPY.save}
      </Button></div>
      {profile && <details className="mt-4 text-muted-foreground">
        <summary className="cursor-pointer">{preview ? "Демо-параметры" : "Дополнительные параметры"}</summary>
        <div className="mt-3">{foreignControl}</div>
      </details>}
      {preview ? <p className="mt-4 text-muted-foreground">Демо: иностранные реквизиты и блокировка после актов пока не поддерживаются API. Изменения реквизитов сбрасываются при выходе со страницы или её перезагрузке.</p>
        : <p id="ord-foreign-unavailable" className="mt-4 text-muted-foreground">Иностранные реквизиты пока недоступны: API не поддерживает страну, адрес и платёжные данные.{profile && " ИНН и юридический тип после создания не изменяются; имя контрагента и телефон можно редактировать."}</p>}
    </form>

    <DialogRoot open={changeStatusOpen} onOpenChange={setChangeStatusOpen}>
      <DialogContent data-ord-profile-dialog showCloseButton={false} className="w-[358px] max-w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:max-w-[358px]">
        <DialogHeader className="h-11 flex-row items-center justify-between gap-2 space-y-0 px-4 py-2.5 text-left">
          <DialogTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px]">Сменить статус</DialogTitle>
          <DialogClose asChild><Button variant="ghost" aria-label="Закрыть" className="size-6 shrink-0 p-0"><img src={closeIcon} alt="" className="size-6" /></Button></DialogClose>
        </DialogHeader>
        <DialogDescription className="px-4 py-2 text-[13px] font-medium leading-4 text-muted-foreground">Чтобы сменить ваш статус контрагента, необходимо создать новую компанию</DialogDescription>
        <DialogFooter className="flex-row justify-end px-4 py-2.5"><Button asChild className="h-7 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none"><Link to="/">Создать новую компанию</Link></Button></DialogFooter>
      </DialogContent>
    </DialogRoot>

    {preview && <DialogRoot open={lockOpen} onOpenChange={setLockOpen}>
      <DialogContent data-ord-profile-dialog showCloseButton={false} className="w-[358px] max-w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 text-black sm:max-w-[358px]">
        <DialogHeader className="h-11 flex-row items-center justify-between gap-2 space-y-0 px-4 py-2.5 text-left">
          <DialogTitle className="text-[15px] font-medium leading-5 tracking-[-0.135px]">Редактирование невозможно</DialogTitle>
          <DialogClose asChild><Button variant="ghost" aria-label="Закрыть" className="size-6 shrink-0 p-0"><img src={closeIcon} alt="" className="size-6" /></Button></DialogClose>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-4 py-2">
          <DialogDescription className="text-[13px] font-medium leading-4 text-[#797979]">Данные вашего профиля уже зафиксированы в актах. Менять данные для ОРД запрещено</DialogDescription>
          <div className="flex flex-col gap-2"><p>Что можно менять в ОРД для физлица</p>
            {["ФИО", "Номер телефона"].map((label) => <p key={label} className="flex items-center gap-1.5"><img src={checkIcon} alt="" className="size-3.5" />{label}</p>)}
          </div>
        </div>
        <DialogFooter className="flex-row justify-end px-4 py-2.5"><Button asChild className="h-7 rounded-md px-2 text-[13px] font-medium leading-4 shadow-none"><Link to="/">Создать новую компанию</Link></Button></DialogFooter>
      </DialogContent>
    </DialogRoot>}
  </>;
}
