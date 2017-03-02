import { BarChart } from 'api/model';
import { Domain } from 'api/domain';

import CanvasChart, { CanvasChartProps } from './CanvasChart';
import { ColorIterator } from 'api/colors';

interface Props extends CanvasChartProps<BarChart> {
}

export default class ViewBarChart extends CanvasChart<BarChart, Props> {
  protected newXScale(): Domain {
    const domain = super.newXScale();

    const { cadence } = this.next;
    return domain.withShiftedSourceMin(-cadence);
  }

  public draw(color: ColorIterator): void {
    const { xScale, yScale, result, stacked } = this.next;

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

    var filler = (i: number, x: number, y: number) => {
      ctx.fillRect(
        xScale.map(x + (width * i)) + 2, yScale.map(0),
        xScale.scale(width) - 4, yScale.scale(y)
      );
    };

    if (stacked) {
      const floors: { [key: number]: number } = {};

      filler = (_i: number, x: number, y: number) => {
        const prevY = (floors[x] || yScale.map(0));
        const height = yScale.scale(Math.abs(y));

        ctx.fillRect(
          xScale.map(x - cadence) + 1, prevY,
          xScale.scale(cadence) - 2, height
        );

        floors[x] = prevY + height;
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
        filler(i, x, y);
      }

      ctx.fill();
    }

    ctx.strokeStyle = '#000000';
    ctx.moveTo(xScale.targetMin - 10, yScale.map(0));
    ctx.lineTo(xScale.targetMax + 10, yScale.map(0));
    ctx.stroke();
  }
};
