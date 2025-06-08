import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// Query principal com paginação e filtros avançados
export const listCompanies = query({
  args: {
    paginationOpts: paginationOptsValidator,
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
    porte_empresa: v.optional(v.string()),
    dominio_corporativo: v.optional(v.string()),
    capital_social_min: v.optional(v.number()),
    capital_social_max: v.optional(v.number()),
    data_inicio_from: v.optional(v.string()),
    data_inicio_to: v.optional(v.string()),
    idade_min: v.optional(v.number()),
    idade_max: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Busca textual
    if (args.search) {
      return await ctx.db
        .query("companies")
        .withSearchIndex("search_companies", (q) => {
          let searchQuery = q.search("razao_social", args.search!);
          
          if (args.estado) {
            searchQuery = searchQuery.eq("estado", args.estado);
          }
          if (args.porte) {
            searchQuery = searchQuery.eq("porte", args.porte);
          }
          if (args.cnae) {
            searchQuery = searchQuery.eq("cnae_principal_codigo", args.cnae);
          }
          if (args.municipio) {
            searchQuery = searchQuery.eq("municipio", args.municipio);
          }
          
          return searchQuery;
        })
        .paginate(args.paginationOpts);
    }

    // Sem busca textual - usar filtros simples
    let query = ctx.db.query("companies");
    
    // Aplicar filtros usando filter() em vez de índices complexos
    const companies = await query.collect();
    
    let filteredCompanies = companies;
    
    if (args.cnae) {
      filteredCompanies = filteredCompanies.filter(c => c.cnae_principal_codigo === args.cnae);
    }
    if (args.estado) {
      filteredCompanies = filteredCompanies.filter(c => c.estado === args.estado);
    }
    if (args.municipio) {
      filteredCompanies = filteredCompanies.filter(c => c.municipio === args.municipio);
    }
    if (args.porte) {
      filteredCompanies = filteredCompanies.filter(c => c.porte === args.porte);
    }
    if (args.mei !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.mei === args.mei);
    }
    if (args.simples !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.simples === args.simples);
    }
    if (args.tem_email !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.tem_email === args.tem_email);
    }
    if (args.tem_telefone !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.tem_telefone === args.tem_telefone);
    }
    if (args.bairro) {
      filteredCompanies = filteredCompanies.filter(c => c.bairro && c.bairro.toLowerCase().includes(args.bairro!.toLowerCase()));
    }
    if (args.cep) {
      filteredCompanies = filteredCompanies.filter(c => c.cep && c.cep.includes(args.cep!.replace(/\D/g, '')));
    }
    if (args.matriz_filial) {
      filteredCompanies = filteredCompanies.filter(c => c.matriz_filial === args.matriz_filial);
    }
    if (args.natureza_juridica) {
      filteredCompanies = filteredCompanies.filter(c => c.natureza_juridica === args.natureza_juridica);
    }
    if (args.porte_empresa) {
      filteredCompanies = filteredCompanies.filter(c => c.porte_empresa === args.porte_empresa);
    }
    if (args.dominio_corporativo) {
      filteredCompanies = filteredCompanies.filter(c => c.dominio_corporativo === args.dominio_corporativo);
    }
    if (args.capital_social_min !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.capital_social && c.capital_social >= args.capital_social_min!);
    }
    if (args.capital_social_max !== undefined) {
      filteredCompanies = filteredCompanies.filter(c => c.capital_social && c.capital_social <= args.capital_social_max!);
    }
    if (args.data_inicio_from) {
      filteredCompanies = filteredCompanies.filter(c => c.data_inicio_atividade && c.data_inicio_atividade >= args.data_inicio_from!);
    }
    if (args.data_inicio_to) {
      filteredCompanies = filteredCompanies.filter(c => c.data_inicio_atividade && c.data_inicio_atividade <= args.data_inicio_to!);
    }
    
    // Filtro por idade da empresa
    if (args.idade_min !== undefined || args.idade_max !== undefined) {
      const currentYear = new Date().getFullYear();
      filteredCompanies = filteredCompanies.filter(c => {
        if (!c.data_inicio_atividade) return false;
        const startYear = parseInt(c.data_inicio_atividade.split('-')[0]);
        const age = currentYear - startYear;
        
        if (args.idade_min !== undefined && age < args.idade_min) return false;
        if (args.idade_max !== undefined && age > args.idade_max) return false;
        
        return true;
      });
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filteredCompanies.sort((a, b) => b._creationTime - a._creationTime);

    // Implementar paginação manual
    const startIndex = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
    const endIndex = startIndex + args.paginationOpts.numItems;
    const page = filteredCompanies.slice(startIndex, endIndex);
    const isDone = endIndex >= filteredCompanies.length;
    const continueCursor = isDone ? null : endIndex.toString();

    // Adicionar idade calculada para cada empresa
    const pageWithAge = page.map(company => {
      let age = null;
      if (company.data_inicio_atividade) {
        const currentYear = new Date().getFullYear();
        const startYear = parseInt(company.data_inicio_atividade.split('-')[0]);
        age = currentYear - startYear;
      }
      return { ...company, idade_empresa: age };
    });

    return {
      page: pageWithAge,
      isDone,
      continueCursor
    };
  },
});

