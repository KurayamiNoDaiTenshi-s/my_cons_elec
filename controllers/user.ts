import validator from "validator";
import {User} from '../models/User'
import {default as axios} from 'axios';
import * as addUserSchemaValidator from '../ajv-validator-schema/addUser.json'
import Ajv from "ajv";
import * as _ from 'lodash';

const ajv = new Ajv({allErrors: true});

async function generateToken() {
    return await axios.request({baseURL: 'http://localhost:3000/api/userToken/generate', method: 'post'});
}

export function invite(req, res) {
    const env = req.app.get('env');
    if (!req.body.email) {
        res.status(400).json({'error': `missing 'email' property `});
    }
    let email: string = req.body.email;
    if (!validator.isEmail(email)) {
        res.status(400).json({'error': `The value for the property email : ${email} is not a valid email`});
    }
    User.findOne({where: {"email": email}}).then(user => {
        //TODO:supprimer le test false empéchant l'éxécution du code de vérification d'unicité des mails
        if (user instanceof User && env.isProdEnv) {
            res.status(400).json({'error': `cannot invite user with email ${email} because this email is already used`});
        }
        generateToken().then(response => {
            const transporter = req.app.get('nodemailerTransporter');
            const accessToken = req.app.get('googleOAuth2AccessToken');
            const refreshToken = req.app.get('googleOAuth2RefreshToken');
            const user = req.app.get('googleOAuth2User');
            const userDisplayName = req.app.get('googleOAuth2UserDisplayName');
            let link = `${env.frontAppBaseUrl}/signup/${response.data.token}`
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

export function create(req, res) {
    const schemaValidator = ajv.compile(addUserSchemaValidator);
    let newUserData = req.body;
    const valid = schemaValidator(newUserData);
    if (!valid) {
        let errMsg = '';
        const errors = schemaValidator.errors;
        const missingProperties = _.flatMap(_.filter(errors, error => {
            return error.keyword === 'required'
        }), mpError => {
            return mpError.params.missingProperty
        })
        const invalidValuesProperties = _.flatMap(_.filter(errors, error => {
            return error.keyword === 'pattern'
        }), pMError => {
            return pMError.instancePath.substr(1)
        })
        console.log(invalidValuesProperties);

        const invalidTypeProperties = _.flatMap(_.filter(errors, error => {
            return error.keyword === 'type'
        }), tError => {
            let errInfo = {};
            errInfo['pName']= tError.instancePath.substr(1);
            errInfo['pExpectedType'] = tError.params.type;
            return errInfo;
        })
        console.log(invalidTypeProperties);
        
        if(missingProperties.length > 0){
            if(missingProperties.length === 1){
                errMsg += `The property ${missingProperties[0]} was required but wasn't`
            }else{
                errMsg += `The properties ${missingProperties} where required but none of theme where`
            }
            errMsg += ' found inside the request body'
        }
        res.status(400).json({message:errMsg});
    } else {
        res.status(201).json({message: 'User successfully created'});
    }

}
