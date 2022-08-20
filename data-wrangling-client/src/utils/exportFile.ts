export function exportToJson(
  data: { [key: string]: any }[],
  fileName: string
) {
  const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })
  const e = new MouseEvent('click')
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  a.dispatchEvent(e)
}

export async function exportToCsv(
  title: string[],
  data: { [key: string]: any }[],
  fileName: string
) {
  // init with title
  let content = title.join(',') + '\r\n'
  // rows
  data.forEach(row => {
    let temp = [] as string[]
    title.forEach(k => {
      if (row[k]) {
        temp.push(row[k])
      } else {
        temp.push('')
      }
    })
    content += temp.join(',') + '\r\n'
  })

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const e = new MouseEvent('click')
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/csv;charset=utf-8', a.download, a.href].join(':')
  a.dispatchEvent(e)
}

export async function exportToXlsx(
  data: { [key: string]: any }[],
  fileName: string
) {
  const [{ utils, writeFile }] = await Promise.all([
    import('xlsx')
  ])
  const wb = utils.book_new()
  const ws = utils.json_to_sheet(data)
  utils.book_append_sheet(wb, ws, 'Sheet 1')
  writeFile(wb, fileName)
}
