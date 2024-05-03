import express from "express";
import cors from "cors";
import mysql2 from "mysql2";
import moment from 'moment';
import bcryptjs from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
const port = 8082;

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

// const verifyUser = (req, res, next) => {
//   const token = req.cookies.token;
//   if(!token) {
//       return res.json({Error: "You are not Auth"});
//   } else {
//       jwt.verify(token, "jwtsecretkeyadmin", (err, decoded) => {
//           if (err) {
//               return res.json({Error: "Token is not correct"});
//           } else {
//               req.name = decoded.name;
//               next();
//           }
//       })
//   }
// }


app.post('/LoginScreen', (req, res) => {
  const sql = "SELECT * FROM user WHERE email = ?";
  db.query(sql, [req.body.user], async (err, data) => {
      if (err) {
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (data.length > 0) {
          const storedPassword = data[0].password;

          try {
              const passwordMatch = await bcrypt.compare(req.body.password, storedPassword);
          
              if (passwordMatch) {
                  const email = data[0].email;
                  const name = data[0].username;
                  const phone = data[0].phone_number;
                  const token = jwt.sign({email}, "jwtsecretkeyadmin", {expiresIn : '1d'});
                  res.cookie('token', token);
                  return res.json({ status: 'success', message: 'Login Berhasil', token, email, name, phone});
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
  const sql = "SELECT * FROM category WHERE type = laptop";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

app.post("/data/laptop/services", (req,res) => {
  const sql = "INSERT INTO service (`device_name`, `category`,`store`,`notes`,`status`) VALUES (?)";
  const status = 1
  const values = [
      req.body.device,
      req.body.category1,
      req.body.location,
      req.body.notes,
      status
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.put("/data/laptop/services/:id", (req,res) => {
  const sql = "UPDATE services SET `device_name` = ?, `category` = ?, `store` = ?, `price` = ?, `notes` = ?, 'status' = ? WHERE ID = ?";
  const values = [
      req.body.name,
      req.body.category,
      req.body.store,
      req.body.price,
      req.body.notes,
      req.body.status,
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

app.get("/data/phone/services", (req,res) => {
  const sql = "SELECT * FROM category WHERE type = phone";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

app.post("/data/phone/services", (req,res) => {
  const sql = "INSERT INTO service (`device_name`, `category`, `store`, `price`, `notes`, `status`) VALUES (?)";
  const status = "1" 
  const values = [
      req.body.name,
      req.body.category,
      req.body.store,
      req.body.price,
      req.body.notes,
      status
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.put("/data/phone/services/:id", (req,res) => {
  const sql = "UPDATE services SET `device_name` = ?, `category` = ?, `store` = ?, `price` = ?, `notes` = ?, 'status' = ? WHERE ID = ?";
  const values = [
      req.body.name,
      req.body.category,
      req.body.store,
      req.body.price,
      req.body.notes,
      req.body.status,
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

app.get("/data/pc/services", (req,res) => {
  const sql = "SELECT * FROM category WHERE type = pc";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

app.post("/data/pc/services", (req,res) => {
  const sql = "INSERT INTO service (`device_name`, `category`, `store`, `price`, `notes`, `status`) VALUES (?)";
  const status = "1" 
  const values = [
      req.body.name,
      req.body.category,
      req.body.store,
      req.body.price,
      req.body.notes,
      status
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.put("/data/pc/services/:id", (req,res) => {
  const sql = "UPDATE services SET `device_name` = ?, `category` = ?, `store` = ?, `price` = ?, `notes` = ?, 'status' = ? WHERE ID = ?";
  const values = [
      req.body.name,
      req.body.category,
      req.body.store,
      req.body.price,
      req.body.notes,
      req.body.status,
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

app.delete("/deleteorder/:id", (req,res) => {
  const sql = "DELETE FROM services WHERE id = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ success : "Data yang telah anda pilih telah berhasil dihapus"})
  })
})

app.post("/helpcenter/reportbug", (req,res) => {
  const sql = "INSERT INTO reportbug (`bug_type`, `description`) VALUES (?)"; 
  const values = [
      req.body.bug,
      req.body.desc,
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.post("/feedback", (req,res) => {
  const sql = "INSERT INTO feedback (`feedback`) VALUES (?)"; 
  const values = [
      req.body.feedback,
  ]
  db.query(sql, [values], (err, data) => {
      if(err) return res.json("Error");
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.get("/track", (req,res) => {
  const sql = "SELECT * FROM service WHERE type = pc";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

app.post("/register", async (req, res) => {
  try {
      // Generate salt and hash asynchronously
      const salt = await bcryptjs.genSalt(12);
      const hash = await bcryptjs.hash(req.body.password, salt);

      // SQL query with placeholders
      const sql = "INSERT INTO user (`username`, `password`, `email`, `phone_number`) VALUES (?)";

      // Values for the placeholders
      const values = [
        req.body.username,
        hash,
        req.body.email,
        req.body.phone,
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
  const sql = "INSERT INTO user (`username`, `password`, `email`, `phone_number`) VALUES (?)";
  const values = [
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.phone,
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
  const sql = "UPDATE user SET `username` = ?, `password` = ?, `email` = ?, `phone_number` = ? WHERE ID = ?";
  const values = [
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.phone,
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

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({status: "Success"});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
