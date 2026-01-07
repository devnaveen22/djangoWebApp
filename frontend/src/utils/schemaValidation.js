import * as yup from "yup"

const phoneNumberSchema = yup.string().required('Phone number is required')
.matches(/^[0-9]+$/, 'Phone number must contain only numbers (0–9)')
.length(10,'Phone number must be exactly 10 digits');

const passwordSchema = yup.string().required('Password is required.');

export const registerSchema = yup.object({
    username: yup.string().required('User name is required.'),
    phone_number: phoneNumberSchema,
    password: passwordSchema,
    password2: yup.string()
        .required('Confirm password is required')
        .oneOf([yup.ref('Password')], 'Password must match.'),

})

export const loginSchema = yup.object({
    phone_number: phoneNumberSchema,
    password: passwordSchema,
})