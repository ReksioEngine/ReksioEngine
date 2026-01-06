import { structureDefinitions } from './types'
import { FieldProcessorRecoverableError, FieldTypeEntry } from '../common'
import { logger } from '../../engine/logging'

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

        const parts = splitOnce(line, '=')
        if (parts.length < 2) {
            continue
        }

        const [key, value] = parts
        if (key === 'OBJECT' && !objects[value]) {
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
            if (object === undefined) {
                continue
            }

            if (variableName !== 'TYPE' && !Object.prototype.hasOwnProperty.call(structureDefinitions, object.TYPE)) {
                throw new Error(`Objects of type ${object.TYPE} are not supported`)
            }

            const definition = structureDefinitions[object.TYPE]
            const supportedVariablesRaw = definition ? Object.keys(definition) : []
            const supportedVariables = supportedVariablesRaw.map((name) => {
                if (!name.includes('%')) {
                    return {
                        pattern: name,
                        name: name,
                    }
                }

                const regexName = name.replaceAll('%s', '([a-zA-Z]+)').replaceAll('%d', '([0-9]+)')

                const pattern = new RegExp(`^${regexName}$`, 'g')
                return {
                    pattern,
                    name,
                }
            })

            const supportedVariable = supportedVariables.find((entry) => {
                const { pattern } = entry
                if (pattern instanceof RegExp) {
                    return pattern.test(variableName)
                } else {
                    return pattern === variableName
                }
            })

            if (definition && supportedVariable) {
                const fieldName = supportedVariable.name
                const fieldTypeDefinition: FieldTypeEntry = definition[fieldName]
                try {
                    const cleanedValue = value.trim()
                    const processedValue = fieldTypeDefinition.processor(object, fieldName, param, cleanedValue)
                    if (processedValue !== undefined) {
                        object[fieldName] = processedValue
                    }
                } catch (err) {
                    if (err instanceof FieldProcessorRecoverableError) {
                        logger.error('Recoverable error occured', {
                            objectName,
                            objectType: object.TYPE,
                            object,
                            fieldName,
                            param,
                            value
                        }, err)
                        continue
                    }

                    logger.error('Failed to process CNV field', {
                        objectName,
                        objectType: object.TYPE,
                        object,
                        fieldName,
                        param,
                        value
                    }, err)
                    throw err
                }
            } else {
                if (variableName.startsWith('ON')) {
                    if (param) {
                        logger.warn(
                            `Unsupported parametrized event callback "${variableName}" with param "${param}" in type ${object.TYPE}`,
                            {
                                object
                            }
                        )
                    } else {
                        logger.warn(
                            `Unsupported non-parametrized event callback "${variableName}" in type ${object.TYPE}`,
                            {
                                object
                            }
                        )
                    }
                } else if (variableName !== 'TYPE') {
                    logger.warn(`Unsupported field ${variableName} in type ${object.TYPE}`, {
                        object
                    })
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
                logger.warn(`Field '${field}' in type ${object.TYPE} is missing but is not optional`, {
                    object
                })
            }
        }
    }

    return objects
}
