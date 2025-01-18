# Binaural Beats App 🎧

A modern web application for binaural beats, ambient noise, and meditation sounds built with Next.js 14 and TypeScript. Features a sleek UI with dark mode support and fully responsive design.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baba786/binaural-beats-app)

## ✨ Features

- 🎵 **Binaural Beat Generation**: Create precise frequency differences between ears (1-30 Hz)
- 🌊 **Ambient Noise**: Various noise colors (white, pink, brown, etc.)
- 🕉️ **OM Chanting**: Meditative OM sound with perfect loop
- ⏲️ **Customizable Timer**: Preset durations and custom timer settings
- 🎨 **Real-time Visualization**: Canvas-based audio visualization
- 🌓 **Dark/Light Mode**: Automatic and manual theme switching
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎮 **Media Controls**: OS-level media control integration
- 🔊 **Background Audio**: Continues playing when tab is inactive

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.6.7 or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/baba786/binaural-beats-app.git
   cd binaural-beats-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file from example:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Technical Details

### Built With
- Next.js 14
- TypeScript
- Tailwind CSS
- Web Audio API
- shadcn/ui Components
- Radix UI Primitives

### Audio Features
- Binaural beat generation using Web Audio API's OscillatorNode
- Multiple noise colors using different frequency distributions
- Audio visualization using Canvas API
- Custom audio processing and effects

### Performance
- Dynamic imports for better code splitting
- Optimized audio processing
- Efficient state management
- Canvas-based visualizations

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Audio Settings
Default frequency ranges:
- Delta: 1-4 Hz (Deep sleep)
- Theta: 4-8 Hz (Meditation)
- Alpha: 8-13 Hz (Relaxation)
- Beta: 13-30 Hz (Focus)

## 📱 Usage

1. **Select Audio Mode**
   - Binaural Beats
   - Ambient Noise
   - OM Sound

2. **Customize Settings**
   - Adjust frequency for binaural beats
   - Choose noise type for ambient sounds
   - Set timer duration

3. **Start Session**
   - Click play button
   - Use system media controls
   - Monitor progress with visual feedback

## 🛠️ Development

### Commands
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Folder Structure
```
binaural-beats-app/
├── app/                 # Next.js app directory
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
└── utils/             # Helper functions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Credits

- UI Components by [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Sound engineering principles from various binaural beat research papers

## 📧 Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/baba786/binaural-beats-app](https://github.com/baba786/binaural-beats-app)

## 🙏 Acknowledgments

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)