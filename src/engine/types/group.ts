import {Type} from './index'
import {Engine} from '../index'
import {GroupDefinition} from '../../fileFormats/cnv/types'

export class Group extends Type<GroupDefinition> {
    private readonly objects: any[]

    constructor(engine: Engine, definition: GroupDefinition) {
        super(engine, definition)
        this.objects = []
    }

    ADD(...objectsNames: string[]) {
        this.objects.push(
            ...objectsNames.map(objectName => {
                return this.engine.getObject(objectName)
            }).filter((x, index) => {
                if (x == null) {
                    // It happens in original game scripts
                    console.warn(`Script was trying to add non-existing object "${objectsNames[index]}" to a group "${this.name}"`)
                }
                return x !== null
            })
        )
    }

    __call(methodName: string, args: any[]) {
        for (const object of this.objects) {
            object[methodName](...args)
        }
    }
}
