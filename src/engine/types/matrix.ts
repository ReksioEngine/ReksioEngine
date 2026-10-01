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

enum RemainingActions {
    NONE = 0,
    STONE_UPDATES = 1,
    PLAYER_COLLISION = 2,
    ENEMY_COLLISIONS = 3,
}

export class Matrix extends Type<MatrixDefinition> {
    constructor(engine: Engine, parent: ParentType<any> | null, definition: MatrixDefinition) {
        super(engine, parent, definition)
    }

    private width: number = 0
    private height: number = 0
    private board: Field[] = []
    private gateRect: Rectangle | null = null
    private stoneActions: Actions[] = []

    // How the stone in each cell got there
    private stoneStates: Actions[] = []

    private cursorX = 0
    private cursorY = 0

    initializeEmptyBoard<T extends number>(value?: T): T[] {
        let board: T[] = []
        if (this.width > 0 && this.height > 0) {
            board = new Array(this.width * this.height).fill(value ?? (0 as T))
        }
        return board
    }

    init() {
        this.width = this.definition.SIZE[0]
        this.height = this.definition.SIZE[1]
        this.board = this.initializeEmptyBoard()
        this.stoneActions = this.initializeEmptyBoard()
        this.stoneStates = this.initializeEmptyBoard()
    }

