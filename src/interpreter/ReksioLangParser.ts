// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import ReksioLangVisitor from "./ReksioLangVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class ReksioLangParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly TRUE = 8;
	public static readonly FALSE = 9;
	public static readonly IDENTIFIER = 10;
	public static readonly NUMBER = 11;
	public static readonly CALLER_ARGUMENT = 12;
	public static readonly STRING = 13;
	public static readonly PLUS = 14;
	public static readonly MINUS = 15;
	public static readonly WHITESPACE = 16;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_expr = 0;
	public static readonly RULE_statement = 1;
	public static readonly RULE_statementList = 2;
	public static readonly RULE_methodCall = 3;
	public static readonly RULE_methodName = 4;
	public static readonly RULE_methodCallArguments = 5;
	public static readonly RULE_operationGrouping = 6;
	public static readonly RULE_operation = 7;
	public static readonly RULE_variable = 8;
	public static readonly literalNames: (string | null)[] = [ null, "';'", 
                                                            "'^'", "'('", 
                                                            "')'", "','", 
                                                            "'['", "']'", 
                                                            "'TRUE'", "'FALSE'", 
                                                            null, null, 
                                                            null, null, 
                                                            "'+'", "'-'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "TRUE", "FALSE", 
                                                             "IDENTIFIER", 
                                                             "NUMBER", "CALLER_ARGUMENT", 
                                                             "STRING", "PLUS", 
                                                             "MINUS", "WHITESPACE" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"expr", "statement", "statementList", "methodCall", "methodName", "methodCallArguments", 
		"operationGrouping", "operation", "variable",
	];
	public get grammarFileName(): string { return "ReksioLang.g4"; }
	public get literalNames(): (string | null)[] { return ReksioLangParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return ReksioLangParser.symbolicNames; }
	public get ruleNames(): string[] { return ReksioLangParser.ruleNames; }
	public get serializedATN(): number[] { return ReksioLangParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, ReksioLangParser._ATN, ReksioLangParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public expr(): ExprContext {
		let localctx: ExprContext = new ExprContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, ReksioLangParser.RULE_expr);
		try {
			this.state = 25;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 18;
				this.match(ReksioLangParser.STRING);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 19;
				this.match(ReksioLangParser.NUMBER);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 20;
				this.match(ReksioLangParser.TRUE);
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 21;
				this.match(ReksioLangParser.FALSE);
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 22;
				this.variable();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 23;
				this.methodCall();
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 24;
				this.operationGrouping();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, ReksioLangParser.RULE_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 27;
			this.expr();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statementList(): StatementListContext {
		let localctx: StatementListContext = new StatementListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, ReksioLangParser.RULE_statementList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 34;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 16192) !== 0)) {
				{
				{
				this.state = 29;
				this.statement();
				this.state = 30;
				this.match(ReksioLangParser.T__0);
				}
				}
				this.state = 36;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 37;
			this.match(ReksioLangParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public methodCall(): MethodCallContext {
		let localctx: MethodCallContext = new MethodCallContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, ReksioLangParser.RULE_methodCall);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 39;
			this.variable();
			this.state = 40;
			this.match(ReksioLangParser.T__1);
			this.state = 41;
			this.methodName();
			this.state = 42;
			this.match(ReksioLangParser.T__2);
			this.state = 44;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 16192) !== 0)) {
				{
				this.state = 43;
				this.methodCallArguments();
				}
			}

			this.state = 46;
			this.match(ReksioLangParser.T__3);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public methodName(): MethodNameContext {
		let localctx: MethodNameContext = new MethodNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, ReksioLangParser.RULE_methodName);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 48;
			this.match(ReksioLangParser.IDENTIFIER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public methodCallArguments(): MethodCallArgumentsContext {
		let localctx: MethodCallArgumentsContext = new MethodCallArgumentsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, ReksioLangParser.RULE_methodCallArguments);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 50;
			this.expr();
			this.state = 55;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 51;
				this.match(ReksioLangParser.T__4);
				this.state = 52;
				this.expr();
				}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public operationGrouping(): OperationGroupingContext {
		let localctx: OperationGroupingContext = new OperationGroupingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, ReksioLangParser.RULE_operationGrouping);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 58;
			this.match(ReksioLangParser.T__5);
			this.state = 59;
			this.operation(0);
			this.state = 60;
			this.match(ReksioLangParser.T__6);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public operation(): OperationContext;
	public operation(_p: number): OperationContext;
	// @RuleVersion(0)
	public operation(_p?: number): OperationContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: OperationContext = new OperationContext(this, this._ctx, _parentState);
		let _prevctx: OperationContext = localctx;
		let _startState: number = 14;
		this.enterRecursionRule(localctx, 14, ReksioLangParser.RULE_operation, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 65;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				{
				this.state = 63;
				this.match(ReksioLangParser.NUMBER);
				}
				break;
			case 2:
				{
				this.state = 64;
				this.expr();
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 75;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 73;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 5, this._ctx) ) {
					case 1:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 67;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 68;
						localctx._operator = this.match(ReksioLangParser.PLUS);
						this.state = 69;
						localctx._right = this.operation(3);
						}
						break;
					case 2:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 70;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 71;
						localctx._operator = this.match(ReksioLangParser.MINUS);
						this.state = 72;
						localctx._right = this.operation(2);
						}
						break;
					}
					}
				}
				this.state = 77;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variable(): VariableContext {
		let localctx: VariableContext = new VariableContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, ReksioLangParser.RULE_variable);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 78;
			_la = this._input.LA(1);
			if(!(_la===10 || _la===12)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 7:
			return this.operation_sempred(localctx as OperationContext, predIndex);
		}
		return true;
	}
	private operation_sempred(localctx: OperationContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 2);
		case 1:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,16,81,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,1,0,1,0,1,
	0,1,0,1,0,1,0,1,0,3,0,26,8,0,1,1,1,1,1,2,1,2,1,2,5,2,33,8,2,10,2,12,2,36,
	9,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,3,3,45,8,3,1,3,1,3,1,4,1,4,1,5,1,5,1,5,
	5,5,54,8,5,10,5,12,5,57,9,5,1,6,1,6,1,6,1,6,1,7,1,7,1,7,3,7,66,8,7,1,7,
	1,7,1,7,1,7,1,7,1,7,5,7,74,8,7,10,7,12,7,77,9,7,1,8,1,8,1,8,0,1,14,9,0,
	2,4,6,8,10,12,14,16,0,1,2,0,10,10,12,12,83,0,25,1,0,0,0,2,27,1,0,0,0,4,
	34,1,0,0,0,6,39,1,0,0,0,8,48,1,0,0,0,10,50,1,0,0,0,12,58,1,0,0,0,14,65,
	1,0,0,0,16,78,1,0,0,0,18,26,5,13,0,0,19,26,5,11,0,0,20,26,5,8,0,0,21,26,
	5,9,0,0,22,26,3,16,8,0,23,26,3,6,3,0,24,26,3,12,6,0,25,18,1,0,0,0,25,19,
	1,0,0,0,25,20,1,0,0,0,25,21,1,0,0,0,25,22,1,0,0,0,25,23,1,0,0,0,25,24,1,
	0,0,0,26,1,1,0,0,0,27,28,3,0,0,0,28,3,1,0,0,0,29,30,3,2,1,0,30,31,5,1,0,
	0,31,33,1,0,0,0,32,29,1,0,0,0,33,36,1,0,0,0,34,32,1,0,0,0,34,35,1,0,0,0,
	35,37,1,0,0,0,36,34,1,0,0,0,37,38,5,0,0,1,38,5,1,0,0,0,39,40,3,16,8,0,40,
	41,5,2,0,0,41,42,3,8,4,0,42,44,5,3,0,0,43,45,3,10,5,0,44,43,1,0,0,0,44,
	45,1,0,0,0,45,46,1,0,0,0,46,47,5,4,0,0,47,7,1,0,0,0,48,49,5,10,0,0,49,9,
	1,0,0,0,50,55,3,0,0,0,51,52,5,5,0,0,52,54,3,0,0,0,53,51,1,0,0,0,54,57,1,
	0,0,0,55,53,1,0,0,0,55,56,1,0,0,0,56,11,1,0,0,0,57,55,1,0,0,0,58,59,5,6,
	0,0,59,60,3,14,7,0,60,61,5,7,0,0,61,13,1,0,0,0,62,63,6,7,-1,0,63,66,5,11,
	0,0,64,66,3,0,0,0,65,62,1,0,0,0,65,64,1,0,0,0,66,75,1,0,0,0,67,68,10,2,
	0,0,68,69,5,14,0,0,69,74,3,14,7,3,70,71,10,1,0,0,71,72,5,15,0,0,72,74,3,
	14,7,2,73,67,1,0,0,0,73,70,1,0,0,0,74,77,1,0,0,0,75,73,1,0,0,0,75,76,1,
	0,0,0,76,15,1,0,0,0,77,75,1,0,0,0,78,79,7,0,0,0,79,17,1,0,0,0,7,25,34,44,
	55,65,73,75];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioLangParser.__ATN) {
			ReksioLangParser.__ATN = new ATNDeserializer().deserialize(ReksioLangParser._serializedATN);
		}

		return ReksioLangParser.__ATN;
	}


	static DecisionsToDFA = ReksioLangParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ExprContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(ReksioLangParser.STRING, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ReksioLangParser.NUMBER, 0);
	}
	public TRUE(): TerminalNode {
		return this.getToken(ReksioLangParser.TRUE, 0);
	}
	public FALSE(): TerminalNode {
		return this.getToken(ReksioLangParser.FALSE, 0);
	}
	public variable(): VariableContext {
		return this.getTypedRuleContext(VariableContext, 0) as VariableContext;
	}
	public methodCall(): MethodCallContext {
		return this.getTypedRuleContext(MethodCallContext, 0) as MethodCallContext;
	}
	public operationGrouping(): OperationGroupingContext {
		return this.getTypedRuleContext(OperationGroupingContext, 0) as OperationGroupingContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_expr;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitExpr) {
			return visitor.visitExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_statement;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementListContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(ReksioLangParser.EOF, 0);
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_statementList;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitStatementList) {
			return visitor.visitStatementList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MethodCallContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable(): VariableContext {
		return this.getTypedRuleContext(VariableContext, 0) as VariableContext;
	}
	public methodName(): MethodNameContext {
		return this.getTypedRuleContext(MethodNameContext, 0) as MethodNameContext;
	}
	public methodCallArguments(): MethodCallArgumentsContext {
		return this.getTypedRuleContext(MethodCallArgumentsContext, 0) as MethodCallArgumentsContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodCall;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitMethodCall) {
			return visitor.visitMethodCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MethodNameContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioLangParser.IDENTIFIER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodName;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitMethodName) {
			return visitor.visitMethodName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MethodCallArgumentsContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodCallArguments;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitMethodCallArguments) {
			return visitor.visitMethodCallArguments(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperationGroupingContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public operation(): OperationContext {
		return this.getTypedRuleContext(OperationContext, 0) as OperationContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_operationGrouping;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitOperationGrouping) {
			return visitor.visitOperationGrouping(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OperationContext extends ParserRuleContext {
	public _left!: OperationContext;
	public _operator!: Token;
	public _right!: OperationContext;
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ReksioLangParser.NUMBER, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public operation_list(): OperationContext[] {
		return this.getTypedRuleContexts(OperationContext) as OperationContext[];
	}
	public operation(i: number): OperationContext {
		return this.getTypedRuleContext(OperationContext, i) as OperationContext;
	}
	public PLUS(): TerminalNode {
		return this.getToken(ReksioLangParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(ReksioLangParser.MINUS, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_operation;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitOperation) {
			return visitor.visitOperation(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class VariableContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioLangParser.IDENTIFIER, 0);
	}
	public CALLER_ARGUMENT(): TerminalNode {
		return this.getToken(ReksioLangParser.CALLER_ARGUMENT, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_variable;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitVariable) {
			return visitor.visitVariable(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
