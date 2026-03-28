import React, { cloneElement, isValidElement, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const MenuItem = ({ itm, sidebarOpen, permission = {}, checkp, parenting, depth = 0 }) => {
  const { pathname } = useLocation();
  const isActive = itm.link === pathname;
  const hasChildren = Array.isArray(itm.subMenu) && itm.subMenu.length > 0;
  const hasActiveDescendant = useMemo(() => {
    const findActiveDescendant = (items = []) =>
      items.some((child) => child.link === pathname || findActiveDescendant(child.subMenu));

    return findActiveDescendant(itm.subMenu);
  }, [itm.subMenu, pathname]);
  const [open, setOpen] = useState(hasActiveDescendant);

  const canRender =
    !checkp ||
    (checkp &&
      (itm.link === parenting
        ? permission[parenting]
        : permission[parenting] && permission[parenting].indexOf(itm.link) !== -1));

  useEffect(() => {
    if (hasActiveDescendant) {
      setOpen(true);
    }
  }, [hasActiveDescendant]);

  if (!canRender) {
    return null;
  }

  const isNested = depth > 0;

  const renderIcon = (highlighted) => {
    if (!isValidElement(itm.icon)) {
      return itm.icon;
    }

    return cloneElement(itm.icon, {
      className: `h-5 w-5 shrink-0 transition-all duration-200 ${
        highlighted ? "text-[#F26522]" : "text-white/75 group-hover:text-[#F26522]"
      }`,
    });
  };

  if (isNested) {
    const isBranchActive = isActive || open || hasActiveDescendant;

    if (hasChildren) {
      return (
        <li>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] transition-all duration-200 ${
              isBranchActive
                ? "bg-white/8 text-[#F26522]"
                : "text-white/55 hover:bg-white/5 hover:pl-4 hover:text-white"
            }`}
          >
            <span className="min-w-0 flex-1 truncate text-left">{itm.name}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-all duration-300 ${
                open ? "rotate-180 text-[#F26522]" : "text-white/45"
              }`}
            />
          </button>

          {open ? (
            <ul className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
              {itm.subMenu.map((nestedItm) => (
                <MenuItem
                  key={nestedItm.link}
                  itm={nestedItm}
                  sidebarOpen={sidebarOpen}
                  permission={permission}
                  checkp={checkp}
                  parenting={itm.link}
                  depth={depth + 1}
                />
              ))}
            </ul>
          ) : null}
        </li>
      );
    }

    return (
      <li>
        <Link
          to={itm.link}
          state={{ name: itm.name }}
          className={`block rounded-lg px-3 py-2 text-[12.5px] transition-all duration-200 ${
            isActive
              ? "bg-white/8 text-[#F26522]"
              : "text-white/55 hover:bg-white/5 hover:pl-4 hover:text-white"
          }`}
        >
          {itm.name}
        </Link>
      </li>
    );
  }

  if (hasChildren) {
    const isBranchActive = isActive || open || hasActiveDescendant;

    return (
      <li className="rounded-xl">
        <div
          className={`
            group flex w-full items-center rounded-xl border transition-all duration-200
            ${sidebarOpen ? "justify-between px-3 py-3 ml-2 mr-3" : "justify-center px-2 py-3 ml-2 mr-3"}
            ${
              isBranchActive
                ? "border-[#F26522]/30 bg-[#F26522]/12 text-white"
                : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
            }
          `}
        >
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={`flex min-w-0 flex-1 items-center ${
              sidebarOpen ? "gap-3 text-left" : "justify-center"
            }`}
          >
            {renderIcon(isBranchActive)}
            {sidebarOpen ? (
              <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium tracking-[0.01em]">
                {itm.name}
              </span>
            ) : null}
          </button>

          {sidebarOpen ? (
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition-all duration-200 hover:bg-white/5 hover:text-white/80"
              aria-label={open ? `Collapse ${itm.name}` : `Expand ${itm.name}`}
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                  open ? "rotate-180 text-[#F26522]" : "text-white/45 group-hover:text-white/80"
                }`}
              />
            </button>
          ) : null}
        </div>

        {sidebarOpen && open && Array.isArray(itm.subMenu) && itm.subMenu.length > 0 ? (
          <ul className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-3">
            {itm.subMenu.map((nestedItm) => (
              <MenuItem
                key={nestedItm.link}
                itm={nestedItm}
                sidebarOpen={sidebarOpen}
                permission={permission}
                checkp={checkp}
                parenting={itm.link}
                depth={depth + 1}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li className="relative">
      <Link
        to={itm.link}
        state={{ name: itm.name }}
        className={`
          group flex items-center gap-3 rounded-xl border transition-all duration-200
          ${sidebarOpen ? "px-3 py-3 ml-2 mr-3" : "justify-center px-2 py-3 ml-2 mr-3"}
          ${
            isActive
              ? "border-[#F26522]/30 bg-[#F26522]/12 text-white shadow-[inset_0_0_0_1px_rgba(242,101,34,0.08)]"
              : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
          }
        `}
      >
        {renderIcon(isActive)}
        {sidebarOpen ? (
          <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium tracking-[0.01em]">
            {itm.name}
          </span>
        ) : null}
      </Link>
    </li>
  );
};

export default MenuItem;
