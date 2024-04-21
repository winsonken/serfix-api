import express from "express";
import cors from "cors";
import mysql2 from "mysql2";
import moment from 'moment';
import bcryptjs from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors({
  origin : ['http://localhost:8081'],
  methods : ["POST", "GET", "PUT", "DELETE"],
  credentials : true
}));
const port = 8081;

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "serfix"
});

app.get("/user", (req,res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if(!token) {
      return res.json({Error: "You are not Auth"});
  } else {
      jwt.verify(token, "jwtsecretkeyadmin", (err, decoded) => {
          if (err) {
              return res.json({Error: "Token is not correct"});
          } else {
              req.name = decoded.name;
              next();
          }
      })
  }
}

app.post('/login', (req, res) => {
  const sql = "SELECT * FROM user WHERE username = ?";
  db.query(sql, [req.body.user], async (err, data) => {
      if (err) {
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (data.length > 0) {
          const storedPassword = data[0].password;
          const userData = {
            name : data[0].username,
            birth: data[0].birth_date,
            email: data[0].email,
            phone: data[0].phone_number,
            gender: data[0].gender
          };


          try {
              const passwordMatch = await bcrypt.compare(req.body.password, storedPassword);
          
              if (passwordMatch) {
                  const name = data[0].username;
                  const token = jwt.sign({name}, "jwtsecretkeyadmin", {expiresIn : '1d'});
                  res.cookie('token', token);
                  return res.json({ status: 'success', message: 'Login Berhasil', token, userData});
              } else {
                  return res.status(401).json({ status: 'error', message: 'Password Salah' });
              }
          } catch (error) {
              console.error('Error comparing passwords:', error);
              return res.status(401).json({ status: 'error', message: 'Password Comparison Error' });
          }
      } else {
          return res.status(401).json({ status: 'error', message: 'Akun tidak Terdaftar' });
      }
  });
});

app.get("/data/laptop/services", (req,res) => {
  const sql = "SELECT * FROM laptop_service";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

app.post("/user", async (req, res) => {
  try {
      // Generate salt and hash asynchronously
      const salt = await bcryptjs.genSalt(12);
      const hash = await bcryptjs.hash(req.body.password, salt);

      // SQL query with placeholders
      const sql = "INSERT INTO user (`username`, `password`, `birth_date`, `email`, `phone_number`, `gender`) VALUES (?)";

      // Values for the placeholders
      const values = [
        req.body.username,
        hash,
        req.body.birth,
        req.body.email,
        req.body.phone,
        req.body.gender,
    ]

      // Execute the query
      db.query(sql, [values], (err, data) => {
        if(err) return res.json("Error");
        res.status(200).json({ status: "success", data: req.body })
    })
  } catch (error) {
      console.error(error);
      res.json("Error");
  }
});

app.post("/user", (req,res) => {
  const sql = "INSERT INTO user (`username`, `password`, `birth_date`, `email`, `phone_number`, `gender`) VALUES (?)";
  const values = [
      req.body.username,
      req.body.password,
      req.body.birth,
      req.body.email,
      req.body.phone,
      req.body.gender,
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.post("/laptop/services", (req,res) => {
  const sql = "INSERT INTO laptop_service (`device`, `category`, `location`, `price`, `notes`) VALUES (?)";
  const values = [
      req.body.device,
      req.body.category,
      req.body.location,
      req.body.price,
      req.body.notes,
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.delete("/deleteuser/:id", (req,res) => {
  const sql = "DELETE FROM user WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ success : "Data yang telah anda pilih telah berhasil dihapus"})
  })
})

app.delete("/deletelaptopservice/:id", (req,res) => {
  const sql = "DELETE FROM laptop_service WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ success : "Data yang telah anda pilih telah berhasil dihapus"})
  })
})

app.put("/user/:id", (req,res) => {
  const sql = "UPDATE user SET `username` = ?, `password` = ?, `birth_date` = ?, `email` = ?, `phone_number` = ?, `gender` = ? WHERE ID = ?";
  const values = [
      req.body.username,
      req.body.password,
      req.body.birth,
      req.body.email,
      req.body.phone,
      req.body.gender,
  ]
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
      if (err) {
          console.error(err); // Log the error for debugging 
          return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.put("/data/laptop/services/:id", (req,res) => {
  const sql = "UPDATE user SET `device` = ?, `category` = ?, `location` = ?, `price` = ?, `notes` = ? WHERE ID = ?";
  const values = [
    req.body.device,
    req.body.category,
    req.body.location,
    req.body.price,
    req.body.notes,
  ]
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
      if (err) {
          console.error(err); // Log the error for debugging 
          return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
