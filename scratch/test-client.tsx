import { renderToString } from 'react-dom/server';
import { DashboardClient } from '../components/dashboard/dashboard-client';
import React from 'react';

const profile = { display_name: "Test", xp: 0, level: 1 };
const initialHabits = [];

try {
  console.log("Rendering DashboardClient...");
  const html = renderToString(<DashboardClient profile={profile} initialHabits={initialHabits} todayDateStr="2026-07-16" />);
  console.log("Render successful. Length:", html.length);
} catch (e) {
  console.error("Error:", e);
}
