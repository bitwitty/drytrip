# Dry Trip — App Architecture

```mermaid
graph TD
    subgraph Browser["Browser (Client)"]
        direction TB
        LP["/ Landing Page\n(page.tsx)"]
        DIR["\/directory\nVenue Directory\n(directory/page.tsx)"]

        subgraph Components["Components"]
            LOGO["Logo.tsx"]
            WF["WaitlistForm.tsx"]
            VC["VenueCard.tsx\n(static demo)"]
            DVC["DirectoryVenueCard\n(dynamic)"]
            FG["FilterGroup\n(city/category pills)"]
            SKEL["LoadingSkeleton"]
        end

        subgraph Lib["src/lib/"]
            SB["supabase.ts\n(anon client)"]
            AB["ab.ts\nA/B variant cookie\n(dt_variant, 90-day TTL)"]
        end
    end

    subgraph Supabase["Supabase (PostgreSQL)"]
        WT[("waitlist\n email · variant")]
        VT[("venues\n name · city · category\n dry_score · top_na_drink\n image_url · status")]
    end

    subgraph External["External Data Sources"]
        GP["Google Places API\n(scrape → /scripts/output/*.json)"]
        GF["Google Fonts\n(Cormorant Garamond\nMontserrat)"]
    end

    %% Landing page wiring
    LP --> LOGO
    LP --> WF
    LP --> VC
    LP --> AB

    %% Directory page wiring
    DIR --> LOGO
    DIR --> FG
    DIR --> DVC
    DIR --> SKEL

    %% A/B test
    AB -->|"50/50 cookie split\nheadline & CTA copy"| LP

    %% Supabase queries
    WF -->|"INSERT email + variant"| SB
    DIR -->|"SELECT * WHERE status='Published'"| SB
    SB --> WT
    SB --> VT

    %% Client-side filtering
    FG -->|"useState\ncity/category filter"| DVC

    %% External
    GP -->|"JSON seed files"| VT
    GF -->|"loaded in layout.tsx"| Browser

    %% Styling
    style Browser fill:#F9F7F2,stroke:#D9C5B2
    style Supabase fill:#1B3022,color:#F9F7F2,stroke:#D9C5B2
    style External fill:#e8e4dc,stroke:#D9C5B2
    style Components fill:#fff,stroke:#D9C5B2
    style Lib fill:#fff,stroke:#D9C5B2
```

## Key Design Decisions

| Decision | Detail |
| --- | --- |
| No API routes | Components query Supabase directly via `useEffect` |
| A/B testing | Cookie-based, 50/50 split, 90-day TTL — landing page only |
| Publishing control | Only `status = 'Published'` venues surface in directory |
| Client-side filtering | City/category filters run in-browser on already-fetched data |
| Image hosting | All venue images served from Google Places CDN URLs |
