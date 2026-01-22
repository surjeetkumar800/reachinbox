"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { Sidebar } from "../component/layout/Sidebar";
import { Header } from "../component/layout/Header";
import { EmailList } from "../component/email/EmailList";
import { EmailDetail } from "../component/email/EmailDetail";
import ComposeModal from "../component/email/ComposeModal";


import {
  fetchScheduledEmails,
  fetchSentEmails,
} from "../store/emailSlice";
import { fetchMe } from "../store/authSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= REDUX STATE ================= */
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state) => state.auth
  );

  const {
    scheduledEmails,
    sentEmails,
    isLoading: emailLoading,
  } = useSelector((state) => state.email);

  /* ================= LOCAL UI STATE ================= */
  const [activeTab, setActiveTab] = useState("scheduled");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  /* ================= FETCH EMAILS ================= */
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchScheduledEmails());
      dispatch(fetchSentEmails());
    }
  }, [dispatch, isAuthenticated]);

  /* ================= FILTER ================= */
  const currentEmails =
    activeTab === "scheduled" ? scheduledEmails : sentEmails;

  const filteredEmails = searchQuery
    ? currentEmails.filter((email) => {
        const to = Array.isArray(email.to)
          ? email.to.join(", ")
          : email.to || "";

        return (
          to.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.subject
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          email.body
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      })
    : currentEmails;

  /* ================= HANDLERS ================= */
  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleBack = () => {
    setSelectedEmail(null);
  };

  /* ================= LOADING ================= */
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Checking authentication…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect ho chuka hoga
  }

  /* ================= UI ================= */
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top strip */}
      <div className="h-8 flex items-center px-4 bg-slate-900">
        <span className="text-sm text-slate-400">
          Dashboard
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedEmail(null);
          }}
          onCompose={() => setIsComposeOpen(true)}
        />

        {/* Main */}
        {selectedEmail ? (
          <EmailDetail
            email={selectedEmail}
            onBack={handleBack}
          />
        ) : (
          <main className="flex-1 flex flex-col overflow-hidden bg-card">
            <Header
              onSearch={setSearchQuery}
              onRefresh={() => {
                dispatch(fetchScheduledEmails());
                dispatch(fetchSentEmails());
              }}
            />

            <EmailList
              emails={filteredEmails}
              type={activeTab}
              onEmailClick={handleEmailClick}
              isLoading={emailLoading}
            />
          </main>
        )}
      </div>

      {/* Compose */}
      <ComposeModal
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
