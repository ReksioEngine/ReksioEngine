import {Type} from './index'
import {Engine} from '../index'
import {GroupDefinition} from '../../fileFormats/cnv/types'

export class Group extends Type<GroupDefinition> {
    constructor(engine: Engine, definition: GroupDefinition) {
        super(engine, definition)
        this.value = []
    }

    ADD(...objects: string[]) {
        this.value.push(...objects)
    }

    __unknown_method(methodName: string, args: any[]) {
        for (const objectName of this.value) {
            const object = this.engine.getObject(objectName)
            object[methodName](...args)
        }
    }
}
