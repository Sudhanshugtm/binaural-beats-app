import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Beatful - Science-Based Binaural Beats for Focus & Meditation",
  description: "Discover the science behind Beatful's binaural beats technology. Learn how our app helps millions achieve better focus, deeper meditation, and enhanced relaxation through scientifically-designed soundscapes.",
  keywords: [
    "binaural beats science",
    "meditation research",
    "focus enhancement",
    "brainwave entrainment",
    "neuroscience",
    "cognitive enhancement",
    "stress reduction",
    "mindfulness technology",
    "audio therapy",
    "wellness app"
  ],
  openGraph: {
    title: "About Beatful - Science-Based Binaural Beats Technology",
    description: "Discover the science behind Beatful's binaural beats technology for focus, meditation, and relaxation.",
    type: "website",
    url: "https://beatful.app/about",
    images: [
      {
        url: "/about-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beatful About Page - Science Behind Binaural Beats",
      },
    ],
  },
  alternates: {
    canonical: "https://beatful.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Beatful
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transforming focus and meditation through scientifically-designed binaural beats
          </p>
        </header>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At Beatful, we believe that everyone deserves access to tools that enhance mental clarity, 
              reduce stress, and promote overall well-being. Our mission is to make the transformative 
              power of binaural beats accessible to everyone through a simple, beautiful, and effective 
              web application.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We combine cutting-edge neuroscience research with intuitive design to create an 
              experience that helps you achieve deeper focus, more effective meditation, and 
              greater relaxation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">The Science Behind Binaural Beats</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How Binaural Beats Work</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Binaural beats occur when two slightly different frequencies are played in each ear. 
                Your brain processes these frequencies and creates a third "beat" frequency that 
                corresponds to the difference between the two tones.
              </p>
              <p className="text-gray-700 leading-relaxed">
                This phenomenon, known as brainwave entrainment, can help synchronize your brain 
                activity to desired states of consciousness, promoting focus, relaxation, creativity, 
                and meditation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Alpha Waves (8-12 Hz)</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Perfect for relaxed focus, light meditation, and creative thinking. 
                  Associated with calm alertness and reduced anxiety.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Beta Waves (13-30 Hz)</h4>
                <p className="text-green-800 text-sm leading-relaxed">
                  Ideal for active concentration, problem-solving, and analytical thinking. 
                  Enhances focus during work and study sessions.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">Theta Waves (4-8 Hz)</h4>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Excellent for deep meditation, creativity, and accessing subconscious insights. 
                  Associated with REM sleep and vivid visualization.
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-indigo-900 mb-3">Gamma Waves (30-100 Hz)</h4>
                <p className="text-indigo-800 text-sm leading-relaxed">
                  Support heightened awareness, cognitive processing, and peak mental performance. 
                  Linked to moments of insight and binding consciousness.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Why Choose Beatful?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Science-Based</h3>
                <p className="text-gray-600 text-sm">Built on peer-reviewed research in neuroscience and cognitive psychology</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessible</h3>
                <p className="text-gray-600 text-sm">Works on any device with a web browser - no downloads required</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mindful Design</h3>
                <p className="text-gray-600 text-sm">Clean, distraction-free interface designed for peaceful focus</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Who We Are</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Beatful is developed by a team of passionate creators, researchers, and wellness 
                advocates who believe in the power of technology to enhance human well-being. 
                We combine expertise in neuroscience, user experience design, and audio engineering 
                to create tools that truly make a difference in people's lives.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our diverse team includes meditation practitioners, cognitive scientists, 
                software engineers, and designers who share a common vision: making mental 
                wellness tools accessible, effective, and beautiful.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Join Our Community</h2>
            <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                Join thousands of users who have discovered the transformative power of binaural beats. 
                Whether you're looking to improve focus, deepen your meditation practice, or simply 
                find a moment of peace in your day, Beatful is here to support your journey.
              </p>
              <div className="flex justify-center space-x-6">
                <a href="/player" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors">
                  Start Your Practice
                </a>
                <a href="/features" className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg border border-gray-300 transition-colors">
                  Explore Features
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}