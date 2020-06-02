import {Controller, RequestMapping, inject} from "../core";
import { DemoService } from '../service/DemoService'

@Controller('/api')
export class Demo {

    @inject()
    readonly d1: DemoService

    @RequestMapping('/getDemo')
    getDemo(ctx) {
        console.log(this.d1.getName())
        ctx.body = this.d1.getName()
    }

    @RequestMapping('/setDemo')
    setDemo(ctx) {
        ctx.body = 'setDemo'
    }
}
