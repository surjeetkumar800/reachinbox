"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { fetchScheduledEmails, fetchSentEmails } from "./store/emailSlice";
import { fetchMe } from "./store/authSlice";

import { Sidebar } from "./component/layout/Sidebar";
import { Header } from "./component/layout/Header";
import { EmailList } from "./component/email/EmailList";
import { EmailDetail } from "./component/email/EmailDetail";
import ComposeModal from "./component/email/ComposeModal";

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("scheduled");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [openCompose, setOpenCompose] = useState(false);

  /* ===== Redux Auth State ===== */
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state) => state.auth,
  );

  const { scheduledEmails, sentEmails } = useSelector((state) => state.email);

  /* =========================
     AUTH CHECK ON LOAD
  ========================= */
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  /* =========================
     REDIRECT IF NOT LOGGED IN
  ========================= */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  /* =========================
     FETCH EMAILS AFTER LOGIN
  ========================= */
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchScheduledEmails());
      dispatch(fetchSentEmails());
    }
  }, [dispatch, isAuthenticated]);

  /* =========================
     LOADING STATE
  ========================= */
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking authentication…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect ho chuka hoga
  }

  const emails = activeTab === "scheduled" ? scheduledEmails : sentEmails;

  return (
    <div className="h-screen flex bg-background">
      {/* ===== SIDEBAR ===== */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedEmail(null);
          setActiveTab(tab);
        }}
        onCompose={() => setOpenCompose(true)}
      />

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onRefresh={() => {
            dispatch(fetchScheduledEmails());
            dispatch(fetchSentEmails());
          }}
        />

        <div className="flex-1 flex overflow-hidden">
          {selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
            />
          ) : (
            <EmailList
              emails={emails}
              type={activeTab}
              onEmailClick={setSelectedEmail}
            />
          )}
        </div>
      </div>

      {/* ===== COMPOSE MODAL ===== */}
      <ComposeModal open={openCompose} onClose={() => setOpenCompose(false)} />
    </div>
  );
}
