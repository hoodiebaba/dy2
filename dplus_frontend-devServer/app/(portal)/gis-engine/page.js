"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, Popup, Source } from "react-map-gl/maplibre";
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Filter,
  Layers3,
  LocateFixed,
  Map as MapIcon,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";

const MAP_STYLES = {
  outdoors: {
    label: "Terrain",
    tiles: ["https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}@2x.png"],
    attribution: "© Stadia Maps © OpenStreetMap",
    preview: "linear-gradient(135deg,#7c8b74 0%,#c8c7b2 55%,#efe6d7 100%)",
  },
  voyager: {
    label: "Street",
    tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    preview: "linear-gradient(135deg,#dbeafe 0%,#ffffff 35%,#fca5a5 60%,#6ee7b7 100%)",
  },
  osm: {
    label: "OSM",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap Contributors",
    preview: "linear-gradient(135deg,#f3f8e3 0%,#d9f99d 35%,#f8fafc 70%,#d1fae5 100%)",
  },
  satellite: {
    label: "Satellite",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri",
    tileSize: 256,
    preview: "linear-gradient(135deg,#2451a4 0%,#4f7d4c 48%,#c8ba7d 100%)",
  },
  light: {
    label: "Light",
    tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    preview: "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",
  },
  dark: {
    label: "Dark",
    tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    preview: "linear-gradient(135deg,#10172e 0%,#1e2a49 100%)",
  },
};

const DEFAULT_VIEW_STATE = {
  longitude: 36.8219,
  latitude: -1.2921,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const GIS_BASE_URL = (process.env.NEXT_PUBLIC_GIS_BASE_URL || "http://192.168.0.102:8060").replace(/\/+$/, "");
const GIS_FALLBACK_TOKEN = process.env.NEXT_PUBLIC_GIS_TOKEN || "";

const cellFillLayer = {
  id: "dy2-cells-fill",
  type: "circle",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 4, 9, 5.5, 12, 8, 15, 12],
    "circle-color": ["coalesce", ["get", "color"], "#315CFF"],
    "circle-opacity": 0.92,
    "circle-stroke-width": 1.2,
    "circle-stroke-color": "rgba(255,255,255,0.65)",
  },
};

const towerFillLayer = {
  id: "dy2-towers-fill",
  type: "circle",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 3.5, 9, 5, 12, 7, 15, 10],
    "circle-color": "#F26522",
    "circle-opacity": 0.9,
    "circle-stroke-width": 1,
    "circle-stroke-color": "rgba(255,255,255,0.7)",
  },
};

const driveTestLineLayer = {
  id: "dy2-drive-test-lines",
  type: "line",
  paint: {
    "line-color": ["coalesce", ["get", "color"], "#14B8A6"],
    "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1.5, 11, 2.5, 15, 4],
    "line-opacity": 0.82,
  },
};

const highlightedCellLayer = {
  id: "dy2-cells-highlight",
  type: "circle",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 7, 9, 10, 12, 14, 15, 18],
    "circle-color": "#F26522",
    "circle-opacity": 0.18,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#F26522",
  },
};

const buildMapStyle = (styleKey) => {
  const style = MAP_STYLES[styleKey] || MAP_STYLES.voyager;
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: style.tiles,
        tileSize: style.tileSize || 256,
        attribution: style.attribution,
      },
    },
    layers: [{ id: "basemap-layer", type: "raster", source: "basemap" }],
  };
};

const normalizeCell = (item) => ({
  cell_id: item.cell_name || item.Cell_name || item.cell_id || "",
  site_name: item.site_name || item.Site_Name || "",
  technology: item.technology || item.Technology || "",
  operator: item.vendor || item.operator || item.Node_Name || "",
  region: item.region || item.Region || "",
  band: item.band || item.BAND || "",
  latitude: Number(item.latitude ?? item.LATITUDE ?? 0),
  longitude: Number(item.longitude ?? item.LONGITUDE ?? 0),
  azimuth: Number(item.azimuth ?? item.Azimuth ?? 0),
  beam_width: Number(item.beamwidth ?? item.beam_width ?? 0),
  radius_m: Number(item.length ?? item.radius_m ?? 0),
  color: item.color || "#315CFF",
});

