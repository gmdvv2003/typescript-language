/* prettier-ignore */
export enum TokenType {
	// Palavras Chaves
	Do = "faca", 					// faça
	End = "fim", 					// fim

	Break = "parar", 				// parar
	Continue = "continuar", 		// continuar
	Return = "retorna", 			// retornar

	Declare = "declarar", 			// declarar
	Block = "bloco", 				// bloco
	While = "enquanto", 			// enquanto
	For = "para", 					// para
	Function = "funcao", 			// função

	If = "se", 						// se
	ElseIf = "caso", 				// caso
	Else = "senao", 				// senão

	And = "e", 						// e
	Or = "ou", 						// ou
	
	From = "de", 					// de
	Until = "ate", 					// até
	Operate = "opere", 			 	// opere
	
	Each = "cada", 					// cada
	In = "em", 						// em

	// Operadores Unários
	Not = "negar", 					// negar

	// Literais
	Number = "numero", 				// número
	Word = "palavra", 				// palavra
	Identifier = "Identificador", 	// Identificador
	True = "verdadeiro", 			// verdadeiro
	False = "falso", 				// falso

	// Operadores Lógicos
	EqualTo = "==", 				// ==
	NotEqualTo = "!=", 				// !=
	GreaterThan = ">", 				// >
	GreaterThanOrEqualTo = ">=", 	// >=
	LessThan = "<", 				// <
	LessThanOrEqualTo = "<=", 		// <=

	// Símbolos
	Dot = ".", 						// .
	Comma = ",", 					// ,
	LeftParentheses = "(", 			// (
	RightParentheses = ")", 		// )
	LeftBrackets = "[", 			// [
	RightBrackets = "]", 			// ]
	LeftBraces = "{", 				// {
	RightBraces = "}", 				// }
	Plus = "+", 					// +
	Minus = "-", 					// -
	Multiply = "*", 				// *
	Divide = "/", 					// /
	Modulus = "%", 					// %
	Equal = "=", 					// =

	// Nulo
	Null = "nulo", 					// nulo

	// Fim de Arquivo
	EoF = "EoF",
}

export const KEYWORDS: { [key: string]: TokenType } = {
	[TokenType.Do.toString()]: TokenType.Do,
	[TokenType.End.toString()]: TokenType.End,

	[TokenType.Break.toString()]: TokenType.Break,
	[TokenType.Continue.toString()]: TokenType.Continue,
	[TokenType.Return.toString()]: TokenType.Return,

	[TokenType.Declare.toString()]: TokenType.Declare,
	[TokenType.Block.toString()]: TokenType.Block,
	[TokenType.While.toString()]: TokenType.While,
	[TokenType.For.toString()]: TokenType.For,
	[TokenType.Function.toString()]: TokenType.Function,

	[TokenType.If.toString()]: TokenType.If,
	[TokenType.ElseIf.toString()]: TokenType.ElseIf,
	[TokenType.Else.toString()]: TokenType.Else,

	[TokenType.True.toString()]: TokenType.True,
	[TokenType.False.toString()]: TokenType.False,

	[TokenType.And.toString()]: TokenType.And,
	[TokenType.Or.toString()]: TokenType.Or,

	[TokenType.From.toString()]: TokenType.From,
	[TokenType.Until.toString()]: TokenType.Until,
	[TokenType.Operate.toString()]: TokenType.Operate,

	[TokenType.Each.toString()]: TokenType.Each,
	[TokenType.In.toString()]: TokenType.In,

	[TokenType.Not.toString()]: TokenType.Not,

	[TokenType.Null.toString()]: TokenType.Null,
};

export class Token {
	constructor(
		public readonly type: TokenType,
		public readonly word: string,
		public readonly line: number,
		public readonly column: number
	) {}

	/**
	 *
	 * @returns
	 */
	toString(): string {
		if (this.word) {
			return `${this.type} (${this.word})`;
		}

		return `${this.type}`;
	}
}
