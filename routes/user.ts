import * as express from 'express';
import * as userCtrl from '../controllers/user';
const router = express.Router();
router.post('/invite',userCtrl.invite);
router.post('/signup',userCtrl.create);
export{router};
