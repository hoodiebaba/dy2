"use client";

const AUTH_KEY = "auth";
const AUTHENTICATED_KEY = "authenticated";
const USER_KEY = "user";
const PROFILE_KEY = "dy2-profile";
const PASSWORD_KEY = "dy2-local-password";

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getApiBase = () => {
  if (typeof window === "undefined") return "http://127.0.0.1:8060";
  return `http://${window.location.hostname}:8060`;
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
};

export const readUser = () => {
  if (typeof window === "undefined") return null;
  return parseJson(localStorage.getItem(USER_KEY), null);
};

export const readProfile = () => {
  if (typeof window === "undefined") return null;
  const savedProfile = parseJson(localStorage.getItem(PROFILE_KEY), {});
  const savedUser = readUser() || {};
  const fullName =
    savedProfile.fullName ||
    [savedUser.firstname, savedUser.lastname].filter(Boolean).join(" ").trim() ||
    savedUser.username ||
    "Datayog User";

  return {
    fullName,
    username: savedProfile.username || savedUser.username || "admin",
    email: savedProfile.email || savedUser.email || "",
    phone: savedProfile.phone || savedUser.phone || "",
    title: savedProfile.title || savedUser.rolename || "Admin",
    avatar: savedProfile.avatar || savedUser.profileImage || "",
  };
};

export const saveProfile = (profile) => {
  if (typeof window === "undefined") return;
  const savedUser = readUser() || {};
  const [firstname, ...restNames] = (profile.fullName || "").split(" ").filter(Boolean);
  const updatedUser = {
    ...savedUser,
    username: profile.username,
    firstname: firstname || profile.username,
    lastname: restNames.join(" "),
    email: profile.email,
    phone: profile.phone,
    profileImage: profile.avatar,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  window.dispatchEvent(new CustomEvent("dy2-profile-updated", { detail: profile }));
};

export const getStoredPassword = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PASSWORD_KEY) || "";
};

export const setStoredPassword = (password) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASSWORD_KEY, password);
};

export const signOut = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTHENTICATED_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("permission");
  localStorage.removeItem("config");
  window.location.replace("/login");
};

export async function loginRequest({ username, password }) {
  const response = await fetch(`${getApiBase()}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify({ username, password }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.status === 400) {
    throw new Error(payload?.msg || "Please Use Valid Credentials");
  }

  const user = payload?.data || payload;
  const confdata = user?.confdata || {};

  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("token", user?.idToken || "");
    localStorage.setItem("permission", JSON.stringify(user?.permission || {}));
    localStorage.setItem("config", JSON.stringify(confdata));
    localStorage.setItem(AUTH_KEY, "true");
    localStorage.setItem(AUTHENTICATED_KEY, "true");
    localStorage.setItem(PASSWORD_KEY, password);
  }

  return user;
}
