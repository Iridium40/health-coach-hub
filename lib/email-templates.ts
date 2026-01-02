/**
 * Shared email template utilities for consistent styling
 */

export interface EmailTemplateOptions {
  logoUrl?: string
  appUrl?: string
}

/**
 * Get the logo URL for emails
 * In production, this should be an absolute URL to the hosted logo
 */
export function getLogoUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
  return `${baseUrl}/branding/ca_logo.png`
}

/**
 * Get the dark mode logo URL for emails
 */
export function getDarkLogoUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
  return `${baseUrl}/branding/ca_logo_dark.png`
}

/**
 * Generate the email header with logo (supports dark mode)
 */
export function getEmailHeader(title: string, subtitle?: string): string {
  const logoUrl = getLogoUrl()
  const darkLogoUrl = getDarkLogoUrl()
  
  return `
    <style>
      @media (prefers-color-scheme: dark) {
        .email-header {
          background-color: #1a1a1a !important;
          border-bottom-color: #4a7c59 !important;
        }
        .email-header-text {
          color: #e0e0e0 !important;
        }
        .email-logo {
          display: none !important;
        }
        .email-logo-dark {
          display: block !important;
        }
      }
      .email-logo-dark {
        display: none;
      }
    </style>
    <div class="email-header" style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid #2d5016;">
      <img src="${logoUrl}" alt="Coaching Amplifier" class="email-logo" style="max-width: 300px; height: auto; margin-bottom: 20px; display: block;" />
      <img src="${darkLogoUrl}" alt="Coaching Amplifier" class="email-logo-dark" style="max-width: 300px; height: auto; margin-bottom: 20px; margin-left: auto; margin-right: auto;" />
      ${subtitle ? `<p class="email-header-text" style="color: #666; font-size: 16px; margin: 10px 0 0 0;">${subtitle}</p>` : ""}
    </div>
  `
}

/**
 * Generate the email footer (supports dark mode)
 */
export function getEmailFooter(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
  
  return `
    <div class="email-border" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p class="email-text-muted" style="color: #666; font-size: 14px; margin: 10px 0;">
        <a href="${appUrl}" class="email-link" style="color: #2d5016; text-decoration: none;">Coaching Amplifier</a>
      </p>
      <p class="email-text-muted" style="color: #999; font-size: 12px; margin: 5px 0;">
        Amplify your coaching business with powerful resources and tools
      </p>
      <p class="email-text-muted" style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
        © ${new Date().getFullYear()} Coaching Amplifier. All rights reserved.
      </p>
    </div>
  `
}

/**
 * Generate a primary button style
 */
export function getButtonStyle(): string {
  return "background-color: #2d5016; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;"
}

/**
 * Generate the base email wrapper (supports dark mode)
 */
