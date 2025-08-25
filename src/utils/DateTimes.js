export default {
  getFormattedDate (date, separator = '.') {
    if (!date) return ''
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}${separator}${month}${separator}${year}`
  }
}
