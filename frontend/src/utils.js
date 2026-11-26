export const shortAddress = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

export const formatDate = (unixSeconds) => new Date(unixSeconds * 1000).toLocaleString();
