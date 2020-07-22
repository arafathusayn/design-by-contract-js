declare type Condition = [() => boolean, any?];
/**
 * @description Condition: [ConditionFunction, ErrorMessage?]
 * @description ConditionFunction: () => boolean - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`
 * @description ErrorMessage?: any - optional, e.g. `'x should not be anything other than "foo"'`
 */
export declare const functionByContract: ({ fn, preconditions, postconditions, invariants, }: {
    fn: Function;
    preconditions: Condition[];
    postconditions: Condition[];
    invariants: Condition[];
}) => Function | never;
declare const _default: {
    functionByContract: ({ fn, preconditions, postconditions, invariants, }: {
        fn: Function;
        preconditions: Condition[];
        postconditions: Condition[];
        invariants: Condition[];
    }) => Function;
};
export default _default;
