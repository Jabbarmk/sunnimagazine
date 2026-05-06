import { BookmarkProvider } from "@/lib/bookmarks";
import PhoneFrame from "@/components/PhoneFrame";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BookmarkProvider>
      <PhoneFrame>{children}</PhoneFrame>
    </BookmarkProvider>
  );
}
