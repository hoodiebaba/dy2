import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import CommonActions from "../store/actions/common-actions";
import TelecomMap from "../components/MapsUsingDeckgl/TelecomMap";
import MapActions from "../store/actions/map-actions";
import LeftFilters from "../components/MapsUsingDeckgl/LeftFilters";
import RightFilters from "../components/MapsUsingDeckgl/RightFilters";

const TelecomMapsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(CommonActions.setLastName(true, "GIS Engine"));
    dispatch(MapActions.getBoundaryGroups()).then(() => {
      dispatch(MapActions.getUserMapSetup());
    });
    dispatch(MapActions.getMultiVendorCells({}));
    dispatch(MapActions.getTelecomFilterMeta());
    dispatch(MapActions.getTelecomTechMeta());
    dispatch(MapActions.getRfPredictionFilters());
  }, [dispatch]);

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)]">
      <div className="h-full min-h-0 w-full">
        <TelecomMap operator="Huawei" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 sm:p-5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <RightFilters controls={["search"]} align="left" />
          <LeftFilters />
          <RightFilters controls={["layers"]} align="left" />
        </div>
      </div>
    </div>
  );
};

export default TelecomMapsPage;
