/**
 * MOUMEN PARKOUR RACE - Input Manager
 * Created by Moumen ZwD
 * 
 * Handles all player input:
 * - Touch joystick
 * - Button inputs
 * - Keyboard support
 * - Mobile controls
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.touches = {};
        this.mousePos = { x: 0, y: 0 };
        
        // Joystick state
        this.joystick = {
            active: false,
            x: 0,
            y: 0,
            magnitude: 0,
            angle: 0,
        };

        // Button states
        this.buttons = {
            jump: false,
            dash: false,
            slide: false,
        };

        this.listeners = new Map();
    }

    /**
     * Initialize input handlers
     */
    initialize() {
        // Desktop keyboard
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Mouse/Touch
        document.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this._onTouchEnd(e), { passive: false });

        // Button inputs
        this._setupButtonInputs();

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.joystick-container') || e.target.closest('.control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Setup button input handlers
     */
    _setupButtonInputs() {
        const jumpBtn = document.getElementById('jump-btn');
        const dashBtn = document.getElementById('dash-btn');

        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', () => this._onButtonDown('jump'));
            jumpBtn.addEventListener('touchend', () => this._onButtonUp('jump'));
            jumpBtn.addEventListener('mousedown', () => this._onButtonDown('jump'));
            jumpBtn.addEventListener('mouseup', () => this._onButtonUp('jump'));
        }

        if (dashBtn) {
            dashBtn.addEventListener('touchstart', () => this._onButtonDown('dash'));
            dashBtn.addEventListener('touchend', () => this._onButtonUp('dash'));
            dashBtn.addEventListener('mousedown', () => this._onButtonDown('dash'));
            dashBtn.addEventListener('mouseup', () => this._onButtonUp('dash'));
        }
    }

    /**
     * Handle key down
     */
    _onKeyDown(event) {
        this.keys[event.key] = true;

        // Map keyboard to game actions
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.joystick.y = -1;
                break;
            case 's':
            case 'arrowdown':
                this.joystick.y = 1;
                break;
            case 'a':
            case 'arrowleft':
                this.joystick.x = -1;
                break;
            case 'd':
            case 'arrowright':
                this.joystick.x = 1;
                break;
            case ' ':
                this.buttons.jump = true;
                break;
            case 'shift':
                this.buttons.dash = true;
                break;
        }

        this._emit('keydown', event);
    }

    /**
     * Handle key up
     */
    _onKeyUp(event) {
        this.keys[event.key] = false;

        switch (event.key.toLowerCase()) {
            case 'w':
            case 's':
            case 'arrowup':
            case 'arrowdown':
                this.joystick.y = 0;
                break;
            case 'a':
            case 'd':
            case 'arrowleft':
            case 'arrowright':
                this.joystick.x = 0;
                break;
            case ' ':
                this.buttons.jump = false;
                break;
            case 'shift':
                this.buttons.dash = false;
                break;
        }

        this._emit('keyup', event);
    }

    /**
     * Handle touch start
     */
    _onTouchStart(event) {
        for (const touch of event.touches) {
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
            };

            // Check if touch is on joystick
            const joystickElement = document.getElementById('joystick');
            if (joystickElement) {
                const rect = joystickElement.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    this.joystick.active = true;
                }
            }
        }

        this._emit('touchstart', event);
    }

    /**
     * Handle touch move
     */
    _onTouchMove(event) {
        for (const touch of event.touches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier].x = touch.clientX;
                this.touches[touch.identifier].y = touch.clientY;

                // Update joystick
                if (this.joystick.active) {
                    const joystickElement = document.getElementById('joystick');
                    if (joystickElement) {
                        const rect = joystickElement.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        const radius = rect.width / 2 - 10;

                        let deltaX = touch.clientX - centerX;
                        let deltaY = touch.clientY - centerY;

                        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                        if (magnitude > radius) {
                            deltaX = (deltaX / magnitude) * radius;
                            deltaY = (deltaY / magnitude) * radius;
                        }

                        this.joystick.x = deltaX / radius;
                        this.joystick.y = deltaY / radius;
                        this.joystick.magnitude = magnitude / radius;
                        this.joystick.angle = Math.atan2(deltaY, deltaX);

                        // Visual feedback
                        const pad = joystickElement.querySelector('.joystick-pad');
                        if (pad) {
                            pad.style.transform = `translate(${this.joystick.x * 20}px, ${this.joystick.y * 20}px)`;
                        }
                    }
                }
            }
        }

        this._emit('touchmove', event);
    }

    /**
     * Handle touch end
     */
    _onTouchEnd(event) {
        for (const touch of event.changedTouches) {
            delete this.touches[touch.identifier];
        }

        if (Object.keys(this.touches).length === 0) {
            this.joystick.active = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            this.joystick.magnitude = 0;

            // Reset visual feedback
            const joystickElement = document.getElementById('joystick');
            if (joystickElement) {
                const pad = joystickElement.querySelector('.joystick-pad');
                if (pad) {
                    pad.style.transform = 'translate(0px, 0px)';
                }
            }
        }

        this._emit('touchend', event);
    }

    /**
     * Handle button down
     */
    _onButtonDown(button) {
        this.buttons[button] = true;
        this._emit(`button_${button}_down`);
    }

    /**
     * Handle button up
     */
    _onButtonUp(button) {
        this.buttons[button] = false;
        this._emit(`button_${button}_up`);
    }

    /**
     * Get movement input
     */
    getMovement() {
        return {
            x: this.joystick.x,
            y: this.joystick.y,
            magnitude: this.joystick.magnitude,
        };
    }

    /**
     * Get button state
     */
    getButton(button) {
        return this.buttons[button] || false;
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

export { InputManager };
