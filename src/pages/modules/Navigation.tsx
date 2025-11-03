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
  StatisticsPage
} from "../(list_integration)";

import { ProtectedRoute } from "@components/ProtectedRoute";
import { getUrlParams } from "@helpers/index";
import { RoomLayout } from "./RoomLayout";
import { SelectActionPage } from "../(Bot_step)/main";
import { RoomRedirect } from "..";
import { AuthPage } from "../auth";
import { RedirectAuthPage } from "../redirect_auth";


export const Navigation = () => {
  const { context } = getUrlParams()

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

        <Route index path="sprints" element={<SprintList />} />
        <Route path="sprints/:sprintId" element={<SprintSetting />} />
        <Route path="sprints/settings" element={<SprintSettingsPage />} />
        <Route path="sprints/info" element={<SprintInfo />} />

        <Route path="events" element={<EventsPage />} />
        <Route path="events/info" element={<EventsInfo />} />
        <Route path="events/:eventId" element={<EventsSetting />} />

        <Route path="statistics" element={<StatisticsPage />} />

        <Route path="*" element={<RoomRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
};