import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, fullName } = await request.json()

    if (!to || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName" },
        { status: 400 }
      )
    }

    const subject = `Welcome, New Coach! | Your OPTAVIA Coaching Journey Starts Here`
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome New Coach! | OPTAVIA Coaching</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #1a1a1a;
            line-height: 1.7;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .hero {
            background: linear-gradient(135deg, #00A651 0%, #00c760 50%, #00A651 100%);
            border-radius: 24px;
            padding: 48px 40px;
            text-align: center;
            margin-bottom: 32px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 12px;
        }

        .hero p {
            font-size: 1.2rem;
            opacity: 0.95;
        }

        .hero .emoji {
            font-size: 3rem;
            margin-bottom: 16px;
            display: block;
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 32px;
            margin-bottom: 24px;
            box-shadow: 0 4px 24px rgba(0, 166, 81, 0.08);
            border: 1px solid rgba(0, 166, 81, 0.1);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }

        .card-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #00A651 0%, #00c760 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            flex-shrink: 0;
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a1a1a;
        }

        .card-subtitle {
            font-size: 0.95rem;
            color: #666;
            margin-top: 4px;
        }

        .secret-box {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border-left: 5px solid #ffc107;
        }

        .secret-box .label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #f57c00;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .secret-box .content {
            font-size: 1.15rem;
            font-weight: 600;
            color: #333;
        }

        .apprentice-flow {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin: 24px 0;
        }

        .flow-step {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            padding: 16px 24px;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            color: #2e7d32;
        }

        .flow-arrow {
            font-size: 1.5rem;
            color: #00A651;
        }

        .quote-box {
            background: #f5f5f5;
            border-radius: 16px;
            padding: 24px;
            margin: 20px 0;
            font-style: italic;
            color: #555;
            border-left: 4px solid #00A651;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 24px 0;
        }

        .action-item {
            background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            border: 2px solid transparent;
        }

        .action-item .icon {
            font-size: 2.5rem;
            margin-bottom: 12px;
        }

        .action-item .action-word {
            font-size: 1.3rem;
            font-weight: 700;
            color: #00A651;
            margin-bottom: 8px;
        }

        .action-item .action-desc {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }

        .important-banner {
            background: linear-gradient(135deg, #00A651 0%, #00c760 100%);
            border-radius: 16px;
            padding: 24px 32px;
            text-align: center;
            color: white;
            margin: 32px 0;
        }

        .important-banner .big-text {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .important-banner .sub-text {
            font-size: 1rem;
            opacity: 0.9;
        }

        .zoom-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 16px;
            padding: 28px;
            text-align: center;
            border: 2px solid #2196f3;
        }

        .zoom-card .day {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1565c0;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }

        .zoom-card .meeting-label {
            font-size: 0.85rem;
            color: #1976d2;
            margin-bottom: 4px;
        }

        .zoom-card .zoom-id {
            font-size: 2rem;
            font-weight: 800;
            color: #0d47a1;
            font-family: 'SF Mono', 'Consolas', monospace;
            letter-spacing: 2px;
            margin: 12px 0;
        }

        .zoom-card .passcode {
            display: inline-block;
            background: #1565c0;
            color: white;
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 600;
            margin: 12px 0;
        }

        .time-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 20px;
        }

        .time-slot {
            background: white;
            padding: 12px 8px;
            border-radius: 10px;
            text-align: center;
        }

        .time-slot .time {
            font-weight: 700;
            color: #1565c0;
            font-size: 1.1rem;
        }

        .time-slot .zone {
            font-size: 0.75rem;
            color: #666;
            margin-top: 2px;
        }

        .encouragement {
            background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin-top: 24px;
        }

        .encouragement .heart {
            font-size: 2rem;
            margin-bottom: 8px;
        }

        .encouragement p {
            color: #880e4f;
            font-weight: 500;
            font-size: 1.05rem;
        }

        .bullet-list {
            list-style: none;
            margin: 16px 0;
        }

        .bullet-list li {
            padding: 12px 0 12px 36px;
            position: relative;
            border-bottom: 1px solid #eee;
        }

        .bullet-list li:last-child {
            border-bottom: none;
        }

        .bullet-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #00A651;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 24px;
            color: #888;
            font-size: 0.9rem;
        }

        .footer .logo-text {
            font-weight: 700;
            color: #00A651;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }

        @media (max-width: 600px) {
            .hero h1 {
                font-size: 1.8rem;
            }

            .action-grid {
                grid-template-columns: 1fr;
            }

            .time-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .apprentice-flow {
                flex-direction: column;
            }

            .flow-arrow {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Hero Section -->
        <div class="hero">
            <span class="emoji">🎉</span>
            <h1>Welcome, ${fullName}!</h1>
            <p>Your journey to helping others transform their lives starts here</p>
        </div>

        <!-- The Secret -->
        <div class="card">
            <div class="secret-box">
                <div class="label">🔑 The Secret to New Coach Growth</div>
                <div class="content">SIMPLE, CONSISTENT ACTION</div>
            </div>
            <p style="color: #555; font-size: 1.05rem;">
                This playbook gives you all the tools you need, but the playbook is NOT the secret to growth. Just like you leaned into your Health Coach to create health wins, you'll lean into your coach as a <strong>Business Coach</strong>, and they will mentor you to success.
            </p>
        </div>

        <!-- Apprenticeship Model -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">🎓</div>
                <div>
                    <h2 class="card-title">The Apprenticeship Model</h2>
                    <p class="card-subtitle">Learn by doing, not just reading</p>
                </div>
            </div>

            <div class="apprentice-flow">
                <div class="flow-step">Your Coach SHOWS</div>
                <span class="flow-arrow">→</span>
                <div class="flow-step">You WATCH</div>
                <span class="flow-arrow">→</span>
                <div class="flow-step">You LEARN</div>
            </div>

            <div class="quote-box">
                Think of it like being a student teacher who shadows an experienced teacher to learn how to do the job. You will <strong>NEVER</strong> be alone on your coaching journey!
            </div>

            <ul class="bullet-list">
                <li>You'll have help from your own coach AND their upline mentors</li>
                <li>You'll be added to a message thread with your Upline coaches</li>
                <li>Keep ALL communication in that thread for best support</li>
            </ul>
        </div>

        <!-- The Parallel -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">🔄</div>
                <div>
                    <h2 class="card-title">Client → Coach Parallel</h2>
                    <p class="card-subtitle">Same support, different focus</p>
                </div>
            </div>

            <p style="color: #555; margin-bottom: 20px;">
                Launching as a coach is a lot like starting as a client:
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="background: #e8f5e9; padding: 20px; border-radius: 12px;">
                    <div style="font-weight: 600; color: #2e7d32; margin-bottom: 8px;">As a New Client</div>
                    <p style="font-size: 0.9rem; color: #555;">Daily, step-by-step guidance from your <strong>Health Coach</strong></p>
                </div>
                <div style="background: #e3f2fd; padding: 20px; border-radius: 12px;">
                    <div style="font-weight: 600; color: #1565c0; margin-bottom: 8px;">As a New Coach</div>
                    <p style="font-size: 0.9rem; color: #555;">Daily, step-by-step guidance from your <strong>Business Coach</strong> mentorship team</p>
                </div>
            </div>

            <div class="encouragement">
                <div class="heart">💚</div>
                <p>Lean in, ask questions, and stay in close contact with your mentors as you learn the ropes!</p>
            </div>
        </div>

        <!-- Your First 30 Days -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">📅</div>
                <div>
                    <h2 class="card-title">Your First 30 Days</h2>
                    <p class="card-subtitle">Focus on these 4 core activities</p>
                </div>
            </div>

            <div class="action-grid">
                <div class="action-item">
                    <div class="icon">📱</div>
                    <div class="action-word">SHARE</div>
                    <div class="action-desc">Your story on social media</div>
                </div>
                <div class="action-item">
                    <div class="icon">🤝</div>
                    <div class="action-word">CONNECT</div>
                    <div class="action-desc">Your mentorship in 3-way messages</div>
                </div>
                <div class="action-item">
                    <div class="icon">👂</div>
                    <div class="action-word">LISTEN</div>
                    <div class="action-desc">To Health Assessment calls</div>
                </div>
                <div class="action-item">
                    <div class="icon">💪</div>
                    <div class="action-word">SUPPORT</div>
                    <div class="action-desc">New clients by co-coaching with mentors</div>
                </div>
            </div>

            <div class="quote-box" style="background: #fff8e1; border-left-color: #ffc107;">
                <strong>That's it!</strong> You will learn by doing it WITH your coach, not by memorizing this manual.
            </div>
        </div>

        <!-- Important Banner -->
        <div class="important-banner">
            <div class="big-text">🚀 COACHES WHO ATTEND WEEKLY THEIR FIRST MONTH GROW FASTER!</div>
            <div class="sub-text">Consistency is the key to your success</div>
        </div>

        <!-- Saturday Huddle -->
        <div class="card">
            <div class="card-header">
                <div class="card-icon">📹</div>
                <div>
                    <h2 class="card-title">Saturday New Coach Huddle</h2>
                    <p class="card-subtitle">Your weekly connection with the team</p>
                </div>
            </div>

            <div class="zoom-card">
                <div class="day">Every Saturday</div>
                <div class="meeting-label">Zoom Meeting ID</div>
                <div class="zoom-id">404 357 2439</div>
                <div class="passcode">Passcode: OPTAVIA</div>

                <div class="time-grid">
                    <div class="time-slot">
                        <div class="time">7:00 AM</div>
                        <div class="zone">Pacific</div>
                    </div>
                    <div class="time-slot">
                        <div class="time">8:00 AM</div>
                        <div class="zone">Mountain</div>
                    </div>
                    <div class="time-slot">
                        <div class="time">9:00 AM</div>
                        <div class="zone">Central</div>
                    </div>
                    <div class="time-slot">
                        <div class="time">10:00 AM</div>
                        <div class="zone">Eastern</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="logo-text">Coaching Amplifier Team</div>
            <p>You've got this! Your transformation journey continues... 💚</p>
        </div>
    </div>
</body>
</html>
`

    const textContent = `
Welcome, ${fullName}!

Your journey to helping others transform their lives starts here.

🔑 THE SECRET TO NEW COACH GROWTH: SIMPLE, CONSISTENT ACTION

This playbook gives you all the tools you need, but the playbook is NOT the secret to growth. Just like you leaned into your Health Coach to create health wins, you'll lean into your coach as a Business Coach, and they will mentor you to success.

THE APPRENTICESHIP MODEL
Learn by doing, not just reading

Your Coach SHOWS → You WATCH → You LEARN

Think of it like being a student teacher who shadows an experienced teacher to learn how to do the job. You will NEVER be alone on your coaching journey!

✓ You'll have help from your own coach AND their upline mentors
✓ You'll be added to a message thread with your Upline coaches
✓ Keep ALL communication in that thread for best support

YOUR FIRST 30 DAYS
Focus on these 4 core activities:

📱 SHARE - Your story on social media
🤝 CONNECT - Your mentorship in 3-way messages
👂 LISTEN - To Health Assessment calls
💪 SUPPORT - New clients by co-coaching with mentors

That's it! You will learn by doing it WITH your coach, not by memorizing this manual.

🚀 COACHES WHO ATTEND WEEKLY THEIR FIRST MONTH GROW FASTER!
Consistency is the key to your success

SATURDAY NEW COACH HUDDLE
Every Saturday
Zoom Meeting ID: 404 357 2439
Passcode: OPTAVIA

7:00 AM Pacific | 8:00 AM Mountain | 9:00 AM Central | 10:00 AM Eastern

You've got this! Your transformation journey continues... 💚

- Coaching Amplifier Team
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
