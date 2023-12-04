import type {TwingExtension} from "../extension";
import {createAndNode} from "../node/expression/binary/and";
import {createIsInNode} from "../node/expression/binary/is-in";
import {createIsGreaterThanNode} from "../node/expression/binary/is-greater-than";
import {createIsLessThanNode} from "../node/expression/binary/is-less-than";
import {createNotNode} from "../node/expression/unary/not";
import {createNegativeNode} from "../node/expression/unary/negative";
import {createPositiveNode} from "../node/expression/unary/positive";
import {createFunction} from "../function";
import {createConcatenateNode} from "../node/expression/binary/concatenate";
import {createMultiplyNode} from "../node/expression/binary/multiply";
import {createDivideNode} from "../node/expression/binary/divide";
import {createDivideAndFloorNode} from "../node/expression/binary/divide-and-floor";
import {createModuloNode} from "../node/expression/binary/modulo";
import {createSubtractNode} from "../node/expression/binary/subtract";
import {createAddNode} from "../node/expression/binary/add";
import {createRangeNode} from "../node/expression/binary/range";
import {createIsEqualNode} from "../node/expression/binary/is-equal-to";
import {createIsNotEqualToNode} from "../node/expression/binary/is-not-equal-to";
import {createOrNode} from "../node/expression/binary/or";
import {createBitwiseOrNode} from "../node/expression/binary/bitwise-or";
import {createBitwiseXorNode} from "../node/expression/binary/bitwise-xor";
import {createBitwiseAndNode} from "../node/expression/binary/bitwise-and";
import {createIsGreaterThanOrEqualToNode} from "../node/expression/binary/is-greater-than-or-equal-to";
import {createIsLessThanOrEqualToNode} from "../node/expression/binary/is-less-than-or-equal-to";
import {createIsNotInNode} from "../node/expression/binary/is-not-in";
import {createNullishCoalescingNode} from "../node/expression/nullish-coalescing";
import {TwingBaseExpressionNode} from "../node/expression";
import {createPowerNode} from "../node/expression/binary/power";
import {createTest} from "../test";
import {createMatchesNode} from "../node/expression/binary/matches";
import {createStartsWithNode} from "../node/expression/binary/starts-with";
import {createEndsWithNode} from "../node/expression/binary/ends-with";
import {createFilter} from "../filter";
import {createOperator} from "../operator";
import {isEven} from "./core/tests/is-even";
import {isOdd} from "./core/tests/is-odd";
import {isSameAs} from "./core/tests/is-same-as";
import {isNull} from "./core/tests/is-null";
import {isDivisibleBy} from "./core/tests/is-divisible-by";
import {min} from "./core/functions/min";
import {max} from "./core/functions/max";
import {date} from "./core/filters/date";
import {dateModify} from "./core/filters/date-modify";
import {format} from "./core/filters/format";
import {replace} from "./core/filters/replace";
import {numberFormat} from "./core/filters/number_format";
import {abs} from "./core/filters/abs";
import {url_encode} from "./core/filters/url_encode";
import {jsonEncode} from "./core/filters/json-encode";
import {convertEncoding} from "./core/filters/convert-encoding";
import {title} from "./core/filters/title";
import {capitalize} from "./core/filters/capitalize";
import {upper} from "./core/filters/upper";
import {lower} from "./core/filters/lower";
import {striptags} from "./core/filters/striptags";
import {trim} from "./core/filters/trim";
import {nl2br} from "./core/filters/nl2br";
import {raw} from "./core/filters/raw";
import {join} from "./core/filters/join";
import {split} from "./core/filters/split";
import {sort} from "./core/filters/sort";
import {merge as mergeFilter} from "./core/filters/merge";
import {batch} from "./core/filters/batch";
import {reverse as reverseFilter} from "./core/filters/reverse";
import {length} from "./core/filters/length";
import {slice as sliceFilter} from "./core/filters/slice";
import {first as firstFilter} from "./core/filters/first";
import {last} from "./core/filters/last";
import {defaultFilter} from "./core/filters/default";
import {escape} from "./core/filters/escape";
import {round} from "./core/filters/round";
import {include} from "./core/functions/include";
import {keys} from "./core/filters/keys";
import {spaceless} from "./core/filters/spaceless";
import {column} from "./core/filters/column";
import {filter} from "./core/filters/filter";
import {map} from "./core/filters/map";
import {reduce} from "./core/filters/reduce";
import {range} from "./core/functions/range";
import {constant} from "./core/functions/constant";
import {cycle} from "./core/functions/cycle";
import {random} from "./core/functions/random";
import {source} from "./core/functions/source";
import {templateFromString} from "./core/functions/template-from-string";
import {dump} from "./core/functions/dump";
import {isEmpty} from "./core/tests/is-empty";
import {isIterable} from "./core/tests/is-iterable";
import {date as dateFunction} from "./core/functions/date";
import {isDefined} from "./core/tests/is-defined";
import {isConstant} from "./core/tests/is-constant";
import {createSpaceshipNode} from "../node/expression/binary/spaceship";
import {createHasEveryNode} from "../node/expression/binary/has-every";
import {createHasSomeNode} from "../node/expression/binary/has-some";

