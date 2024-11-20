import {
    array,
    boolean,
    callback,
    callbacks,
    code,
    number,
    optional,
    reference,
    string,
    TypeDefinition,
} from '../common'

export type ApplicationDefinition = TypeDefinition & {
    DESCRIPTION: string
    CREATIONTIME: string
    LASTMODIFYTIME: string
    AUTHOR: string
    VERSION: string
    PATH: string
    EPISODES: Array<string>
    STARTWITH: string
}

const ApplicationStructure = {
    DESCRIPTION: string,
    CREATIONTIME: string,
    LASTMODIFYTIME: string,
    AUTHOR: string,
    VERSION: string,
    PATH: string,
    EPISODES: array(string),
    STARTWITH: string,
}

export type EpisodeDefinition = TypeDefinition & {
    DESCRIPTION: string
    CREATIONTIME: string
    LASTMODIFYTIME: string
    AUTHOR: string
    VERSION: string
    PATH?: string
    SCENES: Array<string>
    STARTWITH: string
}

const EpisodeStructure = {
    DESCRIPTION: string,
    CREATIONTIME: string,
    LASTMODIFYTIME: string,
    AUTHOR: string,
    VERSION: string,
    PATH: optional(string),
    SCENES: array(string),
    STARTWITH: string,
}

export type SceneDefinition = TypeDefinition & {
    DESCRIPTION?: string
    CREATIONTIME: string
    LASTMODIFYTIME: string
    VERSION: string
    PATH: string
    BACKGROUND?: string
    MUSIC?: string
    DLLS?: Array<string>
}

const SceneStructure = {
    DESCRIPTION: optional(string),
    CREATIONTIME: string,
    LASTMODIFYTIME: string,
    VERSION: string,
    PATH: string,
    BACKGROUND: optional(string),
    MUSIC: optional(string),
    DLLS: optional(array(string)),
}

export type IntegerDefinition = TypeDefinition & {
    VALUE?: number
    VARTYPE?: string
    DEFAULT?: number
    TOINI?: boolean
    ONINIT?: callback
    ONCHANGED?: callbacks<number>
    ONBRUTALCHANGED?: callbacks<number>
}

const IntegerStructure = {
    VALUE: optional(number),
    VARTYPE: optional(string),
    DEFAULT: optional(number),
    TOINI: optional(boolean),
    ONINIT: optional(callback),
    ONCHANGED: optional(callbacks(number)),
    ONBRUTALCHANGED: optional(callbacks(number)),
}

export type AnimoDefinition = TypeDefinition & {
    VISIBLE: boolean
    FILENAME: string
    TOCANVAS: boolean
    PRIORITY?: number
    FPS?: number
    PRELOAD?: boolean
    RELEASE?: boolean
    MONITORCOLLISION?: boolean
    MONITORCOLLISIONALPHA?: boolean
    ONINIT?: callback
    ONFINISHED?: callbacks<string>
    ONSTARTED?: callbacks<string>
    ONFRAMECHANGED?: callbacks<string>

    // When in button mode
    ONFOCUSON?: callback
    ONFOCUSOFF?: callback
    ONCLICK?: callback
    ONRELEASE?: callback
}

const AnimoStructure = {
    VISIBLE: boolean,
    FILENAME: string,
    TOCANVAS: boolean,
    PRIORITY: optional(number),
    FPS: optional(number),
    PRELOAD: optional(boolean),
    RELEASE: optional(boolean),
    MONITORCOLLISION: optional(boolean),
    MONITORCOLLISIONALPHA: optional(boolean),
    ONINIT: optional(callback),
    ONFINISHED: optional(callbacks(string)),
    ONSTARTED: optional(callbacks(string)),
    ONFRAMECHANGED: optional(callbacks(string)),

    ONFOCUSON: optional(callback),
    ONFOCUSOFF: optional(callback),
    ONCLICK: optional(callback),
    ONRELEASE: optional(callback),
}

export type MusicDefinition = TypeDefinition & {
    FILENAME: string
}

const MusicStructure = {
    FILENAME: string,
}

export type SoundDefinition = TypeDefinition & {
    FILENAME: string
    PRELOAD?: boolean
    RELEASE?: boolean
    FLUSHAFTERPLAYED?: boolean
    ONINIT?: callback
    ONFINISHED?: callback
    ONSTARTED?: callback
}

const SoundStructure = {
    FILENAME: string,
    PRELOAD: optional(boolean),
    RELEASE: optional(boolean),
    FLUSHAFTERPLAYED: optional(boolean),
    ONINIT: optional(callback),
    ONFINISHED: optional(callback),
    ONSTARTED: optional(callback),
}

export type TimerDefinition = TypeDefinition & {
    ENABLED?: boolean
    ELAPSE: number
    TICKS?: number
    ONINIT?: callback
    ONTICK?: callbacks<number>
}

const TimerStructure = {
    ENABLED: optional(boolean),
    ELAPSE: number,
    TICKS: optional(number),
    ONINIT: optional(callback),
    ONTICK: optional(callbacks(number)),
}

