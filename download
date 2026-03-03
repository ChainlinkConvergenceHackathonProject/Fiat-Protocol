import { API_BASE } from './api';

export async function fetchManagementData(address: string) {
  const res = await fetch(`${API_BASE}/management/${address}`);
  return res.json();
}

export async function addInventoryItem(address: string, item: any) {
  const res = await fetch(`${API_BASE}/management/inventory/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, ...item }),
  });
  return res.json();
}

export async function removeInventoryItem(address: string, id: number) {
  const res = await fetch(`${API_BASE}/management/inventory/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, id }),
  });
  return res.json();
}

export async function toggleAssetSetting(address: string, asset_code: string, enabled: boolean) {
  const res = await fetch(`${API_BASE}/management/assets/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, asset_code, enabled }),
  });
  return res.json();
}

export async function addEmployee(address: string, employee: any) {
  const res = await fetch(`${API_BASE}/management/employees/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, ...employee }),
  });
  return res.json();
}

export async function removeEmployee(address: string, id: number, termination_date: string) {
  const res = await fetch(`${API_BASE}/management/employees/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, id, termination_date }),
  });
  return res.json();
}

export async function addProperty(address: string, property: any) {
  const res = await fetch(`${API_BASE}/management/properties/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, ...property }),
  });
  return res.json();
}

export async function swapProperty(address: string, property_id: number, target_asset: string) {
  const res = await fetch(`${API_BASE}/management/properties/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, property_id, target_asset }),
  });
  return res.json();
}

export async function transferProperty(address: string, property_id: number, to_address: string) {
  const res = await fetch(`${API_BASE}/management/properties/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, property_id, to_address }),
  });
  return res.json();
}

export async function tradeProperty(address: string, property_id: number, price: number) {
  const res = await fetch(`${API_BASE}/management/properties/trade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, property_id, price }),
  });
  return res.json();
}

export async function depositPropertyVault(address: string, property_id: number, currency: string, amount: number) {
  const res = await fetch(`${API_BASE}/properties/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, property_id, currency, amount }),
  });
  return res.json();
}

export async function previewImport(address: string, importData: any) {
  const res = await fetch(`${API_BASE}/management/import/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, importData }),
  });
  return res.json();
}

export async function applyImport(address: string, diff: any) {
  const res = await fetch(`${API_BASE}/management/import/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, diff }),
  });
  return res.json();
}
