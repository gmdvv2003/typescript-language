import { Token, TokenType } from "../lexer/Tokens";

export class TokenIndexOutOfBoundsError extends Error {
	constructor(index: number) {
		super(`Token index out of bounds: ${index}`);
	}
}

export class UnexpectedTokenError extends Error {
	constructor(expected: TokenType, got: Token) {
		super(`Expected token type "${expected}", got ${got} at Ln ${got.line}, Col ${got.column}`);
	}
}

export class StatementExpectedError extends Error {
	constructor(lastToken: Token, currentToken: Token) {
		super(`Expected statement after "${lastToken}" at Ln ${lastToken.line}, Col ${lastToken.column}, Got "${currentToken}"`);
	}
}

export class ExpressionExpectedError extends Error {
	constructor(lastToken: Token, currentToken: Token) {
		super(`Expected expression after "${lastToken}" at Ln ${lastToken.line}, Col ${lastToken.column}, Got "${currentToken}"`);
	}
}

export class PropertyAccessorExpectedError extends Error {
	constructor(lastToken: Token, currentToken: Token) {
		super(`Expected property accessor after "${lastToken}" at Ln ${lastToken.line}, Col ${lastToken.column}, Got "${currentToken}"`);
	}
}
