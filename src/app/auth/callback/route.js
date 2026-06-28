import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  // If Supabase returned an error, send to login with message
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${origin}/login?error=oauth_error`);
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Exchange error:", exchangeError.message);
      return NextResponse.redirect(`${origin}/login?error=oauth_error`);
    }

    if (data?.user) {
      // Auto-create profile if first Google login
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id        : data.user.id,
          full_name : data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
          email     : data.user.email,
          photo_url : data.user.user_metadata?.avatar_url || "",
        });
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}