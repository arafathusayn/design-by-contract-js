import { attachContracts } from "../index";

describe("attachContracts -> Function", () => {
  test("takes a function as 1st arg otherwise returns an error with a specific message", () => {
    const fn = () => {};

    expect(
      typeof attachContracts({
        fn,
        preconditions: [],
        postconditions: [],
        invariants: [],
      }),
    ).toBe("function");

    expect(() =>
      attachContracts({
        // @ts-ignore
        fn: null,
        preconditions: [],
        postconditions: [],
        invariants: [],
      }),
    ).toThrow("First argument must be a function");
  });

  test("returns an error with a message if preconditions, postconditions or invariants are not array of [boolean]", () => {
    const fn = () => {};

    expect(() =>
      attachContracts({
        fn,
        // @ts-ignore
        preconditions: null,
        postconditions: [],
        invariants: [],
      }),
    ).toThrow("preconditions must be an array");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        // @ts-ignore
        postconditions: null,
        invariants: [],
      }),
    ).toThrow("postconditions must be an array");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        postconditions: [],
        // @ts-ignore
        invariants: null,
      }),
    ).toThrow("invariants must be an array");

    expect(() =>
      attachContracts({
        fn,
        // @ts-ignore
        preconditions: [1],
        postconditions: [],
        invariants: [],
      }),
    ).toThrow("preconditions must be an array of array");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        // @ts-ignore
        postconditions: [1],
        invariants: [],
      }),
    ).toThrow("postconditions must be an array of array");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        postconditions: [],
        // @ts-ignore
        invariants: [1],
      }),
    ).toThrow("invariants must be an array of array");

    expect(() =>
      attachContracts({
        fn,
        // @ts-ignore
        preconditions: [[null, {}]],
        postconditions: [],
        invariants: [],
      }),
    ).toThrow("all preconditions have a function");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        // @ts-ignore
        postconditions: [[null, {}]],
        invariants: [],
      }),
    ).toThrow("all postconditions have a function");

    expect(() =>
      attachContracts({
        fn,
        preconditions: [],
        postconditions: [],
        // @ts-ignore
        invariants: [[null, {}]],
      }),
    ).toThrow("all invariants have a function");
  });

  test("preconditions, postconditions & invariants are checked and return an error if exists", () => {
    let num1 = 10;
    let num2 = 0;

    const divide = () => num1 / num2;

    const divideWithContracts = attachContracts({
      fn: divide,
      preconditions: [[() => num2 !== 0, { num2 }, "cannot divide by zero"]],
      postconditions: [],
      invariants: [
        [
          () => num1 === 10 && num2 === 0,
          { num1, num2 },
          "inputs are not same",
        ],
      ],
    });

    const result = divideWithContracts();

    expect(result).toStrictEqual(new Error("cannot divide by zero"));

    num2 = 10;

    const divideWithContracts2 = attachContracts({
      fn: divide,
      preconditions: [[() => num2 !== 0, { num2 }, "cannot divide by zero"]],
      postconditions: [],
      invariants: [
        [
          () => num1 === 10 && num2 === 10,
          { num1, num2 },
          "inputs are not same",
        ],
      ],
    });

    const result2 = divideWithContracts2();

    expect(result2).toBe(1);

    const divideWithContracts3 = attachContracts({
      fn: divide,
      preconditions: [],
      postconditions: [],
      invariants: [
        [
          () => num1 === 10 && num2 === 0,
          { num1, num2 },
          "inputs are not same",
        ],
      ],
    });

    const result3 = divideWithContracts3();

    expect(result3).toStrictEqual(new Error("inputs are not same"));

    num1 = 10;
    num2 = 10;

    const divideWithContracts4 = attachContracts({
      fn: () => {
        num2 = 5;
        return num1 / num2;
      },
      preconditions: [],
      postconditions: [],
      invariants: [
        [
          () => num1 === 10 && num2 === 10,
          { num1, num2 },
          "inputs are not same",
        ],
      ],
    });

    const result4 = divideWithContracts4();

    expect(result4).toStrictEqual(new Error("inputs are not same"));

    num1 = 5;
    num2 = 5;

    const divideWithContracts5 = attachContracts({
      fn: () => {
        num2 = 1;
        return num1 / num2;
      },
      preconditions: [
        [() => num1 === 5 && num2 === 5, { num1, num2 }, "inputs are not same"],
      ],
      postconditions: [
        [() => num1 === 5 && num2 === 5, { num1, num2 }, "inputs are not same"],
      ],
      invariants: [],
    });

    const result5 = divideWithContracts5();

    expect(result5).toStrictEqual(new Error("inputs are not same"));
  });

  test("returns default error message if error message is not provided", () => {
    let num1 = 10;
    let num2 = 10;

    const divideWithContracts4 = attachContracts({
      fn: () => {
        num2 = 5;
        return num1 / num2;
      },
      preconditions: [],
      postconditions: [],
      invariants: [[() => num1 === 10 && num2 === 10, { num1, num2 }]],
    });

    const result4 = divideWithContracts4();

    expect(result4).toStrictEqual(
      new Error("One of the invariants is violated."),
    );
  });
});
