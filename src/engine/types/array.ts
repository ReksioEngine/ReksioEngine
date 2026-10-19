import { ParentType, ValueType } from './index'
import { Engine } from '../index'
import { ArrayDefinition } from '../../fileFormats/cnv/types'
import { assert } from '../../common/errors'
import { method, valueAsDouble, valueAsString, int, double } from '../../common/types'
import { FileNotFoundError } from '../../filesystem/fileLoader'
import { ArrayEntry, ArrayEntryType, serializeArray } from '../../fileFormats/archive/array'
import { logger } from '../logging'
import {
    applyArithmetic,
    copyValue,
    createBool,
    createDouble,
    createInteger,
    createString,
    rawValue,
    ScalarValue,
    Value,
} from './values'
import { Integer } from './integer'
import { Double } from './double'
import { String as CMCString } from './string'
import { Bool } from './bool'
import type { ExprOp } from '../../interpreter'

const toEntry = (element: ScalarValue | null): ArrayEntry => {
    if (element instanceof Integer) {
        return { type: ArrayEntryType.INTEGER, value: element.getValue() }
    }
    if (element instanceof Double) {
        return { type: ArrayEntryType.FLOAT, value: element.getValue() }
    }
    if (element instanceof CMCString) {
        return { type: ArrayEntryType.STRING, value: element.getValue() }
    }
    if (element instanceof Bool) {
        return { type: ArrayEntryType.BOOLEAN, value: element.getValue() }
    }
    throw new TypeError('Cannot save a NULL element of an array')
}

const generateMessage = (action: string, position: number, value: any[]) => {
    return `Tried to ${action} an element at an index (${position}) that is outside the bounds of the array (length ${value.length})`
}

export class ArrayObject extends ValueType<ArrayDefinition, (ScalarValue | null)[]> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: ArrayDefinition) {
        super(engine, parent, definition, [], false)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    async ADD(...args: Value[]) {
        for (const arg of args) {
            this.push(await copyValue(this.engine, arg))
        }
    }

    push(...values: (ScalarValue | null)[]) {
        this.value.push(...values)
    }

    private checkedPosition(action: string, index: number) {
        assert(index < this.value.length, generateMessage(action, index, this.value))
        return index
    }

    private async modifyAt(position: number, op: ExprOp, value: number) {
        const index = this.checkedPosition('modify', position)
        this.value[index] = await this.calculate(this.value[index], op, value)
    }

    private calculate(element: ScalarValue | null, op: ExprOp, value: number) {
        const left = element ?? createDouble(this.engine, 0)
        return applyArithmetic(this.engine, left, op, this.asElementType(left, value))
    }

    private asElementType(element: ScalarValue | null, value: number) {
        return element instanceof Integer
            ? createInteger(this.engine, Math.trunc(value))
            : createDouble(this.engine, value)
    }

    @method()
    async ADDAT(position: int, value: double) {
        await this.modifyAt(position, 'ADD', value)
    }

    @method()
    async MODAT(position: int, value: double) {
        await this.modifyAt(position, 'MOD', value)
    }

    @method()
    CLAMPAT(position: int, min: double, max: double) {
        const index = this.checkedPosition('modify', position)
        const element = this.value[index]
        const [low, high] = element instanceof Integer ? [Math.trunc(min), Math.trunc(max)] : [min, max]
        this.value[index] = this.asElementType(element, Math.min(Math.max(valueAsDouble(rawValue(element)), low), high))
    }

    @method()
    async MULAT(position: int, value: double) {
        await this.modifyAt(position, 'MUL', value)
    }

    @method()
    CONTAINS(value: string | double | boolean): boolean {
        const asString = valueAsString(value)
        return this.value.some((element) => rawValue(element) === value || rawValue(element) === asString)
    }

    @method()
    async SUM(arg: double) {
        for (let i = 0; i < this.value.length; i++) {
            this.value[i] = await this.calculate(this.value[i], 'ADD', arg)
        }
    }

    @method()
    async SUBAT(position: int, value: double) {
        await this.modifyAt(position, 'SUB', value)
    }

    @method()
    GET(position: int) {
        return copyValue(this.engine, this.value[this.checkedPosition('access', position)])
    }

    @method()
    GETSIZE(): int {
        return this.value.length
    }

    @method()
    async CHANGEAT(position: int, value: Value) {
        this.value[this.checkedPosition('set', position)] = await copyValue(this.engine, value)
    }

    @method()
    REMOVEAT(position: int) {
        this.value.splice(this.checkedPosition('remove', position), 1)
    }

    @method()
    async INSERTAT(position: int, value: Value) {
        this.value.splice(this.checkedPosition('insert', position), 0, await copyValue(this.engine, value))
    }

    @method()
    REMOVEALL() {
        this.value = []
    }

    @method()
    FIND(value: string | double | boolean): int {
        const needle = valueAsString(value).toLowerCase()
        return this.value.findIndex((element) => valueAsString(rawValue(element)).toLowerCase() === needle)
    }

    @method()
    REVERSEFIND(value: string | double | boolean): int {
        const needle = valueAsString(value).toLowerCase()
        for (let i = this.value.length - 1; i >= 0; i--) {
            if (valueAsString(rawValue(this.value[i])).toLowerCase() === needle) {
                return i
            }
        }
        return -1
    }

    @method()
    async LOAD(path: string) {
        assert(this.engine.currentScene !== null)
        try {
            const entries = await this.engine.filesystem.getARRFile(
                await this.engine.currentScene.getRelativePath(path)
            )
            this.value = entries.map((entry) => this.fromEntry(entry))
        } catch (err) {
            if (err instanceof FileNotFoundError) {
                logger.error(
                    `Failed to load array from "${path}"`,
                    {
                        array: this,
                    },
                    err
                )
            } else {
                throw err
            }
        }
    }

    @method()
    async SAVE(path: string) {
        assert(this.engine.currentScene !== null)
        await this.engine.filesystem.saveFile(
            await this.engine.currentScene.getRelativePath(path),
            serializeArray(this.value.map(toEntry))
        )
    }

    private fromEntry(entry: ArrayEntry): ScalarValue {
        switch (entry.type) {
            case ArrayEntryType.INTEGER:
                return createInteger(this.engine, entry.value)
            case ArrayEntryType.FLOAT:
                return createDouble(this.engine, entry.value)
            case ArrayEntryType.STRING:
                return createString(this.engine, entry.value)
            case ArrayEntryType.BOOLEAN:
                return createBool(this.engine, entry.value)
        }
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

    getValue(): (ScalarValue | null)[] {
        return this.value
    }

    async clone() {
        const cloned = (await super.clone()) as ArrayObject
        cloned.value = [...this.value]
        return cloned
    }

    protected serialize(): string {
        return this.value.map(rawValue).join(',')
    }

    // The INI doesn't keep the types of the elements, so they are all read back as strings
    protected deserialize(value: string) {
        if (value === '') {
            return []
        }
        return value.split(',').map((element) => createString(this.engine, element))
    }
}
