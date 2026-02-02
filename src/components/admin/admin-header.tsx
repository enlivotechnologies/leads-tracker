"use client";

import { useState, useEffect } from "react";
import { signOut } from "@/app/actions/auth";

interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
  };
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
    >
      <path
        d="M11.75,11.5c-.414,0-.75,.336-.75,.75v2.5c0,.138-.112,.25-.25,.25H5.448l1.725-1.069c.518-.322,.827-.878,.827-1.487V5.557c0-.609-.31-1.166-.827-1.487l-1.725-1.069h5.302c.138,0,.25,.112,.25,.25v2.5c0,.414,.336,.75,.75,.75s.75-.336,.75-.75V3.25c0-.965-.785-1.75-1.75-1.75H4.25c-.965,0-1.75,.785-1.75,1.75V14.75c0,.965,.785,1.75,1.75,1.75h6.5c.965,0,1.75-.785,1.75-1.75v-2.5c0-.414-.336-.75-.75-.75Z"
        fill="currentColor"
      ></path>
      <path
        d="M17.78,8.47l-2.75-2.75c-.293-.293-.768-.293-1.061,0s-.293,.768,0,1.061l1.47,1.47h-4.189c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h4.189l-1.47,1.47c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22s.384-.073,.53-.22l2.75-2.75c.293-.293,.293-.768,0-1.061Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const hour = now.getHours();

    // Set greeting
    if (hour < 12) setGreeting("Morning");
    else if (hour < 17) setGreeting("Afternoon");
    else setGreeting("Evening");

    // Set formatted date
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setFormattedDate(now.toLocaleDateString("en-US", options));
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  // Get first name only
  const firstName = admin.name.split(" ")[0];

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-slate-800">
              {mounted ? `${greeting}, ${firstName}` : `Hello, ${firstName}`}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {mounted ? formattedDate : ""}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-stone-200 text-slate-700 hover:bg-stone-300 transition-colors"
            title="Sign Out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
