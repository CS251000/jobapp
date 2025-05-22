"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { positions } from "@/utils/constants";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { Button } from "@/components/ui/button";
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

  const [form, setForm] = useState({
    fullName: "",
    age: 18,
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    jobType: [],
    skills: "",
    resume: null,
    salary: 1000,
    experience: 0,
    availability: "Full-time",
    startDate: "",
    jobLocation: "Remote",
  });

  // Prefill user info once loaded
  useEffect(() => {
    if (isLoaded && user) {
      setForm((f) => ({
        ...f,
        fullName: user.fullName ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        phone: user.phoneNumbers[0]?.phoneNumber ?? "",
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

  const handleJobTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setForm((prev) => ({
      ...prev,
      jobType: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Seeker Signup Data:", form);
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
                  ${step === s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["city", "state", "zip"].map((fld) => (
                      <div key={fld}>
                        <label className="block text-sm font-semibold text-gray-600">
                          {fld.charAt(0).toUpperCase() + fld.slice(1)}
                        </label>
                        <input
                          type="text"
                          name={fld}
                          value={form[fld]}
                          onChange={handleChangeSimple}
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
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
                <InputLabel id="jobtype-label">Job Roles</InputLabel>
                <Select
                  labelId="jobtype-label"
                  multiple
                  value={form.jobType}
                  onChange={handleJobTypeChange}
                  input={<OutlinedInput label="Job Roles" />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos.key} value={pos.value}>
                      <Checkbox checked={form.jobType.includes(pos.value)} />
                      <ListItemText primary={pos.value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div>
                <label className="block text-sm font-semibold text-gray-600">
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={form.skills}
                  onChange={handleChangeSimple}
                  placeholder="e.g. Forklift, Excel, Customer Service"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-bold text-blue-700 text-2xl mb-4 text-center">
                Experience & Availability
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Expected Salary ($)", name: "salary", type: "number" },
                  { label: "Years of Experience", name: "experience", type: "number" },
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleChangeSimple}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Preferred Job Location
                  </label>
                  <select
                    name="jobLocation"
                    value={form.jobLocation}
                    onChange={handleChangeSimple}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">
                  Available Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChangeSimple}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">
                  Resume (PDF)
                </label>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf"
                  onChange={handleChangeSimple}
                  className="mt-1 block w-full text-gray-600"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
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
            {step==3&& (
              <Button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
