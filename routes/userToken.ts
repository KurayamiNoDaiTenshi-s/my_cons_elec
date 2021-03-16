import * as express from 'express';
const router = express.Router();
import * as userTokenCtrl from '../controllers/userToken'
router.post('/generate',userTokenCtrl.getToken);
export {router}
