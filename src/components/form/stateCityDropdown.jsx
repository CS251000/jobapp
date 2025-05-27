import React, { useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { s_a, state_arr } from "@/utils/constants";

export default function StateCitySelect({
  stateValue,
  cityValue,
  zipValue,
  onStateChange,
  onCityChange,
  onZipChange,
}) {

  const cities = useMemo(() => {
    const idx = state_arr.findIndex((s) => s === stateValue);
    if (idx >= 0 && s_a[idx]) {
      return s_a[idx + 1].split("|").map((c) => c.trim());
    }
    return [];
  }, [stateValue]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* State Dropdown */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          State
        </label>
        <Select
          value={stateValue}
           onValueChange={(val) => {
            onStateChange(val);
            onCityChange("");        
          }}
          className="w-full"
        >
          <SelectTrigger className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 hover:cursor-pointer">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {state_arr.map((st) => (
              <SelectItem key={st} value={st} className="px-3 py-2 hover:cursor-pointer">
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Dropdown */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          City
        </label>
        <Select
           value={cityValue}
          onValueChange={onCityChange}
          disabled={!stateValue}
          className="w-full"
        >
          <SelectTrigger className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 hover:cursor-pointer">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent className="w-full max-h-60 overflow-auto">
            {cities.map((ct) => (
              <SelectItem key={ct} value={ct} className="px-3 py-2 hover:cursor-pointer">
                {ct}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Zip Code Input */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Zip Code
        </label>
        <input
          type="text"
          value={zipValue}
          onChange={(e) => onZipChange(e.target.value)}
          className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}