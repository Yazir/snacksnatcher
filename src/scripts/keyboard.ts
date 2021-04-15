export type KeyHandler = {
	key : string
	pressed : boolean
}

export class KeyboardInput {
	private keyHandlers : Record<string, KeyHandler> = {}

	constructor() {
		window.addEventListener("keydown", ev => this.downHandler(ev), false);
		window.addEventListener("keyup", ev => this.upHandler(ev), false);
	}

	getHandler = (key : string) : KeyHandler => {
		key = key.toLowerCase()
		this.createKeyHandlerIfUndefined(key)
		return this.keyHandlers[key]
	}

	private createKeyHandlerIfUndefined = (key : string) => {
		if (this.keyHandlers[key] == undefined) {
			this.keyHandlers[key] = {
				key: key,
				pressed: false
			}
		}
	}

	private downHandler(event:KeyboardEvent) {
		this.updatePressed(event.key, true)
	}

	private upHandler(event:KeyboardEvent) {
		this.updatePressed(event.key, false)
	}

	private updatePressed = (key : string, pressed : boolean) => {
		if (this.keyHandlers[key] != undefined) {
			this.keyHandlers[key].pressed = pressed
		}
	}
}