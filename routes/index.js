var express = require('express');
var router = express.Router();
const db = require("../server");


/* GET home page. */
router.get('/',async (req, res, next) => {
  const result = await db.find();
  res.render('index', { result });
});

router.get("/products", async (req, res) => {
  const { date, status } = req.query;

  const productsByDate = date ? await db.findByDate(date) : [];
  const productsByStatus = status ? await db.findByStatus(status) : [];

  // Usando um conjunto para armazenar os produtos únicos
  const uniqueProducts = new Set([...productsByDate, ...productsByStatus]);

  // Convertendo de volta para uma matriz
  const combinedProducts = [...uniqueProducts];

  res.json(combinedProducts);
});


router.get('/remove',async (req, res, next) => {
  const result = await db.find();
  res.render('delete', { result });
});

router.get('/relatorio',async (req, res, next) => {
  const result = await db.find();
  res.render('relatorio', { result });
});

router.post("/save", async (req, res) => {
  const teste = req.body;
  const result = await db.insert(teste);
  console.log(result);
  res.redirect('/');
  
})

router.post("/delete", async (req, res) => {
  const id = req.body.id;
  const result = await db.remove(id);
  console.log(result);
  res.redirect('/');
})

router.post("/edit", async (req, res) => {
  const id = req.body.id;
  const codigo = req.body.codigo;
  const result = await db.update(id, codigo);
  console.log(result);
  res.redirect('/');
})


module.exports = router;
