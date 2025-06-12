import { ADHOC_TAXES } from "./constants";

function standardize(str: string) {
    return str.toUpperCase().replace(/\W+/g, "");
}

function isTaxIncluded(str: string, taxArray: string[]) {
    return taxArray.find(el => standardize(str).includes(el))
}

function shouldSplit(str: string) {
    return ADHOC_TAXES.includes(standardize(str));
}

export {
    standardize,
    isTaxIncluded,
    shouldSplit,
}