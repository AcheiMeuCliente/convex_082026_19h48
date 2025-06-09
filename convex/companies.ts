import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import Papa from "papaparse";
import { api } from "./_generated/api";

// Query para listar empresas com filtros básicos (apenas campos válidos)
export const listCompanies = query({
  args: {
    search: v.optional(v.string()),
    cnae: v.optional(v.string()),
    estado: v.optional(v.string()),
    municipio: v.optional(v.string()),
    porte: v.optional(v.string()),
    mei: v.optional(v.boolean()),
    simples: v.optional(v.boolean()),
    tem_email: v.optional(v.boolean()),
    tem_telefone: v.optional(v.boolean()),
    bairro: v.optional(v.string()),
    cep: v.optional(v.string()),
    matriz_filial: v.optional(v.string()),
    natureza_juridica: v.optional(v.string()),
    capital_social_min: v.optional(v.number()),
    capital_social_max: v.optional(v.number()),
    inicio_atividade_from: v.optional(v.string()),
    inicio_atividade_to: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let companies = await ctx.db.query("companies").collect();
    if (args.search) {
      companies = companies.filter(c =>
        c.razao_social && c.razao_social.toLowerCase().includes(args.search!.toLowerCase())
      );
    }
    if (args.cnae) {
      companies = companies.filter(c => c.cnae_principal_codigo === args.cnae);
    }
    if (args.estado) {
      companies = companies.filter(c => c.estado === args.estado);
    }
    if (args.municipio) {
      companies = companies.filter(c => c.municipio === args.municipio);
    }
    if (args.porte) {
      companies = companies.filter(c => c.porte === args.porte);
    }
    if (args.mei !== undefined) {
      companies = companies.filter(c => c.mei === args.mei);
    }
    if (args.simples !== undefined) {
      companies = companies.filter(c => c.simples === args.simples);
    }
    if (args.tem_email !== undefined) {
      companies = companies.filter(c => c.tem_email === args.tem_email);
    }
    if (args.tem_telefone !== undefined) {
      companies = companies.filter(c => c.tem_telefone === args.tem_telefone);
    }
    if (args.bairro) {
      companies = companies.filter(c => c.bairro && c.bairro.toLowerCase().includes(args.bairro!.toLowerCase()));
    }
    if (args.cep) {
      companies = companies.filter(c => c.cep && c.cep.includes(args.cep!.replace(/\D/g, '')));
    }
    if (args.matriz_filial) {
      companies = companies.filter(c => c.matriz_filial === args.matriz_filial);
    }
    if (args.natureza_juridica) {
      companies = companies.filter(c => c.natureza_juridica === args.natureza_juridica);
    }
    if (args.capital_social_min !== undefined) {
      companies = companies.filter(c => c.capital_social && c.capital_social >= args.capital_social_min!);
    }
    if (args.capital_social_max !== undefined) {
      companies = companies.filter(c => c.capital_social && c.capital_social <= args.capital_social_max!);
    }
    if (args.inicio_atividade_from) {
      companies = companies.filter(c => c.inicio_atividade && c.inicio_atividade >= args.inicio_atividade_from!);
    }
    if (args.inicio_atividade_to) {
      companies = companies.filter(c => c.inicio_atividade && c.inicio_atividade <= args.inicio_atividade_to!);
    }
    // Ordenar por data de criação (mais recentes primeiro)
    companies.sort((a, b) => b._creationTime - a._creationTime);
    // Paginação
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    const paginated = companies.slice(offset, offset + limit);
    return {
      companies: paginated,
      total: companies.length,
      hasMore: offset + limit < companies.length
    };
  },
});

// Query para buscar empresa por CNPJ
export const getCompanyByCnpj = query({
  args: { cnpj: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_cnpj", (q) => q.eq("cnpj", args.cnpj))
      .unique();
  },
});

