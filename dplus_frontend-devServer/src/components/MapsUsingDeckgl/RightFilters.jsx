import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MapActions from "../../store/actions/map-actions";
import * as Unicons from "@iconscout/react-unicons";

import DropdownButton from "./DropdownButton";
import AddMapLayersPanel from "./AddMapLayersPanel";

const RightFilters = ({
  controls = ["layers", "mapStyle", "search"],
  vertical = false,
  align = "right",
  onFitToData = () => {},
}) => {
  const dispatch = useDispatch();

  /* ---------------- GLOBAL DATA ---------------- */
  const rawCells = useSelector((state) => state.map.rawCells || []);

  /* ---------------- STATE ---------------- */
  const [openDropdown, setOpenDropdown] = useState(null);
  const [siteSearch, setSiteSearch] = useState("");
  const [searchMode, setSearchMode] = useState("site");
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  /* ---------------- HOOKS ---------------- */

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdown(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  /* ---------------- HELPERS ---------------- */

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === "site" ? "cell" : "site"));
    setSelectedSite(null);
    setSelectedCell(null);
    setSiteSearch("");
  };

  const handleResetSearch = () => {
    setSelectedSite(null);
    setSelectedCell(null);
    setSiteSearch("");

    dispatch(MapActions.setHighlightedCell(null));
    dispatch(MapActions.setSelectedCell(null));
  };

  /* ---------------- FILTER DATA ---------------- */

  const siteList = useMemo(
    () => [...new Set(rawCells.map((cell) => cell.site_name))],
    [rawCells]
  );

  const filteredSites = useMemo(
    () =>
      siteList.filter((site) =>
        site?.toLowerCase().includes(siteSearch.toLowerCase())
      ),
    [siteList, siteSearch]
  );

  const filteredCells = useMemo(
    () =>
      rawCells
        .filter(
          (cell) => cell.cell_id?.toLowerCase().includes(siteSearch.toLowerCase())
        )
        .slice(0, 50),
    [rawCells, siteSearch]
  );

  const handleApplySearch = () => {
    let target = null;

    if (searchMode === "site") {
      const nextSite = selectedSite || filteredSites[0];
      if (nextSite) {
        target = rawCells.find((cell) => cell.site_name === nextSite);
        setSelectedSite(nextSite);
        setSiteSearch(nextSite);
      }
    }

    if (searchMode === "cell") {
      const nextCell =
        selectedCell ||
        filteredCells.find((cell) =>
          cell.cell_id?.toLowerCase() === siteSearch.toLowerCase()
        ) ||
        filteredCells[0];

      if (nextCell) {
        target = nextCell;
        setSelectedCell(nextCell);
        setSiteSearch(nextCell.cell_id);
      }
    }

    if (!target) return;

    dispatch(MapActions.setHighlightedCell(target.cell_id));
    dispatch(
      MapActions.setViewState({
        longitude: Number(target.longitude),
        latitude: Number(target.latitude),
        zoom: searchMode === "cell" ? 18 : 16,
        transitionDuration: 1200,
      })
    );

    setOpenDropdown(null);
  };

  const showSearch = controls.includes("search");
  const showLayers = controls.includes("layers");
  const showMapStyle = controls.includes("mapStyle");
  const showFit = controls.includes("fit");
  const hasSearchValue = Boolean(siteSearch.trim() || selectedSite || selectedCell);
  const activeSearchResults = searchMode === "site" ? filteredSites : filteredCells;
  const shouldShowSearchResults = activeSearchResults.length > 0 || Boolean(siteSearch.trim());

  const groupClassName = vertical
    ? `flex flex-col gap-2 ${align === "right" ? "items-end" : "items-start"}`
    : "flex flex-wrap items-center gap-2";

  const sharedButtonClass =
    "h-[50px] min-w-[132px] justify-between gap-2 px-4 text-sm";
  const dropdownPlacementClass = align === "left" ? "left-0" : "right-0";

  /* ---------------- UI ---------------- */

  return (
    <div className={groupClassName}>
      {showLayers && (
        <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleDropdown("layers");
          }}
          className={`
            w-full md:w-auto
            rounded-lg
            border border-[#d5dce9]
            bg-white/95
            text-[#24314d]
            shadow-[0_12px_30px_rgba(15,23,42,0.14)]
            transition
            hover:bg-white
            flex items-center
            ${sharedButtonClass}
          `}
        >
          Add MapLayer <Unicons.UilAngleDown size={16} />
        </button>

        <div style={{ display: openDropdown === "layers" ? "block" : "none" }}>
          <AddMapLayersPanel onClose={() => setOpenDropdown(null)} />
        </div>
      </div>
      )}

      {showMapStyle && (
      <DropdownButton
        id="mapStyle"
        label="Map Style"
        openDropdown={openDropdown}
        toggleDropdown={toggleDropdown}
        buttonClassName={sharedButtonClass}
      >
        <div
          className={`absolute ${dropdownPlacementClass} z-50 mt-3 w-[280px] rounded-xl bg-white p-4 text-black shadow-xl`}
        >
          {[
            { label: "Outdoors", value: "outdoors" },
            { label: "Streets", value: "voyager" },
            { label: "OSM", value: "osm" },
            { label: "Satellite", value: "satellite" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => {
                dispatch(MapActions.setMapConfig({ mapView: option.value }));
                setOpenDropdown(null);
              }}
              className="px-2 py-1 hover:bg-gray-200 cursor-pointer text-sm"
            >
              {option.label}
            </div>
          ))}
        </div>
      </DropdownButton>
      )}

      {showSearch && (
        <div className="relative w-[320px] max-w-[90vw] sm:w-[380px]">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown("search");
            }}
            className="flex h-[50px] items-center gap-2 rounded-lg border border-[#d5dce9] bg-white/95 px-2 py-1.5 text-[#24314d] shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSearchMode();
                setOpenDropdown("search");
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9e1f0] bg-[#f4f7fc] px-2.5 text-sm font-medium text-[#24314d]"
            >
              {searchMode === "site" ? <Unicons.UilEstate size={16} /> : <Unicons.UilCell size={16} />}
              <span className="capitalize">{searchMode}</span>
            </button>

            <input
              type="text"
              value={siteSearch}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown("search");
              }}
              onFocus={() => setOpenDropdown("search")}
              onChange={(e) => {
                setSiteSearch(e.target.value);
                setOpenDropdown("search");
                if (searchMode === "site") {
                  setSelectedSite(null);
                } else {
                  setSelectedCell(null);
                }
              }}
              placeholder={`Search ${searchMode}`}
              className="min-w-0 flex-1 bg-transparent px-1.5 py-0 text-sm outline-none placeholder:text-[#98A2B3]"
            />

            {hasSearchValue ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetSearch();
                  setOpenDropdown("search");
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#667085] transition hover:bg-[#f5f7fb] hover:text-[#24314d]"
                title="Reset"
              >
                <Unicons.UilTimes size={15} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleApplySearch();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#2447c5] text-white transition hover:bg-[#1d3fb6]"
              title="Search"
            >
              <Unicons.UilSearch size={15} />
            </button>
          </div>

          {openDropdown === "search" && shouldShowSearchResults && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute ${dropdownPlacementClass} z-50 mt-3 w-full rounded-xl border border-[#e6ebf5] bg-white/98 p-3 text-black shadow-[0_24px_60px_rgba(15,23,42,0.18)]`}
            >
              <div className="max-h-56 overflow-y-auto rounded-lg border border-[#E4E7EC]">
                {searchMode === "site" &&
                  filteredSites.map((site, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedSite(site);
                        setSiteSearch(site);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[#F5F7FB] ${
                        selectedSite === site ? "bg-[#EEF4FF]" : ""
                      }`}
                    >
                      <Unicons.UilEstate size={15} />
                      <span>{site}</span>
                    </button>
                  ))}

                {searchMode === "cell" &&
                  filteredCells.map((cell, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedCell(cell);
                        setSiteSearch(cell.cell_id);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[#F5F7FB] ${
                        selectedCell?.cell_id === cell.cell_id ? "bg-[#EEF4FF]" : ""
                      }`}
                    >
                      <Unicons.UilCell size={15} />
                      <span>{cell.cell_id}</span>
                      <span className="text-xs text-[#667085]">({cell.site_name})</span>
                    </button>
                  ))}

                {searchMode === "site" && siteSearch.trim() && filteredSites.length === 0 && (
                  <div className="bg-white px-3 py-3 text-sm font-semibold text-[#24314d]">No result found</div>
                )}

                {searchMode === "cell" && siteSearch.trim() && filteredCells.length === 0 && (
                  <div className="bg-white px-3 py-3 text-sm font-semibold text-[#24314d]">No result found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showFit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFitToData();
          }}
          className={`
            w-full md:w-auto
            rounded-lg
            border border-[#2c4a85]
            bg-[#162a52]
            text-white
            transition
            hover:bg-[#1e3a70]
            flex items-center
            ${sharedButtonClass}
          `}
        >
          Fit View <Unicons.UilExpandArrows size={16} />
        </button>
      )}
    </div>
  );
};

export default RightFilters;
