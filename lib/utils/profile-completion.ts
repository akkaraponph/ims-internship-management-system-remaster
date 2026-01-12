import { students } from "@/lib/db/schema";
import type { Student } from "@/types";

export interface ProfileCompletion {
  personal: boolean;
  academic: boolean;
  address: boolean;
  resume: boolean;
}

export function calculateProfileCompletion(student: Student | null): ProfileCompletion {
  if (!student) {
    return {
      personal: false,
      academic: false,
      address: false,
      resume: false,
    };
  }

  // Personal info completion
  const personalComplete =
    !!student.firstName &&
    !!student.lastName &&
    !!student.email &&
    !!student.phone &&
    !!student.dateOfBirth;

  // Academic info completion
  const academicComplete =
    !!student.program &&
    !!student.department &&
    !!student.presentGpa;

  // Address completion
  const addressComplete =
    !!student.presentAddressId &&
    !!student.permanentAddressId;

  // Resume completion
  const resumeComplete = student.resumeStatus === true;

  return {
    personal: personalComplete,
    academic: academicComplete,
    address: addressComplete,
    resume: resumeComplete,
  };
}

export function getProfileCompletionPercentage(completion: ProfileCompletion): number {
  const completed = Object.values(completion).filter(Boolean).length;
  const total = Object.keys(completion).length;
  return total > 0 ? (completed / total) * 100 : 0;
}
