lexer grammar ReksioLangLexer;

// Keywords
fragment F_TRUE : 'TRUE';
fragment F_FALSE: 'FALSE';

// Literals
fragment F_NUMBER: [0-9]+ ('.' [0-9]+)? ;
fragment F_CODE_STRING: '"{' ~[{]* '}"';
fragment F_STRING: '"' ~[,)]* '"';
fragment F_COMMENT_START: '!'+;

// Arthmetic operators
fragment F_ADD: '+';
fragment F_SUB: '-';
fragment F_MUL: '*';
fragment F_MOD: '%';
fragment F_DIV: '@';

fragment F_METHOD_CALL_SYMBOL: '^';
fragment F_OPERATION_GROUPING_START: '[';
fragment F_OPERATION_GROUPING_END: ']';
fragment F_BRACKET_START: '(';
fragment F_BRACKET_END: ')';
fragment F_COMMA: ',';

// Inconsistency
fragment F_TYPO: [>:];
fragment F_TYPO_QUOTE: '"';
fragment F_WHITESPACE: [ \t\u000C\r\n]+;

// Default mode - Common (don't look at it)
TRUE : F_TRUE;
FALSE: F_FALSE;
NUMBER: F_NUMBER;
CODE_STRING: F_CODE_STRING;
STRING: F_STRING;
COMMENT_START: F_COMMENT_START;
ADD: F_ADD;
SUB: F_SUB;
MUL: F_MUL;
MOD: F_MOD;
DIV: F_DIV;
METHOD_CALL_SYMBOL: F_METHOD_CALL_SYMBOL;
TYPO: F_TYPO;
TYPO_QUOTE: F_TYPO_QUOTE -> pushMode(MISSING_QUOTE);
WHITESPACE: F_WHITESPACE -> skip;
COMMA: F_COMMA;

// Default mode
IDENTIFIER: [a-zA-Z0-9_$\-]+ { this.text.match(/[A-Za-z$]/) !== null }? ;

BRACKET_START: F_BRACKET_START -> pushMode(DEFAULT_MODE);
BRACKET_END: F_BRACKET_END -> popMode;

OPERATION_GROUPING_START: F_OPERATION_GROUPING_START -> pushMode(INSIDE);
OPERATION_GROUPING_END: F_OPERATION_GROUPING_END -> popMode;

STATEMENT_END: ';';

mode INSIDE;
// Inside mode - Common (don't look at it)
I_TRUE : F_TRUE -> type(TRUE);
I_FALSE: F_FALSE -> type(FALSE);
I_NUMBER: F_NUMBER -> type(NUMBER);
I_CODE_STRING: F_CODE_STRING -> type(CODE_STRING);
I_STRING: F_STRING -> type(STRING);
I_COMMENT_START: F_COMMENT_START -> type(COMMENT_START);
I_ADD: F_ADD -> type(ADD);
I_SUB: F_SUB -> type(SUB);
I_MUL: F_MUL -> type(MUL);
I_MOD: F_MOD -> type(MOD);
I_DIV: F_DIV -> type(DIV);
I_METHOD_CALL_SYMBOL: F_METHOD_CALL_SYMBOL -> type(METHOD_CALL_SYMBOL);
I_TYPO: F_TYPO -> type(TYPO);
I_WHITESPACE: F_WHITESPACE -> skip;
I_COMMA: F_COMMA -> type(COMMA);

// Inside mode
// Directly inside grouping identifiers cannot have '-' in them
I_IDENTIFIER: [a-zA-Z0-9_$]+ { this.text.match(/[A-Za-z$]/) !== null }? -> type(IDENTIFIER);

I_BRACKET_START: F_BRACKET_START -> type(BRACKET_START), pushMode(DEFAULT_MODE);
I_BRACKET_END: F_BRACKET_END -> type(BRACKET_END), popMode;

I_OPERATION_GROUPING_START: F_OPERATION_GROUPING_START -> type(OPERATION_GROUPING_START), pushMode(INSIDE);
I_OPERATION_GROUPING_END: F_OPERATION_GROUPING_END -> type(OPERATION_GROUPING_END), popMode;

mode MISSING_QUOTE;
MISSING_QUOTE_TEXT: ~[,)]+ -> popMode;