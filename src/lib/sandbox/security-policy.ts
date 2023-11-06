import {TwingSandboxSecurityPolicyInterface} from "./security-policy-interface";
import {TwingSandboxSecurityNotAllowedFilterError} from "./security-not-allowed-filter-error";
import {TwingSandboxSecurityNotAllowedTagError} from "./security-not-allowed-tag-error";
import {TwingSandboxSecurityNotAllowedFunctionError} from "./security-not-allowed-function-error";
import {TwingSandboxSecurityNotAllowedPropertyError} from "./security-not-allowed-property-error";
import {TwingSandboxSecurityNotAllowedMethodError} from "./security-not-allowed-method-error";
import {isAMarkup, TwingMarkup} from "../markup";

export class TwingSandboxSecurityPolicy implements TwingSandboxSecurityPolicyInterface {
    TwingSandboxSecurityPolicyInterfaceImpl: TwingSandboxSecurityPolicyInterface;

    private allowedTags: Array<string>;
    private allowedFilters: Array<string>;
    private allowedMethods: Map<ObjectConstructor, Array<string>>;
    private allowedProperties: Map<ObjectConstructor, string>;
    private allowedFunctions: Array<string>;

    constructor(
        allowedTags: Array<string> = [],
        allowedFilters: Array<string> = [],
        allowedMethods: Map<any, string> = new Map(),
        allowedProperties: Map<any, string> = new Map(),
        allowedFunctions: Array<string> = []
    ) {
        this.TwingSandboxSecurityPolicyInterfaceImpl = this;
        this.allowedTags = allowedTags;
        this.allowedFilters = allowedFilters;
        this.allowedMethods = new Map();

        for (const [class_, m] of allowedMethods) {
            this.allowedMethods.set(class_, (Array.isArray(m) ? m : [m]).map(function (item) {
                return item.toLowerCase();
            }));
        }
        
        this.allowedProperties = allowedProperties;
        this.allowedFunctions = allowedFunctions;
    }

    setAllowedTags(tags: Array<string>) {
        this.allowedTags = tags;
    }

    setAllowedFilters(filters: Array<string>) {
        this.allowedFilters = filters;
    }

    setAllowedProperties(properties: Map<any, string>) {
        this.allowedProperties = properties;
    }

    setAllowedFunctions(functions: Array<string>) {
        this.allowedFunctions = functions;
    }

    checkSecurity(tags: string[], filters: string[], functions: string[]): void {
        let self = this;

        for (let tag of tags) {
            if (!self.allowedTags.includes(tag)) {
                throw new TwingSandboxSecurityNotAllowedTagError(`Tag "${tag}" is not allowed.`, tag);
            }
        }

        for (const filterName of filters) {
            if (!self.allowedFilters.includes(filterName)) {
                throw new TwingSandboxSecurityNotAllowedFilterError(`Filter "${filterName}" is not allowed.`, filterName);
            }
        }

        for (let function_ of functions) {
            if (!self.allowedFunctions.includes(function_)) {
                throw new TwingSandboxSecurityNotAllowedFunctionError(`Function "${function_}" is not allowed.`, function_);
            }
        }
    }

    checkMethodAllowed(obj: any | TwingMarkup, method: string): void {
        if (isAMarkup(obj)) {
            return;
        }

        let allowed = false;
        let candidate = method.toLowerCase();

        for (let [constructorName, methods] of this.allowedMethods) {
            if (obj instanceof constructorName) {
                allowed = methods.includes(candidate);

                break;
            }
        }

        if (!allowed) {
            throw new TwingSandboxSecurityNotAllowedMethodError(`Calling "${method}" method on "${obj}" is not allowed.`);
        }
    }

    checkPropertyAllowed(candidate: any, property: string): void {
        let allowed = false;

        for (let [objectConstructor, properties] of this.allowedProperties) {
            if (candidate instanceof objectConstructor) {
                allowed = (Array.isArray(properties) ? properties : [properties]).includes(property);

                break;
            }
        }

        if (!allowed) {
            throw new TwingSandboxSecurityNotAllowedPropertyError(`Calling "${property}" property on a "${candidate.constructor.name}" is not allowed.`);
        }
    }
}
