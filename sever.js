const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

let users = []
let lastId = 0
//api to create user
app.post("/users", (req,res)=>{
    const user = req.body
    user.id = ++lastId
    users.push(user)
    res.status(201).json(user)
})
//api to get all the user
app.get("/users",(req,res)=>{
    res.json(users)
})
//api to get a specific user via id
app.get("/users/:id",(req,res)=>{
    const id = req.params.id
    const user = users.find((u)=> u.id==id)
    if(user){
        res.json(user)
    }
    else{
        res.status(404).json({message:"user not found"})
    }
})
//api to update an user
app.put("/users/:id",(req,res)=>{
    const id = req.params.id
    const user = users.find((u)=> u.id==id)
    if(user){
        user.fName = "zahid"
        user.lName = "fahim"
        res.json(user)
    }
    else{
        res.status(404).json({message:"user not found"})
    }
})





// connection check 
app.get("/",(req, res)=>{
    res.json("Welcome")
})
// server running checker 
const port = 6000
app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})