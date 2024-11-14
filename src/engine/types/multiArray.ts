import {ValueType} from './index'
import {MultiArrayDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'
import {assert} from '../../errors'
import {method} from '../../types'

const generateMessage = (action: string, x: number, y: number, culprit: string, value: any[]) => {
    
    return `Tried to ${action} an element at an possition (y: ${y}, x: ${x}) that is outside the bounds of the array (${culprit} length is ${value.length})`
}
//Only 2 dimensional for now at least
export class MultiArray extends ValueType<MultiArrayDefinition> {
    constructor(engine: Engine, definition: MultiArrayDefinition) {
        super(engine, definition, [])
    }

    @method()
    SET(y: number, x: number, value: any) {
        // console.log(this.value)
        if(y>=this.value.length){
            this.value.push([value])
            return
        }
        if(x>=this.value[y].length){
            this.value[y].push(value)
            return
        }
        this.value[y][x] = value
        // throw new NotImplementedError()
    }

    @method()
    GET(y: number, x: number) {
        assert(y < this.value.length, generateMessage('get', y, x, 'y', this.value))
        assert(x < this.value[y].length, generateMessage('get', y, x, 'x', this.value[y]))
        return this.value[y][x]
        // throw new NotImplementedError()
    }
}
