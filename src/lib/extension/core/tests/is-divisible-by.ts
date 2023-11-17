export function isDivisibleBy(a: any, b: any): Promise<boolean> {
    return Promise.resolve(a % b === 0);
}
