interface HeroProps {
  userData?: any
  firstName?: string | null
  badges?: Array<{ category: string | null; badgeType: string; earnedAt: string }>
  backgroundImage?: string
}

export function Hero({ userData, firstName, badges = [], backgroundImage }: HeroProps) {
  return (
    <div 
      className="relative h-[160px] sm:h-[200px] md:h-[240px] overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#faf5eb" }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <picture>
          <source srcSet="/branding/ca_logo.svg" type="image/svg+xml" />
          <img 
            src="/branding/ca_logo.png" 
            alt="Coaching Amplifier" 
            className="h-auto max-h-[96px] sm:max-h-[120px] md:max-h-[144px] w-auto"
          />
        </picture>
      </div>
    </div>
  )
}
