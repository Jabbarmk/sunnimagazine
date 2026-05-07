import { ReactNode } from "react";
import SplashScreen from "./SplashScreen";

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-start md:items-center justify-center py-0 md:py-10">
      <div className="phone-shell relative w-full max-w-[420px] md:w-[420px] md:h-[860px] overflow-hidden md:rounded-[44px] bg-bg flex flex-col">
        {children}
        <SplashScreen />
      </div>
    </div>
  );
}
