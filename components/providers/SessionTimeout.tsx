"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

const INACTIVITY_LIMIT = 30 * 60 * 1000;

export default function SessionTimeout() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    function resetTimer() {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        signOut({
          callbackUrl: "/login?expired=1",
        });
      }, INACTIVITY_LIMIT);
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeout);

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
}