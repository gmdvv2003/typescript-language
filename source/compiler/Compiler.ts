import * as Nodes from "../parser/Nodes";
import * as Debugger from "../debugger/Debugger";

import * as Exceptions from "./Exceptions";
import * as Value from "./Value";
import * as Context from "./Context";

import { BuiltIns } from "../commons/BuiltIns";

/* prettier-ignore */ function* BINARY_OP_OR(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(Value.AS_BOOLEAN(left) || Value.AS_BOOLEAN(right)); }
/* prettier-ignore */ function* BINARY_OP_AND(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(Value.AS_BOOLEAN(left) && Value.AS_BOOLEAN(right)); }

/* prettier-ignore */ function* BINARY_OP_EQ(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__eq__(left, right)); }
/* prettier-ignore */ function* BINARY_OP_NE(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__ne__(left, right)); }
/* prettier-ignore */ function* BINARY_OP_GT(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__gt__(left, right)); }
/* prettier-ignore */ function* BINARY_OP_GE(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__ge__(left, right)); }
/* prettier-ignore */ function* BINARY_OP_LT(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__lt__(left, right)); }
/* prettier-ignore */ function* BINARY_OP_LE(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return Value.BOOLEAN(left.__le__(left, right)); }

/* prettier-ignore */ function* BINARY_OP_ADD(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return left.__add__(left, right); }
/* prettier-ignore */ function* BINARY_OP_SUB(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return left.__sub__(left, right); }
/* prettier-ignore */ function* BINARY_OP_MUL(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return left.__mul__(left, right); }
/* prettier-ignore */ function* BINARY_OP_DIV(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return left.__div__(left, right); }
/* prettier-ignore */ function* BINARY_OP_MOD(left: Value.BaseValue, right: Value.BaseValue): Generator<Value.BaseValue> { return left.__mod__(left, right); }

/* prettier-ignore */ function* UNARY_OP_NOT(value: Value.BaseValue): Generator<Value.BaseValue> { return value.__not__(value); }

class Compiler {
	// Depurador
	public __debugger: Debugger.Debugger | null = null;

	// Contexto contendo informações sobre o código em execução
	public context!: Context.Context;

	constructor(private readonly program: Nodes.Node[]) {
		this.context = new Context.Context(null, new BuiltIns(this.context).load());
	}

	/**
	 *
	 * @param context
	 */
	private enterClosure(code: Value.CodeObject): void {
		this.context = new Context.Context(code.context);
	}

	/**
	 *
	 */
	private enterScope(): void {
		this.context.scopeLevel += 1;
	}

	/**
	 *
	 */
	private leaveScope(): void {
		while (this.context.locals.length > 0) {
			const local = this.context.locals[this.context.locals.length - 1];
			if (local.scopeLevel !== this.context.scopeLevel || local.scopeLevel === 1) {
				break;
			}

			this.context.locals.pop();
		}

		this.context.scopeLevel -= 1;
	}

