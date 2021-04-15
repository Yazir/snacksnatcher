import './style.css'

import * as PIXI from 'pixi.js';
import { MainScene } from "./scripts/gameScene";
import { KeyboardInput } from "./scripts/keyboard";


export interface Scene {
    root : PIXI.Container
    initialize (context : GameContext, sceneRect : PIXI.Rectangle) : void
    tick (deltatime : number): void
}

export type Style = {
    colorBackground : number
    colorPrimary : number
    colorDetail : number
    borderWidth : number
    padding : number
}

export type GameContext = {
    game : Game
    app : PIXI.Application
    keyboard : KeyboardInput
    style : Style
}

export type SceneContext = {
    keyboard: KeyboardInput
    sceneRect: PIXI.Rectangle
}

export class Game {
    private readonly context : GameContext

    private scene : Scene
    private isSceneBooted : boolean = false

    constructor() {
        const app = new PIXI.Application()
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
        const scale = 45
        app.renderer.resize(9*scale, 9*scale)

        document.body.appendChild(app.view)

        this.context = {
            game: this,
            app: app,
            keyboard: new KeyboardInput(),
            style: {
                colorBackground: 0x788374,
                colorPrimary: 0x372a39,
                colorDetail: 0xf5e9bf,
                borderWidth: 4,
                padding: 16
            }
        }

        app.renderer.backgroundColor = this.context.style.colorBackground

        this.load(() => this.boot(new MainScene()))
        app.ticker.add(dt => this.tick(dt))
    }

    boot = async (scene : Scene) => {
        if (this.isSceneBooted) {
            this.destroyCurrentScene()
        }

        const app = this.context.app
        const gameSceneRect = new PIXI.Rectangle( 0, 0,
            app.renderer.width, app.renderer.height*0.85 )
        
        scene.initialize(this.context, gameSceneRect)
        scene.root.x = gameSceneRect.x
        app.stage.addChild(scene.root)
        this.scene = scene
        this.isSceneBooted = true
    }

    private tick = (dt : number) => {
        if (this.isSceneBooted) {
            this.scene.tick(dt)
        }
    }

    private load = async (finish : Function) => {
        const app = this.context.app
        app.loader.add('assets/spritesheet.json')

        await this.preloadFonts('The Impostor')
        app.loader.load(() => finish())
    }

    private destroyCurrentScene() {
        this.scene.root.destroy()
        this.scene = undefined
        this.isSceneBooted = false
    }

    private preloadFonts = async (...fonts : string[]) => {
        // Should be replaced with more verbose loading scheme
        // (eg. b64 font encoding or experimental document.fonts)
        fonts.forEach(async family => {
            const text = new PIXI.Text('abc', {fontFamily: family})
            text.y = -999
            this.context.app.stage.addChild(text)
            await new Promise(ok => setTimeout(ok, 100))
            text.destroy()
        })
    }
}

const game = new Game()