export function getEmailWrapper(content: string, title?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${title || "Coaching Amplifier"}</title>
        <style>
          @media (prefers-color-scheme: dark) {
            .email-body {
              background-color: #0a0a0a !important;
            }
            .email-container {
              background-color: #1a1a1a !important;
            }
            .email-text {
              color: #e0e0e0 !important;
            }
            .email-text-muted {
              color: #b0b0b0 !important;
            }
            .email-link {
              color: #7cb342 !important;
            }
            .email-border {
              border-color: #333 !important;
            }
          }
        </style>
      </head>
      <body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        <div class="email-container" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${content}
        </div>
      </body>
    </html>
  `
}

/**
 * Generate module completion email template
 */
export function getModuleCompletionEmailTemplate(options: {
  fullName: string
  completedModuleTitle: string
  completedModuleNumber: number
  unlockedModuleTitle?: string
  unlockedModuleNumber?: number
  unlockedModuleRank?: string
  appUrl?: string
}): { subject: string; html: string; text: string } {
  const appUrl = options.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
  const trainingUrl = `${appUrl}/training`
  const academyUrl = options.unlockedModuleNumber 
    ? `${appUrl}/academy/module-${options.unlockedModuleNumber}`
    : trainingUrl

  const hasUnlockedModule = !!options.unlockedModuleTitle

  const subject = hasUnlockedModule
    ? `🎉 Achievement Unlocked: ${options.completedModuleTitle} Complete!`
    : `🎉 Module Complete: ${options.completedModuleTitle}!`

  const header = getEmailHeader(
    hasUnlockedModule ? "Achievement Unlocked!" : "Module Complete!",
    "You've completed a Coaching Amplifier Academy module!"
  )

  const unlockedModuleSection = hasUnlockedModule ? `
    <div style="background: linear-gradient(135deg, #2d5016 0%, #2d5016dd 100%); padding: 30px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 10px;">🔓</div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">New Module Unlocked!</h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">You now have access to Module ${options.unlockedModuleNumber}</p>
    </div>

    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2d5016;">
      <h2 style="color: #2d5016; margin-top: 0; font-size: 24px; font-weight: bold;">
        ${options.unlockedModuleTitle}
      </h2>
      ${options.unlockedModuleRank ? `
        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px; line-height: 1.5;">
          <strong>Required Rank:</strong> ${options.unlockedModuleRank}
        </p>
      ` : ''}
      <p style="color: #666; margin: 10px 0 0 0; font-size: 16px; line-height: 1.5;">
        Continue your journey with the next level of training designed to elevate your coaching career.
      </p>
    </div>
  ` : ''

  const bodyContent = `
    <div style="padding: 30px 20px;">
      <div style="background: linear-gradient(135deg, #00A651 0%, #00c760 100%); padding: 30px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Congratulations!</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">You've successfully completed Module ${options.completedModuleNumber}</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #00A651;">
        <h2 style="color: #00A651; margin-top: 0; font-size: 24px; font-weight: bold;">
          ${options.completedModuleTitle}
        </h2>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px; line-height: 1.5;">
          You've passed the module quiz with flying colors and demonstrated mastery of the material. Your dedication to continuous learning is inspiring!
        </p>
      </div>
      
      ${unlockedModuleSection}
      
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${options.fullName},</p>
      
      <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
        ${hasUnlockedModule 
          ? `Congratulations on completing <strong>${options.completedModuleTitle}</strong>! Your hard work has paid off, and you've unlocked access to <strong>${options.unlockedModuleTitle}</strong>.`
          : `Congratulations on completing <strong>${options.completedModuleTitle}</strong>! You've successfully mastered this module and demonstrated your commitment to growth.`
        }
      </p>
      
      <p class="email-text" style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
        ${hasUnlockedModule
          ? `You're making incredible progress in the Coaching Amplifier Academy! Ready to take on the next challenge?`
          : `Your dedication to learning and growth is impressive. Keep up the excellent work as you continue your coaching journey!`
        }
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        ${hasUnlockedModule ? `
          <a href="${academyUrl}" style="${getButtonStyle()} margin-right: 10px;">
            Start Next Module
          </a>
          <a href="${trainingUrl}" style="background-color: #666; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
            View All Modules
          </a>
        ` : `
          <a href="${trainingUrl}" style="${getButtonStyle()}">
            View Training Center
          </a>
        `}
      </div>
      
      <div style="background-color: #e7f5e7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
        <p style="margin: 0; font-size: 14px; color: #2d5016;">
          <strong>💡 Tip:</strong> ${hasUnlockedModule 
            ? `Continue your momentum by starting the next module while the concepts are fresh in your mind!`
            : `Continue completing modules to unlock new training and advance your coaching career!`
          }
        </p>
      </div>
      
      <p class="email-text" style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong>The Coaching Amplifier Team</strong>
      </p>
    </div>
  `

  const footer = getEmailFooter()
  const html = getEmailWrapper(header + bodyContent + footer, "Module Complete - Coaching Amplifier")

  const text = `
Congratulations! You've completed a module!

Hi ${options.fullName},

${hasUnlockedModule 
  ? `Congratulations on completing ${options.completedModuleTitle}! Your hard work has paid off, and you've unlocked access to ${options.unlockedModuleTitle}.`
  : `Congratulations on completing ${options.completedModuleTitle}! You've successfully mastered this module and demonstrated your commitment to growth.`
}

${hasUnlockedModule
  ? `You're making incredible progress in the Coaching Amplifier Academy! Ready to take on the next challenge?`
  : `Your dedication to learning and growth is impressive. Keep up the excellent work as you continue your coaching journey!`
}

${hasUnlockedModule
  ? `Start Next Module: ${academyUrl}\nView All Modules: ${trainingUrl}`
  : `View Training Center: ${trainingUrl}`
}

${hasUnlockedModule 
  ? `Tip: Continue your momentum by starting the next module while the concepts are fresh in your mind!`
  : `Tip: Continue completing modules to unlock new training and advance your coaching career!`
}

Best regards,
The Coaching Amplifier Team
  `.trim()

  return { subject, html, text }
}

/**
 * Generate email template for Health Assessment results
 */
export function getHealthAssessmentEmailTemplate(options: {
  coachName: string
  clientName: string
  clientPhone?: string
  clientWhy?: string
  clientCommitment?: string
  callOutcome: string
  callNotes?: string
  checkedItems: string[]
  notes: Record<string, string>
  timerSeconds: number
  progress: number
  phaseProgress: Array<{ phase: string; checked: number; total: number }>
}): { subject: string; html: string; text: string } {
  const subject = `Health Assessment Call Results - ${options.clientName || "Client"}`

  const header = getEmailHeader("Health Assessment Call Results")

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const outcomeLabels: Record<string, string> = {
    enrolled: "✅ Enrolled!",
    followup: "📅 Follow-up scheduled",
    thinking: "🤔 Thinking about it",
    "not-ready": "⏸️ Not ready now",
    "not-fit": "❌ Not a good fit",
  }

  const bodyContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #2d5016; margin-bottom: 20px;">Health Assessment Call Summary</h2>
      
      <div style="background: #f0fdf4; border: 2px solid #00A651; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #00A651; margin-top: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Client Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #166534;">Name:</td>
            <td style="padding: 8px 0; color: #1e293b;">${options.clientName || "Not provided"}</td>
          </tr>
          ${options.clientPhone ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #166534;">Phone:</td>
            <td style="padding: 8px 0; color: #1e293b;">${options.clientPhone}</td>
          </tr>
          ` : ""}
          ${options.clientWhy ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #166534;">Their "Why":</td>
            <td style="padding: 8px 0; color: #1e293b;">${options.clientWhy}</td>
          </tr>
          ` : ""}
          ${options.clientCommitment ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #166534;">Commitment Level:</td>
            <td style="padding: 8px 0; color: #1e293b;">${options.clientCommitment}/10</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #2d5016; margin-top: 0;">Call Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Duration:</td>
            <td style="padding: 8px 0; color: #1e293b;">${formatTime(options.timerSeconds)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Progress:</td>
            <td style="padding: 8px 0; color: #1e293b;">${options.progress}% complete</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Outcome:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${outcomeLabels[options.callOutcome] || options.callOutcome}</td>
          </tr>
        </table>
      </div>

      ${options.phaseProgress && options.phaseProgress.length > 0 ? `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #2d5016; margin-top: 0;">Phase Progress</h3>
        ${options.phaseProgress.map((phase) => `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 600; color: #1e293b;">${phase.phase}</span>
              <span style="color: ${phase.checked === phase.total && phase.total > 0 ? "#00A651" : "#64748b"}; font-weight: ${phase.checked === phase.total && phase.total > 0 ? "bold" : "normal"}">
                ${phase.checked}/${phase.total}
              </span>
            </div>
            <div style="background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: ${phase.checked === phase.total && phase.total > 0 ? "#00A651" : "#94a3b8"}; height: 100%; width: ${phase.total > 0 ? (phase.checked / phase.total) * 100 : 0}%; border-radius: 4px;"></div>
            </div>
          </div>
        `).join("")}
      </div>
      ` : ""}

      ${Object.keys(options.notes).length > 0 ? `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #2d5016; margin-top: 0;">Your Notes</h3>
        ${Object.entries(options.notes).map(([key, value]) => value ? `
          <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-left: 3px solid #00A651; border-radius: 4px;">
            <p style="margin: 0; color: #1e293b; white-space: pre-wrap;">${value}</p>
          </div>
        ` : "").join("")}
      </div>
      ` : ""}

      ${options.callNotes ? `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #2d5016; margin-top: 0;">Additional Notes</h3>
        <p style="color: #1e293b; white-space: pre-wrap; line-height: 1.6;">${options.callNotes}</p>
      </div>
      ` : ""}

      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-top: 20px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>💡 Next Steps:</strong> ${options.callOutcome === "enrolled" 
            ? "Follow up with enrollment details and welcome materials." 
            : options.callOutcome === "followup" 
            ? "Schedule and prepare for the follow-up call." 
            : "Continue nurturing the relationship and provide value through resources and tips."}
        </p>
      </div>
    </div>
  `

  const footer = getEmailFooter()
  const html = getEmailWrapper(header + bodyContent + footer, "Health Assessment Results - Coaching Amplifier")

  const text = `
Health Assessment Call Results

Client: ${options.clientName || "Not provided"}
${options.clientPhone ? `Phone: ${options.clientPhone}\n` : ""}
${options.clientWhy ? `Their "Why": ${options.clientWhy}\n` : ""}
${options.clientCommitment ? `Commitment Level: ${options.clientCommitment}/10\n` : ""}

Call Duration: ${formatTime(options.timerSeconds)}
Progress: ${options.progress}%
Outcome: ${outcomeLabels[options.callOutcome] || options.callOutcome}

${options.callNotes ? `\nAdditional Notes:\n${options.callNotes}\n` : ""}

Next Steps: ${options.callOutcome === "enrolled" 
  ? "Follow up with enrollment details and welcome materials." 
  : options.callOutcome === "followup" 
  ? "Schedule and prepare for the follow-up call." 
  : "Continue nurturing the relationship and provide value."}

---
Coaching Amplifier
  `.trim()

  return { subject, html, text }
}