    // Returns new position
    @method()
    CALCENEMYMOVEDEST(oldPos: number, dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return oldPos - 1
            case Direction.UP:
                return oldPos - this.width
            case Direction.RIGHT:
                return oldPos + 1
            case Direction.DOWN:
                return oldPos + this.width
            default:
                return oldPos
        }
    }

    rotateLeft(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.DOWN
            case Direction.UP:
                return Direction.LEFT
            case Direction.DOWN:
                return Direction.RIGHT
            default: // any direction other than LEFT, UP, DOWN is treated as RIGHT
                return Direction.UP
        }
    }

    rotateRight(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.UP
            case Direction.UP:
                return Direction.RIGHT
            case Direction.DOWN:
                return Direction.LEFT
            default: // any direction other than LEFT, UP, DOWN is treated as RIGHT
                return Direction.DOWN
        }
    }

    opositeDirection(dir: number) {
        switch (dir) {
            case Direction.LEFT:
                return Direction.RIGHT
            case Direction.UP:
                return Direction.DOWN
            case Direction.DOWN:
                return Direction.UP
            default: // any direction other than LEFT, UP, DOWN is treated as RIGHT
                return Direction.LEFT
        }
    }

    isNewPositionValid(newPosIndex: number) {
        if (newPosIndex < 0 || newPosIndex >= this.board.length) {
            return false
        }
        return this.board[newPosIndex] === Field.EMPTY || this.board[newPosIndex] === Field.MOLE
    }

    canMoveTo(oldPos: number, newPos: number) {
        const newPosIndex: number = this.CALCENEMYMOVEDEST(oldPos, newPos)
        return this.isNewPositionValid(newPosIndex)
    }

    // Returns direction
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
    }

    @method()
    CANHEROGOTO(targetCellIndex: number) {
        if (targetCellIndex < 0 || targetCellIndex >= this.board.length) {
            return false
        }

        return [Field.EMPTY, Field.GROUND, Field.DYNAMITE, Field.ENEMY, Field.EXPLOSION, Field.EXIT].includes(
            this.board[targetCellIndex]
        )
    }

    @method()
    GET(...args: any[]) {
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
    GETCELLOFFSET(x: number, y: number) {
        return this.getIndexFromCoordinates(x, y)
    }

    // BASEPOS - Offset from the top left corner of the board (in pixels)
    @method()
    GETCELLPOSX(index: number) {
        return this.getColumnFromIndex(index) * this.definition.CELLWIDTH + this.definition.BASEPOS[0]
    }

    @method()
    GETCELLPOSY(index: number) {
        return this.getRowFromIndex(index) * this.definition.CELLHEIGHT + this.definition.BASEPOS[1]
    }

    @method()
    GETCELLSNO(cellType?: number) {
        if (cellType === undefined) {
            return this.width * this.height
        }

        return this.board.filter((e) => e === cellType).length
    }

    @method()
    GETFIELDPOSX(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    GETFIELDPOSY(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    GETOFFSET(...args: any[]) {
        throw new NotImplementedError()
    }

    @method()
    ISGATEEMPTY() {
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
    ISINGATE(index: number) {
        if (!this.gateRect) {
            return false
        }

        const x = this.getColumnFromIndex(index)
        const y = this.getRowFromIndex(index)

        // Manual comparison, so that it is non-inclusive of right and bottom
        return this.gateRect.left <= x && x < this.gateRect.right && this.gateRect.top <= y && y < this.gateRect.bottom
    }

    @method()
    MOVE(previousPos: number, newPos: number) {
        this.moveCell(previousPos, newPos, Actions.NONE)
    }

    // Moving into an explosion destroys the moved cell and keeps the explosion
    moveCell(from: number, to: number, code: Actions) {
        if (this.board[to] !== Field.EXPLOSION) {
            this.board[to] = this.board[from]
            if (this.board[to] === Field.STONE) {
                this.stoneStates[to] = code
            }
        }
        this.board[from] = Field.EMPTY
        this.stoneStates[from] = Actions.NONE
    }

    hasActionsFrom(startX: number, startY: number) {
        for (let y = startY; y >= 0; y--) {
            for (let x = y === startY ? startX : 0; x < this.width; x++) {
                if (this.stoneActions[this.getIndexFromCoordinates(x, y)] !== Actions.NONE) {
                    return true
                }
            }
        }
        return false
    }

    async runCallback(name: string, x: number, y: number, code: number) {
        await this.callbacks.run(name, null, null, [x, y, code])
    }

    @method()
    async NEXT() {
        let result = RemainingActions.NONE
        for (let y = this.cursorY; y >= 0; y--) {
            for (let x = y === this.cursorY ? this.cursorX : 0; x < this.width; x++) {
                const index = this.getIndexFromCoordinates(x, y)
                const action = this.stoneActions[index]
                if (action === Actions.NONE) {
                    continue
                }

                const indexUnder = index + this.width
                switch (action) {
                    case Actions.DOWN:
                        this.moveCell(index, indexUnder, action)
                        if (this.board[indexUnder + this.width] === Field.MOLE) {
                            result = RemainingActions.PLAYER_COLLISION
                        }
                        break
                    case Actions.DOWNLEFT:
                        this.moveCell(index, indexUnder - 1, action)
                        break
                    case Actions.DOWNRIGHT:
                        this.moveCell(index, indexUnder + 1, action)
                        break
                    case Actions.EXPLODE:
                        // Only a stone that fell straight down last tick crushes the enemy
                        if (this.stoneStates[index] !== Actions.DOWN) {
                            continue
                        }
                        this.stoneStates[index] = Actions.NONE
                        break
                }

                const wraps = x + 1 >= this.width
                const nextX = wraps ? 0 : x + 1
                const nextY = wraps ? y - 1 : y
                const isLast = !this.hasActionsFrom(nextX, nextY)
                this.cursorX = isLast ? this.width : nextX
                this.cursorY = isLast ? -1 : nextY

                await this.runCallback(isLast ? 'ONLATEST' : 'ONNEXT', x, y, action)
                return isLast ? result : result || RemainingActions.STONE_UPDATES
            }
        }

        return RemainingActions.NONE
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

        const index = this.getIndexFromCoordinates(x, y)
        this.setByIndex(index, cellType)
    }

    @method()
    async SET(...args: number[]) {
        if (args.length === 2) {
            const [index, cellType] = args
            this.setByIndex(index, cellType)
        }
        if (args.length === 3) {
            const [x, y, cellType] = args
            this.setByPosition(Math.floor(x), Math.floor(y), cellType)
        }
    }

    @method()
    async SETGATE(startColumn: number, startRow: number, endColumn: number, endRow: number) {
        this.gateRect = new Rectangle(startColumn, startRow, endColumn - startColumn + 1, endRow - startRow + 1)
    }

    @method()
    async SETROW(row: number, ...cells: number[]) {
        for (let i = 0; i < this.width; i++) {
            this.board[row * this.width + i] = cells[i]
        }
    }

    // Can the stone at index (column x) roll one column sideways (dx = -1 or 1) and down?
    // A neighbour that already has an action this tick blocks the roll
    canRoll(index: number, x: number, dx: number) {
        const hasAction = (offset: number) => {
            const column = x + offset
            return column >= 0 && column < this.width && this.stoneActions[index + offset] !== Actions.NONE
        }
        return (
            !hasAction(dx) &&
            !hasAction(2 * dx) &&
            this.board[index + dx] === Field.EMPTY &&
            this.board[index + this.width + dx] === Field.EMPTY
        )
    }

    @method()
    async TICK() {
        this.cursorX = 0
        this.cursorY = this.height - 2
        this.stoneActions = this.initializeEmptyBoard()

        for (let x = 0; x < this.width; x++) {
            for (let y = this.height - 2; y >= 0; y--) {
                const index = this.getIndexFromCoordinates(x, y)
                if (this.board[index] !== Field.STONE) {
                    continue
                }

                const under = this.board[index + this.width]
                if (under === Field.EMPTY || under === Field.ENEMY) {
                    this.stoneActions[index] = under === Field.EMPTY ? Actions.DOWN : Actions.EXPLODE
                    // Stones stacked directly above wait for a later tick
                    while (y > 0 && this.board[this.getIndexFromCoordinates(x, y - 1)] === Field.STONE) {
                        y--
                    }
                    continue
                }

                // Resting stone: it may roll off another stone if nothing is stacked on it
                let roll = Actions.NONE
                const stoneAbove = y > 0 && this.board[index - this.width] === Field.STONE
                if (under === Field.STONE && !stoneAbove) {
                    if (this.canRoll(index, x, -1)) {
                        roll = Actions.DOWNLEFT
                    } else if (this.canRoll(index, x, 1)) {
                        roll = Actions.DOWNRIGHT
                    }
                }
                this.stoneActions[index] = roll
                this.stoneStates[index] = roll
            }
        }
    }
}
