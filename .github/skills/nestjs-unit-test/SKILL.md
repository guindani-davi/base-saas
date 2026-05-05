---
name: nestjs-unit-test
description: "Create NestJS unit tests with Vitest. Use when: writing controller tests, service tests, creating test files, testing NestJS modules, mocking dependencies with useMocker."
argument-hint: 'Describe the class/module to test (e.g., "UserController", "AuthService")'
---

# NestJS Unit Testing with Vitest

Create unit tests for NestJS controllers, services, and other modules using Vitest and NestJS testing utilities.

## When to Use

- Creating a new `*.spec.ts` test file for a NestJS class
- Testing controllers that delegate to services
- Testing services with mocked repositories/dependencies
- Following the abstract interface pattern (`IService`, `IRepository`)

## Test File Pattern

### 1. Imports Structure

```typescript
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
// Import the class under test
// Import the interface/abstract class for dependencies
// Import DTOs and domain exceptions
```

### 2. Test Setup with useMocker

```typescript
describe("ClassName", () => {
  let classUnderTest: ClassName;
  let dependency: IDependency;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ClassName], // or providers: [ClassName]
    })
      .useMocker((token) => {
        if (token === IDependency) {
          return {
            methodA: vi.fn(),
            methodB: vi.fn(),
          };
        }
      })
      .compile();

    classUnderTest = moduleRef.get(ClassName);
    dependency = moduleRef.get(IDependency);
  });
});
```

### 3. Test Cases Structure

For each method, create a nested `describe` block with:

```typescript
describe("methodName", () => {
  const inputDto: InputDTO = {
    /* mock data */
  };

  it("should return expected result on success", async () => {
    const expected = {
      /* expected response */
    };
    vi.spyOn(dependency, "method").mockResolvedValue(expected);

    const result = await classUnderTest.methodName(inputDto);

    expect(result).toBe(expected);
    expect(dependency.method).toHaveBeenCalledWith(inputDto);
    expect(dependency.method).toHaveBeenCalledTimes(1);
  });

  it("should propagate DomainException from dependency", async () => {
    vi.spyOn(dependency, "method").mockRejectedValue(new DomainException());

    await expect(classUnderTest.methodName(inputDto)).rejects.toThrow(
      DomainException,
    );
  });
});
```

## Procedure

1. **Analyze the class under test**
   - Read the class implementation to identify methods and dependencies
   - Read the interface/abstract class to understand the contract
   - Read DTOs to understand input shapes
   - Read domain exceptions that may be thrown

2. **Plan test cases**
   - For each public method, identify:
     - Success path (returns expected value)
     - Exception propagation (domain exceptions)
     - Edge cases (empty inputs, validation)

3. **Create test file**
   - Place next to the class: `class-name.spec.ts`
   - Follow the imports → setup → test cases structure
   - Use `vi.fn()` for mock methods in `useMocker`
   - Use `vi.spyOn().mockResolvedValue()` for return values
   - Use `vi.spyOn().mockRejectedValue()` for exceptions

4. **Verify**
   - Run `npm test` to execute tests
   - Check for compile errors

## Controller vs Service Tests

| Aspect     | Controller Test       | Service Test            |
| ---------- | --------------------- | ----------------------- |
| Focus      | HTTP layer delegation | Business logic          |
| Mock       | Service interface     | Repository interface    |
| Assertions | Correct passthrough   | Logic correctness       |
| Depth      | Thin (delegate only)  | Thorough (all branches) |

## Vitest vs Jest Quick Reference

| Jest            | Vitest       |
| --------------- | ------------ |
| `jest.fn()`     | `vi.fn()`    |
| `jest.spyOn()`  | `vi.spyOn()` |
| `jest.mock()`   | `vi.mock()`  |
| `@jest/globals` | `vitest`     |

## Example Output

See [auth.controller.spec.ts](./references/auth.controller.spec.ts) for a complete example.
