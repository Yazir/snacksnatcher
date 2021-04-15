import { getFrames } from "./spritesheetUtil"
import { SceneContext } from "../index"
import { AABB } from "./physics"
import { AnimatedSprite } from "@pixi/sprite-animated"
import { Container } from "@pixi/display"
import { KeyHandler } from "./keyboard"
import { Vector2 } from './geometry'
import { Texture } from "@pixi/core"
import * as PIXI from 'pixi.js'

const PLAYER_SPEED = 580

type AnimationMeta = {
    frames : Texture[]
    speed : number
}

export class Player  {
    set x (value) { this._position.x = value }
    get x () { return this._position.x }
    set y (value) { this._position.y = value }
    get y () { return this._position.y }

    readonly aabb : AABB
    readonly aabbOffset : Vector2
    readonly display : Container
    private readonly sprite : AnimatedSprite
    private readonly sceneRect : PIXI.Rectangle
    
    private _position : Vector2 = new Vector2()
    private inputA : KeyHandler
    private inputD : KeyHandler

    private animations : Record<string, AnimationMeta>
    private currentAnimation : string

    constructor(context : SceneContext) {
        this.sceneRect = context.sceneRect
        this.aabb = new AABB(new Vector2(), new Vector2(30, 32))
        this.aabbOffset = new Vector2(0, -20)
        
        const animations = this.animations = {
            'idle': {frames: getFrames('player/idle-', 2), speed: 1/60/ 1},
            'walk': {frames: getFrames('player/walk-', 6), speed: 1/60/ 0.055},
            'face-side': {frames: getFrames('player/face-side-', 1), speed: 0}
        }

        const display = this.display = new Container()
        
        const sprite = this.sprite = new AnimatedSprite(animations.idle.frames, true)
        display.addChild(sprite)
        sprite.anchor.x = 0.5
        sprite.anchor.y = 1

        const keyboard = context.keyboard
        this.inputA = keyboard.getHandler('a')
        this.inputD = keyboard.getHandler('d')
    }

    tick = (dt : number) => {
        this.updateMovement(dt)
        this.updateAnimations()
        this.updatePositions()
    }

    handleGameOver() {
        this.playAnimation('idle')
    }

    private updateMovement = (dt : number) => {
        const inputForce = this.getInput().normalize().mul(PLAYER_SPEED * dt / 100)

        const rect = this.sceneRect
        this.x = Math.min(Math.max(16, this.x + inputForce.x), rect.width - 16)
        this.y += inputForce.y
    }

    private updateAnimations() {
        const input = this.getInput()
        if (input.length() > 0) {
            this.playAnimation('walk')
            if (input.x > 0) { this.sprite.scale.x = Math.abs(this.sprite.scale.x) }
            else if (input.x < 0) { this.sprite.scale.x = - Math.abs(this.sprite.scale.x) }
        } else {
            this.playAnimation('idle')
        }
    }

    private updatePositions() {
        this.display.x = Math.round(this.x)
        this.display.y = Math.round(this.y)
        this.aabb.center.x = Math.round(this.x + this.aabbOffset.x)
        this.aabb.center.y = Math.round(this.y + this.aabbOffset.y)
    }

    private playAnimation(key : string) {
        if (key == this.currentAnimation) {
            return
        }
        const meta = this.animations[key]
        this.currentAnimation = key
        this.sprite.textures = meta.frames
        this.sprite.animationSpeed = meta.speed
        this.sprite.loop = true
        this.sprite.play()
    }

    private getInput = () => {
        const input = new Vector2()
        if (this.inputA.pressed) input.x -= 1
        if (this.inputD.pressed) input.x += 1

        return input
    }
}