// Query para buscar empresa por ID
export const getCompany = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation para criar uma nova empresa (usando apenas campos válidos)
export const createCompany = mutation({
  args: {
    cnpj: v.string(),
    cnae_principal_codigo: v.string(),
    cnae_principal_nome: v.string(),
    cnae_secundario_codigo: v.optional(v.string()),
    cnae_secundario_nome: v.optional(v.string()),
    razao_social: v.string(),
    nome_fantasia: v.optional(v.string()),
    telefone_1: v.optional(v.string()),
    telefone_2: v.optional(v.string()),
    telefone_3: v.optional(v.string()),
    email: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cep: v.optional(v.string()),
    municipio: v.string(),
    estado: v.string(),
    endereco_mapa: v.optional(v.string()),
    maps: v.optional(v.string()),
    matriz_filial: v.optional(v.string()),
    porte: v.optional(v.string()),
    capital_social: v.optional(v.number()),
    mei: v.optional(v.boolean()),
    simples: v.optional(v.boolean()),
    inicio_atividade: v.optional(v.string()),
    receita_federal: v.optional(v.string()),
    natureza_juridica: v.optional(v.string()),
    email_contabilidade: v.optional(v.string()),
    tem_email: v.optional(v.boolean()),
    tem_telefone: v.optional(v.boolean()),
    whatsapp_1: v.optional(v.string()),
    whatsapp_2: v.optional(v.string()),
    whatsapp_3: v.optional(v.string()),
    dominio_corporativo: v.optional(v.string()),
    site: v.optional(v.string()),
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
    const companyId = await ctx.db.insert("companies", { ...args, importado_em: now, atualizado_em: now });
    return companyId;
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

// Mapeamento de colunas do CSV oficial para snake_case
const csvToSnakeCaseMap: Record<string, string> = {
  "CNPJ": "cnpj",
  "CNAE_PRINCIPAL_CODIGO": "cnae_principal_codigo",
  "CNAE_PRINCIPAL_NOME": "cnae_principal_nome",
  "CNAE_SECUNDARIO_CODIGO": "cnae_secundario_codigo",
  "CNAE_SECUNDARIO_NOME": "cnae_secundario_nome",
  "RAZÃO SOCIAL": "razao_social",
  "NOME FANTASIA": "nome_fantasia",
  "TELEFONE_1": "telefone_1",
  "TELEFONE_2": "telefone_2",
  "TELEFONE_3": "telefone_3",
  "E-MAIL": "email",
  "BAIRRO": "bairro",
  "CEP": "cep",
  "MUNICIPIO": "municipio",
  "ESTADO": "estado",
  "ENDERECO MAPA": "endereco_mapa",
  "MAPS": "maps",
  "MATRIZ FILIAL": "matriz_filial",
  "PORTE": "porte",
  "CAPITAL SOCIAL": "capital_social",
  "MEI": "mei",
  "SIMPLES": "simples",
  "INICIO ATIVIDADE": "inicio_atividade",
  "RECEITA FEDERAL": "receita_federal",
  "NATUREZA_JURIDICA": "natureza_juridica",
  "EMAIL_CONTABILIDADE": "email_contabilidade",
  "TEM_EMAIL": "tem_email",
  "TEM_TELEFONE": "tem_telefone",
  "WHATSAPP_1": "whatsapp_1",
  "WHATSAPP_2": "whatsapp_2",
  "WHATSAPP_3": "whatsapp_3",
  "DOMINIO_CORPORATIVO": "dominio_corporativo",
  "SITE": "site"
};

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const v = value.trim().toLowerCase();
  if (["sim", "true", "1", "yes"].includes(v)) return true;
  if (["não", "nao", "false", "0", "no"].includes(v)) return false;
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  return isNaN(n) ? undefined : n;
}

export const importCompaniesFromCSV = mutation({
  args: {
    companies: v.array(v.any()), // Recebe objetos com nomes de colunas do CSV oficial
  },
  handler: async (ctx, args) => {
    const requiredFields = [
      "CNPJ", "CNAE_PRINCIPAL_CODIGO", "CNAE_PRINCIPAL_NOME", "RAZÃO SOCIAL", "MUNICIPIO", "ESTADO"
    ];
    let imported = 0;
    const now = Date.now();
    const errors: any[] = [];

    for (let i = 0; i < args.companies.length; i++) {
      const original = args.companies[i];
      // Mapeia as chaves do CSV para snake_case
      const company: Record<string, any> = {};
      for (const [csvKey, snakeKey] of Object.entries(csvToSnakeCaseMap)) {
        company[snakeKey] = original[csvKey] ?? undefined;
      }
      // Conversão de tipos
      company.capital_social = parseNumber(company.capital_social);
      company.mei = parseBoolean(company.mei);
      company.simples = parseBoolean(company.simples);
      company.tem_email = parseBoolean(company.tem_email);
      company.tem_telefone = parseBoolean(company.tem_telefone);
      // Validação de obrigatórios
      for (const field of requiredFields) {
        const key = csvToSnakeCaseMap[field];
        if (!company[key]) {
          errors.push({ line: i + 2, column: field, message: `Campo obrigatório ausente: ${field}` });
        }
      }
      // Validação de tipos
      if (company.capital_social !== undefined && typeof company.capital_social !== "number") {
        errors.push({ line: i + 2, column: "CAPITAL SOCIAL", message: "Valor inválido: deve ser número" });
      }
      if (company.mei !== undefined && typeof company.mei !== "boolean") {
        errors.push({ line: i + 2, column: "MEI", message: "Valor inválido: use SIM/NÃO ou true/false" });
      }
      if (company.simples !== undefined && typeof company.simples !== "boolean") {
        errors.push({ line: i + 2, column: "SIMPLES", message: "Valor inválido: use SIM/NÃO ou true/false" });
      }
      if (company.tem_email !== undefined && typeof company.tem_email !== "boolean") {
        errors.push({ line: i + 2, column: "TEM_EMAIL", message: "Valor inválido: use SIM/NÃO ou true/false" });
      }
      if (company.tem_telefone !== undefined && typeof company.tem_telefone !== "boolean") {
        errors.push({ line: i + 2, column: "TEM_TELEFONE", message: "Valor inválido: use SIM/NÃO ou true/false" });
      }
      // Se houver erro nesta linha, não importa
      if (errors.length > 0) continue;
      // Verifica duplicidade de CNPJ
      const existing = await ctx.db.query("companies").withIndex("by_cnpj", q => q.eq("cnpj", company.cnpj)).unique();
      if (!existing) {
        await ctx.db.insert("companies", { ...company, importado_em: now, atualizado_em: now });
        imported++;
      }
    }
    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }
    return { imported, total: args.companies.length };
  },
});
