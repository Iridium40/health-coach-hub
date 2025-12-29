import { Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--optavia-footer))] text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="text-2xl font-heading">
            <span className="font-extrabold">Coaching</span>
            <span className="font-semibold"> Amplifier</span>
          </div>

          <p className="text-center text-sm text-gray-300 max-w-md">
            Amplify your coaching business with powerful resources and tools
          </p>

          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.youtube.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Coaching Amplifier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
