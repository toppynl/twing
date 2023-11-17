export function isEven(value: any): Promise<boolean> {
    return Promise.resolve(value % 2 === 0);
}
