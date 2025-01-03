import express from 'express';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { createResumeValidator } from '../middlewares/validators/create-resume-validator.middleware.js';
import { prisma } from '../utils/prisma.util.js';
import { updateResumeValidator } from '../middlewares/validators/update-resume-validator.middleware.js';

const resumesRouter = express.Router();

// 이력서 생성 
resumesRouter.post('/', createResumeValidator, async (req, res, next) => {
  try {
    const user = req.user; // 인증된 사용자 정보
    const { title, content } = req.body; // 제목과 내용을 바디로 받는다.
    const authorId = user.id; // 작성자 ID

    // 새로운 이력서 생성
    const data = await prisma.resume.create({
      data: {
        authorId,
        title,
        content,
      },
    });

    // 성공 응답
    return res.status(HTTP_STATUS.CREATED).json({
      status: HTTP_STATUS.CREATED,
      message: MESSAGES.RESUMES.CREATE.SUCCEED,
      data,
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 전달
  }
});

// 이력서 목록 조회 
resumesRouter.get('/', async (req, res, next) => {
  try {
    const user = req.user; // 인증된 사용자 정보
    const authorId = user.id; // 작성자 ID

    let { sort } = req.query; // 정렬 기준 쿼리 파라미터
    sort = sort?.toLowerCase(); // 소문자로 변환

    // 유효하지 않은 정렬 값이 전달된 경우 기본값으로 설정
    if (sort !== 'desc' && sort !== 'asc') {
      sort = 'desc';
    }

    // 작성자의 이력서 목록 조회
    let data = await prisma.resume.findMany({
      where: { authorId },
      orderBy: {
        createdAt: sort, // 정렬 기준
      },
      include: {
        author: true, // 작성자 정보 포함
      },
    });

    // 반환 데이터 형식 변경
    data = data.map((resume) => {
      return {
        id: resume.id,
        authorName: resume.author.name,
        title: resume.title,
        content: resume.content,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      };
    });

    // 성공 응답 
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_LIST.SUCCEED,
      data,
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 전달
  }
});

// 이력서 상세 조회 
resumesRouter.get('/:id', async (req, res, next) => {
  try {
    const user = req.user; // 인증된 사용자 정보
    const authorId = user.id; // 작성자 ID

    const { id } = req.params; // 경로 파라미터에서 ID 추출

    // 특정 이력서 조회
    let data = await prisma.resume.findUnique({
      where: { id: +id, authorId },
      include: { author: true }, // 작성자 정보 포함
    });

    // 데이터가 없을 경우 404 응답
    if (!data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    // 반환 데이터 형식 변경
    data = {
      id: data.id,
      authorName: data.author.name,
      title: data.title,
      content: data.content,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    // 성공 응답 
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.READ_DETAIL.SUCCEED,
      data,
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 전달
  }
});

// 이력서 수정 
resumesRouter.put('/:id', updateResumeValidator, async (req, res, next) => {
  try {
    const user = req.user; // 인증된 사용자 정보
    const authorId = user.id; // 작성자 ID

    const { id } = req.params; // 경로 파라미터에서 ID 추출
    const { title, content } = req.body; // 요청 본문에서 수정 데이터 추출

    // 기존 이력서 존재 여부 확인
    let existedResume = await prisma.resume.findUnique({
      where: { id: +id, authorId },
    });

    if (!existedResume) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    // 이력서 업데이트
    const data = await prisma.resume.update({
      where: { id: +id, authorId },
      data: {
        ...(title && { title }), // 제목이 있을 경우에만 업데이트
        ...(content && { content }), // 내용이 있을 경우에만 업데이트
      },
    });

    // 성공 응답 
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.UPDATE.SUCCEED,
      data,
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 전달
  }
});

// 이력서 삭제 
resumesRouter.delete('/:id', async (req, res, next) => {
  try {
    const user = req.user; // 인증된 사용자 정보
    const authorId = user.id; // 작성자 ID

    const { id } = req.params; // 경로 파라미터에서 ID 추출

    // 기존 이력서 존재 여부 확인
    let existedResume = await prisma.resume.findUnique({
      where: { id: +id, authorId },
    });

    if (!existedResume) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.RESUMES.COMMON.NOT_FOUND,
      });
    }

    // 이력서 삭제
    const data = await prisma.resume.delete({ where: { id: +id, authorId } });

    // 성공 응답 반환
    return res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: MESSAGES.RESUMES.DELETE.SUCCEED,
      data: { id: data.id },
    });
  } catch (error) {
    next(error); // 오류 처리 미들웨어로 전달
  }
});

export { resumesRouter }; // 이력서 라우터 내보내기
