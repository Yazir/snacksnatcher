import { Vector2 } from "./geometry";

export const pointInRange = (point : Vector2, point2 : Vector2, range : number) : boolean => {
    return point.distanceTo(point2) <= range
}

// export const moveAndCollide()