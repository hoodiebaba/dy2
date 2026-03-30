"use client";

import { useEffect, useRef, useState } from "react";
import { Edit3, Eye, EyeOff, KeyRound, Mail, Phone, Save, ShieldCheck, User, UserCircle2 } from "lucide-react";
import { getStoredPassword, readProfile, saveProfile, setStoredPassword } from "../../../lib/portal-auth";

export default function ProfilePage() {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(() => readProfile());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPasswordLocked, setCurrentPasswordLocked] = useState(true);
  const [newPasswordLocked, setNewPasswordLocked] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  const handleChange = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, avatar: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const storedPassword = getStoredPassword() || "";
    const updatedProfile = {
      ...profile,
      fullName: profile.fullName.trim() || "Datayog User",
      username: profile.username.trim() || "admin",
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    let nextPassword = storedPassword;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        setStatus("Enter current and new password.");
        return;
      }

      if (storedPassword && currentPassword !== storedPassword) {
        setStatus("Current password is incorrect.");
        return;
      }

      nextPassword = newPassword;
    }

    saveProfile(updatedProfile);
    setStoredPassword(nextPassword);
    setStatus("Profile updated locally.");
    setCurrentPassword("");
    setNewPassword("");
    window.setTimeout(() => setStatus(""), 2200);
  };

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.username || "Datayog User")}&background=F26522&color=fff&size=200`;

  return (
    <div className="h-full w-full animate-in fade-in slide-in-from-bottom-4 p-4 duration-500 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <section className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(9,0,26,0.94)_0%,rgba(10,18,64,0.94)_50%,rgba(7,18,36,0.96)_100%)] px-6 py-8 shadow-[0_24px_80px_rgba(3,8,24,0.45)] sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,101,34,0.16),transparent_22%),radial-gradient(circle_at_right,rgba(59,130,246,0.18),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative h-28 w-28 overflow-visible rounded-[22px] border border-[#F26522]/30 bg-[#080F22] shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
                <img
                  src={profile?.avatar || "/user.png"}
                  alt={profile?.fullName}
                  className="h-full w-full rounded-[22px] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = avatarFallback;
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#081224] text-white/90 transition-all hover:bg-[#0d1730] hover:text-white"
                  title="Edit profile image"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#F26522]">Profile</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-[0.02em] text-white">
                  {profile?.fullName || "Datayog User"}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/60">
                  <ShieldCheck className="h-4 w-4 text-[#F26522]" />
                  {String(profile?.title || "Admin").toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl border border-[#F26522]/35 bg-[#F26522]/15 px-4 py-2.5 text-sm font-semibold text-[#F26522] transition-all hover:bg-[#F26522]/20"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {status ? <span className="text-sm text-white/55">{status}</span> : null}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </section>

        <section className="w-full rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(9,0,26,0.94)_0%,rgba(10,18,64,0.94)_50%,rgba(7,18,36,0.96)_100%)] p-6 shadow-[0_24px_80px_rgba(3,8,24,0.45)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-[0.02em] text-white">Account Settings</h2>
          </div>

          <div className="hidden">
            <input type="text" autoComplete="username" />
            <input type="password" autoComplete="current-password" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <UserCircle2 className="h-4 w-4 text-[#F26522]" />
                Full Name
              </span>
              <input type="text" value={profile?.fullName || ""} onChange={(e) => handleChange("fullName", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7" placeholder="Enter full name" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <User className="h-4 w-4 text-[#F26522]" />
                Username
              </span>
              <input type="text" value={profile?.username || ""} onChange={(e) => handleChange("username", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7" placeholder="Enter username" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <Mail className="h-4 w-4 text-[#F26522]" />
                Email ID
              </span>
              <input type="email" value={profile?.email || ""} onChange={(e) => handleChange("email", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7" placeholder="Enter email address" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <Phone className="h-4 w-4 text-[#F26522]" />
                Mobile Number
              </span>
              <input type="tel" value={profile?.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7" placeholder="Enter phone number" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <KeyRound className="h-4 w-4 text-[#F26522]" />
                Current Password
              </span>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="profile_current_password_field"
                  autoComplete="new-password"
                  readOnly={currentPasswordLocked}
                  onFocus={() => setCurrentPasswordLocked(false)}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#F26522]" aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}>
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                <KeyRound className="h-4 w-4 text-[#F26522]" />
                New Password
              </span>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="profile_new_password_field"
                  autoComplete="new-password"
                  readOnly={newPasswordLocked}
                  onFocus={() => setNewPasswordLocked(false)}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#F26522]/45 focus:bg-white/7"
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#F26522]" aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
