lexer grammar ReksioLangLexer;

// Keywords
fragment F_TRUE : 'TRUE';
fragment F_FALSE: 'FALSE';

// Literals
fragment F_NUMBER: [0-9]+ ('.' [0-9]+)? ;
fragment F_CODE_STRING: '"{' ~[{]* '}"';
fragment F_STRING: '"' ~[,)+]* '"';
fragment F_COMMENT_START: '!'+;

// Arthmetic operators
fragment F_PLUS: '+';
fragment F_MINUS: '-';
fragment F_ASTERISK: '*';
fragment F_PERCENTAGE: '%';
fragment F_AT: '@';

fragment F_METHOD_CALL_SYMBOL: '^';
fragment F_OPERATION_GROUPING_START: '[';
fragment F_OPERATION_GROUPING_END: ']';
fragment F_BRACKET_START: '(';
fragment F_BRACKET_END: ')';
fragment F_COMMA: ',';
fragment F_FIELD_ACCESS: '|';

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
PLUS: F_PLUS;
MINUS: F_MINUS;
ASTERISK: F_ASTERISK;
PERCENTAGE: F_PERCENTAGE;
AT: F_AT;
METHOD_CALL_SYMBOL: F_METHOD_CALL_SYMBOL;
TYPO: F_TYPO;
TYPO_QUOTE: F_TYPO_QUOTE -> pushMode(MISSING_QUOTE);
WHITESPACE: F_WHITESPACE -> skip;
COMMA: F_COMMA;
FIELD_ACCESS: F_FIELD_ACCESS;

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
I_PLUS: F_PLUS -> type(PLUS);
I_MINUS: F_MINUS -> type(MINUS);
I_ASTERISK: F_ASTERISK -> type(ASTERISK);
I_PERCENTAGE: F_PERCENTAGE -> type(PERCENTAGE);
I_AT: F_AT -> type(AT);
I_METHOD_CALL_SYMBOL: F_METHOD_CALL_SYMBOL -> type(METHOD_CALL_SYMBOL);
I_TYPO: F_TYPO -> type(TYPO);
I_WHITESPACE: F_WHITESPACE -> skip;
I_COMMA: F_COMMA -> type(COMMA);
I_FIELD_ACCESS: F_FIELD_ACCESS -> type(FIELD_ACCESS);

// Inside mode
// Directly inside grouping identifiers cannot have '-' in them
I_IDENTIFIER: [a-zA-Z0-9_$]+ { this.text.match(/[A-Za-z$]/) !== null }? -> type(IDENTIFIER);

I_BRACKET_START: F_BRACKET_START -> type(BRACKET_START), pushMode(DEFAULT_MODE);
I_BRACKET_END: F_BRACKET_END -> type(BRACKET_END), popMode;

I_OPERATION_GROUPING_START: F_OPERATION_GROUPING_START -> type(OPERATION_GROUPING_START), pushMode(INSIDE);
I_OPERATION_GROUPING_END: F_OPERATION_GROUPING_END -> type(OPERATION_GROUPING_END), popMode;

mode MISSING_QUOTE;
MISSING_QUOTE_TEXT: ~[,)]+ -> popMode;