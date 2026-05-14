/**
 * MOUMEN PARKOUR RACE - Main Game Class
 * Created by Moumen ZwD
 * 
 * Core game engine that orchestrates:
 * - Game loop
 * - Rendering
 * - Physics
 * - Multiplayer synchronization
 * - UI management
 */

import { Logger } from '../utils/Logger.js';
import { Renderer } from '../graphics/Renderer.js';
import { InputManager } from '../core/InputManager.js';
import { NetworkManager } from '../multiplayer/NetworkManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { Player } from '../gameplay/Player.js';
import { Map } from '../gameplay/Map.js';

class Game {
    constructor(config = {}) {
        this.logger = new Logger('Game');
        this.config = {
            targetFPS: 60,
            maxPlayers: 4,
            renderMode: 'webgl',
            ...config
        };
        
        // Game state
        this.state = 'LOADING'; // LOADING, MENU, LOBBY, PLAYING, FINISHED
        this.currentMatch = null;
        this.players = new Map();
        this.localPlayer = null;
        
        // Managers
        this.renderer = null;
        this.inputManager = null;
        this.networkManager = null;
        this.audioManager = null;
        this.uiManager = null;
        this.currentMap = null;
        
        // Timing
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Stats
        this.stats = {
            draws: 0,
            networkUpdates: 0,
            playersActive: 0,
        };
    }

    /**
     * Initialize the game engine
     */
    async initialize() {
        try {
            this.logger.info('🎮 Initializing MOUMEN PARKOUR RACE...');
            this.logger.info('Created by Moumen ZwD');

            // Initialize rendering engine
            this.renderer = new Renderer({
                canvas: document.getElementById('gameCanvas'),
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: true,
                shadowMap: true,
                postProcessing: true,
            });
            await this.renderer.initialize();
            this.logger.success('✓ Renderer initialized');

            // Initialize input system
            this.inputManager = new InputManager();
            this.inputManager.initialize();
            this.logger.success('✓ Input manager initialized');

            // Initialize audio system
            this.audioManager = new AudioManager();
            this.audioManager.initialize();
            this.logger.success('✓ Audio manager initialized');

            // Initialize network system
            this.networkManager = new NetworkManager(this);
            await this.networkManager.initialize();
            this.logger.success('✓ Network manager initialized');

            // Initialize UI system
            this.uiManager = new UIManager(this);
            this.uiManager.initialize();
            this.logger.success('✓ UI manager initialized');

            // Set up event listeners
            this._setupEventListeners();

            // Set game state to menu
            this.state = 'MENU';
            this.uiManager.showMainMenu();

            this.logger.success('✅ Game fully initialized!');
            this.logger.info('Ready to play! 🚀');

        } catch (error) {
            this.logger.error('Failed to initialize game:', error);
            this.uiManager.showError('Failed to initialize game. Please refresh the page.');
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    _setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this._onWindowResize());

        // Visibility change (minimize/maximize)
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());

        // Network events
        this.networkManager.on('playerJoined', (player) => this._onPlayerJoined(player));
        this.networkManager.on('playerLeft', (playerId) => this._onPlayerLeft(playerId));
        this.networkManager.on('matchStarted', () => this._onMatchStarted());
        this.networkManager.on('matchEnded', (winner) => this._onMatchEnded(winner));
        this.networkManager.on('playerMoved', (data) => this._onPlayerMoved(data));
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        // Calculate delta time
        if (!this.lastFrameTime) this.lastFrameTime = currentTime;
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Cap delta time to prevent large jumps
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;

        try {
            // Update game based on state
            switch (this.state) {
                case 'PLAYING':
                    this._updateGame();
                    break;
                case 'LOBBY':
                    this._updateLobby();
                    break;
            }

            // Update UI
            this.uiManager.update(this.deltaTime);

            // Render frame
            this._render();

            // Update stats
            this._updateStats();

        } catch (error) {
            this.logger.error('Game loop error:', error);
        }

        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Update game logic while playing
     */
    _updateGame() {
        if (!this.localPlayer || !this.currentMap) return;

        // Update local player
        this.localPlayer.update(this.deltaTime, this.inputManager);

        // Update all players
        for (const player of this.players.values()) {
            player.update(this.deltaTime, null); // AI/remote update
        }

        // Update map obstacles
        if (this.currentMap) {
            this.currentMap.update(this.deltaTime);
        }

        // Sync local player to network
        this.networkManager.syncPlayerMovement(this.localPlayer);

        // Check win conditions
        this._checkWinConditions();
    }

