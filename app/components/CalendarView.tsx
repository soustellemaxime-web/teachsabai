"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

export default function CalendarView({ events, onDateClick, }: { events: any[]; onDateClick: (date: string) => void; }) {
  const router = useRouter();
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      events={events}
      height="70vh"

      eventClick={(info) => {
        const studentId = info.event.extendedProps.studentId;
        router.push(`/students/${studentId}`);
      }}
      dateClick={(info) => {
        onDateClick(info.dateStr);
      }}
    />
  );
}