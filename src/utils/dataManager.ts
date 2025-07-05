import { Server } from "@/types/server";

const DATA_FILE_PATH = '/opt/dash-server/data/data-server.json';

// Função para gerar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para carregar dados do arquivo JSON
export const loadServers = async (): Promise<Server[]> => {
  try {
    // Em ambiente de desenvolvimento, usar dados mock
    if (import.meta.env.DEV) {
      return getMockData();
    }
    
    const response = await fetch('/api/servers');
    if (!response.ok) {
      throw new Error('Failed to load servers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading servers:', error);
    return getMockData();
  }
};

// Função para salvar dados no arquivo JSON
export const saveServers = async (servers: Server[]): Promise<void> => {
  try {
    // Em ambiente de desenvolvimento, apenas simular o salvamento
    if (import.meta.env.DEV) {
      console.log('Saving servers (dev mode):', servers);
      localStorage.setItem('servers', JSON.stringify(servers));
      return;
    }
    
    const response = await fetch('/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(servers),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save servers');
    }
  } catch (error) {
    console.error('Error saving servers:', error);
    throw error;
  }
};

// Dados mock para desenvolvimento
const getMockData = (): Server[] => {
  const stored = localStorage.getItem('servers');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return [
    {
      id: "1",
      servico: "Web Server Principal",
      hostname: "BRSANPFWEB03",
      ip_address: "172.21.48.30",
      os: "Ubuntu 22.04",
      location: "AZURE",
      projeto: "IMOBILIÁRIO PE / PF",
      ambiente: "PRD",
      status: "Active",
      observacao: "Servidor principal de aplicações web"
    },
    {
      id: "2",
      servico: "Database Server",
      hostname: "BRSANPFDB01",
      ip_address: "172.21.48.31",
      os: "Windows Server 2022",
      location: "AZURE",
      projeto: "FINANCEIRA",
      ambiente: "PRD",
      status: "Active",
      observacao: "Servidor de banco de dados principal"
    },
    {
      id: "3",
      servico: "Backup Server",
      hostname: "BRSANPFBKP01",
      ip_address: "172.21.48.32",
      os: "CentOS 8",
      location: "OCI",
      projeto: "INFRAESTRUTURA",
      ambiente: "NPRD",
      status: "Inactive",
      observacao: "Servidor desativado para manutenção"
    }
  ];
};