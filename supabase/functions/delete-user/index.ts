import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get userId from body first
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid userId format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the calling user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller's display name for audit log
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, email")
      .eq("id", callingUser.id)
      .maybeSingle();

    const callerName = callerProfile?.display_name || callerProfile?.email || callingUser.email || "Unbekannt";

    // Get user data before deletion for audit log
    const { data: userToDelete } = await supabaseAdmin
      .from("profiles")
      .select("display_name, email")
      .eq("id", userId)
      .maybeSingle();

    const deletedUserName = userToDelete?.display_name || userToDelete?.email || "Unbekannt";
    const deletedUserEmail = userToDelete?.email || "Unbekannt";

    // IMPORTANT: clean up dependent rows first (FKs to auth.users can otherwise block deletion)
    const { error: nullUpdatedByError } = await supabaseAdmin
      .from("leitstellenblatt")
      .update({ updated_by: null })
      .eq("updated_by", userId);

    if (nullUpdatedByError) {
      console.error("Error nulling updated_by:", nullUpdatedByError);
      return new Response(
        JSON.stringify({ error: "Database error preparing user deletion" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deleteRolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteRolesError) {
      console.error("Error deleting user_roles:", deleteRolesError);
      return new Response(
        JSON.stringify({ error: "Database error preparing user deletion" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: deleteProfileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      console.error("Error deleting profile:", deleteProfileError);
      return new Response(
        JSON.stringify({ error: "Database error preparing user deletion" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete user from authentication system
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      // If user is already deleted from auth (404), treat as success
      const errorMessage = deleteError.message?.toLowerCase() || "";
      if (errorMessage.includes("not found") || errorMessage.includes("user not found")) {
        console.log("User already deleted from auth system, treating as success");
      } else {
        console.error("Error deleting auth user:", deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Log audit entry
    await supabaseAdmin.from("audit_logs").insert({
      user_id: callingUser.id,
      user_name: callerName,
      action: "DELETE",
      table_name: "users",
      record_id: userId,
      old_data: { display_name: deletedUserName, email: deletedUserEmail },
      description: `Benutzer "${deletedUserName}" (${deletedUserEmail}) gelöscht`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
