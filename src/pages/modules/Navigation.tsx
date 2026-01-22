import { Routes, Route, Navigate } from "react-router-dom";

import {
  RoomsPage,
  SettingPage,
  SettingsInfo,
  SprintList,
  SprintSetting,
  SprintSettingsPage,
  SprintInfo,
  EventsPage,
  EventsInfo,
  EventsSetting,
  StatisticsPage,
  SprintsLayout,
  CodePage,
  WebhookPage,
  ApplicationsPage
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

      <Route path="rooms/:slug" element={
        <ProtectedRoute>
          <RoomLayout />
        </ProtectedRoute>
      }>
        <Route index element={<RoomRedirect />} />
        <Route path="setting" element={<SettingPage />} />
        <Route path="setting/info" element={<SettingsInfo />} />
        <Route path="code" element={<CodePage />} />
        <Route path="webhook" element={<WebhookPage />} />

        <Route path="sprints" element={<SprintsLayout />}>
          <Route index element={<SprintList />} />
          <Route path=":sprintId" element={<SprintSetting />} />
          <Route path="settings" element={<SprintSettingsPage />} />
          <Route path="info" element={<SprintInfo />} />
        </Route>

        <Route path="events" element={<EventsPage />} />
        <Route path="events/info" element={<EventsInfo />} />
        <Route path="events/:eventId" element={<EventsSetting />} />

        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />

        <Route path="*" element={<RoomRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
};