const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data } = await sb.from("venues")
    .select("name, city, category, neighborhood, dry_score, top_na_drink, short_description")
    .eq("status", "Published")
    .order("city").order("dry_score", { ascending: false });

  let current = "";
  data.forEach(v => {
    if (v.city !== current) {
      current = v.city;
      console.log("\n## " + current);
    }
    const drink = v.top_na_drink || "Not specified";
    console.log(`- **${v.name}** (${v.category}, ${v.neighborhood}) — Dry Score ${v.dry_score}/5. Top NA drink: ${drink}. ${v.short_description}`);
  });
})();
