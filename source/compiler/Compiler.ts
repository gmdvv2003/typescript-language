import * as Nodes from "../parser/Nodes";

import * as Exceptions from "./Exceptions";
import * as Value from "./Value";
import * as Context from "./Context";

import { BuiltIns } from "../commons/BuiltIns";

const BINARY_OP_OR = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(Value.AS_BOOLEAN(left) || Value.AS_BOOLEAN(right));
const BINARY_OP_AND = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(Value.AS_BOOLEAN(left) && Value.AS_BOOLEAN(right));

const BINARY_OP_EQ = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__eq__(left, right));
const BINARY_OP_NE = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__ne__(left, right));
const BINARY_OP_GT = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__gt__(left, right));
const BINARY_OP_GE = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__ge__(left, right));
const BINARY_OP_LT = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__lt__(left, right));
const BINARY_OP_LE = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => Value.BOOLEAN(left.__le__(left, right));

const BINARY_OP_ADD = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => left.__add__(left, right);
const BINARY_OP_SUB = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => left.__sub__(left, right);
const BINARY_OP_MUL = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => left.__mul__(left, right);
const BINARY_OP_DIV = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => left.__div__(left, right);
const BINARY_OP_MOD = (left: Value.BaseValue, right: Value.BaseValue): Value.BaseValue => left.__mod__(left, right);

const UNARY_OP_NOT = (value: Value.BaseValue): Value.BaseValue => value.__not__(value);

class Compiler {
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

