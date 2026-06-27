"use client"

import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, FileText, DollarSign, Scale, Heart, Brain, Shield, AlertTriangle, ArrowLeft, Lock, Ban, Copyright } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
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
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#008542] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
                <span>Legal</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold">Terms of Service</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Terms of Service & Disclaimers
              </h1>
              <p className="text-lg opacity-90">
                Please read these terms carefully before using Coaching Amplifier.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* General Training Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Shield className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                  General Training Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  The information, strategies, scripts, and business advice provided in Coaching Amplifier 
                  are based on the experiences of successful health coaches and are intended for 
                  <strong> educational purposes only</strong>.
                </p>
                <p>
                  <strong>Results are not guaranteed.</strong> Business success depends on many factors 
                  including individual effort, market conditions, personal skills, and adherence to 
                  OPTAVIA's official policies and guidelines.
                </p>
                <p>
                  <strong>Coaching Amplifier is an independent training resource</strong> and is not 
                  officially affiliated with, endorsed by, or sponsored by OPTAVIA, Medifast, or any 
                  related entities. For official policies, procedures, and guidelines, always refer to 
                  OPTAVIA's official resources.
                </p>
                <p>
                  The scripts and templates provided are suggestions and should be adapted to your 
                  personal style and situation. Always ensure your communications comply with OPTAVIA's 
                  official compliance guidelines.
                </p>
                <p className="font-semibold text-optavia-dark">
                  By using this platform, you acknowledge that you are solely responsible for your 
                  business decisions and their outcomes.
                </p>
              </CardContent>
            </Card>

            {/* Financial Disclaimer */}
            <Card className="border-l-4 border-l-amber-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  Financial & Tax Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  The financial guidance provided in Coaching Amplifier is for <strong>general 
                  informational purposes only</strong> and is based on common practices within the 
                  health coaching industry. This is <strong>not professional tax, legal, accounting, 
                  or financial advice</strong>.
                </p>
                <p>
                  As an independent contractor (1099), your tax situation is unique. Tax laws vary by 
                  state and change frequently. The percentages and strategies suggested here are 
                  starting points, not guarantees of compliance or optimal results.
                </p>
                <p>
                  We strongly recommend consulting with a <strong>qualified tax professional, CPA, 
                  or financial advisor</strong> for advice specific to your situation before making 
                  any financial decisions.
                </p>
                <p className="font-semibold text-amber-800 bg-amber-50 p-3 rounded-lg">
                  Coaching Amplifier and its creators are not liable for any financial decisions 
                  made based on the information provided.
                </p>
              </CardContent>
            </Card>

            {/* Income Disclaimer */}
            <Card className="border-l-4 border-l-blue-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Income & Earnings Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  The income examples and potential earnings discussed in this training are for 
                  <strong> illustrative purposes only</strong> and are not guarantees of income. 
                  Individual results vary significantly based on effort, skill, market conditions, 
                  and many other factors.
                </p>
                <p>
                  OPTAVIA coaches are independent contractors. For actual income statistics and the 
                  official Income Disclosure Statement, please visit OPTAVIA's official website. 
                  <strong> The majority of coaches do not earn significant income from coaching 
                  activities.</strong>
                </p>
                <p>
                  Past performance does not guarantee future results. Any income claims made by 
                  individual coaches represent their personal results and may not be typical.
                </p>
                <p className="font-semibold text-blue-800 bg-blue-50 p-3 rounded-lg">
                  Coaching Amplifier does not guarantee any level of income or business success.
                </p>
              </CardContent>
            </Card>

            {/* Weight Loss Disclaimer */}
            <Card className="border-l-4 border-l-green-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Scale className="h-5 w-5 text-green-600" />
                  Weight Loss & Health Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  <strong>Individual weight loss results vary significantly.</strong> The results 
                  mentioned in this training, including client success stories and sample scripts, 
                  are not guarantees of results you or your clients will achieve.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 my-4">
                  <p className="font-semibold text-green-800 mb-0">
                    Average weight loss on the Optimal Weight 5 & 1 Plan® is 12 pounds. 
                    Clients are in weight loss, on average, for 12 weeks.
                  </p>
                </div>
                <p>
                  Factors affecting results include starting weight, adherence to the program, 
                  metabolic factors, medical conditions, medications, and other individual circumstances.
                </p>
                <p>
                  The OPTAVIA program is <strong>not intended to diagnose, treat, cure, or prevent 
                  any disease</strong>. Clients with medical conditions, those on medications, 
                  pregnant or nursing women, and anyone with health concerns should consult with 
                  a healthcare provider before starting any weight loss program.
                </p>
                <p className="font-semibold text-green-800 bg-green-50 p-3 rounded-lg">
                  Health coaches are not medical professionals and should never provide medical 
                  advice, diagnose conditions, or recommend changes to medications.
                </p>
              </CardContent>
            </Card>

            {/* Scope of Practice */}
            <Card className="border-l-4 border-l-red-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Heart className="h-5 w-5 text-red-600" />
                  Scope of Practice Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  OPTAVIA health coaches are <strong>not licensed medical professionals, registered 
                  dietitians, or healthcare providers</strong>. The information provided in this 
                  training is for educational purposes only and does not constitute medical advice.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 my-4">
                  <p className="font-semibold text-red-800 mb-2">Coaches should NEVER:</p>
                  <ul className="text-red-700 list-disc list-inside space-y-1 mb-0">
                    <li>Diagnose any medical condition</li>
                    <li>Recommend changes to prescribed medications</li>
                    <li>Provide advice on managing diseases or medical conditions</li>
                    <li>Make claims about curing, treating, or preventing illness</li>
                    <li>Advise clients to ignore symptoms or delay medical care</li>
                  </ul>
                </div>
                <p>
                  Clients experiencing concerning symptoms, adverse reactions, or who have medical 
                  conditions should be referred to their healthcare provider.
                </p>
                <p className="font-semibold">
                  If in doubt, always recommend the client consult with their doctor.
                </p>
              </CardContent>
            </Card>

            {/* Mental Health Disclaimer */}
            <Card className="border-l-4 border-l-purple-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Mental Health Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  Health coaches are <strong>not licensed mental health professionals, counselors, 
                  therapists, or psychologists</strong>. The emotional support strategies discussed 
                  in this training are intended for general encouragement during a weight loss 
                  journey, not mental health treatment.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 my-4">
                  <p className="font-semibold text-purple-800 mb-2">
                    Coaches should refer clients to qualified mental health professionals if they 
                    exhibit signs of:
                  </p>
                  <ul className="text-purple-700 list-disc list-inside space-y-1 mb-0">
                    <li>Depression or persistent sadness</li>
                    <li>Anxiety disorders</li>
                    <li>Eating disorders</li>
                    <li>Suicidal thoughts or self-harm</li>
                    <li>Any mental health crisis</li>
                  </ul>
                </div>
                <p className="font-semibold text-purple-800 bg-purple-50 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>
                    If a client expresses thoughts of self-harm or suicide, direct them to the 
                    <strong> 988 Suicide & Crisis Lifeline</strong> or emergency services (911) immediately.
                  </span>
                </p>
                <p>
                  This training does not qualify coaches to provide mental health services.
                </p>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-l-4 border-l-slate-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Shield className="h-5 w-5 text-slate-600" />
                  Health Assessment Privacy Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  The information clients provide in Health Assessments is sent directly to the 
                  coach's email inbox—and nowhere else. Coaching Amplifier does not store client 
                  responses on our servers, and no one other than the designated health coach 
                  will ever have access to this information.
                </p>
                <p>
                  By submitting an assessment, clients agree to share their responses with their 
                  health coach.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property Ownership */}
            <Card className="border-l-4 border-l-indigo-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Copyright className="h-5 w-5 text-indigo-600" />
                  Intellectual Property Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  All content, features, functionality, software, source code, designs, text, graphics, 
                  logos, icons, images, audio, video, data compilations, and other materials available 
                  on or through Coaching Amplifier (collectively, the "Content") are the exclusive 
                  property of <strong>Smith Health and Wellness LLC</strong> and are protected by 
                  United States and international copyright, trademark, patent, trade secret, and 
                  other intellectual property or proprietary rights laws.
                </p>
                <p>
                  The Coaching Amplifier name, logo, and all related names, logos, product and service 
                  names, designs, and slogans are trademarks of Smith Health and Wellness LLC. You may 
                  not use such marks without the prior written permission of Smith Health and Wellness LLC.
                </p>
                <p className="font-semibold text-indigo-800 bg-indigo-50 p-3 rounded-lg">
                  Coaching Amplifier is proprietary software. It is NOT open source and no rights 
                  are granted to copy, modify, distribute, or create derivative works.
                </p>
              </CardContent>
            </Card>

            {/* Software License */}
            <Card className="border-l-4 border-l-cyan-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Lock className="h-5 w-5 text-cyan-600" />
                  Software License Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  Subject to your compliance with these Terms of Service, Smith Health and Wellness LLC 
                  grants you a <strong>limited, non-exclusive, non-transferable, non-sublicensable, 
                  revocable license</strong> to access and use Coaching Amplifier solely for your 
                  personal, non-commercial health coaching business purposes.
                </p>
                <p>
                  This license does not include any right to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Modify, adapt, translate, or create derivative works of the software</li>
                  <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code</li>
                  <li>Rent, lease, lend, sell, sublicense, or transfer the software to any third party</li>
                  <li>Remove, alter, or obscure any proprietary notices</li>
                  <li>Use the software for any commercial purpose other than your own coaching business</li>
                </ul>
                <p className="font-semibold text-cyan-800 bg-cyan-50 p-3 rounded-lg">
                  This license is automatically revoked if you violate any of these restrictions. 
                  Upon termination, you must cease all use of the Service.
                </p>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
            <Card className="border-l-4 border-l-rose-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Ban className="h-5 w-5 text-rose-600" />
                  Prohibited Uses
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  In addition to the restrictions above, you expressly agree NOT to:
                </p>
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 my-4">
                  <ul className="text-rose-700 list-disc list-inside space-y-2 mb-0">
                    <li>Copy, reproduce, or duplicate any portion of the software, content, or features</li>
                    <li>Use automated systems, bots, scrapers, or data mining tools to extract content</li>
                    <li>Share your login credentials or allow others to access your account</li>
                    <li>Use the platform to build, assist, or inform the development of a competing product or service</li>
                    <li>Benchmark or conduct competitive analysis for commercial purposes</li>
                    <li>Photograph, screenshot, or record the interface for purposes of replication</li>
                    <li>Disclose proprietary features, methods, or business logic to competitors</li>
                    <li>Circumvent any access controls or security measures</li>
                  </ul>
                </div>
                <p className="font-semibold text-rose-800">
                  Violation of these prohibitions may result in immediate account termination without 
                  refund and may subject you to legal action for damages and injunctive relief.
                </p>
              </CardContent>
            </Card>

            {/* Confidentiality */}
            <Card className="border-l-4 border-l-violet-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <Shield className="h-5 w-5 text-violet-600" />
                  Confidentiality & Trade Secrets
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  You acknowledge that Coaching Amplifier contains proprietary information and 
                  <strong> trade secrets</strong> of Smith Health and Wellness LLC, including but not 
                  limited to: software architecture, algorithms, user interface designs, feature 
                  implementations, business methods, training methodologies, and data structures.
                </p>
                <p>
                  You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Hold all proprietary information in strict confidence</li>
                  <li>Not disclose any proprietary information to any third party</li>
                  <li>Not use proprietary information for any purpose other than as intended</li>
                  <li>Take reasonable measures to protect the confidentiality of such information</li>
                </ul>
                <p className="font-semibold text-violet-800 bg-violet-50 p-3 rounded-lg">
                  These confidentiality obligations survive the termination of your account and 
                  continue indefinitely with respect to trade secrets.
                </p>
              </CardContent>
            </Card>

            {/* Remedies */}
            <Card className="border-l-4 border-l-orange-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-optavia-dark">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Enforcement & Remedies
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-optavia-gray">
                <p>
                  You acknowledge that any breach of the intellectual property, confidentiality, or 
                  prohibited use provisions of these Terms would cause irreparable harm to Smith Health 
                  and Wellness LLC for which monetary damages would be inadequate.
                </p>
                <p>
                  Accordingly, Smith Health and Wellness LLC shall be entitled to seek:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Injunctive relief</strong> to prevent any actual or threatened breach</li>
                  <li><strong>Specific performance</strong> of these Terms</li>
                  <li><strong>Monetary damages</strong> including actual damages and lost profits</li>
                  <li><strong>Attorney's fees</strong> and costs of enforcement</li>
                </ul>
                <p>
                  These remedies are cumulative and in addition to any other remedies available at 
                  law or in equity.
                </p>
                <p className="font-semibold text-orange-800 bg-orange-50 p-3 rounded-lg">
                  You agree to indemnify and hold harmless Smith Health and Wellness LLC from any 
                  claims, damages, or expenses arising from your violation of these Terms.
                </p>
              </CardContent>
            </Card>

            {/* Legal Review Note */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Legal Notice</h3>
                    <p className="text-sm text-amber-800">
                      These disclaimers are provided for informational purposes and represent best 
                      practices. This is not legal advice. For specific legal guidance regarding 
                      your coaching business, FTC regulations, or compliance requirements, please 
                      consult with a qualified attorney familiar with network marketing and 
                      health/wellness industry requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <p className="text-center text-sm text-optavia-gray">
              Last updated: June 2026
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
