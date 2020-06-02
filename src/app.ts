import {ModuleBoot} from "./core"
import { join } from 'path'

let { app } = new ModuleBoot({
    root: join(__dirname, '.')
})

app.listen(3000, () => {
    console.log('启动')
})
