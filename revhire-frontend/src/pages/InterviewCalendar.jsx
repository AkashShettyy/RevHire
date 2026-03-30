import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getEmployerInterviews,
  getMyInterviews,
  respondToInterview,
} from "../services/interviewService";

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarStart(date) {
  const monthStart = getMonthStart(date);
  const dayOfWeek = monthStart.getDay();
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - dayOfWeek);
}

function formatDayKey(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function buildCalendarDays(monthDate) {
  const start = getCalendarStart(monthDate);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function formatInterviewType(value) {
  return value === "online" ? "Online" : "In person";
}

function getInterviewAccent(interviewType) {
  return interviewType === "online"
    ? "from-sky-500/18 via-blue-500/10 to-transparent"
    : "from-amber-500/18 via-orange-400/10 to-transparent";
}

function getResponsePill(responseStatus) {
  switch (responseStatus) {
    case "accepted":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "declined":
      return "bg-red-50 text-red-600 border border-red-100";
    default:
      return "bg-amber-50 text-amber-700 border border-amber-100";
  }
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function InterviewCalendar() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => formatDayKey(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data =
        user?.role === "employer"
          ? await getEmployerInterviews(token)
          : await getMyInterviews(token);
      setInterviews(data.interviews || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load interviews.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const normalizedInterviews = useMemo(
    () =>
      interviews
        .map((interview) => ({
          ...interview,
          scheduledDate: new Date(interview.scheduledAt),
        }))
        .filter((interview) => !Number.isNaN(interview.scheduledDate.getTime()))
        .sort((a, b) => a.scheduledDate - b.scheduledDate),
    [interviews],
  );

  const interviewsByDay = useMemo(() => {
    const entries = new Map();
    for (const interview of normalizedInterviews) {
      const key = formatDayKey(interview.scheduledDate);
      const current = entries.get(key) || [];
      current.push(interview);
      entries.set(key, current);
    }
    return entries;
  }, [normalizedInterviews]);

  const calendarDays = useMemo(() => buildCalendarDays(monthDate), [monthDate]);
  const selectedDayInterviews = interviewsByDay.get(selectedDayKey) || [];
  const now = Date.now();
  const upcomingInterviews = normalizedInterviews.filter(
    (interview) => interview.scheduledDate.getTime() >= now,
  );
  const selectedDate = new Date(selectedDayKey);

  async function handleInterviewResponse(interviewId, responseStatus) {
    try {
      await respondToInterview(interviewId, responseStatus, token);
      setMessage(`Interview ${responseStatus}.`);
      window.setTimeout(() => setMessage(""), 2500);
      fetchInterviews();
    } catch (error) {
      console.error(error);
      setMessage("Unable to update interview response.");
    }
  }

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-6xl py-8">
          <div className="app-spotlight px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                  Interview calendar
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {user?.role === "employer" ? "See the whole hiring week at a glance." : "Keep every interview in one timeline."}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/76">
                  Move across the month, inspect each day, and jump into the next conversation without digging through cards.
                </p>
              </div>

              <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[470px]">
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Upcoming</p>
                  <p className="mt-3 text-3xl font-bold text-white">{upcomingInterviews.length}</p>
                </div>
                <div className="rounded-[26px] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">This Month</p>
                  <p className="mt-3 text-3xl font-bold text-white">
                    {
                      normalizedInterviews.filter(
                        (interview) =>
                          interview.scheduledDate.getMonth() === monthDate.getMonth() &&
                          interview.scheduledDate.getFullYear() === monthDate.getFullYear(),
                      ).length
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(user?.role === "employer" ? "/employer/dashboard" : "/dashboard")
                  }
                  className="rounded-[26px] bg-white px-4 py-4 text-left text-slate-900 transition-colors hover:bg-blue-50"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
                  <p className="mt-3 text-lg font-bold">Back</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-6xl py-8">
        {message && (
          <div className={message.includes("Unable") ? "app-message-error mb-5" : "app-message-success mb-5"}>
            {message}
          </div>
        )}

        {normalizedInterviews.length === 0 ? (
          <div className="app-empty">
            <p className="mb-4 text-5xl">🗓️</p>
            <p className="font-medium text-stone-700">No interviews scheduled yet</p>
            <p className="mt-1 text-sm text-stone-400">
              {user?.role === "employer"
                ? "Schedule interviews from the applicants board to populate this calendar."
                : "Once an employer schedules an interview, it will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
            <section className="app-panel overflow-hidden p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    {monthDate.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">Select a date to inspect its interview agenda.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    className="app-button-secondary px-4 py-2"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthDate(new Date())}
                    className="app-button-secondary px-4 py-2"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    className="app-button-secondary px-4 py-2"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                {dayNames.map((dayName) => (
                  <div key={dayName} className="py-2">
                    {dayName}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayKey = formatDayKey(day);
                  const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                  const isToday = dayKey === formatDayKey(new Date());
                  const isSelected = dayKey === selectedDayKey;
                  const dayInterviews = interviewsByDay.get(dayKey) || [];

                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => setSelectedDayKey(dayKey)}
                      className={`min-h-28 rounded-3xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100/60"
                          : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                      } ${!isCurrentMonth ? "opacity-45" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${
                            isToday ? "rounded-full bg-stone-900 px-2 py-1 text-white" : "text-stone-700"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayInterviews.length > 0 && (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
                            {dayInterviews.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-2">
                        {dayInterviews.slice(0, 2).map((interview) => (
                          <div key={interview._id} className={`rounded-2xl bg-gradient-to-r ${getInterviewAccent(interview.interviewType)} px-2.5 py-2 text-xs text-stone-700`}>
                            <p className="font-semibold text-stone-900">
                              {interview.scheduledDate.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="mt-1 line-clamp-1">
                              {user?.role === "employer"
                                ? interview.jobSeeker?.name
                                : interview.job?.title}
                            </p>
                          </div>
                        ))}
                        {dayInterviews.length > 2 && (
                          <p className="text-xs font-semibold text-blue-700">
                            +{dayInterviews.length - 2} more
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-6">
              <section className="app-panel p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-stone-900">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {selectedDayInterviews.length} interview{selectedDayInterviews.length !== 1 ? "s" : ""} scheduled
                </p>

                {selectedDayInterviews.length === 0 ? (
                  <div className="mt-5 rounded-3xl border border-dashed border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
                    No interviews on this date.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {selectedDayInterviews.map((interview) => (
                      <article key={interview._id} className="rounded-[26px] border border-stone-200 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {user?.role === "employer"
                                ? interview.jobSeeker?.name
                                : interview.job?.title}
                            </p>
                            <p className="mt-1 text-sm text-stone-500">
                              {interview.scheduledDate.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getResponsePill(interview.responseStatus)}`}>
                            {interview.responseStatus}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-stone-600">
                          {user?.role === "employer" ? (
                            <>
                              <p className="rounded-2xl bg-stone-50 px-3 py-2">{interview.job?.title}</p>
                              <p className="rounded-2xl bg-stone-50 px-3 py-2">{interview.jobSeeker?.email}</p>
                            </>
                          ) : (
                            <>
                              <p className="rounded-2xl bg-stone-50 px-3 py-2">{interview.employer?.name}</p>
                              <p className="rounded-2xl bg-stone-50 px-3 py-2">{interview.employer?.email}</p>
                            </>
                          )}
                          <p className="rounded-2xl bg-stone-50 px-3 py-2">{formatInterviewType(interview.interviewType)}</p>
                          <p className="rounded-2xl bg-stone-50 px-3 py-2 break-all">{interview.interviewType === "online" ? interview.meetingLink : interview.location}</p>
                        </div>

                        {user?.role === "jobseeker" && interview.responseStatus !== "accepted" && (
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleInterviewResponse(interview._id, "accepted")}
                              className="app-button px-4 py-2 text-sm"
                            >
                              Accept
                            </button>
                            {interview.responseStatus !== "declined" && (
                              <button
                                type="button"
                                onClick={() => handleInterviewResponse(interview._id, "declined")}
                                className="app-button-secondary px-4 py-2 text-sm !text-red-600 border-red-200"
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="app-panel p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-stone-900">Upcoming agenda</h2>
                <div className="mt-4 space-y-3">
                  {upcomingInterviews.slice(0, 5).map((interview) => (
                    <button
                      key={interview._id}
                      type="button"
                      onClick={() => {
                        setMonthDate(new Date(interview.scheduledDate.getFullYear(), interview.scheduledDate.getMonth(), 1));
                        setSelectedDayKey(formatDayKey(interview.scheduledDate));
                      }}
                      className="w-full rounded-[24px] border border-stone-200 bg-gradient-to-r from-white to-blue-50/50 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:from-blue-50 hover:to-indigo-50/60"
                    >
                      <p className="font-semibold text-stone-900">
                        {user?.role === "employer"
                          ? `${interview.jobSeeker?.name} · ${interview.job?.title}`
                          : interview.job?.title}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {interview.scheduledDate.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewCalendar;
