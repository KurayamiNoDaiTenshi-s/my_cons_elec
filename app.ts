import * as express from 'express';
import * as bodyParser from 'body-parser';
import {Sequelize} from 'sequelize-typescript';
import * as _ from 'lodash';
import * as dbConfig from './config/db.json';
import * as envs from './config/env.json';
import * as nodemailerConfFile from './config/nodemailer.json';
import {Parameter} from "./models/Parameter";
import * as nodemailer from 'nodemailer';
import * as fs from 'fs-extra';
import {google} from 'googleapis';

const OAuth2 = google.auth.OAuth2;
import {router as userTokenRoutes} from "./routes/userToken";
import {router as userRoutes} from "./routes/user";

let runningEnv: string = process.env.eca_running_env;
if (runningEnv === null) {
    console.log('No specific environment configuration set/found switching to default');
    runningEnv = 'defaultDevEnv';
}
const app = express();
const env = envs[runningEnv];
app.set('env',env);
const sequelize = new Sequelize(dbConfig[runningEnv]);
sequelize.addModels([__dirname + '/models/*.ts'])
Parameter.findAll({mapToModel: true,where:{type:'back'}}).then(parameters => {
    const parameterMap = new Map();
    _.forEach(parameters, parameter => {
        parameterMap.set(parameter.key, parameter.value)
    })
    app.set('parameters', parameterMap);
}).catch(err => {
    console.log(`Error while trying to fetch the parameter table in the database : ${err}`)
})
const nodemailerConf = nodemailerConfFile[runningEnv];
let googleApisInfo = JSON.parse(fs.readFileSync(nodemailerConf.auth.pathToClientIdSecret).toString());
const oAuth2 = new OAuth2(
    googleApisInfo.clientId,
    googleApisInfo.clientSecret,
    "https://developers.google.com/oauthplayground"
)
app.set("googleOAuth2RefreshToken", googleApisInfo.refreshToken);
app.set("googleOAuth2User", googleApisInfo.user);
app.set("googleOAuth2UserDisplayName", googleApisInfo.userDisplayName);
oAuth2.setCredentials({
    refresh_token: googleApisInfo.refreshToken,
});
oAuth2.getAccessToken().then(accessToken => {
    app.set("googleOAuth2AccessToken", accessToken.res.data);
    oAuth2.on("tokens", token => {
        console.log(token);
        app.set("googleOAuth2AccessToken", token);
    });
});
app.set('googleOAuth2', oAuth2);
const nodemailerTransporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        type: nodemailerConf.auth.type,
        clientId: googleApisInfo.clientId,
        clientSecret: googleApisInfo.clientSecret,
    }
});
app.set('nodemailerTransporter', nodemailerTransporter);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.use(bodyParser.json());
app.use('/api/userToken', userTokenRoutes);
app.use('/api/users', userRoutes);
export {app}
