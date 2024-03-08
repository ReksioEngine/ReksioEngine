import {structureDefinitions} from './types'

export interface CNVObject {
    TYPE: string
    [key: string]: any
}

export type CNV = { [key: string]: CNVObject }

const splitOnce = (text: string, separator: string) => {
    const index = text.indexOf(separator)
    return [text.substring(0, index), text.substring(index + 1)]
}

export const parseCNV = (content: string) => {
    const lines = content.split('\n')
    const objects: CNV = {}

    for (const line of lines) {
        // Ignore comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
            continue
        }

        // eslint-disable-next-line prefer-const
        let [key, value] = splitOnce(line, '=')

        // Check if value is empty
        if (value === '""') {
            value = ''
        }

        if (key === 'OBJECT') {
            objects[value] = {
                TYPE: 'unknown',
                _NAME: value
            }
        } else {
            // eslint-disable-next-line prefer-const
            let [objectName, variablePart] = splitOnce(key, ':')

            // There are sometimes some '?' instead of '_' in object names
            // like some assignments have '?' and some '_'
            // probably some game editor fault
            objectName = objectName.replace('/?/g', '_')

            const [variableName, param] = variablePart.split('^')
            const object = objects[objectName]
            const definition = structureDefinitions[object.TYPE]

            if (definition && variableName in definition) {
                definition[variableName](object, variableName, param, value)
            } else {
                object[variableName] = value
            }
        }
    }

    return objects
}
