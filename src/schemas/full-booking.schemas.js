import Joi from 'joi';

export const authResponseSchema = Joi.object({
    token: Joi.string().required()
}).unknown(false);

export const bookingSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    totalprice: Joi.number().integer().required(),
    depositpaid: Joi.boolean().required(),
    bookingdates: Joi.object({
        checkin: Joi.string().isoDate().required(),
        checkout: Joi.string().isoDate().required()
    }).required(),
    additionalneeds: Joi.string().allow('').required()
}).unknown(false);

export const createBookingResponseSchema = Joi.object({
    bookingid: Joi.number().integer().required(),
    booking: bookingSchema.required()
}).unknown(false);

