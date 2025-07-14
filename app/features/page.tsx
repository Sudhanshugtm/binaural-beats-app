import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Features - Beatful Binaural Beats App for Focus & Meditation",
  description: "Explore Beatful's powerful features: customizable binaural beats, meditation timers, focus modes, brainwave entrainment, and more. Perfect for productivity and relaxation.",
  keywords: [
    "binaural beats features",
    "meditation app features",
    "focus timer",
    "brainwave entrainment",
    "customizable frequencies",
    "meditation timer",
    "productivity tools",
    "relaxation features",
    "mindfulness app",
    "concentration tools"
  ],
  openGraph: {
    title: "Features - Beatful Binaural Beats App",
    description: "Explore powerful features for focus, meditation, and relaxation with customizable binaural beats and timers.",
    type: "website",
    url: "https://beatful.app/features",
    images: [
      {
        url: "/features-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beatful Features - Binaural Beats App Capabilities",
      },
    ],
  },
  alternates: {
    canonical: "https://beatful.app/features",
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 animated-gradient">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Every Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how Beatful's scientifically-designed features can transform your focus, 
            meditation, and relaxation experience
          </p>
        </header>

        {/* Core Features Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Customizable Binaural Beats */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customizable Binaural Beats</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Fine-tune your experience with precise frequency control. Choose from Alpha, Beta, 
                Theta, and Gamma waves to match your desired mental state.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Frequency range: 0.5-40 Hz</li>
                <li>• Real-time adjustment</li>
                <li>• Preset configurations</li>
                <li>• Save custom settings</li>
              </ul>
            </div>

            {/* Meditation Timer */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meditation Timer</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Set focused sessions with our intuitive timer. Track your practice and build 
                consistent meditation habits.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Flexible duration settings</li>
                <li>• Gentle start/end chimes</li>
                <li>• Session tracking</li>
                <li>• Progress analytics</li>
              </ul>
            </div>

            {/* Focus Modes */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Focus Modes</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Specialized modes for different types of mental work. Each mode optimizes 
                frequencies for specific cognitive tasks.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Deep Work (Beta waves)</li>
                <li>• Creative Flow (Alpha waves)</li>
                <li>• Study Mode (Gamma waves)</li>
                <li>• Relaxation (Theta waves)</li>
              </ul>
            </div>

            {/* Visual Feedback */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M9 8V6a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Visual Feedback</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Beautiful, calming visualizations that respond to your binaural beats. 
                Enhance focus and create a more immersive experience.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Particle animations</li>
                <li>• Breathing guides</li>
                <li>• Geometric patterns</li>
                <li>• Customizable themes</li>
              </ul>
            </div>

            {/* Offline Support */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Offline Support</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Practice anywhere, anytime. Our Progressive Web App works offline once 
                loaded, perfect for meditation retreats or travel.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Full offline functionality</li>
                <li>• Cached audio generation</li>
                <li>• No internet required</li>
                <li>• Auto-sync when online</li>
              </ul>
            </div>

            {/* Cross-Platform */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cross-Platform</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Access your practice from any device. Seamlessly switch between desktop, 
                tablet, and mobile without losing your progress.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Works on all devices</li>
                <li>• Responsive design</li>
                <li>• Touch-optimized</li>
                <li>• Sync across devices</li>
              </ul>
            </div>

          </div>
        </section>

        {/* Advanced Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">Advanced Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">Brainwave Entrainment</h3>
              <p className="text-blue-800 leading-relaxed mb-6">
                Our advanced algorithms create precise binaural beats that guide your brain 
                into specific states of consciousness, backed by neuroscience research.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Alpha (8-12 Hz)</h4>
                  <p className="text-sm text-blue-800">Relaxed awareness, creativity</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Beta (13-30 Hz)</h4>
                  <p className="text-sm text-blue-800">Focus, concentration</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Theta (4-8 Hz)</h4>
                  <p className="text-sm text-blue-800">Deep meditation, insight</p>
                </div>
                <div className="bg-white/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Gamma (30+ Hz)</h4>
                  <p className="text-sm text-blue-800">Peak awareness, binding</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
              <h3 className="text-2xl font-semibold text-green-900 mb-4">Adaptive Audio</h3>
              <p className="text-green-800 leading-relaxed mb-6">
                Our smart audio system adapts to your environment and preferences, 
                automatically adjusting volume and frequencies for optimal experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">Automatic volume leveling</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">Frequency optimization</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">Ambient noise filtering</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">Personalized recommendations</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience all these features and more in our free web application
          </p>
          <div className="flex justify-center space-x-6">
            <a href="/player" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Try Beatful Now
            </a>
            <a href="/about" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Learn More
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}