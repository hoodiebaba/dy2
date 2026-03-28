import React from "react";

const Layout = ({ child }) => {
  return (
    <div className="h-full min-h-0 w-full overflow-y-auto bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)]">
      {child}
    </div>
  );
};

export default Layout;
