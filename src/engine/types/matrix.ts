import { Type, ParentType } from './index'
import { MatrixDefinition } from '../../fileFormats/cnv/types'
import { Engine } from '../index'
import { assert, NotImplementedError } from '../../common/errors'
import { method } from '../../common/types'
import { Rectangle } from 'pixi.js'

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
    private board: number[] = []
    private gateRect: Rectangle | null = null
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
        if (this.board[newPosIndex] !== Field.EMPTY && this.board[newPosIndex] !== Field.MOLE) {
            return false
        }
        return true
    }

    async canMoveTo(oldPos: number, newPos: number) {
        const newPosIndex: number = await this.CALCENEMYMOVEDEST(oldPos, newPos)
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

    }

    @method()
    async CANHEROGOTO(targetCellIndex: number) {
        if (targetCellIndex < 0 || targetCellIndex >= this.board.length) {
            return false
        }
        if (
            this.board[targetCellIndex] === Field.EMPTY ||
            this.board[targetCellIndex] === Field.GROUND ||
            this.board[targetCellIndex] === Field.DYNAMITE ||
            this.board[targetCellIndex] === Field.DYNAMITE_FIRED ||
            this.board[targetCellIndex] === Field.ENEMY ||
            this.board[targetCellIndex] === Field.EXPLOSION ||
            this.board[targetCellIndex] === Field.EXIT
        ) {
            return true
        }
        return false
    }

    @method()
    async GET(...args: any[]) {
        return this.board[args[0]]
    }

    getIndexFromCoordinates(column: number, row: number) {
        return row * this.width + column
    }

    getColumnFromIndex(index: number) {
        return index % this.width
    }

    getRowFromIndex(index: number) {
        return Math.floor(index / this.width)
    }

    @method()
    async GETCELLOFFSET(x: number, y: number) {
        return this.getIndexFromCoordinates(x, y)
    }

    // BASEPOS - Offset from the top left corner of the board (in pixels)
    @method()
    async GETCELLPOSX(index: number) {
        const posx: number = this.getColumnFromIndex(index) * this.definition.CELLWIDTH + this.definition.BASEPOS[0]
        return posx
    }

    @method()
    async GETCELLPOSY(index: number) {
        const posy: number = this.getRowFromIndex(index) * this.definition.CELLHEIGHT + this.definition.BASEPOS[1]
        return posy
    }

    @method()
    async GETCELLSNO(cellType: number) {
        let count: number = 0
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === cellType) {
                count++
            }
        }

        return count
    }

    @method()
    async GETFIELDPOSX(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    async GETFIELDPOSY(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    async GETOFFSET(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    async ISGATEEMPTY() {
        if (!this.gateRect) {
            return true
        }
        for (let column = this.gateRect.left; column < this.gateRect.right; column++) {
            for (let row = this.gateRect.top; row < this.gateRect.bottom; row++) {
                if (this.board[this.getIndexFromCoordinates(column, row)] === Field.STONE) {
                    return false
                }
            }
        }
        return true
    }

    @method()
    async ISINGATE(index: number) {
        if (!this.gateRect) {
            return false
        }
        return this.gateRect.contains(this.getColumnFromIndex(index), this.getRowFromIndex(index))
    }

    @method()
    async MOVE(previousPos: number, newPos: number) {
        this.board[newPos] = this.board[previousPos]
        this.board[previousPos] = Field.EMPTY
    }

    stoneActionsDone() {
        let x = this.cursorX
        for (let y = this.cursorY; y > -1; y--) {
            while (x < this.width) {
                if (this.stoneActions[this.getIndexFromCoordinates(x, y)] !== Actions.NONE) {
                    return false
                }
                x++
            }
            x = 0
        }
        return true
    }

    async getNextCursor(currentX: number, currentY: number) {
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
        if (this.board[newIndex] !== Field.EXPLOSION) {
            this.board[newIndex] = Field.STONE
        }
        this.board[oldIndex] = Field.EMPTY
    }

    async runCallback(name: string, x: number, y: number, code: number) {
        await this.callbacks.run(name, null, null, [x, y, code])
    }

    @method()
    async NEXT() {
        let result = 0
        let y = this.cursorY
        let x = 0
        let callbackAction = Actions.NONE
        while (y >= 0) {
            if (y === this.cursorY) {
                x = this.cursorX
            } else {
                x = 0
            }
            while (x < this.width) {
                const index = this.width * y + x
                switch (this.stoneActions[index]) {
                    case Actions.NONE:
                        x += 1
                        continue
                    case Actions.DOWN:
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
                if (callbackAction !== Actions.NONE) {
                    await this.getNextCursor(x, y)
                    if (this.stoneActionsDone()) {
                        this.cursorX = this.width
                        this.cursorY = -1
                        await this.runCallback('ONLATEST', x, y, callbackAction)
                        return result
                    }
                    if (result === 0) {
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
    }

    async setByIndex(index: number, cellType: number) {
        assert(
            index >= 0 && index < this.board.length,
            `Index ${index} out of bounds for board of length ${this.board.length}`
        )
        if (cellType === Field.ENEMY) {
            if (this.board[index] !== Field.EMPTY) {
                return
            }
        }

        this.board[index] = cellType
    }

    async setByPosition(x: number, y: number, cellType: number) {
        assert(x >= 0 && x < this.width, `X position ${x} out of bounds for width ${this.width}`)
        assert(y >= 0 && y < this.height, `Y position ${y} out of bounds for height ${this.height}`)
        const index = y * this.width + x

        if (cellType === Field.ENEMY) {
            if (this.board[index] !== Field.EMPTY) {
                return
            }
        }

        this.board[index] = cellType
    }

    @method()
    async SET(...args: number[]) {
        if (args.length === 2) {
            // args[0] - Index
            // args[1] - cellType
            await this.setByIndex(args[0], args[1])
        }
        if (args.length === 3) {
            // args[0] - x
            // args[1] - y
            // position in matrix
            // args[2] - cellType
            await this.setByPosition(Math.floor(args[0]), Math.floor(args[1]), args[2])
        }
    }

    @method()
    async SETGATE(startColumn: number, startRow: number, endColumn: number, endRow: number) {
        // TODO: implement
        this.gateRect = new Rectangle(startColumn, startRow, endColumn - startColumn + 1, endRow - startRow + 1)
    }

    @method()
    async SETROW(row: number, ...cells: number[]) {
        // TODO: implement
        this.board.splice(row * this.width, this.width, ...cells)
        // this.board = this.board.map((v: any) => (v === Field.ENEMY ? Field.EMPTY : v)) // Cutout enemies for now
    }

    @method()
    async TICK() {
        this.cursorX = 0
        this.cursorY = this.height - 2
        this.stoneActions = this.initializeEmptyBoard()
        if (this.width > 0) {
            for (let x: number = 0; x < this.width; x++) {
                for (let y: number = this.height - 2; y > -1; y--) {
                    const index = this.width * y + x
                    if (this.board[index] !== Field.STONE) {
                        continue
                    }
                    const indexUnder = index + this.width
                    switch (this.board[indexUnder]) {
                        case Field.EMPTY: {
                            this.stoneActions[index] = Actions.DOWN
                            let indexOver = index - this.width
                            while (y > 0 && this.board[indexOver] === Field.STONE) {
                                indexOver -= this.width
                                y -= 1
                            }
                            continue
                        }
                        case Field.ENEMY: {
                            this.stoneActions[index] = Actions.EXPLODE
                            let indexOver = index - this.width
                            while (y > 0 && this.board[indexOver] === Field.STONE) {
                                indexOver -= this.width
                                y -= 1
                            }
                            continue
                        }
                        case Field.STONE: {
                            const indexOver = index - this.width
                            if (y === 0 || this.board[indexOver] !== Field.STONE) {
                                // Checks if we have action queued for cell 1 and 2 spaces to the left
                                // Then we check if space to the left of cell and 1 under it is empty
                                if (
                                    (x === 0 || this.stoneActions[index - 1] === Actions.NONE) &&
                                    (x < 2 || this.stoneActions[index - 2] === Actions.NONE) &&
                                    this.board[index - 1] === Field.EMPTY &&
                                    this.board[indexUnder - 1] === Field.EMPTY
                                ) {
                                    this.stoneActions[index] = Actions.DOWNLEFT
                                } else {
                                    // Checks if we have action queued for cell 1 and 2 spaces to the right
                                    // Then we check if space to the right of cell and 1 under it is not empty
                                    if (
                                        (x !== this.width - 1 && this.stoneActions[index + 1] !== Actions.NONE) ||
                                        (x < this.width - 2 && this.stoneActions[index + 2] !== Actions.NONE) ||
                                        this.board[index + 1] !== Field.EMPTY ||
                                        this.board[indexUnder + 1] !== Field.EMPTY
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
