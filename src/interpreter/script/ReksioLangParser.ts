// Generated from ./src/interpreter/script/ReksioLangParser.g4 by ANTLR 4.13.2
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
import ReksioLangParserVisitor from "./ReksioLangParserVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class ReksioLangParser extends Parser {
	public static readonly TRUE = 1;
	public static readonly FALSE = 2;
	public static readonly NUMBER = 3;
	public static readonly CODE_STRING = 4;
	public static readonly STRING = 5;
	public static readonly COMMENT_START = 6;
	public static readonly PLUS = 7;
	public static readonly MINUS = 8;
	public static readonly ASTERISK = 9;
	public static readonly PERCENTAGE = 10;
	public static readonly AT = 11;
	public static readonly METHOD_CALL_SYMBOL = 12;
	public static readonly TYPO = 13;
	public static readonly TYPO_QUOTE = 14;
	public static readonly WHITESPACE = 15;
	public static readonly COMMA = 16;
	public static readonly IDENTIFIER = 17;
	public static readonly BRACKET_START = 18;
	public static readonly BRACKET_END = 19;
	public static readonly OPERATION_GROUPING_START = 20;
	public static readonly OPERATION_GROUPING_END = 21;
	public static readonly STATEMENT_END = 22;
	public static readonly I_WHITESPACE = 23;
	public static readonly MISSING_QUOTE_TEXT = 24;
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
	public static readonly RULE_number = 11;
	public static readonly RULE_bool = 12;
	public static readonly RULE_string = 13;
	public static readonly RULE_objectValueReference = 14;
	public static readonly RULE_identifier = 15;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            null, null, 
                                                            "';'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "TRUE", 
                                                             "FALSE", "NUMBER", 
                                                             "CODE_STRING", 
                                                             "STRING", "COMMENT_START", 
                                                             "PLUS", "MINUS", 
                                                             "ASTERISK", 
                                                             "PERCENTAGE", 
                                                             "AT", "METHOD_CALL_SYMBOL", 
                                                             "TYPO", "TYPO_QUOTE", 
                                                             "WHITESPACE", 
                                                             "COMMA", "IDENTIFIER", 
                                                             "BRACKET_START", 
                                                             "BRACKET_END", 
                                                             "OPERATION_GROUPING_START", 
                                                             "OPERATION_GROUPING_END", 
                                                             "STATEMENT_END", 
                                                             "I_WHITESPACE", 
                                                             "MISSING_QUOTE_TEXT" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"expr", "statement", "statementList", "methodCall", "objectName", "methodName", 
		"methodCallArguments", "specialCall", "operationGrouping", "operation", 
		"comment", "number", "bool", "string", "objectValueReference", "identifier",
	];
	public get grammarFileName(): string { return "ReksioLangParser.g4"; }
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
			this.state = 33;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===6) {
				{
				this.state = 32;
				this.comment();
				}
			}

			this.state = 42;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				{
				this.state = 35;
				this.string_();
				}
				break;
			case 2:
				{
				this.state = 36;
				this.number_();
				}
				break;
			case 3:
				{
				this.state = 37;
				this.bool();
				}
				break;
			case 4:
				{
				this.state = 38;
				this.objectValueReference();
				}
				break;
			case 5:
				{
				this.state = 39;
				this.specialCall();
				}
				break;
			case 6:
				{
				this.state = 40;
				this.methodCall();
				}
				break;
			case 7:
				{
				this.state = 41;
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
			this.state = 46;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 22:
				this.enterOuterAlt(localctx, 1);
				// tslint:disable-next-line:no-empty
				{
				}
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 8:
			case 9:
			case 11:
			case 17:
			case 20:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 45;
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
			this.state = 53;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 5376894) !== 0)) {
				{
				{
				this.state = 48;
				this.statement();
				this.state = 49;
				this.match(ReksioLangParser.STATEMENT_END);
				}
				}
				this.state = 55;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 56;
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
			this.state = 58;
			this.objectName();
			this.state = 59;
			this.match(ReksioLangParser.METHOD_CALL_SYMBOL);
			this.state = 60;
			this.methodName();
			this.state = 61;
			this.match(ReksioLangParser.BRACKET_START);
			this.state = 63;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1182590) !== 0)) {
				{
				this.state = 62;
				this.methodCallArguments();
				}
			}

			this.state = 65;
			this.match(ReksioLangParser.BRACKET_END);
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
			this.state = 67;
			this.identifier();
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
			this.state = 69;
			this.identifier();
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
			this.state = 71;
			this.expr();
			this.state = 76;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===16) {
				{
				{
				this.state = 72;
				this.match(ReksioLangParser.COMMA);
				this.state = 73;
				this.expr();
				}
				}
				this.state = 78;
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
			this.state = 79;
			this.match(ReksioLangParser.AT);
			this.state = 80;
			this.methodName();
			this.state = 81;
			this.match(ReksioLangParser.BRACKET_START);
			this.state = 83;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 1182590) !== 0)) {
				{
				this.state = 82;
				this.methodCallArguments();
				}
			}

			this.state = 85;
			this.match(ReksioLangParser.BRACKET_END);
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
			this.state = 87;
			this.match(ReksioLangParser.OPERATION_GROUPING_START);
			this.state = 88;
			this.operation(0);
			this.state = 89;
			this.match(ReksioLangParser.OPERATION_GROUPING_END);
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
			this.state = 92;
			this.expr();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 111;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 109;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 7, this._ctx) ) {
					case 1:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 94;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 95;
						localctx._operator = this.match(ReksioLangParser.PLUS);
						this.state = 96;
						localctx._right = this.operation(7);
						}
						break;
					case 2:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 97;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 98;
						localctx._operator = this.match(ReksioLangParser.MINUS);
						this.state = 99;
						localctx._right = this.operation(6);
						}
						break;
					case 3:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 100;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 101;
						localctx._operator = this.match(ReksioLangParser.ASTERISK);
						this.state = 102;
						localctx._right = this.operation(5);
						}
						break;
					case 4:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 103;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 104;
						localctx._operator = this.match(ReksioLangParser.PERCENTAGE);
						this.state = 105;
						localctx._right = this.operation(4);
						}
						break;
					case 5:
						{
						localctx = new OperationContext(this, _parentctx, _parentState);
						localctx._left = _prevctx;
						this.pushNewRecursionContext(localctx, _startState, ReksioLangParser.RULE_operation);
						this.state = 106;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 107;
						localctx._operator = this.match(ReksioLangParser.AT);
						this.state = 108;
						localctx._right = this.operation(3);
						}
						break;
					}
					}
				}
				this.state = 113;
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
			this.state = 114;
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
	public number_(): NumberContext {
		let localctx: NumberContext = new NumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, ReksioLangParser.RULE_number);
		try {
			this.state = 119;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 8:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 116;
				this.match(ReksioLangParser.MINUS);
				this.state = 117;
				this.match(ReksioLangParser.NUMBER);
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 118;
				this.match(ReksioLangParser.NUMBER);
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
	public bool(): BoolContext {
		let localctx: BoolContext = new BoolContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, ReksioLangParser.RULE_bool);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 121;
			_la = this._input.LA(1);
			if(!(_la===1 || _la===2)) {
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
	// @RuleVersion(0)
	public string_(): StringContext {
		let localctx: StringContext = new StringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, ReksioLangParser.RULE_string);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 123;
			_la = this._input.LA(1);
			if(!(_la===4 || _la===5)) {
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
	// @RuleVersion(0)
	public objectValueReference(): ObjectValueReferenceContext {
		let localctx: ObjectValueReferenceContext = new ObjectValueReferenceContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, ReksioLangParser.RULE_objectValueReference);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 125;
			this.identifier();
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
	public identifier(): IdentifierContext {
		let localctx: IdentifierContext = new IdentifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, ReksioLangParser.RULE_identifier);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 128;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===9) {
				{
				this.state = 127;
				localctx._dereference = this.match(ReksioLangParser.ASTERISK);
				}
			}

			this.state = 130;
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

	public static readonly _serializedATN: number[] = [4,1,24,133,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,3,0,34,8,
	0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,0,43,8,0,1,1,1,1,3,1,47,8,1,1,2,1,2,1,2,
	5,2,52,8,2,10,2,12,2,55,9,2,1,2,1,2,1,3,1,3,1,3,1,3,1,3,3,3,64,8,3,1,3,
	1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,5,6,75,8,6,10,6,12,6,78,9,6,1,7,1,7,1,7,
	1,7,3,7,84,8,7,1,7,1,7,1,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,
	1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,5,9,110,8,9,10,9,12,9,113,9,9,1,
	10,1,10,1,11,1,11,1,11,3,11,120,8,11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,
	3,15,129,8,15,1,15,1,15,1,15,0,1,18,16,0,2,4,6,8,10,12,14,16,18,20,22,24,
	26,28,30,0,2,1,0,1,2,1,0,4,5,135,0,33,1,0,0,0,2,46,1,0,0,0,4,53,1,0,0,0,
	6,58,1,0,0,0,8,67,1,0,0,0,10,69,1,0,0,0,12,71,1,0,0,0,14,79,1,0,0,0,16,
	87,1,0,0,0,18,91,1,0,0,0,20,114,1,0,0,0,22,119,1,0,0,0,24,121,1,0,0,0,26,
	123,1,0,0,0,28,125,1,0,0,0,30,128,1,0,0,0,32,34,3,20,10,0,33,32,1,0,0,0,
	33,34,1,0,0,0,34,42,1,0,0,0,35,43,3,26,13,0,36,43,3,22,11,0,37,43,3,24,
	12,0,38,43,3,28,14,0,39,43,3,14,7,0,40,43,3,6,3,0,41,43,3,16,8,0,42,35,
	1,0,0,0,42,36,1,0,0,0,42,37,1,0,0,0,42,38,1,0,0,0,42,39,1,0,0,0,42,40,1,
	0,0,0,42,41,1,0,0,0,43,1,1,0,0,0,44,47,1,0,0,0,45,47,3,0,0,0,46,44,1,0,
	0,0,46,45,1,0,0,0,47,3,1,0,0,0,48,49,3,2,1,0,49,50,5,22,0,0,50,52,1,0,0,
	0,51,48,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,56,1,0,0,0,
	55,53,1,0,0,0,56,57,5,0,0,1,57,5,1,0,0,0,58,59,3,8,4,0,59,60,5,12,0,0,60,
	61,3,10,5,0,61,63,5,18,0,0,62,64,3,12,6,0,63,62,1,0,0,0,63,64,1,0,0,0,64,
	65,1,0,0,0,65,66,5,19,0,0,66,7,1,0,0,0,67,68,3,30,15,0,68,9,1,0,0,0,69,
	70,3,30,15,0,70,11,1,0,0,0,71,76,3,0,0,0,72,73,5,16,0,0,73,75,3,0,0,0,74,
	72,1,0,0,0,75,78,1,0,0,0,76,74,1,0,0,0,76,77,1,0,0,0,77,13,1,0,0,0,78,76,
	1,0,0,0,79,80,5,11,0,0,80,81,3,10,5,0,81,83,5,18,0,0,82,84,3,12,6,0,83,
	82,1,0,0,0,83,84,1,0,0,0,84,85,1,0,0,0,85,86,5,19,0,0,86,15,1,0,0,0,87,
	88,5,20,0,0,88,89,3,18,9,0,89,90,5,21,0,0,90,17,1,0,0,0,91,92,6,9,-1,0,
	92,93,3,0,0,0,93,111,1,0,0,0,94,95,10,6,0,0,95,96,5,7,0,0,96,110,3,18,9,
	7,97,98,10,5,0,0,98,99,5,8,0,0,99,110,3,18,9,6,100,101,10,4,0,0,101,102,
	5,9,0,0,102,110,3,18,9,5,103,104,10,3,0,0,104,105,5,10,0,0,105,110,3,18,
	9,4,106,107,10,2,0,0,107,108,5,11,0,0,108,110,3,18,9,3,109,94,1,0,0,0,109,
	97,1,0,0,0,109,100,1,0,0,0,109,103,1,0,0,0,109,106,1,0,0,0,110,113,1,0,
	0,0,111,109,1,0,0,0,111,112,1,0,0,0,112,19,1,0,0,0,113,111,1,0,0,0,114,
	115,5,6,0,0,115,21,1,0,0,0,116,117,5,8,0,0,117,120,5,3,0,0,118,120,5,3,
	0,0,119,116,1,0,0,0,119,118,1,0,0,0,120,23,1,0,0,0,121,122,7,0,0,0,122,
	25,1,0,0,0,123,124,7,1,0,0,124,27,1,0,0,0,125,126,3,30,15,0,126,29,1,0,
	0,0,127,129,5,9,0,0,128,127,1,0,0,0,128,129,1,0,0,0,129,130,1,0,0,0,130,
	131,5,17,0,0,131,31,1,0,0,0,11,33,42,46,53,63,76,83,109,111,119,128];

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
	public string_(): StringContext {
		return this.getTypedRuleContext(StringContext, 0) as StringContext;
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
	public bool(): BoolContext {
		return this.getTypedRuleContext(BoolContext, 0) as BoolContext;
	}
	public objectValueReference(): ObjectValueReferenceContext {
		return this.getTypedRuleContext(ObjectValueReferenceContext, 0) as ObjectValueReferenceContext;
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
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public BRACKET_START(): TerminalNode {
		return this.getToken(ReksioLangParser.BRACKET_START, 0);
	}
	public BRACKET_END(): TerminalNode {
		return this.getToken(ReksioLangParser.BRACKET_END, 0);
	}
	public methodCallArguments(): MethodCallArgumentsContext {
		return this.getTypedRuleContext(MethodCallArgumentsContext, 0) as MethodCallArgumentsContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodCall;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_objectName;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodName;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(ReksioLangParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(ReksioLangParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_methodCallArguments;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public AT(): TerminalNode {
		return this.getToken(ReksioLangParser.AT, 0);
	}
	public methodName(): MethodNameContext {
		return this.getTypedRuleContext(MethodNameContext, 0) as MethodNameContext;
	}
	public BRACKET_START(): TerminalNode {
		return this.getToken(ReksioLangParser.BRACKET_START, 0);
	}
	public BRACKET_END(): TerminalNode {
		return this.getToken(ReksioLangParser.BRACKET_END, 0);
	}
	public methodCallArguments(): MethodCallArgumentsContext {
		return this.getTypedRuleContext(MethodCallArgumentsContext, 0) as MethodCallArgumentsContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_specialCall;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public OPERATION_GROUPING_START(): TerminalNode {
		return this.getToken(ReksioLangParser.OPERATION_GROUPING_START, 0);
	}
	public operation(): OperationContext {
		return this.getTypedRuleContext(OperationContext, 0) as OperationContext;
	}
	public OPERATION_GROUPING_END(): TerminalNode {
		return this.getToken(ReksioLangParser.OPERATION_GROUPING_END, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_operationGrouping;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public PLUS(): TerminalNode {
		return this.getToken(ReksioLangParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(ReksioLangParser.MINUS, 0);
	}
	public ASTERISK(): TerminalNode {
		return this.getToken(ReksioLangParser.ASTERISK, 0);
	}
	public PERCENTAGE(): TerminalNode {
		return this.getToken(ReksioLangParser.PERCENTAGE, 0);
	}
	public AT(): TerminalNode {
		return this.getToken(ReksioLangParser.AT, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_operation;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
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
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitComment) {
			return visitor.visitComment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NumberContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public MINUS(): TerminalNode {
		return this.getToken(ReksioLangParser.MINUS, 0);
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ReksioLangParser.NUMBER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_number;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BoolContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TRUE(): TerminalNode {
		return this.getToken(ReksioLangParser.TRUE, 0);
	}
	public FALSE(): TerminalNode {
		return this.getToken(ReksioLangParser.FALSE, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_bool;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitBool) {
			return visitor.visitBool(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CODE_STRING(): TerminalNode {
		return this.getToken(ReksioLangParser.CODE_STRING, 0);
	}
	public STRING(): TerminalNode {
		return this.getToken(ReksioLangParser.STRING, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_string;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ObjectValueReferenceContext extends ParserRuleContext {
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_objectValueReference;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitObjectValueReference) {
			return visitor.visitObjectValueReference(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	public _dereference!: Token;
	constructor(parser?: ReksioLangParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioLangParser.IDENTIFIER, 0);
	}
	public ASTERISK(): TerminalNode {
		return this.getToken(ReksioLangParser.ASTERISK, 0);
	}
    public get ruleIndex(): number {
    	return ReksioLangParser.RULE_identifier;
	}
	// @Override
	public accept<Result>(visitor: ReksioLangParserVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
