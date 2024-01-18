grammar ReksioLang;

// Keywords
TRUE : 'TRUE';
FALSE: 'FALSE';

expr : STRING | NUMBER | TRUE | FALSE | variable | methodCall | operationGrouping;

statement: expr;
statementList: (statement ';')* EOF;

methodCall: variable '^' methodName '(' methodCallArguments? ')';
methodName: IDENTIFIER;
methodCallArguments: expr (',' expr)*;

operationGrouping: '[' operation ']';

operation
  : expr
  | left=operation operator=PLUS right=operation
  | left=operation operator=MINUS right=operation
  ;

variable: IDENTIFIER | CALLER_ARGUMENT;

// Literals
IDENTIFIER: [a-zA-Z_][a-zA-Z0-9_]*;
NUMBER: '-'?[0-9]+;
CALLER_ARGUMENT: '$' [0-9]+;
STRING: '"' .*? '"';

PLUS: '+';
MINUS: '-';

WHITESPACE: [ \t\u000C\r\n]+ -> skip;
