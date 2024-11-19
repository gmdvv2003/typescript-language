export enum NodeType {
	Program = "Program",

	Stmt = "Stmt",
	Expr = "Expr",
	Term = "Term",
	Factor = "Factor",

	UnaryNot = "UnaryNot",
	NullLiteral = "NullLiteral",
	NumberLiteral = "NumberLiteral",
	StringLiteral = "StringLiteral",
	BooleanLiteral = "BooleanLiteral",
	ArrayLiteral = "ArrayLiteral",
	DictionaryLiteral = "DictionaryLiteral",
	Identifier = "Identifier",

	BinaryExprOr = "BinaryExprOr",
	BinaryExprAnd = "BinaryExprAnd",

	BinaryExprEqualTo = "BinaryExprEqualTo",
	BinaryExprNotEqualTo = "BinaryExprNotEqualTo",
	BinaryExprGreaterThan = "BinaryExprGreaterThan",
	BinaryExprGreaterEqualTo = "BinaryExprGreaterEqualTo",
	BinaryExprLessThan = "BinaryExprLessThan",
	BinaryExprLessEqualTo = "BinaryExprLessEqualTo",

	BinaryExprAdd = "BinaryExprAdd",
	BinaryExprSub = "BinaryExprSub",
	BinaryExprMul = "BinaryExprMul",
	BinaryExprDiv = "BinaryExprDiv",
	BinaryExprMod = "BinaryExprMod",

	ObjectAccessor = "ObjectAccessor",

	DeclarationStmt = "DeclarationStmt",
	AssignmentStmt = "AssignmentStmt",
	BlockStmt = "BlockStmt",
	WhileStmt = "WhileStmt",
	NumericForStmt = "NumericForStmt",
	IterativeForStmt = "IterativeForStmt",

	FunctionDeclarationStmt = "FunctionDeclarationStmt",
	AnonymousFunctionDeclarationStmt = "AnonymousFunctionDeclarationStmt",

	IfStmt = "IfStmt",
	ElseIfStmt = "ElseIfStmt",
	ElseStmt = "ElseStmt",

	BreakStmt = "BreakStmt",
	ContinueStmt = "ContinueStmt",

	ReturnStmt = "ReturnStmt",
}

/* prettier-ignore */ export type NodeStmtTypeUnion =
	| NodeDeclarationStmt
	| NodeAssignmentStmt
	| NodeBlockStmt
	| NodeWhileStmt
	| NodeNumericForStmt
	| NodeIterativeForStmt
	| NodeFunctionDeclarationStmt
	| NodeBreakStmt
	| NodeContinueStmt
	| NodeReturnStmt;

/* prettier-ignore */ export type NodeFactorTypeUnion =
	| NodeUnaryNot
	| NodeNullLiteral
	| NodeNumberLiteral 
	| NodeStringLiteral
	| NodeBooleanLiteral
	| NodeArrayLiteral
	| NodeDictionaryLiteral
	| NodeIdentifier
	| NodeObjectAccessor;

/* prettier-ignore */ export type NodeTermTypeUnion = NodeFactorTypeUnion	| NodeBinaryExprMul | NodeBinaryExprDiv  | NodeBinaryExprMod;
/* prettier-ignore */ export type NodeExprTypeUnion = NodeTermTypeUnion 	| NodeBinaryExprAdd | NodeBinaryExprSub;

/* prettier-ignore */ export type NodeConditionalExprTypeUnion =
	| NodeExprTypeUnion
	| NodeBinaryExprEqualTo
	| NodeBinaryExprNotEqualTo
	| NodeBinaryExprGreaterThan
	| NodeBinaryExprGreaterEqualTo
	| NodeBinaryExprLessThan
	| NodeBinaryExprLessEqualTo;

/* prettier-ignore */ export type NodeLogicalExprTypeUnion = NodeConditionalExprTypeUnion | NodeBinaryExprAnd | NodeBinaryExprOr;

/* prettier-ignore */ export type NodeObjectAccessorTypeUnion = NodeObjectFunctionAccessor | NodeObjectPropertyAccessor;

export class Node {
	constructor(public readonly type: NodeType) {}
}

export class NodeBreakStmt extends Node {
	constructor() {
		super(NodeType.BreakStmt);
	}

	toString() {
		return "parar";
	}
}

