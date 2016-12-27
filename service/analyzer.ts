import * as e from 'express'
import * as m from 'multer'
import * as jimp from 'jimp'

export class Analyzer {

    public static PS = 10;
    private image: any; // Write some definitions already
    private result;
    
    constructor (public imageFile: Express.Multer.File, public width: number, public res: e.Response) { }

    public getBrightness() {
        
        jimp.read(this.imageFile.buffer, (err, image) => {
            this.image = image;
            
            if(image.bitmap.width > 200)
                this.fitToPatchSize();

            this.initResult(this.image.bitmap.height, this.image.bitmap.width);

            this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, (x: number, y: number, idx: number) => {
                
                let pxl = this.image.bitmap.data;
                this.result[y][x] = Math.round(0.2126*pxl[idx] + 0.7152*pxl[idx + 1] + 0.0722*pxl[idx + 2]);
              
                if(x == this.image.bitmap.width - 1 && y == this.image.bitmap.height -1) {

                    image.getBase64(this.image._originalMime, (fu, base) => {
                        this.res.send({ result: this.result, source: base });
                        this.res.status(200);
                    });
                }
            });
        })
    }

    private initResult(y: number, x: number) {
        this.result = [];
        for(let i = 0; i < y; i++) {
            this.result.push(new Array(x));
        }
    }

    private fitToPatchSize(): any {

        let width = this.image.bitmap.width;
        let height = this.image.bitmap.height;

        this.image.resize(Math.round(width / Analyzer.PS), Math.round(height / Analyzer.PS));
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
}
