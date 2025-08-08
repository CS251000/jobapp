// app/job-seeker-signup/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select as ShadSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StateCitySelect from "@/components/form/stateCityDropdown";
import { jobTypes, jobLocations } from "@/utils/constants";
import { supabase } from "@/utils/supabase/supabaseClient";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};

export default function JobSeekerSignupPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  // lookups
  const [categories, setCategories] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);

  // form state
  const [form, setForm] = useState({
    jobSeekerProfileId:"",
    clerkId: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    jobCategory: "",
    jobRoles: [],
    skills: [],
    aboutMe: "",
    resume: null,
    resumeUrl: "",
    publicResumeUrl: "",
    expectedSalary: "",
    experience: "",
    availability: "",
    startDate: null,
    jobLocation: "",
    willingToRelocate: false,
    profilePictureUrl: "",
  });

  // 1. prefill basic user info
  useEffect(() => {
    if (isLoaded && user) {
      setForm((p) => ({
        ...p,
        clerkId: user.id,
        fullName: user.fullName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        phone: user.phoneNumbers[0]?.phoneNumber || "",
        profilePictureUrl: user.imageUrl || "",
      }));
    }
  }, [isLoaded, user]);

  // 2. fetch lookups & existing profile
  useEffect(() => {
    if (!isLoaded || !user) return;
    setLoading(true);

    // categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);

    // desired roles
    fetch("/api/desired-job-roles")
      .then((r) => r.json())
      .then(setAvailableRoles)
      .catch(console.error);

    // skills
    fetch("/api/skills")
      .then((r) => r.json())
      .then(setAvailableSkills)
      .catch(console.error);

    // existing profile
    fetch(`/api/get-seeker-profile?userId=${user.id}`)
      .then((r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (data?.isExisting) {
          setIsExisting(true);
          setForm((p) => ({
            ...p,
            jobSeekerProfileId: data.jobSeekerProfileId || "",
            fullName: data.fullName || p.fullName,
            email: data.email || p.email,
            phone: data.phone || p.phone,
            profilePictureUrl: data.profilePictureUrl || p.profilePictureUrl,
            address: data.address || "",
            city: data.locationCity || "",
            state: data.locationState || "",
            zip: data.zipCode || "",
            aboutMe: data.aboutMe || "",
            resumeUrl: data.resumeFileUrl || "",
            publicResumeUrl: data.resumeFileUrl || "",
            willingToRelocate: data.willingToRelocate,
            expectedSalary: data.expectedSalaryMin?.toString() || "",
            experience: data.totalYearsOfExperience?.toString() || "",
            startDate: data.availabilityStartDate
              ? new Date(data.availabilityStartDate)
              : null,
            jobCategory: data.jobCategory || "",
            jobRoles: data.jobRoles || [],
            skills: data.skills || [],
            availability: data.desiredJobTypes?.[0] || "",
            jobLocation: data.preferredLocationTypes?.[0] || "",
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoaded, user]);

  // 3. whenever category changes, clear roles
  useEffect(() => {
    setForm((p) => ({ ...p, jobRoles: [] }));
  }, [form.jobCategory]);

  // filter roles by selected category
  const filteredRoles = form.jobCategory
    ? availableRoles.filter((r) => r.categoryId === form.jobCategory)
    : [];

  // generic updater
  const updateField = (name, value) =>
    setForm((p) => ({ ...p, [name]: value }));

  // multi‐select handler
  const handleMulti = (name) => (e) => {
    const val = e.target.value;
    updateField(name, typeof val === "string" ? val.split(",") : val);
  };

  // file input handler
  const handleChangeSimple = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === "file" && name === "resume" && files) {
      setForm((p) => ({ ...p, resume: files[0] }));
    } else if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked }));
    } else {
      updateField(name, value);
    }
  };

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // delete old resume if replaced
    let finalResumeUrl = form.resumeUrl;
    if (form.resumeUrl && form.resume) {
      try {
        const parts = form.resumeUrl.split("/");
        const oldFileName = parts[parts.length - 1];
        await supabase.storage.from("resumes").remove([oldFileName]);
      } catch (err) {
        console.error("Failed to delete old resume", err);
      }
    }

    // upload new resume
    if (form.resume) {
      try {
        const file = form.resume;
        const ext = file.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("resumes")
            .upload(fileName, file, { cacheControl: "3600", upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(uploadData.path);
        finalResumeUrl = urlData.publicUrl;
      } catch (err) {
        console.error("Resume upload error:", err);
        alert("Failed to upload resume. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    // build payload
    const payload = {
      clerkId: form.clerkId,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      profilePictureUrl: form.profilePictureUrl,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      aboutMe: form.aboutMe,
      willingToRelocate: form.willingToRelocate,
      expectedSalary: parseInt(form.expectedSalary) || 0,
      experience: parseInt(form.experience) || 0,
      startDate: form.startDate
        ? form.startDate.toISOString().split("T")[0]
        : null,
      jobCategory: form.jobCategory,
      jobRoles: form.jobRoles,
      skills: form.skills,
      availability: form.availability ? [form.availability] : [],
      jobLocation: form.jobLocation ? [form.jobLocation] : [],
      resumeUrl: finalResumeUrl,
    };

    try {
      const method = isExisting ? "PUT" : "POST";
      const res = await fetch("/api/add-jobSeeker", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      router.push(`/job-seeker/dashboard?jobSeekerId=${form.jobSeekerProfileId}`);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // require signin
  if (!isLoaded || !isSignedIn || !user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-200">
        <SignInButton mode="modal">
          <h1 className="text-2xl">Loading</h1>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-tr from-white to-gray-100 min-h-screen">
      <div className="max-w-3xl w-full bg-white p-10 rounded-3xl shadow-2xl border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP INDICATORS */}
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                  step === s
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                onClick={() => setStep(s)}
              >
                {s}
              </div>
            ))}
          </div>

          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
                Enter Personal Information
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", name: "fullName", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone Number", name: "phone", type: "tel" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-semibold text-gray-600">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChangeSimple}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
                {!user.imageUrl && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      name="profilePictureUrl"
                      value={form.profilePictureUrl}
                      onChange={handleChangeSimple}
                      placeholder="Enter link to your profile picture"
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChangeSimple}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <StateCitySelect
                    stateValue={form.state}
                    cityValue={form.city}
                    zipValue={form.zip}
                    onStateChange={(v) => updateField("state", v)}
                    onCityChange={(v) => updateField("city", v)}
                    onZipChange={(v) => updateField("zip", v)}
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2: CATEGORY → ROLES → SKILLS */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-blue-700 text-center">
                Select Category, Roles & Skills
              </h1>

              {/* Category */}
              <div className="flex justify-center">
                <div className="w-64">
                  <ShadSelect
                    value={form.jobCategory}
                    onValueChange={(v) => updateField("jobCategory", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
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
              </div>

              {/* Roles */}
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="jobrole-label">Job Roles</InputLabel>
                <Select
                  labelId="jobrole-label"
                  multiple
                  value={form.jobRoles}
                  onChange={handleMulti("jobRoles")}
                  input={<OutlinedInput label="Job Roles" />}
                  renderValue={(sel) =>
                    filteredRoles
                      .filter((r) => sel.includes(r.desiredJobRoleId))
                      .map((r) => r.roleName)
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                  disabled={!form.jobCategory}
                  onOpen={(e) => {
                    if (!form.jobCategory) {
                      e.preventDefault();
                      alert("Please select a category first.");
                    }
                  }}
                >
                  {filteredRoles.map((r) => (
                    <MenuItem key={r.desiredJobRoleId} value={r.desiredJobRoleId}>
                      <Checkbox checked={form.jobRoles.includes(r.desiredJobRoleId)} />
                      <ListItemText primary={r.roleName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Skills */}
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="skill-label">Skills</InputLabel>
                <Select
                  labelId="skill-label"
                  multiple
                  value={form.skills}
                  onChange={handleMulti("skills")}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(sel) =>
                    availableSkills
                      .filter((s) => sel.includes(s.skillId))
                      .map((s) => s.skillName)
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {availableSkills.map((s) => (
                    <MenuItem key={s.skillId} value={s.skillId}>
                      <Checkbox checked={form.skills.includes(s.skillId)} />
                      <ListItemText primary={s.skillName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* About Me */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-600 py-1">
                  About Me
                </label>
                <Textarea
                  placeholder="Tell us about yourself…"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={form.aboutMe}
                  name="aboutMe"
                  onChange={handleChangeSimple}
                />
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE & AVAILABILITY */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-blue-700 text-center mb-5">
                Experience & Availability
              </h1>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Expected Salary (₹)",
                    name: "expectedSalary",
                    type: "number",
                  },
                  {
                    label: "Years of Experience",
                    name: "experience",
                    type: "number",
                  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-semibold text-gray-600 py-1">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChangeSimple}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Availability
                  </label>
                  <ShadSelect
                    value={form.availability}
                    onValueChange={(v) => updateField("availability", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Availability" />
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

                {/* Job Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Preferred Job Location
                  </label>
                  <ShadSelect
                    value={form.jobLocation}
                    onValueChange={(v) => updateField("jobLocation", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Job Location" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 py-1 mt-2">
                    Available Start Date
                  </label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.startDate
                          ? format(form.startDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar
                        mode="single"
                        selected={form.startDate}
                        onSelect={(d) => {
                          if (d) updateField("startDate", d);
                          setOpenCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Willing to Relocate */}
                <div className="flex items-center space-x-2 mt-8">
                  <Checkbox
                    id="willingToRelocate"
                    checked={form.willingToRelocate}
                    onChange={(e) =>
                      updateField("willingToRelocate", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="willingToRelocate"
                    className="text-sm font-medium leading-none"
                  >
                    Are you willing to relocate?
                  </label>
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mt-4">
                  {form.resumeUrl
                    ? "Replace Your Resume (PDF)"
                    : "Upload Resume (PDF)"}
                </label>

                {form.resumeUrl && (
                  <div className="mb-2">
                    <a
                      href={form.publicResumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      View Current Resume
                    </a>
                  </div>
                )}

                <input
                  type="file"
                  name="resume"
                  accept=".pdf"
                  onChange={handleChangeSimple}
                  className="mt-1 block w-full md:w-auto text-gray-600 bg-gray-100 rounded-4xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 file:cursor-pointer file:bg-gray-300 file:text-gray-700 file:border-none file:rounded-lg file:py-1 file:px-2 hover:file:bg-gray-400"
                />
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between pt-4">
            {step==1 &&(
              <Button
                type="button"
                onClick={() =>router.push(`/job-seeker/dashboard?jobSeekerId=${form.jobSeekerProfileId}`)}
                
              >
                Go to Dashboard
              </Button>
            )}
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-black"
              >
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {submitting ? "Uploading..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
