const util = require('util');
const connection = require('../database/config')
var bcrypt = require('bcryptjs');
const connectionUtil = util.promisify(connection.query).bind(connection);
const otpGenerator = require('otp-generator')
const sendEmail = require('../utils/email')
const forgotSendEmail = require('../utils/forgotEmail')
const {
    issueJWT
} = require('../utils/token')
const notification =require('../utils/notification')

module.exports.createNewUser = async (req, res) => {
    try {
        let {
            name,
            email,
            password,
            mobile_no,
            address
        } = req.body

        let profile_image = req.file.originalname;
       
        let salt = await bcrypt.genSaltSync(10);
        let hashPassword = await bcrypt.hash(password, salt)
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        let userObject = {
            name,
            email,
            password: hashPassword,
            mobile_no,
            address,
            profile_image,
            code: otp,
            is_verified: 0, // o is not verified 
            is_deleted: 0 // 0 is not deleted
        }
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length == 0) {
            let emailSendedToUser = await sendEmail.mail(email, otp, name)
            let newUserData = await connectionUtil(
                `insert into users set ?`, userObject
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'New User Created Successfully',
                data: userObject
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This User Is Already Exits',
                data: checkUser
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.resendVerificationCode = async (req, res) => {
    try {
        let {
            email
        } = req.body
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) {
            let emailSendedToUser = await sendEmail.mail(email, otp, checkUser[0].name)
            let updateCode = await connectionUtil(
                `update users set code = '${otp}' where email = '${email}'`
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'Code Successfully Resended To Your Mail Address',
                data: updateCode
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid',
                data: ""
            })
        }

    } catch (error) {
        console.log(error.message)
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })

    }
}

module.exports.verifyUser = async (req, res) => {
    try {
        let {
            email,
            code
        } = req.body
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) { // check user email is valid or not

            if (checkUser[0].is_verified == 1) { // check user verification is done or not
                res.json({
                    status: false,
                    statusCode: 400,
                    message: 'Your Account Is Already Verified ',
                    data: ''
                })
            } else {
                if (checkUser[0].code == code) { // check user verification is code valid on not
                    let verifiedUser = await connectionUtil(
                        `UPDATE users
                    SET code = '0', is_verified= '1'
                    WHERE email = '${email}'; `
                    )
                    res.json({
                        status: true,
                        statusCode: 200,
                        message: 'Your Account Is Verified Successfully',
                        data: verifiedUser
                    })
                } else {
                    res.json({
                        status: false,
                        statusCode: 400,
                        message: 'Your Code Is Not Valid',
                        data: ""
                    })
                }
            } // close of else already verified

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid ',
                data: ''
            })
        }

    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })

    }
}

