// 비밀번호 해싱에 사용할 솔트 라운드 수 (bcrypt에서 사용)
//HASH_SALT_ROUNDS = 10은 bcrypt 알고리즘이 비밀번호를 해싱할 때 2¹⁰번(= 1024회)의 연산을 수행하여 보안을 강화한다는 뜻입니다. 
// 이를 통해 비밀번호를 안전하게 저장할 수 있습니다.
export const HASH_SALT_ROUNDS = 10;

// 비밀번호의 최소 길이 (유효성 검사를 위한 기준)
export const MIN_PASSWORD_LENGTH = 6;

// 액세스 토큰의 만료 시간 (예: '12h'는 12시간)
export const ACCESS_TOKEN_EXPIRES_IN = '12h';
