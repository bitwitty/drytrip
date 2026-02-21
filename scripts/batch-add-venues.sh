#!/bin/bash
# Batch-add curated London venues with strong NA programs
# Each call researches the venue via Claude and inserts as Draft

set -a && source .env && set +a

add() {
  echo "========================================"
  echo "Adding: $1 ($3 in $2)"
  echo "========================================"
  node --experimental-strip-types --no-warnings scripts/add-venue.ts "$1" "$2" "$3"
  echo ""
  sleep 2  # pause between API calls
}

# --- BARS ---
add "Lyaness" "London" "Bar"
add "The Connaught Bar" "London" "Bar"
add "Artesian at The Langham" "London" "Bar"
add "Swift" "London" "Bar"
add "Nightjar" "London" "Bar"
add "Dandelyan" "London" "Bar"
add "Scout" "London" "Bar"
add "Three Sheets" "London" "Bar"
add "Tayēr + Elementary" "London" "Bar"
add "Bar Crispin" "London" "Bar"
add "The Sun Tavern" "London" "Bar"
add "Seed Library" "London" "Bar"

# --- RESTAURANTS ---
add "The Wolseley" "London" "Restaurant"
add "Brat" "London" "Restaurant"
add "The Clove Club" "London" "Restaurant"
add "St. John" "London" "Restaurant"
add "Padella" "London" "Restaurant"
add "Spring" "London" "Restaurant"
add "The River Café" "London" "Restaurant"
add "Dishoom" "London" "Restaurant"
add "Noble Rot" "London" "Restaurant"
add "Ottolenghi" "London" "Restaurant"

# --- HOTELS ---
add "The Savoy" "London" "Hotel"
add "Claridges" "London" "Hotel"
add "The Ned" "London" "Hotel"
add "Ham Yard Hotel" "London" "Hotel"
add "The Hoxton Southwark" "London" "Hotel"
add "Nobu Hotel Shoreditch" "London" "Hotel"
add "The Zetter Townhouse" "London" "Hotel"
add "Shangri-La The Shard" "London" "Hotel"
add "Mondrian London" "London" "Hotel"

echo "========================================"
echo "DONE! All venues added as Drafts."
echo "Review at /admin/review or in Supabase dashboard."
echo "========================================"