// Estatísticas do dashboard
export const getDashboardStats = query({
  args: {
    cnae: v.optional(v.string()),
    estado: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companies = await ctx.db.query("companies").collect();
    
    // Aplicar filtros se fornecidos
    let filteredCompanies = companies;
    if (args.cnae) {
      filteredCompanies = filteredCompanies.filter(c => c.cnae_principal_codigo === args.cnae);
    }
    if (args.estado) {
      filteredCompanies = filteredCompanies.filter(c => c.estado === args.estado);
    }
    
    const stats = {
      total: filteredCompanies.length,
      mei: filteredCompanies.filter(c => c.mei).length,
      simples: filteredCompanies.filter(c => c.simples).length,
      com_email: filteredCompanies.filter(c => c.tem_email).length,
      com_telefone: filteredCompanies.filter(c => c.tem_telefone).length,
      com_whatsapp: filteredCompanies.filter(c => c.whatsapp_1).length,
      com_site: filteredCompanies.filter(c => c.site && c.site !== '').length,
      
      por_porte: filteredCompanies.reduce((acc, company) => {
        const porte = company.porte || "Não informado";
        acc[porte] = (acc[porte] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      por_estado: filteredCompanies.reduce((acc, company) => {
        const estado = company.estado;
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      por_municipio: filteredCompanies.reduce((acc, company) => {
        const municipio = company.municipio;
        acc[municipio] = (acc[municipio] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      top_cnaes: filteredCompanies.reduce((acc, company) => {
        const cnae = company.cnae_principal_codigo;
        acc[cnae] = (acc[cnae] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
    
    return stats;
  },
});

// Obter empresa específica
export const getCompany = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    if (!company) return null;
    
    // Adicionar idade calculada
    let age = null;
    if (company.data_inicio_atividade) {
      const currentYear = new Date().getFullYear();
      const startYear = parseInt(company.data_inicio_atividade.split('-')[0]);
      age = currentYear - startYear;
    }
    
    return { ...company, idade_empresa: age };
  },
});

// Buscar empresas por CNPJ
export const getCompanyByCnpj = query({
  args: { cnpj: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_cnpj", (q) => q.eq("cnpj", args.cnpj))
      .unique();
  },
});

// Listar CNAEs únicos
export const getUniqueCnaes = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const cnaes = new Map();
    
    companies.forEach(company => {
      if (!cnaes.has(company.cnae_principal_codigo)) {
        cnaes.set(company.cnae_principal_codigo, {
          codigo: company.cnae_principal_codigo,
          nome: company.cnae_principal_nome,
          total: 0
        });
      }
      cnaes.get(company.cnae_principal_codigo).total++;
    });
    
    return Array.from(cnaes.values()).sort((a, b) => b.total - a.total);
  },
});

// Listar estados únicos
export const getUniqueEstados = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    const estados = new Map();
    
    companies.forEach(company => {
      if (!estados.has(company.estado)) {
        estados.set(company.estado, {
          codigo: company.estado,
          total: 0
        });
      }
      estados.get(company.estado).total++;
    });
    
    return Array.from(estados.values()).sort((a, b) => b.total - a.total);
  },
});

// Listar municípios por estado
export const getMunicipiosByEstado = query({
  args: { estado: v.string() },
  handler: async (ctx, args) => {
    const companies = await ctx.db.query("companies").collect();
    const municipios = new Map();
    
    companies
      .filter(company => company.estado === args.estado)
      .forEach(company => {
        if (!municipios.has(company.municipio)) {
          municipios.set(company.municipio, {
            nome: company.municipio,
            total: 0
          });
        }
        municipios.get(company.municipio).total++;
      });
    
    return Array.from(municipios.values()).sort((a, b) => b.total - a.total);
  },
});

// Obter valores únicos para filtros
export const getUniqueValues = query({
  args: { field: v.string() },
  handler: async (ctx, args) => {
    const companies = await ctx.db.query("companies").collect();
    const values = new Set();
    
    companies.forEach(company => {
      const value = (company as any)[args.field];
      if (value && value !== '') {
        values.add(value);
      }
    });
    
    return Array.from(values).sort();
  },
});

// Mutation para importar dados CSV
export const importCompaniesFromCSV = mutation({
  args: {
    companies: v.array(v.object({
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
      mei: v.boolean(),
      simples: v.boolean(),
      inicio_atividade: v.optional(v.string()),
      receita_federal: v.optional(v.string()),
      natureza_juridica: v.optional(v.string()),
      email_contabilidade: v.optional(v.string()),
      tem_email: v.boolean(),
      tem_telefone: v.boolean(),
      whatsapp_1: v.optional(v.string()),
      whatsapp_2: v.optional(v.string()),
      whatsapp_3: v.optional(v.string()),
      dominio_corporativo: v.optional(v.string()),
      site: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    let imported = 0;
    const now = Date.now();
    
    for (const company of args.companies) {
      // Verificar se já existe
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_cnpj", (q) => q.eq("cnpj", company.cnpj))
        .unique();
      
      if (!existing) {
        await ctx.db.insert("companies", {
          ...company,
          codigo_cnae_fiscal: company.cnae_principal_codigo,
          uf: company.estado,
          importado_em: now,
          atualizado_em: now,
        });
        imported++;
      }
    }
    
    return { imported, total: args.companies.length };
  },
});

// Mutation para criar dados de exemplo baseados no CSV
export const seedExampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const exampleCompanies = [
      {
        cnpj: "27083149000138",
        cnae_principal_codigo: "4751201",
        codigo_cnae_fiscal: "4751201",
        cnae_principal_nome: "COMÉRCIO VAREJISTA ESPECIALIZADO DE EQUIPAMENTOS E SUPRIMENTOS DE INFORMÁTICA",
        cnae_secundario_codigo: "2063100; 4752100; 4753900; 4757100; 4759899",
        cnae_secundario_nome: "FABRICAÇÃO DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL; COMÉRCIO VAREJISTA ESPECIALIZADO DE EQUIPAMENTOS DE TELEFONIA E COMUNICAÇÃO",
        razao_social: "CRISLLANY BARROS VELOSO 01464580103",
        nome_fantasia: "RAYTECH",
        telefone_1: "+556333771155",
        ddd_telefone_1: "63",
        email: "RAYTECHST@GMAIL.COM",
        website: "https://raytech.com.br",
        bairro: "CENTRO",
        cep: "77455-000",
        logradouro: "AVENIDA BERNARDO SAYAO, 237",
        municipio: "ALIANCA DO TOCANTINS",
        uf: "TO",
        estado: "TO",
        endereco_mapa: "AVENIDA BERNARDO SAYAO, 237, CENTRO - ALIANCA DO TOCANTINS, TO - 77455-000, BRASIL",
        maps: "https://www.google.com/search?q=AVENIDA+BERNARDO+SAYAO+237+CENTRO+ALIANCA+DO+TOCANTINS+TO+77455-000+Brasil",
        matriz_filial: "MATRIZ",
        porte: "MICRO EMPRESA",
        porte_empresa: "MEI",
        capital_social: 2000,
        mei: true,
        simples: true,
        opcao_pelo_simples: true,
        inicio_atividade: "2017-02-10",
        data_inicio_atividade: "2017-02-10",
        receita_federal: "http://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=27083149000138",
        natureza_juridica: "EMPRESÁRIO (INDIVIDUAL)",
        tem_email: true,
        tem_telefone: true,
        whatsapp_1: "https://api.whatsapp.com/send/?phone=556333771155",
        dominio_corporativo: "PROVEDOR GRATUITO",
        importado_em: Date.now(),
        atualizado_em: Date.now(),
      },
      {
        cnpj: "49418105000154",
        cnae_principal_codigo: "4772500",
        codigo_cnae_fiscal: "4772500",
        cnae_principal_nome: "COMÉRCIO VAREJISTA DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL",
        cnae_secundario_codigo: "2063100; 4646001; 4646002",
        cnae_secundario_nome: "FABRICAÇÃO DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL; COMÉRCIO ATACADISTA DE COSMÉTICOS E PRODUTOS DE PERFUMARIA",
        razao_social: "BEAUTTY FITNESS LTDA",
        nome_fantasia: "BEFIT",
        telefone_1: "+556399369369",
        ddd_telefone_1: "63",
        email: "AFIAC1988@GMAIL.COM",
        website: "https://befit.com.br",
        bairro: "PLANO DIRETOR SUL",
        cep: "77020-468",
        logradouro: "QUADRA ARSE 21 ALAMEDA EMAS QI 5, SN",
        municipio: "PALMAS",
        uf: "TO",
        estado: "TO",
        endereco_mapa: "QUADRA ARSE 21 ALAMEDA EMAS QI 5, SN, PLANO DIRETOR SUL - PALMAS, TO - 77020-468, BRASIL",
        maps: "https://www.google.com/search?q=QUADRA+ARSE+21+ALAMEDA+EMAS+QI+5+SN+PLANO+DIRETOR+SUL+PALMAS+TO+77020-468+Brasil",
        matriz_filial: "MATRIZ",
        porte: "MICRO EMPRESA",
        porte_empresa: "MICRO EMPRESA",
        capital_social: 50000,
        mei: false,
        simples: false,
        opcao_pelo_simples: false,
        inicio_atividade: "2023-02-01",
        data_inicio_atividade: "2023-02-01",
        receita_federal: "http://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=49418105000154",
        natureza_juridica: "SOCIEDADE EMPRESÁRIA LIMITADA",
        tem_email: true,
        tem_telefone: true,
        whatsapp_1: "https://api.whatsapp.com/send/?phone=556399369369",
        dominio_corporativo: "PROVEDOR GRATUITO",
        site: "https://www.google.com/search?q=befit+palmas+to+instagram",
        importado_em: Date.now(),
        atualizado_em: Date.now(),
      },
      {
        cnpj: "57818180000130",
        cnae_principal_codigo: "4646001",
        codigo_cnae_fiscal: "4646001",
        cnae_principal_nome: "COMÉRCIO ATACADISTA DE COSMÉTICOS E PRODUTOS DE PERFUMARIA",
        cnae_secundario_codigo: "2063100; 4649408; 4723700; 4757100",
        cnae_secundario_nome: "FABRICAÇÃO DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL; COMÉRCIO ATACADISTA DE PRODUTOS DE HIGIENE, LIMPEZA E CONSERVAÇÃO DOMICILIAR",
        razao_social: "DELTA DISTRIBUIDOR LTDA",
        nome_fantasia: "DELTA",
        telefone_1: "+556392748325",
        telefone_2: "+55000000000000",
        ddd_telefone_1: "63",
        email: "OLIVEIRAMANASSES1312@GMAIL.COM",
        website: "https://delta.com.br",
        bairro: "SETOR CENTRAL",
        cep: "77803-901",
        logradouro: "AVENIDA PRIMEIRO DE JANEIRO, 1-2",
        municipio: "ARAGUAINA",
        uf: "TO",
        estado: "TO",
        endereco_mapa: "AVENIDA PRIMEIRO DE JANEIRO, 1-2, SETOR CENTRAL - ARAGUAINA, TO - 77803-901, BRASIL",
        maps: "https://www.google.com/search?q=AVENIDA+PRIMEIRO+DE+JANEIRO+1-2+SETOR+CENTRAL+ARAGUAINA+TO+77803-901+Brasil",
        matriz_filial: "MATRIZ",
        porte: "MICRO EMPRESA",
        porte_empresa: "PEQUENA EMPRESA",
        capital_social: 250000,
        mei: false,
        simples: false,
        opcao_pelo_simples: true,
        inicio_atividade: "2024-10-23",
        data_inicio_atividade: "2024-10-23",
        receita_federal: "http://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=57818180000130",
        natureza_juridica: "SOCIEDADE EMPRESÁRIA LIMITADA",
        tem_email: true,
        tem_telefone: true,
        whatsapp_1: "https://api.whatsapp.com/send/?phone=556392748325",
        whatsapp_2: "https://api.whatsapp.com/send/?phone=55000000000000",
        dominio_corporativo: "PROVEDOR GRATUITO",
        site: "https://www.google.com/search?q=delta+araguaina+to+instagram",
        importado_em: Date.now(),
        atualizado_em: Date.now(),
      },
    ];

    // Inserir empresas
    for (const company of exampleCompanies) {
      await ctx.db.insert("companies", company);
    }

    // Inserir metadados de CNAE
    const cnaeMetadata = [
      { codigo: "4751201", nome: "COMÉRCIO VAREJISTA ESPECIALIZADO DE EQUIPAMENTOS E SUPRIMENTOS DE INFORMÁTICA", ativo: true },
      { codigo: "4772500", nome: "COMÉRCIO VAREJISTA DE COSMÉTICOS, PRODUTOS DE PERFUMARIA E DE HIGIENE PESSOAL", ativo: true },
      { codigo: "4646001", nome: "COMÉRCIO ATACADISTA DE COSMÉTICOS E PRODUTOS DE PERFUMARIA", ativo: true },
    ];

    for (const cnae of cnaeMetadata) {
      await ctx.db.insert("cnae_metadata", cnae);
    }

    return { message: "Dados de exemplo criados com sucesso!", total: exampleCompanies.length };
  },
});
