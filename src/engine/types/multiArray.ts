import { ValueType } from './index'
import { MultiArrayDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert } from '../../errors'
import { method } from '../../types'

const outOfBoundsMessage = (action: string, y: number, x: number) => {
    return `Trying to ${action} at position y: ${y}, x: ${x} that is out of bounds`
}

export class MultiArray extends ValueType<MultiArrayDefinition> {
    constructor(engine: Engine, definition: MultiArrayDefinition) {
        super(engine, definition, [])
    }

    @method()
    SET(...args: any[]) {
        //We take only first 2 arguments (position in array) 
        //and last one (value we will put) as the original engine ignores any dimensions above 2
        const y: number = args[0]
        const x: number = args[1]
        const value: any = args[args.length - 1]
        while (y >= this.value.length) {
            this.value.push([])
        }
        while (x >= this.value[y].length) {
            this.value[y].push(null)
        }
        this.value[y][x] = value
    }

    @method()
    GET(...args: number[]) {
        //We take only first 2 arguments as original engine ignores rest of coordinates 
        const y: number = args[0]
        const x: number = args[1]
        assert((y <= this.value.length && x <= this.value[y].length), outOfBoundsMessage('get', y, x))
        return this.value[y][x]
    }
}
