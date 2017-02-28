export class Domain {
  readonly source: number;
  readonly sourceMin: number;
  readonly target: number;
  readonly targetMin: number;

  constructor(sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {
    this.source = sourceMax - sourceMin;
    this.sourceMin = sourceMin;
    this.target = targetMax - targetMin;
    this.targetMin = targetMin;
  }

  /**
   * Scale a value from one domain to another.
   */
  public scale(value: number) {
    return Math.round(value * this.target / this.source);
  }

  public map(value: number) {
    return Math.round((value - this.sourceMin) * this.target / this.source + this.targetMin);
  }

  public invert(value: number) {
    return Math.round((value - this.targetMin) * this.source / this.target + this.sourceMin);
  }

  public equals(o: Domain) {
    if (o === null || o === undefined) {
      return false;
    }

    return (
      this.source === o.source &&
      this.sourceMin === o.sourceMin &&
      this.target === o.target &&
      this.targetMin === o.targetMin
    );
  }
}
