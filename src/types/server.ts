export interface Server {
  id: string;
  servico: string;
  hostname: string;
  ip_address: string;
  os: string;
  location: string;
  projeto: string;
  status: 'Active' | 'Inactive';
  ambiente: 'PRD' | 'NPRD';
  observacao?: string;
}