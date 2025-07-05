import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Server } from "@/types/server";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: Server;
  onSave: (server: Omit<Server, 'id'> | Server) => void;
  onDelete?: (id: string) => void;
  mode: 'add' | 'edit';
}

export function ServerDialog({ open, onOpenChange, server, onSave, onDelete, mode }: ServerDialogProps) {
  const [formData, setFormData] = useState<Omit<Server, 'id'>>({
    servico: '',
    hostname: '',
    ip_address: '',
    os: '',
    location: '',
    projeto: '',
    ambiente: 'PRD',
    status: 'Active',
    observacao: ''
  });

  useEffect(() => {
    if (server && mode === 'edit') {
      setFormData({
        servico: server.servico,
        hostname: server.hostname,
        ip_address: server.ip_address,
        os: server.os,
        location: server.location,
        projeto: server.projeto,
        ambiente: server.ambiente || 'PRD',
        status: server.status,
        observacao: server.observacao || ''
      });
    } else {
      setFormData({
        servico: '',
        hostname: '',
        ip_address: '',
        os: '',
        location: '',
        projeto: '',
        ambiente: 'PRD',
        status: 'Active',
        observacao: ''
      });
    }
  }, [server, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && server) {
      onSave({ ...server, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (server && onDelete) {
      onDelete(server.id);
      onOpenChange(false);
    }
  };

  // Lista de sistemas operacionais em ordem alfabética
  const operatingSystems = [
    "Alma Linux 9.5",
    "Alma Linux 9.6", 
    "CentOS 7",
    "Oracle Linux 7.9",
    "Oracle Linux 9.6",
    "RHEL 9",
    "Ubuntu 20.04",
    "Ubuntu 22.04",
    "Windows Server 2016"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Adicionar Servidor' : 'Editar Servidor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="servico">Serviço</Label>
              <Input
                id="servico"
                value={formData.servico}
                onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="os">Sistema Operacional</Label>
              <Select value={formData.os} onValueChange={(value) => setFormData({ ...formData, os: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o OS" />
                </SelectTrigger>
                <SelectContent>
                  {operatingSystems.map((os) => (
                    <SelectItem key={os} value={os}>{os}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AZURE">Azure</SelectItem>
                  <SelectItem value="AWS">AWS</SelectItem>
                  <SelectItem value="GCP">GCP</SelectItem>
                  <SelectItem value="OCI">OCI</SelectItem>
                  <SelectItem value="HUB">HUB</SelectItem>
                  <SelectItem value="LOCAL">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="projeto">Projeto</Label>
              <Input
                id="projeto"
                value={formData.projeto}
                onChange={(e) => setFormData({ ...formData, projeto: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ambiente">Ambiente</Label>
              <Select value={formData.ambiente} onValueChange={(value: 'PRD' | 'NPRD') => setFormData({ ...formData, ambiente: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRD">PRD</SelectItem>
                  <SelectItem value="NPRD">NPRD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {mode === 'edit' && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover o servidor "{server?.servico}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Adicionar' : 'Salvar'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}