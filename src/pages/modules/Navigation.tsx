import { Routes, Route, Navigate } from "react-router-dom";

import {
  RoomsPage,
  SettingPage,
  SettingsInfo,
  SelectServicePlanPage,
  ServicePlanPaymentPage,
  SprintList,
  SprintSetting,
  OpenSprintPage,
  SprintSettingsPage,
  SprintInfo,
  EventsPage,
  EventsInfo,
  EventsSetting,
  EventsLayout,
  EventSubscribersPage,
  EventInvitationsPage,
  StatisticsPage,
  SprintsLayout,
  CodePage,
  ApplicationsPage,
  CreativeTasksPage,
  PrivateCreativeTasksPage,
  CreativeTaskDetailLayout,
  PrivateCreativeTaskDetailLayout,
  CreativeTaskDescriptionPage,
  PrivateCreativeTaskDescriptionPage,
  CreativeTaskAnswersPage,
  PrivateCreativeTaskAnswersPage,
  CreativeTaskInvitationsPage,
  PrivateCreativeTaskInvitationsPage,
  InvitationsPage,
  OrdLayout,
  OrdContractsPage,
  OrdProfilePage,
  OrdContractDetailPage,
  OrdTemplatesPage,
  OrdAutoIssuancePage,
  OrdRoomFilesPage,
  OrdTaskIssuanceRulePage,
  OrdCreativePage,
  PrivateOrdCreativePage,
  RewardsPage,
  SprintLeaderboardPage,
} from "../(list_integration)";

import { ProtectedRoute } from "@components/ProtectedRoute";
import { getUrlParams } from "@helpers/index";
import { RoomLayout } from "./RoomLayout";
import { SelectActionPage } from "../(Bot_step)/main";
import { RoomRedirect } from "..";
import { AuthPage } from "../auth";
import { RedirectAuthPage } from "../redirect_auth";
import { useEffect } from "react";
import { useMessage } from "@messages/messageProvider";


export const Navigation = () => {
  const { context } = getUrlParams()
  const { sendMessage } = useMessage()

  useEffect(() => {
    if (context === 'list_integration') {
      const data = {
        request: {
          type: 'SenlerAppResizeWindow',
          params: {
            width: 1200,
            height: 652
          }
        }
      }

      sendMessage(data, window.parent);
    }
  }, []);

  if (context === 'Bot_step') {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/redirect_auth" element={<RedirectAuthPage />} />

        <Route path="/" element={<ProtectedRoute><SelectActionPage /></ProtectedRoute>} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/redirect_auth" element={<RedirectAuthPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <RoomsPage />
        </ProtectedRoute>
      } />

      <Route path="rooms" element={
        <ProtectedRoute>
          <RoomsPage />
        </ProtectedRoute>
      }/>

      <Route path="rooms/:slug/onboarding/tariff" element={
        <ProtectedRoute>
          <SelectServicePlanPage />
        </ProtectedRoute>
      } />

      <Route path="rooms/:slug/onboarding/payment" element={
        <ProtectedRoute>
          <ServicePlanPaymentPage />
        </ProtectedRoute>
      } />

      <Route path="rooms/:slug" element={
        <ProtectedRoute>
          <RoomLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RoomRedirect />} />
        <Route path="setting" element={<SettingPage />} />
        <Route path="setting/info" element={<SettingsInfo />} />
        <Route path="code" element={<CodePage />} />

        <Route path="sprints" element={<SprintsLayout />}>
          <Route index element={<SprintList />} />
          <Route path="leaderboard" element={<SprintLeaderboardPage />} />
          <Route path="settings" element={<SprintSettingsPage />} />
          <Route path="info" element={<SprintInfo />} />
          <Route path="new" element={<SprintSetting />} />
          <Route path=":sprintId" element={<OpenSprintPage />} />
          <Route path=":sprintId/edit" element={<SprintSetting />} />
        </Route>

        <Route path="rewards" element={<RewardsPage />} />

        <Route path="events" element={<EventsLayout />}>
          <Route index element={<EventsPage />} />
          <Route path="info" element={<EventsInfo />} />
          <Route path=":eventId" element={<EventsSetting />} />
          <Route path=":eventId/subscribers" element={<EventSubscribersPage />} />
          <Route path=":eventId/invitations" element={<EventInvitationsPage />} />
        </Route>

        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="ord" element={<OrdLayout />}>
          <Route index element={<OrdContractsPage />} />
          <Route path="templates" element={<OrdTemplatesPage />} />
          <Route path="auto-issuance" element={<OrdAutoIssuancePage />} />
          <Route path="files" element={<OrdRoomFilesPage />} />
          <Route path="profile" element={<OrdProfilePage />} />
          <Route path=":contractId" element={<OrdContractDetailPage />} />
        </Route>
        <Route path="creativetasks" element={<CreativeTasksPage />} />
        <Route path="creativetasks/private" element={<PrivateCreativeTasksPage />} />
        <Route path="private-creativetasks" element={<Navigate to="../creativetasks/private" replace />} />
        <Route path="creativetasks/private/:privateTaskId" element={<PrivateCreativeTaskDetailLayout />}>
          <Route index element={<PrivateCreativeTaskDescriptionPage />} />
          <Route path="answers" element={<PrivateCreativeTaskAnswersPage />} />
          <Route path="invitations" element={<PrivateCreativeTaskInvitationsPage />} />
          <Route path="ord-creative" element={<PrivateOrdCreativePage />} />
        </Route>
        <Route path="creativetasks/:taskId" element={<CreativeTaskDetailLayout />}>
          <Route index element={<CreativeTaskDescriptionPage />} />
          <Route path="answers" element={<CreativeTaskAnswersPage />} />
          <Route path="invitations" element={<CreativeTaskInvitationsPage />} />
          <Route path="ord-creative" element={<OrdCreativePage />} />
          <Route path="ord-auto-issuance" element={<OrdTaskIssuanceRulePage />} />
        </Route>

        <Route path="*" element={<RoomRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
};