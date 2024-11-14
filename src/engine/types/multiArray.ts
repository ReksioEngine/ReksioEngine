import {ValueType} from './index'
import {MultiArrayDefinition} from '../../fileFormats/cnv/types'
import {Engine} from '../index'
import {NotImplementedError} from '../../errors'
import {assert} from '../../errors'
import {method} from '../../types'

const outOfBoundsMessage = (action: string, value: any[]) => {
    
    return `Number of dimensions in ${action} didn't match object definition`
}

export class MultiArray extends ValueType<MultiArrayDefinition> {
    constructor(engine: Engine, definition: MultiArrayDefinition) {
        super(engine, definition, [])
    }

    @method()
    SET(...args:any[]) {
        assert(args.length-1===this.definition.DIMENSIONS,outOfBoundsMessage('set',this.value))
        console.log(this.value)
        this.recursiveSet(this.value, ...args)
    }

    @method()
    GET(...args:number[]) {
        assert(args.length===this.definition.DIMENSIONS,outOfBoundsMessage('get',this.value))
        return this.recursiveGet(this.value, ...args)
    }

    private recursiveSet(arr:any[], ...args:any[]){
        if(args.length>2){
            while(args[0]>=arr.length){
                arr.push([])        
            }
            this.recursiveSet(arr[args[0]], ...args.slice(1))
            return
        }
        while(args[0]>=arr.length){
            arr.push('')
        }
        arr[args[0]]=args[1]
    }

    private recursiveGet(arr:any[], ...args:number[]): any{
        if(args.length>1){
            return this.recursiveGet(arr[args[0]], ...args.slice(1))
        }
        return arr[args[0]]
    }
}
