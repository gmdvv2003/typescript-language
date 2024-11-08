import * as Nodes from "../parser/Nodes";
import * as LinkedList from "../utilities/LinkedList";

import * as Context from "./Context";
import * as Exceptions from "./Exceptions";

export interface IteratorResult {
	index: BaseValue | null;
	value: BaseValue | null;
	done: boolean;
}

interface Iterable<T> {
	__iterate__(): { next(self: T): IteratorResult };
}

export enum ValueType {
	Number,
	Boolean,
	Object,
	Null,
}

export enum ObjectType {
	String,
	Array,
	Dictionary,
	Code,
	BuiltInCode,
}

export class BaseValue {
	constructor(public readonly valueType: ValueType) {}

	/* prettier-ignore */ __add__(a: BaseValue, b: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__add__ not implemented."); } // Metamétodo de adição
	/* prettier-ignore */ __sub__(a: BaseValue, b: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__sub__ not implemented."); } // Metamétodo de subtração
	/* prettier-ignore */ __mul__(a: BaseValue, b: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__mul__ not implemented."); } // Metamétodo de multiplicação
	/* prettier-ignore */ __div__(a: BaseValue, b: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__div__ not implemented."); } // Metamétodo de divisão
	/* prettier-ignore */ __mod__(a: BaseValue, b: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__mod__ not implemented."); } // Metamétodo de módulo

	/* prettier-ignore */ __eq__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__eq__ not implemented."); } // Metamétodo de igualdade
	/* prettier-ignore */ __ne__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__ne__ not implemented."); } // Metamétodo de diferença
	/* prettier-ignore */ __gt__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__gt__ not implemented."); } // Metamétodo de maior que
	/* prettier-ignore */ __ge__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__ge__ not implemented."); } // Metamétodo de maior ou igual que
	/* prettier-ignore */ __lt__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__lt__ not implemented."); } // Metamétodo de menor que
	/* prettier-ignore */ __le__(a: BaseValue, b: BaseValue): boolean { throw new Exceptions.UnsupportedOperationError("__le__ not implemented."); } // Metamétodo de menor ou igual que

	/* prettier-ignore */ __not__(a: BaseValue): BaseValue { throw new Exceptions.UnsupportedOperationError("__not__ not implemented."); } // Metamétodo de negação

	toString(): string {
		throw new Exceptions.UnsupportedOperationError("toString not implemented.");
	}
}

export class NullValue extends BaseValue {
	constructor() {
		super(ValueType.Null);
	}

	/* prettier-ignore */ __eq__(a: NullValue, b: BaseValue): boolean { return b instanceof NullValue; }
	/* prettier-ignore */ __ne__(a: NullValue, b: BaseValue): boolean { return !(b instanceof NullValue); }

	toString(): string {
		return "Nulo";
	}
}

export class NumberValue extends BaseValue {
	constructor(public readonly value: number) {
		super(ValueType.Number);
	}

	__add__(a: NumberValue, b: BaseValue): BaseValue {
		// Caso o valor seja um número, retorna a soma dos dois valores
		if (IS_NUMBER(b)) {
			return NUMBER(a.value + AS_NUMBER(b));
		}

		// Caso o valor seja uma string, retorna a concatenação dos dois valores
		if (IS_STRING(b)) {
			return STRING(a.value.toString() + AS_STRING(b).value);
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform addition between ${a.valueType} and ${b.valueType}`);
	}

	__sub__(a: NumberValue, b: BaseValue): BaseValue {
		// Caso o valor seja um número, retorna a subtração dos dois valores
		if (IS_NUMBER(b)) {
			return NUMBER(a.value - AS_NUMBER(b));
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform subtraction between ${a.valueType} and ${b.valueType}`);
	}

	__mul__(a: NumberValue, b: BaseValue): BaseValue {
		// Caso o valor seja um número, retorna a multiplicação dos dois valores
		if (IS_NUMBER(b)) {
			return NUMBER(a.value * AS_NUMBER(b));
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform multiplication between ${a.valueType} and ${b.valueType}`);
	}

	__div__(a: NumberValue, b: BaseValue): BaseValue {
		// Caso o valor seja um número, retorna a divisão dos dois valores
		if (IS_NUMBER(b)) {
			return NUMBER(a.value / AS_NUMBER(b));
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform division between ${a.valueType} and ${b.valueType}`);
	}

	__mod__(a: NumberValue, b: BaseValue): BaseValue {
		// Caso o valor seja um número, retorna o módulo dos dois valores
		if (IS_NUMBER(b)) {
			return NUMBER(a.value % AS_NUMBER(b));
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform modulo between ${a.valueType} and ${b.valueType}`);
	}

	/* prettier-ignore */ __eq__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value === AS_NUMBER(b); }
	/* prettier-ignore */ __ne__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value === AS_NUMBER(b); }
	/* prettier-ignore */ __gt__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value > AS_NUMBER(b); }
	/* prettier-ignore */ __ge__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value >= AS_NUMBER(b); }
	/* prettier-ignore */ __lt__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value < AS_NUMBER(b); }
	/* prettier-ignore */ __le__(a: NumberValue, b: BaseValue): boolean { return IS_NUMBER(b) && a.value <= AS_NUMBER(b); }

	__not__(a: NumberValue): BaseValue {
		return NUMBER(-a.value);
	}

	toString(): string {
		return this.value.toString();
	}
}

export class BooleanValue extends BaseValue {
	constructor(public readonly value: boolean) {
		super(ValueType.Boolean);
	}

	/* prettier-ignore */ __eq__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value === AS_BOOLEAN(b); }
	/* prettier-ignore */ __ne__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value === AS_BOOLEAN(b); }
	/* prettier-ignore */ __gt__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value > AS_BOOLEAN(b); }
	/* prettier-ignore */ __ge__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value >= AS_BOOLEAN(b); }
	/* prettier-ignore */ __lt__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value < AS_BOOLEAN(b); }
	/* prettier-ignore */ __le__(a: BooleanValue, b: BaseValue): boolean { return IS_BOOLEAN(b) && a.value <= AS_BOOLEAN(b); }

	__not__(a: BooleanValue): BaseValue {
		return BOOLEAN(!a.value);
	}

	toString(): string {
		return this.value.toString();
	}
}

export class ObjectValue extends BaseValue {
	constructor(
		public readonly objectType: ObjectType,
		public readonly __properties__: { [key: string]: any } = {},
		public readonly __overrides__: { [key: string]: (...any: any) => any } = {}
	) {
		super(ValueType.Object);
	}

	/**
	 *
	 * @param symbol
	 * @returns
	 */
	__index__(symbol: string): BaseValue {
		return this.__properties__[symbol] || ("__index__" in this.__overrides__ ? this.__overrides__.__index__(symbol) : NULL());
	}

	/**
	 *
	 * @param symbol
	 * @param value
	 */
	__newIndex__(symbol: string, value: any): void {
		if ("__newindex__" in this.__overrides__) {
			this.__overrides__.__newindex__(symbol, value);
		}
	}
}

export class StringObject extends ObjectValue {
	constructor(public readonly value: string) {
		super(ObjectType.String);
	}

	__add__(a: StringObject, b: BaseValue): BaseValue {
		// Caso o valor seja uma string, retorna a concatenação dos dois valores
		if (IS_STRING(b)) {
			return STRING(a.value + AS_STRING(b).value);
		}

		// Caso o valor seja um número, retorna a concatenação dos dois valores
		if (IS_NUMBER(b)) {
			return STRING(a.value + AS_NUMBER(b).toString());
		}

		throw new Exceptions.UnsupportedOperationError(`Could't perform concatenation between ${a.valueType} and ${b.valueType}`);
	}

	/* prettier-ignore */ __eq__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value === AS_STRING(b).value; }
	/* prettier-ignore */ __ne__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value !== AS_STRING(b).value; }
	/* prettier-ignore */ __gt__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value > AS_STRING(b).value; }
	/* prettier-ignore */ __ge__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value >= AS_STRING(b).value; }
	/* prettier-ignore */ __lt__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value < AS_STRING(b).value; }
	/* prettier-ignore */ __le__(a: StringObject, b: BaseValue): boolean { return IS_STRING(b) && a.value <= AS_STRING(b).value; }

	toString(): string {
		return this.value;
	}
}

export class ArrayObject extends ObjectValue implements Iterable<ArrayObject> {
	constructor(entries: BaseValue[]) {
		const __overrides__: { [key: string]: (...any: any) => any } = {
			__index__: (index: number) => this.__get__(index),
			__newindex__: (index: number, value: BaseValue) => this.__set__(index, value),
		};

		super(
			ObjectType.Array,
			{
				// Campos privados do objeto
				__entries__: entries,

				// Métodos do objeto
				pega: new BuiltInCodeObject((index: number) => this.__get__(index)),
				seta: new BuiltInCodeObject((index: number, value: BaseValue) => this.__set__(index, value)),

				adiciona: new BuiltInCodeObject((value: BaseValue) => this.__properties__.__entries__.push(value)),
				remove: new BuiltInCodeObject((index: number) => this.__properties__.__entries__.splice(index, 1)),

				tamanho: new BuiltInCodeObject(() => NUMBER(this.__properties__.__entries__.length)),
			},
			__overrides__
		);
	}

