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

// change cell vale
export function reqEditCell(user_id: string, project_id: string, dataset_id: string, row_id: string, row: object) {
  return request({
    url: '/dataset/editcell',
    method: 'post',
    data: { user_id, project_id, dataset_id, row_id, row }
  }) as any
}

// rename column
export function reqRenameCol(user_id: string, project_id: string, dataset_id: string, col_id: string, preName: string, name: string) {
  return request({
    url: '/dataset/renamecol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, preName, name }
  }) as any
}

// add column
export function reqAddCol(user_id: string, project_id: string, dataset_id: string, col_id: string, direction: 'left' | 'right', name: string) {
  return request({
    url: '/dataset/addcol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, direction, name }
  }) as any
}

// add row
export function reqAddRow(user_id: string, project_id: string, dataset_id: string, row: object) {
  return request({
    url: '/dataset/addrow',
    method: 'post',
    data: { user_id, project_id, dataset_id, row }
  }) as any
}

// delete col
export function reqDeleteCol(user_id: string, project_id: string, dataset_id: string, col_id: string, name: string) {
  return request({
    url: '/dataset/deletecol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, name }
  }) as any
}

// delete row
export function reqDeleteRow(user_id: string, project_id: string, dataset_id: string, row: string[]) {
  return request({
    url: '/dataset/deleterow',
    method: 'post',
    data: { user_id, project_id, dataset_id, row }
  }) as any
}

// combine row
export function reqCombineRow(user_id: string, project_id: string, dataset_id: string, row: string[]) {
  return request({
    url: '/dataset/combinerow',
    method: 'post',
    data: { user_id, project_id, dataset_id, row }
  }) as any
}

// combine col
export function reqCombineCol(user_id: string, project_id: string, dataset_id: string, col_id: string, combineCol_id: string) {
  return request({
    url: '/dataset/combinecol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, combineCol_id }
  }) as any
}

// split col
export function reqSplitCol(user_id: string, project_id: string, dataset_id: string, col_id: string, delimiter: string) {
  return request({
    url: '/dataset/splitcol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, delimiter }
  }) as any
}

// transform row
export function reqTransformRow(user_id: string, project_id: string, dataset_id: string, row_id: string, row: object) {
  return request({
    url: '/dataset/transformrow',
    method: 'post',
    data: { user_id, project_id, dataset_id, row_id, row }
  }) as any
}

// transform col
export function reqTransformCol(user_id: string, project_id: string, dataset_id: string, col_id: string, row: object) {
  return request({
    url: '/dataset/transformcol',
    method: 'post',
    data: { user_id, project_id, dataset_id, col_id, row }
  }) as any
}