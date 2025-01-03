import Joi from 'joi'; // 데이터 유효성 검사를 위한 Joi 라이브러리
import { MESSAGES } from '../../constants/message.constant.js'; // 응답 메시지 상수
import { MIN_RESUME_LENGTH } from '../../constants/resume.constant.js'; // 이력서 내용의 최소 길이 상수

// Joi 스키마 정의: 이력서 업데이트를 위한 데이터 유효성 검사
const schema = Joi.object({
  // 제목 (title): 문자열 (필수 아님)
  title: Joi.string(),
  // 내용 (content): 문자열이며 최소 길이 요구
  content: Joi.string().min(MIN_RESUME_LENGTH).messages({
    // 내용의 최소 길이 미만일 경우 에러 메시지 설정
    'string.min': MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
  }),
})
  .min(1) // 최소 1개 이상의 필드가 요청 본문에 포함되어야 함
  .messages({
    // 본문이 비어 있을 경우 에러 메시지 설정
    'object.min': MESSAGES.RESUMES.UPDATE.NO_BODY_DATA,
  });

// 이력서 업데이트 요청을 검증하는 미들웨어 함수
export const updateResumeValidator = async (req, res, next) => {
  try {
    // 요청 본문(req.body)을 정의된 스키마를 통해 비동기로 검증
    await schema.validateAsync(req.body);
    // 검증 성공 시 다음 미들웨어로 이동
    next();
  } catch (error) {
    // 검증 실패 시 오류를 다음 미들웨어로 전달
    next(error);
  }
};
