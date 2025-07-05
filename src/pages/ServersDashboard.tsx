import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ServerCard } from "@/components/dashboard/ServerCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ServerDialog } from "@/components/dashboard/ServerDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server as ServerIcon, Search, LayoutGrid, List, ArrowUpDown, Plus, Download, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server } from "@/types/server";
import { loadServers, saveServers, generateId } from "@/utils/dataManager";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SortConfig = {
  key: keyof Server;
  direction: 'asc' | 'desc';
};

const ServersDashboard = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [ambienteFilter, setAmbienteFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'servico', direction: 'asc' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | undefined>();
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportedFileName, setExportedFileName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadServers();
      setServers(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar os dados dos servidores",
        variant: "destructive",
      });
    }
  };

  const handleSort = (key: keyof Server) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedServers = [...servers].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    // Converter para string e aplicar toLowerCase para ordenação case-insensitive
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    if (aString === bString) return 0;
    if (sortConfig.direction === 'asc') {
      return aString < bString ? -1 : 1;
    } else {
      return aString > bString ? -1 : 1;
    }
  });

  const filteredServers = sortedServers.filter(server => {
    const matchesSearch = 
      server.servico.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.projeto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (server.observacao && server.observacao.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || server.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesProject = projectFilter === "all" || server.projeto === projectFilter;
    const matchesAmbiente = ambienteFilter === "all" || server.ambiente === ambienteFilter;
    
    return matchesSearch && matchesStatus && matchesProject && matchesAmbiente;
  });

  const stats = {
    total: servers.length,
    active: servers.filter(s => s.status === "Active").length,
    inactive: servers.filter(s => s.status === "Inactive").length,
  };

  const projects = [...new Set(servers.map(s => s.projeto))];

  const getStatusColor = (status: string) => {
    return status === 'Active' ? "bg-green-500" : "bg-red-500";
  };

  const handleAddServer = () => {
    setEditingServer(undefined);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSaveServer = async (serverData: Omit<Server, 'id'> | Server) => {
    try {
      let updatedServers: Server[];
      
      if (dialogMode === 'add') {
        const newServer: Server = {
          ...serverData as Omit<Server, 'id'>,
          id: generateId()
        };
        updatedServers = [...servers, newServer];
      } else {
        updatedServers = servers.map(s => 
          s.id === (serverData as Server).id ? serverData as Server : s
        );
      }
      
      await saveServers(updatedServers);
      setServers(updatedServers);
      
      toast({
        title: "Sucesso",
        description: `Servidor ${dialogMode === 'add' ? 'adicionado' : 'atualizado'} com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao ${dialogMode === 'add' ? 'adicionar' : 'atualizar'} servidor`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      const updatedServers = servers.filter(s => s.id !== id);
      await saveServers(updatedServers);
      setServers(updatedServers);
      
      toast({
        title: "Sucesso",
        description: "Servidor removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover servidor",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteServer = (server: Server) => {
    setServerToDelete(server);
    setDeleteDialogOpen(true);
  };

  const executeDeleteServer = async () => {
    if (serverToDelete) {
      await handleDeleteServer(serverToDelete.id);
      setDeleteDialogOpen(false);
      setServerToDelete(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    
    try {
      // Criar cabeçalho CSV
      const headers = [
        'Serviço',
        'IP Address',
        'Hostname',
        'OS',
        'Location',
        'Projeto',
        'Ambiente',
        'Status',
        'Observação'
      ];

      // Converter dados filtrados para CSV
      const csvData = [
        headers.join(','),
        ...filteredServers.map(server => [
          `"${server.servico}"`,
          `"${server.ip_address}"`,
          `"${server.hostname}"`,
          `"${server.os}"`,
          `"${server.location}"`,
          `"${server.projeto}"`,
          `"${server.ambiente}"`,
          `"${server.status}"`,
          `"${server.observacao || ''}"`
        ].join(','))
      ].join('\n');

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `servidores_${timestamp}.csv`;

      // Enviar para o servidor
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          data: csvData
        })
      });

      if (response.ok) {
        setExportedFileName(filename);
        setExportDialogOpen(true);
        toast({
          title: "Sucesso",
          description: "Arquivo CSV exportado com sucesso",
        });
      } else {
        throw new Error('Falha na exportação');
      }
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao exportar dados para CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCSV = () => {
    // Criar link para download do arquivo
    const downloadUrl = `/api/download/${exportedFileName}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = exportedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Servidores</h1>
          <div className="flex gap-2 items-center">
            <Button 
              onClick={handleExportCSV} 
              disabled={isExporting}
              variant="outline"
              className="mr-2"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>
            <Button onClick={handleAddServer} className="mr-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Servidor
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatsCard title="Total de Servidores" value={stats.total} icon={<ServerIcon className="h-4 w-4 text-muted-foreground" />} />
          <StatsCard title="Servidores Ativos" value={stats.active} icon={<ServerIcon className="h-4 w-4 text-green-500" />} />
          <StatsCard title="Servidores Inativos" value={stats.inactive} icon={<ServerIcon className="h-4 w-4 text-red-500" />} />
        </div>

        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar servidores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ambienteFilter} onValueChange={setAmbienteFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ambiente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PRD">PRD</SelectItem>
              <SelectItem value="NPRD">NPRD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contador de servidores exibidos - movido para a esquerda */}
        <div className="mb-4 flex justify-start">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Exibindo {filteredServers.length} servidor{filteredServers.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="mb-8">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServers.map((server) => (
                <ServerCard 
                  key={server.id} 
                  server={server} 
                  onEdit={handleEditServer}
                  onDelete={handleDeleteServer}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('servico')} className="cursor-pointer hover:bg-muted min-w-[150px]">
                      Serviço <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('ip_address')} className="cursor-pointer hover:bg-muted min-w-[120px]">
                      IP Address <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('hostname')} className="cursor-pointer hover:bg-muted min-w-[120px]">
                      Hostname <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('os')} className="cursor-pointer hover:bg-muted min-w-[120px]">
                      OS <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('location')} className="cursor-pointer hover:bg-muted min-w-[100px]">
                      Location <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead onClick={() => handleSort('projeto')} className="cursor-pointer hover:bg-muted min-w-[120px]">
                      Projeto <ArrowUpDown className="inline h-4 w-4 ml-1" />
                    </TableHead>
                    <TableHead className="min-w-[100px]">Ambiente</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="w-[200px]">Observação</TableHead>
                    <TableHead className="min-w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium">{server.servico}</TableCell>
                      <TableCell className="font-mono">{server.ip_address}</TableCell>
                      <TableCell>{server.hostname}</TableCell>
                      <TableCell>{server.os}</TableCell>
                      <TableCell>{server.location}</TableCell>
                      <TableCell>{server.projeto}</TableCell>
                      <TableCell>{server.ambiente}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(server.status)} text-white`}>
                          {server.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="truncate" title={server.observacao}>
                          {server.observacao || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditServer(server)}
                          >
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Dialog para adicionar/editar servidor */}
        <ServerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          server={editingServer}
          mode={dialogMode}
          onSave={handleSaveServer}
          onDelete={handleDeleteServer}
        />

        {/* Dialog para download do CSV */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Arquivo Exportado</DialogTitle>
              <DialogDescription>
                O arquivo CSV foi exportado com sucesso. Clique em "Download" para baixar o arquivo.
                <br /><br />
                <strong>Caminho no servidor:</strong><br />
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  /opt/dashboard-midd/export/{exportedFileName}
                </code>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleDownloadCSV}>
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para confirmação de exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o servidor <strong>{serverToDelete?.servico}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={executeDeleteServer}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ServersDashboard; 