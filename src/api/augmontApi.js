import API_BASE from "./config";

/* ---------------- GET GOLD RATES ---------------- */

export const getGoldRates = async () => {

  const response = await fetch(`${API_BASE}/v1/augmont/rates`);

  const data = await response.json();

  console.log("Rates API Response:", data);

  return data.payload.result.data;

};


/* ---------------- GET PRODUCTS ---------------- */

export const getProducts = async () => {

  const response = await fetch(`${API_BASE}/v1/augmont/products`);

  const data = await response.json();

  return data.payload.result.data;

};


/* ---------------- CREATE USER (SIGNUP) ---------------- */

export const createUser = async (userData) => {

  const response = await fetch(`${API_BASE}/v1/augmont/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  return response.json();

};


/* ---------------- BUY GOLD ---------------- */

export const buyGold = async (payload) => {

  const response = await fetch(`${API_BASE}/v1/augmont/buy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.json();

};


/* ---------------- SELL GOLD ---------------- */

export const sellGold = async (payload) => {

  const response = await fetch(`${API_BASE}/v1/augmont/sell`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.json();

};


/* ---------------- PORTFOLIO ---------------- */

// export const getPassbook = async (uniqueId) => {

//   const response = await fetch(`${API_BASE}/v1/augmont/users/${uniqueId}/passbook`);

//   const data = await response.json();

//   return data.payload.result.data;

// };
export const getPortfolio = async (uniqueId) => {

  const response = await fetch(`http://localhost:8080/v1/augmont/users/${uniqueId}/passbook`);

  const data = await response.json();

  return data;

};
export const getBuyTransactions = async (uniqueId) => {

  const res = await fetch(`http://localhost:8080/v1/augmont/buy/users/${uniqueId}`);
  return await res.json();

};

export const getSellTransactions = async (uniqueId) => {

  const res = await fetch(`http://localhost:8080/v1/augmont/sell/users/${uniqueId}`);
  return await res.json();

};


/* ---------------- LOGIN ---------------- */

export const loginUser = async (email, password) => {

  const response = await fetch(`${API_BASE}/v1/augmont/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await response.json();

  return data;

};