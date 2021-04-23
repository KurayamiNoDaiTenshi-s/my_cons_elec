import * as bcrypt from 'bcrypt';
import {UserToken} from "../models/UserToken";
import {ResourceNotFoundError} from "../customError/ResourceNotFoundError";
import {QueryTypes, Op} from 'sequelize';

export function generateToken(tokenSalt: string, tokenSaltRound: number): Promise<string> {
    return bcrypt.hash(`${tokenSalt}_${new Date().toISOString()}`, tokenSaltRound);
}

export function getToken(req, res) {
    const parameters = res.app.get('parameters');
    const tokenSaltRound = parseInt(parameters.get('TOKEN_SALT_ROUND'));
    const tokenSalt = parameters.get('TOKEN_SALT');
    generateToken(tokenSalt, tokenSaltRound).then(token => {
            new UserToken({tokenString: token, createdBy: 'SYS_ADM'}).save().then(dbUserToken => {
                const base64Token = Buffer.from(dbUserToken.tokenString, 'utf8').toString('base64')
                res.status(201).json({message: 'Generation ok...', token: base64Token});
            })
        }
    ).catch(err => {
        console.log(err);
        res.status(400).json({error: err.message});
    });

}

export function checkToken(req, res) {
    const decodedToken = Buffer.from(req.body.token, 'base64').toString('utf8');
    UserToken.findOne({
        where: {
            isUsed: false,
            tokenString: decodedToken,
            validityDate: {[Op.or]: {[Op.gte]: new Date(), [Op.is]: null}}
        }
    }).then(userToken => {
        if (userToken !== null && userToken instanceof UserToken) {
            res.status(200).json({userTokenUid: userToken.uid});
        } else {
            res.status(400).send(new ResourceNotFoundError('Invalid token'));
        }
    })
}

export function deleteToken(req, res) {
    UserToken.sequelize.query('SELECT EXISTS(SELECT * FROM my_cons_elec."user" where user_token_uid = :tokenUid)', {
        replacements: {tokenUid: req.params.uid},
        type: QueryTypes.SELECT
    }).then(result => {
        if (!result[0]['exists']) {
            UserToken.sequelize.query('DELETE FROM my_cons_elec.user_token where uid = :tokenUid', {replacements: {tokenUid: req.params.uid}}).then(() => {
                res.status(200).json({message: 'token successfully deleted'});
            }).catch(err => {
                res.status(400).json({error: err.message});
            })
        } else {
            res.status(401).json({message: `Cannot delete this token because he's linked to a user account!`})
        }
    })
}

export function setTokenUsed(req, res) {
    let decodedToken = Buffer.from(req.body.token, 'base64').toString('utf8');
    return UserToken.sequelize.query('UPDATE my_cons_elec.user_token SET is_used = true, updated_at = :updatedAt, updated_by = :updatedBy WHERE token_string = :decodedToken', {
        replacements: {
            decodedToken: decodedToken,
            updatedAt: new Date(),
            updatedBy: 'SYS_ADM'
        }
    }).then(() => {
        res.status(200).json({message: 'token successfully updated'})
    }).catch(err => {
        res.status(400).json({message: err.message})
    })
}
