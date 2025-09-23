const express = require("express")
const cors = require("cors")
const bookRouter = require("./app/routes/book.route")
const borrowRouter = require("./app/routes/borrow.route")
const readerRouter = require("./app/routes/reader.route")
const publisherRouter = require("./app/routes/publisher.route")
const staffRouter = require("./app/routes/staff.route")

const ApiError = require("./app/api-error")

const app = express()

//package
app.use(cors())
app.use(express.json())


//routes
app.get("/", (req, res) => {
    res.json({ message: "Chào mừng đến với hệ thống mượn sách!"})
})
app.use("/api/books", bookRouter)
app.use("/api/readers", readerRouter)
app.use("/api/publishers", publisherRouter)
app.use("/api/staffs", staffRouter)
app.use("/api/borrows", borrowRouter)

//error handle
app.use((req, res, next) => {
    return next(new ApiError(404, "Không tìm thấy tài nguyên!"))
})
app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Lỗi bên trong server!"
    })
})

module.exports = app;

