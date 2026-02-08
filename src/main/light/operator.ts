import type {TwingBaseNode} from "./node";
import type {TwingExpressionNode} from "./node/expression";

export type TwingOperatorType =
    | 'BINARY'
    | 'UNARY'
    ;

export type TwingOperatorAssociativity =
    | 'LEFT'
    | 'RIGHT'
    ;

export type TwingOperatorExpressionFactory = (operands: [TwingBaseNode, TwingBaseNode], line: number, column: number) => TwingExpressionNode;

export interface TwingOperator {
    readonly name: string;

    readonly type: TwingOperatorType;

    readonly precedence: number;

    readonly associativity: TwingOperatorAssociativity | null;

    readonly specificationLevel: 2 | 3;

    readonly expressionFactory: TwingOperatorExpressionFactory;
}

export const createOperator = (
    name: string,
    type: TwingOperatorType,
    precedence: number,
    expressionFactory: TwingOperatorExpressionFactory,
    associativity: TwingOperatorAssociativity | null = null,
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
