import {isAMapLike} from "./map-like";
import {createRuntimeError} from "../error/runtime";
import {examineObject} from "./examine-object";
import {isPlainObject} from "./is-plain-object";
import {get} from "./get";
import type {TwingGetAttributeCallType} from "../node/expression/attribute-accessor";
import {isBoolean, isFloat} from "./php";
import {TwingTemplate} from "../template";

const isObject = require('isobject');

/**
 * Returns the attribute value for a given array/object.
 *
 * @param {TwingTemplate} template
 * @param {*} object The object or array from where to get the item
 * @param {*} attribute The item to get from the array or object
 * @param {Map<any, any>} methodArguments A map of arguments to pass if the item is an object method
 * @param {string} type The type of attribute (@see Twig_Template constants)
 * @param {boolean} shouldTestExistence Whether this is only a defined check
 * @param {boolean} shouldIgnoreStrictCheck Whether to ignore the strict attribute check or not
 *
 * @return {Promise<any>} The attribute value, or a boolean when isDefinedTest is true, or null when the attribute is not set and ignoreStrictCheck is true
 *
 * @throw {TwingErrorRuntime} if the attribute does not exist and Twing is running in strict mode and isDefinedTest is false
 */
export const getAttribute = (
    template: TwingTemplate,
    object: any,
    attribute: any,
    methodArguments: Map<any, any>,
    type: TwingGetAttributeCallType,
    shouldTestExistence: boolean,
    shouldIgnoreStrictCheck: boolean | null,
    sandboxed: boolean
): Promise<any> => {
    shouldIgnoreStrictCheck = (shouldIgnoreStrictCheck === null) ? !template.isStrictVariables : shouldIgnoreStrictCheck;
    
    const _do = (): any => {
        let message: string;

        // ANY_CALL or ARRAY_CALL
        if (type !== "method") {
            let arrayItem;

            if (isBoolean(attribute)) {
                arrayItem = attribute ? 1 : 0;
            } else if (isFloat(attribute)) {
                arrayItem = parseInt(attribute);
            } else {
                arrayItem = attribute;
            }

            if (object) {
                if ((isAMapLike(object) && object.has(arrayItem)) || (isPlainObject(object) && Reflect.has(object, arrayItem))) {
                    if (shouldTestExistence) {
                        return true;
                    }

                    if (type !== "array" && sandboxed) {
                        template.checkPropertyAllowed(object, attribute);
                    }

                    return get(object, arrayItem);
                }
            }

            if ((type === "array") || (isAMapLike(object)) || (object === null) || (typeof object !== 'object')) {
                if (shouldTestExistence) {
                    return false;
                }

                if (shouldIgnoreStrictCheck) {
                    return;
                }

                if (isAMapLike(object)) {
                    if ((object as Map<any, any>).size < 1) {
                        message = `Index "${arrayItem}" is out of bounds as the array is empty.`;
                    } else {
                        message = `Index "${arrayItem}" is out of bounds for array [${[...(object as Map<any, any>).values()]}].`;
                    }
                } else if (type === "array") {
                    // object is another kind of object
                    if (object === null) {
                        message = `Impossible to access a key ("${attribute}") on a null variable.`;
                    } else {
                        message = `Impossible to access a key ("${attribute}") on a ${typeof object} variable ("${object.toString()}").`;
                    }
                } else if (object === null) {
                    // object is null
                    message = `Impossible to access an attribute ("${attribute}") on a null variable.`;
                } else {
                    // object is a primitive
                    message = `Impossible to access an attribute ("${attribute}") on a ${typeof object} variable ("${object}").`;
                }

                throw createRuntimeError(message);
            }
        }

        // ANY_CALL or METHOD_CALL
        if ((object === null) || (!isObject(object)) || (isAMapLike(object))) {
            if (shouldTestExistence) {
                return false;
            }

            if (shouldIgnoreStrictCheck) {
                return;
            }

            if (object === null) {
                message = `Impossible to invoke a method ("${attribute}") on a null variable.`;
            } else if (isAMapLike(object)) {
                message = `Impossible to invoke a method ("${attribute}") on an array.`;
            } else {
                message = `Impossible to invoke a method ("${attribute}") on a ${typeof object} variable ("${object}").`;
            }

            throw createRuntimeError(message);
        }

        // object property
        if (type !== "method") {
            if (Reflect.has(object, attribute) && (typeof object[attribute] !== 'function')) {
                if (shouldTestExistence) {
                    return true;
                }

                if (sandboxed) {
                    template.checkPropertyAllowed(object, attribute);
                }

                return get(object, attribute);
            }
        }

        // object method
        // precedence: getXxx() > isXxx() > hasXxx()
        let methods: Array<string> = [];

        for (let property of examineObject(object)) {
            let candidate = object[property];

            if (typeof candidate === 'function') {
                methods.push(property);
            }
        }

        methods.sort();

        let lcMethods: Array<string> = methods.map((method) => {
            return method.toLowerCase();
        });

        let candidates = new Map();

        for (let i = 0; i < methods.length; i++) {
            let method: string = methods[i];
            let lcName: string = lcMethods[i];

            candidates.set(method, method);
            candidates.set(lcName, method);

            let name: string = '';

            if (lcName[0] === 'g' && lcName.indexOf('get') === 0) {
                name = method.substr(3);
                lcName = lcName.substr(3);
            } else if (lcName[0] === 'i' && lcName.indexOf('is') === 0) {
                name = method.substr(2);
                lcName = lcName.substr(2);
            } else if (lcName[0] === 'h' && lcName.indexOf('has') === 0) {
                name = method.substr(3);
                lcName = lcName.substr(3);

                if (lcMethods.includes('is' + lcName)) {
                    continue;
                }
            } else {
                continue;
            }

            // skip get() and is() methods (in which case, name is empty)
            if (name.length > 0) {
                if (!candidates.has(name)) {
                    candidates.set(name, method);
                }

                if (!candidates.has(lcName)) {
                    candidates.set(lcName, method);
                }
            }
        }

        let itemAsString: string = attribute as string;
        let method: string;
        let lcItem: string;

        if (candidates.has(attribute)) {
            method = candidates.get(attribute);
        } else if (candidates.has(lcItem = itemAsString.toLowerCase())) {
            method = candidates.get(lcItem);
        } else {
            if (shouldTestExistence) {
                return false;
            }

            if (shouldIgnoreStrictCheck) {
                return;
            }

            throw createRuntimeError(`Neither the property "${attribute}" nor one of the methods ${attribute}()" or "get${attribute}()"/"is${attribute}()"/"has${attribute}()" exist and have public access in class "${object.constructor.name}".`);
        }

        if (shouldTestExistence) {
            return true;
        }

        if (sandboxed) {
            template.checkMethodAllowed(object, method);
        }

        return get(object, method).apply(object, [...methodArguments.values()]);
    };

    try {
        return Promise.resolve(_do());
    } catch (e) {
        return Promise.reject(e);
    }
};
