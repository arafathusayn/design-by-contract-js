(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.designByContract = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionByContract = void 0;
const checkContracts = (conditions, defaultErrorMessage) => {
    for (const [condition, errorMessage] of conditions) {
        const result = condition();
        if (result === false) {
            throw new Error(errorMessage || defaultErrorMessage);
        }
    }
};
const checkInvariants = (conditions) => {
    checkContracts(conditions, "One of the invariants is violated.");
};
const checkPreconditions = (conditions) => {
    checkContracts(conditions, "One of the preconditions is violated.");
};
const checkPostconditions = (conditions) => {
    checkContracts(conditions, "One of the postconditions is violated.");
};
/**
 * @throws {Error} Throws if any of the passed properties is invalid, eg. Empty array `preconditions: []` for any contract
 * @description `Precondition | Postcondition | Invariant` is of type: `[ConditionFunction, string?]`.\
 * `preconditions` are checked before the function executes\
 * `postconditions` are checked after the function executes\
 * `invariants` are checked both before and after the function executes\
 * `ConditionFunction: () => boolean` - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`\
 * ErrorMessage?: string - optional, e.g. `'x should not be anything other than "foo"'`
 */
const functionByContract = ({ fn, preconditions, postconditions, invariants, async: asyncFn, asyncFnArgs, }) => {
    // This may throw
    checkPreconditions([
        [() => typeof fn === "function", "First argument must be a function"],
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
    const handler = {
        apply: (target, _thisArg, args) => {
            // Throw if preconditions are violated
            checkPreconditions(preconditions);
            // Throw if invariants are violated before
            checkInvariants(invariants);
            const returnedValue = target(...args);
            // Throw if invariants are violated after
            checkInvariants(invariants);
            // Throw if postconditions are violated
            checkPostconditions(postconditions);
            return returnedValue;
        },
    };
    if (!asyncFn) {
        const proxy = new Proxy(fn, handler);
        return proxy;
    }
    return () => new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        // Throw if preconditions are violated
        checkPreconditions(preconditions);
        // Throw if invariants are violated before
        checkInvariants(invariants);
        let returnedValue;
        try {
            returnedValue =
                asyncFnArgs instanceof Array ? yield fn(...asyncFnArgs) : yield fn();
            // Throw if invariants are violated after
            checkInvariants(invariants);
            // Throw if postconditions are violated
            checkPostconditions(postconditions);
            resolve(returnedValue);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.functionByContract = functionByContract;
exports.default = {
    functionByContract: exports.functionByContract,
};

},{}]},{},[1])(1)
});
