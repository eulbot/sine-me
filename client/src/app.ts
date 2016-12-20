import * as I from './interfaces';
import * as S from './sinus';
import * as $ from 'jquery';

class App {

    private sinus: S.sinus2;
    private inputElement: HTMLInputElement;
    private canvasElement: HTMLCanvasElement;

    constructor () {
        
        this.inputElement = <HTMLInputElement>document.querySelector("#image-upload");
        this.canvasElement = <HTMLCanvasElement>document.querySelector("#canvas-result");
        this.sinus = new S.sinus2(this.canvasElement);
        $(this.inputElement).change(this.upload);
    }

    private upload = (e: JQueryEventObject) => {
        
        let inputElement = <HTMLInputElement>e.target;
    
        if(inputElement.files && inputElement.files.length > 0) {
            let xhr = new XMLHttpRequest();
            let file = inputElement.files[0];
            let formDate = new FormData();

            formDate.append('image', file);
            xhr.open('POST', '/upload', true);
            xhr.onload = (e) => this.process(<I.ServiceResponse>JSON.parse(xhr.response));
            xhr.send(formDate);
        }
    }

    private process = (response: I.ServiceResponse) => {
        
        let img = <HTMLImageElement>document.querySelector("#image-result");
        img.src = response.source;
        this.sinus.draw(response.result);
    }
}

$(() => {
    new App();
});