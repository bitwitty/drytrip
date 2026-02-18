import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const candidates = ["scraped", "active", "published", "draft", "pending", "approved", "review", "live", "new"];

  for (const status of candidates) {
    const { error } = await sb.from("venues").insert({
      name: "__test__", city: "__test__", country: "Test", category: "Bar",
      dry_score: 0, top_na_drink: "N/A", description: "test",
      website_url: "https://test.com", status,
      af_minibar: false, zero_proof_pairing: false,
    });
    if (!error) {
      console.log(`"${status}" -> VALID`);
      await sb.from("venues").delete().eq("name", "__test__").eq("city", "__test__");
    } else if (error.message.includes("status_check")) {
      console.log(`"${status}" -> rejected`);
    } else {
      console.log(`"${status}" -> other error: ${error.message}`);
    }
  }
}

main();
