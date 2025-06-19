import { Type } from './index'
import { StaticFilterDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { Animo } from './animo'
import { method } from '../../common/types'

export class StaticFilter extends Type<StaticFilterDefinition> {
    private properties = new Map<string, any>()
    private linked: Map<Type<any>, Map<string, any>> = new Map()

    constructor(engine: Engine, parent: Type<any> | null, definition: StaticFilterDefinition) {
        super(engine, parent, definition)
        this.linked = new Map<Type<any>, Map<string, any>>()
    }

    @method()
    SETPROPERTY(name: string, value: any) {
        this.properties.set(name, value)
    }

    @method()
    LINK(arg: any) {
        const object = this.engine.getObject(arg)

        const renderObject = object.getRenderObject()
        if (renderObject === null) {
            return
        }

        const newProperties = new Map()
        if (this.definition.ACTION === 'ROTATE') {
            newProperties.set('angle', renderObject.angle)
            newProperties.set('anchor', renderObject.anchor)

            renderObject.anchor.set(0.5, 0.5)
            renderObject.angle = this.properties.get('ANGLE')

            if (object instanceof Animo) {
                object.syncPosition()
            }
        }

        this.linked.set(object, newProperties)
    }

    @method()
    UNLINK(arg: any) {
        const object = this.engine.getObject(arg)
        const properties = this.linked.get(object)
        if (!properties) {
            return
        }

        this.linked.delete(object)

        const renderObject = object.getRenderObject()
        if (renderObject === null) {
            return
        }

        if (properties.has('angle')) {
            renderObject.angle = properties.get('angle')
        }
        if (properties.has('anchor')) {
            renderObject.anchor = properties.get('anchor')
            object.rotationAnchorOffsetX = 0
            object.rotationAnchorOffsetY = 0
        }
    }
}
