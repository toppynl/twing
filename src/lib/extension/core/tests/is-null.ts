export function isNull(value: any): Promise<boolean> {
    return Promise.resolve(value === null);
}
