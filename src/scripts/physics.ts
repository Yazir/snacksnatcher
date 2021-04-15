import { Rectangle } from "@pixi/math"
import { Vector2 } from "./geometry"

export class AABB {
    static from (rect : Rectangle) {
        const halfSize = new Vector2(rect.width/2, rect.height/2)
        return new AABB(
            new Vector2(rect.x + halfSize.x, rect.y + halfSize.y),
            halfSize
        )
    }

    center : Vector2
    halfSize : Vector2

    constructor(center : Vector2, halfSize : Vector2) {
        this.center = center
        this.halfSize = halfSize
    }

    overlaps(other : AABB) {
        if ( Math.abs(this.center.x - other.center.x) > this.halfSize.x + other.halfSize.x ) return false
        if ( Math.abs(this.center.y - other.center.y) > this.halfSize.y + other.halfSize.y ) return false
        return true
    }

    buildRect() {
        return new Rectangle(
            this.center.x - this.halfSize.x,
            this.center.y - this.halfSize.y,
            this.halfSize.x * 2,
            this.halfSize.y * 2
        )
    }

    copyFrom(other : AABB) {
        this.center = other.center
        this.halfSize = other.halfSize
    }
}