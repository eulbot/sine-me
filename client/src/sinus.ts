import * as _ from 'lodash'
import * as spline from 'cardinal-spline-js'

// export interface CanvasRenderingContext2D {
//     curve: (points: number[]) => any;
// }

export class sinus2 {
    private ctx: CanvasRenderingContext2D;

    constructor (public canvas: HTMLCanvasElement) { 
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    }

    public draw = (data: number[][]) => {

        let patchsize = 30;
        let w = this.canvas.width, h = this.canvas.height;
        let xs = _.range(0, data[0].length).map((x) => w * x / data[0].length);
        let step = xs.length / w;

        for(let row = 0; row < data.length; row++) {
            let dent = data[row].map((x) => patchsize - (x * patchsize / 255));
            let points = spline.getCurvePoints(_.flatten(_.zip(xs, dent)));

            this.ctx.moveTo(0, dent[0] + (row * patchsize));
            for(let x = 2; x < points.length; x += 2) {
                this.ctx.lineTo(points[x], (points[x + 1]) + (row * patchsize));
            }
        }   
        this.ctx.stroke();
    }
}