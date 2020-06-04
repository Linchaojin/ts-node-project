import {Injectable,middleware, MiddleWareInit } from '../core'
import error from  'koa-json-error'
import logger from 'koa-logger'
import koaBody from 'koa-body'
import Application from "koa";

// @Injectable()
export class MiddleWareFactory implements MiddleWareInit{


    initGlobalMiddleWare(app: Application): void {
        app.use(koaBody())
        app.use(logger())
        console.log('initGlobalMiddleWare')
    }

    @middleware({urlPatterns: '/api', order: 1})
    test(ctx, next) {

    }
}
