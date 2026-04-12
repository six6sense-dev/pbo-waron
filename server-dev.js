import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import loginHandler from './api/login.js';
import bootstrapHandler from './api/bootstrap.js';
import calculateHandler from './api/calculate.js';
import auditHandler from './api/audit.js';
import usersHandler from './api/users.js';
import profileHandler from './api/profile.js';
import healthHandler from './api/health.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
function loadEnv() {
  try {
    const envPath = `${__dirname}/.env.local`;
    const envContent = readFileSync(envPath, 'utf-8');
    
    envContent.split('\n').forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      
      if (key && value) {
        process.env[key.trim()] = value;
      }
    });
    
    console.log('✅ .env.local loaded');
  } catch (error) {
    console.warn('⚠️ .env.local not found, using default environment');
  }
}

// Load environment variables
loadEnv();

const PORT = process.env.PORT || 3001;

console.log('📋 Configuration:');
console.log(`  - USE_LOCAL_DB: ${process.env.USE_LOCAL_DB || 'not set'}`);
console.log(`  - JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
console.log(`  - DEFAULT_ADMIN_USERNAME: ${process.env.DEFAULT_ADMIN_USERNAME || 'admin'}`);


// Parse JSON body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Create handler wrapper
async function executeHandler(handler, req, res) {
  try {
    const body = await parseBody(req);
    
    const mockReq = {
      method: req.method,
      headers: req.headers,
      body: body || {},
      query: {},
    };
    
    const mockRes = {
      statusCode: 200,
      headers: {},
      json: function(data) {
        res.statusCode = this.statusCode;
        res.setHeader('Content-Type', 'application/json');
        Object.entries(this.headers).forEach(([k, v]) => res.setHeader(k, v));
        res.end(JSON.stringify(data));
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      setHeader: function(key, value) {
        this.headers[key] = value;
        return this;
      },
      text: function(data) {
        res.statusCode = this.statusCode;
        res.setHeader('Content-Type', 'text/plain');
        res.end(data);
        return this;
      },
    };
    
    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Create server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = req.url;

  // Routes
  if (url === '/api/login' && req.method === 'POST') {
    return executeHandler(loginHandler, req, res);
  }
  if (url === '/api/bootstrap' && req.method === 'GET') {
    return executeHandler(bootstrapHandler, req, res);
  }
  if (url === '/api/calculate' && req.method === 'POST') {
    return executeHandler(calculateHandler, req, res);
  }
  if (url === '/api/audit' && req.method === 'GET') {
    return executeHandler(auditHandler, req, res);
  }
  if (url.startsWith('/api/users') && (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')) {
    return executeHandler(usersHandler, req, res);
  }
  if (url.startsWith('/api/profile') && (req.method === 'GET' || req.method === 'POST')) {
    return executeHandler(profileHandler, req, res);
  }
  if (url === '/api/health' && req.method === 'GET') {
    return executeHandler(healthHandler, req, res);
  }
  if (url === '/' && req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'PBO API Server running', port: PORT }));
    return;
  }

  // 404
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Endpoint not found', path: url }));
});

server.listen(PORT, () => {
  console.log(`🚀 PBO API Server running on http://localhost:${PORT}`);
  console.log(`📁 Frontend: http://localhost:5173`);
  console.log(`✅ API ready at http://localhost:${PORT}/api/*`);
});

