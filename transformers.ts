import * as ts from 'typescript'
import { parameter, parameterType } from './src/types'

const getLiteralType = (literal: ts.LiteralTypeNode) => {
    if (ts.isStringLiteral(literal)) {
        return 'string'
    } else if (ts.isNumericLiteral(literal)) {
        return 'number'
    }
    return 'string'
}

export const typeGuard = (program: ts.Program) => (context: any) => {
    return (sourceFile: ts.SourceFile) => {
        const visitor = (node: ts.Node) => {
            if (ts.isDecorator(node)) {
                const decorator = node as ts.Decorator
                const decoratorName = decorator.getText()
                if (decoratorName !== '@method()') {
                    return
                }

                const parent = node.parent
                if (ts.isMethodDeclaration(parent)) {
                    const method = parent as ts.MethodDeclaration

                    const paramTypes: parameter[] = []
                    for (const param of method.parameters) {
                        const type = param.type
                        if (type === undefined) {
                            continue
                        }

                        const isOptional = param.questionToken !== undefined || param.initializer !== undefined
                        const isRest = ts.isRestParameter(param)

                        if (ts.isUnionTypeNode(type)) {
                            const argSubTypes: parameterType[] = []
                            // GetChildren seems to get something else
                            type.forEachChild((c) => {
                                const isLiteral = ts.isLiteralTypeNode(c)

                                // @ts-expect-error We are accessing internal text field that doesn't have quotes
                                const literalValue = isLiteral ? c.literal.text : null

                                argSubTypes.push({
                                    name: isLiteral ? getLiteralType(c) : c.getText().replace(/\[]$/, ''),
                                    literal: literalValue,
                                    isArray: ts.isArrayTypeNode(c) && !isRest,
                                })
                            })
                            paramTypes.push({
                                name: param.name.getText(),
                                types: argSubTypes,
                                optional: isOptional,
                                rest: isRest,
                            })
                        } else {
                            const isLiteral = ts.isLiteralTypeNode(type)

                            // @ts-expect-error We are accessing internal text field that doesn't have quotes
                            const literalValue = isLiteral ? type.literal.text : null

                            paramTypes.push({
                                name: param.name.getText(),
                                types: [
                                    {
                                        name: isLiteral ? getLiteralType(type) : type.getText().replace(/\[]$/, ''),
                                        literal: literalValue,
                                        isArray: ts.isArrayTypeNode(type) && !isRest,
                                    },
                                ],
                                optional: isOptional,
                                rest: isRest,
                            })
                        }
                    }

                    const createTypeEntry = (info: parameter) => {
                        return ts.factory.createObjectLiteralExpression([
                            ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(info.name)),
                            ts.factory.createPropertyAssignment(
                                'types',
                                ts.factory.createArrayLiteralExpression(
                                    info.types.map((param) => {
                                        let literal: ts.Expression = ts.factory.createNull()
                                        if (param.literal !== null) {
                                            if (typeof param.literal === 'string') {
                                                literal = ts.factory.createStringLiteral(param.literal)
                                            } else if (typeof param.literal === 'number') {
                                                literal = ts.factory.createNumericLiteral(param.literal)
                                            }
                                        }

                                        return ts.factory.createObjectLiteralExpression([
                                            ts.factory.createPropertyAssignment(
                                                'name',
                                                ts.factory.createStringLiteral(param.name)
                                            ),
                                            ts.factory.createPropertyAssignment('literal', literal),
                                            ts.factory.createPropertyAssignment(
                                                'isArray',
                                                param.isArray ? ts.factory.createTrue() : ts.factory.createFalse()
                                            ),
                                        ])
                                    })
                                )
                            ),
                            ts.factory.createPropertyAssignment(
                                'optional',
                                info.optional ? ts.factory.createTrue() : ts.factory.createFalse()
                            ),
                            ts.factory.createPropertyAssignment(
                                'rest',
                                info.rest ? ts.factory.createTrue() : ts.factory.createFalse()
                            ),
                        ])
                    }

                    const callExpression = decorator.expression as ts.CallExpression
                    return ts.factory.updateDecorator(
                        decorator,
                        ts.factory.updateCallExpression(
                            callExpression,
                            callExpression.expression,
                            undefined,
                            paramTypes.map((type) => createTypeEntry(type))
                        )
                    )
                }
            }

            return ts.visitEachChild(node, visitor, context)
        }

        return ts.visitNode(sourceFile, visitor)
    }
}
