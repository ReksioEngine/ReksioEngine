import { Type, ParentType } from './index'
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
    MOLE = 99,
}

export class Matrix extends Type<MatrixDefinition> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: MatrixDefinition) {
        super(engine, parent, definition)
    }

    private width: number = 0
    private height: number = 0
    private ticks: number = 0
    private board: number[] = []

    // SIZE[0] - Width
    // SIZE[1] - Height
    init() {
        console.log(this.definition.SIZE)
        this.width = this.definition.SIZE[0]
        this.height = this.definition.SIZE[1]
        if (this.width > 0 && this.height > 0) {
            this.board = new Array(this.width * this.height).fill(Field.EMPTY)
        }
    }

    @method()
    CALCENEMYMOVEDEST(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    CALCENEMYMOVEDIR(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    CANHEROGOTO(...args: any[]) {
        console.log('CANHEROGOTO')
        console.log(args)
        // return true; // TODO: Implement this
    }

    @method()
    GET(index: number) {
        return this.board[index]
        // throw new NotImplementedError()
    }

    @method()
    GETCELLOFFSET(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    // BASEPOS - Offset of board in pixels from top left corner
    @method()
    GETCELLPOSX(index: number) {
        let posx: number = (index % this.width) * this.definition.CELLWIDTH + this.definition.BASEPOS[0]
        // console.log(posx)
        return posx
        // throw new NotImplementedError()
    }

    @method()
    GETCELLPOSY(index: number) {
        let posy: number = Math.floor(index / this.width) * this.definition.CELLHEIGHT + this.definition.BASEPOS[1]
        // console.log(posy)
        return posy
        // throw new NotImplementedError()
    }

    @method()
    GETCELLSNO(cellType: number) {
        let count: number = 0
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] == cellType) {
                count++
            }
        }

        console.log('Count ' + cellType + ': ' + count)

        return count
        // throw new NotImplementedError()
    }

    //Not used
    @method()
    GETFIELDPOSX(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    //Not used
    @method()
    GETFIELDPOSY(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    GETOFFSET(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    ISGATEEMPTY(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    ISINGATE(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    MOVE(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    NEXT(...args: any[]) {
        // TODO: Implement this
        return this.ticks + 4
        // throw new NotImplementedError()
    }

    @method()
    SET(index: number, value: number) {
        this.board[index] = value
        // throw new NotImplementedError()
    }

    @method()
    SETGATE(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    SETROW(row: number, ...args: any[]) {
        this.board.splice(row * this.width, this.width, ...args)
        // this.board = this.board.map((v: any) => (v === Field.ENEMY ? Field.EMPTY : v)) // Cutout enemies for now
        // throw new NotImplementedError()
    }

    @method()
    TICK(...args: any[]) {
        // console.log(args)
        // throw new NotImplementedError()
    }
}
