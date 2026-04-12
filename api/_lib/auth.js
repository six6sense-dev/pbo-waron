import crypto from 'crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function getSecret() {
  return process.env.JWT_SECRET || process.env.GOOGLE_PRIVATE_KEY || 'pbo-waron-dev-secret';
}

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmac(data) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function decodeBase64Url(input) {
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function issueToken(user) {
  const payload = {
    sub: user.username,
    role: user.role,
    name: user.name,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const payloadB64 = base64Url(JSON.stringify(payload));
  const signature = hmac(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [payloadB64, signature] = token.split('.');
  const expected = hmac(payloadB64);

  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(payloadB64));
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getAuthTokenFromReq(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }
  return null;
}

export function requireAuth(req, res) {
  const token = getAuthTokenFromReq(req);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    return null;
  }

  return payload;
}
