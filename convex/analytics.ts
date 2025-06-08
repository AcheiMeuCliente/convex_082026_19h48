import { query } from "./_generated/server";
import { v } from "convex/values";

// Interface para filtros do dashboard
interface DashboardFilters {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cep?: string;
  logradouro?: string;
  capital_social_min?: number;
  capital_social_max?: number;
  codigo_cnae_fiscal?: string;
  natureza_juridica?: string;
  porte_empresa?: string;
  data_inicio_atividade_from?: string;
  data_inicio_atividade_to?: string;
  is_mei?: boolean;
  opcao_pelo_simples?: boolean;
  has_website?: boolean;
}

// Query para obter dados do dashboard com filtros
export const getDashboardData = query({
  args: {
    cnpj: v.optional(v.string()),
    razao_social: v.optional(v.string()),
    nome_fantasia: v.optional(v.string()),
    cep: v.optional(v.string()),
    logradouro: v.optional(v.string()),
    capital_social_min: v.optional(v.number()),
    capital_social_max: v.optional(v.number()),
    codigo_cnae_fiscal: v.optional(v.string()),
    natureza_juridica: v.optional(v.string()),
    porte_empresa: v.optional(v.string()),
    data_inicio_atividade_from: v.optional(v.string()),
    data_inicio_atividade_to: v.optional(v.string()),
    is_mei: v.optional(v.boolean()),
    opcao_pelo_simples: v.optional(v.boolean()),
    has_website: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Buscar todas as empresas
    const allCompanies = await ctx.db.query("companies").collect();
    
    // Aplicar filtros
    let filteredCompanies = allCompanies.filter(company => {
      // Filtro por CNPJ
      if (args.cnpj && !company.cnpj.includes(args.cnpj.replace(/\D/g, ''))) {
        return false;
      }
      
      // Filtro por Razão Social
      if (args.razao_social && !company.razao_social.toLowerCase().includes(args.razao_social.toLowerCase())) {
        return false;
      }
      
      // Filtro por Nome Fantasia
      if (args.nome_fantasia && company.nome_fantasia && !company.nome_fantasia.toLowerCase().includes(args.nome_fantasia.toLowerCase())) {
        return false;
      }
      
      // Filtro por CEP
      if (args.cep && company.cep && !company.cep.includes(args.cep.replace(/\D/g, ''))) {
        return false;
      }
      
      // Filtro por Logradouro
      if (args.logradouro && company.logradouro && !company.logradouro.toLowerCase().includes(args.logradouro.toLowerCase())) {
        return false;
      }
      
      // Filtro por Capital Social
      if (args.capital_social_min && company.capital_social && company.capital_social < args.capital_social_min) {
        return false;
      }
      if (args.capital_social_max && company.capital_social && company.capital_social > args.capital_social_max) {
        return false;
      }
      
      // Filtro por CNAE
      if (args.codigo_cnae_fiscal && company.codigo_cnae_fiscal !== args.codigo_cnae_fiscal) {
        return false;
      }
      
      // Filtro por Natureza Jurídica
      if (args.natureza_juridica && company.natureza_juridica !== args.natureza_juridica) {
        return false;
      }
      
      // Filtro por Porte da Empresa
      if (args.porte_empresa && company.porte_empresa !== args.porte_empresa) {
        return false;
      }
      
      // Filtro por Data de Início de Atividade
      if (args.data_inicio_atividade_from && company.data_inicio_atividade) {
        if (company.data_inicio_atividade < args.data_inicio_atividade_from) {
          return false;
        }
      }
      if (args.data_inicio_atividade_to && company.data_inicio_atividade) {
        if (company.data_inicio_atividade > args.data_inicio_atividade_to) {
          return false;
        }
      }
      
      // Filtro por MEI
      if (args.is_mei !== undefined) {
        const isMei = company.porte_empresa === "MEI" || company.mei;
        if (isMei !== args.is_mei) {
          return false;
        }
      }
      
      // Filtro por Simples Nacional
      if (args.opcao_pelo_simples !== undefined && company.opcao_pelo_simples !== args.opcao_pelo_simples) {
        return false;
      }
      
      // Filtro por Website
      if (args.has_website !== undefined) {
        const hasWebsite = !!(company.website && company.website.trim() !== '');
        if (hasWebsite !== args.has_website) {
          return false;
        }
      }
      
      return true;
    });
    
    // Calcular estatísticas
    const currentYear = new Date().getFullYear();
    const totalEmpresas = filteredCompanies.length;
    
    // Calcular idade média
    const empresasComData = filteredCompanies.filter(c => c.data_inicio_atividade);
    const idadeMedia = empresasComData.length > 0 
      ? empresasComData.reduce((acc, company) => {
          const anoInicio = parseInt(company.data_inicio_atividade!.split('-')[0]);
          return acc + (currentYear - anoInicio);
        }, 0) / empresasComData.length
      : 0;
    
    // Contar empresas com email
    const comEmail = filteredCompanies.filter(c => c.email && c.email.trim() !== '').length;
    
    // Contar empresas com telefone
    const comTelefone = filteredCompanies.filter(c => c.ddd_telefone_1 && c.ddd_telefone_1.trim() !== '').length;
    
    // Agrupar por região
    const empresasPorRegiao = filteredCompanies.reduce((acc, company) => {
      const estado = company.uf || company.estado;
      const municipio = company.municipio;
      const bairro = company.bairro || 'Não informado';
      
      const key = `${estado}-${municipio}-${bairro}`;
      
      if (!acc[key]) {
        acc[key] = {
          estado,
          municipio,
          bairro,
          empresas: 0
        };
      }
      
      acc[key].empresas++;
      return acc;
    }, {} as Record<string, { estado: string; municipio: string; bairro: string; empresas: number }>);
    
    return {
      panorama: {
        totalEmpresas,
        idadeMedia: Math.round(idadeMedia * 10) / 10,
        mesAnoAtual: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      },
      contatos: {
        comEmail,
        percentualEmail: totalEmpresas > 0 ? Math.round((comEmail / totalEmpresas) * 100) : 0,
        comTelefone,
        percentualTelefone: totalEmpresas > 0 ? Math.round((comTelefone / totalEmpresas) * 100) : 0
      },
      empresasPorRegiao: Object.values(empresasPorRegiao).sort((a, b) => b.empresas - a.empresas)
    };
  },
});

