import * as express from 'express';
const router = express.Router();
import * as userTokenCtrl from '../controllers/userToken'
router.post('/generate',userTokenCtrl.getToken);
router.put('/setUsed',userTokenCtrl.setTokenUsed);
router.delete('/delete/:uid',userTokenCtrl.deleteToken);
router.post('/check',userTokenCtrl.checkToken);
export {router}
