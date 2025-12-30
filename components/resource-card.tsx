"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ResourceCardProps {
  title: string
  description: string
  url: string
  buttonText: string
  features?: string[]
}

export function ResourceCard({ title, description, url, buttonText, features }: ResourceCardProps) {
  return (
    <Card className="h-full flex flex-col bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="text-optavia-dark text-xl sm:text-2xl">{title}</CardTitle>
        <CardDescription className="text-optavia-gray text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {features && features.length > 0 && (
          <div className="prose max-w-none mb-6 flex-1">
            <ul className="space-y-3 text-optavia-gray">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          size="lg"
          className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] w-full sm:w-auto"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {buttonText}
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

