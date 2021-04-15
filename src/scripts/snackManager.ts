import * as PIXI from 'pixi.js'
import { EventEmitter } from "./eventEmitter";
import { AABB } from "./physics";
import { Vector2 } from './geometry';
import { getFrames } from "./spritesheetUtil";

const SPAWN_INTERVAL = 1.2
const SNACK_GRAVITY = 0.5
const SNACK_HORIZONTAL_DAMP = 1
const SNACK_COLLECT_ANIM_DURATION = 2

export enum SnackEvent {
    SnackLost = 'sl'
}

export class SnackManager {
    readonly display : PIXI.ParticleContainer

    readonly eventEmitter : EventEmitter
    private readonly textures : PIXI.Texture[]

    private snacks : Snack[] = []
    private dropBoundary : {from: number, to: number}
    private poolBelowMargin : number
    private countdown : number = 0
    

    constructor(sceneRect : PIXI.Rectangle) {
        this.dropBoundary = {
            from: sceneRect.width/2 - 125,
            to: sceneRect.width/2 + 125
        }

        this.poolBelowMargin = sceneRect.height + 32

        this.display = new PIXI.ParticleContainer(1500, {
            alpha: true
        })
        this.textures = getFrames('food/', 64)

        this.eventEmitter = new EventEmitter()

        // Micro optimisation; Continious memory block allocated
        this.snacks = Array(32).fill(0).map(() => this.instanceSnack())
    }

    tick(dt : number) {
        this.countdown -= dt / 60
        if (this.countdown <= 0) {
            this.spawnSnacks(Math.floor(1 + Math.random() * 3))
            this.countdown = SPAWN_INTERVAL
        }

        this.updateSnacks(dt)
    }

    // If there were more objects or different collider types,
    // collisions could be handled by authorative physics server
    collectAtOverlapWith(other : AABB) : number {
        let collectedValue = 0
        for (let i = 0; i < this.snacks.length; i++) {
            const snack = this.snacks[i]
            if (snack.state == SnackState.Falling && other.overlaps(snack.aabb)) {
                snack.collect()
                collectedValue += snack.scoreValue
            }
        }

        return collectedValue
    }

    private updateSnacks(dt : number) {
        for (let i = 0; i < this.snacks.length; i++) {
            const snack = this.snacks[i]
            if (snack.state != SnackState.Free) {
                snack.tick(dt)
            }
        }
    }

    private spawnSnacks(amount : number) {
        for (let i = 0; i < amount; i++) {
            const snack = this.getSnack()
            this.display.addChild(snack.sprite)

            // Sectored randomness (limit overlaps)
            const bounds = this.dropBoundary
            const boundsLen = bounds.to - bounds.from
            const cellLen = boundsLen / amount
            snack.x = bounds.from + cellLen * i + Math.random() * cellLen

            snack.y = -16 - i*8

            snack.initialize()
        }
    }

    private getSnack() {
        for (let i = 0; i < this.snacks.length; i++) {
            const snack = this.snacks[i]
            if (snack.state == SnackState.Free) {
                return snack
            }
        }
        const snack = this.instanceSnack()
        this.snacks.push(snack)
        return snack
    }

    private instanceSnack() : Snack {
        const textures = this.textures
        const texIndex = Math.floor(Math.random() * textures.length)
        const sprite = PIXI.Sprite.from(textures[texIndex])
        const snack = new Snack(
            sprite, this.poolBelowMargin, this.eventEmitter, 1000 + texIndex * 125)
        return snack
    }
}

enum SnackState {
    Free,
    Falling,
    Collected
}

class Snack {
    get state() { return this._state}
    get x() { return this._position.x }
    get y() { return this._position.y }
    set x(value : number) { this._position.x = value }
    set y(value : number) { this._position.y = value }
    
    private _state : SnackState = SnackState.Free
    private _position : Vector2 = new Vector2()

    readonly sprite : PIXI.Sprite
    readonly aabb : AABB
    readonly eventEmitter : EventEmitter
    readonly scoreValue : number

    private velocity : Vector2 = new Vector2()
    private animCountdown : number = 0
    private poolBelowMargin : number

    constructor (sprite : PIXI.Sprite, poolBelowMargin : number,
        eventEmitter: EventEmitter, scoreValue : number)
    {
        this.sprite = sprite
        this.poolBelowMargin = poolBelowMargin
        this.eventEmitter = eventEmitter
        this.sprite.anchor.x = 0.5
        this.sprite.anchor.y = 0.5
        this.scoreValue = scoreValue
        this.aabb = new AABB(new Vector2(), new Vector2(8,8))
    }

    initialize() {
        this.velocity.x = (Math.random() - 0.5) * 1
        this.velocity.y = 0
        this.sprite.visible = true
        this._state = SnackState.Falling
        this.sprite.alpha = 1
    }

    free() {
        this._state = SnackState.Free
        this.x = -32
        this.sprite.y = -32
        this.sprite.visible = false
    }

    tick(dt : number) {
        switch (this._state) {
            case SnackState.Falling:
                if (this.sprite.y > this.poolBelowMargin) {
                    this.free()
                    this.eventEmitter.emit(SnackEvent.SnackLost)
                    return
                }
                
                this.applyVelocity(dt)
                this.applyDamp(dt)
                this.applyGravity(dt)
                this.updateBoxPosition()
                this.updateSpritePosition()
                break
            case SnackState.Collected:
                if (this.animCountdown > 0) {
                    this.animCountdown -= dt / 60
                    const factor = 1 - Math.max(
                        0, Math.min(1, this.animCountdown / SNACK_COLLECT_ANIM_DURATION))
                    this.sprite.alpha = 1 - factor
                    this.x += Math.sin(factor * 15) * 0.5 * dt
                    this.applyVelocity(dt)
                    this.applyGravity(dt)
                    this.updateSpritePosition()
                    return
                }

                this.free()
                break
        }
    }

    collect() {
        this._state = SnackState.Collected
        this.animCountdown = SNACK_COLLECT_ANIM_DURATION
        this.velocity.x = 0
        this.velocity.y = -0.5
    }

    private updateBoxPosition() {
        this.aabb.center.x = this.x
        this.aabb.center.y = this.sprite.y
    }

    private updateSpritePosition() {
        // Rounded so the snack texture doesn't bleed through
        this.sprite.x = Math.round(this.x)
        this.sprite.y = Math.round(this.y)
    }

    private applyGravity(dt : number) {
        this.velocity.y += SNACK_GRAVITY * dt / 100
    }

    private applyDamp(dt : number) {
        this.velocity.x *= (1 - SNACK_HORIZONTAL_DAMP * dt / 100)
    }

    private applyVelocity(dt : number) {
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt
    }
}