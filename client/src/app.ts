import * as I from './interfaces';
import * as S from './sinus';
import * as $ from 'jquery';

class App {

    private sinus: S.Sinus;
    private image: File;
    private inputElement: HTMLInputElement;
    private canvasElement: HTMLCanvasElement;

    constructor () {
        
        let delayedResize = undefined;
        this.inputElement = <HTMLInputElement>document.querySelector("#image-upload");
        this.canvasElement = <HTMLCanvasElement>document.querySelector("#canvas-result");
        this.sinus = new S.Sinus(this.canvasElement);

        $(window).resize(() => {
            clearTimeout(delayedResize);
            delayedResize = setTimeout(this.resized, 250);
        });

        $(this.inputElement).change(this.readImage);
    }

    private upload = (immediate?: boolean) => {
        
        let xhr = new XMLHttpRequest();
        let formDate = new FormData();

        formDate.append('image', this.image);
        formDate.append('width', $(window).width())
        xhr.open('POST', '/upload', true);
        xhr.onload = (e) => this.process(<I.ServiceResponse>JSON.parse(xhr.response), immediate);
        xhr.send(formDate);
    }

    private readImage = (e: JQueryEventObject) => {
        
        this.showSpinner();
        let inputElement = <HTMLInputElement>e.target;
    
        if(inputElement.files && inputElement.files.length > 0) {
            this.image = inputElement.files[0];
        }

        this.upload();
    }

    private process = (response: I.ServiceResponse, immediate?: boolean) => {
        
        this.hideSpinner();
        let img = <HTMLImageElement>document.querySelector("#image-result");
        img.src = response.source;
        this.sinus.process(response.result, response.patchSize, immediate);
    }

    private resized = () => {

        if(this.image)
            this.upload(true)
    }

    private showSpinner = () => {

        if(!this.image) {
            $('.upload-region').fadeOut(333, () => {
                $('.spinner').fadeIn(200);
            })
            $('.container').fadeIn(200);
        }
    }

    private hideSpinner = () => {
        $('.container').fadeOut(200);
    }
}

$(() => {
    new App();
});