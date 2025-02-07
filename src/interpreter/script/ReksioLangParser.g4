parser grammar ReksioLangParser;
options {tokenVocab = ReksioLangLexer ;}

expr :
    comment? (
        string
        | number
        | bool
        | identifier
        | specialCall
        | methodCall
        | operationGrouping
    );

statement: | expr;
statementList: (statement STATEMENT_END)* EOF;

methodCall: objectName METHOD_CALL_SYMBOL methodName BRACKET_START methodCallArguments? BRACKET_END;
objectName: identifier;
methodName: identifier;
methodCallArguments: expr (COMMA expr)*;

specialCall: DIV methodName BRACKET_START methodCallArguments? BRACKET_END;

operationGrouping: OPERATION_GROUPING_START operation OPERATION_GROUPING_END;
operation
  : left=expr operator=ADD right=expr
  | left=expr operator=SUB right=expr
  | left=expr operator=MUL right=expr
  | left=expr operator=MOD right=expr
  | left=expr operator=DIV right=expr
  ;

comment: COMMENT_START;
number: SUB NUMBER | NUMBER;
bool: TRUE | FALSE;
string: CODE_STRING | STRING;
identifier: IDENTIFIER;

