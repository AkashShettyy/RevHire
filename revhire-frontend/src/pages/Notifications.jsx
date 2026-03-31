import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllRead } from "../services/notificationService";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const CATEGORY_FILTERS = [
  { label: "Everything", value: "all" },
  { label: "Applications", value: "application" },
  { label: "Interviews", value: "interview" },
  { label: "Jobs", value: "job" },
  { label: "System", value: "system" },
];

function getNotificationCategory(message) {
  const normalizedMessage = String(message || "").toLowerCase();

  if (normalizedMessage.includes("interview")) return "interview";
  if (normalizedMessage.includes("application") || normalizedMessage.includes("candidate")) return "application";
  if (normalizedMessage.includes("job")) return "job";

  return "system";
}

function getCategoryStyles(category) {
  switch (category) {
    case "interview":
      return "bg-violet-50 text-violet-700 border border-violet-100";
    case "application":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "job":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    default:
      return "bg-stone-100 text-stone-700 border border-stone-200";
  }
}

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffInMinutes = Math.round((timestamp - Date.now()) / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, "day");
  }

  return new Date(value).toLocaleDateString();
}

function Notifications() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [message, setMessage] = useState("");

  const fetchNotificationsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications(token);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotificationsData();
  }, [fetchNotificationsData]);

  const enrichedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        category: getNotificationCategory(notification.message),
      })),
    [notifications],
  );

  const filteredNotifications = useMemo(
    () =>
      enrichedNotifications.filter((notification) => {
        const matchesStatus =
          statusFilter === "all" ? true : notification.status === statusFilter;
        const matchesCategory =
          categoryFilter === "all" ? true : notification.category === categoryFilter;

        return matchesStatus && matchesCategory;
      }),
    [categoryFilter, enrichedNotifications, statusFilter],
  );

  const unreadCount = enrichedNotifications.filter(
    (notification) => notification.status === "unread",
  ).length;

  const categorySummary = enrichedNotifications.reduce(
    (summary, notification) => {
      summary[notification.category] = (summary[notification.category] || 0) + 1;
      return summary;
    },
    { application: 0, interview: 0, job: 0, system: 0 },
  );

  async function handleMarkAllRead() {
    setIsMarkingAllRead(true);
    try {
      await markAllRead(token);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, status: "read" })),
      );
      setMessage("All notifications marked as read.");
      window.setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Unable to update notifications.");
    } finally {
      setIsMarkingAllRead(false);
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
    <div className="app-shell">
      <div className="layout-container max-w-5xl py-8">
        <div className="page-hero px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">
                Notification center
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
                {user?.role === "employer" ? "Hiring updates, organized." : "Every update, one calm inbox."}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-surface-700">
                Review application changes, interview activity, and platform updates without relying on the navbar dropdown.
              </p>
            </div>

            <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="metric-tile px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-600">Unread</p>
                <p className="mt-3 text-3xl font-bold text-surface-900">{unreadCount}</p>
              </div>
              <div className="metric-tile px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-600">Applications</p>
                <p className="mt-3 text-3xl font-bold text-surface-900">{categorySummary.application}</p>
              </div>
              <div className="metric-tile px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-600">Interviews</p>
                <p className="mt-3 text-3xl font-bold text-surface-900">{categorySummary.interview}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingAllRead ? "Updating..." : "Mark All Read"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(user?.role === "employer" ? "/employer/dashboard" : "/dashboard")
              }
              className="btn-primary text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="layout-container max-w-5xl py-8">
        {message && (
          <div className={message.includes("Unable") ? "mb-5 rounded-xl border border-error-200 bg-error-50 p-4 font-semibold text-error-800" : "mb-5 rounded-xl border border-success-200 bg-success-50 p-4 font-semibold text-success-800"}>
            {message}
          </div>
        )}

        <div className="section-card mt-2 overflow-hidden p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const isActive = filter.value === statusFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100"
                        : "border-surface-300 bg-white text-surface-700 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((filter) => {
                const isActive = filter.value === categoryFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setCategoryFilter(filter.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-200"
                        : "border-surface-300 bg-white text-surface-700 hover:-translate-y-0.5 hover:border-surface-400 hover:text-surface-900"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
        </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="premium-card mt-6 p-16 text-center">
            <p className="mb-4 text-5xl">🔔</p>
            <p className="font-medium text-surface-800">No notifications found</p>
            <p className="mt-1 text-sm text-surface-700">
              Try changing the filters or come back after new activity appears.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredNotifications.map((notification) => (
              <article
                key={notification._id}
                className={`section-card relative overflow-hidden p-5 transition-all duration-200 ${
                  notification.status === "unread" ? "border-blue-200 shadow-xl shadow-blue-100/40" : ""
                }`}
              >
                <div className={`absolute inset-y-5 left-0 w-1 rounded-full ${notification.status === "unread" ? "bg-blue-500" : "bg-stone-200"}`} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getCategoryStyles(notification.category)}`}
                      >
                        {notification.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          notification.status === "unread"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-surface-800">{notification.message}</p>
                  </div>
                  <div className="shrink-0 text-sm text-surface-600">
                    <p>{formatRelativeTime(notification.createdAt)}</p>
                    <p className="mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
