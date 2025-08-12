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

enum Actions {
    NONE = 0,
    DOWN = 1,
    DOWNLEFT = 2,
    DOWNRIGHT = 3,
    EXPLODE = 4,
}

export class Matrix extends Type<MatrixDefinition> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: MatrixDefinition) {
        super(engine, parent, definition)
    }

    private width: number = 0
    private height: number = 0
    // private ticks: number = 0
    private board: number[] = []
    private stoneActions: number[] = []

    private cursorX = 0
    private cursorY = 0

    initializeEmptyBoard(): number[] {
        let board: number[] = []
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
        this.board = this.initializeEmptyBoard()
        this.stoneActions = this.initializeEmptyBoard()
    }

    //Returns new position
    @method()
    async CALCENEMYMOVEDEST(oldPos: number, dir: number) {
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
        if (newPosIndex < 0 || newPosIndex >= this.board.length) {
            return false
        }
        if (this.board[newPosIndex] != Field.EMPTY && this.board[newPosIndex] != Field.MOLE) {
            return false
        }
        return true
    }

    async canMoveTo(oldPos: number, newPos: number) {
        let newPosIndex: number = await this.CALCENEMYMOVEDEST(oldPos, newPos)
        return this.isNewPositionValid(newPosIndex)
    }

    //Returns direction
    @method()
    async CALCENEMYMOVEDIR(oldPos: number, currentMoveDir: number) {
        let newDir: number = this.rotateLeft(currentMoveDir)
        if (await this.canMoveTo(oldPos, newDir)) {
            return newDir
        }
        if (await this.canMoveTo(oldPos, currentMoveDir)) {
            return currentMoveDir
        }
        newDir = this.rotateRight(currentMoveDir)
        if (await this.canMoveTo(oldPos, newDir)) {
            return newDir
        }
        newDir = this.opositeDirection(currentMoveDir)
        if (await this.canMoveTo(oldPos, newDir)) {
            return newDir
        }

        return Direction.NONE

        // throw new NotImplementedError()
    }

    @method()
    async CANHEROGOTO(targetCellIndex: number) {
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
    async GET(index: number) {
        return this.board[index]
        // throw new NotImplementedError()
    }
    //TODO
    @method()
    async GETCELLOFFSET(x: number, y: number) {
        let index = y * this.width + x
        console.log('GETCELLOFFSET', index)
        return index
        // throw new NotImplementedError()
    }

    // BASEPOS - Offset of board in pixels from top left corner
    @method()
    async GETCELLPOSX(index: number) {
        let posx: number = (index % this.width) * this.definition.CELLWIDTH + this.definition.BASEPOS[0]
        // console.log(posx)
        return posx
        // throw new NotImplementedError()
    }

    @method()
    async GETCELLPOSY(index: number) {
        let posy: number = Math.floor(index / this.width) * this.definition.CELLHEIGHT + this.definition.BASEPOS[1]
        // console.log(posy)
        return posy
        // throw new NotImplementedError()
    }

    @method()
    async GETCELLSNO(cellType: number) {
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
    async GETFIELDPOSX(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    //Not used
    @method()
    async GETFIELDPOSY(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }
    //Not used
    @method()
    async GETOFFSET(...args: any[]) {
        throw new NotImplementedError()
    }
    //TODO
    @method()
    async ISGATEEMPTY(...args: any[]) {
        console.log('ISGATEEMPTY', args)
        return false
        // throw new NotImplementedError()
    }
    //TODO
    @method()
    async ISINGATE(...args: any[]) {
        console.log('ISINGATE', args)
        return false
        // throw new NotImplementedError()
    }

    @method()
    async MOVE(previousPos: number, newPos: number) {
        this.board[newPos] = this.board[previousPos]
        this.board[previousPos] = Field.EMPTY
        // throw new NotImplementedError()
    }

    stoneActionsDone() {
        let x = this.cursorX
        for (let y = this.cursorY; y > -1; y--) {
            while (x < this.width) {
                if (this.stoneActions[x + y * this.width] != Actions.NONE) {
                    return false
                }
                x++
            }
            x = 0
        }
        return true
    }

    getNextCursor(currentX: number, currentY: number) {
        let nextX = currentX + 1
        let nextY = currentY
        if (nextX >= this.width) {
            nextX = 0
            nextY -= 1
        }
        if (nextY < this.cursorY) {
            this.cursorY = nextY
        }
        this.cursorX = nextX
    }

    moveStoneDown(oldIndex: number, newIndex: number) {
        if (this.board[newIndex] != Field.EXPLOSION) {
            this.board[newIndex] = Field.STONE
        }
        this.board[oldIndex] = Field.EMPTY
    }

    async runCallback(name: string, x: number, y: number, code: number) {
        console.log(name, x, y, code)
        await this.callbacks.run(name, null, null, [x, y, code])
    }

    @method()
    async NEXT() {
        let result = 0
        let y = this.cursorY
        let x = 0
        let callbackAction = Actions.NONE
        while (y >= 0) {
            if (y == this.cursorY) {
                x = this.cursorX
            } else {
                x = 0
            }
            while (x < this.width) {
                let index = this.width * y + x
                switch (this.stoneActions[index]) {
                    case Actions.NONE:
                        x += 1
                        continue
                    case Actions.DOWN:
                        // if(this.board[index+2*this.width]==Field.MOLE)
                        // {
                        //     result = 2
                        // }
                        callbackAction = Actions.DOWN
                        this.moveStoneDown(index, index + this.width)
                        break

                    case Actions.DOWNLEFT:
                        callbackAction = Actions.DOWNLEFT
                        this.moveStoneDown(index, index + this.width - 1)
                        break

                    case Actions.DOWNRIGHT:
                        callbackAction = Actions.DOWNRIGHT
                        this.moveStoneDown(index, index + this.width + 1)
                        break

                    case Actions.EXPLODE:
                        callbackAction = Actions.EXPLODE
                        this.moveStoneDown(index, index + this.width)
                        break
                }
                if (callbackAction != Actions.NONE) {
                    this.getNextCursor(x, y)
                    if (this.stoneActionsDone()) {
                        this.cursorX = this.width
                        this.cursorY = -1
                        await this.runCallback('ONLATEST', x, y, callbackAction)
                        return result
                    }
                    if (result == 0) {
                        result = 1
                    }
                    await this.runCallback('ONNEXT', x, y, callbackAction)
                    return result
                }
                x += 1
            }
            y -= 1
        }

        return result
        // throw new NotImplementedError()
    }

    setByIndex(index: number, cellType: number) {
        assert(
            index >= 0 && index < this.board.length,
            `Index ${index} out of bounds for board of length ${this.board.length}`
        )
        this.board[index] = cellType
    }

    setByPosition(x: number, y: number, cellType: number) {
        assert(x >= 0 && x < this.width, `X position ${x} out of bounds for width ${this.width}`)
        assert(y >= 0 && y < this.height, `Y position ${y} out of bounds for height ${this.height}`)
        let index = y * this.width + x
        this.board[index] = cellType
    }

    @method()
    async SET(...args: number[]) {
        if (args.length === 2) {
            // args[0] - Index
            // args[1] - cellType
            this.setByIndex(args[0], args[1])
        }
        if (args.length === 3) {
            // args[0] - x
            // args[1] - y
            // position in matrix
            // args[2] - cellType
            this.setByPosition(Math.floor(args[0]), Math.floor(args[1]), args[2])
        }
        // throw new NotImplementedError()
    }

    //TODO
    @method()
    async SETGATE(...args: any[]) {
        // console.log(args)
        throw new NotImplementedError()
    }

    @method()
    async SETROW(row: number, ...cells: number[]) {
        this.board.splice(row * this.width, this.width, ...cells)
        // this.board = this.board.map((v: any) => (v === Field.ENEMY ? Field.EMPTY : v)) // Cutout enemies for now
        // throw new NotImplementedError()
    }

    @method()
    async TICK() {
        this.cursorX = 0
        this.cursorY = this.height - 2
        this.stoneActions = this.initializeEmptyBoard()
        if (this.width > 0) {
            for (let x: number = 0; x < this.width; x++) {
                for (let y: number = this.height - 2; y > -1; y--) {
                    let index = this.width * y + x
                    if (this.board[index] != Field.STONE) {
                        continue
                    }
                    let indexUnder = index + this.width
                    switch (this.board[indexUnder]) {
                        case Field.EMPTY: {
                            this.stoneActions[index] = Actions.DOWN
                            let indexOver = index - this.width
                            while (y > 0 && this.board[indexOver] == Field.STONE) {
                                indexOver -= this.width
                                y -= 1
                            }
                            continue
                        }
                        case Field.ENEMY: {
                            this.stoneActions[index] = Actions.EXPLODE
                            let indexOver = index - this.width
                            while (y > 0 && this.board[indexOver] == Field.STONE) {
                                indexOver -= this.width
                                y -= 1
                            }
                            continue
                        }
                        case Field.STONE: {
                            let indexOver = index - this.width
                            if (y == 0 || this.board[indexOver] != Field.STONE) {
                                // Checks if we have action queued for cell 1 and 2 spaces to the left
                                // Then we check if space to the left of cell and 1 under it is empty
                                if (
                                    (x == 0 || this.stoneActions[index - 1] == Actions.NONE) &&
                                    (x < 2 || this.stoneActions[index - 2] == Actions.NONE) &&
                                    this.board[index - 1] == Field.EMPTY &&
                                    this.board[indexUnder - 1] == Field.EMPTY
                                ) {
                                    this.stoneActions[index] = Actions.DOWNLEFT
                                } else {
                                    // Checks if we have action queued for cell 1 and 2 spaces to the right
                                    // Then we check if space to the right of cell and 1 under it is not empty
                                    if (
                                        (x != this.width - 1 && this.stoneActions[index + 1] != Actions.NONE) ||
                                        (x < this.width - 2 && this.stoneActions[index + 2] != Actions.NONE) ||
                                        this.board[index + 1] != Field.EMPTY ||
                                        this.board[indexUnder + 1] != Field.EMPTY
                                    ) {
                                        continue
                                    }
                                    this.stoneActions[index] = Actions.DOWNRIGHT
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
