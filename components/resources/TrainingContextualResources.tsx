'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TrainingContextualResourcesProps {
  trainingCategory: string; // e.g., 'Getting Started', 'Client Support', 'Social Media'
  trainingTags?: string[]; // e.g., ['social-media', 'prospecting']
}

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  button_text: string;
  category: string;
  icon: string | null;
  features: {
    type?: string;
    tags?: string[];
  };
}

// Simple in-memory cache for resources by category
const resourceCache = new Map<string, { resources: Resource[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mapping of training categories (from database) to resource categories and tags
const TRAINING_TO_RESOURCE_MAPPING: Record<string, { categories: string[], tags: string[] }> = {
  // Coach Launch Playbook - New coach setup resources
  'COACH LAUNCH PLAYBOOK': {
    categories: ['Getting Started', 'Journey Kickoff', 'Business Development'],
    tags: ['onboarding', 'essential', 'kickoff', 'new-coach', 'launch']
  },
  // Launching a Client - Client onboarding resources
  'LAUNCHING A CLIENT AND COACHING THROUGH MONTH ONE': {
    categories: ['Client Text Templates', 'Client Support', 'Journey Kickoff', 'Nutrition Guides'],
    tags: ['client-support', 'text-message', 'onboarding', 'first-month', 'kickoff']
  },
  // Client Support - Text templates and videos
  'CLIENT SUPPORT TEXTS AND VIDEOS': {
    categories: ['Client Text Templates', 'Client Support Videos', 'Client Support', 'Nutrition Guides'],
    tags: ['client-support', 'text-message', 'education', 'nutrition', 'videos']
  },
  // Branding - Business setup resources
  'BRANDING YOUR BUSINESS QUICK LINKS': {
    categories: ['Getting Started', 'Business Development', 'Tax & Finance'],
    tags: ['branding', 'business', 'setup', 'website', 'professional']
  },
  // Social Media - Social media strategy resources
  'USING SOCIAL MEDIA TO BUILD YOUR BUSINESS': {
    categories: ['Social Media Strategy'],
    tags: ['social-media', 'hashtags', 'content-creation', 'engagement', 'reels']
  },
  // Coaching 10X - Business growth resources
  'COACHING 10X': {
    categories: ['Business Development', 'Coaching Real Talk'],
    tags: ['business', 'growth', '10x', 'mindset', 'accountability']
  },
  // Metabolic Reset - Client troubleshooting resources
  'COACHING A METABOLIC RESET': {
    categories: ['Troubleshooting', 'Client Support Videos', 'Nutrition Guides'],
    tags: ['troubleshooting', 'metabolic', 'nutrition', 'client-support']
  },
  // Moving to ED - Advanced business resources
  'MOVING TO ED AND BEYOND': {
    categories: ['Business Development', 'Coaching Real Talk', 'Tax & Finance'],
    tags: ['business', 'leadership', 'advanced', 'growth', 'finances']
  },
  // Connect - Business tools resources
  'HOW TO USE CONNECT TO GROW YOUR BUSINESS': {
    categories: ['Business Development', 'Getting Started'],
    tags: ['business', 'tools', 'connect', 'reports', 'volume']
  },
  // Gold Standard - Core training resources
  'GOLD STANDARD TRAININGS': {
    categories: ['Getting Started', 'Business Development', 'Coaching Real Talk'],
    tags: ['essential', 'training', 'core', 'foundation']
  }
};

export function TrainingContextualResources({ 
  trainingCategory,
  trainingTags = []
}: TrainingContextualResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const supabaseRef = useRef(createClient());
  const isMountedRef = useRef(true);

  // Create a stable cache key
  const cacheKey = useMemo(() => {
    return `${trainingCategory}:${trainingTags.sort().join(',')}`;
  }, [trainingCategory, trainingTags]);

  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchRelevantResources = async () => {
      const mapping = TRAINING_TO_RESOURCE_MAPPING[trainingCategory];
      
      if (!mapping) {
        setResources([]);
        setHasLoaded(true);
        return;
      }

      // Check cache first
      const cached = resourceCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setResources(cached.resources);
        setHasLoaded(true);
        return;
      }

      // Only show loading if we don't have cached data
      setIsLoading(true);
      
      try {
        // Get resources from relevant categories
        const { data, error } = await supabaseRef.current
          .from('external_resources')
          .select('*')
          .in('category', mapping.categories)
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;

        // Filter by tags if available
        const filtered = (data || []).filter((resource) => {
          // If no features, still include if it matches the category
          if (!resource.features) return true;
          
          const features = resource.features as Resource['features'];
          // Ensure tags is always an array
          const resourceTags = Array.isArray(features.tags) ? features.tags : [];
          
          // If resource has no tags, include it (it's in the category)
          if (resourceTags.length === 0) return true;
          
          // Check if any of the mapping tags match resource tags
          const hasMatchingTag = mapping.tags.some(tag => 
            resourceTags.includes(tag)
          );
          
          // Also check against provided training tags
          const hasTrainingTag = trainingTags.length > 0 
            ? trainingTags.some(tag => resourceTags.includes(tag))
            : true;
          
          return hasMatchingTag || hasTrainingTag;
        });

        // Limit to top 6 most relevant
        const result = filtered.slice(0, 6);
        
        // Update cache
        resourceCache.set(cacheKey, { resources: result, timestamp: Date.now() });
        
        if (isMountedRef.current) {
          setResources(result);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    fetchRelevantResources();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [trainingCategory, trainingTags, cacheKey]);

  // Don't render anything until we've loaded at least once
  // This prevents the flicker when expanding modules
  if (!hasLoaded) {
    return null;
  }

  // Show loading only if we're fetching and have no cached resources to display
  if (isLoading && resources.length === 0) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#7AC143] rounded-lg">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Related Resources
          </h3>
          <p className="text-sm text-gray-600">
            Additional tools and guides to complement this training
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            title={resource.title}
            description={resource.description}
            url={resource.url}
            buttonText={resource.button_text}
            icon={resource.icon || undefined}
            features={resource.features}
            compact={true}
          />
        ))}
      </div>

      {resources.length >= 6 && (
        <Alert className="bg-white">
          <AlertTitle className="text-sm font-medium">Want to see more?</AlertTitle>
          <AlertDescription className="text-sm">
            Visit the{' '}
            <a href="/resources" className="text-[#7AC143] hover:underline font-medium">
              Resources page
            </a>
            {' '}to explore all available tools and guides.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
