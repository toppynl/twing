type VariantEntries = Map<string, string | string[] | null | undefined>;
type Variants = Map<string, VariantEntries>;
type CompoundVariant = Map<string, string | string[] | null | undefined>;
type DefaultVariants = Map<string, string>;
type Recipes = Map<string, string | boolean | number | null | undefined>;

const toArray = (value: unknown): string[] => {
    if (value === null || value === undefined) return [];
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
    return [];
};

const resolveCompoundVariant = (
    compound: CompoundVariant,
    recipes: Recipes
): string[] => {
    for (const [name, values] of compound.entries()) {
        if (name === "class") continue;

        const allowed = Array.isArray(values) ? values : [values];
        const current = recipes.get(name);

        if (current === undefined || !allowed.includes(current as string)) {
            return [];
        }
    }

    return toArray(compound.get("class"));
};

export class Cva {
    private readonly base: string[];

    constructor(
        base: string | string[] | null | undefined = [],
        private readonly variants: Variants = new Map(),
        private readonly compoundVariants: CompoundVariant[] = [],
        private readonly defaultVariants: DefaultVariants = new Map()
    ) {
        this.base = toArray(base);
    }

    apply(
        recipes: Recipes | null | undefined,
        ...additionalClasses: Array<string | null | undefined>
    ): string {
        let classes: string[] = [...this.base];
        const recipesMap: Recipes = recipes instanceof Map ? recipes : new Map();

        for (const [name, rawValue] of recipesMap.entries()) {
            let value: string;
            if (typeof rawValue === "boolean") {
                value = rawValue ? "true" : "false";
            } else {
                value = String(rawValue);
            }
            const variant = this.variants.get(name);
            if (!variant) continue;
            const recipeClasses = variant.get(value);
            classes = classes.concat(toArray(recipeClasses));
        }

        for (const compound of this.compoundVariants) {
            classes = classes.concat(resolveCompoundVariant(compound, recipesMap));
        }

        for (const [name, value] of this.defaultVariants.entries()) {
            if (recipesMap.has(name)) continue;
            const variant = this.variants.get(name);
            if (!variant) continue;
            classes = classes.concat(toArray(variant.get(value)));
        }

        for (const cls of additionalClasses) {
            if (typeof cls === "string") classes.push(cls);
        }

        const joined = classes.filter((v) => typeof v === "string").join(" ");
        const split = joined.split(/\s+/).filter((v) => v !== "");

        return Array.from(new Set(split)).join(" ");
    }
}
