"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useDonationFlow } from "./context";
import { getFlowRedirect } from "./state";

export function FlowGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useDonationFlow();
  const redirect = getFlowRedirect(pathname, state);

  useEffect(() => {
    if (state.hydrated && redirect) {
      router.replace(redirect, { scroll: false });
    }
  }, [redirect, router, state.hydrated]);

  return state.hydrated && redirect ? null : children;
}
