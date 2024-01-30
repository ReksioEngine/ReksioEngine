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
	public static readonly TRUE = 6;
	public static readonly FALSE = 7;
	public static readonly IDENTIFIER = 8;
	public static readonly NUMBER = 9;
	public static readonly STRING = 10;
	public static readonly ADD = 11;
	public static readonly SUB = 12;
	public static readonly MUL = 13;
	public static readonly MOD = 14;
	public static readonly DIV = 15;
	public static readonly METHOD_CALL_SYMBOL = 16;
	public static readonly STATEMENT_END = 17;
	public static readonly WHITESPACE = 18;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_expr = 0;
	public static readonly RULE_statement = 1;
	public static readonly RULE_statementList = 2;
	public static readonly RULE_methodCall = 3;
	public static readonly RULE_objectName = 4;
	public static readonly RULE_methodName = 5;
	public static readonly RULE_methodCallArguments = 6;
	public static readonly RULE_specialCall = 7;
	public static readonly RULE_operationGrouping = 8;
	public static readonly RULE_operation = 9;
	public static readonly RULE_negativeNumber = 10;
	public static readonly literalNames: (string | null)[] = [ null, "'('", 
                                                            "')'", "','", 
                                                            "'['", "']'", 
                                                            "'TRUE'", "'FALSE'", 
                                                            null, null, 
                                                            null, "'+'", 
                                                            "'-'", "'*'", 
                                                            "'%'", "'@'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "TRUE", "FALSE", 
                                                             "IDENTIFIER", 
                                                             "NUMBER", "STRING", 
                                                             "ADD", "SUB", 
                                                             "MUL", "MOD", 
                                                             "DIV", "METHOD_CALL_SYMBOL", 
                                                             "STATEMENT_END", 
                                                             "WHITESPACE" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"expr", "statement", "statementList", "methodCall", "objectName", "methodName", 
		"methodCallArguments", "specialCall", "operationGrouping", "operation", 
		"negativeNumber",
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
			this.state = 31;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 22;
				this.match(ReksioLangParser.STRING);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 23;
				this.negativeNumber();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 24;
				this.match(ReksioLangParser.NUMBER);
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 25;
				this.match(ReksioLangParser.TRUE);
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 26;
				this.match(ReksioLangParser.FALSE);
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 27;
				this.match(ReksioLangParser.IDENTIFIER);
				}
				break;
			case 7:
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 28;
				this.specialCall();
				}
				break;
			case 8:
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 29;
				this.methodCall();
				}
				break;
			case 9:
				this.enterOuterAlt(localctx, 9);
				{
				this.state = 30;
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
			this.state = 35;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 17:
				this.enterOuterAlt(localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;
			case 4:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:
			case 12:
			case 15:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 34;
				this.expr();
				}
				break;
			default:
				throw new NoViableAltException(this);
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
			this.state = 42;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 169936) !== 0)) {
				{
				{
				this.state = 37;
				this.statement();
				this.state = 38;
				this.match(ReksioLangParser.STATEMENT_END);
				}
				}
				this.state = 44;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 45;
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
			this.state = 47;
			this.objectName();
			this.state = 48;
			this.match(ReksioLangParser.METHOD_CALL_SYMBOL);
			this.state = 49;
			this.methodName();
			this.state = 50;
			this.match(ReksioLangParser.T__0);
			this.state = 52;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 38864) !== 0)) {
				{
				this.state = 51;
				this.methodCallArguments();
				}
			}

			this.state = 54;
			this.match(ReksioLangParser.T__1);
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
	public objectName(): ObjectNameContext {
		let localctx: ObjectNameContext = new ObjectNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, ReksioLangParser.RULE_objectName);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 56;
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
	public methodName(): MethodNameContext {
		let localctx: MethodNameContext = new MethodNameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, ReksioLangParser.RULE_methodName);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 58;
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
		this.enterRule(localctx, 12, ReksioLangParser.RULE_methodCallArguments);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 60;
			this.expr();
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 61;
				this.match(ReksioLangParser.T__2);
				this.state = 62;
				this.expr();
				}
				}
				this.state = 67;
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
	public specialCall(): SpecialCallContext {
		let localctx: SpecialCallContext = new SpecialCallContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, ReksioLangParser.RULE_specialCall);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 68;
			this.match(ReksioLangParser.DIV);
			this.state = 69;
			this.methodName();
			this.state = 70;
			this.match(ReksioLangParser.T__0);
			this.state = 72;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 38864) !== 0)) {
				{
				this.state = 71;
				this.methodCallArguments();
				}
			}

			this.state = 74;
			this.match(ReksioLangParser.T__1);
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
		this.enterRule(localctx, 16, ReksioLangParser.RULE_operationGrouping);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 76;
			this.match(ReksioLangParser.T__3);
			this.state = 77;
			this.operation(0);
			this.state = 78;
			this.match(ReksioLangParser.T__4);
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
		let _startState: number = 18;
		this.enterRecursionRule(localctx, 18, ReksioLangParser.RULE_operation, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 81;
			this.expr();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 100;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 98;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 6, this._ctx) ) {
					case 1:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 83;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 84;
						localctx._operator = this.match(ReksioLangParser.ADD);
						this.state = 85;
						localctx._right = this.operation(7);
						}
						break;
					case 2:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 86;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 87;
						localctx._operator = this.match(ReksioLangParser.SUB);
						this.state = 88;
						localctx._right = this.operation(6);
						}
						break;
					case 3:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 89;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 90;
						localctx._operator = this.match(ReksioLangParser.MUL);
						this.state = 91;
						localctx._right = this.operation(5);
						}
						break;
					case 4:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 92;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 93;
						localctx._operator = this.match(ReksioLangParser.MOD);
						this.state = 94;
						localctx._right = this.operation(4);
						}
						break;
					case 5:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 95;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 96;
						localctx._operator = this.match(ReksioLangParser.DIV);
						this.state = 97;
						localctx._right = this.operation(3);
						}
						break;
					}
					}
				}
				this.state = 102;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
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
	public negativeNumber(): NegativeNumberContext {
		let localctx: NegativeNumberContext = new NegativeNumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, ReksioLangParser.RULE_negativeNumber);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 103;
			this.match(ReksioLangParser.SUB);
			this.state = 104;
			this.match(ReksioLangParser.NUMBER);
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
		case 9:
			return this.operation_sempred(localctx as OperationContext, predIndex);
		}
		return true;
	}
	private operation_sempred(localctx: OperationContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 6);
		case 1:
			return this.precpred(this._ctx, 5);
		case 2:
			return this.precpred(this._ctx, 4);
		case 3:
			return this.precpred(this._ctx, 3);
		case 4:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,18,107,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,0,32,8,0,1,1,1,1,3,1,36,8,
	1,1,2,1,2,1,2,5,2,41,8,2,10,2,12,2,44,9,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,3,
	3,53,8,3,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,5,6,64,8,6,10,6,12,6,67,9,
	6,1,7,1,7,1,7,1,7,3,7,73,8,7,1,7,1,7,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,
	9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,5,9,99,8,9,10,9,12,
	9,102,9,9,1,10,1,10,1,10,1,10,0,1,18,11,0,2,4,6,8,10,12,14,16,18,20,0,0,
	113,0,31,1,0,0,0,2,35,1,0,0,0,4,42,1,0,0,0,6,47,1,0,0,0,8,56,1,0,0,0,10,
	58,1,0,0,0,12,60,1,0,0,0,14,68,1,0,0,0,16,76,1,0,0,0,18,80,1,0,0,0,20,103,
	1,0,0,0,22,32,5,10,0,0,23,32,3,20,10,0,24,32,5,9,0,0,25,32,5,6,0,0,26,32,
	5,7,0,0,27,32,5,8,0,0,28,32,3,14,7,0,29,32,3,6,3,0,30,32,3,16,8,0,31,22,
	1,0,0,0,31,23,1,0,0,0,31,24,1,0,0,0,31,25,1,0,0,0,31,26,1,0,0,0,31,27,1,
	0,0,0,31,28,1,0,0,0,31,29,1,0,0,0,31,30,1,0,0,0,32,1,1,0,0,0,33,36,1,0,
	0,0,34,36,3,0,0,0,35,33,1,0,0,0,35,34,1,0,0,0,36,3,1,0,0,0,37,38,3,2,1,
	0,38,39,5,17,0,0,39,41,1,0,0,0,40,37,1,0,0,0,41,44,1,0,0,0,42,40,1,0,0,
	0,42,43,1,0,0,0,43,45,1,0,0,0,44,42,1,0,0,0,45,46,5,0,0,1,46,5,1,0,0,0,
	47,48,3,8,4,0,48,49,5,16,0,0,49,50,3,10,5,0,50,52,5,1,0,0,51,53,3,12,6,
	0,52,51,1,0,0,0,52,53,1,0,0,0,53,54,1,0,0,0,54,55,5,2,0,0,55,7,1,0,0,0,
	56,57,5,8,0,0,57,9,1,0,0,0,58,59,5,8,0,0,59,11,1,0,0,0,60,65,3,0,0,0,61,
	62,5,3,0,0,62,64,3,0,0,0,63,61,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,65,66,
	1,0,0,0,66,13,1,0,0,0,67,65,1,0,0,0,68,69,5,15,0,0,69,70,3,10,5,0,70,72,
	5,1,0,0,71,73,3,12,6,0,72,71,1,0,0,0,72,73,1,0,0,0,73,74,1,0,0,0,74,75,
	5,2,0,0,75,15,1,0,0,0,76,77,5,4,0,0,77,78,3,18,9,0,78,79,5,5,0,0,79,17,
	1,0,0,0,80,81,6,9,-1,0,81,82,3,0,0,0,82,100,1,0,0,0,83,84,10,6,0,0,84,85,
	5,11,0,0,85,99,3,18,9,7,86,87,10,5,0,0,87,88,5,12,0,0,88,99,3,18,9,6,89,
	90,10,4,0,0,90,91,5,13,0,0,91,99,3,18,9,5,92,93,10,3,0,0,93,94,5,14,0,0,
	94,99,3,18,9,4,95,96,10,2,0,0,96,97,5,15,0,0,97,99,3,18,9,3,98,83,1,0,0,
	0,98,86,1,0,0,0,98,89,1,0,0,0,98,92,1,0,0,0,98,95,1,0,0,0,99,102,1,0,0,
	0,100,98,1,0,0,0,100,101,1,0,0,0,101,19,1,0,0,0,102,100,1,0,0,0,103,104,
	5,12,0,0,104,105,5,9,0,0,105,21,1,0,0,0,8,31,35,42,52,65,72,98,100];

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
	public negativeNumber(): NegativeNumberContext {
		return this.getTypedRuleContext(NegativeNumberContext, 0) as NegativeNumberContext;
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
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioLangParser.IDENTIFIER, 0);
	}
	public specialCall(): SpecialCallContext {
		return this.getTypedRuleContext(SpecialCallContext, 0) as SpecialCallContext;
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
	public STATEMENT_END_list(): TerminalNode[] {
	    	return this.getTokens(ReksioLangParser.STATEMENT_END);
	}
	public STATEMENT_END(i: number): TerminalNode {
		return this.getToken(ReksioLangParser.STATEMENT_END, i);
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
	public objectName(): ObjectNameContext {
		return this.getTypedRuleContext(ObjectNameContext, 0) as ObjectNameContext;
	}
	public METHOD_CALL_SYMBOL(): TerminalNode {
		return this.getToken(ReksioLangParser.METHOD_CALL_SYMBOL, 0);
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


export class ObjectNameContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioLangParser.IDENTIFIER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_objectName;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitObjectName) {
			return visitor.visitObjectName(this);
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


export class SpecialCallContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public DIV(): TerminalNode {
		return this.getToken(ReksioLangParser.DIV, 0);
	}
	public methodName(): MethodNameContext {
		return this.getTypedRuleContext(MethodNameContext, 0) as MethodNameContext;
	}
	public methodCallArguments(): MethodCallArgumentsContext {
		return this.getTypedRuleContext(MethodCallArgumentsContext, 0) as MethodCallArgumentsContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_specialCall;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitSpecialCall) {
			return visitor.visitSpecialCall(this);
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
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public operation_list(): OperationContext[] {
		return this.getTypedRuleContexts(OperationContext) as OperationContext[];
	}
	public operation(i: number): OperationContext {
		return this.getTypedRuleContext(OperationContext, i) as OperationContext;
	}
	public ADD(): TerminalNode {
		return this.getToken(ReksioLangParser.ADD, 0);
	}
	public SUB(): TerminalNode {
		return this.getToken(ReksioLangParser.SUB, 0);
	}
	public MUL(): TerminalNode {
		return this.getToken(ReksioLangParser.MUL, 0);
	}
	public MOD(): TerminalNode {
		return this.getToken(ReksioLangParser.MOD, 0);
	}
	public DIV(): TerminalNode {
		return this.getToken(ReksioLangParser.DIV, 0);
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


export class NegativeNumberContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public SUB(): TerminalNode {
		return this.getToken(ReksioLangParser.SUB, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ReksioLangParser.NUMBER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_negativeNumber;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitNegativeNumber) {
			return visitor.visitNegativeNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
