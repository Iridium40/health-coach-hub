import { NextResponse } from "next/server"

/**
 * GET /api/bulk-invite-template
 * Returns a CSV template for bulk coach invites
 */
export async function GET() {
  // Define the CSV template with headers and example row
  const headers = ["first_name", "last_name", "email"]
  
  // Create CSV content with header row and example
  const csvContent = [
    headers.join(","),
    `"John","Doe","john.doe@example.com"`,
    `"Jane","Smith","jane.smith@example.com"`,
    "",
    "# Instructions:",
    "# 1. Delete these example rows and comment lines",
    "# 2. Add one coach per row with their first name, last name, and email",
    "# 3. Save the file and upload it to the Bulk Invite page",
    "# 4. Emails must be unique and valid"
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
