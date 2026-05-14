/**
 * MOUMEN PARKOUR RACE - Physics Engine
 * Created by Moumen ZwD
 * 
 * Custom physics system for:
 * - Gravity and falling
 * - Collision detection
 * - Velocity and acceleration
 * - Player movement
 * - Jump mechanics
 */

class PhysicsEngine {
    constructor(config = {}) {
        // Gravity
        this.gravity = config.gravity || 9.81 * 60; // Adjusted for frame rate
        this.airResistance = config.airResistance || 0.99;

        // World bounds
        this.worldMin = config.worldMin || { x: -500, y: -100, z: -500 };
        this.worldMax = config.worldMax || { x: 500, y: 500, z: 500 };

        // Physics bodies
        this.bodies = [];

        // Collision pairs
        this.collisionPairs = [];
    }

    /**
     * Create physics body
     */
    createBody(object3d, config = {}) {
        const body = {
            object3d,
            position: object3d.position.clone(),
            velocity: new THREE.Vector3(0, 0, 0),
            acceleration: new THREE.Vector3(0, 0, 0),
            mass: config.mass || 1,
            friction: config.friction || 0.1,
            restitution: config.restitution || 0.3,
            isStatic: config.isStatic || false,
            isKinematic: config.isKinematic || false,
            width: config.width || 1,
            height: config.height || 2,
            depth: config.depth || 1,
            onGround: false,
            groundNormal: new THREE.Vector3(0, 1, 0),
            lastPosition: object3d.position.clone(),
            colliding: false,
        };

        this.bodies.push(body);
        return body;
    }

    /**
     * Apply force to body
     */
    applyForce(body, force) {
        if (body.isStatic) return;
        body.acceleration.add(
            new THREE.Vector3().copy(force).divideScalar(body.mass)
        );
    }

    /**
     * Apply impulse
     */
    applyImpulse(body, impulse) {
        if (body.isStatic) return;
        body.velocity.add(impulse);
    }

