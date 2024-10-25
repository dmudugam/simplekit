import { startSimpleKit } from "canvas-mode";
import { expect, test } from '@jest/globals';

test("basic test", () => {
  expect(startSimpleKit()).toBe(false);
});

test("placeholder test", () => {
  expect(undefined).toBeUndefined();
});
