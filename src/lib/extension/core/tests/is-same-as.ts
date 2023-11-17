export function isSameAs(a: any, b: any): Promise<boolean> {
    return Promise.resolve(a === b);
}
