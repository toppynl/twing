/* istanbul ignore file */

/**
 * # Twing
 *
 * First-class Twig engine for Node.js
 *
 * ## Philosophy behind Twing
 *
 * We believe that a first-class Twig engine should be able to render any template to the exact same result as the official PHP engine. That means that it should implement 100% of the syntax defined by the language specifications and that it should render that syntax using PHP logic.
 *
 * We also believe that a first-class Twig engine should be able to catch-up easily when Twig specifications evolve. Its code architecture and philosophy should then be as close as possible as the PHP implementation.
 *
 * Finally, we believe that a first-class Twig engine should allow users to build on their experience with TwigPHP and get support from the huge community that comes with it.
 *
 * That's what Twing is. A maintainability-first engine that pass 100% of the TwigPHP integration tests, is as close as possible to its code structure and expose an as-close-as-possible API.
 *
 * ## Prerequisites
 *
 * Twing needs at least **node.js 16.0.0** to run.
 *
 * ## Installation
 *
 * The recommended way to install Twing is via npm:
 *
 * ```shell
 * npm install twing --save
 * ```
 *
 * ## Basic API Usage
 *
 * ```typescript
 * import {createEnvironment, createArrayLoader} from "twing";
 *
 * const loader = createArrayLoader({
 *     'index.twig': 'Everybody loves {{ name }}!'
 * });
 *
 * const environment = createEnvironment(loader);
 *
 * environment.render('index.twig', {name: 'Twing'}).then((output) => {
 *     // output contains "Everybody loves Twing!"
 * });
 * ```
 *
 * ## Usage with Express
 *
 * Twing and Express work quite well together. Have a look at the [documentation](http://NightlyCommit.github.io/twing/intro.html#real-world-example-using-express) for an example of usage with Express.
 *
 * ## Browser support
 *
 * Starting with version 2.0.0, Twing can be used in web browsers with no compromise.
 *
 * ### Module bundler
 *
 * Module bundlers will automatically grab the browser-specific flavor of Twing when Twing module is imported. Either `const {TwingEnvironment} = require('twing');` or `import {TwingEnvironment} from 'twing';` will work in both node.js and the browser - once bundled in the latter case.
 *
 * ### Script tag
 *
 * Use [jsdelivr](https://www.jsdelivr.com/) CDN to include Twing in your HTML document:
 *
 * `<script src="https://cdn.jsdelivr.net/npm/twing/dist/lib.min.js"></script>`
 *
 * Once loaded by the browser, Twing is available under the global `Twing` variable.
 *
 * ## Twig specifications implementation
 *
 * Twing aims at implementing Twig specifications perfectly, without compromise. This is not an easy task due to the nature of Twig specifications: they don't exist officially and can only be deduced from the public documentation, the source code documentation and the test suite of the PHP reference implementation. It sometimes happens that something that was not part of either the documentations or the test suite suddenly becomes part of the specifications like the [`filter` tag](https://github.com/twigphp/Twig/issues/3091) or the [macros rework](https://github.com/twigphp/Twig/issues/3090) issues, putting Twing and all other non-reference implementations in the uncomfortable position of having to deal with a potential breaking change. Since Twig's team doesn't plan on releasing some official specifications for the language, we can't expect the problem to be solved anytime soon.
 *
 * Twing's strategy here is to stick strictly to Semantic Versioning rules and *never* introduce a breaking change into a minor version - its extensive test suite with 100% code coverage guarantees that. Twig teams's mistakes will be managed by either issuing a [known issue](#known-issues), if the mistake is trivial, or bumping to a new major version, if it is not.
 *
 * ### Compatibility chart
 *
 * Here is the compatibility chart between minor versions of Twing and Twig specifications levels, along with a summary of notable features provided by each Twig specifications level. Note that Twig minor versions don't always provide new language-related features (because of Twig's team perpetuating the confusion between Twig and their reference implementation, TwigPHP).
 *
 * |Twing version|Twig specifications level|Notable features|
 * |:---:|:---:|---|
 * |3.0|2.11|[Macros scoping](https://twig.symfony.com/doc/2.x/tags/macro.html#macros-scoping)|
 * |2.3|2.10|`spaceless`, `column`, `filter`, `map` and `reduce` filters, `apply` tag, `line whitespace trimming` whitespace control modifier|
 * |2.2|2.6|`deprecated` tag|
 * |1.3|2.5|`spaceless` and `block`-related deprecations|
 * |1.0|2.4|   |
 *
 * It is highly recommended to always use the latest version of Twing available as bug fixes will always target the latest version.
 *
 * ### Known issues
 *
 * You can find the list of known issues of Twing regarding Twig specifications implementation [here](http://NightlyCommit.github.io/twing/known_issues). Note that known issues are guaranteed to be addressed in the next major version bump of Twing.
 *
 * ## Related tools
 *
 * * [gulp-twing](https://www.npmjs.com/package/gulp-twing): Compile Twig templates with gulp. Build upon Twing.
 * * [twing-loader](https://www.npmjs.com/package/twing-loader): Webpack loader that compiles Twig templates using Twing.
 *
 * ## License
 *
 * Copyright © 2018 [Eric MORAND](https://github.com/ericmorand). Released under the [2-Clause BSD License](https://github.com/ericmorand/twing/blob/master/LICENSE).
 * 
 * ## API documentation
 * 
 * @packageDocumentation
 */
