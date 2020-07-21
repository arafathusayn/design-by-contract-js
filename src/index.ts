type Condition = [() => boolean, { [key: string]: any }, any?];

const checkContracts = (
  conditions: Condition[],
  defaultErrorMessage: string,
): (true | Error)[] => {
  let results: (true | Error)[] = [];

  for (const condition of conditions) {
    const fn: (x: any) => boolean = condition[0];
    const args: any = condition[1];

    const result: boolean = fn(args);

    if (result === true) {
      results.push(true);
    } else {
      results.push(new Error(condition[2] || defaultErrorMessage));

      return results;
    }
  }

  return results;
};

const returnErrorIfExists = (
  resultsWithErrors: (true | Error)[],
): undefined | Error => {
  for (const result of resultsWithErrors) {
    if (result instanceof Error) {
      return result;
    }
  }

  return undefined;
};

const checkInvariants = (conditions: Condition[]) =>
  returnErrorIfExists(
    checkContracts(conditions, "One of the invariants is violated."),
  );

const checkPreconditions = (conditions: Condition[]) =>
  returnErrorIfExists(
    checkContracts(conditions, "One of the preconditions is violated."),
  );

const checkPostconditions = (conditions: Condition[]) =>
  returnErrorIfExists(
    checkContracts(conditions, "One of the postconditions is violated."),
  );

/**
 * @description Condition: [ConditionFunction, Arguments, ErrorMessage?]
 * @description ConditionFunction: () => boolean - evaluated and checked to be true, e.g. `() => x === "foo" && y === "bar"`
 * @description Arguments: Object - its keys and values will be passed for evaluation, e.g. `{ x: "foo", y: "bar" }`
 * @description ErrorMessage?: any - optional, e.g. `'x should not be anything other than "foo"'`
 */
export const attachContracts = ({
  fn,
  preconditions,
  postconditions,
  invariants,
}: {
  fn: Function;
  preconditions: Condition[];
  postconditions: Condition[];
  invariants: Condition[];
}): Function | never => {
  let result = checkPreconditions([
    [() => fn instanceof Function, { fn }, "First argument must be a function"],

    [
      () => preconditions && preconditions instanceof Array,
      { preconditions },
      "preconditions must be an array",
    ],
    [
      () => postconditions && postconditions instanceof Array,
      { postconditions },
      "postconditions must be an array",
    ],
    [
      () => invariants && invariants instanceof Array,
      { invariants },
      "invariants must be an array",
    ],

    [
      () =>
        preconditions instanceof Array &&
        !preconditions.find((x) => !(x instanceof Array)),
      { preconditions },
      "preconditions must be an array of array",
    ],
    [
      () =>
        postconditions instanceof Array &&
        !postconditions.find((x) => !(x instanceof Array)),
      { postconditions },
      "postconditions must be an array of array",
    ],
    [
      () =>
        invariants instanceof Array &&
        !invariants.find((x) => !(x instanceof Array)),
      { invariants },
      "invariants must be an array of array",
    ],

    [
      () =>
        preconditions instanceof Array &&
        !preconditions.find((x) => typeof x[0] !== "function"),
      { preconditions },
      "all preconditions have a function",
    ],
    [
      () =>
        postconditions instanceof Array &&
        !postconditions.find((x) => typeof x[0] !== "function"),
      { postconditions },
      "all postconditions have a function",
    ],
    [
      () =>
        invariants instanceof Array &&
        !invariants.find((x) => typeof x[0] !== "function"),
      { invariants },
      "all invariants have a function",
    ],
  ]);

  if (result instanceof Error) {
    throw result;
  }

  const handler = {
    apply: (fn: Function, _thisArg: any, args: any[]): any | void | Error => {
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