	/**
	 *
	 * @param index
	 * @returns
	 */
	private __get__(index: number): BaseValue {
		return this.__properties__.__entries__[index];
	}

	/**
	 *
	 * @param index
	 * @param value
	 */
	private __set__(index: number, value: BaseValue): void {
		if (value instanceof NullValue) {
			// Remove a entrada
			this.__properties__.__entries__.splice(index, 1);
		} else {
			// Adiciona a entrada
			this.__properties__.__entries__[index] = value;
		}
	}

	__iterate__(): { next(self: ArrayObject): IteratorResult } {
		// Índice atual do iterador
		let index = 0;

		return {
			next(self: ArrayObject): IteratorResult {
				if (index < self.__properties__.__entries__.length) {
					return { index: NUMBER(index), value: self.__properties__.__entries__[index++], done: false };
				}

				return { index: null, value: null, done: true };
			},
		};
	}

	toString(): string {
		return `[${Array.from(this.__properties__.__entries__).join(", ")}]`;
	}
}

export class DictionaryObject extends ObjectValue implements Iterable<DictionaryObject> {
	constructor(entries: { [key: string]: BaseValue }) {
		const __overrides__: { [key: string]: (...any: any) => any } = {
			__index__: (key: string) => this.__get__(key),
			__newindex__: (key: string, value: BaseValue) => this.__set__(key, value),
		};

		super(
			ObjectType.Dictionary,
			{
				// Campos privados do objeto
				__entries__: entries,

				__keys__: (() => {
					const list = new LinkedList.LinkedList<string>();

					for (const key in entries) {
						list.insert(key);
					}

					return list;
				})(),

				// Métodos do objeto
				pega: new BuiltInCodeObject((key: string) => this.__get__(key)),
				seta: new BuiltInCodeObject((key: string, value: BaseValue) => this.__set__(key, value)),

				tamanho: new BuiltInCodeObject(() => NUMBER(Object.keys(this.__properties__.__entries__).length)),
			},
			__overrides__
		);
	}