// cache
export type {TwingCache} from "./lib/cache";

export {createFilesystemCache} from "./lib/cache/filesystem";

// error
export type {TwingError} from "./lib/error";

export {isATwingError} from "./lib/error";
export {TwingBaseError} from "./lib/error/base";
export {TwingCompilationError, isACompilationError} from "./lib/error/compilation";
export {TwingTemplateLoadingError, isATemplateLoadingError} from "./lib/error/loader";
export {TwingRuntimeError, isARuntimeError} from "./lib/error/runtime";
export {TwingParsingError} from "./lib/error/parsing";

// loader
export type {TwingFilesystemLoader, TwingFilesystemLoaderFilesystem} from "./lib/loader/filesystem";
export type {
    TwingRelativeFilesystemLoader, TwingRelativeFilesystemLoaderFilesystem
} from "./lib/loader/relative-filesystem";
export type {TwingArrayLoader} from "./lib/loader/array";
export type {TwingChainLoader} from "./lib/loader/chain";
export type {TwingLoader} from "./lib/loader";

export {createFilesystemLoader} from "./lib/loader/filesystem";
export {createRelativeFilesystemLoader} from "./lib/loader/relative-filesystem";
export {createArrayLoader} from "./lib/loader/array";
export {createChainLoader} from "./lib/loader/chain";

// markup
export type {TwingMarkup} from "./lib/markup";

export {createMarkup, isAMarkup} from "./lib/markup";

// node
export type {TwingNodeAttributes, TwingNodeChildren, TwingNodeType} from "./lib/node";
export type {TwingAutoEscapeNode} from "./lib/node/auto-escape";
export type {TwingBlockNode} from "./lib/node/block";
export type {TwingBodyNode} from "./lib/node/body";
export type {TwingCheckSecurityNode} from "./lib/node/check-security";
export type {TwingCheckToStringNode} from "./lib/node/check-to-string";
export type {TwingCommentNode} from "./lib/node/comment";
export type {TwingDeprecatedNode} from "./lib/node/deprecated";
export type {TwingDoNode} from "./lib/node/do";
export type {TwingExpressionNode, TwingBaseExpressionNode} from "./lib/node/expression";
export type {TwingFlushNode} from "./lib/node/flush";
export type {TwingForNode} from "./lib/node/for";
export type {TwingForLoopNode} from "./lib/node/for-loop";
export type {TwingIfNode} from "./lib/node/if";
export type {TwingImportNode} from "./lib/node/import";
export type {TwingBaseIncludeNode} from "./lib/node/include";
export type {TwingLineNode} from "./lib/node/line";
export type {TwingMacroNode} from "./lib/node/macro";
export type {TwingModuleNode} from "./lib/node/module";
export type {TwingBaseOutputNode} from "./lib/node/output";
export type {TwingSandboxNode} from "./lib/node/sandbox";
export type {TwingSetNode} from "./lib/node/set";
export type {TwingTraitNode} from "./lib/node/trait";
export type {TwingWithNode} from "./lib/node/with";

export {createAutoEscapeNode} from "./lib/node/auto-escape";
export {createBlockNode} from "./lib/node/block";
export {createBodyNode} from "./lib/node/body";
export {createCheckSecurityNode} from "./lib/node/check-security";
export {createCheckToStringNode} from "./lib/node/check-to-string";
export {createCommentNode} from "./lib/node/comment";
export {createDeprecatedNode} from "./lib/node/deprecated";
export {createDoNode} from "./lib/node/do";
export {createFlushNode} from "./lib/node/flush";
export {createForNode} from "./lib/node/for";
export {createForLoopNode} from "./lib/node/for-loop";
export {createIfNode} from "./lib/node/if";
export {createImportNode} from "./lib/node/import";
export {createBaseIncludeNode} from "./lib/node/include";
export {createLineNode} from "./lib/node/line";
export {createMacroNode} from "./lib/node/macro";
export {createModuleNode} from "./lib/node/module";
export {createSandboxNode} from "./lib/node/sandbox";
export {createSetNode} from "./lib/node/set";
export {createTraitNode} from "./lib/node/trait";
export {createWithNode} from "./lib/node/with";