module.exports.login = async (req, res) => {
    try {
        let {
            email,
            password
        } = req.body
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) {

            if (checkUser[0].is_deleted == 0) {

                if (checkUser[0].is_verified == 1) {

                    let checkPassword = await bcrypt.compare(password, checkUser[0].password)
                    if (checkPassword) {
                        // token payload created
                        const payload = {
                            id: checkUser[0].id,
                            email: checkUser[0].email
                        }
                        // token created
                        let token = await issueJWT(payload)
                        res.json({
                            status: true,
                            statusCode: 200,
                            message: 'User Login Successfully',
                            data: checkUser,
                            token: token
                        })

                    } else {
                        res.json({
                            status: false,
                            statusCode: 400,
                            message: 'You Entered Wrong Password',
                            data: ""
                        })
                    } // close of is password else

                } else {
                    res.json({
                        status: false,
                        statusCode: 400,
                        message: 'This User Account Is Not Verified',
                        data: ""
                    })
                } // close of is verified else

            } else {
                res.json({
                    status: false,
                    statusCode: 400,
                    message: 'This User Account Is Deleted',
                    data: ""
                })
            } // close of is deleted else

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}



module.exports.userProfile = async (req, res) => {
    try {
        let userId = req.user.id;
        let checkUser = await connectionUtil(
            `select * from users where id = '${userId}' `
        )
        if (checkUser.length > 0) {
            res.json({
                status: true,
                statusCode: 200,
                message: 'User Profile Showed Successfully',
                data: checkUser
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'User Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.updateProfile = async (req, res) => {
    try {
        let userId = req.user.id;
        let {
            name,
            mobile_no,
            address
        } = req.body
        let profile_image = req.file.originalname;
       

        let checkUser = await connectionUtil(
            `select * from users where id = '${userId}' `
        )
        if (checkUser.length > 0) {
            let updateUser = await connectionUtil(
                `update users set name='${name}',mobile_no='${mobile_no}',address='${address}',profile_image='${profile_image}' where id='${userId}' `
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'User Profile Showed Successfully',
                data: updateUser
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'User Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.deleteProfile = async (req, res) => {
    try {
        let userId = req.user.id;
        let checkUser = await connectionUtil(
            `select * from users where id = '${userId}' `
        )
        if (checkUser.length > 0) {
            let deleteUser = await connectionUtil(
                `update users set is_deleted='1' where id='${userId}' `
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'User Deleted Successfully',
                data: deleteUser
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'User Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.changePassword = async (req, res) => {
    try {
        let userId = req.user.id;
        let {
            newPassword
        } = req.body
        
        let checkUser = await connectionUtil(
            `select * from users where id = '${userId}' `
        )
        if (checkUser.length > 0) {

            let salt = await bcrypt.genSaltSync(10);
            let hashPassword = await bcrypt.hash(newPassword, salt)

            let updatePassword = await connectionUtil(
                `update users set password='${hashPassword}' where id='${userId}' `
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'User Password Changed Successfully',
                data: updatePassword
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'User Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        let {
            email
        } = req.body
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) {

            let otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false
            });
            let emailSendedToUser = await sendEmail.mail(email, otp, checkUser[0].name)
            let updateOtp = await connectionUtil(
                `update users set code='${otp}' where email='${email}' `
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'Otp Sended To Your Email Address Successfully',
                data: updateOtp
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.forgotChangePassword = async (req, res) => {
    try {
        let {
            email,
            code,
            password
        } = req.body
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) {

            if (checkUser[0].code == code) {
                let salt = await bcrypt.genSaltSync(10);
                let hashPassword = await bcrypt.hash(password, salt)
                let updatePassword = await connectionUtil(
                    `update users set password='${hashPassword}' where email='${email}' `
                )
                res.json({
                    status: true,
                    statusCode: 200,
                    message: 'Password Changed Successfully',
                    data: updatePassword
                })
            } else {
                res.json({
                    status: false,
                    statusCode: 400,
                    message: 'Please Enter A Valid Otp',
                    data: ""
                })
            }


        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.forgotPasswordLink = async (req, res) => {
    try {
        let {
            email
        } = req.body
        let checkUser = await connectionUtil(
            `select * from users where email = '${email}' `
        )
        if (checkUser.length > 0) {

            const payload = {
                id: checkUser[0].id,
                email: checkUser[0].email
            }
            let token = await issueJWT(payload)
            let link = `http://localhost:3000/api/v1/router/${token}`
            let emailSendedToUser = await forgotSendEmail.forgotEmail(email, link, checkUser[0].name)
            let updateToken = await connectionUtil(
                `update users set token='${token}' where email='${email}' `
            )
            res.json({
                status: true,
                statusCode: 200,
                message: 'Link Sended To Your Email Address Successfully',
                data: updateToken
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Email Address Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.forgotChangePasswordLink = async (req, res) => {
    try {
        let Token = req.params.token;
        let {
            password
        } = req.body;
        let checkUser = await connectionUtil(
            `select * from users where token = '${Token}' `
        )
        if (checkUser.length > 0) {
            let salt = await bcrypt.genSaltSync(10);
            let hashPassword = await bcrypt.hash(password, salt)
            let updatePassword = await connectionUtil(
                `update users set password='${hashPassword}',token='0' where id = '${checkUser[0].id}'  `
            )

            res.json({
                status: true,
                statusCode: 200,
                message: 'Password Changed Successfully',
                data: updatePassword
            })

        } else {
            res.json({
                status: false,
                statusCode: 400,
                message: 'This Token Is Not Valid',
                data: ""
            })
        }
    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}

module.exports.sendNotification = async (req, res) => {
    try {
        
        let { message }= req.body;
        let checkNotification = notification(message)

            res.json({
                status: true,
                statusCode: 200,
                message: 'Notification Sended Successfully',
                data: checkNotification
            })

    } catch (error) {
        res.json({
            status: false,
            statusCode: 400,
            error: error.message,
            data: ''
        })
    }
}