"use client";

import { useState } from "react";
import ApprovalsList from "@/components/ApprovalsList";

export default function ApprovalsPage() {
  const [count, setCount] = useState<number | null>(null);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#141416] leading-tight">
          Approvals
          {count !== null && count > 0 && (
            <span className="ml-2 text-[13px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 align-middle">
              {count} pending
            </span>
          )}
        </h1>
        <p className="text-[13px] text-[#6B6B70] mt-1">
          New registrations without a subscription. Approve to add their first subscription
          (a login password is generated if they don&apos;t have one), or reject to deactivate the account.
        </p>
      </div>

      <ApprovalsList searchable onCountChange={setCount} />
    </div>
  );
}
