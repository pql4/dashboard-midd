import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;

// Data file paths
const DATA_DIR = '/opt/dashboard-midd/data';
const EXPORT_DIR = '/opt/dashboard-midd/export';
const SERVERS_DATA_FILE = path.join(DATA_DIR, 'data-server.json');
const COMMANDS_DATA_FILE = path.join(DATA_DIR, 'commands.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Função para garantir que o arquivo existe
async function ensureDataFile(filePath, defaultData = []) {
  try {
    // Ensure the parent directory exists first
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.access(filePath);
  } catch (error) {
    // Se o arquivo não existe, criar com array vazio
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

// Função para garantir que o diretório de export existe
async function ensureExportDir() {
  try {
    await fs.access(EXPORT_DIR);
  } catch (error) {
    // Se o diretório não existe, criar
    await fs.mkdir(EXPORT_DIR, { recursive: true });
  }
}

// ===== API SERVIDORES =====

// Rota para obter servidores
app.get('/api/servers', async (req, res) => {
  try {
    await ensureDataFile(SERVERS_DATA_FILE);
    const data = await fs.readFile(SERVERS_DATA_FILE, 'utf8');
    const servers = JSON.parse(data);
    res.json(servers);
  } catch (error) {
    console.error('Erro ao ler arquivo de servidores:', error);
    res.status(500).json({ error: 'Erro ao carregar dados dos servidores' });
  }
});

// Rota para salvar servidores
app.post('/api/servers', async (req, res) => {
  try {
    const servers = req.body;
    await fs.writeFile(SERVERS_DATA_FILE, JSON.stringify(servers, null, 2), 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar arquivo de servidores:', error);
    res.status(500).json({ error: 'Erro ao salvar dados dos servidores' });
  }
});

// Rota para exportar dados em CSV
app.post('/api/export', async (req, res) => {
  try {
    const { filename, data } = req.body;
    
    if (!filename || !data) {
      return res.status(400).json({ error: 'Nome do arquivo e dados são obrigatórios' });
    }

    // Garantir que o diretório de export existe
    await ensureExportDir();
    
    // Caminho completo do arquivo
    const filePath = path.join(EXPORT_DIR, filename);
    
    // Salvar arquivo CSV
    await fs.writeFile(filePath, data, 'utf8');
    
    console.log(`Arquivo CSV exportado: ${filePath}`);
    
    res.json({ 
      success: true, 
      message: 'Arquivo exportado com sucesso',
      filename: filename,
      path: filePath
    });
    
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

// Rota para download de arquivos CSV
app.get('/api/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(EXPORT_DIR, filename);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Enviar arquivo
    const fileContent = await fs.readFile(filePath, 'utf8');
    res.send(fileContent);
    
  } catch (error) {
    console.error('Erro ao fazer download do arquivo:', error);
    res.status(500).json({ error: 'Erro ao fazer download do arquivo' });
  }
});

// ===== API COMANDOS =====

// Read commands from file with error handling
async function readCommands() {
  try {
    console.log(`📖 Reading commands from: ${COMMANDS_DATA_FILE}`);
    const data = await fs.readFile(COMMANDS_DATA_FILE, 'utf8');
    const commands = JSON.parse(data);
    
    // Ensure it's an array
    if (!Array.isArray(commands)) {
      console.warn('⚠️  Data file does not contain an array, resetting to empty array');
      return [];
    }
    
    console.log(`✅ Successfully read ${commands.length} commands from file`);
    return commands;
  } catch (error) {
    console.error('❌ Error reading commands:', error);
    console.log('🔄 Returning empty array as fallback');
    return [];
  }
}

// Write commands to file with comprehensive error handling
async function writeCommands(commands) {
  try {
    console.log(`💾 Writing ${commands.length} commands to: ${COMMANDS_DATA_FILE}`);
    
    // Ensure commands is an array
    if (!Array.isArray(commands)) {
      throw new Error('Commands must be an array');
    }
    
    // Create backup of existing file if it exists
    let backupCreated = false;
    try {
      await fs.access(COMMANDS_DATA_FILE);
      const backupFile = `${COMMANDS_DATA_FILE}.backup`;
      await fs.copyFile(COMMANDS_DATA_FILE, backupFile);
      backupCreated = true;
      console.log(`💾 Backup created: ${backupFile}`);
    } catch (backupError) {
      console.log('ℹ️  No existing file to backup or backup failed');
    }
    
    // Write the new data
    const jsonData = JSON.stringify(commands, null, 2);
    await fs.writeFile(COMMANDS_DATA_FILE, jsonData, 'utf8');
    console.log('✅ Commands written successfully');
    
    // Verify the write was successful by reading back
    try {
      const verification = await fs.readFile(COMMANDS_DATA_FILE, 'utf8');
      const verifyCommands = JSON.parse(verification);
      
      if (!Array.isArray(verifyCommands) || verifyCommands.length !== commands.length) {
        throw new Error('Verification failed: data mismatch');
      }
      
      console.log(`✅ Verification successful: ${verifyCommands.length} commands in file`);
      
      // Remove backup if write was successful
      if (backupCreated) {
        try {
          await fs.unlink(`${COMMANDS_DATA_FILE}.backup`);
          console.log('🗑️  Backup removed after successful write');
        } catch (cleanupError) {
          console.log('ℹ️  Could not remove backup file');
        }
      }
      
      return true;
    } catch (verifyError) {
      console.error('❌ Write verification failed:', verifyError);
      
      // Restore from backup if available
      if (backupCreated) {
        try {
          await fs.copyFile(`${COMMANDS_DATA_FILE}.backup`, COMMANDS_DATA_FILE);
          console.log('🔄 Restored from backup');
        } catch (restoreError) {
          console.error('❌ Failed to restore from backup:', restoreError);
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error writing commands:', error);
    return false;
  }
}

// Ensure data directory and file exist
async function ensureCommandsDataFile() {
  try {
    // Ensure directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`📁 Data directory ensured: ${DATA_DIR}`);
    
    // Check if file exists
    try {
      await fs.access(COMMANDS_DATA_FILE);
      console.log(`📄 Commands data file exists: ${COMMANDS_DATA_FILE}`);
      
      // Verify file is readable and has valid JSON
      const content = await fs.readFile(COMMANDS_DATA_FILE, 'utf8');
      JSON.parse(content); // This will throw if invalid JSON
      console.log(`✅ Commands data file is valid JSON`);
    } catch (error) {
      // File doesn't exist or is invalid, create/recreate it
      console.log(`🔧 Creating/fixing commands data file: ${COMMANDS_DATA_FILE}`);
      console.log(`Reason: ${error.message}`);
      await fs.writeFile(COMMANDS_DATA_FILE, JSON.stringify([], null, 2));
      
      // Set proper permissions for the file (readable and writable by all)
      try {
        await fs.chmod(COMMANDS_DATA_FILE, 0o666);
        console.log(`🔐 Set file permissions (666) for: ${COMMANDS_DATA_FILE}`);
      } catch (permError) {
        console.log(`⚠️  Could not set permissions: ${permError.message}`);
      }
    }
    
    // Test write access with a more comprehensive test
    console.log('🧪 Testing write access...');
    const testData = await readCommands();
    const writeSuccess = await writeCommands(testData);
    
    if (writeSuccess) {
      console.log(`✅ Write test successful for: ${COMMANDS_DATA_FILE}`);
    } else {
      console.error(`❌ Write test failed for: ${COMMANDS_DATA_FILE}`);
      throw new Error('Write test failed');
    }
    
  } catch (error) {
    console.error('💥 Error ensuring commands data file:', error);
    throw error;
  }
}

// Rota para obter comandos
app.get('/api/commands', async (req, res) => {
  try {
    await ensureCommandsDataFile();
    const commands = await readCommands();
    res.json(commands);
  } catch (error) {
    console.error('Erro ao obter comandos:', error);
    res.status(500).json({ error: 'Erro ao carregar comandos' });
  }
});

// Rota para adicionar comando
app.post('/api/commands', async (req, res) => {
  try {
    const { command, description } = req.body;
    
    if (!command || !description) {
      return res.status(400).json({ error: 'Comando e descrição são obrigatórios' });
    }
    
    const commands = await readCommands();
    const newCommand = {
      id: Date.now().toString(),
      command,
      description,
      createdAt: new Date().toISOString()
    };
    
    commands.push(newCommand);
    const writeSuccess = await writeCommands(commands);
    
    if (writeSuccess) {
      res.status(201).json(newCommand);
    } else {
      res.status(500).json({ error: 'Erro ao salvar comando' });
    }
  } catch (error) {
    console.error('Erro ao adicionar comando:', error);
    res.status(500).json({ error: 'Erro ao adicionar comando' });
  }
});

// Rota para atualizar comando
app.put('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { command, description } = req.body;
    
    if (!command || !description) {
      return res.status(400).json({ error: 'Comando e descrição são obrigatórios' });
    }
    
    const commands = await readCommands();
    const commandIndex = commands.findIndex(cmd => cmd.id === id);
    
    if (commandIndex === -1) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }
    
    commands[commandIndex] = {
      ...commands[commandIndex],
      command,
      description,
      updatedAt: new Date().toISOString()
    };
    
    const writeSuccess = await writeCommands(commands);
    
    if (writeSuccess) {
      res.json(commands[commandIndex]);
    } else {
      res.status(500).json({ error: 'Erro ao atualizar comando' });
    }
  } catch (error) {
    console.error('Erro ao atualizar comando:', error);
    res.status(500).json({ error: 'Erro ao atualizar comando' });
  }
});

// Rota para deletar comando
app.delete('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const commands = await readCommands();
    const filteredCommands = commands.filter(cmd => cmd.id !== id);
    
    if (filteredCommands.length === commands.length) {
      return res.status(404).json({ error: 'Comando não encontrado' });
    }
    
    const writeSuccess = await writeCommands(filteredCommands);
    
    if (writeSuccess) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Erro ao deletar comando' });
    }
  } catch (error) {
    console.error('Erro ao deletar comando:', error);
    res.status(500).json({ error: 'Erro ao deletar comando' });
  }
});

// Servir arquivos estáticos do React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Inicializar servidor
async function startServer() {
  try {
    // Ensure data files exist
    await ensureDataFile(SERVERS_DATA_FILE);
    await ensureCommandsDataFile();
    await ensureExportDir();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Dashboard Midd rodando na porta ${PORT}`);
      console.log(`📁 Data directory: ${DATA_DIR}`);
      console.log(`📁 Export directory: ${EXPORT_DIR}`);
    });
  } catch (error) {
    console.error('💥 Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();