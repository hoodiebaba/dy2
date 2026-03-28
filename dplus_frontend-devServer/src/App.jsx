import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Navigation from "./Navigation";
import SweetAlerts from "./components/SweetAlerts";
import Loaders from "./components/Loaders";
import PortalHeader from "./components/PortalHeader";
import Sidebar from "./components/Sidebar";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/login" && localStorage.getItem("auth") === "true") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
        <Loaders />
        <SweetAlerts />
      </>
    );
  }

  return (
    <main
      className="flex h-screen overflow-hidden bg-[#071224] text-white"
      style={{ fontFamily: '"DatayogQuantico", Arial, Helvetica, sans-serif', letterSpacing: "0.02em" }}
    >
      <Routes>
        <Route
          path="*"
          element={
            <div className="flex h-full w-full flex-col overflow-hidden">
              <PortalHeader
                isSidebarOpen={isSidebarOpen}
                onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
              />

              <div className="flex min-h-0 flex-1 overflow-hidden">
                <Sidebar
                  sidebarOpen={isSidebarOpen}
                  sidebarPos="v"
                  setSidebarPos={() => {}}
                />

                <div className="flex min-h-0 flex-1 overflow-hidden border border-white/10 border-l border-l-white/10 bg-[linear-gradient(180deg,#0C1931_0%,#0B1730_100%)] shadow-[-1px_0_0_rgba(255,255,255,0.06)]">
                  <Navigation
                    sidebarOpen={isSidebarOpen}
                    sidebarPos="v"
                    setSidebarPos={() => {}}
                  />
                </div>
              </div>
            </div>
          }
        />
      </Routes>

      <Loaders />
      <SweetAlerts />
    </main>
  );
}

export default App;
