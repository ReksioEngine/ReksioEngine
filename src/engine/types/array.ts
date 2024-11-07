import {ValueType} from './index'
import {Engine} from '../index'
import {ArrayDefinition} from '../../fileFormats/cnv/types'
import {assert} from '../../errors'
import {method} from '../../types'

const generateMessage = (action: string, position: number, value: any[]) => {
    return `Tried to ${action} an element at an index (${position}) that is outside the bounds of the array (length ${value.length})`
}

export class ArrayObject extends ValueType<ArrayDefinition> {
    constructor(engine: Engine, definition: ArrayDefinition) {
        super(engine, definition, [])
    }

    ready() {
        this.callbacks.run('ONINIT')
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
        return this.value.includes(value)
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
        return this.value.indexOf(value)
    }

    @method()
    REVERSEFIND(value: any) {
        return this.value.lastIndexOf(value)
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
    MSGBOX() {
    }

    clone() {
        const cloned = super.clone() as ArrayObject
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
