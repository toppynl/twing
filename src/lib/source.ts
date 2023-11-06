export interface Source {
    readonly code: string;
    readonly name: string;
    readonly resolvedName: string;
}

export const createSource = (
    code: string,
    name: string,
    resolvedName?: string
): Source => {
    return {
        get code() {
            return code;
        },
        get name() {
            return name;
        },
        get resolvedName() {
            return resolvedName || name;
        }
    };
};
