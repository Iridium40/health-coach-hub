import type { Module, Recipe } from "./types"

export const modules: Module[] = [
  {
    id: "welcome-orientation",
    title: "Welcome & Orientation",
    description: "Set expectations, understand the apprenticeship model, and get excited about your coaching journey!",
    category: "Pre Launch (New Coaches)",
    order: 0,
    forNewCoach: true,
    icon: "👋",
    resources: [
      {
        id: "welcome-1",
        title: "Welcome & Orientation Module",
        type: "doc",
        url: "/training/welcome-orientation",
      },
    ],
  },
  {
    id: "business-setup",
    title: "Business Setup",
    description: "Get your coaching business officially set up with payment, website, and professional branding.",
    category: "Pre Launch (New Coaches)",
    order: 1,
    forNewCoach: true,
    icon: "💼",
    resources: [
      {
        id: "business-setup-1",
        title: "Business Setup Module",
        type: "doc",
        url: "/training/business-setup",
      },
    ],
  },
  {
    id: "social-media-preparation",
    title: "Social Media Preparation",
    description: "Prepare everything you need for a successful, compliant social media launch announcement.",
    category: "Pre Launch (New Coaches)",
    order: 2,
    forNewCoach: true,
    icon: "📱",
    resources: [
      {
        id: "social-media-prep-1",
        title: "Social Media Preparation Module",
        type: "doc",
        url: "/training/social-media-preparation",
      },
    ],
  },
  {
    id: "understanding-health-assessment",
    title: "Understanding the Health Assessment",
    description: "Learn before you observe - understand what you'll see your mentors doing so you can learn effectively.",
    category: "Pre Launch (New Coaches)",
    order: 3,
    forNewCoach: true,
    icon: "🎯",
    resources: [
      {
        id: "health-assessment-1",
        title: "Understanding the Health Assessment Module",
        type: "doc",
        url: "/training/understanding-health-assessment",
      },
    ],
  },
  {
    id: "social-media-posting",
    title: "Social Media Posting",
    description: "Execute your social media launch and work the responses to turn engagement into clients.",
    category: "Launch Week",
    order: 4,
    forNewCoach: true,
    icon: "📱",
    resources: [
      {
        id: "social-media-posting-1",
        title: "Social Media Posting Module",
        type: "doc",
        url: "/training/social-media-posting",
      },
    ],
  },
  {
    id: "first-client-conversations",
    title: "First Client Conversations",
    description: "Learn by doing WITH your mentor. Master the scripts and frameworks that turn conversations into clients.",
    category: "Launch Week",
    order: 5,
    forNewCoach: true,
    icon: "💬",
    resources: [
      {
        id: "first-client-conversations-1",
        title: "First Client Conversations Module",
        type: "doc",
        url: "/training/first-client-conversations",
      },
    ],
  },
  {
    id: "first-client",
    title: "When You Get Your First Client",
    description: "Know exactly how to launch and support a new client for success. Checklists, schedules, and scripts ready to use!",
    category: "First 30 Days",
    order: 6,
    forNewCoach: true,
    icon: "✨",
    resources: [
      {
        id: "first-client-1",
        title: "First Client Module",
        type: "doc",
        url: "/training/first-client",
      },
    ],
  },
  {
    id: "client-resources",
    title: "Client Resources to Share",
    description: "Know what resources to send clients and when. Your complete guide library with sharing scripts.",
    category: "First 30 Days",
    order: 7,
    forNewCoach: true,
    icon: "📚",
    resources: [
      {
        id: "client-resources-1",
        title: "Client Resources Module",
        type: "doc",
        url: "/training/client-resources",
      },
    ],
  },
  {
    id: "thirty-day-evaluation",
    title: "Your 30-Day Evaluation",
    description: "Assess your first month, celebrate wins, and set goals for your path to Senior Coach.",
    category: "First 30 Days",
    order: 8,
    forNewCoach: true,
    icon: "🏆",
    resources: [
      {
        id: "thirty-day-evaluation-1",
        title: "30-Day Evaluation Module",
        type: "doc",
        url: "/training/thirty-day-evaluation",
      },
    ],
  },
  {
    id: "social-media-business",
    title: "Social Media for Business Growth",
    description: "Use social media consistently to attract clients and grow your coaching business.",
    category: "Growing to Senior Coach",
    order: 9,
    forNewCoach: false,
    icon: "📈",
    resources: [
      {
        id: "social-media-business-1",
        title: "Social Media for Business Growth Module",
        type: "doc",
        url: "/training/social-media-business",
      },
    ],
  },
  {
    id: "client-acquisition",
    title: "Client Acquisition Mastery",
    description: "Get confident doing Health Assessments independently through mindset training and practice.",
    category: "Growing to Senior Coach",
    order: 10,
    forNewCoach: false,
    icon: "🎯",
    resources: [
      {
        id: "client-acquisition-1",
        title: "Client Acquisition Mastery Module",
        type: "doc",
        url: "/training/client-acquisition",
      },
    ],
  },
  {
    id: "business-model",
    title: "Understanding the Business Model",
    description: "Know how you get paid and what drives your income in OPTAVIA.",
    category: "Growing to Senior Coach",
    order: 11,
    forNewCoach: false,
    icon: "💰",
    resources: [
      {
        id: "business-model-1",
        title: "Understanding the Business Model Module",
        type: "doc",
        url: "/training/business-model",
      },
    ],
  },
  {
    id: "connect-business",
    title: "Using Connect for Business Intelligence",
    description: "Master OPTAVIA Connect to manage, track, and grow your business strategically.",
    category: "Using Connect for Business Success",
    order: 12,
    forNewCoach: false,
    icon: "🚀",
    resources: [
      {
        id: "connect-business-1",
        title: "Using Connect for Business Intelligence Module",
        type: "doc",
        url: "/training/connect-business",
      },
    ],
  },
  {
    id: "business-planning",
    title: "Business Planning",
    description: "Create intentional plans for rank advancement with proven tools and frameworks.",
    category: "Using Connect for Business Success",
    order: 13,
    forNewCoach: false,
    icon: "📋",
    resources: [
      {
        id: "business-planning-1",
        title: "Business Planning Module",
        type: "doc",
        url: "/training/business-planning",
      },
    ],
  },
  {
    id: "advanced-client-support",
    title: "Advanced Client Support",
    description: "Master client retention and results through VIP experiences and metabolic coaching expertise.",
    category: "Using Connect for Business Success",
    order: 14,
    forNewCoach: false,
    icon: "💎",
    resources: [
      {
        id: "advanced-client-support-1",
        title: "Advanced Client Support Module",
        type: "doc",
        url: "/training/advanced-client-support",
      },
    ],
  },
  {
    id: "coach-launch",
    title: "Coach Launch Playbook",
    description: "Essential resources to kickstart your coaching journey and build a strong foundation.",
    category: "Getting Started",
    order: 1,
    forNewCoach: true,
    icon: "🚀",
    resources: [
      {
        id: "launch-1",
        title: "New Coach Welcome Letter",
        type: "doc",
        url: "https://docs.google.com/document/d/1arNc-lNb1zJ2WJ0VS87Dpfre973u-IboIYxQqNUr7Vs/edit?usp=sharing",
      },
      {
        id: "launch-2",
        title: "New Coach Printable Checklist",
        type: "doc",
        url: "https://docs.google.com/document/d/118onAvS-zWGDClUpkSOLEcXhRNnuaCir/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "launch-3",
        title: "How to Purchase Your Coaching Kit",
        type: "video",
        url: "https://vimeo.com/548985412",
      },
      {
        id: "launch-4",
        title: "How to Prepare for Your Social Media Launch",
        type: "doc",
        url: "https://docs.google.com/document/d/1MmQrsmqenglJr_SenBcBH_qkc4k6mWe_/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "launch-5",
        title: "How to Work Your Launch Post and Common Mistakes to Avoid",
        type: "doc",
        url: "https://docs.google.com/document/d/11tutR54Y_rDUUWkQupfY8cHN9n_VH-fIQPwnTSnDLnU/edit?usp=sharing",
      },
      {
        id: "launch-6",
        title: "How to Nail the Health Assessment",
        type: "doc",
        url: "https://docs.google.com/document/d/1A8UIEidVXGrz8jeDsqKbrRVPbbpWc3b0/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "launch-7",
        title: "How to Back Into a Health Assessment: Re-Record This",
        type: "video",
        url: "https://vimeo.com/671134401",
      },
      {
        id: "launch-8",
        title: "Effective Follow Up After a Health Assessment",
        type: "doc",
        url: "https://docs.google.com/document/d/1D-DyRUeV5r4jipqnudUxweh3HGFh_hPD/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "launch-9",
        title: "Common Objections and How to Address Them",
        type: "doc",
        url: "https://docs.google.com/document/d/1TQPw-pKAllqEz7MZXa3XEsxjN5Jo1T5b/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "launch-10",
        title: "Week One Posting Guide",
        type: "doc",
        url: "https://docs.google.com/document/d/1DIV9pEZlmqzA8ZIAnCPExQ_KhOedjA38OauiOqtqL5c/edit?usp=sharing",
      },
      {
        id: "launch-11",
        title: "Fast Track to Senior Coach",
        type: "doc",
        url: "https://www.canva.com/design/DAGRyr_F44Y/3_36EEwhi6JmMZfl1ZKAvw/edit?utm_content=DAGRyr_F44Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
      },
      {
        id: "launch-12",
        title: "30 Day New Coach Self-Evaluation",
        type: "doc",
        url: "https://docs.google.com/document/d/1nOC6erBMIws-SZzQ40TCz5DEvBQpmVLMUCI5V7E_8Ys/edit?usp=sharing",
      },
    ],
  },
  {
    id: "client-month-one",
    title: "Launching a Client & Month One",
    description: "Step-by-step guidance for supporting clients through their critical first month.",
    category: "Client Support",
    order: 2,
    forNewCoach: true,
    icon: "🎯",
    resources: [
      {
        id: "client-1",
        title: "New Client Checklist",
        type: "doc",
        url: "https://docs.google.com/document/d/1c8WqcDJPVmSm6h9Ss2x3V02L0apIemDp/edit?usp=sharing&ouid=103643178845055801965&rtpof=true&sd=true",
      },
      {
        id: "client-2",
        title: "Welcome and 9 Tips Text",
        type: "doc",
        url: "https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing",
      },
      {
        id: "client-3",
        title: "5 Success Tips",
        type: "doc",
        url: "https://docs.google.com/document/d/1nss0Lsj1L6jr0X8AEZHZ4cdLOt9vW_SZXokHHLy-r9M/edit?usp=sharing",
      },
      {
        id: "client-4",
        title: "Daily Metabolic Health Text Messages Days 1-10",
        type: "doc",
        url: "https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing",
      },
      {
        id: "client-5",
        title: "Optional Metabolic Health Text Messages Days 10-31",
        type: "doc",
        url: "https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing",
      },
      {
        id: "client-6",
        title: "Systems Check Questions",
        type: "doc",
        url: "https://docs.google.com/document/d/1xZJ_afiL_W4YcinCkM6NbNWrH2GqZmRnS1XrB_BRLIM/edit?usp=sharing",
      },
      {
        id: "client-7",
        title: "Detailed Systems Check Video for Clients Who Are Not Losing Well",
        type: "video",
        url: "https://docs.google.com/document/d/1HLqL_l7IELKgjlx5d3SBuXi2xdyBSaawJ5JmcKDoGHM/edit?usp=sharing",
      },
      {
        id: "client-8",
        title: "VIP Call How To",
        type: "doc",
        url: "https://docs.google.com/document/d/1vtYewe5sbVziNTzz3Fk3l3DhRt1x0xTps_hxtYEQk7Q/edit?usp=sharing",
      },
      {
        id: "client-9",
        title: "The Mindset Behind Effective Sponsorship",
        type: "video",
        url: "https://vimeo.com/665762974",
      },
    ],
  },
  {
    id: "client-support",
    title: "Client Support Texts & Videos",
    description: "Ready-to-use communication templates and video resources for effective client support.",
    category: "Client Support",
    order: 3,
    forNewCoach: true,
    icon: "💬",
    resources: [
      {
        id: "support-1",
        title: "Schedule for New Client Communication",
        type: "doc",
        url: "https://docs.google.com/document/d/1iYiwp4tMmlmqFDj8JoG8PNiFbF4ed6yRnMJnRMmzW1g/edit?usp=sharing",
      },
      {
        id: "support-2",
        title: "New Client Videos",
        type: "video",
        url: "https://docs.google.com/document/d/1yfVgcKDiXCP6Og1hopzSBGvI8l0MlQpoGt0hnxjXf_U/edit?usp=sharing",
      },
      {
        id: "support-3",
        title: "Welcome and 9 Tips",
        type: "doc",
        url: "https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing",
      },
      {
        id: "support-4",
        title: "Metabolic Health Texts Days 1-9",
        type: "doc",
        url: "https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing",
      },
      {
        id: "support-5",
        title: "Expanded Metabolic Health Texts Days 10-30",
        type: "doc",
        url: "https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing",
      },
      {
        id: "support-6",
        title: "Digital Guides",
        type: "doc",
        url: "https://docs.google.com/document/d/1TtZoQcKzTT77PZP0XNlMH-e8HiYzwKhS1UL8ZW5BcT8/edit?usp=sharing",
      },
      {
        id: "support-7",
        title: "Eat This Every Day",
        type: "doc",
        url: "https://docs.google.com/document/d/1_4kgw8X0_bHp6mbGW5Xtwdg0_W7hVYBWwNgHNSM3xLk/edit?usp=sharing",
      },
      {
        id: "support-8",
        title: "How to Update Your Premier Order",
        type: "doc",
        url: "https://docs.google.com/document/d/1D-ueL9kljNxEdqHFrvp9u-aze-z3-2glZaYN-936fCc/edit?usp=sharing",
      },
    ],
  },
  {
    id: "branding",
    title: "Branding Your Business",
    description: "Tools and strategies to create a compelling personal brand that attracts clients.",
    category: "Business Building",
    order: 4,
    forNewCoach: true,
    icon: "✨",
    resources: [
      {
        id: "brand-1",
        title: "How to Add a Disclaimer to Your Pictures",
        type: "video",
        url: "https://www.youtube.com/watch?v=Z4ABPUk5JHs",
      },
      {
        id: "brand-2",
        title: "How to Add a Wellness Credit",
        type: "video",
        url: "https://vimeo.com/473831198",
      },
      {
        id: "brand-3",
        title: "Branding and Setting Up Your Business",
        type: "doc",
        url: "https://docs.google.com/document/d/10aK_KwiHBXsVuUzRS2DjFmly0QH_VJ44ohSIMuxEJ3A/edit?usp=sharing",
      },
      {
        id: "brand-4",
        title: "Setting Up Your Coaching Website",
        type: "video",
        url: "https://youtu.be/xtSR2nJJfAg?si=dHRxhzOE_b1wcIF5",
      },
      {
        id: "brand-5",
        title: "Setting Up Your OPTAVIA Pay",
        type: "doc",
        url: "https://docs.google.com/document/d/1LuGK2ZNo8lFI51vesDKKHdUDCpgKhvtztv3-KS06KvE/edit?usp=sharing",
      },
      {
        id: "brand-6",
        title: "OPTAVIA Vocabulary",
        type: "doc",
        url: "https://docs.google.com/document/d/1jLPNcT5cROxHm8y_XWpCC4AQjnMo9bjwZs-Kz5UVXTY/edit?usp=sharing",
      },
    ],
  },
  {
    id: "social-media",
    title: "Social Media Strategy",
    description: "Proven social media tactics to grow your audience and generate leads.",
    category: "Business Building",
    order: 5,
    forNewCoach: false,
    icon: "📱",
    resources: [
      {
        id: "social-1",
        title: "How to Create a Simple Reel",
        type: "video",
        url: "https://vimeo.com/1147526154",
      },
      {
        id: "social-2",
        title: "How to Have Effective Conversations",
        type: "doc",
        url: "https://www.canva.com/design/DAGwKmV4-qY/jcb8D4BueFoAYZsc8uERiQ/view?utm_content=DAGwKmV4-qY&utm_campaign=designshare&utm_medium=link&utm_source=viewer",
      },
    ],
  },
  {
    id: "coaching-10x",
    title: "Coaching 10X",
    description: "Advanced coaching strategies to scale your business and achieve exponential growth.",
    category: "Business Building",
    order: 6,
    forNewCoach: false,
    icon: "⚡",
    resources: [
      {
        id: "10x-1",
        title: "10X Kickoff Call",
        type: "video",
        url: "https://vimeo.com/1114863189?fl=tl&fe=ec",
      },
    ],
  },
  {
    id: "metabolic-reset",
    title: "Coaching a Metabolic Reset",
    description: "Comprehensive resources for coaching clients through metabolic health transformation.",
    category: "Client Support",
    order: 7,
    forNewCoach: false,
    icon: "🔄",
    resources: [
      {
        id: "metabolic-1",
        title: "Metabolic Talking Points for Coaches",
        type: "doc",
        url: "https://docs.google.com/document/d/1GzyY4Je8wWtYxoY7DsuVlPTgCJWdEUzK8jp4UmS6MnQ/edit?usp=sharing",
      },
      {
        id: "metabolic-2",
        title: "10 Questions That Will Help You Gauge Your Metabolic Health",
        type: "video",
        url: "https://vimeo.com/1135751990/8205c4652d?fl=tl&fe=ec",
      },
    ],
  },
  {
    id: "moving-to-ed",
    title: "Moving to ED and Beyond",
    description: "Resources for advancing your coaching practice and expanding your business reach.",
    category: "Business Building",
    order: 8,
    forNewCoach: false,
    icon: "📈",
    resources: [
      {
        id: "ed-1",
        title: "Moving to ED and Beyond",
        type: "doc",
        url: "https://docs.google.com/document/d/15AyF_jd0KTKYgGyiruHMiZusQ_sDOg7DWXrpkxmAg7I/edit?usp=sharing",
      },
    ],
  },
  {
    id: "connect-business",
    title: "How to Use Connect to Grow Your Business",
    description: "Learn how to leverage OPTAVIA Connect to expand your coaching business and track your growth.",
    category: "Business Building",
    order: 9,
    forNewCoach: false,
    icon: "🔗",
    resources: [
      {
        id: "connect-1",
        title: "Basic How to Check Your Current and Projected FQV",
        type: "video",
        url: "https://www.loom.com/share/799a4ae74a7645aabab8f3d67a4215cf",
      },
      {
        id: "connect-2",
        title: "How to Run Projected Numbers for Yourself and a Team",
        type: "video",
        url: "https://www.loom.com/share/9da0ac3751e84db09ee375c9c039c527",
      },
      {
        id: "connect-3",
        title: "How to End the Month Strategically",
        type: "video",
        url: "https://vimeo.com/1105267713/6d51506452?fl=tl&fe=ec",
      },
    ],
  },
  {
    id: "team-resources",
    title: "Team Resources",
    description: "Essential trackers and tools for managing and growing your coaching team.",
    category: "Business Building",
    order: 10,
    forNewCoach: false,
    icon: "👥",
    resources: [
      {
        id: "team-1",
        title: "Teaching Your Chat GPT to Know You",
        type: "doc",
        url: "https://cdn.fbsbx.com/v/t59.2708-21/600933254_1848441836031561_1534090109953931690_n.pdf/PDF.pdf?_nc_cat=108&ccb=1-7&_nc_sid=2b0e22&_nc_ohc=pwe4VZspIpEQ7kNvwGV9R2-&_nc_oc=AdlX-wH52TdslJupV3jbn-wI8tvNc0Pnn9u5fwUtUcVGx5D9IWQNYKgujqwE7-bbYW29P6w7PzdCgymKzbYYxeJr&_nc_zt=7&_nc_ht=cdn.fbsbx.com&_nc_gid=MuExEBy5Lkhwb-W2_9Mx3Q&oh=03_Q7cD4AGKFuHDjq_XAG-rezLvQKghcg11VyMyou3qrtoeJOFSWA&oe=6940AD9F&dl=1",
      },
      {
        id: "team-2",
        title: "ED Daily Tracker",
        type: "doc",
        url: "https://docs.google.com/document/d/1kCzIHm7DV1WPSTsbTh-NZr4qXj278iZ52vOPs08PfbE/edit",
      },
      {
        id: "team-3",
        title: "FIBC Daily Tracker",
        type: "doc",
        url: "https://docs.google.com/document/d/1WSH2shc6mhmoJubPEdNOwyRC2VPotHOnzvYEBSDx-bk/edit",
      },
      {
        id: "team-4",
        title: "Grow to FIBC Bubble Tracker",
        type: "doc",
        url: "https://docs.google.com/document/d/1xwxMPmRRdBLHsyNLz1rkgMRDK6f8-_gr/edit",
      },
      {
        id: "team-5",
        title: "Global/Presidential Daily Tracker",
        type: "doc",
        url: "https://docs.google.com/document/d/1j9fcAHJ769BRyqaOhZ60HFzb7VhoB0gc3KL5pjyT1PQ/edit",
      },
      {
        id: "team-6",
        title: "IPD Bubble Tracker",
        type: "doc",
        url: "https://docs.google.com/document/d/1JRnQ_uavSfOVj3Mvwf7T2lCASmj8jnEb/edit",
      },
    ],
  },
  {
    id: "gold-standard",
    title: "Gold Standard Trainings",
    description: "Advanced coaching techniques and best practices for experienced coaches.",
    category: "Business Building",
    order: 11,
    forNewCoach: false,
    icon: "🏆",
    resources: [
      {
        id: "gold-1",
        title: "10X Kickoff Call with Kristen Glass",
        type: "video",
        url: "https://vimeo.com/manage/videos/1115495757/3e666d9fcd",
      },
    ],
  },
]

