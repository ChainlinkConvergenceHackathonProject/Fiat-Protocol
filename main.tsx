export const API_BASE = '/api';

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function fetchRates() {
  const res = await fetch(`${API_BASE}/rates`);
  return res.json();
}

export async function fetchUser(address: string) {
  const res = await fetch(`${API_BASE}/user/${address}`);
  return res.json();
}

export async function mintToken(address: string, currency: string, amount: number) {
  const res = await fetch(`${API_BASE}/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, currency, amount }),
  });
  return res.json();
}

export async function swapToToken(address: string, fromCurrency: string, tokenId: string, amount: number) {
  const res = await fetch(`${API_BASE}/swap-to-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, fromCurrency, tokenId, amount }),
  });
  return res.json();
}

export async function distributeYield(yieldAmount: number) {
  const res = await fetch(`${API_BASE}/distribute-yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ yieldAmount }),
  });
  return res.json();
}

export async function generateIntegration(address: string, label: string, appFee?: string) {
  const res = await fetch(`${API_BASE}/integrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, label, appFee }),
  });
  return res.json();
}

export async function fetchTransactions(address: string) {
  const res = await fetch(`${API_BASE}/transactions/${address}`);
  return res.json();
}

export async function transferAsset(fromAddress: string, toAddress: string, currency: string, amount: number) {
  const res = await fetch(`${API_BASE}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAddress, toAddress, currency, amount }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Transfer failed');
  }
  return res.json();
}

export async function withdrawAsset(address: string, toAddress: string, currency: string, amount: number) {
  const res = await fetch(`${API_BASE}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, toAddress, currency, amount }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Withdrawal failed');
  }
  return res.json();
}

export async function simulateRecovery(address: string) {
  const res = await fetch(`${API_BASE}/simulate-recovery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  return res.json();
}

export async function runChainlinkAutomation() {
  const res = await fetch(`${API_BASE}/chainlink/automation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res.json();
}

export async function performSecurityAudit() {
  const res = await fetch(`${API_BASE}/security/audit`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

// Management API functions have been moved to ./managementApi.ts

export async function fetchFarmData(address: string) {
  const res = await fetch(`${API_BASE}/farms/${address}`);
  return res.json();
}

export async function stakeFarm(address: string, farm_id: string, asset: string, amount: number) {
  const res = await fetch(`${API_BASE}/farms/stake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, farm_id, asset, amount }),
  });
  return res.json();
}

export async function claimFarmRewards(address: string, farm_id: string) {
  const res = await fetch(`${API_BASE}/farms/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, farm_id }),
  });
  return res.json();
}

export async function processFarmYield() {
  const res = await fetch(`${API_BASE}/farms/process-yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res.json();
}

export async function migrateBtc(address: string, amount: number) {
  const res = await fetch(`${API_BASE}/btc/migrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, amount }),
  });
  return res.json();
}

