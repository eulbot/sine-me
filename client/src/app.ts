import * as $ from 'jquery';

module sineme.client {

    class app {

        constructor () {
            
            $('#image-upload').change(this.upload);
        }

        private upload(e: JQueryEventObject) {
            
            let image = <HTMLInputElement>e.target;

            if(image.files && image.files.length > 0) {
                $.ajax({
                    url: '/upload',
                    data: image.files[0],
                    type: 'POST',
                    contentType: false,
                    processData: false
                }).done(() => {
                    console.log('weee');
                }).fail(() => {
                    console.log('aww shoot');
                });
            }
        }
    }

    $(() => {
        new app();
    });
}