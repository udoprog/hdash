import { Domain } from './domain';

describe('Domain', () => {
  it("test even domain", () => {
    const d = new Domain(0, 10, 0, 20);

    expect(d.map(5)).toBe(10);
    expect(d.invert(10)).toBe(5);

    expect(d.map(-5)).toBe(-10);
    expect(d.invert(-10)).toBe(-5);

    expect(d.scale(1)).toBe(2);
  });

  it("test inverted domain", () => {
    const d = new Domain(10, 0, 0, 20);

    expect(d.map(10)).toBe(0);
    expect(d.map(0)).toBe(20);
    expect(d.scale(1)).toBe(-2);
  });
});
