enum TokenType {
    // Single character
    CARET, LEFT_PAREN, RIGHT_PAREN, SEMICOLON, COMMA,

    // Literals
    IDENTIFIER, STRING, NUMBER,

    // Keywords
    TRUE, FALSE,

    EOF
}

const keywords: Record<string, TokenType> = {
    'true': TokenType.TRUE,
    'false': TokenType.FALSE,
};

class ParsingError extends Error {
    constructor(msg: string, source: string, offset: number) {
        let errorMessage = msg + ` (offset: ${offset})\n\n`;

        const peekStart = Math.max(offset - 40, 0);
        const peekEnd = Math.min(offset + 40, source.length);
        errorMessage += source.substring(peekStart, peekEnd) + '\n';
        errorMessage += ' '.repeat(offset - peekStart - 1) + '^';

        super(errorMessage);
    }
}

class Token {
    private type: TokenType = 0
    private text: string
    private literal: any
    private offset: number

    constructor(type: TokenType, text: string, literal: any, offset: number) {
        this.type = type;
        this.text = text;
        this.literal = literal;
        this.offset = offset;
    }
}

export class Scanner {
    private start = 0;
    private current = 0;
    private readonly source: string;
    private tokens: Array<Token> = [];

    constructor(source: string) {
        this.source = source;
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, '', undefined, this.current));
        return this.tokens;
    }

    scanToken() {
        const char = this.advance();
        switch (char) {
            case '^': this.addToken(TokenType.CARET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case ' ': break;
            case '"': this.scanString(); break;
            default:
                if (this.isDigit(char) || char == '-') {
                    this.scanNumber();
                } else if (this.isAlpha(char)) {
                    this.scanIdentifier();
                } else {
                    throw new ParsingError('Unknown character', this.source, this.current);
                }
        }
    }

    scanString() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            this.advance();
        }

        if (this.isAtEnd()) {
            throw new Error('Unterminated string');
        }

        // Closing "
        this.advance();

        this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
    }

    scanNumber() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        if (this.source[this.start] == '-' && this.current - this.start == 1) {
            throw new ParsingError('Invalid number syntax', this.source, this.current);
        }

        this.addToken(TokenType.NUMBER, parseInt(this.source.substring(this.start, this.current)));
    }

    scanIdentifier() {
        while (this.isValidIdentifierChar(this.peek())) {
            this.advance();
        }

        const text = this.source.substring(this.start, this.current);
        if (text.toLowerCase() in keywords) {
            this.addToken(keywords[text.toLowerCase()]);
        } else {
            this.addToken(TokenType.IDENTIFIER);
        }
    }

    advance() {
        return this.source[this.current++];
    }

    peek() {
        if (this.isAtEnd()) {
            return '\0';
        }
        return this.source[this.current];
    }

    addToken(type: TokenType, literal?: any) {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.start));
    }

    isAtEnd() {
        return this.current >= this.source.length;
    }

    isDigit(char: string) {
        return !isNaN(Number(char));
    }

    isAlpha(char: string) {
        return /^[A-Z]$/i.test(char);
    }

    isValidIdentifierChar(char: string) {
        return /^[A-Z0-9_]$/i.test(char);
    }
}