// Query para obter opções de filtros
export const getFilterOptions = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const cnaeMetadata = await ctx.db.query("cnae_metadata").collect();
    
    // Extrair valores únicos para dropdowns
    const naturezasJuridicas = [...new Set(companies
      .map(c => c.natureza_juridica)
      .filter((value): value is string => Boolean(value))
    )].sort();
    
    const portesEmpresa = [...new Set(companies
      .map(c => c.porte_empresa)
      .filter((value): value is string => Boolean(value))
    )].sort();
    
    // CNAEs com contagem
    const cnaesComContagem = cnaeMetadata.map(cnae => ({
      codigo: cnae.codigo,
      nome: cnae.nome,
      total: companies.filter(c => c.codigo_cnae_fiscal === cnae.codigo).length
    })).filter(cnae => cnae.total > 0).sort((a, b) => b.total - a.total);
    
    return {
      naturezasJuridicas,
      portesEmpresa,
      cnaes: cnaesComContagem
    };
  },
});

// Query para buscar empresas com paginação (para a tabela)
export const getCompaniesWithFilters = query({
  args: {
    cnpj: v.optional(v.string()),
    razao_social: v.optional(v.string()),
    nome_fantasia: v.optional(v.string()),
    cep: v.optional(v.string()),
    logradouro: v.optional(v.string()),
    capital_social_min: v.optional(v.number()),
    capital_social_max: v.optional(v.number()),
    codigo_cnae_fiscal: v.optional(v.string()),
    natureza_juridica: v.optional(v.string()),
    porte_empresa: v.optional(v.string()),
    data_inicio_atividade_from: v.optional(v.string()),
    data_inicio_atividade_to: v.optional(v.string()),
    is_mei: v.optional(v.boolean()),
    opcao_pelo_simples: v.optional(v.boolean()),
    has_website: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allCompanies = await ctx.db.query("companies").collect();
    
    // Aplicar os mesmos filtros da função getDashboardData
    let filteredCompanies = allCompanies.filter(company => {
      // Mesmo código de filtros da função anterior
      if (args.cnpj && !company.cnpj.includes(args.cnpj.replace(/\D/g, ''))) return false;
      if (args.razao_social && !company.razao_social.toLowerCase().includes(args.razao_social.toLowerCase())) return false;
      if (args.nome_fantasia && company.nome_fantasia && !company.nome_fantasia.toLowerCase().includes(args.nome_fantasia.toLowerCase())) return false;
      if (args.cep && company.cep && !company.cep.includes(args.cep.replace(/\D/g, ''))) return false;
      if (args.logradouro && company.logradouro && !company.logradouro.toLowerCase().includes(args.logradouro.toLowerCase())) return false;
      if (args.capital_social_min && company.capital_social && company.capital_social < args.capital_social_min) return false;
      if (args.capital_social_max && company.capital_social && company.capital_social > args.capital_social_max) return false;
      if (args.codigo_cnae_fiscal && company.codigo_cnae_fiscal !== args.codigo_cnae_fiscal) return false;
      if (args.natureza_juridica && company.natureza_juridica !== args.natureza_juridica) return false;
      if (args.porte_empresa && company.porte_empresa !== args.porte_empresa) return false;
      if (args.data_inicio_atividade_from && company.data_inicio_atividade && company.data_inicio_atividade < args.data_inicio_atividade_from) return false;
      if (args.data_inicio_atividade_to && company.data_inicio_atividade && company.data_inicio_atividade > args.data_inicio_atividade_to) return false;
      if (args.is_mei !== undefined) {
        const isMei = company.porte_empresa === "MEI" || company.mei;
        if (isMei !== args.is_mei) return false;
      }
      if (args.opcao_pelo_simples !== undefined && company.opcao_pelo_simples !== args.opcao_pelo_simples) return false;
      if (args.has_website !== undefined) {
        const hasWebsite = !!(company.website && company.website.trim() !== '');
        if (hasWebsite !== args.has_website) return false;
      }
      return true;
    });
    
    // Ordenar por data de criação (mais recentes primeiro)
    filteredCompanies.sort((a, b) => b._creationTime - a._creationTime);
    
    // Aplicar paginação
    const limit = args.limit || 50;
    const offset = args.offset || 0;
    const paginatedCompanies = filteredCompanies.slice(offset, offset + limit);
    
    return {
      companies: paginatedCompanies,
      total: filteredCompanies.length,
      hasMore: offset + limit < filteredCompanies.length
    };
  },
});
