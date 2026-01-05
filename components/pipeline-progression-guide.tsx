"use client"

import React, { useState } from 'react'

export function PipelineProgressionGuide() {
  const [activeStage, setActiveStage] = useState<string | null>(null)

  const stages = [
    {
      id: 'new',
      label: 'New',
      emoji: '✨',
      color: 'gray',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-600',
      activeColor: 'bg-gray-500',
      action: "Add to your 100's list",
      description: 'Someone you know who could benefit from OPTAVIA. Start with a nickname for privacy.',
      tips: [
        'Think about who in your life struggles with health',
        'Add notes about how you know them',
        'No contact info needed here — keep it in OPTAVIA Connect',
      ],
    },
    {
      id: 'reach_out',
      label: 'Reach Out',
      emoji: '👋',
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-600',
      activeColor: 'bg-blue-500',
      action: 'Make first contact',
      description: "You've initiated conversation. Share your story, plant seeds, build curiosity.",
      tips: [
        'Lead with your personal transformation',
        'Ask about their health goals',
        "Don't pitch — just share and invite curiosity",
      ],
    },
    {
      id: 'interested',
      label: 'Interested',
      emoji: '🔥',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-600',
      activeColor: 'bg-orange-500',
      action: 'Send Health Assessment',
      description: 'They want to learn more! Send them the Health Assessment to understand their goals.',
      tips: [
        'Strike while the iron is hot!',
        'Send the HA link right away',
        "Let them know you'll review it together",
      ],
    },
    {
      id: 'ha_scheduled',
      label: 'HA Scheduled',
      emoji: '📅',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-600',
      activeColor: 'bg-purple-500',
      action: 'Conduct the Health Assessment call',
      description: 'Meeting is booked! Prepare to walk through their HA and present the program.',
      tips: [
        'Review their HA responses before the call',
        'Focus on THEIR goals and struggles',
        'Consider a 3-way call with your coach',
      ],
    },
    {
      id: 'client',
      label: 'Client!',
      emoji: '🎉',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
      activeColor: 'bg-green-500',
      action: 'Welcome to OPTAVIA!',
      description: "They've said YES! Onboard them, set their start date, and begin the journey together.",
      tips: [
        'Celebrate this win! 🎊',
        'Set their program start date',
        'Schedule your first check-in',
        'Add them to My Clients',
      ],
    },
  ]

  const offRamp = {
    id: 'not_interested',
    label: 'Not Interested',
    emoji: '⏸️',
    description: "Not right now — and that's okay! Keep them on your list and nurture the relationship.",
    tips: [
      "Don't take it personally",
      'Timing is everything',
      'Stay connected — circumstances change',
      'They may come back when ready',
    ],
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            The Prospect Journey
          </h2>
          <p className="text-gray-600 text-sm">
            From your 100's list to a new client — here's the path
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-6 top-14 w-0.5 h-24 bg-gradient-to-b from-gray-300 to-gray-200 z-0" />
              )}

              {/* Stage Card */}
              <div
                className={`relative z-10 flex gap-4 mb-6 cursor-pointer transition-all duration-200 ${
                  activeStage === stage.id ? 'scale-[1.02]' : ''
                }`}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
              >
                {/* Circle Indicator */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 border-2 transition-all duration-200 ${
                    activeStage === stage.id
                      ? `${stage.activeColor} text-white border-transparent shadow-lg`
                      : `${stage.bgColor} ${stage.borderColor}`
                  }`}
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
                    <h3 className={`font-bold ${activeStage === stage.id ? stage.textColor : 'text-gray-800'}`}>
                      {stage.label}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        activeStage === stage.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <p className={`text-sm font-medium ${activeStage === stage.id ? stage.textColor : 'text-green-600'}`}>
                    → {stage.action}
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

              {/* Off-ramp after "Interested" */}
              {stage.id === 'interested' && (
                <div className="relative z-10 ml-16 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-0.5 bg-gray-300" />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div
                    className={`rounded-xl p-3 border-2 border-dashed cursor-pointer transition-all duration-200 ${
                      activeStage === 'not_interested'
                        ? 'bg-gray-100 border-gray-400'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveStage(activeStage === 'not_interested' ? null : 'not_interested')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{offRamp.emoji}</span>
                      <span className="text-gray-600 font-medium text-sm">{offRamp.label}</span>
                      <span className="text-gray-400 text-xs ml-auto">(for now)</span>
                    </div>

                    {activeStage === 'not_interested' && (
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

        {/* Bottom Stats Preview */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-center text-sm">Typical Conversion Funnel</h4>
          <div className="flex items-center justify-between text-center">
            <div className="flex-1">
              <div className="text-xl font-bold text-gray-400">100</div>
              <div className="text-[10px] text-gray-500">List</div>
            </div>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex-1">
              <div className="text-xl font-bold text-blue-400">60</div>
              <div className="text-[10px] text-gray-500">Reach Out</div>
            </div>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex-1">
              <div className="text-xl font-bold text-orange-400">20</div>
              <div className="text-[10px] text-gray-500">Interested</div>
            </div>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex-1">
              <div className="text-xl font-bold text-purple-400">10</div>
              <div className="text-[10px] text-gray-500">HA Sched</div>
            </div>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex-1">
              <div className="text-xl font-bold text-green-500">5-10</div>
              <div className="text-[10px] text-gray-500">Clients!</div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-3">
            Results vary — consistency and follow-up are key! 🔑
          </p>
        </div>

        {/* Tap hint */}
        <p className="text-center text-gray-400 text-xs mt-4">
          👆 Tap any stage to see tips
        </p>
      </div>
    </div>
  )
}
