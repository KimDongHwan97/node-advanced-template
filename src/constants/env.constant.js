// dotenv 패키지를 이용해 환경 변수를 로드
import 'dotenv/config';

// 서버가 실행될 포트 번호 (환경 변수에서 가져옴)
export const SERVER_PORT = process.env.SERVER_PORT;

// 액세스 토큰을 암호화 및 검증할 때 사용할 비밀 키 (환경 변수에서 가져옴)
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// const dotenvObj = {
//     SERVER_PORT:process.env.SERVER_PORT,
//     ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET
// }

// {SERVER_PORT, ACCESS_TOKEN_SECRET}

export default dotenvObj;