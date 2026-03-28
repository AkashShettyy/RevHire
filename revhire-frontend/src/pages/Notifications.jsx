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
    <div className="app-page">
      <div className="app-hero">
        <div className="app-shell max-w-5xl py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="app-eyebrow">Notification center</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950">
                {user?.role === "employer" ? "Hiring updates" : "Your latest updates"}
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Review application changes, interview activity, and platform updates in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || isMarkingAllRead}
                className="app-button-secondary px-4 py-2"
              >
                {isMarkingAllRead ? "Updating..." : "Mark All Read"}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(user?.role === "employer" ? "/employer/dashboard" : "/dashboard")
                }
                className="app-button px-4 py-2"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="app-shell max-w-5xl py-8">
        {message && (
          <div className={message.includes("Unable") ? "app-message-error mb-5" : "app-message-success mb-5"}>
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="app-stat">
            <p className="text-sm font-medium text-stone-500">Total</p>
            <p className="mt-3 text-3xl font-bold text-stone-900">{enrichedNotifications.length}</p>
          </div>
          <div className="app-stat">
            <p className="text-sm font-medium text-stone-500">Unread</p>
            <p className="mt-3 text-3xl font-bold text-blue-700">{unreadCount}</p>
          </div>
          <div className="app-stat">
            <p className="text-sm font-medium text-stone-500">Applications</p>
            <p className="mt-3 text-3xl font-bold text-blue-700">{categorySummary.application}</p>
          </div>
          <div className="app-stat">
            <p className="text-sm font-medium text-stone-500">Interviews</p>
            <p className="mt-3 text-3xl font-bold text-violet-700">{categorySummary.interview}</p>
          </div>
        </div>

        <div className="app-panel mt-6 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const isActive = filter.value === statusFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-stone-200 bg-white text-stone-600 hover:border-blue-200 hover:text-blue-700"
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
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
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
          <div className="app-empty mt-6">
            <p className="mb-4 text-5xl">🔔</p>
            <p className="font-medium text-stone-700">No notifications found</p>
            <p className="mt-1 text-sm text-stone-400">
              Try changing the filters or come back after new activity appears.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredNotifications.map((notification) => (
              <article
                key={notification._id}
                className={`app-panel p-5 transition-all duration-200 ${
                  notification.status === "unread" ? "border-blue-200 shadow-xl shadow-blue-100/40" : ""
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
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
                    <p className="mt-3 text-sm leading-6 text-stone-700">{notification.message}</p>
                  </div>
                  <div className="shrink-0 text-sm text-stone-400">
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
