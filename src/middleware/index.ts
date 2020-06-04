import {Injectable, IMiddleWare} from '../core'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import Application from "koa";

@Injectable()
export class MiddleWareFactory implements IMiddleWare{

    init(app: Application): void {
        app.use(koaBody())
        app.use(logger())
        console.log('init middleware')
    }
}
