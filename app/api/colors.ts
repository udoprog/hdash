export class ColorIterator {
  readonly colors: string[];
  index: number;

  constructor(colors: string[]) {
    this.colors = colors;
    this.index = 0;
  }
  
  next(): string {
    const i = this.index++;

    if (this.index >= this.colors.length) {
      this.index = 0;
    }

    return this.colors[i];
  }
}

class Palette {
  readonly colors: string[];

  constructor(colors: string[]) {
    this.colors = colors;
  }

  iterate(): ColorIterator {
    return new ColorIterator(this.colors);
  }
}

/**
 * http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=9
 */
export const QualitativePaired9 = new Palette([
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6'
]);
