export const resSuccess = (res, message, data) => {
     res.status(200).json({ success: true, message, data })
}
export const resError = (res, status, message, error) => {
     res.status(status).json({ success: false, message, error, data: {} })
}