	/**
	 *
	 * @param key
	 * @returns
	 */
	private __get__(key: string): BaseValue {
		return this.__properties__.__entries__[key];
	}

	/**
	 *
	 * @param key
	 * @param value
	 */
	private __set__(key: string, value: BaseValue): void {
		if (value instanceof NullValue) {
			// Delete a entrada e remove a chave da lista
			delete this.__properties__.__entries__[key];
			this.__properties__.__keys__.remove(key);
		} else {
			// Adiciona a entrada e a chave na lista
			this.__properties__.__entries__[key] = value;
			this.__properties__.__keys__.insert(key);
		}
	}

	__iterate__(): { next(self: DictionaryObject): IteratorResult } {
		let current = this.__properties__.__keys__.head;

		return {
			next(self: DictionaryObject): IteratorResult {
				if (current) {
					// Chave e valor do nó atual
					const key = current.value;
					const value = self.__properties__.__entries__[key];

					// Move para o próximo nó
					current = current.next;

					return { index: STRING(key), value: value, done: false };
				}

				return { index: null, value: null, done: true };
			},
		};
	}

	toString(): string {
		const entries = this.__properties__.__entries__;
		return `{${Object.keys(entries)
			.map((key) => `["${key}"] = ${entries[key]}`)
			.join(", ")}}`;
	}
}

export class CodeObject extends ObjectValue {
	constructor(
		public readonly name: string,
		public readonly parameters: string[],
		public readonly body: Nodes.NodeStmtTypeUnion[],
		public context: Context.Context | null = null
	) {
		super(ObjectType.Code);
	}

