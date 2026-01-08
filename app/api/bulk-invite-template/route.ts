import { NextResponse } from "next/server"

/**
 * GET /api/bulk-invite-template
 * Returns a CSV template for bulk coach invites
 */
export async function GET() {
  // Define the CSV template with headers and example row
  const headers = ["full_name", "email", "coach_rank"]
  
  // Valid coach ranks for reference
  const validRanks = [
    "Coach",
    "SC",
    "MG", 
    "AD",
    "DR",
    "ED",
    "IED",
    "FIBC",
    "IGD",
    "FIBL",
    "IND",
    "IPD"
  ]
  
  // Create CSV content with header row and example
  const csvContent = [
    headers.join(","),
    `"John Doe","john.doe@example.com","Coach"`,
    `"Jane Smith","jane.smith@example.com","SC"`,
    "",
    "# Valid coach_rank values:",
    `# ${validRanks.join(", ")}`,
    "",
    "# Instructions:",
    "# 1. Delete these example rows and comment lines",
    "# 2. Add one coach per row with their full name, email, and rank",
    "# 3. Save the file and upload it to the Bulk Invite page",
    "# 4. Emails must be unique and valid",
    "# 5. Names should be in format: First Last"
  ].join("\n")

  // Return as downloadable CSV file
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=bulk-invite-template.csv",
    },
  })
}
