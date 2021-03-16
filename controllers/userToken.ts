import * as bcrypt from 'bcrypt';

export function generateToken(tokenSalt: string, tokenSaltRound: number): Promise<string> {
    return bcrypt.hash(`${tokenSalt}_${new Date().toISOString()}`, tokenSaltRound);
}

export function getToken(req, res) {
    const tokenSaltRound = parseInt(res.app.get('parameters').get('TOKEN_SALT_ROUND'));
    const tokenSalt = res.app.get('parameters').get('TOKEN_SALT');
    generateToken(tokenSalt, tokenSaltRound).then(token => {
        console.log(token);
        res.status(200).json({message: 'Generation ok...'});
    }).catch(err => {
        console.log(err);
        res.status(400).json({error:err.message});
    });

}

export function checkToken(req, res) {

}

export function deleteToken(req, res) {

}

export function setTokenUsed(req, res) {

}
