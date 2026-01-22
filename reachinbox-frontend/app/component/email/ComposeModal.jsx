"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  X,
  Clock,
  Upload,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Paperclip,
  RotateCcw,
  RotateCw,
  Type,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { scheduleEmail } from "../../store/emailSlice";

import { Dialog, DialogContent, DialogTitle } from "../../component/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../component/ui/popover";
import { Calendar } from "../../component/ui/calendar";

/* ---------- A11Y: No external dependency ---------- */
function VisuallyHidden({ children }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default function ComposeModal({ open, onClose }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const user = useSelector((s) => s.auth.user);
  const isLoading = useSelector((s) => s.email.isLoading);

  const [recipients, setRecipients] = useState([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledDate, setScheduledDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  /* ================= Helpers ================= */

  const addRecipient = (value) => {
    const email = value.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setRecipients((prev) => (prev.includes(email) ? prev : [...prev, email]));
    setRecipientInput("");
  };

  const removeRecipient = (email) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result || "";
      const emails = text
        .split(/[\n,;]/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"));

      setRecipients((prev) => [...new Set([...prev, ...emails])]);
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  /* ================= SUBMIT ================= */

  const handleSend = async () => {
    if (!user?._id) {
      console.error("User not ready");
      return;
    }

    if (!recipients.length || !subject.trim()) return;

    const formData = new FormData();
    formData.append("senderId", user._id);
    formData.append("subject", subject.trim());
    formData.append("body", body.trim());
    formData.append(
      "scheduledAt",
      (scheduledDate || new Date(Date.now() + 60000)).toISOString(),
    );
    formData.append("recipients", JSON.stringify(recipients));

    try {
      await dispatch(scheduleEmail(formData)).unwrap();
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to schedule email", err);
    }
  };

  const resetForm = () => {
    setRecipients([]);
    setRecipientInput("");
    setSubject("");
    setBody("");
    setScheduledDate(null);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden rounded-3xl shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Compose New Email</DialogTitle>
        </VisuallyHidden>

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Compose New Email
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="h-5 w-5 text-gray-600" />
            </button>

            <Popover open={showPicker} onOpenChange={setShowPicker}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Clock className="h-5 w-5 text-gray-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-4">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={(d) => {
                    if (!d) return;
                    d.setHours(9, 0, 0, 0);
                    setScheduledDate(d);
                    setShowPicker(false);
                  }}
                  disabled={(d) => d < new Date()}
                />
              </PopoverContent>
            </Popover>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={handleSend}
              disabled={isLoading || !recipients.length || !subject.trim()}
              className="ml-2 px-6 py-2 bg-teal-400 text-white rounded-full font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : scheduledDate ? (
                "Send Later"
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="space-y-5 max-w-4xl mx-auto">
            {/* From */}
            <Row label="From">
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-900">
                {user?.email}
              </div>
            </Row>

            {/* To */}
            <Row label="To">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl flex flex-wrap gap-2">
                  {recipients.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {r}
                      <button
                        onClick={() => removeRecipient(r)}
                        className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (["Enter", ",", " "].includes(e.key)) {
                        e.preventDefault();
                        addRecipient(recipientInput);
                      }
                    }}
                    placeholder="recipient@example.com"
                    className="flex-1 min-w-[200px] outline-none text-sm bg-transparent placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 text-teal-500 text-sm font-medium flex items-center gap-1 hover:text-teal-600 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload List
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </Row>

            {/* Subject */}
            <Row label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400 transition-colors placeholder:text-gray-400"
                placeholder="Enter email subject..."
              />
            </Row>

            {/* Settings Row */}
            <Row label="Settings">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Delay between emails</span>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center outline-none focus:border-teal-400 transition-colors"
                  />
                  <span className="text-gray-600">sec</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">Hourly Limit</span>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>
            </Row>

            {/* Editor */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <RotateCw className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Type className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Bold className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Italic className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Underline className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <AlignLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <List className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-80 p-4 resize-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Type Your Reply..."
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= Small UI helpers ================= */

function Row({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <label className="w-24 text-sm text-gray-600 shrink-0 pt-3">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ToolbarBtn({ icon: Icon }) {
  return (
    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
      <Icon className="h-4 w-4 text-gray-600" />
    </button>
  );
}