const normalizeTower = (item) => ({
  tower_id: item.alphanum_ci || item.cell_name || item.cell_id || item.cgi_2 || "",
  site_name: item.site_name || item.atoll_site_name || item.Site_Name || "",
  technology: item.technology || item.Technology || item.band || "",
  operator: item.vendor || item.node_name || item.Node_Name || "",
  region: item.region || item.Region || "",
  band: item.band || item.BAND || "",
  latitude: Number(item.latitude ?? item.LATITUDE ?? 0),
  longitude: Number(item.longitude ?? item.LONGITUDE ?? 0),
  color: "#F26522",
});

const buildFeatureCollection = (cells) => ({
  type: "FeatureCollection",
  features: cells
    .filter((cell) => Number.isFinite(cell.latitude) && Number.isFinite(cell.longitude))
    .map((cell) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [cell.longitude, cell.latitude],
      },
      properties: { ...cell },
    })),
});

const buildDriveTestCollection = (sessions) => ({
  type: "FeatureCollection",
  features: sessions
    .map((session, index) => {
      const lats = Array.isArray(session.lat) ? session.lat : [];
      const lngs = Array.isArray(session.lng) ? session.lng : [];
      const coordinates = lats
        .map((lat, pointIndex) => [Number(lngs[pointIndex]), Number(lat)])
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

      if (coordinates.length < 2) return null;

      const palette = ["#14B8A6", "#38BDF8", "#A855F7", "#F97316", "#22C55E"];

      return {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {
          session_id: session.session_id || `session-${index + 1}`,
          color: palette[index % palette.length],
        },
      };
    })
    .filter(Boolean),
});

const buildHighlightedCollection = (cells, highlightedCellId) => ({
  type: "FeatureCollection",
  features: cells
    .filter((cell) => cell.cell_id === highlightedCellId)
    .map((cell) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [cell.longitude, cell.latitude] },
      properties: { ...cell },
    })),
});

const fitBoundsFromCells = (cells) => {
  const valid = cells.filter((cell) => Number.isFinite(cell.latitude) && Number.isFinite(cell.longitude));
  if (!valid.length) return null;

  const lngs = valid.map((cell) => cell.longitude);
  const lats = valid.map((cell) => cell.latitude);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;
  const lngSpan = Math.max(maxLng - minLng, 0.02);
  const latSpan = Math.max(maxLat - minLat, 0.02);
  const span = Math.max(lngSpan, latSpan);

  let zoom = 11;
  if (span > 15) zoom = 5;
  else if (span > 8) zoom = 6;
  else if (span > 4) zoom = 7;
  else if (span > 2) zoom = 8;
  else if (span > 1) zoom = 9;
  else if (span > 0.5) zoom = 10;
  else if (span > 0.2) zoom = 11;
  else zoom = 12.2;

  return {
    longitude,
    latitude,
    zoom,
    pitch: 0,
    bearing: 0,
    transitionDuration: 1200,
  };
};

const getFilterPayloadFromSelection = (selection) => {
  const payload = {};
  Object.entries(selection).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length) {
      payload[key] = values;
    }
  });
  return payload;
};

