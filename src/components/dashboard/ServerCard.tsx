import { Server } from "@/types/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface ServerCardProps {
  server: Server;
  onEdit: (server: Server) => void;
  onDelete: (id: string) => void;
}

export function ServerCard({ server, onEdit, onDelete }: ServerCardProps) {
  const getStatusColor = (status: string) => {
    return status === 'Active' ? "bg-green-500" : "bg-red-500";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-start">
          <span className="truncate">{server.servico}</span>
          <Badge variant="outline" className="text-xs">
            {server.location}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center mb-1">
            <span>IP:</span>
            <span className="font-mono">{server.ip_address}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span>Hostname:</span>
            <span className="font-mono">{server.hostname}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span>OS:</span>
            <span>{server.os}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span>Projeto:</span>
            <span>{server.projeto}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span>Ambiente:</span>
            <span>{server.ambiente}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span>Status:</span>
            <Badge className={`${getStatusColor(server.status)} text-white text-xs`}>
              {server.status}
            </Badge>
          </div>
          {server.observacao && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              <p className="truncate" title={server.observacao}>
                {server.observacao}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(server)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}