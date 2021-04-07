import validator from "validator";
import {User} from '../models/User'
import {generateToken} from './userToken';

export function inviteNewUser(req, res) {
    if (!req.body.email) {
        res.status(400).json({'error': `missing 'email' property `});
    }
    let email: string = req.body.email;
    if (!validator.isEmail(email)) {
        res.status(400).json({'error': `The value for the property email : ${email} is not a valid email`});
    }
    User.findOne({where: {"email": email}}).then(user => {
        //TODO:supprimer le test false empéchant l'éxécution du code de vérification d'unicité des mails
        if (user instanceof User && false) {
            res.status(400).json({'error': `cannot invite user with email ${email} because this email is already used`});
        }
        const tokenSaltRound = parseInt(res.app.get('parameters').get('TOKEN_SALT_ROUND'));
        const tokenSalt = res.app.get('parameters').get('TOKEN_SALT');
        generateToken(tokenSalt, tokenSaltRound).then(token => {
            const transporter = req.app.get('nodemailerTransporter');
            const accessToken = req.app.get('googleOAuth2AccessToken');
            const refreshToken = req.app.get('googleOAuth2RefreshToken');
            const user = req.app.get('googleOAuth2User');
            const userDisplayName = req.app.get('googleOAuth2UserDisplayName');
            const env = req.app.get('env');
            let link = `${env.frontAppBaseUrl}/signup/${token}`
            transporter.sendMail({
                from: `${userDisplayName} <${user}>`,
                to: email,
                subject: 'You have been invite to join the Energy consumption app community',
                html: `<p>Hi,</p>
                <p>You just have been invite to join the Energy consumption app community. You can create your account by following this <a href="${link}">link</a></p>
<p> or if the link is not working you can copy and paste this : ${link} into your browser</p>
<p>Regards,</p>
<p>Admin from my cons elec app</p>`,
                auth: {
                    user: user,
                    accessToken: accessToken.access_token,
                    refreshToken: refreshToken,
                    expires: accessToken.expiry_date
                }
            }).then(() => {
                res.status(200).json({message: 'mail send successfully'})
            }).catch(err => {
                console.log(err);
                res.status(400).json({err})
            })
        });
    })

}

export function testNodeMailer(req, res) {
    const transporter = req.app.get('nodemailerTransporter');
    const accessToken = req.app.get('googleOAuth2AccessToken');
    const refreshToken = req.app.get('googleOAuth2RefreshToken');
    const user = req.app.get('googleOAuth2User');
    const userDisplayName = req.app.get('googleOAuth2UserDisplayName');
    transporter.sendMail({
        from: `${userDisplayName} <${user}>`,
        to: 'angelo67170@gmail.com',
        subject: 'Test message',
        text: 'test mail',
        auth: {
            user: user,
            accessToken: accessToken.access_token,
            refreshToken: refreshToken,
            expires: accessToken.expiry_date
        }
    }).then(() => {
        res.status(200).json({message: 'mail send successfully'})
    }).catch(err => {
        console.log(err);
        res.status(400).json({err})
    })
}