	toString(): string {
		return `<função ${this.name}>`;
	}
}

export class BuiltInCodeObject extends ObjectValue {
	constructor(public readonly callback: (...any: any[]) => any) {
		super(ObjectType.BuiltInCode);
	}

	toString(): string {
		return "<função nativa>";
	}
}

/* prettier-ignore */ export function NUMBER(value: number): NumberValue { return new NumberValue(value); }
/* prettier-ignore */ export function BOOLEAN(value: boolean): BooleanValue { return new BooleanValue(value); }
/* prettier-ignore */ export function NULL(): NullValue { return new NullValue(); }

/* prettier-ignore */ export function STRING(value: string): StringObject { return new StringObject(value); }
/* prettier-ignore */ export function ARRAY(entries: BaseValue[]): ArrayObject { return new ArrayObject(entries); }
/* prettier-ignore */ export function DICTIONARY(entries: { [key: string]: BaseValue }): DictionaryObject { return new DictionaryObject(entries); }

/* prettier-ignore */ export function AS_NUMBER(value: BaseValue): number { return (value as NumberValue).value; }
/* prettier-ignore */ export function AS_BOOLEAN(value: BaseValue): boolean { return (value as BooleanValue).value }
/* prettier-ignore */ export function AS_NULL(value: BaseValue): NullValue { return value as NullValue; }

/* prettier-ignore */ export function AS_OBJECT(value: BaseValue): ObjectValue { return value as ObjectValue; }
/* prettier-ignore */ export function AS_STRING(value: BaseValue): StringObject { return value as StringObject; }
/* prettier-ignore */ export function AS_ARRAY(value: BaseValue): ArrayObject { return value as ArrayObject; }
/* prettier-ignore */ export function AS_DICTIONARY(value: BaseValue): DictionaryObject { return value as DictionaryObject; }
/* prettier-ignore */ export function AS_CODE(value: BaseValue): CodeObject { return value as CodeObject; }
/* prettier-ignore */ export function AS_BUILT_IN_CODE(value: BaseValue): BuiltInCodeObject { return value as BuiltInCodeObject; }

/* prettier-ignore */ export function IS_NUMBER(value: BaseValue): boolean { return value.valueType === ValueType.Number; }
/* prettier-ignore */ export function IS_BOOLEAN(value: BaseValue): boolean { return value.valueType === ValueType.Boolean; }
/* prettier-ignore */ export function IS_NULL(value: BaseValue): boolean { return value instanceof NullValue; }

/* prettier-ignore */ export function IS_OBJECT(value: BaseValue): boolean { return value.valueType === ValueType.Object; }
/* prettier-ignore */ export function IS_OBJECT_OF_TYPE(value: BaseValue, type: ObjectType): boolean { return IS_OBJECT(value) && (value as unknown as ObjectValue).objectType === type; }

/* prettier-ignore */ export function IS_STRING(value: BaseValue): boolean { return IS_OBJECT_OF_TYPE(value, ObjectType.String); }
/* prettier-ignore */ export function IS_ARRAY(value: BaseValue): boolean { return IS_OBJECT_OF_TYPE(value, ObjectType.Array); }
/* prettier-ignore */ export function IS_DICTIONARY(value: BaseValue): boolean { return IS_OBJECT_OF_TYPE(value, ObjectType.Dictionary); }
/* prettier-ignore */ export function IS_CODE(value: BaseValue): boolean { return IS_OBJECT_OF_TYPE(value, ObjectType.Code); }
/* prettier-ignore */ export function IS_BUILT_IN_CODE(value: BaseValue): boolean { return IS_OBJECT_OF_TYPE(value, ObjectType.BuiltInCode); }
