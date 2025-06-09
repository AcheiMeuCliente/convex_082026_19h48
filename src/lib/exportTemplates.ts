import { ExportTemplate } from "./types";

export const exportTemplates: Record<string, ExportTemplate> = {
  // Template para empresas
  companies: {
    name: "Empresas",
    headers: [
      "razao_social",
      "nome_fantasia",
      "cnpj",
      "cnae_principal_codigo",
      "cnae_principal_nome",
      "municipio",
      "estado",
      "bairro",
      "porte",
      "capital_social",
      "idade_empresa",
      "tem_email",
      "tem_telefone",
      "whatsapp_1",
      "whatsapp_2",
      "whatsapp_3",
      "mei",
      "simples"
    ],
    formatters: {
      cnpj: (value: string) => {
        if (value.length === 14) {
          return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8, 12)}-${value.slice(12, 14)}`;
        }
        return value;
      },
      capital_social: (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      },
      idade_empresa: (value: number) => {
        return value ? `${value} anos` : "";
      }
    },
    defaultFormat: "excel",
    compression: true
  },

  // Template para regiões
  regions: {
    name: "Regiões",
    headers: ["estado", "municipio", "bairro", "empresas"],
    formatters: {
      empresas: (value: number) => {
        return value.toLocaleString('pt-BR');
      }
    },
    defaultFormat: "csv",
    compression: false
  },

  // Template para usuários
  users: {
    name: "Usuários",
    headers: ["nome", "email", "role", "ultimo_acesso"],
    formatters: {
      ultimo_acesso: (value: string) => {
        return new Date(value).toLocaleString('pt-BR');
      },
      role: (value: string) => {
        const roles: Record<string, string> = {
          admin: "Administrador",
          user: "Usuário",
          guest: "Visitante"
        };
        return roles[value] || value;
      }
    },
    defaultFormat: "excel",
    compression: false
  }
}; 