export const createCoreExtension = (): TwingExtension => {
    return {
        get filters() {
            const escapeFilters = ['escape', 'e'].map((name) => {
                return createFilter(name, escape, [
                    {
                        name: 'strategy',
                        defaultValue: null
                    },
                    {
                        name: 'charset',
                        defaultValue: null
                    }
                ]);
            });

            return [
                ...escapeFilters,
                createFilter('abs', abs, []),
                createFilter('batch', batch, [
                    {
                        name: 'size'
                    },
                    {
                        name: 'fill',
                        defaultValue: null
                    },
                    {
                        name: 'preserve_keys',
                        defaultValue: true
                    }
                ]),
                createFilter('capitalize', capitalize, []),
                createFilter('column', column, [
                    {
                        name: 'name'
                    }
                ]),
                createFilter('convert_encoding', convertEncoding, [
                    {
                        name: 'to'
                    },
                    {
                        name: 'from'
                    }
                ]),
                createFilter('date', date, [
                    {
                        name: 'format',
                        defaultValue: null
                    },
                    {
                        name: 'timezone',
                        defaultValue: null
                    }
                ]),
                createFilter('date_modify', dateModify, [
                    {
                        name: 'modifier'
                    }
                ]),
                createFilter('default', defaultFilter, [
                    {
                        name: 'default',
                        defaultValue: null
                    }
                ]),
                createFilter('filter', filter, [
                    {
                        name: 'array'
                    },
                    {
                        name: 'arrow',
                        defaultValue: null
                    }
                ]),
                createFilter('first', firstFilter, []),
                createFilter('format', format, [], {
                    is_variadic: true
                }),
                createFilter('join', join, [
                    {
                        name: 'glue',
                        defaultValue: ''
                    },
                    {
                        name: 'and',
                        defaultValue: null
                    }
                ]),
                createFilter('json_encode', jsonEncode, [
                    {
                        name: 'options',
                        defaultValue: null
                    }
                ]),
                createFilter('keys', keys, []),
                createFilter('last', last, []),
                createFilter('length', length, []),
                createFilter('lower', lower, []),
                createFilter('map', map, [
                    {
                        name: 'arrow'
                    }
                ]),
                createFilter('merge', mergeFilter, [
                    {
                        name: 'source'
                    }
                ]),
                createFilter('nl2br', nl2br, []),
                createFilter('number_format', numberFormat, [
                    {
                        name: 'decimal',
                        defaultValue: null
                    },
                    {
                        name: 'decimal_point',
                        defaultValue: null
                    },
                    {
                        name: 'thousand_sep',
                        defaultValue: null
                    }
                ]),
                createFilter('raw', raw, []),
                createFilter('reduce', reduce, [
                    {
                        name: 'arrow'
                    },
                    {
                        name: 'initial',
                        defaultValue: null
                    }
                ]),
                createFilter('replace', replace, [
                    {
                        name: 'from'
                    }
                ]),
                createFilter('reverse', reverseFilter, [
                    {
                        name: 'preserve_keys',
                        defaultValue: false
                    }
                ]),
                createFilter('round', round, [
                    {
                        name: 'precision',
                        defaultValue: 0
                    },
                    {
                        name: 'method',
                        defaultValue: 'common'
                    }
                ]),
                createFilter('slice', sliceFilter, [
                    {
                        name: 'start'
                    },
                    {
                        name: 'length',
                        defaultValue: null
                    },
                    {
                        name: 'preserve_keys',
                        defaultValue: false
                    }
                ]),
                createFilter('sort', sort, [{
                    name: 'arrow',
                    defaultValue: null
                }]),
                createFilter('spaceless', spaceless, []),
                createFilter('split', split, [
                    {
                        name: 'delimiter'
                    },
                    {
                        name: 'limit',
                        defaultValue: null
                    }
                ]),
                createFilter('striptags', striptags, [
                    {
                        name: 'allowable_tags',
                        defaultValue: ''
                    }
                ]),
                createFilter('title', title, []),
                createFilter('trim', trim, [
                    {
                        name: 'character_mask',
                        defaultValue: null
                    },
                    {
                        name: 'side',
                        defaultValue: 'both'
                    }
                ]),
                createFilter('upper', upper, []),
                createFilter('url_encode', url_encode, []),
            ];
        },
        get functions() {
            return [
                createFunction('constant', constant, [
                    {name: 'name'},
                    {name: 'object', defaultValue: null}
                ]),
                createFunction('cycle', cycle, [
                    {
                        name: 'values'
                    },
                    {
                        name: 'position'
                    }
                ]),
                createFunction('date', dateFunction, [
                    {
                        name: 'date',
                        defaultValue: null
                    },
                    {
                        name: 'timezone',
                        defaultValue: null
                    }
                ]),
                createFunction('dump', dump, [], {
                    is_variadic: true
                }),
                createFunction('include', include, [
                    {
                        name: 'template'
                    },
                    {
                        name: 'variables',
                        defaultValue: {}
                    },
                    {
                        name: 'with_context',
                        defaultValue: true
                    },
                    {
                        name: 'ignore_missing',
                        defaultValue: false
                    },
                    {
                        name: 'sandboxed',
                        defaultValue: false
                    }
                ]),
                createFunction('max', max, [], {
                    is_variadic: true
                }),
                createFunction('min', min, [], {
                    is_variadic: true
                }),
                createFunction('random', random, [
                    {
                        name: 'values',
                        defaultValue: null
                    },
                    {
                        name: 'max',
                        defaultValue: null
                    }
                ]),
                createFunction('range', range, [
                    {
                        name: 'low'
                    },
                    {
                        name: 'high'
                    },
                    {
                        name: 'step',
                        defaultValue: 1
                    }
                ]),
                createFunction('source', source, [
                    {
                        name: 'name'
                    },
                    {
                        name: 'ignore_missing',
                        defaultValue: false
                    }
                ]),
                createFunction('template_from_string', templateFromString, [
                    {
                        name: 'template'
                    },
                    {
                        name: 'name',
                        defaultValue: null
                    }
                ])
            ];
        },
        get nodeVisitors() {
            return [];
        },
        get operators() {
            return [
                createOperator('not', "UNARY", 50, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createNotNode(operands[0], line, column);
                }),
                createOperator('-', "UNARY", 500, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createNegativeNode(operands[0], line, column);
                }),
                createOperator('+', "UNARY", 500, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createPositiveNode(operands[0], line, column);
                }),
                createOperator('or', "BINARY", 10, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createOrNode(operands, line, column);
                }),
                createOperator('and', "BINARY", 15, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createAndNode(operands, line, column);
                }),
                createOperator('b-or', "BINARY", 16, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createBitwiseOrNode(operands, line, column);
                }),
                createOperator('b-xor', "BINARY", 17, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createBitwiseXorNode(operands, line, column);
                }),
                createOperator('b-and', "BINARY", 18, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createBitwiseAndNode(operands, line, column);
                }),
                createOperator('==', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsEqualNode(operands, line, column);
                }),
                createOperator('!=', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsNotEqualToNode(operands, line, column);
                }),
                createOperator('<=>', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createSpaceshipNode(operands, line, column);
                }),
                createOperator('<', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsLessThanNode(operands, line, column);
                }),
                createOperator('<=', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsLessThanOrEqualToNode(operands, line, column);
                }),
                createOperator('>', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsGreaterThanNode(operands, line, column);
                }),
                createOperator('>=', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsGreaterThanOrEqualToNode(operands, line, column);
                }),
                createOperator('not in', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsNotInNode(operands, line, column);
                }),
                createOperator('in', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createIsInNode(operands, line, column);
                }),
                createOperator('matches', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createMatchesNode(operands, line, column);
                }),
                createOperator('starts with', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createStartsWithNode(operands, line, column);
                }),
                createOperator('ends with', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createEndsWithNode(operands, line, column);
                }),
                createOperator('has some', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createHasSomeNode(operands, line, column);
                }, "LEFT", 3),
                createOperator('has every', "BINARY", 20, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createHasEveryNode(operands, line, column);
                }, "LEFT", 3),
                createOperator('..', "BINARY", 25, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createRangeNode(operands, line, column);
                }),
                createOperator('+', "BINARY", 30, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createAddNode(operands, line, column);
                }),
                createOperator('-', "BINARY", 30, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createSubtractNode(operands, line, column);
                }),
                createOperator('~', "BINARY", 40, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createConcatenateNode(operands, line, column);
                }),
                createOperator('*', "BINARY", 60, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createMultiplyNode(operands, line, column);
                }),
                createOperator('/', "BINARY", 60, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createDivideNode(operands, line, column);
                }),
                createOperator('//', "BINARY", 60, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createDivideAndFloorNode(operands, line, column);
                }),
                createOperator('%', "BINARY", 60, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createModuloNode(operands, line, column);
                }),
                createOperator('**', "BINARY", 200, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createPowerNode(operands, line, column);
                }, "RIGHT"),
                createOperator('??', "BINARY", 300, (operands: [TwingBaseExpressionNode, TwingBaseExpressionNode], line: number, column: number) => {
                    return createNullishCoalescingNode(operands, line, column);
                }, "RIGHT")
            ];
        },
        get tagHandlers() {
            return [];
        },
        get tests() {
            return [
                createTest('constant', isConstant, [
                    {
                        name: 'constant'
                    },
                    {
                        name: 'object',
                        defaultValue: null
                    }
                ]),
                createTest('divisible by', isDivisibleBy, [
                    {
                        name: 'divisor'
                    }
                ]),
                createTest('defined', isDefined, []),
                createTest('empty', isEmpty, []),
                createTest('even', isEven, []),
                createTest('iterable', isIterable, []),
                createTest('none', isNull, []),
                createTest('null', isNull, []),
                createTest('odd', isOdd, []),
                createTest('same as', isSameAs, [
                    {
                        name: 'comparand'
                    }
                ]),
            ];
        }
    };
};
