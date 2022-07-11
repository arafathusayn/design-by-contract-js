const checkContracts = (
  conditions: Contract[],
  defaultErrorMessage: string,
): void | never => {
  for (const [condition, errorMessage] of conditions) {
    const result = condition();

    if (result === false) {
      throw new Error(errorMessage || defaultErrorMessage);
    }
  }
};

const checkInvariants = (conditions: Invariant[]) => {
  checkContracts(conditions, "One of the invariants is violated.");
};

const checkPreconditions = (conditions: Precondition[]) => {
  checkContracts(conditions, "One of the preconditions is violated.");
};

const checkPostconditions = (conditions: Postcondition[]) => {
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
export const functionByContract = ({
  fn,
  preconditions,
  postconditions,
  invariants,
  async: asyncFn,
  asyncFnArgs,
}: Params): Function | never => {
  // This may throw
  checkPreconditions([
    [() => typeof fn === "function", "First argument must be a function"],

    [
      () =>
        preconditions instanceof Array &&
        !preconditions.find((x) => !(x instanceof Array)),
      "preconditions must be an array of array",
    ],
    [
      () =>
        postconditions instanceof Array &&
        !postconditions.find((x) => !(x instanceof Array)),
      "postconditions must be an array of array",
    ],
    [
      () =>
        invariants instanceof Array &&
        !invariants.find((x) => !(x instanceof Array)),
      "invariants must be an array of array",
    ],

    [
      () =>
        preconditions instanceof Array &&
        !preconditions.find((x) => typeof x[0] !== "function"),
      "all preconditions have a function",
    ],
    [
      () =>
        postconditions instanceof Array &&
        !postconditions.find((x) => typeof x[0] !== "function"),
      "all postconditions have a function",
    ],
    [
      () =>
        invariants instanceof Array &&
        !invariants.find((x) => typeof x[0] !== "function"),
      "all invariants have a function",
    ],
  ]);

  const handler: ProxyHandler<typeof fn> = {
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

  return () =>
    new Promise(async (resolve, reject) => {
      try {
        // Throw if preconditions are violated
        checkPreconditions(preconditions);
        // Throw if invariants are violated before
        checkInvariants(invariants);

        const returnedValue =
          asyncFnArgs instanceof Array ? await fn(...asyncFnArgs) : await fn();

        // Throw if invariants are violated after
        checkInvariants(invariants);
        // Throw if postconditions are violated
        checkPostconditions(postconditions);

        resolve(returnedValue);
      } catch (error) {
        reject(error);
      }
    });
};

export default {
  functionByContract,
};

type ConditionFunction = () => boolean;
type ErrorMessage = string;
type Contract = [ConditionFunction, ErrorMessage?];
type Precondition = Contract;
type Postcondition = Contract;
type Invariant = Contract;

type Params =
  | ({
      fn: Function;
      preconditions: Precondition[];
      postconditions: Postcondition[];
      invariants: Invariant[];
    } & { async: boolean; asyncFnArgs: any[] })
  | ({
      fn: Function;
      preconditions: Precondition[];
      postconditions: Postcondition[];
      invariants: Invariant[];
    } & { async?: never; asyncFnArgs?: never });
