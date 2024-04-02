import express from "express";
import cors from "cors";
import mysql2 from 'mysql2'

const app = express();
app.use(express.json());
app.use(cors({
  origin : ['http://localhost:5800'],
  methods : ["POST", "GET", "PUT", "DELETE"],
  credentials : true
}));
const port = 5800;

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "mysqldb123$",
  database: "serfix"
});

app.get("/user", (req,res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err,data) => {
      if(err) {
        console.log(err)
      };
      res.status(200).json({ status: "success", data})
  })
})

app.get("/data/laptop/services", (req,res) => {
  const sql = "SELECT * FROM laptop_service";
  db.query(sql, (err,data) => {
      if(err) return res.json("Err");
      res.status(200).json({ status: "success", data})
  })
})

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
