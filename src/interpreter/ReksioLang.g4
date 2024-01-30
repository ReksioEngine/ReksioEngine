grammar ReksioLang;

// Keywords
TRUE : 'TRUE';
FALSE: 'FALSE';

expr :
    STRING
    | negativeNumber
    | NUMBER
    | TRUE | FALSE
    | IDENTIFIER
    | specialCall
    | methodCall
    | operationGrouping;

statement: | expr;
statementList: (statement STATEMENT_END)* EOF;

methodCall: objectName METHOD_CALL_SYMBOL methodName '(' methodCallArguments? ')';
objectName: IDENTIFIER;
methodName: IDENTIFIER;
methodCallArguments: expr (',' expr)*;

specialCall: '@' methodName '(' methodCallArguments? ')';

operationGrouping: '[' operation ']';
operation
  : left=operation operator=ADD right=operation
  | left=operation operator=SUB right=operation
  | left=operation operator=MUL right=operation
  | left=operation operator=MOD right=operation
  | left=operation operator=DIV right=operation
  | expr
  ;

// Separate from NUMBER because of a problem with detecting negative number vs subtraction
negativeNumber: '-' NUMBER;

// Literals
IDENTIFIER: [a-zA-Z0-9_$]*[a-zA-Z_?$]+[a-zA-Z0-9_$]*;
NUMBER: [0-9]+ ('.' [0-9]+)? ;
STRING: ('""' ~["]* '""' | '"' ~[",]* '"'?);

ADD: '+';
SUB: '-';
MUL: '*';
MOD: '%';
DIV: '@';

// Inconsistency
METHOD_CALL_SYMBOL: [^>];
STATEMENT_END: [;:];

WHITESPACE: [ \t\u000C\r\n]+ -> skip;
