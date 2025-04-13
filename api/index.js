const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
app.use(express.json());

const users = [
    {
        id:"1",
        username:"John",
        password:"John123",
        isAdmin:true,
    },
    {
        id:"2",
        username:"Jane",
        password:"Jane123",
        isAdmin:false,
    },
    {
        id:"3",
        username:"Jessie",
        password:"Jess123",
        isAdmin:false,
    },
];

let refreshTokens = [];

//refresh tokens are supposed to be stored in a database or "redis cache"
app.post("/api/refresh", (req,res) => {
    //take refresh token from the user
    const refreshToken = req.body.token;
    //send error if no token or invalid token
    if (!refreshToken) {
        return res.status(401).json("You are not authenticated");
    }
    if (!refreshTokens.includes(refreshToken)) { 
        return res.status(403).json("Refresh token isn't valid");
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err,user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter(token => token !== refreshToken);
        const newAccessToken = generateAccessToken({ id:user.id, isAdmin:user.isAdmin });
        const newRefreshToken = generateRefreshToken({ id:user.id, isAdmin:user.isAdmin });
        refreshTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    });
    //if valid, create new access token, refresh token and send to user 
});

const generateAccessToken = (user) => {
    return jwt.sign({ id:user.id, isAdmin:user.isAdmin }, 
    "mySecretKey", 
    { expiresIn : "20s"})
}

const generateRefreshToken = (user) => {
    return jwt.sign({ id:user.id, 
        isAdmin:user.isAdmin }, 
        "myRefreshSecretKey");
}

app.post("/api/login", (req,res) => {
    const {username, password} = req.body;
    const user = users.find(u=> {
        return u.username === username && u.password === password;
    });
    if (user) {
        //Generate an access token
        const accessToken = generateAccessToken(user);
        //Generate a refresh token
        const refreshToken =  generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken: accessToken,
        });
    } else {
        res.status(401).json({message: "Invalid credentials"});
    }
})


const verify = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "mySecretKey", (err,user) => {
            if(err) {
                return res.status(403).json("Token is invalid");
            }

            req.user = user;
            next();
        })
    } else {
        res.status(401).json("You aint authenticated");
    }
}

app.delete("/api/users/:userId", verify, (req,res) => {
    //middleware: using the verify function to check if the user is authenticated
    if(req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("User deleted");
    } else {
        res.status(403).json("Not allowed to delete this user");
    } 
})

app.listen(5030, ()=> console.log("Server is running on port 5030"));