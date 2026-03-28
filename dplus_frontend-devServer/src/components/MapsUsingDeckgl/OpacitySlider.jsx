import React from "react";
import { useDispatch, useSelector } from "react-redux";
import MapActions from "../../store/actions/map-actions";

const OpacitySlider = ({ layer }) => {

  const dispatch = useDispatch();

  const opacity = useSelector(
    state => state.map.layerOpacity[layer] ?? 1
  );

  return (
    <div className="mb-3 pt-3">

      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-500">
          Opacity
        </span>

        <span className="text-xs text-gray-600">
          {Math.round(opacity * 100)}%
        </span>
      </div>

      <input
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={opacity}
        onChange={(e) =>
          dispatch(
            MapActions.setLayerOpacity(
              layer,
              Number(e.target.value)
            )
          )
        }
        className="w-full"
      />

    </div>
  );
};

export default OpacitySlider;