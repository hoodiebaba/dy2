import React from "react";

const DropdownButton = ({
  id,
  label,
  openDropdown,
  toggleDropdown,
  children,
  containerClassName = "",
  buttonClassName = ""
}) => {

  const isOpen = openDropdown === id;

  return (
    <div className={`relative ${containerClassName}`}>

      {/* BUTTON */}
      <button
        // onClick={() => toggleDropdown(id)}
        onClick={(e) => {
          e.stopPropagation();  
          toggleDropdown(id);
        }}
        className={`
        w-full md:w-auto
        px-4 py-2
        bg-white/95
        hover:bg-white
        text-[#24314d] text-sm
        rounded-lg
        border border-[#d5dce9]
        shadow-[0_12px_30px_rgba(15,23,42,0.14)]
        transition
        min-w-[120px]
        flex items-center justify-center
        ${buttonClassName}
        `}
      >
        {label} ▾
      </button>

      {/* DROPDOWN */}
      {isOpen && children}

    </div>
  );
};

export default DropdownButton;
