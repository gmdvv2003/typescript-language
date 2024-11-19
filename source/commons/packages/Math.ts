import * as Context from "../../compiler/Context";
import * as Value from "../../compiler/Value";

class __Math {
	static PI = Value.NUMBER(3.14159265358979323846);
	static TAU = Value.NUMBER(6.28318530717958647693);

	/**
	 *
	 * @param parameters
	 */
	static seno(_: Context.Context, value: Value.NumberValue): Value.NumberValue {
		return Value.NUMBER(Math.sin(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static cosseno(_: Context.Context, value: Value.NumberValue): Value.NumberValue {
		return Value.NUMBER(Math.cos(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static tangente(_: Context.Context, value: Value.NumberValue): Value.NumberValue {
		return Value.NUMBER(Math.tan(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static potencia(_: Context.Context, base: Value.NumberValue, expoente: Value.NumberValue): Value.NumberValue {
		return Value.NUMBER(Math.pow(base.value, expoente.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static raiz(_: Context.Context, value: Value.NumberValue): Value.NumberValue {
		return Value.NUMBER(Math.sqrt(value.value));
	}
}

export { __Math };
