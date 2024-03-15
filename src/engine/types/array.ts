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
        this.ONCHANGED()
    }

    ADDAT(position: number, value: number) {
        this.value.splice(position-1, 0, value)
        this.ONCHANGED()
    }

    MODAT(position: number, value: number) {
        this.value[position-1] %= value
        this.ONCHANGED()
    }

    CLAMPAT(position: number, min: number, max: number) {
        this.value[position-1] = Math.min(Math.max(this.value[position-1], min), max)
        this.ONCHANGED()
    }

    MULAT(position: number, value: number) {
        this.value[position-1] *= value
        this.ONCHANGED()
    }

    CONTAINS(value: any) {
        return this.value.includes(value)
    }

    SUM() {
        throw new NotImplementedError()
    }

    SUBAT(position: number, value: number) {
        this.value[position-1] -= value
        this.ONCHANGED()
    }

    GET(position: number) {
        return this.value[position-1]
    }

    GETSIZE() {
        return this.value.length
    }

    CHANGEAT(position: number, value: any) {
        this.value[position-1] = value
        this.ONCHANGED()
    }

    REMOVEAT(position: number) {
        this.value.splice(position-1, 1)
        this.ONCHANGED()
    }

    REMOVEALL() {
        this.value = []
        this.ONCHANGED()
    }

    FIND(value: any) {
        return this.value.indexOf(value) + 1
    }

    REVERSEFIND(value: any) {
        return this.value.lastIndexOf(value) + 1
    }

    SAVEINI() {
        this.saveToINI()
    }

    LOADINI() {
        this.loadFromINI()
    }

    MSGBOX() {
        alert(this.value)
    }

    private ONCHANGED() {
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
