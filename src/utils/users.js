const users =[]

// addUser, removeUser, getUser, getUserInRoom

const addUser =({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase(),
    room= room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error : 'Username and room are required'
        }
    }
    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate usernnae
    if(existingUser){
        return {
            error : 'Username is in use!'
        }
    }
    //Store user
     const user ={id, username, room}
     users.push(user)
     return {user}
    
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>{
            return user.id ===id
    })
    if(index!=-1){
        return users.splice(index,1)[0]
    }
}
const getUser = (id) =>{
    const user = users.find((user)=>{
        return user.id===id
    })
    return user
}  

const getUsersInRoom =(room)=>{
    const usersinRoom=[]
    users.find((user)=>{
        if(user.room ===room)
        usersinRoom.push(user)
    })
    return usersinRoom
}

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// getUsersInRoom('cityb')

// getUser(22)

// addUser({
//     id: 22,
//     username :'Adam',
//     room :' citYa     '
// })

// addUser({
//     id: 24,
//     username :'Judy',
//     room :' citYa     '
// })

// addUser({
//     id: 98,
//     username :'Glen',
//     room :' citYb     '
// })

