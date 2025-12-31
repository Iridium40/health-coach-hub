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

interface ShoppingItem {
  ingredient: string
  count: number
}

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      clientName, 
      coachName, 
      personalMessage,
      mealPlanEntries, 
      shoppingList 
    } = await request.json() as {
      to: string
      clientName: string
      coachName: string
      personalMessage?: string
      mealPlanEntries: MealPlanEntry[]
      shoppingList: ShoppingItem[]
    }

    if (!to || !clientName || !coachName || !mealPlanEntries) {
      return NextResponse.json(
        { error: "Missing required fields: to, clientName, coachName, mealPlanEntries" },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"

    // Create shareable meal plan URL with encoded data
    const planDataForUrl = mealPlanEntries.map(entry => ({
      day: entry.day,
      meal: entry.meal,
      recipeId: entry.recipeId || entry.recipeTitle.toLowerCase().replace(/\s+/g, '-'), // Fallback for older entries
    }))
    const encodedPlan = Buffer.from(JSON.stringify(planDataForUrl)).toString('base64')
    const mealPlanUrl = `${appUrl}/client/meal-plan?client=${encodeURIComponent(clientName)}&coach=${encodeURIComponent(coachName)}&plan=${encodedPlan}`
    
    // Client-facing recipe URL (public, no auth required)
    const clientRecipesUrl = `${appUrl}/client/recipes?coach=${encodeURIComponent(coachName)}`

    // Group meals by day
    const mealsByDay: Record<string, { lunch?: string; dinner?: string }> = {}
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    days.forEach(day => {
      mealsByDay[day] = { lunch: undefined, dinner: undefined }
    })
    
    mealPlanEntries.forEach(entry => {
      const dayCapitalized = entry.day.charAt(0).toUpperCase() + entry.day.slice(1)
      if (mealsByDay[dayCapitalized]) {
        if (entry.meal === "lunch") {
          mealsByDay[dayCapitalized].lunch = entry.recipeTitle
        } else if (entry.meal === "dinner") {
          mealsByDay[dayCapitalized].dinner = entry.recipeTitle
        }
      }
    })

    // Build meal plan table
    const mealPlanRows = days.map(day => {
      const meals = mealsByDay[day]
      return `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb; color: #374151;">
            ${day}
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #4b5563;">
            ${meals.lunch || '<span style="color: #9ca3af;">-</span>'}
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #4b5563;">
            ${meals.dinner || '<span style="color: #9ca3af;">-</span>'}
          </td>
        </tr>
      `
    }).join("")

    // Build shopping list
    const shoppingListHtml = shoppingList.length > 0 
      ? `
        <div style="margin-top: 30px;">
          <h3 style="color: #2d5016; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">
            🛒 Shopping List
          </h3>
          <div style="columns: 2; column-gap: 30px;">
            ${shoppingList.map(item => `
              <div style="break-inside: avoid; padding: 6px 0; color: #4b5563;">
                • ${item.ingredient}${item.count > 1 ? ` <span style="color: #9ca3af;">(x${item.count})</span>` : ''}
              </div>
            `).join("")}
          </div>
        </div>
      `
      : ""

    // Personal message section
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

    // Create email content
    const subject = `Your Personalized Meal Plan from ${coachName}`
    
    const header = getEmailHeader("Your Weekly Meal Plan", `Prepared especially for you by ${coachName}`)
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${clientName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 25px 0;">
          I've prepared a personalized weekly meal plan just for you! These Lean & Green recipes are designed to support your health journey while keeping your meals delicious and satisfying.
        </p>

        ${personalMessageHtml}
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="color: #2d5016; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #2d5016; padding-bottom: 10px;">
            📅 Weekly Meal Schedule
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr>
                <th style="padding: 12px; border: 1px solid #e5e7eb; background-color: #2d5016; color: white; text-align: left;">Day</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; background-color: #2d5016; color: white; text-align: left;">Lunch</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; background-color: #2d5016; color: white; text-align: left;">Dinner</th>
              </tr>
            </thead>
            <tbody>
              ${mealPlanRows}
            </tbody>
          </table>
        </div>
        
        ${shoppingListHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${mealPlanUrl}" style="${getButtonStyle()}">
            View Your Meal Plan Online
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${clientRecipesUrl}" style="color: #2d5016; text-decoration: underline; font-size: 14px;">
            Browse All Lean & Green Recipes →
          </a>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
          <p style="margin: 0; font-size: 14px; color: #065f46;">
            <strong>Tip:</strong> Print out your shopping list and meal plan to keep them handy throughout the week. Remember, preparation is key to success!
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

    // Plain text version
    const shoppingListText = shoppingList.length > 0
      ? `\n\nSHOPPING LIST\n${"-".repeat(20)}\n${shoppingList.map(item => `- ${item.ingredient}${item.count > 1 ? ` (x${item.count})` : ""}`).join("\n")}`
      : ""

    const mealPlanText = days.map(day => {
      const meals = mealsByDay[day]
      return `${day}:\n  Lunch: ${meals.lunch || "-"}\n  Dinner: ${meals.dinner || "-"}`
    }).join("\n")

    const textContent = `
Your Weekly Meal Plan from ${coachName}
${"=".repeat(40)}

Hi ${clientName},

I've prepared a personalized weekly meal plan just for you! These Lean & Green recipes are designed to support your health journey while keeping your meals delicious and satisfying.

${personalMessage ? `"${personalMessage}" — ${coachName}\n` : ""}

WEEKLY MEAL SCHEDULE
${"-".repeat(20)}
${mealPlanText}
${shoppingListText}

View your meal plan online: ${mealPlanUrl}

Browse all recipes at: ${clientRecipesUrl}

Tip: Print out your shopping list and meal plan to keep them handy throughout the week. Remember, preparation is key to success!

You've got this! Let me know if you have any questions.

Best regards,
${coachName}
Your OPTAVIA Health Coach
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <onboarding@coachingamplifier.com>",
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

