// shared/utils/src/index.ts
export function add(a: number, b: number): number {
    console.log('add');
    return a + b;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}