"use client";

import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { cancelScheduledEmail } from "../../store/emailSlice";

import { Avatar, AvatarFallback } from "../../component/ui/avatar";

/* =========================
   REAL DATE FORMATTERS
   (no mock, no fake data)
========================= */
function formatDateTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function EmailDetail({ email, onBack }) {
  const dispatch = useDispatch();

  // 🔥 Redux state (real user from backend)
  const user = useSelector((state) => state.auth.user);

  const handleCancel = async () => {
    await dispatch(cancelScheduledEmail(email.id));
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="icon-btn">
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h2 className="font-semibold text-lg truncate max-w-md">
            {email.subject}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button className="icon-btn">
            <Star className="h-5 w-5" />
          </button>

          <button className="icon-btn">
            <Archive className="h-5 w-5" />
          </button>

          {email.status === "scheduled" && (
            <button
              onClick={handleCancel}
              className="icon-btn text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}

          <Avatar className="h-9 w-9 ml-2 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* ===== STATUS BANNER ===== */}
          {email.status === "scheduled" && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">
                  Scheduled for {formatDateTime(email.scheduledAt)}
                </p>
                <p className="text-sm text-amber-700">
                  This email will be sent automatically.
                </p>
              </div>
            </div>
          )}

          {email.status === "sent" && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">
                  Sent successfully
                </p>
                <p className="text-sm text-emerald-700">
                  Delivered {formatRelativeTime(email.sentAt)}
                </p>
              </div>
            </div>
          )}

          {/* ===== SENDER INFO ===== */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    &lt;{user?.email}&gt;
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  {email.status === "sent"
                    ? formatRelativeTime(email.sentAt)
                    : formatDateTime(email.scheduledAt)}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                to {email.to}
              </p>
            </div>
          </div>

          {/* ===== EMAIL BODY ===== */}
          <div className="prose prose-sm max-w-none">
            {email.body
              ?.split("\n")
              .filter(Boolean)
              .map((line, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {line}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
