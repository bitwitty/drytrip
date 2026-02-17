import { MapPin, Star, Droplets } from "lucide-react";

export default function VenueCard() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-sandstone/60 bg-white shadow-sm">
      {/* Image placeholder */}
      <div className="relative h-52 bg-gradient-to-br from-sandstone/40 to-sandstone/70">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm tracking-wide text-forest/40">
            Photo
          </span>
        </div>
        {/* Dry Score badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <Droplets className="size-4 text-forest" />
          <span className="text-sm font-semibold text-forest">4.8</span>
          <span className="text-xs text-forest/50">/5</span>
        </div>
      </div>
      {/* Card content */}
      <div className="p-5">
        <h3 className="font-serif text-xl text-forest">
          The Standard, London
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-forest/60">
          <MapPin className="size-3.5" />
          <span>King&apos;s Cross, London</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Rooftop Bar", "Mocktail Menu", "Wellness Spa"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-linen px-3 py-1 text-xs tracking-wide text-forest/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`size-4 ${
                star <= 4
                  ? "fill-forest text-forest"
                  : "fill-sandstone/40 text-sandstone/40"
              }`}
            />
          ))}
          <span className="ml-1.5 text-xs text-forest/50">
            Dry Score
          </span>
        </div>
      </div>
    </div>
  );
}
