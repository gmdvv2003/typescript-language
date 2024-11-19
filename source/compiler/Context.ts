import * as Exceptions from "./Exceptions";
import * as Value from "./Value";

export class Local {
	constructor(public readonly name: string, public readonly scopeLevel: number, public value: Value.BaseValue) {}
}

export class LoopContext {
	// Indica se o loop deve ser interrompido
	public break: boolean = false;

	// Indica se o loop deve continuar
	public continue: boolean = false;
}

export class FunctionContext {
	// Indica os valores de retorno da função
	public returns: Value.BaseValue[] = [];
}

export class Context {
	// Lista de contextos de loops e funções
	public loopsContext: LoopContext[] = [];
	public functionsContext: FunctionContext[] = [];

	// Lista de variáveis locais
	public locals: Local[] = [];

	// Nível do escopo atual
	public scopeLevel: number = -1;

	constructor(public readonly parentContext: Context | null, builtIns: { [key: string]: Value.BaseValue } = {}) {
		for (const [key, value] of Object.entries(builtIns)) {
			// Caso o valor implemente a interface BaseValue, define a variável diretamente
			if (value instanceof Value.BaseValue) {
				this.define(key, value);
			} else {
				this.define(key, new Value.BuiltInCodeObject(value));
			}
		}

		// Caso exista um contexto pai, o nível do escopo é incrementado
		this.scopeLevel = 0;
	}

	/**
	 *
	 * @param name
	 * @param value
	 */
	public define(name: string, value: Value.BaseValue): Value.BaseValue {
		const local = this.get(name);
		if (local !== undefined && local.scopeLevel === this.scopeLevel) {
			throw new Exceptions.VariableAlreadyDefinedError(name);
		}

		this.locals.push(new Local(name, this.scopeLevel, value));

		// Somente para fins de depuração
		return value;
	}

	/**
	 *
	 * @param name
	 * @param value
	 */
	public assign(name: string, value: Value.BaseValue): Value.BaseValue {
		const local = this.get(name);
		if (!local) {
			throw new Exceptions.VariableNotDefinedError(name);
		}

		local.value = value;

		// Somente para fins de depuração
		return value;
	}

	/**
	 *
	 * @param name
	 */
	public get(name: string): Local | undefined {
		for (let index = this.locals.length - 1; index >= 0; index -= 1) {
			const local = this.locals[index];
			if (local.name === name) {
				return local;
			}
		}

		return this.parentContext?.get(name);
	}

	/**
	 *
	 */
	public pushLoopContext(): void {
		this.loopsContext.push(new LoopContext());
	}

	/**
	 *
	 * @returns
	 */
	public popLoopContext(): LoopContext {
		if (this.loopsContext.length === 0) {
			throw new Exceptions.NoLoopContextError();
		}

		return this.loopsContext.pop() as LoopContext;
	}

	/**
	 *
	 */
	public pushFunctionContext(): void {
		this.functionsContext.push(new FunctionContext());
	}

	/**
	 *
	 * @returns
	 */
	public popFunctionContext(): FunctionContext {
		if (this.functionsContext.length === 0) {
			throw new Exceptions.NoFunctionContextError();
		}

		return this.functionsContext.pop() as FunctionContext;
	}

	/* prettier-ignore */ public getLoopContext(): LoopContext { return this.loopsContext[this.loopsContext.length - 1]; }
	/* prettier-ignore */ public getFunctionContext(): FunctionContext { return this.functionsContext[this.functionsContext.length - 1]; }
}
