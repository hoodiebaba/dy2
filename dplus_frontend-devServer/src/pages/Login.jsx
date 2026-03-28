import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, UserCircle2 } from "lucide-react";
import {
  SET_AUTHENTICATED,
  SET_COMMON_CONFIG,
  SET_PERMISSION,
  SET_TOKEN,
  SET_USER,
} from "../store/reducers/auth-reducer";
import { Sidebar_content } from "../utils/sidebar_values";
import AuthActions from "../store/actions/auth-actions";

const AUTH_KEY = "auth";
const AUTH_USER_KEY = "user";
const AUTHENTICATED_KEY = "authenticated";
const PASSWORD_STORAGE_KEY = "dy2-local-password";

function buildPermissionMap(items, permissionMap = {}) {
  items.forEach((item) => {
    if (!item?.link) {
      return;
    }

    if (Array.isArray(item.subMenu) && item.subMenu.length > 0) {
      permissionMap[item.link] = item.subMenu
        .map((child) => child?.link)
        .filter(Boolean);
      buildPermissionMap(item.subMenu, permissionMap);
      return;
    }

    permissionMap[item.link] = true;
  });

  return permissionMap;
}

function createStars(count, prefix, minSize, maxSize) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    top: `${Math.random() * 210 - 55}%`,
    left: `${Math.random() * 210 - 55}%`,
    size: Number((Math.random() * (maxSize - minSize) + minSize).toFixed(2)),
    opacity: Number((Math.random() * 0.78 + 0.18).toFixed(2)),
    duration: `${(Math.random() * 5 + 3.5).toFixed(2)}s`,
    delay: `${(Math.random() * 7).toFixed(2)}s`,
  }));
}

