import express from "express";
import cors from "cors";
import mysql2 from "mysql2";
import moment from 'moment';
import bcryptjs from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {body, validationResult} from 'express-validator';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json());
app.use(cors()); // Enable CORS for all routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const port = 8082;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "serfix"
});

app.use('/uploads', (req, res, next) => {
  console.log(`Serving static file: ${req.url}`);
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.post('/uploadbukti', upload.single('image'), (req, res) => {
  console.log("Received a request to /uploadbukti");
  console.log("File info:", req.file);

  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }

  const { service_id } = req.body;
  const image = req.file.filename;
  const sql = "UPDATE service SET image = ? WHERE id = ?";
  db.query(sql, [image, service_id], (err, result) => {
      if (err) {
          console.error("Error inserting image:", err);
          return res.status(500).json({ error: "Error inserting image" });
      }
      console.log("Image inserted successfully:", result);
      return res.status(200).json({ status: "Success" });
  });
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
                  const id = data[0].id;
                  const email = data[0].email;
                  const name = data[0].username;
                  const phone = data[0].phone_number;
                  const role = data[0].role;
                  const token = jwt.sign({email}, "jwtsecretkeyadmin", {expiresIn : '1d'});
                  res.cookie('token', token);
                  return res.json({ status: 'success', message: 'Login Berhasil', id, token, email, name, phone, role});
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

app.get("/admin-page/:status", (req, res) => {
  const status = req.params.status;
  const sql = "SELECT * FROM service WHERE status = ?";
  db.query(sql, [status], (err, data) => {
    if (err) {
      console.error("Error fetching service data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    if (data.length === 0) {
      // No data found for the specified status
      return res.status(404).json({ error: "No data found for the specified status" });
    }
    const id = data[0].id;
    const device = data[0].device_name;
    const price = data[0].price;
    const status = data[0].status;
    const start_date = data[0].start_date;
    const finish = data[0].finish_date;
    const category = data[0].category;
    const store = data[0].store;
    const type = data[0].type;
    const username = data[0].iduser;
    const image = data[0].image;

    res.status(200).json({ status: "success", data, id, device, price, status, start_date, finish, category, store, type, username, image});
  });
});

app.put("/admin-page-ongoing/:id", (req, res) => {
  const id = req.params.id;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const status = 3;
  const sql = "UPDATE service SET `status` = ?, `finish_date` = ? WHERE id = ?";

  db.query(sql, [status, currentDate, id], (err, data) => {
      if (err) {
          console.error(err); // Log the error for debugging 
          return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(id);
      res.status(200).json({ status: "success", data: req.body });
  });
});


app.put("/admin-page-accept/:id", (req,res) => {
  const id = req.params.id;
  const sql = "UPDATE service SET `status` = 2 WHERE id = ?";

  db.query(sql, [id], (err, data) => {
      if (err) {
          console.error(err); // Log the error for debugging 
          return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(id)
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.put("/admin-page-reject/:id", (req,res) => {
  const id = req.params.id;
  const sql = "UPDATE service SET `status` = 4 WHERE id = ?";

  db.query(sql, [id], (err, data) => {
      if (err) {
          console.error(err); // Log the error for debugging 
          return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(id)
      res.status(200).json({ status: "success", data: req.body })
  })
})

app.get("/data/laptop/categories", (req, res) => {
  const sql = "SELECT * FROM category WHERE type = 'laptop'";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laptop categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/laptop/location", (req, res) => {
  const category = req.query.category; // Get the category from the query parameters
  const sql = "SELECT * FROM location WHERE type = 'laptop' AND category = ?";
  db.query(sql, [category], (err, data) => {
    if (err) {
      console.error("Error fetching laptop location:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/laptop/price", (req, res) => {
  const { category, location } = req.query;
  const sql = "SELECT price FROM location WHERE category = ? AND name = ? AND type = 'Laptop'";
  db.query(sql, [category, location], (err, data) => {
    if (err) {
      console.error("Error fetching price:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Price not found" });
    }
    res.status(200).json({ status: "success", data: data[0] }); // Assuming there's only one price for a specific category and location
  });
});

app.post("/data/laptop/services", (req,res) => {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sql = "INSERT INTO service (`device_name`, `category`, `store`, `price`, `notes`, `status`, `type`, `user`, `iduser`, `start_date`) VALUES (?)";
  const status = 1
  const type = "Laptop"
  const values = [
      req.body.device,
      req.body.category1,
      req.body.selectedLocation,
      req.body.price,
      req.body.notes,
      status,
      type,
      req.body.id,
      req.body.username,
      currentDate,

  ]
  db.query(sql, [values], (err, result) => {
      if(err) return res.json("Error");
      const newServiceId = result.insertId;
      res.status(200).json({ status: "success", data: req.body, id: newServiceId, price: req.body.price, category: req.body.category1, type: type })
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

app.get("/data/phone/categories", (req, res) => {
  const sql = "SELECT * FROM category WHERE type = 'phone'";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laptop categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/phone/location", (req, res) => {
  const category = req.query.category; // Get the category from the query parameters
  const sql = "SELECT * FROM location WHERE type = 'phone' AND category = ?";
  db.query(sql, [category], (err, data) => {
    if (err) {
      console.error("Error fetching phone location:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/phone/price", (req, res) => {
  const { category, location } = req.query;
  const sql = "SELECT price FROM location WHERE category = ? AND name = ? AND type = 'Phone'";
  db.query(sql, [category, location], (err, data) => {
    if (err) {
      console.error("Error fetching price:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Price not found" });
    }
    res.status(200).json({ status: "success", data: data[0] }); // Assuming there's only one price for a specific category and location
  });
});

app.post("/data/phone/services", (req,res) => {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sql = "INSERT INTO service (`device_name`, `category`, `store`, `price`, `notes`, `status`, `type`, `user`, `iduser`, `start_date`) VALUES (?)";
  const status = 1
  const type = "Phone"
  const values = [
    req.body.device,
    req.body.category1,
    req.body.selectedLocation,
    req.body.price,
    req.body.notes,
    status,
    type,
    req.body.id,
    req.body.username,
    currentDate,
  ]
  db.query(sql, [values], (err, result) => {
    if(err) return res.json("Error");
    const newServiceId = result.insertId;
    const price1 = result.price;
    const category1 = result.category1;
    const type1 = result.type;
    res.status(200).json({ status: "success", data: req.body, id: newServiceId, price: req.body.price, category: req.body.category1, type: type })
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

app.get("/data/pc/categories", (req, res) => {
  const sql = "SELECT * FROM category WHERE type = 'PC'";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laptop categories:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/pc/location", (req, res) => {
  const category = req.query.category; // Get the category from the query parameters
  const sql = "SELECT * FROM location WHERE type = 'PC' AND category = ?";
  db.query(sql, [category], (err, data) => {
    if (err) {
      console.error("Error fetching laptop location:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ status: "success", data });
  });
});

app.get("/data/pc/price", (req, res) => {
  const { category, location } = req.query;
  const sql = "SELECT price FROM location WHERE category = ? AND name = ? AND type = 'PC'";
  db.query(sql, [category, location], (err, data) => {
    if (err) {
      console.error("Error fetching price:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ error: "Price not found" });
    }
    res.status(200).json({ status: "success", data: data[0] }); // Assuming there's only one price for a specific category and location
  });
});

app.post("/data/pc/services", (req,res) => {
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sql = "INSERT INTO service (`device_name`, `category`, `store`, `price`, `notes`, `status`, `type`, `user`, `iduser`, `start_date`) VALUES (?)";
  const status = 1
  const type = "PC"
  const values = [
    req.body.device,
    req.body.category1,
    req.body.selectedLocation,
    req.body.price,
    req.body.notes,
    status,
    type,
    req.body.id,
    req.body.username,
    currentDate,
  ]
  db.query(sql, [values], (err, result) => {
    if(err) return res.json("Error");
    const newServiceId = result.insertId;
    res.status(200).json({ status: "success", data: req.body, id: newServiceId, price: req.body.price, category: req.body.category1, type: type })
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

app.get("/track/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM service WHERE user = ? AND status = 2";
  db.query(sql, [id], (err, data) => {
      if (err) {
          console.error("Error fetching service data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length === 0) {
          return res.status(404).json({ error: "No data found for the specified user" });
      }

      res.status(200).json({ status: "success", data });
  });
});


app.get("/history/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM service WHERE user = ? AND status = 3";
  db.query(sql, [id], (err, data) => {
      if (err) {
          console.error("Error fetching service data:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length === 0) {
          return res.status(404).json({ error: "No data found for the specified user" });
      }

      res.status(200).json({ status: "success", data });
  });
});

app.post('/register',
  body('username').isLength({ min: 6 }).withMessage('Username must be at least 6 characters long'),
  body('email').isEmail().withMessage('Email must be in email format'),
  body('phone').isNumeric().withMessage('Phone number must contain only numbers'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation errors', errors: errors.array() });
    }

    const { username, email, phone, password } = req.body;

    try {
      const checkEmailSql = "SELECT email FROM user WHERE email = ?";
      db.query(checkEmailSql, [email], async (err, results) => {
        if (err) {
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        if (results.length > 0) {
          return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO user (`username`, `password`, `email`, `phone_number`, `role`) VALUES (?)";
        const role = "user";
        const values = [username, hash, email, phone, role];

        db.query(sql, [values], (err, data) => {
          if (err) return res.status(500).json({ status: 'error', message: 'Database Error' });
          res.status(200).json({ status: 'success', data: req.body });
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  }
);


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

app.delete("/deleteuser/:id", (req,res) => {
  const sql = "DELETE FROM user WHERE id = ?";
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
