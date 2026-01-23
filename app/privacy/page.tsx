"use client"

import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
            <CardTitle className="text-3xl font-heading">Privacy Policy</CardTitle>
            <p className="text-sm text-optavia-gray">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">1. Information We Collect</h2>
              <p className="text-optavia-gray mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-optavia-gray mb-4 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Profile information, including avatar images you upload</li>
                <li>Your progress data, including completed resources and bookmarks</li>
                <li>Your preferences and notification settings</li>
                <li>Any other information you choose to provide</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">2. How We Use Your Information</h2>
              <p className="text-optavia-gray mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-optavia-gray mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and deliver content relevant to you</li>
                <li>Track your progress and learning journey</li>
                <li>Send you notifications and updates (with your consent)</li>
                <li>Respond to your requests and provide customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">3. Data Storage and Security</h2>
              <p className="text-optavia-gray mb-4">
                Your data is stored securely using Supabase, a trusted cloud database service. We implement appropriate
                technical and organizational measures to protect your personal information against unauthorized access,
                alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">4. Data Retention</h2>
              <p className="text-optavia-gray mb-4">
                We retain your personal information for as long as your account is active or as needed to provide you
                services. If you request account deletion, we will remove your information from our systems, which will
                result in permanent loss of access to the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">5. Your Rights</h2>
              <p className="text-optavia-gray mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-optavia-gray mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Update or correct your information through your account settings</li>
                <li>Request deletion of your account and all associated data</li>
                <li>Opt-out of certain communications</li>
                <li>Request a copy of your data</li>
              </ul>
              <p className="text-optavia-gray mb-4">
                <strong>Important:</strong> If you request deletion of your account and data, we will remove all your
                information from our systems. This action is irreversible and will result in the permanent loss of
                access to the Service, including all your progress, bookmarks, and saved content. You will no longer be
                able to use the app after data deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">6. Cookies and Tracking</h2>
              <p className="text-optavia-gray mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain
                information. For more details, please see our Cookie Usage Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">7. Third-Party Services</h2>
              <p className="text-optavia-gray mb-4">
                Our Service uses Supabase for data storage and authentication. These third-party services have their own
                privacy policies governing the use of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">8. Children's Privacy</h2>
              <p className="text-optavia-gray mb-4">
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal
                information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">9. Changes to This Policy</h2>
              <p className="text-optavia-gray mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-bold mb-4">10. Contact Us</h2>
              <p className="text-optavia-gray mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us
                through the Service or via the contact information provided in your account settings.
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

