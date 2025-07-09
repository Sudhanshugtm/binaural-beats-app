import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - Beatful Binaural Beats App",
  description: "Read the terms of service for using Beatful, our binaural beats application for meditation, focus, and relaxation.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://beatful.app/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using Beatful.
          </p>
        </header>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Beatful, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Beatful is a web application that provides binaural beats for meditation, focus, and relaxation. Our service includes:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Customizable binaural beats with various frequencies</li>
              <li>• Meditation timers and session tracking</li>
              <li>• Visual feedback and ambient elements</li>
              <li>• Educational content about binaural beats and meditation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using Beatful, you agree to:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Use the service for personal, non-commercial purposes</li>
              <li>• Not attempt to reverse engineer or copy our technology</li>
              <li>• Respect intellectual property rights</li>
              <li>• Use headphones or earphones as recommended for optimal experience</li>
              <li>• Consult with a healthcare professional if you have any medical conditions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Health and Safety</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Important Health Notice</h3>
              <p className="text-amber-800 leading-relaxed">
                If you have epilepsy, seizure disorders, or any other medical condition that could be affected by audio frequencies, 
                please consult with your healthcare provider before using binaural beats.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              While binaural beats are generally safe for most people, we recommend:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Starting with lower volumes and shorter sessions</li>
              <li>• Discontinuing use if you experience any discomfort</li>
              <li>• Not using while driving or operating machinery</li>
              <li>• Consulting a healthcare professional if you have concerns</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content, features, and functionality of Beatful are owned by us and are protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Beatful is provided "as is" without any warranties. We shall not be liable for any damages arising 
              from the use of our service, including but not limited to direct, indirect, incidental, punitive, 
              and consequential damages.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these terms, please contact us through our website or support channels.
            </p>
          </section>

          <p className="text-sm text-gray-600 mt-12 pt-8 border-t border-gray-200">
            Last updated: July 8, 2024
          </p>
        </div>
      </div>
    </div>
  );
}