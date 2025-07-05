import React, { useState, useEffect } from 'react';
import { Plus, Search, Copy, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Command {
  id: string;
  command: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

type SortOption = 'newest' | 'oldest' | 'az' | 'za';

const CommandsDashboard = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [formData, setFormData] = useState({ command: '', description: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState<Command | null>(null);

  // Load commands on mount
  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      const response = await fetch('/api/commands');
      const data = await response.json();
      setCommands(data);
    } catch (error) {
      console.error('Erro ao buscar comandos:', error);
    }
  };

  const handleAddCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.command.trim()) return;

    try {
      const response = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchCommands();
        setFormData({ command: '', description: '' });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar comando:', error);
    }
  };

  const handleEditCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommand || !formData.command.trim()) return;

    try {
      const response = await fetch(`/api/commands/${editingCommand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchCommands();
        setFormData({ command: '', description: '' });
        setIsEditModalOpen(false);
        setEditingCommand(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar comando:', error);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    try {
      const response = await fetch(`/api/commands/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchCommands();
        setIsEditModalOpen(false);
        setEditingCommand(null);
      }
    } catch (error) {
      console.error('Erro ao deletar comando:', error);
    }
  };

  const copyToClipboard = async (command: string, id: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(command);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
        return;
      }
      
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = command;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 1500);
        } else {
          throw new Error('Comando de cópia falhou');
        }
      } catch (err) {
        console.error('Cópia de fallback falhou:', err);
        // Show a prompt as last resort
        prompt('Copie este comando:', command);
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Erro ao copiar comando:', error);
      // Show a prompt as last resort
      prompt('Copie este comando:', command);
    }
  };

  const openEditModal = (command: Command) => {
    setEditingCommand(command);
    setFormData({ command: command.command, description: command.description });
    setIsEditModalOpen(true);
  };

  const confirmDeleteCommand = (command: Command) => {
    setCommandToDelete(command);
    setDeleteDialogOpen(true);
  };

  const executeDeleteCommand = async () => {
    if (commandToDelete) {
      await handleDeleteCommand(commandToDelete.id);
      setDeleteDialogOpen(false);
      setCommandToDelete(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredAndSortedCommands = () => {
    let filtered = commands.filter(cmd =>
      cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'az':
        return filtered.sort((a, b) => a.command.localeCompare(b.command));
      case 'za':
        return filtered.sort((a, b) => b.command.localeCompare(a.command));
      default:
        return filtered;
    }
  };

  const resetModal = () => {
    setFormData({ command: '', description: '' });
    setEditingCommand(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Comandos</h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Comando
          </Button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comandos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchTerm && (
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Mais Recentes</option>
            <option value="oldest">Mais Antigos</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>

        {/* Contador de comandos exibidos */}
        <div className="mb-4 flex justify-start">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Exibindo {filteredAndSortedCommands().length} comando{filteredAndSortedCommands().length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Commands Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[400px]">Comando</TableHead>
                <TableHead className="min-w-[200px]">Descrição</TableHead>
                <TableHead className="min-w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCommands().map((command) => (
                <TableRow key={command.id}>
                  <TableCell className="font-mono text-sm">
                    {command.command}
                  </TableCell>
                  <TableCell className="text-sm">
                    {command.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(command.command, command.id)}
                        className="p-1 h-8 w-8"
                        title="Copiar comando"
                      >
                        {copiedId === command.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(command)}
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

        {/* Empty State */}
        {filteredAndSortedCommands().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum comando encontrado para sua busca.' : 'Nenhum comando cadastrado ainda.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Primeiro Comando
              </Button>
            )}
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Adicionar Comando</h2>
              <form onSubmit={handleAddCommand}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comando</label>
                  <textarea
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                    className="w-full bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Editar Comando</h2>
              <form onSubmit={handleEditCommand}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Comando</label>
                  <textarea
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                    className="w-full bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      resetModal();
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => confirmDeleteCommand(editingCommand)}
                    className="flex-1"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Excluir
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Atualizar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog para confirmação de exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o comando <strong>{commandToDelete?.description}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={executeDeleteCommand}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CommandsDashboard; 