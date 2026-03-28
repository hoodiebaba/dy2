import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MapActions from "../../store/actions/map-actions";
import AuthActions from "../../store/actions/auth-actions";
import { UilAngleDown, UilAngleUp } from '@iconscout/react-unicons';
import CellThematicsPanel from "./CellThematicsPanel";
import DropdownButton from "./DropdownButton";
// import { HexColorPicker } from "react-colorful";
import ColorPicker from "./ColorPicker";
import RangeFilter from "./RangeFilter";
import OpacitySlider from "./OpacitySlider";
import LeftFilters from "./LeftFilters";

const RightToolbarItems = React.memo((props) => {
  const {
    openDropdown,
    toggleDropdown,
    ranges,
    setRanges,
    startDateTime,
    setStartDateTime,
    endDateTime,
    setEndDateTime,
    driveThematic,
    setDriveThematic,
    driveThematicOptions,
    applyDriveTestLayer,
    clearDriveTestLayer,
    selectedDriveSessions,
    sessionIds,
    selectAllSessions,
    toggleDriveSession,
    setCellThematicsConfig,

    applySelectedMapLayers,
    clearAllMapLayers,
    boundaryGroups,
    selectedLayers,
    selectedBoundaries,
    expandedLayer,
    setExpandedLayer,
    toggleParentLayerSelection,
    toggleChildLayerSelection,
    setLayerVisibility,
    setSelectedLayers,

    rfRegions,
    rfRanges,
    rfParameter,
    setRfParameter,
    rfRangeColors,
    updateRfRangeColor,
    rfParameterOptions,

    dispatch,
    mapConfig,

    searchMode,
    setSearchMode,
    siteSearch,
    setSiteSearch,
    filteredSites,
    filteredCells,
    selectedSite,
    setSelectedSite,
    selectedCell,
    setSelectedCell,
    rawCells,
    
    handleResetSearch,

    syncMaps,
    toggleSyncMap,
    syncEnabled,
    mapNames,

  } = props;

  const layerVisibility = useSelector(state => state.map.layerVisibility);
console.log("layerVisibility from store:", layerVisibility);
console.log("CELLS value:", layerVisibility?.CELLS);

useEffect(() => {
  console.log("CELLS changed:", layerVisibility?.CELLS);
}, [layerVisibility?.CELLS]);

  return (
    <>

        {/* ADD MAP layers (GeoJSON map Layers) */}
        <DropdownButton
            id="layers" 
            label="Add MapLayer" 
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
        >
            <div className="absolute right-0 sm:right-0 sm:left-auto top-full mt-2 bg-white text-black p-4 rounded-xl shadow-xl z-50 w-[280px] sm:w-[320px] max-w-[90vw] max-h-[70vh] overflow-y-auto">
                <div className="flex gap-3 mb-2 ml-auto flex-shrink-0">
                  <button
                      onClick={applySelectedMapLayers}
                      className="flex-1 bg-blue-600 text-white py-1 rounded"
                  >
                      Apply
                  </button>

                  <button
                      onClick={clearAllMapLayers}
                      className="flex-1 bg-gray-400 text-white py-1 rounded"
                  >
                      Clear
                  </button>

                </div>

                {/* CELLs */}
                <div className="border rounded p-2 mb-2">
                  <div
                    onClick={() =>
                      setExpandedLayer(
                        expandedLayer === "CELL"
                          ? null
                          : "CELL"
                      )
                    }
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-1"
                  >

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        // checked={selectedLayers["CELL"] || false}
                        // checked={layerVisibility.CELLS}
                        // onClick={(e) => e.stopPropagation()}
                        // onChange={() => toggleParentLayerSelection("CELL")}
                        // onChange={() => {
                        //   dispatch(
                        //     // console.log("MapActions keys:", Object.keys(MapActions)),
                        //     MapActions.setLayerVisibility(
                        //         "CELLS"
                        //     )
                        //   );
                        //   // toggleParentLayerSelection("CELL");
                        // }}

                        checked={selectedLayers["CELL"] || false}
                        onChange={() => {
                          setSelectedLayers(prev => ({
                            ...prev,
                            // CELL: !layerVisibility.CELLS
                            CELL: !prev["CELL"]
                          }));
                        }}
                      />

                      <span className="font-medium">
                        Cells
                      </span>
                    </div>

                    <span className="text-xl select-none">
                      {expandedLayer === "CELL"
                        ? <UilAngleUp size={22}/>
                        : <UilAngleDown size={22}/>
                      }
                    </span>

                  </div>

                  {expandedLayer === "CELL" && (

                    <div className="mt-3 border rounded p-3 space-y-3">
                      <CellThematicsPanel setCellThematicsConfig={setCellThematicsConfig} />
                  </div>
                  )}
                </div>

                {/* Kenya Boundary LAYER GROUPS */}
                {boundaryGroups.map((group, index) => (

                  <div key={index} className="border rounded p-2 mb-2">

                      <div
                      onClick={() =>
                          setExpandedLayer(
                          expandedLayer === group.shapegroup
                              ? null
                              : group.shapegroup
                          )
                      }
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-1"
                      >

                      {/* LEFT SIDE */}

                      <div className="flex items-center gap-2">

                          <input
                          type="checkbox"
                          checked={selectedLayers[group.shapegroup] || false}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleParentLayerSelection(group.shapegroup)}
                          />

                          <span className="font-medium">
                          {group.shapegroup} boundaries
                          </span>

                      </div>

                      {/* DROPDOWN ARROW */}

                      <span className="text-xl select-none">
                          {expandedLayer === group.shapegroup 
                          ? <UilAngleUp size={22} />
                          : <UilAngleDown size={22} />
                          }
                      </span>

                      </div>

                      {/* CHILD LIST */}

                      {expandedLayer === group.shapegroup && (

                      <div className="mt-2 border rounded p-2">
                        <OpacitySlider layer="BOUNDARY" />

                        <span className="text-xs font-semibold text-gray-500">
                          Select Layers
                        </span>
                        <div className="mt-2 max-h-[200px] overflow-y-auto border rounded p-2">

                            {group.shapenames.map((name, idx) => (

                            <label
                                key={idx}
                                className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                            >

                                <input
                                type="checkbox"
                                checked={
                                    selectedBoundaries[group.shapegroup]?.includes(name) || false
                                }
                                onChange={() =>
                                    toggleChildLayerSelection(group.shapegroup, name)
                                }
                                />

                                {name}

                            </label>

                            ))}

                        </div>

                      </div>

                      )}

                  </div>

                ))}

                {/* RF PREDICTIONS */}
                <div className="border rounded p-2 mb-2">

                  <div
                      onClick={() =>
                      setExpandedLayer(
                          expandedLayer === "RF"
                          ? null
                          : "RF"
                      )
                      }
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-1"
                  >

                      <div className="flex items-center gap-2">

                      <input
                          type="checkbox"
                          checked={selectedLayers["RF"] || false}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleParentLayerSelection("RF")}
                      />

                      <span className="font-medium">
                          RF Predictions
                      </span>

                      </div>

                      <span className="text-xl select-none">
                      {expandedLayer === "RF"
                          ? <UilAngleUp size={22}/>
                          : <UilAngleDown size={22}/>
                      }
                      </span>

                  </div>

                  {expandedLayer === "RF" && (
                  <div>
                    <div className="mt-2 border rounded p-2">
                        <OpacitySlider layer="RF" />

                         <span className="text-xs font-semibold text-gray-500">
                          Select Layers
                        </span>
                        <div className="mt-2 max-h-[200px] overflow-y-auto border rounded p-2">

                          {rfRegions.map((name, idx) => (

                              <label
                              key={idx}
                              className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                              >

                              <input
                                  type="checkbox"
                                  checked={
                                  selectedBoundaries["RF"]?.includes(name) || false
                                  }
                                  onChange={() =>
                                  toggleChildLayerSelection("RF", name)
                                  }
                              />

                              {name}

                              </label>

                          ))}
                        </div >

                      {/* THEMATIC */}
                      <div className="mt-3">

                          <div className="text-xs font-semibold text-gray-500 mb-1">
                          Apply Thematic by
                          </div>

                          <select
                          value={rfParameter}
                          onChange={(e) => setRfParameter(e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                          >

                          {rfParameterOptions.map(opt => (
                              <option key={opt}>{opt}</option>
                          ))}

                          </select>

                      </div>

                      {/* RANGE & COLORS */}
                      <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                          Range & Colors
                          </div>

                          <div className="space-y-2">

                          {rfRanges.map(range => (

                              <div
                              key={range}
                              className="flex items-center justify-between border rounded px-2 py-1"
                              >

                              <span className="text-sm">
                                  {range}
                              </span>

                              <ColorPicker
                                  value={rfRangeColors[range] || "#ff0000"}
                                  onChange={(color) =>
                                  updateRfRangeColor(range, color)
                                  }
                              />

                              </div>

                          ))}

                          </div>
                      </div>

                      </div>
                    </div>
                  )}

                </div>

                {/* DRIVE TEST LAYER */}
                <div className="border rounded p-2 mb-2">

                  <div
                      onClick={() =>
                      setExpandedLayer(
                          expandedLayer === "DRIVE_TEST"
                          ? null
                          : "DRIVE_TEST"
                      )
                      }
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 rounded p-1"
                  >

                      <div className="flex items-center gap-2">

                      <input
                          type="checkbox"
                          checked={selectedLayers["DRIVE_TEST"] || false}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleParentLayerSelection("DRIVE_TEST")}
                      />

                      <span className="font-medium">
                          Drive Test Layers
                      </span>

                      </div>

                      <span className="text-xl select-none">
                      {expandedLayer === "DRIVE_TEST"
                          ? <UilAngleUp size={22}/>
                          : <UilAngleDown size={22}/>
                      }
                      </span>

                  </div>

                  {expandedLayer === "DRIVE_TEST" && (
                    <div className="mt-2 border rounded p-2">
                      <OpacitySlider layer="DRIVE_TEST" />

                          {/* Sessions */}
                        <div>
                            {/* <label className="flex items-center gap-2 mb-2 text-sm">
                            <input
                                type="checkbox"
                                checked={selectedDriveSessions.length === sessionIds.length}
                                onChange={selectAllSessions}
                            />
                            Select All Sessions
                            </label> */}

                          <span className="text-xs font-semibold text-gray-500">
                            Select Layers
                          </span>

                            <div className="max-h-[160px] overflow-y-auto border rounded p-2">
                            {sessionIds.map((session) => (
                                <label
                                key={session}
                                className="flex items-center gap-2 text-sm  mb-1"
                                >
                                <input
                                    type="checkbox"
                                    checked={selectedDriveSessions.includes(session)}
                                    onChange={() => toggleDriveSession(session)}
                                />
                                {session}
                                </label>
                            ))}
                            </div>
                        </div>

                      <div className="mt-3 space-y-3">

                        {/* Date */}
                         <span className="text-xs font-semibold text-gray-500">
                            Select Start/End DateTime
                          </span>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                            type="datetime-local"
                            value={startDateTime}
                            onChange={(e) => setStartDateTime(e.target.value)}
                            className="border rounded px-2 py-1 text-xs"
                            />

                            <input
                            type="datetime-local"
                            value={endDateTime}
                            onChange={(e) => setEndDateTime(e.target.value)}
                            className="border rounded px-2 py-1 text-xs"
                            />
                        </div>

                        {/* Thematic */}
                         <span className="text-xs font-semibold text-gray-500">
                            Apply thematics by
                          </span>
                        <select
                            value={driveThematic}
                            onChange={(e) => setDriveThematic(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                        >
                            {driveThematicOptions.map((opt) => (
                            <option key={opt}>{opt}</option>
                            ))}
                        </select>

                        {/* Range Filter */}
                        <RangeFilter
                            value={ranges}
                            onChange={setRanges}
                        />

                    
                      </div>

                    </div>

                  )}

                </div>
          </div>
        </DropdownButton>

        {/* <CellThematicsPanel   
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
        /> */}

        {/* ----------- MAP Style ----------- */}
        <DropdownButton
            id="mapStyle" 
            label="Map Style" 
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
        >
            <div className="absolute right-0 mt-3 bg-white text-black p-5 rounded-xl shadow-2xl z-50
            w-[280px] sm:w-[320px] max-w-[90vw]">
                {[
                { label: "Standard", value: "mapbox://styles/mapbox/standard" },
                { label: "Streets", value: "mapbox://styles/mapbox/streets-v11" },
                { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
                { label: "Dark", value: "mapbox://styles/mapbox/dark-v10" },
                { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v11" },
                { label: "Light", value: "mapbox://styles/mapbox/light-v10" },
                { label: "Satellite Streets", value: "mapbox://styles/mapbox/satellite-streets-v11" },
                { label: "Navigation Day", value: "mapbox://styles/mapbox/navigation-day-v1" },
                ].map((option) => (
                <div
                    key={option.value}
                    onClick={() => {
                    dispatch(
                        MapActions.setMapConfig({
                        mapView: option.value
                        })
                    );
                    setOpenDropdown(null);
                    }}
                    className="px-2 py-1 hover:bg-gray-200 cursor-pointer text-sm"
                >
                    {option.label}
                </div>
                ))}
            </div>
        </DropdownButton>

        {/* ----------- SCALE ----------- */}
        {/* <DropdownButton
            id="cellScale"
            label="Cell Scale"
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
        >
            <div className="absolute right-0 mt-3 bg-[#1b2f55] p-4 rounded-xl shadow-xl z-50 w-[120px]">

            <div className="flex flex-col items-center gap-3">

                <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={mapConfig.mapScale}
                onChange={(e) =>
                    dispatch(
                    MapActions.setMapConfig({
                        mapScale: parseFloat(e.target.value)
                    })
                    )
                }
                className="h-24 cursor-pointer"
                style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    appearance: "slider-vertical",
                    WebkitAppearance: "slider-vertical"
                }}
                />

                <span className="text-xs text-white font-medium">
                {mapConfig.mapScale}x
                </span>

            </div>

            </div>
        </DropdownButton> */}

        {/* ----------- SMART SEARCH ----------- */}
        <DropdownButton
            id="site"
            label="Search"
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
        >
            <div className="absolute right-0 mt-3 bg-white text-black p-5 rounded-xl shadow-2xl z-50
            w-[280px] sm:w-[320px] max-w-[90vw]">
                {/* Toggle Site / Cell Mode */}
                <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setSearchMode("site")}
                    className={`px-3 py-1 rounded-md text-sm ${
                    searchMode === "site"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                >
                    Site
                </button>

                <button
                    onClick={() => setSearchMode("cell")}
                    className={`px-3 py-1 rounded-md text-sm ${
                    searchMode === "cell"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                >
                    Cell
                </button>
                </div>

                {/* Search Input */}
                <input
                type="text"
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                placeholder={`Search ${searchMode}...`}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Suggestions */}
                <div className="max-h-48 overflow-y-auto border rounded-md">

                {searchMode === "site" &&
                    filteredSites.map((site, index) => (
                    <div
                        key={index}
                        onClick={() => {
                        setSelectedSite(site);
                        setSiteSearch(site);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                        {site}
                    </div>
                    ))}

                {searchMode === "cell" &&
                    filteredCells.map((cell, index) => (
                    <div
                        key={index}
                        onClick={() => {
                        setSelectedCell(cell);
                        setSiteSearch(cell.cell_id);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                        {cell.cell_id}
                        <span className="text-xs text-gray-500 ml-2">
                        ({cell.site_name})
                        </span>
                    </div>
                    ))}

                </div>

                <div className="mt-4 flex gap-2">
                <button
                onClick={() => {

                    let target = null;

                    if (searchMode === "site" && selectedSite) {
                    target = rawCells.find(c => c.site_name === selectedSite);
                    }

                    if (searchMode === "cell" && selectedCell) {
                    target = selectedCell;
                    }

                    if (target) {

                    dispatch(MapActions.setHighlightedCell(target.cell_id));

                    dispatch(
                        MapActions.setViewState({
                        longitude: Number(target.longitude),
                        latitude: Number(target.latitude),
                        zoom: searchMode === "cell" ? 18 : 16,
                        transitionDuration: 1200
                        })
                    );

                    }

                    setOpenDropdown(null);

                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                >
                Apply & Zoom
                </button>

                <button
                onClick={handleResetSearch}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm"
                >
                Reset Search
                </button>

            </div>
            </div>
        </DropdownButton>      

        {/* ----------- MAPSYNC, 
            use this code, whenever multimap Sync needs to be kept as an option----------- */}

        {/* <DropdownButton
        id="syncMaps"
        label={`Sync Maps ${syncEnabled ? "ON" : "OFF"}`}
        openDropdown={openDropdown}
        toggleDropdown={toggleDropdown}
        >
        <div className="absolute right-0 mt-3 bg-white text-black p-5 rounded-xl shadow-2xl z-50 w-[240px]">

            <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">Sync Control</span>

            <button
                onClick={() =>
                dispatch(MapActions.setSyncEnabled(!syncEnabled))
                }
                className={`
                relative w-12 h-6 rounded-full transition-colors
                ${syncEnabled ? "bg-blue-500" : "bg-gray-400"}
                `}
            >
                <span
                className={`
                    absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow
                    transform transition-transform
                    ${syncEnabled ? "translate-x-6" : ""}
                `}
                />
            </button>
            </div>

            <div className="border-t pt-3 space-y-2 max-h-[200px] overflow-y-auto">

            {mapNames.map((name) => (
                <label
                key={name}
                className="flex items-center gap-2 cursor-pointer text-sm"
                >
                <input
                    type="checkbox"
                    checked={syncMaps[name]}
                    onChange={() => toggleSyncMap(name)}
                />
                {name}
                </label>
            ))}

            </div>

        </div>
        </DropdownButton> */}
    </>
  );
});

const GlobalFilters = () => {
  const dispatch = useDispatch();

  const allFilters = useSelector(state => state.map.telecomFilterMeta);
  const mapConfig = useSelector(state => state.map.config);
  const syncEnabled = useSelector(state => state.map.syncEnabled);
  const rawCells = useSelector(state => state.map.rawCells || []);
  const boundaryGroups = useSelector(state => state.map.boundaryGroups || []);
  const activeThematic = useSelector(state => state.map.activeThematic);

  const rfPredictionFilters = useSelector(
    state => state.map.rfPredictionFilters || []
  );

  // const [showTools, setShowTools] = useState(false);
  const [showRightTools, setShowRightTools] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState({});
  const [siteSearch, setSiteSearch] = useState("");

  const layerVisibility = useSelector(state => state.map.layerVisibility);
  const [selectedLayers, setSelectedLayers] = useState({});
  const [selectedBoundaries, setSelectedBoundaries] = useState({});
  const [expandedLayer, setExpandedLayer] = useState(null);

  const [cellThematicsConfig, setCellThematicsConfig] = useState(null);

  const [driveThematic, setDriveThematic] = useState("RSSI");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const [rangeMin, setRangeMin] = useState("");
  const [rangeMax, setRangeMax] = useState("");
  const [rangeColor, setRangeColor] = useState("#ff0000");
  const [ranges, setRanges] = useState([
    { min: "", max: "", color: "#ff0000" }
  ]);

  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const containerRef = useRef(null);

  const [searchMode, setSearchMode] = useState("site"); // "site" | "cell"
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const [rfParameter, setRfParameter] = useState("RSRP");
  const [rfRangeColors, setRfRangeColors] = useState({});

  const [showLeftFilters, setShowLeftFilters] = useState(false);
  const [openTech, setOpenTech] = useState({});
  const [openGroup, setOpenGroup] = useState({});

  const toggleTech = (name) => {
    setOpenTech(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleGroup = (name) => {
    setOpenGroup(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const rfParameterOptions = useMemo(() => {
    return [...new Set(
      rfPredictionFilters.map(p => p.parameter_name)
    )];
  }, [rfPredictionFilters]);

  const rfRanges = [
    ...new Set(
      rfPredictionFilters
        .filter(f => f.parameter_name === rfParameter)
        .map(f => f.range_label)
    )
  ];

  const rfRegions = [
    ...new Set(rfPredictionFilters.map(item => item.name))
  ];

  const updateRfRangeColor = (range, color) => {
    setRfRangeColors(prev => ({
      ...prev,
      [range]: color
    }));
  };
  

  const driveThematicOptions = [
    "RSSI",
    "RSRP",
    "DL Thrp",
    "Frequency",
    "Band",
    "Technology"
  ];

  const addRange = () => {
    setRanges(prev => [
      ...prev,
      { min: "", max: "", color: "#ff0000" }
    ]);
  };

  const updateRange = (index, field, value) => {
    setRanges(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeRange = (index) => {
      setRanges(prev => prev.filter((_, i) => i !== index));
  };

  const mapNames = [
  "Telkom",
  "China Mobile",
  "Airtel",
  "Jio",
  "Safaricom",
  "Zain"
];

const [syncMaps, setSyncMaps] = useState({
  Telkom: true,
  "China Mobile": true,
  Airtel: true,
  Jio: true,
  Safaricom: true,
  Zain: true
});

const toggleSyncMap = (name) => {
  setSyncMaps(prev => ({
    ...prev,
    [name]: !prev[name]
  }));
};

  // drive test layer
  const driveTestData = useSelector(
    state => state.map.driveTestData || []
  );
  const [selectedDriveSessions, setSelectedDriveSessions] = useState([]);
  const sessionIds = [
    ...new Set(driveTestData.map(d => d.session_id))
  ];
//   const sessionIds = useSelector(
//   state => state.map.driveTestSessions || []
// );

  const toggleDriveSession = (session) => {
    setSelectedDriveSessions(prev => {
      if (prev.includes(session)) {
        return prev.filter(s => s !== session);
      }
      return [...prev, session];

    });

  };

  const selectAllSessions = () => {

  if (selectedDriveSessions.length === sessionIds.length) {
    setSelectedDriveSessions([]);
  } else {
    setSelectedDriveSessions(sessionIds);
  }

};

const applyDriveTestLayer = () => {
  dispatch(
    MapActions.setDriveTestFilters({
      sessions: selectedDriveSessions,
      startDateTime,
      endDateTime,
      thematic: driveThematic,
      ranges,
    })
  );

  dispatch(
    MapActions.setActiveDriveSessions(selectedDriveSessions)
  );

  dispatch(
    MapActions.getDriveTestData({
      sessions: selectedDriveSessions,
      startDateTime,
      endDateTime
    })
  );
  
  setOpenDropdown(null);
};

const clearDriveTestLayer = () => {
  setSelectedDriveSessions([]);
  dispatch(
    MapActions.setActiveDriveSessions([])
  );
  setOpenDropdown(null);
};

const selectAllRfRegions = () => {

  if (selectedRfPredictions.length === rfRegions.length) {
    setSelectedRfPredictions([]);
  } else {
    setSelectedRfPredictions(rfRegions);
  }

};

const toggleRfLayer = () => {

  setRfLayerEnabled(prev => !prev);

  if (!rfLayerEnabled) {
    setSelectedRfPredictions(rfRegions);
  } else {
    setSelectedRfPredictions([]);
  }

};
const toggleRfPrediction = (name) => {

  setSelectedRfPredictions(prev => {

    if (prev.includes(name)) {
      return prev.filter(n => n !== name);
    }

    return [...prev, name];

  });

};
  /* ---------------- LOAD DATA ---------------- */
  // const didLoad = useRef(false);
  useEffect(() => {
    // if (didLoad.current) return;
   // didLoad.current = true;

    dispatch(MapActions.getTelecomFilterMeta());
    dispatch(MapActions.getTelecomTechMeta());   //
    // dispatch(MapActions.getUserMapSetup());
    dispatch(MapActions.getMultiVendorCells({}));
    dispatch(MapActions.getRfPredictionFilters());
  }, []);

  /* ----------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------- */
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     // Ignore clicks inside color picker
  //     // if (e.target.closest(".color-picker-root")) return;

  //     if (containerRef.current && !containerRef.current.contains(e.target)) {
  //       setOpenDropdown(null);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () =>
  //     document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inside = containerRef.current?.contains(e.target);
      if (!inside) {
        console.log("Closing dropdown due to outside click");
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

// technology & region Default behaviour, open both groups
  useEffect(() => {
    if (allFilters?.d1) {
      const initial = {};
      allFilters.d1.forEach(g => {
        initial[g.parent] = true;
      });
      setOpenGroup(initial);
    }
  }, [allFilters]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // const toggleChildLayerSelection = (group, name) => {

  //   setSelectedBoundaries(prev => {

  //     const existing = prev[group] || [];

  //     if (existing.includes(name)) {
  //       return {
  //         ...prev,
  //         [group]: existing.filter(n => n !== name)
  //       };
  //     }

  //     return {
  //       ...prev,
  //       [group]: [...existing, name]
  //     };

  //   });

  // };

  // const toggleParentLayerSelection = (group) => {

  //   setSelectedLayers(prev => ({
  //     ...prev,
  //     [group]: !prev[group]
  //   }));

  //   setExpandedLayer(prev =>
  //     prev === group ? null : group
  //   );

  // };

  // const toggleParentLayerSelection = (group) => {

  //   setSelectedLayers(prev => {
  //     const newValue = !prev[group];

  //     // handle RF Predictions separately
  //     if (group === "RF") {
  //       setSelectedBoundaries(boundaries => ({
  //         ...boundaries,
  //         RF: newValue ? rfRegions : []
  //       }));
  //     }

  //     return {
  //       ...prev,
  //       [group]: newValue
  //     };
  //   });

  //   setExpandedLayer(prev =>
  //     prev === group ? null : group
  //   );

  // };

  //  ADD MAP LAYERS (Selection UI --Parent/Group of geojson boundaries )
  // const toggleParentLayerSelection = (group) => {

  //   const isSelected = selectedLayers[group];
  //   setSelectedLayers(prev => {
  //       const newState = {
  //       ...prev,
  //       [group]: !prev[group]
  //       };

  //       if (group === "DRIVE_TEST") {
  //         if (!prev[group]) {
  //             // selecting parent → select all sessions
  //             setSelectedDriveSessions(sessionIds);
  //         } else {
  //             // unselecting parent → clear sessions
  //             setSelectedDriveSessions([]);
  //         }
  //       }
  //       return newState;
  // });

  //   if (group === "CELL") {
  //   setExpandedLayer(group);
  //   return;
  // }

  //   // select/deselect children
  //   if (group === "RF") {
  //     setSelectedBoundaries(prev => ({
  //       ...prev,
  //       RF: !isSelected ? rfRegions : []
  //     }));
  //   }
  //   else {
  //     const groupObj = boundaryGroups.find(
  //       g => g.shapegroup === group
  //     );

  //     setSelectedBoundaries(prev => ({
  //       ...prev,
  //       [group]: !isSelected ? groupObj?.shapenames || [] : []
  //     }));
  //   }

  //   // ⭐ OPEN CHILD LIST when selecting parent
  //   if (!isSelected) {
  //     setExpandedLayer(group);
  //   }
  // };

//   const toggleParentLayerSelection = (group) => {

//     setSelectedLayers(prev => {
//       const isSelected = prev[group];
//       const newState = {
//         ...prev,
//         // [group]: group === "CELL" ? true : !isSelected
//         [group]: !isSelected
//       };

//       // DRIVE TEST logic
//       if (group === "DRIVE_TEST") {
//         if (!isSelected) {
//           setSelectedDriveSessions(sessionIds);
//         } else {
//           setSelectedDriveSessions([]);
//         }
//       }

//       return newState;
//     }
//   );

//   // CELL THEMATIC special handling
//   if (group === "CELL") {
//     setExpandedLayer("CELL");
//     return;
//   }

//   // RF
//   if (group === "RF") {
//     setSelectedBoundaries(prev => ({
//       ...prev,
//       RF: !selectedLayers[group] ? rfRegions : []
//     }));
//   } 
//   else {
//     const groupObj = boundaryGroups.find(
//       g => g.shapegroup === group
//     );

//     setSelectedBoundaries(prev => ({
//       ...prev,
//       [group]: !selectedLayers[group] ? groupObj?.shapenames || [] : []
//     }));
//   }

//   if (!selectedLayers[group]) {
//     setExpandedLayer(group);
//   }
// };

const toggleParentLayerSelection = (group) => {

  const isSelected = selectedLayers[group];
  const newValue = !isSelected;

  // 1️⃣ Update selected layers
  setSelectedLayers(prev => ({
    ...prev,
    [group]: newValue
  }));

  // 2️⃣ DRIVE TEST logic
  if (group === "DRIVE_TEST") {
    if (newValue) {
      setSelectedDriveSessions(sessionIds);
    } else {
      setSelectedDriveSessions([]);
    }
  }

  // 3️⃣ CELL special case (UI only)
  if (group === "CELL") {
    setExpandedLayer("CELL");
    return;
  }

  // 4️⃣ RF
  if (group === "RF") {
    setSelectedBoundaries(prev => ({
      ...prev,
      RF: newValue ? rfRegions : []
    }));
  } 
  // 5️⃣ NORMAL BOUNDARY
  else {
    const groupObj = boundaryGroups.find(
      g => g.shapegroup === group
    );

    setSelectedBoundaries(prev => ({
      ...prev,
      [group]: newValue ? groupObj?.shapenames || [] : []
    }));
  }

  // 6️⃣ Expand if selecting
  if (newValue) {
    setExpandedLayer(group);
  }
};

 //  ADD MAP LAYERS (Selection UI --Child Toggle of geojson boundaries )
  const toggleChildLayerSelection = (group, name) => {

    setSelectedBoundaries(prev => {

      const existing = prev[group] || [];

      let updated;

      if (existing.includes(name)) {
        updated = existing.filter(n => n !== name);
      } else {
        updated = [...existing, name];
      }

      // find total children count
      let totalChildren = 0;

      if (group === "RF") {
        totalChildren = rfRegions.length;
      } else {
        const groupObj = boundaryGroups.find(
          g => g.shapegroup === group
        );
        totalChildren = groupObj?.shapenames?.length || 0;
      }

      // update parent checkbox state
      setSelectedLayers(prevLayers => ({
        ...prevLayers,
        [group]: updated.length === totalChildren
      }));

      return {
        ...prev,
        [group]: updated
      };

    });

  };

  const applySelectedMapLayers = () => {

    dispatch(MapActions.setLayerVisibility("CELLS", selectedLayers["CELL"] || false));
    dispatch(MapActions.setLayerVisibility("BOUNDARY", !!selectedLayers["BOUNDARY"]));
    dispatch(MapActions.setLayerVisibility("RF", !!selectedLayers["RF"]));
    dispatch(MapActions.setLayerVisibility("DRIVE_TEST", !!selectedLayers["DRIVE_TEST"]));

    // clear existing layers first
    dispatch(MapActions.clearBoundaryLayer());
    dispatch(MapActions.clearRfPredictionLayer());

    // Boundary layer
    boundaryGroups.forEach(group => {
      const parentSelected = selectedLayers[group.shapegroup];
      const children = selectedBoundaries[group.shapegroup] || [];
      if (parentSelected) {

        dispatch(
          MapActions.getBoundaryGeoJson(
            group.shapegroup,
            group.shapetypes[0],
            []
          )
        );

      }
      else if (children.length > 0) {

        dispatch(
          MapActions.getBoundaryGeoJson(
            group.shapegroup,
            group.shapetypes[0],
            children
          )
        );

      }
    });

    //  RF PRedictions Layer
    const rfRegionsSelected = selectedBoundaries["RF"] || [];
    rfRegionsSelected.forEach(region => {

      dispatch(
        MapActions.getRfPredictionLayer(
          region,
          rfParameter
        )
      );

    });

    // Drive test layer
    if (selectedLayers["DRIVE_TEST"]) {
          dispatch(
              MapActions.setDriveTestFilters({
              sessions: selectedDriveSessions,
              startDateTime,
              endDateTime,
              thematic: driveThematic,
              ranges,
              })
          );
          dispatch(
              MapActions.setActiveDriveSessions(selectedDriveSessions)
          );
          dispatch(
              MapActions.getDriveTestData({
              sessions: selectedDriveSessions,
              startDateTime,
              endDateTime
              })
          );
      }

    // CELL THEMATICS LAyer
    // if (selectedLayers["CELL"] && cellThematicsConfig) {
    if (cellThematicsConfig) {
      dispatch(
        MapActions.setActiveThematic(cellThematicsConfig)
      );

      dispatch(
        AuthActions.setupConf(true, {
          saveThematics: JSON.stringify(cellThematicsConfig)
        })
      );
    }

    if (cellThematicsConfig?.scale !== undefined ) {
      dispatch(
        MapActions.setMapConfig({
          mapScale: cellThematicsConfig.scale
        })
      );
    }

    setOpenDropdown(null);

  };

  const clearAllMapLayers = () => {

    setSelectedLayers({});
    setSelectedBoundaries({});
    setExpandedLayer(null);

    dispatch(MapActions.clearBoundaryLayer());     // CLEAR Drive Test Layer
    dispatch(MapActions.clearRfPredictionLayer()); // CLEAR RF Predictions Layer

    setSelectedDriveSessions([]);
    dispatch(MapActions.setActiveDriveSessions([]));

    // ✅ RESET OPACITY
    dispatch(MapActions.resetLayerOpacity()); 

    // CLEAR CELL THEMATICS
    dispatch(MapActions.setActiveThematic({type: "Technology",colors: {},opacity: 1}));
    dispatch(MapActions.setMapConfig({mapScale: 1}));
    dispatch(MapActions.resetLayerVisibility());
    // dispatch(MapActions.setActiveThematic(null));

    setOpenDropdown(null);

  };

  // Technology / Region filters (top-left dropdowns)
  const handleCheck = (parent, value) => {
    setSelected(prev => {
      const existing = prev[parent] || [];
      if (existing.includes(value)) {
        return { ...prev, [parent]: existing.filter(v => v !== value) };
      }
      return { ...prev, [parent]: [...existing, value] };
    });
  };

  // For Technology / Region filters (top-left dropdowns)
  const handleSubmit = () => {
    const payload = { ...selected };
    if (siteSearch.trim()) {
      payload.site_name = [siteSearch.trim()];
    }

    dispatch(MapActions.getMultiVendorCells(payload));

    dispatch(AuthActions.setupConf(true, {
      mapScale: mapConfig.mapScale,
      mapView: mapConfig.mapView,
      saveMapFilters: JSON.stringify(payload),
      saveThematics: JSON.stringify(activeThematic)
    }));
  };

  // const handleClear = () => {
  //   setSelected({});
  //   setSiteSearch("");
  //   dispatch(MapActions.getMultiVendorCells({}));

  // };

 const clearGlobalFilters = () => {

  setSelected({});
  setSiteSearch("");

  dispatch(
    MapActions.getMultiVendorCells({})
  );

};

  const handleResetSearch = () => {

    setSelectedSite(null);
    setSelectedCell(null);
    setSiteSearch("");

    dispatch(MapActions.setHighlightedCell(null));
    dispatch(MapActions.setSelectedCell(null));
  };

  // const siteSuggestions = [
  //   ...new Set(rawCells.map(cell => cell.site_name))
  // ].filter(site =>
  //   site?.toLowerCase().includes(siteSearch.toLowerCase())
  // );

  const siteList = [...new Set(rawCells.map(cell => cell.site_name))];

  const filteredSites = siteList.filter(site =>
    site?.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const filteredCells = rawCells
    .filter(cell =>
      (!selectedSite || cell.site_name === selectedSite) &&
      cell.cell_id?.toLowerCase().includes(siteSearch.toLowerCase())
    )
    .slice(0, 50); // limit for performance

  return (
    <div
      ref={containerRef}
      className=" relative flex items-center bg-[#0b1c px-3 sm:px-4 py-3 text-white text-sm w-full "
    >

      <LeftFilters />

        {/* CLEAR + SUBMIT for LEft filters*/}
        {/* <div className="flex gap-2 ml-3">
          <button
            onClick={clearGlobalFilters}
            className="bg-gray-500 px-4 py-2 rounded-lg text-sm"
          >
            Clear
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 px-5 py-2 rounded-lg text-sm"
          >
            Submit
          </button>
        </div> */}
        {/* </div> */}

        {/* RIGHT PANEL (DESKTOP) */}
        <div className="hidden md:flex gap-2 ml-auto">
            <RightToolbarItems
                openDropdown={openDropdown}
                toggleDropdown={toggleDropdown}
                ranges={ranges}
                setRanges={setRanges}
                startDateTime={startDateTime}
                setStartDateTime={setStartDateTime}
                endDateTime={endDateTime}
                setEndDateTime={setEndDateTime}
                driveThematic={driveThematic}
                setDriveThematic={setDriveThematic}
                driveThematicOptions={driveThematicOptions}
                applyDriveTestLayer={applyDriveTestLayer}
                clearDriveTestLayer={clearDriveTestLayer}
                selectedDriveSessions={selectedDriveSessions}
                sessionIds={sessionIds}
                selectAllSessions={selectAllSessions}
                toggleDriveSession={toggleDriveSession}
                setCellThematicsConfig={setCellThematicsConfig}

                applySelectedMapLayers={applySelectedMapLayers}
                clearAllMapLayers={clearAllMapLayers}
                boundaryGroups={boundaryGroups}
                selectedLayers={selectedLayers}
                setSelectedLayers={setSelectedLayers}  

                selectedBoundaries={selectedBoundaries}
                expandedLayer={expandedLayer}
                setExpandedLayer={setExpandedLayer}
                toggleParentLayerSelection={toggleParentLayerSelection}
                toggleChildLayerSelection={toggleChildLayerSelection}

                rfRegions={rfRegions}
                rfRanges={rfRanges}
                rfParameter={rfParameter}
                setRfParameter={setRfParameter}
                rfRangeColors={rfRangeColors}
                updateRfRangeColor={updateRfRangeColor}
                rfParameterOptions={rfParameterOptions}

                dispatch={dispatch}
                mapConfig={mapConfig}

                searchMode={searchMode}
                setSearchMode={setSearchMode}
                siteSearch={siteSearch}
                setSiteSearch={setSiteSearch}
                filteredSites={filteredSites}
                filteredCells={filteredCells}
                selectedSite={selectedSite}
                setSelectedSite={setSelectedSite}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                rawCells={rawCells}
                handleResetSearch={handleResetSearch}

                syncMaps={syncMaps}
                toggleSyncMap={toggleSyncMap}
                syncEnabled={syncEnabled}
                mapNames={mapNames}
                
            />
        </div>

        {/* RIGHT TOOL PANEL (MOBILE) */}
        {showRightTools && (
          <div
            className="absolute right-0 top-full mt-2 w-[280px] bg-[#0b1c38] p-4 rounded-xl shadow-xl border border-[#2c4a85] z-50 md:hidden"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowRightTools(false)}
              className="absolute top-1 right-2 text-white text-lg"
            >
              ✕
            </button>

              {/* TOOLBAR ITEMS */}
              <div className="flex flex-col gap-2">
                  <RightToolbarItems
                      openDropdown={openDropdown}
                      toggleDropdown={toggleDropdown}
                      ranges={ranges}
                      setRanges={setRanges}
                      startDateTime={startDateTime}
                      setStartDateTime={setStartDateTime}
                      endDateTime={endDateTime}
                      setEndDateTime={setEndDateTime}
                      driveThematic={driveThematic}
                      setDriveThematic={setDriveThematic}
                      driveThematicOptions={driveThematicOptions}
                      applyDriveTestLayer={applyDriveTestLayer}
                      clearDriveTestLayer={clearDriveTestLayer}
                      selectedDriveSessions={selectedDriveSessions}
                      sessionIds={sessionIds}
                      selectAllSessions={selectAllSessions}
                      toggleDriveSession={toggleDriveSession}
                      setCellThematicsConfig={setCellThematicsConfig}

                      applySelectedMapLayers={applySelectedMapLayers}
                      clearAllMapLayers={clearAllMapLayers}
                      boundaryGroups={boundaryGroups}
                      selectedLayers={selectedLayers}
                      setSelectedLayers={setSelectedLayers}  

                      selectedBoundaries={selectedBoundaries}
                      expandedLayer={expandedLayer}
                      setExpandedLayer={setExpandedLayer}
                      toggleParentLayerSelection={toggleParentLayerSelection}
                      toggleChildLayerSelection={toggleChildLayerSelection}

                      rfRegions={rfRegions}
                      rfRanges={rfRanges}
                      rfParameter={rfParameter}
                      setRfParameter={setRfParameter}
                      rfRangeColors={rfRangeColors}
                      updateRfRangeColor={updateRfRangeColor}
                      rfParameterOptions={rfParameterOptions}

                      dispatch={dispatch}
                      mapConfig={mapConfig}

                      searchMode={searchMode}
                      setSearchMode={setSearchMode}
                      siteSearch={siteSearch}
                      setSiteSearch={setSiteSearch}
                      filteredSites={filteredSites}
                      filteredCells={filteredCells}
                      selectedSite={selectedSite}
                      setSelectedSite={setSelectedSite}
                      selectedCell={selectedCell}
                      setSelectedCell={setSelectedCell}
                      rawCells={rawCells}
                      handleResetSearch={handleResetSearch}

                      syncMaps={syncMaps}
                      toggleSyncMap={toggleSyncMap}
                      syncEnabled={syncEnabled}
                      mapNames={mapNames}
                  />
              </div>
          </div>
        )}

        {/* MOBILE SIDEBAR RIGht  BUTTON */}
        <button
          onClick={() => setShowRightTools(true)}
          className=" md:hidden ml-auto px-4 py-2 bg-[#162a52] hover:bg-[#1e3a70] text-white text-sm rounded-lg border border-[#2c4a85] "
        >
          ☰
        </button>

    </div>
  );
};

export default GlobalFilters;


        {/* LEft filters */}
      //   <div className="flex items-center gap-2 sm:gap-3">
      //     {/* LEFT FILTERS PANEL (Technology & Region Data Filters */}
      //     {showLeftFilters && (
      //     <div className="absolute left-0 top-full mt-2 w-[300px] bg-[#0b1c38] p-4 
      //       rounded-xl shadow-xl border border-[#2c4a85] z-50 max-h-[80vh] 
      //       overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500">              
      //         {/* Close */}
      //         <button
      //           onClick={() => setShowLeftFilters(false)}
      //           className="absolute top-1 right-2 text-white text-lg"
      //         >
      //           ✕
      //         </button>

      //         <div className="flex flex-col gap-3 mt-4">

      //           {/* Actions */}
      //           <div className="sticky bottom-0 bg-[#0b1c38] pt-3 flex gap-2">
      //             <button
      //               onClick={clearGlobalFilters}
      //               className="bg-gray-500 px-3 py-2 rounded-lg text-sm"
      //             >
      //               Clear
      //             </button>

      //             <button
      //               onClick={handleSubmit}
      //               className="bg-blue-600 px-3 py-2 rounded-lg text-sm"
      //             >
      //               Apply
      //             </button>
      //           </div>

      //           {allFilters?.d1?.map((group, groupIndex) => (
      //             <div key={groupIndex}>

      //               {/* Group Title */}
      //               <div
      //                 className="flex items-center justify-between text-white font-semibold mb-2 cursor-pointer"
      //                 onClick={() => toggleGroup(group.parent)}
      //               >
      //                 <span>{group.parent}</span>
      //                 <span className="text-xs">
      //                   {openGroup[group.parent] ? "▲" : "▼"}
      //                 </span>
      //               </div>
                    
      //               {/* Accordion */}
      //               {openGroup[group.parent] && 
      //                 group.child?.map((techBlock, techIndex) => {
      //                 const isTechSelected =
      //                   selected[techBlock.name]?.length ===
      //                   techBlock.columnName?.length;

      //                 return (
      //                   <div key={techIndex} className="mb-3 bg-[#162a52] p-3 rounded-lg">

      //                     {/* Parent */}
      //                     <div
      //                       className="flex items-center justify-between text-white font-medium cursor-pointer"
      //                       onClick={() => toggleTech(techBlock.name)}
      //                     >
      //                       <label
      //                         className="flex items-center gap-2 cursor-pointer"
      //                         onClick={(e) => e.stopPropagation()}
      // >                            <input
      //                             type="checkbox"
      //                             checked={isTechSelected}
      //                             onChange={() => {
      //                               const allBands =
      //                                 techBlock.columnName.map(b => b.name);
      //                               setSelected(prev => ({
      //                                 ...prev,
      //                                 [techBlock.name]:
      //                                   isTechSelected ? [] : allBands
      //                               }));
      //                             }}
      //                           />
      //                           {techBlock.name}
      //                       </label>

      //                       <span className="text-xs">
      //                         {openTech[techBlock.name] ? "▲" : "▼"}
      //                       </span>

      //                     </div>

      //                     {/* Children */}
      //                     {openTech[techBlock.name] && (
      //                       <div className="pl-4 mt-2 space-y-1">
      //                       {techBlock.columnName?.map((band, bandIndex) => (
      //                         <label
      //                           key={bandIndex}
      //                           className="flex items-center gap-2 text-sm text-white"
      //                         >
      //                           <input
      //                             type="checkbox"
      //                             checked={
      //                               selected[techBlock.name]?.includes(band.name) || false
      //                             }
      //                             onChange={() =>
      //                               handleCheck(techBlock.name, band.name)
      //                             }
      //                           />
      //                           {band.name}
      //                         </label>
      //                       ))}
      //                     </div>
      //                     )}
      //                   </div>
      //                 );
      //               })}
      //             </div>
      //           ))}

      //         </div>
      //       </div>
      //     )}
      //   </div>

      //   <button
      //     onClick={() => setShowLeftFilters(true)}
      //     className="px-4 py-2 bg-[#162a52] hover:bg-[#1e3a70] text-white text-sm rounded-lg border border-[#2c4a85]"
      //   >
      //     Filters ☰
      //   </button>

  // {Array.isArray(allFilters?.d1) &&
  //             allFilters.d1.map((group, groupIndex) => (
  //               <div key={groupIndex} className="relative">
  //                 <button
  //                   onClick={() => toggleDropdown(group.parent)}
  //                   className="px-4 py-2 bg-[#162a52] hover:bg-[#1e3a70] text-white text-sm rounded-lg border border-[#2c4a85]"
  //                 >
  //                   {group.parent} ▾
  //                 </button>

  //                   {/* dropdown code */}
  //                   {openDropdown === group.parent && (
  //                     <div className="absolute left-0 mt-3 bg-white text-black p-5 rounded-xl shadow-2xl z-50
  //                       w-[280px] sm:w-[320px] max-w-[90vw]">
                            
  //                       {group.child?.map((techBlock, techIndex) => {

  //                         const isTechSelected =
  //                           selected[techBlock.name]?.length ===
  //                           techBlock.columnName?.length;

  //                         return (
  //                           <div key={techIndex} className="mb-4 border-b pb-3">

  //                             {/* Parent Technology */}
  //                             <div className="flex items-center justify-between mb-2">

  //                               <label className="flex items-center gap-2 font-semibold cursor-pointer">
  //                                 <input
  //                                   type="checkbox"
  //                                   checked={isTechSelected}
  //                                   onChange={() => {
  //                                     const allBands =
  //                                       techBlock.columnName.map(b => b.name);
  //                                     setSelected(prev => ({
  //                                       ...prev,
  //                                       [techBlock.name]:
  //                                         isTechSelected ? [] : allBands
  //                                     }));
  //                                   }}
  //                                 />
  //                                 {techBlock.name}
  //                               </label>

  //                               {/* <input
  //                                 type="color"
  //                                 className="w-6 h-6 cursor-pointer"
  //                                 onChange={(e) =>
  //                                   console.log("Tech Color:", techBlock.name, e.target.value)
  //                                 }
  //                               /> */}
  //                             </div>

  //                             {/* Bands */}
  //                             <div className="pl-5 space-y-1">
  //                               {techBlock.columnName?.map((band, bandIndex) => (
  //                                 <div
  //                                   key={bandIndex}
  //                                   className="flex items-center justify-between"
  //                                 >
  //                                   <label className="flex items-center gap-2 text-sm">
  //                                     <input
  //                                       type="checkbox"
  //                                       checked={
  //                                         selected[techBlock.name]?.includes(band.name) || false
  //                                       }
  //                                       onChange={() =>
  //                                         handleCheck(techBlock.name, band.name)
  //                                       }
  //                                     />
  //                                     {band.name}
  //                                   </label>

  //                                   {/* <input
  //                                     type="color"
  //                                     className="w-5 h-5 cursor-pointer"
  //                                     onChange={(e) =>
  //                                       console.log("Band Color:", band.name, e.target.value)
  //                                     }
  //                                   /> */}
  //                                 </div>
  //                               ))}
  //                             </div>

  //                           </div>
  //                         );
  //                       })}

  //                     </div>
  //                   )}
  //               </div>
  //             ))
  //           }