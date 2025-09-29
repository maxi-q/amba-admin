export const dateToInput = (yourDate: string) => {
  let date = new Date(yourDate)
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  return date.toISOString().split('T')[0] || null
}