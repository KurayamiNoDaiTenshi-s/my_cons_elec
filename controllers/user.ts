import validator from "validator";
import {User} from '../models/User'
import {default as axios} from 'axios';
import * as addUserSchemaValidator from '../ajv-validator-schema/addUser.json'
import Ajv from "ajv";
import * as _ from 'lodash';
import {ResourceNotFoundError} from "../customError/ResourceNotFoundError";


const ajv = new Ajv({allErrors: true});

async function generateToken() {
    return await axios.request({baseURL: 'http://localhost:3000/api/userToken/generate', method: 'post'});
}

async function checkToken(encodedToken: string) {
    return await axios.request({
        baseURL: 'http://localhost:3000/api/userToken/check',
        method: 'post',
        data: {token: encodedToken}
    })
}

async function setTokenIsUsed(encodedToken: string) {
    return await axios.request({
        baseURL: 'http://localhost:3000/api/userToken/setUsed',
        method: 'put',
        data: {token: encodedToken}
    })
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
        const errMsg = 'User creation failed';
        let errDetail = [];
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

        const invalidTypeProperties = _.flatMap(_.filter(errors, error => {
            return error.keyword === 'type'
        }), tError => {
            return `Unexpected type for property ${tError.instancePath.substr(1)}, '${tError.params.type}' type was expected.`
        })
        let i = 0;
        if (missingProperties.length > 0) {
            if (missingProperties.length === 1) {

                errDetail[i] = `The property ${missingProperties[0]} was required but wasn't`
            } else {
                errDetail[i] = `The properties ${missingProperties} where required but none of theme where`
            }
            errDetail[i] += ' found inside the request body'
            i++;
        }
        if (invalidValuesProperties.length > 0) {
            errDetail[i] = 'Unexpected value for ';
            if (invalidValuesProperties.length > 1) {
                errDetail[i] += `properties ${invalidValuesProperties}`;
            } else {
                errDetail[i] += `the property ${invalidValuesProperties[0]}`;
            }
            i++;

        }
        if (invalidTypeProperties.length > 0) {
            for (let j in invalidTypeProperties) {
                errDetail[i] = invalidTypeProperties[j];
                i++;
            }

        }
        res.status(400).json({message: errMsg, details: errDetail});
    } else {
        checkToken(newUserData.token).then(response => {
            const newUser = User.build({...newUserData, ...response.data,createdBy:"SYS_ADM"})
            newUser.save().then(result=>{
                setTokenIsUsed(newUserData.token).then(()=>{
                    console.log(result);
                    res.status(201).json({message: 'User successfully created'});
                })
            }).catch(()=>{
                res.status(400).json({message:'User creation failed'})
            })
        }).catch(request => {
            const err = request.response.data;
            if (err.name === 'ResourceNotFoundError') {
                res.status(400).json({message: 'invalid or expired token'})
            }else{

            }
        })
    }
}
