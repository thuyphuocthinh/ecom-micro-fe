import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

// `findBy...` and `waitFor` wait 1 second by default. The first image popup of a test file loads its
// library on demand, which takes longer when many packages test at once.
configure({ asyncUtilTimeout: 5000 });
