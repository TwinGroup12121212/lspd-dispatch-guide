import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LockInfo {
  user_id: string;
  user_name: string;
  locked_at: string;
  expires_at: string;
}

export function useStrafkatalogLock() {
  const { user, displayName } = useAuth();
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isMyLock, setIsMyLock] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Check current lock status
  const checkLock = useCallback(async () => {
    const { data, error } = await supabase
      .from("strafkatalog_lock")
      .select("*")
      .order("locked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking lock:", error);
      return;
    }

    if (data) {
      const expiresAt = new Date(data.expires_at);
      const now = new Date();

      if (expiresAt > now) {
        // Lock is still valid
        setLockInfo(data);
        setIsLocked(true);
        setIsMyLock(data.user_id === user?.id);
        setRemainingSeconds(Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
      } else {
        // Lock has expired, clean it up
        await supabase.from("strafkatalog_lock").delete().eq("id", data.id);
        setLockInfo(null);
        setIsLocked(false);
        setIsMyLock(false);
        setRemainingSeconds(0);
      }
    } else {
      setLockInfo(null);
      setIsLocked(false);
      setIsMyLock(false);
      setRemainingSeconds(0);
    }
  }, [user?.id]);

  // Acquire lock when user starts editing
  const acquireLock = useCallback(async () => {
    if (!user) return false;

    // First, clean up any expired locks
    await supabase
      .from("strafkatalog_lock")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Check if there's an active lock
    const { data: existingLock } = await supabase
      .from("strafkatalog_lock")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingLock && existingLock.user_id !== user.id) {
      // Someone else has the lock
      return false;
    }

    // Create or refresh our lock
    if (existingLock && existingLock.user_id === user.id) {
      // Refresh existing lock
      const expiresAt = new Date(Date.now() + 120 * 1000);
      await supabase
        .from("strafkatalog_lock")
        .update({ expires_at: expiresAt.toISOString() })
        .eq("id", existingLock.id);
    } else {
      // Create new lock
      const expiresAt = new Date(Date.now() + 120 * 1000);
      await supabase.from("strafkatalog_lock").insert({
        user_id: user.id,
        user_name: displayName || user.email || "Unbekannt",
        expires_at: expiresAt.toISOString(),
      });
    }

    await checkLock();
    return true;
  }, [user, displayName, checkLock]);

  // Release lock
  const releaseLock = useCallback(async () => {
    if (!user) return;

    await supabase.from("strafkatalog_lock").delete().eq("user_id", user.id);
    await checkLock();
  }, [user, checkLock]);

  // Initial check and subscribe to changes
  useEffect(() => {
    checkLock();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("strafkatalog-lock-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "strafkatalog_lock",
        },
        () => {
          checkLock();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkLock]);

  // Countdown timer
  useEffect(() => {
    if (!isLocked || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          checkLock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, remainingSeconds, checkLock]);

  // Auto-refresh lock while user is active
  useEffect(() => {
    if (!isMyLock) return;

    const interval = setInterval(() => {
      acquireLock();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [isMyLock, acquireLock]);

  return {
    lockInfo,
    isLocked,
    isMyLock,
    remainingSeconds,
    acquireLock,
    releaseLock,
    canEdit: !isLocked || isMyLock,
  };
}
