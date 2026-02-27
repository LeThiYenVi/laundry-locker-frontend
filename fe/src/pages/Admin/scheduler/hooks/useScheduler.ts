import {
  useGetSchedulerStatusQuery,
  useTriggerAutoCancelMutation,
  useTriggerBoxReleaseMutation,
  useTriggerPickupRemindersMutation,
} from "@/stores/apis/admin/scheduler";
import { useState } from "react";

export interface JobResult {
  jobName: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

export function useScheduler() {
  const {
    data: statusData,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useGetSchedulerStatusQuery();

  const [triggerAutoCancel, { isLoading: isTriggeringCancel }] = useTriggerAutoCancelMutation();
  const [triggerBoxRelease, { isLoading: isTriggeringRelease }] = useTriggerBoxReleaseMutation();
  const [triggerPickupReminders, { isLoading: isTriggeringReminders }] = useTriggerPickupRemindersMutation();

  const [jobResults, setJobResults] = useState<JobResult[]>([]);

  const isLoading = isLoadingStatus || isTriggeringCancel || isTriggeringRelease || isTriggeringReminders;

  const addJobResult = (jobName: string, success: boolean, message: string) => {
    setJobResults((prev) => [
      {
        jobName,
        success,
        message,
        timestamp: new Date(),
      },
      ...prev.slice(0, 9), // Keep last 10 results
    ]);
  };

  const handleTriggerAutoCancel = async () => {
    try {
      const result = await triggerAutoCancel().unwrap();
      addJobResult(
        "Auto-Cancel Orders",
        true,
        result.data?.message || "Job triggered successfully"
      );
      return true;
    } catch (error: any) {
      addJobResult(
        "Auto-Cancel Orders",
        false,
        error?.data?.message || "Failed to trigger job"
      );
      return false;
    }
  };

  const handleTriggerBoxRelease = async () => {
    try {
      const result = await triggerBoxRelease().unwrap();
      addJobResult(
        "Release Boxes",
        true,
        result.data?.message || "Job triggered successfully"
      );
      return true;
    } catch (error: any) {
      addJobResult(
        "Release Boxes",
        false,
        error?.data?.message || "Failed to trigger job"
      );
      return false;
    }
  };

  const handleTriggerPickupReminders = async () => {
    try {
      const result = await triggerPickupReminders().unwrap();
      addJobResult(
        "Pickup Reminders",
        true,
        result.data?.message || "Job triggered successfully"
      );
      return true;
    } catch (error: any) {
      addJobResult(
        "Pickup Reminders",
        false,
        error?.data?.message || "Failed to trigger job"
      );
      return false;
    }
  };

  const schedulerStatus = statusData?.data;
  const isEnabled = schedulerStatus?.schedulerEnabled ?? false;
  const activeJobs = schedulerStatus?.jobs ?? [];

  return {
    // Status
    isEnabled,
    activeJobs,
    schedulerStatus,
    isLoadingStatus,
    statusError,
    refetchStatus,
    
    // Trigger functions
    handleTriggerAutoCancel,
    handleTriggerBoxRelease,
    handleTriggerPickupReminders,
    
    // Loading states
    isTriggeringCancel,
    isTriggeringRelease,
    isTriggeringReminders,
    isLoading,
    
    // Results
    jobResults,
  };
}
