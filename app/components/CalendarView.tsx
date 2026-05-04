"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useRouter } from "next/navigation";

export default function CalendarView({ events }: { events: any[] }) {
  const router = useRouter();

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
      events={events}
      height="70vh"

      eventClick={(info) => {
        const studentId = info.event.extendedProps.studentId;
        router.push(`/students/${studentId}`);
      }}
    />
  );
}