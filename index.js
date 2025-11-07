const express = require("express");
const app = express();
const port = 3002;
app.use(express.json());

const db = require("./db");
const bcrypt = require("bcrypt");
const cors = require("cors");
app.use(cors());
const jwt =

app.post("/cadastrar", async (req, res) => {
  const cliente = req.body;
  const senhaCript = bcrypt.hashSync(cliente.senha, 10);

  try {
    const sql = `
      INSERT INTO clientes 
        (nome_completo, cpf, estado, cidade, bairro, n_casa, rua, cep, email, telefone, senha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      cliente.nome_completo,
      cliente.cpf,
      cliente.estado,
      cliente.cidade,
      cliente.bairro,
      cliente.n_casa,
      cliente.rua,
      cliente.cep,
      cliente.email,
      cliente.telefone,
      senhaCript
    ];

    await db.pool.query(sql, valores);

    res.status(200).send(" Cliente cadastrado com sucesso!");
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    res.status(500).send("Erro interno no servidor");
  }
});

app.post("/cadastrar", async (req, res) => {
  const carro = req.body;

  try {
    const sql = `
      INSERT INTO carros 
        (marca, modelo, ano, cor, placa, renavam, preco, descricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      carro.marca,
      carro.modelo,
      carro.ano,
      carro.cor,
      carro.placa,
      carro.renavam,
      carro.preco,
      carro.descricao
    ];

    await db.pool.query(sql, valores);

    res.status(200).send("Carro cadastrado com sucesso!");
  } catch (erro) {
    console.error("Erro ao cadastrar carro:", erro);
    res.status(500).send("Erro interno no servidor");
  }
});


app.post("/login", async (req, res ) => {
  const login = req.body
  if (login.email == null || login.senha == null){
    return res.status(400).json({erro: "Informe o email e senha"})
  }
  try {
    const [resposta] = await db.pool.query(
      "SELECT nome_completo, email, senha FROM clientes WHERE email = ?",
      [login.email]
    )
    if (!resposta[0]){
      res.status(401).json({erro: "Credencial inválida"})
    }

    if(resposta[0].senha.length< 20){
      if(resposta.senha == login.senha){
        res.status(401).json({erro: "Credenciais invalidas"})
      }
    } else{
      const senhaValida = await bcrypt.compare(login.senha, resposta[0].senha)
      if(senhaValida){
        return res.status(401).json({erro: "Credenciais invalidas"})
      }
    }
    const infoToken = {
      nome_completo: resposta[0].nome_completo,
      email: resposta[0].email
    }
    const tokenDeAcesso = jwt.sign(infoToken, "Senha_secreta", {expiresin: "1m"})
    res.status(200).json({nome: resposta[0].nome_completo})
  } catch (erro) {
    res.status(400)
  }
})

app.get("/clientes/dados", async (req, res) => {
  const dados = req.body
  try {
    const [resultado] = await db.pool.query("SELECT * FROM clientes WHERE email = ?", [dados.email]);
    res.json(resultado);
  } catch (erro) {
    console.error("Erro ao buscar clientes:", erro);
    res.status(500).send(" Erro interno no servidor");
  }
});

app.get("/Carros/dados", async (req, res) => {
  const dados = req.body
  try {
    const [resultado] = await db.pool.query("SELECT * FROM carro");
    res.json(resultado);
  } catch (erro) {
    console.error("Erro ao buscar clientes:", erro);
    res.status(500).send(" Erro interno no servidor");
  }
});



app.listen(port, () => {
  console.log("🚀 API rodando na porta " + port);
});
function autenticar(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null){
      return res.status(401).json({erro: "Token não enviado, usar Authorization Bearer <token>"})
  }
  jwt.verify(token, "senha_secreta", (err, usuario) => {
      if (err) return res.status(403).json({erro: "Token inválido"})
      req.usuario = usuario
      next()
  })  
}




