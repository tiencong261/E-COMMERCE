import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import e from 'cors'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRoute from './routes/userRoute.js'

//App Config
const app= express()
const port=process.env.PORT || 4000
connectDB()
connectCloudinary()


//App Config
app.use(express.json())
app.use(cors())

//Api endpoints
app.use('/api/user', userRoute)

app.get('/',(req,res) =>{
    res.send("API Working")
})


app.listen(port, ()=>console.log('Server started on PORT: ' + port))