import * as e from 'express';

module sineme.service {
    let msg = 'ts works as well.. really?';
    let service = e();
    
    service.use('/', e.static(__dirname + '/../../client'));

    service.get('/hi', (req: e.Request, res: e.Response) => {
        res.end('oh hey!');
    });

    service.post('/upload', (req: e.Request, res: e.Response) => {
        var x = req;
        res.status(200).json({status:"ok"});
    });

    service.listen(1987, () => {
        console.log('listening..');
    });
}