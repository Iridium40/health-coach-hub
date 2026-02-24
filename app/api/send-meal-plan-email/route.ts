import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

interface MealPlanEntry {
  day: string
  meal: string
  recipeId: string
  recipeTitle: string
  recipeImage: string
}

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      clientName, 
      coachName, 
      personalMessage,
      mealPlanEntries, 
      planType = "5&1"
    } = await request.json() as {
      to: string
      clientName: string
      coachName: string
      personalMessage?: string
      mealPlanEntries: MealPlanEntry[]
      planType?: "5&1" | "4&2"
    }

    if (!to || !clientName || !coachName || !mealPlanEntries) {
      return NextResponse.json(
        { error: "Missing required fields: to, clientName, coachName, mealPlanEntries" },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"

    const planDataForUrl = mealPlanEntries.map(entry => ({
      day: entry.day,
      meal: entry.meal,
      recipeId: entry.recipeId || entry.recipeTitle.toLowerCase().replace(/\s+/g, '-'),
    }))
    const encodedPlan = Buffer.from(JSON.stringify(planDataForUrl)).toString('base64')
    const mealPlanUrl = `${appUrl}/client/meal-plan?client=${encodeURIComponent(clientName)}&coach=${encodeURIComponent(coachName)}&plan=${encodedPlan}`
    
    const clientRecipesUrl = `${appUrl}/client/recipes?coach=${encodeURIComponent(coachName)}`

    const personalMessageHtml = personalMessage 
      ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; font-size: 15px; color: #92400e; font-style: italic;">
            "${personalMessage}"
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #b45309;">
            — ${coachName}
          </p>
        </div>
      `
      : ""

    const mealCount = mealPlanEntries.length
    const subject = `Your Personalized Meal Plan from ${coachName}`
    
    const header = getEmailHeader("Your Weekly Meal Plan", `Prepared especially for you by ${coachName}`)
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${clientName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 25px 0;">
          I've prepared a personalized weekly ${planType === "5&1" ? "5 & 1" : "4 & 2"} meal plan with ${mealCount} Lean & Green ${mealCount === 1 ? "recipe" : "recipes"} just for you! Click the button below to view your plan online.
        </p>

        ${personalMessageHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${mealPlanUrl}" style="${getButtonStyle()}">
            View Your Meal Plan
          </a>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 15px; color: #166534; font-weight: bold;">What you'll find online:</p>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #166534;">✅ Full recipes with cooking instructions</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #166534;">✅ Complete ingredient lists</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #166534;">✅ Auto-generated shopping list</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 14px; color: #166534;">✅ Swap recipes to customize your plan</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 20px 0 30px 0;">
          <a href="${clientRecipesUrl}" style="color: #2d5016; text-decoration: underline; font-size: 14px;">
            Browse All Lean & Green Recipes →
          </a>
        </div>

        <div style="background-color: #fffbeb; padding: 12px 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 13px; color: #92400e;">
            <strong>Tip:</strong> Bookmark the meal plan page so you can access it anytime!
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          You've got this! Let me know if you have any questions.<br><br>
          Best regards,<br>
          <strong>${coachName}</strong><br>
          <span style="color: #666;">Your OPTAVIA Health Coach</span>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "Your Weekly Meal Plan")

    const textContent = `
Your Weekly Meal Plan from ${coachName}
${"=".repeat(40)}

Hi ${clientName},

I've prepared a personalized weekly ${planType === "5&1" ? "5 & 1" : "4 & 2"} meal plan with ${mealCount} Lean & Green ${mealCount === 1 ? "recipe" : "recipes"} just for you!

${personalMessage ? `"${personalMessage}" — ${coachName}\n` : ""}
View your meal plan online: ${mealPlanUrl}

What you'll find online:
- Full recipes with cooking instructions
- Complete ingredient lists
- Auto-generated shopping list
- Swap recipes to customize your plan

Browse all recipes at: ${clientRecipesUrl}

Tip: Bookmark the meal plan page so you can access it anytime!

You've got this! Let me know if you have any questions.

Best regards,
${coachName}
Your OPTAVIA Health Coach
    `

    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <noreply@coachingamplifier.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
