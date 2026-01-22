"use client";

import { Star, Clock, CheckCircle2, Mail } from "lucide-react";
import { useSelector } from "react-redux";

/* =========================
   TIME HELPERS
========================= */
function formatDateTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const diff = new Date(dateString) - new Date();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins <= 0) return "Now";
  if (mins < 60) return `in ${mins}m`;
  if (hours < 24) return `in ${hours}h`;
  return `in ${days}d`;
}

function formatSentTime(dateString) {
  if (!dateString) return "";
  const diff = new Date() - new Date(dateString);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* =========================
   COMPONENT
========================= */
export function EmailList({ emails, type = "scheduled", onEmailClick }) {
  const isLoading = useSelector((state) => state.email.isLoading);

  /* ===== NORMALIZE DATA ===== */
  const safeEmails = Array.isArray(emails)
    ? emails
    : Array.isArray(emails?.data)
      ? emails.data
      : [];

  /* ===== LOADING ===== */
  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b">
            <div className="skeleton w-24 h-4" />
            <div className="flex-1 skeleton h-4" />
            <div className="skeleton w-10 h-4" />
          </div>
        ))}
      </div>
    );
  }

  /* ===== EMPTY ===== */
  if (!safeEmails.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Mail className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No {type} emails</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {type === "scheduled"
              ? "Your scheduled emails will appear here"
              : "Sent emails will appear here"}
          </p>
        </div>
      </div>
    );
  }

  /* ===== LIST ===== */
  return (
    <div className="flex-1 overflow-auto">
      {safeEmails.map((email) => {
        const recipient = Array.isArray(email.to) ? email.to[0] : email.to;

        const preview = email.body?.replace(/\n/g, " ").slice(0, 80) || "";

        return (
          <div
            key={email._id}
            onClick={() => onEmailClick?.(email)}
            className="group flex items-center gap-4 px-6 py-4 border-b hover:bg-muted/40 cursor-pointer transition"
          >
            {/* LEFT: TO */}
            <div className="w-40 shrink-0">
              <p className="text-sm font-medium truncate">
                To: {recipient?.split("@")[0] || "Unknown"}
              </p>
            </div>

            {/* CENTER: SUBJECT + PREVIEW */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {type === "scheduled" ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(email.scheduledAt)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Sent
                  </span>
                )}

                <p className="font-medium text-sm truncate">
                  {email.subject || "(No subject)"}
                </p>
              </div>

              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {preview}
              </p>
            </div>

            {/* RIGHT: TIME + STAR */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground">
                {type === "scheduled"
                  ? formatRelativeTime(email.scheduledAt)
                  : formatSentTime(email.sentAt)}
              </span>

              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-amber-400"
              >
                <Star className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
