import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify that the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Nur Admins können Benutzer erstellen" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get caller's display name for audit log
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, email")
      .eq("id", caller.id)
      .single();

    const callerName = callerProfile?.display_name || callerProfile?.email || caller.email || "Unbekannt";

    // Get request body
    const { email, password, displayName } = await req.json();

    if (!email || !password || !displayName) {
      return new Response(
        JSON.stringify({ error: "Email, Passwort und Anzeigename erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create user using admin API - this does NOT log out the caller
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        display_name: displayName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the profile to require password change
    if (newUser?.user) {
      await supabaseAdmin
        .from("profiles")
        .update({ must_change_password: true })
        .eq("id", newUser.user.id);

      // Log audit entry
      await supabaseAdmin.from("audit_logs").insert({
        user_id: caller.id,
        user_name: callerName,
        action: "INSERT",
        table_name: "users",
        record_id: newUser.user.id,
        new_data: { email, display_name: displayName },
        description: `Benutzer "${displayName}" (${email}) erstellt`,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser?.user?.id,
        message: "Benutzer erfolgreich erstellt" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Interner Serverfehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
