import type { QuizQuestion } from "@/components/training/module-quiz"

export interface ModuleQuiz {
  moduleId: string
  moduleTitle: string
  questions: QuizQuestion[]
}

export const moduleQuizzes: Record<string, ModuleQuiz> = {
  // ========================================
  // PRE-LAUNCH (NEW COACHES)
  // ========================================
  "welcome-orientation": {
    moduleId: "welcome-orientation",
    moduleTitle: "Welcome & Orientation",
    questions: [
      {
        id: "wo-1",
        question: "What is the recommended approach for new coaches learning the business?",
        options: [
          "Figure it out on your own first, then ask questions",
          "Lean in, ask questions, and stay in close contact with your mentor",
          "Watch videos only and avoid bothering your upline",
          "Wait until you have clients before reaching out to your mentor"
        ],
        correctAnswer: 1,
        explanation: "Just like new clients get daily guidance from their health coach, new coaches should lean in and stay in close contact with their business coach mentorship team."
      },
      {
        id: "wo-2",
        question: "During the first week as a new coach, what type of daily contact is recommended?",
        options: [
          "Weekly email updates only",
          "Monthly phone calls",
          "Daily text + 5 min check-in call",
          "No contact until the first client signs up"
        ],
        correctAnswer: 2,
        explanation: "Daily text messages and 5 minute check-in calls help new coaches stay accountable and get the support they need during the critical first week."
      },
      {
        id: "wo-3",
        question: "What mindset should you adopt as a new coach?",
        options: [
          "This is just a side hobby with no real commitment needed",
          "I already know everything I need to succeed",
          "Be coachable and treat this like an apprenticeship",
          "Avoid training and just start selling immediately"
        ],
        correctAnswer: 2,
        explanation: "The apprenticeship model works best when you're coachable, willing to learn, and open to guidance from experienced coaches."
      }
    ]
  },

  "business-setup": {
    moduleId: "business-setup",
    moduleTitle: "Business Setup",
    questions: [
      {
        id: "bs-1",
        question: "What is one of the first things you should set up as a new coach?",
        options: [
          "A podcast channel",
          "Your OPTAVIA Pay and coaching website",
          "A physical office space",
          "Business cards and flyers"
        ],
        correctAnswer: 1,
        explanation: "Setting up OPTAVIA Pay and your coaching website are essential first steps to receive commissions and have a professional online presence."
      },
      {
        id: "bs-2",
        question: "Why is professional branding important for your coaching business?",
        options: [
          "It's not important - results speak for themselves",
          "It helps build trust and credibility with potential clients",
          "It's only for advanced coaches",
          "It's required by OPTAVIA corporate"
        ],
        correctAnswer: 1,
        explanation: "Professional branding helps build trust and credibility, making potential clients more likely to work with you."
      },
      {
        id: "bs-3",
        question: "What vocabulary should you become familiar with as a new coach?",
        options: [
          "Medical terminology only",
          "OPTAVIA-specific terms and proper language",
          "Sales jargon from other industries",
          "It doesn't matter what words you use"
        ],
        correctAnswer: 1,
        explanation: "Understanding and using proper OPTAVIA vocabulary ensures compliant communication and helps you speak professionally about the program."
      }
    ]
  },

  "social-media-preparation": {
    moduleId: "social-media-preparation",
    moduleTitle: "Social Media Preparation",
    questions: [
      {
        id: "smp-1",
        question: "What should you do BEFORE posting your launch announcement?",
        options: [
          "Post immediately while you're excited",
          "Wait 6 months to build an audience first",
          "Prepare your profile, bio, and content strategy",
          "Delete all your old posts"
        ],
        correctAnswer: 2,
        explanation: "Preparation is key! Optimizing your profile, bio, and having a content strategy ready ensures a more successful and compliant launch."
      },
      {
        id: "smp-2",
        question: "What is a key element of a compliant social media presence?",
        options: [
          "Making income claims and guarantees",
          "Sharing before/after photos without proper disclaimers",
          "Adding required disclaimers to transformation photos",
          "Promising specific weight loss results"
        ],
        correctAnswer: 2,
        explanation: "Compliance requires adding proper disclaimers to transformation photos and avoiding income or weight loss guarantees."
      },
      {
        id: "smp-3",
        question: "What type of content performs best for coaches on social media?",
        options: [
          "Constant product promotions and sales pitches",
          "Value-first content that helps and inspires your audience",
          "Political and controversial topics to drive engagement",
          "Only reposting corporate OPTAVIA content"
        ],
        correctAnswer: 1,
        explanation: "Value-first content builds trust and relationships. People follow coaches who help and inspire, not those who constantly sell."
      }
    ]
  },

  "understanding-health-assessment": {
    moduleId: "understanding-health-assessment",
    moduleTitle: "Understanding the Health Assessment",
    questions: [
      {
        id: "uha-1",
        question: "What is the purpose of the Discovery phase in a Health Assessment?",
        options: [
          "To immediately pitch the program",
          "To ask open-ended questions and understand their goals and motivations",
          "To share your entire transformation story",
          "To close the sale as quickly as possible"
        ],
        correctAnswer: 1,
        explanation: "Discovery is about understanding THEM - their goals, motivations, and what's driving them to make a change NOW."
      },
      {
        id: "uha-2",
        question: "What is a 'transition question' used for?",
        options: [
          "To change the subject when things get awkward",
          "To ask permission to share how you might be able to help",
          "To end the conversation quickly",
          "To push someone into buying immediately"
        ],
        correctAnswer: 1,
        explanation: "Transition questions ask permission and bridge from their story to exploring how OPTAVIA might help them."
      },
      {
        id: "uha-3",
        question: "As a new coach, what should you focus on during your first Health Assessment calls?",
        options: [
          "Memorizing and reciting scripts perfectly",
          "Observing your mentor and learning the patterns and flow",
          "Immediately taking over the calls yourself",
          "Avoiding all calls until you feel ready"
        ],
        correctAnswer: 1,
        explanation: "The apprenticeship model emphasizes observing mentors first, then gradually participating as you learn the patterns."
      }
    ]
  },

  "social-media-posting": {
    moduleId: "social-media-posting",
    moduleTitle: "Social Media Posting",
    questions: [
      {
        id: "smpst-1",
        question: "What should you do when people respond to your launch post?",
        options: [
          "Wait a few days to respond to seem not too eager",
          "Respond promptly and move the conversation to DMs",
          "Only respond to people who seem very interested",
          "Send them a link to purchase immediately"
        ],
        correctAnswer: 1,
        explanation: "Quick responses and moving to private conversation (DMs) helps build relationships and move people toward a Health Assessment."
      },
      {
        id: "smpst-2",
        question: "What is a common mistake to avoid when working your launch post?",
        options: [
          "Responding to every comment",
          "Being too pushy or salesy in public comments",
          "Sharing your personal story",
          "Using Stories to drive engagement"
        ],
        correctAnswer: 1,
        explanation: "Being too pushy in public can turn people off. Keep public responses warm and move deeper conversations to DMs."
      },
      {
        id: "smpst-3",
        question: "How often should you post during your first week as a coach?",
        options: [
          "Once a week is enough",
          "10+ times per day",
          "Consistently, with a mix of value content and engagement",
          "Never - let your launch post do all the work"
        ],
        correctAnswer: 2,
        explanation: "Consistent posting with valuable content keeps you visible and builds momentum during your launch week."
      }
    ]
  },

  "first-client-conversations": {
    moduleId: "first-client-conversations",
    moduleTitle: "First Client Conversations",
    questions: [
      {
        id: "fcc-1",
        question: "What is the key to effective client conversations?",
        options: [
          "Talk as much as possible about the program features",
          "Listen more than you talk and ask good questions",
          "Memorize and recite scripts word-for-word",
          "Focus only on price and discounts"
        ],
        correctAnswer: 1,
        explanation: "Great coaches listen more than they talk. Asking questions helps prospects discover their own motivation."
      },
      {
        id: "fcc-2",
        question: "What should you do when you don't know the answer to a prospect's question?",
        options: [
          "Make up an answer to seem knowledgeable",
          "Change the subject quickly",
          "Say so honestly and offer to get the answer from your mentor",
          "End the conversation immediately"
        ],
        correctAnswer: 2,
        explanation: "Honesty builds trust. It's okay to say 'I don't know, but I'll find out for you' - your mentor can help!"
      },
      {
        id: "fcc-3",
        question: "When is the best time to practice your conversation skills?",
        options: [
          "Only when you have real prospects",
          "Through role-play with your mentor before real calls",
          "You don't need to practice - just be natural",
          "After you've been coaching for a year"
        ],
        correctAnswer: 1,
        explanation: "Role-playing with your mentor helps you practice in a safe environment and get feedback before real calls."
      }
    ]
  },

  // ========================================
  // FIRST 30 DAYS
  // ========================================
  "first-client": {
    moduleId: "first-client",
    moduleTitle: "When You Get Your First Client",
    questions: [
      {
        id: "fc-1",
        question: "What should happen within the first 24-48 hours of a new client starting?",
        options: [
          "Leave them alone to figure things out",
          "A kickoff call and sending welcome resources",
          "Wait for them to reach out with questions",
          "Send them straight to the OPTAVIA website"
        ],
        correctAnswer: 1,
        explanation: "A strong start with a kickoff call and resources sets clients up for success and builds the coaching relationship."
      },
      {
        id: "fc-2",
        question: "How often should you check in with a new client during their first week?",
        options: [
          "Once at the end of the week",
          "Only if they have problems",
          "Daily through texts and scheduled calls",
          "Every other day is fine"
        ],
        correctAnswer: 2,
        explanation: "Daily contact during the critical first week helps clients stay accountable and addresses challenges quickly."
      },
      {
        id: "fc-3",
        question: "What is the purpose of the '10X text system'?",
        options: [
          "To send 10 texts per day",
          "To provide structured daily support messages for clients",
          "To sell additional products",
          "To recruit new coaches"
        ],
        correctAnswer: 1,
        explanation: "The 10X text system provides a structured approach to daily client support with proven messages."
      }
    ]
  },

  "client-resources": {
    moduleId: "client-resources",
    moduleTitle: "Client Resources to Share",
    questions: [
      {
        id: "cr-1",
        question: "Why is it important to know which resources to share and when?",
        options: [
          "To overwhelm clients with information upfront",
          "To provide the right information at the right time for their journey",
          "It's not important - just share everything at once",
          "To avoid ever having to talk to clients"
        ],
        correctAnswer: 1,
        explanation: "Strategic resource sharing prevents overwhelm and ensures clients get relevant information when they need it."
      },
      {
        id: "cr-2",
        question: "What should you send clients on their first day?",
        options: [
          "All available guides and videos at once",
          "Welcome message and essential getting-started resources",
          "Information about becoming a coach",
          "Nothing - wait for them to ask"
        ],
        correctAnswer: 1,
        explanation: "First day resources should be focused on getting started successfully, not overwhelming with too much information."
      },
      {
        id: "cr-3",
        question: "When should you share the 'Eat This Every Day' guide?",
        options: [
          "Before they even start the program",
          "When they're learning about Lean & Green meals",
          "Only if they specifically ask for it",
          "After they've completed the program"
        ],
        correctAnswer: 1,
        explanation: "This guide is most helpful when clients are learning to prepare their Lean & Green meals in their first week."
      }
    ]
  },

  "thirty-day-evaluation": {
    moduleId: "thirty-day-evaluation",
    moduleTitle: "Your 30-Day Evaluation",
    questions: [
      {
        id: "tde-1",
        question: "What is the main purpose of the 30-day evaluation?",
        options: [
          "To judge whether you should quit",
          "To celebrate wins, identify growth areas, and set goals for Senior Coach",
          "To compare yourself to other coaches",
          "To determine your final ranking"
        ],
        correctAnswer: 1,
        explanation: "The 30-day evaluation helps you reflect on progress, celebrate wins, and create a plan to continue growing."
      },
      {
        id: "tde-2",
        question: "What areas should you assess in your 30-day review?",
        options: [
          "Only your income numbers",
          "Business activity, client support, personal growth, and pipeline",
          "Just how many social media followers you gained",
          "Only what your mentor thinks of you"
        ],
        correctAnswer: 1,
        explanation: "A comprehensive review looks at multiple areas: activity, client support, growth mindset, and future pipeline."
      },
      {
        id: "tde-3",
        question: "What should you do after completing your 30-day evaluation?",
        options: [
          "Stop working hard since you made it 30 days",
          "Set specific goals for your path to Senior Coach",
          "Wait for your mentor to tell you what to do next",
          "Take a month off to celebrate"
        ],
        correctAnswer: 1,
        explanation: "Use your evaluation insights to set clear, specific goals for advancing to Senior Coach."
      }
    ]
  },

  // ========================================
  // GROWING TO SENIOR COACH
  // ========================================
  "social-media-business": {
    moduleId: "social-media-business",
    moduleTitle: "Social Media for Business Growth",
    questions: [
      {
        id: "smb-1",
        question: "What is the OARS method for starting conversations?",
        options: [
          "Order, Arrange, Review, Sell",
          "Observe, Ask, Relate, Start a conversation",
          "Offer, Assume, Reject, Succeed",
          "Open, Attack, Retreat, Survive"
        ],
        correctAnswer: 1,
        explanation: "OARS stands for Observe, Ask a question, Relate, and Start a meaningful conversation."
      },
      {
        id: "smb-2",
        question: "Which social media format typically gets the most reach?",
        options: [
          "Text-only posts",
          "Reels and short-form video content",
          "Long blog-style posts",
          "Only sharing other people's content"
        ],
        correctAnswer: 1,
        explanation: "Reels and short-form videos are prioritized by algorithms and typically reach more people."
      },
      {
        id: "smb-3",
        question: "What is the recommended approach for Instagram Stories?",
        options: [
          "Post once a month",
          "Only promotional content",
          "Daily posts with polls, questions, and behind-the-scenes content",
          "Never use Stories"
        ],
        correctAnswer: 2,
        explanation: "Daily Stories with interactive elements like polls and questions drive engagement and build relationships."
      }
    ]
  },

  "client-acquisition": {
    moduleId: "client-acquisition",
    moduleTitle: "Client Acquisition Mastery",
    questions: [
      {
        id: "ca-1",
        question: "What is the key mindset shift for effective sponsoring?",
        options: [
          "Focus on selling features and benefits",
          "Shift from selling to serving - focus on their transformation",
          "Pressure people into quick decisions",
          "Only talk to people who seem ready to buy"
        ],
        correctAnswer: 1,
        explanation: "When you shift from selling to serving, you focus on their transformation, not just the transaction."
      },
      {
        id: "ca-2",
        question: "What is the purpose of asking 'powerful questions'?",
        options: [
          "To confuse the prospect",
          "To help prospects discover their own motivation",
          "To show how smart you are",
          "To speed up the sales process"
        ],
        correctAnswer: 1,
        explanation: "Powerful questions help people uncover their own reasons for change, which is more motivating than you telling them."
      },
      {
        id: "ca-3",
        question: "What should you do to prepare for your first solo Health Assessment?",
        options: [
          "Just wing it - practice makes perfect",
          "Read the script once and hope for the best",
          "Practice with mentor, role-play, and shadow real calls",
          "Avoid doing calls until you feel completely ready"
        ],
        correctAnswer: 2,
        explanation: "Thorough preparation through practice, role-play, and shadowing builds confidence for real calls."
      }
    ]
  },

  "business-model": {
    moduleId: "business-model",
    moduleTitle: "Understanding the Business Model",
    questions: [
      {
        id: "bm-1",
        question: "What are the two main income streams in OPTAVIA?",
        options: [
          "Salary and bonus",
          "Client acquisition and team building",
          "Tips and donations",
          "Hourly wages and overtime"
        ],
        correctAnswer: 1,
        explanation: "OPTAVIA coaches earn through client acquisition (retail commissions) and team building (team bonuses)."
      },
      {
        id: "bm-2",
        question: "What does FQV stand for?",
        options: [
          "First Quarter Value",
          "Front Qualifying Volume",
          "Fast Quality Verification",
          "Field Qualification Volume"
        ],
        correctAnswer: 1,
        explanation: "FQV (Front Qualifying Volume) is a key metric that determines your rank qualifications and earnings."
      },
      {
        id: "bm-3",
        question: "Why is understanding the compensation plan important?",
        options: [
          "It's not - just focus on helping people",
          "To know exactly how to maximize your income potential",
          "OPTAVIA requires you to memorize it",
          "To explain it to every prospect"
        ],
        correctAnswer: 1,
        explanation: "Understanding the comp plan helps you set strategic goals and make informed business decisions."
      }
    ]
  },

  // ========================================
  // USING CONNECT
  // ========================================
  "connect-business": {
    moduleId: "connect-business",
    moduleTitle: "Using Connect for Business Intelligence",
    questions: [
      {
        id: "cb-1",
        question: "What can you track in OPTAVIA Connect?",
        options: [
          "Only your personal orders",
          "Your FQV, team performance, and rank qualifications",
          "Just your client list",
          "Only your commission payments"
        ],
        correctAnswer: 1,
        explanation: "OPTAVIA Connect gives you comprehensive business intelligence including FQV, team metrics, and rank progress."
      },
      {
        id: "cb-2",
        question: "Why is it important to check your projected numbers regularly?",
        options: [
          "It's not important - just work hard",
          "To strategically plan and know what's needed for goals",
          "OPTAVIA requires daily check-ins",
          "To compare yourself to other coaches"
        ],
        correctAnswer: 1,
        explanation: "Checking projections helps you plan strategically and know exactly what activities are needed to hit your goals."
      },
      {
        id: "cb-3",
        question: "What should you do at the end of each month?",
        options: [
          "Wait until the new month to look at numbers",
          "Review projections and make strategic pushes if needed",
          "Stop all activity and rest",
          "Only focus on recruiting new coaches"
        ],
        correctAnswer: 1,
        explanation: "End-of-month strategy reviews help you maximize results and close out strong."
      }
    ]
  },

  "business-planning": {
    moduleId: "business-planning",
    moduleTitle: "Business Planning",
    questions: [
      {
        id: "bp-1",
        question: "What is the recommended daily planning approach?",
        options: [
          "Plan once a month only",
          "Daily review of priorities: reach-outs, follow-ups, client support",
          "No planning needed - just go with the flow",
          "Only plan when you have free time"
        ],
        correctAnswer: 1,
        explanation: "Daily planning ensures consistent income-producing activities in prospecting, follow-up, and client support."
      },
      {
        id: "bp-2",
        question: "How do points work in the OPTAVIA rank system?",
        options: [
          "You earn points by attending events only",
          "Points come from FQV volume and team-based qualifications",
          "Points are awarded randomly",
          "You buy points with commission earnings"
        ],
        correctAnswer: 1,
        explanation: "Points are earned through FQV volume (typically $1,200 = 1 point) and by helping team members hit Senior Coach."
      },
      {
        id: "bp-3",
        question: "Why should you set rank advancement goals?",
        options: [
          "Rank doesn't matter",
          "To have clear targets that drive daily activity",
          "To impress your mentor",
          "OPTAVIA requires it"
        ],
        correctAnswer: 1,
        explanation: "Clear rank goals give you specific targets that inform what activities you need to do daily."
      }
    ]
  },

  "advanced-client-support": {
    moduleId: "advanced-client-support",
    moduleTitle: "Advanced Client Support",
    questions: [
      {
        id: "acs-1",
        question: "What is a VIP call?",
        options: [
          "A call only for celebrity clients",
          "A scheduled deep-dive check-in with individual clients",
          "A group call for all clients at once",
          "A call with OPTAVIA corporate"
        ],
        correctAnswer: 1,
        explanation: "VIP calls are dedicated one-on-one check-ins that make clients feel valued and supported."
      },
      {
        id: "acs-2",
        question: "What should you do when a client is not losing weight as expected?",
        options: [
          "Tell them they must be cheating",
          "Use systems check questions to identify potential issues",
          "Suggest they try a different program",
          "Wait and hope it gets better"
        ],
        correctAnswer: 1,
        explanation: "Systems check questions help identify specific issues (hydration, sleep, stress, etc.) that may be affecting results."
      },
      {
        id: "acs-3",
        question: "How does strong client support impact your business?",
        options: [
          "It doesn't - focus only on getting new clients",
          "Happy clients refer friends and have better long-term success",
          "It takes too much time away from prospecting",
          "Clients don't appreciate extra support"
        ],
        correctAnswer: 1,
        explanation: "Strong support leads to better results, higher retention, and referrals - growing your business organically."
      }
    ]
  },

  // ========================================
  // ED TO FIBC
  // ========================================
  "team-building": {
    moduleId: "team-building",
    moduleTitle: "Team Building Fundamentals",
    questions: [
      {
        id: "tb-1",
        question: "What is the key to effective team building?",
        options: [
          "Recruiting as many people as possible regardless of fit",
          "Sponsoring and developing coaches who you can support and mentor",
          "Only focusing on your personal clients",
          "Waiting for people to come to you"
        ],
        correctAnswer: 1,
        explanation: "Quality over quantity - focus on coaches you can truly support and develop into successful leaders."
      },
      {
        id: "tb-2",
        question: "When should you start talking to clients about coaching?",
        options: [
          "Never - let them ask",
          "Day one before they even start the program",
          "When they're having success and showing enthusiasm",
          "Only when you need more team members"
        ],
        correctAnswer: 2,
        explanation: "The best time is when clients are experiencing transformation and naturally enthusiastic about the program."
      },
      {
        id: "tb-3",
        question: "What is your role as a sponsor?",
        options: [
          "Do all the work for your new coaches",
          "Just sign them up and let them figure it out",
          "Train, support, and mentor them to success",
          "Only focus on your own business"
        ],
        correctAnswer: 2,
        explanation: "Great sponsors invest time in training, supporting, and mentoring new coaches just like they support clients."
      }
    ]
  },

  "ten-x-system": {
    moduleId: "ten-x-system",
    moduleTitle: "The 10X System",
    questions: [
      {
        id: "tx-1",
        question: "What is the core principle of the 10X system?",
        options: [
          "Work 10 times harder than everyone else",
          "High-accountability, structured daily activities",
          "Only talk to 10 people total",
          "10 days to success guarantee"
        ],
        correctAnswer: 1,
        explanation: "The 10X system is about structured, high-accountability daily activities that compound into results."
      },
      {
        id: "tx-2",
        question: "Who should implement the 10X system?",
        options: [
          "Only brand new coaches",
          "Only Executive Directors and above",
          "Any coach wanting to elevate their results",
          "Only coaches who are struggling"
        ],
        correctAnswer: 2,
        explanation: "The 10X system benefits any coach at any level who wants to increase their impact and results."
      },
      {
        id: "tx-3",
        question: "What makes the 10X system effective?",
        options: [
          "Complex strategies only experts understand",
          "Consistency, accountability, and proven daily activities",
          "Luck and timing",
          "Having the biggest social media following"
        ],
        correctAnswer: 1,
        explanation: "Simple, consistent daily activities done with accountability is what creates 10X results over time."
      }
    ]
  },

  // ========================================
  // LEADERSHIP DEVELOPMENT
  // ========================================
  "leadership-development": {
    moduleId: "leadership-development",
    moduleTitle: "Leadership Development",
    questions: [
      {
        id: "ld-1",
        question: "What is the goal of true leadership development?",
        options: [
          "Being the best coach on your team",
          "Developing leaders who can develop other leaders",
          "Having the most clients",
          "Winning all the company awards"
        ],
        correctAnswer: 1,
        explanation: "True leadership is about developing others to become leaders themselves, creating exponential growth."
      },
      {
        id: "ld-2",
        question: "How should leaders handle team challenges?",
        options: [
          "Ignore problems and hope they go away",
          "Model the behavior you want to see and coach through challenges",
          "Blame team members for their failures",
          "Only focus on top performers"
        ],
        correctAnswer: 1,
        explanation: "Leaders model excellence and coach others through challenges rather than just pointing out problems."
      },
      {
        id: "ld-3",
        question: "What is essential for developing future leaders?",
        options: [
          "Doing everything yourself so it's done right",
          "Delegating, training, and trusting others to grow",
          "Keeping all knowledge to yourself",
          "Only promoting people who are exactly like you"
        ],
        correctAnswer: 1,
        explanation: "Developing leaders requires delegating responsibilities, providing training, and trusting them to develop."
      }
    ]
  },

  "scaling-your-business": {
    moduleId: "scaling-your-business",
    moduleTitle: "Scaling Your Business",
    questions: [
      {
        id: "syb-1",
        question: "What is the key to scaling beyond personal capacity?",
        options: [
          "Work more hours every day",
          "Build systems and develop leaders who can work independently",
          "Only focus on high-paying clients",
          "Stop taking new clients"
        ],
        correctAnswer: 1,
        explanation: "Scaling requires systems that work without you and leaders who can operate independently."
      },
      {
        id: "syb-2",
        question: "What should you systematize first?",
        options: [
          "Nothing - stay flexible",
          "Onboarding, training, and client support processes",
          "Only your personal schedule",
          "Social media posting only"
        ],
        correctAnswer: 1,
        explanation: "Systematizing core processes like onboarding and training allows you to duplicate success across your team."
      },
      {
        id: "syb-3",
        question: "How do systems help your business grow?",
        options: [
          "They don't - personal touch is all that matters",
          "They allow you to help more people consistently without burning out",
          "They make the business feel impersonal",
          "They only help with paperwork"
        ],
        correctAnswer: 1,
        explanation: "Good systems increase capacity to help more people while maintaining quality and preventing burnout."
      }
    ]
  },

  // ========================================
  // LEGACY BUILDING
  // ========================================
  "legacy-building": {
    moduleId: "legacy-building",
    moduleTitle: "Legacy Building",
    questions: [
      {
        id: "lb-1",
        question: "What defines legacy building in OPTAVIA?",
        options: [
          "Having the most clients",
          "Creating multiple FIBC teams and lasting impact",
          "Being in business the longest",
          "Making the most money"
        ],
        correctAnswer: 1,
        explanation: "Legacy is about creating multiple successful teams and lasting positive impact on many lives."
      },
      {
        id: "lb-2",
        question: "How do you create lasting income through legacy?",
        options: [
          "Working 24/7 forever",
          "Developing strong, independent leaders across multiple teams",
          "Being the only one who knows how things work",
          "Doing all the work yourself"
        ],
        correctAnswer: 1,
        explanation: "Lasting income comes from developing leaders who build their own successful, independent organizations."
      },
      {
        id: "lb-3",
        question: "What mindset shift is required for legacy building?",
        options: [
          "From building a business to building an empire",
          "From personal success to empowering others' success",
          "From helping people to making money",
          "From part-time to full-time"
        ],
        correctAnswer: 1,
        explanation: "Legacy builders focus on empowering others' success, knowing it creates the greatest long-term impact."
      }
    ]
  },

  "advanced-tools": {
    moduleId: "advanced-tools",
    moduleTitle: "Advanced Tools",
    questions: [
      {
        id: "at-1",
        question: "How can AI tools like ChatGPT help coaches?",
        options: [
          "They can't - coaching is too personal",
          "Creating personalized content, scripts, and support materials",
          "Replacing all human interaction",
          "Only for technical troubleshooting"
        ],
        correctAnswer: 1,
        explanation: "AI can help create personalized content and materials, freeing coaches to focus on human connection."
      },
      {
        id: "at-2",
        question: "What is important when using technology in your business?",
        options: [
          "Use every new tool that comes out",
          "Use tools that enhance human connection, not replace it",
          "Avoid all technology",
          "Only use technology if you're tech-savvy"
        ],
        correctAnswer: 1,
        explanation: "The best technology enhances your ability to connect and serve people, not replace the human element."
      },
      {
        id: "at-3",
        question: "What should you train your AI tools to understand?",
        options: [
          "Nothing - use them out of the box",
          "Your voice, values, and how you communicate",
          "Only OPTAVIA product information",
          "Everything about your competitors"
        ],
        correctAnswer: 1,
        explanation: "Training AI with your voice and values ensures content feels authentic and consistent with your brand."
      }
    ]
  }
}

// Helper function to get quiz for a module
export function getModuleQuiz(moduleId: string): ModuleQuiz | null {
  return moduleQuizzes[moduleId] || null
}
