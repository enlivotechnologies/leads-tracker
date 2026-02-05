"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadFormValues, leadSchema } from "@/lib/validations";
import {
  DESIGNATION_OPTIONS,
  CALL_TYPE_OPTIONS,
  RESPONSE_STATUS_OPTIONS,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading";
import { useEffect, useState } from "react";
import { checkCollegeAvailability } from "@/app/actions/leads";

interface AddLeadFormProps {
  onSubmit: (data: LeadFormValues) => Promise<void>;
  onCancel: () => void;
}

export function AddLeadForm({ onSubmit, onCancel }: AddLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [suggestions, setSuggestions] = useState<
    { name: string; location: string; label: string }[]
  >([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suppressSuggest, setSuppressSuggest] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    mode: "onChange",
    defaultValues: {
      callType: "FIRST_CALL",
      slotRequested: false,
      responseStatus: "CALL_LATER",
    },
  });

  const slotRequested = watch("slotRequested");
  const callType = watch("callType");
  const collegeName = watch("collegeName");

  useEffect(() => {
    if (callType !== "FOLLOW_UP") {
      setValue("followUpDate", undefined);
    }
  }, [callType, setValue]);

  useEffect(() => {
    if (suppressSuggest) {
      setSuppressSuggest(false);
      return;
    }
    const name = collegeName?.trim();
    if (!name || name.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const response = await fetch(
          `/api/colleges?input=${encodeURIComponent(name)}`,
        );
        const data = await response.json();
        setSuggestions(data.suggestions ?? []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [collegeName]);

  const handleCheckAvailability = async () => {
    const name = collegeName?.trim();
    if (!name) return;

    setAvailabilityStatus("checking");
    try {
      const result = await checkCollegeAvailability(name);
      setAvailabilityStatus(result.available ? "available" : "unavailable");
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus("idle");
    }
  };

  const handleFormSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* College Name - Required */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="collegeName">
            College Name <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={!collegeName?.trim() || availabilityStatus === "checking"}
            className={
              availabilityStatus === "checking"
                ? "text-xs text-slate-400"
                : "text-xs text-blue-600 hover:text-blue-700"
            }
          >
            {availabilityStatus === "checking" ? "Checking..." : "Check"}
          </button>
        </div>
        <div className="relative">
          <Input
            id="collegeName"
            placeholder="Enter full college name"
            autoComplete="off"
            {...register("collegeName")}
          />
          {(isSuggesting || suggestions.length > 0) && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-sm">
              {isSuggesting && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  Loading suggestions...
                </div>
              )}
              {!isSuggesting && suggestions.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  No matches found
                </div>
              )}
              {!isSuggesting &&
                suggestions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setValue("collegeName", item.name, {
                        shouldValidate: true,
                      });
                      if (item.location) {
                        setValue("location", item.location, {
                          shouldValidate: true,
                        });
                      }
                      setSuppressSuggest(true);
                      setSuggestions([]);
                      setAvailabilityStatus("idle");
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          )}
        </div>
        {availabilityStatus === "available" && (
          <p className="text-xs text-emerald-600">Available</p>
        )}
        {availabilityStatus === "unavailable" && (
          <p className="text-xs text-red-600">
            Already contacted by another employee
          </p>
        )}
        {errors.collegeName && (
          <p className="text-sm text-red-500">{errors.collegeName.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City / District"
          {...register("location")}
        />
      </div>

      {/* Contact Person */}
      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Input
          id="contactPerson"
          placeholder="Name of the contact"
          {...register("contactPerson")}
        />
      </div>

      {/* Designation & Phone - Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select
            id="designation"
            options={DESIGNATION_OPTIONS}
            placeholder="Select..."
            {...register("designation")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Phone number"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Call Type & Follow-up Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="callType">Call Type</Label>
          <Select
            id="callType"
            options={CALL_TYPE_OPTIONS}
            {...register("callType")}
          />
        </div>

        {callType === "FOLLOW_UP" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="followUpDate">
              Follow-up Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="followUpDate"
              type="date"
              {...register("followUpDate")}
            />
            {errors.followUpDate && (
              <p className="text-sm text-red-500">
                {errors.followUpDate.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Response Status */}
      <div className="space-y-2">
        <Label htmlFor="responseStatus">
          Response <span className="text-red-500">*</span>
        </Label>
        <Select
          id="responseStatus"
          options={RESPONSE_STATUS_OPTIONS}
          {...register("responseStatus")}
        />
      </div>

      {/* Slot Requested Toggle */}
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="slotRequested" className="cursor-pointer">
          Slot Booked?
        </Label>
        <Switch
          id="slotRequested"
          checked={slotRequested}
          onCheckedChange={(checked) => {
            setValue("slotRequested", checked);
            if (!checked) {
              setValue("slotDate", undefined);
            }
          }}
        />
      </div>

      {/* Slot Date - Conditional */}
      {slotRequested && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Label htmlFor="slotDate">
            Slot Date <span className="text-red-500">*</span>
          </Label>
          <Input id="slotDate" type="date" {...register("slotDate")} />
          {errors.slotDate && (
            <p className="text-sm text-red-500">{errors.slotDate.message}</p>
          )}
        </div>
      )}

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks / Notes</Label>
        <Textarea
          id="remarks"
          placeholder="Any additional notes..."
          rows={3}
          {...register("remarks")}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Saving...
            </>
          ) : (
            "Save Lead"
          )}
        </Button>
      </div>
    </form>
  );
}
