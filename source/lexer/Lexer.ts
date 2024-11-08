import * as Exceptions from "./Exceptions";
import * as Tokens from "./Tokens";

class Lexer {
	// Posição atual do ponteiro
	private pointerLocation = 0;

	// Utilizado para gerar melhores mensagens de erro
	private currentLine = 1;
	private currentColumn = 1;

	constructor(protected readonly input: string) {}

	/**
	 *
	 * @param type
	 * @param word
	 * @returns
	 */
	private createNewToken(type: Tokens.TokenType, word: string = ""): Tokens.Token {
		return new Tokens.Token(type, word, this.currentLine, this.currentColumn);
	}

	/**
	 * Verifica se o caractere é um dígito
	 *
	 * @param character
	 * @returns Se o caractere é um dígito
	 */
	private isDigit(character: string): boolean {
		return character >= "0" && character <= "9";
	}

	/**
	 * Verifica se o caractere é uma letra
	 *
	 * @param character
	 * @returns Se o caractere é uma letra
	 */
	private isAlphaNumeric(character: string): boolean {
		return (
			(character >= "a" && character <= "z") ||
			(character >= "A" && character <= "Z") ||
			character === "_" ||
			(character >= "0" && character <= "9")
		);
	}

	/**
	 * Verifica se o caractere é o início de uma string
	 *
	 * @param character
	 * @returns	Se o caractere é o início de uma string
	 */
	private isString(character: string): boolean {
		return character === '"';
	}

	/**
	 * Consome os dígitos seguintes até que não seja mais possível
	 *
	 * @returns Dígitos consumidos
	 */
	private consumeDigits(): string {
		let offset = 0;

		while (this.isDigit(this.input[this.pointerLocation + offset])) {
			offset += 1;
		}

		const digits = this.input.slice(this.pointerLocation, this.pointerLocation + offset);

		// Atualiza a posição do ponteiro
		this.pointerLocation += offset - 1;

		return digits;
	}

	/**
	 * Consome as letras seguintes até que não seja mais possível
	 *
	 * @returns Palavras consumidas
	 */
	private consumeAlphaNumeric(): string {
		let offset = 0;

		while (this.isAlphaNumeric(this.input[this.pointerLocation + offset])) {
			offset += 1;
		}

		const alpha = this.input.slice(this.pointerLocation, this.pointerLocation + offset);

		// Atualiza a posição do ponteiro
		this.pointerLocation += offset - 1;

		return alpha;
	}

	/**
	 * Consome a string entre aspas até que não seja mais possível
	 *
	 * @returns String consumida
	 */
	private consumeString(): string {
		let offset = 1;

		while (!this.isString(this.input[this.pointerLocation + offset])) {
			offset += 1;
		}

		const string = this.input.slice(++this.pointerLocation, this.pointerLocation + offset - 1);

		// Atualiza a posição do ponteiro
		this.pointerLocation += offset - 1;

		return string;
	}

	/**
	 * Consome o próximo caractere se for igual ao esperado
	 *
	 * @param expectedCharacter
	 * @returns Se o próximo caractere é igual ao esperado
	 */
	protected consumeNextIf(expectedCharacter: string): boolean {
		if (this.input[++this.pointerLocation] === expectedCharacter) {
			return true;
		}

		// Retorna o ponteiro para a posição anterior
		--this.pointerLocation;

		return false;
	}

	/**
	 * Realiza a análise léxica do código
	 *
	 * @returns Lista de tokens
	 */
	public lex(): Tokens.Token[] {
		let tokens: Tokens.Token[] = [];

		while (this.pointerLocation < this.input.length) {
			const characterAtPointer = this.input[this.pointerLocation];
			switch (characterAtPointer) {
				// Quebra de linha
				case "\n":
				case "\r":
					break;

				// Espaço em branco
				case " ":
				case "\t":
					break;

				// Comentário
				case "#":
					while (this.input[++this.pointerLocation] !== "\n") {
						// Se chegou ao fim do arquivo
						if (this.pointerLocation >= this.input.length) {
							break;
						}
					}

					// Retorna o ponteiro para a posição anterior
					--this.pointerLocation;

					break;

				// Operadores Lógicos
				case "=":
					tokens.push(
						this.consumeNextIf("=")
							? this.createNewToken(Tokens.TokenType.EqualTo)
							: this.createNewToken(Tokens.TokenType.Equal)
					);
					break;

				case "!":
					tokens.push(
						this.consumeNextIf("=")
							? this.createNewToken(Tokens.TokenType.NotEqualTo)
							: this.createNewToken(Tokens.TokenType.Word)
					);
					break;

				case ">":
					tokens.push(
						this.consumeNextIf("=")
							? this.createNewToken(Tokens.TokenType.GreaterThanOrEqualTo)
							: this.createNewToken(Tokens.TokenType.GreaterThan)
					);
					break;

				case "<":
					tokens.push(
						this.consumeNextIf("=")
							? this.createNewToken(Tokens.TokenType.LessThanOrEqualTo)
							: this.createNewToken(Tokens.TokenType.LessThan)
					);
					break;

				// Simbolos
				case ".":
					tokens.push(this.createNewToken(Tokens.TokenType.Dot));
					break;

				case ",":
					tokens.push(this.createNewToken(Tokens.TokenType.Comma));
					break;

				case "(":
					tokens.push(this.createNewToken(Tokens.TokenType.LeftParentheses));
					break;

				case ")":
					tokens.push(this.createNewToken(Tokens.TokenType.RightParentheses));
					break;

				case "[":
					tokens.push(this.createNewToken(Tokens.TokenType.LeftBrackets));
					break;

				case "]":
					tokens.push(this.createNewToken(Tokens.TokenType.RightBrackets));
					break;

				case "{":
					tokens.push(this.createNewToken(Tokens.TokenType.LeftBraces));
					break;

				case "}":
					tokens.push(this.createNewToken(Tokens.TokenType.RightBraces));
					break;

				case "+":
					tokens.push(this.createNewToken(Tokens.TokenType.Plus));
					break;

				case "-":
					tokens.push(this.createNewToken(Tokens.TokenType.Minus));
					break;

				case "*":
					tokens.push(this.createNewToken(Tokens.TokenType.Multiply));
					break;

				case "/":
					tokens.push(this.createNewToken(Tokens.TokenType.Divide));
					break;

				case "%":
					tokens.push(this.createNewToken(Tokens.TokenType.Modulus));
					break;

				default:
					// Consome números
					if (this.isDigit(characterAtPointer)) {
						tokens.push(this.createNewToken(Tokens.TokenType.Number, this.consumeDigits()));
						break;
					}

					// Consome identificadores
					if (this.isAlphaNumeric(characterAtPointer)) {
						const word = this.consumeAlphaNumeric();

						// Verifica se a palavra é uma palavra chave
						if (word in Tokens.KEYWORDS) {
							tokens.push(this.createNewToken(Tokens.KEYWORDS[word]));
							break;
						}

						// Adiciona um token como identificador
						tokens.push(this.createNewToken(Tokens.TokenType.Identifier, word));

						break;
					}

					// Consome strings
					if (this.isString(characterAtPointer)) {
						tokens.push(this.createNewToken(Tokens.TokenType.Word, this.consumeString()));
						break;
					}

					throw new Exceptions.UnexpectedCharacterError(characterAtPointer, this.currentLine, this.currentColumn);
			}

			// Avança o ponteiro adiante
			this.pointerLocation += 1;
		}

		// Token de fim de arquivo
		tokens.push(this.createNewToken(Tokens.TokenType.EoF));

		return tokens;
	}
}

export { Lexer };
