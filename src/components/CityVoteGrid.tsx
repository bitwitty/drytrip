"use client";

const CITIES = [
  { city: "New York", emoji: "\u{1F5FD}" },
  { city: "Berlin", emoji: "\u{1F1E9}\u{1F1EA}" },
  { city: "Melbourne", emoji: "\u{1F1E6}\u{1F1FA}" },
  { city: "Los Angeles", emoji: "\u{1F334}" },
  { city: "Copenhagen", emoji: "\u{1F1E9}\u{1F1F0}" },
  { city: "Dubai", emoji: "\u{1F3DC}\u{FE0F}" },
];

export default function CityVoteGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {CITIES.map(({ city, emoji }) => (
        <button
          key={city}
          type="button"
          className="group flex flex-col items-center gap-3 rounded-xl border border-sandstone/40 bg-white px-4 py-6 text-center shadow-sm transition-all hover:border-forest/30 hover:shadow-md"
          onClick={() => {
            document
              .getElementById("newsletter")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-medium text-forest group-hover:text-forest/80">
            {city}
          </span>
        </button>
      ))}
    </div>
  );
}
