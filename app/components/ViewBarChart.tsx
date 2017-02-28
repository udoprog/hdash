import { BarChart } from 'api/model';

import CanvasChart, { CanvasChartDrawState, CanvasChartProps } from './CanvasChart';
import { ColorIterator } from 'api/colors';

interface Props extends CanvasChartProps<BarChart> {
}

interface DrawState extends CanvasChartDrawState {
}

export default class ViewBarChart extends CanvasChart<BarChart, Props, DrawState> {
  public initialDrawState(): DrawState {
    return {};
  }

  public draw(color: ColorIterator): void {
    const {xScale, yScale, result, stacked} = this.next;

    const ctx = this.ctx;

    if (result.length <= 0) {
      /* indicate that there are no results */
      return;
    }

    var cadence = result[0].cadence;

    if (cadence <= 0) {
      /* indicate that there is nothing to do */
      return;
    }

    const width = (cadence / result.length);

    var filler = (x: number, y: number) => {
      ctx.fillRect(
        xScale.map(x + width * i - cadence) + 1, yScale.map(0),
        xScale.scale(width) - 2, yScale.scale(y)
      );
    };

    if (stacked) {
      const floors: { [key: number]: number } = {};

      filler = (x: number, y: number) => {
        const prevY = (floors[x] || 0);
        floors[x] = prevY + y;

        ctx.fillRect(
          xScale.map(x - cadence) + 1, yScale.map(prevY),
          xScale.scale(cadence) - 2, yScale.scale(y)
        );
      };
    }

    for (var i = 0, l = result.length; i < l; i++) {
      const res = result[i];
      const d = res.values;

      if (d.length <= 0) {
        continue;
      }

      ctx.fillStyle = color.next();

      for (var di = 0, dl = d.length; di < dl; di++) {
        const [x, y] = d[di];
        filler(x, y);
      }

      ctx.fill();
    }
  }
};
