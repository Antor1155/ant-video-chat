const socket = io("/")
const peer = new Peer()
const getUserMedia = navigator.mediaDevices.getUserMedia

const connectedPeers = {}

// handeling and adding video to the browser 
const videoGrid = document.getElementById("video-grid")

const myVideo = document.getElementById("myVideo")
getUserMedia({ video: true, audio: true }).then(stream => {
    myVideo.srcObject = stream
})

myVideo.addEventListener("click", () => {
    const mainVideo = document.querySelector(".main")
    mainVideo.classList.remove("main")
    myVideo.classList.add("main")
})



peer.on("open", id => {
    console.log("my peer id: ", id)
    socket.emit("join-room", roomId, id)
})

socket.on("user-connected", friendId => {
    console.log("friend connected with id: ", friendId)

    // making a call to friend 
    makeStreamAndCall(friendId)
})

const makeStreamAndCall = friendId => {

    getUserMedia({ video: true, audio: true })
        .then(stream => {

            myVideo.srcObject = stream

            console.log("making stream to call: ", stream)

            // calling friend 
            const call = peer.call(friendId, stream)

            call.on("stream", remoteStream => {
                makeVideo(remoteStream, friendId)
            })

            call.on("close", () => {
                handleDisconnect(friendId)
            })

        }).catch(error => console.log("error in making call : ", error))
}


// answering a call 
peer.on("call", call => {
    const friendId = call.peer

    console.log("answering call of id: ", friendId)

    getUserMedia({ video: true, audio: true })
        .then(stream => {
            myVideo.srcObject = stream

            call.answer(stream)

            call.on("stream", remoteStream => {
                makeVideo(remoteStream, friendId)
            })

            call.on("close", () => {
                handleDisconnect(friendId)
            })

        })
        .catch(error => console.log("error in answering call : ", error))
})

function makeVideo(remoteStream, friendId) {

    if (!connectedPeers[friendId]) {

        const friendVideo = document.createElement("video")
        friendVideo.autoplay = true
        friendVideo.playsInline = true

        friendVideo.srcObject = remoteStream
        videoGrid.append(friendVideo)

        connectedPeers[friendId] = friendVideo

        friendVideo.addEventListener("click", () => {
            const mainVideo = document.querySelector(".main")
            mainVideo.classList.remove("main")

            friendVideo.classList.add("main")
        })

        // if connectedPeers query is have only this video, then make this video as main video 
        if (Object.keys(connectedPeers).length === 1) {
            const mainVideo = document.querySelector(".main")
            mainVideo.classList.remove("main")

            friendVideo.classList.add("main")
        }
    }

}


// when friend disconnects 
socket.on("user-disconnected", friendId => {
    console.log("user disconnected: ", friendId)
    handleDisconnect(friendId)
})


const handleDisconnect = (friendId) => {
    if (connectedPeers[friendId]) {
        const video = connectedPeers[friendId]

        if (video.classList.contains("main")) {
            console.log("making my video as main video")

            myVideo.classList.add("main")
        }

        // removing the video 
        video.remove()
        delete connectedPeers[friendId]
    }
}


// button handles 

const cutCall = () => {
    const baseUrl = window.location.origin
    window.location = baseUrl
}

const invite = () => {
    document.querySelector('#create-room').style.display = 'flex';
}


// this section is for invite section 
const hideCancel = () => {
    document.querySelector('#create-room').style.display = 'none';
}

document.getElementById("room-id").innerHTML = roomId
document.getElementById("room-link").innerHTML = `${window.location.origin}/${roomId}`

document.getElementById("room-id").addEventListener("click", () => {
    navigator.clipboard.writeText(roomId)
    document.getElementById("status").style.visibility = "visible"
})

document.getElementById("room-link").addEventListener("click", () => {
    navigator.clipboard.writeText(`${window.location.origin}/${roomId}`)
    document.getElementById("status").style.visibility = "visible"
})
