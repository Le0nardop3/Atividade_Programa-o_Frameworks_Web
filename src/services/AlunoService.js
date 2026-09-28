const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");

class AlunoService {

    async findMany(page, pageSize, orderBy, order) {
        const alunos = await prisma.aluno.findMany({
            skip: (page - 1) * pageSize,
            take: Number(pageSize),
            orderBy: {
                [orderBy]: order
            }
        });

        const total = await prisma.aluno.count();

        return {
            alunos,
            total
        };
    }

    async findUnique(id) {
        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }


    async update(id, dados) {
        const { nome, email } = dados;

        // Reaproveito AlunoNaoEncontradoError para manter o mesmo tratamento
        // usado na busca por ID. Para dados inválidos e e-mail duplicado,
        // utilizo AlunoInvalidoError, pois são erros causados pelos dados enviados.

        if (!nome && !email) {
            throw new AlunoInvalidoError("Informe nome ou email para atualizar");
        }

        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        try {
            const alunoAtualizado = await prisma.aluno.update({
                where: {
                    id: Number(id)
                },
                data: {
                    ...(nome && { nome }),
                    ...(email && { email })
                }
            });

            return alunoAtualizado;
        } catch (e) {
            if (e.code === "P2002") {
                throw new AlunoInvalidoError("E-mail já cadastrado");
            }

            throw e;
        }
    }


    async delete(id) {
        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!aluno) {
            throw new AlunoNaoEncontradoError();
        }

        await prisma.aluno.delete({
            where: {
                id: Number(id)
            }
        });
    }

    async create(aluno) {
        const { nome, email } = aluno;
        if (!nome || !email) {
            throw new AlunoInvalidoError();
        }
        //create = insert
        //update = update
        //delete = delete
        //findMany = select * from
        const novoAluno = await prisma.aluno.create({ data: aluno });

        return novoAluno;
    }
}

module.exports = new AlunoService();