export type BehaviourDefinition = TypeDefinition & {
    CODE: callback
    CONDITION?: reference
}

const BehaviourStructure = {
    CODE: callback,
    CONDITION: optional(reference),
}

export type ImageDefinition = TypeDefinition & {
    VISIBLE: boolean
    FILENAME: string
    TOCANVAS: boolean
    PRIORITY?: number
    PRELOAD?: boolean
    RELEASE?: boolean
    MONITORCOLLISION?: boolean
    MONITORCOLLISIONALPHA?: boolean
    ONINIT?: callback
}

const ImageStructure = {
    VISIBLE: boolean,
    FILENAME: string,
    TOCANVAS: boolean,
    PRIORITY: optional(number),
    PRELOAD: optional(boolean),
    RELEASE: optional(boolean),
    MONITORCOLLISION: optional(boolean),
    MONITORCOLLISIONALPHA: optional(boolean),
    ONINIT: optional(callback),
}

export type MouseDefinition = TypeDefinition & {
    ONCLICK?: callbacks<string>
    ONRELEASE?: callbacks<string>
    ONINIT?: callback
    ONMOVE?: callback
}

const MouseStructure = {
    ONCLICK: optional(callbacks(string)),
    ONRELEASE: optional(callbacks(string)),
    ONINIT: optional(callback),
    ONMOVE: optional(callback),
}

export type KeyboardDefinition = TypeDefinition & {
    ONKEYDOWN?: callbacks<string>
    ONKEYUP?: callbacks<string>
}

const KeyboardStructure = {
    ONKEYDOWN: optional(callbacks(string)),
    ONKEYUP: optional(callbacks(string)),
}

export type CanvasObserverDefinition = TypeDefinition & NonNullable<unknown>
const CanvasObserverStructure = {}

export type CNVLoaderDefinition = TypeDefinition & NonNullable<unknown>
const CNVLoaderStructure = {}

export type ConditionDefinition = TypeDefinition & {
    OPERAND1: callback
    OPERATOR: 'EQUAL' | 'NOTEQUAL' | 'LESS' | 'GREATER' | 'LESSEQUAL' | 'GREATEREQUAL'
    OPERAND2: callback
    ONRUNTIMESUCCESS?: callback
    ONRUNTIMEFAILED?: callback
}

const ConditionDefinitionStructure = {
    OPERAND1: code,
    OPERATOR: string,
    OPERAND2: code,
    ONRUNTIMESUCCESS: optional(callback),
    ONRUNTIMEFAILED: optional(callback),
}

export type StringDefinition = TypeDefinition & {
    TOINI?: boolean
    VALUE?: string
    DEFAULT?: string
    ONINIT?: callback
    ONCHANGED?: callbacks<string>
    ONBRUTALCHANGED?: callbacks<string>
}

const StringDefinitionStructure = {
    TOINI: optional(boolean),
    VALUE: optional(string),
    DEFAULT: optional(string),
    ONINIT: optional(callback),
    ONCHANGED: optional(callbacks(string)),
    ONBRUTALCHANGED: optional(callbacks(string)),
}

export type BoolDefinition = TypeDefinition & {
    VALUE?: boolean
    DEFAULT?: boolean
    ONCHANGED?: callbacks<boolean>
    ONBRUTALCHANGED?: callbacks<boolean>
}

const BoolDefinitionStructure = {
    VALUE: optional(boolean),
    DEFAULT: optional(boolean),
    ONCHANGED: optional(callbacks(boolean)),
    ONBRUTALCHANGED: optional(callbacks(boolean)),
}

export type ArrayDefinition = TypeDefinition & {
    ONINIT?: callback
}

const ArrayDefinitionStructure = {
    ONINIT: optional(callback),
}

export type MultiArrayDefinition = TypeDefinition & {
    DIMENSIONS: number
}

const MultiArrayDefinitionStructure = {
    DIMENSIONS: number,
}

export type ButtonDefinition = TypeDefinition & {
    DRAGGABLE?: boolean
    ENABLE: boolean
    VISIBLE?: boolean
    GFXSTANDARD?: reference
    GFXONCLICK?: reference
    GFXONMOVE?: reference
    RECT?: Array<number> | reference
    SNDONMOVE?: reference
    ONACTION?: callback
    ONCLICKED?: callback
    ONDRAGGING?: callback
    ONENDDRAGGING?: callback
    ONFOCUSON?: callback
    ONFOCUSOFF?: callback
    ONRELEASED?: callback
    ONSTARTDRAGGING?: callback
    ONINIT?: callback
}

const ButtonDefinitionStructure = {
    DRAGGABLE: optional(boolean),
    ENABLE: boolean,
    VISIBLE: optional(boolean),
    GFXSTANDARD: optional(reference),
    GFXONCLICK: optional(reference),
    GFXONMOVE: optional(reference),
    SNDONMOVE: optional(reference),
    RECT: optional({
        name: 'rect',
        processor: (object: any, key: string, param: string, value: string) => {
            const parts = value.split(',')
            if (parts.length == 4) {
                return array(number).processor(object, key, param, value)
            } else {
                return reference.processor(object, key, param, value)
            }
        },
    }),
    ONACTION: optional(callback),
    ONCLICKED: optional(callback),
    ONDRAGGING: optional(callback),
    ONENDDRAGGING: optional(callback),
    ONFOCUSON: optional(callback),
    ONFOCUSOFF: optional(callback),
    ONRELEASED: optional(callback),
    ONSTARTDRAGGING: optional(callback),
    ONINIT: optional(callback),
}

