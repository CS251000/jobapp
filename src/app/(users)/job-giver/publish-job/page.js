"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import TextField from "@mui/material/TextField";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  OutlinedInput,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select as ShadSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobTypes, jobLocations, jobCategories } from "@/utils/constants";
import StateCitySelect from "@/components/form/stateCityDropdown";

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

export default function JobPostingPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");

  // Step state (1, 2, or 3)
  const [step, setStep] = useState(1);
  const [openCalendar, setOpenCalendar] = useState(false);
  const[isSubmitting,setIsSubmitting]= useState(false);

  // Available lists
  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Form state matching schema
  const [form, setForm] = useState({
    companyId: companyId || "",
    postedByClerkUserId: "",
    jobTitle: "",
    jobCategory: "",
    jobType: "Full-Time",
    jobLocationType: "Onsite",
    jobLocationAddress: "",
    jobLocationCity: "",
    jobLocationState: "",
    zipCode: "",
    jobRole: [],
    skills: [],
    applicationDeadline: format(new Date(), "yyyy-MM-dd"),
    jobDescription: "",
    keyResponsibilities: "",
    requiredQualifications: "",
    experienceLevelRequired: "",
    salaryMin: "",
    salaryMax: "",
    howToApply: "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        postedByClerkUserId: user.id,
      }));
    }
  }, [isLoaded, user]);
  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch("/api/skills");
        if (!res.ok) throw new Error("Failed to fetch skills");
        const data = await res.json();
        setAvailableSkills(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    }
    fetchSkills();
  }, []);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch("/api/desired-job-roles");
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        setAvailableRoles(data);
      } catch (error) {
        console.error("Error fetching desired roles:", error);
      }
    }
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobRolesChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      jobRole: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSkillsChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      skills: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const goNext = () => {
    if (step === 1) {
      if (!form.jobTitle.trim()) {
        alert("Please enter Job Title.");
        return;
      }
    }
    if (step === 2) {
      if (!form.jobDescription.trim()) {
        alert("Please enter Job Description.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };
  const goBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jobRoleText = form.jobRole.join(",");
    setIsSubmitting(true);

    const payload = {
      companyId: form.companyId,
      postedByClerkUserId: form.postedByClerkUserId,
      jobTitle: form.jobTitle,
      jobCategory: form.jobCategory,
      jobType: form.jobType,
      jobLocationType: form.jobLocationType,
      jobLocationAddress: form.jobLocationAddress,
      jobLocationCity: form.jobLocationCity,
      jobLocationState: form.jobLocationState,
      zipCode: form.zipCode,
      jobRole: jobRoleText,
      applicationDeadline: form.applicationDeadline,
      jobDescription: form.jobDescription,
      keyResponsibilities: form.keyResponsibilities,
      requiredQualifications: form.requiredQualifications,
      experienceLevelRequired: form.experienceLevelRequired,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      howToApply: form.howToApply,
      skills: form.skills.map((skillId) => ({
        skillId,
        skillType: "Required",
      })),
    };


    try {
      const res = await fetch("/api/add-job-posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Error creating job posting:", err);
        alert(err.error || "Failed to publish job.");
        return;
      }
      router.push(`/job-giver/dashboard?companyId=${companyId}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error. Please try again.");
    }finally{
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <SignInButton mode="modal">
          <h1 className="text-xl font-semibold text-gray-700 cursor-pointer">
            Please sign in to continue
          </h1>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 bg-gradient-to-tr from-white to-gray-100 min-h-screen text-black">
      <div className="max-w-3xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
        <h1 className="font-bold text-blue-700 text-3xl text-center mb-6">
          New Job Posting
        </h1>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4 mb-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  fullWidth
                  label="Job Title"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel id="job-category-label">Job Category</InputLabel>
                  <Select
                    labelId="job-category-label"
                    label="Job Category"
                    name="jobCategory"
                    value={form.jobCategory}
                    onChange={(e) => {
                      const { value, name } = e.target;
                      setForm((prev) => ({ ...prev, [name]: value }));
                    }}
                  >
                    {jobCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">
                    Job Type
                  </label>
                  <ShadSelect
                    value={form.jobType}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, jobType: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
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

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">
                    Location Type
                  </label>
                  <ShadSelect
                    value={form.jobLocationType}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, jobLocationType: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location type" />
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

                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Location Address"
                    name="jobLocationAddress"
                    multiline
                    minRows={2}
                    value={form.jobLocationAddress}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <StateCitySelect
                    stateValue={form.jobLocationState}
                    cityValue={form.jobLocationCity}
                    zipValue={form.zipCode}
                    onStateChange={(val) =>
                      setForm((prev) => ({ ...prev, jobLocationState: val }))
                    }
                    onCityChange={(val) =>
                      setForm((prev) => ({ ...prev, jobLocationCity: val }))
                    }
                    onZipChange={(val) =>
                      setForm((prev) => ({ ...prev, zipCode: val }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description & Requirements */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Job Description"
                  name="jobDescription"
                  multiline
                  minRows={4}
                  value={form.jobDescription}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Key Responsibilities"
                  name="keyResponsibilities"
                  multiline
                  minRows={3}
                  value={form.keyResponsibilities}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="Required Qualifications"
                  name="requiredQualifications"
                  multiline
                  minRows={3}
                  value={form.requiredQualifications}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  fullWidth
                  label="Experience Level Required"
                  name="experienceLevelRequired"
                  value={form.experienceLevelRequired}
                  onChange={handleChange}
                />
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-600 mb-1">
                    Application Deadline
                  </label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal hover:cursor-pointer"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.applicationDeadline
                          ? format(new Date(form.applicationDeadline), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.applicationDeadline}
                        onSelect={(date) => {
                          if (date) {
                            setForm((prev) => ({
                              ...prev,
                              applicationDeadline: date,
                            }));
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
                <TextField
                  fullWidth
                  label="Salary Min (₹)"
                  name="salaryMin"
                  type="number"
                  value={form.salaryMin}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Salary Max (₹)"
                  name="salaryMax"
                  type="number"
                  value={form.salaryMax}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  label="How To Apply"
                  name="howToApply"
                  multiline
                  minRows={2}
                  value={form.howToApply}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Step 3: Roles & Skills */}
          {step === 3 && (
            <div className="space-y-6">
              <FormControl sx={{ m: 1, width: "100%" }}>
                <InputLabel id="jobrole-label">Job Roles</InputLabel>
                <Select
                  labelId="jobrole-label"
                  multiple
                  value={form.jobRole}
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
                  {availableRoles.map((role) => (
                    <MenuItem
                      key={role.desiredJobRoleId}
                      value={role.desiredJobRoleId}
                    >
                      <Checkbox
                        checked={form.jobRole.includes(role.desiredJobRoleId)}
                      />
                      <ListItemText primary={role.roleName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 1, width: "100%" }}>
                <InputLabel id="skills-label">Skills</InputLabel>
                <Select
                  labelId="skills-label"
                  multiple
                  value={form.skills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selected) =>
                    availableSkills
                      .filter((s) => selected.includes(s.skillId))
                      .map((s) => s.skillName)
                      .join(", ")
                  }
                  MenuProps={MenuProps}
                >
                  {availableSkills.map((skill) => (
                    <MenuItem key={skill.skillId} value={skill.skillId}>
                      <Checkbox checked={form.skills.includes(skill.skillId)} />
                      <ListItemText primary={skill.skillName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                type="button"
                onClick={goBack}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-black"
              >
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                type="button"
                onClick={goNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled= {isSubmitting}
              >
                {isSubmitting?'Posting...' :'Publish Job'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
