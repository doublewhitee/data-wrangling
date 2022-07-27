import { request } from './request';

export function reqDatasetList(project_id: string) {
  return request({
    url: '/dataset/list',
    method: 'post',
    data: { project_id }
  }) as any
}

export function reqCreateDataset(name: string, project_id: string, user_id: string) {
  return request({
    url: '/dataset/create',
    method: 'post',
    data: { name, project_id, user_id }
  }) as any
}

export function reqImportDataset(file: FormData, project_id: string, user_id: string) {
  return request({
    url: '/dataset/import',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: file,
    params: { project_id, user_id }
  }) as any
}

export function reqRenameDataset(name: string, _id: string) {
  return request({
    url: '/dataset/edit',
    method: 'post',
    data: { name, _id }
  }) as any
}

export function reqDeleteDataset(_id: string, project_id: string) {
  return request({
    url: '/dataset/delete',
    method: 'post',
    data: { _id, project_id }
  }) as any
}

export function reqDatasetDetail(_id: string) {
  return request({
    url: '/dataset/detail',
    method: 'post',
    data: { _id }
  }) as any
}