"use client";

import { useEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/types";

// Pin colors from design system
const PIN_COLORS: Record<string, string> = {
  Hotel: "#C4963C",     // amber
  Restaurant: "#7A8B6F", // sage
  Bar: "#D9C5B2",        // sandstone
};

// Pin radius by Dry Score
function pinRadius(score: number): number {
  if (score >= 5) return 12;
  if (score >= 4) return 10;
  if (score >= 3) return 8;
  return 6;
}

export interface VenueMapProps {
  venues: Venue[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  highlightId?: string;
  className?: string;
}

export default function VenueMap({
  venues,
  center = [-0.1276, 51.5074], // London
  zoom = 12,
  highlightId,
  className = "",
}: VenueMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);

  // Lazy-load mapbox-gl and initialise the map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      // Inject Mapbox CSS once
      if (!document.getElementById("mapbox-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-css";
        link.rel = "stylesheet";
        link.href = "https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.css";
        document.head.appendChild(link);
      }

      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.default.AttributionControl({ compact: true }),
        "bottom-right"
      );
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");

      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) return;

        addVenueLayers(map, venues, highlightId);
        setReady(true);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update pins when venues or highlightId changes (after map is ready)
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;

    // Remove existing layers/sources
    ["venue-clusters", "venue-cluster-count", "venue-points", "venue-highlight"].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource("venues")) map.removeSource("venues");

    addVenueLayers(map, venues, highlightId);
  }, [venues, highlightId, ready]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-sandstone/30 bg-sandstone/10 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Layer builder                                                      */
/* ------------------------------------------------------------------ */

function addVenueLayers(
  map: mapboxgl.Map,
  venues: Venue[],
  highlightId?: string
) {
  import("mapbox-gl").then((mapboxgl) => {
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: venues
        .filter((v) => v.latitude != null && v.longitude != null)
        .map((v) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [v.longitude!, v.latitude!],
          },
          properties: {
            id: v.id,
            name: v.name,
            slug: v.slug,
            category: v.category,
            dry_score: v.dry_score,
            top_na_drink: v.top_na_drink ?? "",
            neighborhood: v.neighborhood ?? "",
            color: PIN_COLORS[v.category] ?? "#D9C5B2",
            radius: pinRadius(v.dry_score),
            is_highlight: v.id === highlightId ? 1 : 0,
          },
        })),
    };

    map.addSource("venues", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 40,
    });

    // Cluster circles
    map.addLayer({
      id: "venue-clusters",
      type: "circle",
      source: "venues",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#1B3022",
        "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 10, 24],
        "circle-opacity": 0.85,
      },
    });

    // Cluster count labels
    map.addLayer({
      id: "venue-cluster-count",
      type: "symbol",
      source: "venues",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: { "text-color": "#F9F7F2" },
    });

    // Individual venue pins
    map.addLayer({
      id: "venue-points",
      type: "circle",
      source: "venues",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "color"],
        "circle-radius": ["get", "radius"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#F9F7F2",
        "circle-opacity": ["case", ["==", ["get", "is_highlight"], 1], 0, 1],
      },
    });

    // Highlighted venue pin (larger, with ring)
    if (highlightId) {
      map.addLayer({
        id: "venue-highlight",
        type: "circle",
        source: "venues",
        filter: ["==", ["get", "is_highlight"], 1],
        paint: {
          "circle-color": "#1B3022",
          "circle-radius": 14,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#C4963C",
        },
      });
    }

    // Click → popup on individual pins
    map.on("click", "venue-points", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const props = feature.properties as {
        name: string;
        slug: string;
        category: string;
        dry_score: number;
        top_na_drink: string;
        neighborhood: string;
        color: string;
      };
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

      const popupHtml = `
        <div style="font-family: inherit; min-width: 180px; padding: 4px 0;">
          <p style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #1B3022; opacity: 0.5; margin: 0 0 4px;">
            ${props.category}${props.neighborhood ? ` · ${props.neighborhood}` : ""}
          </p>
          <p style="font-size: 17px; font-weight: 700; color: #1B3022; margin: 0 0 6px; line-height: 1.2;">
            ${props.name}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: ${props.top_na_drink ? "8px" : "10px"};">
            <span style="background: ${props.color}; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px;">
              ${props.dry_score}/5
            </span>
          </div>
          ${props.top_na_drink ? `<p style="font-size: 11px; color: #1B3022; opacity: 0.6; margin: 0 0 10px;">★ ${props.top_na_drink}</p>` : ""}
          <a href="/venues/${props.slug}" style="font-size: 12px; font-weight: 600; color: #1B3022; text-decoration: none;">
            View details →
          </a>
        </div>
      `;

      new mapboxgl.default.Popup({ offset: 12, closeButton: false })
        .setLngLat(coords)
        .setHTML(popupHtml)
        .addTo(map);
    });

    // Click → expand cluster
    map.on("click", "venue-clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["venue-clusters"] });
      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId == null) return;
      (map.getSource("venues") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    });

    // Pointer cursor on hover
    map.on("mouseenter", "venue-points", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "venue-points", () => { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", "venue-clusters", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "venue-clusters", () => { map.getCanvas().style.cursor = ""; });
  });
}
