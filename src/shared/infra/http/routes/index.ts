import { Router } from 'express';

import { routesVendas } from '@modules/vendas/infra/http/routes';

const routes = Router();

routes.use('/vendas', routesVendas);

// routes.get('/devedores', async (req, res) => {
// const devedores =
//   await prisma.$executeRaw`SELECT * FROM vendas,clientes,formapagar WHERE vendas.formapagto=formapagar.id_cond and clientes.id=vendas.cliente and vendas.status=1 order by clientes.nome`;

// const devedores = await prisma.$executeRaw`SELECT * FROM formapagar`;
//   const vendas = await prisma.vendas.findMany({
//     include: {
//       formapagar: true,
//       clientes: true,
//       produtos: true,
//       receber: {
//         orderBy: {
//           data: 'asc',
//         },
//       },
//     },
//     where: {
//       status: 1,
//     },
//     orderBy: {
//       clientes: {
//         nome: 'asc',
//       },
//     },
//   });

//   const devedores = vendas
//     .map(devedor => ({
//       ...devedor,
//       total:
//         devedor.produtos.reduce(
//           (acc, curr) => acc + (curr.valor || 0) * (curr.qtde || 0),
//           0,
//         ) -
//         (devedor.desconto || 0) +
//         (devedor.frete || 0),
//       totalRecebido: devedor.receber.reduce(
//         (acc, curr) => acc + (curr.valor || 0),
//         0,
//       ),
//     }))
//     .filter(devedor => devedor.total > devedor.totalRecebido);

//   const vTotal = devedores.reduce(
//     (acc, curr) => acc + (curr.total - curr.totalRecebido),
//     0,
//   );

//   return res.json({
//     total: devedores.length,
//     totalDevedor: formatValueToBRL(vTotal),
//     devedores: devedores.map(devedor => ({
//       nome: devedor.clientes?.nome || '',
//       data_venda: devedor.data,
//       obs: devedor.obs || '',
//       id_venda: devedor.id_venda,
//       total: formatValueToBRL(devedor.total || 0),
//       totalRecebido: formatValueToBRL(devedor.totalRecebido || 0),
//       ultimoPagamento: devedor.receber[devedor.receber.length - 1]?.data || '',
//       valorUltimoPagamento: formatValueToBRL(
//         devedor.receber[devedor.receber.length - 1]?.valor || 0,
//       ),
//       saldoDevedor: formatValueToBRL(devedor.total - devedor.totalRecebido),
//     })),
//   });
// });
export { routes };
