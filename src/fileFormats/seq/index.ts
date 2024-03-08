import {boolean, map, number, string, TypeDefinition} from '../common'

export interface SequenceFileEntry {
    TYPE: string
    [key: string]: any
}

type SequenceFile = { [key: string]: SequenceFileEntry }

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

type SequenceMember = {
    ADD: string // To what sequence should be added
}

export type SequenceDefinition = TypeDefinition & {
    MODE: string
    SEQEVENT: Map<string, number>
}
const SequenceDefinitionStructure = {
    MODE: string,
    SEQEVENT: map(number)
}

export type SimpleDefinition = TypeDefinition & SequenceMember & {
    FILENAME: string
    EVENT: string
}
const SimpleDefinitionStructure = {
    FILENAME: string,
    EVENT: string
}

export type SpeakingDefinition = TypeDefinition & SequenceMember & {
    ANIMOFN: string
    PREFIX: string
    WAVFN: string
    STARTING: string
    ENDING: boolean
}
const SpeakingDefinitionStructure = {
    ANIMOFN: string,
    PREFIX: string,
    WAVFN: string,
    STARTING: boolean,
    ENDING: boolean
}

export const structureDefinitions = {
    SEQUENCE: SequenceDefinitionStructure,
    SIMPLE: SimpleDefinitionStructure,
    SPEAKING: SpeakingDefinitionStructure
} as any
