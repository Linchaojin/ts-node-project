import {Controller, RequestMapping} from "../core";

// @Controller('/api')
export class User {
    @RequestMapping('/getUser')
    async getUser(ctx) {
        ctx.body = 'getUser'
    }
    @RequestMapping('/setUser')
    async setUser(ctx) {
        ctx.body = 'setUser'
    }
}
