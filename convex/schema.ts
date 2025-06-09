import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Tabela principal de empresas baseada na estrutura CSV oficial
  companies: defineTable({
    cnpj: v.string(), // 1
    cnae_principal_codigo: v.string(), // 2
    cnae_principal_nome: v.string(), // 3
    cnae_secundario_codigo: v.optional(v.string()), // 4
    cnae_secundario_nome: v.optional(v.string()), // 5
    razao_social: v.string(), // 6
    nome_fantasia: v.optional(v.string()), // 7
    telefone_1: v.optional(v.string()), // 8
    telefone_2: v.optional(v.string()), // 9
    telefone_3: v.optional(v.string()), // 10
    email: v.optional(v.string()), // 11
    bairro: v.optional(v.string()), // 12
    cep: v.optional(v.string()), // 13
    municipio: v.string(), // 14
    estado: v.string(), // 15
    endereco_mapa: v.optional(v.string()), // 16
    maps: v.optional(v.string()), // 17
    matriz_filial: v.optional(v.string()), // 18
    porte: v.optional(v.string()), // 19
    capital_social: v.optional(v.number()), // 20
    mei: v.optional(v.boolean()), // 21
    simples: v.optional(v.boolean()), // 22
    inicio_atividade: v.optional(v.string()), // 23
    receita_federal: v.optional(v.string()), // 24
    natureza_juridica: v.optional(v.string()), // 25
    email_contabilidade: v.optional(v.string()), // 26
    tem_email: v.optional(v.boolean()), // 27
    tem_telefone: v.optional(v.boolean()), // 28
    whatsapp_1: v.optional(v.string()), // 29
    whatsapp_2: v.optional(v.string()), // 30
    whatsapp_3: v.optional(v.string()), // 31
    dominio_corporativo: v.optional(v.string()), // 32
    site: v.optional(v.string()), // 33
    importado_em: v.optional(v.number()),
    atualizado_em: v.optional(v.number()),
  })
    .index("by_cnpj", ["cnpj"])
    .index("by_razao_social", ["razao_social"])
    .index("by_cnae_principal", ["cnae_principal_codigo"])
    .index("by_municipio", ["municipio"])
    .index("by_estado", ["estado"]),

  // Metadados dos CNAEs
  cnae_metadata: defineTable({
    codigo: v.string(),
    nome: v.string(),
    ativo: v.boolean(),
    total_empresas: v.optional(v.number()),
  }).index("by_codigo", ["codigo"]),

  // Estados e estatísticas
  estados: defineTable({
    codigo: v.string(),
    nome: v.string(),
    regiao: v.string(),
    total_empresas: v.optional(v.number()),
  }).index("by_codigo", ["codigo"]),

  // Tabela de usuários
  users: defineTable({
    name: v.string(),
    isAdmin: v.boolean(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