// node/expression
export type {TwingBaseArrayNode, TwingArrayNode} from "./lib/node/expression/array";
export type {TwingArrowFunctionNode} from "./lib/node/expression/arrow-function";
export type {TwingAssignmentNode} from "./lib/node/expression/assignment";
export type {TwingAttributeAccessorNode} from "./lib/node/expression/attribute-accessor";
export type {TwingBaseBinaryNode, TwingBinaryNode} from "./lib/node/expression/binary";
export type {TwingBlockFunctionNode} from "./lib/node/expression/block-function";
export type {TwingBaseCallNode, TwingCallNode} from "./lib/node/expression/call";
export type {TwingBaseConditionalNode, TwingConditionalNode} from "./lib/node/expression/conditional";
export type {TwingConstantNode} from "./lib/node/expression/constant";
export type {TwingEscapeNode} from "./lib/node/expression/escape";
export type {TwingHashNode} from "./lib/node/expression/hash";
export type {TwingMethodCallNode} from "./lib/node/expression/method-call";
export type {TwingNameNode} from "./lib/node/expression/name";
export type {TwingNullishCoalescingNode} from "./lib/node/expression/nullish-coalescing";
export type {TwingParentFunctionNode} from "./lib/node/expression/parent-function";
export type {TwingTemporaryNameNode} from "./lib/node/expression/temporary-name";
export type {TwingBaseUnaryNode, TwingUnaryNode} from "./lib/node/expression/unary";

export {createBaseArrayNode, createArrayNode} from "./lib/node/expression/array";
export {createArrowFunctionNode} from "./lib/node/expression/arrow-function";
export {createAssignmentNode, assignmentNodeType} from "./lib/node/expression/assignment";
export {createAttributeAccessorNode} from "./lib/node/expression/attribute-accessor";
export {createBaseBinaryNode} from "./lib/node/expression/binary";
export {createBlockFunctionNode} from "./lib/node/expression/block-function";
export {createBaseCallNode} from "./lib/node/expression/call";
export {createBaseConditionalNode, createConditionalNode, conditionalNodeType} from "./lib/node/expression/conditional";
export {createConstantNode} from "./lib/node/expression/constant";
export {createEscapeNode} from "./lib/node/expression/escape";
export {createHashNode, hashNodeType} from "./lib/node/expression/hash";
export {createMethodCallNode, methodCallNodeType} from "./lib/node/expression/method-call";
export {createNameNode, nameNodeType} from "./lib/node/expression/name";
export {createNullishCoalescingNode, nullishCoalescingNodeType} from "./lib/node/expression/nullish-coalescing";
export {createParentFunctionNode, parentFunctionNodeType} from "./lib/node/expression/parent-function";
export {createTemporaryNameNode, temporaryNameNodeType} from "./lib/node/expression/temporary-name";
export {createBaseUnaryNode} from "./lib/node/expression/unary";

// node/expression/binary
export type {TwingAddNode} from "./lib/node/expression/binary/add";
export type {TwingAndNode} from "./lib/node/expression/binary/and";
export type {TwingBitwiseAndNode} from "./lib/node/expression/binary/bitwise-and";
export type {TwingBitwiseOrNode} from "./lib/node/expression/binary/bitwise-or";
export type {TwingBitwiseXorNode} from "./lib/node/expression/binary/bitwise-xor";
export type {TwingConcatenateNode} from "./lib/node/expression/binary/concatenate";
export type {TwingDivideAndFloorNode} from "./lib/node/expression/binary/divide-and-floor";
export type {TwingDivideNode} from "./lib/node/expression/binary/divide";
export type {TwingEndsWithNode} from "./lib/node/expression/binary/ends-with";
export type {TwingIsEqualToNode} from "./lib/node/expression/binary/is-equal-to";
export type {TwingIsGreaterThanOrEqualToNode} from "./lib/node/expression/binary/is-greater-than-or-equal-to";
export type {TwingIsGreaterThanNode} from "./lib/node/expression/binary/is-greater-than";
export type {TwingIsInNode} from "./lib/node/expression/binary/is-in";
export type {TwingIsLessThanOrEqualToNode} from "./lib/node/expression/binary/is-less-than-or-equal-to";
export type {TwingIsLessThanNode} from "./lib/node/expression/binary/is-less-than";
export type {TwingIsNotEqualToNode} from "./lib/node/expression/binary/is-not-equal-to";
export type {TwingIsNotInNode} from "./lib/node/expression/binary/is-not-in";
export type {TwingMatchesNode} from "./lib/node/expression/binary/matches";
export type {TwingModuloNode} from "./lib/node/expression/binary/modulo";
export type {TwingMultiplyNode} from "./lib/node/expression/binary/multiply";
export type {TwingOrNode} from "./lib/node/expression/binary/or";
export type {TwingPowerNode} from "./lib/node/expression/binary/power";
export type {TwingRangeNode} from "./lib/node/expression/binary/range";
export type {TwingStartsWithNode} from "./lib/node/expression/binary/starts-with";
export type {TwingSubtractNode} from "./lib/node/expression/binary/subtract";