	@Debugger.capture<Nodes.NodeBinaryExprOr>()
	private *visitBinaryExprOr(node: Nodes.NodeBinaryExprOr): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_OR(yield* this.visitLogicalExpr(node.left), yield* this.visitLogicalExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprAnd>()
	private *visitBinaryExprAnd(node: Nodes.NodeBinaryExprAnd): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_AND(yield* this.visitLogicalExpr(node.left), yield* this.visitLogicalExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprEqualTo>()
	private *visitBinaryExprEq(node: Nodes.NodeBinaryExprEqualTo): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_EQ(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprNotEqualTo>()
	private *visitBinaryExprNe(node: Nodes.NodeBinaryExprNotEqualTo): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_NE(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprGreaterThan>()
	private *visitBinaryExprGt(node: Nodes.NodeBinaryExprGreaterThan): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_GT(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprGreaterEqualTo>()
	private *visitBinaryExprGe(node: Nodes.NodeBinaryExprGreaterEqualTo): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_GE(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprLessThan>()
	private *visitBinaryExprLt(node: Nodes.NodeBinaryExprLessThan): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_LT(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprLessEqualTo>()
	private *visitBinaryExprLe(node: Nodes.NodeBinaryExprLessEqualTo): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_LE(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprOr>()
	private *visitBinaryExprAdd(node: Nodes.NodeBinaryExprAdd): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_ADD(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprOr>()
	private *visitBinaryExprSub(node: Nodes.NodeBinaryExprSub): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_SUB(yield* this.visitExpr(node.left), yield* this.visitExpr(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprMul>()
	private *visitBinaryExprMul(node: Nodes.NodeBinaryExprMul): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_MUL(yield* this.visitTerm(node.left), yield* this.visitTerm(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprDiv>()
	private *visitBinaryExprDiv(node: Nodes.NodeBinaryExprDiv): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_DIV(yield* this.visitTerm(node.left), yield* this.visitTerm(node.right));
	}

	@Debugger.capture<Nodes.NodeBinaryExprMod>()
	private *visitBinaryExprMod(node: Nodes.NodeBinaryExprMod): Generator<void | Value.BaseValue> {
		return yield* BINARY_OP_MOD(yield* this.visitTerm(node.left), yield* this.visitTerm(node.right));
	}

	@Debugger.capture<Nodes.NodeUnaryNot>()
	private *visitUnaryNot(node: Nodes.NodeUnaryNot): Generator<void | Value.BaseValue> {
		return yield* UNARY_OP_NOT(yield* this.visitLogicalExpr(node.value));
	}

	/**
	 *
	 * @param factor
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeFactorTypeUnion>()
	private *visitFactor(factor: Nodes.NodeFactorTypeUnion): Generator<void | Value.BaseValue> {
		switch (factor.type) {
			case Nodes.NodeType.UnaryNot:
				return yield* this.visitUnaryNot(factor as Nodes.NodeUnaryNot);

			case Nodes.NodeType.NullLiteral:
				return Value.NULL();

			case Nodes.NodeType.NumberLiteral:
				return Value.NUMBER((factor as Nodes.NodeNumberLiteral).value);

			case Nodes.NodeType.BooleanLiteral:
				return Value.BOOLEAN((factor as Nodes.NodeBooleanLiteral).value);

			case Nodes.NodeType.StringLiteral:
				return Value.STRING((factor as Nodes.NodeStringLiteral).value);

			case Nodes.NodeType.ArrayLiteral: {
				const entries: Value.BaseValue[] = [];
				for (const entry of (factor as Nodes.NodeArrayLiteral).entries) {
					entries.push(yield* this.visitLogicalExpr(entry));
				}

				return Value.ARRAY(entries);
			}

			case Nodes.NodeType.DictionaryLiteral: {
				const dictionaryLiteral = factor as Nodes.NodeDictionaryLiteral;

				// Mapeia os valores do dicionário
				let entries: { [key: string]: Value.BaseValue } = {};
				for (const key in dictionaryLiteral.entries) {
					entries[key] = yield* this.visitLogicalExpr(dictionaryLiteral.entries[key]);
				}

				return Value.DICTIONARY(entries);
			}

			case Nodes.NodeType.Identifier: {
				const identifier = factor as Nodes.NodeIdentifier;

				// Verifica se a variável existe no contexto atual
				const local = this.context.get(identifier.name);
				if (local === undefined) {
					throw new Exceptions.UnknownNameError(identifier.name);
				}

				// Retorna o valor da variável no contexto atual
				return local.value;
			}

			case Nodes.NodeType.ObjectAccessor: {
				return yield* this.visitObjectAccessor(factor as Nodes.NodeObjectAccessor);
			}

			case Nodes.NodeType.AnonymousFunctionDeclarationStmt: {
				return yield* this.visitAnonymousFunctionDeclarationStmt(factor as Nodes.NodeAnonymousFunctionDeclarationStmt);
			}

			default:
				throw new Exceptions.UnreachableNodeError(factor);
		}
	}

	/**
	 *
	 * @param term
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeTermTypeUnion>()
	private *visitTerm(term: Nodes.NodeTermTypeUnion): Generator<void | Value.BaseValue> {
		switch (term.type) {
			case Nodes.NodeType.BinaryExprMul:
				return yield* this.visitBinaryExprMul(term as Nodes.NodeBinaryExprMul);

			case Nodes.NodeType.BinaryExprDiv:
				return yield* this.visitBinaryExprDiv(term as Nodes.NodeBinaryExprDiv);

			case Nodes.NodeType.BinaryExprMod:
				return yield* this.visitBinaryExprMod(term as Nodes.NodeBinaryExprMod);

			default:
				return yield* this.visitFactor(term as Nodes.NodeFactorTypeUnion);
		}
	}

	/**
	 *
	 * @param expr
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeExprTypeUnion>()
	private *visitExpr(expr: Nodes.NodeExprTypeUnion): Generator<void | Value.BaseValue> {
		switch (expr.type) {
			case Nodes.NodeType.BinaryExprAdd:
				return yield* this.visitBinaryExprAdd(expr as Nodes.NodeBinaryExprAdd);

			case Nodes.NodeType.BinaryExprSub:
				return yield* this.visitBinaryExprSub(expr as Nodes.NodeBinaryExprSub);

			default:
				return yield* this.visitTerm(expr as Nodes.NodeTermTypeUnion);
		}
	}

	/**
	 *
	 * @param conditional
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeConditionalExprTypeUnion>()
	private *visitConditionalExpr(conditional: Nodes.NodeConditionalExprTypeUnion): Generator<void | Value.BaseValue> {
		switch (conditional.type) {
			case Nodes.NodeType.BinaryExprEqualTo:
				return yield* this.visitBinaryExprEq(conditional as Nodes.NodeBinaryExprEqualTo);

			case Nodes.NodeType.BinaryExprNotEqualTo:
				return yield* this.visitBinaryExprNe(conditional as Nodes.NodeBinaryExprNotEqualTo);

			case Nodes.NodeType.BinaryExprGreaterThan:
				return yield* this.visitBinaryExprGt(conditional as Nodes.NodeBinaryExprGreaterThan);

			case Nodes.NodeType.BinaryExprGreaterEqualTo:
				return yield* this.visitBinaryExprGe(conditional as Nodes.NodeBinaryExprGreaterEqualTo);

			case Nodes.NodeType.BinaryExprLessThan:
				return yield* this.visitBinaryExprLt(conditional as Nodes.NodeBinaryExprLessThan);

			case Nodes.NodeType.BinaryExprLessEqualTo:
				return yield* this.visitBinaryExprLe(conditional as Nodes.NodeBinaryExprLessEqualTo);

			default:
				return yield* this.visitExpr(conditional as Nodes.NodeExprTypeUnion);
		}
	}

	/**
	 *
	 * @param logical
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeLogicalExprTypeUnion>()
	private *visitLogicalExpr(logical: Nodes.NodeLogicalExprTypeUnion): Generator<void | Value.BaseValue> {
		switch (logical.type) {
			case Nodes.NodeType.BinaryExprOr:
				return yield* this.visitBinaryExprOr(logical as Nodes.NodeBinaryExprOr);

			case Nodes.NodeType.BinaryExprAnd:
				return yield* this.visitBinaryExprAnd(logical as Nodes.NodeBinaryExprAnd);

			default:
				return yield* this.visitConditionalExpr(logical as Nodes.NodeConditionalExprTypeUnion);
		}
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeObjectPropertyAccessor>()
	private *visitDeclarationStmt(statement: Nodes.NodeDeclarationStmt): Generator<void | Value.BaseValue> {
		return this.context.define(statement.name, yield* this.visitLogicalExpr(statement.value));
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeAssignmentStmt>()
	private *visitAssignmentStmt(statement: Nodes.NodeAssignmentStmt): Generator<void | Value.BaseValue> {
		// Caso a variável seja um identificador, atribua o valor a ela diretamente
		if (statement.target instanceof Nodes.NodeIdentifier) {
			return this.context.assign((statement.target as Nodes.NodeIdentifier).name, yield* this.visitLogicalExpr(statement.value));
		} else {
			// Obtém a instância do objeto
			const object = yield* this.visitLogicalExpr((statement.target as Nodes.NodeObjectPropertyAccessor).callee!);

			// Obtém o símbolo e o valor
			const symbol = (yield* this.visitLogicalExpr((statement.target as Nodes.NodeObjectPropertyAccessor).key)).toString();
			const value = yield* this.visitLogicalExpr(statement.value);

			// Atribui o valor ao objeto
			Value.AS_OBJECT(object).__newIndex__(symbol, value);

			// Somente para fins de depuração
			return value;
		}
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeBlockStmt>()
	private *visitBlockStmt(statement: Nodes.NodeBlockStmt): Generator<void | Value.BaseValue> {
		this.enterScope();

		for (const childStatement of statement.body) {
			yield* this.visitStmt(childStatement);
		}

		this.leaveScope();
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeWhileStmt>()
	private *visitWhileStmt(statement: Nodes.NodeWhileStmt): Generator<void | Value.BaseValue> {
		while (Value.AS_BOOLEAN(yield* this.visitLogicalExpr(statement.condition))) {
			// Entra no escopo do loop e então empilha o contexto do loop
			this.enterScope();
			this.context.pushLoopContext();

			for (const childStatement of statement.body) {
				// Executa o corpo do loop
				yield* this.visitStmt(childStatement);

				// Pega o contexto do loop atual e então verifica se deve parar ou continuar
				const loopContext = this.context.getLoopContext();

				if (loopContext.break) {
					break;
				}

				if (loopContext.continue) {
					break;
				}
			}

			// Sai do escopo do loop
			this.leaveScope();

			// Remove o contexto do loop e verifica se deve parar
			const removedLoopContext = this.context.popLoopContext();
			if (removedLoopContext.break) {
				break;
			}
		}
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeNumericForStmt>()
	private *visitNumericForStmt(statement: Nodes.NodeNumericForStmt): Generator<void | Value.BaseValue> {
		// Entra no escopo de definição dos parâmetros do loop
		this.enterScope();

		switch (statement.initializer.type) {
			case Nodes.NodeType.Identifier:
				const identifier = statement.initializer as Nodes.NodeIdentifier;

				// Caso a variável não exista, defina ela no escopo atual
				if (this.context.get(identifier.name) === undefined) {
					this.context.define(identifier.name, Value.NUMBER(0));
				}

				break;

			default:
				break;
		}

		// Caso o valor inicial tenha sido definido, atribua ele a variável
		if (statement.from !== undefined) {
			this.context.assign((statement.initializer as Nodes.NodeIdentifier).name, yield* this.visitLogicalExpr(statement.from));
		}

		// Enquanto a condição for verdadeira, executa o corpo do loop
		while (true) {
			if (statement.until !== undefined) {
				let value;

				// Índice se o loop deve continuar
				let keepGoing = false;

				switch ((value = yield* this.visitLogicalExpr(statement.until)).valueType) {
					// Caso o valor seja um número, verifica se o valor da variável é menor que o valor do loop
					case Value.ValueType.Number:
						keepGoing = (
							(yield* BINARY_OP_LT(
								this.context.get((statement.initializer as Nodes.NodeIdentifier).name)!.value,
								value
							)) as Value.BooleanValue
						).value;
						break;

					// Caso o valor seja um booleano, verifica se o valor é falso
					case Value.ValueType.Boolean:
						keepGoing = !(value as Value.BooleanValue).value;
						break;

					default:
						break;
				}

				if (!keepGoing) {
					break;
				}
			}

			// Entra no escopo do loop e então empilha o contexto do loop
			this.enterScope();
			this.context.pushLoopContext();

			for (const childStatement of statement.body) {
				// Executa o corpo do loop
				yield* this.visitStmt(childStatement);

				// Pega o contexto do loop atual e então verifica se deve parar ou continuar
				const loopContext = this.context.getLoopContext();

				if (loopContext.break) {
					break;
				}

				if (loopContext.continue) {
					break;
				}
			}

			// Caso o "passo" tenha sido definido, executa ele
			if (statement.step !== undefined) {
				yield* this.visitAssignmentStmt(statement.step);
			}

			// Sai do escopo do loop
			this.leaveScope();

			// Remove o contexto do loop e verifica se deve parar
			const removedLoopContext = this.context.popLoopContext();
			if (removedLoopContext.break) {
				break;
			}
		}

		this.leaveScope();
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeIterativeForStmt>()
	private *visitIterativeForStmt(statement: Nodes.NodeIterativeForStmt): Generator<void | Value.BaseValue> {
		if (!Value.IS_OBJECT(yield* this.visitLogicalExpr(statement.iterable))) {
			throw new Exceptions.UnsupportedOperationError("Attempted to iterate over a non-iterable object.");
		}

		// Obtém o objeto iterável
		const object = Value.AS_OBJECT(yield* this.visitLogicalExpr(statement.iterable)) as unknown;

		// Remapeia o objeto para um iterável
		const iterable = object as { __iterate__: () => { next(self: any): Value.IteratorResult } };

		// Verifica se o objeto é iterável
		if (!("__iterate__" in iterable)) {
			throw new Exceptions.ObjectNotIterableError();
		}

		// Entra no escopo de definição dos parâmetros do loop
		this.enterScope();

		// Define a variável de iteração
		this.context.define(statement.key, Value.NULL());
		this.context.define(statement.value, Value.NULL());

		const iterator = iterable.__iterate__();

		while (true) {
			// Retorna o próximo valor do iterável
			const { index, value, done } = iterator.next(iterable);

			if (done) {
				break;
			}

			// Entra no escopo do loop e então empilha o contexto do loop
			this.enterScope();
			this.context.pushLoopContext();

			this.context.assign(statement.key, index!);
			this.context.assign(statement.value, value!);

			for (const childStatement of statement.body) {
				// Executa o corpo do loop
				yield* this.visitStmt(childStatement);

				// Pega o contexto do loop atual e então verifica se deve parar ou continuar
				const loopContext = this.context.getLoopContext();

				if (loopContext.break) {
					break;
				}

				if (loopContext.continue) {
					break;
				}
			}

			// Sai do escopo do loop
			this.leaveScope();

			// Remove o contexto do loop e verifica se deve parar
			const removedLoopContext = this.context.popLoopContext();
			if (removedLoopContext.break) {
				break;
			}
		}

		this.leaveScope();
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeFunctionDeclarationStmt>()
	private *visitFunctionDeclarationStmt(statement: Nodes.NodeFunctionDeclarationStmt): Generator<void> {
		return this.context.define(
			statement.name,
			new Value.CodeObject(statement.name, statement.parameters, statement.body, this.context)
		);
	}

	/**
	 *
	 * @param statement
	 */
	private *visitAnonymousFunctionDeclarationStmt(statement: Nodes.NodeAnonymousFunctionDeclarationStmt): Generator<void> {
		return new Value.CodeObject("anonymous", statement.parameters, statement.body, this.context);
	}

	@Debugger.capture<Nodes.NodeBreakStmt>()
	private *visitBreakStmt(): Generator<void> {
		this.context.getLoopContext().break = true;
	}

	@Debugger.capture<Nodes.NodeContinueStmt>()
	private *visitContinueStmt(): Generator<void> {
		this.context.getLoopContext().continue = true;
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeReturnStmt>()
	private *visitReturnStmt(statement: Nodes.NodeReturnStmt): Generator<void | Value.BaseValue> {
		const returns: Value.BaseValue[] = [];
		for (const value of statement.returns) {
			returns.push(yield* this.visitLogicalExpr(value));
		}

		this.context.getFunctionContext().returns.push(...returns);
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.NodeIfStmt>()
	private *visitIfStmt(statement: Nodes.NodeIfStmt): Generator<void | Value.BaseValue> {
		// Testa a condição do if
		if (Value.AS_BOOLEAN(yield* this.visitLogicalExpr(statement.condition))) {
			return yield* this.visitBlockStmt(statement as Nodes.NodeBlockStmt);
		}

		// Testa todas as condições dos else ifs, e caso alguma seja verdadeira, executa o bloco
		for (const elseIf of statement.elseIfs) {
			if (Value.AS_BOOLEAN(yield* this.visitLogicalExpr(elseIf.condition))) {
				return yield* this.visitBlockStmt(elseIf as Nodes.NodeBlockStmt);
			}
		}

		// Caso haja um else, executa o bloco
		if (statement.elseStmt) {
			yield* this.visitBlockStmt(statement.elseStmt as Nodes.NodeBlockStmt);
		}
	}

	/**
	 *
	 * @param statement
	 */
	@Debugger.capture<Nodes.Node>()
	private *visitStmt(statement: Nodes.Node): Generator<void | Value.BaseValue> {
		switch (statement.type) {
			case Nodes.NodeType.DeclarationStmt:
				return yield* this.visitDeclarationStmt(statement as Nodes.NodeDeclarationStmt);

			case Nodes.NodeType.AssignmentStmt:
				return yield* this.visitAssignmentStmt(statement as Nodes.NodeAssignmentStmt);

			case Nodes.NodeType.BlockStmt:
				return yield* this.visitBlockStmt(statement as Nodes.NodeBlockStmt);

			case Nodes.NodeType.WhileStmt:
				return yield* this.visitWhileStmt(statement as Nodes.NodeWhileStmt);

			case Nodes.NodeType.NumericForStmt:
				return yield* this.visitNumericForStmt(statement as Nodes.NodeNumericForStmt);

			case Nodes.NodeType.IterativeForStmt:
				return yield* this.visitIterativeForStmt(statement as Nodes.NodeIterativeForStmt);

			case Nodes.NodeType.FunctionDeclarationStmt:
				return yield* this.visitFunctionDeclarationStmt(statement as Nodes.NodeFunctionDeclarationStmt);

			case Nodes.NodeType.IfStmt:
				return yield* this.visitIfStmt(statement as Nodes.NodeIfStmt);

			case Nodes.NodeType.BreakStmt:
				return yield* this.visitBreakStmt();

			case Nodes.NodeType.ContinueStmt:
				return yield* this.visitContinueStmt();

			case Nodes.NodeType.ReturnStmt:
				return yield* this.visitReturnStmt(statement as Nodes.NodeReturnStmt);

			case Nodes.NodeType.ObjectAccessor:
				return yield* this.visitObjectAccessor(statement as Nodes.NodeObjectAccessor);

			default:
				return yield* this.visitLogicalExpr(statement as Nodes.NodeLogicalExprTypeUnion);
		}
	}

	/**
	 *
	 * @param local
	 * @param statement
	 * @returns
	 */
	private *__executeUserFunction(code: Value.CodeObject, accessor: Nodes.NodeObjectFunctionAccessor): Generator<void | Value.BaseValue> {
		// Mapeia os argumentos passados para os parâmetros da função
		const inputs: Value.BaseValue[] = [];
		for (const input of accessor.inputs) {
			inputs.push(yield* this.visitLogicalExpr(input));
		}

		// Salva o contexto atual e então entra no escopo da função
		const recoveredContext = this.context;

		// Entra em um novo escopo para a função
		this.enterClosure(code);
		this.context.pushFunctionContext();

		// Define os parâmetros da função
		code.parameters.forEach((parameter, index) => {
			this.context.define(parameter, inputs[index]);
		});

		// Executa o corpo da função
		for (const childStatement of code.body) {
			// Executa o corpo da função
			yield* this.visitStmt(childStatement);

			// Verifica se a função retornou algum valor
			const functionContext = this.context.getFunctionContext();
			if (!functionContext) {
				continue;
			}

			if (functionContext.returns.length > 0) {
				// Sai do escopo da função
				this.context.popFunctionContext();

				// Retorna ao contexto anterior
				this.context = recoveredContext;

				// Retorna o valor retornado pela função
				return functionContext.returns[0];
			}
		}

		// Sai do escopo da função
		this.context.popFunctionContext();

		// Retorna ao contexto anterior
		this.context = recoveredContext;

		return Value.NULL();
	}

	/**
	 *
	 * @param local
	 * @param statement
	 */
	private *__executeBuiltInFunction(
		code: Value.BuiltInCodeObject,
		accessor: Nodes.NodeObjectFunctionAccessor
	): Generator<void | Value.BaseValue> {
		// Mapeia os argumentos passados para os parâmetros da função
		const inputs: Value.BaseValue[] = [];
		for (const input of accessor.inputs) {
			inputs.push(yield* this.visitLogicalExpr(input));
		}

		// Executa a função
		return code.callback(...inputs);
	}

	/**
	 *
	 * @param node
	 */
	@Debugger.capture<Nodes.NodeObjectFunctionAccessor>()
	private *__visitObjectFunctionAccessor(node: Nodes.NodeObjectFunctionAccessor): Generator<void | Value.BaseValue> {
		let code: Value.CodeObject | Value.BuiltInCodeObject | null;

		if (node.callee instanceof Nodes.NodeIdentifier) {
			code = this.context.get((node.callee as Nodes.NodeIdentifier).name)?.value as Value.CodeObject | Value.BuiltInCodeObject;
		} else {
			code = (yield* this.visitLogicalExpr(node.callee!)) as Value.CodeObject | Value.BuiltInCodeObject;
		}

		if (code instanceof Value.CodeObject) {
			return yield* this.__executeUserFunction(code, node);
		}

		if (code instanceof Value.BuiltInCodeObject) {
			return yield* this.__executeBuiltInFunction(code, node);
		}

		throw new Exceptions.UnsupportedOperationError(`Attempted to call a non-function.`);
	}

	/**
	 *
	 * @param node
	 */
	@Debugger.capture<Nodes.NodeObjectPropertyAccessor>()
	private *__visitObjectPropertyAccessor(node: Nodes.NodeObjectPropertyAccessor): Generator<void | Value.BaseValue> {
		if (node.callee === undefined) {
			return yield* this.visitLogicalExpr(node.key);
		}

		if (node.callee instanceof Nodes.NodeIdentifier) {
			return this.context.get((node.callee as Nodes.NodeIdentifier).name)!.value;
		}

		const object = yield* this.visitLogicalExpr(node.callee);
		if (!(object instanceof Value.ObjectValue)) {
			throw new Exceptions.PropertyAccessOnNonObjectError();
		}

		return Value.AS_OBJECT(object).__index__((yield* this.visitLogicalExpr(node.key)).toString()) || Value.NULL();
	}

	/**
	 *
	 * @param node
	 * @returns
	 */
	@Debugger.capture<Nodes.NodeObjectAccessor>()
	private *visitObjectAccessor(node: Nodes.NodeObjectAccessor): Generator<void | Value.BaseValue> {
		const accessor = node as Nodes.NodeObjectAccessor;
		if (accessor instanceof Nodes.NodeObjectFunctionAccessor) {
			return yield* this.__visitObjectFunctionAccessor(accessor as Nodes.NodeObjectFunctionAccessor);
		}

		if (accessor instanceof Nodes.NodeObjectPropertyAccessor) {
			return yield* this.__visitObjectPropertyAccessor(accessor as Nodes.NodeObjectPropertyAccessor);
		}

		throw new Exceptions.UnsupportedOperationError("Attempted to access a non-object.");
	}

	/**
	 *
	 */
	public execute(): void {
		for (const statement of this.program) {
			let iterator = this.visitStmt(statement);
			do {
				const result = iterator.next();
				if (result.done) {
					break;
				}
			} while (true);
		}
	}

	/**
	 *
	 * @returns
	 */
	public *debug(__debugger: Debugger.Debugger): Generator<void | Value.BaseValue, void, unknown> {
		this.__debugger = __debugger;

		for (const statement of this.program) {
			yield* this.visitStmt(statement);
		}
	}
}

export { Compiler };
