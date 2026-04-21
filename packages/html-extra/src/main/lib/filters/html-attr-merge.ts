import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {htmlAttrMerge} from "../html-attr/merge";

export const htmlAttrMergeFilter: TwingCallable<unknown[], Map<string, unknown>> = async (_executionContext, ...arrays) => {
    return htmlAttrMerge(...arrays);
};

export const htmlAttrMergeFilterSynchronously: TwingSynchronousCallable<unknown[], Map<string, unknown>> = (_executionContext, ...arrays) => {
    return htmlAttrMerge(...arrays);
};
