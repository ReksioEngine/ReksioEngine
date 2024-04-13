import {
    array,
    boolean,
    callback,
    callbacks, code,
    number,
    numberParam,
    reference,
    string,
    stringArray,
    TypeDefinition
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
    EPISODES: stringArray,
    STARTWITH: string
}

export type EpisodeDefinition = TypeDefinition & {
    DESCRIPTION: string
    CREATIONTIME: string
    LASTMODIFYTIME: string
    AUTHOR: string
    VERSION: string
    PATH: string
    SCENES: Array<string>
    STARTWITH: string
}

const EpisodeStructure = {
    DESCRIPTION: string,
    CREATIONTIME: string,
    LASTMODIFYTIME: string,
    AUTHOR: string,
    VERSION: string,
    PATH: string,
    SCENES: stringArray,
    STARTWITH: string
}

export type SceneDefinition = TypeDefinition & {
    DESCRIPTION: string
    CREATIONTIME: string
    LASTMODIFYTIME: string
    VERSION: string
    PATH: string
    BACKGROUND: string
    MUSIC: string
    DLLS: Array<string>
}

const SceneStructure = {
    DESCRIPTION: string,
    CREATIONTIME: string,
    LASTMODIFYTIME: string,
    VERSION: string,
    PATH: string,
    BACKGROUND: string,
    MUSIC: string,
    DLLS: stringArray
}

export type IntegerDefinition = TypeDefinition & {
    VALUE: number
    TOINI: boolean
    ONCHANGED: callbacks<number>
    ONBRUTALCHANGED: callbacks<number>
}

const IntegerStructure = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: numberParam(callbacks),
    ONBRUTALCHANGED: numberParam(callbacks)
}

export type AnimoDefinition = TypeDefinition & {
    VISIBLE: boolean
    FILENAME: string
    TOCANVAS: boolean
    PRIORITY: number
    FPS: number
    PRELOAD: boolean
    RELEASE: boolean
    MONITORCOLLISION: boolean
    MONITORCOLLISIONALPHA: boolean
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
    PRIORITY: number,
    FPS: number,
    PRELOAD: boolean,
    RELEASE: boolean,
    MONITORCOLLISION: boolean,
    MONITORCOLLISIONALPHA: boolean,
    ONINIT: callback,
    ONFINISHED: callbacks,
    ONSTARTED: callbacks,
    ONFRAMECHANGED: callbacks,

    ONFOCUSON: callback,
    ONFOCUSOFF: callback,
    ONCLICKE: callback,
    ONRELEASE: callback
}

export type MusicDefinition = TypeDefinition & {
    FILENAME: string
}

const MusicStructure = {
    FILENAME: string
}

export type SoundDefinition = TypeDefinition & {
    FILENAME: string
    PRELOAD: boolean
    FLUSHAFTERPLAYED: boolean
    ONINIT: callback
    ONFINISHED: callback
}

const SoundStructure = {
    FILENAME: string,
    PRELOAD: boolean,
    FLUSHAFTERPLAYED: boolean,
    ONINIT: callback,
    ONFINISHED: callback
}

export type TimerDefinition = TypeDefinition & {
    ENABLED: boolean
    ELAPSE: number
    TICKS: number
    ONINIT: callback
    ONTICK: callbacks<number>
}

const TimerStructure = {
    ENABLED: boolean,
    ELAPSE: number,
    TICKS: number,
    ONINIT: callback,
    ONTICK: numberParam(callbacks)
}

export type BehaviourDefinition = TypeDefinition & {
    CODE: callback
    CONDITION: reference
}

const BehaviourStructure = {
    CODE: callback,
    CONDITION: reference
}

export type ImageDefinition = TypeDefinition & {
    VISIBLE: boolean
    FILENAME: string
    TOCANVAS: boolean
    PRIORITY: number
    PRELOAD: boolean
    RELEASE: boolean
    MONITORCOLLISION: boolean
    MONITORCOLLISIONALPHA: boolean,
    ONINIT: callback
}

const ImageStructure = {
    VISIBLE: boolean,
    FILENAME: string,
    TOCANVAS: boolean,
    PRIORITY: number,
    PRELOAD: boolean,
    RELEASE: boolean,
    MONITORCOLLISION: boolean,
    MONITORCOLLISIONALPHA: boolean,
    ONINIT: callback
}

export type MouseDefinition = TypeDefinition & {
    ONCLICK: callbacks<string>
}