export const recipes: Recipe[] = [
  // ============================================
  // CHICKEN RECIPES
  // ============================================
  {
    id: "recipe-1",
    title: "Lemon Herb Grilled Chicken",
    description: "Tender grilled chicken breast with bright lemon and fresh herbs, served over roasted asparagus.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "24 oz chicken breast",
      "2 lemons, juiced and zested",
      "4 cloves garlic, minced",
      "2 tbsp fresh oregano, chopped",
      "2 tbsp fresh thyme",
      "1 lb asparagus, trimmed",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Marinate chicken in lemon juice, zest, garlic, and herbs for 30 minutes.",
      "Preheat grill to medium-high heat.",
      "Grill chicken 6-7 minutes per side until internal temp reaches 165°F.",
      "Toss asparagus with salt and grill 3-4 minutes.",
      "Let chicken rest 5 minutes before slicing. Serve over asparagus."
    ]
  },
  {
    id: "recipe-2",
    title: "Caprese Chicken",
    description: "Classic flavors of Caprese served on a tender chicken breast. So simple. So delicious.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "12 oz chicken breast",
      "2 oz fresh mozzarella, sliced",
      "2 Roma tomatoes, sliced",
      "Fresh basil leaves",
      "1 tbsp balsamic glaze",
      "4 cups mixed greens",
      "1 tbsp olive oil",
      "Salt and pepper"
    ],
    instructions: [
      "Season chicken with salt and pepper.",
      "Grill or pan-sear until cooked through, about 6-7 minutes per side.",
      "Top chicken with mozzarella, tomato slices, and fresh basil.",
      "Drizzle with balsamic glaze.",
      "Serve over mixed greens dressed with olive oil."
    ]
  },
  {
    id: "recipe-3",
    title: "Grilled Fajita Bowl",
    description: "Serve up a taste of the Southwest with a delicious dish perfect for family dinner.",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz chicken breast, sliced",
      "2 bell peppers, sliced",
      "1 onion, sliced",
      "2 tbsp fajita seasoning",
      "4 cups romaine lettuce",
      "1/2 cup salsa",
      "1/4 cup Greek yogurt",
      "1 avocado, sliced"
    ],
    instructions: [
      "Season chicken with fajita seasoning.",
      "Grill chicken 5-6 minutes per side until cooked through.",
      "Grill peppers and onions until slightly charred.",
      "Arrange lettuce in bowls.",
      "Top with chicken, peppers, onions, salsa, yogurt, and avocado."
    ]
  },
  {
    id: "recipe-4",
    title: "Buffalo Chicken Cauliflower Casserole",
    description: "Creamy and delicious buffalo chicken paired with cauliflower florets in a satisfying casserole.",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz cooked chicken breast, shredded",
      "4 cups cauliflower florets",
      "4 oz low-fat cream cheese",
      "1/4 cup buffalo sauce",
      "1/4 cup ranch dressing (light)",
      "1/2 cup reduced-fat cheddar cheese",
      "Green onions for garnish"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Steam cauliflower until tender, about 5 minutes.",
      "Mix cream cheese, buffalo sauce, and ranch until smooth.",
      "Combine chicken, cauliflower, and sauce mixture in a baking dish.",
      "Top with cheddar cheese and bake 20 minutes until bubbly.",
      "Garnish with green onions."
    ]
  },
  {
    id: "recipe-5",
    title: "Chicken Cacciatore (Instant Pot)",
    description: "A healthy and flavorful Italian dish with chicken thighs in a rich tomato sauce with peppers.",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 0, condiment: 3 },
    ingredients: [
      "20 oz boneless skinless chicken thighs",
      "1 can crushed tomatoes (14 oz)",
      "1 red bell pepper, sliced",
      "1 green bell pepper, sliced",
      "1/2 cup scallions, chopped",
      "3 cloves garlic, minced",
      "1 bay leaf",
      "Fresh parsley for garnish",
      "Salt and pepper"
    ],
    instructions: [
      "Season chicken with salt and pepper.",
      "Set Instant Pot to sauté and brown chicken on both sides.",
      "Add tomatoes, peppers, scallions, garlic, and bay leaf.",
      "Pressure cook on high for 15 minutes.",
      "Natural release for 5 minutes, then quick release.",
      "Remove bay leaf and garnish with fresh parsley."
    ]
  },
  {
    id: "recipe-6",
    title: "Crispy Almond Chicken Parmesan",
    description: "Crispy almond flour breaded chicken topped with marinara and melted mozzarella.",
    image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz chicken breast, pounded thin",
      "1/2 cup almond flour",
      "1/4 cup grated parmesan",
      "1 egg, beaten",
      "1 cup sugar-free marinara",
      "4 oz part-skim mozzarella",
      "4 cups zucchini noodles",
      "Italian seasoning"
    ],
    instructions: [
      "Preheat oven to 400°F.",
      "Mix almond flour, parmesan, and Italian seasoning.",
      "Dip chicken in egg, then coat in almond mixture.",
      "Bake chicken for 15 minutes.",
      "Top with marinara and mozzarella, bake 10 more minutes.",
      "Serve over zucchini noodles."
    ]
  },
  {
    id: "recipe-7",
    title: "Tropical Chicken Medley",
    description: "Lean chicken with sautéed peppers and broccoli, topped with toasted pine nuts.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "20 oz boneless skinless chicken breast",
      "2 cups broccoli florets",
      "1 red bell pepper, sliced",
      "1 yellow bell pepper, sliced",
      "2 tbsp pine nuts, toasted",
      "2 cloves garlic, minced",
      "1 tbsp olive oil",
      "Salt and pepper"
    ],
    instructions: [
      "Cut chicken into bite-sized pieces and season.",
      "Heat oil in a large skillet over medium-high heat.",
      "Cook chicken until golden, about 6-7 minutes. Remove.",
      "Sauté peppers and broccoli with garlic until tender-crisp.",
      "Return chicken to pan and toss together.",
      "Top with toasted pine nuts before serving."
    ]
  },
  {
    id: "recipe-8",
    title: "Chicken Zucchini Noodles with Pesto",
    description: "Fresh zucchini noodles tossed with grilled chicken and homemade parsley almond pesto.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Chicken",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "20 oz chicken breast",
      "4 medium zucchini, spiralized",
      "1 cup fresh parsley",
      "2 tbsp almonds",
      "2 cloves garlic",
      "2 tbsp olive oil",
      "2 tbsp parmesan cheese",
      "Salt and pepper"
    ],
    instructions: [
      "Blend parsley, almonds, garlic, olive oil, and parmesan for pesto.",
      "Season and grill chicken until cooked through.",
      "Spiralize zucchini into noodles.",
      "Sauté zoodles for 2-3 minutes until slightly tender.",
      "Slice chicken and toss with zoodles and pesto.",
      "Season with salt and pepper to taste."
    ]
  },

  // ============================================
  // SEAFOOD RECIPES
  // ============================================
  {
    id: "recipe-9",
    title: "Blackened Shrimp Lettuce Wraps",
    description: "Spicy blackened shrimp with creamy avocado crema and fresh tomato salsa in crisp lettuce cups.",
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 10,
    cookTime: 8,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "12 oz large shrimp, peeled and deveined",
      "2 tbsp blackened seasoning (Old Bay)",
      "1 head butter lettuce",
      "1 ripe avocado",
      "1/4 cup Greek yogurt",
      "2 Roma tomatoes, diced",
      "1/4 cup cilantro, chopped",
      "1 lime, juiced",
      "1 jalapeño, minced (optional)"
    ],
    instructions: [
      "Pat shrimp dry and coat evenly with blackened seasoning.",
      "Heat a skillet over high heat. Cook shrimp 2-3 minutes per side until opaque.",
      "Blend avocado, Greek yogurt, and half the lime juice for crema.",
      "Mix tomatoes, cilantro, jalapeño, and remaining lime juice for salsa.",
      "Arrange shrimp in lettuce cups, top with crema and salsa."
    ]
  },
  {
    id: "recipe-10",
    title: "Salmon Piccata with Capers",
    description: "Pan-seared salmon in a light lemon butter caper sauce with sautéed spinach.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "12 oz salmon fillet",
      "2 tbsp capers, drained",
      "2 lemons, juiced",
      "2 tbsp butter",
      "6 cups fresh spinach",
      "2 cloves garlic, minced",
      "Fresh parsley",
      "Salt and pepper"
    ],
    instructions: [
      "Season salmon with salt and pepper.",
      "Sear salmon in a hot pan 4 minutes per side.",
      "Remove salmon. Add butter, lemon juice, and capers to pan.",
      "In another pan, sauté garlic and spinach until wilted.",
      "Plate spinach, top with salmon, drizzle with piccata sauce."
    ]
  },
  {
    id: "recipe-11",
    title: "Sheet Pan Salmon with Asparagus",
    description: "Easy one-pan meal with perfectly roasted salmon and tender asparagus.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "20 oz salmon fillets",
      "1 lb asparagus, trimmed",
      "2 tbsp olive oil",
      "4 cloves garlic, minced",
      "1 lemon, sliced",
      "Fresh dill",
      "Salt and pepper"
    ],
    instructions: [
      "Preheat oven to 400°F.",
      "Arrange salmon and asparagus on a sheet pan.",
      "Drizzle with olive oil, sprinkle with garlic, salt, and pepper.",
      "Top salmon with lemon slices.",
      "Roast for 15-20 minutes until salmon flakes easily.",
      "Garnish with fresh dill."
    ]
  },
  {
    id: "recipe-12",
    title: "Shrimp Scampi Zoodles",
    description: "Classic shrimp scampi flavors over light and fresh zucchini noodles.",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "12 oz large shrimp, peeled",
      "3 medium zucchini, spiralized",
      "4 cloves garlic, minced",
      "2 tbsp butter",
      "1/4 cup white wine or chicken broth",
      "2 tbsp capers",
      "Red pepper flakes",
      "Fresh parsley"
    ],
    instructions: [
      "Spiralize zucchini into noodles.",
      "Sauté garlic in butter for 1 minute.",
      "Add shrimp, cook 2 minutes per side until pink.",
      "Add wine/broth and capers, simmer 2 minutes.",
      "Toss with zoodles, garnish with parsley and red pepper flakes."
    ]
  },
  {
    id: "recipe-13",
    title: "Za'atar Salmon Salad",
    description: "Middle Eastern spiced salmon served over a fresh cucumber tomato salad.",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "12 oz salmon fillets",
      "1 tbsp za'atar seasoning",
      "2 cups cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/4 red onion, thinly sliced",
      "2 cups mixed greens",
      "2 tbsp olive oil",
      "1 lemon, juiced"
    ],
    instructions: [
      "Season salmon with za'atar and roast at 400°F for 12-15 minutes.",
      "Combine cucumber, tomatoes, onion, and greens.",
      "Whisk olive oil and lemon juice for dressing.",
      "Toss salad with dressing.",
      "Top with roasted salmon and serve with lemon wedges."
    ]
  },
  {
    id: "recipe-14",
    title: "Lobster Roll Lettuce Wraps",
    description: "Light and refreshing, yet filling. The perfect dish for summer!",
    image: "https://images.unsplash.com/photo-1559742811-822873691df8?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "12 oz cooked lobster meat",
      "2 tbsp light mayo",
      "1 tbsp lemon juice",
      "1 celery stalk, diced",
      "1 tbsp chives, chopped",
      "1 head butter lettuce",
      "Old Bay seasoning",
      "Lemon wedges"
    ],
    instructions: [
      "Chop lobster into bite-sized pieces.",
      "Mix mayo, lemon juice, celery, and chives.",
      "Fold in lobster meat gently.",
      "Season with Old Bay to taste.",
      "Serve in lettuce cups with lemon wedges."
    ]
  },
  {
    id: "recipe-15",
    title: "Mediterranean Cod with Tomatoes",
    description: "Flaky cod topped with a zesty tomato mixture and feta cheese over zucchini.",
    image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "12 oz cod fillets",
      "2 medium zucchini, sliced",
      "1 cup cherry tomatoes, halved",
      "2 oz feta cheese, crumbled",
      "2 cloves garlic, minced",
      "1 tbsp olive oil",
      "Fresh oregano",
      "Salt and pepper"
    ],
    instructions: [
      "Preheat oven to 400°F.",
      "Arrange zucchini slices on a baking dish, season with salt.",
      "Place cod on top of zucchini.",
      "Mix tomatoes, garlic, olive oil, and oregano. Spoon over cod.",
      "Bake 15-20 minutes until cod flakes easily.",
      "Top with crumbled feta before serving."
    ]
  },
  {
    id: "recipe-16",
    title: "Shrimp and Avocado Salad",
    description: "Fresh and light salad with grilled shrimp, avocado, and pumpkin seeds.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 8,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "12 oz shrimp, peeled and deveined",
      "4 cups mixed greens",
      "1 avocado, sliced",
      "1/4 cup cilantro, chopped",
      "2 tbsp pumpkin seeds",
      "1 lime, juiced",
      "1 tbsp olive oil",
      "Salt and pepper"
    ],
    instructions: [
      "Season shrimp with salt and pepper.",
      "Grill or sauté shrimp until pink, about 2-3 minutes per side.",
      "Arrange greens on plates.",
      "Top with shrimp, avocado, cilantro, and pumpkin seeds.",
      "Drizzle with lime juice and olive oil."
    ]
  },
  {
    id: "recipe-17",
    title: "Cajun Shrimp and Cauliflower Rice",
    description: "Spicy Cajun shrimp served over fluffy cauliflower rice with peppers and onions.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    category: "Seafood",
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz large shrimp",
      "4 cups cauliflower rice",
      "2 tbsp Cajun seasoning",
      "1 bell pepper, diced",
      "1/2 onion, diced",
      "2 cloves garlic, minced",
      "1 tbsp olive oil",
      "Fresh parsley"
    ],
    instructions: [
      "Season shrimp with Cajun seasoning.",
      "Heat oil and sauté peppers and onions until soft.",
      "Add garlic and cauliflower rice, cook 5 minutes.",
      "Push rice to sides, add shrimp to center.",
      "Cook shrimp 2-3 minutes per side.",
      "Toss together and garnish with parsley."
    ]
  },

  // ============================================
  // BEEF RECIPES
  // ============================================
  {
    id: "recipe-18",
    title: "Beef & Chinese Broccoli",
    description: "Quick and flavorful beef stir-fry with tender Chinese broccoli in savory sauce.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 15,
    cookTime: 12,
    servings: 3,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "18 oz lean sirloin, thinly sliced",
      "1 lb Chinese broccoli",
      "3 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "2 tbsp coconut aminos",
      "1 tbsp sesame oil",
      "Red pepper flakes"
    ],
    instructions: [
      "Heat oil in a wok over high heat.",
      "Stir-fry beef 2-3 minutes until browned. Remove and set aside.",
      "Add garlic and ginger, cook 30 seconds.",
      "Add broccoli, cook 3-4 minutes until tender-crisp.",
      "Return beef, add coconut aminos, toss and serve."
    ]
  },
  {
    id: "recipe-19",
    title: "Big Mac Salad Bowl",
    description: "All the flavors of a Big Mac without the bun - beef, cheese, lettuce, and special sauce.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "12 oz lean ground beef (93%)",
      "4 cups romaine lettuce, chopped",
      "2 oz reduced-fat cheddar, shredded",
      "1/4 cup dill pickles, diced",
      "1/4 cup onion, diced",
      "2 tbsp light Thousand Island dressing",
      "Sesame seeds"
    ],
    instructions: [
      "Brown ground beef in a skillet, breaking into crumbles.",
      "Season with salt and pepper.",
      "Arrange lettuce in bowls.",
      "Top with beef, cheese, pickles, and onion.",
      "Drizzle with Thousand Island dressing.",
      "Sprinkle with sesame seeds."
    ]
  },
  {
    id: "recipe-20",
    title: "Beef Stroganoff with Cauliflower Rice",
    description: "Creamy beef stroganoff served over fluffy cauliflower rice with broccoli.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz beef sirloin, sliced into strips",
      "4 cups cauliflower rice",
      "2 cups broccoli florets",
      "1 cup beef broth",
      "1/2 cup light sour cream",
      "8 oz mushrooms, sliced",
      "1 tbsp fresh dill",
      "Salt and pepper"
    ],
    instructions: [
      "Season beef and sear in a hot pan until browned.",
      "Remove beef, sauté mushrooms until golden.",
      "Add broth and simmer 5 minutes.",
      "Stir in sour cream and dill.",
      "Return beef to sauce.",
      "Serve over cauliflower rice with steamed broccoli."
    ]
  },
  {
    id: "recipe-21",
    title: "Cheesy Taco Vegetable Skillet",
    description: "Ground beef with fresh vegetables and melted cheese - taco Tuesday made lean!",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "20 oz lean ground beef (93%)",
      "2 cups kale, chopped",
      "1 bell pepper, diced",
      "1/2 onion, diced",
      "2 tbsp taco seasoning",
      "1/2 cup reduced-fat cheddar",
      "Salsa for topping",
      "Fresh cilantro"
    ],
    instructions: [
      "Brown ground beef with taco seasoning.",
      "Add onion and pepper, cook until soft.",
      "Stir in kale and cook until wilted.",
      "Top with cheese and cover until melted.",
      "Serve with salsa and fresh cilantro."
    ]
  },
  {
    id: "recipe-22",
    title: "Spiced Crockpot Roast Beef",
    description: "Tender slow-cooked beef roast with vegetables and aromatic spices.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 20,
    cookTime: 480,
    servings: 6,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 3 },
    ingredients: [
      "2 lb beef chuck roast",
      "2 cups celery, chopped",
      "2 cups green beans",
      "1 onion, quartered",
      "4 cloves garlic",
      "2 cups beef broth",
      "1 tbsp Italian seasoning",
      "Salt and pepper"
    ],
    instructions: [
      "Season roast with Italian seasoning, salt, and pepper.",
      "Place vegetables in the bottom of slow cooker.",
      "Add roast on top, pour in broth.",
      "Add garlic cloves around the roast.",
      "Cook on low for 8 hours or high for 4-5 hours.",
      "Shred beef and serve with vegetables."
    ]
  },
  {
    id: "recipe-23",
    title: "Korean Beef Lettuce Cups",
    description: "Sweet and savory Korean-style ground beef served in crisp lettuce cups.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop",
    category: "Beef",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "20 oz lean ground beef",
      "1 head butter lettuce",
      "3 tbsp coconut aminos",
      "1 tbsp sesame oil",
      "2 cloves garlic, minced",
      "1 tbsp fresh ginger, minced",
      "Green onions, sliced",
      "Sesame seeds"
    ],
    instructions: [
      "Brown ground beef in a skillet.",
      "Add garlic and ginger, cook 1 minute.",
      "Stir in coconut aminos and sesame oil.",
      "Simmer 2-3 minutes until sauce thickens.",
      "Spoon into lettuce cups.",
      "Top with green onions and sesame seeds."
    ]
  },

  // ============================================
  // TURKEY RECIPES
  // ============================================
  {
    id: "recipe-24",
    title: "Zucchini Noodles with Turkey Meatballs",
    description: "Light and satisfying zoodles topped with lean turkey meatballs and marinara sauce.",
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop",
    category: "Turkey",
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz lean ground turkey (93%)",
      "4 medium zucchini, spiralized",
      "1 cup sugar-free marinara sauce",
      "1/4 cup parmesan cheese",
      "1 egg",
      "2 cloves garlic, minced",
      "Italian seasoning",
      "Fresh basil for garnish"
    ],
    instructions: [
      "Mix turkey, egg, half the parmesan, garlic, and Italian seasoning.",
      "Form into 16 meatballs. Bake at 400°F for 20 minutes.",
      "Spiralize zucchini into noodles.",
      "Sauté zoodles in a pan for 2-3 minutes until slightly tender.",
      "Top with meatballs, marinara, remaining parmesan, and fresh basil."
    ]
  },
  {
    id: "recipe-25",
    title: "Turkey Taco Bake",
    description: "All the flavors of taco night in a satisfying casserole form.",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
    category: "Turkey",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "20 oz lean ground turkey",
      "2 cups cauliflower rice",
      "1 can diced tomatoes with green chiles",
      "2 tbsp taco seasoning",
      "1/2 cup reduced-fat Mexican cheese",
      "1/4 cup Greek yogurt",
      "Fresh cilantro",
      "Jalapeños (optional)"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Brown turkey with taco seasoning.",
      "Mix with cauliflower rice and tomatoes.",
      "Pour into baking dish, top with cheese.",
      "Bake 25 minutes until bubbly.",
      "Serve with yogurt and cilantro."
    ]
  },
  {
    id: "recipe-26",
    title: "Turkey Zucchini Lasagna",
    description: "Classic lasagna flavors using zucchini slices instead of pasta.",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
    category: "Turkey",
    prepTime: 25,
    cookTime: 45,
    servings: 6,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "24 oz lean ground turkey",
      "4 large zucchini, sliced lengthwise",
      "2 cups sugar-free marinara",
      "1 cup part-skim ricotta",
      "1 cup part-skim mozzarella",
      "1/4 cup parmesan",
      "Italian seasoning",
      "Fresh basil"
    ],
    instructions: [
      "Salt zucchini slices and let drain 15 minutes.",
      "Brown turkey with Italian seasoning.",
      "Layer in baking dish: zucchini, turkey, ricotta, marinara, mozzarella.",
      "Repeat layers, ending with cheese.",
      "Bake at 375°F for 45 minutes.",
      "Rest 10 minutes before serving with fresh basil."
    ]
  },
  {
    id: "recipe-27",
    title: "Crockpot Chicken Taco Soup",
    description: "A healthy and flavorful soup that combines lean protein, vegetables, and taco spices.",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    category: "Turkey",
    prepTime: 15,
    cookTime: 360,
    servings: 6,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 3 },
    ingredients: [
      "24 oz chicken or turkey breast",
      "4 cups chicken broth",
      "1 can diced tomatoes",
      "2 cups cabbage, shredded",
      "2 tbsp taco seasoning",
      "1 tsp cumin",
      "1 tsp chili powder",
      "2 cloves garlic, minced"
    ],
    instructions: [
      "Combine broth, tomatoes, seasonings, and garlic in slow cooker.",
      "Add chicken/turkey breast and cabbage.",
      "Cook on low for 6-8 hours or high for 3-4 hours.",
      "Shred meat with two forks.",
      "Serve in bowls, optionally top with cheese and Greek yogurt."
    ]
  },
  {
    id: "recipe-28",
    title: "BBQ Turkey Stuffed Peppers",
    description: "Colorful bell peppers stuffed with BBQ turkey and cauliflower rice.",
    image: "https://images.unsplash.com/photo-1601000938365-f182c5ec7e46?w=400&h=300&fit=crop", // Option 1 - Colorful stuffed peppers with melted cheese (recommended)
    category: "Turkey",
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "20 oz lean ground turkey",
      "4 large bell peppers, tops removed",
      "2 cups cauliflower rice",
      "1/4 cup sugar-free BBQ sauce",
      "1/2 cup reduced-fat cheddar",
      "1/4 cup onion, diced",
      "Garlic powder",
      "Fresh parsley"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Brown turkey with onion and garlic powder.",
      "Mix in cauliflower rice and BBQ sauce.",
      "Stuff mixture into peppers.",
      "Bake 30 minutes, top with cheese.",
      "Bake 5 more minutes until cheese melts."
    ]
  },

  // ============================================
  // PORK RECIPES
  // ============================================
  {
    id: "recipe-29",
    title: "Pork Tacos",
    description: "Easy, cheesy and perfect for any time you're craving tacos.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
    category: "Pork",
    prepTime: 15,
    cookTime: 20,
    servings: 3,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 2 },
    ingredients: [
      "18 oz pork tenderloin, sliced",
      "2 tbsp taco seasoning",
      "1 head butter lettuce",
      "1/2 cup pico de gallo",
      "1/4 cup Greek yogurt",
      "Fresh cilantro",
      "1 lime",
      "Jalapeño slices"
    ],
    instructions: [
      "Season pork with taco seasoning.",
      "Grill or pan-sear 3-4 minutes per side.",
      "Let rest 5 minutes, then slice.",
      "Arrange pork in lettuce cups.",
      "Top with pico, yogurt, cilantro, and lime."
    ]
  },
  {
    id: "recipe-30",
    title: "Asian Pork Stir-Fry",
    description: "Quick pork tenderloin stir-fry with snap peas and water chestnuts.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
    category: "Pork",
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "20 oz pork tenderloin, sliced thin",
      "2 cups snap peas",
      "1 cup water chestnuts, sliced",
      "1 red bell pepper, sliced",
      "3 tbsp coconut aminos",
      "1 tbsp sesame oil",
      "2 cloves garlic, minced",
      "1 tbsp ginger, minced"
    ],
    instructions: [
      "Heat sesame oil in a wok over high heat.",
      "Stir-fry pork 3-4 minutes until cooked. Remove.",
      "Add garlic, ginger, and vegetables. Cook 3-4 minutes.",
      "Return pork to wok.",
      "Add coconut aminos and toss to combine.",
      "Serve immediately."
    ]
  },

  // ============================================
  // VEGETARIAN RECIPES
  // ============================================
  {
    id: "recipe-31",
    title: "Cauliflower Grilled Cheese",
    description: "The grilled cheese flavor you love, without all of the carbs and calories.",
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 0 },
    ingredients: [
      "3 cups riced cauliflower",
      "2 eggs",
      "1/2 cup shredded cheddar cheese",
      "1/4 cup parmesan cheese",
      "1/4 tsp garlic powder",
      "Salt and pepper",
      "Cooking spray"
    ],
    instructions: [
      "Microwave riced cauliflower 4 minutes. Let cool and squeeze dry.",
      "Mix with 1 egg, parmesan, and seasonings.",
      "Form into 4 thin patties on parchment-lined pan.",
      "Bake at 400°F for 15 minutes until golden.",
      "Add cheddar between two patties and grill until melted."
    ]
  },
  {
    id: "recipe-32",
    title: "Crispy Tofu with Caramelized Veggies",
    description: "Lightly seasoned tofu baked with fresh vegetables for a satisfying plant-based meal.",
    image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 20,
    cookTime: 30,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 3 },
    ingredients: [
      "15 oz extra firm tofu, pressed and cubed",
      "2 cups asparagus, trimmed",
      "1 cup bell peppers, sliced",
      "1 cup zucchini, sliced",
      "2 tbsp olive oil",
      "2 tbsp coconut aminos",
      "1 tbsp sesame seeds",
      "Garlic powder, salt, pepper"
    ],
    instructions: [
      "Press tofu for 15 minutes, then cube.",
      "Toss tofu with half the oil and seasonings.",
      "Bake at 400°F for 20 minutes, flipping halfway.",
      "Toss vegetables with remaining oil.",
      "Add vegetables to pan, bake 10 more minutes.",
      "Drizzle with coconut aminos and sesame seeds."
    ]
  },
  {
    id: "recipe-33",
    title: "Vegetable Tofu Bowl with Eggs",
    description: "A Chinese-inspired bowl with crispy tofu, sautéed vegetables, and poached eggs.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 20,
    cookTime: 25,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "10 oz extra firm tofu, cubed",
      "2 eggs",
      "1 cup cauliflower florets",
      "1 cup mushrooms, sliced",
      "1 bell pepper, diced",
      "2 tbsp soy sauce or coconut aminos",
      "1 tsp sriracha",
      "Fresh cilantro, ginger, garlic"
    ],
    instructions: [
      "Press and cube tofu. Pan-fry until golden.",
      "Sauté vegetables with ginger and garlic.",
      "Add soy sauce and sriracha.",
      "Place tofu on vegetables, simmer.",
      "Crack eggs into the pan, cover and cook until set.",
      "Garnish with cilantro."
    ]
  },
  {
    id: "recipe-34",
    title: "Ricotta Spinach Dumplings",
    description: "Italian-style ricotta and spinach dumplings baked with cherry tomatoes and basil.",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 25,
    cookTime: 25,
    servings: 2,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 3 },
    ingredients: [
      "1 cup part-skim ricotta cheese",
      "2 cups fresh spinach, wilted and drained",
      "1 egg",
      "1/4 cup parmesan cheese",
      "1 cup cherry tomatoes, halved",
      "Fresh basil",
      "Garlic, Italian seasoning",
      "Salt and pepper"
    ],
    instructions: [
      "Mix ricotta, spinach, egg, parmesan, and seasonings.",
      "Form into small dumplings.",
      "Place in baking dish with cherry tomatoes.",
      "Drizzle with olive oil.",
      "Bake at 400°F for 20-25 minutes.",
      "Garnish with fresh basil."
    ]
  },
  {
    id: "recipe-35",
    title: "Zucchini Pizza Casserole",
    description: "All the pizza flavors you love in a veggie-packed casserole.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 2 },
    ingredients: [
      "4 medium zucchini, sliced",
      "1 cup sugar-free marinara",
      "1 cup part-skim mozzarella",
      "1/4 cup parmesan",
      "1/2 cup mushrooms, sliced",
      "1/4 cup black olives",
      "Italian seasoning",
      "Fresh basil"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Layer zucchini in a baking dish.",
      "Spread marinara over zucchini.",
      "Add mushrooms and olives.",
      "Top with cheeses and Italian seasoning.",
      "Bake 30-35 minutes until bubbly."
    ]
  },
  {
    id: "recipe-36",
    title: "Vegetarian Chili",
    description: "Plant-based, lower carb chili packed with vegetables and protein.",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
    category: "Vegetarian",
    prepTime: 20,
    cookTime: 40,
    servings: 4,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 0, condiment: 3 },
    ingredients: [
      "15 oz extra firm tofu, crumbled",
      "1 can diced tomatoes",
      "2 cups cauliflower, chopped",
      "1 bell pepper, diced",
      "1/2 onion, diced",
      "2 tbsp chili powder",
      "1 tsp cumin",
      "Garlic, salt, pepper"
    ],
    instructions: [
      "Sauté onion and pepper until soft.",
      "Add crumbled tofu and cook 5 minutes.",
      "Stir in tomatoes, cauliflower, and spices.",
      "Simmer 30 minutes until vegetables are tender.",
      "Adjust seasonings to taste.",
      "Serve with Greek yogurt if desired."
    ]
  },

  // ============================================
  // BREAKFAST RECIPES
  // ============================================
  {
    id: "recipe-37",
    title: "Egg White Veggie Scramble",
    description: "Protein-packed breakfast with fluffy egg whites and colorful sautéed vegetables.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "6 egg whites",
      "1 cup spinach",
      "1/2 cup mushrooms, sliced",
      "1/4 cup bell pepper, diced",
      "2 tbsp feta cheese",
      "1 tsp olive oil",
      "Fresh herbs",
      "Salt and pepper"
    ],
    instructions: [
      "Heat oil in a non-stick pan over medium heat.",
      "Sauté mushrooms and peppers for 3 minutes.",
      "Add spinach, cook until wilted.",
      "Pour in egg whites, gently scramble.",
      "Top with feta and fresh herbs."
    ]
  },
  {
    id: "recipe-38",
    title: "Hearty Veggie Frittata",
    description: "A delicious baked frittata packed with fresh vegetables - perfect for any meal.",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 30,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "6 eggs",
      "2 tbsp almond milk",
      "2 cups spinach",
      "1 cup zucchini, diced",
      "1 cup mushrooms, sliced",
      "1 tbsp olive oil",
      "Salt and pepper",
      "Fresh herbs"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Whisk eggs and almond milk.",
      "Sauté vegetables in an oven-safe skillet.",
      "Pour eggs over vegetables.",
      "Cook on stovetop 2 minutes.",
      "Transfer to oven, bake 20-30 minutes until set."
    ]
  },
  {
    id: "recipe-39",
    title: "Spinach Tomato Egg Muffins",
    description: "Portable egg muffins loaded with spinach, tomatoes, and cheese.",
    image: "https://images.unsplash.com/photo-1608039829572-9b79e4e37f29?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 25,
    servings: 6,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 0 },
    ingredients: [
      "6 eggs",
      "2 cups spinach, chopped",
      "1/2 cup cherry tomatoes, diced",
      "1/4 cup onion, diced",
      "1/4 cup goat cheese, crumbled",
      "Salt and pepper",
      "Cooking spray"
    ],
    instructions: [
      "Preheat oven to 350°F. Spray muffin tin.",
      "Sauté spinach and onion until wilted.",
      "Divide vegetables and tomatoes among muffin cups.",
      "Whisk eggs with salt and pepper.",
      "Pour eggs over vegetables.",
      "Top with goat cheese, bake 20-25 minutes."
    ]
  },
  {
    id: "recipe-40",
    title: "Asparagus and Crabmeat Frittata",
    description: "Elegant brunch option with tender crabmeat and fresh asparagus.",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "8 eggs",
      "6 oz crabmeat",
      "1 lb asparagus, cut into pieces",
      "1/4 cup parmesan cheese",
      "2 tbsp olive oil",
      "2 cloves garlic, minced",
      "Fresh dill",
      "Salt and pepper"
    ],
    instructions: [
      "Preheat oven to 375°F.",
      "Sauté asparagus and garlic in oil until tender.",
      "Add crabmeat, toss gently.",
      "Whisk eggs with parmesan and seasonings.",
      "Pour over asparagus mixture.",
      "Bake 20-25 minutes until set."
    ]
  },
  {
    id: "recipe-41",
    title: "Mason Jar Egg Salad",
    description: "Simple, portable, and packed with lean protein and veggies.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 12,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "6 hard-boiled eggs",
      "2 tbsp light mayo",
      "1 tbsp Dijon mustard",
      "2 cups mixed greens",
      "1/2 cup celery, diced",
      "1/4 cup red onion, diced",
      "Salt and pepper",
      "Paprika"
    ],
    instructions: [
      "Hard boil eggs, cool and peel.",
      "Chop eggs and mix with mayo and mustard.",
      "Season with salt, pepper, and paprika.",
      "Layer greens in mason jars.",
      "Top with egg salad, celery, and onion.",
      "Seal and refrigerate until ready to eat."
    ]
  },
  {
    id: "recipe-42",
    title: "Kohlrabi Egg Scramble",
    description: "A unique breakfast featuring kohlrabi paired with fluffy scrambled eggs.",
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400&h=300&fit=crop",
    category: "Breakfast",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",
    counts: { lean: 1, green: 3, fat: 1, condiment: 1 },
    ingredients: [
      "4 eggs",
      "2 egg whites",
      "1 kohlrabi, peeled and diced",
      "1 cup kale, chopped",
      "1 tbsp olive oil",
      "2 cloves garlic, minced",
      "Salt and pepper",
      "Fresh chives"
    ],
    instructions: [
      "Heat oil in a skillet over medium heat.",
      "Sauté kohlrabi until tender, about 8 minutes.",
      "Add garlic and kale, cook 2 minutes.",
      "Whisk eggs and egg whites.",
      "Pour over vegetables and scramble.",
      "Top with chives and serve."
    ]
  },
]
