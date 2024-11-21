// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.2
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
	public static readonly COMMENT_START = 11;
	public static readonly ADD = 12;
	public static readonly SUB = 13;
	public static readonly MUL = 14;
	public static readonly MOD = 15;
	public static readonly DIV = 16;
	public static readonly METHOD_CALL_SYMBOL = 17;
	public static readonly STATEMENT_END = 18;
	public static readonly WHITESPACE = 19;
	public static override readonly EOF = Token.EOF;
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
	public static readonly RULE_comment = 10;
	public static readonly RULE_negativeNumber = 11;
	public static readonly literalNames: (string | null)[] = [ null, "'('", 
                                                            "')'", "','", 
                                                            "'['", "']'", 
                                                            "'TRUE'", "'FALSE'", 
                                                            null, null, 
                                                            null, null, 
                                                            "'+'", "'-'", 
                                                            "'*'", "'%'", 
                                                            "'@'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "TRUE", "FALSE", 
                                                             "IDENTIFIER", 
                                                             "NUMBER", "STRING", 
                                                             "COMMENT_START", 
                                                             "ADD", "SUB", 
                                                             "MUL", "MOD", 
                                                             "DIV", "METHOD_CALL_SYMBOL", 
                                                             "STATEMENT_END", 
                                                             "WHITESPACE" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"expr", "statement", "statementList", "methodCall", "objectName", "methodName", 
		"methodCallArguments", "specialCall", "operationGrouping", "operation", 
		"comment", "negativeNumber",
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
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 25;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 24;
				this.comment();
				}
			}

			this.state = 36;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				{
				this.state = 27;
				this.match(ReksioLangParser.STRING);
				}
				break;
			case 2:
				{
				this.state = 28;
				this.negativeNumber();
				}
				break;
			case 3:
				{
				this.state = 29;
				this.match(ReksioLangParser.NUMBER);
				}
				break;
			case 4:
				{
				this.state = 30;
				this.match(ReksioLangParser.TRUE);
				}
				break;
			case 5:
				{
				this.state = 31;
				this.match(ReksioLangParser.FALSE);
				}
				break;
			case 6:
				{
				this.state = 32;
				this.match(ReksioLangParser.IDENTIFIER);
				}
				break;
			case 7:
				{
				this.state = 33;
				this.specialCall();
				}
				break;
			case 8:
				{
				this.state = 34;
				this.methodCall();
				}
				break;
			case 9:
				{
				this.state = 35;
				this.operationGrouping();
				}
				break;
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
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, ReksioLangParser.RULE_statement);
		try {
			this.state = 40;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 18:
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
			case 11:
			case 13:
			case 16:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 39;
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
			this.state = 47;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 339920) !== 0)) {
				{
				{
				this.state = 42;
				this.statement();
				this.state = 43;
				this.match(ReksioLangParser.STATEMENT_END);
				}
				}
				this.state = 49;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 50;
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
			this.state = 52;
			this.objectName();
			this.state = 53;
			this.match(ReksioLangParser.METHOD_CALL_SYMBOL);
			this.state = 54;
			this.methodName();
			this.state = 55;
			this.match(ReksioLangParser.T__0);
			this.state = 57;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 77776) !== 0)) {
				{
				this.state = 56;
				this.methodCallArguments();
				}
			}

			this.state = 59;
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
			this.state = 61;
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
			this.state = 63;
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
			this.state = 65;
			this.expr();
			this.state = 70;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 66;
				this.match(ReksioLangParser.T__2);
				this.state = 67;
				this.expr();
				}
				}
				this.state = 72;
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
			this.state = 73;
			this.match(ReksioLangParser.DIV);
			this.state = 74;
			this.methodName();
			this.state = 75;
			this.match(ReksioLangParser.T__0);
			this.state = 77;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 77776) !== 0)) {
				{
				this.state = 76;
				this.methodCallArguments();
				}
			}

			this.state = 79;
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
			this.state = 81;
			this.match(ReksioLangParser.T__3);
			this.state = 82;
			this.operation(0);
			this.state = 83;
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
			this.state = 86;
			this.expr();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 105;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 103;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
					case 1:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 88;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 89;
						localctx._operator = this.match(ReksioLangParser.ADD);
						this.state = 90;
						localctx._right = this.operation(7);
						}
						break;
					case 2:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 91;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 92;
						localctx._operator = this.match(ReksioLangParser.SUB);
						this.state = 93;
						localctx._right = this.operation(6);
						}
						break;
					case 3:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 94;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 95;
						localctx._operator = this.match(ReksioLangParser.MUL);
						this.state = 96;
						localctx._right = this.operation(5);
						}
						break;
					case 4:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 97;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 98;
						localctx._operator = this.match(ReksioLangParser.MOD);
						this.state = 99;
						localctx._right = this.operation(4);
						}
						break;
					case 5:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 100;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 101;
						localctx._operator = this.match(ReksioLangParser.DIV);
						this.state = 102;
						localctx._right = this.operation(3);
						}
						break;
					}
					}
				}
				this.state = 107;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
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
	public comment(): CommentContext {
		let localctx: CommentContext = new CommentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, ReksioLangParser.RULE_comment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 108;
			this.match(ReksioLangParser.COMMENT_START);
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
	public negativeNumber(): NegativeNumberContext {
		let localctx: NegativeNumberContext = new NegativeNumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, ReksioLangParser.RULE_negativeNumber);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 110;
			this.match(ReksioLangParser.SUB);
			this.state = 111;
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

	public static readonly _serializedATN: number[] = [4,1,19,114,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,1,0,3,0,26,8,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,
	0,37,8,0,1,1,1,1,3,1,41,8,1,1,2,1,2,1,2,5,2,46,8,2,10,2,12,2,49,9,2,1,2,
	1,2,1,3,1,3,1,3,1,3,1,3,3,3,58,8,3,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,
	5,6,69,8,6,10,6,12,6,72,9,6,1,7,1,7,1,7,1,7,3,7,78,8,7,1,7,1,7,1,8,1,8,
	1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,
	1,9,1,9,5,9,104,8,9,10,9,12,9,107,9,9,1,10,1,10,1,11,1,11,1,11,1,11,0,1,
	18,12,0,2,4,6,8,10,12,14,16,18,20,22,0,0,120,0,25,1,0,0,0,2,40,1,0,0,0,
	4,47,1,0,0,0,6,52,1,0,0,0,8,61,1,0,0,0,10,63,1,0,0,0,12,65,1,0,0,0,14,73,
	1,0,0,0,16,81,1,0,0,0,18,85,1,0,0,0,20,108,1,0,0,0,22,110,1,0,0,0,24,26,
	3,20,10,0,25,24,1,0,0,0,25,26,1,0,0,0,26,36,1,0,0,0,27,37,5,10,0,0,28,37,
	3,22,11,0,29,37,5,9,0,0,30,37,5,6,0,0,31,37,5,7,0,0,32,37,5,8,0,0,33,37,
	3,14,7,0,34,37,3,6,3,0,35,37,3,16,8,0,36,27,1,0,0,0,36,28,1,0,0,0,36,29,
	1,0,0,0,36,30,1,0,0,0,36,31,1,0,0,0,36,32,1,0,0,0,36,33,1,0,0,0,36,34,1,
	0,0,0,36,35,1,0,0,0,37,1,1,0,0,0,38,41,1,0,0,0,39,41,3,0,0,0,40,38,1,0,
	0,0,40,39,1,0,0,0,41,3,1,0,0,0,42,43,3,2,1,0,43,44,5,18,0,0,44,46,1,0,0,
	0,45,42,1,0,0,0,46,49,1,0,0,0,47,45,1,0,0,0,47,48,1,0,0,0,48,50,1,0,0,0,
	49,47,1,0,0,0,50,51,5,0,0,1,51,5,1,0,0,0,52,53,3,8,4,0,53,54,5,17,0,0,54,
	55,3,10,5,0,55,57,5,1,0,0,56,58,3,12,6,0,57,56,1,0,0,0,57,58,1,0,0,0,58,
	59,1,0,0,0,59,60,5,2,0,0,60,7,1,0,0,0,61,62,5,8,0,0,62,9,1,0,0,0,63,64,
	5,8,0,0,64,11,1,0,0,0,65,70,3,0,0,0,66,67,5,3,0,0,67,69,3,0,0,0,68,66,1,
	0,0,0,69,72,1,0,0,0,70,68,1,0,0,0,70,71,1,0,0,0,71,13,1,0,0,0,72,70,1,0,
	0,0,73,74,5,16,0,0,74,75,3,10,5,0,75,77,5,1,0,0,76,78,3,12,6,0,77,76,1,
	0,0,0,77,78,1,0,0,0,78,79,1,0,0,0,79,80,5,2,0,0,80,15,1,0,0,0,81,82,5,4,
	0,0,82,83,3,18,9,0,83,84,5,5,0,0,84,17,1,0,0,0,85,86,6,9,-1,0,86,87,3,0,
	0,0,87,105,1,0,0,0,88,89,10,6,0,0,89,90,5,12,0,0,90,104,3,18,9,7,91,92,
	10,5,0,0,92,93,5,13,0,0,93,104,3,18,9,6,94,95,10,4,0,0,95,96,5,14,0,0,96,
	104,3,18,9,5,97,98,10,3,0,0,98,99,5,15,0,0,99,104,3,18,9,4,100,101,10,2,
	0,0,101,102,5,16,0,0,102,104,3,18,9,3,103,88,1,0,0,0,103,91,1,0,0,0,103,
	94,1,0,0,0,103,97,1,0,0,0,103,100,1,0,0,0,104,107,1,0,0,0,105,103,1,0,0,
	0,105,106,1,0,0,0,106,19,1,0,0,0,107,105,1,0,0,0,108,109,5,11,0,0,109,21,
	1,0,0,0,110,111,5,13,0,0,111,112,5,9,0,0,112,23,1,0,0,0,9,25,36,40,47,57,
	70,77,103,105];

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
	public comment(): CommentContext {
		return this.getTypedRuleContext(CommentContext, 0) as CommentContext;
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


export class CommentContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public COMMENT_START(): TerminalNode {
		return this.getToken(ReksioLangParser.COMMENT_START, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_comment;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangVisitor<Result>): Result {
		if (visitor.visitComment) {
			return visitor.visitComment(this);
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
