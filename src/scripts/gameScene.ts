import { Scene } from "../index";
import { Game } from "./../index";
import { GameplayEvent, GameplayManager, GameplayState } from "./gameplayManager";
import { SnackEvent, SnackManager } from "./snackManager";
import { GameContext } from "../index";
import { Player } from "./player";
import { SceneContext } from "../index";
import * as PIXI from 'pixi.js'
import { UI } from "./ui";
import { KeyHandler } from "./keyboard";

export class MainScene implements Scene {
    get root () { return this._root }

    private _root : PIXI.Container
    private game : Game
    private player : Player
    private context : SceneContext
    private gameplayManager : GameplayManager
    private snackManager : SnackManager
    private resetInput : KeyHandler
    private inputHandlers : KeyHandler[]
    private ui: UI

    initialize(gameContext : GameContext, sceneRect : PIXI.Rectangle) {
        const app = gameContext.app
        this.game = gameContext.game
        this.context = {
            keyboard: gameContext.keyboard,
            sceneRect: sceneRect
        }

        this.gameplayManager = new GameplayManager()

        const root = this._root = new PIXI.Container()
        root.width = sceneRect.width
        root.height = sceneRect.height

        const player = this.player = new Player(this.context)
        root.addChild(player.display)
        player.x = sceneRect.width * 0.5
        player.y = sceneRect.height * 1

        this.snackManager = new SnackManager(sceneRect)
        root.addChild(this.snackManager.display)
        this.snackManager.eventEmitter.on(SnackEvent.SnackLost, () => this.gameplayManager.lives--)

        const screenRect = new PIXI.Rectangle(0,0, app.renderer.width, app.renderer.height)
        const ui = this.ui = new UI(screenRect, sceneRect, gameContext.style, this.gameplayManager)
        root.addChild(ui.display)

        this.gameplayManager.eventEmitter.once(GameplayEvent.GameOver, ()=>this.handleGameOver())

        const keyboard = gameContext.keyboard
        this.resetInput = keyboard.getHandler('R')
        this.inputHandlers = [keyboard.getHandler('A'), keyboard.getHandler('D')]

        ui.showStartScreen()
    }

    tick = (dt : number) => {
        switch (this.gameplayManager.state)
        {
            case (GameplayState.Playing):
                this.player.tick(dt)
                this.snackManager.tick(dt)

                const collectedAmount = this.snackManager.collectAtOverlapWith(this.player.aabb)
                if (collectedAmount > 0) {
                    this.gameplayManager.score += collectedAmount
                }

                this.handleResetInput()
                break
            case (GameplayState.Starting):
                this.player.tick(dt)
                if (this.inputHandlers.some(i => i.pressed)) {
                    this.gameplayManager.startGame()
                    this.ui.handleGameStart()
                }
                break
            case (GameplayState.GameOver):
                this.snackManager.tick(dt)
                this.handleResetInput()
                break
        }
    }

    private handleGameOver() {
        this.ui.handleGameOver()
        this.player.handleGameOver()
    }

    private handleResetInput() {
        if (this.resetInput.pressed) {
            this.game.boot(new MainScene())
        }
    }
}