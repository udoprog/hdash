export class Domain {
  public readonly source: number;
  public readonly sourceMin: number;
  public readonly sourceMax: number;
  public readonly target: number;
  public readonly targetMin: number;
  public readonly targetMax: number;

  constructor(sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {
    this.source = sourceMax - sourceMin;
    this.sourceMin = sourceMin;
    this.sourceMax = sourceMax;
    this.target = targetMax - targetMin;
    this.targetMin = targetMin;
    this.targetMax = targetMax;
  }

  /**
   * Scale a value from one domain to another.
   */
  public scale(value: number) {
    return Math.round(value * this.target / this.source);
  }

  public scaleInverse(value: number) {
    return Math.round(value / this.target * this.source);
  }

  public map(value: number) {
    return Math.round((value - this.sourceMin) * this.target / this.source + this.targetMin);
  }

  public invert(value: number) {
    return Math.round((value - this.targetMin) * this.source / this.target + this.sourceMin);
  }

  public withShiftedSourceMin(extent: number): Domain {
    return new Domain(this.sourceMin + extent, this.sourceMax, this.targetMin, this.targetMax);
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
