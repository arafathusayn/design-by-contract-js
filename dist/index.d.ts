/**
 * @throws {Error} Throws if any of the passed properties is invalid, eg. Empty array `preconditions: []` for any contract
 * @description `Precondition | Postcondition | Invariant` is of type: `[ConditionFunction, string?]`.\
 * `preconditions` are checked before the function executes\
 * `postconditions` are checked after the function executes\
 * `invariants` are checked both before and after the function executes\
 * `ConditionFunction: () => boolean` - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`\
 * ErrorMessage?: string - optional, e.g. `'x should not be anything other than "foo"'`
 */
export declare const functionByContract: ({ fn, preconditions, postconditions, invariants, async: asyncFn, asyncFnArgs, }: Params) => Function | never;
declare const _default: {
    functionByContract: ({ fn, preconditions, postconditions, invariants, async: asyncFn, asyncFnArgs, }: Params) => Function;
};
export default _default;
declare type ConditionFunction = () => boolean;
declare type ErrorMessage = string;
declare type Contract = [ConditionFunction, ErrorMessage?];
declare type Precondition = Contract;
declare type Postcondition = Contract;
declare type Invariant = Contract;
declare type Params = ({
    fn: Function;
    preconditions: Precondition[];
    postconditions: Postcondition[];
    invariants: Invariant[];
} & {
    async: boolean;
    asyncFnArgs: any[];
}) | ({
    fn: Function;
    preconditions: Precondition[];
    postconditions: Postcondition[];
    invariants: Invariant[];
} & {
    async?: never;
    asyncFnArgs?: never;
});
