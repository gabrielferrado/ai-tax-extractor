export function standardize(str: string) {
    return str.toUpperCase().replace(/\W+/g, "");
}

export function formatToBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}