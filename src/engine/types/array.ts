import {Type} from './index'
import {Engine} from '../index'
import {ArrayDefinition} from '../../fileFormats/cnv/types'
import {NotImplementedError} from '../../utils'

export class Array extends Type<ArrayDefinition> {
    constructor(engine: Engine, definition: ArrayDefinition) {
        super(engine, definition)
        this.value = []
    }

    init() {
        this.loadFromINI()
        this.saveToINI()
    }

    ADD(...args: any[]) {
        this.value.push(...args)
        this.ONCHANGED()
    }

    ADDAT(position: number, value: number) {
        this.value.splice(position, 0, value)
        this.ONCHANGED()
    }

    MODAT(position: number, value: number) {
        this.value[position] %= value
        this.ONCHANGED()
    }

    CLAMPAT(position: number, min: number, max: number) {
        this.value[position] = Math.min(Math.max(this.value[position], min), max)
        this.ONCHANGED()
    }

    MULAT(position: number, value: number) {
        this.value[position] *= value
        this.ONCHANGED()
    }

    CONTAINS(value: any) {
        return this.value.includes(value)
    }

    SUM() {
        throw new NotImplementedError()
    }

    SUBAT(position: number, value: number) {
        this.value[position] -= value
        this.ONCHANGED()
    }

    GET(position: number) {
        return this.value[position]
    }

    GETSIZE() {
        return this.value.length
    }

    CHANGEAT(position: number, value: any) {
        this.value[position] = value
        this.ONCHANGED()
    }

    REMOVEAT(position: number) {
        this.value.splice(position, 1)
        this.ONCHANGED()
    }

    REMOVEALL() {
        this.value = []
        this.ONCHANGED()
    }

    FIND(value: any) {
        return this.value.indexOf(value)
    }

    REVERSEFIND(value: any) {
        return this.value.lastIndexOf(value)
    }

    SAVEINI() {
        throw new NotImplementedError()
    }

    LOADINI() {
        throw new NotImplementedError()
    }

    MSGBOX() {
        throw new NotImplementedError()
    }

    private ONCHANGED() {
        this.saveToINI()
    }
}
