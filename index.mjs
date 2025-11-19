import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336 csumb',
  resave: false,
  saveUninitialized: true,
//   cookie: { secure: true }   //  only works in production
}))

app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
//setting up database connection pool
const pool = mysql.createPool({
    host: "w1h4cr5sb73o944p.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "bp1t2waqynoo300o",
    password: "xhvh50l86emzmr72",
    database: "zutb6skwh6b157ly",
    connectionLimit: 10,
    waitForConnections: true
});

// let isUserAuthenticated = false;

//routes
app.get('/', (req, res) => {
    res.render('login.ejs')
});

app.get('/profile', isUserAuthenticated, (req, res) => {
    res.render('profile.ejs');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
});

app.post('/loginProcess', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword = "";
    let sql = `select * from users where username = ?`;
    const [rows] = await pool.query(sql, [username]);
    // const match = await bcrypt.compare(password, hashedPassword);
    if (rows.length > 0) {
        req.session.isUserAuthenticated = true;
        req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
        res.render('home.ejs');
    } else {
        res.render('login.ejs')
    }
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.get('/newRoute', isUserAuthenticated, (req, res) => {
    res.render('newView.ejs')
});

// middleware functions
function isUserAuthenticated(req, res, next) {
    if (req.session.isUserAuthenticated) {
        next();
    } else {
        res.redirect('/')
    }
}

app.listen(3000, () => {
    console.log("Express server running")
})
