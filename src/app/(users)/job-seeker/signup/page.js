"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { jobLocations, jobTypes, positions, skills } from "@/utils/constants";
import { supabase } from "@/utils/supabase/supabaseClient";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Box } from "@mui/material";
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

export default function JobSeekerSignupPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    age: 18,
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    jobRoles: [],
    skills: [],
    resume: null,
    expectedSalary: 1000,
    experience: 0,
    availability: "Full-Time",
    startDate: "",
    jobLocation: "Onsite",
    aboutMe: "",
    willingToRelocate: false,
    profilePictureUrl: "",
  });

  // Prefill user info once loaded
  useEffect(() => {
    if (isLoaded && user) {
      setForm((f) => ({
        ...f,
        fullName: user.fullName ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        phone: user.phoneNumbers[0]?.phoneNumber ?? "",
        profilePicture: user.imageUrl || "",
      }));
    }
  }, [isLoaded, user]);

  const [step, setStep] = useState(1);

  const handleChangeSimple = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setForm({ ...form, resume: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleJobRolesChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      jobRoles: typeof value === "string" ? value.split(",") : value,
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

  const handleSubmit = async (e) => {
    setSubmitting(true);
    e.preventDefault();
    let resumeUrl = "";
    if (form.resume) {
      const file = form.resume;
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        alert("Failed to upload resume.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(data.path);
      resumeUrl = urlData.publicUrl;
    }
    setSubmitting(true);
    const payload = { ...form, resumeUrl };
    console.log("Final payload:", payload);

    router.push("/job-seeker/dashboard");
  };

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
          {/* Step Indicators */}
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

          {step === 1 && (
            <>
              <h1 className="font-bold text-blue-700 text-3xl text-center mb-8">
                Enter Personal Information
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", name: "fullName", type: "text" },
                  { label: "Age", name: "age", type: "number" },
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
                      required={field.name !== "phone"}
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
                      name="profileImage"
                      value={form.profilePictureUrl}
                      onChange={handleChangeSimple}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter link to your profile picture"
                    />
                  </div>
                )}

                {/* Address / City / State / ZIP */}
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
                    onStateChange={(newState) =>
                      setForm((f) => ({ ...f, state: newState }))
                    }
                    onCityChange={(newCity) =>
                      setForm((f) => ({ ...f, city: newCity }))
                    }
                    onZipChange={(newZip) =>
                      setForm((f) => ({ ...f, zip: newZip }))
                    }
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center">
              <h1 className="font-bold text-blue-700 text-2xl mb-4 text-center">
                Select Roles to Apply & Skills
              </h1>
              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="jobrole-label">Job Roles</InputLabel>
                <Select
                  labelId="jobrole-label"
                  multiple
                  value={form.jobRoles}
                  onChange={handleJobRolesChange}
                  input={<OutlinedInput label="Job Roles" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        width: "40vw",
                        height: "100vh",
                        maxHeight: "80vh",
                        overflow: "auto",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        zIndex: 1300,
                        bgcolor: "background.paper",
                      },
                    },
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos.key} value={pos.value}>
                      <Checkbox checked={form.jobRoles.includes(pos.value)} />
                      <ListItemText primary={pos.value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="skill-label">Skills</InputLabel>
                <Select
                  labelId="skill-label"
                  multiple
                  value={form.skills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Skill Roles" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        width: "40vw",
                        height: "100vh",
                        maxHeight: "80vh",
                        overflow: "auto",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        zIndex: 1300,
                        bgcolor: "background.paper",
                      },
                    },
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                  }}
                >
                  {skills.map((pos) => (
                    <MenuItem key={pos.key} value={pos.value}>
                      <Checkbox checked={form.skills.includes(pos.value)} />
                      <ListItemText primary={pos.value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-600 py-1">
                  About Me
                </label>
                <Textarea
                  placeholder="Tell more about yourself (skills,past work,interests,relevant links,etc.)"
                  className={"w-full p-2 border border-gray-300 rounded-md"}
                  value={form.aboutMe}
                  name="aboutMe"
                  onChange={handleChangeSimple}
                />
              </div>
            </div>
          )}

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
                {/* job availability */}
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
                      <SelectValue placeholder="Select Your Availability" />
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
                {/* job location */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Job Location
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
                        {jobLocations.map((type) => (
                          <SelectItem key={type.key} value={type.value}>
                            {type.value}
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
                        variant={"outline"}
                        className={cn(
                          "w-full md:w-[240px] justify-start text-left font-normal hover:cursor-pointer",
                          !form.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.startDate ? (
                          format(form.startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
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
                    id="willingTorelocate"
                    checked={form.willingToRelocate}
                    onChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        willingToRelocate: checked ? true : false,
                      }))
                    }
                  />
                  <label
                    htmlFor="willingTorelocate"
                    className="text-sm font-medium leading-none"
                  >
                    Are you willing to relocate?
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mt-4">
                  Resume (PDF)
                </label>
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

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step == 1 && <Button>Skip form</Button>}
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
            {step === 3 &&
              (submitting ? (
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
              ))}
          </div>
        </form>
      </div>
    </div>
  );
}
