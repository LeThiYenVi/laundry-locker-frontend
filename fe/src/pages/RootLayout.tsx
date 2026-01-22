import React, { JSX } from "react";
import { Outlet } from "react-router-dom";
import LanguageSwitcher from "~/components/ui/LanguageSwitcher";

export default function RootLayout(): JSX.Element {
  return (
    <div className="min-h-screen relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
}
