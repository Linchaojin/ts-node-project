import {MiddleWareFactory} from '../core'
import error from  'koa-json-error'
import logger from 'koa-logger'
import koaBody from 'koa-body'

@MiddleWareFactory()
export class MiddleWare {

    logger() {
        return logger()
    }

    error() {
        return error()
    }

    koaBody() {
        return koaBody({
            multipart: true,
            formidable: {
                maxFileSize: 200 * 1024 * 1024	// 设置上传文件大小最大限制，默认200M
            }
        })
    }

}