const planets = [
  {
    id: "mercury",
    size: 9,
    orbitSize: 450,
    duration: "16s",
    delay: "0s",
    tilt: "75deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #f5f5f4, #78716c 55%, #44403c)",
    glow: "0 0 18px rgba(245,245,244,0.35)",
  },
  {
    id: "venus",
    size: 14,
    orbitSize: 620,
    duration: "22s",
    delay: "-2s",
    tilt: "74deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #fde68a, #f59e0b 58%, #b45309)",
    glow: "0 0 22px rgba(245,158,11,0.38)",
  },
  {
    id: "earth",
    size: 15,
    orbitSize: 840,
    duration: "29s",
    delay: "-7s",
    tilt: "74deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #60a5fa, #38bdf8 42%, #22c55e 62%, #1d4ed8)",
    glow: "0 0 28px rgba(96,165,250,0.48)",
    moon: true,
  },
  {
    id: "mars",
    size: 11,
    orbitSize: 1050,
    duration: "37s",
    delay: "-3s",
    tilt: "73deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #fb7185, #ea580c 58%, #7c2d12)",
    glow: "0 0 18px rgba(234,88,12,0.38)",
  },
  {
    id: "jupiter",
    size: 30,
    orbitSize: 1350,
    duration: "51s",
    delay: "-9s",
    tilt: "73deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #fef3c7, #f59e0b 42%, #92400e 74%)",
    glow: "0 0 34px rgba(245,158,11,0.36)",
  },
  {
    id: "saturn",
    size: 26,
    orbitSize: 1650,
    duration: "66s",
    delay: "-12s",
    tilt: "72deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #fff7ed, #facc15 45%, #ca8a04 78%)",
    glow: "0 0 38px rgba(250,204,21,0.32)",
    ring: true,
    reverse: true,
  },
  {
    id: "uranus",
    size: 20,
    orbitSize: 1950,
    duration: "82s",
    delay: "-18s",
    tilt: "72deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #e0f2fe, #67e8f9 45%, #0ea5e9 76%)",
    glow: "0 0 30px rgba(103,232,249,0.3)",
  },
  {
    id: "neptune",
    size: 20,
    orbitSize: 2200,
    duration: "96s",
    delay: "-24s",
    tilt: "71deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #60a5fa, #4338ca 42%, #1e3a8a 78%)",
    glow: "0 0 32px rgba(67,56,202,0.3)",
    reverse: true,
  },
  {
    id: "pluto",
    size: 7,
    orbitSize: 2450,
    duration: "112s",
    delay: "-31s",
    tilt: "70deg",
    top: "50%",
    left: "50%",
    color: "linear-gradient(135deg, #e5e7eb, #9ca3af 65%, #6b7280)",
    glow: "0 0 14px rgba(229,231,235,0.3)",
  },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [inputsUnlocked, setInputsUnlocked] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const farStars = useMemo(() => createStars(260, "far", 0.7, 1.4), []);
  const midStars = useMemo(() => createStars(180, "mid", 1.1, 2.5), []);
  const nearStars = useMemo(() => createStars(120, "near", 2.2, 5.8), []);

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === "true") {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setError("");

    dispatch(
      AuthActions.signIn(
        {
          username: username.trim(),
          password,
        },
        () => {
          localStorage.setItem(PASSWORD_STORAGE_KEY, password);
          navigate("/home", { replace: true });
        }
      )
    );
  }

  return (
    <main
      className="login-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#02030a] px-4 py-8 text-white"
      style={{ fontFamily: '"DatayogQuantico", Arial, Helvetica, sans-serif', letterSpacing: "0.02em" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes orbit360 {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes orbit360Reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            @keyframes planetSpin {
              from { background-position: 0% 50%; }
              to { background-position: -240% 50%; }
            }
            @keyframes twinkle {
              0%,100% { opacity: .25; transform: scale(.76); }
              50% { opacity: 1; transform: scale(1.32); }
            }
            @keyframes cometFly {
              0% { transform: translate3d(0,0,0) rotate(-32deg); opacity: 0; }
              8% { opacity: 1; }
              100% { transform: translate3d(-1400px,900px,0) rotate(-32deg); opacity: 0; }
            }
            @keyframes cardFloat {
              0%,100% { transform: perspective(1400px) rotateX(0deg) rotateY(0deg) translateY(0px); }
              25% { transform: perspective(1400px) rotateX(1.3deg) rotateY(-2deg) translateY(-8px); }
              75% { transform: perspective(1400px) rotateX(-1.3deg) rotateY(2deg) translateY(6px); }
            }
            @keyframes cardGlow {
              0%,100% { box-shadow: 0 18px 60px rgba(0,0,0,.7); }
              50% { box-shadow: 0 24px 80px rgba(0,0,0,.8), 0 0 30px rgba(59,130,246,.08); }
            }
            @keyframes logoFloat {
              0%,100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 0 22px rgba(242,101,34,.22)); }
              50% { transform: translateY(-7px) scale(1.03); filter: drop-shadow(0 0 40px rgba(242,101,34,.55)); }
            }
            @keyframes inputPulse {
              0%,100% { box-shadow: 0 0 0 rgba(242,101,34,0); }
              50% { box-shadow: 0 0 24px rgba(242,101,34,.12); }
            }
            @keyframes sunPulse {
              0%,100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.06); }
            }
            @keyframes orbitFlash {
              0%,100% { opacity: .12; }
              50% { opacity: .38; }
            }
            @keyframes moonOrbit {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .nebula-bg {
              background:
                radial-gradient(circle at 18% 78%, rgba(168,85,247,0.22), transparent 18%),
                radial-gradient(circle at 82% 24%, rgba(59,130,246,0.26), transparent 22%),
                radial-gradient(circle at 50% 14%, rgba(255,255,255,0.06), transparent 18%),
                radial-gradient(ellipse at center, rgba(18,24,66,0.84) 0%, rgba(14,17,42,0.84) 26%, rgba(4,7,18,0.98) 76%, #02030a 100%);
            }
            .planet-surface {
              background:
                repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 4%, transparent 10%),
                linear-gradient(135deg, rgba(255,255,255,.16), transparent 45%),
                var(--planet-color);
              background-size: 240% 100%, 100% 100%, 100% 100%;
              animation: planetSpin var(--spin-duration, 18s) linear infinite;
            }
            .login-shell input {
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
              caret-color: #ffffff;
              font-family: inherit;
            }
            .login-shell input::placeholder {
              color: #64748b !important;
              -webkit-text-fill-color: #64748b !important;
              opacity: 1;
            }
            .login-shell input:-webkit-autofill,
            .login-shell input:-webkit-autofill:hover,
            .login-shell input:-webkit-autofill:focus,
            .login-shell input:-webkit-autofill:active {
              -webkit-text-fill-color: #ffffff !important;
              caret-color: #ffffff;
              border: 1px solid rgba(255,255,255,0.05) !important;
              -webkit-box-shadow: 0 0 0 1000px rgba(3,6,18,0.92) inset !important;
              box-shadow: 0 0 0 1000px rgba(3,6,18,0.92) inset !important;
              transition: background-color 999999s ease-in-out 0s;
              background-clip: content-box !important;
            }
            .login-shell input::selection {
              background: rgba(242,101,34,0.32);
            }
          `,
        }}
      />

      <div className="nebula-bg pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_16%),radial-gradient(circle_at_14%_84%,rgba(242,101,34,0.09),transparent_18%),radial-gradient(circle_at_88%_38%,rgba(59,130,246,0.14),transparent_24%)]" />

        <div
          className="absolute left-1/2 top-1/2 h-[240vh] w-[240vw] -translate-x-1/2 -translate-y-1/2 opacity-55"
          style={{ animation: "orbit360 280s linear infinite" }}
        >
          {mounted &&
            farStars.map((star) => (
              <span
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                }}
              />
            ))}
        </div>

        <div
          className="absolute left-1/2 top-1/2 h-[240vh] w-[240vw] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "orbit360Reverse 190s linear infinite" }}
        >
          {mounted &&
            midStars.map((star) => (
              <span
                key={star.id}
                className="absolute rounded-full bg-[#dbeafe]"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  boxShadow: "0 0 12px rgba(255,255,255,0.38)",
                  animation: `twinkle ${star.duration} ease-in-out infinite`,
                  animationDelay: star.delay,
                }}
              />
            ))}
        </div>

        <div
          className="absolute left-1/2 top-1/2 h-[240vh] w-[240vw] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "orbit360 124s linear infinite" }}
        >
          {mounted &&
            nearStars.map((star) => (
              <span
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  boxShadow:
                    star.size > 4
                      ? "0 0 24px rgba(255,255,255,0.95)"
                      : "0 0 14px rgba(255,255,255,0.75)",
                  animation: `twinkle ${star.duration} ease-in-out infinite`,
                  animationDelay: star.delay,
                }}
              />
            ))}
        </div>

        <svg
          className="absolute inset-0 h-full w-full opacity-55"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <g stroke="rgba(255,255,255,0.14)" strokeWidth="0.08" fill="none">
            <polyline points="9,14 14,12 18,16 23,13" />
            <polyline points="78,11 82,8 87,13 92,10" />
            <polyline points="12,72 18,69 22,74 28,71" />
          </g>
          <g fill="white">
            <circle cx="83" cy="9" r="0.48" />
            <circle cx="18" cy="16" r="0.34" />
            <circle cx="22" cy="74" r="0.34" />
          </g>
        </svg>

        <div className="absolute left-[50%] top-[50%]">
          <div
            className="absolute left-1/2 top-1/2 h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#ffe8bf] via-[#F26522] to-[#7f2700] shadow-[0_0_120px_rgba(242,101,34,0.95)]"
            style={{ animation: "sunPulse 5.5s ease-in-out infinite" }}
          >
            <div
              className="absolute inset-[-42px] rounded-full border border-[#F26522]/18"
              style={{ animation: "orbitFlash 4.8s ease-in-out infinite" }}
            />
            <div
              className="absolute inset-[-90px] rounded-full border border-[#fb923c]/10"
              style={{ animation: "orbitFlash 6.2s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div className="absolute inset-0 opacity-[0.86]" style={{ mixBlendMode: "screen" }}>
          <div
            className="absolute left-[-10%] top-[36%] h-[32rem] w-[32rem] rounded-full"
            style={{ background: "rgba(162, 28, 175, 0.24)", filter: "blur(130px)" }}
          />
          <div
            className="absolute right-[-10%] top-[18%] h-[40rem] w-[40rem] rounded-full"
            style={{ background: "rgba(37, 99, 235, 0.24)", filter: "blur(150px)" }}
          />
          <div
            className="absolute left-[26%] top-[2%] h-[24rem] w-[24rem] rounded-full"
            style={{ background: "rgba(139, 92, 246, 0.16)", filter: "blur(120px)" }}
          />
          <div
            className="absolute bottom-[-12%] left-[34%] h-[28rem] w-[28rem] rounded-full"
            style={{ background: "rgba(242, 101, 34, 0.12)", filter: "blur(150px)" }}
          />
        </div>

        <div
          className="absolute left-[72%] top-[8%] h-[2px] w-[180px] origin-top bg-gradient-to-r from-white via-cyan-200 to-transparent opacity-0"
          style={{ animation: "cometFly 9s linear infinite", animationDelay: "1.8s" }}
        />
        <div
          className="absolute left-[86%] top-[26%] h-[2px] w-[130px] origin-top bg-gradient-to-r from-white via-indigo-200 to-transparent opacity-0"
          style={{ animation: "cometFly 11s linear infinite", animationDelay: "5.6s" }}
        />

        {planets.map((planet) => (
          <div
            key={planet.id}
            className="absolute"
            style={{
              top: planet.top,
              left: planet.left,
              width: `${planet.orbitSize}px`,
              height: `${planet.orbitSize}px`,
              marginLeft: `${planet.orbitSize / -2}px`,
              marginTop: `${planet.orbitSize / -2}px`,
              animation: `${planet.reverse ? "orbit360Reverse" : "orbit360"} ${planet.duration} linear infinite`,
              animationDelay: planet.delay,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-full border border-white/[0.06]"
              style={{
                transform: `rotateX(${planet.tilt}) rotateY(-18deg)`,
                animation: "orbitFlash 10s ease-in-out infinite",
              }}
            />
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{ transform: `translateY(-${planet.size / 2}px)` }}
            >
              <div
                className="planet-surface relative rounded-full"
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  "--planet-color": planet.color,
                  "--spin-duration": `${Math.max(12, planet.size)}s`,
                  boxShadow: planet.glow,
                }}
              >
                <div className="absolute inset-[18%] rounded-full bg-white/12 blur-[2px]" />
                {planet.ring ? (
                  <div
                    className="absolute left-1/2 top-1/2 h-[36%] w-[190%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35"
                    style={{
                      transform: "translate(-50%, -50%) rotateX(76deg) rotateY(-16deg)",
                      boxShadow: "0 0 12px rgba(255,255,255,0.16)",
                    }}
                  />
                ) : null}
                {planet.moon ? (
                  <div
                    className="absolute left-1/2 top-1/2 h-[230%] w-[230%] -translate-x-1/2 -translate-y-1/2"
                    style={{ animation: "moonOrbit 4s linear infinite" }}
                  >
                    <div className="absolute right-[-2px] top-1/2 h-[4px] w-[4px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95)]" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[28px]"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.06), transparent 28%, transparent 72%, rgba(242,101,34,0.06))",
          }}
        />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-10 right-0 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Datayog Logo"
              className="mb-5 h-16 w-auto object-contain sm:h-20"
            />
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[2rem]">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="portal-decoy-user"
              autoComplete="username"
              tabIndex={-1}
              className="hidden"
            />
            <input
              type="password"
              name="portal-decoy-password"
              autoComplete="current-password"
              tabIndex={-1}
              className="hidden"
            />
            <div
              className="group relative overflow-hidden rounded-[20px] p-1"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <UserCircle2 className="h-5 w-5 text-[#F26522] transition-transform duration-300 group-focus-within:scale-110" />
              </div>
              <input
                id="username"
                name="portal_username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onFocus={() => setInputsUnlocked(true)}
                onPointerDown={() => setInputsUnlocked(true)}
                readOnly={!inputsUnlocked}
                type="text"
                placeholder="Username"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  backgroundColor: "rgba(3, 6, 18, 0.72)",
                }}
                className="w-full rounded-[16px] border border-white/5 bg-[#030612]/72 py-5 pl-12 pr-4 text-white placeholder-slate-500 shadow-inner transition-all duration-300 focus:border-[#F26522]/60 focus:bg-[#030612]/92 focus:outline-none focus:ring-1 focus:ring-[#F26522]/60"
              />
              <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F26522]/55 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>

            <div
              className="group relative overflow-hidden rounded-[20px] p-1"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <LockKeyhole className="h-5 w-5 text-[#F26522] transition-transform duration-300 group-focus-within:scale-110" />
              </div>
              <input
                id="password"
                name="portal_password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setInputsUnlocked(true)}
                onPointerDown={() => setInputsUnlocked(true)}
                readOnly={!inputsUnlocked}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                spellCheck={false}
                autoCapitalize="none"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  backgroundColor: "rgba(3, 6, 18, 0.72)",
                }}
                className="w-full rounded-[16px] border border-white/5 bg-[#030612]/72 py-5 pl-12 pr-12 text-white placeholder-slate-500 shadow-inner transition-all duration-300 focus:border-[#F26522]/60 focus:bg-[#030612]/92 focus:outline-none focus:ring-1 focus:ring-[#F26522]/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center pr-5 text-[#F26522]/82 transition-colors hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F26522]/55 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-md">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#F26522] to-[#e0520d] px-4 py-3.5 text-base font-semibold tracking-wide text-white shadow-[0_14px_34px_rgba(242,101,34,0.35)] transition-all duration-300 hover:shadow-[0_18px_44px_rgba(242,101,34,0.5)] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Sign In
              </span>
              <div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.45s_infinite]" />
            </button>
          </form>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer { 100% { transform: translateX(100%); } }
          `,
        }}
      />
    </main>
  );
}
