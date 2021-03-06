import * as I from './interfaces';
import * as S from './sinus';
import * as $ from 'jquery';

class App {

    private sinus: S.Sinus;
    private image: File;
    private filename: string;
    private clientWidth: number;

    private inputElement: HTMLInputElement;
    private canvasElement: HTMLCanvasElement;
    private failed: boolean;

    constructor () {
        
        let delayedResize = undefined;
        this.inputElement = <HTMLInputElement>document.querySelector("#image-upload");
        this.canvasElement = <HTMLCanvasElement>document.querySelector("#canvas-result");
        this.sinus = new S.Sinus(this.canvasElement);
        this.clientWidth = $(window).width();

        $(window).resize(() => {
            clearTimeout(delayedResize);
            delayedResize = setTimeout(this.resized, 333);
        });

        $(this.inputElement).change(this.readImage);
    }

    private upload = (immediate?: boolean) => {
        
        let formData = new FormData();

        if(this.filename)
            formData.append('filename', this.filename)
        else
            formData.append('image', this.image);
        
        formData.append('width', this.clientWidth)

        $.ajax({
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: (response) => this.process(<I.ServiceResponse>response, immediate),
            error: (response) => {

                if(response.status == 410) {
                    this.filename = undefined;
                    this.upload(true);
                }
                else {
                    this.failed = true;
                    this.showError();
                }
            }
        });
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
        this.filename = response.filename;
        immediate = immediate || !$("#cb5").is(':checked');

        this.sinus.process(response.result, response.patchsize, this.clientWidth, immediate);
    }

    private resized = () => {

        if(this.image && this.clientWidth !== $(window).width()) {
            this.clientWidth = $(window).width();
            this.showSpinner(() => this.upload(true));
            
        }
    }

    private showSpinner = (cb?: () => any) => {

        $('canvas').hide();
        $('body').removeClass('bg-default bg-white').addClass('bg-black');
        $('.wrapper').fadeOut(300, () => {
            $('.spinner-wrapper').fadeIn(200);
            if(cb) cb();
        });
    }

    private hideSpinner = () => {
        $('canvas').show();
        $('.spinner-wrapper').fadeOut(300);
        $('body').removeClass('bg-black').addClass('bg-white');
    }

    private showError = () => {
        
        $('body').removeClass('bg-white').addClass('bg-default');
        $('canvas').hide();
        $('.spinner-wrapper').fadeOut(200, () => {
            $('.error-wrapper').fadeIn(200);
        });
    }
}

$(() => {
    new App();
});