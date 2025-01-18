// Generated from ./src/interpreter/script/ReksioLang.g4 by ANTLR 4.13.2

import { ParseTreeVisitor } from 'antlr4'

import { ExprContext } from './ReksioLangParser.js'
import { StatementContext } from './ReksioLangParser.js'
import { StatementListContext } from './ReksioLangParser.js'
import { MethodCallContext } from './ReksioLangParser.js'
import { ObjectNameContext } from './ReksioLangParser.js'
import { MethodNameContext } from './ReksioLangParser.js'
import { MethodCallArgumentsContext } from './ReksioLangParser.js'
import { SpecialCallContext } from './ReksioLangParser.js'
import { OperationGroupingContext } from './ReksioLangParser.js'
import { OperationContext } from './ReksioLangParser.js'
import { CommentContext } from './ReksioLangParser.js'
import { NumberContext } from './ReksioLangParser.js'
import { BoolContext } from './ReksioLangParser.js'
import { StringContext } from './ReksioLangParser.js'
import { IdentifierContext } from './ReksioLangParser.js'

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ReksioLangParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class ReksioLangVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `ReksioLangParser.expr`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExpr?: (ctx: ExprContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.statement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatement?: (ctx: StatementContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.statementList`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStatementList?: (ctx: StatementListContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.methodCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodCall?: (ctx: MethodCallContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.objectName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitObjectName?: (ctx: ObjectNameContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.methodName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodName?: (ctx: MethodNameContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.methodCallArguments`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMethodCallArguments?: (ctx: MethodCallArgumentsContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.specialCall`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSpecialCall?: (ctx: SpecialCallContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.operationGrouping`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOperationGrouping?: (ctx: OperationGroupingContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.operation`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOperation?: (ctx: OperationContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.comment`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitComment?: (ctx: CommentContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.number`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitNumber?: (ctx: NumberContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.bool`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitBool?: (ctx: BoolContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.string`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitString?: (ctx: StringContext) => Result
    /**
     * Visit a parse tree produced by `ReksioLangParser.identifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdentifier?: (ctx: IdentifierContext) => Result
}
