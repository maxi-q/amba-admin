import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  Button,
  PageLoader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@senler/ui";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomApplications } from "@/hooks/ambassador/useRoomApplications";
import { useEventApplications } from "@/hooks/ambassador/useEventApplications";
import { useApproveRoomApplications } from "@/hooks/ambassador/useApproveRoomApplications";
import { useApproveEventApplications } from "@/hooks/ambassador/useApproveEventApplications";
import { useAmbassadors } from "@/hooks/ambassador/useAmbassadors";
import { useEvents } from "@/hooks/events/useEvents";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import { ApplicationCard } from "./components/ApplicationCard";
import { EventAutocomplete } from "../statistics/components/EventAutocomplete";
import { useApproveAllPendingRoomApplications } from "@/hooks/ambassador/useApproveAllPendingRoomApplications";
import { CreativesPaginationControls } from "../creativetasks/components/CreativesPaginationControls";

const tabInactive =
  "relative border-0 bg-transparent px-0 pb-3 pt-0 text-left text-[15px] font-normal text-muted-foreground transition-colors hover:text-foreground";
const tabActive =
  "relative border-0 bg-transparent px-0 pb-3 pt-0 text-left text-[15px] font-semibold text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary";

type TabType = "room" | "event";
type StatusType = "pending" | "approved" | "rejected";

const STATUS_OPTIONS: { value: StatusType; label: string }[] = [
  { value: "pending", label: "Ожидает рассмотрения" },
  { value: "approved", label: "Одобрено" },
  { value: "rejected", label: "Отклонено" },
];

const PAGE_SIZES = [10, 25, 50, 100] as const;