const MouseStructure = {
    ONCLICK: callbacks
}

export type KeyboardDefinition = TypeDefinition & NonNullable<unknown>
const KeyboardStructure = {}

export type CanvasObserverDefinition = TypeDefinition & NonNullable<unknown>
const CanvasObserverStructure = {}

export type CNVLoaderDefinition = TypeDefinition & NonNullable<unknown>
const CNVLoaderStructure = {}

export type ConditionDefinition = TypeDefinition & {
    OPERAND1: callback
    OPERATOR: 'EQUAL' | 'NOTEQUAL' | 'LESS' | 'GREATER' | 'LESSEQUAL' | 'GREATEREQUAL'
    OPERAND2: callback
    ONRUNTIMESUCCESS: callback
    ONRUNTIMEFAILED: callback
}

const ConditionDefinitionStructure = {
    OPERAND1: code,
    OPERATOR: string,
    OPERAND2: code,
    ONRUNTIMESUCCESS: callback,
    ONRUNTIMEFAILED: callback
}

export type StringDefinition = TypeDefinition & {
    TOINI: boolean
    VALUE: string
    ONCHANGED: callbacks<string>
    ONBRUTALCHANGED: callbacks<string>
}

const StringDefinitionStructure = {
    TOINI: boolean,
    VALUE: string,
    ONCHANGED: callbacks,
    ONBRUTALCHANGED: callbacks
}

export type BoolDefinition = TypeDefinition & {
    VALUE: boolean
}

const BoolDefinitionStructure = {
    VALUE: boolean
}

export type ArrayDefinition = TypeDefinition & {
    ONINIT: callback
}

const ArrayDefinitionStructure = {
    ONINIT: callback
}

export type ButtonDefinition = TypeDefinition & {
    VISIBLE: boolean
    ENABLE: boolean
    DRAGGABLE: boolean
    GFXSTANDARD?: reference
    GFXONCLICK?: reference
    GFXONMOVE?: reference
    ONRELEASED?: callback
    ONCLICKED?: callback
    ONFOCUSON?: callback
    ONFOCUSOFF?: callback
    ONINIT?: callback
    RECT?: Array<number>
}

const ButtonDefinitionStructure = {
    VISIBLE: boolean,
    ENABLE: boolean,
    DRAGGABLE: boolean,
    GFXSTANDARD: reference,
    GFXONCLICK: reference,
    GFXONMOVE: reference,
    ONRELEASED: callback,
    ONCLICKED: callback,
    ONFOCUSON: callback,
    ONFOCUSOFF: callback,
    ONINIT: callback,
    RECT: array(number)
}

export type SequenceDefinition = TypeDefinition & {
    FILENAME: string
    ONFINISHED: callback
    ONINIT: callback
}

const SequenceDefinitionStructure = {
    FILENAME: string,
    ONFINISHED: callback,
    ONINIT: callback
}

export type GroupDefinition = TypeDefinition & NonNullable<unknown>
const GroupDefinitionStructure = {}

export type TextDefinition = TypeDefinition & {
    VISIBLE: boolean
    VJUSTIFY: boolean
    TOCANVAS: boolean
    RECT: Array<number>
    PRIORITY: number
    MONITORCOLLISIONALPHA: boolean
    MONITORCOLLISION: boolean
    FONT: string
}

const TextDefinitionStructure = {
    VISIBLE: boolean,
    VJUSTIFY: boolean,
    TOCANVAS: boolean,
    RECT: array(number),
    PRIORITY: number,
    MONITORCOLLISIONALPHA: boolean,
    MONITORCOLLISION: boolean,
    FONT: string
}

export type FontDefinition = TypeDefinition & {
    DEF_ARIAL_STANDARD_14: string // wtf
}

const FontDefinitionStructure = {
    DEF_ARIAL_STANDARD_14: string // wtf
}

export type ComplexConditionDefinition = TypeDefinition & {
    CONDITION1: reference,
    CONDITION2: reference,
    ONRUNTIMEFAILED: callback,
    ONRUNTIMESUCCESS: callback,
    OPERATOR: 'AND' | 'OR',
}

const ComplexConditionDefinitionStructure = {
    CONDITION1: reference,
    CONDITION2: reference,
    ONRUNTIMEFAILED: callback,
    ONRUNTIMESUCCESS: callback,
    OPERATOR: string
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
    COMPLEXCONDITION: ComplexConditionDefinitionStructure
} as any
