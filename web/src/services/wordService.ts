export const fetchQuotes = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch quotes`);
  }
  return response.json();
};

export const fetchWords = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/words`);
  /*if (!response.ok) {
  throw new Error(`Failed to fetch words`);
  }*/
  return response.json();
};
