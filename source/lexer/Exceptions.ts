export class UnexpectedCharacterError extends Error {
	constructor(character: string, line: number, column: number) {
		super(`Unexpected character: "${character}" at Ln ${line}, Col ${column}`);
	}
}
