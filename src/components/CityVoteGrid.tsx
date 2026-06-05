"use client";

import { Check } from "lucide-react";

const CITIES = [
  { city: "New York", emoji: "\u{1F5FD}" },
  { city: "Berlin", emoji: "\u{1F1E9}\u{1F1EA}" },
  { city: "Melbourne", emoji: "\u{1F1E6}\u{1F1FA}" },
  { city: "Los Angeles", emoji: "\u{1F334}" },
  { city: "Copenhagen", emoji: "\u{1F1E9}\u{1F1F0}" },
  { city: "Dubai", emoji: "\u{1F3DC}\u{FE0F}" },
];

interface CityVoteGridProps {
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
}

export default function CityVoteGrid({
  selectedCity,
  onSelectCity,
}: CityVoteGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {CITIES.map(({ city, emoji }) => {
        const isSelected = selectedCity === city;
        return (
          <button
            key={city}
            type="button"
            className={`group relative flex flex-col items-center gap-3 rounded-xl border px-4 py-6 text-center shadow-sm transition-all ${
              isSelected
                ? "border-forest bg-forest/5 shadow-md"
                : "border-sandstone/40 bg-white hover:border-forest/30 hover:shadow-md"
            }`}
            onClick={() => {
              onSelectCity(isSelected ? null : city);
              document
                .getElementById("newsletter")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {isSelected && (
              <span className="absolute top-2 right-2">
                <Check className="size-4 text-forest" />
              </span>
            )}
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-medium text-forest">
              {city}
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${
              isSelected ? "text-forest" : "text-forest/30 group-hover:text-forest/50"
            }`}>
              Vote
            </span>
          </button>
        );
      })}
    </div>
  );
}
