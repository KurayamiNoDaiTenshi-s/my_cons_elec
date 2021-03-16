import * as express from 'express';
import * as bodyParser from 'body-parser';
import {Sequelize} from 'sequelize-typescript';
import * as path from 'path';
import * as _ from 'lodash';
import * as dbConfig from './config/db.json';
import {Parameter} from "./models/Parameter";

// import {router as stuffRoutes} from "./routes/stuff";
// import {router as userRoutes} from './routes/user';
// let sequelize = new Sequelize(dbConfig["dev"])
let devEnv: string = process.env.node_dev_env;
if (devEnv === null) {
    console.log('No specific dev environment configuration set/found switching to default');
    devEnv = 'defaultDevEnv';
}
const app = express();
const sequelize = new Sequelize(dbConfig[devEnv]);
sequelize.addModels([__dirname + '/models/*.ts'])
Parameter.findAll({mapToModel:true}).then(parameters=>{
    const parameterMap = new Map();
    _.forEach(parameters,parameter=>{
        parameterMap.set(parameter.key,parameter.value)
    })
    app.set('parameters',parameterMap);
}).catch(err=>{
    console.log(`Error while trying to fetch the parameter table in the database : ${err}`)
})
/*UserToken.findOne({where: {tokenString: 'tototiti'}}).then(token => {
    if (token === null) {
        let token = new UserToken({tokenString: 'tototiti', createdBy: 'SYS_ADM'});
        token.save();
        console.log('creating token....')
    } else {
        console.log('token already exist skipping creation...')
    }
});
User.findOne({where: {email: 'angelo.basso.pro@gmail.com'}}).then(user => {
    if (user === null) {
        let user = new User({
            firstName: 'AngelO',
            lastName: 'BASSo',
            email: 'angelo.basso.pro@gmail.com',
            password: 'tititututoto',
            userTokenUid: 1,
            createdBy: 'SYS_ADM'
        })
        user.save();
        console.log('creating user...')
    } else {
        console.log('user exist skipping creation...')
    }
})*/
// mongoose.connect('mongodb+srv://learn-expressjs:BORbY6H68uA8LvWb@tuto-express-mongodb.mzjeg.mongodb.net/test?retryWrites=true&w=majority')
//     .then(() => console.log('MongoDb connection success'))
//     .catch(() => console.log('MongoDb connection failed'));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.use(bodyParser.json());
// app.use('/images', express.static(path.join(__dirname, 'images')))
// app.use('/api/stuff',stuffRoutes)
// app.use('/api/auth',userRoutes)
export {app}
