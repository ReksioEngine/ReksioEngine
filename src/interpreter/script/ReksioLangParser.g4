parser grammar ReksioLangParser;
options {tokenVocab = ReksioLangLexer ;}

expr :
    comment? (
        string
        | number
        | bool
        | objectValueReference
        | specialCall
        | methodCall
        | operationGrouping
    );

statement: | expr;
statementList: (statement STATEMENT_END)* EOF;

subFieldAccess: FIELD_ACCESS IDENTIFIER;
methodCall: objectName METHOD_CALL_SYMBOL methodName BRACKET_START methodCallArguments? BRACKET_END;
objectName: identifier subField=subFieldAccess?;
methodName: identifier;
methodCallArguments: expr (COMMA expr)*;

specialCall: AT methodName BRACKET_START methodCallArguments? BRACKET_END;

operationGrouping: OPERATION_GROUPING_START operation OPERATION_GROUPING_END;
operation
  : left=operation operator=PLUS right=operation
  | left=operation operator=MINUS right=operation
  | left=operation operator=ASTERISK right=operation
  | left=operation operator=PERCENTAGE right=operation
  | left=operation operator=AT right=operation
  | expr
  ;

comment: COMMENT_START;
number: MINUS NUMBER | NUMBER;
bool: TRUE | FALSE;
string: CODE_STRING | STRING;

objectValueReference: objectName;
identifier: dereference=ASTERISK? IDENTIFIER;
