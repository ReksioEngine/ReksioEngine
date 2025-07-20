import { Type, ValueType } from './index'
import { MatrixDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'
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


enum Field {
    EMPTY = 0,
    GROUND = 1,
    STONE = 2,
    DYNAMITE = 3,
    WALL_WEAK = 4,
    ENEMY = 5,
    WALL_STRONG = 6,
    DYNAMITE_FIRED = 7,
    EXPLOSION = 8,
    EXIT = 9,
    MOLE = 99
}

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
        this.width = this.definition.SIZE[0]
        this.height = this.definition.SIZE[1]
        if(this.definition.SIZE[0]>0 && this.definition.SIZE[1]>0)
        for(let i=0;i<this.definition.SIZE[1];i++)
        {
            // this.value.push([])
            for(let j=0;j<this.definition.SIZE[0];j++)
            {
                this.value.push(0)
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
        console.log(args[0])
        console.log("Got: " + this.value[args[0]])
        return 
        // return this.value[args[0]][args[1]] || 0; // Default to 0 if the cell is not set
        // throw new NotImplementedError()
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
        let count = 0;
        for(let i=0;i<this.value.length;i++)
        {
            if(this.value[i]==args[0])
            {
                count++;
            }

            
        }

        console.log("Count" + args[0] + ": " + count)
        
        return count;
        // throw new NotImplementedError()
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
        const pos = args[0]
        const value = args[1]

        this.value[pos] = value;
        // throw new NotImplementedError()
    }

    @method()
    SETGATE(...args:any[]){
        throw new NotImplementedError()
    }

    @method()
    SETROW(...args:any[]){
        this.value[args[0]*this.width] = args.slice(1)
        // throw new NotImplementedError()
    }
    
    @method()
    TICK(...args:any[]){
        // throw new NotImplementedError()
    }
    
}
