import { Domain } from './domain';

describe('Domain', () => {
  it("test even domain", () => {
    const d = new Domain(0, 10, 0, 20);

    expect(d.scale(5)).toBe(10);
    expect(d.invert(10)).toBe(5);

    expect(d.scale(-5)).toBe(-10);
    expect(d.invert(-10)).toBe(-5);
  });

  it("test inverted domain", () => {
    const d = new Domain(10, 0, 0, 20);

    expect(d.scale(10)).toBe(0);
    expect(d.scale(0)).toBe(20);
  });
});
