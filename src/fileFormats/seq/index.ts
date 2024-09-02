import {boolean, map, number, string} from '../common'

export interface SequenceFileEntry {
    TYPE: string
    NAME: string
    [key: string]: any
}

export type SequenceFile = { [key: string]: SequenceFileEntry }

export const parseSequence = (content: string) => {
    const lines = content.split('\n')
    const objects: SequenceFile = {}

    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') {
            continue
        }

        const [key, value] = line.split(/[\s=]+/)
        if (key === 'NAME') {
            objects[value] = {
                NAME: value,
                TYPE: 'unknown'
            }
        } else {
            const [objectName, variableName, subKey] = key.split(':')
            const object = objects[objectName]
            const definition = structureDefinitions[object.TYPE]

            if (definition && variableName in definition) {
                definition[variableName](object, variableName, subKey, value)
            } else {
                object[variableName] = value
            }
        }
    }

    return objects
}

export type SequenceSequence = SequenceFileEntry & {
    MODE: 'PARAMETER' | 'SEQUENCE' | 'RANDOM'
}
export type ParameterSequence = SequenceSequence & {
    SEQEVENT?: Record<string, number> // Only for PARAMETER
}
export type NormalSequence = SequenceSequence & {
    ADD: string // Only for SEQUENCE and RANDOM
}
const SequenceSequenceStructure = {
    MODE: string,
    SEQEVENT: map(number),
    ADD: string
}

export type Simple = SequenceFileEntry & {
    FILENAME: string
    EVENT: string
    ADD: string
}
const SimpleStructure = {
    FILENAME: string,
    EVENT: string,
    ADD: string
}

export type Speaking = SequenceFileEntry & {
    ANIMOFX: string
    PREFIX: string
    WAVFN: string
    STARTING: boolean
    ENDING: boolean
    ADD: string
}
const SpeakingStructure = {
    ANIMOFX: string,
    PREFIX: string,
    WAVFN: string,
    STARTING: boolean,
    ENDING: boolean,
    ADD: string
}

export const structureDefinitions = {
    SEQUENCE: SequenceSequenceStructure,
    SIMPLE: SimpleStructure,
    SPEAKING: SpeakingStructure
} as any
