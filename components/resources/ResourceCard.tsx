"use client"

import { useState } from 'react'
import { ExternalLink, Video, FileText, MessageSquare, Link as LinkIcon, CheckCircle, Hash, Utensils, Leaf, Scale, Cookie, UtensilsCrossed, FileWarning, Phone, Stethoscope, DollarSign, Settings, Package, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResourceCardProps {
  title: string
  description: string
  url: string
  buttonText?: string
  icon?: string
  features?: {
    type?: string
    tags?: string[]
    show_in?: string[]
    relevant_days?: number[]
    relevant_stages?: string[]
  } | null
  compact?: boolean
  showTags?: boolean
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  FileText,
  MessageSquare,
  CheckCircle,
  Hash,
  Utensils,
  Leaf,
  Scale,
  Cookie,
  UtensilsCrossed,
  FileWarning,
  Phone,
  Stethoscope,
  DollarSign,
  Settings,
  Package,
  Link: LinkIcon,
  Salad: Leaf,
}

const getIconComponent = (iconName: string | undefined | null, type: string | undefined) => {
  // First check if we have a specific icon name
  if (iconName && iconMap[iconName]) {
    const IconComponent = iconMap[iconName]
    return <IconComponent className="h-4 w-4" />
  }
  
  // Fall back to type-based icons
  if (type === 'video') return <Video className="h-4 w-4" />
  if (type === 'template') return <MessageSquare className="h-4 w-4" />
  if (type === 'document') return <FileText className="h-4 w-4" />
  if (type === 'guide') return <FileText className="h-4 w-4" />
  if (type === 'canva') return <FileText className="h-4 w-4" />
  
  return <LinkIcon className="h-4 w-4" />
}

const getTypeBadgeColor = (type: string | undefined) => {
  switch (type) {
    case 'video': 
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    case 'template': 
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'document': 
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'guide': 
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
    case 'canva': 
      return 'bg-pink-100 text-pink-800 hover:bg-pink-100'
    default: 
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

const getTypeLabel = (type: string | undefined) => {
  switch (type) {
    case 'video': return 'Video'
    case 'template': return 'Template'
    case 'document': return 'Document'
    case 'guide': return 'Guide'
    case 'canva': return 'Canva'
    case 'link': return 'Link'
    default: return type || 'Resource'
  }
}

function CopyLinkButton({ url, size = "sm" }: { url: string; size?: "sm" | "default" }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback ignored
    }
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={
        copied
          ? "h-7 text-xs bg-green-50 border-green-300 text-green-700 hover:bg-green-50"
          : "h-7 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
      }
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="mr-1 h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-1 h-3 w-3" />
          Copy Link
        </>
      )}
    </Button>
  )
}

export function ResourceCard({ 
  title, 
  description, 
  url, 
  buttonText = 'View Resource',
  icon,
  features,
  compact = false,
  showTags = false,
}: ResourceCardProps) {
  const resourceType = features?.type
  // Ensure tags is always an array
  const tags = Array.isArray(features?.tags) ? features.tags : []
  
  if (compact) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0 mt-1 text-[hsl(var(--optavia-green))]">
          {getIconComponent(icon, resourceType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-sm text-gray-900 truncate">{title}</h4>
            {resourceType && (
              <Badge variant="secondary" className={`text-xs ${getTypeBadgeColor(resourceType)}`}>
                {getTypeLabel(resourceType)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{description}</p>
          {showTags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
              onClick={() => window.open(url, '_blank')}
            >
              {buttonText}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
            <CopyLinkButton url={url} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--optavia-green))]">
              {getIconComponent(icon, resourceType)}
            </span>
            <CardTitle className="text-base text-optavia-dark">{title}</CardTitle>
          </div>
          {resourceType && (
            <Badge variant="secondary" className={getTypeBadgeColor(resourceType)}>
              {getTypeLabel(resourceType)}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-optavia-gray">{description}</CardDescription>
        {showTags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
            onClick={() => window.open(url, '_blank')}
          >
            {buttonText}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <CopyLinkButton url={url} />
        </div>
      </CardContent>
    </Card>
  )
}
