import { ProgressBar } from "@/components/progress-bar"
import { Badge } from "@/components/ui/badge"
import type { UserData } from "@/lib/types"
import { modules } from "@/lib/data"

interface HeroProps {
  userData: UserData
}

export function Hero({ userData }: HeroProps) {
  const totalResources = modules.reduce((acc, module) => {
    if (userData.isNewCoach && !module.forNewCoach) return acc
    return acc + module.resources.length
  }, 0)

  const completedResources = userData.completedResources.length
  const progressPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0

  return (
    <div className="relative h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/media/two-women-walking-exercising-with-water-bottles.jpg')",
          backgroundSize: "90%",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Green Gradient Overlay (85-90% opacity) */}
      <div 
        className="absolute inset-0 bg-[hsl(var(--optavia-green))]"
        style={{ opacity: 0.87 }}
      />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white z-10">
        <div className="max-w-2xl">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-2">Welcome Back, Coach!</h1>
          <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 text-xs sm:text-sm">
            {userData.isNewCoach ? "New Coach Journey" : "Full Access"}
          </Badge>
          <p className="text-base sm:text-lg mb-4 sm:mb-6">Continue your coaching journey and explore resources to support your clients</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 max-w-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-heading font-semibold">Overall Progress</span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
            <ProgressBar progress={progressPercentage} />
            <p className="text-sm mt-2 text-white/80">
              {completedResources} of {totalResources} resources completed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
