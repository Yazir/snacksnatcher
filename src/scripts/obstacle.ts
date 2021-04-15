import { Container } from "@pixi/display"
import { Graphics } from "@pixi/graphics"
import { AABB } from "./physics"

export class Obstacle {
    readonly display : Container 

    constructor (box : AABB) {
        const display = this.display = new Graphics()
        const rect = box.buildRect()
        display.beginFill(0xF0F0F0)
        display.drawRect(rect.x, rect.y, rect.width, rect.height)
    }
}