import { useParams } from "react-router-dom";
import { Box, Tabs, Tab, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Stack, Button, Pagination, Typography } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
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
import { PRIMARY_COLOR } from "@/constants/colors";
import { useApproveAllPendingRoomApplications } from "@/hooks/ambassador/useApproveAllPendingRoomApplications";

type TabType = 'room' | 'event';
type StatusType = 'pending' | 'approved' | 'rejected';

export default function ApplicationsPage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('room');

  // Filter states (for UI)
  const [roomStatus, setRoomStatus] = useState<StatusType>('pending');
  const [eventStatus, setEventStatus] = useState<StatusType>('pending');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // Applied filter states (for API calls)
  const [appliedRoomStatus, setAppliedRoomStatus] = useState<StatusType>('pending');
  const [appliedEventStatus, setAppliedEventStatus] = useState<StatusType>('pending');
  const [appliedEventIds, setAppliedEventIds] = useState<string[]>([]);

  // Pagination states
  const [roomPage, setRoomPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  // Get room data
  const {
    room: roomData,
    isLoading: isLoadingRoomData,
    isError: isRoomDataError,
    error: roomDataError
  } = useGetRoomById(slug || '');

  // Get events for displaying event names
  const { events } = useEvents({ page: 1, size: 100 }, slug || '');

  // Get ambassadors for displaying ambassador names
  const { ambassadors } = useAmbassadors({ page: 1, size: 100 });

  // Create a map of event IDs to event names
  const eventNameMap = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach(event => {
      map.set(event.id, event.name);
    });
    return map;
  }, [events]);

  // Create a map of ambassador IDs to ambassador names
  const ambassadorNameMap = useMemo(() => {
    const map = new Map<string, string>();
    ambassadors.forEach(amb => {
      // Use name if available, otherwise promoCode or id
      const name = (amb as any).name || amb.promoCode || amb.id;
      map.set(amb.id, name);
    });
    return map;
  }, [ambassadors]);

  // Room applications (using applied filters)
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

  // Event applications (using applied filters)
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

  // Approve mutations
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
  } = useApproveAllPendingRoomApplications()

  // Handle successful approval
  useEffect(() => {
    if (isRoomApproveSuccess || isEventApproveSuccess || isAllPendingApproveSuccess) {
      setShowSuccessNotification(true);
      // Move approved IDs to approvedIds set for immediate removal from UI
      setApprovedIds(prev => new Set([...prev, ...approvingIds]));
      setApprovingIds(new Set());
      setIsApprovingAll(false);
    }
  }, [isRoomApproveSuccess, isEventApproveSuccess, isAllPendingApproveSuccess]);

  // Handle error - clear approving state
  useEffect(() => {
    if (isRoomApproveError || isEventApproveError || isAllPendingApproveError) {
      setApprovingIds(new Set());
      setIsApprovingAll(false);
    }
  }, [isRoomApproveError, isEventApproveError, isAllPendingApproveError]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
    setApprovedIds(new Set()); // Clear approved IDs when switching tabs
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setApprovedIds(new Set());
    if (activeTab === 'room') {
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
    setApprovedIds(new Set()); // Clear approved IDs when applying new filters
    if (activeTab === 'room') {
      setAppliedRoomStatus(roomStatus);
      setRoomPage(1); // Reset to first page
      refetchRoom();
    } else {
      setAppliedEventStatus(eventStatus);
      setAppliedEventIds(selectedEventIds);
      setEventPage(1); // Reset to first page
      refetchEvent();
    }
  };

  const handleResetFilters = () => {
    if (activeTab === 'room') {
      setRoomStatus('pending');
      setAppliedRoomStatus('pending');
    } else {
      setEventStatus('pending');
      setSelectedEventIds([]);
      setAppliedEventStatus('pending');
      setAppliedEventIds([]);
    }
  };

  const handleApprove = (id: string) => {
    setApprovingIds(prev => new Set(prev).add(id));
    if (activeTab === 'room') {
      approveRoomApplications({ ids: [id], status: 'approved' });
    } else {
      approveEventApplications({ ids: [id] });
    }
  };

  const handleReject = (id: string) => {
    setApprovingIds(prev => new Set(prev).add(id));
    if (activeTab === 'room') {
      approveRoomApplications({ ids: [id], status: 'rejected' });
    }
  };

  const handleApproveAll = () => {
    const ids = applications.map(app => app.id);
    if (ids.length === 0 || !slug) return;

    setIsApprovingAll(true);
    setApprovingIds(new Set(ids));
    approveAllPendingRoomApplications({roomId: slug})
  };

  const isLoading = isLoadingRoomData || (activeTab === 'room' ? isLoadingRoom : isLoadingEvent);
  const rawApplications = activeTab === 'room' ? roomApplications : eventApplications;

  // Filter out already approved applications
  const applications = rawApplications.filter(app => !approvedIds.has(app.id));
  const approveError = activeTab === 'room' ? roomApproveError : eventApproveError;
  const currentStatus = activeTab === 'room' ? roomStatus : eventStatus;
  const appliedStatus = activeTab === 'room' ? appliedRoomStatus : appliedEventStatus;
  const handleStatusChange = activeTab === 'room' ? handleRoomStatusChange : handleEventStatusChange;
  const currentPage = activeTab === 'room' ? roomPage : eventPage;
  const pagination = activeTab === 'room' ? roomPagination : eventPagination;

  if (isLoadingRoomData) {
    return <SettingsLoadingState />;
  }

  if (isRoomDataError) {
    return <SettingsErrorState errorMessage={(roomDataError as Error)?.message} />;
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 400,
              fontSize: '0.9rem',
            },
            '& .Mui-selected': {
              color: PRIMARY_COLOR,
              fontWeight: 500,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: PRIMARY_COLOR,
            },
          }}
        >
          <Tab label="Заявки по комнате" value="room" />
          <Tab label="Заявки по событиям" value="event" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={currentStatus}
              label="Статус"
              onChange={(e) => handleStatusChange(e.target.value as StatusType)}
            >
              <MenuItem value="pending">Ожидает рассмотрения</MenuItem>
              <MenuItem value="approved">Одобрено</MenuItem>
              <MenuItem value="rejected">Отклонено</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {activeTab === 'event' && (
          <EventAutocomplete
            selectedIds={selectedEventIds}
            onChange={setSelectedEventIds}
            roomId={slug || ''}
          />
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              backgroundColor: PRIMARY_COLOR,
              "&:hover": {
                backgroundColor: PRIMARY_COLOR,
                opacity: 0.9
              }
            }}
          >
            Применить
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{
              borderColor: "#e0e0e0",
              color: "text.secondary",
              "&:hover": {
                borderColor: "#bdbdbd",
                backgroundColor: "#f5f5f5"
              }
            }}
          >
            Сбросить
          </Button>
        </Box>
      </Stack>

      {isLoading && !isLoadingRoomData && <SettingsLoadingState />}

      {approveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {approveError}
        </Alert>
      )}
      {approveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {allPendingApproveError}
        </Alert>
      )}

      {!isLoading && (
        <>
          {applications.length === 0 && !pagination?.total ? (
            <Alert severity="info">
              {appliedStatus === 'pending' && 'Нет заявок на рассмотрение'}
              {appliedStatus === 'approved' && 'Нет одобренных заявок'}
              {appliedStatus === 'rejected' && 'Нет отклонённых заявок'}
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Header with total and page size */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Всего: {pagination?.total ?? 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {appliedStatus === 'pending' && applications.length > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleApproveAll}
                      disabled={isApprovingAll || approvingIds.size > 0}
                      sx={{
                        backgroundColor: PRIMARY_COLOR,
                        "&:hover": {
                          backgroundColor: PRIMARY_COLOR,
                          opacity: 0.9
                        }
                      }}
                    >
                      {isApprovingAll ? 'Одобрение...' : `Одобрить всех на странице (${applications.length})`}
                    </Button>
                  )}
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>На странице</InputLabel>
                    <Select
                      value={pageSize}
                      label="На странице"
                      onChange={(e) => handlePageSizeChange(e.target.value as number)}
                    >
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Applications list */}
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  type={activeTab}
                  onApprove={handleApprove}
                  onReject={activeTab == 'room' ? handleReject : () => {}}
                  isProcessedThis={approvingIds.has(application.id)}
                  showActions={appliedStatus === 'pending'}
                  eventName={activeTab === 'event' ? eventNameMap.get((application as { eventId: string }).eventId) : undefined}
                  ambassadorName={activeTab === 'event' ? ambassadorNameMap.get(application.ambassadorId) : undefined}
                />
              ))}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root.Mui-selected': {
                        backgroundColor: PRIMARY_COLOR,
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => setShowSuccessNotification(false)}
        message="Заявки одобрены"
      />
    </Box>
  );
}
