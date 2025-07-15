import { Type } from './index'
import { DatabaseDefinition } from '../../fileFormats/cnv/types'
import { Struct } from './struct'
import { method } from '../../common/types'
import { assert } from '../../common/errors'

const decoder = new TextDecoder('windows-1250')

export class Database extends Type<DatabaseDefinition> {
    private baseStruct: Struct | null = null
    private content: Struct[] = []
    private cursorPosition: number = 0

    init() {
        this.baseStruct = this.getObject(this.definition.MODEL)
    }

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    GETROWSNO() {
        return this.content.length
    }

    @method()
    GETCURSORPOS() {
        return this.cursorPosition
    }

    @method()
    NEXT() {
        this.cursorPosition = (this.cursorPosition + 1) % this.content.length
        this.updateCursorValue()
    }

    @method()
    PREV() {
        this.cursorPosition += 1
        if (this.cursorPosition < 0) {
            this.cursorPosition = this.content.length - 1
        }
        this.updateCursorValue()
    }

    @method()
    SELECT(index: number) {
        assert(index < this.content.length && index >= 0, 'out of bounds')
        this.cursorPosition = index
        this.updateCursorValue()
    }

    @method()
    FIND(column: string, value: any, offset: number) {
        // Should be ok without await for getValue as these types don't have async get
        const index = this.content.findIndex((entry) => entry.GETFIELD(column)?.getValue() === value)
        if (index == -1) {
            return -1
        }

        // Simulating stupid behavior
        if (index < offset) {
            return this.content.length + index
        }

        return index
    }

    @method()
    REMOVEAT(index: number) {
        this.content.splice(index, 1)
        this.updateCursorValue()
    }

    @method()
    REMOVEALL() {
        this.content.forEach((item) => item.destroy())
        this.content = []
        this.updateCursorValue()
    }

    @method()
    async LOAD(path: string) {
        assert(this.engine.currentScene !== null)
        assert(this.baseStruct !== null)

        const relativePath = this.engine.currentScene.getRelativePath(path)
        const data = await this.engine.fileLoader.getRawFile(relativePath)
        const content = decoder.decode(data)
        const lines = content.replaceAll('\r\n', '\n').split('\n')

        const structFieldsNames = Array.from(this.baseStruct.structure.keys())
        for (const line of lines) {
            const fieldContents = line.split('|')
            const newEntry = await this.baseStruct.clone()

            for (let i = 0; i < fieldContents.length; i++) {
                const fieldName = structFieldsNames[i]
                const fieldValue = fieldContents[i]
                await newEntry.SETFIELD(fieldName, fieldValue === 'NULL' ? null : fieldValue)
            }
            this.content.push(newEntry)
        }

        this.updateCursorValue()
    }

    private updateCursorValue() {
        assert(this.parentScope !== null)

        const cursorName = this.name + '_CURSOR'
        if (this.content.length == 0) {
            this.parentScope.remove(cursorName)
        } else {
            this.parentScope.set(cursorName, this.content[this.cursorPosition])
        }
    }
}
