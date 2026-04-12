export default async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'pbo-waron-hospital',
    time: new Date().toISOString(),
  });
}
