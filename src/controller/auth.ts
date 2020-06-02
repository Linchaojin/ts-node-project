import {Controller, RequestMapping, RequestMethod} from '../core'

const config = {
    uid: '20190104143740849-DF0C-690E07E54',
    client_id: 'hyjcclient',
    client_secret: '6fa2a8dc36024eecb55136d3c8f8c208',
    code:'123456',
    access_token: 'skiew234i3i4o6uy77b4k3b3v2j1vv53j'
}

// @Controller('/idp/oauth2')
export class Auth {

    @RequestMapping('/authorize', RequestMethod.GET)
    authorize(ctx) {
        let {redirect_uri} = ctx.query
        let redirectUri = `${redirect_uri}?code=123456`
        ctx.redirect(redirectUri)
    }

    @RequestMapping('/getToken', RequestMethod.POST)
    getToken(ctx) {
        let {client_id, client_secret, grant_type, code} = ctx.query
        if (!client_id) {
            ctx.body = {
                "errcode": "1001",
                "msg": "缺少参数client_id"
            }
            return
        }
        if (client_id !== config.client_id) {
            ctx.body = {
                "errcode": "1005",
                "msg": "参数client_id非法"
            }
            return
        }
        if (!client_secret) {
            ctx.body = {
                "errcode": "1008",
                "msg": "缺少参数client_secret"
            }
            return
        }
        if (client_secret !== config.client_secret) {
            ctx.body ={
                "errcode": "1012",
                "msg": "参数client_secret非法"
            }
            return
        }
        if (!code) {
            ctx.body = {
                "errcode": "1009",
                "msg": "缺少参数code"
            }
            return
        }
        if (code !== config.code) {
            ctx.body ={
                "errcode": "1014",
                "msg": "参数code非法"
            }
            return
        }
        if (!grant_type) {
            ctx.body = {
                "errcode": "1010",
                "msg": "缺少参数grant_type"
            }
            return
        }
        ctx.body = {
            "access_token":"skiew234i3i4o6uy77b4k3b3v2j1vv53j",
            "expires_in":"1500",
            "refresh_token":"iewoer233422i34o2i34uio55iojhg6g",
            "uid": config.uid
        }
    }

    @RequestMapping('/getUserInfo', RequestMethod.POST)
    getUserInfo(ctx) {
        let {client_id, access_token} = ctx.query
        if (!client_id) {
            ctx.body = {
                "errcode": "1001",
                "msg": "缺少参数client_id"
            }
            return
        }
        if (client_id !== config.client_id) {
            ctx.body = {
                "errcode": "1005",
                "msg": "参数client_id非法"
            }
        }
        if (!access_token) {
            ctx.body = {
                "errcode": "2001",
                "msg": "缺少参数access_token "
            }
            return
        }
        if (access_token !== config.access_token) {
            ctx.body = {
                "errcode": "1005",
                "msg": "参数client_id非法"
            }
            return
        }
        ctx.body = {
            "uid": config.uid,
            "spRoleList":[],
            "loginName":"user1"
        }
    }
}
