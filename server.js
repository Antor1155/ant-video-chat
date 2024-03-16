require("dotenv").config()
const express = require("express")
const { Socket } = require("socket.io")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const {v4: uuidv4} = require("uuid")


app.set("view engine", "ejs")
app.use(express.static("public"))



app.get("/", (req, res)=>{
    const freshRoomId = uuidv4()
    // res.redirect(`/${uuidv4()}`)

    res.render("index", {roomId: freshRoomId})
})

app.get("/:room", (req, res)=>{
    console.log("requested room with id :", req.params.room)
    res.render("room", {roomId: req.params.room})
})


io.on("connection", (socket)=>{
    socket.on("join-room", (roomId, userId)=>{
        socket.join(roomId)

        socket.broadcast.to(roomId).emit("user-connected", userId)

        socket.on("disconnect", ()=>{
            socket.broadcast.to(roomId).emit("user-disconnected", userId)
        })

    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, ()=>{
    console.log("Server is running on : ", PORT)
})