import * as e from 'express'
import * as m from 'multer'
import * as jimp from 'jimp'
import * as _ from 'lodash'
import * as spline from 'cardinal-spline-js'

export class Analyzer {

    public static PS = 10;
    private image: any; // Write some definitions already
    private result;
    
    constructor (public destination: string, public filename, public screnWidth: number, public res: e.Response) { }

    public process() {
    
        jimp.read(this.destination.concat(this.filename), (err, image) => {

            if(!!err) {
                this.res.status(500).send(err.message);
                return;
            }
            
            this.image = image;
            this.fitToPatchSize();
            this.initResult(this.image.bitmap.height, this.image.bitmap.width);

            this.image.scan(0, 0, this.image.bitmap.width, this.image.bitmap.height, (x: number, y: number, idx: number) => {
                
                let pxl = this.image.bitmap.data;
                this.result[y][x] = Math.round(0.2126*pxl[idx] + 0.7152*pxl[idx + 1] + 0.0722*pxl[idx + 2]);
            
                if(x == this.image.bitmap.width - 1 && y == this.image.bitmap.height -1) {

                    image.getBase64(this.image._originalMime, (fu, base) => {
                        setTimeout(() => {
                            this.res.send({ result: this.result, patchsize: Analyzer.PS, filename: this.filename, source: base });
                            this.res.status(200);
                        }, 2000);
                    });
                }
            });
        });
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

        let targetWidth = Math.round(this.screnWidth / Analyzer.PS);
        let targetHeight = height * (targetWidth / width);

        this.image.resize(targetWidth, targetHeight);
    }
}
