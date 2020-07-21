declare type Condition = [() => boolean, {
    [key: string]: any;
}, any?];
/**
 * @description Condition: [ConditionFunction, Arguments, ErrorMessage?]
 * @description ConditionFunction: () => boolean - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`
 * @description Arguments: Object - its keys and values will be passed for evaluation, e.g. `{ x: "foo", y: "bar" }`
 * @description ErrorMessage?: any - optional, e.g. `'x should not be anything other than "foo"'`
 */
export declare const attachContracts: ({ fn, preconditions, postconditions, invariants, }: {
    fn: Function;
    preconditions: Condition[];
    postconditions: Condition[];
    invariants: Condition[];
}) => Function | never;
export {};
