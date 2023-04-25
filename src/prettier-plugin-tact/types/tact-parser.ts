
interface Node<T = string> {
    type: T;
    loc: Location;
}

export type AstNode =
    | Program
    | Comment
    | Initializer
    | GInitializer
    | Rule
    | StringLiteral
    | Literal
    | Delimiter
    | Expression
    | Variable
    | Constant
    | FunctionNode;

export type Location = {
    source?: string;
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
};

export interface Program extends Node<"Program"> {
    ginitializer: Initializer | undefined;
    initializer: GInitializer | undefined;
    rules: Rule[];
    comments: Comment[];
}

export interface Comment extends Node<"comment"> {
    value: string;
    multiline: boolean;
}

export interface Initializer extends Node<"initializer"> {
    code: string;
}
export interface GInitializer extends Node<"ginitializer"> {
    code: string;
}

export interface Rule extends Node<"rule"> {
    name: Identifier;
    displayName: StringLiteral;
    delimiter: Delimiter;
    expression: Expression;
}

type Identifier = string;

export interface StringLiteral extends Node<"stringliteral"> {
    value: string;
}
export interface Literal extends Node<"literal"> {
    value: string;
    ignoreCase: boolean;
}
export interface Delimiter extends Node<"delimiter"> {
    value: "=" | "/";
}

export type Expression =
    | ChoiceExpression
    | ActionExpression
    | SequenceExpression
    | LabeledExpression
    | PrefixedExpression
    | SuffixedExpression
    | PrimaryExpression;

export interface ChoiceExpression extends Node<"choice"> {
    alternatives: ActionExpression[];
    delimiters: Delimiter[];
}

export interface LabeledExpression extends Node<"labeled"> {
    label: Identifier;
    expression: Expression;
    pick?: boolean;
}

export interface PrefixedExpression
    extends Node<"text" | "simple_and" | "simple_not"> {
    expression: Expression;
}
export interface SuffixedExpression
    extends Node<"optional" | "zero_or_more" | "one_or_more"> {
    expression: Expression;
}

type PrimaryExpression =
    | Literal
    | CharacterClass
    | Node<"any">
    | RuleReference
    | SemanticPredicate
    | Group
    | RepeatedExpression;

export interface RepeatedExpression extends Node<"repeated"> {
    min: Constant | Variable | FunctionNode | null;
    max: Constant | Variable | FunctionNode | null;
    expression: PrimaryExpression;
    delimiter: Expression | null;
}

export interface CharacterClass extends Node<"class"> {
    parts: string[];
    inverted: boolean;
    ignoreCase: boolean;
}

export interface RuleReference extends Node<"rule_ref"> {
    name: Identifier;
}

export interface SemanticPredicate
    extends Node<"semantic_and" | "semantic_not"> {
    code: string;
}

export interface Group extends Node<"group"> {
    expression: Expression;
}

export interface ActionExpression extends Node<"action"> {
    expression: SequenceExpression | Expression;
    code: string;
}

export interface SequenceExpression extends Node<"sequence"> {
    elements: Expression[];
}

export interface Variable extends Node<"variable"> {
    value: Identifier;
}
export interface Constant extends Node<"constant"> {
    value: number | null;
}
export interface FunctionNode extends Node<"function"> {
    value: string;
}
