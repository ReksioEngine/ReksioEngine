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

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "T__5", "T__6", "TRUE", "FALSE", 
		"IDENTIFIER", "NUMBER", "CALLER_ARGUMENT", "STRING", "PLUS", "MINUS", 
		"WHITESPACE",
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

	public static readonly _serializedATN: number[] = [4,0,16,99,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,
	9,2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,1,0,1,0,1,
	1,1,1,1,2,1,2,1,3,1,3,1,4,1,4,1,5,1,5,1,6,1,6,1,7,1,7,1,7,1,7,1,7,1,8,1,
	8,1,8,1,8,1,8,1,8,1,9,1,9,5,9,61,8,9,10,9,12,9,64,9,9,1,10,3,10,67,8,10,
	1,10,4,10,70,8,10,11,10,12,10,71,1,11,1,11,4,11,76,8,11,11,11,12,11,77,
	1,12,1,12,5,12,82,8,12,10,12,12,12,85,9,12,1,12,1,12,1,13,1,13,1,14,1,14,
	1,15,4,15,94,8,15,11,15,12,15,95,1,15,1,15,1,83,0,16,1,1,3,2,5,3,7,4,9,
	5,11,6,13,7,15,8,17,9,19,10,21,11,23,12,25,13,27,14,29,15,31,16,1,0,4,3,
	0,65,90,95,95,97,122,4,0,48,57,65,90,95,95,97,122,1,0,48,57,3,0,9,10,12,
	13,32,32,104,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,
	0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,
	1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,0,27,1,0,0,0,0,29,1,0,0,0,0,31,1,0,0,
	0,1,33,1,0,0,0,3,35,1,0,0,0,5,37,1,0,0,0,7,39,1,0,0,0,9,41,1,0,0,0,11,43,
	1,0,0,0,13,45,1,0,0,0,15,47,1,0,0,0,17,52,1,0,0,0,19,58,1,0,0,0,21,66,1,
	0,0,0,23,73,1,0,0,0,25,79,1,0,0,0,27,88,1,0,0,0,29,90,1,0,0,0,31,93,1,0,
	0,0,33,34,5,59,0,0,34,2,1,0,0,0,35,36,5,94,0,0,36,4,1,0,0,0,37,38,5,40,
	0,0,38,6,1,0,0,0,39,40,5,41,0,0,40,8,1,0,0,0,41,42,5,44,0,0,42,10,1,0,0,
	0,43,44,5,91,0,0,44,12,1,0,0,0,45,46,5,93,0,0,46,14,1,0,0,0,47,48,5,84,
	0,0,48,49,5,82,0,0,49,50,5,85,0,0,50,51,5,69,0,0,51,16,1,0,0,0,52,53,5,
	70,0,0,53,54,5,65,0,0,54,55,5,76,0,0,55,56,5,83,0,0,56,57,5,69,0,0,57,18,
	1,0,0,0,58,62,7,0,0,0,59,61,7,1,0,0,60,59,1,0,0,0,61,64,1,0,0,0,62,60,1,
	0,0,0,62,63,1,0,0,0,63,20,1,0,0,0,64,62,1,0,0,0,65,67,5,45,0,0,66,65,1,
	0,0,0,66,67,1,0,0,0,67,69,1,0,0,0,68,70,7,2,0,0,69,68,1,0,0,0,70,71,1,0,
	0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,22,1,0,0,0,73,75,5,36,0,0,74,76,7,2,
	0,0,75,74,1,0,0,0,76,77,1,0,0,0,77,75,1,0,0,0,77,78,1,0,0,0,78,24,1,0,0,
	0,79,83,5,34,0,0,80,82,9,0,0,0,81,80,1,0,0,0,82,85,1,0,0,0,83,84,1,0,0,
	0,83,81,1,0,0,0,84,86,1,0,0,0,85,83,1,0,0,0,86,87,5,34,0,0,87,26,1,0,0,
	0,88,89,5,43,0,0,89,28,1,0,0,0,90,91,5,45,0,0,91,30,1,0,0,0,92,94,7,3,0,
	0,93,92,1,0,0,0,94,95,1,0,0,0,95,93,1,0,0,0,95,96,1,0,0,0,96,97,1,0,0,0,
	97,98,6,15,0,0,98,32,1,0,0,0,7,0,62,66,71,77,83,95,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioLangLexer.__ATN) {
			ReksioLangLexer.__ATN = new ATNDeserializer().deserialize(ReksioLangLexer._serializedATN);
		}

		return ReksioLangLexer.__ATN;
	}


	static DecisionsToDFA = ReksioLangLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}