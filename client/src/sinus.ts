import * as _ from 'lodash'
import * as spline from 'cardinal-spline-js'
import * as $ from 'jquery'

interface EaseFunc {
    (t: number, lowerLimit: number, upperLimit: number): number;
}

interface Easing {
    func: EaseFunc,
    ll: number,
    ul: number,
    direction: number
}

export class Sinus {
    private ctx: CanvasRenderingContext2D;
    private data: number[][];
    private ps: number;

    private easing: Easing[];
    private sf: number;
    private ef: number = 0;

    constructor (public canvas: HTMLCanvasElement) { 
        this.ctx = canvas.getContext('2d');
    }

    public process = (data: number[][], patchSize: number) => {

        this.data = data;
        this.ps = patchSize;
        
        this.setupCanvas();
        this.setupEasing();
        this.calcSines();

        this.draw();
    }

    private calcSines = () => {

        let w = this.canvas.width, h = this.canvas.height;
        let xs = _.range(0, this.data[0].length).map((x) => Math.round(w * x / (this.data[0].length - 1)));
        let step = xs.length / w;

        for(let row = 0; row < this.data.length; row++) {
            let dent = this.data[row].map((x) => this.ps - (x * this.ps / 255));
            this.data[row] = spline.getCurvePoints(_.flatten(_.zip(xs, dent)), .5, this.ps);
            
            let phase = 0;
            for(let i = 0; i < this.data[row].length; i++) {

                if(i % 2 == 0) {

                    let delta = i > 0 ? this.data[row][i] - this.data[row][i - 2] : 0;
                    let fqcy = this.data[row][i + 1];
                    let amount = (1 - (this.ps - fqcy) / this.ps);

                    phase += delta * amount / 1.5;
                    let y = Math.sin(phase) * this.ps / 2 * Math.pow(amount, 2);
                    this.data[row][i + 1] = y;
                }
            }
        }   

    }

    private draw = () => {

        let w = this.canvas.width;
        let h = this.canvas.height;
        this.ctx.beginPath();
        this.sf = this.ef;
        this.ef += 4;
        
        for (let i = 0; i < this.data.length; i++) {

            let row = this.data[i], er = this.easing[i];
            let offset = (i * this.ps) + this.ps / 1.5;
            let x_from = 2 * Math.round(er.func(this.sf / w, er.ll, er.ul) * w / 2);
            let x_to = 2 * Math.round(er.func(this.ef / w, er.ll, er.ul) * w / 2);
            let r = er.direction * (this.data[i].length / 2 - 1);

            this.ctx.moveTo(this.data[i][Math.abs(r - x_from) * 2], (this.data[i][Math.abs(r - x_from) * 2 + 1]) + offset);
            for(let x = x_from + 2; x <= x_to; x++) 
                this.ctx.lineTo(row[Math.abs(r - x) * 2], row[Math.abs(r - x) * 2 + 1] + offset);
        }

        this.ctx.stroke();

        if(this.ef <= this.data[0].length / 2) {
            window.requestAnimationFrame(this.draw);
        }
    }

    private setupCanvas = () => {
        this.ctx.canvas.width = $(window).width();
        this.ctx.canvas.height = this.data.length * this.ps;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    }

    private setupEasing = () => {

        let lowerLimit, upperLimit;
        this.easing = [];

        for(let i = 0; i < this.data.length; i++) {
            
            lowerLimit = this.r(0, .25);
            upperLimit = this.r(0, .25 - lowerLimit);

            this.easing.push(<Easing>{
                func: this.easeInQuad,
                ll: lowerLimit,
                ul: upperLimit,
                direction: this.r(0, 1) < .5 ? 0 : 1
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