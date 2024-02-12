const string = (object: any, key: string, param: string, value: string) => object[key] = value;
const number = (object: any, key: string, param: string, value: string) => object[key] = parseInt(value);
const boolean = (object: any, key: string, param: string, value: string) => object[key] === 'TRUE';
const stringArray = (object: any, key: string, param: string, value: string) => object[key] = value.split(',');
const callback = (object: any, key: string, param: string, value: string) => {
    if (!object.hasOwnProperty(key)) {
        object[key] = {};
    }

    if (value.startsWith('{')) {
        object[key][param] = {
            code: value.substring(1, value.length - 1)
        }
    } else {
        object[key][param] = {
            behaviourReference: value
        }
    }
}

export type callback = {
    behaviourReference?: string
    code?: string
}

export type Application = {
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

export type Episode = {
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

export type Scene = {
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

export type Integer = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: Record<string, callback>
}

const IntegerStructure = {
    VALUE: number,
    TOINI: boolean,
    ONCHANGED: callback
}

export const structureDefinitions = {
    APPLICATION: ApplicationStructure,
    EPISODE: EpisodeStructure,
    SCENE: SceneStructure,
    INTEGER: IntegerStructure
} as any
