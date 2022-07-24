// format time
export function formatDate (dateData: string | Date, fmt: string = 'yyyy-MM-dd') {
  const date = new Date(dateData)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substring(4 - RegExp.$1.length))
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (const [k, v] of Object.entries(o)) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? '' + v : padLeftZero('' + v))
    }
  }
  return fmt
}

function padLeftZero (str: string) {
  return ('00' + str).substring(str.length)
}