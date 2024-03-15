import {ValueType} from './index'
import {Engine} from '../index'
import {ArrayDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class ArrayObject extends ValueType<ArrayDefinition> {
    constructor(engine: Engine, definition: ArrayDefinition) {
        super(engine, definition, [])
    }

    ADD(...args: any[]) {
        this.value.push(...args)
    }

    ADDAT(position: number, value: number) {
        this.value.splice(position-1, 0, value)
    }

    MODAT(position: number, value: number) {
        this.value[position-1] %= value
    }

    CLAMPAT(position: number, min: number, max: number) {
        this.value[position-1] = Math.min(Math.max(this.value[position-1], min), max)
    }

    MULAT(position: number, value: number) {
        this.value[position-1] *= value
    }

    CONTAINS(value: any) {
        return this.value.includes(value)
    }

    SUM() {
        throw new NotImplementedError()
    }

    SUBAT(position: number, value: number) {
        this.value[position-1] -= value
    }

    GET(position: number) {
        return this.value[position-1]
    }

    GETSIZE() {
        return this.value.length
    }

    CHANGEAT(position: number, value: any) {
        this.value[position-1] = value
    }

    REMOVEAT(position: number) {
        this.value.splice(position-1, 1)
    }

    REMOVEALL() {
        this.value = []
    }

    FIND(value: any) {
        if (this.value.indexOf(value) === -1) {
            return -1
        }
        return this.value.indexOf(value) + 1
    }

    REVERSEFIND(value: any) {
        if (this.value.lastIndexOf(value) === -1) {
            return -1
        }
        return this.value.lastIndexOf(value) + 1
    }

    SAVEINI() {
        this.saveToINI()
    }

    LOADINI() {
        this.value = this.getFromINI()
    }

    MSGBOX() {
        alert(this.value)
    }

    valueChanged(oldValue: any, newValue: any) {
        this.saveToINI()
    }

    clone() {
        const cloned = new ArrayObject(this.engine, this.definition)
        cloned.value = [...this.value]
        return cloned
    }

    serialize(): string {
        return this.value.join(',')
    }

    deserialize(value: string) {
        return value.split(',')
    }
}
