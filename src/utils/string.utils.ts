export function standardize(str: string) {
    return str.toUpperCase().replace(/\W+/g, "");
}