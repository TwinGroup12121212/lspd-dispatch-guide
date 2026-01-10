import { supabase } from "@/integrations/supabase/client";

type AuditAction = "INSERT" | "UPDATE" | "DELETE";

interface LogAuditParams {
  action: AuditAction;
  tableName: string;
  recordId?: string;
  oldData?: unknown;
  newData?: unknown;
  description?: string;
}

export async function logAudit({
  action,
  tableName,
  recordId,
  oldData,
  newData,
  description,
}: LogAuditParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .single();

    const userName = profile?.display_name || profile?.email || user.email || "Unbekannt";

    await supabase.from("audit_logs").insert([{
      user_id: user.id,
      user_name: userName,
      action,
      table_name: tableName,
      record_id: recordId || null,
      old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
      description: description || null,
    }]);
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}
