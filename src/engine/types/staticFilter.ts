import { DisplayType, ParentType, Type } from './index'
import { StaticFilterDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { Animo } from './animo'
import { method } from '../../common/types'
import { assert } from '../../common/errors'

export class StaticFilter extends Type<StaticFilterDefinition> {
    private properties = new Map<string, any>()
    private linked: Map<Type<any>, Map<string, any>> = new Map()

    constructor(engine: Engine, parent: ParentType<any> | null, definition: StaticFilterDefinition) {
        super(engine, parent, definition)
        this.linked = new Map<Type<any>, Map<string, any>>()
    }

    @method()
    SETPROPERTY(name: string, value: any) {
        this.properties.set(name, value)
    }

    @method()
    LINK(arg: any) {
        const object: DisplayType<any> | null = this.getObject(arg)
        assert(object !== null)

        const renderObject = object.getRenderObject()
        if (renderObject === null) {
            return
        }

        const savedProperties = new Map()
        if (this.definition.ACTION === 'ROTATE') {
            savedProperties.set('angle', renderObject.angle)
            savedProperties.set('anchor', renderObject.anchor)

            // Todo: Handle CANUNDO, CURRENTFRAME, CANUNDO parameters
            const angle = this.properties.get('ANGLE')
            if (angle !== undefined) {
                renderObject.anchor.set(0.5, 0.5)
                renderObject.angle = angle

                if (object instanceof Animo) {
                    object.syncPosition()
                }
            }
        }

        this.linked.set(object, savedProperties)
    }

    @method()
    UNLINK(arg: any) {
        const object: Animo | null = this.getObject(arg)
        assert(object !== null)

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
            object.syncPosition()
        }
    }
}
