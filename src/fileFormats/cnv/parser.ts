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
                TYPE: 'unknown'
            }
        } else {
            // eslint-disable-next-line prefer-const
            let [objectName, variablePart] = splitOnce(key, ':')
            objectName = objectName.replace('/?/g', '_')

            const [variableName, param] = variablePart.split('^')

            if ('TYPE' in objects[objectName] && objects[objectName]['TYPE'] in structureDefinitions && variableName in structureDefinitions[objects[objectName]['TYPE']]) {
                structureDefinitions[objects[objectName]['TYPE']][variableName](objects[objectName], variableName, param, value)
            } else {
                objects[objectName][variableName] = value
            }
        }
    }

    return objects
}
