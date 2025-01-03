import Joi from 'joi';
import { MESSAGES } from '../../constants/message.constant.js';

// 조이 오브젝트라는 메서드 이용해서 이메일과 비밀번호를 검증할 스키마를 만든다.
const schema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
    'string.email': MESSAGES.AUTH.COMMON.EMAIL.INVALID_FORMAT,
  }),
  password: Joi.string().required().messages({
    'any.required': MESSAGES.AUTH.COMMON.PASSWORD.REQURIED,
  }),
});

// signInValidator 를 진짜로 실행할 수 있는 벨리데이트 함수를 만들었다.
export const signInValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
