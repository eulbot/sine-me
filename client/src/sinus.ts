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
    private sines: number[][];
    private ps: number;

    private easing: Easing[];
    private immediate: boolean;
    private sf: number;
    private ef: number;
    private fx: number;
    private max: number;

    constructor (public canvas: HTMLCanvasElement) { 
        this.ctx = canvas.getContext('2d');
    }

    public process = (data: number[][], patchSize: number, immediate?: boolean) => {

        this.data = data;
        this.ps = patchSize;
        this.render(immediate);
    }

    public render = (immediate?: boolean) => {

        if(!this.data)
            return;

        this.immediate = immediate;
        
        this.setupCanvas();
        this.calcSines();
        this.setupEasing();
        this.draw();
    }

    private calcSines = () => {

        this.sines = [];
        let w = this.canvas.width, h = this.canvas.height;
        let xs = _.range(0, this.data[0].length).map((x) => Math.round(w * x / (this.data[0].length - 1)));

        for(let row = 0; row < this.data.length; row++) {
            this.sines[row] = [];
            let splined: Array<number> = spline.getCurvePoints(_.flatten(_.zip(xs, this.data[row])), .5, this.ps * this.fx);
            let offset = (row * this.ps) + this.ps / 2;
            let phase = this.r(0, 180);

            for (let i = 0; i < splined.length - 1; i += 2) {

                let delta = i > 0 ? splined[i] - splined[i - 2] : 0;
                let pace = Math.abs(this.max - splined[i + 1]);
                phase += (delta * (pace / Math.PI));
                let y = Math.sin(phase * (Math.PI / 180));

                this.sines[row].push(splined[i] * this.fx);
                this.sines[row].push(y * (this.ps * Math.sqrt(pace / this.max) / 2) + offset);
            }
        }   

    }

    private draw = () => {

        let w = this.canvas.width;
        let h = this.canvas.height;
        this.ctx.beginPath();
        this.sf = this.ef;
        this.ef += this.fx;

        for (let i = 0; i < this.sines.length; i++) {

            let row = this.sines[i], er = this.easing[i];
            let from = this.immediate ? 0 : Math.round(er.func(this.sf / w, er.ll, er.ul) * w * this.fx);
            let to = this.immediate ? w * this.fx : Math.round(er.func(this.ef / w, er.ll, er.ul) * w * this.fx);
            let r = er.direction * (this.sines[i].length / 2 - 1);

            this.ctx.moveTo(this.sines[i][Math.abs(r - from) * 2] / this.fx, (this.sines[i][Math.abs(r - from) * 2 + 1]));
            for(let x = from + 2; x <= to; x++) 
                this.ctx.lineTo(row[Math.abs(r - x) * 2] / this.fx, row[Math.abs(r - x) * 2 + 1]);
                
        }

        this.ctx.stroke();

        if(!this.immediate && Math.abs(this.ef - this.sines[0].length + this.ef / 2) > 0) {
            setTimeout(() => {
                window.requestAnimationFrame(this.draw);
            }, 1000 / 48);
        }
    }

    private setupCanvas = () => {

        this.ef = 0;
        this.fx = 4;
        this.max = 255;

        this.ctx.canvas.width = $(window).outerWidth();
        this.ctx.canvas.height = this.data.length * this.ps;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.shadowBlur = 2.5;
        this.ctx.shadowColor = 'rgb(0, 0, 0)';
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    private setupEasing = () => {

        let lowerLimit, upperLimit;
        this.easing = [];

        for(let i = 0; i < this.sines.length; i++) {
            
            lowerLimit = this.r(0, .5);
            upperLimit = this.r(0, .5 - lowerLimit);

            this.easing.push(<Easing>{
                func: this.pickEaseFunc(),
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
        return r < 1 ? this.easeInQuad : r < 2 ? this.easeInQuad : this.easeInQuad;
    }

    private easeInQuad: EaseFunc = (t: number, ll: number, ul: number): number => {
        
        return t < ll ? 0 : t > 1 ? 1 : t >= 1 - ul ? 1 : Math.pow((t - ll) * 1 / (1 - ll - ul), 2)
	}

	private easeOutQuad: EaseFunc = (t: number, ll: number, ul: number): number => {

        return t < ll ? 0 : t > 1 ? 1 : t >= 1 - ul ? 1 : (t - ll) * 1 / (1 - ll - ul) * (2 - (t - ll) * 1 / (1 - ll - ul));
	}
    
	private easeInOutQuad: EaseFunc = (t: number, ll: number, ul: number): number => {
		return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	}
}