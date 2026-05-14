/**
 * MOUMEN PARKOUR RACE - Authentication Manager
 * Created by Moumen ZwD
 * 
 * Handles user authentication with Firebase
 * - Login/Register
 * - Session management
 * - User profile
 */

import { Logger } from '../utils/Logger.js';

class AuthManager {
    constructor() {
        this.logger = new Logger('AuthManager');
        this.currentUser = null;
        this.auth = null;
    }

    /**
     * Initialize Firebase authentication
     */
    async initialize() {
        try {
            this.logger.info('Initializing Firebase Authentication...');

            // Get Firebase config from .env or window
            const firebaseConfig = this._getFirebaseConfig();
            
            // Initialize Firebase Auth
            this.auth = window.firebase.auth();
            
            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.logger.info(`Auth state changed: ${user ? user.email : 'signed out'}`);
            });

            this.logger.success('✓ Authentication initialized');
        } catch (error) {
            this.logger.error('Failed to initialize auth:', error.message);
            throw error;
        }
    }

    /**
     * Get Firebase configuration from environment
     */
    _getFirebaseConfig() {
        return {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
        };
    }

    /**
     * Register new user
     */
    async register(email, password, username) {
        try {
            this.logger.info(`Registering user: ${email}`);

            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Set display name
            await user.updateProfile({
                displayName: username,
            });

            // Create user profile in database
            await this._createUserProfile(user.uid, {
                email,
                username,
                level: 1,
                wins: 0,
                coins: 0,
                races: 0,
                createdAt: new Date().toISOString(),
            });

            // Check if this is the special account
            if (username.toLowerCase() === 'moumen') {
                await this._giveCreatorBadge(user.uid);
            }

            this.logger.success(`✓ User registered: ${email}`);
            this.currentUser = user;
            return user;

        } catch (error) {
            this.logger.error('Registration failed:', error.message);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            this.logger.info(`Logging in user: ${email}`);

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            this.logger.success(`✓ User logged in: ${email}`);
            this.currentUser = user;
            return user;

        } catch (error) {
            this.logger.error('Login failed:', error.message);
            throw error;
        }
    }

    /**
     * Logout current user
     */
    async logout() {
        try {
            this.logger.info('Logging out user');
            await this.auth.signOut();
            this.currentUser = null;
            this.logger.success('✓ User logged out');
        } catch (error) {
            this.logger.error('Logout failed:', error.message);
            throw error;
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Reset password
     */
    async resetPassword(email) {
        try {
            this.logger.info(`Resetting password for: ${email}`);
            await this.auth.sendPasswordResetEmail(email);
            this.logger.success('✓ Password reset email sent');
        } catch (error) {
            this.logger.error('Password reset failed:', error.message);
            throw error;
        }
    }

    /**
     * Create user profile in database
     */
    async _createUserProfile(uid, profileData) {
        try {
            const database = window.firebase.database();
            await database.ref(`players/${uid}`).set(profileData);
            this.logger.info(`✓ User profile created: ${uid}`);
        } catch (error) {
            this.logger.error('Failed to create profile:', error.message);
            throw error;
        }
    }

    /**
     * Give special creator badge to "Moumen" account
     */
    async _giveCreatorBadge(uid) {
        try {
            const database = window.firebase.database();
            await database.ref(`players/${uid}`).update({
                isCreator: true,
                badge: 'creator',
                auraColor: '#00d4ff',
            });
            this.logger.success('✓ Creator badge granted');
        } catch (error) {
            this.logger.warn('Failed to grant creator badge:', error.message);
        }
    }
}

export { AuthManager };
