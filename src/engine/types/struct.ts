import { ParentType, Type, ValueType } from './index'
import { StructDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'
import { Engine } from '../index'
import { assert } from '../../common/errors'
import { createObject } from '../../filesystem/definitionLoader'

const FIELD_PATTERN = /(?<name>\w+)<(?<type>\w+)>/g

export class Struct extends Type<StructDefinition> {
    public structure: Map<string, string> = new Map()
    private content: Map<string, ValueType<any, any>> = new Map()

    constructor(engine: Engine, parent: ParentType<any> | null, definition: StructDefinition) {
        super(engine, parent, definition)
        this.structure = this.parseFieldsString(this.definition.FIELDS)
    }

    async init() {
        await this.initializeContent()
    }

    private async initializeContent() {
        for (const key of this.structure.keys()) {
            const type = this.structure.get(key)!
            const field: Type<any> = await createObject(
                this.engine,
                {
                    TYPE: type,
                    NAME: key,
                },
                this.parent
            )
            assert(field instanceof ValueType, 'struct field has to be of value type')
            this.content.set(key, field)
        }
    }

    @method()
    GETFIELD(name: string) {
        assert(this.content !== null)
        return this.content.get(name)
    }

    @method()
    async SETFIELD(name: string, value: any) {
        const fieldObject = this.GETFIELD(name)
        if (fieldObject !== undefined) {
            await fieldObject.setValue(value)
        }
    }

    @method()
    async SET(otherObjectName: string) {
        const otherObject: Struct | null = this.getObject(otherObjectName)
        assert(otherObject !== null, 'object does not exist')

        for (const key of otherObject.structure.keys()) {
            const otherField = otherObject.GETFIELD(key)
            if (otherField) {
                await this.SETFIELD(key, otherField.getValue())
            }
        }
    }

    private parseFieldsString(definition: string) {
        const matches = [...definition.matchAll(FIELD_PATTERN)]
        return new Map(matches.map((m) => [m.groups!.name, m.groups!.type]))
    }

    async clone(): Promise<Struct> {
        const clone = await super.clone() as Struct
        clone.structure = this.structure
        await clone.initializeContent()
        return clone
    }
}
