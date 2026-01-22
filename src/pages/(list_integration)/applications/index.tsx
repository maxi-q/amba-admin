import { useParams } from "react-router-dom";
import { Box, Tabs, Tab, Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Stack, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useGetRoomById } from "@/hooks/rooms/useGetRoomById";
import { useRoomApplications } from "@/hooks/ambassador/useRoomApplications";
import { useEventApplications } from "@/hooks/ambassador/useEventApplications";
import { useApproveRoomApplications } from "@/hooks/ambassador/useApproveRoomApplications";
import { useApproveEventApplications } from "@/hooks/ambassador/useApproveEventApplications";
import { SettingsLoadingState } from "../settings/components/SettingsLoadingState";
import { SettingsErrorState } from "../settings/components/SettingsErrorState";
import { ApplicationCard } from "./components/ApplicationCard";
import { EventAutocomplete } from "../statistics/components/EventAutocomplete";
import { PRIMARY_COLOR } from "@/constants/colors";

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
  
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Get room data
  const {
    room: roomData,
    isLoading: isLoadingRoomData,
    isError: isRoomDataError,
    error: roomDataError
  } = useGetRoomById(slug || '');

  // Room applications (using applied filters)
  const {
    applications: roomApplications,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    error: roomError,
    refetch: refetchRoom
  } = useRoomApplications({
    status: appliedRoomStatus,
    roomIds: roomData?.id ? [roomData.id] : [],
    page: 1,
    size: 50
  });

  // Event applications (using applied filters)
  const {
    applications: eventApplications,
    isLoading: isLoadingEvent,
    isError: isEventError,
    error: eventError,
    refetch: refetchEvent
  } = useEventApplications({
    status: appliedEventStatus,
    eventIds: appliedEventIds,
    page: 1,
    size: 50
  });

  // Approve mutations
  const {
    approveRoomApplications,
    isPending: isApprovingRoom,
    isSuccess: isRoomApproveSuccess,
    generalError: roomApproveError
  } = useApproveRoomApplications();

  const {
    approveEventApplications,
    isPending: isApprovingEvent,
    isSuccess: isEventApproveSuccess,
    generalError: eventApproveError
  } = useApproveEventApplications();

  useEffect(() => {
    if (isRoomApproveSuccess || isEventApproveSuccess) {
      setShowSuccessNotification(true);
      if (activeTab === 'room') {
        refetchRoom();
      } else {
        refetchEvent();
      }
    }
  }, [isRoomApproveSuccess, isEventApproveSuccess]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  const handleRoomStatusChange = (status: StatusType) => {
    setRoomStatus(status);
  };

  const handleEventStatusChange = (status: StatusType) => {
    setEventStatus(status);
  };

  const handleApplyFilters = () => {
    if (activeTab === 'room') {
      setAppliedRoomStatus(roomStatus);
      refetchRoom();
    } else {
      setAppliedEventStatus(eventStatus);
      setAppliedEventIds(selectedEventIds);
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
    if (activeTab === 'room') {
      approveRoomApplications({ ids: [id] });
    } else {
      approveEventApplications({ ids: [id] });
    }
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete application:', id);
  };

  const isLoading = isLoadingRoomData || (activeTab === 'room' ? isLoadingRoom : isLoadingEvent);
  const isError = isRoomDataError || (activeTab === 'room' ? isRoomError : isEventError);
  const error = roomDataError || (activeTab === 'room' ? roomError : eventError);
  const applications = activeTab === 'room' ? roomApplications : eventApplications;
  const isApproving = activeTab === 'room' ? isApprovingRoom : isApprovingEvent;
  const approveError = activeTab === 'room' ? roomApproveError : eventApproveError;
  const currentStatus = activeTab === 'room' ? roomStatus : eventStatus;
  const appliedStatus = activeTab === 'room' ? appliedRoomStatus : appliedEventStatus;
  const handleStatusChange = activeTab === 'room' ? handleRoomStatusChange : handleEventStatusChange;
  
  // Check if filters have changed from applied values
  const hasFilterChanges = activeTab === 'room' 
    ? roomStatus !== appliedRoomStatus
    : eventStatus !== appliedEventStatus || 
      JSON.stringify(selectedEventIds) !== JSON.stringify(appliedEventIds);

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

      {!isLoading && (
        <>
          {applications.length === 0 ? (
            <Alert severity="info">
              {appliedStatus === 'pending' && 'Нет заявок на рассмотрение'}
              {appliedStatus === 'approved' && 'Нет одобренных заявок'}
              {appliedStatus === 'rejected' && 'Нет отклонённых заявок'}
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  type={activeTab}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  isApproving={isApproving}
                  showActions={currentStatus === 'pending'}
                />
              ))}
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => setShowSuccessNotification(false)}
        message="Заявка одобрена"
      />
    </Box>
  );
}
