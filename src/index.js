const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } =require('./utils/users')

const publicDirectory = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server) //server expects to be called with the raw http server so get server from express

app.use(express.json())
app.use(express.static(publicDirectory))

const port = process.env.PORT || 3000

// let count =0

io.on('connection',(socket) =>{ // if 5 clients accees chat app server, this function will be called 5 different times
    //console.log('New Websocket connection')
    // socket.emit('countUpdated', count)                         //send an event from server whenever a client connects 
    //                                                            //2nd parameter represents the data accessed by client's socket callback function

    // socket.on('increment', ()=>{
    //     count++
    //    // socket.emit('countUpdated', count)  //socket.emit relays the info to a particular collection
    //    io.emit('countUpdated', count)         //io.emit relays latest info to all connections available
    // })

    socket.on('join',({username, room},acknowledge)=>{

        const {error, user}=addUser({
            id : socket.id,
            username,
            room
        })
        if(error){
            return acknowledge(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('System','Welcome to chat room '+user.room))
        socket.broadcast.to(user.room).emit('message', generateMessage('System' ,`${user.username} has joined the chat room `+ user.room))
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        acknowledge()
        //socket.emit-->event to specific client, io.emit--> every connected client, socket.broadcast.emit-->every connected client expect socket client
        //io.to.emit --> message to specific room, socket.broadcast.to.emit---> every connected client besides socket client in a specific room
    })

    socket.on('sendMessage', (message, acknowledge)=>{
        
        const filter = new Filter()
        if(filter.isProfane(message)){
            return acknowledge('Profanity is not allowed!')
        }
        const user =getUser(socket.id)
        if(user){
        io.to(user.room).emit('message', generateMessage(user.username,message))
        }
        acknowledge()
    })

    socket.on('disconnect',()=>{                  //disconnect is a built in event 
        const user = removeUser(socket.id)
        if(user){                                   
        io.to(user.room).emit('message', generateMessage('System',`${user.username} has left the chat room`))
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        }
    })

    socket.on('sendLocation',(location,acknowledge)=>{
        const user = getUser(socket.id)
        if(user){
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,"https://google.com/maps?q="+ location.latitude + ','+ location.longitude))
        }
        acknowledge()
    })

})

server.listen(port,()=>{
    console.log("Server is up on port : "+ port)
})

