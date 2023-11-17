import {TwingSandboxSecurityNotAllowedFilterError} from "./security-not-allowed-filter-error";
import {TwingSandboxSecurityNotAllowedTagError} from "./security-not-allowed-tag-error";
import {TwingSandboxSecurityNotAllowedFunctionError} from "./security-not-allowed-function-error";
import {TwingSandboxSecurityNotAllowedPropertyError} from "./security-not-allowed-property-error";
import {TwingSandboxSecurityNotAllowedMethodError} from "./security-not-allowed-method-error";
import {isAMarkup, TwingMarkup} from "../markup";

export interface TwingSandboxSecurityPolicy {
    /**
     * @param {any | TwingMarkup} candidate
     * @param {string} method
     *
     * @throws TwingSandboxSecurityNotAllowedMethodError When the method is not allowed on the passed object
     */
    checkMethodAllowed(candidate: any | TwingMarkup, method: string): void;

    /**
     * @param {any} candidate
     * @param {string} property
     *
     * @throws TwingSandboxSecurityNotAllowedPropertyError When the property is not allowed on the passed object
     */
    checkPropertyAllowed(candidate: any | TwingMarkup, property: string): void;

    checkSecurity(tags: Array<string>, filters: Array<string>, functions: Array<string>): void;
}

export const createSandboxSecurityPolicy = (
    clearances?: {
        allowedTags?: Array<string>;
        allowedFilters?: Array<string>;
        allowedMethods?: Map<any, Array<string>>;
        allowedProperties?: Map<any, Array<string>>;
        allowedFunctions?: Array<string>;
    }
): TwingSandboxSecurityPolicy => {
    const allowedTags: Array<string> = clearances?.allowedTags || [];
    const allowedFilters: Array<string> = clearances?.allowedFilters || [];
    const allowedMethods: Map<any, Array<string>> = clearances?.allowedMethods || new Map();
    const allowedProperties: Map<any, Array<string>> = clearances?.allowedProperties || new Map();
    const allowedFunctions: Array<string> = clearances?.allowedFunctions || [];

    const policy: TwingSandboxSecurityPolicy = {
            checkMethodAllowed: (candidate, method) => {
                if (isAMarkup(candidate)) {
                    return;
                }

                let allowed = false;

                for (const [constructorName, methods] of allowedMethods) {
                    if (candidate instanceof constructorName) {
                        allowed = methods.includes(method);

                        break;
                    }
                }

                if (!allowed) {
                    const constructorName = candidate.constructor.name || '(anonymous)';
                    
                    throw new TwingSandboxSecurityNotAllowedMethodError(`Calling "${method}" method on an instance of ${constructorName} is not allowed.`);
                }
            },
            checkPropertyAllowed: (candidate, property) => {
                let allowed = false;

                for (let [objectConstructor, properties] of allowedProperties) {
                    if (candidate instanceof objectConstructor) {
                        allowed = properties.includes(property);

                        break;
                    }
                }

                if (!allowed) {
                    const constructorName = candidate.constructor.name || '(anonymous)';

                    throw new TwingSandboxSecurityNotAllowedPropertyError(`Calling "${property}" property on an instance of ${constructorName} is not allowed.`);
                }
            },
            checkSecurity: (tags, filters, functions) => {
                for (const tag of tags) {
                    if (!allowedTags.includes(tag)) {
                        throw new TwingSandboxSecurityNotAllowedTagError(`Tag "${tag}" is not allowed.`, tag);
                    }
                }

                for (const filterName of filters) {
                    if (!allowedFilters.includes(filterName)) {
                        throw new TwingSandboxSecurityNotAllowedFilterError(`Filter "${filterName}" is not allowed.`, filterName);
                    }
                }

                for (const function_ of functions) {
                    if (!allowedFunctions.includes(function_)) {
                        throw new TwingSandboxSecurityNotAllowedFunctionError(`Function "${function_}" is not allowed.`, function_);
                    }
                }
            }
        }
    ;

    return policy;
};
