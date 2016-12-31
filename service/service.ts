import * as e from 'express';
import * as m from 'multer';
import * as fs from 'fs';
import * as c from 'node-cache';

import { Analyzer } from './analyzer';

let service = e();
let cache = new c({ stdTTL: 300, checkperiod: 30 });
let upload = m({ dest: './uploads', limits: { fileSize: 5242880} });

// Remove default route in prod
service.use('/', e.static(__dirname + '/../../client'));

// Image upload
service.post('/upload', upload.single('image'), (req: e.Request, res: e.Response) => {

    let filename = req.body.filename;

    if (filename) {
        cache.get(filename, (err, cached) => {
            if(!cached) {
                console.log(new Date().toLocaleString() + ': Key '.concat(filename).concat(' not found'));
                res.status(410).send();
            }
            else {
                console.log(new Date().toLocaleString() + ': Read from cache '.concat(filename));
                cache.ttl(filename, () => {
                    let analyzer = new Analyzer('./uploads/', filename, req.body.width, res);
                    analyzer.process();
                });
            }
        });
    }
    else if (cache.set(req.file.filename, true)) {
        console.log(new Date().toLocaleString() + ': Caching '.concat(req.file.filename));
        let analyzer = new Analyzer('./uploads/', req.file.filename, req.body.width, res);
        analyzer.process();
    }
});

cache.on('expired', function(key, value ){

    fs.unlink('./uploads/'.concat(key), (err) => {
        if (!err)
            console.log(new Date().toLocaleString() + ': Key '.concat(key).concat(' removed'));
    });
});

service.listen(1987, () => {
    console.log('listening on 1987..');
});