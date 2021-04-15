export class Vector2 {
    x : number
    y : number

    constructor(x : number = 0, y : number = 0) {
        this.x = x
        this.y = y
    }

    clone() {
        return new Vector2(this.x, this.y)
    }

    add(other : Vector2) {
        this.x += other.x
        this.y += other.y
        return this
    }

    sub(other : Vector2) {
        this.x -= other.x
        this.y -= other.y
        return this
    }

    mul(scalar : number) {
        this.x *= scalar
        this.y *= scalar
        return this
    }

    normalize() {
        const length = this.length()
        if (length > 0) {
            this.x /= length
            this.y /= length
            return this
        }
        
        return this
    }

    distanceTo(other : Vector2) {
        return other.clone().sub(this).length()
    }

    angleTo(other : Vector2) {
        const {x : x1, y: y1} = this
        const {x : x2, y: y2} = other
        return Math.acos(x1*x2 + y1*y2) / this.length() * other.length()
    }

    dot(other : Vector2) {
        return this.length() * other.length() * Math.cos(this.angleTo(other))
    }

    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    toArray() {
        return [this.x, this.y]
    }
}