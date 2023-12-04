import type {TwingBaseNode} from "./node";
import type {TwingExpressionNode} from "./node/expression";

export type OperatorType =
    | 'BINARY'
    | 'UNARY'
    ;

export type OperatorAssociativity =
    | 'LEFT'
    | 'RIGHT'
    ;

type TwingOperatorExpressionFactory = (operands: [TwingBaseNode, TwingBaseNode], line: number, column: number) => TwingExpressionNode;

export interface TwingOperator {
    readonly name: string;

    readonly type: OperatorType;

    readonly precedence: number;

    readonly associativity: OperatorAssociativity | null;

    readonly specificationLevel: 2 | 3;

    readonly expressionFactory: TwingOperatorExpressionFactory;
}

export const createOperator = (
    name: string,
    type: OperatorType,
    precedence: number,
    expressionFactory: TwingOperatorExpressionFactory,
    associativity: OperatorAssociativity | null = null,
    specificationLevel: 2 | 3 = 2,
): TwingOperator => {
    associativity = type === "BINARY" ? (associativity || "LEFT") : null;

    return {
        get associativity() {
            return associativity;
        },
        get expressionFactory() {
            return expressionFactory;
        },
        get name() {
            return name;
        },
        get precedence() {
            return precedence;
        },
        get specificationLevel() {
            return specificationLevel;
        },
        get type() {
            return type;
        }
    };
};
