import { LineChart } from 'api/model';

import CanvasChart, { CanvasChartProps } from './CanvasChart';
import { ColorIterator } from 'api/colors';

interface Props extends CanvasChartProps<LineChart> {
}

export default class ViewLineChart extends CanvasChart<LineChart, Props> {
  public draw(color: ColorIterator): void {
    this.drawGrid();

    const { xScale, yScale, result, stacked } = this.next;

    const ctx = this.ctx;

    var mover = (x: number, y: number) => {
      ctx.moveTo(xScale.map(x), yScale.map(y));
    };

    var drawer = (x: number, y: number) => {
      ctx.lineTo(xScale.map(x), yScale.map(y));
    };

    if (stacked) {
      // keep track of floors
      const floors: { [key: number]: number } = {};

      const originalMover = mover;
      const originalDrawer = drawer;

      mover = (x: number, y: number) => {
        y = floors[x] = (floors[x] || 0) + y;
        originalMover(x, y);
      }

      drawer = (x: number, y: number) => {
        y = floors[x] = (floors[x] || 0) + y;
        originalDrawer(x, y);
      }
    }

    for (var i = 0, l = result.length; i < l; i++) {
      const d = result[i].values;

      if (d.length <= 0) {
        continue;
      }

      const [o0, v0] = d[0];

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = color.next();

      mover(o0, v0);

      for (var di = 1, dl = d.length; di < dl; di++) {
        const [o, v] = d[di];
        drawer(o, v);
      }

      ctx.stroke();
    }
  }
}
