/**
 * OPTAVIA Coach Ranks
 * Based on the official OPTAVIA Integrated Compensation Plan
 * Updated: January 2026
 */

export type CoachRank =
  | "Coach"
  | "SC"
  | "Manager"
  | "AD"
  | "Director"
  | "ED"
  | "IED"
  | "FIBC"
  | "RD"
  | "IRD"
  | "ND"
  | "IND"
  | "GD"
  | "IGD"
  | "FIBL"
  | "PD"
  | "IPD"

export const COACH_RANK_OPTIONS: Array<{ value: CoachRank; label: string }> = [
  { value: "Coach", label: "Coach" },
  { value: "SC", label: "Senior Coach (SC)" },
  { value: "Manager", label: "Manager" },
  { value: "AD", label: "Associate Director (AD)" },
  { value: "Director", label: "Director" },
  { value: "ED", label: "Executive Director (ED)" },
  { value: "IED", label: "Integrated Executive Director (IED)" },
  { value: "FIBC", label: "Fully Integrated Business Coach (FIBC)" },
  { value: "RD", label: "Regional Director (RD)" },
  { value: "IRD", label: "Integrated Regional Director (IRD)" },
  { value: "ND", label: "National Director (ND)" },
  { value: "IND", label: "Integrated National Director (IND)" },
  { value: "GD", label: "Global Director (GD)" },
  { value: "IGD", label: "Integrated Global Director (IGD)" },
  { value: "FIBL", label: "Fully Integrated Business Leader (FIBL)" },
  { value: "PD", label: "Presidential Director (PD)" },
  { value: "IPD", label: "Integrated Presidential Director (IPD)" },
]

/**
 * Get rank display name
 */
export function getRankDisplayName(rank: CoachRank): string {
  const option = COACH_RANK_OPTIONS.find(o => o.value === rank)
  return option?.label || rank
}

/**
 * Check if a rank is an "Integrated" rank
 */
export function isIntegratedRank(rank: CoachRank): boolean {
  return ["IED", "FIBC", "IRD", "IND", "IGD", "FIBL", "IPD"].includes(rank)
}
