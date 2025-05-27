"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  SelectChangeEvent,
  Checkbox,
  TextField,
} from "@mui/material";
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
import dayjs from "dayjs";
import { jobLocations, jobTypes, positions } from "@/utils/constants";
import { Button } from "@/components/ui/button";
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

export default function JobGiverSignupPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    jobRoles: [],
    salaryMin: "",
    salaryMax: "",
    availability: "Full-Time",
    jobLocation: "Onsite",
    qualifications: "",
    description: "",
    deadline: dayjs().format("YYYY-MM-DD"),
  });

  // Prefill with authenticated user’s info if available
  useEffect(() => {
    if (isLoaded && user) {
      setForm((f) => ({
        ...f,
        email: user.emailAddresses[0]?.emailAddress ?? f.email,
        phone: user.phoneNumbers[0]?.phoneNumber ?? f.phone,
        contactPerson: user.fullName ?? f.contactPerson,
      }));
    }
  }, [isLoaded, user]);

  const [step, setStep] = useState(1);

  const handleChangeText = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Giver Signup Data:", form);
    router.push("/job-giver/dashboard");
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
              <h1 className="font-bold text-blue-700 text-3xl text-center mb-6">
                Company & Contact Info
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                {[
                  { label: "Company Name", name: "companyName", type: "text" },
                  {
                    label: "Contact Person",
                    name: "contactPerson",
                    type: "text",
                  },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone Number", name: "phone", type: "tel" },
                ].map((fld) => (
                  <div key={fld.name}>
                    <TextField
                      fullWidth
                      label={fld.label}
                      name={fld.name}
                      type={fld.type}
                      value={form[fld.name]}
                      onChange={handleChangeText}
                      required
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Website (optional)"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleChangeText}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChangeText}
                  />
                </div>
                <div className="md:col-span-2">
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
            <>
              <h1 className="font-bold text-blue-700 text-3xl text-center mb-6">
                Job Posting Details
              </h1>
              <div className="space-y-6">
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

                <div className="grid grid-cols-2 gap-2">
                  <TextField
                    fullWidth
                    label="Salary Min (₹)"
                    name="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={handleChangeText}
                  />
                  <TextField
                    fullWidth
                    label="Salary Max (₹)"
                    name="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={handleChangeText}
                  />
                </div>

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
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-bold text-blue-700 text-3xl text-center mb-6">
                Requirements & Publish
              </h1>
              <div className="flex flex-col gap-6">
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Qualifications / Requirements"
                  name="qualifications"
                  value={form.qualifications}
                  onChange={handleChangeText}
                  placeholder="e.g. Bachelor’s degree, 3+ years experience"
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Job Description"
                  name="description"
                  value={form.description}
                  onChange={handleChangeText}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-600 py-1">
                    Application Deadline Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal hover:cursor-pointer",
                          !form.deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon />
                        {form.deadline ? (
                          format(form.deadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.deadline}
                        onSelect={(date) => {
                          if (date) {
                            setForm((prev) => ({
                              ...prev,
                              deadline: date,
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </>
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
            {step == 3 && (
              <Button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publish Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
