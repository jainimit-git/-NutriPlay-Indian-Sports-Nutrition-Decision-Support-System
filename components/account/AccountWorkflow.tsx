"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, Printer, UserRound, LogOut, RefreshCw } from "lucide-react";
import { SPORTS_REGISTRY } from "@/data/reference/sportsData";
import { AthleteSummaryCard } from "@/components/dashboard/AthleteSummaryCard";
import { VisualisationSection } from "@/components/dashboard/VisualisationSection";
import { MealPlanCard } from "@/components/dashboard/MealPlanCard";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { SafetyAlertCard } from "@/components/dashboard/SafetyAlertCard";
import { ExplanationsCard } from "@/components/dashboard/ExplanationsCard";
import {
  athletePersonalProfileSchema,
  trainingSessionSchema,
  ValidatedAthletePersonalProfile,
  ValidatedTrainingSession,
} from "@/lib/validation/athleteSchema";
import { DietaryPreference, TrainingIntensity, TrainingTimeOfDay } from "@/lib/types/athlete";
import { DecisionSupportOutput } from "@/lib/recommendations/recommendationService";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  hasProfile: boolean;
}

type ProfileDraft = Omit<ValidatedAthletePersonalProfile, "age" | "sex" | "heightCm" | "weightKg"> & {
  age: number | "";
  sex: "" | "male" | "female";
  heightCm: number | "";
  weightKg: number | "";
};

interface SavedProfile {
  profile: ValidatedAthletePersonalProfile;
  createdAt: string;
  updatedAt: string;
}

interface SessionFormValues extends Omit<ValidatedTrainingSession, "sport"> {
  sport: string;
  customSport: string;
}

const initialSession = (): SessionFormValues => ({
  sport: "cricket",
  customSport: "",
  trainingDurationMinutes: 90,
  trainingIntensity: "moderate",
  trainingFrequencyDaysPerWeek: 5,
  dailyBudgetInr: 350,
  location: "",
  trainingDate: new Date().toISOString().slice(0, 10),
  trainingType: "practice",
  trainingTimeOfDay: "morning",
});

async function responseJson<T>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Please retry.");
  }
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : "The request could not be completed.";
    throw new Error(message);
  }
  return body as T;
}

function FieldError({ children }: { children?: string }) {
  return children ? <p className="mt-1 text-xs text-rose-600">{children}</p> : null;
}

function AuthPanel({ onAuthenticated }: { onAuthenticated: (user: SessionUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name, email, password }),
      });
      const result = await responseJson<{ user: SessionUser }>(response);
      onAuthenticated(result.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not authenticate.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Activity className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your training. Your nutrition.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in or create an account to save your athlete profile and build a plan for each training day.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Account access">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          onClick={() => { setMode("register"); setError(""); }}
          className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600"}`}
        >
          Create an account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => { setMode("login"); setError(""); }}
          className={`rounded-md px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600"}`}
        >
          Sign in
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            required
            type="password"
            minLength={12}
            maxLength={128}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
          />
          {mode === "register" && <span className="mt-1 block text-xs text-slate-500">Use at least 12 characters.</span>}
        </label>
        {mode === "register" && (
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <input
              required
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
        )}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "register" ? "Create account and continue" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
        Your password is stored as a salted hash. Athlete information is saved separately from account credentials.
      </p>
    </section>
  );
}

