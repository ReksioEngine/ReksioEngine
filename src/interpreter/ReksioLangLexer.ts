// Generated from ./src/interpreter/ReksioLang.g4 by ANTLR 4.13.2
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
	public static readonly COMMENT_START = 11;
	public static readonly ADD = 12;
	public static readonly SUB = 13;
	public static readonly MUL = 14;
	public static readonly MOD = 15;
	public static readonly DIV = 16;
	public static readonly METHOD_CALL_SYMBOL = 17;
	public static readonly STATEMENT_END = 18;
	public static readonly WHITESPACE = 19;
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "TRUE", "FALSE", "IDENTIFIER", 
		"NUMBER", "STRING", "COMMENT_START", "ADD", "SUB", "MUL", "MOD", "DIV", 
		"METHOD_CALL_SYMBOL", "STATEMENT_END", "WHITESPACE",
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

	public static readonly _serializedATN: number[] = [4,0,19,139,6,-1,2,0,
	7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,
	7,9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,
	16,2,17,7,17,2,18,7,18,1,0,1,0,1,1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,
	1,5,1,5,1,5,1,6,1,6,1,6,1,6,1,6,1,6,1,7,5,7,62,8,7,10,7,12,7,65,9,7,1,7,
	4,7,68,8,7,11,7,12,7,69,1,7,5,7,73,8,7,10,7,12,7,76,9,7,1,8,4,8,79,8,8,
	11,8,12,8,80,1,8,1,8,4,8,85,8,8,11,8,12,8,86,3,8,89,8,8,1,9,1,9,1,9,1,9,
	5,9,95,8,9,10,9,12,9,98,9,9,1,9,1,9,1,9,1,9,5,9,104,8,9,10,9,12,9,107,9,
	9,1,9,3,9,110,8,9,3,9,112,8,9,1,10,4,10,115,8,10,11,10,12,10,116,1,11,1,
	11,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,16,1,16,1,17,1,17,1,18,4,18,
	134,8,18,11,18,12,18,135,1,18,1,18,0,0,19,1,1,3,2,5,3,7,4,9,5,11,6,13,7,
	15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,33,17,35,18,37,19,1,
	0,8,5,0,36,36,48,57,65,90,95,95,97,122,5,0,36,36,63,63,65,90,95,95,97,122,
	1,0,48,57,1,0,34,34,2,0,34,34,44,44,2,0,62,62,94,94,1,0,58,59,3,0,9,10,
	12,13,32,32,150,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,
	0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,
	21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,
	0,0,0,33,1,0,0,0,0,35,1,0,0,0,0,37,1,0,0,0,1,39,1,0,0,0,3,41,1,0,0,0,5,
	43,1,0,0,0,7,45,1,0,0,0,9,47,1,0,0,0,11,49,1,0,0,0,13,54,1,0,0,0,15,63,
	1,0,0,0,17,78,1,0,0,0,19,111,1,0,0,0,21,114,1,0,0,0,23,118,1,0,0,0,25,120,
	1,0,0,0,27,122,1,0,0,0,29,124,1,0,0,0,31,126,1,0,0,0,33,128,1,0,0,0,35,
	130,1,0,0,0,37,133,1,0,0,0,39,40,5,40,0,0,40,2,1,0,0,0,41,42,5,41,0,0,42,
	4,1,0,0,0,43,44,5,44,0,0,44,6,1,0,0,0,45,46,5,91,0,0,46,8,1,0,0,0,47,48,
	5,93,0,0,48,10,1,0,0,0,49,50,5,84,0,0,50,51,5,82,0,0,51,52,5,85,0,0,52,
	53,5,69,0,0,53,12,1,0,0,0,54,55,5,70,0,0,55,56,5,65,0,0,56,57,5,76,0,0,
	57,58,5,83,0,0,58,59,5,69,0,0,59,14,1,0,0,0,60,62,7,0,0,0,61,60,1,0,0,0,
	62,65,1,0,0,0,63,61,1,0,0,0,63,64,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,66,
	68,7,1,0,0,67,66,1,0,0,0,68,69,1,0,0,0,69,67,1,0,0,0,69,70,1,0,0,0,70,74,
	1,0,0,0,71,73,7,0,0,0,72,71,1,0,0,0,73,76,1,0,0,0,74,72,1,0,0,0,74,75,1,
	0,0,0,75,16,1,0,0,0,76,74,1,0,0,0,77,79,7,2,0,0,78,77,1,0,0,0,79,80,1,0,
	0,0,80,78,1,0,0,0,80,81,1,0,0,0,81,88,1,0,0,0,82,84,5,46,0,0,83,85,7,2,
	0,0,84,83,1,0,0,0,85,86,1,0,0,0,86,84,1,0,0,0,86,87,1,0,0,0,87,89,1,0,0,
	0,88,82,1,0,0,0,88,89,1,0,0,0,89,18,1,0,0,0,90,91,5,34,0,0,91,92,5,34,0,
	0,92,96,1,0,0,0,93,95,8,3,0,0,94,93,1,0,0,0,95,98,1,0,0,0,96,94,1,0,0,0,
	96,97,1,0,0,0,97,99,1,0,0,0,98,96,1,0,0,0,99,100,5,34,0,0,100,112,5,34,
	0,0,101,105,5,34,0,0,102,104,8,4,0,0,103,102,1,0,0,0,104,107,1,0,0,0,105,
	103,1,0,0,0,105,106,1,0,0,0,106,109,1,0,0,0,107,105,1,0,0,0,108,110,5,34,
	0,0,109,108,1,0,0,0,109,110,1,0,0,0,110,112,1,0,0,0,111,90,1,0,0,0,111,
	101,1,0,0,0,112,20,1,0,0,0,113,115,5,33,0,0,114,113,1,0,0,0,115,116,1,0,
	0,0,116,114,1,0,0,0,116,117,1,0,0,0,117,22,1,0,0,0,118,119,5,43,0,0,119,
	24,1,0,0,0,120,121,5,45,0,0,121,26,1,0,0,0,122,123,5,42,0,0,123,28,1,0,
	0,0,124,125,5,37,0,0,125,30,1,0,0,0,126,127,5,64,0,0,127,32,1,0,0,0,128,
	129,7,5,0,0,129,34,1,0,0,0,130,131,7,6,0,0,131,36,1,0,0,0,132,134,7,7,0,
	0,133,132,1,0,0,0,134,135,1,0,0,0,135,133,1,0,0,0,135,136,1,0,0,0,136,137,
	1,0,0,0,137,138,6,18,0,0,138,38,1,0,0,0,13,0,63,69,74,80,86,88,96,105,109,
	111,116,135,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioLangLexer.__ATN) {
			ReksioLangLexer.__ATN = new ATNDeserializer().deserialize(ReksioLangLexer._serializedATN);
		}

		return ReksioLangLexer.__ATN;
	}


	static DecisionsToDFA = ReksioLangLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}