    /**
     * Update physics
     */
    update(deltaTime) {
        // Update velocities and positions
        this.bodies.forEach(body => {
            if (body.isStatic || body.isKinematic) return;

            // Apply gravity
            body.acceleration.y -= this.gravity;

            // Apply velocity
            body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime));

            // Air resistance
            body.velocity.multiplyScalar(this.airResistance);

            // Update position
            body.lastPosition.copy(body.position);
            body.position.add(body.velocity.clone().multiplyScalar(deltaTime));

            // Reset acceleration
            body.acceleration.set(0, 0, 0);

            // Update object3d position
            body.object3d.position.copy(body.position);
        });

        // Collision detection
        this.detectCollisions();

        // Resolve collisions
        this.resolveCollisions();

        // Boundary checking
        this.checkBoundaries();
    }

    /**
     * Detect collisions between bodies
     */
    detectCollisions() {
        this.collisionPairs = [];

        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                if (this.isColliding(bodyA, bodyB)) {
                    this.collisionPairs.push({ bodyA, bodyB });
                }
            }
        }
    }

    /**
     * Check if two bodies collide (AABB collision)
     */
    isColliding(bodyA, bodyB) {
        const aMinX = bodyA.position.x - bodyA.width / 2;
        const aMaxX = bodyA.position.x + bodyA.width / 2;
        const aMinY = bodyA.position.y - bodyA.height / 2;
        const aMaxY = bodyA.position.y + bodyA.height / 2;
        const aMinZ = bodyA.position.z - bodyA.depth / 2;
        const aMaxZ = bodyA.position.z + bodyA.depth / 2;

        const bMinX = bodyB.position.x - bodyB.width / 2;
        const bMaxX = bodyB.position.x + bodyB.width / 2;
        const bMinY = bodyB.position.y - bodyB.height / 2;
        const bMaxY = bodyB.position.y + bodyB.height / 2;
        const bMinZ = bodyB.position.z - bodyB.depth / 2;
        const bMaxZ = bodyB.position.z + bodyB.depth / 2;

        return !(aMaxX < bMinX || aMinX > bMaxX ||
                 aMaxY < bMinY || aMinY > bMaxY ||
                 aMaxZ < bMinZ || aMinZ > bMaxZ);
    }

    /**
     * Resolve collisions
     */
    resolveCollisions() {
        this.collisionPairs.forEach(pair => {
            const { bodyA, bodyB } = pair;

            // Don't resolve static collisions
            if (bodyA.isStatic && bodyB.isStatic) return;

            // Get collision info
            const collisionInfo = this.getCollisionInfo(bodyA, bodyB);
            if (!collisionInfo) return;

            const { normal, depth } = collisionInfo;

            // Separate bodies
            if (bodyA.isStatic) {
                bodyB.position.add(normal.clone().multiplyScalar(depth));
            } else if (bodyB.isStatic) {
                bodyA.position.add(normal.clone().multiplyScalar(-depth));
            } else {
                bodyA.position.add(normal.clone().multiplyScalar(-depth / 2));
                bodyB.position.add(normal.clone().multiplyScalar(depth / 2));
            }

            // Calculate relative velocity
            const relativeVelocity = bodyA.velocity.clone().sub(bodyB.velocity);

            // Don't collide if velocities are separating
            if (relativeVelocity.dot(normal) > 0) return;

            // Calculate impulse
            const restitution = Math.min(bodyA.restitution, bodyB.restitution);
            const rVelAlongNormal = relativeVelocity.dot(normal);
            let impulseMagnitude = -(1 + restitution) * rVelAlongNormal;
            impulseMagnitude /= (1 / bodyA.mass) + (1 / bodyB.mass);

            const impulse = normal.clone().multiplyScalar(impulseMagnitude);

            // Apply impulse
            if (!bodyA.isStatic) {
                bodyA.velocity.add(impulse.clone().divideScalar(bodyA.mass));
            }
            if (!bodyB.isStatic) {
                bodyB.velocity.sub(impulse.clone().divideScalar(bodyB.mass));
            }

            // Ground detection
            if (Math.abs(normal.y) > 0.9) {
                if (normal.y > 0) {
                    bodyA.onGround = true;
                    bodyA.groundNormal = normal;
                } else {
                    bodyB.onGround = true;
                    bodyB.groundNormal = normal.clone().multiplyScalar(-1);
                }
            }
        });
    }

    /**
     * Get collision information
     */
    getCollisionInfo(bodyA, bodyB) {
        const aMinX = bodyA.position.x - bodyA.width / 2;
        const aMaxX = bodyA.position.x + bodyA.width / 2;
        const aMinY = bodyA.position.y - bodyA.height / 2;
        const aMaxY = bodyA.position.y + bodyA.height / 2;
        const aMinZ = bodyA.position.z - bodyA.depth / 2;
        const aMaxZ = bodyA.position.z + bodyA.depth / 2;

        const bMinX = bodyB.position.x - bodyB.width / 2;
        const bMaxX = bodyB.position.x + bodyB.width / 2;
        const bMinY = bodyB.position.y - bodyB.height / 2;
        const bMaxY = bodyB.position.y + bodyB.height / 2;
        const bMinZ = bodyB.position.z - bodyB.depth / 2;
        const bMaxZ = bodyB.position.z + bodyB.depth / 2;

        // Calculate overlap
        const overlapX = Math.min(aMaxX, bMaxX) - Math.max(aMinX, bMinX);
        const overlapY = Math.min(aMaxY, bMaxY) - Math.max(aMinY, bMinY);
        const overlapZ = Math.min(aMaxZ, bMaxZ) - Math.max(aMinZ, bMinZ);

        // Find smallest overlap axis
        if (overlapX < overlapY && overlapX < overlapZ) {
            const normal = new THREE.Vector3(aMaxX > bMaxX ? 1 : -1, 0, 0);
            return { normal, depth: overlapX };
        } else if (overlapY < overlapZ) {
            const normal = new THREE.Vector3(0, aMaxY > bMaxY ? 1 : -1, 0);
            return { normal, depth: overlapY };
        } else {
            const normal = new THREE.Vector3(0, 0, aMaxZ > bMaxZ ? 1 : -1);
            return { normal, depth: overlapZ };
        }
    }

    /**
     * Check world boundaries
     */
    checkBoundaries() {
        this.bodies.forEach(body => {
            if (body.isStatic) return;

            // Below world
            if (body.position.y < this.worldMin.y) {
                body.position.y = this.worldMin.y;
                body.velocity.y = 0;
                body.onGround = true;
            }

            // Above world
            if (body.position.y > this.worldMax.y) {
                body.position.y = this.worldMax.y;
                body.velocity.y = 0;
            }

            // Clamp to world bounds
            body.position.x = Math.max(this.worldMin.x, Math.min(this.worldMax.x, body.position.x));
            body.position.z = Math.max(this.worldMin.z, Math.min(this.worldMax.z, body.position.z));
        });
    }

    /**
     * Reset body state
     */
    resetBody(body) {
        body.velocity.set(0, 0, 0);
        body.acceleration.set(0, 0, 0);
        body.onGround = false;
    }

    /**
     * Remove body
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }
}

export { PhysicsEngine };
