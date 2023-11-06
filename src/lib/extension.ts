import {TwingExtensionInterface} from "./extension-interface";
import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingTest} from "./test";
import {TwingOperator} from "./operator";
import {TwingSourceMapNodeFactory} from "./source-map/node-factory";

export class TwingExtension implements TwingExtensionInterface {
    getTokenParsers(): Array<TwingTagHandler> {
        return [];
    }

    getNodeVisitors(): TwingNodeVisitor[] {
        return [];
    }

    getFilters(): TwingFilter[] {
        return [];
    }

    getTests(): TwingTest[] {
        return [];
    }

    getFunctions(): TwingFunction[] {
        return [];
    }

    getOperators(): Array<TwingOperator> {
        return [];
    }

    getSourceMapNodeFactories(): TwingSourceMapNodeFactory[] {
        return [];
    }
}
