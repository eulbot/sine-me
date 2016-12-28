import * as e from 'express';
import * as m from 'multer';

import { Analyzer } from './analyzer';

let service = e();
let upload = m({ storage: m.memoryStorage() });

// Default route
service.use('/', e.static(__dirname + '/../../client'));

// Image upload
service.post('/upload', upload.single('image'), (req: e.Request, res: e.Response) => {

    try {
        let analyzer = new Analyzer(req.file, req.body.width, res);
        analyzer.process();
    }
    catch (ex) {
        res.status(500).send('You killed it!')
    }
});

service.listen(1987, () => {
    console.log('listening..');
});