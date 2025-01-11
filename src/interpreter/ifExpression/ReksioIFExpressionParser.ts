// Generated from ./src/interpreter/ifExpression/ReksioIFExpression.g4 by ANTLR 4.13.2
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
import ReksioIFExpressionVisitor from "./ReksioIFExpressionVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class ReksioIFExpressionParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly EQUAL = 2;
	public static readonly NOT_EQUAL = 3;
	public static readonly GREATER = 4;
	public static readonly SMALLER = 5;
	public static readonly GREATER_EQUAL = 6;
	public static readonly SMALLER_EQUAL = 7;
	public static readonly AND = 8;
	public static readonly OR = 9;
	public static readonly IDENTIFIER = 10;
	public static readonly NUMBER = 11;
	public static readonly STRING = 12;
	public static readonly WHITESPACE = 13;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_exprList = 0;
	public static readonly RULE_expr = 1;
	public static readonly RULE_value = 2;
	public static readonly RULE_number = 3;
	public static readonly RULE_string = 4;
	public static readonly RULE_identifier = 5;
	public static readonly RULE_logicOperator = 6;
	public static readonly literalNames: (string | null)[] = [ null, "'-'", 
                                                            "'''", "'!''", 
                                                            "'>'", "'<'", 
                                                            "'>''", "'<''", 
                                                            "'&&'", "'||'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             "EQUAL", "NOT_EQUAL", 
                                                             "GREATER", 
                                                             "SMALLER", 
                                                             "GREATER_EQUAL", 
                                                             "SMALLER_EQUAL", 
                                                             "AND", "OR", 
                                                             "IDENTIFIER", 
                                                             "NUMBER", "STRING", 
                                                             "WHITESPACE" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"exprList", "expr", "value", "number", "string", "identifier", "logicOperator",
	];
	public get grammarFileName(): string { return "ReksioIFExpression.g4"; }
	public get literalNames(): (string | null)[] { return ReksioIFExpressionParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return ReksioIFExpressionParser.symbolicNames; }
	public get ruleNames(): string[] { return ReksioIFExpressionParser.ruleNames; }
	public get serializedATN(): number[] { return ReksioIFExpressionParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, ReksioIFExpressionParser._ATN, ReksioIFExpressionParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public exprList(): ExprListContext {
		let localctx: ExprListContext = new ExprListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, ReksioIFExpressionParser.RULE_exprList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 14;
			this.expr();
			this.state = 20;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===8 || _la===9) {
				{
				{
				this.state = 15;
				this.logicOperator();
				this.state = 16;
				this.expr();
				}
				}
				this.state = 22;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 23;
			this.match(ReksioIFExpressionParser.EOF);
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
	public expr(): ExprContext {
		let localctx: ExprContext = new ExprContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, ReksioIFExpressionParser.RULE_expr);
		try {
			this.state = 49;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 25;
				localctx._left = this.value();
				this.state = 26;
				localctx._operator = this.match(ReksioIFExpressionParser.EQUAL);
				this.state = 27;
				localctx._right = this.value();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 29;
				localctx._left = this.value();
				this.state = 30;
				localctx._operator = this.match(ReksioIFExpressionParser.NOT_EQUAL);
				this.state = 31;
				localctx._right = this.value();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 33;
				localctx._left = this.value();
				this.state = 34;
				localctx._operator = this.match(ReksioIFExpressionParser.GREATER);
				this.state = 35;
				localctx._right = this.value();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 37;
				localctx._left = this.value();
				this.state = 38;
				localctx._operator = this.match(ReksioIFExpressionParser.SMALLER);
				this.state = 39;
				localctx._right = this.value();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 41;
				localctx._left = this.value();
				this.state = 42;
				localctx._operator = this.match(ReksioIFExpressionParser.GREATER_EQUAL);
				this.state = 43;
				localctx._right = this.value();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 45;
				localctx._left = this.value();
				this.state = 46;
				localctx._operator = this.match(ReksioIFExpressionParser.SMALLER_EQUAL);
				this.state = 47;
				localctx._right = this.value();
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
	public value(): ValueContext {
		let localctx: ValueContext = new ValueContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, ReksioIFExpressionParser.RULE_value);
		try {
			this.state = 54;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 10:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 51;
				this.identifier();
				}
				break;
			case 12:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 52;
				this.string_();
				}
				break;
			case 1:
			case 11:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 53;
				this.number_();
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
	public number_(): NumberContext {
		let localctx: NumberContext = new NumberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, ReksioIFExpressionParser.RULE_number);
		try {
			this.state = 59;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 56;
				this.match(ReksioIFExpressionParser.T__0);
				this.state = 57;
				this.match(ReksioIFExpressionParser.NUMBER);
				}
				break;
			case 11:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 58;
				this.match(ReksioIFExpressionParser.NUMBER);
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
	public string_(): StringContext {
		let localctx: StringContext = new StringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, ReksioIFExpressionParser.RULE_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 61;
			this.match(ReksioIFExpressionParser.STRING);
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
		this.enterRule(localctx, 10, ReksioIFExpressionParser.RULE_identifier);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 63;
			this.match(ReksioIFExpressionParser.IDENTIFIER);
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
	public logicOperator(): LogicOperatorContext {
		let localctx: LogicOperatorContext = new LogicOperatorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, ReksioIFExpressionParser.RULE_logicOperator);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 65;
			_la = this._input.LA(1);
			if(!(_la===8 || _la===9)) {
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

	public static readonly _serializedATN: number[] = [4,1,13,68,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,1,0,1,0,1,0,1,0,5,0,19,8,
	0,10,0,12,0,22,9,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,50,8,1,1,2,1,2,
	1,2,3,2,55,8,2,1,3,1,3,1,3,3,3,60,8,3,1,4,1,4,1,5,1,5,1,6,1,6,1,6,0,0,7,
	0,2,4,6,8,10,12,0,1,1,0,8,9,69,0,14,1,0,0,0,2,49,1,0,0,0,4,54,1,0,0,0,6,
	59,1,0,0,0,8,61,1,0,0,0,10,63,1,0,0,0,12,65,1,0,0,0,14,20,3,2,1,0,15,16,
	3,12,6,0,16,17,3,2,1,0,17,19,1,0,0,0,18,15,1,0,0,0,19,22,1,0,0,0,20,18,
	1,0,0,0,20,21,1,0,0,0,21,23,1,0,0,0,22,20,1,0,0,0,23,24,5,0,0,1,24,1,1,
	0,0,0,25,26,3,4,2,0,26,27,5,2,0,0,27,28,3,4,2,0,28,50,1,0,0,0,29,30,3,4,
	2,0,30,31,5,3,0,0,31,32,3,4,2,0,32,50,1,0,0,0,33,34,3,4,2,0,34,35,5,4,0,
	0,35,36,3,4,2,0,36,50,1,0,0,0,37,38,3,4,2,0,38,39,5,5,0,0,39,40,3,4,2,0,
	40,50,1,0,0,0,41,42,3,4,2,0,42,43,5,6,0,0,43,44,3,4,2,0,44,50,1,0,0,0,45,
	46,3,4,2,0,46,47,5,7,0,0,47,48,3,4,2,0,48,50,1,0,0,0,49,25,1,0,0,0,49,29,
	1,0,0,0,49,33,1,0,0,0,49,37,1,0,0,0,49,41,1,0,0,0,49,45,1,0,0,0,50,3,1,
	0,0,0,51,55,3,10,5,0,52,55,3,8,4,0,53,55,3,6,3,0,54,51,1,0,0,0,54,52,1,
	0,0,0,54,53,1,0,0,0,55,5,1,0,0,0,56,57,5,1,0,0,57,60,5,11,0,0,58,60,5,11,
	0,0,59,56,1,0,0,0,59,58,1,0,0,0,60,7,1,0,0,0,61,62,5,12,0,0,62,9,1,0,0,
	0,63,64,5,10,0,0,64,11,1,0,0,0,65,66,7,0,0,0,66,13,1,0,0,0,4,20,49,54,59];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioIFExpressionParser.__ATN) {
			ReksioIFExpressionParser.__ATN = new ATNDeserializer().deserialize(ReksioIFExpressionParser._serializedATN);
		}

		return ReksioIFExpressionParser.__ATN;
	}


	static DecisionsToDFA = ReksioIFExpressionParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ExprListContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.EOF, 0);
	}
	public logicOperator_list(): LogicOperatorContext[] {
		return this.getTypedRuleContexts(LogicOperatorContext) as LogicOperatorContext[];
	}
	public logicOperator(i: number): LogicOperatorContext {
		return this.getTypedRuleContext(LogicOperatorContext, i) as LogicOperatorContext;
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_exprList;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitExprList) {
			return visitor.visitExprList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	public _left!: ValueContext;
	public _operator!: Token;
	public _right!: ValueContext;
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public value_list(): ValueContext[] {
		return this.getTypedRuleContexts(ValueContext) as ValueContext[];
	}
	public value(i: number): ValueContext {
		return this.getTypedRuleContext(ValueContext, i) as ValueContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.EQUAL, 0);
	}
	public NOT_EQUAL(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.NOT_EQUAL, 0);
	}
	public GREATER(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.GREATER, 0);
	}
	public SMALLER(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.SMALLER, 0);
	}
	public GREATER_EQUAL(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.GREATER_EQUAL, 0);
	}
	public SMALLER_EQUAL(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.SMALLER_EQUAL, 0);
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_expr;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitExpr) {
			return visitor.visitExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public identifier(): IdentifierContext {
		return this.getTypedRuleContext(IdentifierContext, 0) as IdentifierContext;
	}
	public string_(): StringContext {
		return this.getTypedRuleContext(StringContext, 0) as StringContext;
	}
	public number_(): NumberContext {
		return this.getTypedRuleContext(NumberContext, 0) as NumberContext;
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_value;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitValue) {
			return visitor.visitValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NumberContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUMBER(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.NUMBER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_number;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitNumber) {
			return visitor.visitNumber(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.STRING, 0);
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_string;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentifierContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IDENTIFIER(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.IDENTIFIER, 0);
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_identifier;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitIdentifier) {
			return visitor.visitIdentifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LogicOperatorContext extends ParserRuleContext {
	constructor(parser?: ReksioIFExpressionParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public AND(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.AND, 0);
	}
	public OR(): TerminalNode {
		return this.getToken(ReksioIFExpressionParser.OR, 0);
	}
    public get ruleIndex(): number {
    	return ReksioIFExpressionParser.RULE_logicOperator;
	}
	// @Override
	public accept<Result>(visitor: ReksioIFExpressionVisitor<Result>): Result {
		if (visitor.visitLogicOperator) {
			return visitor.visitLogicOperator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