function SearchPanel({ cells, searchMode, setSearchMode, searchTerm, setSearchTerm, onApply, onReset }) {
  const [open, setOpen] = useState(false);

  const siteOptions = useMemo(() => {
    const unique = [...new Set(cells.map((cell) => cell.site_name).filter(Boolean))];
    return unique.filter((site) => site.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 40);
  }, [cells, searchTerm]);

  const cellOptions = useMemo(() => {
    return cells.filter((cell) => cell.cell_id?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 40);
  }, [cells, searchTerm]);

  const activeResults = searchMode === "site" ? siteOptions : cellOptions;
  const showResults = open && (activeResults.length > 0 || Boolean(searchTerm.trim()));
  const hasValue = Boolean(searchTerm.trim());

  useEffect(() => {
    const handleClick = () => setOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative w-[320px] max-w-[92vw] sm:w-[390px]" onClick={(event) => event.stopPropagation()}>
      <div className="flex h-[50px] items-center gap-2 rounded-lg border border-[#d5dce9] bg-white/95 px-2 py-1.5 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
        <button
          type="button"
          onClick={() => {
            setSearchMode((value) => (value === "site" ? "cell" : "site"));
            setSearchTerm("");
            setOpen(true);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1f0] bg-[#f4f7fc] px-2.5 text-sm font-medium text-[#24314d]"
        >
          <MapIcon className="h-4 w-4" />
          <span className="capitalize">{searchMode}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={searchTerm}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setOpen(true);
          }}
          placeholder={`Search ${searchMode}`}
          className="min-w-0 flex-1 bg-transparent px-1.5 py-0 text-sm outline-none placeholder:text-[#98A2B3]"
        />

        {hasValue ? (
          <button
            type="button"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#667085] transition hover:bg-[#f5f7fb] hover:text-[#24314d]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            onApply(searchTerm);
            setOpen(false);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#2447c5] text-white transition hover:bg-[#1d3fb6]"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showResults ? (
        <div className="absolute left-0 z-50 mt-3 w-full rounded-xl border border-[#e6ebf5] bg-white/98 p-3 text-black shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="max-h-56 overflow-y-auto rounded-lg border border-[#E4E7EC]">
            {activeResults.length ? (
              activeResults.map((item) => {
                const label = searchMode === "site" ? item : item.cell_id;
                const subLabel = searchMode === "site" ? null : item.site_name;
                return (
                  <button
                    key={searchMode === "site" ? item : `${item.cell_id}-${item.latitude}-${item.longitude}`}
                    type="button"
                    onClick={() => {
                      setSearchTerm(label);
                      onApply(label);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-[#F5F7FB]"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[#24314d]">{label}</div>
                      {subLabel ? <div className="truncate text-xs text-[#667085]">{subLabel}</div> : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm font-medium text-[#24314d]">No result found</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterPanel({ meta, selection, setSelection, onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [openTech, setOpenTech] = useState({});

  useEffect(() => {
    if (meta?.d1?.length) {
      const initial = {};
      meta.d1.forEach((group) => {
        initial[group.parent] = true;
      });
      setOpenGroups(initial);
    }
  }, [meta]);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const toggleValue = (key, value) => {
    setSelection((current) => {
      const existing = current[key] || [];
      return {
        ...current,
        [key]: existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value],
      };
    });
  };

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-[50px] items-center rounded-lg border border-[#d5dce9] bg-white/95 px-4 text-sm font-semibold text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:bg-white"
      >
        Filters <Filter className="ml-2 h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-[320px] max-w-[92vw] overflow-y-auto rounded-xl bg-white p-4 text-black shadow-xl">
          <div className="mb-4 flex gap-3">
            <button onClick={() => { onApply(); setOpen(false); }} className="flex-1 rounded bg-[#2447c5] py-2 text-sm font-medium text-white">Apply</button>
            <button onClick={() => { onClear(); setOpen(false); }} className="flex-1 rounded bg-[#98A2B3] py-2 text-sm font-medium text-white">Clear</button>
          </div>

          {meta?.d1?.map((group) => (
            <div key={group.parent} className="mb-3 rounded border border-[#E4E7EC] p-2">
              <button
                type="button"
                onClick={() => setOpenGroups((current) => ({ ...current, [group.parent]: !current[group.parent] }))}
                className="flex w-full items-center justify-between rounded p-1 text-left font-medium hover:bg-gray-100"
              >
                <span>{group.parent}</span>
                {openGroups[group.parent] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {openGroups[group.parent] ? (
                <div className="mt-2 rounded border border-[#E4E7EC] p-2">
                  {group.child?.map((techBlock) => (
                    <div key={`${group.parent}-${techBlock.name}`} className="mb-3 last:mb-0">
                      <button
                        type="button"
                        onClick={() => setOpenTech((current) => ({ ...current, [techBlock.name]: !current[techBlock.name] }))}
                        className="flex w-full items-center justify-between rounded p-1 text-left text-sm font-medium hover:bg-gray-100"
                      >
                        <span>{techBlock.name}</span>
                        {openTech[techBlock.name] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {openTech[techBlock.name] ? (
                        <div className="mt-2 max-h-[180px] overflow-y-auto rounded border border-[#E4E7EC] p-2">
                          {techBlock.columnName?.map((item) => {
                            const value = item.name;
                            return (
                              <label key={`${techBlock.name}-${value}`} className="mb-1 flex items-center gap-2 text-sm last:mb-0">
                                <input
                                  type="checkbox"
                                  checked={(selection[techBlock.name] || []).includes(value)}
                                  onChange={() => toggleValue(techBlock.name, value)}
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MapStylePanel({ value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-[50px] items-center rounded-lg border border-[#d5dce9] bg-white/95 px-4 text-sm font-semibold text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:bg-white"
      >
        Map Style <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[420px] max-w-[92vw] rounded-[32px] border border-[#D7DCEB] bg-white/98 p-5 shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(MAP_STYLES).map(([styleKey, style]) => {
              const active = value === styleKey;
              return (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => {
                    onChange(styleKey);
                    setOpen(false);
                  }}
                  className={`rounded-[22px] p-3 text-center transition ${active ? "bg-[#F4F7FF] shadow-[inset_0_0_0_2px_rgba(36,71,197,0.18)]" : "hover:bg-[#F8FAFC]"}`}
                >
                  <div className="h-20 w-full rounded-[18px] border border-[#ECF0F6] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" style={{ background: style.preview }} />
                  <div className="mt-3 text-base font-semibold tracking-[0.03em] text-[#24314d]">{style.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AddMapLayerPanel({ showCells, setShowCells, showTowers, setShowTowers, showDriveTest, setShowDriveTest }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-[50px] items-center rounded-lg border border-[#d5dce9] bg-white/95 px-4 text-sm font-semibold text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition hover:bg-white"
      >
        Add MapLayer <Layers3 className="ml-2 h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[300px] max-w-[92vw] rounded-2xl bg-white p-4 text-black shadow-xl">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-[#E4E7EC] px-3 py-3 text-sm font-medium text-[#24314d]">
              <span>Cells</span>
              <input type="checkbox" checked={showCells} onChange={(event) => setShowCells(event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#E4E7EC] px-3 py-3 text-sm font-medium text-[#24314d]">
              <span>Sites / Towers</span>
              <input type="checkbox" checked={showTowers} onChange={(event) => setShowTowers(event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#E4E7EC] px-3 py-3 text-sm font-medium text-[#24314d]">
              <span>Drive Test</span>
              <input type="checkbox" checked={showDriveTest} onChange={(event) => setShowDriveTest(event.target.checked)} />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function GISEnginePage() {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);
  const [cells, setCells] = useState([]);
  const [telecomFilterMeta, setTelecomFilterMeta] = useState({ d1: [] });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchMode, setSearchMode] = useState("site");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapStyle, setMapStyle] = useState("voyager");
  const [highlightedCellId, setHighlightedCellId] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showCells, setShowCells] = useState(true);
  const [showTowers, setShowTowers] = useState(false);
  const [showDriveTest, setShowDriveTest] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [towers, setTowers] = useState([]);
  const [driveTestSessions, setDriveTestSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cellGeoJson = useMemo(() => buildFeatureCollection(cells), [cells]);
  const towerGeoJson = useMemo(() => buildFeatureCollection(towers), [towers]);
  const driveTestGeoJson = useMemo(() => buildDriveTestCollection(driveTestSessions), [driveTestSessions]);
  const highlightedGeoJson = useMemo(() => buildHighlightedCollection(cells, highlightedCellId), [cells, highlightedCellId]);

  const fetchJson = async (path, options = {}) => {
    const authToken =
      (typeof window !== "undefined" ? localStorage.getItem("token") : "") || GIS_FALLBACK_TOKEN;

    const response = await fetch(`${GIS_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
      cache: "no-store",
      credentials: "omit",
    });

    const payload = await response.json().catch(() => null);
    const resolvedError =
      payload?.msg ||
      payload?.message ||
      (typeof payload?.error === "string" && payload.error.includes("Login failed for user")
        ? "GIS source login failed. GIS database credentials need to be verified."
        : payload?.error) ||
      `Request failed for ${path}`;

    if (!response.ok || payload?.error) {
      throw new Error(resolvedError);
    }

    return payload;
  };

  const loadCells = async (filters = {}, applyFit = false) => {
    const payload = await fetchJson("/map/multiVendor", {
      method: "POST",
      body: JSON.stringify({ dataValue: filters }),
    });

    const normalized = (payload?.data || [])
      .map(normalizeCell)
      .filter((cell) => Number.isFinite(cell.latitude) && Number.isFinite(cell.longitude));

    setCells(normalized);

    if (applyFit) {
      const nextView = fitBoundsFromCells(normalized);
      if (nextView) {
        setViewState((current) => ({ ...current, ...nextView }));
      }
    }

    return normalized;
  };

  const loadTowers = async () => {
    const payload = await fetchJson("/map/towers");
    const normalized = (payload?.data || [])
      .map(normalizeTower)
      .filter((tower) => Number.isFinite(tower.latitude) && Number.isFinite(tower.longitude));
    setTowers(normalized);
  };

  const loadDriveTest = async () => {
    const payload = await fetchJson("/map/drive-test");
    setDriveTestSessions(Array.isArray(payload?.data) ? payload.data : []);
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");

        const [filterMetaPayload, setupPayload] = await Promise.all([
          fetchJson("/allFilterList").catch(() => null),
          fetchJson("/setupConf").catch(() => null),
        ]);

        if (!active) return;

        if (filterMetaPayload?.data) {
          setTelecomFilterMeta(filterMetaPayload.data);
        }

        const conf = setupPayload?.data || {};
        let initialFilters = {};

        if (conf?.mapView && MAP_STYLES[conf.mapView]) {
          setMapStyle(conf.mapView);
        }

        if (conf?.saveLatLong) {
          try {
            const savedView = JSON.parse(conf.saveLatLong);
            setViewState((current) => ({
              ...current,
              latitude: Number(savedView.lat) || current.latitude,
              longitude: Number(savedView.lng) || current.longitude,
              zoom: Number(savedView.zoom) || current.zoom,
            }));
          } catch {}
        }

        if (conf?.saveMapFilters) {
          try {
            initialFilters = JSON.parse(conf.saveMapFilters);
            setSelectedFilters(initialFilters);
          } catch {
            initialFilters = {};
          }
        }

        if (conf?.saveLayerVisibility) {
          try {
            const visibility = JSON.parse(conf.saveLayerVisibility);
            setShowCells(Boolean(visibility.CELLS));
            setShowTowers(Boolean(visibility.SITES));
            setShowDriveTest(Boolean(visibility.DRIVE_TEST));
          } catch {}
        }

        await Promise.all([loadCells(initialFilters, true), loadTowers(), loadDriveTest()]);
      } catch (err) {
        if (!active) return;
        setError(err.message || "GIS Engine data could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError("");
      await loadCells(getFilterPayloadFromSelection(selectedFilters), true);
      setHighlightedCellId(null);
      setSelectedCell(null);
    } catch (err) {
      setError(err.message || "Filters could not be applied.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    try {
      setSelectedFilters({});
      setLoading(true);
      setError("");
      await loadCells({}, true);
      setHighlightedCellId(null);
      setSelectedCell(null);
    } catch (err) {
      setError(err.message || "Filters could not be cleared.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchApply = (value) => {
    const query = (value || searchTerm).trim().toLowerCase();
    if (!query) return;

    let target = null;

    if (searchMode === "site") {
      target =
        cells.find((cell) => cell.site_name?.toLowerCase() === query) ||
        cells.find((cell) => cell.site_name?.toLowerCase().includes(query));
    } else {
      target =
        cells.find((cell) => cell.cell_id?.toLowerCase() === query) ||
        cells.find((cell) => cell.cell_id?.toLowerCase().includes(query));
    }

    if (!target) return;

    setSearchTerm(searchMode === "site" ? target.site_name : target.cell_id);
    setHighlightedCellId(target.cell_id);
    setSelectedCell(target);
    setViewState((current) => ({
      ...current,
      longitude: Number(target.longitude),
      latitude: Number(target.latitude),
      zoom: searchMode === "cell" ? 16.5 : 14.5,
      transitionDuration: 1000,
    }));
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setHighlightedCellId(null);
    setSelectedCell(null);
  };

  const handleMapClick = (event) => {
    const feature = event?.features?.[0];
    if (!feature?.properties) {
      setSelectedCell(null);
      return;
    }

    setSelectedCell(feature.properties);
    setHighlightedCellId(feature.properties.cell_id);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(nextLocation);
      setViewState((current) => ({
        ...current,
        latitude: nextLocation.latitude,
        longitude: nextLocation.longitude,
        zoom: Math.max(current.zoom, 14),
        transitionDuration: 900,
      }));
    });
  };

  const resetNorth = () => {
    setViewState((current) => ({ ...current, bearing: 0, pitch: 0, transitionDuration: 700 }));
  };

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)]">
      <div className="gis-map relative h-full min-h-0 w-full overflow-hidden">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(event) => setViewState(event.viewState)}
          mapStyle={buildMapStyle(mapStyle)}
          reuseMaps
          attributionControl={false}
          interactiveLayerIds={["dy2-cells-fill", "dy2-cells-highlight", "dy2-towers-fill"]}
          onClick={handleMapClick}
          dragRotate
          touchZoomRotate
        >
          {showCells ? (
            <>
              <Source id="dy2-cells-source" type="geojson" data={cellGeoJson}>
                <Layer {...cellFillLayer} />
              </Source>
              {highlightedCellId ? (
                <Source id="dy2-highlighted-cell" type="geojson" data={highlightedGeoJson}>
                  <Layer {...highlightedCellLayer} />
                </Source>
              ) : null}
            </>
          ) : null}

          {showTowers ? (
            <Source id="dy2-towers-source" type="geojson" data={towerGeoJson}>
              <Layer {...towerFillLayer} />
            </Source>
          ) : null}

          {showDriveTest ? (
            <Source id="dy2-drive-test-source" type="geojson" data={driveTestGeoJson}>
              <Layer {...driveTestLineLayer} />
            </Source>
          ) : null}

          {selectedCell ? (
            <Popup
              longitude={Number(selectedCell.longitude)}
              latitude={Number(selectedCell.latitude)}
              closeButton={false}
              closeOnClick={false}
              offset={20}
              className="dy2-gis-popup"
            >
              <div className="rounded-[18px] border border-white/10 bg-[rgba(9,16,48,0.96)] px-4 py-3 text-white shadow-[0_18px_50px_rgba(4,8,24,0.5)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F26522]">
                  {selectedCell.cell_id ? "Cell Details" : "Site Details"}
                </div>
                <div className="mt-2 text-base font-semibold">{selectedCell.cell_id || selectedCell.tower_id || selectedCell.site_name}</div>
                <div className="mt-1 text-sm text-white/70">{selectedCell.site_name}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                  <div><span className="text-white/40">Tech:</span> {selectedCell.technology || "-"}</div>
                  <div><span className="text-white/40">Band:</span> {selectedCell.band || "-"}</div>
                  <div><span className="text-white/40">Region:</span> {selectedCell.region || "-"}</div>
                  <div><span className="text-white/40">Vendor:</span> {selectedCell.operator || "-"}</div>
                </div>
              </div>
            </Popup>
          ) : null}

          {userLocation ? (
            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-emerald-400/35" />
                <span className="relative h-3 w-3 rounded-full border border-white/80 bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
              </span>
            </Marker>
          ) : null}
        </Map>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-5">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <SearchPanel
              cells={cells}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onApply={handleSearchApply}
              onReset={handleResetSearch}
            />
            <FilterPanel
              meta={telecomFilterMeta}
              selection={selectedFilters}
              setSelection={setSelectedFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
            <AddMapLayerPanel
              showCells={showCells}
              setShowCells={setShowCells}
              showTowers={showTowers}
              setShowTowers={setShowTowers}
              showDriveTest={showDriveTest}
              setShowDriveTest={setShowDriveTest}
            />
            <MapStylePanel value={mapStyle} onChange={setMapStyle} />
          </div>
        </div>

        <div className="absolute right-5 top-5 z-20 flex flex-col gap-3">
          <button onClick={resetNorth} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <Crosshair className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-6 right-5 z-20 flex flex-col gap-3">
          <button onClick={handleLocate} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <LocateFixed className="h-5 w-5" />
          </button>
          <button onClick={() => setViewState((current) => ({ ...current, zoom: current.zoom + 1, transitionDuration: 250 }))} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <Plus className="h-5 w-5" />
          </button>
          <button onClick={() => setViewState((current) => ({ ...current, zoom: Math.max(current.zoom - 1, 2), transitionDuration: 250 }))} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <Minus className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#08112f]/12">
            <div className="rounded-2xl border border-white/10 bg-[rgba(9,16,48,0.9)] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_50px_rgba(4,8,24,0.45)]">
              Loading GIS data...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="absolute bottom-6 left-6 z-20 max-w-md rounded-2xl border border-[#f97316]/25 bg-[rgba(9,16,48,0.94)] px-4 py-3 text-sm text-white shadow-[0_18px_50px_rgba(4,8,24,0.45)]">
            <div className="font-semibold text-[#F26522]">GIS Engine</div>
            <div className="mt-1 text-white/75">{error}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
