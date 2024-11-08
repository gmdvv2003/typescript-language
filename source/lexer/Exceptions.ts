export class UnexpectedCharacterError extends Error {
	constructor(character: string, line: number, column: number) {
		super(`Unexpected character: "${'a'}" at Ln ${line}, Col ${column}`);
	}
}
