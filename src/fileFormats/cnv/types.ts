const string = (object: any, key: string, param: string, value: string) => object[key] = value
const number = (object: any, key: string, param: string, value: string) => object[key] = parseInt(value)
const boolean = (object: any, key: string) => object[key] === 'TRUE'
const stringArray = (object: any, key: string, param: string, value: string) => object[key] = value.split(',')
const callback = (object: any, key: string, param: string, value: string) => {
    if (!Object.prototype.hasOwnProperty.call(object, key)) {
        object[key] = {}
    }

    let callbackInstance
    // Sometimes it doesn't end with }, but always start with
    if (value.startsWith('{')) {
        callbackInstance = {
            code: value.substring(1, value.length - 1),
            isSingleStatement: false
        }
    } else {
        callbackInstance = {
            behaviourReference: value,
            isSingleStatement: false
        }
    }

    if (param == undefined) {
        object[key] = callbackInstance
    } else {
        object[key][param] = callbackInstance
    }
}

const code = (object: any, key: string, param: string, value: string) => {
    object[key] = {
        code: value,
        isSingleStatement: true
    }
}

export type callback = {
    behaviourReference?: string
    code?: string
    isSingleStatement: boolean
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
    ONCHANGED: Record<number, callback>
}

const IntegerStructure = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: callback
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
    ONFINISHED: Record<string, callback>
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
    ONFINISHED: callback
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
}

const SoundStructure = {
    FILENAME: string,
    PRELOAD: boolean,
    FLUSHAFTERPLAYED: boolean,
    ONINIT: callback
}

export type TimerDefinition = {
    ENABLED: boolean
    ELAPSE: number
    TICKS: number
    ONINIT: callback
    ONTICK: callback
}

const TimerStructure = {
    ENABLED: boolean,
    ELAPSE: number,
    TICKS: number,
    ONINIT: callback,
    ONTICK: callback
}

export type BehaviourDefinition = {
    CODE: callback
}

const BehaviourStructure = {
    CODE: callback
}

export type ImageDefinition = {
    VISIBLE: boolean
    FILENAME: string
    TOCANVAS: boolean
    PRIORITY: number
    PRELOAD: boolean
    RELEASE: boolean
    MONITORCOLLISION: boolean
    MONITORCOLLISIONALPHA: boolean
}

const ImageStructure = {
    VISIBLE: boolean,
    FILENAME: string,
    TOCANVAS: boolean,
    PRIORITY: number,
    PRELOAD: boolean,
    RELEASE: boolean,
    MONITORCOLLISION: boolean,
    MONITORCOLLISIONALPHA: boolean
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
}

const ConditionDefinitionStructure = {
    OPERAND1: code,
    OPERATOR: string,
    OPERAND2: code
}

export type StringDefinition = {
    TOINI: boolean
}

const StringDefinitionStructure = {
    TOINI: boolean
}

export type BoolDefinition = {
    VALUE: boolean
}

const BoolDefinitionStructure = {
    VALUE: boolean
}

export type ArrayDefinition = NonNullable<unknown>

const ArrayDefinitionStructure = {}

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
    ARRAY: ArrayDefinitionStructure
} as any
