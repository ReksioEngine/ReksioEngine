type FieldTypeParser = (object: any, key: string, param: string, value: string) => void

const string = (object: any, key: string, param: string, value: string) => object[key] = value
const number = (object: any, key: string, param: string, value: string) => object[key] = parseInt(value)
const boolean = (object: any, key: string, param: string, value: string) => object[key] = value === 'TRUE'
const stringArray = (object: any, key: string, param: string, value: string) => object[key] = value.split(',')
const callback = (object: any, key: string, param: string, value: string) => object[key] = createCallback(value)

const callbacks = <K>(object: any, key: string, param: string, value: string) => {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
        object[key] = {
            nonParametrized: null,
            parametrized: new Map<K, callback>()
        } as callbacks<K>
    }

    const callbackInstance = createCallback(value)
    if (param == undefined) {
        object[key].nonParametrized = callbackInstance
    } else {
        object[key].parametrized.set(param, callbackInstance)
    }
}

const convertParam = (func: FieldTypeParser, modifier: (value: string) => any) => {
    return <K>(object: any, key: string, param: string, value: string) => {
        func(object, key, modifier(param), value)
    }
}

const numberParam = (func: FieldTypeParser) => {
    return convertParam(func, (value => +value))
}

const createCallback = (value: string) => {
    return value.startsWith('{') ? {
        code: value.substring(1, value.length - 1),
        isSingleStatement: false
    } : {
        behaviourReference: value,
        isSingleStatement: false
    }
}

const code = (object: any, key: string, param: string, value: string) => {
    object[key] = {
        code: value,
        isSingleStatement: true
    }
}

const reference = (object: any, key: string, param: string, value: string) => {
    object[key] = {
        objectName: value
    }
}

export type callback = {
    behaviourReference?: string
    code?: string
    isSingleStatement: boolean
}

export type callbacks<K> = {
    nonParametrized: callback | null
    parametrized: Map<K, callback>
}

export type reference = {
    objectName: string
}

export type ApplicationDefinition = {
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

export type EpisodeDefinition = {
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

export type SceneDefinition = {
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

export type IntegerDefinition = {
    VALUE: number
    TOINI: boolean
    ONCHANGED: callbacks<number>
}

const IntegerStructure = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: numberParam(callbacks)
}

export type AnimoDefinition = {
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

export type MusicDefinition = {
    FILENAME: string
}

const MusicStructure = {
    FILENAME: string
}

export type SoundDefinition = {
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

export type TimerDefinition = {
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

export type BehaviourDefinition = {
    CODE: callback
    CONDITION: reference
}

const BehaviourStructure = {
    CODE: callback,
    CONDITION: reference
}

export type ImageDefinition = {
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

export type MouseDefinition = {
    ONCLICK: callback
}

const MouseStructure = {
    ONCLICK: callback
}

export type KeyboardDefinition = NonNullable<unknown>
const KeyboardStructure = {}

export type CanvasObserverDefinition = NonNullable<unknown>
const CanvasObserverStructure = {}

export type CNVLoaderDefinition = NonNullable<unknown>
const CNVLoaderStructure = {}

export type ConditionDefinition = {
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

export type StringDefinition = {
    TOINI: boolean
    VALUE: string
}

const StringDefinitionStructure = {
    TOINI: boolean,
    VALUE: string
}

export type BoolDefinition = {
    VALUE: boolean
}

const BoolDefinitionStructure = {
    VALUE: boolean
}

export type ArrayDefinition = NonNullable<unknown>

const ArrayDefinitionStructure = {}

export type ButtonDefinition = {
    VISIBLE: boolean
    ENABLE: boolean
    DRAGGABLE: boolean
    GFXSTANDARD: reference
    GFXONCLICK: reference
    GFXONMOVE: reference
    ONRELEASED: callback
}

const ButtonDefinitionStructure = {
    VISIBLE: boolean,
    ENABLE: boolean,
    DRAGGABLE: boolean,
    GFXSTANDARD: reference,
    GFXONCLICK: reference,
    GFXONMOVE: reference,
    ONRELEASED: callback
}

export type SequenceDefinition = {
    FILENAME: string
    ONFINISHED: callback
    ONINIT: callback
}

const SequenceDefinitionStructure = {
    FILENAME: string,
    ONFINISHED: callback,
    ONINIT: callback
}

export type GroupDefinition = NonNullable<unknown>
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
