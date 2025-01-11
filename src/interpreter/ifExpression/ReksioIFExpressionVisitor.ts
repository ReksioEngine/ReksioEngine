// Generated from ./src/interpreter/ifExpression/ReksioIFExpression.g4 by ANTLR 4.13.2

import { ParseTreeVisitor } from 'antlr4'

import { ExprListContext } from './ReksioIFExpressionParser.js'
import { ExprContext } from './ReksioIFExpressionParser.js'
import { ValueContext } from './ReksioIFExpressionParser.js'
import { NumberContext } from './ReksioIFExpressionParser.js'
import { StringContext } from './ReksioIFExpressionParser.js'
import { IdentifierContext } from './ReksioIFExpressionParser.js'
import { LogicOperatorContext } from './ReksioIFExpressionParser.js'

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ReksioIFExpressionParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class ReksioIFExpressionVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.exprList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExprList?: (ctx: ExprListContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpr?: (ctx: ExprContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.value`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitValue?: (ctx: ValueContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.number`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumber?: (ctx: NumberContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitString?: (ctx: StringContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifier?: (ctx: IdentifierContext) => Result
    /**
     * Visit a parse tree produced by `ReksioIFExpressionParser.logicOperator`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitLogicOperator?: (ctx: LogicOperatorContext) => Result
}
