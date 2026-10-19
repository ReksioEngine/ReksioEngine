import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { StringDefinition } from '../../fileFormats/cnv/types'
import { method, int } from '../../common/types'

export class String extends ValueType<StringDefinition, string> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: StringDefinition) {
        super(engine, parent, definition, '')
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    async ADD(text: string) {
        await this.setValue(this.value + text)
    }

    @method()
    async SET(text: string) {
        await this.setValue(text)
    }

    @method()
    async SUB(start: int, length: int) {
        await this.setValue(this.value.substring(0, start) + this.value.substring(start + length))
    }

    @method()
    GET(index?: int, length: int = 1): string {
        if (index === undefined) {
            return this.value
        }
        return this.value.substring(index, index + length)
    }

    @method()
    FIND(needle: string, start?: int): int {
        return this.value.indexOf(needle, start)
    }

    @method()
    LENGTH(): int {
        return this.value.length
    }

    getValue(): string {
        return this.value
    }

    protected async valueChanged(oldValue: any, newValue: any) {
        if (oldValue !== newValue) {
            await this.callbacks.run('ONCHANGED', newValue)
        }
        await this.callbacks.run('ONBRUTALCHANGED', newValue)
    }

    async equals(other: ValueType<any, any>) {
        const otherString = await other.toString()
        return this.getValue().toLowerCase() === otherString.toLowerCase()
    }

    public async toString(): Promise<string> {
        return this.getValue()
    }
}
