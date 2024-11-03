import { Context } from "../../compiler/Context";
import { NUMBER, NumberValue } from "../../compiler/Value";

class __Math {
	static PI = NUMBER(3.14159265358979323846);
	static TAU = NUMBER(6.28318530717958647693);

	/**
	 *
	 * @param parameters
	 */
	static seno(_: Context, value: NumberValue): NumberValue {
		return NUMBER(Math.sin(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static cosseno(_: Context, value: NumberValue): NumberValue {
		return NUMBER(Math.cos(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static tangente(_: Context, value: NumberValue): NumberValue {
		return NUMBER(Math.tan(value.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static potencia(_: Context, base: NumberValue, expoente: NumberValue): NumberValue {
		return NUMBER(Math.pow(base.value, expoente.value));
	}

	/**
	 *
	 * @param parameters
	 */
	static raiz(_: Context, value: NumberValue): NumberValue {
		return NUMBER(Math.sqrt(value.value));
	}
}

export { __Math };
