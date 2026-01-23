"use client"

import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Simple public header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <Image
            src="/branding/ca_logo.png"
            alt="Coaching Amplifier"
            width={150}
            height={50}
            className="h-8 w-auto"
          />
        </div>
      </header>
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Cookie Usage Policy</CardTitle>
            <p className="text-sm text-optavia-gray">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">1. What Are Cookies?</h2>
              <p className="text-optavia-gray mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to the owners of the
                site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">2. How We Use Cookies</h2>
              <p className="text-optavia-gray mb-4">Coaching Amplifier uses cookies for the following purposes:</p>
              <ul className="list-disc pl-6 text-optavia-gray mb-4 space-y-2">
                <li>
                  <strong>Authentication:</strong> To keep you logged in and maintain your session
                </li>
                <li>
                  <strong>Preferences:</strong> To remember your settings and preferences
                </li>
                <li>
                  <strong>Analytics:</strong> To understand how you use our Service and improve it
                </li>
                <li>
                  <strong>Security:</strong> To protect against fraud and ensure security
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">3. Types of Cookies We Use</h2>
              <div className="mb-4">
                <h3 className="text-xl font-heading font-semibold mb-2">Essential Cookies</h3>
                <p className="text-optavia-gray mb-4">
                  These cookies are necessary for the Service to function properly. They enable core functionality such as
                  security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-heading font-semibold mb-2">Functional Cookies</h3>
                <p className="text-optavia-gray mb-4">
                  These cookies allow the Service to remember choices you make (such as your username, language, or
                  region) and provide enhanced, personalized features.
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-heading font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-optavia-gray mb-4">
                  These cookies help us understand how visitors interact with our Service by collecting and reporting
                  information anonymously.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">4. Third-Party Cookies</h2>
              <p className="text-optavia-gray mb-4">
                Our Service uses Supabase for authentication and data storage, which may set cookies on your device.
                These third-party cookies are subject to the respective privacy policies of these services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">5. Managing Cookies</h2>
              <p className="text-optavia-gray mb-4">
                Most web browsers allow you to control cookies through their settings preferences. However, limiting the
                ability of websites to set cookies may worsen your overall user experience. You can:
              </p>
              <ul className="list-disc pl-6 text-optavia-gray mb-4 space-y-2">
                <li>Delete cookies from your browser settings</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="text-optavia-gray mb-4">
                Please note that if you choose to disable cookies, some features of the Service may not function
                properly, including the ability to stay logged in.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">6. Local Storage</h2>
              <p className="text-optavia-gray mb-4">
                In addition to cookies, we may use local storage and session storage to store information on your
                device. This helps us provide a better user experience and remember your preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">7. Updates to This Policy</h2>
              <p className="text-optavia-gray mb-4">
                We may update this Cookie Usage Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. Please review this page periodically for any updates.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">8. Contact Us</h2>
              <p className="text-optavia-gray mb-4">
                If you have any questions about our use of cookies, please contact us through the Service or via the
                contact information provided in our Privacy Policy.
              </p>
            </section>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

