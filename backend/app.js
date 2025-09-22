const express = require("express")
const cors = require("cors")
const booksRouter = require("./app/routes/book.route")
const ApiError = require("./app/api-error")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/api/books", booksRouter)
app.use((req, res, next) => {
    return next(new ApiError(404, "Không tìm thấy tài nguyên!"))
})
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Lỗi bên trong server!"
    })
})
app.get("/", (req, res) => {
    res.json({ message: "Chào mừng đến với hệ thống mượn sách!"})
})

module.exports = app;

