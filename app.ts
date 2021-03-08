import * as express from 'express';
import * as bodyParser from 'body-parser';
import {Sequelize} from 'sequelize-typescript';
import * as path from 'path';
import * as dbConfig from './config/db.json';

// import {router as stuffRoutes} from "./routes/stuff";
// import {router as userRoutes} from './routes/user';
// let sequelize = new Sequelize(dbConfig["dev"])
let devEnv: string = process.env.node_dev_env;
if (devEnv === null) {
    console.log('No specific dev environment configuration set/found switching to default');
    devEnv = 'defaultDevEnv';
}
const sequelize = new Sequelize(dbConfig[devEnv]);
// mongoose.connect('mongodb+srv://learn-expressjs:BORbY6H68uA8LvWb@tuto-express-mongodb.mzjeg.mongodb.net/test?retryWrites=true&w=majority')
//     .then(() => console.log('MongoDb connection success'))
//     .catch(() => console.log('MongoDb connection failed'));
const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')))
// app.use('/api/stuff',stuffRoutes)
// app.use('/api/auth',userRoutes)
export {app}
