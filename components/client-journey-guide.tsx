"use client"

import { useState } from "react"

interface ClientJourneyGuideProps {
  className?: string
}

export function ClientJourneyGuide({ className }: ClientJourneyGuideProps) {
  const [activeStage, setActiveStage] = useState<string | null>(null)

  const stages = [
    {
      id: 'critical',
      days: '1-3',
      label: 'Critical Phase',
      emoji: '🔴',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-600',
      activeColor: 'bg-red-500',
      actionType: 'text',
      action: 'Daily encouragement texts',
      description: 'The hardest days! Your client needs extra support as their body adjusts. Check in daily.',
      tips: [
        'Text every single day during this phase',
        'Remind them this is temporary — it gets easier',
        'Ask about energy, hunger, and how they\'re feeling',
        'Celebrate every small win',
      ],
    },
    {
      id: 'week1',
      days: '4-6',
      label: 'Week 1',
      emoji: '🟠',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-600',
      activeColor: 'bg-orange-500',
      actionType: 'text',
      action: 'Check-in texts',
      description: 'They\'re building momentum! Keep the encouragement going as they establish their routine.',
      tips: [
        'Ask about their favorite Fuelings',
        'Check if they have Lean & Green questions',
        'Remind them Day 7 milestone is coming!',
      ],
    },
    {
      id: 'week1_complete',
      days: '7',
      label: 'Week 1 Complete!',
      emoji: '🎉',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
      activeColor: 'bg-green-500',
      actionType: 'call',
      isMilestone: true,
      action: 'Schedule celebration call',
      description: 'FIRST MILESTONE! They made it through the hardest week. This deserves recognition!',
      tips: [
        'Schedule a call to celebrate this win',
        'Ask what was harder/easier than expected',
        'Discuss any NSVs (non-scale victories)',
        'Set them up for a strong Week 2',
      ],
    },
    {
      id: 'week2',
      days: '8-13',
      label: 'Week 2',
      emoji: '🔵',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-600',
      activeColor: 'bg-blue-500',
      actionType: 'text',
      action: 'Routine-building texts',
      description: 'They\'re in a groove now. Focus on reinforcing their new habits and routines.',
      tips: [
        'Ask about changes they\'re noticing',
        'Encourage them to try new recipes',
        'Build excitement for the 2-week mark',
      ],
    },
    {
      id: 'two_weeks',
      days: '14',
      label: '2 Weeks!',
      emoji: '⭐',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
      activeColor: 'bg-green-500',
      actionType: 'call',
      isMilestone: true,
      action: 'Schedule celebration call',
      description: 'TWO WEEKS of consistency! They\'re proving to themselves they can do this.',
      tips: [
        'Celebrate their commitment',
        'Review their progress and wins',
        'Discuss any adjustments needed',
        'Preview the big Day 21 milestone!',
      ],
    },
    {
      id: 'week3',
      days: '15-20',
      label: 'Week 3',
      emoji: '🟣',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-600',
      activeColor: 'bg-purple-500',
      actionType: 'text',
      action: '"Almost there" texts',
      description: 'The home stretch to habit formation! Build anticipation for the 21-day milestone.',
      tips: [
        'Remind them: "21 days = habit formed!"',
        'Ask about NSVs and mindset shifts',
        'Get them excited for Day 21',
      ],
    },
    {
      id: 'twenty_one',
      days: '21',
      label: '21 Days — Habit Formed!',
      emoji: '💎',
      color: 'green',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-400',
      textColor: 'text-emerald-700',
      activeColor: 'bg-emerald-500',
      actionType: 'call',
      isMilestone: true,
      action: 'Schedule celebration call',
      description: 'MAJOR MILESTONE! Science says 21 days forms a habit. Their brain is literally rewired!',
      tips: [
        'BIG celebration energy for this call!',
        'Explain the science of habit formation',
        'Compare how they feel now vs Day 1',
        'Document all their wins and NSVs',
        'Consider a 3-way call with your upline',
      ],
    },
    {
      id: 'week4',
      days: '22-29',
      label: 'Week 4',
      emoji: '🩵',
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-300',
      textColor: 'text-cyan-600',
      activeColor: 'bg-cyan-500',
      actionType: 'text',
      action: 'Momentum texts',
      description: 'The habit is formed — now they\'re strengthening it. One month is right around the corner!',
      tips: [
        'Build excitement for ONE MONTH',
        'Ask them to reflect on their journey',
        '"What would Day 1 you think about this?"',
      ],
    },
    {
      id: 'one_month',
      days: '30',
      label: 'ONE MONTH!',
      emoji: '👑',
      color: 'gold',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-700',
      activeColor: 'bg-amber-500',
      actionType: 'call',
      isMilestone: true,
      action: 'Schedule celebration call',
      description: 'THE BIG ONE! 30 days of commitment. This is a lifestyle now, not a diet.',
      tips: [
        'Make this celebration SPECIAL',
        'Full transformation review',
        'Compare Day 1 to Day 30 in every way',
        'Discuss their "why" and future goals',
        'Consider: Are they interested in coaching?',
        '3-way call with upline for recognition',
      ],
    },
    {
      id: 'ongoing',
      days: '31+',
      label: 'Ongoing Journey',
      emoji: '🟢',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-600',
      activeColor: 'bg-green-500',
      actionType: 'text',
      action: 'Regular check-ins',
      description: 'They\'ve built the foundation. Continue supporting their journey with consistent touchpoints.',
      tips: [
        'Check in at least every 10 days',
        'Celebrate 60, 90, 120 day milestones',
        'Watch for coaching interest',
        'Support their transition phases',
      ],
    },
  ]

  const offRamp = {
    id: 'paused',
    label: 'Paused',
    emoji: '⏸️',
    description: 'Life happens. When a client needs to pause, keep the relationship warm for when they\'re ready to return.',
    tips: [
      'No judgment — circumstances change',
      'Check in occasionally to show you care',
      'Leave the door open for their return',
      'They may come back stronger than ever',
    ],
  }

  const coachProspect = {
    id: 'coach_prospect',
    label: 'Coach Prospect',
    emoji: '⭐',
    description: 'This client shows interest in becoming a coach! Nurture their curiosity about the business opportunity.',
    tips: [
      'Share your coaching journey',
      'Invite them to team calls',
      'Connect them with your upline',
      'Help them see the possibilities',
    ],
  }

  return (
    <div className={`max-h-[70vh] overflow-y-auto ${className || ''}`}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            From Day 1 to lasting transformation — here's the path
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">📱 Text Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">📅 Celebration Call</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">MILESTONE</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className={`absolute left-6 top-14 w-0.5 h-20 z-0 ${
                  stage.isMilestone ? 'bg-gradient-to-b from-green-300 to-gray-300' : 'bg-gray-300'
                }`} />
              )}

              {/* Stage Card */}
              <div
                className={`relative z-10 flex gap-4 mb-4 cursor-pointer transition-all duration-200 ${
                  activeStage === stage.id ? 'scale-[1.02]' : ''
                }`}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
              >
                {/* Circle Indicator */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 border-2 transition-all duration-200 ${
                    activeStage === stage.id
                      ? `${stage.activeColor} text-white border-transparent shadow-lg`
                      : `${stage.bgColor} ${stage.borderColor}`
                  } ${stage.isMilestone ? 'ring-2 ring-offset-2 ring-green-300' : ''}`}
                >
                  {stage.emoji}
                </div>

                {/* Content */}
                <div
                  className={`flex-1 rounded-xl p-4 border-2 transition-all duration-200 ${
                    activeStage === stage.id
                      ? `${stage.bgColor} ${stage.borderColor} shadow-md`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        Day {stage.days}
                      </span>
                      <h3 className={`font-bold ${activeStage === stage.id ? stage.textColor : 'text-gray-800'}`}>
                        {stage.label}
                      </h3>
                      {stage.isMilestone && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          MILESTONE
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${
                        activeStage === stage.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <p className={`text-sm font-medium flex items-center gap-1 ${
                    stage.actionType === 'call' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {stage.actionType === 'call' ? '📅' : '📱'} {stage.action}
                  </p>

                  {/* Expanded Content */}
                  {activeStage === stage.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-gray-600 text-sm mb-3">{stage.description}</p>
                      <div className="space-y-1.5">
                        {stage.tips.map((tip, tipIdx) => (
                          <div key={tipIdx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span className="text-gray-700">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Off-ramps after One Month */}
              {stage.id === 'one_month' && (
                <div className="relative z-10 ml-16 mb-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-0.5 bg-gray-300" />
                    <span className="text-xs text-gray-400">Special Statuses</span>
                  </div>
                  
                  {/* Coach Prospect */}
                  <div
                    className={`rounded-xl p-3 border-2 cursor-pointer transition-all duration-200 ${
                      activeStage === 'coach_prospect'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white border-amber-200 hover:bg-amber-50'
                    }`}
                    onClick={() => setActiveStage(activeStage === 'coach_prospect' ? null : 'coach_prospect')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{coachProspect.emoji}</span>
                      <span className="text-amber-700 font-medium text-sm">{coachProspect.label}</span>
                    </div>

                    {activeStage === 'coach_prospect' && (
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-gray-600 text-sm mb-3">{coachProspect.description}</p>
                        <div className="space-y-1.5">
                          {coachProspect.tips.map((tip, tipIdx) => (
                            <div key={tipIdx} className="flex items-start gap-2 text-sm">
                              <span className="text-amber-500 mt-0.5">★</span>
                              <span className="text-gray-600">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Paused */}
                  <div
                    className={`rounded-xl p-3 border-2 border-dashed cursor-pointer transition-all duration-200 ${
                      activeStage === 'paused'
                        ? 'bg-gray-100 border-gray-400'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveStage(activeStage === 'paused' ? null : 'paused')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{offRamp.emoji}</span>
                      <span className="text-gray-600 font-medium text-sm">{offRamp.label}</span>
                      <span className="text-gray-400 text-xs ml-auto">(can return anytime)</span>
                    </div>

                    {activeStage === 'paused' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-gray-600 text-sm mb-3">{offRamp.description}</p>
                        <div className="space-y-1.5">
                          {offRamp.tips.map((tip, tipIdx) => (
                            <div key={tipIdx} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span className="text-gray-600">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Needs Attention Box */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <span>🚨</span> "Needs Attention" Triggers
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-red-400">1.</span>
              <span className="text-gray-700"><strong>Scheduled check-in is due</strong> — Meeting date is today or past</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">2.</span>
              <span className="text-gray-700"><strong>10+ days since last check-in</strong> — Time to reach out!</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400">3.</span>
              <span className="text-gray-700"><strong>Never checked in</strong> — New client needs first touchpoint</span>
            </div>
          </div>
        </div>

        {/* Milestone Summary */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">📅 Milestone Calls to Schedule</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl mb-1">🎉</div>
              <div className="text-lg font-bold text-green-600">Day 7</div>
              <div className="text-xs text-gray-500">Week 1</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-bold text-green-600">Day 14</div>
              <div className="text-xs text-gray-500">2 Weeks</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-lg font-bold text-emerald-600">Day 21</div>
              <div className="text-xs text-gray-500">Habit!</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-lg font-bold text-amber-600">Day 30</div>
              <div className="text-xs text-gray-500">1 Month</div>
            </div>
          </div>
        </div>

        {/* Tap hint */}
        <p className="text-center text-gray-400 text-sm mt-6">
          👆 Tap any stage to see coaching tips
        </p>
      </div>
    </div>
  )
}