export default function ApplicationsPage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("room");

  const [roomStatus, setRoomStatus] = useState<StatusType>("pending");
  const [eventStatus, setEventStatus] = useState<StatusType>("pending");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  const [appliedRoomStatus, setAppliedRoomStatus] = useState<StatusType>("pending");
  const [appliedEventStatus, setAppliedEventStatus] = useState<StatusType>("pending");
  const [appliedEventIds, setAppliedEventIds] = useState<string[]>([]);

  const [roomPage, setRoomPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  const {
    room: roomData,
    isLoading: isLoadingRoomData,
    isError: isRoomDataError,
    error: roomDataError
  } = useGetRoomById(slug || "");

  const { events } = useEvents({ page: 1, size: 100 }, slug || "");
  const { ambassadors } = useAmbassadors({ page: 1, size: 100 });

  const eventNameMap = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((event) => {
      map.set(event.id, event.name);
    });
    return map;
  }, [events]);

  const ambassadorNameMap = useMemo(() => {
    const map = new Map<string, string>();
    ambassadors.forEach((amb) => {
      const name = (amb as { name?: string }).name || amb.promoCode || amb.id;
      map.set(amb.id, name);
    });
    return map;
  }, [ambassadors]);

  const {
    applications: roomApplications,
    isLoading: isLoadingRoom,
    refetch: refetchRoom,
    pagination: roomPagination
  } = useRoomApplications({
    status: appliedRoomStatus,
    roomIds: roomData?.id ? [roomData.id] : [],
    page: roomPage,
    size: pageSize
  });

  const {
    applications: eventApplications,
    isLoading: isLoadingEvent,
    refetch: refetchEvent,
    pagination: eventPagination
  } = useEventApplications({
    status: appliedEventStatus,
    eventIds: appliedEventIds,
    page: eventPage,
    size: pageSize
  });

  const {
    approveRoomApplications,
    isSuccess: isRoomApproveSuccess,
    isError: isRoomApproveError,
    generalError: roomApproveError
  } = useApproveRoomApplications();

  const {
    approveEventApplications,
    isSuccess: isEventApproveSuccess,
    isError: isEventApproveError,
    generalError: eventApproveError
  } = useApproveEventApplications();

  const {
    approveAllPendingRoomApplications,
    isSuccess: isAllPendingApproveSuccess,
    isError: isAllPendingApproveError,
    generalError: allPendingApproveError,
  } = useApproveAllPendingRoomApplications();

  useEffect(() => {
    if (isRoomApproveSuccess || isEventApproveSuccess || isAllPendingApproveSuccess) {
      toast.success("Заявки одобрены");
      setApprovedIds((prev) => new Set([...prev, ...approvingIds]));
      setApprovingIds(new Set());
      setIsApprovingAll(false);
    }
  }, [isRoomApproveSuccess, isEventApproveSuccess, isAllPendingApproveSuccess]);

  useEffect(() => {
    if (isRoomApproveError || isEventApproveError || isAllPendingApproveError) {
      setApprovingIds(new Set());
      setIsApprovingAll(false);
    }
  }, [isRoomApproveError, isEventApproveError, isAllPendingApproveError]);

  const handleTabChange = (newValue: TabType) => {
    setActiveTab(newValue);
    setApprovedIds(new Set());
  };

  const handlePaginationPageChange = (page: number) => {
    setApprovedIds(new Set());
    if (activeTab === "room") {
      setRoomPage(page);
    } else {
      setEventPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setRoomPage(1);
    setEventPage(1);
    setApprovedIds(new Set());
  };

  const handleRoomStatusChange = (status: StatusType) => {
    setRoomStatus(status);
  };

  const handleEventStatusChange = (status: StatusType) => {
    setEventStatus(status);
  };

  const handleApplyFilters = () => {
    setApprovedIds(new Set());
    if (activeTab === "room") {
      setAppliedRoomStatus(roomStatus);
      setRoomPage(1);
      void refetchRoom();
    } else {
      setAppliedEventStatus(eventStatus);
      setAppliedEventIds(selectedEventIds);
      setEventPage(1);
      void refetchEvent();
    }
  };

  const handleResetFilters = () => {
    if (activeTab === "room") {
      setRoomStatus("pending");
      setAppliedRoomStatus("pending");
    } else {
      setEventStatus("pending");
      setSelectedEventIds([]);
      setAppliedEventStatus("pending");
      setAppliedEventIds([]);
    }
  };

  const handleApprove = (id: string) => {
    setApprovingIds((prev) => new Set(prev).add(id));
    if (activeTab === "room") {
      approveRoomApplications({ ids: [id], status: "approved" });
    } else {
      approveEventApplications({ ids: [id] });
    }
  };

  const handleReject = (id: string) => {
    setApprovingIds((prev) => new Set(prev).add(id));
    if (activeTab === "room") {
      approveRoomApplications({ ids: [id], status: "rejected" });
    }
  };

  const handleApproveAll = () => {
    const ids = applications.map((app) => app.id);
    if (ids.length === 0 || !slug) return;

    setIsApprovingAll(true);
    setApprovingIds(new Set(ids));
    approveAllPendingRoomApplications({ roomId: slug });
  };

  const isLoading = isLoadingRoomData || (activeTab === "room" ? isLoadingRoom : isLoadingEvent);
  const rawApplications = activeTab === "room" ? roomApplications : eventApplications;

  const applications = rawApplications.filter((app) => !approvedIds.has(app.id));
  const activeApproveError = activeTab === "room" ? roomApproveError : eventApproveError;
  const currentStatus = activeTab === "room" ? roomStatus : eventStatus;
  const appliedStatus = activeTab === "room" ? appliedRoomStatus : appliedEventStatus;
  const currentPage = activeTab === "room" ? roomPage : eventPage;
  const pagination = activeTab === "room" ? roomPagination : eventPagination;
  const totalPages = pagination?.totalPages ?? 0;

  if (isLoadingRoomData) {
    return <SettingsLoadingState />;
  }

  if (isRoomDataError) {
    return <SettingsErrorState errorMessage={(roomDataError as Error)?.message} />;
  }

  return (
    <div className="w-full px-2 pb-6">
      <div className="mb-4 border-b border-border">
        <div className="flex flex-wrap gap-6" role="tablist" aria-label="Тип заявок">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "room"}
            className={activeTab === "room" ? tabActive : tabInactive}
            onClick={() => handleTabChange("room")}
          >
            Заявки по комнате
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "event"}
            className={activeTab === "event" ? tabActive : tabInactive}
            onClick={() => handleTabChange("event")}
          >
            Заявки по событиям
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full min-w-0 sm:w-56">
            <p className="mb-1.5 text-sm font-medium text-foreground">Статус</p>
            <Select
              value={currentStatus}
              onValueChange={(v) => {
                const s = v as StatusType;
                if (activeTab === "room") handleRoomStatusChange(s);
                else handleEventStatusChange(s);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeTab === "event" ? (
          <EventAutocomplete
            selectedIds={selectedEventIds}
            onChange={setSelectedEventIds}
            roomId={slug || ""}
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleApplyFilters}>
            Применить
          </Button>
          <Button type="button" variant="outline" onClick={handleResetFilters}>
            Сбросить
          </Button>
        </div>
      </div>

      {isLoading && !isLoadingRoomData ? (
        <div className="flex min-h-[200px] w-full items-center justify-center">
          <PageLoader label="Загрузка…" />
        </div>
      ) : null}

      {activeApproveError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{activeApproveError}</AlertDescription>
        </Alert>
      ) : null}
      {allPendingApproveError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{allPendingApproveError}</AlertDescription>
        </Alert>
      ) : null}

      {!isLoading ? (
        <>
          {applications.length === 0 && !pagination?.total ? (
            <Alert>
              <AlertDescription>
                {appliedStatus === "pending" && "Нет заявок на рассмотрение"}
                {appliedStatus === "approved" && "Нет одобренных заявок"}
                {appliedStatus === "rejected" && "Нет отклонённых заявок"}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm text-muted-foreground">
                  Всего: {pagination?.total ?? 0}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  {appliedStatus === "pending" && applications.length > 0 && activeTab === "room" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApproveAll}
                      disabled={isApprovingAll || approvingIds.size > 0}
                    >
                      {isApprovingAll
                        ? "Одобрение…"
                        : `Одобрить всех на странице (${applications.length})`}
                    </Button>
                  ) : null}
                  <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                    <span className="shrink-0 text-sm text-muted-foreground">На странице</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(v) => handlePageSizeChange(Number(v))}
                    >
                      <SelectTrigger className="w-full sm:w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZES.map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {applications.map((application) => (
                  <li key={application.id}>
                    <ApplicationCard
                      application={application}
                      type={activeTab}
                      onApprove={handleApprove}
                      onReject={activeTab === "room" ? handleReject : () => {}}
                      isProcessedThis={approvingIds.has(application.id)}
                      showActions={appliedStatus === "pending"}
                      eventName={
                        activeTab === "event"
                          ? eventNameMap.get(
                              (application as { eventId: string }).eventId
                            )
                          : undefined
                      }
                      ambassadorName={
                        activeTab === "event"
                          ? ambassadorNameMap.get(application.ambassadorId)
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <CreativesPaginationControls
                  className="mt-2"
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePaginationPageChange}
                />
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
