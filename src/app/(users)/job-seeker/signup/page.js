// app/job-seeker-signup/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { jobLocations, jobTypes } from "@/utils/constants";
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
import { supabase } from "@/utils/supabase/supabaseClient";
import Link from "next/link";

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
  const [submitting, setSubmitting] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  // ─────────────────── STEP STATE (starts at 1) ───────────────────
  const [step, setStep] = useState(1);

  // ─────────────────── LOOKUPS ───────────────────
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // ─────────────────── FORM STATE ───────────────────
  const [form, setForm] = useState({
    fullName: "",
    clerkId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    jobRoles: [],          // Array<string>
    skills: [],            // Array<string>
    resume: null,          // File object
    resumeUrl: "",         // existing URL (if editing)
    publicResumeUrl: "",   // used to view existing PDF
    expectedSalary: "",
    experience: "",
    availability: "",      // single enum‐string
    startDate: null,       // Date object
    jobLocation: "",       // single enum‐string
    aboutMe: "",
    willingToRelocate: false,
    profilePictureUrl: "",
  });

  // ─────────────────── PREFILL USER BASIC INFO ───────────────────
  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        clerkId: user.id,
        fullName: user.fullName ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        phone: user.phoneNumbers[0]?.phoneNumber ?? "",
        profilePictureUrl: user.imageUrl || "",
      }));
    }
  }, [isLoaded, user]);

  // ─────────────────── FETCH LOOKUPS & EXISTING PROFILE ───────────────────
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchRoles() {
      try {
        const res = await fetch("/api/desired-job-roles");
        if (!res.ok) throw new Error("Failed to fetch desired roles");
        const data = await res.json();
        setAvailableRoles(data);
      } catch (err) {
        console.error("Error fetching desired roles:", err);
      }
    }

    async function fetchSkills() {
      try {
        const res = await fetch("/api/skills");
        if (!res.ok) throw new Error("Failed to fetch skills");
        const data = await res.json();
        setAvailableSkills(data);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    }

    async function fetchExistingProfile() {
      try {
        const res = await fetch(`/api/get-seeker-profile?userId=${user.id}`);
        if (res.status === 404) {
          setIsExisting(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch existing profile");
        const data = await res.json();
        if (data.isExisting) {
          setIsExisting(true);
          setForm((prev) => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            profilePictureUrl: data.profilePictureUrl || prev.profilePictureUrl,
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
            jobRoles: data.jobRoles || [],
            skills: data.skills || [],
            availability:
              (data.desiredJobTypes && data.desiredJobTypes[0]) || "",
            jobLocation:
              (data.preferredLocationTypes && data.preferredLocationTypes[0]) ||
              "",
          }));
        } else {
          setIsExisting(false);
        }
      } catch (err) {
        console.error("Error fetching existing profile:", err);
      }
    }

    fetchRoles();
    fetchSkills();
    fetchExistingProfile();
  }, [isLoaded, user]);

  // ─────────────────── HANDLERS ───────────────────
  const handleChangeSimple = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "file" && name === "resume" && files) {
      setForm((prev) => ({
        ...prev,
        resume: files[0], // newly picked File
      }));
      return;
    }
    if (type === "checkbox" && name === "willingToRelocate") {
      setForm((prev) => ({ ...prev, willingToRelocate: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobRolesChange = (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      jobRoles: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSkillsChange = (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      skills: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);


    let finalResumeUrl = form.resumeUrl;
     if (form.resumeUrl && form.resume) {
      try {
        const parts = form.resumeUrl.split("/");
        const oldFileName = parts[parts.length - 1]; 
        const { error: removeError } = await supabase.storage
          .from("resumes")
          .remove([oldFileName]);
        if (removeError) {
          console.error("Failed to delete old resume:", removeError);
        }
      } catch (err) {
        console.error("Error deleting old resume:", err);
      }
    }
    if (form.resume) {
      try {
        const file = form.resume;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("resumes")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: true,
            });
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

    // 2. Build payload (align field names with route.js)
    const payload = {
      clerkId: form.clerkId,
      resumeUrl: finalResumeUrl,
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
      jobRoles: form.jobRoles,           
      skills: form.skills,       
      availability: form.availability
        ? [form.availability]
        : [],                     
      jobLocation: form.jobLocation
        ? [form.jobLocation]
        : [],                             
    };

    try {
      const method = isExisting ? "PUT" : "POST";
      const res = await fetch("/api/add-jobSeeker", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to save profile");
      }
      router.push("/job-seeker/dashboard");
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // If not signed in, prompt to sign in
  if (!user || !isSignedIn || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-200 to-gray-400">
        <SignInButton mode="modal">
          <h1 className="text-2xl font-bold text-black hover:cursor-pointer">
            Please Sign In to continue
          </h1>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-tr from-white to-gray-100 min-h-screen text-black">
      <div className="max-w-3xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ───────────────────── STEP INDICATORS ───────────────────── */}
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer 
                  ${
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

          {/* ───────────── STEP 1: PERSONAL INFO ───────────── */}
          {step === 1 && (
            <>
              <h1 className="font-bold text-blue-700 text-3xl text-center mb-8">
                Enter Personal Information
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", name: "fullName", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone Number", name: "phone", type: "tel" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-600">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter link to your profile picture"
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
                    onStateChange={(val) =>
                      setForm((prev) => ({ ...prev, state: val }))
                    }
                    onCityChange={(val) =>
                      setForm((prev) => ({ ...prev, city: val }))
                    }
                    onZipChange={(val) =>
                      setForm((prev) => ({ ...prev, zip: val }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* ───────────── STEP 2: JOB ROLES & SKILLS ───────────── */}
          {step === 2 && (
            <div className="flex flex-col items-center">
              <h1 className="font-bold text-blue-700 text-2xl mb-4 text-center">
                Select Roles to Apply & Skills
              </h1>

              {/* Desired Job Roles */}
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="jobrole-label">Job Roles</InputLabel>
                <Select
                  labelId="jobrole-label"
                  multiple
                  value={form.jobRoles}
                  onChange={handleJobRolesChange}
                  input={<OutlinedInput label="Job Roles" />}
                  renderValue={(selected) =>
                    availableRoles
                      .filter((r) => selected.includes(r.desiredJobRoleId))
                      .map((r) => r.roleName)
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {availableRoles.map((pos) => (
                    <MenuItem
                      key={pos.desiredJobRoleId}
                      value={pos.desiredJobRoleId}
                    >
                      <Checkbox
                        checked={form.jobRoles.includes(
                          pos.desiredJobRoleId
                        )}
                      />
                      <ListItemText primary={pos.roleName} />
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
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selectedIds) =>
                    availableSkills
                      .filter((s) => selectedIds.includes(s.skillId))
                      .map((s) => s.skillName)
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill.skillId} value={skill.skillId}>
                      <Checkbox
                        checked={form.skills.includes(skill.skillId)}
                      />
                      <ListItemText primary={skill.skillName} />
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

          {/* ───────────── STEP 3: EXPERIENCE & AVAILABILITY ───────────── */}
          {step === 3 && (
            <div>
              <h1 className="font-bold text-blue-700 text-2xl mb-5 text-center">
                Experience & Availability
              </h1>
              <div className="grid grid-cols-2 gap-6 my-4">
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
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-600 py-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChangeSimple}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Availability (job types) */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Availability
                  </label>
                  <ShadSelect
                    value={form.availability}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, availability: val }))
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Select Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.key} value={type.value}>
                            {type.value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Job Location (Onsite/Remote/Hybrid) */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Preferred Job Location
                  </label>
                  <ShadSelect
                    value={form.jobLocation}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, jobLocation: val }))
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Select Job Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {jobLocations.map((loc) => (
                          <SelectItem key={loc.key} value={loc.value}>
                            {loc.value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </ShadSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Available Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 py-1 mt-2">
                    Available Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-[240px] justify-start text-left font-normal hover:cursor-pointer",
                          !form.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.startDate
                          ? format(form.startDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.startDate}
                        onSelect={(date) => {
                          if (date) {
                            setForm((prev) => ({
                              ...prev,
                              startDate: date,
                            }));
                          }
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
                      setForm((prev) => ({
                        ...prev,
                        willingToRelocate: e.target.checked,
                      }))
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

          {/* ───────────────────── NAVIGATION BUTTONS ───────────────────── */}
          <div className="flex justify-between pt-4">
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
              submitting ? (
                <Button
                  disabled
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Uploading...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit
                </Button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