export class NodeContinueStmt extends Node {
	constructor() {
		super(NodeType.ContinueStmt);
	}

	toString() {
		return "continuar";
	}
}

export class NodeReturnStmt extends Node {
	constructor(public readonly returns: NodeExprTypeUnion[]) {
		super(NodeType.ReturnStmt);
	}

	toString() {
		return `retornar ${this.returns.map((value): string => value.toString()).join(", ")}`;
	}
}

export class NodeDeclarationStmt extends Node {
	constructor(public readonly name: string, public readonly value: NodeExprTypeUnion) {
		super(NodeType.DeclarationStmt);
	}

	toString() {
		return `declarar ${this.name} = ${this.value}`;
	}
}

export class NodeAssignmentStmt extends Node {
	constructor(public readonly target: NodeExprTypeUnion, public readonly value: NodeExprTypeUnion) {
		super(NodeType.AssignmentStmt);
	}

	toString() {
		return `${this.target} = ${this.value}`;
	}
}

export class NodeBlockStmt extends Node {
	constructor(public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.BlockStmt);
	}

	toString() {
		return this.body.map((stmt): string => stmt.toString()).join("\n");
	}
}

export class NodeWhileStmt extends Node {
	constructor(public readonly condition: NodeLogicalExprTypeUnion, public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.WhileStmt);
	}

	toString() {
		return `enquanto ${this.condition} faça ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeNumericForStmt extends Node {
	constructor(
		public readonly initializer: NodeLogicalExprTypeUnion,
		public readonly from: NodeLogicalExprTypeUnion | undefined,
		public readonly until: NodeLogicalExprTypeUnion | undefined,
		public readonly step: NodeAssignmentStmt | undefined,
		public readonly body: NodeStmtTypeUnion[]
	) {
		super(NodeType.NumericForStmt);
	}

	toString() {
		return `para ${this.initializer}${this.from ? ` de ${this.from}` : ""}${this.until ? ` até ${this.until}` : ""}${
			this.step ? ` opere ${this.step}` : ""
		} faça ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeIterativeForStmt extends Node {
	constructor(
		public readonly key: string,
		public readonly value: string,
		public readonly iterable: NodeExprTypeUnion,
		public readonly body: NodeStmtTypeUnion[]
	) {
		super(NodeType.IterativeForStmt);
	}
}

export class NodeFunctionDeclarationStmt extends Node {
	constructor(public readonly name: string, public readonly parameters: string[], public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.FunctionDeclarationStmt);
	}

	toString() {
		return `função ${this.name}(${this.parameters.join(", ")}) ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeAnonymousFunctionDeclarationStmt extends Node {
	constructor(public readonly parameters: string[], public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.AnonymousFunctionDeclarationStmt);
	}

	toString() {
		return `função(${this.parameters.join(", ")}) ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeIfStmt extends Node {
	constructor(
		public readonly condition: NodeLogicalExprTypeUnion,
		public readonly body: NodeStmtTypeUnion[],
		public readonly elseIfs: NodeElseIfStmt[],
		public readonly elseStmt?: NodeElseStmt
	) {
		super(NodeType.IfStmt);
	}

	toString() {
		return `se ${this.condition} faça ${this.body.map((stmt): string => stmt.toString()).join("\n")}${this.elseIfs
			?.map((stmt): string => stmt.toString())
			.join("\n")}\n${this.elseStmt?.toString()}`;
	}
}

export class NodeElseIfStmt extends Node {
	constructor(public readonly condition: NodeLogicalExprTypeUnion, public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.ElseIfStmt);
	}

	toString() {
		return `se ${this.condition} faça ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeElseStmt extends Node {
	constructor(public readonly body: NodeStmtTypeUnion[]) {
		super(NodeType.ElseStmt);
	}

	toString() {
		return `senão faça ${this.body.map((stmt): string => stmt.toString()).join("\n")}`;
	}
}

export class NodeObjectAccessor extends Node {
	constructor(public callee?: NodeExprTypeUnion) {
		super(NodeType.ObjectAccessor);
	}
}

export class NodeObjectFunctionAccessor extends NodeObjectAccessor {
	constructor(public readonly inputs: NodeExprTypeUnion[], callee?: NodeExprTypeUnion) {
		super(callee);
	}

	toString() {
		return `${this.callee != undefined ? `${this.callee}` : ""}(${this.inputs.map((input): string => input.toString()).join(", ")})`;
	}
}

export class NodeObjectPropertyAccessor extends NodeObjectAccessor {
	constructor(public readonly key: NodeExprTypeUnion, callee?: NodeExprTypeUnion) {
		super(callee);
	}

	toString() {
		return `${this.callee != undefined ? `${this.callee}.` : ""}${this.key}`;
	}
}

export class NodeBinaryExprOr extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprOr);
	}

	toString() {
		return `(${this.left} ou ${this.right})`;
	}
}

export class NodeBinaryExprAnd extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprAnd);
	}

	toString() {
		return `(${this.left} e ${this.right})`;
	}
}

export class NodeBinaryExprEqualTo extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprEqualTo);
	}

	toString() {
		return `(${this.left} == ${this.right})`;
	}
}

export class NodeBinaryExprNotEqualTo extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprNotEqualTo);
	}

	toString() {
		return `(${this.left} != ${this.right})`;
	}
}

export class NodeBinaryExprGreaterThan extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprGreaterThan);
	}

	toString() {
		return `(${this.left} > ${this.right})`;
	}
}

export class NodeBinaryExprGreaterEqualTo extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprGreaterEqualTo);
	}

	toString() {
		return `(${this.left} >= ${this.right})`;
	}
}

export class NodeBinaryExprLessThan extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprLessThan);
	}

	toString() {
		return `(${this.left} < ${this.right})`;
	}
}

export class NodeBinaryExprLessEqualTo extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprLessEqualTo);
	}

	toString() {
		return `(${this.left} <= ${this.right})`;
	}
}

export class NodeBinaryExprAdd extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprAdd);
	}

	toString() {
		return `(${this.left} + ${this.right})`;
	}
}

export class NodeBinaryExprSub extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprSub);
	}

	toString() {
		return `(${this.left} - ${this.right})`;
	}
}

export class NodeBinaryExprMul extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprMul);
	}

	toString() {
		return `(${this.left} * ${this.right})`;
	}
}

export class NodeBinaryExprDiv extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprDiv);
	}

	toString() {
		return `(${this.left} / ${this.right})`;
	}
}

export class NodeBinaryExprMod extends Node {
	constructor(public readonly left: NodeExprTypeUnion, public readonly right: NodeExprTypeUnion) {
		super(NodeType.BinaryExprMod);
	}

	toString() {
		return `(${this.left} % ${this.right})`;
	}
}

export class NodeUnaryNot extends Node {
	constructor(public readonly value: NodeExprTypeUnion) {
		super(NodeType.UnaryNot);
	}

	toString() {
		return `negar ${this.value}`;
	}
}

export class NodeNullLiteral extends Node {
	constructor() {
		super(NodeType.NullLiteral);
	}

	toString() {
		return "nulo";
	}
}

export class NodeNumberLiteral extends Node {
	constructor(public readonly value: number) {
		super(NodeType.NumberLiteral);
	}

	toString() {
		return this.value.toString();
	}
}

export class NodeBooleanLiteral extends Node {
	constructor(public readonly value: boolean) {
		super(NodeType.BooleanLiteral);
	}

	toString() {
		return this.value.toString();
	}
}

export class NodeStringLiteral extends Node {
	constructor(public readonly value: string) {
		super(NodeType.StringLiteral);
	}

	toString() {
		return `${this.value}`;
	}
}

export class NodeArrayLiteral extends Node {
	constructor(public readonly entries: NodeExprTypeUnion[]) {
		super(NodeType.ArrayLiteral);
	}

	toString() {
		return `[${this.entries.map((entry): string => entry.toString()).join(", ")}]`;
	}
}

export class NodeDictionaryLiteral extends Node {
	constructor(public readonly entries: { [key: string]: NodeExprTypeUnion }) {
		super(NodeType.DictionaryLiteral);
	}

	toString() {
		return `{${Object.entries(this.entries)
			.map(([key, value]): string => `${key}: ${value}`)
			.join(", ")}}`;
	}
}

export class NodeIdentifier extends Node {
	constructor(public readonly name: string) {
		super(NodeType.Identifier);
	}

	toString() {
		return this.name;
	}
}
