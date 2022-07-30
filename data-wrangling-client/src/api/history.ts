import { request } from './request';

export function reqHistoryList(dataset_id: string, page: number) {
  return request({
    url: '/history/list',
    method: 'post',
    data: { dataset_id, page }
  }) as any
}