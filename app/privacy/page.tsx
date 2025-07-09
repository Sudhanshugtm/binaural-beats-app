import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - Beatful Binaural Beats App",
  description: "Learn how Beatful protects your privacy and handles your data. Our commitment to keeping your meditation and focus sessions private and secure.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://beatful.app/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </header>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Beatful is designed with privacy in mind. We collect minimal information necessary to provide our services:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Session preferences and settings (stored locally on your device)</li>
              <li>• Anonymous usage analytics to improve our service</li>
              <li>• Technical information like browser type and device information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Provide and improve our binaural beats experience</li>
              <li>• Remember your preferences and settings</li>
              <li>• Analyze usage patterns to enhance our service</li>
              <li>• Ensure the security and functionality of our application</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your privacy and security are our top priorities:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Most data is stored locally on your device</li>
              <li>• We use industry-standard security measures</li>
              <li>• No personal meditation session data is stored on our servers</li>
              <li>• Anonymous analytics are aggregated and cannot identify individual users</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use third-party services for analytics and improvement purposes. These services are bound by their own privacy policies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2">
              <li>• Access your data</li>
              <li>• Request deletion of your data</li>
              <li>• Opt out of analytics</li>
              <li>• Clear your local data at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this privacy policy, please contact us through our website or support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}