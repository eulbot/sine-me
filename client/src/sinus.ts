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
    private PS: number;

    private easing: Easing[];
    private sf: number;
    private ef: number;

    constructor (public canvas: HTMLCanvasElement) { 
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    }

    public process = (data: number[][]) => {

        this.data = data;
        this.PS = 20;
        this.ctx.canvas.width = $(window).width();
        this.ctx.canvas.height = this.data.length * this.PS;
        this.ctx.lineWidth = .5;
        
        this.setupEasing();
        this.calcSines();
        this.ef = 0;

        this.draw();
    }

    private calcSines = () => {

        let w = this.canvas.width, h = this.canvas.height;
        let xs = _.range(0, this.data[0].length).map((x) => Math.round(w * x / (this.data[0].length - 1)));
        let step = xs.length / w;

        for(let row = 0; row < this.data.length; row++) {
            let dent = this.data[row].map((x) => this.PS - (x * this.PS / 255));
            this.data[row] = spline.getCurvePoints(_.flatten(_.zip(xs, dent)), .5, w / xs.length);
            
            let phase = 0;
            for(let i = 0; i < this.data[row].length; i++) {

                if(i % 2 == 0) {

                    let delta = i > 0 ? this.data[row][i] - this.data[row][i - 2] : 0;
                    let fqcy = this.data[row][i + 1];
                    let amount = (1 - (this.PS - fqcy) / this.PS);

                    phase += delta * amount / 2;
                    let y = Math.sin(phase) * this.PS / 2 * amount;
                    this.data[row][i + 1] = y;
                }
            }
        }   

    }

    private draw = () => {

        let w = this.canvas.width;
        let h = this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        this.sf = this.ef;
        this.ef += 2;
        
        for (let i = 0; i < this.data.length; i++) {

            let row = this.data[i], er = this.easing[i];
            let offset = (i * this.PS) + this.PS / 2;
            var x_from = 2 * Math.round(er.func(this.sf / w, er.ll, er.ul) * w / 2);
            var x_to = 2 * Math.round(er.func(this.ef / w, er.ll, er.ul) * w / 2);

            this.ctx.moveTo(this.data[i][x_from * 2], (this.data[i][x_from * 2 + 1]) + offset);
            for(let x = x_from + 2; x <= x_to; x++) {
                this.ctx.lineTo(row[x * 2], row[x * 2 + 1] + offset);
            }   
        }

        this.ctx.stroke();

        if(this.ef <= this.data[0].length / 2) {
            setTimeout(() => {
                window.requestAnimationFrame(this.draw);
            }, 1000 / 60);
        }
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
                direction: this.r(0, 1) < .5 ? 0 : 0
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