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
  | "ND"
  | "GD"
  | "PD"
  | "IED"
  | "IND"
  | "IGD"
  | "IPD"

export const COACH_RANK_OPTIONS: Array<{ value: CoachRank; label: string }> = [
  { value: "Coach", label: "New Coach" },
  { value: "SC", label: "Senior Coach" },
  { value: "Manager", label: "Manager" },
  { value: "AD", label: "Associate Director" },
  { value: "Director", label: "Director" },
  { value: "ED", label: "Executive Director" },
  { value: "ND", label: "National Director" },
  { value: "GD", label: "Global Director" },
  { value: "PD", label: "Presidential Director" },
  { value: "IED", label: "Integrated Executive Director" },
  { value: "IND", label: "Integrated National Director" },
  { value: "IGD", label: "Integrated Global Director" },
  { value: "IPD", label: "Integrated Presidential Director" },
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
  return ["IED", "IND", "IGD", "IPD"].includes(rank)
}
