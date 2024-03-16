const socket = io("/")
const myPeer = new Peer()


const peer = {}


// handeling and adding video to the browser 
const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.muted = true

// after getting video permission add video to browser and connect to peer 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    myPeer.on("open", userId => {
        socket.emit("join-room", roomId, userId)
    })

    addVideoStream(myVideo, stream)

    socket.on("user-connected", userId => {
        console.log("user Connected: ", userId)
        connectToNewUser(userId, stream)
    })

    myPeer.on("call", call => {
        call.answer(stream)

        const video = document.createElement("video")

        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream)
        })

        call.on("close", () => {
            video.remove()
        })
    })

    socket.on("user-disconnected", userId => {
        if (peer[userId]) {
            peer[userId].close()
        }
    })
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
        video.play()
    })

    videoGrid.append(video)
}

connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream)

    const video = document.createElement("video")

    call.on("stream", stream => {
        addVideoStream(video, stream)
    })

    call.on("close", () => {
        video.remove()
    })

    peer[userId] = call

}

