import { Type } from './index'
import { MouseDefinition } from '../../fileFormats/cnv/types'
import { FederatedPointerEvent, Point } from 'pixi.js'
import { NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'

type MouseEvent = {
    type: string
    key: string
}

const keysMapping = new Map([
    [0, 'LEFT'],
    [1, 'MIDDLE'],
    [2, 'RIGHT'],
])

export class Mouse extends Type<MouseDefinition> {
    private mouseMoveListener: any
    private mouseClickListener: any
    private mouseReleaseListener: any

    private clicksQueue: MouseEvent[] = []
    private lastClicksTime: Record<string, number> = {}

    private mousePosition: Point = new Point(0, 0)
    private moved = false

    ready() {
        this.registerCallbacks()
        this.callbacks.run('ONINIT')
    }

    destroy() {
        this.unregisterCallbacks()
    }

    tick(elapsedMS: number) {
        while (this.clicksQueue.length > 0) {
            const event = this.clicksQueue.shift()!
            switch (event.type) {
                case 'click':
                    this.callbacks.run('ONCLICK', event.key)
                    break
                case 'dblclick':
                    this.callbacks.run('ONDBLCLICK', event.key)
                    break
                case 'release':
                    this.callbacks.run('ONRELEASE', event.key)
                    break
            }
        }

        if (this.moved) {
            this.callbacks.run('ONMOVE')
            this.moved = false
        }
    }

    @method()
    SET(cursorType: 'ACTIVE' | 'ARROW') {
        throw new NotImplementedError()
    }

    @method()
    ENABLE() {
        this.registerCallbacks()
        this.engine.app.stage.eventMode = 'static'
    }

    private registerCallbacks() {
        this.mouseMoveListener = this.onMouseMove.bind(this)
        this.mouseClickListener = this.onMouseClick.bind(this)
        this.mouseReleaseListener = this.onMouseRelease.bind(this)

        this.engine.app.stage.addListener('pointermove', this.mouseMoveListener)
        if (this.callbacks.has('ONCLICK') || this.callbacks.has('ONDBLCLICK')) {
            this.engine.app.stage.addListener('pointerdown', this.mouseClickListener)
        }
        if (this.callbacks.has('ONRELEASE')) {
            this.engine.app.stage.addListener('pointerup', this.mouseReleaseListener)
        }
    }

    @method()
    DISABLE() {
        this.unregisterCallbacks()
        this.engine.app.stage.eventMode = 'none'
    }

    private unregisterCallbacks() {
        this.engine.app.stage.removeListener('pointermove', this.mouseMoveListener)
        this.engine.app.stage.removeListener('pointerdown', this.mouseClickListener)
    }

    @method()
    SHOW() {
        this.engine.rendering.setCursor('auto')
    }

    @method()
    HIDE() {
        this.engine.rendering.setCursor('none')
    }

    @method()
    GETPOSX() {
        return this.mousePosition.x
    }

    @method()
    GETPOSY() {
        return this.mousePosition.y
    }

    private onMouseMove(event: FederatedPointerEvent) {
        this.moved = true
        this.mousePosition = this.getMousePosition(event)
    }

    private onMouseClick(event: FederatedPointerEvent) {
        this.handleClickEvent(event, 'click')
    }

    private onMouseRelease(event: FederatedPointerEvent) {
        this.handleClickEvent(event, 'release')
    }

    private handleClickEvent(event: FederatedPointerEvent, type: string) {
        if (!keysMapping.has(event.button)) {
            return
        }

        const key = keysMapping.get(event.button)!
        const clickEvent = { type, key }

        this.clicksQueue.push(clickEvent)
        if (type === 'click') {
            const dateNow = Date.now()
            const previousClick = this.lastClicksTime[key]
            if (previousClick && dateNow - previousClick < 200) {
                this.clicksQueue.push({
                    type: 'dblclick',
                    key,
                })
                delete this.lastClicksTime[key]
            } else {
                this.lastClicksTime[key] = dateNow
            }
        }

        this.onMouseMove(event)
    }

    private getMousePosition(event: FederatedPointerEvent) {
        return new Point(Math.floor(event.screen.x), Math.floor(event.screen.y))
    }
}
