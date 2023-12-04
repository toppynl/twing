import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingTest} from "./test";
import {TwingOperator} from "./operator";

export interface TwingExtension {
    /**
     * Returns a list of filters to add to the existing list.
     *
     * @return Array<TwingFilter>
     */
    readonly filters: Array<TwingFilter>;
    
    /**
     * Returns a list of functions to add to the existing list.
     *
     * @return Array<TwingFunction>
     */
    readonly functions: Array<TwingFunction>;

    /**
     * Returns the node visitor instances to add to the existing list.
     *
     * @return Array<TwingNodeVisitor>
     */
    readonly nodeVisitors: Array<TwingNodeVisitor>;
    
    /**
     * Returns a list of operators to add to the existing list.
     *
     * @return TwingOperator[]
     */
    readonly operators: Array<TwingOperator>;
    
    /**
     * Returns the token parser instances to add to the existing list.
     *
     * @return Array<TwingTagHandler>
     */
    readonly tagHandlers: Array<TwingTagHandler>;
    
    /**
     * Returns a list of tests to add to the existing list.
     *
     * @returns Array<TwingTest>
     */
    readonly tests: Array<TwingTest>;
}
