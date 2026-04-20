import {createFilter, createFunction, createSynchronousFilter, createSynchronousFunction} from "twing";
import type {TwingExtension, TwingSynchronousExtension} from "twing";
import {htmlClasses, htmlClassesSynchronously} from "./functions/html-classes";
import {htmlCva, htmlCvaSynchronously} from "./functions/html-cva";
import {htmlAttr, htmlAttrSynchronously} from "./functions/html-attr";
import {htmlAttrMergeFilter, htmlAttrMergeFilterSynchronously} from "./filters/html-attr-merge";
import {htmlAttrType, htmlAttrTypeSynchronously} from "./filters/html-attr-type";

export const packageName = "@toppynl/twing-html-extra";

export {Cva} from "./cva";
export {SeparatedTokenList} from "./html-attr/separated-token-list";
export {InlineStyle} from "./html-attr/inline-style";
export {isAttributeValue, isIterable, isMergeable} from "./html-attr/interfaces";
export type {AttributeValueInterface, MergeableInterface} from "./html-attr/interfaces";
export {escapeHtml, escapeHtmlAttrRelaxed} from "./html-attr/escape";
export {htmlAttrMerge} from "./html-attr/merge";

const cvaArguments = [
    {name: "base", defaultValue: []},
    {name: "variants", defaultValue: new Map()},
    {name: "compound_variants", defaultValue: []},
    {name: "default_variant", defaultValue: new Map()}
];

const attrTypeArguments = [
    {name: "value"},
    {name: "type", defaultValue: "sst"}
];

export const createHtmlExtraExtension = (): TwingExtension => ({
    filters: [
        createFilter("html_attr_merge", htmlAttrMergeFilter, [], {is_variadic: true}),
        createFilter("html_attr_type", htmlAttrType, attrTypeArguments)
    ],
    functions: [
        createFunction("html_classes", htmlClasses, [], {is_variadic: true}),
        createFunction("html_cva", htmlCva, cvaArguments),
        createFunction("html_attr", htmlAttr, [], {is_variadic: true})
    ],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});

export const createSynchronousHtmlExtraExtension = (): TwingSynchronousExtension => ({
    filters: [
        createSynchronousFilter("html_attr_merge", htmlAttrMergeFilterSynchronously, [], {is_variadic: true}),
        createSynchronousFilter("html_attr_type", htmlAttrTypeSynchronously, attrTypeArguments)
    ],
    functions: [
        createSynchronousFunction("html_classes", htmlClassesSynchronously, [], {is_variadic: true}),
        createSynchronousFunction("html_cva", htmlCvaSynchronously, cvaArguments),
        createSynchronousFunction("html_attr", htmlAttrSynchronously, [], {is_variadic: true})
    ],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});
