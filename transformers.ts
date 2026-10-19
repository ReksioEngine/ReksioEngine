import * as ts from 'typescript'
import { parameter, parameterType } from './src/common/types'

const primitiveReturnTypes = ['int', 'double', 'string', 'boolean']

const primitiveReturnType = (type: ts.TypeNode | undefined): string | undefined => {
    if (type === undefined) {
        return undefined
    }
    if (ts.isTypeReferenceNode(type) && type.typeName.getText() === 'Promise' && type.typeArguments?.length === 1) {
        return primitiveReturnType(type.typeArguments[0])
    }

    const types = ts.isUnionTypeNode(type) ? [...type.types] : [type]
    const names = types.map((subType) => subType.getText()).filter((name) => !['null', 'undefined'].includes(name))
    return names.length === 1 && primitiveReturnTypes.includes(names[0]) ? names[0] : undefined
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

                        const subTypes: ts.Node[] = []
                        if (ts.isUnionTypeNode(type)) {
                            // GetChildren seems to get something else
                            type.forEachChild((c) => {
                                subTypes.push(c)
                            })
                        } else {
                            subTypes.push(type)
                        }

                        paramTypes.push({
                            name: param.name.getText(),
                            types: subTypes.map(
                                (subType): parameterType => ({ name: subType.getText().replace(/\[]$/, '') })
                            ),
                            optional: isOptional,
                            rest: isRest,
                        })
                    }

                    const createTypeEntry = (info: parameter) => {
                        return ts.factory.createObjectLiteralExpression([
                            ts.factory.createPropertyAssignment('name', ts.factory.createStringLiteral(info.name)),
                            ts.factory.createPropertyAssignment(
                                'types',
                                ts.factory.createArrayLiteralExpression(
                                    info.types.map((param) =>
                                        ts.factory.createObjectLiteralExpression([
                                            ts.factory.createPropertyAssignment(
                                                'name',
                                                ts.factory.createStringLiteral(param.name)
                                            ),
                                        ])
                                    )
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

                    const callArguments: ts.Expression[] = [
                        ts.factory.createArrayLiteralExpression(paramTypes.map((type) => createTypeEntry(type))),
                    ]
                    const returns = primitiveReturnType(method.type)
                    if (returns !== undefined) {
                        callArguments.push(ts.factory.createStringLiteral(returns))
                    }

                    const callExpression = decorator.expression as ts.CallExpression
                    return ts.factory.updateDecorator(
                        decorator,
                        ts.factory.updateCallExpression(
                            callExpression,
                            callExpression.expression,
                            undefined,
                            callArguments
                        )
                    )
                }
            }

            return ts.visitEachChild(node, visitor, context)
        }

        return ts.visitNode(sourceFile, visitor)
    }
}
