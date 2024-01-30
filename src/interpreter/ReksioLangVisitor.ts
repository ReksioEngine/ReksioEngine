// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.1

import {ParseTreeVisitor} from 'antlr4';


import { ExprContext } from "./ReksioLangParser";
import { StatementContext } from "./ReksioLangParser";
import { StatementListContext } from "./ReksioLangParser";
import { MethodCallContext } from "./ReksioLangParser";
import { ObjectNameContext } from "./ReksioLangParser";
import { MethodNameContext } from "./ReksioLangParser";
import { MethodCallArgumentsContext } from "./ReksioLangParser";
import { SpecialCallContext } from "./ReksioLangParser";
import { OperationGroupingContext } from "./ReksioLangParser";
import { OperationContext } from "./ReksioLangParser";
import { NegativeNumberContext } from "./ReksioLangParser";


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
	visitExpr?: (ctx: ExprContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.statementList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatementList?: (ctx: StatementListContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.methodCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethodCall?: (ctx: MethodCallContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.objectName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitObjectName?: (ctx: ObjectNameContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.methodName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethodName?: (ctx: MethodNameContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.methodCallArguments`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethodCallArguments?: (ctx: MethodCallArgumentsContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.specialCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSpecialCall?: (ctx: SpecialCallContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.operationGrouping`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperationGrouping?: (ctx: OperationGroupingContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.operation`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOperation?: (ctx: OperationContext) => Result;
	/**
	 * Visit a parse tree produced by `ReksioLangParser.negativeNumber`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNegativeNumber?: (ctx: NegativeNumberContext) => Result;
}

