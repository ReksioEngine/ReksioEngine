// CALCENEMYMOVEDEST
// CALCENEMYMOVEDIR
// CANHEROGOTO
// GET
// GETCELLOFFSET
// GETCELLPOSX
// GETCELLPOSY
// GETCELLSNO
// GETFIELDPOSX
// GETFIELDPOSY
// GETOFFSET
// ISGATEEMPTY
// ISINGATE
// MOVE
// NEXT
// SET
// SETGATE
// SETROW
// TICK

import { Type, ValueType } from './index'
import { MatrixDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'

export class Matrix extends ValueType<MatrixDefinition> {
    constructor(engine: Engine, parent: Type<any> | null, definition: MatrixDefinition) {
        super(engine, parent, definition, [])
    }

    private width: number = 0;
    private height: number = 0;
    // SIZE[0] - Width
    // SIZE[1] - Height
    init() {
        console.log(this.definition.SIZE)
        if(this.definition.SIZE[0]>0 && this.definition.SIZE[1]>0)
        for(let i=0;i<this.definition.SIZE[1];i++)
        {
            this.value.push([])
            for(let j=0;j<this.definition.SIZE[0];j++)
            {
                this.value[i].push(0)
            }
        }
    }

    @method()
    CALCENEMYMOVEDEST(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    CALCENEMYMOVEDIR(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    CANHEROGOTO(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GET(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETCELLOFFSET(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETCELLPOSX(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETCELLPOSY(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETCELLSNO(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETFIELDPOSX(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETFIELDPOSY(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    GETOFFSET(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    ISGATEEMPTY(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    ISINGATE(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    MOVE(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    NEXT(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    SET(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    SETGATE(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    SETROW(...args:any[]){
        throw new NotImplementedError()
    }
    
    @method()
    TICK(...args:any[]){
        throw new NotImplementedError()
    }
    
}
