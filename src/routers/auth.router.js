// 필요한 모듈 및 상수 가져오기
import express from 'express'; // 웹 애플리케이션을 만들기 위한 프레임워크
import bcrypt from 'bcrypt'; // 비밀번호 암호화 및 검증을 위한 라이브러리
import jwt from 'jsonwebtoken'; // JSON Web Token 생성 및 검증을 위한 라이브러리
import { HTTP_STATUS } from '../constants/http-status.constant.js'; // HTTP 상태 코드 상수
import { MESSAGES } from '../constants/message.constant.js'; // 메시지 상수
import { signUpValidator } from '../middlewares/validators/sign-up-validator.middleware.js'; // 회원가입 요청 유효성 검사 미들웨어
import { signInValidator } from '../middlewares/validators/sign-in-validator.middleware.js'; // 로그인 요청 유효성 검사 미들웨어
import { prisma } from '../utils/prisma.util.js'; // 데이터베이스 작업을 위한 Prisma ORM 인스턴스
import {
  ACCESS_TOKEN_EXPIRES_IN, // 액세스 토큰 만료 시간
  HASH_SALT_ROUNDS, // 비밀번호 해시 생성 시 사용하는 솔트 라운드 수
} from '../constants/auth.constant.js';
import { ACCESS_TOKEN_SECRET } from '../constants/env.constant.js'; // JWT 서명에 사용하는 비밀 키

// 인증 관련 라우터 생성
const authRouter = express.Router();

// 회원가입 라우트
authRouter.post('/sign-up', signUpValidator, async (req, res, next) => {
  try {
    const { email, password, name } = req.body; // 요청 본문에서 이메일, 비밀번호, 이름 추출

    // 동일한 이메일이 이미 존재하는지 확인
    const existedUser = await prisma.user.findUnique({ where: { email } });

    // 이메일이 이미 사용 중인 경우, 충돌 상태 코드 반환
    if (existedUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        status: HTTP_STATUS.CONFLICT, // HTTP 409 충돌
        message: MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED, // 미리 정의된 오류 메시지
      });
    }

    // 비밀번호를 지정된 솔트 라운드 수로 암호화
    const hashedPassword = bcrypt.hashSync(password, HASH_SALT_ROUNDS);

    // 데이터베이스에 새로운 사용자 생성
    const data = await prisma.user.create({
      data: {
        email, // 사용자 이메일
        password: hashedPassword, // 암호화된 비밀번호
        name, // 사용자 이름
      },
    });

    // 응답 객체에서 비밀번호 제거 (보안을 위해)
    data.password = undefined;

    // 성공 메시지와 생성된 사용자 데이터 반환
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED, // HTTP 201 생성
      message: MESSAGES.AUTH.SIGN_UP.SUCCEED, // 성공 메시지
      data, // 비밀번호를 제외한 사용자 데이터
    });
  } catch (error) {
    // 오류 발생 시 에러 처리 미들웨어로 전달
    next(error);
  }
});

// 로그인 라우트
authRouter.post('/sign-in', signInValidator, async (req, res, next) => {
  try {
    const { email, password } = req.body; // 요청 본문에서 이메일과 비밀번호 추출

    // 데이터베이스에서 이메일로 사용자 검색
    const user = await prisma.user.findUnique({ where: { email } });

    // 제공된 비밀번호와 데이터베이스에 저장된 암호화된 비밀번호를 비교
    const isPasswordMatched =
      user && bcrypt.compareSync(password, user.password);

    // 사용자가 없거나 비밀번호가 틀린 경우, 인증되지 않음 상태 코드 반환
    if (!isPasswordMatched) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED, // HTTP 401 인증되지 않음
        message: MESSAGES.AUTH.COMMON.UNAUTHORIZED, // 미리 정의된 오류 메시지
      });
    }

    // JWT에 사용할 페이로드 생성
    const payload = { id: user.id };

    // JWT 생성 (페이로드, 비밀 키, 만료 시간 사용)
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // 성공 메시지와 생성된 액세스 토큰 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK, // HTTP 200 성공
      message: MESSAGES.AUTH.SIGN_IN.SUCCEED, // 성공 메시지
      data: { accessToken }, // 생성된 JWT 토큰
    });
  } catch (error) {
    // 오류 발생 시 에러 처리 미들웨어로 전달
    next(error);
  }
});

// 라우터를 내보내 다른 부분에서 사용 가능하도록 설정
export { authRouter };