function ProfileEditor({
  initialProfile,
  accountName,
  updatedAt,
  onSave,
  onCancel,
  isOnboarding,
}: {
  initialProfile: ProfileDraft;
  accountName: string;
  updatedAt?: string;
  onSave: (profile: ValidatedAthletePersonalProfile) => Promise<void>;
  onCancel?: () => void;
  isOnboarding: boolean;
}) {
  const [profile, setProfile] = useState<ProfileDraft>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setProfile(initialProfile), [initialProfile]);

  const change = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => setProfile((previous) => ({ ...previous, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = athletePersonalProfileSchema.safeParse(profile);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    setErrors({});
    setError("");
    setBusy(true);
    try {
      await onSave(parsed.data);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  const exclusionOptions = ["milk", "peanuts", "tree_nuts", "soy", "gluten", "fish", "egg"];

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {isOnboarding ? "Athlete profile · setup" : "Athlete profile · management"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          {isOnboarding ? `Welcome, ${accountName}` : "Your athlete profile"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          These saved details personalize future plans. Update your weight and food restrictions whenever they change.
        </p>
        {updatedAt && (
          <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(updatedAt).toLocaleString()}</p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Athlete name
            <input required value={profile.name} onChange={(event) => change("name", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError>{errors.name}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Age (years)
            <input required type="number" min={14} max={85} value={profile.age} onChange={(event) => change("age", event.target.value ? Number(event.target.value) : "")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError>{errors.age}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Height (cm)
            <input required type="number" min={120} max={235} value={profile.heightCm} onChange={(event) => change("heightCm", event.target.value ? Number(event.target.value) : "")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError>{errors.heightCm}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Current body weight (kg)
            <input required type="number" step="0.1" min={35} max={200} value={profile.weightKg} onChange={(event) => change("weightKg", event.target.value ? Number(event.target.value) : "")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <FieldError>{errors.weightKg}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Sex used by the current physiological method
            <select value={profile.sex} onChange={(event) => change("sex", event.target.value as ProfileDraft["sex"])} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="">Select the relevant input</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <span className="mt-1 block text-xs font-normal text-slate-500">
              The current Mifflin–St Jeor equation and ICMR iron/calcium references require this input. NutriPlay does not infer it; if you cannot provide it, do not guess—the current calculation method cannot produce an individualized energy estimate.
            </span>
            <FieldError>{errors.sex}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Dietary preference
            <select value={profile.dietaryPreference} onChange={(event) => change("dietaryPreference", event.target.value as DietaryPreference)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="jain">Jain</option>
            </select>
            <FieldError>{errors.dietaryPreference}</FieldError>
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">Allergies and foods to exclude</legend>
          <p className="mb-3 mt-1 text-xs text-slate-500">Known food-data tags are enforced as plan filters. Check ingredient labels when a food is not fully verified.</p>
          <div className="flex flex-wrap gap-2">
            {exclusionOptions.map((item) => {
              const selected = profile.dietaryExclusions.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => change(
                    "dietaryExclusions",
                    selected ? profile.dietaryExclusions.filter((value) => value !== item) : [...profile.dietaryExclusions, item]
                  )}
                  className={`rounded-full border px-3 py-1.5 text-xs ${selected ? "border-rose-300 bg-rose-50 font-semibold text-rose-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  {selected ? "Exclude " : "+ "}{item.replace("_", " ")}
                </button>
              );
            })}
          </div>
          <FieldError>{errors.dietaryExclusions}</FieldError>
        </fieldset>

        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>}
          <button type="submit" disabled={busy} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            {busy ? "Saving profile…" : isOnboarding ? "Save profile and continue" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function SessionForm({
  initialValues,
  onSubmit,
  isLoading,
}: {
  initialValues: SessionFormValues;
  onSubmit: (session: ValidatedTrainingSession) => Promise<void>;
  isLoading: boolean;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  useEffect(() => setValues(initialValues), [initialValues]);

  const change = <K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const chosenSport = values.sport === "other" ? values.customSport : values.sport;
    const parsed = trainingSessionSchema.safeParse({ ...values, sport: chosenSport });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { next[String(issue.path[0])] = issue.message; });
      setErrors(next);
      return;
    }
    setErrors({});
    setError("");
    try {
      await onSubmit(
        parsed.data.trainingType === "rest_day"
          ? { ...parsed.data, trainingIntensity: "rest", trainingDurationMinutes: 0 }
          : parsed.data
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not generate a plan.");
    }
  };

  const fieldClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm";
  const options = Object.entries(SPORTS_REGISTRY);

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Current training session</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Plan your training day</h1>
        <p className="mt-2 text-sm text-slate-600">Your saved profile is loaded automatically. Enter only details that can change for this session.</p>
      </div>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Sport
            <select value={values.sport} onChange={(event) => change("sport", event.target.value)} className={fieldClass}>
              {options.map(([key, sport]) => <option key={key} value={key}>{sport.label}</option>)}
              <option value="other">Other sport</option>
            </select>
            <FieldError>{errors.sport}</FieldError>
          </label>
          {values.sport === "other" && (
            <label className="text-sm font-medium text-slate-700">
              Sport name
              <input required minLength={2} maxLength={80} value={values.customSport} onChange={(event) => change("customSport", event.target.value)} className={fieldClass} placeholder="e.g. squash" />
            </label>
          )}
          <label className="text-sm font-medium text-slate-700">
            Training date
            <input type="date" required value={values.trainingDate} onChange={(event) => change("trainingDate", event.target.value)} className={fieldClass} />
            <FieldError>{errors.trainingDate}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Session type
            <select value={values.trainingType} onChange={(event) => change("trainingType", event.target.value as ValidatedTrainingSession["trainingType"])} className={fieldClass}>
              <option value="practice">Practice</option>
              <option value="match">Match</option>
              <option value="competition">Competition</option>
              <option value="recovery">Recovery</option>
              <option value="rest_day">Rest day</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Duration (minutes)
            <input type="number" min={0} max={360} step={15} required value={values.trainingDurationMinutes} onChange={(event) => change("trainingDurationMinutes", Number(event.target.value))} className={fieldClass} />
            <FieldError>{errors.trainingDurationMinutes}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Intensity
            <select value={values.trainingIntensity} onChange={(event) => change("trainingIntensity", event.target.value as TrainingIntensity)} className={fieldClass}>
              <option value="rest">Rest</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="very_high">Very high</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Training frequency (days / week)
            <input type="number" min={1} max={7} required value={values.trainingFrequencyDaysPerWeek} onChange={(event) => change("trainingFrequencyDaysPerWeek", Number(event.target.value))} className={fieldClass} />
            <FieldError>{errors.trainingFrequencyDaysPerWeek}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Food budget for the day (₹)
            <input type="number" min={80} max={5000} step={25} required value={values.dailyBudgetInr} onChange={(event) => change("dailyBudgetInr", Number(event.target.value))} className={fieldClass} />
            <FieldError>{errors.dailyBudgetInr}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            City / session location
            <input required maxLength={80} value={values.location} onChange={(event) => change("location", event.target.value)} className={fieldClass} placeholder="Used for weather-based guidance" />
            <FieldError>{errors.location}</FieldError>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Approximate start time (optional)
            <select value={values.trainingTimeOfDay || ""} onChange={(event) => change("trainingTimeOfDay", (event.target.value || undefined) as TrainingTimeOfDay | undefined)} className={fieldClass}>
              <option value="">Not specified</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          Weather is fetched server-side when configured; otherwise a clearly marked climatological estimate is used. Unlisted sports use a generic session estimate with an explicit warning.
        </p>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {isLoading ? <><RefreshCw className="h-4 w-4 animate-spin" />Generating your plan…</> : <><Activity className="h-4 w-4" />Generate nutrition and hydration plan</>}
        </button>
      </form>
    </section>
  );
}

export function AccountWorkflow() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<SavedProfile | null>(null);
  const [screen, setScreen] = useState<"loading" | "auth" | "profile" | "session" | "result">("loading");
  const [plan, setPlan] = useState<DecisionSupportOutput | null>(null);
  const [sessionValues, setSessionValues] = useState<SessionFormValues>(initialSession);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (response.status === 404) {
      setProfile(null);
      setScreen("profile");
      return;
    }
    const result = await responseJson<SavedProfile>(response);
    setProfile(result);
    setScreen("session");
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/auth", { cache: "no-store" });
        const result = await responseJson<{ user: SessionUser | null }>(response);
        if (!active) return;
        if (!result.user) {
          setScreen("auth");
          return;
        }
        setUser(result.user);
        await loadProfile();
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Could not load your account.");
          setScreen("auth");
        }
      }
    })();
    return () => { active = false; };
  }, [loadProfile]);

  const authenticated = (nextUser: SessionUser) => {
    setUser(nextUser);
    setError("");
    void loadProfile().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "Could not load your profile.");
    });
  };

  const saveProfile = async (nextProfile: ValidatedAthletePersonalProfile) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextProfile),
    });
    const saved = await responseJson<{ profile: ValidatedAthletePersonalProfile; createdAt: string; updatedAt: string }>(response);
    setProfile(saved);
    setScreen("session");
  };

  const generatePlan = async (session: ValidatedTrainingSession) => {
    setLoadingPlan(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      const result = await responseJson<{ plan: DecisionSupportOutput }>(response);
      const isRegisteredSport = Object.prototype.hasOwnProperty.call(SPORTS_REGISTRY, session.sport);
      setSessionValues({
        ...session,
        sport: isRegisteredSport ? session.sport : "other",
        customSport: isRegisteredSport ? "" : session.sport,
      });
      setPlan(result.plan);
      setScreen("result");
    } finally {
      setLoadingPlan(false);
    }
  };

  const signOut = async () => {
    setError("");
    try {
      const response = await fetch("/api/auth", { method: "DELETE" });
      await responseJson<{ success: boolean }>(response);
      setUser(null);
      setProfile(null);
      setPlan(null);
      setScreen("auth");
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Could not sign out.");
    }
  };

  const fallbackProfile = useMemo<ProfileDraft>(
    () => profile?.profile || {
      name: user?.name || "",
      age: "",
      sex: "",
      heightCm: "",
      weightKg: "",
      dietaryPreference: "vegetarian",
      dietaryExclusions: [],
    },
    [profile, user?.name]
  );

  if (screen === "loading") {
    return <div className="mx-auto max-w-3xl p-12 text-center text-sm text-slate-600">Loading your NutriPlay account…</div>;
  }
  if (!user || screen === "auth") {
    return (
      <div className="px-4 py-10 sm:px-6">
        {error && <p role="alert" className="mx-auto mb-4 max-w-xl rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <AuthPanel onAuthenticated={authenticated} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <UserRound className="h-4 w-4 text-emerald-700" />
          <span className="font-semibold">{user.name}</span>
          <span className="text-slate-400">·</span>
          <span>{user.email}</span>
        </div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {profile && (
            <button type="button" onClick={() => { setScreen("profile"); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Edit athlete profile
            </button>
          )}
          <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>

      {screen === "profile" && (
        <ProfileEditor
          initialProfile={fallbackProfile}
          accountName={user.name}
          updatedAt={profile?.updatedAt}
          isOnboarding={!profile}
          onCancel={profile ? () => { setScreen(plan ? "result" : "session"); } : undefined}
          onSave={saveProfile}
        />
      )}

      {screen === "session" && profile && (
        <SessionForm initialValues={sessionValues} onSubmit={generatePlan} isLoading={loadingPlan} />
      )}

      {screen === "result" && plan && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <button type="button" onClick={() => setScreen("session")} className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4" /> Edit current session
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                <Printer className="h-4 w-4" /> Print plan
              </button>
              <button type="button" onClick={() => setScreen("session")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {plan.assumptions.length > 0 && (
            <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" aria-label="Plan assumptions">
              <h2 className="font-semibold">Assumptions and data limitations</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">{plan.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
            </aside>
          )}
          <AthleteSummaryCard athlete={plan.athlete} weather={plan.weather} />
          <VisualisationSection targets={plan.targets} plan={plan.mealPlan} hydration={plan.hydration} />
          <MealPlanCard plan={plan.mealPlan} />
          <HydrationCard hydration={plan.hydration} />
          <SafetyAlertCard safety={plan.safety} />
          <ExplanationsCard energy={plan.energy} targets={plan.targets} plan={plan.mealPlan} hydration={plan.hydration} />
        </div>
      )}
    </div>
  );
}
