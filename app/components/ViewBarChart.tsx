import { BarChart } from 'api/model'
import { Domain } from 'api/domain'

import CanvasChart, { CanvasChartProps, CanvasChartDrawState, DEFAULT_PADDING } from './CanvasChart'
import { ColorIterator } from 'api/colors'

interface Props extends CanvasChartProps<BarChart> {
}

interface DrawState extends CanvasChartDrawState {
  gap: number
}

export default class ViewBarChart extends CanvasChart<BarChart, Props, DrawState> {
  protected newXScale(min: number, max: number): Domain {
    const domain = super.newXScale(min, max)
    const { cadence } = this.next;
    return domain.withShiftedSourceMin(-cadence);
  }

  /**
   * Receive new props.
   */
  protected receiveProps(nextProps: Props) {
    super.receiveProps(nextProps);
    const { model } = nextProps;
    this.next.gap = model.gap;
  }

  protected checkDrawState(): boolean {
    var redraw = super.checkDrawState();

    const { gap } = this.next;
    const { gap: drawnGap } = this.drawn;

    if (gap !== drawnGap) {
      redraw = true;
    }

    return redraw
  }

  public initialDrawState(props: Props): DrawState {
    return {
      padding: props.padding || DEFAULT_PADDING,
      gap: props.model.gap
    }
  }

  public draw(color: ColorIterator): void {
    const { xScale, yScale, result, stacked } = this.next;

    const ctx = this.ctx;

    if (result.length <= 0) {
      /* indicate that there are no results */
      return
    }

    const { cadence } = this.next;

    if (cadence <= 0) {
      /* indicate that there is nothing to do */
      return
    }

    const { gap } = this.next;
    const barGroupGap = xScale.scaleInverse(gap);

    var filler: (bi: number, _si: number, x: number, y: number) => void;

    if (stacked) {
      const floors: { [key: number]: number } = {};

      filler = (_bi: number, _si: number, x: number, y: number) => {
        const prevY = (floors[x] || yScale.map(0));
        const height = Math.round(yScale.scale(Math.abs(y)));

        ctx.fillRect(
          Math.round(xScale.map(x - cadence)), prevY,
          Math.round(xScale.scale(cadence - barGroupGap)), height
        );

        floors[x] = Math.round(prevY + height);
      }
    } else {
      const barWidth = ((cadence - barGroupGap) / result.length);
      const barWidthPixels = Math.round(xScale.scale(barWidth));
      const yPos = Math.round(yScale.map(0));

      if (barWidthPixels <= 0) {
        throw new Error('bars too narrow');
      }

      var filler = (bi: number, _si: number, x: number, y: number) => {
        ctx.fillRect(
          Math.round(xScale.map(x + (barWidth * bi) - cadence)), yPos,
          barWidthPixels, Math.round(yScale.scale(y))
        );
      }
    }

    /* bi = bar index */
    for (var bi = 0, l = result.length; bi < l; bi++) {
      const res = result[bi];
      const d = res.values;

      if (d.length <= 0) {
        continue
      }

      ctx.fillStyle = color.next();

      /* si = series index */
      for (var si = 0, dl = d.length; si < dl; si++) {
        const [x, y] = d[si];
        filler(bi, si, x, y);
      }

      ctx.fill();
    }
  }
};
