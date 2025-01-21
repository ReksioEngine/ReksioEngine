// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.2

import { ParseTreeVisitor } from 'antlr4'

import { ExprContext } from './ReksioLangParser'
import { StatementContext } from './ReksioLangParser'
import { StatementListContext } from './ReksioLangParser'
import { MethodCallContext } from './ReksioLangParser'
import { ObjectNameContext } from './ReksioLangParser'
import { MethodNameContext } from './ReksioLangParser'
import { MethodCallArgumentsContext } from './ReksioLangParser'
import { SpecialCallContext } from './ReksioLangParser'
import { OperationGroupingContext } from './ReksioLangParser'
import { OperationContext } from './ReksioLangParser'
import { CommentContext } from './ReksioLangParser'
import { NumberContext } from './ReksioLangParser'
import { BoolContext } from './ReksioLangParser'
import { StringContext } from './ReksioLangParser'
import { IdentifierContext } from './ReksioLangParser'

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