    /**
     * Update lobby state
     */
    _updateLobby() {
        // Update any animations
        for (const player of this.players.values()) {
            player.playLobbyAnimation(this.deltaTime);
        }
    }

    /**
     * Render frame
     */
    _render() {
        // Update camera
        if (this.localPlayer) {
            this.renderer.camera.followPlayer(this.localPlayer);
        }

        // Render scene
        this.renderer.render(
            this.currentMap?.scene || null,
            this.players,
            this.localPlayer
        );

        this.stats.draws++;
    }

    /**
     * Check win conditions
     */
    _checkWinConditions() {
        if (!this.currentMap) return;

        for (const player of this.players.values()) {
            if (player.hasReachedFinish()) {
                this._onPlayerWon(player);
                break;
            }
        }
    }

    /**
     * Handle player win
     */
    async _onPlayerWon(player) {
        this.logger.info(`🏆 Player won: ${player.username}`);
        this.state = 'FINISHED';
        
        // Notify network
        await this.networkManager.notifyPlayerWon(player.id);
        
        // Show victory screen
        this.uiManager.showVictoryScreen(player);
        
        // Play victory sounds
        this.audioManager.playSound('victory');
        this.audioManager.playMusic('victory_theme');
    }

    /**
     * Start a new match
     */
    async startMatch() {
        try {
            this.logger.info('Starting new match...');
            this.state = 'PLAYING';

            // Load random map
            this.currentMap = new Map();
            await this.currentMap.loadRandom();

            // Reset all players
            for (const player of this.players.values()) {
                player.reset();
            }

            // Show countdown
            await this.uiManager.showCountdown(3);

            // Start match
            this.networkManager.startMatch();

            this.logger.success('✓ Match started');

        } catch (error) {
            this.logger.error('Failed to start match:', error);
        }
    }

    /**
     * End current match
     */
    async endMatch() {
        try {
            this.logger.info('Ending match...');
            this.state = 'LOBBY';
            
            await this.networkManager.endMatch();
            
            this.logger.success('✓ Match ended');
        } catch (error) {
            this.logger.error('Failed to end match:', error);
        }
    }

    /**
     * Network event: Player joined
     */
    _onPlayerJoined(playerData) {
        this.logger.info(`👤 Player joined: ${playerData.username}`);
        
        const player = new Player(playerData);
        this.players.set(playerData.id, player);
        
        // Add to scene
        if (this.renderer && this.renderer.scene) {
            this.renderer.scene.add(player.model);
        }
        
        this.uiManager.updatePlayerList(this.players);
    }

    /**
     * Network event: Player left
     */
    _onPlayerLeft(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.logger.info(`👤 Player left: ${player.username}`);
            
            // Remove from scene
            if (this.renderer && this.renderer.scene) {
                this.renderer.scene.remove(player.model);
            }
            
            this.players.delete(playerId);
            this.uiManager.updatePlayerList(this.players);
        }
    }

    /**
     * Network event: Match started
     */
    _onMatchStarted() {
        this.logger.info('Match started on network');
        this.state = 'PLAYING';
    }

    /**
     * Network event: Match ended
     */
    _onMatchEnded(winner) {
        this.logger.info(`Match ended. Winner: ${winner.username}`);
        this.state = 'FINISHED';
    }

    /**
     * Network event: Player moved
     */
    _onPlayerMoved(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.setRemotePosition(data.position);
            player.setRemoteRotation(data.rotation);
            player.setRemoteAnimation(data.animation);
        }
    }

    /**
     * Update statistics
     */
    _updateStats() {
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = 1 / this.deltaTime;
            this.stats.playersActive = this.players.size;
        }
    }

    /**
     * Handle window resize
     */
    _onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.renderer) {
            this.renderer.onWindowResize(width, height);
        }

        if (this.uiManager) {
            this.uiManager.onWindowResize(width, height);
        }
    }

    /**
     * Handle visibility change
     */
    _onVisibilityChange() {
        if (document.hidden) {
            this.logger.info('Game paused (window hidden)');
            this.audioManager.pauseMusic();
        } else {
            this.logger.info('Game resumed');
            this.audioManager.resumeMusic();
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Get game stats
     */
    getStats() {
        return {
            ...this.stats,
            fps: this.fps,
            state: this.state,
            playersCount: this.players.size,
        };
    }
}

export { Game };
