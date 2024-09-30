import {ValueType} from './index'
import {Engine} from '../index'
import {ArrayDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../errors'

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
        this.value[position] += value
    }

    MODAT(position: number, value: number) {
        this.value[position] %= value
    }

    CLAMPAT(position: number, min: number, max: number) {
        this.value[position] = Math.min(Math.max(this.value[position], min), max)
    }

    MULAT(position: number, value: number) {
        this.value[position] *= value
    }

    CONTAINS(value: any) {
        return this.value.includes(value)
    }

    SUM() {
        throw new NotImplementedError()
    }

    SUBAT(position: number, value: number) {
        this.value[position] -= value
    }

    GET(position: number) {
        return this.value[position]
    }

    GETSIZE() {
        return this.value.length
    }

    CHANGEAT(position: number, value: any) {
        this.value[position] = value
    }

    REMOVEAT(position: number) {
        this.value.splice(position, 1)
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
