export class Domain {
  readonly width: number;
  readonly start: number;
  readonly diff: number;
  readonly min: number;

  constructor(start: number, stop: number, min: number, max: number) {
    this.width = stop - start;
    this.start = start;
    this.diff = max - min;
    this.min = min;
  }

  public scale(value: number) {
    return Math.round((value - this.start) * this.diff / this.width + this.min);
  }

  public invert(value: number) {
    return Math.round((value - this.min) * this.width / this.diff + this.start);
  }

  public equals(o: Domain) {
    if (o === null || o === undefined) {
      return false;
    }

    return (
      this.width === o.width &&
      this.start === o.start &&
      this.diff === o.diff &&
      this.min === o.min
    );
  }
}
