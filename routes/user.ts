import * as express from 'express';
import * as userCtrl from '../controllers/user';
const router = express.Router();
router.get('/testMail',userCtrl.testNodeMailer);
router.post('/invite',userCtrl.inviteNewUser);
export{router};
