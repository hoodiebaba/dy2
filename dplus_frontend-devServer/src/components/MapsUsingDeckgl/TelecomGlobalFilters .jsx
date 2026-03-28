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

const TelecomGlobalFilters = () => {
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

  const [selectedLayers, setSelectedLayers] = useState({});
  const [selectedBoundaries, setSelectedBoundaries] = useState({});
  const [expandedLayer, setExpandedLayer] = useState(null);

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
  const toggleParentLayerSelection = (group) => {

    const isSelected = selectedLayers[group];

    // toggle parent checkbox
    setSelectedLayers(prev => {
        const newState = {
        ...prev,
        [group]: !prev[group]
        };

        if (group === "DRIVE_TEST") {

        if (!prev[group]) {
            // selecting parent → select all sessions
            setSelectedDriveSessions(sessionIds);
        } else {
            // unselecting parent → clear sessions
            setSelectedDriveSessions([]);
        }

        }
        return newState;
  });

    // select/deselect children
    if (group === "RF") {
      setSelectedBoundaries(prev => ({
        ...prev,
        RF: !isSelected ? rfRegions : []
      }));
    }
    else {
      const groupObj = boundaryGroups.find(
        g => g.shapegroup === group
      );

      setSelectedBoundaries(prev => ({
        ...prev,
        [group]: !isSelected ? groupObj?.shapenames || [] : []
      }));
    }

    // ⭐ OPEN CHILD LIST when selecting parent
    if (!isSelected) {
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
  // const applySelectedMapLayers = () => {

  //   Object.keys(selectedBoundaries).forEach(group => {

  //     const names = selectedBoundaries[group] || [];

  //     dispatch(
  //       MapActions.getBoundaryGeoJson(
  //         group,
  //         "ADM1",
  //         names
  //       )
  //     );

  //   });

  //   setOpenDropdown(null);

  // };

//   const applySelectedMapLayers = () => {
//     boundaryGroups.forEach(group => {

//       const parentSelected = selectedLayers[group.shapegroup];
//       const children = selectedBoundaries[group.shapegroup] || [];

//       if (parentSelected) {

//         dispatch(
//           MapActions.getBoundaryGeoJson(
//             group.shapegroup,
//             group.shapetypes[0],
//             []
//           )
//         );

//       }

//       else if (children.length > 0) {

//         dispatch(
//           MapActions.getBoundaryGeoJson(
//             group.shapegroup,
//             group.shapetypes[0],
//             children
//           )
//         );

//       }

//     });

//   // RF PREDICTIONS
  
//     const rfRegionsSelected = selectedBoundaries["RF"] || [];
//     dispatch(MapActions.clearRfPredictionLayer());
//     if (rfRegionsSelected.length > 0) {
//       rfRegionsSelected.forEach(region => {
//         dispatch(
//           MapActions.getRfPredictionLayer(
//             region,
//             rfParameter
//           )
//         );
//       });
//     }
//   //  if (rfLayerEnabled && selectedRfPredictions.length > 0) {
//   //   selectedRfPredictions.forEach(region => {
//   //     dispatch(
//   //       MapActions.getRfPredictionLayer(
//   //         region,
//   //         rfParameter
//   //       )
//   //     );
//   //   });
//   // }

// // if (rfLayerEnabled && selectedRfPredictions.length > 0) {

// //   selectedRfPredictions.forEach(region => {

// //     const regionFilters = rfPredictionFilters.filter(
// //       f =>
// //         f.name === region &&
// //         f.parameter_name === rfParameter
// //     );

// //     regionFilters.forEach(filter => {

// //       dispatch(
// //         MapActions.getRfPredictionLayer(
// //           filter.name,
// //           filter.parameter_name,
// //           filter.range_label
// //         )
// //       );

// //     });

// //   });

// // }
//     setOpenDropdown(null);
//   };

const applySelectedMapLayers = () => {

  // clear existing layers first
  dispatch(MapActions.clearBoundaryLayer());
  dispatch(MapActions.clearRfPredictionLayer());

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

  //   RF PRedictions
  const rfRegionsSelected = selectedBoundaries["RF"] || [];
  rfRegionsSelected.forEach(region => {

    dispatch(
      MapActions.getRfPredictionLayer(
        region,
        rfParameter
      )
    );

  });

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

  setOpenDropdown(null);

};

  const clearAllMapLayers = () => {

    setSelectedLayers({});
    setSelectedBoundaries({});
    setExpandedLayer(null);

    dispatch(MapActions.clearBoundaryLayer());
    dispatch(MapActions.clearRfPredictionLayer());

    setSelectedDriveSessions([]);
    dispatch(MapActions.setActiveDriveSessions([]));

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
  
    const RightToolbarItems = () => (
      <>
        {/* RIGHT side navigation panel*/}
        <div className="flex flex-col md:flex-row gap-3">

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

                        <div className="mt-2 ml-4 max-h-[200px] overflow-y-auto border rounded p-2">

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
                      <div className="mt-2 ml-4 max-h-[200px] overflow-y-auto border rounded p-2">

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

                          </div>

                        {/* THEMATIC */}
                        <div className="mt-3">

                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            Thematic
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
                        Drive Test Layer
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

                    <div className="mt-3 border rounded p-3 space-y-3">

                      {/* Date */}
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

                      {/* Sessions */}
                      <div>
                        <label className="flex items-center gap-2 mb-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedDriveSessions.length === sessionIds.length}
                            onChange={selectAllSessions}
                          />
                          Select All Sessions
                        </label>

                        <div className="max-h-[160px] overflow-y-auto border rounded p-2">
                          {sessionIds.map((session) => (
                            <label
                              key={session}
                              className="flex items-center gap-2 text-sm mb-1"
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

                    </div>

                  )}

                </div>

                </div>
            </DropdownButton>

            <CellThematicsPanel   
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />

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
            <DropdownButton
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
          </DropdownButton>

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

          {/* ----------- MAPSYNC ----------- */}
          {/* <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <span className="text-sm text-gray-300 ">Sync Maps</span>

            <button
              onClick={() =>
                dispatch(MapActions.setSyncEnabled(!syncEnabled))
              }
              className={`
                relative
                w-14 h-7
                rounded-full
                transition-colors duration-300
                ${syncEnabled ? "bg-blue-500" : "bg-gray-500"}
              `}
            >
              <span
                className={`
                  absolute top-0 left-0
                  w-7 h-7
                  bg-white
                  rounded-full
                  shadow-md
                  transform transition-transform duration-300
                  ${syncEnabled ? "translate-x-7" : "translate-x-0"}
                `}
              />
            </button>
          </div> */}

          <DropdownButton
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
          </DropdownButton>
        </div>
      </>
    );

  return (
    <div
      ref={containerRef}
      className="
      relative  
      flex items-center
      bg-[#0b1c38]
      px-3 sm:px-4
      py-3
      text-white text-sm
      w-full
      "
    >
      {/* LEFT FILTERS PaNEL wrap */}
      {/* <div className="flex flex-wrap gap-2 md:gap-3"> */}
        {/* LEFT FILTERS */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* RIGHT TOOL PANEL (MOBILE) */}
          {showRightTools && (
            <div
              className="
              absolute
              right-0
              top-full
              mt-2
              w-[280px]
              bg-[#0b1c38]
              p-4
              rounded-xl
              shadow-xl
              border border-[#2c4a85]
              z-50
              md:hidden
              "
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowRightTools(false)}
                className="absolute top-1 right-2 text-white text-lg"
              >
                ✕
              </button>

              {/* TOOLBAR ITEMS */}
              <RightToolbarItems />
            </div>
          )}

            {/* Technology & Region Data Filters */}
            {Array.isArray(allFilters?.d1) &&
              allFilters.d1.map((group, groupIndex) => (
                <div key={groupIndex} className="relative">
                  <button
                    onClick={() => toggleDropdown(group.parent)}
                    className="px-4 py-2 bg-[#162a52] hover:bg-[#1e3a70] text-white text-sm rounded-lg border border-[#2c4a85]"
                  >
                    {group.parent} ▾
                  </button>

                    {/* dropdown code */}
                    {openDropdown === group.parent && (
                      <div className="absolute left-0 mt-3 bg-white text-black p-5 rounded-xl shadow-2xl z-50
                        w-[280px] sm:w-[320px] max-w-[90vw]">
                            
                        {group.child?.map((techBlock, techIndex) => {

                          const isTechSelected =
                            selected[techBlock.name]?.length ===
                            techBlock.columnName?.length;

                          return (
                            <div key={techIndex} className="mb-4 border-b pb-3">

                              {/* Parent Technology */}
                              <div className="flex items-center justify-between mb-2">

                                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isTechSelected}
                                    onChange={() => {
                                      const allBands =
                                        techBlock.columnName.map(b => b.name);
                                      setSelected(prev => ({
                                        ...prev,
                                        [techBlock.name]:
                                          isTechSelected ? [] : allBands
                                      }));
                                    }}
                                  />
                                  {techBlock.name}
                                </label>

                                {/* <input
                                  type="color"
                                  className="w-6 h-6 cursor-pointer"
                                  onChange={(e) =>
                                    console.log("Tech Color:", techBlock.name, e.target.value)
                                  }
                                /> */}
                              </div>

                              {/* Bands */}
                              <div className="pl-5 space-y-1">
                                {techBlock.columnName?.map((band, bandIndex) => (
                                  <div
                                    key={bandIndex}
                                    className="flex items-center justify-between"
                                  >
                                    <label className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={
                                          selected[techBlock.name]?.includes(band.name) || false
                                        }
                                        onChange={() =>
                                          handleCheck(techBlock.name, band.name)
                                        }
                                      />
                                      {band.name}
                                    </label>

                                    {/* <input
                                      type="color"
                                      className="w-5 h-5 cursor-pointer"
                                      onChange={(e) =>
                                        console.log("Band Color:", band.name, e.target.value)
                                      }
                                    /> */}
                                  </div>
                                ))}
                              </div>

                            </div>
                          );
                        })}

                      </div>
                    )}
                </div>
              ))
            }
        </div>

        {/* CLEAR + SUBMIT for LEft filters*/}
        <div className="flex gap-2 ml-3">
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
        </div>
      {/* </div> */}

      {/* RIGHT PANEL (DESKTOP) */}
      <div className="hidden md:flex items-center gap-2 sm:gap-3 ml-auto relative">
        <RightToolbarItems />
      </div>

      {/* MOBILE SIDEBAR BUTTON */}
      <button
        onClick={() => setShowRightTools(true)}
        className="
        md:hidden
        ml-auto
        px-4 py-2
        bg-[#162a52]
        hover:bg-[#1e3a70]
        text-white text-sm
        rounded-lg
        border border-[#2c4a85]
        "
      >
        ☰
      </button>

    </div>
  );
};

export default TelecomGlobalFilters;

          // {/* DRIVE TEST LAYER */}
          // <DropdownButton
          //   id="driveTest"
          //   label="Drive Test Layer"
          //   openDropdown={openDropdown}
          //   toggleDropdown={toggleDropdown}
          // >
          // <div className="absolute right-0 sm:right-0 sm:left-auto top-full mt-2 
          //   bg-white text-black p-4 rounded-xl shadow-xl z-50 
          //   w-[280px] sm:w-[320px] max-w-[90vw] max-h-[70vh] 
          //   overflow-x-visible">
          //     {/*  Apply / Clear (DRIVE TEST LAYER) */}
          //     <div className="flex gap-2 mb-4">
          //       <button
          //         onClick={applyDriveTestLayer}
          //         className="flex-1 bg-blue-600 text-white py-1.5 rounded-md text-sm font-medium"
          //       >
          //         Apply
          //       </button>

          //       <button
          //         onClick={clearDriveTestLayer}
          //         className="flex-1 bg-gray-400 text-white py-1.5 rounded-md text-sm font-medium"
          //       >
          //         Clear
          //       </button>
          //     </div>

          //     {/* Date/Time Section (DRIVE TEST LAYER)*/}
          //    <div className="mb-4">
          //     <div className="grid grid-cols-2 gap-3">
          //       <div className="flex flex-col">
          //         <label className="text-xs font-semibold text-gray-500 mb-2">
          //           Start: Date/Time
          //         </label>

          //         <input
          //           type="datetime-local"
          //           value={startDateTime}
          //           onChange={(e) => setStartDateTime(e.target.value)}
          //           className="border rounded px-2 py-1 text-xs w-full"
          //         />
          //       </div>

          //       <div className="flex flex-col">
          //         <label className="text-xs font-semibold text-gray-500 mb-2">
          //           End: Date/Time
          //         </label>

          //         <input
          //           type="datetime-local"
          //           value={endDateTime}
          //           onChange={(e) => setEndDateTime(e.target.value)}
          //           className="border rounded px-2 py-1 text-xs w-full"
          //         />
          //       </div>
          //     </div>
          //   </div>
          //     {/* Thematic Section (DRIVE TEST LAYER)*/}
          //     <div className="mb-4">
          //       <div className="text-xs font-semibold text-gray-500 mb-1">
          //         Thematic
          //       </div>

          //       <select
          //         value={driveThematic}
          //         onChange={(e) => setDriveThematic(e.target.value)}
          //         className="w-full border rounded px-2 py-1 text-sm"
          //       >
          //         {driveThematicOptions.map((opt) => (
          //           <option key={opt}>{opt}</option>
          //         ))}
          //       </select>
          //     </div>

          //     {/* Range Filter (DRIVE TEST LAYER) */}
          //    <div className="mb-4">
          //       <div className="text-xs font-semibold text-gray-500 mb-1">
          //         Range Filter
          //       </div>

          //       <div className="flex items-center gap-2">

          //         <span className="text-xs">Min</span>

          //         <input
          //           type="number"
          //           value={rangeMin}
          //           onChange={(e) => setRangeMin(e.target.value)}
          //           className="border rounded px-2 py-1 w-20 text-sm"
          //         />

          //         <span className="text-xs">Max</span>

          //         <input
          //           type="number"
          //           value={rangeMax}
          //           onChange={(e) => setRangeMax(e.target.value)}
          //           className="border rounded px-2 py-1 w-20 text-sm"
          //         />

          //         <input
          //           type="color"
          //           value={rangeColor}
          //           onChange={(e) => setRangeColor(e.target.value)}
          //           className="w-8 h-8 border rounded cursor-pointer"
          //         />
          //       </div>
          //     </div> 
          //        <div className="mb-4">

          //         <div className="flex items-center justify-between mb-2">
          //           <span className="text-xs font-semibold text-gray-500">
          //             Range Filter
          //           </span>

          //           <button
          //             onClick={addRange}
          //             className="text-blue-600 font-bold text-lg"
          //           >
          //             +
          //           </button>

          //         </div>

          //         {ranges.map((range, index) => (
          //           <div key={index} className="flex items-center gap-2 mb-2">
          //             <input
          //               type="number"
          //               placeholder="Min"
          //               value={range.min}
          //               onChange={(e) =>
          //                 updateRange(index, "min", e.target.value)
          //               }
          //               className="border rounded px-2 py-1 w-20 text-sm"
          //             />

          //             <input
          //               type="number"
          //               placeholder="Max"
          //               value={range.max}
          //               onChange={(e) =>
          //                 updateRange(index, "max", e.target.value)
          //               }
          //               className="border rounded px-2 py-1 w-20 text-sm"
          //             />

          //             <ColorPicker
          //               value={range.color}
          //               onChange={(color) => updateRange(index, "color", color)}
          //             />

          //             {ranges.length > 1 && (
          //               <button
          //                 onClick={() => removeRange(index)}
          //                 className="text-red-500 text-sm"
          //               >
          //                 ✕
          //               </button>
          //             )}
          //           </div>
          //         ))}
          //       </div> 
          //       <RangeFilter 
          //         key="drive-test-range"
          //         value={ranges} 
          //         onChange={setRanges} 
          //       />

          //     {/* Session section(DRIVE TEST LAYER) */}
          //     <div>
          //       <div className="text-xs font-semibold text-gray-500 mb-2">
          //         Sessions
          //       </div>

          //       <label className="flex items-center gap-2 mb-2 font-medium text-sm">
          //         <input
          //           type="checkbox"
          //           checked={selectedDriveSessions.length === sessionIds.length}
          //           onChange={selectAllSessions}
          //         />
          //         Select All Sessions
          //       </label>

          //       <div className="max-h-[180px] overflow-y-auto border rounded p-2">
          //         {sessionIds.map((session, idx) => (
          //           <label
          //             key={idx}
          //             className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
          //           >
          //             <input
          //               type="checkbox"
          //               checked={selectedDriveSessions.includes(session)}
          //               onChange={() => toggleDriveSession(session)}
          //             />
          //             {session}
          //           </label>
          //         ))}
          //       </div>
          //     </div>
          //   </div>
          // </DropdownButton>