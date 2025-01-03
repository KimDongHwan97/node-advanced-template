import express from 'express';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js'; // 액세스 토큰을 요구하는 미들웨어
import { HTTP_STATUS } from '../constants/http-status.constant.js'; // HTTP 상태 코드 상수
import { MESSAGES } from '../constants/message.constant.js'; // 응답 메시지 상수

const usersRouter = express.Router(); // Express 라우터 생성

// 현재 로그인된 사용자 정보 조회
usersRouter.get('/me', requireAccessToken, (req, res, next) => {
  try {
    const data = req.user; // 요청 객체에서 사용자 정보 가져오기 (액세스 토큰 미들웨어에서 추가됨)

    // 사용자 정보를 성공적으로 응답
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK, // HTTP 200 상태 코드
      message: MESSAGES.USERS.READ_ME.SUCCEED, // 성공 메시지
      data, // 사용자 데이터
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 오류 전달
  }
});

export { usersRouter }; // 라우터를 내보내기
