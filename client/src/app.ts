import * as $ from 'jquery';

namespace sineme.client {

    interface IServiceResponse {
        result: number[],
        source: string
    }

    class app {

        constructor () {
            
            $('#image-upload').change(this.upload);
        }

        private upload = (e: JQueryEventObject) => {
            
            let inputElement = <HTMLInputElement>e.target;
        
            if(inputElement.files && inputElement.files.length > 0) {
                let file = inputElement.files[0];
                let formDate = new FormData();
                formDate.append('image', file);

                let xhr = new XMLHttpRequest();
                xhr.open('POST', '/upload', true);

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        var completed = (e.loaded / e.total) * 100;
                        console.log(completed + '% uploaded');
                    }
                };

                xhr.onload = (e) => {
                    let response = <IServiceResponse>JSON.parse(xhr.response);

                    let img = <HTMLImageElement>document.querySelector("#image-result");
                    img.src = response.source;
                }

                xhr.send(formDate);
            }
        }
    }

    $(() => {
        new app();
    });
}