export {createAddNode, addNodeType} from "./lib/node/expression/binary/add";
export {createAndNode, andNodeType} from "./lib/node/expression/binary/and";
export {createBitwiseAndNode, bitwiseAndNodeType} from "./lib/node/expression/binary/bitwise-and";
export {createBitwiseOrNode, bitwiseOrNodeType} from "./lib/node/expression/binary/bitwise-or";
export {createBitwiseXorNode, bitwiseXorNodeType} from "./lib/node/expression/binary/bitwise-xor";
export {createConcatenateNode, concatenateNodeTYpe} from "./lib/node/expression/binary/concatenate";
export {createDivideAndFloorNode, divideAndFloorNodeType} from "./lib/node/expression/binary/divide-and-floor";
export {createDivideNode, divideNodeType} from "./lib/node/expression/binary/divide";
export {createEndsWithNode} from "./lib/node/expression/binary/ends-with";
export {createIsEqualNode} from "./lib/node/expression/binary/is-equal-to";
export {createIsGreaterThanNode} from "./lib/node/expression/binary/is-greater-than";
export {createIsGreaterThanOrEqualToNode} from "./lib/node/expression/binary/is-greater-than-or-equal-to";
export {createIsInNode} from "./lib/node/expression/binary/is-in";
export {createIsLessThanNode} from "./lib/node/expression/binary/is-less-than";
export {createIsLessThanOrEqualToNode} from "./lib/node/expression/binary/is-less-than-or-equal-to";
export {createIsNotEqualToNode} from "./lib/node/expression/binary/is-not-equal-to";
export {createIsNotInNode} from "./lib/node/expression/binary/is-not-in";
export {createMatchesNode} from "./lib/node/expression/binary/matches";
export {createModuloNode} from "./lib/node/expression/binary/modulo";
export {createMultiplyNode} from "./lib/node/expression/binary/multiply";
export {createOrNode} from "./lib/node/expression/binary/or";
export {createPowerNode} from "./lib/node/expression/binary/power";
export {createRangeNode} from "./lib/node/expression/binary/range";
export {createStartsWithNode} from "./lib/node/expression/binary/starts-with";
export {createSubtractNode} from "./lib/node/expression/binary/subtract";

// node/expression/call
export type {TwingFilterNode} from "./lib/node/expression/call/filter";
export type {TwingFunctionNode} from "./lib/node/expression/call/function";
export type {TwingTestNode} from "./lib/node/expression/call/test";

export {createFilterNode, filterNodeType} from "./lib/node/expression/call/filter";
export {createFunctionNode, functionNodeType} from "./lib/node/expression/call/function";
export {createTestNode, testNodeType} from "./lib/node/expression/call/test";

// node/expression/unary
export type {TwingNegativeNode} from "./lib/node/expression/unary/neg";
export type {TwingNotNode} from "./lib/node/expression/unary/not";
export type {TwingPositiveNode} from "./lib/node/expression/unary/pos";

export {createNegativeNode, negativeNodeType} from "./lib/node/expression/unary/neg";
export {createNotNode, notNodeType} from "./lib/node/expression/unary/not";
export {createPositiveNode, positiveNodeType} from "./lib/node/expression/unary/pos";

// node/include
export type {TwingEmbedNode} from "./lib/node/include/embed";
export type {TwingIncludeNode} from "./lib/node/include/include";

export {createEmbedNode, embedNodeType} from "./lib/node/include/embed";
export {createIncludeNode, includeNodeType} from "./lib/node/include/include";

