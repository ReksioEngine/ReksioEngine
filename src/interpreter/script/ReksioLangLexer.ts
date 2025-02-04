// Generated from ./src/interpreter/script/ReksioLang.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import {
	ATN,
	ATNDeserializer,
	CharStream,
	DecisionState, DFA,
	Lexer,
	LexerATNSimulator,
	RuleContext,
	PredictionContextCache,
	Token
} from "antlr4";
export default class ReksioLangLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly TRUE = 6;
	public static readonly FALSE = 7;
	public static readonly IDENTIFIER = 8;
	public static readonly NUMBER = 9;
	public static readonly CODE_STRING = 10;
	public static readonly STRING = 11;
	public static readonly COMMENT_START = 12;
	public static readonly ADD = 13;
	public static readonly SUB = 14;
	public static readonly MUL = 15;
	public static readonly MOD = 16;
	public static readonly DIV = 17;
	public static readonly METHOD_CALL_SYMBOL = 18;
	public static readonly STATEMENT_END = 19;
	public static readonly TYPO = 20;
	public static readonly WHITESPACE = 21;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	public static readonly literalNames: (string | null)[] = [ null, "'('", 
                                                            "')'", "','", 
                                                            "'['", "']'", 
                                                            "'TRUE'", "'FALSE'", 
                                                            null, null, 
                                                            null, null, 
                                                            null, "'+'", 
                                                            "'-'", "'*'", 
                                                            "'%'", "'@'", 
                                                            "'^'", "';'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             "TRUE", "FALSE", 
                                                             "IDENTIFIER", 
                                                             "NUMBER", "CODE_STRING", 
                                                             "STRING", "COMMENT_START", 
                                                             "ADD", "SUB", 
                                                             "MUL", "MOD", 
                                                             "DIV", "METHOD_CALL_SYMBOL", 
                                                             "STATEMENT_END", 
                                                             "TYPO", "WHITESPACE" ];
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "TRUE", "FALSE", "IDENTIFIER", 
		"NUMBER", "CODE_STRING", "STRING", "COMMENT_START", "ADD", "SUB", "MUL", 
		"MOD", "DIV", "METHOD_CALL_SYMBOL", "STATEMENT_END", "TYPO", "WHITESPACE",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, ReksioLangLexer._ATN, ReksioLangLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "ReksioLang.g4"; }

	public get literalNames(): (string | null)[] { return ReksioLangLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return ReksioLangLexer.symbolicNames; }
	public get ruleNames(): string[] { return ReksioLangLexer.ruleNames; }

	public get serializedATN(): number[] { return ReksioLangLexer._serializedATN; }

	public get channelNames(): string[] { return ReksioLangLexer.channelNames; }

	public get modeNames(): string[] { return ReksioLangLexer.modeNames; }

	// @Override
	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 7:
			return this.IDENTIFIER_sempred(localctx, predIndex);
		}
		return true;
	}
	private IDENTIFIER_sempred(localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  this.text.match(/[A-Za-z$]/) !== null ;
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,0,21,133,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,1,0,1,0,1,1,1,1,1,2,1,2,1,3,
	1,3,1,4,1,4,1,5,1,5,1,5,1,5,1,5,1,6,1,6,1,6,1,6,1,6,1,6,1,7,4,7,66,8,7,
	11,7,12,7,67,1,7,1,7,1,8,4,8,73,8,8,11,8,12,8,74,1,8,1,8,4,8,79,8,8,11,
	8,12,8,80,3,8,83,8,8,1,9,1,9,1,9,1,9,5,9,89,8,9,10,9,12,9,92,9,9,1,9,1,
	9,1,9,1,10,1,10,5,10,99,8,10,10,10,12,10,102,9,10,1,10,1,10,1,11,4,11,107,
	8,11,11,11,12,11,108,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,
	1,17,1,17,1,18,1,18,1,19,1,19,1,20,4,20,128,8,20,11,20,12,20,129,1,20,1,
	20,0,0,21,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,
	13,27,14,29,15,31,16,33,17,35,18,37,19,39,20,41,21,1,0,6,6,0,36,36,45,45,
	48,57,65,90,95,95,97,122,1,0,48,57,1,0,123,123,2,0,41,41,44,44,2,0,58,58,
	62,62,3,0,9,10,12,13,32,32,140,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,
	1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,
	0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,
	0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,0,39,1,0,0,0,
	0,41,1,0,0,0,1,43,1,0,0,0,3,45,1,0,0,0,5,47,1,0,0,0,7,49,1,0,0,0,9,51,1,
	0,0,0,11,53,1,0,0,0,13,58,1,0,0,0,15,65,1,0,0,0,17,72,1,0,0,0,19,84,1,0,
	0,0,21,96,1,0,0,0,23,106,1,0,0,0,25,110,1,0,0,0,27,112,1,0,0,0,29,114,1,
	0,0,0,31,116,1,0,0,0,33,118,1,0,0,0,35,120,1,0,0,0,37,122,1,0,0,0,39,124,
	1,0,0,0,41,127,1,0,0,0,43,44,5,40,0,0,44,2,1,0,0,0,45,46,5,41,0,0,46,4,
	1,0,0,0,47,48,5,44,0,0,48,6,1,0,0,0,49,50,5,91,0,0,50,8,1,0,0,0,51,52,5,
	93,0,0,52,10,1,0,0,0,53,54,5,84,0,0,54,55,5,82,0,0,55,56,5,85,0,0,56,57,
	5,69,0,0,57,12,1,0,0,0,58,59,5,70,0,0,59,60,5,65,0,0,60,61,5,76,0,0,61,
	62,5,83,0,0,62,63,5,69,0,0,63,14,1,0,0,0,64,66,7,0,0,0,65,64,1,0,0,0,66,
	67,1,0,0,0,67,65,1,0,0,0,67,68,1,0,0,0,68,69,1,0,0,0,69,70,4,7,0,0,70,16,
	1,0,0,0,71,73,7,1,0,0,72,71,1,0,0,0,73,74,1,0,0,0,74,72,1,0,0,0,74,75,1,
	0,0,0,75,82,1,0,0,0,76,78,5,46,0,0,77,79,7,1,0,0,78,77,1,0,0,0,79,80,1,
	0,0,0,80,78,1,0,0,0,80,81,1,0,0,0,81,83,1,0,0,0,82,76,1,0,0,0,82,83,1,0,
	0,0,83,18,1,0,0,0,84,85,5,34,0,0,85,86,5,123,0,0,86,90,1,0,0,0,87,89,8,
	2,0,0,88,87,1,0,0,0,89,92,1,0,0,0,90,88,1,0,0,0,90,91,1,0,0,0,91,93,1,0,
	0,0,92,90,1,0,0,0,93,94,5,125,0,0,94,95,5,34,0,0,95,20,1,0,0,0,96,100,5,
	34,0,0,97,99,8,3,0,0,98,97,1,0,0,0,99,102,1,0,0,0,100,98,1,0,0,0,100,101,
	1,0,0,0,101,103,1,0,0,0,102,100,1,0,0,0,103,104,5,34,0,0,104,22,1,0,0,0,
	105,107,5,33,0,0,106,105,1,0,0,0,107,108,1,0,0,0,108,106,1,0,0,0,108,109,
	1,0,0,0,109,24,1,0,0,0,110,111,5,43,0,0,111,26,1,0,0,0,112,113,5,45,0,0,
	113,28,1,0,0,0,114,115,5,42,0,0,115,30,1,0,0,0,116,117,5,37,0,0,117,32,
	1,0,0,0,118,119,5,64,0,0,119,34,1,0,0,0,120,121,5,94,0,0,121,36,1,0,0,0,
	122,123,5,59,0,0,123,38,1,0,0,0,124,125,7,4,0,0,125,40,1,0,0,0,126,128,
	7,5,0,0,127,126,1,0,0,0,128,129,1,0,0,0,129,127,1,0,0,0,129,130,1,0,0,0,
	130,131,1,0,0,0,131,132,6,20,0,0,132,42,1,0,0,0,9,0,67,74,80,82,90,100,
	108,129,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioLangLexer.__ATN) {
			ReksioLangLexer.__ATN = new ATNDeserializer().deserialize(ReksioLangLexer._serializedATN);
		}

		return ReksioLangLexer.__ATN;
	}


	static DecisionsToDFA = ReksioLangLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}