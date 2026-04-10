import { PrismaClient } from "@prisma/client";

type CrudDelegate = {
  findMany: (...args: any[]) => any;
  findUnique: (...args: any[]) => any;
  create: (...args: any[]) => any;
  update: (...args: any[]) => any;
  delete: (...args: any[]) => any;
};

type PrismaModelName = keyof Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$queryRaw"
  | "$queryRawUnsafe"
>;

export class BaseRepository<
  TModel extends PrismaModelName,
  TDelegate extends CrudDelegate,
  TCreate,
  TUpdate
> {
  protected prisma: PrismaClient;
  protected model: TModel;
  protected primaryKey: string;

  constructor(prisma: PrismaClient, model: TModel, primaryKey: string) {
    this.prisma = prisma;
    this.model = model;
    this.primaryKey = primaryKey;
  }

  protected get delegate(): TDelegate {
    return this.prisma[this.model] as unknown as TDelegate;
  }

  async getAll(params?: { skip?: number; take?: number }) {
    const query: any = {};
    if (params?.skip) query.skip = params.skip;
    if (params?.take && params.take > 0) query.take = params.take;
    return this.delegate.findMany(query);
  }

  async getById(id: string) {
    return this.delegate.findUnique({
      where: { [this.primaryKey]: id },
    });
  }

  async create(data: TCreate) {
    return this.delegate.create({ data });
  }

  async update(id: string, data: TUpdate) {
    return this.delegate.update({
      where: { [this.primaryKey]: id },
      data,
    });
  }

  async delete(id: string) {
    return this.delegate.delete({
      where: { [this.primaryKey]: id },
    });
  }
}
