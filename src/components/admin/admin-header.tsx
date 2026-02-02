"use client";

import { signOut } from "@/app/actions/auth";
import { LogOut, Sun } from "lucide-react";

interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
  };
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  // Get first name only
  const firstName = admin.name.split(" ")[0];

  return (
    <header className="bg-slate-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Hey, {firstName}
              <span className="ml-1">👋</span>
            </h1>
            <p className="text-slate-500 italic mt-0.5">
              Let&apos;s track team progress today!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
