import * as e from 'express'
import * as m from 'multer'
import * as jimp from 'jimp'

export class Analyzer {

    public static PS = 10;
    private image: any; // Write some definitions already
    private result;
    
    constructor (public imageFile: Express.Multer.File, public res: e.Response) { }

    public getBrightness() {
        
        jimp.read(this.imageFile.buffer, (err, image) => {
            this.image = image;
            this.fitToPatchSize();
            this.initResult(this.image.bitmap.width, this.image.bitmap.height);
            
            this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, (x: number, y: number, idx: number) => {
                
                let pxl = this.image.bitmap.data;
                this.result[x][y] = Math.round(0.2126*pxl[idx] + 0.7152*pxl[idx + 1] + 0.0722*pxl[idx + 2]);

                if(x == this.image.bitmap.width - 1 && y == this.image.bitmap.height -1) {

                    image.getBase64(this.image._originalMime, (fu, base) => {
                        this.res.send({ result: this.result, source: base });
                        this.res.status(200);
                    });
                }
            });
        })
    }


    private printResult() {

        for(let i = 0; i < this.result.length; i++) {
            let s = "";

            for(let j = 0; j < this.result[i].length; j++) 
                s += this.pad(4, this.result[i][j], ' ');

            console.log(s);
        }
    }

    private pad(width: number, string: string, padding: string): string { 
        return (width <= string.length) ? string : this.pad(width, padding + string, padding)
    }

    private initResult(x: number, y: number) {
        this.result = [];
        for(let i = 0; i < x; i++) {
            this.result.push(new Array(y));
        }
    }

    private fitToPatchSize(): any {

        let width = this.image.bitmap.width;
        let height = this.image.bitmap.height;

        this.image.resize(Math.round(width / Analyzer.PS), Math.round(height / Analyzer.PS));
    }

    private readBrightness(): number[] {
        
        let result = new Array;

        this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, function(x, y, idx) {
            console.log(x + ', ' + y + ': ', this.bitmap.data);
        })

        // for(let row = 0; result.length < this.image.bitmap.width / Analyzer.PS; row++) {
            
        //     result[row] = new Array;

        //     for (let col = 0; col < this.image.bitmap.height / Analyzer.PS; col++) {

        //         this.image.clone().crop(row * Analyzer.PS, col * Analyzer.PS, (row + 1) * Analyzer.PS, (col + 1) * Analyzer.PS);

        //         this.image.scan(row * Analyzer.PS, col * Analyzer.PS, 
        //         (row + 1) * Analyzer.PS, (col + 1) * Analyzer.PS, function (x, y, idx) {
        //             console.log(row + ', ' + col + ': ' + this.bitmap.data[0]);
        //             result[row].push(this.bitmap.data[0]);
        //         });
        //     }
        // }

        return undefined;
    }
}
