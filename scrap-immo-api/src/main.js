import Koa from 'koa';
import route from 'koa-route';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import {papService} from './services/pap.service';
import {apiLoadAds} from './services/seloger.service';
import {updateAd} from './services/announces.repository';
import {getAnnounces} from './services/annouces.service';

const app = new Koa();

app.use(cors());
app.use(bodyParser());

app.use(route.get('/', ctx => {
    ctx.body = 'Hello world';
}));

app.use(route.get('/seloger', async (ctx) => {
    console.log('route /ads');
    ctx.body = await apiLoadAds({zipInternalCodes: ['750114']});
}));

app.use(route.get('/pap', async (ctx) => {
    console.log('route /pap');
    ctx.body = await papService.getAnnounces();
}));

app.use(route.get('/ads', async (ctx) => {
    console.log('route /ads');

    const {zipCodes, priceMin, priceMax, sizeMin, sizeMax} = {zipCodes: '75014', ...ctx.request.query};

    ctx.body = await getAnnounces({
        zipCodes: zipCodes.split(','),
        priceMin,
        priceMax,
        sizeMin,
        sizeMax
    });
}));

app.use(route.put('/ads/:id', async (ctx, id) => {
    console.log('route /ads/' + id, ctx.request.body);

    ctx.body = await updateAd(ctx.request.body)
}));

const port = process.env.PORT || 3000;

console.log('Started at port ', port)

app.listen(port);