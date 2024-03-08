import {
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
}

const IntegerStructure = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: numberParam(callbacks)
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
    ONINIT: callback
    ONFINISHED: callbacks<string>
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
    ONFINISHED: callbacks
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
    ONCLICK: callback
}

const MouseStructure = {
    ONCLICK: callback
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
}

const StringDefinitionStructure = {
    TOINI: boolean,
    VALUE: string
}

export type BoolDefinition = TypeDefinition & {
    VALUE: boolean
}

const BoolDefinitionStructure = {
    VALUE: boolean
}

export type ArrayDefinition = TypeDefinition & NonNullable<unknown>

const ArrayDefinitionStructure = {}

export type ButtonDefinition = TypeDefinition & {
    VISIBLE: boolean
    ENABLE: boolean
    DRAGGABLE: boolean
    GFXSTANDARD: reference
    GFXONCLICK: reference
    GFXONMOVE: reference
    ONRELEASED: callback
    ONFOCUSON: callback
}

const ButtonDefinitionStructure = {
    VISIBLE: boolean,
    ENABLE: boolean,
    DRAGGABLE: boolean,
    GFXSTANDARD: reference,
    GFXONCLICK: reference,
    GFXONMOVE: reference,
    ONRELEASED: callback,
    ONFOCUSON: callback
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
    GROUP: GroupDefinitionStructure
} as any
