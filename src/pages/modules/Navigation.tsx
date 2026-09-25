import { Routes, Route, Navigate, useLocation } from "react-router-dom";

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
  CreativeTaskDetailLayout,
  CreativeTaskDescriptionPage,
  CreativeTaskAnswersPage,
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
  RewardsPage,
  PromoCodesPage,
  SprintLeaderboardPage,
  VkProfilePage,
} from "../(list_integration)";

import { ProtectedRoute } from "@components/ProtectedRoute";
import { getUrlParams } from "@helpers/index";
import { RoomLayout } from "./RoomLayout";
import SprintParticipantPage from "../(list_integration)/sprints/slug/SprintParticipantPage";
import CreativeTaskEditorPage from "../(list_integration)/creativetasks/CreativeTaskEditorPage";
import { SelectActionPage } from "../(Bot_step)/main";
import { RoomRedirect } from "..";
import { AuthPage } from "../auth";
import { RedirectAuthPage } from "../redirect_auth";
import { useEffect } from "react";
import { useMessage } from "@messages/messageProvider";


export const Navigation = () => {
  // Re-evaluate the legacy context after login removes the old URL parameters.
  useLocation();
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
        <Route path="vk-profile" element={<VkProfilePage />} />

        <Route path="sprints" element={<SprintsLayout />}>
          <Route index element={<SprintList />} />
          <Route path="leaderboard" element={<SprintLeaderboardPage />} />
          <Route path="settings" element={<SprintSettingsPage />} />
          <Route path="info" element={<SprintInfo />} />
          <Route path="new" element={<SprintSetting />} />
          <Route path=":sprintId" element={<OpenSprintPage />} />
          <Route path=":sprintId/edit" element={<SprintSetting />} />
          <Route path=":sprintId/participants/:ambassadorId" element={<SprintParticipantPage />} />
        </Route>

        <Route path="rewards" element={<RewardsPage />} />
        <Route path="promo-codes" element={<PromoCodesPage />} />

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
        <Route path="creativetasks/new" element={<CreativeTaskEditorPage />} />
        <Route path="creativetasks/:taskId/edit" element={<CreativeTaskEditorPage />} />
        <Route path="creativetasks/private/*" element={<Navigate to="../creativetasks" replace />} />
        <Route path="private-creativetasks/*" element={<Navigate to="../creativetasks" replace />} />
        <Route path="creativetasks/:taskId" element={<CreativeTaskDetailLayout />}>
          <Route index element={<CreativeTaskDescriptionPage />} />
          <Route path="answers" element={<CreativeTaskAnswersPage />} />
          <Route path="invitations" element={<Navigate to=".." replace />} />
          <Route path="ord-creative" element={<OrdCreativePage />} />
          <Route path="ord-auto-issuance" element={<OrdTaskIssuanceRulePage />} />
        </Route>

        <Route path="*" element={<RoomRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
};
