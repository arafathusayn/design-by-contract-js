"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionByContract = void 0;
const checkContracts = (conditions, defaultErrorMessage) => {
    let results = [];
    for (const condition of conditions) {
        const result = condition[0]();
        if (result === true) {
            results.push(true);
        }
        else {
            results.push(new Error(condition[1] || defaultErrorMessage));
            return results;
        }
    }
    return results;
};
const returnErrorIfExists = (resultsWithErrors) => {
    for (const result of resultsWithErrors) {
        if (result instanceof Error) {
            return result;
        }
    }
    return undefined;
};
const checkInvariants = (conditions) => returnErrorIfExists(checkContracts(conditions, "One of the invariants is violated."));
const checkPreconditions = (conditions) => returnErrorIfExists(checkContracts(conditions, "One of the preconditions is violated."));
const checkPostconditions = (conditions) => returnErrorIfExists(checkContracts(conditions, "One of the postconditions is violated."));
/**
 * @description Condition: [ConditionFunction, ErrorMessage?]
 * @description ConditionFunction: () => boolean - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`
 * @description ErrorMessage?: any - optional, e.g. `'x should not be anything other than "foo"'`
 */
exports.functionByContract = ({ fn, preconditions, postconditions, invariants, }) => {
    let result = checkPreconditions([
        [() => fn instanceof Function, "First argument must be a function"],
        [
            () => preconditions && preconditions instanceof Array,
            "preconditions must be an array",
        ],
        [
            () => postconditions && postconditions instanceof Array,
            "postconditions must be an array",
        ],
        [
            () => invariants && invariants instanceof Array,
            "invariants must be an array",
        ],
        [
            () => preconditions instanceof Array &&
                !preconditions.find((x) => !(x instanceof Array)),
            "preconditions must be an array of array",
        ],
        [
            () => postconditions instanceof Array &&
                !postconditions.find((x) => !(x instanceof Array)),
            "postconditions must be an array of array",
        ],
        [
            () => invariants instanceof Array &&
                !invariants.find((x) => !(x instanceof Array)),
            "invariants must be an array of array",
        ],
        [
            () => preconditions instanceof Array &&
                !preconditions.find((x) => typeof x[0] !== "function"),
            "all preconditions have a function",
        ],
        [
            () => postconditions instanceof Array &&
                !postconditions.find((x) => typeof x[0] !== "function"),
            "all postconditions have a function",
        ],
        [
            () => invariants instanceof Array &&
                !invariants.find((x) => typeof x[0] !== "function"),
            "all invariants have a function",
        ],
    ]);
    if (result instanceof Error) {
        throw result;
    }
    const handler = {
        apply: (fn, _thisArg, args) => {
            let result = checkPreconditions(preconditions);
            if (result instanceof Error) {
                return result;
            }
            result = checkInvariants(invariants);
            if (result instanceof Error) {
                return result;
            }
            // main
            const returnedValue = fn(...args);
            // end main
            result = checkInvariants(invariants);
            if (result instanceof Error) {
                return result;
            }
            result = checkPostconditions(postconditions);
            if (result instanceof Error) {
                return result;
            }
            return returnedValue;
        },
    };
    // main
    const proxy = new Proxy(fn, handler);
    // end main
    return proxy;
};
exports.default = {
    functionByContract: exports.functionByContract,
};
