import { structureDefinitions } from './types'
import { FieldTypeEntry } from '../common'

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

        if (key === 'OBJECT') {
            objects[value] = {
                TYPE: 'unknown',
                NAME: value,
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
                const fieldTypeDefinition: FieldTypeEntry = definition[variableName]
                try {
                    const processedValue = fieldTypeDefinition.processor(object, variableName, param, value)
                    if (processedValue !== undefined) {
                        object[variableName] = processedValue
                    }
                } catch (err) {
                    console.error(
                        'Failed to process CNV field\n' +
                            `%cObject name:%c ${objectName}\n` +
                            `%cObject type:%c ${object.TYPE}\n` +
                            `%cField name:%c ${variableName}\n` +
                            `%cParam:%c ${param}\n` +
                            '%cValue:%c %O',
                        'font-weight: bold',
                        'font-weight: inherit',
                        'font-weight: bold',
                        'font-weight: inherit',
                        'font-weight: bold',
                        'font-weight: inherit',
                        'font-weight: bold',
                        'font-weight: inherit',
                        'font-weight: bold',
                        'font-weight: inherit',
                        value
                    )
                    throw err
                }
            } else {
                if (variableName.startsWith('ON')) {
                    if (param) {
                        console.warn(
                            `Unsupported parametrized event callback "${variableName}" with param "${param}" in type ${object.TYPE}`
                        )
                    } else {
                        console.warn(
                            `Unsupported non-parametrized event callback "${variableName}" in type ${object.TYPE}`
                        )
                    }
                } else if (variableName !== 'TYPE') {
                    console.warn(`Unsupported field ${variableName} in type ${object.TYPE}`)
                }
                object[variableName] = value
            }
        }
    }

    for (const object of Object.values(objects)) {
        const typeDefinition = structureDefinitions[object.TYPE]
        for (const field in typeDefinition) {
            const typeInfo: FieldTypeEntry = typeDefinition[field]

            if (!(field in object) && !typeInfo?.flags?.optional) {
                console.warn(`Field '${field}' in type ${object.TYPE} is missing but is not optional`)
            }
        }
    }

    return objects
}
