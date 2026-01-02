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
 * Generate the email header with logo
 */
export function getEmailHeader(title: string, subtitle?: string): string {
  const logoUrl = getLogoUrl()
  
  return `
    <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid #2d5016;">
      <img src="${logoUrl}" alt="Coaching Amplifier" style="max-width: 300px; height: auto; margin-bottom: 20px;" />
      ${subtitle ? `<p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">${subtitle}</p>` : ""}
    </div>
  `
}

/**
 * Generate the email footer
 */
export function getEmailFooter(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
  
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p style="color: #666; font-size: 14px; margin: 10px 0;">
        <a href="${appUrl}" style="color: #2d5016; text-decoration: none;">Coaching Amplifier</a>
      </p>
      <p style="color: #999; font-size: 12px; margin: 5px 0;">
        Amplify your coaching business with powerful resources and tools
      </p>
      <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
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
 * Generate the base email wrapper
 */
export function getEmailWrapper(content: string, title?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || "Coaching Amplifier"}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
      
      <p style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
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
      
      <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
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

