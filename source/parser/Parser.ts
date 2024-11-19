import { Token, TokenType } from "../lexer/Tokens";

import * as Nodes from "./Nodes";
import * as Exceptions from "./Exceptions";

class Parser {
	// Índice do token atual
	private currentTokenIndex: number = 0;

	constructor(private readonly tokens: Token[]) {}

	/**
	 * Token atual
	 */
	public get currentToken(): Token {
		return this.tokens[this.currentTokenIndex];
	}

	/**
	 * Próximo token
	 */
	public get nextToken(): Token {
		return this.getTokenFromOffset(1);
	}

	/**
	 * Token anterior
	 */
	public get previousToken(): Token {
		return this.getTokenFromOffset(-1);
	}

	/**
	 *
	 * @param offset
	 * @returns
	 */
	public getTokenFromOffset(offset: number = 0): Token {
		if (this.currentTokenIndex + offset < 0 || this.currentTokenIndex + offset >= this.tokens.length) {
			throw new Exceptions.TokenIndexOutOfBoundsError(this.currentTokenIndex + offset);
		}

		return this.tokens[this.currentTokenIndex + offset];
	}

	/**
	 *
	 * @param expectedTokenType
	 * @returns
	 */
	public consumeTokenAndAdvance(expectedTokenType: TokenType | null = null): Token {
		if (expectedTokenType != null && this.currentToken.type != expectedTokenType) {
			throw new Exceptions.UnexpectedTokenError(expectedTokenType, this.currentToken);
		}

		// Avança para o próximo token
		this.currentTokenIndex++;

		return this.currentToken;
	}

	/**
	 *
	 * @returns
	 */
	private parseBody(): Nodes.NodeStmtTypeUnion[] {
		let nodes: Nodes.NodeStmtTypeUnion[] = [];

		// Enquanto não chegar no final do bloco, consome os tokens
		while (this.currentToken.type != TokenType.End) {
			nodes.push(this.parseStmt());
		}

		return nodes;
	}

