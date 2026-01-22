"use client";

import { Clock, Send, ChevronDown, LogOut, Settings, Mail } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/authSlice";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "../../component/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../component/ui/dropdown-menu";

export function Sidebar({ activeTab, onTabChange, onCompose }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth,
  );

  const scheduledEmails = useSelector((state) => state.email.scheduledEmails);
  const sentEmails = useSelector((state) => state.email.sentEmails);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col h-screen">
      {/* ================= LOGO ================= */}
      <div className="flex items-center justify-center px-6 py-6 border-b">
        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <img src="/favicon.ico" alt="ReachInbox" className="h-6 w-6" />
        </div>
      </div>

      {/* ================= USER ================= */}
      <div className="px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>

              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ================= COMPOSE ================= */}
      <div className="px-4 pb-4">
        <button
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition"
        >
          <Mail className="h-4 w-4" />
          Compose
        </button>
      </div>

      {/* ================= NAV ================= */}
      <nav className="px-4 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-2">
          Core
        </p>

        <div className="space-y-1">
          <SidebarItem
            active={activeTab === "scheduled"}
            onClick={() => onTabChange("scheduled")}
            icon={<Clock className="h-4 w-4" />}
            label="Scheduled"
            count={scheduledEmails.length}
          />

          <SidebarItem
            active={activeTab === "sent"}
            onClick={() => onTabChange("sent")}
            icon={<Send className="h-4 w-4" />}
            label="Sent"
            count={sentEmails.length}
          />
        </div>
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="p-4 border-t">
        <p className="text-[11px] text-muted-foreground text-center">
          © {new Date().getFullYear()} ReachInbox
        </p>
      </div>
    </aside>
  );
}

/* ================= ITEM ================= */
function SidebarItem({ icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
        active
          ? "bg-emerald-50 text-emerald-600 font-semibold"
          : "hover:bg-muted"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>

      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
