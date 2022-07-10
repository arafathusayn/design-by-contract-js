import { functionByContract } from "../src";

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
