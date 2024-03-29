A TS/JavaScript library to put runtime checks using 'design by contract' approach.

```
npm i design-by-contract
```

## Usage

```ts
import { functionByContract } from "design-by-contract";

try {
  const thisMayThrowError =
    functionByContract({
      fn: () => { /* your function mutating outer scope */ },
      preconditions: Precondition[];
      postconditions: Postcondition[];
      invariants: Invariant[];
      async: boolean, // NOTE: must be set along with `asyncFnArgs` if your fn is async
      asyncFnArgs: any[],
    })
} catch(e) {
  // Clearly handle error
  console.error(e);
}
```

* `Precondition | Postcondition | Invariant` has type: `[ConditionFunction, string?]`.
* `preconditions` are checked before the function executes
* `postconditions` are checked after the function executes
* `invariants` are checked both before and after the function executes

## Basic Example

```js
let n1 = 1;
let n2 = 2;
let sum = 0;

let addTwoNumbersWithChecks = functionByContract({
  fn: () => {
    sum = n1 + n2;
    return sum;
  },
  preconditions: [
    [
      () => typeof n1 === "number" && typeof n2 === "number",
      "n1 and n2 should be numbers",
    ],
  ],
  postconditions: [[() => sum - n2 === n1 && sum - n1 === n2]],
  invariants: [[() => n1 === 1 && n2 === 2, "n1 & n2 must not change"]],
});

try {
  // this is okay
  sum = addTwoNumbersWithChecks();
} catch (error) {
  console.error(error);
}

// Let's ruin it
addTwoNumbersWithChecks = functionByContract({
  fn: () => {
    n1 = 0; // somehow corrupted memory
    sum = n1 + n2;
    return sum;
  },
  preconditions: [
    [
      () => typeof n1 === "number" && typeof n2 === "number",
      "n1 and n2 should be numbers",
    ],
  ],
  postconditions: [[() => sum - n2 === n1 && sum - n1 === n2]],
  invariants: [[() => n1 === 1 && n2 === 2, "n1 & n2 must not change"]],
});

try {
  // Invariant violated so it'll throw
  sum = addTwoNumbersWithChecks();
} catch (error) {
  // Error: n1 & n2 must not change
  console.error(error);
}
```