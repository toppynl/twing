export function isDefined(
    value: any
): Promise<boolean> {
    return Promise.resolve(!!value);
}
