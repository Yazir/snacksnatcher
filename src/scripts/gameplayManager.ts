import { UI } from "./ui";
import { EventEmitter } from "./eventEmitter";

export enum GameplayEvent {
    ScoreChange = 'sc',
    LivesChange = 'lc',
    GameOver = 'go'
}

export enum GameplayState {
    Starting,
    Playing,
    GameOver
}

export class GameplayManager {
    get score () { return this._score }
    set score (value) {
        const old = this._score
        this._score = value
        this.eventEmitter.emit(GameplayEvent.ScoreChange, old, value)
    }
    get lives () { return this._lives }
    set lives (value) {
        const old = this._lives
        this._lives = value
        this.eventEmitter.emit(GameplayEvent.LivesChange, old, value)
    }
    get state () { return this._state }

    readonly eventEmitter : EventEmitter

    private _score : number = 0
    private _lives : number = 10
    private _state : GameplayState = GameplayState.Starting

    constructor() {
        this.eventEmitter = new EventEmitter()
        this.eventEmitter.on(GameplayEvent.LivesChange, ()=>this.CheckIfGameOver())
    }

    startGame() {
        this._state = GameplayState.Playing
    }

    private CheckIfGameOver() {
        if (this._lives <= 0) {
            this.gameOver()
        }
    }

    private gameOver() {
        if (this._state != GameplayState.GameOver) {
            this.eventEmitter.emit(GameplayEvent.GameOver)
            this._state = GameplayState.GameOver
        }
    }
}