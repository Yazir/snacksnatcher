import * as PIXI from 'pixi.js'
import { GameplayManager, GameplayEvent } from "./gameplayManager";
import { Style } from '..'
import { getFrame } from './spritesheetUtil';

export class UI {
    readonly display : PIXI.Container

    private gameSceneRect : PIXI.Rectangle
    private screenRect : PIXI.Rectangle
    private style : Style
    private scoreText : PIXI.Text
    private livesText : PIXI.Text
    private livesIcon : PIXI.Sprite
    private graphics : PIXI.Graphics
    private gameplayManager : GameplayManager
    private startScreenContainers : PIXI.Container[]

    constructor(screenRect : PIXI.Rectangle, gameSceneRect : PIXI.Rectangle, 
        style : Style, gameplayManager : GameplayManager
    ) {
        this.gameSceneRect = gameSceneRect
        this.screenRect = screenRect
        this.style = style
        this.gameplayManager = gameplayManager

        this.display = new PIXI.Container()
        this.graphics = new PIXI.Graphics()
        this.display.addChild(this.graphics)

        this.drawLayout()
        this.addCredits()
    }

    showStartScreen() {
        const text = this.getNewText('SNACK SNATCHER', 24, -1, {align: 'center'})
        text.anchor.x = 0.5
        text.x = this.screenRect.width / 2
        text.y = this.gameSceneRect.height / 2

        const inputs = this.getNewText('A        D', 16)
        inputs.anchor.x = 0.5
        inputs.anchor.y = 1
        inputs.x = this.gameSceneRect.width / 2
        inputs.y = this.gameSceneRect.bottom - 32

        this.startScreenContainers = [text, inputs]
        this.display.addChild(...this.startScreenContainers)
    }

    handleGameStart() {
        this.startScreenContainers.forEach(c => c.destroy())

        this.addScoreText()
        const gameplayManager = this.gameplayManager
        gameplayManager.eventEmitter.on(
            GameplayEvent.ScoreChange, (_, cur) => this.updateScoreText(cur.toString())
        )
        this.updateScoreText(gameplayManager.score.toString())
 
        this.addLivesDisplay()
        gameplayManager.eventEmitter.on(
            GameplayEvent.LivesChange, (_, cur) => this.updateLivesText(cur.toString())
        )
        this.updateLivesText(gameplayManager.lives.toString())
    }

    handleGameOver() {
        this.livesText.visible = false
        this.scoreText.visible = false
        this.livesIcon.visible = false


        const text = this.getNewText('GAME OVER', 32)
        text.x = this.screenRect.width / 2
        text.y = this.screenRect.height * 0.4
        text.anchor.x = 0.5
        text.anchor.y = 1

        const subText = this.getNewText(`your score: ${this.scoreText.text}`, 16)
        subText.x = this.screenRect.width / 2
        subText.y = text.y + 8
        subText.anchor.x = 0.5

        const pressKey = this.getNewText(`press R to play again`, 16)
        pressKey.x = this.screenRect.width / 2
        pressKey.y = subText.y + subText.height + 32
        pressKey.anchor.x = 0.5

        this.graphics.beginFill(this.style.colorPrimary)
        const top = text.y - text.height - 8
        const height = pressKey.y + pressKey.height + 8 - top
        this.graphics.drawRect(0, top, this.screenRect.width, height)

        this.display.addChild(text, subText, pressKey)
    }

    private updateScoreText(value : string) {
        this.scoreText.text = value
    }

    private updateLivesText(value : string) {
        this.livesText.text = value
    }

    private addScoreText() {
        const text = this.scoreText = this.getNewText('12', 16)
        text.anchor.x = 0.5
        text.anchor.y = 1
        text.x = this.gameSceneRect.width / 2
        text.y = this.screenRect.bottom - this.style.padding + 6
        
        this.display.addChild(text)
    }

    private addLivesDisplay() {
        const tex = getFrame('ui/lives')
        const sprite = this.livesIcon = PIXI.Sprite.from(tex)
        sprite.anchor.x = 0
        sprite.anchor.y = 1
        sprite.scale.x = 2
        sprite.scale.y = 2
        sprite.x = this.style.padding //Math.floor(this.screenRect.width / 2)
        sprite.y = this.screenRect.height - this.style.padding //Math.floor(this.screenRect.height / 2)
        this.display.addChild(sprite)

        const text = this.livesText = this.getNewText('12', 8)
        text.x = sprite.x + sprite.width + 8
        text.y = sprite.y
        text.anchor.x = 0
        text.anchor.y = 1
        this.display.addChild(text)
    }

    private drawLayout() {
        const gameRect = this.gameSceneRect
        const scrnRect = this.screenRect
        const gfx = this.graphics
        const style = this.style
        const drawRect = new PIXI.Rectangle(
            gameRect.left, gameRect.bottom,
            gameRect.width, scrnRect.bottom - gameRect.bottom
        )

        gfx.beginFill(style.colorPrimary)
        gfx.drawRect(drawRect.x, drawRect.y, drawRect.width, drawRect.height)
        gfx.beginFill(style.colorDetail)
        gfx.drawRect(drawRect.x, drawRect.y, drawRect.width, style.borderWidth)
    }

    private addCredits() {
        const credits = this.getNewText(`@piotrkoniecko`, 8)
        credits.anchor.x = 0
        credits.anchor.y = 0
        credits.x = this.screenRect.right - credits.width - 2
        credits.y = 2
        this.display.addChild(credits)
    }

    private getNewText(text : string, size : number, color : number = -1, opts : Partial<PIXI.ITextStyle> = {}) 
    {
        if (color == -1) color = this.style.colorDetail
        return new PIXI.Text(text, {
            fill: color,
            fontSize: size,
            fontFamily: 'The Impostor',
            ...opts
        })
    }
}