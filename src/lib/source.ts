export interface TwingSource {
    readonly code: string;
    readonly name: string;
}

export const createSource = (
    name: string,
    code: string
): TwingSource => {
    return {
        get code() {
            return code;
        },
        get name() {
            return name;
        }
    };
};
