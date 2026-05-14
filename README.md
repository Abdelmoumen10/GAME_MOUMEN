# 🎮 MOUMEN PARKOUR RACE - Advanced Multiplayer 3D Game

> **Created by Moumen ZwD** - A professional-grade online multiplayer parkour racing game

![Game Status](https://img.shields.io/badge/Status-Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 📋 Project Overview

**MOUMEN PARKOUR RACE** is a cutting-edge multiplayer 3D parkour and obstacle race game inspired by Fall Guys and Roblox Obby games. Players compete in real-time across challenging maps with neon cyberpunk aesthetics, smooth gameplay mechanics, and beautiful animations.

### 🎯 Key Features

- ✅ **Real-Time Multiplayer** - Up to 4 players per match
- ✅ **3D Graphics** - Three.js with advanced rendering
- ✅ **Mobile Optimized** - Touch controls, responsive design
- ✅ **Beautiful Visuals** - Neon, bloom effects, reflections
- ✅ **Multiple Maps** - Diverse obstacle courses
- ✅ **Authentication** - Email/password system with Firebase
- ✅ **Player Progression** - Stats, skins, cosmetics
- ✅ **Social Features** - Leaderboards, chat, emotes
- ✅ **Multilingual** - Arabic, English, French
- ✅ **Sound Design** - Elegant audio system
- ✅ **PWA Ready** - Works offline, installable

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Modern web browser
- Git installed

### Installation

```bash
# Clone the repository
git clone https://github.com/Abdelmoumen10/GAME_MOUMEN.git
cd GAME_MOUMEN

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 📁 Project Structure

```
GAME_MOUMEN/
├── public/
│   ├── index.html              # Main entry point
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest
│
├── src/
│   ├── index.js                # Main application entry
│   ├── config/
│   │   ├── firebase.config.js  # Firebase configuration
│   │   ├── game.config.js      # Game constants
│   │   └── maps.config.js      # Map definitions
│   │
│   ├── core/
│   │   ├── Game.js             # Main game class
│   │   ├── GameLoop.js         # Frame loop manager
│   │   ├── InputManager.js     # Input handling
│   │   └── PhysicsEngine.js    # Custom physics
│   │
│   ├── graphics/
│   │   ├── Renderer.js         # Three.js renderer
│   │   ├── Scene.js            # Scene management
│   │   ├── Camera.js           # Camera controller
│   │   ├── Lighting.js         # Lighting system
│   │   └── Particles.js        # Particle effects
│   │
│   ├── multiplayer/
│   │   ├── NetworkManager.js   # Firebase sync
│   │   ├── PlayerSync.js       # Player state sync
│   │   └── MatchManager.js     # Match logic
│   │
│   ├── gameplay/
│   │   ├── Player.js           # Player character
│   │   ├── Map.js              # Map generation
│   │   ├── Obstacles.js        # Obstacle types
│   │   ├── Collectibles.js     # Items/coins
│   │   └── GameModes.js        # Game mode logic
│   │
│   ├── ui/
│   │   ├── UIManager.js        # UI system
│   │   ├── MainMenu.js         # Main menu screen
│   │   ├── HUD.js              # In-game HUD
│   │   ├── Leaderboard.js      # Leaderboard UI
│   │   ├── Chat.js             # Chat interface
│   │   └── Settings.js         # Settings menu
│   │
│   ├── auth/
│   │   ├── AuthManager.js      # Authentication
│   │   ├── UserManager.js      # User profile
│   │   └── StorageManager.js   # Local storage
│   │
│   ├── audio/
│   │   ├── AudioManager.js     # Sound system
│   │   └── MusicManager.js     # Music control
│   │
│   ├── utils/
│   │   ├── Vector3.js          # Math utilities
│   │   ├── Quaternion.js       # Rotation math
│   │   ├── Logger.js           # Logging system
│   │   ├── EventEmitter.js     # Event system
│   │   └── Helpers.js          # Helper functions
│   │
│   ├── assets/
│   │   ├── models/             # 3D models
│   │   ├── textures/           # Texture files
│   │   ├── sounds/             # Audio files
│   │   ├── music/              # Background music
│   │   └── sprites/            # UI sprites
│   │
│   └── styles/
│       ├── main.css            # Main stylesheet
│       ├── ui.css              # UI components
│       ├── animations.css      # Animation library
│       ├── responsive.css      # Mobile responsive
│       └── themes.css          # Color themes
│
├── backend/
│   ├── server.js               # Node.js server
│   ├── socketHandler.js        # WebSocket handler
│   ├── matchmaking.js          # Matchmaking logic
│   ├── database.js             # Database models
│   ├── middleware/
│   │   ├── auth.js             # Auth middleware
│   │   └── validation.js       # Data validation
│   └── routes/
│       ├── auth.routes.js      # Auth endpoints
│       ├── players.routes.js   # Player endpoints
│       └── matches.routes.js   # Match endpoints
│
├── scripts/
│   ├── generate-assets.js      # Asset generation
│   ├── optimize.js             # Optimization script
│   └── deploy.js               # Deployment script
│
├── tests/
│   ├── game.test.js
│   ├── physics.test.js
│   ├── network.test.js
│   └── ui.test.js
│
├── docs/
│   ├── SETUP.md                # Setup guide
│   ├── ARCHITECTURE.md         # Architecture docs
│   ├── API.md                  # API documentation
│   ├── GAMEPLAY.md             # Gameplay guide
│   └── DEPLOYMENT.md           # Deployment guide
│
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml          # Auto deployment
│   │   └── test.yml            # Testing workflow
│   └── ISSUE_TEMPLATE/
│
├── .gitignore
├── package.json
├── webpack.config.js           # Webpack bundler
├── .env.example
└── LICENSE
```

---

## 🎮 Gameplay Mechanics

### Controls (Mobile)
- **Left Joystick** - Movement
- **Jump Button** - Jump/Double Jump
- **Dash Button** - Quick dash
- **Slide Button** - Slide under obstacles

### Game Loop
1. Players join waiting lobby
2. Match starts with 4+ players
3. 3-second countdown
4. Players navigate obstacle course
5. First to finish wins trophy
6. Losers respawn at start
7. Match ends when winner reaches finish

### Maps
- Neon City
- Sky Platforms
- Cyber Tunnels
- Space Station
- Lava Obstacles
- Floating Islands
- Fake Doors
- Moving Platforms

---

## 🏗️ Technology Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| 3D Rendering | Three.js | Industry standard, high performance |
| Real-time Sync | Firebase Realtime DB | Real-time updates, easy scaling |
| Authentication | Firebase Auth | Secure, easy to implement |
| Backend API | Node.js + Express | Fast, JavaScript-based |
| WebSockets | Socket.io | Reliable real-time communication |
| Bundler | Webpack | Optimized production builds |
| Testing | Jest | Professional testing framework |
| Hosting | GitHub Pages + Render.com | Free, reliable deployment |

---

## 🔐 Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Realtime Database
4. Copy credentials to `.env`

See [SETUP.md](docs/SETUP.md) for detailed instructions.

---

## 📱 Mobile Optimization

- Touch-optimized controls
- Landscape orientation
- Auto-scaling UI
- Battery optimization
- Network optimization
- 60 FPS target on mobile

---

## 🎨 Visual Style

- **Cyberpunk Neon** - Bright colors, glowing effects
- **Glassmorphism UI** - Transparent, blurred backgrounds
- **AAA Quality** - Professional animations and transitions
- **Sunny Atmosphere** - Bright, optimistic environments
- **Bloom & Reflections** - Modern post-processing effects

---

## 🚀 Deployment

### GitHub Pages (Frontend)
```bash
npm run build
npm run deploy
```

### Backend (Render.com)
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed guide.

---

## 📊 Performance Targets

- ⚡ **Load Time** - < 3 seconds
- 🎮 **Frame Rate** - 60 FPS (mobile: 30-60)
- 📊 **Bundle Size** - < 5MB gzipped
- 🌐 **Network Latency** - < 100ms
- 📦 **Memory Usage** - < 200MB

---

## 🐛 Bug Reports & Feature Requests

Found a bug? Have a feature idea? Please open an issue at:
https://github.com/Abdelmoumen10/GAME_MOUMEN/issues

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Creator

**Created by Moumen ZwD**

- 🎮 Game Design & Development
- 🎨 Visual Design & UI/UX
- 🚀 Full Stack Architecture
- 📱 Mobile Optimization

---

## 🙏 Acknowledgments

- **Inspired by**: Fall Guys, Roblox Obby, Neon games
- **Built with**: Three.js, Firebase, Node.js
- **Supported by**: Modern web technologies

---

## 📞 Support

For support, documentation, and guides, visit the [docs](docs/) folder.

---

**Last Updated**: 2026-05-14  
**Project Status**: 🚀 Production Development

---

*"Created by Moumen ZwD - Building amazing multiplayer experiences"*
