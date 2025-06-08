import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation para criar uma nova empresa
export const createCompany = mutation({
  args: {
    cnpj: v.string(),
    cnae_principal_codigo: v.string(),
    codigo_cnae_fiscal: v.string(),
    cnae_principal_nome: v.string(),
    razao_social: v.string(),
    municipio: v.string(),
    uf: v.string(),
    estado: v.string(),
    mei: v.boolean(),
    simples: v.boolean(),
    opcao_pelo_simples: v.optional(v.boolean()),
    nome_fantasia: v.optional(v.string()),
    telefone_1: v.optional(v.string()),
    telefone_2: v.optional(v.string()),
    telefone_3: v.optional(v.string()),
    ddd_telefone_1: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logradouro: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco_mapa: v.optional(v.string()),
    maps: v.optional(v.string()),
    matriz_filial: v.optional(v.string()),
    porte: v.optional(v.string()),
    porte_empresa: v.optional(v.string()),
    capital_social: v.optional(v.number()),
    inicio_atividade: v.optional(v.string()),
    data_inicio_atividade: v.optional(v.string()),
    receita_federal: v.optional(v.string()),
    natureza_juridica: v.optional(v.string()),
    email_contabilidade: v.optional(v.string()),
    whatsapp_1: v.optional(v.string()),
    whatsapp_2: v.optional(v.string()),
    whatsapp_3: v.optional(v.string()),
    dominio_corporativo: v.optional(v.string()),
    site: v.optional(v.string()),
    cnae_secundario_codigo: v.optional(v.string()),
    cnae_secundario_nome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar se já existe uma empresa com este CNPJ
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_cnpj", (q) => q.eq("cnpj", args.cnpj))
      .unique();
    
    if (existing) {
      throw new Error("Já existe uma empresa com este CNPJ");
    }

    const now = Date.now();
    
    // Determinar se tem email e telefone
    const tem_email = !!args.email;
    const tem_telefone = !!args.telefone_1;
    
    const companyId = await ctx.db.insert("companies", {
      ...args,
      tem_email,
      tem_telefone,
      importado_em: now,
      atualizado_em: now,
    });

    return companyId;
  },
});

// Mutation para atualizar uma empresa existente
export const updateCompany = mutation({
  args: {
    id: v.id("companies"),
    cnpj: v.optional(v.string()),
    cnae_principal_codigo: v.optional(v.string()),
    cnae_principal_nome: v.optional(v.string()),
    razao_social: v.optional(v.string()),
    municipio: v.optional(v.string()),
    estado: v.optional(v.string()),
    mei: v.optional(v.boolean()),
    simples: v.optional(v.boolean()),
    nome_fantasia: v.optional(v.string()),
    telefone_1: v.optional(v.string()),
    email: v.optional(v.string()),
    porte: v.optional(v.string()),
    capital_social: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Verificar se a empresa existe
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Empresa não encontrada");
    }

    // Se o CNPJ está sendo alterado, verificar se não existe outro com o mesmo CNPJ
    if (updates.cnpj && updates.cnpj !== existing.cnpj) {
      const duplicateCnpj = await ctx.db
        .query("companies")
        .withIndex("by_cnpj", (q) => q.eq("cnpj", updates.cnpj!))
        .unique();
      
      if (duplicateCnpj) {
        throw new Error("Já existe uma empresa com este CNPJ");
      }
    }

    // Atualizar campos derivados
    const finalUpdates = {
      ...updates,
      tem_email: updates.email !== undefined ? !!updates.email : existing.tem_email,
      tem_telefone: updates.telefone_1 !== undefined ? !!updates.telefone_1 : existing.tem_telefone,
      atualizado_em: Date.now(),
    };

    await ctx.db.patch(id, finalUpdates);
    return id;
  },
});

// Mutation para deletar uma empresa
export const deleteCompany = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Empresa não encontrada");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