// node/output
export type {TwingBlockReferenceNode} from "./lib/node/output/block-reference";
export type {TwingInlinePrintNode} from "./lib/node/output/inline-print";
export type {TwingPrintNode} from "./lib/node/output/print";
export type {TwingSpacelessNode} from "./lib/node/output/spaceless";
export type {TwingTextNode} from "./lib/node/output/text";
export type {TwingVerbatimNode} from "./lib/node/output/verbatim";

export {createBlockReferenceNode, blockReferenceType} from "./lib/node/output/block-reference";
export {createInlinePrintNode, inlinePrintNodeType} from "./lib/node/output/inline-print";
export {createPrintNode, printNodeTYpe} from "./lib/node/output/print";
export {createSpacelessNode, spacelessNodeType} from "./lib/node/output/spaceless";
export {createTextNode, textNodeType} from "./lib/node/output/text";
export {createVerbatimNode, verbatimNodeType} from "./lib/node/output/verbatim";

// tag handlers
export type {TwingTagHandler, TwingTokenParser} from "./lib/tag-handler";

export {createApplyTagHandler} from "./lib/tag-handler/apply";
export {createAutoEscapeTagHandler} from "./lib/tag-handler/auto-escape";
export {createBlockTagHandler} from "./lib/tag-handler/block";
export {createDeprecatedTagHandler} from "./lib/tag-handler/deprecated";
export {createDoTagHandler} from "./lib/tag-handler/do";
export {createEmbedTagHandler} from "./lib/tag-handler/embed";
export {createExtendsTagHandler} from "./lib/tag-handler/extends";
export {createFilterTagHandler} from "./lib/tag-handler/filter";
export {createFlushTagHandler} from "./lib/tag-handler/flush";
export {createForTagHandler} from "./lib/tag-handler/for";
export {createFromTagHandler} from "./lib/tag-handler/from";
export {createIfTagHandler} from "./lib/tag-handler/if";
export {createImportTagHandler} from "./lib/tag-handler/import";
export {createIncludeTagHandler} from "./lib/tag-handler/include";
export {createLineTagHandler} from "./lib/tag-handler/line";
export {createMacroTagHandler} from "./lib/tag-handler/macro";
export {createSandboxTagHandler} from "./lib/tag-handler/sandbox";
export {createSetTagHandler} from "./lib/tag-handler/set";
export {createSpacelessTagHandler} from "./lib/tag-handler/spaceless";
export {createUseTagHandler} from "./lib/tag-handler/use";
export {createVerbatimTagHandler} from "./lib/tag-handler/verbatim";
export {createWithTagHandler} from "./lib/tag-handler/with";

// core
export type {TwingCompiler} from "./lib/compiler";
export type {TwingEnvironment, TwingEnvironmentOptions} from "./lib/environment";
export type {TwingExtension} from "./lib/extension";
export type {TwingExtensionSet} from "./lib/extension-set";
export type {TwingFilter} from "./lib/filter";
export type {TwingFunction} from "./lib/function";
export type {TwingNodeVisitor} from "./lib/node-visitor";
export type {TwingOperator} from "./lib/operator";
export type {TwingRuntime, TwingRuntimeOptions, TwingNumberFormat} from "./lib/runtime";
export type {TwingSandboxSecurityPolicy} from "./lib/sandbox/security-policy";
export type {TwingSandboxSecurityNotAllowedFilterError} from "./lib/sandbox/security-not-allowed-filter-error";
export type {TwingSandboxSecurityNotAllowedFunctionError} from "./lib/sandbox/security-not-allowed-function-error";
export type {TwingSandboxSecurityNotAllowedMethodError} from "./lib/sandbox/security-not-allowed-method-error";
export type {TwingSandboxSecurityNotAllowedPropertyError} from "./lib/sandbox/security-not-allowed-property-error";
export type {TwingSandboxSecurityNotAllowedTagError} from "./lib/sandbox/security-not-allowed-tag-error";
export type {TwingSource} from "./lib/source";
export type {TwingTemplate} from "./lib/template";
export type {TwingTest} from "./lib/test";
export type {TwingTokenStream} from "./lib/token-stream";

export {createEnvironment} from "./lib/environment";
export {createExtensionSet} from "./lib/extension-set";
export {createFilter} from "./lib/filter";
export {createFunction} from "./lib/function";
export {createOperator} from "./lib/operator";
export {createRuntime} from "./lib/runtime";
export {createSandboxSecurityPolicy} from "./lib/sandbox/security-policy";
export {createSource} from "./lib/source";
export {createSourceMapRuntime} from "./lib/source-map-runtime";
export {createTemplate} from "./lib/template";
export {createTest} from "./lib/test";

/**
 * Bootm
 * 
 * @packagedocumentation
 */
