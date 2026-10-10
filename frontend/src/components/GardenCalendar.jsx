import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Check,
} from "lucide-react";
import { useToast } from "../context/AppContext.jsx";
import { api } from "../lib/api.js";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function GardenCalendar({ plants = [], onPlantUpdate }) {
  const notify = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [busyPlantId, setBusyPlantId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Prev / Next Month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Map plants to scheduled dates in current month with recurring projections
  const calendarEvents = useMemo(() => {
    const eventsByDay = {};

    plants.forEach((plant) => {
      const waterInterval = Math.max(1, Number(plant.wateringIntervalDays) || 2);
      const feedInterval = Math.max(7, Number(plant.fertilizingIntervalDays) || 14);

      // Determine initial watering anchor date
      let waterAnchor = plant.nextWateringDue ? new Date(plant.nextWateringDue) : new Date(year, month, 1);
      if (isNaN(waterAnchor.getTime())) waterAnchor = new Date(year, month, 1);

      // Determine initial feed anchor date
      let feedAnchor = plant.nextFertilizingDue ? new Date(plant.nextFertilizingDue) : new Date(year, month, 5);
      if (isNaN(feedAnchor.getTime())) feedAnchor = new Date(year, month, 5);

      // 1. Project recurring watering days throughout the entire month
      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(year, month, day);
        const diffDays = Math.round((checkDate.getTime() - waterAnchor.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays % waterInterval === 0) {
          eventsByDay[day] = eventsByDay[day] || [];
          eventsByDay[day].push({
            type: "water",
            plantId: plant._id,
            plantName: plant.name || plant.originalName || plant.species,
            species: plant.originalName || plant.species || "Houseplant",
            status: plant.healthStatus,
            date: checkDate,
          });
        }
      }

      // 2. Project recurring fertilizing days throughout the month
      for (let day = 1; day <= daysInMonth; day++) {
        const checkDate = new Date(year, month, day);
        const diffDays = Math.round((checkDate.getTime() - feedAnchor.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays % feedInterval === 0) {
          eventsByDay[day] = eventsByDay[day] || [];
          eventsByDay[day].push({
            type: "feed",
            plantId: plant._id,
            plantName: plant.name || plant.originalName || plant.species,
            species: plant.originalName || plant.species || "Houseplant",
            status: plant.healthStatus,
            date: checkDate,
          });
        }
      }
    });

    return eventsByDay;
  }, [plants, year, month, daysInMonth]);

  // Today's tasks (actual real today)
  const realToday = new Date();
  const isCurrentMonth = realToday.getFullYear() === year && realToday.getMonth() === month;
  const isTodaySelected = isCurrentMonth && selectedDay === realToday.getDate();

  // Events for the selected day
  const dayEvents = calendarEvents[selectedDay] || [];

  // Upcoming 7 days tasks overview
  const upcomingEvents = useMemo(() => {
    const list = [];
    for (let offset = 0; offset <= 7; offset++) {
      const d = new Date(year, month, selectedDay + offset);
      if (d.getMonth() === month) {
        const dayNum = d.getDate();
        const evts = calendarEvents[dayNum] || [];
        evts.forEach((evt) => {
          list.push({ ...evt, dayNum, isToday: isCurrentMonth && dayNum === realToday.getDate() });
        });
      }
    }
    return list;
  }, [calendarEvents, selectedDay, year, month, isCurrentMonth, realToday]);

  const handleQuickWater = async (plantId, plantName) => {
    if (!plantId || plantId.startsWith("sample-")) {
      notify(`Watered ${plantName}! Next schedule updated.`, "success");
      return;
    }
    setBusyPlantId(plantId);
    try {
      await api(`/garden/plants/${plantId}/water`, { method: "POST" });
      notify(`Watered ${plantName}! Next schedule updated.`, "success");
      if (onPlantUpdate) onPlantUpdate();
    } catch (err) {
      notify(err.message || "Failed to water plant", "error");
    } finally {
      setBusyPlantId(null);
    }
  };

  return (
    <div className="garden-calendar-wrapper">
      <div className="calendar-top-bar">
        <div className="cal-title-group">
          <div className="cal-badge">
            <CalendarIcon size={16} /> Care Schedule
          </div>
          <h3>Garden Care Calendar & Automated Watering Rhythm</h3>
        </div>

        <div className="month-nav">
          <button className="icon-btn-subtle" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="current-month-label">
            {MONTH_NAMES[month]} {year}
          </span>
          <button className="icon-btn-subtle" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {plants.length === 0 && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Sprout size={24} color="#166534" />
            <div>
              <strong style={{ color: "#166534", fontSize: "14px" }}>
                Add plants to personalize your Care Calendar!
              </strong>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#15803d" }}>
                Upload or snap photos with our AI Scanner. Your calendar will automatically project custom watering and nutrition schedules for every plant.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-grid-container">
        {/* Day Names */}
        <div className="cal-weekdays">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="cal-weekday-cell">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="cal-days-grid">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="cal-day-cell empty" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const events = calendarEvents[dayNum] || [];
            const isToday = isCurrentMonth && dayNum === realToday.getDate();
            const isSelected = dayNum === selectedDay;

            const hasWater = events.some((e) => e.type === "water");
            const hasFeed = events.some((e) => e.type === "feed");

            return (
              <button
                key={dayNum}
                type="button"
                className={`cal-day-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${events.length > 0 ? "has-events" : ""}`}
                onClick={() => setSelectedDay(dayNum)}
              >
                <span className="day-number">{dayNum}</span>
                <div className="event-indicators">
                  {hasWater && <span className="dot dot-water" title="Watering scheduled" />}
                  {hasFeed && <span className="dot dot-feed" title="Fertilizing scheduled" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda & Tasks */}
      <div className="day-agenda-box">
        <div className="agenda-header">
          <h4>
            Tasks for {MONTH_NAMES[month]} {selectedDay}, {year}
            {isTodaySelected && <span className="today-pill">Today</span>}
          </h4>
          <span className="task-count-pill">{dayEvents.length} Tasks Scheduled</span>
        </div>

        {dayEvents.length === 0 ? (
          <div>
            <div className="empty-agenda" style={{ padding: "20px 0" }}>
              <CheckCircle2 size={24} className="text-muted" />
              <p>No care tasks scheduled for Day {selectedDay}. Your garden soil moisture is currently balanced!</p>
            </div>

            {upcomingEvents.length > 0 && (
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                <h5 style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--muted)" }}>
                  Upcoming Care Schedule (Next 7 Days):
                </h5>
                <div className="agenda-task-list">
                  {upcomingEvents.slice(0, 5).map((evt, idx) => (
                    <div key={idx} className={`agenda-task-card ${evt.type}`}>
                      <div className="task-icon-wrap">
                        {evt.type === "water" ? <Droplets size={18} className="water-text" /> : <Sprout size={18} className="feed-text" />}
                      </div>
                      <div className="task-info">
                        <strong>{evt.plantName}</strong>
                        <span className="task-species text-xs muted">
                          Day {evt.dayNum} · {evt.species} · {evt.type === "water" ? "Watering Due" : "Organic Nutrition Feed"}
                        </span>
                      </div>
                      <div className="task-action">
                        {evt.type === "water" && (
                          <button
                            className="button button-sm button-water-action"
                            disabled={busyPlantId === evt.plantId}
                            onClick={() => handleQuickWater(evt.plantId, evt.plantName)}
                          >
                            <Droplets size={13} />
                            {busyPlantId === evt.plantId ? "Saving…" : "Mark Watered"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="agenda-task-list">
            {dayEvents.map((evt, idx) => (
              <div key={idx} className={`agenda-task-card ${evt.type}`}>
                <div className="task-icon-wrap">
                  {evt.type === "water" ? <Droplets size={18} className="water-text" /> : <Sprout size={18} className="feed-text" />}
                </div>
                <div className="task-info">
                  <strong>{evt.plantName}</strong>
                  <span className="task-species text-xs muted">
                    {evt.species} · {evt.type === "water" ? "Watering Due" : "Organic Nutrition Feed"}
                  </span>
                </div>
                <div className="task-action">
                  {evt.type === "water" && (
                    <button
                      className="button button-sm button-water-action"
                      disabled={busyPlantId === evt.plantId}
                      onClick={() => handleQuickWater(evt.plantId, evt.plantName)}
                    >
                      <Droplets size={13} />
                      {busyPlantId === evt.plantId ? "Saving…" : "Mark Watered"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