	/* prettier-ignore */ private visitBinaryExprOr(node: Nodes.NodeBinaryExprOr): Value.BaseValue { return BINARY_OP_OR(this.visitLogicalExpr(node.left), this.visitLogicalExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprAnd(node: Nodes.NodeBinaryExprAnd): Value.BaseValue { return BINARY_OP_AND(this.visitLogicalExpr(node.left), this.visitLogicalExpr(node.right)); }

	/* prettier-ignore */ private visitBinaryExprEq(node: Nodes.NodeBinaryExprEqualTo): Value.BaseValue { return BINARY_OP_EQ(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprNe(node: Nodes.NodeBinaryExprNotEqualTo): Value.BaseValue { return BINARY_OP_NE(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprGt(node: Nodes.NodeBinaryExprGreaterThan): Value.BaseValue { return BINARY_OP_GT(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprGe(node: Nodes.NodeBinaryExprGreaterEqualTo): Value.BaseValue { return BINARY_OP_GE(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprLt(node: Nodes.NodeBinaryExprLessThan): Value.BaseValue { return BINARY_OP_LT(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprLe(node: Nodes.NodeBinaryExprLessEqualTo): Value.BaseValue { return BINARY_OP_LE(this.visitExpr(node.left), this.visitExpr(node.right)); }

	/* prettier-ignore */ private visitBinaryExprAdd(node: Nodes.NodeBinaryExprAdd): Value.BaseValue { return BINARY_OP_ADD(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprSub(node: Nodes.NodeBinaryExprSub): Value.BaseValue { return BINARY_OP_SUB(this.visitExpr(node.left), this.visitExpr(node.right)); }
	/* prettier-ignore */ private visitBinaryExprMul(node: Nodes.NodeBinaryExprMul): Value.BaseValue { return BINARY_OP_MUL(this.visitTerm(node.left), this.visitTerm(node.right)); }
	/* prettier-ignore */ private visitBinaryExprDiv(node: Nodes.NodeBinaryExprDiv): Value.BaseValue { return BINARY_OP_DIV(this.visitTerm(node.left), this.visitTerm(node.right)); }
	/* prettier-ignore */ private visitBinaryExprMod(node: Nodes.NodeBinaryExprMod): Value.BaseValue { return BINARY_OP_MOD(this.visitTerm(node.left), this.visitTerm(node.right)); }

	/* prettier-ignore */ private visitUnaryNot(node: Nodes.NodeUnaryNot): Value.BaseValue { return UNARY_OP_NOT(this.visitLogicalExpr(node.value)); }

	/**
	 *
	 * @param factor
	 * @returns
	 */
	private visitFactor(factor: Nodes.NodeFactorTypeUnion): Value.BaseValue {
		switch (factor.type) {
			case Nodes.NodeType.UnaryNot:
				return this.visitUnaryNot(factor as Nodes.NodeUnaryNot);

			case Nodes.NodeType.NullLiteral:
				return Value.NULL();

			case Nodes.NodeType.NumberLiteral:
				return Value.NUMBER((factor as Nodes.NodeNumberLiteral).value);

			case Nodes.NodeType.BooleanLiteral:
				return Value.BOOLEAN((factor as Nodes.NodeBooleanLiteral).value);

			case Nodes.NodeType.StringLiteral:
				return Value.STRING((factor as Nodes.NodeStringLiteral).value);

			case Nodes.NodeType.ArrayLiteral:
				return Value.ARRAY((factor as Nodes.NodeArrayLiteral).entries.map((entry) => this.visitLogicalExpr(entry)));

			case Nodes.NodeType.DictionaryLiteral:
				const dictionaryLiteral = factor as Nodes.NodeDictionaryLiteral;

				// Mapeia os valores do dicionário
				let entries: { [key: string]: Value.BaseValue } = {};
				for (const key in dictionaryLiteral.entries) {
					entries[key] = this.visitLogicalExpr(dictionaryLiteral.entries[key]);
				}

				return Value.DICTIONARY(entries);

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
				return this.visitObjectAccessor(factor as Nodes.NodeObjectAccessor);
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
	private visitTerm(term: Nodes.NodeTermTypeUnion): Value.BaseValue {
		switch (term.type) {
			case Nodes.NodeType.BinaryExprMul:
				return this.visitBinaryExprMul(term as Nodes.NodeBinaryExprMul);

			case Nodes.NodeType.BinaryExprDiv:
				return this.visitBinaryExprDiv(term as Nodes.NodeBinaryExprDiv);

			case Nodes.NodeType.BinaryExprMod:
				return this.visitBinaryExprMod(term as Nodes.NodeBinaryExprMod);

			default:
				return this.visitFactor(term as Nodes.NodeFactorTypeUnion);
		}
	}

	/**
	 *
	 * @param expr
	 * @returns
	 */
	private visitExpr(expr: Nodes.NodeExprTypeUnion): Value.BaseValue {
		switch (expr.type) {
			case Nodes.NodeType.BinaryExprAdd:
				return this.visitBinaryExprAdd(expr as Nodes.NodeBinaryExprAdd);

			case Nodes.NodeType.BinaryExprSub:
				return this.visitBinaryExprSub(expr as Nodes.NodeBinaryExprSub);

			default:
				return this.visitTerm(expr as Nodes.NodeTermTypeUnion);
		}
	}

	/**
	 *
	 * @param conditional
	 * @returns
	 */
	private visitConditionalExpr(conditional: Nodes.NodeConditionalExprTypeUnion): Value.BaseValue {
		switch (conditional.type) {
			case Nodes.NodeType.BinaryExprEqualTo:
				return this.visitBinaryExprEq(conditional as Nodes.NodeBinaryExprEqualTo);

			case Nodes.NodeType.BinaryExprNotEqualTo:
				return this.visitBinaryExprNe(conditional as Nodes.NodeBinaryExprNotEqualTo);

			case Nodes.NodeType.BinaryExprGreaterThan:
				return this.visitBinaryExprGt(conditional as Nodes.NodeBinaryExprGreaterThan);

			case Nodes.NodeType.BinaryExprGreaterEqualTo:
				return this.visitBinaryExprGe(conditional as Nodes.NodeBinaryExprGreaterEqualTo);

			case Nodes.NodeType.BinaryExprLessThan:
				return this.visitBinaryExprLt(conditional as Nodes.NodeBinaryExprLessThan);

			case Nodes.NodeType.BinaryExprLessEqualTo:
				return this.visitBinaryExprLe(conditional as Nodes.NodeBinaryExprLessEqualTo);

			default:
				return this.visitExpr(conditional as Nodes.NodeExprTypeUnion);
		}
	}

	/**
	 *
	 * @param logical
	 * @returns
	 */
	private visitLogicalExpr(logical: Nodes.NodeLogicalExprTypeUnion): Value.BaseValue {
		switch (logical.type) {
			case Nodes.NodeType.BinaryExprOr:
				return this.visitBinaryExprOr(logical as Nodes.NodeBinaryExprOr);

			case Nodes.NodeType.BinaryExprAnd:
				return this.visitBinaryExprAnd(logical as Nodes.NodeBinaryExprAnd);

			default:
				return this.visitConditionalExpr(logical as Nodes.NodeConditionalExprTypeUnion);
		}
	}

	/**
	 *
	 * @param statement
	 */
	private visitDeclarationStmt(statement: Nodes.NodeDeclarationStmt): void {
		this.context.define(statement.name, this.visitLogicalExpr(statement.value));
	}

	/**
	 *
	 * @param statement
	 */
	private visitAssignmentStmt(statement: Nodes.NodeAssignmentStmt): void {
		// Caso a variável seja um identificador, atribua o valor a ela diretamente
		if (statement.target instanceof Nodes.NodeIdentifier) {
			this.context.assign((statement.target as Nodes.NodeIdentifier).name, this.visitLogicalExpr(statement.value));
		} else {
			// Obtém a instância do objeto
			const object = this.visitLogicalExpr((statement.target as Nodes.NodeObjectPropertyAccessor).callee!);

			// Obtém o símbolo e o valor
			const symbol = this.visitLogicalExpr((statement.target as Nodes.NodeObjectPropertyAccessor).key).toString();
			const value = this.visitLogicalExpr(statement.value);

			// Atribui o valor ao objeto
			Value.AS_OBJECT(object).__newIndex__(symbol, value);
		}
	}

	/**
	 *
	 * @param statement
	 */
	private visitBlockStmt(statement: Nodes.NodeBlockStmt): void {
		this.enterScope();

		statement.body.forEach((statement) => {
			this.visitStmt(statement);
		});

		this.leaveScope();
	}

	/**
	 *
	 * @param statement
	 */
	private visitWhileStmt(statement: Nodes.NodeWhileStmt): void {
		while (Value.AS_BOOLEAN(this.visitLogicalExpr(statement.condition))) {
			// Entra no escopo do loop e então empilha o contexto do loop
			this.enterScope();
			this.context.pushLoopContext();

			for (const childStatement of statement.body) {
				// Executa o corpo do loop
				this.visitStmt(childStatement);

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
	private visitNumericForStmt(statement: Nodes.NodeNumericForStmt): void {
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
			this.context.assign((statement.initializer as Nodes.NodeIdentifier).name, this.visitLogicalExpr(statement.from));
		}

		// Enquanto a condição for verdadeira, executa o corpo do loop
		while (true) {
			if (statement.until !== undefined) {
				let value;

				// Índice se o loop deve continuar
				let keepGoing = false;

				switch ((value = this.visitLogicalExpr(statement.until)).valueType) {
					// Caso o valor seja um número, verifica se o valor da variável é menor que o valor do loop
					case Value.ValueType.Number:
						keepGoing = (BINARY_OP_LT(this.context.get((statement.initializer as Nodes.NodeIdentifier).name)!.value, value) as Value.BooleanValue)
							.value;
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
				this.visitStmt(childStatement);

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
				this.visitAssignmentStmt(statement.step);
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
	private visitIterativeForStmt(statement: Nodes.NodeIterativeForStmt): void {
		if (!Value.IS_OBJECT(this.visitLogicalExpr(statement.iterable))) {
			throw new Exceptions.UnsupportedOperationError();
		}

		// Obtém o objeto iterável
		const object = Value.AS_OBJECT(this.visitLogicalExpr(statement.iterable)) as unknown;

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
				this.visitStmt(childStatement);

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
	private visitFunctionDeclarationStmt(statement: Nodes.NodeFunctionDeclarationStmt): void {
		this.context.define(statement.name, new Value.CodeObject(statement.name, statement.parameters, statement.body, this.context));
	}

	/**
	 *
	 * @param statement
	 */
	private visitIfStmt(statement: Nodes.NodeIfStmt): void {
		// Testa a condição do if
		if (Value.AS_BOOLEAN(this.visitLogicalExpr(statement.condition))) {
			return this.visitBlockStmt(statement as Nodes.NodeBlockStmt);
		}

		// Testa todas as condições dos else ifs, e caso alguma seja verdadeira, executa o bloco
		for (const elseIf of statement.elseIfs) {
			if (Value.AS_BOOLEAN(this.visitLogicalExpr(elseIf.condition))) {
				return this.visitBlockStmt(elseIf as Nodes.NodeBlockStmt);
			}
		}

		// Caso haja um else, executa o bloco
		if (statement.elseStmt) {
			this.visitBlockStmt(statement.elseStmt as Nodes.NodeBlockStmt);
		}
	}

	/* prettier-ignore */ private visitBreakStmt(): void { this.context.getLoopContext().break = true; }
	/* prettier-ignore */ private visitContinueStmt(): void { this.context.getLoopContext().continue = true; }

	/**
	 *
	 * @param statement
	 */
	private visitReturnStmt(statement: Nodes.NodeReturnStmt): void {
		this.context.getFunctionContext().returns.push(...statement.returns.map((value) => this.visitLogicalExpr(value)));
	}

	/**
	 *
	 * @param statement
	 */
	private visitStmt(statement: Nodes.Node): void {
		switch (statement.type) {
			case Nodes.NodeType.DeclarationStmt:
				this.visitDeclarationStmt(statement as Nodes.NodeDeclarationStmt);
				break;

			case Nodes.NodeType.AssignmentStmt:
				this.visitAssignmentStmt(statement as Nodes.NodeAssignmentStmt);
				break;

			case Nodes.NodeType.BlockStmt:
				this.visitBlockStmt(statement as Nodes.NodeBlockStmt);
				break;

			case Nodes.NodeType.WhileStmt:
				this.visitWhileStmt(statement as Nodes.NodeWhileStmt);
				break;

			case Nodes.NodeType.NumericForStmt:
				this.visitNumericForStmt(statement as Nodes.NodeNumericForStmt);
				break;

			case Nodes.NodeType.IterativeForStmt:
				this.visitIterativeForStmt(statement as Nodes.NodeIterativeForStmt);
				break;

			case Nodes.NodeType.FunctionDeclarationStmt:
				this.visitFunctionDeclarationStmt(statement as Nodes.NodeFunctionDeclarationStmt);
				break;

			case Nodes.NodeType.IfStmt:
				this.visitIfStmt(statement as Nodes.NodeIfStmt);
				break;

			case Nodes.NodeType.BreakStmt:
				this.visitBreakStmt();
				break;

			case Nodes.NodeType.ContinueStmt:
				this.visitContinueStmt();
				break;

			case Nodes.NodeType.ReturnStmt:
				this.visitReturnStmt(statement as Nodes.NodeReturnStmt);
				break;

			case Nodes.NodeType.ObjectAccessor:
				this.visitObjectAccessor(statement as Nodes.NodeObjectAccessor);
				break;

			default:
				throw new Exceptions.UnreachableNodeError(statement);
		}
	}

	/**
	 *
	 * @param local
	 * @param statement
	 * @returns
	 */
	private __executeUserFunction(code: Value.CodeObject, accessor: Nodes.NodeObjectFunctionAccessor): Value.BaseValue {
		// Mapeia os argumentos passados para os parâmetros da função
		const inputs = accessor.inputs.map((input) => this.visitLogicalExpr(input));

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
			this.visitStmt(childStatement);

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
	private __executeBuiltInFunction(code: Value.BuiltInCodeObject, accessor: Nodes.NodeObjectFunctionAccessor): Value.BaseValue {
		// Mapeia os argumentos passados para os parâmetros da função
		const inputs = accessor.inputs.map((input) => this.visitLogicalExpr(input));

		// Executa a função
		return code.callback(...inputs);
	}

	/**
	 *
	 * @param node
	 */
	private __visitObjectFunctionAccessor(node: Nodes.NodeObjectFunctionAccessor): Value.BaseValue {
		let code: Value.CodeObject | Value.BuiltInCodeObject | null;

		if (node.callee instanceof Nodes.NodeIdentifier) {
			code = this.context.get((node.callee as Nodes.NodeIdentifier).name)?.value as Value.CodeObject | Value.BuiltInCodeObject;
		} else {
			code = this.visitLogicalExpr(node.callee!) as Value.CodeObject | Value.BuiltInCodeObject;
		}

		if (code instanceof Value.CodeObject) {
			return this.__executeUserFunction(code, node);
		}

		if (code instanceof Value.BuiltInCodeObject) {
			return this.__executeBuiltInFunction(code, node);
		}

		throw new Exceptions.UnsupportedOperationError();
	}

	/**
	 *
	 * @param node
	 */
	private __visitObjectPropertyAccessor(node: Nodes.NodeObjectPropertyAccessor): Value.BaseValue {
		if (node.callee === undefined) {
			return this.visitLogicalExpr(node.key);
		}

		if (node.callee instanceof Nodes.NodeIdentifier) {
			return this.context.get((node.callee as Nodes.NodeIdentifier).name)!.value;
		}

		const object = this.visitLogicalExpr(node.callee);
		if (!(object instanceof Value.ObjectValue)) {
			throw new Exceptions.PropertyAccessOnNonObjectError();
		}

		return Value.AS_OBJECT(object).__index__(this.visitLogicalExpr(node.key).toString()) || Value.NULL();
	}

	/**
	 *
	 * @param node
	 * @returns
	 */
	private visitObjectAccessor(node: Nodes.NodeObjectAccessor): Value.BaseValue {
		const accessor = node as Nodes.NodeObjectAccessor;
		if (accessor instanceof Nodes.NodeObjectFunctionAccessor) {
			return this.__visitObjectFunctionAccessor(accessor as Nodes.NodeObjectFunctionAccessor);
		}

		if (accessor instanceof Nodes.NodeObjectPropertyAccessor) {
			return this.__visitObjectPropertyAccessor(accessor as Nodes.NodeObjectPropertyAccessor);
		}

		throw new Exceptions.UnsupportedOperationError();
	}

	/**
	 *
	 * @returns
	 */
	public execute(): Promise<void> {
		return new Promise((resolve) => {
			this.program.forEach((statement) => {
				this.visitStmt(statement);
			});
		});
	}
}

export { Compiler };
