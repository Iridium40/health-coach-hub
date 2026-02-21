"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket, CheckCircle, Circle, Lock, ChevronRight, ChevronDown, ChevronUp, Star, Trophy, Target, Zap, Clock, Calendar, Play, Gift, Award, Heart, Users, MessageSquare, Phone, BookOpen, Video, FileText, ExternalLink, Flame, TrendingUp, Sparkles, PartyPopper, Crown, Medal, Flag, MapPin, Shield, RefreshCw } from 'lucide-react';

export default function NewCoachLaunchpad() {
  const [coachName, setCoachName] = useState('Coach');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    '1-1': true, '1-2': true, '1-3': true, '1-4': true, '1-5': true,
    '2-1': true, '2-2': true, '2-3': false,
    '3-1': false
  });
  const [expandedDay, setExpandedDay] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const calculateCurrentDay = () => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(30, diff));
  };

  const currentDay = calculateCurrentDay();

  const toggleTask = (taskId: string) => {
    const newCompleted = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(newCompleted);

    const dayNum = parseInt(taskId.split('-')[0]);
    const dayTasks = launchpadDays.find(d => d.day === dayNum)?.tasks || [];
    const dayTaskIds = dayTasks.map((_, i) => `${dayNum}-${i + 1}`);
    const allDayComplete = dayTaskIds.every(id => newCompleted[id]);

    if (allDayComplete && !completedTasks[taskId]) {
      const milestones: Record<number, string> = {
        1: "🎉 Day 1 Complete! You've taken the first step!",
        3: "🔥 3 Days Strong! You're building momentum!",
        7: "🏆 WEEK 1 DONE! You're officially in the game!",
        14: "⭐ 2 WEEKS! You're becoming a real coach!",
        21: "💎 21 Days - Habits are forming!",
        30: "👑 30 DAYS! You've completed your Launchpad!"
      };
      if (milestones[dayNum]) {
        setCelebrationMessage(milestones[dayNum]);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    }
  };

  const launchpadDays = [
    {
      day: 1,
      title: "Welcome & Setup",
      theme: "Get Started",
      icon: Rocket,
      color: "#4caf50",
      milestone: "First Steps",
      tasks: [
        { title: "Watch Welcome Video", type: "video", duration: "10 min", link: "/training/welcome-getting-started", description: "Meet your upline and understand the journey ahead" },
        { title: "Complete Your Coach Profile", type: "action", duration: "15 min", description: "Add your photo, bio, and contact info to your back office" },
        { title: "Join Team Facebook Group", type: "action", duration: "5 min", description: "Connect with your support community" },
        { title: "Schedule Call with Sponsor", type: "call", duration: "30 min", description: "Set up your first coaching call for strategy and questions" },
        { title: "Write Your WHY Statement", type: "exercise", duration: "20 min", description: "Why are you doing this? Get clear on your motivation" }
      ]
    },
    {
      day: 2,
      title: "Know Your Products",
      theme: "Product Training",
      icon: BookOpen,
      color: "#2196f3",
      milestone: "Product Expert",
      tasks: [
        { title: "Complete OPTAVIA 101 Training", type: "training", duration: "30 min", link: "/training/optavia-store-setup", description: "Learn the basics of the 5&1 Plan and how it works" },
        { title: "Order Your Sample Kit", type: "action", duration: "10 min", description: "Get fuelings to try yourself and share with prospects" },
        { title: "Try 3 Different Fuelings", type: "experience", duration: "Throughout day", description: "Experience the products firsthand so you can speak authentically" },
        { title: "Review Lean & Green Guidelines", type: "training", duration: "20 min", link: "/training/client-program-guide", description: "Understand the L&G meal structure" }
      ]
    },
    {
      day: 3,
      title: "Build Your List",
      theme: "Prospecting Foundation",
      icon: Users,
      color: "#ff9800",
      milestone: "Pipeline Started",
      tasks: [
        { title: "Complete 100s List Training", type: "training", duration: "20 min", link: "/training/building-your-100s-list", description: "Learn the art of building your prospect list" },
        { title: "Brainstorm 50 Names", type: "exercise", duration: "30 min", description: "Everyone you know - don't prejudge! Use the categories method" },
        { title: "Add 20 Prospects to Pipeline", type: "action", duration: "20 min", link: "/prospect-pipeline", description: "Enter your top 20 prospects into the tracking system" },
        { title: "Identify Your Top 5", type: "exercise", duration: "10 min", description: "Who are the 5 people most likely to say yes?" }
      ]
    },
    {
      day: 4,
      title: "Social Media Setup",
      theme: "Online Presence",
      icon: MessageSquare,
      color: "#e91e63",
      milestone: "Online Ready",
      tasks: [
        { title: "Optimize Facebook Profile", type: "action", duration: "20 min", description: "Update bio, profile photo, and cover to reflect your health journey" },
        { title: "Create/Update Instagram Bio", type: "action", duration: "10 min", description: "Clear bio that shows you help people with health" },
        { title: "Draft Your Launch Post", type: "exercise", duration: "30 min", link: "/training/social-media-preparation", description: "Write your 'I'm a coach' announcement (don't post yet!)" },
        { title: "Plan Content for Week 1", type: "exercise", duration: "20 min", description: "Outline 5-7 posts for your first week" }
      ]
    },
    {
      day: 5,
      title: "The Conversation",
      theme: "Communication Skills",
      icon: Phone,
      color: "#9c27b0",
      milestone: "Script Ready",
      tasks: [
        { title: "Learn the Approach Script", type: "training", duration: "30 min", link: "/training/initial-conversation-scripts", description: "Master the initial conversation framework" },
        { title: "Practice Script 3 Times", type: "exercise", duration: "15 min", description: "Say it out loud until it feels natural" },
        { title: "Role Play with Sponsor", type: "call", duration: "20 min", description: "Practice the conversation with feedback" },
        { title: "Watch Health Assessment Demo", type: "video", duration: "15 min", link: "/training/health-assessment-mastery", description: "See how a real HA conversation flows" }
      ]
    },
    {
      day: 6,
      title: "Take Action",
      theme: "First Outreach",
      icon: Zap,
      color: "#ff5722",
      milestone: "First Contact",
      tasks: [
        { title: "Post Your Launch Announcement", type: "action", duration: "10 min", description: "Share your news with the world!" },
        { title: "Reach Out to 5 Warm Contacts", type: "action", duration: "30 min", description: "Message your warmest prospects from your list" },
        { title: "Schedule 2 Coffee Chats", type: "action", duration: "15 min", description: "Get face-to-face or video call time on the calendar" },
        { title: "Log All Contacts in Pipeline", type: "action", duration: "10 min", link: "/prospect-pipeline", description: "Track every conversation" }
      ]
    },
    {
      day: 7,
      title: "Week 1 Review",
      theme: "Reflection & Planning",
      icon: Trophy,
      color: "#ffc107",
      milestone: "🏆 WEEK 1 COMPLETE!",
      tasks: [
        { title: "Weekly Review with Sponsor", type: "call", duration: "30 min", description: "Celebrate wins, troubleshoot challenges, set Week 2 goals" },
        { title: "Update Pipeline Status", type: "action", duration: "15 min", link: "/prospect-pipeline", description: "Move prospects through stages, add notes" },
        { title: "Set 3 Goals for Week 2", type: "exercise", duration: "15 min", description: "Specific, measurable goals for the coming week" },
        { title: "Reward Yourself!", type: "celebration", duration: "As needed", description: "You completed Week 1! Do something nice for yourself" }
      ]
    },
    {
      day: 8,
      title: "Health Assessment Mastery",
      theme: "Deep Dive: HA",
      icon: Target,
      color: "#00bcd4",
      milestone: "HA Expert",
      tasks: [
        { title: "Complete HA Deep Dive Training", type: "training", duration: "45 min", link: "/training/health-assessment-mastery", description: "Master every aspect of the Health Assessment" },
        { title: "Practice HA with Family Member", type: "exercise", duration: "30 min", description: "Do a mock HA to get comfortable with the flow" },
        { title: "Prepare Your HA Materials", type: "action", duration: "15 min", description: "Links ready, calculator accessible, success stories loaded" },
        { title: "Schedule Your First Real HA", type: "action", duration: "10 min", description: "Book it with a warm prospect!" }
      ]
    },
    {
      day: 9,
      title: "Follow-Up Systems",
      theme: "Consistency",
      icon: RefreshCw,
      color: "#795548",
      milestone: "System Built",
      tasks: [
        { title: "Learn Follow-Up Framework", type: "training", duration: "20 min", link: "/training/follow-up-mastery", description: "The fortune is in the follow-up - learn how" },
        { title: "Set Up Daily Follow-Up Time", type: "action", duration: "10 min", description: "Block 30 min daily in your calendar for follow-ups" },
        { title: "Create Follow-Up Templates", type: "exercise", duration: "20 min", description: "Draft 3 different follow-up messages to use" },
        { title: "Follow Up with All Pending Prospects", type: "action", duration: "30 min", description: "Touch everyone who hasn't responded" }
      ]
    },
    {
      day: 10,
      title: "Content Creation",
      theme: "Social Selling",
      icon: Sparkles,
      color: "#673ab7",
      milestone: "Content Creator",
      tasks: [
        { title: "Learn Value-First Content Strategy", type: "training", duration: "25 min", link: "/training/instagram-reels-strategy", description: "How to post without being salesy" },
        { title: "Create 7 Days of Content", type: "exercise", duration: "45 min", description: "Batch create posts for the coming week" },
        { title: "Schedule Posts in Advance", type: "action", duration: "15 min", description: "Use scheduling tools to post consistently" },
        { title: "Engage on 10 Posts Today", type: "action", duration: "20 min", description: "Comment meaningfully on others' posts" }
      ]
    },
    {
      day: 11,
      title: "Handling Objections",
      theme: "Confidence Building",
      icon: Shield,
      color: "#607d8b",
      milestone: "Objection Handler",
      tasks: [
        { title: "Learn Top 10 Objections", type: "training", duration: "30 min", link: "/training/objection-handling", description: "Know the common pushbacks and how to respond" },
        { title: "Write Your Responses", type: "exercise", duration: "25 min", description: "Personalize responses in your own words" },
        { title: "Role Play Objections", type: "call", duration: "20 min", description: "Practice with sponsor or team member" },
        { title: "Reach Out to 5 More Prospects", type: "action", duration: "20 min", description: "Keep building momentum!" }
      ]
    },
    {
      day: 12,
      title: "Client Success Prep",
      theme: "Getting Ready",
      icon: Heart,
      color: "#e91e63",
      milestone: "Client Ready",
      tasks: [
        { title: "Learn Client Onboarding Process", type: "training", duration: "30 min", link: "/training/new-client-onboarding", description: "What to do when someone says YES" },
        { title: "Set Up Client List", type: "action", duration: "15 min", link: "/client-tracker", description: "Get ready to track your clients' progress" },
        { title: "Review Day 1-9 Text Templates", type: "training", duration: "20 min", link: "/training/daily-client-support", description: "Know what to send your clients each day" },
        { title: "Prepare Client Welcome Package", type: "action", duration: "20 min", description: "What will you send/say when they start?" }
      ]
    },
    {
      day: 13,
      title: "Push for Results",
      theme: "Action Day",
      icon: Flame,
      color: "#ff5722",
      milestone: "Momentum Builder",
      tasks: [
        { title: "Reach Out to 10 People Today", type: "action", duration: "45 min", description: "Bigger push day - more conversations!" },
        { title: "Follow Up on All Pending", type: "action", duration: "20 min", description: "Nobody falls through the cracks" },
        { title: "Post Valuable Content", type: "action", duration: "15 min", description: "Stay visible and valuable" },
        { title: "Ask for 3 Referrals", type: "action", duration: "15 min", description: "Who do your contacts know who might be interested?" }
      ]
    },
    {
      day: 14,
      title: "Week 2 Review",
      theme: "Halfway Point!",
      icon: Star,
      color: "#ffc107",
      milestone: "⭐ 2 WEEKS COMPLETE!",
      tasks: [
        { title: "Week 2 Review with Sponsor", type: "call", duration: "30 min", description: "Deep dive on progress, adjust strategy as needed" },
        { title: "Calculate Your Numbers", type: "exercise", duration: "15 min", description: "How many contacts, HAs, close rate?" },
        { title: "Identify What's Working", type: "exercise", duration: "15 min", description: "Double down on successful approaches" },
        { title: "Set Week 3-4 Goals", type: "exercise", duration: "15 min", description: "What will you accomplish in the next 2 weeks?" }
      ]
    },
    {
      day: 21,
      title: "Three Week Mark",
      theme: "Habit Formed",
      icon: Medal,
      color: "#9c27b0",
      milestone: "💎 21 DAYS - HABITS FORMED!",
      tasks: [
        { title: "21-Day Reflection", type: "exercise", duration: "20 min", description: "How have you grown? What habits are now automatic?" },
        { title: "Review All Training Progress", type: "action", duration: "15 min", description: "What training have you completed? What's left?" },
        { title: "Plan Your First Month Celebration", type: "action", duration: "10 min", description: "How will you celebrate Day 30?" },
        { title: "Set Rank Goal", type: "exercise", duration: "15 min", description: "What rank will you hit and by when?" }
      ]
    },
    {
      day: 30,
      title: "Launchpad Complete!",
      theme: "Graduation Day",
      icon: Crown,
      color: "#ff9800",
      milestone: "👑 LAUNCHPAD GRADUATE!",
      tasks: [
        { title: "Final Review with Sponsor", type: "call", duration: "45 min", description: "Celebrate and plan your next 90 days" },
        { title: "Complete 30-Day Assessment", type: "exercise", duration: "20 min", description: "What did you accomplish? What's your trajectory?" },
        { title: "Set 90-Day Goals", type: "exercise", duration: "20 min", description: "Where will you be in 3 months?" },
        { title: "Share Your Journey", type: "action", duration: "15 min", description: "Post about completing your first 30 days!" },
        { title: "Celebrate! 🎉", type: "celebration", duration: "As deserved!", description: "You did it! You're officially launched!" }
      ]
    }
  ];

  // Fill in remaining days
  const filledDays = [...launchpadDays];
  for (let i = 15; i <= 29; i++) {
    if (!filledDays.find(d => d.day === i)) {
      filledDays.push({
        day: i,
        title: `Day ${i} Actions`,
        theme: "Building Momentum",
        icon: Zap,
        color: "#2196f3",
        milestone: "",
        tasks: [
          { title: "Daily Prospect Outreach (5 people)", type: "action", duration: "30 min", description: "Consistent daily action builds results" },
          { title: "Follow Up on Pending", type: "action", duration: "20 min", description: "Check in with everyone in your pipeline" },
          { title: "Post Content", type: "action", duration: "10 min", description: "Stay visible and provide value" },
          { title: "Log Activity in Pipeline", type: "action", duration: "10 min", link: "/prospect-pipeline", description: "Track all your conversations" }
        ]
      });
    }
  }
  filledDays.sort((a, b) => a.day - b.day);

  const getCompletedForDay = (day: number) => {
    const dayData = filledDays.find(d => d.day === day);
    const dayTasks = dayData?.tasks || [];
    const completed = dayTasks.filter((_, i) => completedTasks[`${day}-${i + 1}`]).length;
    return { completed, total: dayTasks.length };
  };

  const totalCompleted = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = filledDays.reduce((acc, d) => acc + d.tasks.length, 0);
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'training': return BookOpen;
      case 'action': return Zap;
      case 'exercise': return FileText;
      case 'call': return Phone;
      case 'celebration': return PartyPopper;
      case 'experience': return Heart;
      default: return CheckCircle;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#e91e63';
      case 'training': return '#2196f3';
      case 'action': return '#4caf50';
      case 'exercise': return '#ff9800';
      case 'call': return '#9c27b0';
      case 'celebration': return '#ffc107';
      case 'experience': return '#00bcd4';
      default: return '#888';
    }
  };

  const isDayUnlocked = (day: number) => {
    if (day === 1) return true;
    const prevDayProgress = getCompletedForDay(day - 1);
    return prevDayProgress.completed === prevDayProgress.total || day <= currentDay;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)', fontFamily: "'Avenir Next', 'Segoe UI', sans-serif" }}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffc107, #ff9800)',
            borderRadius: 24,
            padding: '48px 64px',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{celebrationMessage}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #00A651 0%, #006633 100%)', padding: '24px 32px', color: 'white', boxShadow: '0 4px 20px rgba(0, 166, 81, 0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <span>New Coach</span>
                <ChevronRight size={14} />
                <span style={{ fontWeight: 600 }}>30-Day Launchpad</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Rocket size={32} />
                Welcome, {coachName}!
              </h1>
              <p style={{ fontSize: 16, opacity: 0.9, margin: 0 }}>
                You're on Day {currentDay} of your 30-Day Launchpad. Let's build your business!
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 20, marginBottom: 8 }}>
                <Flame size={18} color="#ffc107" />
                <span style={{ fontWeight: 600 }}>Day {currentDay} of 30</span>
              </div>
              <Link href="/daily-actions" style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>
                View Daily Actions →
              </Link>
            </div>
          </div>

          {/* Overall Progress */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, opacity: 0.9 }}>Overall Launchpad Progress</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{overallProgress}% Complete</span>
            </div>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${overallProgress}%`,
                background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.8))',
                borderRadius: 5,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#4caf50' }}>{totalCompleted}</div>
                <div style={{ fontSize: 12, color: '#888' }}>Tasks Completed</div>
              </div>
              <CheckCircle size={24} color="#4caf50" style={{ opacity: 0.3 }} />
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#2196f3' }}>
                  {filledDays.filter(d => {
                    const progress = getCompletedForDay(d.day);
                    return progress.completed === progress.total;
                  }).length}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>Days Completed</div>
              </div>
              <Calendar size={24} color="#2196f3" style={{ opacity: 0.3 }} />
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#ff9800' }}>{30 - currentDay}</div>
                <div style={{ fontSize: 12, color: '#888' }}>Days Remaining</div>
              </div>
              <Clock size={24} color="#ff9800" style={{ opacity: 0.3 }} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fff8e1, #ffecb3)', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid #ffc107' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f57c00' }}>Day {currentDay}</div>
                <div style={{ fontSize: 12, color: '#e65100' }}>Today's Focus</div>
              </div>
              <Star size={24} color="#f57c00" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <Link href="/prospect-pipeline" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: '2px solid transparent', transition: 'border 0.2s' }}>
              <div style={{ padding: 10, background: '#e3f2fd', borderRadius: 10 }}>
                <Users size={20} color="#1565c0" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>100's List Pipeline</div>
                <div style={{ fontSize: 12, color: '#888' }}>Manage your 100s list</div>
              </div>
            </div>
          </Link>
          <Link href="/client-tracker" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ padding: 10, background: '#fce4ec', borderRadius: 10 }}>
                <Heart size={20} color="#c2185b" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>Client List</div>
                <div style={{ fontSize: 12, color: '#888' }}>Track client progress</div>
              </div>
            </div>
          </Link>
          <Link href="/daily-actions" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ padding: 10, background: '#fff3e0', borderRadius: 10 }}>
                <Zap size={20} color="#e65100" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>Daily Actions</div>
                <div style={{ fontSize: 12, color: '#888' }}>Today's priorities</div>
              </div>
            </div>
          </Link>
          <Link href="/training" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ padding: 10, background: '#e8f5e9', borderRadius: 10 }}>
                <BookOpen size={20} color="#2e7d32" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a1a' }}>Training Center</div>
                <div style={{ fontSize: 12, color: '#888' }}>All training modules</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Days List */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: 700, color: '#1a1a1a' }}>
                30-Day Journey
              </div>
              <div style={{ maxHeight: 600, overflow: 'auto' }}>
                {filledDays.slice(0, 14).map((day) => {
                  const Icon = day.icon;
                  const progress = getCompletedForDay(day.day);
                  const isComplete = progress.completed === progress.total;
                  const isActive = expandedDay === day.day;
                  const isUnlocked = isDayUnlocked(day.day);
                  const isToday = day.day === currentDay;

                  return (
                    <button
                      key={day.day}
                      onClick={() => isUnlocked && setExpandedDay(day.day)}
                      disabled={!isUnlocked}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        border: 'none',
                        borderBottom: '1px solid #f5f5f5',
                        background: isActive ? '#f0faf4' : (isToday ? '#fff8e1' : 'white'),
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.5,
                        borderLeft: isActive ? '3px solid #00A651' : '3px solid transparent',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isComplete ? '#4caf50' : (isUnlocked ? day.color : '#e0e0e0'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {!isUnlocked ? (
                          <Lock size={16} color="white" />
                        ) : isComplete ? (
                          <CheckCircle size={18} color="white" />
                        ) : (
                          <Icon size={18} color="white" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#00A651' : '#1a1a1a' }}>
                          Day {day.day}
                          {isToday && <span style={{ marginLeft: 6, color: '#ff9800', fontSize: 10 }}>TODAY</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>{day.title}</div>
                      </div>
                      <div style={{ fontSize: 11, color: isComplete ? '#4caf50' : '#888' }}>
                        {progress.completed}/{progress.total}
                      </div>
                    </button>
                  );
                })}
                <div style={{ padding: '12px 16px', background: '#f5f5f5', fontSize: 12, color: '#888', textAlign: 'center' }}>
                  + {filledDays.length - 14} more days...
                </div>
              </div>
            </div>
          </div>

          {/* Day Detail */}
          <div style={{ flex: 1 }}>
            {filledDays.filter(d => d.day === expandedDay).map((day) => {
              const Icon = day.icon;
              const progress = getCompletedForDay(day.day);

              return (
                <div key={day.day} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  {/* Day Header */}
                  <div style={{
                    padding: 24,
                    background: `linear-gradient(135deg, ${day.color}, ${day.color}dd)`,
                    color: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>{day.theme}</div>
                        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Icon size={28} />
                          Day {day.day}: {day.title}
                        </h2>
                        {day.milestone && (
                          <div style={{ marginTop: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'inline-block', fontSize: 13, fontWeight: 600 }}>
                            🎯 Milestone: {day.milestone}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 36, fontWeight: 700 }}>{progress.completed}/{progress.total}</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>Tasks Complete</div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div style={{ padding: 24 }}>
                    {day.tasks.map((task, index) => {
                      const taskId = `${day.day}-${index + 1}`;
                      const isCompleted = completedTasks[taskId];
                      const TaskIcon = getTaskTypeIcon(task.type);
                      const typeColor = getTaskTypeColor(task.type);

                      return (
                        <div
                          key={taskId}
                          style={{
                            padding: 20,
                            marginBottom: index < day.tasks.length - 1 ? 12 : 0,
                            background: isCompleted ? '#f5f5f5' : '#fafafa',
                            borderRadius: 12,
                            border: `2px solid ${isCompleted ? '#e0e0e0' : typeColor}20`,
                            opacity: isCompleted ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', gap: 16 }}>
                            <button
                              onClick={() => toggleTask(taskId)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}
                            >
                              {isCompleted ? (
                                <CheckCircle size={24} color="#4caf50" fill="#4caf50" />
                              ) : (
                                <Circle size={24} color={typeColor} />
                              )}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{
                                  padding: '3px 8px',
                                  background: `${typeColor}15`,
                                  color: typeColor,
                                  borderRadius: 6,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  <TaskIcon size={10} />
                                  {task.type}
                                </span>
                                <span style={{ fontSize: 12, color: '#888' }}>
                                  <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {task.duration}
                                </span>
                              </div>
                              <h4 style={{
                                margin: '0 0 6px 0',
                                fontSize: 16,
                                fontWeight: 600,
                                color: '#1a1a1a',
                                textDecoration: isCompleted ? 'line-through' : 'none'
                              }}>
                                {task.title}
                              </h4>
                              <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                                {task.description}
                              </p>
                              {task.link && !isCompleted && (
                                <Link
                                  href={task.link}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginTop: 12,
                                    padding: '8px 16px',
                                    background: typeColor,
                                    color: 'white',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                  }}
                                >
                                  <ExternalLink size={14} />
                                  Open Resource
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Day Navigation */}
                  <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', background: '#fafafa' }}>
                    <button
                      onClick={() => day.day > 1 && setExpandedDay(day.day - 1)}
                      disabled={day.day === 1}
                      style={{
                        padding: '10px 20px',
                        background: day.day === 1 ? '#f5f5f5' : 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        cursor: day.day === 1 ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        color: day.day === 1 ? '#ccc' : '#666'
                      }}
                    >
                      ← Previous Day
                    </button>
                    <button
                      onClick={() => day.day < 30 && isDayUnlocked(day.day + 1) && setExpandedDay(day.day + 1)}
                      disabled={day.day === 30 || !isDayUnlocked(day.day + 1)}
                      style={{
                        padding: '10px 20px',
                        background: (day.day === 30 || !isDayUnlocked(day.day + 1)) ? '#f5f5f5' : 'linear-gradient(135deg, #00A651, #00c853)',
                        border: 'none',
                        borderRadius: 8,
                        cursor: (day.day === 30 || !isDayUnlocked(day.day + 1)) ? 'not-allowed' : 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        color: (day.day === 30 || !isDayUnlocked(day.day + 1)) ? '#ccc' : 'white'
                      }}
                    >
                      Next Day →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}