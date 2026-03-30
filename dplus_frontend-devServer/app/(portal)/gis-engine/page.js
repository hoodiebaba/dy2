"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, Popup, Source } from "react-map-gl/maplibre";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Filter,
  Focus,
  Layers3,
  Map as MapIcon,
  Maximize,
  Minus,
  Plus,
  Ruler,
  Search,
  Settings,
  X,
} from "lucide-react";

const MAP_STYLES = {
  outdoors: {
    label: "Terrain",
    tiles: ["https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}@2x.png"],
    attribution: "© Stadia Maps © OpenStreetMap",
    previewStyle: {
      backgroundColor: "#d9d7c8",
      backgroundImage:
        "linear-gradient(145deg, rgba(90,106,79,0.95) 0 24%, rgba(181,190,171,0.95) 24% 54%, rgba(234,228,209,0.95) 54%), linear-gradient(120deg, transparent 0 50%, rgba(255,255,255,0.28) 50% 54%, transparent 54% 100%)",
    },
  },
  voyager: {
    label: "Street",
    tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    previewStyle: {
      backgroundColor: "#f7f7f5",
      backgroundImage:
        "linear-gradient(130deg, transparent 0 24%, #8bb5f4 24% 31%, transparent 31% 100%), linear-gradient(42deg, transparent 0 44%, #fb7185 44% 52%, transparent 52% 100%), linear-gradient(90deg, transparent 0 58%, #5eead4 58% 64%, transparent 64% 100%), linear-gradient(180deg, transparent 0 34%, #f8fafc 34% 100%)",
    },
  },
  osm: {
    label: "OSM",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap Contributors",
    previewStyle: {
      backgroundColor: "#eef4de",
      backgroundImage:
        "linear-gradient(140deg, #eef4de 0 48%, #d7efae 48% 100%), linear-gradient(35deg, transparent 0 46%, rgba(255,255,255,0.8) 46% 52%, transparent 52% 100%), linear-gradient(115deg, transparent 0 64%, rgba(255,255,255,0.7) 64% 69%, transparent 69% 100%)",
    },
  },
  satellite: {
    label: "Satellite",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri",
    tileSize: 256,
    previewStyle: {
      backgroundColor: "#426d49",
      backgroundImage:
        "radial-gradient(circle at 25% 20%, rgba(32,75,143,0.95) 0 24%, transparent 25%), radial-gradient(circle at 72% 66%, rgba(196,185,128,0.78) 0 18%, transparent 19%), linear-gradient(135deg, #204b8f 0%, #49784a 45%, #8d8554 72%, #c4b980 100%)",
    },
  },
  light: {
    label: "Light",
    tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    previewStyle: {
      backgroundColor: "#f1f5f9",
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(226,232,240,0.98) 100%), linear-gradient(45deg, transparent 0 46%, rgba(203,213,225,0.8) 46% 50%, transparent 50% 100%)",
    },
  },
  dark: {
    label: "Dark",
    tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"],
    attribution: "© CARTO © OpenStreetMap",
    previewStyle: {
      backgroundColor: "#10172e",
      backgroundImage:
        "linear-gradient(135deg, #12192f 0%, #1f2b4a 100%), linear-gradient(45deg, transparent 0 44%, rgba(77,93,132,0.45) 44% 48%, transparent 48% 100%)",
    },
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
const EARTH_RADIUS_METERS = 6378137;
const MEASURE_CLOSE_PX = 16;

// Layer configurations
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

const measurementLineLayer = {
  id: "dy2-measurement-lines",
  type: "line",
  paint: {
    "line-color": "#F26522",
    "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2, 10, 3, 14, 4],
    "line-opacity": 0.95,
  },
};

const measurementDraftLineLayer = {
  id: "dy2-measurement-draft-lines",
  type: "line",
  paint: {
    "line-color": "#F26522",
    "line-width": ["interpolate", ["linear"], ["zoom"], 6, 2, 10, 2.6, 14, 3.4],
    "line-opacity": 0.82,
    "line-dasharray": [2, 1.6],
  },
};

const measurementFillLayer = {
  id: "dy2-measurement-fill",
  type: "fill",
  paint: {
    "fill-color": "#F26522",
    "fill-opacity": 0.16,
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

const getPointLabel = (index) => {
  if (index >= 0 && index < 26) return String.fromCharCode(65 + index);
  return `P${index + 1}`;
};

const haversineDistanceMeters = (start, end) => {
  const lat1 = (start.latitude * Math.PI) / 180;
  const lat2 = (end.latitude * Math.PI) / 180;
  const dLat = ((end.latitude - start.latitude) * Math.PI) / 180;
  const dLng = ((end.longitude - start.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "";
  if (meters >= 1000) return `${(meters / 1000).toFixed(meters >= 10000 ? 1 : 2)} km`;
  return `${Math.round(meters)} m`;
};

const formatArea = (squareMeters) => {
  if (!Number.isFinite(squareMeters) || squareMeters <= 0) return "";
  if (squareMeters >= 1_000_000) return `${(squareMeters / 1_000_000).toFixed(2)} km²`;
  return `${Math.round(squareMeters)} m²`;
};

const buildSegments = (points, closed = false) => {
  const segments = [];
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    segments.push({
      start,
      end,
      distance: haversineDistanceMeters(start, end),
      midpoint: {
        longitude: (start.longitude + end.longitude) / 2,
        latitude: (start.latitude + end.latitude) / 2,
      },
      label: `${getPointLabel(index - 1)}-${getPointLabel(index)}`,
    });
  }

  if (closed && points.length >= 3) {
    const start = points[points.length - 1];
    const end = points[0];
    segments.push({
      start,
      end,
      distance: haversineDistanceMeters(start, end),
      midpoint: {
        longitude: (start.longitude + end.longitude) / 2,
        latitude: (start.latitude + end.latitude) / 2,
      },
      label: `${getPointLabel(points.length - 1)}-${getPointLabel(0)}`,
    });
  }

  return segments;
};

const polygonAreaSquareMeters = (points) => {
  if (!Array.isArray(points) || points.length < 3) return 0;
  const avgLat =
    points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const cosLat = Math.cos((avgLat * Math.PI) / 180);

  const projected = points.map((point) => ({
    x: ((point.longitude * Math.PI) / 180) * EARTH_RADIUS_METERS * cosLat,
    y: ((point.latitude * Math.PI) / 180) * EARTH_RADIUS_METERS,
  }));

  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
};

const polygonCentroid = (points) => {
  if (!Array.isArray(points) || !points.length) return null;
  const longitude =
    points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  const latitude =
    points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  return { longitude, latitude };
};

const createMeasurement = (points, closed = false) => {
  const normalizedPoints = points.map((point, index) => ({
    ...point,
    label: getPointLabel(index),
  }));
  const segments = buildSegments(normalizedPoints, closed);
  return {
    id: `measure-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    points: normalizedPoints,
    closed,
    segments,
    totalDistance: segments.reduce((sum, segment) => sum + segment.distance, 0),
    area: closed ? polygonAreaSquareMeters(normalizedPoints) : 0,
  };
};

const buildMeasurementLineCollection = (measurements) => ({
  type: "FeatureCollection",
  features: measurements
    .filter((measurement) => measurement.points.length >= 2)
    .map((measurement) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          ...measurement.points.map((point) => [point.longitude, point.latitude]),
          ...(measurement.closed ? [[measurement.points[0].longitude, measurement.points[0].latitude]] : []),
        ],
      },
      properties: {
        id: measurement.id,
        closed: measurement.closed,
      },
    })),
});

const buildMeasurementPolygonCollection = (measurements) => ({
  type: "FeatureCollection",
  features: measurements
    .filter((measurement) => measurement.closed && measurement.points.length >= 3)
    .map((measurement) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          ...measurement.points.map((point) => [point.longitude, point.latitude]),
          [measurement.points[0].longitude, measurement.points[0].latitude],
        ]],
      },
      properties: {
        id: measurement.id,
      },
    })),
});

const buildMeasurementPointMarkers = (measurements, draftMeasurement) => {
  const completedPoints = measurements.flatMap((measurement) =>
    measurement.points.map((point) => ({
      ...point,
      id: `${measurement.id}-${point.label}`,
      draft: false,
    })),
  );

  const draftPoints = (draftMeasurement?.points || []).map((point, index) => ({
    ...point,
    label: getPointLabel(index),
    id: `${draftMeasurement.id || "draft"}-${index}`,
    draft: true,
  }));

  return [...completedPoints, ...draftPoints];
};

const buildMeasurementSegmentLabels = (measurements, draftMeasurement) => {
  const completed = measurements.flatMap((measurement) =>
    measurement.segments.map((segment, index) => ({
      id: `${measurement.id}-segment-${index}`,
      text: formatDistance(segment.distance),
      caption: segment.label,
      longitude: segment.midpoint.longitude,
      latitude: segment.midpoint.latitude,
      draft: false,
    })),
  );

  const draftSegments = draftMeasurement?.points?.length >= 2
    ? buildSegments(
        draftMeasurement.points.map((point, index) => ({
          ...point,
          label: getPointLabel(index),
        })),
      ).map((segment, index) => ({
        id: `${draftMeasurement.id || "draft"}-segment-${index}`,
        text: formatDistance(segment.distance),
        caption: segment.label,
        longitude: segment.midpoint.longitude,
        latitude: segment.midpoint.latitude,
        draft: true,
      }))
    : [];

  return [...completed, ...draftSegments];
};

const buildMeasurementAreaLabels = (measurements) =>
  measurements
    .filter((measurement) => measurement.closed && measurement.area > 0)
    .map((measurement) => {
      const centroid = polygonCentroid(measurement.points);
      if (!centroid) return null;
      return {
        id: `${measurement.id}-area`,
        longitude: centroid.longitude,
        latitude: centroid.latitude,
        text: formatArea(measurement.area),
        perimeter: `Perimeter ${formatDistance(measurement.totalDistance)}`,
      };
    })
    .filter(Boolean);

const getFilterPayloadFromSelection = (selection) => {
  const payload = {};
  Object.entries(selection).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length) {
      payload[key] = values;
    }
  });
  return payload;
};

// ---------------- UI COMPONENTS ----------------

const BaseControlClass =
  "flex h-11 items-center rounded-xl border border-[#27365C] bg-[rgba(8,18,36,0.92)] text-sm font-medium text-white shadow-[0_16px_32px_rgba(3,8,24,0.4)] backdrop-blur-md transition-all duration-200 hover:border-[#F26522]/40 hover:bg-[rgba(13,24,49,0.95)] hover:text-[#F26522] focus:outline-none";
const RightSideBtnClass =
  "flex h-[46px] w-[46px] items-center justify-center rounded-[16px] border border-[#27365C] bg-[rgba(8,18,36,0.94)] text-white shadow-[0_18px_36px_rgba(3,8,24,0.42)] backdrop-blur-md transition-all duration-200 hover:border-[#F26522]/40 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522] focus:outline-none";

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
      <div className={`${BaseControlClass} px-2 py-1.5 w-full`}>
        <button
          type="button"
          onClick={() => {
            setSearchMode((value) => (value === "site" ? "cell" : "site"));
            setSearchTerm("");
            setOpen(true);
          }}
          className="inline-flex h-8 items-center gap-2 rounded-lg bg-white/5 px-2.5 text-xs font-medium text-white transition hover:bg-white/10"
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span className="capitalize">{searchMode}</span>
          <ChevronDown className="h-3.5 w-3.5" />
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
          className="min-w-0 flex-1 bg-transparent px-2.5 py-0 text-sm outline-none placeholder:text-white/40 text-white"
        />

        {hasValue && (
          <button
            type="button"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            onApply(searchTerm);
            setOpen(false);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F26522] text-white transition hover:bg-[#d9581b] shadow-md ml-1"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showResults && (
        <div className="absolute left-0 z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0A1240]/98 p-2 text-white shadow-2xl backdrop-blur-md">
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
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
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/10"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{label}</div>
                      {subLabel && <div className="truncate text-xs text-white/50">{subLabel}</div>}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm font-medium text-white/60">No result found</div>
            )}
          </div>
        </div>
      )}
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
      <button type="button" onClick={() => setOpen(!open)} className={`${BaseControlClass} px-4`}>
        Filters <Filter className="ml-2 h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-[320px] max-w-[92vw] overflow-y-auto rounded-xl border border-white/10 bg-[#0A1240]/98 p-4 text-white shadow-2xl backdrop-blur-md custom-scrollbar">
          <div className="mb-4 flex gap-3">
            <button onClick={() => { onApply(); setOpen(false); }} className="flex-1 rounded-lg bg-[#F26522] py-2 text-sm font-medium text-white transition hover:bg-[#d9581b]">Apply</button>
            <button onClick={() => { onClear(); setOpen(false); }} className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-medium text-white transition hover:bg-white/20">Clear</button>
          </div>

          {meta?.d1?.map((group) => (
            <div key={group.parent} className="mb-3 rounded-lg border border-white/10 p-2 bg-white/5">
              <button
                type="button"
                onClick={() => setOpenGroups((current) => ({ ...current, [group.parent]: !current[group.parent] }))}
                className="flex w-full items-center justify-between rounded-md p-1.5 text-left font-medium hover:bg-white/10 transition"
              >
                <span>{group.parent}</span>
                {openGroups[group.parent] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {openGroups[group.parent] && (
                <div className="mt-2 rounded-md border border-white/10 p-2 bg-black/20">
                  {group.child?.map((techBlock) => (
                    <div key={`${group.parent}-${techBlock.name}`} className="mb-2 last:mb-0">
                      <button
                        type="button"
                        onClick={() => setOpenTech((current) => ({ ...current, [techBlock.name]: !current[techBlock.name] }))}
                        className="flex w-full items-center justify-between rounded-md p-1.5 text-left text-sm font-medium hover:bg-white/10 transition text-white/90"
                      >
                        <span>{techBlock.name}</span>
                        {openTech[techBlock.name] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {openTech[techBlock.name] && (
                        <div className="mt-1 max-h-[180px] overflow-y-auto rounded border border-white/5 p-2 custom-scrollbar">
                          {techBlock.columnName?.map((item) => {
                            const value = item.name;
                            return (
                              <label key={`${techBlock.name}-${value}`} className="mb-2 flex items-center gap-2 text-sm text-white/80 hover:text-white cursor-pointer last:mb-0">
                                <input
                                  type="checkbox"
                                  className="accent-[#F26522]"
                                  checked={(selection[techBlock.name] || []).includes(value)}
                                  onChange={() => toggleValue(techBlock.name, value)}
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
      <button type="button" onClick={() => setOpen(!open)} className={`${BaseControlClass} px-4`}>
        Layers <Layers3 className="ml-2 h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] max-w-[92vw] rounded-xl border border-white/10 bg-[#0A1240]/98 p-3 text-white shadow-2xl backdrop-blur-md">
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10 cursor-pointer transition">
              <span>Cells</span>
              <input type="checkbox" className="accent-[#F26522] w-4 h-4" checked={showCells} onChange={(e) => setShowCells(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10 cursor-pointer transition">
              <span>Sites / Towers</span>
              <input type="checkbox" className="accent-[#F26522] w-4 h-4" checked={showTowers} onChange={(e) => setShowTowers(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10 cursor-pointer transition">
              <span>Drive Test</span>
              <input type="checkbox" className="accent-[#F26522] w-4 h-4" checked={showDriveTest} onChange={(e) => setShowDriveTest(e.target.checked)} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function MapStyleRightControl({ value, onChange }) {
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
        title="Map Style"
        onClick={() => setOpen(!open)}
        className={`${RightSideBtnClass} ${open ? "border-[#F26522]/45 bg-[rgba(18,28,58,0.96)] text-[#F26522]" : ""}`}
      >
        <Layers3 className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-0 right-full z-50 mr-3 rounded-[24px] border border-[#27365C] bg-[rgba(8,18,36,0.98)] p-3 shadow-[0_24px_48px_rgba(3,8,24,0.52)] backdrop-blur-xl">
          <div className="flex flex-nowrap items-start gap-3">
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
                  className={`group flex w-[92px] shrink-0 flex-col items-center rounded-[18px] border px-2 py-2.5 text-center transition-all duration-200 ${
                    active
                      ? "border-[#F26522]/50 bg-[rgba(33,22,32,0.95)] text-[#F26522]"
                      : "border-transparent bg-transparent text-white/72 hover:border-[#27365C] hover:bg-[rgba(13,24,49,0.95)] hover:text-white"
                  }`}
                >
                  <div
                    className={`relative h-[62px] w-[62px] rounded-[18px] border transition-all duration-200 ${
                      active ? "border-[#F26522]/55 shadow-[0_0_0_1px_rgba(242,101,34,0.1)]" : "border-white/8"
                    }`}
                    style={style.previewStyle}
                  >
                    {active ? (
                      <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F26522] text-white shadow-lg">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
                  <div className={`mt-2 text-[11px] font-semibold tracking-[0.08em] ${active ? "text-[#F26522]" : "text-inherit"}`}>
                    {style.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GISEnginePage() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const draftMeasurementRef = useRef(null);
  
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
  
  // Right side controls UI State
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [draftMeasurement, setDraftMeasurement] = useState(null);

  const cellGeoJson = useMemo(() => buildFeatureCollection(cells), [cells]);
  const towerGeoJson = useMemo(() => buildFeatureCollection(towers), [towers]);
  const driveTestGeoJson = useMemo(() => buildDriveTestCollection(driveTestSessions), [driveTestSessions]);
  const highlightedGeoJson = useMemo(() => buildHighlightedCollection(cells, highlightedCellId), [cells, highlightedCellId]);
  const measurementLineGeoJson = useMemo(() => buildMeasurementLineCollection(measurements), [measurements]);
  const measurementFillGeoJson = useMemo(() => buildMeasurementPolygonCollection(measurements), [measurements]);
  const draftMeasurementGeoJson = useMemo(
    () =>
      buildMeasurementLineCollection(
        draftMeasurement?.points?.length >= 2
          ? [createMeasurement(draftMeasurement.points, false)]
          : [],
      ),
    [draftMeasurement],
  );
  const measurementPoints = useMemo(
    () => buildMeasurementPointMarkers(measurements, draftMeasurement),
    [measurements, draftMeasurement],
  );
  const measurementSegmentLabels = useMemo(
    () => buildMeasurementSegmentLabels(measurements, draftMeasurement),
    [measurements, draftMeasurement],
  );
  const measurementAreaLabels = useMemo(() => buildMeasurementAreaLabels(measurements), [measurements]);

  useEffect(() => {
    draftMeasurementRef.current = draftMeasurement;
  }, [draftMeasurement]);

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

        if (filterMetaPayload?.data) setTelecomFilterMeta(filterMetaPayload.data);

        const conf = setupPayload?.data || {};
        let initialFilters = {};

        if (conf?.mapView && MAP_STYLES[conf.mapView]) setMapStyle(conf.mapView);

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
          } catch { initialFilters = {}; }
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
    return () => { active = false; };
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
      target = cells.find((cell) => cell.site_name?.toLowerCase() === query) || cells.find((cell) => cell.site_name?.toLowerCase().includes(query));
    } else {
      target = cells.find((cell) => cell.cell_id?.toLowerCase() === query) || cells.find((cell) => cell.cell_id?.toLowerCase().includes(query));
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
    if (isMeasuring) {
      const currentDraft = draftMeasurementRef.current?.points || [];
      const clickPoint = event.point;
      const currentMap = mapRef.current?.getMap?.();

      if (
        currentDraft.length >= 3 &&
        currentMap &&
        clickPoint
      ) {
        const projectedFirst = currentMap.project([
          currentDraft[0].longitude,
          currentDraft[0].latitude,
        ]);
        const deltaX = projectedFirst.x - clickPoint.x;
        const deltaY = projectedFirst.y - clickPoint.y;
        const closeToStart = Math.sqrt(deltaX ** 2 + deltaY ** 2) <= MEASURE_CLOSE_PX;

        if (closeToStart) {
          setMeasurements((current) => [...current, createMeasurement(currentDraft, true)]);
          setDraftMeasurement({ id: `draft-${Date.now()}`, points: [] });
          return;
        }
      }

      const nextPoint = {
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      };

      setDraftMeasurement((current) => {
        const currentPoints = current?.points || [];
        return {
          id: current?.id || `draft-${Date.now()}`,
          points: [...currentPoints, nextPoint],
        };
      });
      setSelectedCell(null);
      return;
    }

    const feature = event?.features?.[0];
    if (!feature?.properties) {
      setSelectedCell(null);
      return;
    }
    setSelectedCell(feature.properties);
    setHighlightedCellId(feature.properties.cell_id);
  };

  // Tools Actions
  const handleFitToData = () => {
    const nextView = fitBoundsFromCells(cells);
    if (nextView) setViewState((current) => ({ ...current, ...nextView }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => console.log(err));
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const toggleMeasurementMode = () => {
    setIsMeasuring((current) => {
      const nextValue = !current;
      if (nextValue && !draftMeasurementRef.current) {
        setDraftMeasurement({ id: `draft-${Date.now()}`, points: [] });
      }
      if (!nextValue && !(draftMeasurementRef.current?.points?.length)) {
        setDraftMeasurement(null);
      }
      return nextValue;
    });
  };

  const handleFinalizeMeasurement = () => {
    const points = draftMeasurementRef.current?.points || [];
    if (points.length < 2) return;
    setMeasurements((current) => [...current, createMeasurement(points, false)]);
    setDraftMeasurement({ id: `draft-${Date.now()}`, points: [] });
  };

  const handleUndoMeasurementPoint = () => {
    setDraftMeasurement((current) => {
      const points = current?.points || [];
      if (!points.length) return current;
      const nextPoints = points.slice(0, -1);
      return nextPoints.length ? { ...current, points: nextPoints } : { ...current, points: [] };
    });
  };

  const handleClearMeasurements = () => {
    setMeasurements([]);
    setDraftMeasurement(isMeasuring ? { id: `draft-${Date.now()}`, points: [] } : null);
  };

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full overflow-hidden bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)]">
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
          doubleClickZoom={!isMeasuring}
          cursor={isMeasuring ? "crosshair" : "grab"}
        >
          {measurementAreaLabels.length ? (
            <Source id="dy2-measurement-fill-source" type="geojson" data={measurementFillGeoJson}>
              <Layer {...measurementFillLayer} />
            </Source>
          ) : null}

          {measurementLineGeoJson.features.length ? (
            <Source id="dy2-measurement-line-source" type="geojson" data={measurementLineGeoJson}>
              <Layer {...measurementLineLayer} />
            </Source>
          ) : null}

          {draftMeasurementGeoJson.features.length ? (
            <Source id="dy2-measurement-draft-source" type="geojson" data={draftMeasurementGeoJson}>
              <Layer {...measurementDraftLineLayer} />
            </Source>
          ) : null}

          {showCells && (
            <>
              <Source id="dy2-cells-source" type="geojson" data={cellGeoJson}>
                <Layer {...cellFillLayer} />
              </Source>
              {highlightedCellId && (
                <Source id="dy2-highlighted-cell" type="geojson" data={highlightedGeoJson}>
                  <Layer {...highlightedCellLayer} />
                </Source>
              )}
            </>
          )}

          {showTowers && (
            <Source id="dy2-towers-source" type="geojson" data={towerGeoJson}>
              <Layer {...towerFillLayer} />
            </Source>
          )}

          {showDriveTest && (
            <Source id="dy2-drive-test-source" type="geojson" data={driveTestGeoJson}>
              <Layer {...driveTestLineLayer} />
            </Source>
          )}

          {selectedCell && (
            <Popup
              longitude={Number(selectedCell.longitude)}
              latitude={Number(selectedCell.latitude)}
              closeButton={false}
              closeOnClick={false}
              offset={20}
              className="dy2-gis-popup"
            >
              <div className="rounded-[16px] border border-white/10 bg-[rgba(10,18,64,0.95)] px-4 py-3 text-white shadow-2xl backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F26522]">
                  {selectedCell.cell_id ? "Cell Details" : "Site Details"}
                </div>
                <div className="mt-1.5 text-base font-semibold">{selectedCell.cell_id || selectedCell.tower_id || selectedCell.site_name}</div>
                <div className="mt-0.5 text-sm text-white/60">{selectedCell.site_name}</div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-white/80">
                  <div><span className="text-white/40 mr-1">Tech:</span> {selectedCell.technology || "-"}</div>
                  <div><span className="text-white/40 mr-1">Band:</span> {selectedCell.band || "-"}</div>
                  <div><span className="text-white/40 mr-1">Region:</span> {selectedCell.region || "-"}</div>
                  <div><span className="text-white/40 mr-1">Vendor:</span> {selectedCell.operator || "-"}</div>
                </div>
              </div>
            </Popup>
          )}

          {measurementPoints.map((point) => (
            <Marker
              key={point.id}
              longitude={point.longitude}
              latitude={point.latitude}
              anchor="center"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-[0_10px_18px_rgba(3,8,24,0.4)] ${
                    point.draft
                      ? "border-[#F26522]/70 bg-[rgba(31,21,26,0.96)]"
                      : "border-[#F26522]/55 bg-[rgba(8,18,36,0.95)]"
                  }`}
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-[#F26522]" />
                </div>
                <div className="mt-1 rounded-full border border-[#F26522]/30 bg-[rgba(8,18,36,0.96)] px-1.5 py-0.5 text-[10px] font-bold tracking-[0.08em] text-[#F26522]">
                  {point.label}
                </div>
              </div>
            </Marker>
          ))}

          {measurementSegmentLabels.map((label) => (
            <Marker
              key={label.id}
              longitude={label.longitude}
              latitude={label.latitude}
              anchor="center"
            >
              <div
                className={`rounded-full border px-2 py-1 text-center shadow-[0_14px_24px_rgba(3,8,24,0.42)] ${
                  label.draft
                    ? "border-[#F26522]/35 bg-[rgba(31,21,26,0.9)]"
                    : "border-[#27365C] bg-[rgba(8,18,36,0.94)]"
                }`}
              >
                <div className="text-[10px] font-bold tracking-[0.1em] text-white/45">{label.caption}</div>
                <div className="text-[11px] font-semibold text-[#F26522]">{label.text}</div>
              </div>
            </Marker>
          ))}

          {measurementAreaLabels.map((label) => (
            <Marker key={label.id} longitude={label.longitude} latitude={label.latitude} anchor="center">
              <div className="rounded-[16px] border border-[#F26522]/40 bg-[rgba(31,21,26,0.96)] px-3 py-2 text-center shadow-[0_18px_28px_rgba(3,8,24,0.48)]">
                <div className="text-[10px] font-bold tracking-[0.1em] text-white/45">AREA</div>
                <div className="text-sm font-semibold text-[#F26522]">{label.text}</div>
                <div className="mt-0.5 text-[10px] text-white/55">{label.perimeter}</div>
              </div>
            </Marker>
          ))}
        </Map>

        {/* Top Controls (Search, Filters, Layers) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-5">
          <div className="pointer-events-auto flex flex-wrap items-center gap-3">
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
          </div>
        </div>

        {/* 4. Compass Control (Top Right) */}
        <div className="absolute right-5 top-5 z-20">
          <button 
            title="Reset North" 
            onClick={() => setViewState(curr => ({ ...curr, bearing: 0, pitch: 0, transitionDuration: 700 }))} 
            className={`${RightSideBtnClass} relative`}
          >
            <span className="absolute top-1.5 text-[9px] font-bold tracking-[0.18em] text-white/45">N</span>
            <Compass className="h-5 w-5 text-[#F26522]" />
          </button>
        </div>

        {/* Bottom Right Control Stack */}
        <div className="absolute bottom-6 right-5 z-20 flex flex-col items-end gap-3">
          
          {/* 3. Fit to Data Control */}
          <button 
            title="Fit to Data" 
            onClick={handleFitToData} 
            className={`${RightSideBtnClass} ${cells.length ? "" : "pointer-events-none opacity-60"}`}
          >
            <Focus className="h-5 w-5 text-[#F26522]" />
          </button>

          {/* 2. Map Style Control */}
          <MapStyleRightControl value={mapStyle} onChange={setMapStyle} />

          {(isMeasuring || measurements.length > 0 || draftMeasurement?.points?.length) && (
            <div className="w-[290px] rounded-[20px] border border-[#27365C] bg-[rgba(8,18,36,0.96)] p-3 shadow-[0_24px_42px_rgba(3,8,24,0.5)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F26522]">Measurement</div>
                  <div className="mt-1 text-xs text-white/60">
                    {isMeasuring
                      ? "Click to add points. Click near the first point to close the area."
                      : "Measurement mode paused."}
                  </div>
                </div>
                <div className="rounded-full border border-[#F26522]/25 bg-[rgba(31,21,26,0.9)] px-2 py-1 text-[10px] font-semibold text-[#F26522]">
                  {measurements.length} saved
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleFinalizeMeasurement}
                  disabled={(draftMeasurement?.points?.length || 0) < 2}
                  className="rounded-xl border border-[#F26522]/30 bg-[rgba(31,21,26,0.92)] px-3 py-2 text-[11px] font-semibold text-[#F26522] transition hover:border-[#F26522]/45 hover:bg-[rgba(46,24,18,0.96)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={handleUndoMeasurementPoint}
                  disabled={!(draftMeasurement?.points?.length)}
                  className="rounded-xl border border-[#27365C] bg-[rgba(13,24,49,0.94)] px-3 py-2 text-[11px] font-semibold text-white/75 transition hover:border-[#F26522]/30 hover:text-[#F26522] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleClearMeasurements}
                  disabled={!(measurements.length || draftMeasurement?.points?.length)}
                  className="rounded-xl border border-[#27365C] bg-[rgba(13,24,49,0.94)] px-3 py-2 text-[11px] font-semibold text-white/75 transition hover:border-[#F26522]/30 hover:text-[#F26522] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* 1. Main Tools Expanding Control */}
          <div className={`flex flex-row-reverse items-center rounded-[18px] border border-[#27365C] bg-[rgba(8,18,36,0.96)] p-1.5 shadow-[0_18px_36px_rgba(3,8,24,0.42)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${toolsExpanded ? "pr-2" : ""}`}>
            
            {/* Settings Trigger */}
            <button 
              onClick={() => setToolsExpanded(!toolsExpanded)} 
              className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                toolsExpanded
                  ? "border-[#F26522]/45 bg-[rgba(31,21,26,0.96)] text-[#F26522]"
                  : "border-transparent bg-transparent text-white hover:border-[#F26522]/30 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522]"
              }`}
            >
              {toolsExpanded ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
            </button>
            
            {/* Expandable Tools */}
            <div className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${toolsExpanded ? "w-[164px] opacity-100 gap-1.5 mr-1.5" : "w-0 opacity-0 gap-0 mr-0"}`}>
              <button
                title="Measurement"
                onClick={toggleMeasurementMode}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                  isMeasuring
                    ? "border-[#F26522]/45 bg-[rgba(31,21,26,0.96)] text-[#F26522]"
                    : "border-transparent text-white hover:border-[#F26522]/30 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522]"
                }`}
              >
                <Ruler className="h-4 w-4" />
              </button>
              <button
                title="Fullscreen"
                onClick={toggleFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-white transition-colors hover:border-[#F26522]/30 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522]"
              >
                <Maximize className="h-4 w-4" />
              </button>
              <button
                title="Zoom Out"
                onClick={() => setViewState(curr => ({ ...curr, zoom: Math.max(curr.zoom - 1, 2), transitionDuration: 250 }))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-white transition-colors hover:border-[#F26522]/30 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                title="Zoom In"
                onClick={() => setViewState(curr => ({ ...curr, zoom: curr.zoom + 1, transitionDuration: 250 }))}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-white transition-colors hover:border-[#F26522]/30 hover:bg-[rgba(13,24,49,0.96)] hover:text-[#F26522]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Global States (Loading/Errors) */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#08112f]/30 backdrop-blur-sm transition-all duration-300">
            <div className="rounded-xl border border-white/10 bg-[#0A1240]/95 px-6 py-4 text-sm font-medium text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F26522] border-t-transparent"></div>
                Loading GIS data...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-6 left-6 z-20 max-w-md rounded-xl border border-[#F26522]/40 bg-[#0A1240]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md">
            <div className="font-semibold text-[#F26522]">GIS Engine Alert</div>
            <div className="mt-1 text-white/80">{error}</div>
          </div>
        )}

        {/* Utility CSS for hidden scrollbars */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}} />
      </div>
    </div>
  );
}
