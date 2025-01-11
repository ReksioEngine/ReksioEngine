// Generated from ./src/interpreter/ifExpression/ReksioIFExpression.g4 by ANTLR 4.13.2
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
export default class ReksioIFExpressionLexer extends Lexer {
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
	public static readonly EOF = Token.EOF;

	public static readonly channelNames: string[] = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
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
	public static readonly modeNames: string[] = [ "DEFAULT_MODE", ];

	public static readonly ruleNames: string[] = [
		"T__0", "EQUAL", "NOT_EQUAL", "GREATER", "SMALLER", "GREATER_EQUAL", "SMALLER_EQUAL", 
		"AND", "OR", "IDENTIFIER", "NUMBER", "STRING", "WHITESPACE",
	];


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(this, ReksioIFExpressionLexer._ATN, ReksioIFExpressionLexer.DecisionsToDFA, new PredictionContextCache());
	}

	public get grammarFileName(): string { return "ReksioIFExpression.g4"; }

	public get literalNames(): (string | null)[] { return ReksioIFExpressionLexer.literalNames; }
	public get symbolicNames(): (string | null)[] { return ReksioIFExpressionLexer.symbolicNames; }
	public get ruleNames(): string[] { return ReksioIFExpressionLexer.ruleNames; }

	public get serializedATN(): number[] { return ReksioIFExpressionLexer._serializedATN; }

	public get channelNames(): string[] { return ReksioIFExpressionLexer.channelNames; }

	public get modeNames(): string[] { return ReksioIFExpressionLexer.modeNames; }

	public static readonly _serializedATN: number[] = [4,0,13,96,6,-1,2,0,7,
	0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,
	9,2,10,7,10,2,11,7,11,2,12,7,12,1,0,1,0,1,1,1,1,1,2,1,2,1,2,1,3,1,3,1,4,
	1,4,1,5,1,5,1,5,1,6,1,6,1,6,1,7,1,7,1,7,1,8,1,8,1,8,1,9,5,9,52,8,9,10,9,
	12,9,55,9,9,1,9,4,9,58,8,9,11,9,12,9,59,1,9,5,9,63,8,9,10,9,12,9,66,9,9,
	1,10,4,10,69,8,10,11,10,12,10,70,1,10,1,10,4,10,75,8,10,11,10,12,10,76,
	3,10,79,8,10,1,11,1,11,5,11,83,8,11,10,11,12,11,86,9,11,1,11,1,11,1,12,
	4,12,91,8,12,11,12,12,12,92,1,12,1,12,0,0,13,1,1,3,2,5,3,7,4,9,5,11,6,13,
	7,15,8,17,9,19,10,21,11,23,12,25,13,1,0,5,5,0,36,36,48,57,65,90,95,95,97,
	122,5,0,36,36,63,63,65,90,95,95,97,122,1,0,48,57,2,0,41,41,44,44,3,0,9,
	10,12,13,32,32,103,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,
	1,0,0,0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,
	0,0,21,1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,1,27,1,0,0,0,3,29,1,0,0,0,5,31,
	1,0,0,0,7,34,1,0,0,0,9,36,1,0,0,0,11,38,1,0,0,0,13,41,1,0,0,0,15,44,1,0,
	0,0,17,47,1,0,0,0,19,53,1,0,0,0,21,68,1,0,0,0,23,80,1,0,0,0,25,90,1,0,0,
	0,27,28,5,45,0,0,28,2,1,0,0,0,29,30,5,39,0,0,30,4,1,0,0,0,31,32,5,33,0,
	0,32,33,5,39,0,0,33,6,1,0,0,0,34,35,5,62,0,0,35,8,1,0,0,0,36,37,5,60,0,
	0,37,10,1,0,0,0,38,39,5,62,0,0,39,40,5,39,0,0,40,12,1,0,0,0,41,42,5,60,
	0,0,42,43,5,39,0,0,43,14,1,0,0,0,44,45,5,38,0,0,45,46,5,38,0,0,46,16,1,
	0,0,0,47,48,5,124,0,0,48,49,5,124,0,0,49,18,1,0,0,0,50,52,7,0,0,0,51,50,
	1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,57,1,0,0,0,55,53,1,
	0,0,0,56,58,7,1,0,0,57,56,1,0,0,0,58,59,1,0,0,0,59,57,1,0,0,0,59,60,1,0,
	0,0,60,64,1,0,0,0,61,63,7,0,0,0,62,61,1,0,0,0,63,66,1,0,0,0,64,62,1,0,0,
	0,64,65,1,0,0,0,65,20,1,0,0,0,66,64,1,0,0,0,67,69,7,2,0,0,68,67,1,0,0,0,
	69,70,1,0,0,0,70,68,1,0,0,0,70,71,1,0,0,0,71,78,1,0,0,0,72,74,5,46,0,0,
	73,75,7,2,0,0,74,73,1,0,0,0,75,76,1,0,0,0,76,74,1,0,0,0,76,77,1,0,0,0,77,
	79,1,0,0,0,78,72,1,0,0,0,78,79,1,0,0,0,79,22,1,0,0,0,80,84,5,34,0,0,81,
	83,8,3,0,0,82,81,1,0,0,0,83,86,1,0,0,0,84,82,1,0,0,0,84,85,1,0,0,0,85,87,
	1,0,0,0,86,84,1,0,0,0,87,88,5,34,0,0,88,24,1,0,0,0,89,91,7,4,0,0,90,89,
	1,0,0,0,91,92,1,0,0,0,92,90,1,0,0,0,92,93,1,0,0,0,93,94,1,0,0,0,94,95,6,
	12,0,0,95,26,1,0,0,0,9,0,53,59,64,70,76,78,84,92,1,6,0,0];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ReksioIFExpressionLexer.__ATN) {
			ReksioIFExpressionLexer.__ATN = new ATNDeserializer().deserialize(ReksioIFExpressionLexer._serializedATN);
		}

		return ReksioIFExpressionLexer.__ATN;
	}


	static DecisionsToDFA = ReksioIFExpressionLexer._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );
}