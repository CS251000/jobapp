"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import TextField from "@mui/material/TextField";
import { Button } from "@/components/ui/button";
import StateCitySelect from "@/components/form/stateCityDropdown";
import Loading from "./loading";
import Link from "next/link";

export default function CompanyProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    companyId: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    companyLogoUrl: "",
    aboutCompany: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const[companyId,setCompanyId]= useState("");
  async function fetchCompany() {
    setFetching(true);
    try {
      const res = await fetch(`/api/get-company?uploaderId=${user.id}`);
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to fetch company");
      }
      const data = await res.json();
      if (data.isExisting) setIsExisting(true);
      if (!isExisting) return;
      setForm((f) => ({
        ...f,
        companyId: data.companyId,
        companyName: data.companyName??"",
        contactPerson: data.contactPerson??"",
        email: data.email??"",
        phone: data.phone??"",
        website: data.website??"",
        address: data.address??"",
        city: data.city??"",
        state: data.state??"",
        zip: data.zipCode??"",
        companyLogoUrl: data.companyLogoUrl??"",
        aboutCompany: data.aboutCompany??"",
      }));
    } catch (err) {
      console.log("Failed to fetch company", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        email: user.emailAddresses[0]?.emailAddress || prev.email,
        phone: user.phoneNumbers[0]?.phoneNumber || prev.phone,
        contactPerson: user.fullName || prev.contactPerson,
      }));
      fetchCompany();
    }
  }, [isLoaded, user, isExisting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const payload = {
        clerkId: user.id,
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        website: form.website,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        companyLogoUrl: form.companyLogoUrl,
        aboutCompany: form.aboutCompany,
      };

      const res = await fetch("/api/add-company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setCompanyId(data.companyId);
        router.push(`/job-giver/dashboard?companyId=${data.companyId}`);
      } else {
        const errorData = await res.json();
        console.error("Failed to save company profile:", errorData);
        alert(errorData.error || "Failed to save company profile.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An unexpected error occurred.");
    } finally {
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

  if(isFetching){
    return (
      <Loading/>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-white to-gray-100">
      <div className="w-full max-w-3xl bg-white p-10 rounded-3xl shadow-lg border">
        <div className="flex flex-row justify-between mb-4">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Create Company Profile
        </h1>
        <Link href={`/job-giver/dashboard?companyId=${companyId}`}>
        <Button>
          Go to dashboard
        </Button>
        </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <TextField
                fullWidth
                label="Website (optional)"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                minRows={2}
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
              <TextField
                fullWidth
                label="Company Logo URL (optional)"
                name="companyLogoUrl"
                value={form.companyLogoUrl}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <TextField
                fullWidth
                label="About Company"
                name="aboutCompany"
                multiline
                minRows={4}
                value={form.aboutCompany}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end">
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {isExisting
                ? isSubmitting
                  ? "Updating Company"
                  : "Update Company"
                : isSubmitting
                ? "Uploading..."
                : "Save your Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
