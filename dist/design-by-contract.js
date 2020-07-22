(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.designByContract = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
