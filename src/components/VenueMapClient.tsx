"use client";

import dynamic from "next/dynamic";
import type { VenueMapProps } from "./VenueMap";

const VenueMap = dynamic(() => import("@/components/VenueMap"), { ssr: false });

export default function VenueMapClient(props: VenueMapProps) {
  return <VenueMap {...props} />;
}
