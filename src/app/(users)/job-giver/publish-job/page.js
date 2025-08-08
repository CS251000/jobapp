"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";

import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StateCitySelect from "@/components/form/stateCityDropdown";
import { jobTypes, jobLocations, jobCategories } from "@/utils/constants";

const STEP_TITLES = {
  1: "Basic Job Details",
  2: "Job Description",
  3: "Additional Requirements",
  4: "Scheduling & Extras",
};

export default function JobPostingPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams= useSearchParams();
  const companyId = searchParams.get("companyId") || "";

  const [step, setStep] = useState(1);
  const [formTitle, setFormTitle] = useState(STEP_TITLES[1]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  const [form, setForm] = useState({
    companyId,
    postedByClerkUserId: "",
    jobTitle: "",
    jobCategory: "",
    jobType: "Full-Time",
    jobLocationType: "Onsite",
    jobLocationAddress: "",
    jobLocationCity: "",
    jobLocationState: "",
    zipCode: "",
    jobDescription: "",
    keyResponsibilities: "",
    requiredQualifications: "",
    experienceLevelRequired: "",
    applicationDeadline: format(new Date(), "yyyy-MM-dd"),
    salaryMin: "",
    salaryMax: "",
    howToApply: "",
    jobRole: [],
    skills: [],
    vacancies: 1,
    minAge: 18,
    maxAge: 35,
    languages: [],
    jobTimingStartTime: "",
    jobTimingEndTime: "",
    jobTimingDays: [],
  });
  const [categories, setCategories] = useState([]);
  // update title on step change
  useEffect(() => {
    setFormTitle(STEP_TITLES[step]);
  }, [step]);

  // fill clerk user id
  useEffect(() => {
    if (isLoaded && user) {
      setForm((f) => ({ ...f, postedByClerkUserId: user.id }));
    }
  }, [isLoaded, user]);

  // fetch roles & skills
  useEffect(() => {
    fetch("/api/desired-job-roles")
      .then((r) => r.json())
      .then(setAvailableRoles)
      .catch(console.error);
    fetch("/api/skills")
      .then((r) => r.json())
      .then(setAvailableSkills)
      .catch(console.error);
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const updateField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const goNext = () => {
    // simple validation
    if (step === 1 && !form.jobTitle.trim()) {
      return alert("Please enter Job Title.");
    }
    if (step === 2 && !form.jobDescription.trim()) {
      return alert("Please enter Job Description.");
    }
    setStep((s) => Math.min(s + 1, 4));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        skills: form.skills.map((skillId) => ({
          skillId,
          skillType: "Required",
        })),
      };

      const res = await fetch("/api/add-job-posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      router.push(`/job-giver/dashboard?companyId=${companyId}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <SignInButton mode="modal">
          <span className="text-xl font-semibold text-gray-700 cursor-pointer">
            Please sign in to continue
          </span>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white to-gray-100 flex items-center justify-center py-12">
      <div className="w-full max-w-3xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
          {formTitle}
        </h1>
        {/* step dots */}
        <div className="flex justify-center space-x-4 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Job Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="jobTitle" className={"mb-2"}>
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jobCategory" className={"mb-2"}>
                  Job Category
                </Label>
                <ShadSelect
                  value={form.jobCategory}
                  onValueChange={(v) => updateField("jobCategory", v)}
                >
                  <SelectTrigger id="jobCategory" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((c) => (
                        <SelectItem key={c.categoryId} value={c.categoryId}>
                          {c.categoryName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </ShadSelect>
              </div>
              

              {/* Roles & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl className="w-full">
                  <InputLabel>Job Roles</InputLabel>
                  <MuiSelect
                    multiple
                    value={form.jobRole}
                    onChange={(e) =>
                      updateField(
                        "jobRole",
                        typeof e.target.value === "string"
                          ? e.target.value.split(",")
                          : e.target.value
                      )
                    }
                    input={<OutlinedInput label="Job Roles" />}
                    renderValue={(sel) =>
                      availableRoles
                        .filter((r) => sel.includes(r.desiredJobRoleId))
                        .map((r) => r.roleName)
                        .join(", ")
                    }
                    onOpen={(e) => {
                      if (!form.jobCategory) {
                        e.preventDefault();
                        alert("Please select a job category first.");
                      }
                    }}
                  >
                    {availableRoles
                      .filter((r) => r.categoryId === form.jobCategory)
                      .map((r) => (
                        <MenuItem
                          key={r.desiredJobRoleId}
                          value={r.desiredJobRoleId}
                        >
                          <Checkbox
                            checked={form.jobRole.includes(r.desiredJobRoleId)}
                          />
                          <ListItemText primary={r.roleName} />
                        </MenuItem>
                      ))}
                  </MuiSelect>
                </FormControl>

                <FormControl className="w-full">
                  <InputLabel>Skills</InputLabel>
                  <MuiSelect
                    multiple
                    value={form.skills}
                    onChange={(e) =>
                      updateField(
                        "skills",
                        typeof e.target.value === "string"
                          ? e.target.value.split(",")
                          : e.target.value
                      )
                    }
                    input={<OutlinedInput label="Skills" />}
                    renderValue={(sel) =>
                      availableSkills
                        .filter((s) => sel.includes(s.skillId))
                        .map((s) => s.skillName)
                        .join(", ")
                    }
                  >
                    {availableSkills.map((s) => (
                      <MenuItem key={s.skillId} value={s.skillId}>
                        <Checkbox checked={form.skills.includes(s.skillId)} />
                        <ListItemText primary={s.skillName} />
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </div>

              <div>
                <Label htmlFor="jobType" className={"mb-2"}>
                  Job Type
                </Label>
                <ShadSelect
                  value={form.jobType}
                  onValueChange={(v) => updateField("jobType", v)}
                >
                  <SelectTrigger id="jobType" className="w-full">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {jobTypes.map((t) => (
                        <SelectItem key={t.key} value={t.value}>
                          {t.value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </ShadSelect>
              </div>

              <div>
                <Label htmlFor="jobLocationType" className={"mb-2"}>
                  Location Type
                </Label>
                <ShadSelect
                  value={form.jobLocationType}
                  onValueChange={(v) => updateField("jobLocationType", v)}
                >
                  <SelectTrigger id="jobLocationType" className="w-full">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {jobLocations.map((l) => (
                        <SelectItem key={l.key} value={l.value}>
                          {l.value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </ShadSelect>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="jobLocationAddress" className={"mb-2"}>
                  Address
                </Label>
                <Textarea
                  id="jobLocationAddress"
                  rows={2}
                  value={form.jobLocationAddress}
                  onChange={(e) =>
                    updateField("jobLocationAddress", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <StateCitySelect
                  stateValue={form.jobLocationState}
                  cityValue={form.jobLocationCity}
                  zipValue={form.zipCode}
                  onStateChange={(v) => updateField("jobLocationState", v)}
                  onCityChange={(v) => updateField("jobLocationCity", v)}
                  onZipChange={(v) => updateField("zipCode", v)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Description + Roles & Skills */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="jobDescription" className={"mb-2"}>
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  rows={4}
                  value={form.jobDescription}
                  onChange={(e) =>
                    updateField("jobDescription", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="keyResponsibilities" className={"mb-2"}>
                  Key Responsibilities
                </Label>
                <Textarea
                  id="keyResponsibilities"
                  rows={3}
                  value={form.keyResponsibilities}
                  onChange={(e) =>
                    updateField("keyResponsibilities", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="requiredQualifications" className={"mb-2"}>
                  Required Qualifications
                </Label>
                <Textarea
                  id="requiredQualifications"
                  rows={3}
                  value={form.requiredQualifications}
                  onChange={(e) =>
                    updateField("requiredQualifications", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="experienceLevelRequired" className={"mb-2"}>
                    Experience Level
                  </Label>
                  <Input
                    id="experienceLevelRequired"
                    value={form.experienceLevelRequired}
                    onChange={(e) =>
                      updateField("experienceLevelRequired", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label className={"mb-2"}>Application Deadline</Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(form.applicationDeadline), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar
                        mode="single"
                        selected={form.applicationDeadline}
                        onSelect={(d) => {
                          if (d) {
                            updateField("applicationDeadline", d);
                            setOpenCalendar(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="salaryMin" className={"mb-2"}>
                    Salary Min (₹)
                  </Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => updateField("salaryMin", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax" className={"mb-2"}>
                    Salary Max (₹)
                  </Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => updateField("salaryMax", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="howToApply" className={"mb-2"}>
                  How To Apply
                </Label>
                <Textarea
                  id="howToApply"
                  rows={2}
                  value={form.howToApply}
                  onChange={(e) => updateField("howToApply", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Additional Requirements */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="vacancies" className={"mb-2"}>
                  Vacancies
                </Label>
                <Input
                  id="vacancies"
                  type="number"
                  value={form.vacancies}
                  onChange={(e) =>
                    updateField("vacancies", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="minAge" className={"mb-2"}>
                  Min Age
                </Label>
                <Input
                  id="minAge"
                  type="number"
                  value={form.minAge}
                  onChange={(e) => updateField("minAge", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxAge" className={"mb-2"}>
                  Max Age
                </Label>
                <Input
                  id="maxAge"
                  type="number"
                  value={form.maxAge}
                  onChange={(e) => updateField("maxAge", e.target.value)}
                />
              </div>
              <FormControl fullWidth>
                <InputLabel id="languages-label">Languages</InputLabel>
                <MuiSelect
                  labelId="languages-label"
                  multiple
                  value={form.languages}
                  onChange={(e) =>
                    updateField(
                      "languages",
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value
                    )
                  }
                  input={<OutlinedInput label="Languages" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {["English", "Hindi", "Spanish"].map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      <Checkbox checked={form.languages.includes(lang)} />
                      <ListItemText primary={lang} />
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </div>
          )}

          {/* STEP 4: Scheduling */}
          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="jobTimingStartTime" className={"mb-2"}>
                  Start Time
                </Label>
                <Input
                  id="jobTimingStartTime"
                  value={form.jobTimingStartTime}
                  onChange={(e) =>
                    updateField("jobTimingStartTime", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="jobTimingEndTime" className={"mb-2"}>
                  End Time
                </Label>
                <Input
                  id="jobTimingEndTime"
                  value={form.jobTimingEndTime}
                  onChange={(e) =>
                    updateField("jobTimingEndTime", e.target.value)
                  }
                />
              </div>
              <FormControl fullWidth>
                <InputLabel id="timing-days-label">Job Timing Days</InputLabel>
                <MuiSelect
                  labelId="timing-days-label"
                  multiple
                  value={form.jobTimingDays}
                  onChange={(e) =>
                    updateField(
                      "jobTimingDays",
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value
                    )
                  }
                  input={<OutlinedInput label="Job Timing Days" />}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <MenuItem key={day} value={day}>
                      <Checkbox checked={form.jobTimingDays.includes(day)} />
                      <ListItemText primary={day} />
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </div>
          )}

          {/* NAV CONTROLS */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            {step < 4 && (
              <Button type="button" onClick={goNext}>
                Next
              </Button>
            )}
            {step === 4 && (
              <Button type="submit" disabled={isSubmitting}>
                Publish Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
