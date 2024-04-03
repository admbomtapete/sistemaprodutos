require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

let singleton;

async function connect() {
    if (singleton) return singleton;

    const client = new MongoClient(process.env.MONGO_HOST);
    await client.connect();

    singleton = client.db(process.env.MONGO_DATABASE);
    return singleton;
}

async function insert(produto) {
    if (!produto.codigo) {
        return { error: "O campo código não pode estar vazio" };
    }

    const db = await connect();

    // Verificar se o código já existe no banco de dados
    const existingProduct = await db.collection("codprodutos").findOne({ codigo: produto.codigo });

    if (!existingProduct) {
        // Se não existir, inserir com status "DOCA SUJA"
        produto.status = "DOCA SUJA";
        produto.createdAt = new Date(); // Registrar data e hora do registro
        return db.collection("codprodutos").insertOne(produto);
    } else {
        // Se existir, atualizar o status com base no número de vezes inserido
        if (existingProduct.status === "DOCA SUJA") {
            produto.status = "LAVADO";
        } else if (existingProduct.status === "LAVADO") {
            produto.status = "PRONTO";
        } else if (existingProduct.status === "PRONTO") {
            // Se já estiver PRONTO, atualizar para ARQUIVADO e registrar data e hora
            produto.status = "ARQUIVADO";
            produto.updatedAt = new Date(); // Registrar data e hora da atualização
        } else {
            // Se já estiver ARQUIVADO, não fazer nada
            return { message: "Produto já está arquivado" };
        }

        // Atualizar o documento existente com o novo status e registrar data e hora
        produto.updatedAt = new Date(); // Definir updatedAt antes de atualizar
        return db.collection("codprodutos").updateOne({ _id: existingProduct._id }, { $set: { status: produto.status, updatedAt: produto.updatedAt } });
    }
}

async function findByDate(date) {
    const db = await connect();
    const startOfDay = new Date(`${date}T00:00:00-03:00`); // Início do dia no fuso horário de Brasília
    const endOfDay = new Date(`${date}T23:59:59.999-03:00`); // Fim do dia no fuso horário de Brasília
    return db.collection("codprodutos").find({
        $or: [
            { createdAt: { $gte: startOfDay, $lte: endOfDay } },
            { updatedAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
    }).toArray();
}

async function findByStatus(status) {
    const db = await connect();
    return db.collection("codprodutos").find({
        status: status
    }).toArray();
}



async function find() {
    const db = await connect();
    return db.collection("codprodutos").find().toArray();
}

async function remove(id) {
    const db = await connect();
    return db.collection("codprodutos").deleteOne({ _id: new ObjectId(id) });
}

async function update(id, name) {
    const db = await connect();
    return db.collection("codprodutos").updateOne({ _id: new ObjectId(id) }, { $set: { codigo: name } });
}



module.exports = {
    insert,
    find,
    remove,
    update,
    findByDate, 
    findByStatus
};
