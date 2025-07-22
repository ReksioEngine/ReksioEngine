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

enum Direction {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
    NONE = 4,
}

export class Matrix extends Type<MatrixDefinition> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: MatrixDefinition) {
        super(engine, parent, definition)
    }

    private width: number = 0
    private height: number = 0
    private ticks: number = 0
    private board: number[] = []
    private nextBoard: number[] = []


    initializeEmptyBoard(board: number[]): number[] {
        if (this.width > 0 && this.height > 0) {
            board = new Array(this.width * this.height).fill(Field.EMPTY)
        }
        return board
    }

    // SIZE[0] - Width
    // SIZE[1] - Height
    init() {
        this.width = this.definition.SIZE[0]
        this.height = this.definition.SIZE[1]
        this.initializeEmptyBoard(this.board)
        this.initializeEmptyBoard(this.nextBoard)
    }

    //Returns new position
    @method()
    CALCENEMYMOVEDEST(oldPos: number, dir: number) {
        switch (dir) {
            case Direction.LEFT: {
                return oldPos - 1
            }
            case Direction.UP: {
                return oldPos - this.width
            }
            case Direction.RIGHT: {
                return oldPos + 1
            }
            case Direction.DOWN: {
                return oldPos + this.width
            }
            default: {
                return oldPos
            }
        }
        // console.log(args)
        // throw new NotImplementedError()
    }

    rotateLeft(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.DOWN
            case Direction.UP:
                return Direction.LEFT
            case Direction.RIGHT:
                return Direction.UP
            case Direction.DOWN:
                return Direction.RIGHT
            default:
                return dir
        }
    }

    rotateRight(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.UP
            case Direction.UP:
                return Direction.RIGHT
            case Direction.RIGHT:
                return Direction.DOWN
            case Direction.DOWN:
                return Direction.LEFT
            default:
                return dir
        }
    }

    opositeDirection(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.RIGHT
            case Direction.UP:
                return Direction.DOWN
            case Direction.RIGHT:
                return Direction.LEFT
            case Direction.DOWN:
                return Direction.UP
            default:
                return dir
        }
    }

    isNewPositionValid(newPosIndex: number) {
        if (this.board[newPosIndex] != Field.EMPTY && this.board[newPosIndex] != Field.MOLE) {
            return false
        }
        if (newPosIndex < 0 || newPosIndex >= this.board.length) {
            return false
        }
        return true
    }

    canMoveTo(oldPos: number, newPos: number) {
        let newPosIndex: number = this.CALCENEMYMOVEDEST(oldPos, newPos)
        return this.isNewPositionValid(newPosIndex)
    }

    //Returns direction
    @method()
    CALCENEMYMOVEDIR(oldPos: number, currentMoveDir: number) {
        let newDir: number = this.rotateLeft(currentMoveDir)
        if (this.canMoveTo(oldPos, newDir)) {
            return newDir
        }
        if (this.canMoveTo(oldPos, currentMoveDir)) {
            return currentMoveDir
        }
        newDir = this.rotateRight(currentMoveDir)
        if (this.canMoveTo(oldPos, newDir)) {
            return newDir
        }
        newDir = this.opositeDirection(currentMoveDir)
        if (this.canMoveTo(oldPos, newDir)) {
            return newDir
        }

        return Direction.NONE

        // throw new NotImplementedError()
    }

    @method()
    CANHEROGOTO(targetCellIndex: number) {
        if (targetCellIndex < 0 || targetCellIndex >= this.board.length) {
            return false
        }
        if (
            this.board[targetCellIndex] == Field.EMPTY ||
            this.board[targetCellIndex] == Field.GROUND ||
            this.board[targetCellIndex] == Field.DYNAMITE ||
            this.board[targetCellIndex] == Field.DYNAMITE_FIRED ||
            this.board[targetCellIndex] == Field.ENEMY ||
            this.board[targetCellIndex] == Field.EXPLOSION ||
            this.board[targetCellIndex] == Field.EXIT
        ) {
            return true
        }
        return false
        // return true; // TODO: Implement this
    }

    @method()
    GET(index: number) {
        return this.board[index]
        // throw new NotImplementedError()
    }
    //TODO
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
    //Not used
    @method()
    GETOFFSET(...args: any[]) {
        throw new NotImplementedError()
    }
    //TODO
    @method()
    ISGATEEMPTY(...args: any[]) {
        throw new NotImplementedError()
    }
    //TODO
    @method()
    ISINGATE(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }
    
    @method()
    MOVE(previousPos: number, newPos: number) {
        this.board[newPos] = this.board[previousPos]
        this.board[previousPos] = Field.EMPTY
        // throw new NotImplementedError()
    }

    @method()
    NEXT(...args: any[]) {
        // TODO: Implement this
        // this.board = [...this.nextBoard] // Copy next board to current board
        // this.nextBoard = this.initializeEmptyBoard(this.nextBoard) // Reset next board
        return ++this.ticks
        // throw new NotImplementedError()
    }
    
    setByIndex(index: number, cellType: number) {
        assert(index >= 0 && index < this.board.length, `Index ${index} out of bounds for board of length ${this.board.length}`)
        this.board[index] = cellType
    }

    setByPosition(x: number, y: number, cellType: number) {
        assert(x >= 0 && x < this.width, `X position ${x} out of bounds for width ${this.width}`)
        assert(y >= 0 && y < this.height, `Y position ${y} out of bounds for height ${this.height}`)
        let index = y * this.width + x
        this.board[index] = cellType
    }

    @method()
    SET(...args: number[]) {
        if(args.length === 2)
        {
            this.setByIndex(args[0], args[1])
        }
        if(args.length === 3)
        {
            this.setByPosition(Math.floor(args[0]), Math.floor(args[1]), args[2])
        }
        // throw new NotImplementedError()
    }
    
    
    //TODO
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
    TICK() {
        this.ticks++
        return 0
        // console.log(args)
        // throw new NotImplementedError()
    }
}