	/**
	 *
	 * @returns
	 */
	private __parseArrayLiteral(): Nodes.NodeArrayLiteral {
		// Consome o colchetes de abertura
		this.consumeTokenAndAdvance(TokenType.LeftBrackets);

		let entries: Nodes.NodeExprTypeUnion[] = [];

		while (this.currentToken.type !== TokenType.RightBrackets) {
			entries.push(this.parseLogicalExpr());

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Consome o colchetes de fechamento
		this.consumeTokenAndAdvance(TokenType.RightBrackets);

		// Retorna um nó de array
		return new Nodes.NodeArrayLiteral(entries);
	}

	/**
	 *
	 * @returns
	 */
	private __parseDictionaryLiteral(): Nodes.NodeDictionaryLiteral {
		// Consome o chaves de abertura
		this.consumeTokenAndAdvance(TokenType.LeftBraces);

		let entries: { [key: string]: Nodes.NodeExprTypeUnion } = {};

		while (this.currentToken.type !== TokenType.RightBraces) {
			// Consome as chaves de abertura do par chave-valor
			this.consumeTokenAndAdvance(TokenType.LeftBrackets);

			// Consome a chave do par chave-valor
			const key = this.parseLogicalExpr();

			// Consome as chaves de fechamento do par chave-valor
			this.consumeTokenAndAdvance(TokenType.RightBrackets);

			// Consome o igual do par chave-valor
			this.consumeTokenAndAdvance(TokenType.Equal);

			// Consome o valor do par chave-valor
			const value = this.parseLogicalExpr();

			// Adiciona o par chave-valor ao objeto
			entries[key.toString()] = value;

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Consome o chaves de fechamento
		this.consumeTokenAndAdvance(TokenType.RightBraces);

		// Retorna um nó de objeto
		return new Nodes.NodeDictionaryLiteral(entries);
	}

	/**
	 *
	 * @returns
	 */
	private parseFactor(): Nodes.NodeFactorTypeUnion | Nodes.NodeExprTypeUnion {
		const currentToken = this.currentToken;

		switch (currentToken.type) {
			case TokenType.Not:
			case TokenType.Minus:
				// Consome o operador e avança
				this.consumeTokenAndAdvance(currentToken.type === TokenType.Not ? TokenType.Not : TokenType.Minus);
				return new Nodes.NodeUnaryNot(this.parseFactor());

			case TokenType.Null:
				this.consumeTokenAndAdvance(TokenType.Null);
				return new Nodes.NodeNullLiteral();

			// Consome um identificador e cria um nó
			case TokenType.Identifier:
				// Casos especiais para acessores de função e propriedade
				try {
					const node = this.parsePropertyAccessor();
					if (node) {
						if (
							node instanceof Nodes.NodeObjectPropertyAccessor &&
							node.key.type === Nodes.NodeType.Identifier &&
							node.callee === undefined
						) {
							return new Nodes.NodeIdentifier((node.key as Nodes.NodeIdentifier).name);
						}

						return node;
					}
				} catch (_) {}

				// Caso falhe em consumir uma chamada de função, consome um identificador
				this.consumeTokenAndAdvance(TokenType.Identifier);
				return new Nodes.NodeIdentifier(currentToken.word);

			// Consome um número e cria um nó
			case TokenType.Number:
				this.consumeTokenAndAdvance(TokenType.Number);
				return new Nodes.NodeNumberLiteral(Number(currentToken.word));

			// Consome uma string e cria um nó
			case TokenType.Word:
				this.consumeTokenAndAdvance(TokenType.Word);
				return new Nodes.NodeStringLiteral(currentToken.word);

			// Consome um booleano e cria um nó
			case TokenType.True:
			case TokenType.False:
				this.consumeTokenAndAdvance(currentToken.type);
				return new Nodes.NodeBooleanLiteral(currentToken.type === TokenType.True);

			default:
				// Caso seja um parênteses, consome a expressão dentro dele
				if (currentToken.type === TokenType.LeftParentheses) {
					// Consome o parênteses de abertura
					this.consumeTokenAndAdvance(TokenType.LeftParentheses);

					// Consome a expressão esperada
					const node = this.parseLogicalExpr();

					// Consome o parênteses de fechamento
					this.consumeTokenAndAdvance(TokenType.RightParentheses);

					switch (node.type) {
						// Caso seja uma declaração de função anônima, consome o acessor de função se possível
						case Nodes.NodeType.AnonymousFunctionDeclarationStmt:
							try {
								const accessor = this.__parseFunctionAccessor();

								// Atribui o chamador da função anônima
								accessor.callee = node;

								// Retorna o acessor no lugar da nó
								return accessor;
							} catch (_) {}

						default:
							return node;
					}
				}

				// Caso seja colchetes, consome o array
				if (currentToken.type === TokenType.LeftBrackets) {
					return this.__parseArrayLiteral();
				}

				// Caso seja chaves, consome o objeto
				if (currentToken.type === TokenType.LeftBraces) {
					return this.__parseDictionaryLiteral();
				}

				if (currentToken.type === TokenType.Function) {
					return this.parseAnonymousFunctionDeclarationStmt();
				}

				throw new Exceptions.ExpressionExpectedError(this.previousToken, currentToken);
		}
	}

	/**
	 *
	 * @returns
	 */
	private parseTerm(): Nodes.NodeTermTypeUnion {
		let node = this.parseFactor();

		while (
			this.currentToken.type === TokenType.Multiply ||
			this.currentToken.type === TokenType.Divide ||
			this.currentToken.type === TokenType.Modulus
		) {
			const currentToken = this.currentToken;

			// Consome o operador e avança
			this.consumeTokenAndAdvance(currentToken.type);

			// Identifica o operador e cria um nó correspondente
			switch (currentToken.type) {
				case TokenType.Multiply:
					node = new Nodes.NodeBinaryExprMul(node, this.parseFactor());
					break;

				case TokenType.Divide:
					node = new Nodes.NodeBinaryExprDiv(node, this.parseFactor());
					break;

				case TokenType.Modulus:
					node = new Nodes.NodeBinaryExprMod(node, this.parseFactor());
					break;
			}
		}

		return node;
	}

	/**
	 *
	 * @returns
	 */
	private parseExpr(): Nodes.NodeExprTypeUnion {
		let node = this.parseTerm();

		while (this.currentToken.type === TokenType.Plus || this.currentToken.type === TokenType.Minus) {
			const currentToken = this.currentToken;

			// Consome o operador e avança
			this.consumeTokenAndAdvance(currentToken.type);

			// Identifica o operador e cria um nó correspondente
			switch (currentToken.type) {
				case TokenType.Plus:
					node = new Nodes.NodeBinaryExprAdd(node, this.parseTerm());
					break;

				case TokenType.Minus:
					node = new Nodes.NodeBinaryExprSub(node, this.parseTerm());
					break;
			}
		}

		return node;
	}

	/**
	 *
	 * @returns
	 */
	private parseConditionalExpr(): Nodes.NodeConditionalExprTypeUnion {
		let node = this.parseExpr();

		while (
			this.currentToken.type === TokenType.EqualTo ||
			this.currentToken.type === TokenType.NotEqualTo ||
			this.currentToken.type === TokenType.GreaterThan ||
			this.currentToken.type === TokenType.GreaterThanOrEqualTo ||
			this.currentToken.type === TokenType.LessThan ||
			this.currentToken.type === TokenType.LessThanOrEqualTo
		) {
			const currentToken = this.currentToken;

			// Consome o operador e avança
			this.consumeTokenAndAdvance(currentToken.type);

			// Identifica o operador e cria um nó correspondente
			switch (currentToken.type) {
				case TokenType.EqualTo:
					node = new Nodes.NodeBinaryExprEqualTo(node, this.parseExpr());
					break;

				case TokenType.NotEqualTo:
					node = new Nodes.NodeBinaryExprNotEqualTo(node, this.parseExpr());
					break;

				case TokenType.GreaterThan:
					node = new Nodes.NodeBinaryExprGreaterThan(node, this.parseExpr());
					break;

				case TokenType.GreaterThanOrEqualTo:
					node = new Nodes.NodeBinaryExprGreaterEqualTo(node, this.parseExpr());
					break;

				case TokenType.LessThan:
					node = new Nodes.NodeBinaryExprLessThan(node, this.parseExpr());
					break;

				case TokenType.LessThanOrEqualTo:
					node = new Nodes.NodeBinaryExprLessEqualTo(node, this.parseExpr());
					break;
			}
		}

		return node;
	}

	/**
	 *
	 * @returns
	 */
	private parseLogicalExpr(): Nodes.NodeLogicalExprTypeUnion {
		let node = this.parseConditionalExpr();

		while (this.currentToken.type === TokenType.Or || this.currentToken.type === TokenType.And) {
			const currentToken = this.currentToken;

			// Consome o operador e avança
			this.consumeTokenAndAdvance(currentToken.type);

			// Identifica o operador e cria um nó correspondente
			switch (currentToken.type) {
				case TokenType.Or:
					node = new Nodes.NodeBinaryExprOr(node, this.parseConditionalExpr());
					break;

				case TokenType.And:
					node = new Nodes.NodeBinaryExprAnd(node, this.parseConditionalExpr());
					break;
			}
		}

		return node;
	}

	/**
	 *
	 * @returns
	 */
	private parseDeclarationStmt(): Nodes.NodeDeclarationStmt {
		// Consome os tokens "declarar", "identificador" e "=" e avança
		this.consumeTokenAndAdvance(TokenType.Declare);
		this.consumeTokenAndAdvance(TokenType.Identifier);
		this.consumeTokenAndAdvance(TokenType.Equal);

		// Criar um nó de declaração com o identificador e a expressão subsequente
		return new Nodes.NodeDeclarationStmt(this.getTokenFromOffset(-2).word, this.parseLogicalExpr());
	}

	/**
	 *
	 * @returns
	 */
	private parseAssignmentStmt(): Nodes.NodeAssignmentStmt {
		// Consome a expressão anterior a atribuição
		const expression = this.parseLogicalExpr();

		// Consome o token de atribuição e avança
		this.consumeTokenAndAdvance(TokenType.Equal);

		// Criar um nó de atribuição com o identificador e a expressão subsequente
		return new Nodes.NodeAssignmentStmt(expression, this.parseLogicalExpr());
	}

	/**
	 *
	 * @returns
	 */
	private parseBlockStmt(): Nodes.NodeBlockStmt {
		// Consome a palavra chave "bloco" e avança
		this.consumeTokenAndAdvance(TokenType.Block);

		// Consome o corpo do bloco e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeBlockStmt(body);
	}

	/**
	 *
	 * @returns
	 */
	private parseWhileStmt(): Nodes.NodeWhileStmt {
		// Consome a palavra chave "enquanto" e avança
		this.consumeTokenAndAdvance(TokenType.While);

		// Consome a condição e avança
		const condition = this.parseLogicalExpr();

		// Consome a palavra chave "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeWhileStmt(condition, body);
	}

	/**
	 *
	 * @returns
	 */
	private parseNumericForStmt(): Nodes.NodeNumericForStmt {
		// Consome a palavra chave "para" e avança
		this.consumeTokenAndAdvance(TokenType.For);

		// Consome o inicializador e avança
		let initializer = this.parseLogicalExpr();

		let from;
		if (this.currentToken.type === TokenType.From) {
			// Consome a palavra chave "de" e avança
			this.consumeTokenAndAdvance(TokenType.From);

			// Consome a expressão esperada
			from = this.parseLogicalExpr();
		}

		let until;

		if (this.currentToken.type === TokenType.Until) {
			// Consome a palavra chave "ate" e avança
			this.consumeTokenAndAdvance(TokenType.Until);

			// Consome a expressão esperada
			until = this.parseLogicalExpr();
		}

		let step;
		if (this.currentToken.type === TokenType.Operate) {
			// Consome a palavra chave "opere" e avança
			this.consumeTokenAndAdvance(TokenType.Operate);

			// Consome a expressão esperada
			step = this.parseAssignmentStmt();
		}

		// Consome a palavra chave "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeNumericForStmt(initializer, from, until, step, body);
	}

	/**
	 *
	 */
	private parseIterativeForStmt(): Nodes.NodeIterativeForStmt {
		// Consome as palavra chaves "para", "cada" e avança
		this.consumeTokenAndAdvance(TokenType.For);
		this.consumeTokenAndAdvance(TokenType.Each);

		let key = this.currentToken.word;
		this.consumeTokenAndAdvance(TokenType.Identifier);

		// Consome a virgula e avança
		this.consumeTokenAndAdvance(TokenType.Comma);

		let value = this.currentToken.word;
		this.consumeTokenAndAdvance(TokenType.Identifier);

		// Consome a palavra chave "em" e avança
		this.consumeTokenAndAdvance(TokenType.In);

		// Consome a expressão do iterável e avança
		const iterable = this.parseLogicalExpr();

		// Consome a palavra chave "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeIterativeForStmt(key, value, iterable, body);
	}

	/**
	 *
	 * @returns
	 */
	private parseFunctionDeclarationStmt(): Nodes.NodeFunctionDeclarationStmt {
		// Consome a palavra chave "função" e avança
		this.consumeTokenAndAdvance(TokenType.Function);

		// Consome o nome da função e avança
		const name = this.currentToken.word;

		// Consome o nome da função e avança
		this.consumeTokenAndAdvance(TokenType.Identifier);

		// Consome os parênteses de abertura e avança
		this.consumeTokenAndAdvance(TokenType.LeftParentheses);

		// Consome os parâmetros da função e avança
		let parameters: string[] = [];
		while (this.currentToken.type === TokenType.Identifier) {
			// Adiciona o parâmetro na lista e avança
			parameters.push(this.currentToken.word);

			// Consome o identificador e avança
			this.consumeTokenAndAdvance(TokenType.Identifier);

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Consome os parênteses de fechamento e avança
		this.consumeTokenAndAdvance(TokenType.RightParentheses);

		// Consome o corpo da função e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeFunctionDeclarationStmt(name, parameters, body);
	}

	/**
	 *
	 * @returns
	 */
	private parseAnonymousFunctionDeclarationStmt(): Nodes.NodeAnonymousFunctionDeclarationStmt {
		// Consome a palavra chave "função" e avança
		this.consumeTokenAndAdvance(TokenType.Function);

		// Consome os parênteses de abertura e avança
		this.consumeTokenAndAdvance(TokenType.LeftParentheses);

		// Consome os parâmetros da função e avança
		let parameters: string[] = [];
		while (this.currentToken.type === TokenType.Identifier) {
			// Adiciona o parâmetro na lista e avança
			parameters.push(this.currentToken.word);

			// Consome o identificador e avança
			this.consumeTokenAndAdvance(TokenType.Identifier);

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Consome os parênteses de fechamento e avança
		this.consumeTokenAndAdvance(TokenType.RightParentheses);

		// Consome o corpo da função e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeAnonymousFunctionDeclarationStmt(parameters, body);
	}

	/* prettier-ignore */ private parseBreakStmt(): Nodes.NodeBreakStmt { this.consumeTokenAndAdvance(TokenType.Break); return new Nodes.NodeBreakStmt(); }
	/* prettier-ignore */ private parseContinueStmt(): Nodes.NodeContinueStmt { this.consumeTokenAndAdvance(TokenType.Continue); return new Nodes.NodeContinueStmt(); }

	/**
	 *
	 * @returns
	 */
	private parseReturnStmt(): Nodes.NodeReturnStmt {
		// Consome a palavra chave "retornar" e avança
		this.consumeTokenAndAdvance(TokenType.Return);

		// Consome a expressão esperada
		const returns: Nodes.NodeExprTypeUnion[] = [];

		while (this.currentToken.type != TokenType.End) {
			returns.push(this.parseLogicalExpr());

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Cria um nó de retorno
		return new Nodes.NodeReturnStmt(returns);
	}

	/**
	 *
	 * @returns
	 */
	private parseIfStmt(): Nodes.NodeIfStmt {
		// Consome a palavra chave "se" e avança
		this.consumeTokenAndAdvance(TokenType.If);

		// Consome a condição e avança
		const condition = this.parseLogicalExpr();

		// Consome a palavra chave "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		// Consome os ElseIfs sequencialmente enquanto houver os tokens esperados
		let elseIfs: Nodes.NodeElseIfStmt[] = [];
		while (this.currentToken.type === TokenType.ElseIf) {
			elseIfs.push(this.parseElseIfStmt());
		}

		// Consome o Else caso exista
		let elseStmt: Nodes.NodeElseStmt | undefined = undefined;
		if (this.currentToken.type === TokenType.Else) {
			elseStmt = this.parseElseStmt();
		}

		return new Nodes.NodeIfStmt(condition, body, elseIfs, elseStmt);
	}

	/**
	 *
	 * @returns
	 */
	private parseElseIfStmt(): Nodes.NodeElseIfStmt {
		// Consome a palavra chave "caso" e avança
		this.consumeTokenAndAdvance(TokenType.ElseIf);

		// Consome a condição e avança
		const condition = this.parseLogicalExpr();

		// Consome a palavra chave "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeElseIfStmt(condition, body);
	}

	/**
	 *
	 * @returns
	 */
	private parseElseStmt(): Nodes.NodeElseStmt {
		// Consome a palavra chave "senão", "faca" e avança
		this.consumeTokenAndAdvance(TokenType.Else);
		this.consumeTokenAndAdvance(TokenType.Do);

		// Consome o corpo do laço e avança
		const body = this.parseBody();

		// Consome a palavra chave "fim" e avança
		this.consumeTokenAndAdvance(TokenType.End);

		return new Nodes.NodeElseStmt(body);
	}

	/**
	 *
	 * @returns
	 */
	private parseStmt(): Nodes.NodeStmtTypeUnion | Nodes.NodeExprTypeUnion {
		if (this.currentToken.type === TokenType.Declare) {
			// Realiza a declaração e avança
			return this.parseDeclarationStmt();
		}

		if (this.currentToken.type === TokenType.Identifier) {
			let statement;

			// Salva o índice atual do token para caso seja necessário retornar
			let currentTokenIndexRecord = this.currentTokenIndex;

			// Testa se é uma atribuição
			/* prettier-ignore */ try { if ((statement = this.parseAssignmentStmt())) { return statement; } } catch(_) {}

			this.currentTokenIndex = currentTokenIndexRecord;
		}

		if (this.currentToken.type === TokenType.Block) {
			// Consome o bloco e avança
			return this.parseBlockStmt();
		}

		if (this.currentToken.type === TokenType.While) {
			// Consome o laço e avança
			return this.parseWhileStmt();
		}

		if (this.currentToken.type === TokenType.For) {
			const currentTokenRecord = this.currentTokenIndex;

			// Tentar consumir um laço numérico
			/* prettier-ignore */ try { return this.parseIterativeForStmt(); } catch (_) { this.currentTokenIndex = currentTokenRecord; }

			// Tentar consumir um laço iterativo
			/* prettier-ignore */ try { return this.parseNumericForStmt(); } catch (_) { this.currentTokenIndex = currentTokenRecord; }

			throw new Exceptions.StatementExpectedError(this.previousToken, this.currentToken);
		}

		if (this.currentToken.type === TokenType.Function) {
			// Consome a função e avança
			return this.parseFunctionDeclarationStmt();
		}

		/* prettier-ignore */ if (this.currentToken.type === TokenType.Break) { return this.parseBreakStmt(); }
		/* prettier-ignore */ if (this.currentToken.type === TokenType.Continue) { return this.parseContinueStmt(); }

		if (this.currentToken.type === TokenType.Return) {
			// Consome o retorno e avança
			return this.parseReturnStmt();
		}

		if (this.currentToken.type === TokenType.If) {
			// Consome a condição e avança
			return this.parseIfStmt();
		}

		// Tenta consumir uma expressão, caso contrário, lança um erro
		const expression = this.parseLogicalExpr();
		if (expression) {
			return expression;
		}

		throw new Exceptions.StatementExpectedError(this.previousToken, this.currentToken);
	}

	/**
	 *
	 * @returns
	 */
	private __parseFunctionAccessor(): Nodes.NodeObjectFunctionAccessor {
		// Consome o parênteses de abertura
		this.consumeTokenAndAdvance(TokenType.LeftParentheses);

		let inputs: Nodes.NodeExprTypeUnion[] = [];

		while (this.currentToken.type !== TokenType.RightParentheses) {
			inputs.push(this.parseLogicalExpr());

			// Consome a vírgula caso exista
			if (this.currentToken.type === (TokenType.Comma as TokenType)) {
				this.consumeTokenAndAdvance(TokenType.Comma);
			}
		}

		// Consome o parênteses de fechamento
		this.consumeTokenAndAdvance(TokenType.RightParentheses);

		// Retorna um nó de chamada de função
		return new Nodes.NodeObjectFunctionAccessor(inputs);
	}

	/**
	 *
	 * @returns
	 */
	private __parsePropertyAccessor(): Nodes.NodeObjectPropertyAccessor {
		switch (this.currentToken.type) {
			// Cenario onde o acesso a propriedade é feito por no formato de: .identificador
			case TokenType.Dot:
				// Consome o ponto e avança
				this.consumeTokenAndAdvance(TokenType.Dot);

				// Consome o "identificador" (string neste caso) e avança
				this.consumeTokenAndAdvance(TokenType.Identifier);

				// Retorna um nó de acessor de propriedade
				return new Nodes.NodeObjectPropertyAccessor(new Nodes.NodeStringLiteral(this.previousToken.word));

			// Cenario onde o acesso a propriedade é feito por no formato de: [expressão]
			case TokenType.LeftBrackets:
				// Consome o colchetes de abertura e avança
				this.consumeTokenAndAdvance(TokenType.LeftBrackets);

				// Consome a expressão esperada
				const expression = this.parseLogicalExpr();

				// Consome o colchetes de fechamento e avança
				this.consumeTokenAndAdvance(TokenType.RightBrackets);

				// Retorna um nó de acessor de propriedade
				return new Nodes.NodeObjectPropertyAccessor(expression);

			default:
				throw new Exceptions.PropertyAccessorExpectedError(this.previousToken, this.currentToken);
		}
	}

	/**
	 *
	 * @returns
	 */
	private parsePropertyAccessor(): Nodes.NodeObjectAccessorTypeUnion {
		// Consome o nome da função e avança
		const name = this.currentToken.word;

		// Consome o identificador inicial e avança
		this.consumeTokenAndAdvance(TokenType.Identifier);

		let accessors: Nodes.NodeObjectAccessorTypeUnion[] = [];

		while (true) {
			// Lista de acessores do valor proveniente do identificador
			let accessor: Nodes.NodeObjectAccessorTypeUnion | null = null;

			// Salva o índice atual do token para caso seja necessário retornar
			const currentTokenIndexRecord = this.currentTokenIndex;

			// Tenta consumir um acessor de função
			/* prettier-ignore */ try { if (accessor = this.__parseFunctionAccessor()) { accessors.push(accessor); continue; } } catch(_) {}

			// Caso falhe em consumir o acessor de função, retorna o índice do token para o índice anterior
			this.currentTokenIndex = currentTokenIndexRecord;

			// Tenta consumir um acessor de propriedade
			/* prettier-ignore */ try { if (accessor = this.__parsePropertyAccessor()) { accessors.push(accessor); continue; } } catch(_) {}

			// Caso falhe em ambos os acessores, assume que não há acessor e quebra o loop
			break;
		}

		// Constrói o nó de acessor de propriedade da lista de acessores
		return accessors.reduce((callee, accessor) => {
			accessor.callee = callee;
			return accessor;
		}, new Nodes.NodeObjectPropertyAccessor(new Nodes.NodeIdentifier(name)));
	}

	/**
	 *
	 * @returns
	 */
	public parse(): Nodes.Node[] {
		let nodes: Nodes.Node[] = [];

		// Enquanto não chegar no final do arquivo, consome os tokens
		while (this.currentToken.type !== TokenType.EoF) {
			nodes.push(this.parseStmt());
		}

		return nodes;
	}
}

export { Parser };
