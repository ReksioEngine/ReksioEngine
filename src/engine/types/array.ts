import {ValueType} from './index'
import {Engine} from '../index'
import {ArrayDefinition} from '../../fileFormats/cnv/types'
import {assert} from '../../errors'

export class ArrayObject extends ValueType<ArrayDefinition> {
    constructor(engine: Engine, definition: ArrayDefinition) {
        super(engine, definition, [])
        this.callbacks.register('ONINIT', this.definition.ONINIT)
    }

    ready() {
        this.callbacks.run('ONINIT')
    }

    ADD(...args: any[]) {
        this.value.push(...args)
    }

    ADDAT(position: number, value: number) {
        assert(position < this.value.length, `Tried to modify an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] += value
    }

    MODAT(position: number, value: number) {
        assert(position < this.value.length, `Tried to modify an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] %= value
    }

    CLAMPAT(position: number, min: number, max: number) {
        assert(position < this.value.length, `Tried to modify an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] = Math.min(Math.max(this.value[position], min), max)
    }

    MULAT(position: number, value: number) {
        assert(position < this.value.length, `Tried to modify an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] *= value
    }

    CONTAINS(value: any) {
        return this.value.includes(value)
    }

    SUM(arg: number) {
        this.value = this.value.map((value: number) => value + arg)
    }

    SUBAT(position: number, value: number) {
        assert(position < this.value.length, `Tried to modify an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] -= value
    }

    GET(position: number) {
        assert(position < this.value.length, `Tried to access an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        return this.value[position]
    }

    GETSIZE() {
        return this.value.length
    }

    CHANGEAT(position: number, value: any) {
        assert(position < this.value.length, `Tried to set an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value[position] = value
    }

    REMOVEAT(position: number) {
        assert(position < this.value.length, `Tried to remove an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value.splice(position, 1)
    }

    INSERTAT(position: number, value: any) {
        assert(position < this.value.length, `Tried to insert an element at an index (${position}) that is outside the bounds of the array (length ${this.value.length})`)
        this.value.splice(position, 0, value)
    }

    REMOVEALL() {
        this.value = []
    }

    FIND(value: any) {
        return this.value.indexOf(value)
    }

    REVERSEFIND(value: any) {
        return this.value.lastIndexOf(value)
    }

    SAVEINI() {
        this.saveToINI()
    }

    LOADINI() {
        this.value = this.getFromINI() ?? []
    }

    MSGBOX() {
    }

    clone() {
        const cloned = super.clone() as ArrayObject
        cloned.value = [...this.value]
        return cloned
    }

    serialize(): string {
        return this.value.join(',')
    }

    deserialize(value: string) {
        if (value === '') {
            return []
        }
        return value.split(',')
    }
}
