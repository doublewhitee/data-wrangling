import { request } from './request';

export function reqProjectList(user_id: string, page: number, sort: string) {
  return request({
    url: '/project/list',
    method: 'post',
    data: { user_id, page, sort }
  }) as any
}

export function reqCreateProject(name: string, desc: string, user_id: string) {
  return request({
    url: '/project/create',
    method: 'post',
    data: { name, desc, user_id }
  }) as any
}

export function reqEditProject(_id: string, name: string, desc: string) {
  return request({
    url: '/project/edit',
    method: 'post',
    data: { _id, name, desc }
  }) as any
}

export function reqDeleteProject(_id: string) {
  return request({
    url: '/project/delete',
    method: 'post',
    data: { _id }
  }) as any
}