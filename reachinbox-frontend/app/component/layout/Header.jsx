"use client";

import { Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export function Header({ onSearch, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");

  /* ===== Redux state ===== */
  const { isAuthenticated, isLoading: authLoading } = useSelector(
    (state) => state.auth,
  );

  const emailLoading = useSelector((state) => state.email.isLoading);

  /* =================================================
     ❌ Not logged in or auth loading → no header
  ================================================= */
  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/50 border border-transparent text-sm
                       placeholder:text-muted-foreground focus:outline-none
                       focus:ring-2 focus:ring-primary/20
                       focus:border-primary focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button className="icon-btn" title="Filter (coming soon)" disabled>
          <Filter className="h-4 w-4 opacity-50" />
        </button>

        <button
          onClick={onRefresh}
          disabled={emailLoading}
          className="icon-btn"
          title="Refresh"
        >
          {emailLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
