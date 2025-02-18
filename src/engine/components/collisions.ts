import { Engine } from '../index'
import { DisplayType } from '../types'
import { Animo } from '../types/animo'

const testAABB = (a: DisplayType<any>, b: DisplayType<any>) => {
    const renderA = a.getRenderObject()
    const renderB = b.getRenderObject()
    if (renderA === null || renderB === null) {
        return false
    }

    const boundsA = renderA.getBounds()
    const boundsB = renderB.getBounds()

    return (
        boundsA.x < boundsB.x + boundsB.width &&
        boundsA.x + boundsA.width > boundsB.x &&
        boundsA.y < boundsB.y + boundsB.height &&
        boundsA.y + boundsA.height > boundsB.y
    )
}

export type CollisionCallback = (object: Animo) => void

export class CollisionsComponent {
    private readonly engine: Engine
    private readonly object: Animo
    public enabled: boolean = false

    private collisionTestedThisTick = false

    constructor(engine: Engine, object: Animo) {
        this.engine = engine
        this.object = object
        this.enabled = object.definition.MONITORCOLLISION ?? false
    }

    tick() {
        this.collisionTestedThisTick = false
    }

    handle(callback: CollisionCallback) {
        if (!this.enabled || this.collisionTestedThisTick) {
            return
        }

        this.collisionTestedThisTick = true
        for (const object of this.findCollisions()) {
            callback(object)
        }
    }

    findCollisions() {
        return this.engine.rendering.displayObjectsInDefinitionOrder
            .filter((obj) => obj !== this.object && obj.definition.TYPE == 'ANIMO')
            .filter((obj) => this.hasCollisionWith(obj as Animo))
            .map((obj) => obj as Animo)
    }

    hasCollisionWith(other: Animo): boolean {
        return this.enabled && other.collisions.enabled && testAABB(this.object, other)
    }
}
