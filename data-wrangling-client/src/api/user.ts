import { request } from './request';

export function reqRegister(first_name: string, last_name: string, email: string, password: string) {
  return request({
    url: '/user/register',
    method: 'post',
    data: { first_name, last_name, email, password }
  }) as any
}

export function reqLogin(email: string, password: string) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { email, password }
  }) as any
}

export function reqUserInfo() {
  return request({
    url: '/user/info',
  }) as any
}