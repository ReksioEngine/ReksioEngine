import { Type, ValueType } from './index'
import { Engine } from '../index'
import { ArrayDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { method, valueAsString } from '../../common/types'

const generateMessage = (action: string, position: number, value: any[]) => {
    return `Tried to ${action} an element at an index (${position}) that is outside the bounds of the array (length ${value.length})`
}

export class ArrayObject extends ValueType<ArrayDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: ArrayDefinition) {
        super(engine, parent, definition, [], false)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    ADD(...args: any[]) {
        this.value.push(...args)
    }

    @method()
    ADDAT(position: number, value: number) {
        assert(position < this.value.length, generateMessage('modify', position, this.value))
        this.value[position] += value
    }

    @method()
    MODAT(position: number, value: number) {
        assert(position < this.value.length, generateMessage('modify', position, this.value))
        this.value[position] %= value
    }

    @method()
    CLAMPAT(position: number, min: number, max: number) {
        assert(position < this.value.length, generateMessage('modify', position, this.value))
        this.value[position] = Math.min(Math.max(this.value[position], min), max)
    }

    @method()
    MULAT(position: number, value: number) {
        assert(position < this.value.length, generateMessage('modify', position, this.value))
        this.value[position] *= value
    }

    @method()
    CONTAINS(value: any) {
        return this.value.includes(value) || this.value.includes(valueAsString(value))
    }

    @method()
    SUM(arg: number) {
        this.value = this.value.map((value: number) => value + arg)
    }

    @method()
    SUBAT(position: number, value: number) {
        assert(position < this.value.length, generateMessage('modify', position, this.value))
        this.value[position] -= value
    }

    @method()
    GET(position: number) {
        assert(position < this.value.length, generateMessage('access', position, this.value))
        return this.value[position]
    }

    @method()
    GETSIZE() {
        return this.value.length
    }

    @method()
    CHANGEAT(position: number, value: any) {
        assert(position < this.value.length, generateMessage('set', position, this.value))
        this.value[position] = value
    }

    @method()
    REMOVEAT(position: number) {
        assert(position < this.value.length, generateMessage('remove', position, this.value))
        this.value.splice(position, 1)
    }

    @method()
    INSERTAT(position: number, value: any) {
        assert(position < this.value.length, generateMessage('insert', position, this.value))
        this.value.splice(position, 0, value)
    }

    @method()
    REMOVEALL() {
        this.value = []
    }

    @method()
    FIND(value: any) {
        let position = this.value.indexOf(value)
        if (position == -1) {
            position = this.value.indexOf(valueAsString(value))
        }
        return position
    }

    @method()
    REVERSEFIND(value: any) {
        let position = this.value.lastIndexOf(value)
        if (position == -1) {
            position = this.value.lastIndexOf(valueAsString(value))
        }
        return position
    }

    @method()
    async LOAD(path: string) {
        assert(this.engine.currentScene !== null)
        // TODO: Fix problem with it being async
        this.value = await this.engine.fileLoader.getARRFile(this.engine.currentScene.getRelativePath(path))
    }

    @method()
    SAVEINI() {
        this.saveToINI()
    }

    @method()
    LOADINI() {
        this.value = this.getFromINI() ?? []
    }

    @method()
    MSGBOX() {}

    async clone() {
        const cloned = await super.clone() as ArrayObject
        cloned.value = [...this.value]
        return cloned
    }

    protected serialize(): string {
        return this.value.join(',')
    }

    protected deserialize(value: string) {
        if (value === '') {
            return []
        }
        return value.split(',')
    }
}
