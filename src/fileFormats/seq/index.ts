import { boolean, map, string } from '../common'
import { assert } from '../../errors'

export interface SequenceFileEntry {
    TYPE: string
    NAME: string
    [key: string]: any
}

export type SequenceFile = SequenceFileEntry[]

export const parseSequence = (content: string): SequenceFile => {
    const lines = content.split('\n')
    const objectsMap = new Map<string, SequenceFileEntry>()

    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') {
            continue
        }

        const [key, value] = line.split(/[\s=]+/)
        if (key === 'NAME') {
            objectsMap.set(value, {
                NAME: value,
                TYPE: 'unknown',
            })
        } else {
            const [objectName, variableName, subKey] = key.split(':')
            const object = objectsMap.get(objectName)
            assert(object !== undefined)

            const definition = structureDefinitions[object.TYPE]
            if (definition && variableName in definition) {
                const typeDefinition = definition[variableName]
                object[variableName] = typeDefinition.processor(object, variableName, subKey, value)
            } else {
                object[variableName] = value
            }
        }
    }

    return Array.from(objectsMap.values())
}

export type SequenceSequence = SequenceFileEntry & {
    MODE: 'PARAMETER' | 'SEQUENCE' | 'RANDOM'
}

export type ParameterSequence = SequenceSequence & {
    SEQEVENT?: Map<string, string> // Only for PARAMETER
}

export type NormalSequence = SequenceSequence & {
    ADD: string // Only for SEQUENCE and RANDOM
}

const SequenceSequenceStructure = {
    MODE: string,
    SEQEVENT: map(string),
    ADD: string,
}

export type Simple = SequenceFileEntry & {
    FILENAME: string
    EVENT: string
    ADD: string
}
const SimpleStructure = {
    FILENAME: string,
    EVENT: string,
    ADD: string,
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
    ADD: string,
}

export const structureDefinitions = {
    SEQUENCE: SequenceSequenceStructure,
    SIMPLE: SimpleStructure,
    SPEAKING: SpeakingStructure,
} as any
