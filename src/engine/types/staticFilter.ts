import { DisplayType, Type } from './index'
import { StaticFilterDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { Animo } from './animo'
import { method } from '../../types'

export class StaticFilter extends Type<StaticFilterDefinition> {
    private properties = new Map<string, any>()
    private linked: Type<any>[]

    constructor(engine: Engine, parent: Type<any> | null, definition: StaticFilterDefinition) {
        super(engine, parent, definition)
        this.linked = []
    }

    @method()
    SETPROPERTY(name: string, value: any) {
        this.properties.set(name, value)
    }

    @method()
    LINK(arg: any) {
        const object = this.engine.getObject(arg)
        this.linked.push(object)

        for (const linkedObject of this.linked) {
            if (!(linkedObject instanceof DisplayType)) {
                continue
            }

            const object = linkedObject.getRenderObject()
            if (object === null) {
                continue
            }

            if (this.definition.ACTION === 'ROTATE') {
                object.anchor.set(0.5, 0.5)

                if (linkedObject instanceof Animo) {
                    linkedObject.anchorOffsetX = object.width / 2
                    linkedObject.anchorOffsetY = object.height / 2
                }

                object.angle = this.properties.get('ANGLE')
            }
        }
    }

    @method()
    UNLINK(arg: any) {
        const object = this.engine.getObject(arg)
        this.linked = this.linked.filter((x) => x !== object)
    }
}
