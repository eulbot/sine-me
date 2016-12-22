import * as _ from 'lodash'
import * as spline from 'cardinal-spline-js'

interface EaseFunc {
    (t: number, lowerLimit: number, upperLimit: number): number;
}

interface Easing {
    func: EaseFunc,
    ll: number,
    ul: number
}

export class sinus2 {
    private ctx: CanvasRenderingContext2D;
    private data: number[][];
    private easing: Easing[];
    private sf: number;
    private ef: number;

    constructor (public canvas: HTMLCanvasElement) { 
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    }

    public start = (data: number[][]) => {

        this.data = data;
        this.setEasing();
        this.calcSplines();
        this.ef = 0;

        this.ctx.moveTo(0, this.data[0][0]);
        this.draw();
    }

    private calcSplines = () => {

        let patchsize = 30;
        let w = this.canvas.width, h = this.canvas.height;
        let xs = _.range(0, this.data[0].length).map((x) => w * x / this.data[0].length);
        let step = xs.length / w;

        for(let row = 0; row < this.data.length; row++) {
            let dent = this.data[row].map((x) => patchsize - (x * patchsize / 255));
            this.data[row] = spline.getCurvePoints(_.flatten(_.zip(xs, dent)), .5, w / xs.length);
        }   
    }

    private draw = () => {

        this.ctx.clearRect(0, 0, 800, 1600);
        this.sf = this.ef;
        this.ef += 4;
        
        for (let i = 0; i < this.data.length; i++) {

            let w = this.canvas.width, row = this.data[i], er = this.easing[i];

            var xFrom = 2 * Math.round(er.func(this.sf / w, er.ll, er.ul) * w / 2);
            var xTo = 2 * Math.round(er.func(this.ef / w, er.ll, er.ul) * w / 2);
            this.ctx.moveTo(this.data[i][xFrom * 2], (this.data[i][xFrom * 2 + 1]) + i * 30);

            for(let x = xFrom + 2; x <= xTo; x++) {
                this.ctx.lineTo(row[x * 2], (row[x * 2 + 1]) + i * 30);
            }
        }

        this.ctx.stroke();

        if(this.ef < this.data[0].length / 2) {
            // setTimeout(() => {
                return window.requestAnimationFrame(this.draw);
            // }, 200)
        }
    }

    private setEasing = () => {

        let lowerLimit, upperLimit;
        this.easing = [];

        for(let i = 0; i < this.data.length; i++) {
            
            lowerLimit = this.r(0, .25);
            upperLimit = this.r(0, .25 - lowerLimit);

            this.easing.push(<Easing>{
                func: this.easeInQuad,
                ll: lowerLimit,
                ul: upperLimit
            })
        }
    }

    private r = (min, max) => {
        return Math.random() * (max - min) + min;
    }

    private pickEaseFunc = (): EaseFunc => {
        let r = this.r(0, 3);
        return r < 1 ? this.easeInQuad : r < 2 ? this.easeOutQuad : this.easeInOutQuad;
    }

    private easeInQuad: EaseFunc = (t: number, ll: number, ul: number): number => {
        
        return t < ll ? 0 : t >= 1 - ul ? 1 : Math.pow((t - ll) * 1 / (1 - ll - ul), 2)
	}

	private easeOutQuad: EaseFunc = (t: number, ll: number, ul: number): number => {
		if(t > ll)
            var x = 1;

        return t < ll ? 0 : t >= 1 - ul ? 1 : t * (2 - t) * 1 / (ll + ul);
	}
    
	private easeInOutQuad: EaseFunc = (t: number, ll: number, ul: number): number => {
		//return t<.5 ? 2*t*t : -1+(4-2*t)*t;
        return t < ll ? 0 : t >= 1 - ul ? 1 : t < .5 ? 2 * t * t * 1 / (ll + ul) : -1 + (4 - 2 * t) * t *  1 / (ll + ul);
	}
}