export type SequenceDefinition = TypeDefinition & {
    FILENAME: string
    ONFINISHED?: callbacks<string>
    ONSTARTED?: callbacks<string>
    ONINIT?: callback
}

const SequenceDefinitionStructure = {
    FILENAME: string,
    ONFINISHED: optional(callbacks(string)),
    ONSTARTED: optional(callbacks(string)),
    ONINIT: optional(callback),
}

export type GroupDefinition = TypeDefinition & {
    ONINIT?: callback
}

const GroupDefinitionStructure = {
    ONINIT: optional(callback),
}

export type TextDefinition = TypeDefinition & {
    VISIBLE: boolean
    VJUSTIFY?: boolean
    TOCANVAS: boolean
    RECT: Array<number>
    PRIORITY?: number
    MONITORCOLLISIONALPHA: boolean
    MONITORCOLLISION: boolean
    FONT: string
}

const TextDefinitionStructure = {
    VISIBLE: boolean,
    VJUSTIFY: optional(boolean),
    TOCANVAS: boolean,
    RECT: array(number),
    PRIORITY: number,
    MONITORCOLLISIONALPHA: boolean,
    MONITORCOLLISION: boolean,
    FONT: string,
}

export type FontDefinition = TypeDefinition & {
    DEF_ARIAL_STANDARD_14: string // wtf
}

const FontDefinitionStructure = {
    DEF_ARIAL_STANDARD_14: string, // wtf
}

export type ComplexConditionDefinition = TypeDefinition & {
    CONDITION1: reference
    CONDITION2: reference
    ONRUNTIMEFAILED?: callback
    ONRUNTIMESUCCESS?: callback
    OPERATOR: 'AND' | 'OR'
}

const ComplexConditionDefinitionStructure = {
    CONDITION1: reference,
    CONDITION2: reference,
    ONRUNTIMEFAILED: optional(callback),
    ONRUNTIMESUCCESS: optional(callback),
    OPERATOR: string,
}

export type RandDefinition = TypeDefinition

const RandDefinitionStructure = {}

export type DoubleDefinition = TypeDefinition & {
    VALUE?: string
    DEFAULT?: number
}

const DoubleStructure = {
    VALUE: optional(number),
    DEFAULT: optional(number),
}

export type ExpressionDefinition = TypeDefinition & {
    OPERAND1: callback
    OPERATOR: 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MOD'
    OPERAND2: callback
}

const ExpressionDefinitionStructure = {
    OPERAND1: code,
    OPERATOR: string,
    OPERAND2: code,
}

export type VectorDefinition = TypeDefinition & {
    SIZE: number
    VALUE: Array<number>
}

const VectorDefinitionStructure = {
    SIZE: number,
    VALUE: array(number),
}

export type StaticFilterDefinition = TypeDefinition & {
    ACTION: string
}

const StaticFilterDefinitionStructure = {
    ACTION: string,
}

export type FilterDefinition = TypeDefinition & {
    ACTION: string
}

const FilterDefinitionStructure = {
    ACTION: string,
}

export const structureDefinitions = {
    APPLICATION: ApplicationStructure,
    EPISODE: EpisodeStructure,
    SCENE: SceneStructure,
    INTEGER: IntegerStructure,
    ANIMO: AnimoStructure,
    MUSIC: MusicStructure,
    TIMER: TimerStructure,
    BEHAVIOUR: BehaviourStructure,
    IMAGE: ImageStructure,
    MOUSE: MouseStructure,
    KEYBOARD: KeyboardStructure,
    CANVASOBSERVER: CanvasObserverStructure,
    CANVAS_OBSERVER: CanvasObserverStructure,
    CNVLOADER: CNVLoaderStructure,
    CONDITION: ConditionDefinitionStructure,
    SOUND: SoundStructure,
    STRING: StringDefinitionStructure,
    BOOL: BoolDefinitionStructure,
    ARRAY: ArrayDefinitionStructure,
    BUTTON: ButtonDefinitionStructure,
    SEQUENCE: SequenceDefinitionStructure,
    GROUP: GroupDefinitionStructure,
    TEXT: TextDefinitionStructure,
    FONT: FontDefinitionStructure,
    COMPLEXCONDITION: ComplexConditionDefinitionStructure,
    RAND: RandDefinitionStructure,
    DOUBLE: DoubleStructure,
    EXPRESSION: ExpressionDefinitionStructure,
    VECTOR: VectorDefinitionStructure,
    STATICFILTER: StaticFilterDefinitionStructure,
    FILTER: FilterDefinitionStructure,
    MULTIARRAY: MultiArrayDefinitionStructure,
} as any
