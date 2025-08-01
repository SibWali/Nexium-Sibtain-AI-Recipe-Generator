"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/recipes"); // ✅ Go to recipe generator
      } else {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  return <p>Logging you in...</p>;
}
