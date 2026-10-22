import { useEffect, useState } from "react";
import { applicationsOpen } from "@/lib/recruiting-calendar";

/** Whether the application window is open right now. Re-checked every minute. */
export function useApplicationsOpen(): boolean {
  const [open, setOpen] = useState(() => applicationsOpen(Date.now()));
  useEffect(() => {
    setOpen(applicationsOpen(Date.now()));
    const id = setInterval(() => setOpen(applicationsOpen(Date.now())), 60_000);
    return () => clearInterval(id);
  }, []);
  return open;
}
