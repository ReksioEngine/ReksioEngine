// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.1
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

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "TRUE", "FALSE", "IDENTIFIER", 
		"NUMBER", "STRING", "ADD", "SUB", "MUL", "MOD", "DIV", "METHOD_CALL_SYMBOL", 
		"STATEMENT_END", "WHITESPACE",
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

	public static readonly _serializedATN: number[] = [4,0,18,132,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,5,1,5,1,
	5,1,6,1,6,1,6,1,6,1,6,1,6,1,7,5,7,60,8,7,10,7,12,7,63,9,7,1,7,4,7,66,8,
	7,11,7,12,7,67,1,7,5,7,71,8,7,10,7,12,7,74,9,7,1,8,4,8,77,8,8,11,8,12,8,
	78,1,8,1,8,4,8,83,8,8,11,8,12,8,84,3,8,87,8,8,1,9,1,9,1,9,1,9,5,9,93,8,
	9,10,9,12,9,96,9,9,1,9,1,9,1,9,1,9,5,9,102,8,9,10,9,12,9,105,9,9,1,9,3,
	9,108,8,9,3,9,110,8,9,1,10,1,10,1,11,1,11,1,12,1,12,1,13,1,13,1,14,1,14,
	1,15,1,15,1,16,1,16,1,17,4,17,127,8,17,11,17,12,17,128,1,17,1,17,0,0,18,
	1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,
	15,31,16,33,17,35,18,1,0,8,5,0,36,36,48,57,65,90,95,95,97,122,5,0,36,36,
	63,63,65,90,95,95,97,122,1,0,48,57,1,0,34,34,2,0,34,34,44,44,2,0,62,62,
	94,94,1,0,58,59,3,0,9,10,12,13,32,32,142,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,
	0,0,0,0,7,1,0,0,0,0,9,1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,
	17,1,0,0,0,0,19,1,0,0,0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,
	0,0,0,29,1,0,0,0,0,31,1,0,0,0,0,33,1,0,0,0,0,35,1,0,0,0,1,37,1,0,0,0,3,
	39,1,0,0,0,5,41,1,0,0,0,7,43,1,0,0,0,9,45,1,0,0,0,11,47,1,0,0,0,13,52,1,
	0,0,0,15,61,1,0,0,0,17,76,1,0,0,0,19,109,1,0,0,0,21,111,1,0,0,0,23,113,
	1,0,0,0,25,115,1,0,0,0,27,117,1,0,0,0,29,119,1,0,0,0,31,121,1,0,0,0,33,
	123,1,0,0,0,35,126,1,0,0,0,37,38,5,40,0,0,38,2,1,0,0,0,39,40,5,41,0,0,40,
	4,1,0,0,0,41,42,5,44,0,0,42,6,1,0,0,0,43,44,5,91,0,0,44,8,1,0,0,0,45,46,
	5,93,0,0,46,10,1,0,0,0,47,48,5,84,0,0,48,49,5,82,0,0,49,50,5,85,0,0,50,
	51,5,69,0,0,51,12,1,0,0,0,52,53,5,70,0,0,53,54,5,65,0,0,54,55,5,76,0,0,
	55,56,5,83,0,0,56,57,5,69,0,0,57,14,1,0,0,0,58,60,7,0,0,0,59,58,1,0,0,0,
	60,63,1,0,0,0,61,59,1,0,0,0,61,62,1,0,0,0,62,65,1,0,0,0,63,61,1,0,0,0,64,
	66,7,1,0,0,65,64,1,0,0,0,66,67,1,0,0,0,67,65,1,0,0,0,67,68,1,0,0,0,68,72,
	1,0,0,0,69,71,7,0,0,0,70,69,1,0,0,0,71,74,1,0,0,0,72,70,1,0,0,0,72,73,1,
	0,0,0,73,16,1,0,0,0,74,72,1,0,0,0,75,77,7,2,0,0,76,75,1,0,0,0,77,78,1,0,
	0,0,78,76,1,0,0,0,78,79,1,0,0,0,79,86,1,0,0,0,80,82,5,46,0,0,81,83,7,2,
	0,0,82,81,1,0,0,0,83,84,1,0,0,0,84,82,1,0,0,0,84,85,1,0,0,0,85,87,1,0,0,
	0,86,80,1,0,0,0,86,87,1,0,0,0,87,18,1,0,0,0,88,89,5,34,0,0,89,90,5,34,0,
	0,90,94,1,0,0,0,91,93,8,3,0,0,92,91,1,0,0,0,93,96,1,0,0,0,94,92,1,0,0,0,
	94,95,1,0,0,0,95,97,1,0,0,0,96,94,1,0,0,0,97,98,5,34,0,0,98,110,5,34,0,
	0,99,103,5,34,0,0,100,102,8,4,0,0,101,100,1,0,0,0,102,105,1,0,0,0,103,101,
	1,0,0,0,103,104,1,0,0,0,104,107,1,0,0,0,105,103,1,0,0,0,106,108,5,34,0,
	0,107,106,1,0,0,0,107,108,1,0,0,0,108,110,1,0,0,0,109,88,1,0,0,0,109,99,
	1,0,0,0,110,20,1,0,0,0,111,112,5,43,0,0,112,22,1,0,0,0,113,114,5,45,0,0,
	114,24,1,0,0,0,115,116,5,42,0,0,116,26,1,0,0,0,117,118,5,37,0,0,118,28,
	1,0,0,0,119,120,5,64,0,0,120,30,1,0,0,0,121,122,7,5,0,0,122,32,1,0,0,0,
	123,124,7,6,0,0,124,34,1,0,0,0,125,127,7,7,0,0,126,125,1,0,0,0,127,128,
	1,0,0,0,128,126,1,0,0,0,128,129,1,0,0,0,129,130,1,0,0,0,130,131,6,17,0,
	0,131,36,1,0,0,0,12,0,61,67,72,78,84,86,94,103,107,109,128,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioLangLexer.__ATN) {
			ReksioLangLexer.__ATN = new ATNDeserializer().deserialize(ReksioLangLexer._serializedATN);
		}

		return ReksioLangLexer.__ATN;
	}


	static DecisionsToDFA = ReksioLangLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}